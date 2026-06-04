import { NextResponse } from 'next/server';

function getApiKey() {
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
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, article } = body;

    if (!article) {
      return NextResponse.json({ error: 'Article is required' }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured.' }, { status: 503 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chafiktech.com';

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

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': siteUrl,
          'X-Title': 'SEO Analyzer'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        return NextResponse.json({ error: `OpenRouter API error (${response.status})` }, { status: 502 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: 'No content in API response' }, { status: 502 });
      }

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
      const { topIssues } = body;
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

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': siteUrl,
          'X-Title': 'SEO Improver'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        return NextResponse.json({ error: `OpenRouter API error (${response.status})` }, { status: 502 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: 'No content in API response' }, { status: 502 });
      }

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
