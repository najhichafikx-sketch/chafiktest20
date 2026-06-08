import { generateImage } from '@/lib/stability';

export async function POST(request) {
  try {
    const { title, style, dimension, model } = await request.json();
    if (!title || !title.trim()) {
      return Response.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const result = await generateImage({ title: title.trim(), style: style || 'cinematic', dimension: dimension || '16:9' });

    return Response.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
    });
  } catch (err) {
    console.error('generate error:', err);
    return Response.json({ success: false, error: err.message || 'Generation failed' }, { status: 500 });
  }
}
