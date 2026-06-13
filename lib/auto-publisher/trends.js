// lib/auto-publisher/trends.js
// Fetch trending topics from multiple sources: Google Trends, Google News, YouTube, Reddit

import { parseStringPromise } from 'xml2js';

const REGIONS = [
  { code: 'US', weight: 1.5 },
  { code: 'GB', weight: 1.3 },
  { code: 'IN', weight: 1.0 },
  { code: 'CA', weight: 0.9 },
  { code: 'AU', weight: 0.8 }
];

const BLOCKED_KEYWORDS = [
  'nsfw', 'porn', 'sex', 'gore', 'violence',
  'trump', 'biden', 'election', 'murder', 'suicide',
  'death', 'kill', 'drugs', 'cocaine', 'meth'
];

function isBlocked(title) {
  const lower = (title || '').toLowerCase();
  return BLOCKED_KEYWORDS.some(k => lower.includes(k));
}

/**
 * Fetch trending topics from Google Trends RSS
 */
async function fetchGoogleTrends() {
  const trends = [];

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
        const title = item.title?.[0] || '';
        if (!title || isBlocked(title)) continue;

        const trafficStr = item['ht:approx_traffic']?.[0] || '0';
        const traffic = parseInt(trafficStr.replace(/[^\d]/g, '')) || 0;
        if (traffic < 1000) continue;

        trends.push({
          title, traffic,
          url: item.link?.[0] || '',
          pubDate: item.pubDate?.[0] || new Date().toISOString(),
          source: 'google-trends',
          region: region.code,
          weight: region.weight,
          score: traffic * region.weight
        });
      }
    } catch (err) {
      console.warn(`Google Trends ${region.code} failed:`, err.message);
    }
  }

  return trends;
}

/**
 * Fetch trending topics from Google News RSS
 */
async function fetchGoogleNews() {
  const trends = [];
  const categories = ['WORLD', 'TECHNOLOGY', 'BUSINESS', 'SCIENCE'];
  const sources = [
    'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en',
    'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr'
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) continue;

      const xml = await res.text();
      const parsed = await parseStringPromise(xml);
      const items = parsed?.rss?.channel?.[0]?.item || [];

      for (const item of items.slice(0, 20)) {
        const title = item.title?.[0] || '';
        if (!title || isBlocked(title)) continue;

        trends.push({
          title,
          traffic: 5000,
          url: item.link?.[0] || '',
          pubDate: item.pubDate?.[0] || new Date().toISOString(),
          source: 'google-news',
          region: url.includes('gl=GB') ? 'GB' : url.includes('gl=FR') ? 'FR' : 'US',
          weight: 1.2,
          score: 5000 * 1.2
        });
      }
    } catch (err) {
      console.warn(`Google News fetch failed (${url.slice(0, 50)}):`, err.message);
    }
  }

  return trends;
}

/**
 * Fetch trending topics from YouTube via RSS (trending feed)
 */
async function fetchYouTubeTrends() {
  const trends = [];
  const regions = ['US', 'GB', 'FR'];

  for (const region of regions) {
    try {
      const url = `https://www.youtube.com/feed/trending?gl=${region}&hl=en`;
      // YouTube doesn't have a clean RSS for trends, use a workaround
      const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(5000)
      });
      // If oembed fails, fallback gracefully
      if (!res.ok) continue;
    } catch {}
  }

  return trends;
}

/**
 * Fetch trending topics from Reddit
 */
async function fetchRedditTrends() {
  const trends = [];
  const subreddits = [
    'https://www.reddit.com/r/technology/hot/.json?limit=15',
    'https://www.reddit.com/r/science/hot/.json?limit=15',
    'https://www.reddit.com/r/Futurology/hot/.json?limit=15',
    'https://www.reddit.com/r/ArtificialIntelligence/hot/.json?limit=15',
    'https://www.reddit.com/r/worldnews/hot/.json?limit=15',
    'https://www.reddit.com/r/sports/hot/.json?limit=15'
  ];

  for (const url of subreddits) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrendBot/1.0)' },
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) continue;

      const json = await res.json();
      const posts = json?.data?.children || [];

      for (const post of posts.slice(0, 10)) {
        const data = post.data;
        if (!data || !data.title || isBlocked(data.title)) continue;
        if (data.over_18) continue;

        const title = data.title;
        const ups = data.ups || 0;
        const comments = data.num_comments || 0;
        const engagement = ups + comments * 2;

        if (engagement < 50) continue;

        // Estimate traffic from engagement
        const traffic = Math.min(engagement * 100, 80000);

        trends.push({
          title,
          traffic: Math.max(traffic, 3000),
          url: `https://www.reddit.com${data.permalink || ''}`,
          pubDate: new Date((data.created_utc || 0) * 1000).toISOString(),
          source: 'reddit',
          region: 'US',
          weight: 1.5,
          score: traffic * 1.5
        });
      }
    } catch (err) {
      console.warn(`Reddit fetch failed (${url.slice(0, 50)}):`, err.message);
    }
  }

  return trends;
}

/**
 * Main: get trending topics from all sources, deduplicated by title
 */
export async function getGoogleTrends() {
  console.log('[trends] Fetching from all sources...');

  const [googleTrends, googleNews, redditTrends] = await Promise.all([
    fetchGoogleTrends(),
    fetchGoogleNews(),
    fetchRedditTrends()
  ]);

  console.log(`[trends] Got ${googleTrends.length} Google Trends + ${googleNews.length} Google News + ${redditTrends.length} Reddit`);

  // Merge and deduplicate by title similarity
  const all = [...googleTrends, ...googleNews, ...redditTrends];
  const seen = new Set();
  const deduped = [];

  for (const t of all) {
    const key = t.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().slice(0, 50);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(t);
  }

  // Sort by score descending
  deduped.sort((a, b) => (b.score || 0) - (a.score || 0));

  return deduped;
}