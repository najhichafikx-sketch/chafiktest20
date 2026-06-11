// lib/auto-publisher/trends.js
// Fetch trending topics from Google Trends (no API key required)

import { parseStringPromise } from 'xml2js';

const REGIONS = [
  { code: 'US', weight: 1.5 },
  { code: 'GB', weight: 1.3 },
  { code: 'IN', weight: 1.0 },
  { code: 'CA', weight: 0.9 },
  { code: 'AU', weight: 0.8 }
];

/**
 * Fetch trending topics from Google Trends RSS
 */
export async function getGoogleTrends() {
  const allTrends = [];

  for (const region of REGIONS) {
    try {
      const url = `https://trends.google.com/trending/rss?geo=${region.code}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrendBot/1.0)' },
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) continue;

      const xml = await res.text();
      const parsed = await parseStringPromise(xml);
      const items = parsed?.rss?.channel?.[0]?.item || [];

      for (const item of items) {
        const trafficStr = item['ht:approx_traffic']?.[0] || '0';
        const traffic = parseInt(trafficStr.replace(/[^\d]/g, '')) || 0;

        if (traffic < 1000) continue;

        allTrends.push({
          title: item.title?.[0] || '',
          traffic,
          url: item.link?.[0] || '',
          pubDate: item.pubDate?.[0] || new Date().toISOString(),
          source: 'google',
          region: region.code,
          weight: region.weight,
          score: traffic * region.weight
        });
      }
    } catch (err) {
      console.warn(`Google Trends ${region.code} fetch failed:`, err.message);
    }
  }

  return allTrends;
}
