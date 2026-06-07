import { query, getSetting } from './db';

const FALLBACK_CHAINS = {
  fast: ['openai/gpt-4o-mini', 'google/gemini-2.5-flash', 'meta-llama/llama-3.3-70b-instruct'],
  balanced: ['openai/gpt-4o-mini', 'google/gemini-2.5-flash', 'anthropic/claude-3.5-haiku'],
  premium: ['openai/gpt-4o', 'anthropic/claude-sonnet-4.5', 'google/gemini-2.5-pro']
};

const TOOL_TIER_MAP = {
  'seo-article': 'premium',
  'landing-page': 'premium',
  'sales-copy': 'premium',
  'image-to-prompt': 'premium',
  'seo-titles': 'balanced',
  'keyword-optimizer': 'balanced',
  'shopify-seo': 'balanced',
  'ad-copy': 'balanced',
  'product-description': 'balanced',
  'youtube-suite': 'balanced',
  'tiktok-tools': 'balanced',
  'ai-humanizer': 'balanced',
  'review-response': 'balanced',
  'etsy-listing': 'balanced',
  'amazon-listing': 'balanced',
  'digital-product': 'balanced',
  'digital-product-email': 'fast',
  'digital-product-name': 'fast',
  'ai-digital-creator': 'balanced',
  'dropshipping-research': 'fast',
  'pricing-optimizer': 'fast',
  'product-idea': 'fast',
  'product-title': 'fast',
  'product-image': 'fast',
  'prompt-viral': 'fast',
  'prompt-article': 'fast',
  'viral-ideas': 'balanced',
  'youtube-title': 'fast',
  'viral-hook': 'balanced',
  'youtube-script': 'premium',
  'thumbnail-prompt': 'fast',
  'youtube-description': 'fast',
  'youtube-tags': 'fast',
  'youtube-seo': 'balanced',
  'faceless-video': 'premium',
  'viral-shorts': 'balanced',
  'storytelling-script': 'premium',
  'community-post': 'fast',
  'comment-reply': 'fast',
  'video-repurposer': 'premium'
};

async function getApiKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY;
  try {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(process.cwd(), 'data', 'keys.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.openrouter_api_key) {
        process.env.OPENROUTER_API_KEY = data.openrouter_api_key;
        return data.openrouter_api_key;
      }
    }
  } catch (e) {}
  try {
    const dbKey = await getSetting('openrouter_api_key');
    if (dbKey && typeof dbKey === 'string' && dbKey.trim()) {
      return dbKey.trim();
    }
    if (dbKey && typeof dbKey === 'object' && dbKey.value) {
      return String(dbKey.value).trim();
    }
  } catch (e) {}
  return null;
}

function getModelsForTool(toolId, customModel) {
  if (customModel) return [customModel, ...FALLBACK_CHAINS.balanced];
  const tier = TOOL_TIER_MAP[toolId] || 'fast';
  return FALLBACK_CHAINS[tier] || FALLBACK_CHAINS.fast;
}

export async function generateAIContent({
  prompt, systemPrompt, model, temperature = 0.7, maxTokens = 1500,
  imageBase64 = null, imageMimeType = null, toolId = ''
}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('AI feature not configured yet. Please set the OpenRouter API key in the admin dashboard.');
  }

  const models = getModelsForTool(toolId, model);
  const errors = [];

  for (const currentModel of models) {
    try {
      const messages = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      if (imageBase64 && imageMimeType) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } }
          ]
        });
      } else {
        messages.push({ role: 'user', content: prompt });
      }

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
          temperature,
          max_tokens: maxTokens
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
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }

      errors.push(`${currentModel}: empty response`);
    } catch (err) {
      errors.push(`${currentModel}: ${err.message || 'unknown'}`);
      continue;
    }
  }

  throw new Error(`All models failed. Tried: ${errors.join(' | ')}`);
}

export async function testApiKey(apiKey) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10000)
    });
    if (response.ok) return { ok: true };
    let body = {};
    try { body = await response.json(); } catch {}
    return {
      ok: false,
      status: response.status,
      message: body?.error?.message || body?.message || `OpenRouter error (${response.status})`
    };
  } catch (e) {
    return { ok: false, status: 0, message: e.message || 'Network error' };
  }
}