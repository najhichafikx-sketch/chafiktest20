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

    if (typeof image !== 'string') {
      return Response.json({ success: false, message: 'image must be a string' }, { status: 400 });
    }
    if (image.length > 5 * 1024 * 1024) {
      return Response.json({ success: false, message: 'image too large (max 5MB base64)' }, { status: 413 });
    }

    const result = await query(
      'UPDATE blog_posts SET featured_image = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [image, Number(id)]
    );

    if (!result || result.length === 0) {
      return Response.json({ success: false, message: 'Post not found or DB unavailable' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Image saved', size: image.length });
  } catch (err) {
    return Response.json({ success: false, message: err.message || 'Failed to save image' }, { status: 500 });
  }
}
