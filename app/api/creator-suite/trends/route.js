import { getSetting, writeLog } from '@/lib/db';

async function getYouTubeKey() {
  if (process.env.YOUTUBE_API_KEY) return process.env.YOUTUBE_API_KEY;
  try {
    const fs = require('fs');
    const path = require('path');
    const file = path.join(process.cwd(), 'data', 'keys.json');
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.youtube_api_key) return data.youtube_api_key;
    }
  } catch (e) {}
  try {
    const dbKey = await getSetting('youtube_api_key');
    if (dbKey && typeof dbKey === 'string' && dbKey.trim()) return dbKey.trim();
    if (dbKey && typeof dbKey === 'object' && dbKey.value) return String(dbKey.value).trim();
  } catch (e) {}
  return null;
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const { country = 'US', categoryId = '28', keyword = '' } = body || {};

  const apiKey = await getYouTubeKey();
  if (!apiKey) {
    return Response.json({
      success: false,
      message: 'YouTube Data API key is not configured. Add it in the admin dashboard.'
    }, { status: 503 });
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode: String(country).toUpperCase(),
      maxResults: '20'
    });
    if (categoryId) params.set('videoCategoryId', String(categoryId));

    const url = `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = errData.error?.message || `YouTube API error (${res.status})`;
      return Response.json({ success: false, message: msg }, { status: res.status });
    }
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    let videos = items.map(v => ({
      id: v.id,
      title: v.snippet?.title || '',
      channelTitle: v.snippet?.channelTitle || '',
      channelId: v.snippet?.channelId || '',
      thumbnail: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url || '',
      publishedAt: v.snippet?.publishedAt || '',
      views: Number(v.statistics?.viewCount || 0),
      likes: Number(v.statistics?.likeCount || 0),
      comments: Number(v.statistics?.commentCount || 0)
    }));

    if (keyword && keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      videos = videos.filter(v => v.title.toLowerCase().includes(k) || v.channelTitle.toLowerCase().includes(k));
    }

    return Response.json({ success: true, videos, country, categoryId, total: videos.length });
  } catch (e) {
    await writeLog('ERROR', 'YouTube trends fetch failed', { error: e.message });
    return Response.json({ success: false, message: e.message || 'Failed to fetch trends' }, { status: 500 });
  }
}
