import { ensureLabUser, earnPoints, purchaseScreens, runTest } from '@/lib/lab';

export async function POST(request) {
  try {
    const { userId, action, amount } = await request.json();
    if (!userId || !action) return Response.json({ error: 'userId and action required' });

    await ensureLabUser(userId);

    if (action === 'earn') {
      const result = await earnPoints(userId, amount);
      if (result.error) return Response.json(result);
      return Response.json({ lab_points: result.lab_points, lab_sessions: result.lab_sessions, lab_earned: result.lab_earned });
    }

    if (action === 'purchase') {
      const result = await purchaseScreens(userId, amount);
      if (result.error) return Response.json(result);
      return Response.json({ lab_points: result.lab_points, lab_sessions: result.lab_sessions, lab_spent: result.lab_spent });
    }

    if (action === 'run') {
      const result = await runTest(userId);
      if (result.error) return Response.json(result);
      return Response.json({ lab_sessions: result.lab_sessions });
    }

    return Response.json({ error: 'Unknown action' });
  } catch (e) {
    return Response.json({ error: e.message, offline: true });
  }
}
