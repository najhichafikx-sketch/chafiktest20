import { verifyAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = (await params).id;
    const data = await request.json();
    const image = data.image;

    if (typeof image !== 'string' || image.length === 0) {
      return Response.json({ success: false, message: 'image must be non-empty string' }, { status: 400 });
    }
    if (image.length > 5 * 1024 * 1024) {
      return Response.json({ success: false, message: 'image too large (max 5MB base64)' }, { status: 413 });
    }

    let allIds;
    try {
      allIds = await query('SELECT id, slug FROM blog_posts WHERE slug = $1', ['youtube-seo-optimization']);
    } catch (e) {
      allIds = { error: e.message };
    }

    let allSlugs;
    try {
      allSlugs = await query('SELECT id, slug FROM blog_posts ORDER BY id LIMIT 10');
    } catch (e) {
      allSlugs = { error: e.message };
    }

    const numId = Number(id);
    const result = await query(
      'UPDATE blog_posts SET featured_image = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [image, numId]
    );

    return Response.json({
      success: !!(result && result.length > 0),
      target_id: numId,
      update_rows: result?.length || 0,
      all_with_slug: allIds,
      first_10: allSlugs,
      message: result && result.length > 0 ? 'Image saved' : 'No row updated'
    });
  } catch (err) {
    return Response.json({
      success: false,
      message: 'Caught: ' + (err.message || 'unknown')
    }, { status: 500 });
  }
}
