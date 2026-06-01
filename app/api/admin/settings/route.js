import { verifyAdmin } from '@/lib/auth';
import { getSetting, setSetting, writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 30 });

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const maintenance = await getSetting('maintenance_mode');
    const globalPrompt = await getSetting('global_system_prompt');

    return Response.json({
      success: true,
      settings: {
        maintenance_mode: maintenance ?? false,
        global_system_prompt: globalPrompt || ''
      }
    });
  } catch {
    return Response.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
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

  const { key, value } = body;
  if (!key) {
    return Response.json({ success: false, message: 'key is required' }, { status: 400 });
  }

  try {
    await setSetting(key, value);
    await writeLog('INFO', `Site setting updated: ${key}`);
    return Response.json({ success: true, message: 'Setting saved' });
  } catch {
    return Response.json({ success: false, message: 'Save failed' }, { status: 500 });
  }
}
