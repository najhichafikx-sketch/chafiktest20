import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  console.warn('JWT_SECRET not set — using fallback (insecure!)');
  return 'chafiktech_fallback_secret_' + (process.env.VERCEL_DEPLOY_ID || Date.now());
}

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

export function extractToken(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
}

export function verifyAdmin(request) {
  const token = extractToken(request);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') return null;
  return decoded;
}

export function verifyUser(request) {
  const token = extractToken(request);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  if (decoded.role === 'admin') return { id: 0, role: 'admin', email: 'admin' };
  return decoded;
}

export function optionalUser(request) {
  const token = extractToken(request);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  if (decoded.role === 'admin') return { id: 0, role: 'admin', email: 'admin' };
  return decoded;
}

export function adminPassword() {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw) return pw;
  console.warn('ADMIN_PASSWORD not set — using fallback');
  return 'admin_chafiktech_2024';
}
