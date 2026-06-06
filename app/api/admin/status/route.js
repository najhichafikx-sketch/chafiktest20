import { verifyAdmin } from '@/lib/auth';
import { getToolSettings, getDailyUsageCount } from '@/lib/db';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tools = await getToolSettings();
    const totalTools = 25;
    const activeTools = tools ? tools.filter(t => t.enabled).length : 0;
    const hasApi = !!process.env.OPENROUTER_API_KEY;
    let dailyLandingPageUsage = 0;
    try { dailyLandingPageUsage = await getDailyUsageCount(); } catch {}

    return Response.json({
      totalTools,
      activeTools: hasApi ? (activeTools || totalTools) : 0,
      mockTools: hasApi ? 0 : totalTools,
      missingKeys: hasApi ? 0 : 1,
      apiStatus: hasApi ? 'Online' : 'Offline',
      systemHealth: 'Optimal',
      uptime: process.uptime(),
      dailyLandingPageUsage
    });
  } catch (err) {
    return Response.json({ success: false, message: 'Status check failed' }, { status: 500 });
  }
}
