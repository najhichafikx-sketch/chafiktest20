import { verifyAdmin } from '@/lib/auth';
import { getToolSettings, getAdConfig, setAdConfig, getAllAdConfigs } from '@/lib/db';

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tools = await getToolSettings();
    const adConfigs = await getAllAdConfigs();

    const configs = (tools || []).map(tool => {
      const adCfg = (adConfigs || []).find(a => a.tool_id === tool.tool_id);
      return {
        tool_id: tool.tool_id,
        tier: tool.monetization_tier || 'standard',
        ad_frequency: tool.ad_frequency || 'normal',
        sidebar_enabled: adCfg?.sidebar_enabled || false,
        content_ads_enabled: adCfg?.content_ads_enabled !== false,
        max_ads_per_page: adCfg?.max_ads_per_page || 3
      };
    });

    return Response.json({ success: true, configs });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to load configurations' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const { tool_id, tier, sidebar_enabled, content_ads_enabled, max_ads_per_page } = body;
  if (!tool_id) {
    return Response.json({ success: false, message: 'tool_id required' }, { status: 400 });
  }

  try {
    await setAdConfig(tool_id, {
      tier: tier || 'standard',
      sidebar_enabled: !!sidebar_enabled,
      content_ads_enabled: content_ads_enabled !== false,
      max_ads_per_page: parseInt(max_ads_per_page) || 3
    });

    return Response.json({ success: true, message: 'Ad configuration updated' });
  } catch (err) {
    return Response.json({ success: false, message: 'Failed to update configuration' }, { status: 500 });
  }
}
