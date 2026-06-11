// lib/auto-publisher/quality.js
// Quality gate to prevent traffic crashes from low-quality AI content

const MIN_WORD_COUNT = parseInt(process.env.MIN_WORD_COUNT) || 400;
const MIN_SEO_SCORE = parseInt(process.env.MIN_SEO_SCORE) || 60;
const MAX_AI_DETECTION = parseFloat(process.env.MAX_AI_DETECTION) || 0.6;

const BLOCKLIST = [
  'nsfw', 'porn', 'sex', 'gore', 'violence',
  'trump', 'biden', 'election',
  'kill', 'death', 'murder', 'suicide',
  'drugs', 'cocaine', 'meth'
];

/**
 * Review an article and decide if it should be published
 */
export async function reviewArticle(article) {
  const checks = {
    wordCount: checkWordCount(article),
    seoScore: checkSEO(article),
    aiDetection: checkAIDetection(article),
    structure: checkStructure(article)
  };

  const issues = [];
  let totalScore = 0;

  if (!checks.wordCount.passed) issues.push(`Word count too low: ${checks.wordCount.actual} < ${MIN_WORD_COUNT}`);
  if (!checks.seoScore.passed) issues.push(`SEO score too low: ${checks.seoScore.score} < ${MIN_SEO_SCORE}`);
  if (!checks.aiDetection.passed) issues.push(`AI detection too high: ${checks.aiDetection.score} > ${MAX_AI_DETECTION}`);
  if (!checks.structure.passed) issues.push(`Structure issues: ${checks.structure.issues.join(', ')}`);

  totalScore = (
    checks.wordCount.score +
    checks.seoScore.score +
    checks.aiDetection.score +
    checks.structure.score
  ) / 4;

  const approved = issues.length === 0;

  return {
    approved,
    score: Math.round(totalScore),
    checks,
    issues
  };
}

export function isSafeTopic(title) {
  const lower = (title || '').toLowerCase();
  return !BLOCKLIST.some(word => lower.includes(word));
}

function checkWordCount(article) {
  const actual = article.wordCount || 0;
  const score = Math.min(100, (actual / MIN_WORD_COUNT) * 100);
  return {
    passed: actual >= MIN_WORD_COUNT,
    actual,
    minimum: MIN_WORD_COUNT,
    score
  };
}

function checkSEO(article) {
  let score = 0;
  const issues = [];

  // Title length
  if (article.title.length >= 50 && article.title.length <= 60) score += 20;
  else if (article.title.length >= 40 && article.title.length <= 70) score += 10;
  else issues.push(`Title length ${article.title.length} not in 50-60 range`);

  // Meta description
  if (article.metaDescription.length >= 120 && article.metaDescription.length <= 160) score += 20;
  else if (article.metaDescription.length >= 80 && article.metaDescription.length <= 200) score += 10;
  else issues.push(`Meta description length ${article.metaDescription.length} not optimal`);

  // Slug
  if (/^[a-z0-9-]+$/.test(article.slug)) score += 10;
  else issues.push('Slug has invalid characters');

  // H2 count
  const h2Count = (article.content.match(/<h2/g) || []).length;
  if (h2Count >= 5 && h2Count <= 8) score += 20;
  else if (h2Count >= 3) score += 10;
  else issues.push(`Only ${h2Count} H2 sections (need 5-7)`);

  // FAQ present
  if (article.faqs && article.faqs.length >= 3) score += 15;
  else issues.push('No FAQ section');

  // Tags
  if (article.tags && article.tags.length >= 3) score += 10;

  return {
    passed: score >= MIN_SEO_SCORE,
    score,
    issues
  };
}

function checkAIDetection(article) {
  const text = (article.content || '').replace(/<[^>]+>/g, ' ').toLowerCase();

  const aiPhrases = [
    "in today's fast-paced",
    'in the world of',
    'dive into',
    'unleash the power',
    'harness the power',
    'game-changer',
    'revolutionize',
    'cutting-edge',
    'next-level',
    'unlock the potential',
    'navigate the landscape',
    "it's important to note",
    "it's worth noting",
    'delve into',
    'embark on a journey'
  ];

  let aiScore = 0;
  for (const phrase of aiPhrases) {
    if (text.includes(phrase)) aiScore += 0.15;
  }

  aiScore = Math.min(1.0, aiScore);

  return {
    passed: aiScore <= MAX_AI_DETECTION,
    score: aiScore,
    maximum: MAX_AI_DETECTION
  };
}

function checkStructure(article) {
  const issues = [];
  let score = 100;

  if (!article.content || !article.content.toLowerCase().includes('<p>')) {
    issues.push('No paragraph tags found');
    score -= 20;
  }

  if (!article.content || !article.content.includes('<h2')) {
    issues.push('No H2 sections found');
    score -= 30;
  }

  return {
    passed: issues.length === 0,
    score,
    issues
  };
}
