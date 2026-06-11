// lib/auto-publisher/pipeline.js
// Main pipeline: trends -> write -> review -> inject ads -> save to DB

import { getGoogleTrends } from './trends.js';
import { writeArticle } from './writer.js';
import { reviewArticle, isSafeTopic } from './quality.js';
import { generateFeaturedImage } from './imagogen.js';
import { injectMonetagAds } from './monetag.js';
import { createBlogPost, getExistingSlugs } from './blog-service.js';

const ARTICLES_PER_RUN = parseInt(process.env.AUTO_PUBLISH_ARTICLES_PER_DAY) || 5;
const DRY_RUN = process.env.AUTO_PUBLISH_DRY_RUN === 'true';

/**
 * Run the full daily publishing pipeline
 */
export async function runDailyPipeline(options = {}) {
  const limit = options.articlesPerDay || ARTICLES_PER_RUN;
  const dryRun = options.dryRun ?? DRY_RUN;
  const logPrefix = '[AUTO-PUBLISHER]';

  console.log(`${logPrefix} ========================================`);
  console.log(`${logPrefix} Daily run started at ${new Date().toISOString()}`);
  console.log(`${logPrefix} Target: ${limit} articles | Mode: ${dryRun ? 'DRY RUN' : 'PUBLISH'}`);
  console.log(`${logPrefix} ========================================`);

  const results = {
    startedAt: new Date().toISOString(),
    summary: { trends: 0, published: 0, draft: 0, failed: 0, skipped: 0 },
    articles: []
  };

  try {
    // 1. Fetch trends
    console.log(`${logPrefix} Fetching Google Trends...`);
    const rawTrends = await getGoogleTrends();
    console.log(`${logPrefix} Found ${rawTrends.length} raw trends`);

    // 2. Filter safe topics
    const safeTrends = rawTrends.filter(t => isSafeTopic(t.title));
    console.log(`${logPrefix} After safety filter: ${safeTrends.length} trends`);

    // 3. Deduplicate against existing slugs
    const existingSlugs = await getExistingSlugs();
    const normalize = (s) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    const unique = [];
    const seen = new Set();
    for (const t of safeTrends) {
      const key = normalize(t.title);
      if (seen.has(key)) continue;

      // Check if we recently published something with similar title
      const isDuplicate = existingSlugs.some(slug => {
        const slugWords = slug.split('-').filter(w => w.length > 3);
        const titleWords = key.split(' ');
        const overlap = slugWords.filter(w => titleWords.includes(w)).length;
        return overlap >= 3; // 3+ words in common = likely duplicate
      });

      if (isDuplicate) {
        results.summary.skipped++;
        continue;
      }

      seen.add(key);
      unique.push(t);
    }

    const topTrends = unique.slice(0, limit);
    results.summary.trends = topTrends.length;
    console.log(`${logPrefix} Selected top ${topTrends.length} unique trends`);

    if (topTrends.length === 0) {
      console.log(`${logPrefix} No trends to process. Exiting.`);
      return results;
    }

    // 4. Process each trend
    for (const trend of topTrends) {
      await processTrend(trend, results, { dryRun, logPrefix });
    }

    // 5. Summary
    const duration = Math.round((Date.now() - new Date(results.startedAt).getTime()) / 1000);
    console.log(`${logPrefix} ========================================`);
    console.log(`${logPrefix} Run complete in ${duration}s`);
    console.log(`${logPrefix} Published: ${results.summary.published} | Failed: ${results.summary.failed} | Skipped: ${results.summary.skipped}`);
    console.log(`${logPrefix} ========================================`);

    return results;

  } catch (err) {
    console.error(`${logPrefix} Pipeline crashed:`, err);
    results.error = err.message;
    return results;
  }
}

async function processTrend(trend, results, options) {
  const { dryRun, logPrefix } = options;
  const titleShort = trend.title.slice(0, 50);

  try {
    console.log(`${logPrefix} Processing: "${titleShort}..."`);

    // 1. Write article
    const article = await writeArticle(trend);
    console.log(`${logPrefix}   -> Written: ${article.wordCount} words`);

    // 2. Quality review
    const review = await reviewArticle(article);
    if (!review.approved) {
      console.log(`${logPrefix}   -> REJECTED: ${review.issues.join('; ')}`);
      results.summary.failed++;
      results.articles.push({ trend, status: 'rejected', issues: review.issues });
      return;
    }
    console.log(`${logPrefix}   -> Approved (score: ${review.score}/100)`);

    // 3. Generate featured image
    const image = await generateFeaturedImage(article);
    if (image.url) {
      article.featured_image = image.url;
      article.has_image = image.has_image || false;
    }
    console.log(`${logPrefix}   -> Image: ${image.source}`);

    // 4. Inject Monetag ads
    article.content = injectMonetagAds(article.content);

    // 4. Save to DB
    if (dryRun) {
      console.log(`${logPrefix}   -> DRY RUN - not saving`);
      results.summary.draft++;
      results.articles.push({ trend, article, status: 'dry-run' });
      return;
    }

    const saved = await createBlogPost(article, {
      source: 'auto-publisher',
      trend: trend.title,
      seoScore: review.score,
      wordCount: article.wordCount
    });

    console.log(`${logPrefix}   -> Published: /blog/${saved.slug}`);
    results.summary.published++;
    results.articles.push({ trend, article, status: 'published', slug: saved.slug, id: saved.id });

  } catch (err) {
    console.error(`${logPrefix}   -> FAILED: ${err.message}`);
    results.summary.failed++;
    results.articles.push({ trend, status: 'error', error: err.message });
  }
}
