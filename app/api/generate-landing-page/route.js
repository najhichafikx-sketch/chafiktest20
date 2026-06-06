import { generateAIContent } from '@/lib/openrouter';
import { getRateLimitLastUsed, setRateLimitLastUsed, writeLog } from '@/lib/db';
import { sanitizeInput } from '@/lib/sanitize';

const RATE_LIMIT_MS = 5 * 60 * 60 * 1000;
const FRIENDLY_UNAVAILABLE_MSG = 'الخدمة غير متاحة حالياً، يرجى المحاولة لاحقاً';

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
      await writeLog('INFO', `Rate limit hit for ${clientKey}`, { retryAfterSeconds });
      return Response.json({
        error: 'rate_limited',
        message: FRIENDLY_UNAVAILABLE_MSG,
        retry_after_seconds: retryAfterSeconds
      }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } });
    }
  } catch (err) {
    console.warn('Rate limit check failed (allowing request):', err.message);
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'invalid_request', message: 'Invalid JSON' }, { status: 400 });
  }

  const toolId = 'landing-page';
  const input = sanitizeInput(body.input || '');
  const prompt = body.prompt ? sanitizeInput(body.prompt) : null;

  if (!input && !prompt) {
    return Response.json({ error: 'invalid_request', message: 'Input is required' }, { status: 400 });
  }

  const systemPrompt = 'You are an expert landing page copywriter. Output only the requested plain text fields, no markdown, no code blocks.';

  try {
    const fullPrompt = prompt || `You are an expert landing page copywriter. Improve the headline and description to be more persuasive. Output in EXACTLY this format: HEADLINE: [text] DESCRIPTION: [text]. Input: ${input}`;

    const resultText = await generateAIContent({
      prompt: fullPrompt,
      systemPrompt,
      toolId,
      temperature: 0.7,
      maxTokens: 800
    });

    if (!resultText) {
      return Response.json({ error: 'empty_response', message: FRIENDLY_UNAVAILABLE_MSG }, { status: 500 });
    }

    try { await setRateLimitLastUsed(clientKey); } catch (err) {
      console.warn('Failed to record rate limit timestamp:', err.message);
    }

    return Response.json({
      success: true,
      text: resultText,
      model: toolId
    });
  } catch (error) {
    await writeLog('ERROR', `Landing page generation failed`, { error: error.message });
    return Response.json({
      error: 'generation_failed',
      message: FRIENDLY_UNAVAILABLE_MSG
    }, { status: 500 });
  }
}

export async function GET(request) {
  const clientKey = getClientKey(request);
  try {
    const lastUsed = await getRateLimitLastUsed(clientKey);
    const now = Date.now();
    if (lastUsed && (now - lastUsed) < RATE_LIMIT_MS) {
      return Response.json({
        limited: true,
        retry_after_seconds: Math.ceil((RATE_LIMIT_MS - (now - lastUsed)) / 1000)
      });
    }
    return Response.json({ limited: false, retry_after_seconds: 0 });
  } catch (err) {
    return Response.json({ limited: false, retry_after_seconds: 0 });
  }
}
