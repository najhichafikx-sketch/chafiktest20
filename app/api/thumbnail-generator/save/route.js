import { createSupabaseClient, uploadThumbnail } from '@/lib/supabase';
import { MODEL_COSTS } from '@/lib/stripe';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const sb = createSupabaseClient(true);
    if (!sb) {
      return Response.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    let userId = null;
    if (token) {
      const { data: { user }, error } = await sb.auth.getUser(token);
      if (!error && user) userId = user.id;
    }

    const { title, style, dimension, model, imageBlob } = await request.json();

    if (!imageBlob) {
      return Response.json({ success: false, error: 'No image data' }, { status: 400 });
    }

    const base64Data = imageBlob.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/png' });

    let imageUrl = imageBlob;
    if (userId) {
      try {
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
        imageUrl = await uploadThumbnail(userId, blob, filename);
      } catch (uploadErr) {
        console.error('Upload failed, using base64 fallback:', uploadErr.message);
      }
    }

    const pointsUsed = MODEL_COSTS[model] || MODEL_COSTS.basic;

    if (userId) {
      const { error: insertError } = await sb.from('thumbnails').insert({
        user_id: userId,
        title: title || 'Untitled',
        style: style || 'cinematic',
        dimension: dimension || '16:9',
        model: model || 'basic',
        image_url: imageUrl,
        points_used: pointsUsed,
      });

      if (!insertError) {
        await sb.rpc('deduct_points', { user_id: userId, points: pointsUsed }).maybeSingle();
      }
    }

    return Response.json({ success: true, imageUrl });
  } catch (err) {
    console.error('save error:', err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
