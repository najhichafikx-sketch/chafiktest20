import { verifyAdmin } from '@/lib/auth';
import { getLogs } from '@/lib/db';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await getLogs(100);
    return Response.json(logs || []);
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to fetch logs' }, { status: 500 });
  }
}
