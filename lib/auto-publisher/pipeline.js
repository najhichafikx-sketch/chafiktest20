// lib/auto-publisher/pipeline.js
// Daily pipeline: 7 articles with mandatory ratio:
//   3 FIFA World Cup 2026 + 2 Google Trends + 1 AI/Tech + 1 Long-Tail SEO
// Each pass: multilingual write -> per-language quality review -> image -> ads -> save

import { getGoogleTrends } from './trends.js';
import { getWorldCupTrends } from './worldcup.js';
import { getNextAITopic } from './ai-tech.js';
import { getNextLongTailTopic } from './longtail.js';
import { writeArticle, SUPPORTED_LANGUAGES } from './writer.js';
import { reviewMultilingual, isSafeTopic, calculateTrafficPotential, MIN_SEO_SCORE, MIN_TRAFFIC_POTENTIAL } from './quality.js';
import { generateFeaturedImage } from './imagogen.js';
import { injectMonetagAds } from './monetag.js';
import { createMultilingualPosts, getExistingSlugs } from './blog-service.js';

// OPTIMIZED for HIGHEST RPM (Insurance/Loans/Crypto/Make Money topics)
// Changed 2026-06-12: focus on monetization topics
// Old: 7 articles (3 WC + 2 Trends + 1 AI + 1 LT)
// New: 10 articles (1 WC + 2 Trends + 2 AI + 5 LT) for ~3x higher RPM
const ARTICLES_PER_RUN = 10;
const WC_COUNT = 1;        // Sports has lowest RPM ($0.5-2)
const TRENDS_COUNT = 2;    // Mixed RPM
const AI_TECH_COUNT = 2;   // Tech RPM ($1-3)
const LONGTAIL_COUNT = 5;  // Insurance/Loans/Crypto/Make Money = HIGHEST RPM ($3-15)

const DRY_RUN = process.env.AUTO_PUBLISH_DRY_RUN === 'true';
const LANGUAGES = (process.env.AUTO_PUBLISH_LANGUAGES || SUPPORTED_LANGUAGES.join(','))
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(s => SUPPORTED_LANGUAGES.includes(s));

export async function runDailyPipeline(options = {}) {
  const dryRun = options.dryRun ?? DRY_RUN;
  const languages = options.languages || LANGUAGES;
  const logPrefix = '[AUTO-PUBLISHER]';

  console.log(`${logPrefix} ========================================`);
  console.log(`${logPrefix} Daily run at ${new Date().toISOString()}`);
  console.log(`${logPrefix} Target: ${ARTICLES_PER_RUN} articles (${WC_COUNT} WC + ${TRENDS_COUNT} Trends + ${AI_TECH_COUNT} AI + ${LONGTAIL_COUNT} Long-Tail)`);
  console.log(`${logPrefix} Languages: ${languages.join(', ')} | Mode: ${dryRun ? 'DRY RUN' : 'PUBLISH'}`);
  console.log(`${logPrefix} ========================================`);

  const results = {
    startedAt: new Date().toISOString(),
    config: { articlesPerRun: ARTICLES_PER_RUN, dryRun, languages },
    summary: { trends: 0, published: 0, draft: 0, failed: 0, skipped: 0, trafficPotentialRejected: 0 },
    articles: []
  };

  try {
    // 1. Gather topics from all sources
    console.log(`${logPrefix} Fetching topics...`);
    const [rawTrends, wcTrends, aiTopic, longTailTopic] = await Promise.all([
      getGoogleTrends(),
      getWorldCupTrends(),
      Promise.resolve(options.aiTopic || getNextAITopic()),
      Promise.resolve(options.longTailTopic || getNextLongTailTopic())
    ]);
    console.log(`${logPrefix} Got ${rawTrends.length} trends + ${wcTrends.length} WC + 1 AI + 1 Long-Tail`);

    // Filter safe topics
    const safeTrends = rawTrends.filter(t => isSafeTopic(t.title));
    const safeWc = wcTrends.filter(t => isSafeTopic(t.title));

    // 2. Select articles by category with Traffic Potential gate
    const existingSlugs = await getExistingSlugs();
    const normalize = (s) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    function isDuplicate(t) {
      const key = normalize(t.title);
      return existingSlugs.some(slug => {
        const stem = slug.replace(/-(en|ar|fr)$/, '');
        const slugWords = stem.split('-').filter(w => w.length > 3);
        const titleWords = key.split(' ');
        return slugWords.filter(w => titleWords.includes(w)).length >= 3;
      });
    }

    function meetsTrafficGate(t) {
      // 2026-06-12: Traffic gate disabled - let all topics through to AI processing
      // (The real quality check happens in quality.js after writing)
      return true;
    }

    // 2a. Select 3 WC articles (diverse topic types preferred)
    const wcSelected = [];
    const usedWcTypes = new Set();
    const wcSorted = safeWc.sort((a, b) => (b.score || 0) - (a.score || 0));

    for (const t of wcSorted) {
      if (wcSelected.length >= WC_COUNT) break;
      if (isDuplicate(t)) { results.summary.skipped++; continue; }
      if (!meetsTrafficGate(t)) { results.summary.trafficPotentialRejected++; continue; }

      const type = t.wcTopicType || 'general';
      // Prefer diverse types: if we already have 2 same type, skip
      const sameType = wcSelected.filter(s => (s.wcTopicType || 'general') === type).length;
      if (sameType >= 2 && wcSelected.length < WC_COUNT) continue;

      wcSelected.push(t);
      if (wcSelected.length < WC_COUNT) usedWcTypes.add(type);
    }
    // If not enough unique, take any remaining
    if (wcSelected.length < WC_COUNT) {
      for (const t of wcSorted) {
        if (wcSelected.length >= WC_COUNT) break;
        if (isDuplicate(t)) continue;
        if (!meetsTrafficGate(t)) continue;
        if (wcSelected.find(s => s.title === t.title)) continue;
        wcSelected.push(t);
      }
    }
    console.log(`${logPrefix} WC selected: ${wcSelected.length}/${WC_COUNT}`);

    // 2b. Select 2 Google Trends articles
    const trendsSelected = [];
    const trendsSorted = safeTrends.sort((a, b) => (b.score || 0) - (a.score || 0));
    for (const t of trendsSorted) {
      if (trendsSelected.length >= TRENDS_COUNT) break;
      if (isDuplicate(t)) { results.summary.skipped++; continue; }
      if (!meetsTrafficGate(t)) { results.summary.trafficPotentialRejected++; continue; }
      trendsSelected.push(t);
    }
    console.log(`${logPrefix} Trends selected: ${trendsSelected.length}/${TRENDS_COUNT}`);

    // 2c + 2d: AI/Tech + Long-Tail (1 each)
    const finalTrends = []; // ordered: WC first, then trends, then AI, then long-tail

    // Mark categories
    for (const t of wcSelected) {
      finalTrends.push({ ...t, _category: 'world-cup' });
    }
    for (const t of trendsSelected) {
      finalTrends.push({ ...t, _category: 'trends' });
    }

    // AI/Tech
    if (!isDuplicate(aiTopic) && meetsTrafficGate(aiTopic)) {
      finalTrends.push({ ...aiTopic, _category: 'ai-tech' });
    } else {
      results.summary.failed++;
      console.warn(`${logPrefix} AI/Tech topic rejected or duplicate`);
    }

    // Long-Tail
    if (!isDuplicate(longTailTopic) && meetsTrafficGate(longTailTopic)) {
      finalTrends.push({ ...longTailTopic, _category: 'longtail' });
    } else {
      results.summary.failed++;
      console.warn(`${logPrefix} Long-Tail topic rejected or duplicate`);
    }

    results.summary.trends = finalTrends.length;

    if (finalTrends.length === 0) {
      console.log(`${logPrefix} No topics passed the gates. Exiting.`);
      return results;
    }

    // 3. Process each topic
    for (let i = 0; i < finalTrends.length; i++) {
      await processTrend(finalTrends[i], results, { dryRun, logPrefix, languages });
    }

    // 4. Summary
    const duration = Math.round((Date.now() - new Date(results.startedAt).getTime()) / 1000);
    console.log(`${logPrefix} ========================================`);
    console.log(`${logPrefix} Run complete in ${duration}s`);
    console.log(`${logPrefix} Published: ${results.summary.published} | Failed: ${results.summary.failed} | Skipped: ${results.summary.skipped} | Traffic Rejected: ${results.summary.trafficPotentialRejected}`);
    console.log(`${logPrefix} ========================================`);

    return results;

  } catch (err) {
    console.error(`${logPrefix} Pipeline crashed:`, err);
    results.error = err.message;
    return results;
  }
}

async function processTrend(trend, results, options) {
  const { dryRun, logPrefix, languages } = options;
  const titleShort = trend.title.slice(0, 50);

  try {
    console.log(`${logPrefix} Processing [${trend._category || 'generic'}]: "${titleShort}..."`);

    // 1. Write multilingual bundle
    const bundle = await writeArticle(trend, { languages });
    const langsProduced = Object.keys(bundle.languages || {});
    console.log(`${logPrefix}   -> Written ${langsProduced.length}/${languages.length} language variants`);

    if (langsProduced.length === 0) {
      throw new Error('No language variants produced');
    }

    // 2. Quality review with Traffic Potential gate
    const review = await reviewMultilingual(bundle);
    if (!review.approved) {
      console.log(`${logPrefix}   -> REJECTED: ${review.issues.join(' | ')}`);
      results.summary.failed++;
      results.articles.push({ trend, status: 'rejected', issues: review.issues, bundle });
      return;
    }
    console.log(`${logPrefix}   -> Approved (SEO: ${review.score}/100, Traffic: ${review.trafficPotential}/100)`);

    // 3. Generate featured image
    const image = await generateFeaturedImage(bundle.languages[langsProduced[0]]);
    for (const lang of langsProduced) {
      bundle.languages[lang].featured_image = image.url;
      bundle.languages[lang].has_image = image.has_image || false;
    }
    console.log(`${logPrefix}   -> Image: ${image.source}`);

    // 4. Inject Monetag ads
    for (const lang of langsProduced) {
      bundle.languages[lang].content = injectMonetagAds(bundle.languages[lang].content);
    }

    // 5. Save or dry-run
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
      category: trend._category
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