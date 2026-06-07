import { verifyAdmin } from '@/lib/auth';
import { getSetting, setSetting, writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 20 });

function maskKey(key) {
  if (!key || typeof key !== 'string' || key.length < 8) return null;
  return 'AIza' + '*'.repeat(Math.max(8, key.length - 8));
}

async function loadApiKey() {
  if (process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY;
  try {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(process.cwd(), 'data', 'keys.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.youtube_api_key) return data.youtube_api_key;
    }
  } catch (e) {}
  try {
    const dbKey = await getSetting('youtube_api_key');
    if (dbKey && typeof dbKey === 'string' && dbKey.trim()) return dbKey.trim();
  } catch (e) {}
  return null;
}

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = await loadApiKey();
  const hasKey = !!apiKey;

  return Response.json({
    success: true,
    isConfigured: hasKey,
    maskedKey: hasKey ? maskKey(apiKey) : null,
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

  if (apiKey === undefined) {
    return Response.json({ success: false, message: 'apiKey is required' }, { status: 400 });
  }

  if (!apiKey || (typeof apiKey === 'string' && (!apiKey.startsWith('AIza') || apiKey.length < 30))) {
    return Response.json({ success: false, message: 'Invalid YouTube Data API Key format (must start with AIza)' }, { status: 400 });
  }

  process.env.YOUTUBE_API_KEY = apiKey;

  try {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), 'data');
    const file = path.join(dir, 'keys.json');
    let existing = {};
    if (fs.existsSync(file)) {
      try { existing = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch (e) {}
    }
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ ...existing, youtube_api_key: apiKey }, null, 2));
  } catch (e) {
    // Vercel read-only; DB below handles persistence
  }

  try {
    await setSetting('youtube_api_key', apiKey);
  } catch (e) {
    return Response.json({
      success: false,
      message: 'Failed to persist API key to database. Make sure DATABASE_URL is configured.'
    }, { status: 500 });
  }

  await writeLog('INFO', 'YouTube Data API Key updated by Admin');
  return Response.json({ success: true, message: 'API key saved successfully' });
}
