import { verifyAdmin } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { testApiKey } from '@/lib/openrouter';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 10 });

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

  if (!apiKey) {
    return Response.json({ success: false, message: 'No API key provided' }, { status: 400 });
  }

  try {
    const ok = await testApiKey(apiKey);
    if (ok) {
      await writeLog('INFO', 'OpenRouter API test successful');
      return Response.json({ success: true, message: 'Connection successful!' });
    }
    return Response.json({ success: false, message: 'Invalid API Key' }, { status: 400 });
  } catch {
    return Response.json({ success: false, message: 'Connection failed' }, { status: 500 });
  }
}
