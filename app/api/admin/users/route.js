import { verifyAdmin } from '@/lib/auth';
import { getUsers, getUsersStats, updateUser, deleteUserRecord } from '@/lib/db';

export async function GET(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const users = await getUsers();
    const stats = await getUsersStats();
    return Response.json({ success: true, users, stats });
  } catch (err) {
    return Response.json({ success: false, users: [], stats: {} }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { id, ...data } = await request.json();
    if (!id) return Response.json({ success: false, message: 'id required' }, { status: 400 });
    await updateUser(id, data);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyAdmin(request)) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ success: false, message: 'id required' }, { status: 400 });
    await deleteUserRecord(id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
