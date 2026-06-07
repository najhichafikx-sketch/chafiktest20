const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value) {
  cache.set(key, { value, ts: Date.now() });
}

function getLevel(score) {
  if (score >= 85) return 'viral';
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function detectEmotionalTriggers(text) {
  if (!text) return { count: 0, types: [] };
  const lower = String(text).toLowerCase();
  const triggers = [
    { key: 'urgency', words: ['urgent', 'now', 'today', 'limited', 'hurry', 'fast', 'quick', 'last chance', 'deadline', 'instant', 'asap', 'exclusive'] },
    { key: 'curiosity', words: ['secret', 'discover', 'revealed', 'unknown', 'mystery', 'hidden', 'truth', 'surprising', 'shocking', 'little-known', 'proven', 'hack'] },
    { key: 'money', words: ['profit', 'revenue', 'earn', 'income', 'money', 'cash', 'rich', 'wealth', 'million', 'passive', 'monetize', 'kdp', 'sales', 'roi'] },
    { key: 'productivity', words: ['boost', 'productivity', 'efficient', 'save time', 'organize', 'planner', 'workflow', 'automate', 'template', 'system', 'checklist'] },
    { key: 'transformation', words: ['transform', 'change', 'master', 'become', 'unlock', 'achieve', 'level up', 'growth', 'journey', 'breakthrough'] }
  ];
  const found = [];
  for (const t of triggers) {
    if (t.words.some(w => lower.includes(w))) found.push(t.key);
  }
  return { count: found.length, types: found };
}

function detectTrendAlignment(text) {
  if (!text) return { score: 0, hits: [] };
  const lower = String(text).toLowerCase();
  const trends = [
    { key: 'ai', weight: 18, words: ['ai', 'artificial intelligence', 'chatgpt', 'gpt', 'midjourney', 'prompt', 'automation'] },
    { key: 'passive-income', weight: 16, words: ['passive income', 'side hustle', 'make money', 'digital product', 'kdp', 'etsy', 'gumroad'] },
    { key: 'productivity', weight: 14, words: ['planner', 'organizer', 'template', 'checklist', 'productivity', 'workflow', 'budget'] },
    { key: 'wellness', weight: 12, words: ['wellness', 'self-care', 'mental health', 'journal', 'gratitude', 'mindfulness'] },
    { key: 'low-content', weight: 15, words: ['planner', 'coloring', 'puzzle', 'workbook', 'low content', 'printable', 'journal'] }
  ];
  const hits = [];
  let score = 0;
  for (const t of trends) {
    if (t.words.some(w => lower.includes(w))) {
      hits.push(t.key);
      score += t.weight;
    }
  }
  return { score: clamp(score), hits };
}

export function calculateViralScore(analysis) {
  if (!analysis) return { score: 0, level: 'low', reasons: ['No analysis data available'] };
  const reasons = [];
  let score = 0;

  const seo = Number(analysis.seo_score || 0);
  score += seo * 0.25;
  if (seo >= 75) reasons.push(`Strong SEO baseline (${seo}/100)`);
  else if (seo < 40) reasons.push(`Weak SEO foundation (${seo}/100)`);

  const demand = Number(analysis.demand_score || 0);
  score += demand * 0.25;
  if (demand >= 75) reasons.push(`High market demand (${demand}/100)`);

  const competition = Number(analysis.competition_score || 0);
  const saturationPenalty = (100 - competition) * 0.15;
  score += saturationPenalty;
  if (competition < 40) reasons.push('Low competition — easier to rank');
  else if (competition > 75) reasons.push('High competition — differentiation needed');

  const conversion = Number(analysis.conversion_score || 0);
  score += conversion * 0.15;
  if (conversion >= 70) reasons.push(`Strong conversion potential (${conversion}/100)`);

  const titleText = `${analysis.optimized_title || ''} ${analysis.bullets?.join(' ') || ''}`;
  const triggers = detectEmotionalTriggers(titleText);
  const triggerScore = clamp(triggers.count * 12);
  score += triggerScore;
  if (triggers.count >= 3) reasons.push(`Multiple emotional triggers (${triggers.types.join(', ')})`);
  else if (triggers.count === 0) reasons.push('No emotional triggers detected — add urgency/curiosity');

  const trend = detectTrendAlignment(titleText);
  score += trend.score * 0.2;
  if (trend.hits.length >= 2) reasons.push(`Aligned with hot trends: ${trend.hits.join(', ')}`);

  const keywords = Array.isArray(analysis.keywords) ? analysis.keywords.length : 0;
  if (keywords >= 8) { score += 5; reasons.push('Strong keyword coverage'); }
  else if (keywords < 4) { reasons.push('Weak keyword coverage — add more long-tail terms'); }

  const final = clamp(score);
  return {
    score: final,
    level: getLevel(final),
    reasons
  };
}

const PLATFORM_META = {
  etsy: { name: 'Etsy', emoji: '🛍️', range: [3, 25] },
  kdp: { name: 'Amazon KDP', emoji: '📚', range: [2.99, 19.99] },
  gumroad: { name: 'Gumroad', emoji: '💸', range: [5, 99] },
  tpt: { name: 'TPT', emoji: '🎓', range: [1, 30] },
  'creative-fabrica': { name: 'Creative Fabrica', emoji: '🎨', range: [0, 0] }
};

function inferCompetitionLevel(score) {
  const v = Number(score || 50);
  if (v < 40) return 'low';
  if (v < 70) return 'medium';
  return 'high';
}

export function buildCompetitionAnalysis(analysis) {
  const baseLevel = inferCompetitionLevel(analysis?.competition_score);
  const baseSaturation = baseLevel === 'low' ? '20%' : baseLevel === 'medium' ? '50%' : '80%';
  const keywords = Array.isArray(analysis?.keywords) ? analysis.keywords : [];
  const topKw = keywords.slice(0, 5);
  const out = {};
  for (const [pid, meta] of Object.entries(PLATFORM_META)) {
    let level = baseLevel;
    if (pid === 'etsy' && baseLevel === 'low') level = 'medium';
    if (pid === 'kdp' && baseLevel === 'high') level = 'high';
    if (pid === 'gumroad') level = baseLevel === 'high' ? 'medium' : 'low';
    if (pid === 'tpt' && baseLevel === 'high') level = 'medium';
    if (pid === 'creative-fabrica') level = baseLevel === 'medium' ? 'low' : baseLevel;
    out[pid] = {
      competition_level: level,
      market_saturation: level === 'low' ? 'Low' : level === 'medium' ? 'Moderate' : 'High',
      opportunity_keywords: topKw.map(k => `${k} ${pid === 'kdp' ? 'kindle' : pid === 'tpt' ? 'tpt' : pid}`)
    };
  }
  return out;
}

function priceFromScore(score, range) {
  const ratio = Math.min(1, Math.max(0, (Number(score || 50) - 20) / 60));
  const [lo, hi] = range;
  return Math.round(((lo + (hi - lo) * ratio) / 0.5)) * 0.5 - 0.01;
}

function strategyFromPrice(price, range) {
  const [lo, hi] = range;
  if (price < lo + (hi - lo) * 0.4) return 'budget';
  if (price < lo + (hi - lo) * 0.75) return 'standard';
  return 'premium';
}

export function buildPricing(analysis) {
  const seo = Number(analysis?.seo_score || 50);
  const demand = Number(analysis?.demand_score || 50);
  const score = (seo * 0.4 + demand * 0.6);
  const out = {};
  for (const [pid, meta] of Object.entries(PLATFORM_META)) {
    if (pid === 'creative-fabrica') {
      out[pid] = {
        suggested_price: 'Subscription asset',
        strategy: 'standard',
        reason: 'Creative Fabrica uses a creator subscription model — estimate per-asset value at $1-$5 based on pack size.'
      };
      continue;
    }
    const price = priceFromScore(score, meta.range);
    out[pid] = {
      suggested_price: `$${price.toFixed(2)}`,
      strategy: strategyFromPrice(price, meta.range),
      reason: score >= 75 ? 'High demand + SEO suggests premium positioning.' : score >= 50 ? 'Solid demand — standard pricing wins.' : 'Niche/emerging — start budget to seed reviews.'
    };
  }
  return out;
}

export function buildThumbnailPrompts(analysis) {
  const title = analysis?.optimized_title || analysis?.title || 'digital product';
  const baseAesthetic = 'high contrast, vibrant colors, digital aesthetic, sharp focus, 4k, professional product photography';
  const typography = 'bold sans-serif typography, large headline overlay, dark gradient backdrop';
  const trigger = 'emotional triggers of success, money, growth, transformation';
  return {
    etsy: `A polished mockup of "${title}" on a clean lifestyle background. ${baseAesthetic}. Soft natural light, eucalyptus accents, ${trigger}, modern minimalist layout, ${typography}, Etsy shop hero feel.`,
    gumroad: `Bold product card for "${title}", tech-savvy creator aesthetic. ${baseAesthetic}, neon gradient accents, ${trigger}, ${typography}, futuristic SaaS landing page feel, high CTR hero.`,
    kdp: `A premium 3D book mockup of "${title}" on a wooden desk, slight tilt, warm cinematic light. ${baseAesthetic}, professional Kindle cover, ${typography}, bestseller look, ${trigger}.`,
    tpt: `An organized teacher resource preview for "${title}". ${baseAesthetic}, printable layout, pastel palette, clear instructional icons, ${typography}, classroom-friendly aesthetic, ${trigger}.`,
    creative_fabrica: `Asset pack hero image for "${title}". ${baseAesthetic}, design system style grid, color swatches, ${typography}, modern designer marketplace feel, ${trigger}.`
  };
}

const PUBLISH_NOTES = {
  etsy: 'Uses Etsy Open API v3 with OAuth 2.0. Requires seller account and approved developer app. Listing draft payload prepared.',
  kdp: 'Amazon KDP does not support direct API publishing for most users. Use the prepared manuscript + metadata with the KDP web interface.',
  gumroad: 'Gumroad offers a Personal Access Token API. Draft payload is prepared for the /products endpoint.',
  tpt: 'Teachers Pay Teachers uses a private API for select partners. Payload is in TPT listing format for manual upload.',
  'creative-fabrica': 'Creative Fabrica uses a partner upload portal. Payload contains asset metadata for the upload form.'
};

export function buildPublishActions(analysis, platform) {
  const meta = PLATFORM_META[platform] || PLATFORM_META.etsy;
  const title = analysis?.optimized_title || analysis?.title || '';
  const desc = analysis?.bullets?.join('\n') || '';
  const tags = (analysis?.keywords || []).slice(0, 13);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const out = {};
  for (const pid of Object.keys(PLATFORM_META)) {
    const ready = pid === 'gumroad';
    out[pid] = {
      status: ready ? 'ready' : 'requires_api',
      payload: {
        title,
        description: desc,
        tags,
        slug,
        price_currency: 'USD',
        suggested_price: (analysis && buildPricing(analysis)[pid]?.suggested_price) || null
      },
      note: PUBLISH_NOTES[pid]
    };
  }
  return out;
}

export function buildCacheKey(analysis, platform) {
  const sig = `${platform}|${analysis?.optimized_title || ''}|${analysis?.seo_score || 0}|${analysis?.demand_score || 0}`;
  return `mi:${Buffer.from(sig).toString('base64').slice(0, 32)}`;
}

export const MARKET_INTELLIGENCE_PLATFORMS = PLATFORM_META;
