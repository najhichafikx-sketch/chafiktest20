import { verifyUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = await params;
  const user = verifyUser(request);
  if (!user) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (user.role !== 'admin') {
      await query('UPDATE generations SET is_saved = FALSE WHERE id = $1 AND user_id = $2', [id, user.id]);
    }
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to unsave' }, { status: 500 });
  }
}
