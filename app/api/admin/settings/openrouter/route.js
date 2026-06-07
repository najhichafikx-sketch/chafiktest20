import { verifyAdmin } from '@/lib/auth';
import { writeLog, getSetting, setSetting } from '@/lib/db';
import { validateApiKey } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 20 });

function maskKey(key) {
  if (!key || typeof key !== 'string' || key.length < 8) return null;
  return 'sk-or-v1-' + '*'.repeat(Math.max(8, key.length - 12)) + key.slice(-4);
}

async function loadApiKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  try {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(process.cwd(), 'data', 'keys.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.openrouter_api_key) return data.openrouter_api_key;
    }
  } catch (e) {}
  try {
    const dbKey = await getSetting('openrouter_api_key');
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

  let landingPageModel = 'openai/gpt-4o-mini';
  try {
    const stored = await getSetting('landing_page_model');
    if (stored && typeof stored === 'string' && stored.trim()) {
      landingPageModel = stored.trim();
    } else if (stored && typeof stored === 'object' && stored.value) {
      landingPageModel = String(stored.value).trim();
    }
  } catch (e) {}

  return Response.json({
    success: true,
    isConfigured: hasKey,
    maskedKey: hasKey ? maskKey(apiKey) : null,
    landingPageModel,
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
  const { apiKey, landingPageModel } = body;

  if (apiKey !== undefined) {
    if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
      return Response.json({ success: false, message: 'Invalid OpenRouter API Key format' }, { status: 400 });
    }

    process.env.OPENROUTER_API_KEY = apiKey;

    try {
      const fs = require('fs');
      const path = require('path');
      const dir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'keys.json'), JSON.stringify({ openrouter_api_key: apiKey }, null, 2));
    } catch (e) {
      // Vercel has read-only filesystem; DB write below handles persistence
    }

    try {
      await setSetting('openrouter_api_key', apiKey);
    } catch (e) {
      return Response.json({
        success: false,
        message: 'Failed to persist API key to database. Make sure DATABASE_URL is configured.'
      }, { status: 500 });
    }

    await writeLog('INFO', 'OpenRouter API Key updated by Admin');
  }

  if (landingPageModel !== undefined && typeof landingPageModel === 'string' && landingPageModel.trim()) {
    try {
      await setSetting('landing_page_model', landingPageModel.trim());
    } catch (e) {
      return Response.json({
        success: false,
        message: 'Failed to persist landing page model.'
      }, { status: 500 });
    }
  }

  return Response.json({ success: true, message: 'Settings saved.' });
}
