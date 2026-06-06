import { verifyAdmin } from '@/lib/auth';
import { getToolSettings, saveToolSetting, writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 30 });

const ALL_TOOLS = [
  'seo-article-generator', 'image-to-prompt', 'video-to-prompt', 'tiktok-tools',
  'youtube-suite', 'ai-humanizer', 'prompt-viral', 'prompt-article',
  'ad-copy-generator', 'amazon-listing-generator', 'digital-product-creator',
  'digital-product-email-writer', 'digital-product-name-generator', 'dropshipping-research',
  'etsy-listing-generator', 'landing-page-generator', 'pricing-optimizer',
  'product-description-generator', 'product-idea-finder', 'product-image-enhancer',
  'product-title-generator', 'review-response-generator', 'sales-copy-generator',
  'shopify-seo-generator'
];

const MODELS = [
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
  'google/gemini-2.5-flash',
  'google/gemini-2.5-pro',
  'anthropic/claude-3.5-haiku',
  'anthropic/claude-sonnet-4.5',
  'anthropic/claude-haiku-4.5',
  'meta-llama/llama-3.3-70b-instruct'
];

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dbSettings = await getToolSettings();
    const settingsMap = {};
    if (dbSettings) {
      for (const s of dbSettings) settingsMap[s.tool_id] = s;
    }

    const tools = ALL_TOOLS.map(id => ({
      tool_id: id,
      enabled: settingsMap[id]?.enabled ?? true,
      model: settingsMap[id]?.model || 'openai/gpt-4o-mini',
      system_prompt: settingsMap[id]?.system_prompt || ''
    }));

    return Response.json({ success: true, tools, availableModels: MODELS });
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

  const { tool_id, enabled, model, system_prompt } = body;
  if (!tool_id || !ALL_TOOLS.includes(tool_id)) {
    return Response.json({ success: false, message: 'Invalid tool_id' }, { status: 400 });
  }

  try {
    await saveToolSetting(tool_id, { enabled, model, system_prompt });
    await writeLog('INFO', `Tool setting updated: ${tool_id}`, { enabled, model });
    return Response.json({ success: true, message: 'Tool setting saved' });
  } catch {
    return Response.json({ success: false, message: 'Save failed' }, { status: 500 });
  }
}
