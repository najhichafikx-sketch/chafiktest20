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

const SYSTEM_PROMPT = "You are an expert human writer and SEO specialist. Write articles that sound 100% natural, engaging, and human. Never sound robotic. Use varied sentence structure, smooth transitions between sections, and rich vocabulary. Always write in the exact language specified. Use markdown formatting with # for H1, ## for H2, ### for H3.";

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, language, tone, wordCount } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured.' }, { status: 503 });
    }

    const userPrompt = `Write a complete, professional ${wordCount}-word article about: "${topic}".
Language: ${language}
Tone: ${tone}

Structure:
# [SEO-optimized title]
## Introduction (2-3 engaging paragraphs)
## Table of Contents
## Section 1 (H2) with 2-3 subsections (H3)
## Section 2 (H2) with 2-3 subsections (H3)
## Section 3 (H2) with bullet points or numbered list
## Section 4 (H2) with real examples or statistics
## Section 5 (H2) with expert tips
## Conclusion with key takeaways
## FAQ (5 questions with detailed answers)

Make it exactly ${wordCount} words. Sound 100% human. Use markdown.`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chafiktech.com';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'AI Article Generator'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `OpenRouter API error (${response.status})` }, { status: 502 });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json({ error: 'No content in API response' }, { status: 502 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
