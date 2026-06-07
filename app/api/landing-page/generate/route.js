import { generateAIContent } from '@/lib/openrouter';
import { writeLog, getLPRateLimit, setLPRateLimit, getSetting } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const RATE_LIMIT_MS = 5 * 60 * 60 * 1000;
const FRIENDLY_UNAVAILABLE = 'Service temporarily unavailable. Please try again later.';

const LP_CONFIG_FILE = path.join(process.cwd(), 'data', 'lp-config.json');

async function readJsonSafe(filePath, fallback = {}) {
  try {
    const buf = await fs.readFile(filePath, 'utf8');
    return JSON.parse(buf);
  } catch {
    return fallback;
  }
}

async function getSelectedModel() {
  try {
    const stored = await getSetting('landing_page_model');
    if (stored && typeof stored === 'string' && stored.trim()) return stored.trim();
    if (stored && typeof stored === 'object' && stored.value) return String(stored.value).trim();
  } catch {}
  try {
    const cfg = await readJsonSafe(LP_CONFIG_FILE, {});
    if (cfg?.model) return cfg.model;
  } catch {}
  return 'openai/gpt-4o-mini';
}

function getSessionId(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)lp_sid=([^;]+)/);
  if (match) return match[1];
  const bodyId = request.headers.get('x-lp-session');
  if (bodyId) return bodyId;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  return `ip:${ip}`;
}

export async function POST(request) {
  const userId = getSessionId(request);

  try {
    const { lastUsed, found } = await getLPRateLimit(userId);
    const now = Date.now();
    if (found && lastUsed && (now - lastUsed) < RATE_LIMIT_MS) {
      const retryAfterSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastUsed)) / 1000);
      await writeLog('INFO', `Landing page rate limit hit for ${userId}`, { retryAfterSeconds });
      return Response.json({
        error: 'rate_limited',
        message: FRIENDLY_UNAVAILABLE,
        retry_after_seconds: retryAfterSeconds
      }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } });
    }
  } catch (err) {
    console.warn('LP rate limit check failed (allowing request):', err.message);
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'invalid_request', message: FRIENDLY_UNAVAILABLE }, { status: 400 });
  }

  const {
    productName = '',
    description = '',
    language = 'en',
    ctaText = 'Get Started',
    primaryColor = '#6D28D9',
    contactInfo = {},
    socialLinks = {},
    imageUrls = []
  } = body || {};

  if (!productName || typeof productName !== 'string') {
    return Response.json({ error: 'invalid_request', message: 'productName is required' }, { status: 400 });
  }

  const languageNames = { ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', tr: 'Turkish', de: 'German' };
  const languageName = languageNames[language] || 'English';
  const isRtl = language === 'ar';

  const socialLine = Object.entries(socialLinks || {})
    .filter(([, url]) => url && typeof url === 'string' && url.trim().length > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  const contactLine = Object.entries(contactInfo || {})
    .filter(([, v]) => v && String(v).trim().length > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  const systemPrompt = `You are a senior landing page copywriter and HTML/CSS developer. Output ONLY a single complete, self-contained HTML5 document.
- Use <!DOCTYPE html> at the start.
- Include <meta charset="utf-8"> and <meta name="viewport" content="width=device-width, initial-scale=1">.
- Inline <style> in the <head>; no external CSS frameworks.
- ${isRtl ? "Use <html dir='rtl' lang='ar'> and import the Tajawal font from Google Fonts: <link href='https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap' rel='stylesheet'>. Use font-family: 'Tajawal', sans-serif on the body." : "Use <html dir='ltr' lang='en'>. Use a modern system font stack (Inter/SF Pro/Segoe UI)."}
- All copy MUST be in ${languageName}.
- Use the primary color ${primaryColor} for the main buttons, accents, and gradients.
- Use the provided image URLs in the hero section.
- Make it fully responsive (mobile-first).
- Sections in this order: 1) Hero (logo, headline, sub-headline, primary CTA, image), 2) Features (3-column with icon+title+description), 3) Problem & Solution (2-column), 4) Testimonials (3 cards with 5 stars, quote, name), 5) Contact (phone, whatsapp, email, location), 6) Social Links, 7) Final CTA.`;

  const userPrompt = `Build a landing page for: ${productName}

Description: ${description || 'N/A'}
Language: ${languageName}
Primary CTA: ${ctaText}
Primary color: ${primaryColor}

Contact info:
${contactLine || 'N/A'}

Social links:
${socialLine || 'N/A'}

Image URLs (use these in the hero):
${(imageUrls || []).slice(0, 5).join('\n') || 'N/A'}

Output a complete, production-ready HTML5 document. No markdown fences. No commentary.`;

  try {
    const model = await getSelectedModel();

    const resultText = await generateAIContent({
      prompt: userPrompt,
      systemPrompt,
      toolId: 'landing-page',
      model,
      temperature: 0.7,
      maxTokens: 4000
    });

    if (!resultText) {
      return Response.json({ error: 'empty_response', message: FRIENDLY_UNAVAILABLE }, { status: 500 });
    }

    let html = String(resultText).trim();
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    try { await setLPRateLimit(userId); } catch (err) {
      console.warn('Failed to record LP rate limit timestamp:', err.message);
    }

    return Response.json({
      success: true,
      html,
      model,
      language,
      primaryColor
    });
  } catch (error) {
    await writeLog('ERROR', `Landing page generation failed`, { error: error.message });
    return Response.json({
      error: 'generation_failed',
      message: FRIENDLY_UNAVAILABLE
    }, { status: 503 });
  }
}
