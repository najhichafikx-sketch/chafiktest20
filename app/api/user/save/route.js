import { verifyUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request) {
  const user = verifyUser(request);
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const { generation_id } = body;
  if (!generation_id) {
    return Response.json({ success: false, message: 'generation_id required' }, { status: 400 });
  }

  try {
    if (user.role === 'admin') {
      return Response.json({ success: true, message: 'Saved' });
    }

    await query(
      'UPDATE generations SET is_saved = TRUE WHERE id = $1 AND user_id = $2',
      [generation_id, user.id]
    );

    return Response.json({ success: true, message: 'Result saved successfully' });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to save' }, { status: 500 });
  }
}
