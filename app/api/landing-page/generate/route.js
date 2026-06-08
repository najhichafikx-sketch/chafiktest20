import { generateAIContent } from '@/lib/openrouter';
import { writeLog, getLPRateLimit, setLPRateLimit, getSetting } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const RATE_LIMIT_MS = 5 * 60 * 60 * 1000;
const FRIENDLY_UNAVAILABLE = 'Service temporarily unavailable. Please try again later.';

const LP_CONFIG_FILE = path.join(process.cwd(), 'data', 'lp-config.json');

async function readJsonSafe(filePath, fallback = {}) {
  try { const buf = await fs.readFile(filePath, 'utf8'); return JSON.parse(buf); }
  catch { return fallback; }
}

async function getSelectedModel() {
  try {
    const stored = await getSetting('landing_page_model');
    if (stored && typeof stored === 'string' && stored.trim()) return stored.trim();
    if (stored && typeof stored === 'object' && stored.value) return String(stored.value).trim();
  } catch {}
  try { const cfg = await readJsonSafe(LP_CONFIG_FILE, {}); if (cfg?.model) return cfg.model; } catch {}
  return 'openai/gpt-4o';
}

function getSessionId(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)lp_sid=([^;]+)/);
  if (match) return match[1];
  const bodyId = request.headers.get('x-lp-session');
  if (bodyId) return bodyId;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

function sanitize(str) { return String(str || '').trim(); }

function buildPromptBody(data) {
  const {
    productName, serviceName, businessName, websiteName, description,
    targetAudience, industry, language, ctaText, toneOfVoice,
    competitorUrls, conversionMode, monetizationFeatures
  } = data;

  return `PRODUCT/SERVICE DETAILS:
Product/Service Name: ${sanitize(productName || serviceName || businessName || websiteName)}
Business Name: ${sanitize(businessName)}
Website: ${sanitize(websiteName)}
Description: ${sanitize(description)}
Industry: ${sanitize(industry || 'General')}
Target Audience: ${sanitize(targetAudience || 'General')}
Tone of Voice: ${sanitize(toneOfVoice || 'Professional')}
Primary CTA: ${sanitize(ctaText || 'Get Started')}
Competitor URLs: ${sanitize(competitorUrls || 'None')}
Conversion Optimization Mode: ${conversionMode ? 'Enabled (AIDA + PAS + StoryBrand frameworks)' : 'Standard'}
Monetization Features: ${monetizationFeatures ? 'Include email capture, lead magnet, pricing table, affiliate section, newsletter signup, social proof blocks' : 'Standard sections only'}
`;
}

const RESEARCH_SYSTEM = `You are a senior marketing strategist and conversion copywriter. Analyze the provided business details and generate a comprehensive market analysis and persuasive copy.

Return ONLY valid JSON with this exact structure:
{
  "research": {
    "industry": "Industry name",
    "audience": "Target audience description",
    "valueProposition": "Compelling value proposition",
    "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
    "desires": ["Desire 1", "Desire 2", "Desire 3"],
    "marketPositioning": "Market positioning statement",
    "conversionGoals": ["Goal 1", "Goal 2"]
  },
  "copy": {
    "headline": "Powerful headline",
    "subheadline": "Supporting subheadline",
    "heroDescription": "2-3 sentence hero description",
    "benefits": [{"icon":"🚀","title":"Benefit 1","description":"..."}, {"icon":"💡","title":"Benefit 2","description":"..."}, {"icon":"⚡","title":"Benefit 3","description":"..."}],
    "features": [{"title":"Feature 1","description":"..."}, {"title":"Feature 2","description":"..."}, {"title":"Feature 3","description":"..."}, {"title":"Feature 4","description":"..."}],
    "howItWorks": [{"step":1,"title":"Step 1","description":"..."}, {"step":2,"title":"Step 2","description":"..."}, {"step":3,"title":"Step 3","description":"..."}],
    "testimonials": [{"name":"Alex R.","role":"CEO, Company","quote":"..."}, {"name":"Sarah M.","role":"Founder, Co","quote":"..."}, {"name":"David K.","role":"Marketing Director","quote":"..."}],
    "faq": [{"question":"...","answer":"..."}, {"question":"...","answer":"..."}, {"question":"...","answer":"..."}, {"question":"...","answer":"..."}],
    "ctaSection": {"headline":"Final CTA headline","subheadline":"Final CTA subheadline","buttonText":"CTA button text"}
  },
  "seo": {
    "title": "SEO title (under 60 chars)",
    "description": "Meta description (under 160 chars)",
    "keywords": "keyword1, keyword2, keyword3",
    "ogTitle": "Open Graph title",
    "ogDescription": "Open Graph description",
    "twitterCard": "Twitter card description"
  },
  "imagePrompts": [
    {"type":"hero","prompt":"Detailed Midjourney/Flux prompt for hero image"},
    {"type":"feature","prompt":"Prompt for feature illustration"},
    {"type":"testimonial","prompt":"Prompt for testimonial background"}
  ]
}

Make copy persuasive, benefit-driven, and tailored to the target audience.`;

const HTML_GENERATION_SYSTEM = `You are a senior frontend developer specializing in high-converting SaaS landing pages. Generate a complete, production-ready HTML5 document.

REQUIREMENTS:
- Self-contained HTML5 with inline CSS
- Mobile-first responsive design (works on 360px to 1920px)
- Modern SaaS aesthetic with clean spacing, professional typography, and premium feel
- Import Inter or system font from Google Fonts
- Dark mode by default with the specified primary color
- Smooth scroll, subtle animations, and hover effects
- Include all sections in order: Hero → Benefits → Features → How It Works → Testimonials → FAQ → Final CTA → Footer
- Each section must have actual content (not placeholders)
- Testimonial cards with star ratings
- FAQ with accordion/interactive style
- Footer with links and social placeholders
- Use CSS Grid and Flexbox for layout
- Add schema.org structured data (JSON-LD) in head
- Add proper meta tags for SEO
- Optimized for Core Web Vitals

OUTPUT ONLY the HTML. No markdown fences. No commentary. Start directly with <!DOCTYPE html>.`;

export async function POST(request) {
  const userId = getSessionId(request);

  try {
    const { lastUsed, found } = await getLPRateLimit(userId);
    const now = Date.now();
    if (found && lastUsed && (now - lastUsed) < RATE_LIMIT_MS) {
      const retryAfterSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastUsed)) / 1000);
      await writeLog('INFO', `Landing page rate limit hit for ${userId}`, { retryAfterSeconds });
      return Response.json({ error: 'rate_limited', message: FRIENDLY_UNAVAILABLE, retry_after_seconds: retryAfterSeconds },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } });
    }
  } catch (err) {
    console.warn('LP rate limit check failed:', err.message);
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'invalid_request', message: FRIENDLY_UNAVAILABLE }, { status: 400 });
  }

  const {
    productName, serviceName, businessName, websiteName, description,
    targetAudience, industry, language = 'en', ctaText = 'Get Started',
    primaryColor = '#6D28D9', contactInfo = {}, socialLinks = {}, imageUrls = [],
    toneOfVoice = 'Professional', competitorUrls = '',
    conversionMode = false, monetizationFeatures = false
  } = body || {};

  if (!productName && !serviceName) {
    return Response.json({ error: 'invalid_request', message: 'Product or service name is required' }, { status: 400 });
  }

  const langNames = { ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', tr: 'Turkish', de: 'German' };
  const langName = langNames[language] || 'English';
  const isRtl = language === 'ar';

  const socialLine = Object.entries(socialLinks || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('; ');
  const contactLine = Object.entries(contactInfo || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('; ');

  const model = await getSelectedModel();

  try {
    // Step 1: Research + Copy + SEO + Image Prompts
    const researchInput = buildPromptBody({ productName, serviceName, businessName, websiteName, description, targetAudience, industry, language, ctaText, toneOfVoice, competitorUrls, conversionMode, monetizationFeatures });

    const researchRaw = await generateAIContent({
      prompt: `${researchInput}\n\nLanguage: ${langName}\n${isRtl ? 'Generate all copy in Arabic (العربية).' : 'Generate all copy in English.'}`,
      systemPrompt: RESEARCH_SYSTEM,
      toolId: 'landing-page',
      model,
      temperature: 0.7,
      maxTokens: 4000
    });

    let researchData;
    const cleaned = researchRaw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    try { researchData = JSON.parse(cleaned); } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) { try { researchData = JSON.parse(match[0]); } catch {} }
    }

    if (!researchData || !researchData.copy) {
      return Response.json({ error: 'generation_failed', message: FRIENDLY_UNAVAILABLE }, { status: 503 });
    }

    // Step 2: Generate HTML
    const sectionsData = researchData.copy;
    const htmlPrompt = `Build a complete landing page for: ${productName || serviceName}

BUSINESS: ${sanitize(businessName || productName || serviceName)}
INDUSTRY: ${sanitize(industry || 'General')}
TARGET AUDIENCE: ${sanitize(targetAudience || 'General')}

COPY:
Headline: ${sectionsData.headline}
Subheadline: ${sectionsData.subheadline}
Hero Description: ${sectionsData.heroDescription}

Benefits:
${(sectionsData.benefits || []).map(b => `- ${b.icon} ${b.title}: ${b.description}`).join('\n')}

Features:
${(sectionsData.features || []).map(f => `- ${f.title}: ${f.description}`).join('\n')}

How It Works:
${(sectionsData.howItWorks || []).map(h => `- Step ${h.step}: ${h.title} - ${h.description}`).join('\n')}

Testimonials:
${(sectionsData.testimonials || []).map(t => `- ${t.name} (${t.role}): "${t.quote}"`).join('\n')}

FAQ:
${(sectionsData.faq || []).map(f => `- Q: ${f.question} | A: ${f.answer}`).join('\n')}

CTA Section: ${sectionsData.ctaSection?.headline} - ${sectionsData.ctaSection?.subheadline} - ${sectionsData.ctaSection?.buttonText}

DESIGN SPECS:
- Primary Color: ${primaryColor}
- Language: ${langName}${isRtl ? ' (RTL)' : ' (LTR)'}
- Tone: ${toneOfVoice}
${conversionMode ? '- Use AIDA (Attention-Interest-Desire-Action) and PAS (Problem-Agitate-Solution) frameworks throughout' : ''}
- Mobile-first responsive
- Modern SaaS dark theme with ${primaryColor} as accent

CONTACT:
${contactLine || 'N/A'}

SOCIAL LINKS:
${socialLine || 'N/A'}

IMAGES (use these URLs in the hero section):
${(imageUrls || []).slice(0, 5).join('\n') || 'Use gradient/SVG placeholders'}

${monetizationFeatures ? `
INCLUDE MONETIZATION SECTIONS:
1. Email capture form in hero/CTA
2. Lead magnet section (free guide/trial)
3. Pricing table with 3 tiers
4. Affiliate/referral section
5. Newsletter signup in footer
6. Social proof counters (users, revenue, etc.)
` : ''}

Generate a complete, production-ready HTML5 document. Start with <!DOCTYPE html>.`;

    const htmlRaw = await generateAIContent({
      prompt: htmlPrompt,
      systemPrompt: HTML_GENERATION_SYSTEM,
      toolId: 'landing-page',
      model,
      temperature: 0.5,
      maxTokens: 8192
    });

    let html = String(htmlRaw).trim();
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    // Step 3: Generate React & Next.js versions
    let reactCode = '';
    let nextjsCode = '';
    let tailwindHtml = '';

    const codeGenPrompt = `Convert this HTML landing page into three formats. Return ONLY valid JSON.

HTML SOURCE (landing page for ${productName || serviceName}):
${html.slice(0, 3000)}

Generate:
1. "react": A React functional component version (JSX) of the hero + benefits section (keep inline styles or CSS-in-JS)
2. "nextjs": A Next.js client component version with 'use client' directive, export default function, include metadata export
3. "tailwind": Rewrite the hero section using TailwindCSS classes

Return JSON:
{"react":"...","nextjs":"...","tailwind":"..."}`;

    try {
      const codeRaw = await generateAIContent({
        prompt: codeGenPrompt,
        systemPrompt: 'You are a senior React/Next.js developer. Output only valid JSON.',
        toolId: 'landing-page',
        model,
        temperature: 0.3,
        maxTokens: 4000
      });
      let codeCleaned = codeRaw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      try {
        const codeData = JSON.parse(codeCleaned);
        reactCode = codeData.react || '';
        nextjsCode = codeData.nextjs || '';
        tailwindHtml = codeData.tailwind || '';
      } catch {}
    } catch (err) {
      console.warn('Code generation failed (non-critical):', err.message);
    }

    try { await setLPRateLimit(userId); } catch (err) {
      console.warn('Failed to record LP rate limit:', err.message);
    }

    return Response.json({
      success: true,
      html,
      react: reactCode,
      nextjs: nextjsCode,
      tailwind: tailwindHtml,
      copy: researchData.copy,
      research: researchData.research || {},
      seo: researchData.seo || {},
      imagePrompts: researchData.imagePrompts || [],
      model,
      language,
      primaryColor,
      conversionMode,
      monetizationFeatures
    });
  } catch (error) {
    await writeLog('ERROR', 'Landing page generation failed', { error: error.message });
    return Response.json({ error: 'generation_failed', message: FRIENDLY_UNAVAILABLE }, { status: 503 });
  }
}
