import { query } from './db';

export async function trackEvent(eventType, data = {}) {
  try {
    await query(
      `INSERT INTO analytics_events (event_type, user_id, page_url, session_id, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        eventType,
        data.userId || null,
        data.pageUrl || '',
        data.sessionId || '',
        JSON.stringify(data.metadata || {})
      ]
    );
  } catch (err) {
    console.error('Analytics track failed:', err);
  }
}

export async function getTopTools(limit = 10) {
  try {
    return await query(
      `SELECT metadata->>'toolId' as tool_id, COUNT(*) as usage_count
       FROM analytics_events
       WHERE event_type = 'tool_used'
         AND metadata->>'toolId' IS NOT NULL
       GROUP BY metadata->>'toolId'
       ORDER BY usage_count DESC
       LIMIT $1`,
      [limit]
    );
  } catch { return []; }
}

export async function getAdPerformance() {
  try {
    const impressions = await query(
      `SELECT metadata->>'slot' as slot, COUNT(*) as count
       FROM analytics_events
       WHERE event_type = 'ad_impression'
       GROUP BY metadata->>'slot'`
    );
    const clicks = await query(
      `SELECT metadata->>'slot' as slot, COUNT(*) as count
       FROM analytics_events
       WHERE event_type = 'ad_click'
       GROUP BY metadata->>'slot'`
    );
    return { impressions: impressions || [], clicks: clicks || [] };
  } catch { return { impressions: [], clicks: [] }; }
}

export async function getDailyTraffic(days = 7) {
  try {
    return await query(
      `SELECT DATE(timestamp) as date, COUNT(*) as count
       FROM analytics_events
       WHERE event_type = 'page_view'
         AND timestamp >= NOW() - INTERVAL '1 day' * $1
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
      [days]
    );
  } catch { return []; }
}

export async function getToolAdRevenue() {
  try {
    return await query(
      `SELECT metadata->>'toolId' as tool_id,
              COUNT(*) FILTER (WHERE event_type = 'ad_impression') as impressions,
              COUNT(*) FILTER (WHERE event_type = 'ad_click') as clicks
       FROM analytics_events
       WHERE event_type IN ('ad_impression', 'ad_click')
         AND metadata->>'toolId' IS NOT NULL
       GROUP BY metadata->>'toolId'
       ORDER BY impressions DESC`
    );
  } catch { return []; }
}

export async function getEventStats(eventType, days = 7) {
  try {
    const rows = await query(
      `SELECT COUNT(*) as count
       FROM analytics_events
       WHERE event_type = $1
         AND timestamp >= NOW() - INTERVAL '1 day' * $2`,
      [eventType, days]
    );
    return rows?.[0]?.count || 0;
  } catch { return 0; }
}
