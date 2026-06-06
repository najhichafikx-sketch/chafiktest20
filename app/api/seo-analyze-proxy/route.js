import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, article, topIssues } = body;

    if (!article) {
      return NextResponse.json({ error: 'Article is required' }, { status: 400 });
    }

    if (action === 'analyze') {
      const systemPrompt = `You are an SEO analysis expert. Analyze the given article and return ONLY valid JSON with no markdown or explanation.`;
      const userPrompt = `Analyze this article for SEO and return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "score": number,
  "wordCount": number,
  "headings": {"h1": number, "h2": number, "h3": number},
  "topKeyword": {"word": "string", "density": number},
  "readability": "Easy|Medium|Hard",
  "checks": [
    {"item": "string", "status": "pass|warning|fail", "message": "string"}
  ],
  "metaSuggestion": "string",
  "topIssues": ["string","string","string"]
}
Article: ${article}`;

      const result = await generateAIContent({
        prompt: userPrompt,
        systemPrompt,
        toolId: 'seo-analyzer',
        maxTokens: 2500
      });

      let parsed;
      try {
        const cleaned = result.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        return NextResponse.json({ error: 'Failed to parse SEO analysis' }, { status: 502 });
      }

      return NextResponse.json({ success: true, analysis: parsed });
    }

    if (action === 'improve') {
      const systemPrompt = `You are an expert SEO writer. Rewrite articles to score 95+ on SEO while keeping the same topic, meaning, and language.`;
      const userPrompt = `You are an expert SEO writer. Rewrite this article to score 95+ on SEO while keeping the same topic, meaning, and language.
Fix these specific issues: ${topIssues?.join(', ') || 'improve SEO score'}
Rules:
- Keep same approximate word count
- Improve heading structure
- Add transition words between paragraphs
- Reduce passive voice to under 10%
- Optimize keyword density to 2-3%
- Shorten long paragraphs
- Sound 100% human and natural
- Use markdown formatting
Article to improve: ${article}`;

      const result = await generateAIContent({
        prompt: userPrompt,
        systemPrompt,
        toolId: 'seo-improver',
        maxTokens: 4000
      });

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    const msg = err.message || 'Internal server error';
    const isConfigError = msg.includes('AI feature not configured') || msg.includes('All models failed');
    return NextResponse.json({ error: msg }, { status: isConfigError ? 503 : 502 });
  }
}
