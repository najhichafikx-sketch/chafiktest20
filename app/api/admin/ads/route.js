import { verifyAdmin } from '@/lib/auth';
import { getAdSettings, saveAdSetting } from '@/lib/adSettings';
import { writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 30 });

const DEFAULT_AD_LOCATIONS = ['header', 'sidebar', 'content_top', 'content_bottom', 'footer', 'in_tool', 'loading_state', 'mid_result'];

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbAds = await getAdSettings();
    const settingsMap = {};
    if (dbAds && dbAds.length > 0) {
      for (const a of dbAds) {
        if (a.code) settingsMap[a.location] = a;
      }
    }

    const ads = DEFAULT_AD_LOCATIONS.map(loc => ({
      id: settingsMap[loc]?.id || null,
      location: loc,
      enabled: settingsMap[loc]?.enabled ?? true,
      code: settingsMap[loc]?.code || ''
    }));

    return Response.json({ success: true, ads });
  } catch {
    return Response.json({ success: false, message: 'Failed to fetch ads' }, { status: 500 });
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

  const { id, location, enabled, code } = body;

  if (!id && !location) {
    return Response.json({ success: false, message: 'id or location required' }, { status: 400 });
  }

  try {
    await saveAdSetting(id, { location, enabled, code });
    await writeLog('INFO', `Ad setting updated: ${location || id}`);
    return Response.json({ success: true, message: 'Ad setting saved' });
  } catch {
    return Response.json({ success: false, message: 'Save failed' }, { status: 500 });
  }
}
