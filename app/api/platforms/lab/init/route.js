import { ensureLabUser } from '@/lib/lab';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, error: 'userId required' });
    const u = await ensureLabUser(userId);
    return Response.json({ lab_points: u.lab_points || 0, lab_sessions: u.lab_sessions || 0, lab_earned: u.lab_earned || 0, lab_spent: u.lab_spent || 0 });
  } catch (e) {
    return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, offline: true, error: e.message });
  }
}
