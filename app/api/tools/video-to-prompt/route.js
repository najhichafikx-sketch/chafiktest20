import { generateAIContent } from '@/lib/openrouter';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ interval: 60000, max: 5 });

const FRAME_ANALYSIS_PROMPT = `Analyze this video frame with extreme professional detail. Cover every element below:

1. SCENE TYPE: Interior/exterior, specific location/setting, time of day
2. CAMERA: Angle (eye-level/low/high/dutch/aerial/overhead), movement (static/pan/tilt/dolly/tracking/steadicam/handheld/gimbal), shot size (wide/medium/close-up/extreme-close-up/macro)
3. LIGHTING: Type (natural/artificial/mixed/hard/soft/diffused/neon/practical), direction (front/back/side/top/bottom/rim), key/fill/backlight setup, shadows quality
4. COLORS: Dominant colors (hex references if obvious), color palette, temperature (warm/cool/neutral/teal-orange), saturation level, contrast ratio, any color grading style
5. COMPOSITION: Rule of thirds, symmetry, leading lines, framing devices, foreground/midground/background layering, depth, negative space, focal point
6. SUBJECT: Description, age range, gender, ethnicity, clothing/style, facial expression, eye direction, body language, position in frame
7. ENVIRONMENT: Background elements, props, textures, materials, architecture style, nature, vegetation, water, sky, weather conditions
8. MOOD & ATMOSPHERE: Emotional tone, tension level, serenity, energy, mystery, romance, horror, nostalgia, intensity
9. VISUAL STYLE: Cinematic, documentary, vlog, commercial, film noir, vintage, retro, futuristic, naturalistic, surreal, animation style
10. LENS & OPTICAL: Focal length estimate (wide/normal/telephoto), depth of field (shallow/medium/deep), focus type, lens flares, chromatic aberration, bokeh quality, distortion, anamorphic traits
11. MOTION DYNAMICS: Visible motion (subject motion/camera motion/object motion), motion blur amount and direction
12. TEXTURES & DETAILS: Surface textures, skin detail, fabric weave, environmental detail level
13. SPECIAL EFFECTS: VFX, CGI, compositing, filters, color overlays, grain, vignette, glows, particle effects

Format as concise bullet points per category. Be specific and measurable.`;

const PROMPT_GENERATION_SYSTEM = `You are the world's best prompt engineer and cinematographer. Based on the video frame analysis below, generate 6 highly detailed prompts for AI video generators.

Each prompt must be extremely detailed (500-1500 words) and include:
- Scene description with setting and atmosphere
- Subject description with appearance and expression
- Environment and background details
- Camera movement and angle specifications
- Lens information (focal length, depth of field)
- Lighting setup (key, fill, backlight)
- Color grading and palette
- Mood and emotional tone
- Visual effects and transitions
- Composition and framing
- Motion dynamics and speed
- Atmosphere and environmental details
- Video style and genre
- Cinematic techniques used
- Frame-by-frame progression
- Audio suggestions (music style, sound effects, voice)

Return ONLY valid JSON with no markdown, no backticks. Use this exact structure:

{
  "universalPrompt": "...",
  "veoPrompt": "...",
  "klingPrompt": "...",
  "runwayPrompt": "...",
  "cinematicDirectorPrompt": "...",
  "negativePrompt": "..."
}`;

const UNIVERSAL_INSTRUCTION = `Generate the UNIVERSAL PROMPT — a complete, versatile master prompt that works with any AI video generator (Veo, Kling, Runway, Pika, Hailuo, Luma, Sora). Include every visual and technical detail needed to recreate the video as closely as possible.`;

const VEO_INSTRUCTION = `Generate the GOOGLE VEO PROMPT — optimized specifically for Google Veo 2. Use Veo-friendly language: describe motion naturally, focus on realistic physics, natural lighting transitions, and temporal coherence. Include camera movement descriptions that Veo handles well (smooth pans, dolly shots, tracking). Avoid abstract concepts.`;

const KLING_INSTRUCTION = `Generate the KLING PROMPT — optimized for Kling 1.6. Kling excels at complex motion, so emphasize: dramatic camera movements, character actions, particle effects, weather dynamics, and physical interactions between elements. Use vivid action verbs. Include duration-specific descriptions.`;

const RUNWAY_INSTRUCTION = `Generate the RUNWAY PROMPT — optimized for Runway Gen-3. Use Runway's preferred syntax: clear subject-action-environment structure. Emphasize cinematic lighting, lens effects, film grain, and professional camera work. Runway handles style transfers well, so include reference styles.`;

const CINEMATIC_INSTRUCTION = `Generate the CINEMATIC DIRECTOR PROMPT — written as if by a professional film director. Break down the video into a shot-by-shot sequence with specific camera instructions for each shot. Include: shot type, camera angle, lens, movement, duration, action, and transition to next shot. Reference specific films or directors for style guidance.`;

const NEGATIVE_INSTRUCTION = `Generate the NEGATIVE PROMPT — what the AI should avoid. List visual artifacts, unwanted styles, common AI video issues (flickering, morphing, inconsistent faces, physics violations), and any elements that would reduce quality or similarity to the original.`;

async function analyzeFrames(frames, metadata) {
  const descriptions = [];
  for (let i = 0; i < frames.length; i++) {
    const timeMark = Math.round(i * (metadata.duration || 0) / frames.length);
    try {
      const analysis = await generateAIContent({
        prompt: `Frame ${i + 1} of ${frames.length} at ${timeMark}s.\n\n${FRAME_ANALYSIS_PROMPT}`,
        systemPrompt: 'You are an expert cinematographer and video analyst. Analyze this frame with extreme detail.',
        model: 'google/gemini-2.5-pro',
        imageBase64: frames[i].data.split(',')[1],
        imageMimeType: 'image/jpeg',
        toolId: 'video-to-prompt',
        temperature: 0.2,
        maxTokens: 1200
      });
      descriptions.push(`=== FRAME ${i + 1} (${timeMark}s) ===\n${analysis}`);
    } catch (err) {
      descriptions.push(`=== FRAME ${i + 1} (${timeMark}s) ===\n[Analysis unavailable: ${err.message}]`);
    }
  }
  return descriptions.join('\n\n');
}

async function generatePrompts(frameAnalysis, metadata, ultraDetailed) {
  const frameCount = metadata.frameCount || 0;
  const promptBody = `VIDEO METADATA:
- File: ${metadata.fileName}
- Duration: ${Math.round(metadata.duration || 0)}s
- Resolution: ${metadata.width}x${metadata.height}
- Frames Analyzed: ${frameCount}
- Analysis Mode: ${ultraDetailed ? 'Ultra Detailed' : 'Standard'}

COMPREHENSIVE FRAME ANALYSIS:
${frameAnalysis}

Generate all 6 prompts now.

${UNIVERSAL_INSTRUCTION}

${VEO_INSTRUCTION}

${KLING_INSTRUCTION}

${RUNWAY_INSTRUCTION}

${CINEMATIC_INSTRUCTION}

${NEGATIVE_INSTRUCTION}

Follow the exact JSON structure specified.`;

  const result = await generateAIContent({
    prompt: promptBody,
    systemPrompt: PROMPT_GENERATION_SYSTEM,
    toolId: 'video-to-prompt',
    temperature: ultraDetailed ? 0.5 : 0.4,
    maxTokens: 4096
  });

  const cleaned = result.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    return null;
  }
}

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  try {
    const body = await request.json();
    const { frames, metadata = {}, ultraDetailed = false } = body;

    if (!frames || frames.length === 0) {
      return Response.json({ success: false, error: 'No video frames provided' }, { status: 400 });
    }

    metadata.frameCount = frames.length;

    const frameAnalysis = await analyzeFrames(frames, metadata);

    const prompts = await generatePrompts(frameAnalysis, metadata, ultraDetailed);

    if (!prompts) {
      return Response.json({ success: false, error: 'Failed to generate prompts from analysis. Try again.' }, { status: 422 });
    }

    return Response.json({
      success: true,
      metadata,
      frameAnalysis,
      universalPrompt: prompts.universalPrompt || '',
      veoPrompt: prompts.veoPrompt || '',
      klingPrompt: prompts.klingPrompt || '',
      runwayPrompt: prompts.runwayPrompt || '',
      cinematicDirectorPrompt: prompts.cinematicDirectorPrompt || '',
      negativePrompt: prompts.negativePrompt || ''
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
