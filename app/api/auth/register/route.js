import { signToken } from '@/lib/auth';
import { createUser, findUser } from '@/lib/users';
import { writeLog, createUserRecord } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ interval: 60000, max: 5 });

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const email = sanitizeInput(body.email || '').toLowerCase();
  const password = body.password || '';

  if (!validateEmail(email)) {
    return Response.json({ success: false, message: 'Valid email is required' }, { status: 400 });
  }

  if (!validatePassword(password)) {
    return Response.json({ success: false, message: 'Password must be 6-128 characters with at least one number and letter' }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return Response.json({ success: false, message: 'Password must contain at least one letter and one number' }, { status: 400 });
  }

  try {
    const existing = await findUser(email);
    if (existing) {
      return Response.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }

    const user = await createUser(email, password);
    if (!user) {
      return Response.json({ success: false, message: 'Registration failed' }, { status: 500 });
    }

    await createUserRecord({ email, name: body.name || '' });

    const token = signToken({ id: user.id, email: user.email }, '24h');
    await writeLog('INFO', 'User registered', { email });

    await trackEvent('user_signup', { userId: user.id, metadata: { email } });

    const response = Response.json({ success: true, token, message: 'Registration successful' });
    response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`);

    return response;
  } catch (err) {
    console.error('Registration error:', err?.message || err);
    await writeLog('ERROR', 'Registration error', { error: err?.message || 'unknown' });
    return Response.json({ success: false, message: 'Server error during registration' }, { status: 500 });
  }
}
