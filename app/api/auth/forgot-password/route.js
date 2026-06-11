import crypto from 'crypto';
import { findUser, setResetToken } from '@/lib/users';
import { validateEmail, sanitizeInput } from '@/lib/sanitize';
import { rateLimitMiddleware } from '@/lib/rate-limit';

const limiter = rateLimitMiddleware({ interval: 60000, max: 3 });

export async function POST(request) {
  const rateCheck = await limiter(request);
  if (rateCheck) return rateCheck;

  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const email = sanitizeInput(body.email || '').toLowerCase();
  if (!validateEmail(email)) {
    return Response.json({ success: false, message: 'Valid email is required' }, { status: 400 });
  }

  try {
    const user = await findUser(email);
    if (!user) {
      return Response.json({ success: true, message: 'If this email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await setResetToken(email, resetToken, expiresAt);

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com';
    const resetLink = `${origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    try {
      await sendResetEmail(email, resetLink);
    } catch {}

    return Response.json({ success: true, message: 'If this email exists, a reset link has been sent' });
  } catch (err) {
    const msg = err?.message || err?.toString() || 'Unknown error';
    const isConfigError = msg.includes('Supabase not configured');
    return Response.json({ success: false, message: isConfigError ? msg : 'Server error' }, { status: isConfigError ? 503 : 500 });
  }
}

async function sendResetEmail(to, link) {
  const apiKey = process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('No email API key configured — reset link:', link);
    return;
  }

  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Chafiktech <noreply@chafiktech.com>',
        to,
        subject: 'Reset Your Password - Chafiktech',
        html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 30 minutes.</p>`
      })
    });
    return;
  }

  if (process.env.SENDGRID_API_KEY) {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@chafiktech.com', name: 'Chafiktech' },
        subject: 'Reset Your Password - Chafiktech',
        content: [{ type: 'text/html', value: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 30 minutes.</p>` }]
      })
    });
  }
}
