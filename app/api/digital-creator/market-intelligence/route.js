import { NextResponse } from 'next/server';
import { generateAIContent } from '@/lib/openrouter';
import {
  getCached,
  setCache,
  buildCacheKey,
  calculateViralScore,
  buildCompetitionAnalysis,
  buildPricing,
  buildThumbnailPrompts,
  buildPublishActions,
  MARKET_INTELLIGENCE_PLATFORMS
} from '@/lib/services/market-intelligence';

export const dynamic = 'force-dynamic';

function validateAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') return 'Analysis data is required';
  if (!analysis.optimized_title && !analysis.title) return 'Title missing in analysis';
  return null;
}

function parseJSONSafe(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text).match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { analysis, platform = 'etsy', focus = 'balanced' } = body;

    const validationError = validateAnalysis(analysis);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const cacheKey = buildCacheKey(analysis, platform);
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, ...cached, cached: true });
    }

    const viralScore = calculateViralScore(analysis);
    const localCompetition = buildCompetitionAnalysis(analysis);
    const localPricing = buildPricing(analysis);
    const localThumbnails = buildThumbnailPrompts(analysis);
    const localPublish = buildPublishActions(analysis, platform);

    let aiInsights = null;
    try {
      const prompt = `You are a viral digital product strategist who has studied top-selling Etsy, KDP, Gumroad, TPT, and Creative Fabrica listings.

Analyze this product and provide a JSON response (no markdown, no text outside JSON) with the EXACT structure:
{
  "market_insight": "One sharp sentence describing the real buyer pain this product solves.",
  "viral_hooks": ["hook phrase 1", "hook phrase 2", "hook phrase 3", "hook phrase 4", "hook phrase 5"],
  "best_posting_time_utc": "HH:MM-HH:MM",
  "platform_recommendation": {
    "primary": "etsy|kdp|gumroad|tpt|creative-fabrica",
    "reason": "Short reason"
  },
  "ads_copy": {
    "headline": "Under 60 char headline",
    "primary_text": "Under 130 char primary text",
    "call_to_action": "Short CTA"
  },
  "psychological_angles": ["angle 1", "angle 2", "angle 3"]
}

Platform focus: ${platform}
Product title: "${analysis.optimized_title || analysis.title}"
Description context: ${(analysis.bullets || []).join(' ')}
SEO score: ${analysis.seo_score || 0}/100
Demand score: ${analysis.demand_score || 0}/100
Competition score: ${analysis.competition_score || 0}/100
Focus mode: ${focus}

Return ONLY the JSON object.`;

      const result = await generateAIContent({
        prompt,
        systemPrompt: 'You output ONLY strict JSON. No markdown fences, no commentary.',
        toolId: 'ai-digital-creator-market-intelligence',
        maxTokens: 1500
      });

      if (result) {
        const cleaned = String(result).replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        aiInsights = parseJSONSafe(cleaned);
      }
    } catch (aiErr) {
      console.error('[market-intelligence] AI insights failed, using local fallback:', aiErr?.message);
    }

    const payload = {
      viral_score: viralScore,
      competition_analysis: localCompetition,
      pricing: localPricing,
      thumbnail_prompts: localThumbnails,
      publish_actions: localPublish,
      platforms: MARKET_INTELLIGENCE_PLATFORMS,
      ai_insights: aiInsights,
      ai_status: aiInsights ? 'ok' : 'fallback',
      selected_platform: platform,
      generated_at: new Date().toISOString()
    };

    setCache(cacheKey, payload);

    return NextResponse.json({ success: true, ...payload, cached: false });
  } catch (err) {
    console.error('[market-intelligence] route error:', err);
    return NextResponse.json(
      { error: 'Market intelligence service failed. Please try again.' },
      { status: 500 }
    );
  }
}
