import { writeLog } from '@/lib/db';

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

async function tryPiped(videoId) {
  try {
    const res = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`, {
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const subs = data?.subtitles;
    if (Array.isArray(subs) && subs.length > 0) {
      const enSub = subs.find(s => s.code === 'en') || subs[0];
      if (enSub?.url) {
        const txtRes = await fetch(enSub.url, { signal: AbortSignal.timeout(15000) });
        if (txtRes.ok) {
          const vtt = await txtRes.text();
          const text = vtt
            .split('\n')
            .filter(l => l && !/^WEBVTT/.test(l) && !/^\d+$/.test(l.trim()) && !l.includes('-->'))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (text) return { source: 'piped', text };
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function tryInvidious(videoId) {
  const instances = ['https://inv.nadeko.net', 'https://invidious.fdn.fr', 'https://yewtu.be', 'https://vid.puffyan.us'];
  for (const inst of instances) {
    try {
      const res = await fetch(`${inst}/api/v1/captions/${videoId}?label=English`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const cap = data[0];
        const url = typeof cap === 'object' ? cap.url : null;
        if (url) {
          const txtRes = await fetch(url.startsWith('/') ? inst + url : url, { signal: AbortSignal.timeout(15000) });
          if (txtRes.ok) {
            const vtt = await txtRes.text();
            const text = vtt
              .split('\n')
              .filter(l => l && !/^WEBVTT/.test(l) && !/^\d+$/.test(l.trim()) && !l.includes('-->'))
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            if (text) return { source: 'invidious', text };
          }
        }
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const videoId = extractVideoId(body?.videoId);
  if (!videoId || videoId.length !== 11) {
    return Response.json({ success: false, message: 'Invalid video ID' }, { status: 400 });
  }

  let result = await tryPiped(videoId);
  if (!result) result = await tryInvidious(videoId);

  if (!result) {
    await writeLog('WARN', 'Transcript fetch failed for video', { videoId });
    return Response.json({
      success: false,
      message: 'Could not fetch the transcript. The video may not have captions/subtitles.'
    }, { status: 404 });
  }

  return Response.json({
    success: true,
    videoId,
    transcript: result.text,
    source: result.source,
    length: result.text.length
  });
}
