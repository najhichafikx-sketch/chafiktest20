import { verifyAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { TOOL_BLOG_ARTICLES } from '@/lib/tool-blog-articles';

export async function POST(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body = {};
    try { body = await request.json(); } catch {}
    const wipe = body.wipe !== false;

    let deletedCount = 0;
    if (wipe) {
      try {
        const del = await query('DELETE FROM blog_posts');
        deletedCount = del?.length || 0;
      } catch (e) {
        console.warn('blog-sync: delete error:', e.message);
      }
      try {
        await query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_link TEXT DEFAULT ''`);
        await query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_link_label TEXT DEFAULT ''`);
        await query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT ''`);
        await query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}'`);
      } catch {}
    }

    let inserted = 0;
    let errors = [];
    for (let i = 0; i < TOOL_BLOG_ARTICLES.length; i++) {
      const a = TOOL_BLOG_ARTICLES[i];
      const now = new Date(Date.now() - i * 60000).toISOString();
      try {
        await query(
          `INSERT INTO blog_posts (slug, title, excerpt, content, category, tags, author, featured_image, meta_description, seo_title, keywords, reading_time, status, external_link, external_link_label, published_at, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (slug) DO UPDATE SET
             title=EXCLUDED.title,
             excerpt=EXCLUDED.excerpt,
             content=EXCLUDED.content,
             category=EXCLUDED.category,
             tags=EXCLUDED.tags,
             author=EXCLUDED.author,
             meta_description=EXCLUDED.meta_description,
             seo_title=EXCLUDED.seo_title,
             keywords=EXCLUDED.keywords,
             reading_time=EXCLUDED.reading_time,
             external_link=EXCLUDED.external_link,
             external_link_label=EXCLUDED.external_link_label,
             published_at=EXCLUDED.published_at,
             updated_at=NOW()`,
          [
            a.slug,
            a.title,
            a.excerpt,
            a.content,
            a.category,
            a.tags,
            'Chafiktech Ai',
            '',
            a.excerpt,
            a.title,
            a.keywords,
            2,
            'published',
            `/tools/${a.tool}`,
            `Try ${a.toolName}`,
            now,
            now,
            now
          ]
        );
        inserted++;
      } catch (e) {
        errors.push({ slug: a.slug, error: e.message });
      }
    }

    try {
      await query(`SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM blog_posts))`);
    } catch {}

    return Response.json({
      success: true,
      wiped: wipe,
      deleted: deletedCount,
      inserted,
      total: TOOL_BLOG_ARTICLES.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Synced ${inserted}/${TOOL_BLOG_ARTICLES.length} articles`
    });
  } catch (err) {
    console.error('blog-sync error:', err);
    return Response.json({ success: false, message: err.message || 'Sync failed' }, { status: 500 });
  }
}
