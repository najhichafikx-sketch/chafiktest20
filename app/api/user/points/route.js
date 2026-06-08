import { createSupabaseClient } from '@/lib/supabase';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return Response.json({ points: 0 });
    }

    const sb = createSupabaseClient(true);
    if (!sb) {
      return Response.json({ points: 0 });
    }

    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) {
      return Response.json({ points: 0 });
    }

    const { data } = await sb.from('users').select('points').eq('id', user.id).single();
    return Response.json({ points: data?.points || 0 });
  } catch {
    return Response.json({ points: 0 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { deduct } = await request.json();

    if (!token) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sb = createSupabaseClient(true);
    if (!sb) {
      return Response.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await sb.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await sb.from('users').select('points').eq('id', user.id).single();
    if (!userData || userData.points < deduct) {
      return Response.json({ success: false, error: 'Insufficient points' }, { status: 400 });
    }

    await sb.from('users').update({ points: userData.points - deduct }).eq('id', user.id);
    await sb.from('transactions').insert({
      user_id: user.id,
      type: 'usage',
      points: -deduct,
    });

    return Response.json({ success: true, points: userData.points - deduct });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
