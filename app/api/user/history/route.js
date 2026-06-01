import { verifyUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  const user = verifyUser(request);
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (user.role === 'admin') {
      return Response.json({ success: true, history: [] });
    }

    const rows = await query(
      'SELECT id, tool_id, input_text, result_html, model_used, is_saved, created_at FROM generations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [user.id]
    );

    return Response.json({ success: true, history: rows || [] });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}
