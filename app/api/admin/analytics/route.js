import { verifyAdmin } from '@/lib/auth';
import { getTopTools, getAdPerformance, getDailyTraffic, getToolAdRevenue, getEventStats } from '@/lib/analytics';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [topTools, adPerf, traffic, toolRevenue, pageViews, toolUsage, adImpressions, adClicks] = await Promise.all([
      getTopTools(10),
      getAdPerformance(),
      getDailyTraffic(7),
      getToolAdRevenue(),
      getEventStats('page_view', 7),
      getEventStats('tool_used', 7),
      getEventStats('ad_impression', 7),
      getEventStats('ad_click', 7)
    ]);

    const adsWithCTR = (adPerf.impressions || []).map(imp => {
      const slot = imp.slot;
      const clickData = (adPerf.clicks || []).find(c => c.slot === slot);
      const clicks = clickData ? parseInt(clickData.count) : 0;
      const impressions = parseInt(imp.count);
      return {
        slot,
        impressions,
        clicks,
        ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + '%' : '0%'
      };
    });

    return Response.json({
      success: true,
      stats: {
        pageViews7d: pageViews,
        toolUsage7d: toolUsage,
        adImpressions7d: adImpressions,
        adClicks7d: adClicks,
        overallCTR: adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(2) + '%' : '0%'
      },
      topTools: topTools || [],
      adPerformance: adsWithCTR,
      dailyTraffic: (traffic || []).map(t => ({ date: t.date, count: parseInt(t.count) })),
      toolRevenue: (toolRevenue || []).map(t => ({
        tool_id: t.tool_id,
        impressions: parseInt(t.impressions),
        clicks: parseInt(t.clicks)
      }))
    });
  } catch (err) {
    return Response.json({ success: false, message: 'Analytics fetch failed' }, { status: 500 });
  }
}
