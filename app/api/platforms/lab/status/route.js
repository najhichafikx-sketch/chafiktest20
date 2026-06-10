import { getLabUser, ensureLabUser } from '@/lib/lab';

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 });
  try {
    const u = await getLabUser(userId);
    if (!u) return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 });
    return Response.json({ lab_points: u.lab_points || 0, lab_sessions: u.lab_sessions || 0, lab_earned: u.lab_earned || 0, lab_spent: u.lab_spent || 0 });
  } catch {
    return Response.json({ lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, offline: true });
  }
}
