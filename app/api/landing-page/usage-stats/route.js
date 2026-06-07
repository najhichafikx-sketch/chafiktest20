import { verifyAdmin } from '@/lib/auth';
import { getDailyUsageCount, getMonthlyUsageCount, getLastUsedTimestamp } from '@/lib/db';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const daily = await getDailyUsageCount();
    const monthly = await getMonthlyUsageCount();
    const lastUsed = await getLastUsedTimestamp();
    return Response.json({
      success: true,
      daily,
      monthly,
      last_used: lastUsed
    });
  } catch (err) {
    return Response.json({
      success: false,
      message: err.message
    }, { status: 500 });
  }
}
