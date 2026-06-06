import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';

const SYSTEM_PROMPT = "You are an expert human writer and SEO specialist. Write articles that sound 100% natural, engaging, and human. Never sound robotic. Use varied sentence structure, smooth transitions between sections, and rich vocabulary. Always write in the exact language specified. Use markdown formatting with # for H1, ## for H2, ### for H3.";

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, language, tone, wordCount } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
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

    const result = await generateAIContent({
      prompt: userPrompt,
      systemPrompt: SYSTEM_PROMPT,
      toolId: 'seo-article',
      maxTokens: Math.max(2000, (wordCount || 1000) * 2)
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    const msg = err.message || 'Internal server error';
    const isConfigError = msg.includes('AI feature not configured') || msg.includes('All models failed');
    return NextResponse.json({ error: msg }, { status: isConfigError ? 503 : 502 });
  }
}
