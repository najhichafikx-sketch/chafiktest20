import { generateAIContent } from '@/lib/openrouter';
import { optionalUser } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { sanitizeInput } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { query } from '@/lib/db';

const limiter = rateLimitMiddleware({ interval: 30000, max: 20 });

const TOOL_PROMPTS = {
  'viral-ideas': 'You are a YouTube viral content strategist. Generate 5-7 unique viral video ideas based on the input topic. For each idea include: title, hook angle, target audience, viral potential (1-10), and why it works. Format as HTML with <h3> for each idea, <p> for details, and a score badge.',
  'youtube-title': 'You are a YouTube title optimization expert. Generate 5+ optimized titles for the given video topic. Include: SEO titles (60 chars max), clickable titles, and Shorts titles. Also explain why each title works. Output in HTML with <h3> categories and <p> explanations.',
  'viral-hook': 'You are a viral hook specialist. Generate 3 scroll-stopping hooks for each duration: first 5 seconds, first 15 seconds, and full hook. Each hook must create curiosity and demand attention. Format as HTML with <h3> for each duration type.',
  'youtube-script': 'You are a YouTube script writer. Write a complete video script based on the input topic and format choice (Shorts/long-form/faceless). Include: hook section, main content with bullet points, transition phrases, and CTA. Format as clean HTML with <h3> sections.',
  'thumbnail-prompt': 'You are a YouTube thumbnail design expert. Generate detailed AI thumbnail prompts that include: subject positioning, color palette, composition rules, emotional expression, text overlay suggestions, and visual style. Output as HTML with labeled sections.',
  'youtube-description': 'You are a YouTube SEO description writer. Generate an SEO-optimized description including: first 2 lines with keywords, full description with timestamps, 3-5 hashtags, relevant keywords list, and a strong CTA. Format as HTML.',
  'youtube-tags': 'You are a YouTube tag strategy expert. Generate a comprehensive tag list including: primary keywords (high volume), secondary keywords, long-tail tags, and related topics. Categorize by search intent. Output as HTML.',
  'youtube-seo': 'You are a YouTube SEO analyzer. Analyze the provided title and description. Return: overall SEO score (0-100), title analysis with suggestions, keyword optimization tips, tag recommendations, description improvements, and engagement optimization tips. Format as HTML with score visual.',
  'faceless-video': 'You are a faceless video content creator. Generate a complete faceless video package: full script, voiceover prompt (tone, pace, emphasis), visual prompts for each scene, B-roll suggestions, and background music recommendations. Format as HTML sections.',
  'viral-shorts': 'You are a YouTube Shorts expert. Generate viral-optimized Shorts scripts for 30s, 45s, and 60s durations. Each must have: lightning hook, fast pacing, pattern interrupts, and strong retention techniques. Format as HTML with duration headers.',
  'storytelling-script': 'You are a narrative script writer for YouTube storytelling channels. Write a compelling script using the Hero\s Journey or Three-Act structure. Include: cold open, rising tension, climax, resolution. Adapt to the chosen channel type (history/mystery/documentary/educational). Format as HTML.',
  'community-post': 'You are a YouTube community engagement specialist. Generate engaging community posts including: polls with 4 options, discussion starters, behind-the-scenes content, and announcement posts. Each must encourage comments and interaction. Format as HTML.',
  'comment-reply': 'You are a YouTube community manager. Generate professional, engaging replies to YouTube comments. Adapt tone based on selection (professional/friendly/humorous/educational). Each reply should build community and encourage further discussion. Format as HTML.',
  'video-repurposer': 'You are a content repurposing strategist. Convert video content into 4 formats: blog article (800+ words with headings), Twitter/X thread (15-20 tweets with hooks), Instagram post (caption + 5 slides description), LinkedIn post (professional, thought-leadership style). Format as HTML with format headers.'
};

const VALID_TOOLS = [
  'seo-article', 'image-to-prompt', 'video-to-prompt', 'tiktok-tools',
  'youtube-suite', 'ai-humanizer', 'prompt-viral', 'prompt-article',
  'ad-copy', 'amazon-listing', 'digital-product', 'digital-product-email',
  'digital-product-name', 'dropshipping-research', 'etsy-listing',
  'landing-page', 'pricing-optimizer', 'product-description',
  'product-idea', 'product-image', 'product-title', 'review-response',
  'sales-copy', 'shopify-seo',
  'viral-ideas', 'youtube-title', 'viral-hook', 'youtube-script',
  'thumbnail-prompt', 'youtube-description', 'youtube-tags', 'youtube-seo',
  'faceless-video', 'viral-shorts', 'storytelling-script', 'community-post',
  'comment-reply', 'video-repurposer'
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
    const toolPrompt = TOOL_PROMPTS[toolId];
    const fullPrompt = prompt || (toolPrompt
      ? `${toolPrompt}\n\nInput: ${input}`
      : `You are an expert AI assistant. Complete the task for tool: ${toolId}. Input: ${input}. Provide HTML formatted output, using <h3> and <p> tags appropriately. Do not use markdown backticks in the final output.`);

    const systemPrompt = toolPrompt
      ? 'You are a specialized YouTube creator AI assistant. Output clean HTML only, no markdown.'
      : 'You are a helpful assistant that outputs clean HTML.';

    let resultText = await generateAIContent({
      prompt: fullPrompt,
      systemPrompt,
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
