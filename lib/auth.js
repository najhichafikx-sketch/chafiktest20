import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function requireJwtSecret() {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not set in environment. Add it to .env.local and Vercel env.');
  return JWT_SECRET;
}

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, requireJwtSecret(), { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, requireJwtSecret());
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

export function verifyAdminToken(token) {
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
  if (!pw) throw new Error('ADMIN_PASSWORD not set in environment. Add it to .env.local and Vercel env.');
  return pw;
}
