// app/api/admin/auto-publisher/route.js
// Manual trigger for the auto-publisher (admin only)

import { NextResponse } from 'next/server';
import { runDailyPipeline } from '@/lib/auto-publisher/pipeline';
import { verifyAdminToken } from '@/lib/auth';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/auto-publisher
 * Manually trigger the daily publishing pipeline
 *
 * Body: { articlesPerDay?: number, dryRun?: boolean }
 */
export async function POST(request) {
  try {
    // 1. Auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const isAdmin = await verifyAdminToken(token);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Parse options
    const body = await request.json().catch(() => ({}));
    const { articlesPerDay = 5, dryRun = false } = body;

    console.log(`[ADMIN] Auto-publisher triggered: ${articlesPerDay} articles, dryRun=${dryRun}`);

    // 3. Run pipeline
    const results = await runDailyPipeline({ articlesPerDay, dryRun });

    return NextResponse.json({
      success: true,
      results: results.summary,
      articles: results.articles?.map(a => ({
        trend: a.trend?.title,
        status: a.status,
        slug: a.slug,
        wordCount: a.article?.wordCount,
        seoScore: a.review?.score
      }))
    });

  } catch (err) {
    console.error('[ADMIN] Auto-publisher failed:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
