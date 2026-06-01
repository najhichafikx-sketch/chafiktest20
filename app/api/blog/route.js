import { getBlogPosts } from '@/lib/db';

export async function GET() {
  try {
    const posts = await getBlogPosts('published');
    return Response.json({ success: true, posts: posts || [] });
  } catch (err) {
    return Response.json({ success: false, posts: [], message: 'Failed to load posts' }, { status: 500 });
  }
}
