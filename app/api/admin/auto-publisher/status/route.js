import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { getStats, getRecentArticles } from '@/lib/auto-publisher/blog-service';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getStats();
    const articles = await getRecentArticles(50);

    const estimatedRevenue = (articles.filter(a => a.status === 'published').length * 15).toFixed(2);

    return NextResponse.json({
      stats: { ...stats, estimatedRevenue },
      articles
    });
  } catch (err) {
    console.error('Status fetch failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
