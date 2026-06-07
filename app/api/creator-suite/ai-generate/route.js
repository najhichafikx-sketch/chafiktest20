import { verifyAdmin } from '@/lib/auth';
import { getSetting, getRateLimitLastUsed, setRateLimitLastUsed, writeLog } from '@/lib/db';

const RATE_LIMIT_MS = 5 * 60 * 60 * 1000;

const TOOL_TIER_MAP = {
  'script': 'premium',
  'title': 'balanced',
  'tags': 'fast',
  'thumbnail': 'fast',
  'description': 'balanced',
  'idea': 'balanced',
  'hooks': 'balanced',
  'seo': 'premium',
  'hashtag': 'fast',
  'title-gen': 'fast',
  'desc-gen': 'balanced'
};

const FALLBACK_CHAINS = {
  fast: ['openai/gpt-4o-mini', 'google/gemini-2.5-flash', 'meta-llama/llama-3.3-70b-instruct'],
  balanced: ['openai/gpt-4o-mini', 'google/gemini-2.5-flash', 'anthropic/claude-3.5-haiku'],
  premium: ['openai/gpt-4o', 'anthropic/claude-sonnet-4.5', 'google/gemini-2.5-pro']
};

function getModelsForTier(tier) {
  return FALLBACK_CHAINS[tier] || FALLBACK_CHAINS.balanced;
}

async function getOpenRouterKey() {
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
    if (dbKey && typeof dbKey === 'object' && dbKey.value) return String(dbKey.value).trim();
  } catch (e) {}
  return null;
}

function getUserId(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request) {
  const userId = getUserId(request);
  const rateKey = `creator-suite:ai-generate:${userId}`;

  try {
    const lastUsed = await getRateLimitLastUsed(rateKey);
    const now = Date.now();
    if (lastUsed && (now - lastUsed) < RATE_LIMIT_MS) {
      const retryAfterSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastUsed)) / 1000);
      return Response.json({
        error: 'rate_limited',
        message: 'This tool was used recently. Please wait 5 hours before trying again.',
        retry_after_seconds: retryAfterSeconds
      }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } });
    }
  } catch (err) {
    console.warn('Rate limit check failed (allowing):', err.message);
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'invalid_request', message: 'Invalid JSON' }, { status: 400 });
  }

  const { tool, prompt, systemPrompt, language } = body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return Response.json({ error: 'invalid_request', message: 'Prompt is required' }, { status: 400 });
  }

  const apiKey = await getOpenRouterKey();
  if (!apiKey) {
    return Response.json({
      error: 'no_api_key',
      message: 'OpenRouter API key is not configured. Add it in the admin dashboard.'
    }, { status: 503 });
  }

  const tier = TOOL_TIER_MAP[tool] || 'balanced';
  const models = getModelsForTier(tier);
  const errors = [];

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  for (const currentModel of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
          'X-Title': 'Chafiktech AI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature: 0.8,
          max_tokens: 2000
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || errorData.error?.code || response.statusText;
        errors.push(`${currentModel}: ${msg} (${response.status})`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try { await setRateLimitLastUsed(rateKey); } catch (err) {
          console.warn('Failed to record rate limit:', err.message);
        }
        return Response.json({
          success: true,
          result: content,
          model: currentModel,
          language
        });
      }

      errors.push(`${currentModel}: empty response`);
    } catch (err) {
      errors.push(`${currentModel}: ${err.message || 'unknown'}`);
    }
  }

  await writeLog('ERROR', 'Creator suite AI generation failed', { errors: errors.join(' | '), tool });
  return Response.json({
    error: 'generation_failed',
    message: 'Content generation failed. Please try again.'
  }, { status: 503 });
}
