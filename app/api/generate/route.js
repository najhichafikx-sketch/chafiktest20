import { generateAIContent } from '@/lib/openrouter';
import { optionalUser } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { sanitizeInput } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { query } from '@/lib/db';

const limiter = rateLimitMiddleware({ interval: 30000, max: 20 });

const VALID_TOOLS = [
  'seo-article', 'image-to-prompt', 'video-to-prompt', 'tiktok-tools',
  'youtube-suite', 'ai-humanizer', 'prompt-viral', 'prompt-article',
  'ad-copy', 'amazon-listing', 'digital-product', 'digital-product-email',
  'digital-product-name', 'dropshipping-research', 'etsy-listing',
  'landing-page', 'pricing-optimizer', 'product-description',
  'product-idea', 'product-image', 'product-title', 'review-response',
  'sales-copy', 'shopify-seo'
];

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  const user = optionalUser(request);

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const toolId = sanitizeInput(body.toolId || '');
  const input = sanitizeInput(body.input || '');
  const prompt = body.prompt ? sanitizeInput(body.prompt) : null;

  if (!toolId || !VALID_TOOLS.includes(toolId)) {
    return Response.json({ success: false, error: 'Invalid or missing toolId' }, { status: 400 });
  }

  if (!input && !prompt) {
    return Response.json({ success: false, error: 'Input is required' }, { status: 400 });
  }

  await writeLog('INFO', `Generate request for tool: ${toolId}`, {
    user: user?.email || user?.role || 'guest'
  });

  try {
    const fullPrompt = prompt || `You are an expert AI assistant. Complete the task for tool: ${toolId}. Input: ${input}. Provide HTML formatted output, using <h3> and <p> tags appropriately. Do not use markdown backticks in the final output.`;

    let resultText = await generateAIContent({
      prompt: fullPrompt,
      systemPrompt: 'You are a helpful assistant that outputs clean HTML.',
      toolId,
      temperature: 0.7
    });

    resultText = resultText.replace(/^```html/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    if (!resultText) {
      return Response.json({ success: false, error: 'AI returned empty response. Please try again.' }, { status: 500 });
    }

    let generationId = null;
    if (user && user.role !== 'admin') {
      try {
        const gen = await query(
          'INSERT INTO generations (user_id, tool_id, input_text, result_html, model_used) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [user.id, toolId, input, resultText, toolId]
        );
        generationId = gen?.[0]?.id || null;
      } catch {}
    }

    return Response.json({
      success: true,
      html: resultText,
      source: 'api',
      modelUsed: toolId,
      generationId: generationId || Date.now()
    });
  } catch (error) {
    await writeLog('ERROR', `Generation failed for tool: ${toolId}`, { error: error.message });
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
