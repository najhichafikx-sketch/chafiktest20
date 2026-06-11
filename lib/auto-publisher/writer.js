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

export async function writeArticle(trend) {
  const prompt = buildPrompt(trend);
  let lastError;

  for (const model of MODEL_CHAIN) {
    try {
      const openrouter = getOpenRouter();
      const completion = await openrouter.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior SEO content writer with 10+ years of experience. You write for major publications. You never use AI cliches like "in today\'s fast-paced world" or "dive into" or "unleash the power of". You write factually, cite sources, and structure content for both humans and search engines.'
          },
          {
            role: 'user',
            content: prompt
          }
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
        console.error(`Model ${model} returned invalid JSON:`, raw.slice(0, 200));
        lastError = new Error('AI returned invalid JSON');
        continue;
      }

      const required = ['title', 'slug', 'metaDescription', 'content', 'tags', 'category'];
      const missing = required.filter(f => !article[f]);
      if (missing.length) {
        console.error(`Model ${model} missing fields: ${missing.join(', ')}`);
        lastError = new Error(`AI response missing required field: ${missing[0]}`);
        continue;
      }

      article.wordCount = countWords(article.content);
      article.readingTime = Math.ceil(article.wordCount / 200);
      article.generatedAt = new Date().toISOString();
      article.sourceTrend = trend;
      article.model = model;

      return article;
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All models failed');
}

function buildPrompt(trend) {
  return `Write a comprehensive, SEO-optimized English article about the trending topic:

**Topic:** "${trend.title}"
**Source:** ${trend.source} (${trend.url || 'no URL'})
**Engagement score:** ${trend.score || 'unknown'}

---

## ARTICLE REQUIREMENTS

### Length & Structure
- 800-1200 words total (must be at least 800 words)
- Compelling hook introduction (2 opening sentences that grab attention)
- 5-7 H2 sections, each with 1-2 H3 sub-sections where useful
- FAQ section with 3-5 questions near the end
- Strong conclusion with call-to-action

### SEO
- Title: 50-60 characters, includes main keyword naturally
- Slug: URL-friendly, lowercase, hyphens, no stop words
- Meta description: 150-155 characters
- Primary keyword appears in first 100 words
- Use keyword 2-3 more times naturally throughout (no stuffing)

### Content Style
- Professional but conversational tone
- Active voice, short paragraphs (2-3 sentences max)
- Reading level: 8th-10th grade
- Use bullet points and numbered lists where they help
- No AI cliches. Banned: "in today's fast-paced world", "dive into", "unleash", "harness the power", "game-changer", "revolutionize", "cutting-edge", "next-level", "unlock the potential"
- Use real data points, examples, or expert quotes

### Tags & Category
- 3-5 relevant tags
- Category from: Technology, Business, Finance, Health, Science, Entertainment, Sports, Marketing, AI, Crypto

### FAQ
- 3-5 questions people actually search for
- Each answer: 2-4 sentences

---

## OUTPUT FORMAT

Return ONLY valid JSON (no markdown code blocks):

{
  "title": "...",
  "slug": "url-friendly-slug",
  "metaDescription": "...",
  "content": "Full HTML content using <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em> tags. MUST start with <p> tag.",
  "tags": ["tag1", "tag2", "tag3"],
  "category": "One of the categories above",
  "faqs": [
    {"question": "...", "answer": "..."}
  ],
  "keyFacts": ["fact 1", "fact 2", "fact 3"]
}`;
}

function countWords(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').length;
}
