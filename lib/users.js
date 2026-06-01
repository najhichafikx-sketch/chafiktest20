import crypto from 'crypto';
import { query } from './db';

const ITERATIONS = 600000;

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha512').toString('hex');
}

export async function createUser(email, password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = hashPassword(password, salt);
  const rows = await query(
    'INSERT INTO users (email, password, salt, credits, plan) VALUES ($1, $2, $3, 5, $4) RETURNING id, email, credits, plan, created_at',
    [email, hash, salt, 'free']
  );
  return rows?.[0] || null;
}

export async function findUser(email) {
  const rows = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows?.[0] || null;
}

export async function findUserById(id) {
  const rows = await query('SELECT id, email, credits, plan, created_at FROM users WHERE id = $1', [id]);
  return rows?.[0] || null;
}

export async function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) return false;
  return hashPassword(password, salt) === hash;
}

export async function deductCredits(userId) {
  await query('UPDATE users SET credits = credits - 1 WHERE id = $1 AND credits > 0', [userId]);
}

export async function getDailyGenerationCount(userId) {
  const rows = await query(
    "SELECT COUNT(*) as count FROM generations WHERE user_id = $1 AND created_at::date = CURRENT_DATE",
    [userId]
  );
  return rows?.[0]?.count || 0;
}
