import { verifyAdmin } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { validateApiKey } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 20 });

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const hasKey = !!process.env.OPENROUTER_API_KEY;
  return Response.json({
    success: true,
    isConfigured: hasKey,
    maskedKey: hasKey ? 'sk-or-v1-' + '*'.repeat(16) + process.env.OPENROUTER_API_KEY.slice(-4) : null,
    usageCount: 0,
    status: hasKey ? 'active' : 'inactive'
  });
}

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }
  const { apiKey } = body;

  if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
    return Response.json({ success: false, message: 'Invalid OpenRouter API Key format' }, { status: 400 });
  }

  process.env.OPENROUTER_API_KEY = apiKey;
  await writeLog('INFO', 'OpenRouter API Key updated by Admin');

  return Response.json({ success: true, message: 'OpenRouter API Key saved.' });
}
