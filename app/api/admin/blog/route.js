import { verifyAdmin } from '@/lib/auth';
import { getBlogPosts, createBlogPost } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await getBlogPosts('all');
    if (posts && posts.length > 0) {
      return Response.json({ success: true, posts });
    }
    const file = path.join(process.cwd(), 'data', 'blog.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const arr = Array.isArray(data) ? data : (data.posts || []);
      return Response.json({ success: true, posts: arr });
    }
    return Response.json({ success: true, posts: [] });
  } catch (err) {
    console.error('Admin blog GET error:', err);
    return Response.json({ success: false, message: err.message || 'Database error', posts: [] }, { status: 500 });
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
