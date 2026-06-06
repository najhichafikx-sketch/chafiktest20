import { generateAIContent } from '@/lib/openrouter';
import { getRateLimitLastUsed, setRateLimitLastUsed, writeLog, getDailyUsageCount } from '@/lib/db';

const RATE_LIMIT_MS = 5 * 60 * 60 * 1000;
const FRIENDLY_UNAVAILABLE = 'الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً';

function getClientKey(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  return `lp:${ip}`;
}

export async function POST(request) {
  const clientKey = getClientKey(request);

  try {
    const lastUsed = await getRateLimitLastUsed(clientKey);
    const now = Date.now();
    if (lastUsed && (now - lastUsed) < RATE_LIMIT_MS) {
      const retryAfterSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastUsed)) / 1000);
      await writeLog('INFO', `Landing page rate limit hit for ${clientKey}`, { retryAfterSeconds });
      return Response.json({
        error: 'rate_limited',
        message: FRIENDLY_UNAVAILABLE,
        retry_after_seconds: retryAfterSeconds
      }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } });
    }
  } catch (err) {
    console.warn('Rate limit check failed (allowing request):', err.message);
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'invalid_request', message: FRIENDLY_UNAVAILABLE }, { status: 400 });
  }

  const { prompt, language = 'en', template_type = 'default' } = body;

  if (!prompt || typeof prompt !== 'string') {
    return Response.json({ error: 'invalid_request', message: FRIENDLY_UNAVAILABLE }, { status: 400 });
  }

  const languageNames = { ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', tr: 'Turkish', de: 'German' };
  const languageName = languageNames[language] || 'English';
  const rtlDirective = language === 'ar' ? " If Arabic, use RTL direction (dir='rtl') in the output HTML." : '';
  const augmentedPrompt = `${prompt}\n\nGenerate all landing page text in ${languageName}.${rtlDirective}\nTemplate type: ${template_type}`;

  try {
    const resultText = await generateAIContent({
      prompt: augmentedPrompt,
      systemPrompt: 'You are an expert landing page copywriter. Output only the requested plain text fields, no markdown, no code blocks.',
      toolId: 'landing-page',
      temperature: 0.7,
      maxTokens: 800
    });

    if (!resultText) {
      return Response.json({ error: 'empty_response', message: FRIENDLY_UNAVAILABLE }, { status: 500 });
    }

    try { await setRateLimitLastUsed(clientKey); } catch (err) {
      console.warn('Failed to record rate limit timestamp:', err.message);
    }

    let dailyCount = 0;
    try { dailyCount = await getDailyUsageCount(); } catch {}

    return Response.json({
      success: true,
      text: resultText,
      model: 'landing-page',
      language,
      template_type,
      daily_usage: dailyCount
    });
  } catch (error) {
    await writeLog('ERROR', `Landing page generation failed`, { error: error.message });
    return Response.json({
      error: 'generation_failed',
      message: FRIENDLY_UNAVAILABLE
    }, { status: 503 });
  }
}
