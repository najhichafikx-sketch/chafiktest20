import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an elite SEO Content Strategist and Viral Copywriter with 15+ years experience.

Generate highly optimized content that ranks on Google and drives viral engagement. Return ONLY valid JSON with no markdown.

## SEO RULES FOR TITLES
- Front-load the primary keyword within first 5 words
- Match search intent (informational, transactional, commercial)
- Include power words: proven, ultimate, essential, best, top, guide, 2026, secret, hacked, insane
- Keep under 60 characters for Google SERP display
- Use numbers, brackets, or parentheses to boost CTR
- Score based on: keyword presence (30%), CTR potential (30%), emotional trigger (20%), clarity (20%)

## SEO RULES FOR DESCRIPTIONS
- YouTube: 200-350 words. Include primary keyword in first 2 sentences. 2-3 LSI keywords naturally placed. Strong CTA with subscribe/watch. Timestamp structure for long videos. Links to related content.
- TikTok: 80-120 chars. Hook first line, question/poll to boost comments, trending sound mentions.
- Instagram: 120-200 chars. Front-load keyword, line breaks for readability, 2-3 emojis, question for engagement, CTA to save/share.
- Facebook: 150-250 chars. Story-style opening, curiosity gap, question to drive comments, link CTA.

## HASHTAG STRATEGY
- YouTube: 3 broad + 2 niche tags (total 5)
- TikTok: 2 viral (1M+ posts) + 2 medium (100K+) + 2 niche (10K+)
- Instagram: 3 viral + 4 medium + 5 niche + 3 branded (15 total max)
- Facebook: 1 broad + 1 niche + 1 branded (3 total)

## SEO NOTES
- After each title, include exact reason for its score.
- For each platform description, list 3 specific SEO keywords used.
- Suggest 1 internal linking opportunity per platform.

Return this exact JSON structure:
{"titles":[{"score":95,"title":"...","reason":"Keyword front-loaded, power word \"ultimate\", clear search intent, under 60 chars"},{"score":88,"title":"...","reason":"..."},{"score":82,"title":"...","reason":"..."},{"score":76,"title":"...","reason":"..."},{"score":70,"title":"...","reason":"..."}],"descriptions":{"youtube":"...","tiktok":"...","instagram":"...","facebook":"..."},"hashtags":{"youtube":["tag1","tag2","tag3","tag4","tag5"],"tiktok":["tag1","tag2","tag3","tag4","tag5","tag6"],"instagram":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13","tag14","tag15"],"facebook":["tag1","tag2","tag3"]},"seoNotes":{"titles":"Primary keyword: [keyword]. Front-loaded in title 1, 2, 3. Intent: [informational/transactional]. Top pick because [reason].","youtube":"Keywords used: [kw1, kw2, kw3]. Suggested internal link: /blog/related-article","tiktok":"Viral keywords: [kw1, kw2]. Trending sound suggestion: [sound_name]","instagram":"Niche keywords: [kw1, kw2, kw3]. Best posting time: [time]","facebook":"Engagement keywords: [kw1, kw2]. Suggested link: /tools/related-tool"}}`;

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

    const data = {
      topic: topic.trim(),
      platform: platformClean,
      lang: langClean,
      titles: parsed.titles,
      descriptions: parsed.descriptions,
      hashtags: parsed.hashtags
    };

    if (parsed.seoNotes) {
      data.seoNotes = parsed.seoNotes;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
