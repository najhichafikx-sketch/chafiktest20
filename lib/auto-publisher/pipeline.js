// lib/auto-publisher/pipeline.js
// Main pipeline: trends -> multilingual write -> per-language quality review
//                 -> image -> ads -> save to DB
//
// What changed vs the previous version:
//   - Calls the new writeArticle() that returns a multilingual bundle
//   - Reviews every language variant independently (reviewMultilingual)
//   - Saves one row per language via createMultilingualPosts()
//   - Featured image is generated once and shared across language variants
//   - Ad injection runs on every language variant (different layout per lang)
//   - Pipeline summary now reports per-language success/failure

import { getGoogleTrends } from './trends.js';
import { getWorldCupTrends } from './worldcup.js';
import { writeArticle, SUPPORTED_LANGUAGES } from './writer.js';
import { reviewMultilingual, isSafeTopic } from './quality.js';
import { generateFeaturedImage } from './imagogen.js';
import { injectMonetagAds } from './monetag.js';
import {
  createMultilingualPosts,
  createBlogPost,
  getExistingSlugs
} from './blog-service.js';

const ARTICLES_PER_RUN = parseInt(process.env.AUTO_PUBLISH_ARTICLES_PER_DAY) || 5;
const WC_ARTICLES = Math.min(parseInt(process.env.AUTO_PUBLISH_WC_COUNT) || 3, ARTICLES_PER_RUN);
const HOURS_BETWEEN = parseInt(process.env.AUTO_PUBLISH_INTERVAL_HOURS) || 4;
const DRY_RUN = process.env.AUTO_PUBLISH_DRY_RUN === 'true';
// Which languages to publish in. Override with AUTO_PUBLISH_LANGUAGES=en,ar
const LANGUAGES = (process.env.AUTO_PUBLISH_LANGUAGES || SUPPORTED_LANGUAGES.join(','))
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(s => SUPPORTED_LANGUAGES.includes(s));

/**
 * Run the full daily publishing pipeline.
 *
 * @param {object}  [options]
 * @param {number}  [options.articlesPerDay]
 * @param {boolean} [options.dryRun]
 * @param {string[]} [options.languages]
 */
export async function runDailyPipeline(options = {}) {
  const limit = options.articlesPerDay || ARTICLES_PER_RUN;
  const dryRun = options.dryRun ?? DRY_RUN;
  const languages = options.languages || LANGUAGES;
  const logPrefix = '[AUTO-PUBLISHER]';

  console.log(`${logPrefix} ========================================`);
  console.log(`${logPrefix} Daily run started at ${new Date().toISOString()}`);
  console.log(`${logPrefix} Target: ${limit} articles | Languages: ${languages.join(', ')} | Mode: ${dryRun ? 'DRY RUN' : 'PUBLISH'}`);
  console.log(`${logPrefix} ========================================`);

  const results = {
    startedAt: new Date().toISOString(),
    config: { limit, dryRun, languages },
    summary: { trends: 0, published: 0, draft: 0, failed: 0, skipped: 0 },
    articles: []
  };

  try {
    // 1. Fetch trends (World Cup + general)
    console.log(`${logPrefix} Fetching trends...`);
    const [rawTrends, wcTrends] = await Promise.all([
      getGoogleTrends(),
      getWorldCupTrends()
    ]);
    console.log(`${logPrefix} Found ${rawTrends.length} general + ${wcTrends.length} WC trends`);

    const allTrends = [
      ...wcTrends.map(t => ({ ...t, priority: 1 })),
      ...rawTrends.map(t => ({ ...t, priority: 0 }))
    ].filter(t => isSafeTopic(t.title));

    // 2. Deduplicate against existing slugs
    const existingSlugs = await getExistingSlugs();
    const normalize = (s) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    const wcSelected = [];
    const generalSelected = [];
    const seen = new Set();

    for (const t of allTrends) {
      const key = normalize(t.title);
      if (seen.has(key)) continue;

      const isDuplicate = existingSlugs.some(slug => {
        // Strip the -en/-ar/-fr suffix when comparing
        const stem = slug.replace(/-(en|ar|fr)$/, '');
        const slugWords = stem.split('-').filter(w => w.length > 3);
        const titleWords = key.split(' ');
        return slugWords.filter(w => titleWords.includes(w)).length >= 3;
      });

      if (isDuplicate) { results.summary.skipped++; continue; }

      seen.add(key);
      if (t.priority === 1 && wcSelected.length < WC_ARTICLES) {
        wcSelected.push(t);
      } else if (t.priority === 0 && generalSelected.length < (limit - WC_ARTICLES)) {
        generalSelected.push(t);
      }
    }

    // Fill any remaining slots from either pool
    const selected = [...wcSelected, ...generalSelected];
    for (const t of allTrends) {
      if (selected.length >= limit) break;
      const key = normalize(t.title);
      if (!seen.has(key)) { seen.add(key); selected.push(t); }
    }

    const finalTrends = selected.slice(0, limit);
    results.summary.trends = finalTrends.length;
    console.log(`${logPrefix} Selected ${finalTrends.length} trends (${wcSelected.length} WC + ${generalSelected.length} general)`);

    if (finalTrends.length === 0) {
      console.log(`${logPrefix} No trends to process. Exiting.`);
      return results;
    }

    // 3. Process each trend with staggered publishing (4 hours apart)
    const now = Date.now();
    for (let i = 0; i < finalTrends.length; i++) {
      const scheduleAt = new Date(now + i * HOURS_BETWEEN * 3600000);
      await processTrend(finalTrends[i], results, { dryRun, logPrefix, scheduleAt, languages });
    }

    // 4. Summary
    const duration = Math.round((Date.now() - new Date(results.startedAt).getTime()) / 1000);
    console.log(`${logPrefix} ========================================`);
    console.log(`${logPrefix} Run complete in ${duration}s`);
    console.log(`${logPrefix} Published: ${results.summary.published} bundles | Failed: ${results.summary.failed} | Skipped: ${results.summary.skipped}`);
    console.log(`${logPrefix} ========================================`);

    return results;

  } catch (err) {
    console.error(`${logPrefix} Pipeline crashed:`, err);
    results.error = err.message;
    return results;
  }
}

async function processTrend(trend, results, options) {
  const { dryRun, logPrefix, scheduleAt, languages } = options;
  const titleShort = trend.title.slice(0, 50);

  try {
    console.log(`${logPrefix} Processing: "${titleShort}..."`);

    // 1. Write multilingual bundle (3 languages in parallel)
    const bundle = await writeArticle(trend, { languages });
    const langsProduced = Object.keys(bundle.languages || {});
    console.log(`${logPrefix}   -> Written ${langsProduced.length}/${languages.length} language variants`);

    if (langsProduced.length === 0) {
      throw new Error('No language variants produced');
    }

    // 2. Quality review (per language, bundle is approved only if all pass)
    const review = await reviewMultilingual(bundle);
    if (!review.approved) {
      console.log(`${logPrefix}   -> REJECTED: ${review.issues.join(' | ')}`);
      results.summary.failed++;
      results.articles.push({ trend, status: 'rejected', issues: review.issues, bundle });
      return;
    }
    console.log(`${logPrefix}   -> Approved all ${langsProduced.length} variants (score: ${review.score}/100)`);

    // 3. Generate one featured image, share it across language variants
    const image = await generateFeaturedImage(bundle.languages[langsProduced[0]]);
    for (const lang of langsProduced) {
      bundle.languages[lang].featured_image = image.url;
      bundle.languages[lang].has_image = image.has_image || false;
    }
    console.log(`${logPrefix}   -> Image: ${image.source}`);

    // 4. Inject Monetag ads into each language variant
    for (const lang of langsProduced) {
      bundle.languages[lang].content = injectMonetagAds(bundle.languages[lang].content);
    }

    // 5. Save (or dry-run)
    if (dryRun) {
      console.log(`${logPrefix}   -> DRY RUN - not saving`);
      results.summary.draft++;
      results.articles.push({ trend, bundle, status: 'dry-run' });
      return;
    }

    const saved = await createMultilingualPosts(bundle, {
      source: 'auto-publisher',
      trend: trend.title,
      seoScore: review.score,
      wordCount: Object.values(bundle.languages).reduce((sum, a) => sum + (a.wordCount || 0), 0),
      scheduleAt: scheduleAt?.toISOString()
    });

    const savedLangs = (saved.saved || []).map(s => s.language).join(',');
    console.log(`${logPrefix}   -> Published: ${savedLangs} (${saved.saved?.length || 0} posts)`);
    results.summary.published++;
    results.articles.push({ trend, bundle, status: 'published', saved, slug: bundle.baseSlug });

  } catch (err) {
    console.error(`${logPrefix}   -> FAILED: ${err.message}`);
    results.summary.failed++;
    results.articles.push({ trend, status: 'error', error: err.message });
  }
}
