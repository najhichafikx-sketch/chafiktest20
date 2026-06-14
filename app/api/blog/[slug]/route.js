import { getBlogPostBySlug } from '@/lib/db';

export async function GET(request, { params }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  try {
    const post = await getBlogPostBySlug(slug, locale);
    if (!post) return Response.json({ success: false, message: 'Not found' }, { status: 404 });
    return Response.json({ success: true, post });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to load post' }, { status: 500 });
  }
}
