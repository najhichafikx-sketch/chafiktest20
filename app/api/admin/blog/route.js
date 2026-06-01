import { verifyAdmin } from '@/lib/auth';
import { getBlogPosts, createBlogPost } from '@/lib/db';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await getBlogPosts('all');
    return Response.json({ success: true, posts: posts || [] });
  } catch (err) {
    return Response.json({ success: false, posts: [] }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.slug || !body.title) {
    return Response.json({ success: false, message: 'slug and title required' }, { status: 400 });
  }

  try {
    const result = await createBlogPost(body);
    return Response.json({ success: true, id: result.id, message: 'Post created' });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to create post' }, { status: 500 });
  }
}
