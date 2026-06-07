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

function extractVideoId(input) {
  if (!input) return '';
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m1 = s.match(/[?&]v=([\w-]{11})/);
  if (m1) return m1[1];
  const m2 = s.match(/youtu\.be\/([\w-]{11})/);
  if (m2) return m2[1];
  const m3 = s.match(/\/shorts\/([\w-]{11})/);
  if (m3) return m3[1];
  return s;
}

async function ytFetch(apiKey, path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `https://www.googleapis.com/youtube/v3/${path}${sep}key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData.error?.message || `YouTube API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function resolveChannelId(apiKey, ref) {
  if (!ref) return null;
  if (ref.type === 'id') return ref.value;
  const handle = ref.value.replace(/^@/, '');
  try {
    const data = await ytFetch(apiKey, `channels?part=id&forHandle=${encodeURIComponent(handle)}`);
    if (data.items && data.items[0]) return data.items[0].id;
  } catch (e) {}
  try {
    const data = await ytFetch(apiKey, `search?part=id&type=channel&q=${encodeURIComponent(handle)}&maxResults=1`);
    if (data.items && data.items[0]) return data.items[0].id?.channelId || data.items[0].id;
  } catch (e) {}
  return null;
}

async function handleTagExtractor(apiKey, body) {
  const videoId = extractVideoId(body.videoId || body.input);
  if (!videoId || videoId.length !== 11) throw new Error('Invalid video ID');
  const data = await ytFetch(apiKey, `videos?part=snippet&id=${videoId}`);
  if (!data.items?.[0]) throw new Error('Video not found');
  const tags = data.items[0].snippet?.tags || [];
  return { videoId, tags, count: tags.length };
}

async function handleTitleExtractor(apiKey, body) {
  const videoId = extractVideoId(body.videoId || body.input);
  if (!videoId || videoId.length !== 11) throw new Error('Invalid video ID');
  const data = await ytFetch(apiKey, `videos?part=snippet&id=${videoId}`);
  if (!data.items?.[0]) throw new Error('Video not found');
  return { videoId, title: data.items[0].snippet?.title || '', channelTitle: data.items[0].snippet?.channelTitle || '' };
}

async function handleDescriptionExtractor(apiKey, body) {
  const videoId = extractVideoId(body.videoId || body.input);
  if (!videoId || videoId.length !== 11) throw new Error('Invalid video ID');
  const data = await ytFetch(apiKey, `videos?part=snippet&id=${videoId}`);
  if (!data.items?.[0]) throw new Error('Video not found');
  return { videoId, description: data.items[0].snippet?.description || '' };
}

async function handleVideoStatistics(apiKey, body) {
  const videoId = extractVideoId(body.videoId || body.input);
  if (!videoId || videoId.length !== 11) throw new Error('Invalid video ID');
  const data = await ytFetch(apiKey, `videos?part=snippet,statistics,contentDetails,status&id=${videoId}`);
  if (!data.items?.[0]) throw new Error('Video not found');
  const v = data.items[0];
  return {
    videoId,
    title: v.snippet?.title,
    channelTitle: v.snippet?.channelTitle,
    publishedAt: v.snippet?.publishedAt,
    duration: v.contentDetails?.duration,
    views: Number(v.statistics?.viewCount || 0),
    likes: Number(v.statistics?.likeCount || 0),
    dislikes: Number(v.statistics?.dislikeCount || 0),
    comments: Number(v.statistics?.commentCount || 0),
    favorites: Number(v.statistics?.favoriteCount || 0),
    definition: v.contentDetails?.definition,
    privacy: v.status?.privacyStatus,
    madeForKids: v.status?.madeForKids
  };
}

async function handleChannelStatistics(apiKey, body) {
  const channelId = await resolveChannelId(apiKey, body.channelRef);
  if (!channelId) throw new Error('Channel not found');
  const data = await ytFetch(apiKey, `channels?part=snippet,statistics,brandingSettings,contentDetails&id=${channelId}`);
  if (!data.items?.[0]) throw new Error('Channel not found');
  const c = data.items[0];
  return {
    channelId,
    title: c.snippet?.title,
    description: c.snippet?.description,
    customUrl: c.snippet?.customUrl,
    country: c.snippet?.country,
    publishedAt: c.snippet?.publishedAt,
    subscribers: Number(c.statistics?.subscriberCount || 0),
    views: Number(c.statistics?.viewCount || 0),
    videos: Number(c.statistics?.videoCount || 0),
    thumbnails: c.snippet?.thumbnails
  };
}

async function handleChannelIdExtractor(apiKey, body) {
  const channelId = await resolveChannelId(apiKey, body.channelRef);
  if (!channelId) throw new Error('Channel not found');
  return { channelId, ref: body.channelRef };
}

async function handleChannelLogo(apiKey, body) {
  const channelId = await resolveChannelId(apiKey, body.channelRef);
  if (!channelId) throw new Error('Channel not found');
  const data = await ytFetch(apiKey, `channels?part=snippet&id=${channelId}`);
  if (!data.items?.[0]) throw new Error('Channel not found');
  const thumbs = data.items[0].snippet?.thumbnails || {};
  return {
    channelId,
    default: thumbs.default?.url,
    medium: thumbs.medium?.url,
    high: thumbs.high?.url
  };
}

async function handleChannelBanner(apiKey, body) {
  const channelId = await resolveChannelId(apiKey, body.channelRef);
  if (!channelId) throw new Error('Channel not found');
  const data = await ytFetch(apiKey, `channels?part=brandingSettings&id=${channelId}`);
  if (!data.items?.[0]) throw new Error('Channel not found');
  const url = data.items[0].brandingSettings?.image?.bannerExternalUrl;
  return { channelId, bannerUrl: url || null };
}

async function handleRegionRestriction(apiKey, body) {
  const videoId = extractVideoId(body.videoId || body.input);
  if (!videoId || videoId.length !== 11) throw new Error('Invalid video ID');
  const data = await ytFetch(apiKey, `videos?part=contentDetails&id=${videoId}`);
  if (!data.items?.[0]) throw new Error('Video not found');
  const restriction = data.items[0].contentDetails?.regionRestriction;
  return {
    videoId,
    allowed: restriction?.allowed || [],
    blocked: restriction?.blocked || [],
    isRestricted: !!(restriction?.allowed || restriction?.blocked)
  };
}

async function handleChannelFinder(apiKey, body) {
  const q = (body.input || '').trim();
  if (!q) throw new Error('Channel name is required');
  const data = await ytFetch(apiKey, `search?part=snippet&type=channel&q=${encodeURIComponent(q)}&maxResults=10`);
  return {
    query: q,
    results: (data.items || []).map(it => ({
      channelId: it.id?.channelId || it.id,
      title: it.snippet?.title,
      description: it.snippet?.description,
      thumbnail: it.snippet?.thumbnails?.default?.url
    }))
  };
}

async function handleThumbnailDownloader(apiKey, body) {
  const videoId = extractVideoId(body.videoId || body.input);
  if (!videoId || videoId.length !== 11) throw new Error('Invalid video ID');
  const data = await ytFetch(apiKey, `videos?part=snippet&id=${videoId}`);
  if (!data.items?.[0]) throw new Error('Video not found');
  const t = data.items[0].snippet?.thumbnails || {};
  return {
    videoId,
    default: t.default?.url,
    medium: t.medium?.url,
    high: t.high?.url,
    standard: t.standard?.url,
    maxres: t.maxres?.url
  };
}

async function handleVideoCount(apiKey, body) {
  const channelId = await resolveChannelId(apiKey, body.channelRef);
  if (!channelId) throw new Error('Channel not found');
  const data = await ytFetch(apiKey, `channels?part=statistics&id=${channelId}`);
  if (!data.items?.[0]) throw new Error('Channel not found');
  return { channelId, videoCount: Number(data.items[0].statistics?.videoCount || 0) };
}

async function handleChannelAge(apiKey, body) {
  const channelId = await resolveChannelId(apiKey, body.channelRef);
  if (!channelId) throw new Error('Channel not found');
  const data = await ytFetch(apiKey, `channels?part=snippet&id=${channelId}`);
  if (!data.items?.[0]) throw new Error('Channel not found');
  const publishedAt = data.items[0].snippet?.publishedAt;
  if (!publishedAt) return { channelId, ageDays: null, ageYears: null };
  const pub = new Date(publishedAt);
  const now = new Date();
  const days = Math.floor((now - pub) / 86400000);
  const years = (days / 365).toFixed(2);
  return { channelId, publishedAt, ageDays: days, ageYears: years };
}

const HANDLERS = {
  'tag-extractor': handleTagExtractor,
  'title-extractor': handleTitleExtractor,
  'description-extractor': handleDescriptionExtractor,
  'video-statistics': handleVideoStatistics,
  'channel-statistics': handleChannelStatistics,
  'channel-id-extractor': handleChannelIdExtractor,
  'channel-logo': handleChannelLogo,
  'channel-banner': handleChannelBanner,
  'region-restriction': handleRegionRestriction,
  'channel-finder': handleChannelFinder,
  'thumbnail-downloader': handleThumbnailDownloader,
  'video-count': handleVideoCount,
  'channel-age': handleChannelAge
};

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const { tool, input, systemPrompt, language } = body || {};

  if (tool === 'ai-generate') {
    const { default: aiRoute } = await import('../ai-generate/route.js').catch(() => ({}));
    return Response.json({ success: false, message: 'Use /api/creator-suite/ai-generate for AI tools' }, { status: 400 });
  }

  const handler = HANDLERS[tool];
  if (!handler) {
    return Response.json({ success: false, message: `Unknown tool: ${tool}` }, { status: 400 });
  }

  const apiKey = await getYouTubeKey();
  if (!apiKey) {
    return Response.json({
      success: false,
      message: 'YouTube Data API key is not configured. Add it in the admin dashboard.'
    }, { status: 503 });
  }

  try {
    const data = await handler(apiKey, body);
    return Response.json({ success: true, tool, data });
  } catch (e) {
    await writeLog('ERROR', `YouTube tool ${tool} failed`, { error: e.message, input });
    return Response.json({ success: false, message: e.message || 'Tool failed' }, { status: e.status || 500 });
  }
}
