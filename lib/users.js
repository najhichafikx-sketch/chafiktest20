import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const ITERATIONS = 600000;

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function getSb(useServiceRole = true) {
  const key = useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const missingVars = [];
  if (!SB_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!key) missingVars.push(useServiceRole ? 'SUPABASE_SERVICE_ROLE_KEY' : 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (missingVars.length) throw new Error(`Supabase not configured. Set these in .env.local + Vercel: ${missingVars.join(', ')}`);
  return createClient(SB_URL, key, { auth: { persistSession: false } });
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha512').toString('hex');
}

export async function createUser(email, password) {
  const sb = getSb();
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = hashPassword(password, salt);

  const { data, error } = await sb
    .from('auth_users')
    .insert({ email, password: hash, salt, credits: 5, plan: 'free' })
    .select('id, email, credits, plan, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return null;
    throw new Error(`Supabase insert failed: ${error.message}`);
  }
  return data;
}

export async function findUser(email) {
  const sb = getSb();
  const { data, error } = await sb
    .from('auth_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return data || null;
}

export async function findUserById(id) {
  const sb = getSb();
  const { data, error } = await sb
    .from('auth_users')
    .select('id, email, credits, plan, created_at')
    .eq('id', Number(id))
    .maybeSingle();

  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return data || null;
}

export async function verifyPassword(password, salt, hash) {
  if (!password || !salt || !hash) return false;
  return hashPassword(password, salt) === hash;
}

export async function deductCredits(userId) {
  const sb = getSb();
  const { data } = await sb
    .from('auth_users')
    .select('credits')
    .eq('id', Number(userId))
    .maybeSingle();

  if (!data) throw new Error('User not found');
  const newCredits = Math.max((data.credits || 0) - 1, 0);
  const { error } = await sb
    .from('auth_users')
    .update({ credits: newCredits })
    .eq('id', Number(userId));

  if (error) throw new Error(`Failed to deduct credits: ${error.message}`);
}

export async function getDailyGenerationCount(userId) {
  return 0;
}

export async function getUsers() {
  const sb = getSb();
  const { data, error } = await sb
    .from('auth_users')
    .select('id, email, credits, plan, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  return data || [];
}

export async function getUserByEmail(email) {
  return findUser(email);
}

export async function getUsersStats() {
  const sb = getSb();
  const { data, error } = await sb
    .from('auth_users')
    .select('id, email, credits, plan, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  const users = data || [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    total: users.length,
    active: users.length,
    newToday: users.filter(u => u.created_at && u.created_at.startsWith(today)).length,
    newThisWeek: users.filter(u => u.created_at && u.created_at >= sevenDaysAgo).length,
    newThisMonth: users.filter(u => u.created_at && u.created_at >= thirtyDaysAgo).length
  };
}

export async function updateUser(id, data) {
  const sb = getSb();
  const { error } = await sb
    .from('auth_users')
    .update(data)
    .eq('id', Number(id));

  if (error) throw new Error(`Failed to update user: ${error.message}`);
}

export async function deleteUserRecord(id) {
  const sb = getSb();
  const { error } = await sb
    .from('auth_users')
    .delete()
    .eq('id', Number(id));

  if (error) throw new Error(`Failed to delete user: ${error.message}`);
}

export async function setResetToken(email, token, expiresAt) {
  const sb = getSb();
  const { error } = await sb
    .from('auth_users')
    .update({ reset_token: token, reset_token_expires: expiresAt.toISOString() })
    .eq('email', email);

  if (error) throw new Error(`Failed to set reset token: ${error.message}`);
  return true;
}

export async function findUserByResetToken(token) {
  const sb = getSb();
  const { data, error } = await sb
    .from('auth_users')
    .select('*')
    .eq('reset_token', token)
    .gte('reset_token_expires', new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(`Failed to find reset token: ${error.message}`);
  return data || null;
}

export async function updatePasswordById(userId, password, salt) {
  const sb = getSb();
  const hash = hashPassword(password, salt);
  const { error } = await sb
    .from('auth_users')
    .update({ password: hash, salt, reset_token: '', reset_token_expires: null })
    .eq('id', Number(userId));

  if (error) throw new Error(`Failed to update password: ${error.message}`);
  return true;
}
