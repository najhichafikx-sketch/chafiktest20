import { suggestTitles } from '@/lib/claude';

export async function POST(request) {
  try {
    const { title, style } = await request.json();
    if (!title || !title.trim()) {
      return Response.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const suggestions = await suggestTitles({ title: title.trim(), style: style || 'cinematic' });

    return Response.json({ success: true, suggestions });
  } catch (err) {
    console.error('ai-title error:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
