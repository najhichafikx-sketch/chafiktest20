import { verifyAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = (await params).id;
    const numId = Number(id);
    const data = await request.json();
    const image = data.image;

    if (typeof image !== 'string') {
      return Response.json({ success: false, message: 'image must be a string' }, { status: 400 });
    }
    if (image.length > 5 * 1024 * 1024) {
      return Response.json({ success: false, message: 'image too large (max 5MB base64)' }, { status: 413 });
    }

    const check = await query('SELECT id FROM blog_posts WHERE id = $1', [numId]);
    if (!check || check.length === 0) {
      return Response.json({
        success: false,
        message: `Post id=${numId} not found in DB (checked: ${check?.length ?? 'null'} rows)`
      }, { status: 404 });
    }

    const result = await query(
      'UPDATE blog_posts SET featured_image = $1, updated_at = NOW() WHERE id = $2 RETURNING id, featured_image',
      [image, numId]
    );

    if (!result || result.length === 0) {
      return Response.json({ success: false, message: 'UPDATE returned 0 rows' }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Image saved',
      size: image.length,
      new_length: result[0]?.featured_image?.length || 0
    });
  } catch (err) {
    return Response.json({
      success: false,
      message: 'Caught: ' + (err.message || 'unknown'),
      stack: err.stack?.split('\n')[0]
    }, { status: 500 });
  }
}
