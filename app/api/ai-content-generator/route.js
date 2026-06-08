import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an expert SEO and Viral Content AI Generator.

Generate highly optimized content for the specified platform. Return ONLY valid JSON with no markdown.

For a given topic and platform, generate:

1. TITLES: Exactly 5 titles ranked from strongest to weakest. Each with a percentage score (estimated CTR/viral potential). The first must be strongest.

2. DESCRIPTIONS: Based on platform:
   - YouTube: 1 SEO long description (150-300 words) with keywords, CTA
   - TikTok: 1 short viral description
   - Instagram: 1 engaging caption
   - Facebook: 1 engagement description

3. HASHTAGS: Platform-specific count:
   - YouTube: 3-5 hashtags
   - TikTok: 3-6 hashtags
   - Instagram: 5-15 hashtags
   - Facebook: 1-3 hashtags

Return this exact JSON structure:
{"titles":[{"score":95,"title":"..."},{"score":92,"title":"..."},{"score":89,"title":"..."},{"score":85,"title":"..."},{"score":80,"title":"..."}],"descriptions":{"youtube":"...","tiktok":"...","instagram":"...","facebook":"..."},"hashtags":{"youtube":["tag1","tag2"],"tiktok":["tag1","tag2"],"instagram":["tag1","tag2"],"facebook":["tag1","tag2"]}}`;

function safeJsonParse(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return null;
}

function detectLanguage(text) {
  if (!text) return 'en';
  const sample = String(text).slice(0, 500);
  return /[\u0600-\u06FF]/.test(sample) ? 'ar' : 'en';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, platform, lang } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Topic must be at least 2 characters' }, { status: 400 });
    }

    const validPlatforms = ['youtube', 'tiktok', 'instagram', 'facebook'];
    const platformClean = validPlatforms.includes(platform) ? platform : 'youtube';
    const langClean = lang === 'ar' ? 'ar' : 'en';

    const langInstruction = langClean === 'ar'
      ? 'Respond entirely in Arabic (العربية) for titles, descriptions, and hashtag text. Keep platform names and technical terms in English.'
      : 'Respond entirely in English.';

    const userPrompt = `Platform: ${platformClean}\nTopic: ${topic}\n\n${langInstruction}\n\nGenerate the content now.`;

    const raw = await generateAIContent({
      prompt: userPrompt,
      systemPrompt: SYSTEM_PROMPT,
      toolId: 'ai-content-generator',
      maxTokens: 2048,
      temperature: 0.7
    });

    const parsed = safeJsonParse(raw);

    if (!parsed || !parsed.titles || !parsed.descriptions || !parsed.hashtags) {
      return NextResponse.json({ success: false, error: 'AI returned invalid format. Try again.', raw }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      data: {
        topic: topic.trim(),
        platform: platformClean,
        lang: langClean,
        titles: parsed.titles,
        descriptions: parsed.descriptions,
        hashtags: parsed.hashtags
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
