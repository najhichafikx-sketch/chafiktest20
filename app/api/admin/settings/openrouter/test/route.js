import { verifyAdmin } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { testApiKey } from '@/lib/openrouter';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 10 });

function explainOpenRouterError(result) {
  const { status, message } = result;
  if (status === 401) {
    return 'The API key is invalid or revoked. Generate a new key at openrouter.ai → Keys, and copy the full key (usually starts with "sk-or-v1-").';
  }
  if (status === 402) {
    return 'Insufficient credits. Top up your OpenRouter account at openrouter.ai → Credits.';
  }
  if (status === 403) {
    return 'Access forbidden. The key may be disabled or restricted. Check openrouter.ai → Keys for status.';
  }
  if (status === 429) {
    return 'Rate limit hit. Wait a minute and try again, or check your usage limits in OpenRouter dashboard.';
  }
  if (status === 0) {
    return 'Network error. The Vercel server could not reach openrouter.ai. Try again in a few minutes.';
  }
  if (status >= 500) {
    return 'OpenRouter server error. Try again in a few minutes.';
  }
  return 'Verify the key at openrouter.ai → Keys.';
}

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Admin session expired. Please log in again.' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }
  const { apiKey } = body;

  if (!apiKey) {
    return Response.json({ success: false, message: 'No API key provided' }, { status: 400 });
  }

  if (!apiKey.startsWith('sk-or-')) {
    return Response.json({
      success: false,
      message: 'Invalid key format. OpenRouter keys start with "sk-or-v1-".',
      hint: 'Get a key at openrouter.ai → Keys. The full key is shown only once when created.'
    }, { status: 400 });
  }

  try {
    const result = await testApiKey(apiKey);
    if (result.ok) {
      await writeLog('INFO', 'OpenRouter API test successful');
      return Response.json({ success: true, message: 'Connection successful — the API key is valid.' });
    }
    await writeLog('WARN', 'OpenRouter API test failed', { status: result.status, message: result.message });
    return Response.json({
      success: false,
      message: result.message,
      hint: explainOpenRouterError(result),
      status: result.status
    }, { status: 400 });
  } catch (e) {
    await writeLog('ERROR', 'OpenRouter API test exception', { error: e.message });
    return Response.json({ success: false, message: e.message || 'Connection failed' }, { status: 500 });
  }
}
