import crypto from 'crypto';
import { findUserByResetToken, updatePasswordById, verifyPassword } from '@/lib/users';
import { validatePassword, sanitizeInput } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ interval: 60000, max: 3 });

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const token = sanitizeInput(body.token || '');
  const password = body.password || '';

  if (!token) {
    return Response.json({ success: false, message: 'Reset token is required' }, { status: 400 });
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
    const user = await findUserByResetToken(token);
    if (!user) {
      return Response.json({ success: false, message: 'Invalid or expired reset token' }, { status: 400 });
    }

    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 600000, 64, 'sha512').toString('hex');

    const updated = await updatePasswordById(user.id, hash, salt);
    if (!updated) {
      return Response.json({ success: false, message: 'Failed to reset password' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    const msg = err?.message || err?.toString() || 'Unknown error';
    const isConfigError = msg.includes('Supabase not configured');
    return Response.json({ success: false, message: isConfigError ? msg : 'Server error' }, { status: isConfigError ? 503 : 500 });
  }
}
