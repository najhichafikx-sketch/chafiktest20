// app/api/cron/daily-publisher/route.js
// Vercel Cron endpoint - runs daily at 8 AM (configured in vercel.json)

import { NextResponse } from 'next/server';
import { runDailyPipeline } from '@/lib/auto-publisher/pipeline';

export const maxDuration = 600; // 10 minutes
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const startTime = Date.now();

  // 1. Auth check (Vercel sends Authorization: Bearer <CRON_SECRET>)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET not configured');
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[CRON] Unauthorized access attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('[CRON] Daily publisher triggered');
  console.log(`[CRON] Time: ${new Date().toISOString()}`);

  try {
    // 2. Run the pipeline
    const results = await runDailyPipeline();

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[CRON] Completed in ${duration}s`);

    // 3. Return summary
    return NextResponse.json({
      success: true,
      duration,
      results: results.summary,
      articles: results.articles?.map(a => ({
        trend: a.trend?.title,
        status: a.status,
        slug: a.slug,
        wordCount: a.article?.wordCount,
        seoScore: a.article ? 'reviewed' : null
      }))
    });

  } catch (err) {
    console.error('[CRON] Pipeline failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers (e.g., from admin panel)
export async function POST(request) {
  return GET(request);
}
