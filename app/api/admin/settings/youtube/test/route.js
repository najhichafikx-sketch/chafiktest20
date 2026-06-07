import { verifyAdmin } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ max: 10 });

async function testYouTubeKey(apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (res.ok) return { ok: true };
  let body = {};
  try { body = await res.json(); } catch {}
  const err = body?.error || {};
  return {
    ok: false,
    status: res.status,
    message: err.message || `YouTube API error (${res.status})`,
    reason: err.errors?.[0]?.reason || err.status || null,
    domain: err.errors?.[0]?.domain || null
  };
}

function explainError(result) {
  const { status, reason, message } = result;
  if (status === 400 && (reason === 'keyInvalid' || /API key not valid/i.test(message))) {
    return 'The API key is invalid. Generate a new one in Google Cloud Console → APIs & Services → Credentials.';
  }
  if (status === 400 && reason === 'badRequest') {
    return 'Bad request. Verify the key is correctly copied (no extra spaces, starts with "AIza", ~39 chars).';
  }
  if (status === 401) {
    return 'Unauthorized. The key may be revoked, restricted by IP/HTTP referrer, or the YouTube Data API v3 is not enabled for this project.';
  }
  if (status === 403 && (reason === 'quotaExceeded' || /quota/i.test(message))) {
    return 'Quota exceeded. The project has hit the YouTube Data API v3 daily quota (default 10,000 units). Wait until midnight Pacific or request more quota.';
  }
  if (status === 403 && reason === 'ipRefererBlocked') {
    return 'IP/HTTP referrer restriction is blocking the request. In Google Cloud Console → Credentials → edit the key → Application restrictions, either remove the restriction or add Vercel server IPs / your domain. For server-side use, "None" is recommended.';
  }
  if (status === 403 && reason === 'accessNotConfigured') {
    return 'The YouTube Data API v3 is not enabled for this project. Enable it in Google Cloud Console → APIs & Services → Library → search "YouTube Data API v3" → Enable.';
  }
  if (status === 403) {
    return 'Access denied. Verify the YouTube Data API v3 is enabled in Google Cloud Console and the key is not restricted from this server.';
  }
  if (status === 404) {
    return 'Endpoint not found. This is likely a temporary issue, try again.';
  }
  if (status >= 500) {
    return 'YouTube API server error. Try again in a few minutes.';
  }
  return 'Unknown error. Verify the key in Google Cloud Console.';
}

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Admin session expired. Please log in again.' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }
  const { apiKey } = body;

  if (!apiKey) {
    return Response.json({ success: false, message: 'No API key provided' }, { status: 400 });
  }

  if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
    return Response.json({
      success: false,
      message: 'Invalid key format. YouTube Data API keys start with "AIza" and are ~39 characters.'
    }, { status: 400 });
  }

  try {
    const result = await testYouTubeKey(apiKey);
    if (result.ok) {
      await writeLog('INFO', 'YouTube API test successful');
      return Response.json({ success: true, message: 'Connection successful — the API key is valid and working.' });
    }
    await writeLog('WARN', 'YouTube API test failed', { status: result.status, reason: result.reason, message: result.message });
    return Response.json({
      success: false,
      message: result.message,
      hint: explainError(result),
      status: result.status,
      reason: result.reason
    }, { status: 400 });
  } catch (e) {
    await writeLog('ERROR', 'YouTube API test exception', { error: e.message });
    return Response.json({ success: false, message: e.message || 'Connection failed' }, { status: 500 });
  }
}
