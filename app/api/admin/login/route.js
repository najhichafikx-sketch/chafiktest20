import { signToken, adminPassword } from '@/lib/auth';
import { writeLog } from '@/lib/db';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ interval: 30000, max: 3 });

const FAILED_ADMIN = new Map();

function checkAdminAttempts(ip) {
  const record = FAILED_ADMIN.get(ip);
  if (!record) return { blocked: false };
  const now = Date.now();
  if (now - record.lastAttempt > 600000) {
    FAILED_ADMIN.delete(ip);
    return { blocked: false };
  }
  if (record.count >= 3) {
    return { blocked: true, retryAfter: Math.ceil((record.lastAttempt + 600000 - now) / 1000) };
  }
  return { blocked: false };
}

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const attemptCheck = checkAdminAttempts(ip);
  if (attemptCheck.blocked) {
    return Response.json({ success: false, message: `Too many attempts. Try again in ${attemptCheck.retryAfter}s` }, { status: 429 });
  }

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }
  const { password } = body;
  const adminPw = adminPassword();

  if (!password || password !== adminPw) {
    const record = FAILED_ADMIN.get(ip) || { count: 0, lastAttempt: 0 };
    record.count++;
    record.lastAttempt = Date.now();
    FAILED_ADMIN.set(ip, record);
    await writeLog('WARN', 'Failed admin login attempt', { ip });
    return Response.json({ success: false, message: 'Invalid password' }, { status: 401 });
  }

  FAILED_ADMIN.delete(ip);

  const token = signToken({ role: 'admin' }, '2h');
  await writeLog('INFO', 'Admin logged in successfully', { ip });

  const response = Response.json({ success: true, token });
  response.headers.set('Set-Cookie', `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=7200`);

  return response;
}
