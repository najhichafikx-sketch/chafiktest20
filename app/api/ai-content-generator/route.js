import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

const CONTENT_TYPES = [
  'blog-post', 'seo-article', 'social-media', 'product-description',
  'landing-page', 'youtube-script', 'email-marketing', 'affiliate-content',
  'pinterest-description', 'facebook-post', 'instagram-caption',
  'tiktok-caption', 'linkedin-post', 'twitter-thread'
];

// Per-task model mapping for optimal quality + cost
const MODEL_MAP = {
  titles: 'google/gemini-2.5-pro',
  keywords: 'google/gemini-2.5-pro',
  content: 'anthropic/claude-sonnet-4.5',
  social: 'openai/gpt-4o',
  images: 'google/gemini-2.5-pro',
  seo: 'openai/gpt-4o',
};

const TITLES_SYSTEM = `You are an elite SEO title strategist. Generate 10 click-worthy, SEO-optimized titles for the given topic.

Rules:
- Front-load primary keyword in first 5 words
- Under 60 characters for Google SERP
- Use power words: ultimate, best, top, guide, 2026, proven, essential, secret
- Include numbers, brackets, or parentheses where natural
- Match search intent (informational/transactional/commercial)
- Score each title 0-100 based on CTR potential + keyword presence + emotional trigger + clarity
- Include a brief reason explaining the score

Return ONLY valid JSON:
{"titles":[{"score":95,"title":"...","reason":"..."}, ...]}`;

const KEYWORDS_SYSTEM = `You are an SEO keyword research expert. Analyze the topic and generate comprehensive keyword data.

Return ONLY valid JSON:
{
  "primary": ["keyword1", "keyword2"],
  "secondary": ["keyword3", "keyword4"],
  "longTail": ["long tail keyword 1", "long tail keyword 2"],
  "lsi": ["related term 1", "related term 2"],
  "questions": ["question 1?", "question 2?"],
  "searchIntent": "Informational / Transactional / Commercial / Navigational",
  "difficulty": "Easy / Medium / Hard",
  "opportunities": ["Content gap 1", "Content gap 2"]
}`;

const CONTENT_SYSTEM = `You are a world-class copywriter and content strategist. Write a comprehensive, engaging, SEO-optimized piece.

Requirements:
- Human-like, natural writing (not AI-sounding)
- SEO optimized with primary + LSI keywords throughout
- Proper H1/H2/H3 heading hierarchy
- Internal linking suggestions in [brackets]
- Clear CTAs
- Readable for target audience
- 800-2000 words depending on content type
- Include introduction, body sections, and conclusion

Write the full content. Return ONLY the content text with markdown headings.`;

const SOCIAL_SYSTEM = `You are a social media content strategist. Generate platform-optimized content for all major platforms.

Return ONLY valid JSON:
{
  "facebook": {"text":"...","cta":"...","hashtags":["#tag1","#tag2"]},
  "instagram": {"caption":"...","hook":"...","hashtags":["#tag1","#tag2"]},
  "tiktok": {"caption":"...","hooks":["hook1","hook2"],"hashtags":["#tag1","#tag2"]},
  "youtube": {"title":"...","description":"...","tags":["tag1","tag2"],"hooks":["hook1","hook2"]},
  "pinterest": {"pinTitle":"...","pinDescription":"...","keywords":["kw1","kw2"]},
  "linkedin": {"post":"...","cta":"..."},
  "twitter": {"thread":"...","hook":"..."}
}`;

const IMAGES_SYSTEM = `You are an expert AI prompt engineer specialized in marketing visuals. Generate highly detailed, commercial-quality image prompts based on the content.

For each image type, generate 3 prompts: Standard, Advanced, Negative.

Return ONLY valid JSON:
{
  "featured": {"standard":"...","advanced":"...","negative":"..."},
  "social": {"standard":"...","advanced":"...","negative":"..."},
  "blogBanner": {"standard":"...","advanced":"...","negative":"..."},
  "youtubeThumbnail": {"standard":"...","advanced":"...","negative":"..."},
  "pinterestPin": {"standard":"...","advanced":"...","negative":"..."}
}`;

const SEO_SYSTEM = `You are an SEO specialist. Generate complete SEO metadata for the given content.

Return ONLY valid JSON:
{
  "title": "SEO title under 60 chars",
  "metaDescription": "Meta description under 160 chars",
  "focusKeyword": "primary keyword",
  "slug": "url-friendly-slug",
  "ogTitle": "Open Graph title",
  "ogDescription": "Open Graph description",
  "twitterCard": "Twitter card description"
}`;

function safeJsonParse(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```json\s*/gi, '').replace(/```\s*/gi, '').replace(/```\s*$/gi, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

async function callModel({ prompt, systemPrompt, model, temperature = 0.5, maxTokens = 2000 }) {
  const raw = await generateAIContent({
    prompt, systemPrompt,
    model, toolId: 'ai-content-generator',
    temperature, maxTokens
  });
  return safeJsonParse(raw);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, keyword, niche, targetAudience, lang, contentType } = body;

    if (!topic || topic.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Topic must be at least 2 characters' }, { status: 400 });
    }

    const contentTypeClean = CONTENT_TYPES.includes(contentType) ? contentType : 'seo-article';
    const langClean = lang === 'ar' ? 'ar' : 'en';
    const langInstruction = langClean === 'ar'
      ? 'Respond entirely in Arabic (العربية). Keep technical terms in English.'
      : 'Respond entirely in English.';

    const context = `Topic: ${topic.trim()}\nKeyword: ${keyword || topic.trim()}\nNiche: ${niche || 'General'}\nTarget Audience: ${targetAudience || 'General'}\nContent Type: ${contentTypeClean.replace(/-/g, ' ')}\n\n${langInstruction}`;

    // Call 1: Titles + Keywords in parallel (Gemini - fast)
    const [titlesData, keywordsData] = await Promise.all([
      callModel({ prompt: `${context}\n\nGenerate 10 SEO titles.`, systemPrompt: TITLES_SYSTEM, model: MODEL_MAP.titles, maxTokens: 2000 }),
      callModel({ prompt: `${context}\n\nGenerate comprehensive keyword research.`, systemPrompt: KEYWORDS_SYSTEM, model: MODEL_MAP.keywords, maxTokens: 1500 })
    ]);

    // Call 2: Full content (Claude - best writing)
    const bestTitle = titlesData?.titles?.[0]?.title || topic;
    const contentPrompt = `${context}\n\nTitle: ${bestTitle}\n\nWrite the full content now.`;
    const contentRaw = await generateAIContent({
      prompt: contentPrompt, systemPrompt: CONTENT_SYSTEM,
      model: MODEL_MAP.content, toolId: 'ai-content-generator',
      temperature: 0.6, maxTokens: 4096
    });
    const content = String(contentRaw).replace(/^```markdown\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    // Call 3: Social media + Image prompts + SEO in parallel (GPT-4o + Gemini)
    const [socialData, imagesData, seoData] = await Promise.all([
      callModel({ prompt: `${context}\n\nContent excerpt: ${content.slice(0, 1000)}\n\nGenerate social media content for all platforms.`, systemPrompt: SOCIAL_SYSTEM, model: MODEL_MAP.social, maxTokens: 2500 }),
      callModel({ prompt: `${context}\n\nTopic: ${bestTitle}\n\nGenerate commercial-quality image prompts for marketing visuals.`, systemPrompt: IMAGES_SYSTEM, model: MODEL_MAP.images, maxTokens: 2000 }),
      callModel({ prompt: `${context}\n\nTitle: ${bestTitle}\nContent preview: ${content.slice(0, 500)}\n\nGenerate complete SEO metadata.`, systemPrompt: SEO_SYSTEM, model: MODEL_MAP.seo, maxTokens: 1000 })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        topic: topic.trim(),
        keyword: keyword || topic.trim(),
        contentType: contentTypeClean,
        lang: langClean,
        titles: titlesData?.titles || [],
        keywords: keywordsData || {},
        content,
        socialMedia: socialData || {},
        imagePrompts: imagesData || {},
        seo: seoData || {}
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
