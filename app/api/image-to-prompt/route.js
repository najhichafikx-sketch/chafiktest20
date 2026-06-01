import { generateAIContent } from '@/lib/openrouter';
import { optionalUser } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ interval: 60000, max: 10 });

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  const user = optionalUser(request);

  let formData;
  try { formData = await request.formData(); } catch {
    return Response.json({ success: false, error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('image');

  if (!file) {
    return Response.json({ success: false, error: 'No image provided' }, { status: 400 });
  }

  if (!ALLOWED_MIMES.includes(file.type)) {
    return Response.json({ success: false, error: 'Invalid file type. Accepted: JPEG, PNG, WebP, GIF' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ success: false, error: 'File too large. Maximum 10MB' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString('base64');
    const mimeType = file.type;

    const systemPrompt = `You are an expert AI prompt engineer for image generation models like Midjourney, DALL-E, and Stable Diffusion.
Analyze the provided image and generate an ultra-professional, highly detailed prompt.
Respond ONLY with the final prompt text. No introductory or concluding remarks.`;

    const generatedPrompt = await generateAIContent({
      prompt: 'Analyze this image and create a prompt for it.',
      systemPrompt,
      model: 'openai/gpt-4o',
      maxTokens: 300,
      imageBase64: base64Image,
      imageMimeType: mimeType,
      toolId: 'image-to-prompt'
    });

    return Response.json({
      success: true,
      prompt: generatedPrompt,
      generationId: Date.now()
    });
  } catch (error) {
    await writeLog('ERROR', 'Image to prompt generation failed', { error: error.message });
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
