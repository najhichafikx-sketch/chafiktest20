import { generateAIContent } from '@/lib/openrouter';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ interval: 30000, max: 10 });

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  try {
    const body = await request.json();

    if (body.rewrite) {
      return handleRewrite(body);
    }

    return handleAnalysis(body);
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

async function handleAnalysis(body) {
  const { frames, metadata } = body;
  if (!frames || frames.length === 0) {
    return Response.json({ success: false, error: 'No video frames provided' }, { status: 400 });
  }

  const frameDescriptions = await analyzeFrames(frames, metadata);

  const analysisPrompt = `You are a professional video analyst and prompt engineer. Based on the following video frame analysis, generate 5 types of prompts.

VIDEO METADATA:
- File: ${metadata.fileName}
- Duration: ${Math.round(metadata.duration)}s
- Resolution: ${metadata.width}x${metadata.height}

FRAME ANALYSIS:
${frameDescriptions}

Generate the following prompts. Return as valid JSON (no markdown):

{
  "detailedPrompt": "A detailed, comprehensive prompt describing every visual element, scene composition, lighting, colors, camera angles, subject, and environment. Perfect for recreating the exact style.",
  "shortPrompt": "A concise, punchy prompt (under 100 chars) capturing the essence.",
  "cinematicPrompt": "A dramatic, film-oriented prompt emphasizing camera movements, shot composition, and mood.",
  "imageGenPrompt": "A prompt optimized for Midjourney/DALL-E/Stable Diffusion with style modifiers and technical parameters.",
  "videoGenPrompt": "A prompt optimized for AI video generators (Runway, Pika, Sora) with motion descriptions and temporal details."
}`;

  const result = await generateAIContent({
    prompt: analysisPrompt,
    systemPrompt: 'You are a video analysis expert. Output valid JSON only, no markdown, no backticks. Ensure all JSON keys are exactly as specified.',
    toolId: 'video-to-prompt',
    temperature: 0.4,
    maxTokens: 2000
  });

  let cleaned = result.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    data = extractPromptsFromText(cleaned);
  }

  data.metadata = metadata;
  return Response.json({ success: true, ...data });
}

async function handleRewrite(body) {
  const { originalPrompt, metadata } = body;

  const rewritePrompt = `You are a creative prompt engineer. Rewrite the following prompt to create 3 unique alternative versions.

Original Prompt:
${originalPrompt}

Requirements:
- Preserve the original idea and visual concept
- Reduce similarity between versions
- Improve prompt quality with better descriptive language
- Make each version distinct in style and approach

Return as valid JSON (no markdown):
{
  "version1": "First rewritten version - focus on photographic realism",
  "version2": "Second rewritten version - focus on artistic/creative interpretation",
  "version3": "Third rewritten version - focus on cinematic/dramatic elements"
}`;

  const result = await generateAIContent({
    prompt: rewritePrompt,
    systemPrompt: 'You are a prompt engineering expert. Output valid JSON only, no markdown, no backticks.',
    toolId: 'video-to-prompt',
    temperature: 0.8,
    maxTokens: 1500
  });

  let cleaned = result.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    data = {
      version1: cleaned.substring(0, 300),
      version2: cleaned.substring(300, 600),
      version3: cleaned.substring(600, 900)
    };
  }

  data.metadata = metadata;
  return Response.json({ success: true, ...data });
}

async function analyzeFrames(frames, metadata) {
  const descriptions = [];

  for (let i = 0; i < frames.length; i++) {
    const frameAnalysis = await generateAIContent({
      prompt: `Analyze this video frame (frame ${i + 1} of ${frames.length}, at ~${Math.round(i * metadata.duration / frames.length)}s). Describe in detail:
1. Scene type and setting
2. Camera angle (eye-level, low, high, dutch, etc.)
3. Lighting (natural, artificial, backlit, diffused, etc.)
4. Dominant colors and color palette
5. Visual style (cinematic, documentary, vlog, etc.)
6. Subject and environment
7. Composition (rule of thirds, symmetry, leading lines, etc.)
8. Mood and atmosphere

Keep descriptions concise but detailed.`,
      systemPrompt: 'You are a professional video analyst. Analyze the frame and describe it in detail.',
      toolId: 'video-to-prompt',
      temperature: 0.3,
      maxTokens: 500,
      imageBase64: frames[i].split(',')[1],
      imageMimeType: 'image/jpeg'
    });
    descriptions.push(`Frame ${i + 1} (${Math.round(i * metadata.duration / frames.length)}s): ${frameAnalysis}`);
  }

  return descriptions.join('\n\n');
}

function extractPromptsFromText(text) {
  const prompts = {
    detailedPrompt: '',
    shortPrompt: '',
    cinematicPrompt: '',
    imageGenPrompt: '',
    videoGenPrompt: ''
  };

  const labels = {
    detailedPrompt: ['detailed', 'detailed prompt', 'detailed ai prompt'],
    shortPrompt: ['short', 'short prompt'],
    cinematicPrompt: ['cinematic', 'cinematic prompt'],
    imageGenPrompt: ['image', 'image gen', 'image generation'],
    videoGenPrompt: ['video', 'video gen', 'video generation']
  };

  let currentKey = null;
  const lines = text.split('\n');
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    for (const [key, aliases] of Object.entries(labels)) {
      if (aliases.some(a => lower.includes(a) && (lower.includes(':') || lower.includes('prompt') || lower.includes('generation')))) {
        currentKey = key;
        break;
      }
    }
    if (currentKey) {
      prompts[currentKey] += line.replace(/^(Detailed|Short|Cinematic|Image|Video).*?:/i, '').trim() + '\n';
    }
  }

  Object.keys(prompts).forEach(k => {
    prompts[k] = prompts[k].trim().replace(/^["']|["']$/g, '');
  });

  return prompts;
}
