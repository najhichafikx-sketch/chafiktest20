import { createSupabaseClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ designs: [] });
    }

    const sb = createSupabaseClient(true);
    if (!sb) {
      return Response.json({ designs: [] });
    }

    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) {
      return Response.json({ designs: [] });
    }

    const { data } = await sb
      .from('thumbnails')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12);

    return Response.json({ designs: data || [] });
  } catch (err) {
    console.error('history error:', err);
    return Response.json({ designs: [] });
  }
}
