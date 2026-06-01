import { verifyAdmin } from '@/lib/auth';
import { updateBlogPost, deleteBlogPost, getBlogPostBySlug } from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = await params;
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  try {
    await updateBlogPost(parseInt(id), body);
    return Response.json({ success: true, message: 'Post updated' });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteBlogPost(parseInt(id));
    return Response.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to delete' }, { status: 500 });
  }
}
