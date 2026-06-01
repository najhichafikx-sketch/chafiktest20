import jwt from 'jsonwebtoken';

function getJwtSecret() {
  return process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET must be set in production'); })() : 'dev_secret_not_for_production');
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
  return process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('ADMIN_PASSWORD must be set in production'); })() : 'admin123');
}
