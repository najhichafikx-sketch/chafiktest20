import fs from 'fs';
import path from 'path';
import { getSql } from '@/lib/db';

const DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DIR = (() => { try { return fs.existsSync('/tmp') ? path.join('/tmp', 'data') : path.join(process.cwd(), '.tmp-data'); } catch { return path.join(process.cwd(), '.tmp-data'); } })();
const LAB_FILE = path.join(DATA_DIR, 'lab-users.json');

function findFile(filename) {
  const inTmp = path.join(TMP_DIR, path.basename(filename));
  if (fs.existsSync(inTmp)) return inTmp;
  return filename;
}

function ensureDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  try { if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true }); } catch {}
}

function readLabUsers() {
  try { ensureDir(); const f = findFile(LAB_FILE); if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8')); } catch {}
  return [];
}

function writeLabUsers(users) {
  ensureDir();
  const json = JSON.stringify(users, null, 2);
  try { fs.writeFileSync(LAB_FILE, json, 'utf-8'); return; } catch {}
  try { fs.writeFileSync(path.join(TMP_DIR, 'lab-users.json'), json, 'utf-8'); } catch {}
}

function getUser(users, userId) {
  return users.find(u => u.id === userId);
}

function saveUser(users, userId, updates) {
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() };
  } else {
    users.push({ id: userId, lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0, tests_completed: 0, created_at: new Date().toISOString(), ...updates, updated_at: new Date().toISOString() });
  }
  writeLabUsers(users);
  return users.find(u => u.id === userId);
}

export async function getLabUser(userId) {
  if (!userId) return null;
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
      if (rows.length > 0) return rows[0];
    } catch {}
  }
  const users = readLabUsers();
  const u = getUser(users, userId);
  return u ? { lab_points: u.lab_points, lab_sessions: u.lab_sessions, lab_earned: u.lab_earned, lab_spent: u.lab_spent } : null;
}

export async function ensureLabUser(userId) {
  if (!userId) return { lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 };
  const existing = await getLabUser(userId);
  if (existing) return existing;
  const sql = getSql();
  if (sql) {
    try {
      await sql`INSERT INTO platform_users (id, lab_points, lab_sessions, lab_earned, lab_spent) VALUES (${userId}, 0, 0, 0, 0) ON CONFLICT (id) DO NOTHING`;
    } catch {}
  }
  const users = readLabUsers();
  saveUser(users, userId, {});
  return { lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 };
}

export async function earnPoints(userId, amount) {
  const pts = Math.max(1, Math.floor(amount || 1));
  const sql = getSql();
  if (sql) {
    try {
      await sql`UPDATE platform_users SET lab_points = lab_points + ${pts}, lab_earned = lab_earned + ${pts} WHERE id = ${userId}`;
      const rows = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
      if (rows.length > 0) return rows[0];
    } catch {}
  }
  const users = readLabUsers();
  const u = getUser(users, userId);
  const current = u || { lab_points: 0, lab_sessions: 0, lab_earned: 0, lab_spent: 0 };
  const updated = saveUser(users, userId, { lab_points: current.lab_points + pts, lab_earned: current.lab_earned + pts });
  return { lab_points: updated.lab_points, lab_sessions: updated.lab_sessions, lab_earned: updated.lab_earned, lab_spent: updated.lab_spent };
}

export async function purchaseScreens(userId, screens) {
  const packages = { 4: 10, 6: 14, 10: 20 };
  const cost = packages[screens];
  if (!cost) return { error: 'Invalid package. Choose 4, 6, or 10 screens.' };

  const sql = getSql();
  if (sql) {
    try {
      const existing = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
      if (existing.length === 0) return { error: 'User not found' };
      const u = existing[0];
      if (u.lab_points < cost) return { error: 'Not enough lab points' };
      await sql`UPDATE platform_users SET lab_points = lab_points - ${cost}, lab_sessions = lab_sessions + ${screens}, lab_spent = lab_spent + ${cost} WHERE id = ${userId}`;
      const rows = await sql`SELECT lab_points, lab_sessions, lab_earned, lab_spent FROM platform_users WHERE id = ${userId}`;
      if (rows.length > 0) return rows[0];
    } catch (e) { return { error: e.message }; }
  }

  const users = readLabUsers();
  const u = getUser(users, userId);
  if (!u) return { error: 'User not found' };
  if (u.lab_points < cost) return { error: 'Not enough lab points' };
  const updated = saveUser(users, userId, { lab_points: u.lab_points - cost, lab_sessions: u.lab_sessions + screens, lab_spent: u.lab_spent + cost });
  return { lab_points: updated.lab_points, lab_sessions: updated.lab_sessions, lab_earned: updated.lab_earned, lab_spent: updated.lab_spent };
}

export async function runTest(userId) {
  const sql = getSql();
  if (sql) {
    try {
      const existing = await sql`SELECT lab_sessions FROM platform_users WHERE id = ${userId}`;
      if (existing.length === 0) return { error: 'User not found' };
      if (existing[0].lab_sessions < 1) return { error: 'No lab sessions remaining' };
      await sql`UPDATE platform_users SET lab_sessions = lab_sessions - 1, tests_completed = tests_completed + 1 WHERE id = ${userId}`;
      const rows = await sql`SELECT lab_sessions FROM platform_users WHERE id = ${userId}`;
      if (rows.length > 0) return { lab_sessions: rows[0].lab_sessions };
    } catch (e) { return { error: e.message }; }
  }

  const users = readLabUsers();
  const u = getUser(users, userId);
  if (!u) return { error: 'User not found' };
  if (u.lab_sessions < 1) return { error: 'No lab sessions remaining' };
  const updated = saveUser(users, userId, { lab_sessions: u.lab_sessions - 1, tests_completed: (u.tests_completed || 0) + 1 });
  return { lab_sessions: updated.lab_sessions };
}
