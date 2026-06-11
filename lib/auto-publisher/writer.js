// lib/auto-publisher/writer.js
// Multilingual SEO article writer powered by OpenRouter.
// Generates English + Arabic + French versions of every article in a single pipeline run.
//
// Improvements over the previous writer:
//   - True multilingual output (EN / AR / FR) keyed to a single base topic
//   - Explicit SEO metadata: primary keyword, secondary keywords, long-tail keywords,
//     related search terms, hashtags
//   - Stricter anti-fabrication rules (verified facts only)
//   - Banned AI clichés list (longer than before)
//   - JSON contract: { baseSlug, english: {...}, arabic: {...}, french: {...} }
//
// Public API:
//   writeArticle(trend, options)            -> returns multilingual article
//   writeArticleInLanguage(trend, lang)     -> returns one language variant
//   SUPPORTED_LANGUAGES                     -> ['en', 'ar', 'fr']

import OpenAI from 'openai';

function getOpenRouter() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key-build-only'
  });
}

const MODEL_CHAIN = [
  process.env.OPENROUTER_MODEL,
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.3-70b-instruct',
  'mistralai/mistral-7b-instruct'
].filter(Boolean);

export const SUPPORTED_LANGUAGES = ['en', 'ar', 'fr'];

const WC_TOPICS = ['world cup', 'worldcup', 'wc2026', 'fifa', 'match', 'goal',
  'football', 'soccer', 'messi', 'ronaldo', 'mbappe', 'neymar',
  'argentina', 'brazil', 'france', 'england', 'germany', 'spain',
  'portugal', 'netherlands'];

const STADIUMS_DATA = [
  { name: 'Estadio Azteca', city: 'Mexico City', capacity: 83264 },
  { name: 'MetLife Stadium', city: 'New York/New Jersey', capacity: 82500 },
  { name: 'AT&T Stadium', city: 'Dallas', capacity: 80000 },
  { name: 'Arrowhead Stadium', city: 'Kansas City', capacity: 76416 },
  { name: 'NRG Stadium', city: 'Houston', capacity: 72220 },
  { name: 'Lumen Field', city: 'Seattle', capacity: 72000 },
  { name: 'Mercedes-Benz Stadium', city: 'Atlanta', capacity: 71000 },
  { name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70000 },
  { name: 'Gillette Stadium', city: 'Boston', capacity: 68756 },
  { name: "Levi's Stadium", city: 'San Francisco', capacity: 68500 },
  { name: 'Lincoln Financial Field', city: 'Philadelphia', capacity: 67594 },
  { name: 'Hard Rock Stadium', city: 'Miami', capacity: 65326 },
  { name: 'BC Place', city: 'Vancouver', capacity: 54500 },
  { name: 'Estadio BBVA', city: 'Monterrey', capacity: 51000 },
  { name: 'Estadio Akron', city: 'Guadalajara', capacity: 46355 },
  { name: 'BMO Field', city: 'Toronto', capacity: 30000 },
];

// =====================================================================
// LANGUAGE PROFILES — used to adapt prompts per audience
// =====================================================================

const LANG_PROFILE = {
  en: {
    label: 'English',
    audience: 'USA, UK, Canada, Australia and international readers',
    dialect: 'native professional English (American/British neutral)',
    seoEngine: 'Google (en-US, en-GB)',
    hashtagExample: '#WorldCup2026 #Morocco #FIFA',
    primaryDirection: 'ltr'
  },
  ar: {
    label: 'Arabic (Modern Standard)',
    audience: 'Morocco, Saudi Arabia, UAE, Egypt and other Arabic-speaking countries',
    dialect: 'Modern Standard Arabic (فصحى). Do NOT use colloquial dialect. Use professional, neutral Arabic suitable for Al Jazeera, Asharq Al-Awsat or Sky News Arabia readers.',
    seoEngine: 'Google (ar) — primary markets: MA, SA, AE, EG',
    hashtagExample: '#كأس_العالم_2026 #المغرب #فيفا',
    primaryDirection: 'rtl'
  },
  fr: {
    label: 'French',
    audience: 'Quebec (Canada), France, Belgium, Switzerland and other French-speaking countries',
    dialect: 'Natural professional French. Prefer international French (neither heavy Quebec slang nor overly French-only slang). Adapt phrasing to how a francophone searches on Google.',
    seoEngine: 'Google (fr) — primary markets: CA-QC, FR, BE',
    hashtagExample: '#CoupeDuMonde2026 #Maroc #FIFA',
    primaryDirection: 'ltr'
  }
};

// =====================================================================
// SYSTEM PROMPTS
// =====================================================================

function getSystemPrompt(trend, lang = 'en') {
  const profile = LANG_PROFILE[lang];
  const title = (trend.title || '').toLowerCase();
  const isWc = WC_TOPICS.some(k => title.includes(k));

  if (isWc) {
    return `You are an expert football journalist and SEO strategist covering the FIFA World Cup 2026. You write for ${lang === 'ar' ? 'beIN Sports Arabic and Al Jazeera Sport' : lang === 'fr' ? 'L\'Équipe and RMC Sport' : 'ESPN, BBC Sport, and The Athletic'}. You write in ${profile.dialect}. You ONLY write facts that you are certain about — you NEVER fabricate match results, scores, or specific player statistics. If you don't know a specific fact, you write generally about the team's history, playing style, and tournament context instead. You cite specific dates, stadium names, host cities, and confirmed match fixtures. Your articles rank #1 on ${profile.seoEngine} for relevant keywords.`;
  }
  return `You are a senior SEO content writer and industry expert with 15+ years of experience. You write for ${lang === 'ar' ? 'Forbes Arabia and Arab News' : lang === 'fr' ? 'Les Échos and Le Monde' : 'Forbes, TechCrunch, and The Verge'}. You write in ${profile.dialect}. You cite real data, statistics, and concrete examples. Every claim you make is verifiable. Your articles are authoritative, detailed, and rank #1 on ${profile.seoEngine}. You NEVER use AI cliches or vague generalizations.`;
}

// =====================================================================
// SHARED PROMPT SECTIONS
// =====================================================================

const ANTI_FABRICATION_RULES = `
### CRITICAL: Anti-Fabrication Rules
- DO NOT invent specific match scores, goal times, player injuries, transfer fees, or product prices
- DO NOT claim a team "won" or "advanced" if you're not certain
- DO NOT invent quotes from named people
- If writing about an upcoming match, frame it as a PREVIEW: "will face", "set to play", "expected to"
- Use verified data only: team names, dates, venues, tournament structure, widely-known public facts
- When in doubt, write generally about history, playing style, or context
- Better to be vague than wrong — losing reader trust costs more than missing details`;

const BANNED_CLICHES = [
  "in today's fast-paced world", "dive into", "unleash", "harness the power",
  "game-changer", "revolutionize", "cutting-edge", "next-level",
  "unlock the potential", "navigate the landscape", "it's important to note",
  "it's worth noting", "delve into", "embark on a journey", "testament to",
  "in the world of", "in a nutshell", "at the end of the day", "the bottom line is",
  "without further ado", "buckle up", "let's dive in", "bustling", "beacon of",
  "tapestry of", "in conclusion", "to wrap things up", "all in all"
];

function buildClichesList() {
  return BANNED_CLICHES.map(c => `- "${c}"`).join('\n');
}

function buildMatchDataSection(trend) {
  const md = trend.matchData;
  if (!md) return '';

  if (md.team1 && md.team2 && md.venue) {
    return `
## CONFIRMED MATCH DATA (USE THESE EXACT FACTS)
- Match: ${md.team1} vs ${md.team2}
- Date: ${new Date(md.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Venue: ${md.venue} (${md.city})
- Stadium Capacity: ${md.capacity?.toLocaleString() || 'TBA'} seats
- Tournament Stage: Group ${md.group || 'Stage'}
- Host Country: ${md.city?.includes('Mexico City') || md.city?.includes('Monterrey') || md.city?.includes('Guadalajara') ? 'Mexico' : md.city?.includes('Vancouver') || md.city?.includes('Toronto') ? 'Canada' : 'USA'}

CRITICAL RULES:
1. You MUST mention the exact date, venue, and city in your article
2. You MUST mention both teams' names multiple times
3. You MUST describe the venue and its significance
4. If this match has NOT happened yet, write it as a PREVIEW (not a recap)
5. If this match has already happened, you may briefly summarize but DO NOT fabricate scores or specific plays
6. Include match context: group standings implications, tournament stage
7. Use team-specific keywords naturally (e.g. "Morocco national team World Cup 2026", "Scotland vs Morocco fixture")
`;
  }

  if (md.team && md.opponents) {
    return `
## CONFIRMED TEAM DATA (USE THESE EXACT FACTS)
- Team: ${md.team}
- Opponents: ${md.opponents}
- Venues: ${md.venues}
- Matches: ${md.matches.map(m => `${m.team1} vs ${m.team2} on ${new Date(m.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${m.venue} (${m.city})`).join('; ')}

CRITICAL RULES:
1. List ALL confirmed matches with dates and venues
2. Describe each opponent's playing style and World Cup history
3. Analyze the group dynamics and qualification prospects
4. Mention the team's key players and their roles
5. Use long-tail keywords like "${md.team} World Cup 2026 schedule", "${md.team} group stage opponents", "where does ${md.team} play World Cup 2026"
`;
  }

  if (md.template === 'stadiums') {
    return `
## CONFIRMED WORLD CUP 2026 DATA
- Host Nations: USA, Mexico, Canada
- Number of Stadiums: 16
- Number of Teams: 48
- Total Matches: 104
- Tournament Dates: June 11 - July 19, 2026
- Final Venue: MetLife Stadium, New York/New Jersey (82,500 capacity)
- Opening Match: Mexico vs Canada at Estadio Azteca, Mexico City (83,264 capacity)

STADIUMS:
${STADIUMS_DATA.map(s => `- ${s.name} (${s.city}): ${s.capacity.toLocaleString()} seats`).join('\n')}

CRITICAL RULES:
1. List all 16 stadiums with their capacities and host cities
2. Mention which teams play at each venue
3. Describe the unique features of each stadium
4. Use keywords like "World Cup 2026 stadiums list", "USA Mexico Canada World Cup venues"
`;
  }

  if (md.template === 'schedule') {
    return `
## CONFIRMED WORLD CUP 2026 DATA
- Tournament Dates: June 11 - July 19, 2026
- Group Stage: June 11-27, 2026 (12 groups of 4 teams)
- Round of 32: June 28 - July 3, 2026
- Round of 16: July 4-7, 2026
- Quarter-finals: July 9-11, 2026
- Semi-finals: July 14-15, 2026
- Third Place Play-off: July 18, 2026
- Final: July 19, 2026 at MetLife Stadium, New Jersey
- Host Nations: USA (11 stadiums), Mexico (3 stadiums), Canada (2 stadiums)
- Total: 104 matches across 16 venues

CRITICAL RULES:
1. Include the exact tournament date structure
2. Mention the expanded 48-team format
3. Describe the knockout stage progression
4. Use keywords like "World Cup 2026 match schedule", "World Cup 2026 fixtures", "when is World Cup 2026 final"
`;
  }

  return '';
}

// =====================================================================
// PROMPT BUILDER (per language)
// =====================================================================

function buildPrompt(trend, lang) {
  const profile = LANG_PROFILE[lang];
  const matchDataSection = buildMatchDataSection(trend);
  const isWcTopic = trend.isWorldCup || WC_TOPICS.some(k => trend.title?.toLowerCase().includes(k));

  return `Write a comprehensive, authoritative, SEO-optimized article in ${profile.label} about the following topic. The target audience is ${profile.audience}. This is for a real website that ranks on Google — every fact must be accurate.

**Topic:** "${trend.title}"
**Source:** ${trend.source} (${trend.url || 'no URL'})
**Engagement score:** ${trend.score || 'unknown'}
**Target search engine:** ${profile.seoEngine}

${matchDataSection}

---
## ARTICLE REQUIREMENTS

### Length & Structure
- 1500-2000 words total (long-form, authoritative)
- Compelling hook introduction (3-4 sentences that grab attention with a bold statement, statistic, or question)
- 6-8 H2 sections, each with 2-3 H3 sub-sections
- One FAQ section with 4-6 questions (real search queries that people type into Google)
- One "Key Takeaways" section (3-5 bullet points) — excellent for featured snippets
- Strong conclusion with a prediction, recommendation, or clear takeaway
- Include at least one numbered list, one unordered list, and one HTML comparison table

### SEO & Keywords
- Title: 50-60 characters, includes the primary keyword naturally at the beginning
- Slug: URL-friendly, lowercase, hyphens only, no accents, no stop words, must include primary keyword
- Meta description: 150-155 characters, includes the primary keyword + a clear benefit or call to action
- Primary keyword must appear in: the title (H1), the first 100 words, at least one H2, the meta description, and the conclusion
- 3-5 related LSI keywords (semantic variations) used naturally throughout
- 5-8 long-tail keywords (3+ word phrases users actually search for) — provide them in the JSON
- 5-8 related search terms (People Also Ask / autocomplete style) — provide them in the JSON
- Avoid keyword stuffing — keyword density must stay under 2.5%

### Hashtags
- 5-7 hashtags relevant to the topic and target audience
- Example style: ${profile.hashtagExample}
- Return as a single space-separated string in JSON

### Content Style
- Professional, authoritative tone (senior journalist with 10+ years of experience)
- Active voice, varied sentence length
- Reading level: 9th-11th grade
- Use data, statistics, and concrete examples where verified
- Short paragraphs (2-4 sentences)
- Use HTML tables for comparison data${isWcTopic ? `
- Include a "Match Details" / "تفاصيل المباراة" / "Détails du match" callout box with: Date, Venue, City, Stadium Capacity, Tournament Stage` : ''}
- Natural keyword placement, no forced repetition

${ANTI_FABRICATION_RULES}

### Banned AI Clichés — DO NOT USE ANY OF THESE
${buildClichesList()}

If any of these phrases appear in your draft, REPLACE them with concrete, specific language.

### Tags & Category
- 4-6 relevant tags (mix of broad and specific)
- Category from: Technology, Business, Finance, Health, Science, Entertainment, Sports, Marketing, AI, Crypto

### FAQ Requirements
- 4-6 questions people actually search for on Google
- Each answer: 3-5 sentences
- Cover both informational and transactional intent
- Include at least 2 "how" or "what" questions

---
## OUTPUT FORMAT

Return ONLY valid JSON (no markdown code blocks, no commentary). The JSON MUST match this exact shape:

{
  "language": "${lang}",
  "title": "SEO title (50-60 chars)",
  "slug": "url-friendly-slug-with-primary-keyword",
  "metaDescription": "Compelling meta description (150-155 chars) with keyword + CTA",
  "excerpt": "1-2 sentence excerpt used for blog listing and social cards",
  "content": "Full HTML body. Use <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <tr>, <th>, <td>, <a>, <blockquote> tags. MUST start with <p>. Minimum 1500 words.",
  "primaryKeyword": "the single most important search phrase",
  "secondaryKeywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "longTailKeywords": ["long tail phrase 1", "long tail phrase 2", "..."],
  "relatedSearchTerms": ["related query 1", "related query 2", "..."],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "category": "One of the categories above",
  "faqs": [
    {"question": "Real search query people ask", "answer": "Detailed 3-5 sentence answer"}
  ],
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4"],
  "keyFacts": ["fact 1", "fact 2", "fact 3"],
  "hashtags": "${profile.hashtagExample}",
  "imagePrompt": "Short visual description for generating a featured image, e.g. 'Morocco national football team celebrating with fans in a stadium at sunset'"
}`;
}

// =====================================================================
// PUBLIC API
// =====================================================================

/**
 * Write one article variant in the requested language.
 * Returns the parsed JSON object from the model.
 */
export async function writeArticleInLanguage(trend, lang = 'en') {
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    throw new Error(`Unsupported language: ${lang}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }

  const prompt = buildPrompt(trend, lang);
  let lastError;

  for (const model of MODEL_CHAIN) {
    try {
      const openrouter = getOpenRouter();
      const completion = await openrouter.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: getSystemPrompt(trend, lang) },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8000
      });

      const raw = completion.choices[0].message.content;
      let article;

      try {
        const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const braceEnd = cleaned.lastIndexOf('}');
        article = JSON.parse(braceEnd > 0 ? cleaned.slice(0, braceEnd + 1) : cleaned);
      } catch (err) {
        console.error(`[writer/${lang}] Model ${model} returned invalid JSON:`, raw.slice(0, 200));
        lastError = new Error('AI returned invalid JSON');
        continue;
      }

      const required = ['title', 'slug', 'metaDescription', 'content', 'tags', 'category', 'primaryKeyword'];
      const missing = required.filter(f => !article[f]);
      if (missing.length) {
        console.error(`[writer/${lang}] Model ${model} missing fields: ${missing.join(', ')}`);
        lastError = new Error(`AI response missing required field: ${missing[0]}`);
        continue;
      }

      article.language = lang;
      article.wordCount = countWords(article.content);
      article.readingTime = Math.ceil(article.wordCount / 200);
      article.generatedAt = new Date().toISOString();
      article.model = model;

      return article;
    } catch (err) {
      console.warn(`[writer/${lang}] Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error(`[writer/${lang}] All models failed`);
}

/**
 * Write the article in every supported language and return a multilingual bundle.
 * The first successful language becomes the canonical source for `baseSlug` so all
 * three language versions share the same URL stem (e.g. `/blog/morocco-wc-2026-guide`).
 *
 * @param {object} trend          The trend/topic
 * @param {object} [options]
 * @param {string[]} [options.languages] Languages to generate (default: all)
 * @param {number}   [options.concurrency] Max parallel requests (default 2)
 */
export async function writeArticle(trend, options = {}) {
  const languages = options.languages || SUPPORTED_LANGUAGES;
  const concurrency = options.concurrency || 2;

  const queue = [...languages];
  const results = {};
  const errors = {};

  async function worker(id) {
    while (queue.length) {
      const lang = queue.shift();
      try {
        results[lang] = await writeArticleInLanguage(trend, lang);
      } catch (err) {
        errors[lang] = err.message;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, languages.length) }, () => worker());
  await Promise.all(workers);

  // Pick the first successful language's slug as base (so all three share URLs)
  const baseLang = languages.find(l => results[l]);
  const baseSlug = baseLang ? results[baseLang].slug : null;

  return {
    baseSlug,
    sourceTrend: trend,
    generatedAt: new Date().toISOString(),
    languages: results,
    errors: Object.keys(errors).length ? errors : null
  };
}

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').length;
}
