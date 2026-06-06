import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

const SYSTEM_PROMPT = "You are a professional SEO expert. Always respond in English with clear, structured, actionable information. Format your output with proper sections, bullet points, and code blocks where needed.";

const PROMPTS = {
  ranking: ({ url, keyword }) => `Analyze the SEO ranking potential of the website "${url}" for the keyword "${keyword}". Provide: estimated ranking difficulty (Easy/Medium/Hard), key ranking factors to improve, top 5 actionable recommendations to rank higher, and a brief competitive analysis. Format with clear sections and bullet points.`,
  keywords: ({ keyword }) => `Generate 20 SEO keywords related to "${keyword}". For each keyword provide: the keyword, search intent (Informational/Commercial/Transactional/Navigational), estimated competition level (Low/Medium/High), and a brief note on why it's valuable. Present as a structured list.`,
  density: ({ text }) => `Analyze the following text for keyword density: "${text}". Provide: top 10 keywords/phrases with their count and density percentage, overall SEO assessment, and specific suggestions to improve keyword balance. Format as a table then add recommendations below.`,
  cache: ({ url }) => `Perform an SEO cache analysis for the URL: "${url}". Explain: what Google cache is and why it matters, likely cache status for this URL based on its structure, how often Google typically crawls this type of page, and 5 tips to ensure proper caching and indexing.`,
  index: ({ url }) => `Analyze whether this URL is likely indexed by Google: "${url}". Provide: indexability assessment based on URL structure, common indexing issues to check for this URL, step-by-step instructions to verify and fix indexing issues, and tools/methods to check actual index status.`,
  metaGen: ({ title, description, keywords, url }) => `Generate complete HTML meta tags for a webpage with: Page Title: "${title}", Description: "${description}", Keywords: "${keywords}", Page URL: "${url}". Output ready-to-copy HTML including: <title>, meta description, meta keywords, canonical link, Open Graph tags (og:title, og:description, og:url, og:type), Twitter Card tags, and robots meta tag. Wrap the code in a <head> section example.`,
  metaAnalyze: ({ input }) => `Analyze these meta tags or HTML from the URL/content: "${input}". Provide: a score from 0-100 for meta tag quality, analysis of each meta tag found (title, description, OG, Twitter), what's missing or broken, and specific fixes with example code.`,
  ogCheck: ({ input }) => `Check and analyze the Open Graph tags from this URL or HTML: "${input}". List all og: tags found, identify missing required tags (og:title, og:description, og:image, og:url, og:type), give each a status (✓ Good / ⚠ Missing / ✗ Invalid), provide corrected/missing tag examples.`,
  ogGen: ({ title, description, image, url }) => `Generate complete Open Graph HTML meta tags for: Title: "${title}", Description: "${description}", Image URL: "${image}", Page URL: "${url}", Type: "website". Output ready-to-copy HTML meta tags. Include all essential og: properties and explain each one briefly.`,
  twitterCard: ({ cardType, title, description, image, site }) => `Generate Twitter Card HTML meta tags for: Card Type: "${cardType}" (summary / summary_large_image / app / player), Title: "${title}", Description: "${description}", Image URL: "${image}", Site Twitter handle: "${site}". Output ready-to-copy HTML meta tags and a preview description of how the card will appear on Twitter/X.`,
  utm: ({ url, source, medium, campaign, term, content }) => `Build a complete UTM tracking URL with these parameters: Base URL: "${url}", Source: "${source}", Medium: "${medium}", Campaign: "${campaign}", Term: "${term}" (optional), Content: "${content}" (optional). Provide: the complete UTM URL, a table explaining each parameter used, best practices for UTM naming conventions, and Google Analytics tracking tips.`
};

const TOOL_TO_TIER = {
  ranking: 'balanced',
  keywords: 'balanced',
  density: 'balanced',
  cache: 'fast',
  index: 'fast',
  metaGen: 'fast',
  metaAnalyze: 'fast',
  ogCheck: 'fast',
  ogGen: 'fast',
  twitterCard: 'fast',
  utm: 'fast'
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { toolId, inputs } = body;

    if (!toolId || !inputs) {
      return NextResponse.json({ error: 'Missing toolId or inputs' }, { status: 400 });
    }

    const promptFn = PROMPTS[toolId];
    if (!promptFn) {
      return NextResponse.json({ error: 'Unknown toolId' }, { status: 400 });
    }

    const userPrompt = promptFn(inputs);
    const result = await generateAIContent({
      prompt: userPrompt,
      systemPrompt: SYSTEM_PROMPT,
      toolId: TOOL_TO_TIER[toolId] || 'fast',
      maxTokens: 2000
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    const msg = err.message || 'Internal server error';
    const isConfigError = msg.includes('AI feature not configured') || msg.includes('All models failed');
    return NextResponse.json({ error: msg }, { status: isConfigError ? 503 : 502 });
  }
}
