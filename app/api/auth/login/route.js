import { signToken } from '@/lib/auth';
import { findUser, verifyPassword } from '@/lib/users';
import { writeLog } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { validateEmail, sanitizeInput } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const FAILED_ATTEMPTS = new Map();

const limiter = rateLimitMiddleware({ interval: 30000, max: 5 });

function checkFailedAttempts(ip) {
  const record = FAILED_ATTEMPTS.get(ip);
  if (!record) return { blocked: false };
  const now = Date.now();
  if (now - record.lastAttempt > 300000) {
    FAILED_ATTEMPTS.delete(ip);
    return { blocked: false };
  }
  if (record.count >= 5) {
    return { blocked: true, retryAfter: Math.ceil((record.lastAttempt + 300000 - now) / 1000) };
  }
  return { blocked: false };
}

function recordFailedAttempt(ip) {
  const record = FAILED_ATTEMPTS.get(ip) || { count: 0, lastAttempt: 0 };
  record.count++;
  record.lastAttempt = Date.now();
  FAILED_ATTEMPTS.set(ip, record);
}

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const attemptCheck = checkFailedAttempts(ip);
  if (attemptCheck.blocked) {
    return Response.json({
      success: false,
      message: `Too many attempts. Try again in ${attemptCheck.retryAfter}s`
    }, { status: 429 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const email = sanitizeInput(body.email || '').toLowerCase();
  const password = body.password || '';

  if (!validateEmail(email)) {
    return Response.json({ success: false, message: 'Invalid email format' }, { status: 400 });
  }

  try {
    const user = await findUser(email);
    if (!user || !(await verifyPassword(password, user.salt, user.password))) {
      recordFailedAttempt(ip);
      await writeLog('WARN', 'Failed login attempt', { email, ip });
      return Response.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    FAILED_ATTEMPTS.delete(ip);

    const token = signToken({ id: user.id, email: user.email }, '24h');
    await writeLog('INFO', 'User logged in', { email });

    await trackEvent('login_success', { userId: user.id, metadata: { email } });

    const response = Response.json({ success: true, token, message: 'Login successful' });
    response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);

    return response;
  } catch (err) {
    const msg = err?.message || err?.toString() || 'Unknown error';
    await writeLog('ERROR', 'Login error', { error: msg });
    const isConfigError = msg.includes('Supabase not configured');
    return Response.json({ success: false, message: isConfigError ? msg : 'Server error' }, { status: isConfigError ? 503 : 500 });
  }
}
