import { getPromptBySlug, incrementPromptViews } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const slug = (await params).slug;
    const prompt = await getPromptBySlug(slug);
    if (!prompt || prompt.status !== 'published') {
      return Response.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    await incrementPromptViews(slug);
    return Response.json({ success: true, prompt: { ...prompt, views: (prompt.views || 0) + 1 } });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
