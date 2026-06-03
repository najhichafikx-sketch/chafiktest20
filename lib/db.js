import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = () => process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
const MAX_RETRIES = 3;

const DATA_DIR = path.join(process.cwd(), 'data');
const ADS_FILE = path.join(DATA_DIR, 'ads.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function readJsonFile(file) {
  try { ensureDataDir(); if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch {}
  return [];
}

function writeJsonFile(file, data) {
  try { ensureDataDir(); fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8'); } catch {}
}

function dbAvailable() {
  return !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
}

function getSql() {
  const url = DATABASE_URL();
  if (!url) return null;
  return neon(url);
}

export async function query(text, params = []) {
  const sql = getSql();
  if (!sql) return null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await sql(text, params);
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise(r => setTimeout(r, attempt * 200));
    }
  }
}

export async function initDB() {
  const sql = getSql();
  if (!sql) return false;
  try {
    await sql(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      salt TEXT NOT NULL,
      credits INTEGER DEFAULT 5,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS generations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tool_id TEXT NOT NULL,
      input_text TEXT,
      result_html TEXT,
      model_used TEXT,
      is_saved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS api_settings (
      provider TEXT PRIMARY KEY,
      api_key TEXT,
      status TEXT DEFAULT 'inactive',
      settings JSONB DEFAULT '{}',
      usage_count INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      details JSONB DEFAULT '{}'
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS ad_settings (
      id SERIAL PRIMARY KEY,
      location TEXT UNIQUE NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      code TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS tool_settings (
      tool_id TEXT PRIMARY KEY,
      enabled BOOLEAN DEFAULT TRUE,
      model TEXT DEFAULT 'anthropic/claude-3-haiku',
      system_prompt TEXT DEFAULT '',
      monetization_tier TEXT DEFAULT 'standard',
      ad_frequency TEXT DEFAULT 'normal',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id INTEGER,
      page_url TEXT DEFAULT '',
      session_id TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}',
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp)`);
    await sql(`CREATE TABLE IF NOT EXISTS ad_config (
      tool_id TEXT PRIMARY KEY,
      tier TEXT DEFAULT 'standard',
      sidebar_enabled BOOLEAN DEFAULT FALSE,
      content_ads_enabled BOOLEAN DEFAULT TRUE,
      max_ads_per_page INTEGER DEFAULT 3,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      content TEXT DEFAULT '',
      category TEXT DEFAULT 'General',
      tags TEXT[] DEFAULT '{}',
      author TEXT DEFAULT 'Chafiktech Ai',
      featured_image TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      reading_time INTEGER DEFAULT 5,
      status TEXT DEFAULT 'published',
      published_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at)`);
    return true;
  } catch (err) {
    console.error('DB init failed:', err);
    return false;
  }
}

export async function getSetting(key) {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`SELECT value FROM site_settings WHERE key = ${key}`;
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key, value) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

export async function getAdSettings() {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) return await sql`SELECT * FROM ad_settings ORDER BY id`;
  }
  return readJsonFile(ADS_FILE);
}

export async function saveAdSetting(id, data) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      if (id) {
        await sql`UPDATE ad_settings SET enabled = ${data.enabled}, code = ${data.code}, updated_at = NOW() WHERE id = ${id}`;
      } else {
        await sql`INSERT INTO ad_settings (location, enabled, code) VALUES (${data.location}, ${data.enabled}, ${data.code})`;
      }
      return;
    }
  }

  const ads = readJsonFile(ADS_FILE);
  const existing = ads.findIndex(a => a.location === data.location);
  const entry = { id: id || Date.now(), location: data.location, enabled: data.enabled, code: data.code || '', updated_at: new Date().toISOString() };
  if (existing >= 0) ads[existing] = entry; else ads.push(entry);
  writeJsonFile(ADS_FILE, ads);
}

export async function getToolSettings() {
  const sql = getSql();
  if (!sql) return [];
  return await sql`SELECT * FROM tool_settings ORDER BY tool_id`;
}

export async function saveToolSetting(toolId, data) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO tool_settings (tool_id, enabled, model, system_prompt, updated_at)
    VALUES (${toolId}, ${data.enabled}, ${data.model}, ${data.system_prompt || ''}, NOW())
    ON CONFLICT (tool_id) DO UPDATE SET
      enabled = EXCLUDED.enabled,
      model = EXCLUDED.model,
      system_prompt = EXCLUDED.system_prompt,
      updated_at = NOW()
  `;
}

export async function getAdConfig(toolId) {
  const sql = getSql();
  if (!sql) return { tool_id: toolId, tier: 'standard', sidebar_enabled: false, content_ads_enabled: true, max_ads_per_page: 3 };
  const rows = await sql`SELECT * FROM ad_config WHERE tool_id = ${toolId}`;
  if (rows.length > 0) return rows[0];
  return { tool_id: toolId, tier: 'standard', sidebar_enabled: false, content_ads_enabled: true, max_ads_per_page: 3 };
}

export async function setAdConfig(toolId, data) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO ad_config (tool_id, tier, sidebar_enabled, content_ads_enabled, max_ads_per_page, updated_at)
    VALUES (${toolId}, ${data.tier || 'standard'}, ${data.sidebar_enabled || false}, ${data.content_ads_enabled !== false}, ${data.max_ads_per_page || 3}, NOW())
    ON CONFLICT (tool_id) DO UPDATE SET
      tier = EXCLUDED.tier,
      sidebar_enabled = EXCLUDED.sidebar_enabled,
      content_ads_enabled = EXCLUDED.content_ads_enabled,
      max_ads_per_page = EXCLUDED.max_ads_per_page,
      updated_at = NOW()
  `;
}

export async function getAllAdConfigs() {
  const sql = getSql();
  if (!sql) return [];
  return await sql`SELECT * FROM ad_config ORDER BY tool_id`;
}

const BLOG_FILE = path.join(DATA_DIR, 'blog.json');

function loadBlogPosts() {
  return readJsonFile(BLOG_FILE);
}

function saveBlogPosts(posts) {
  writeJsonFile(BLOG_FILE, posts);
}

export async function getBlogPosts(status = 'published') {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      if (status === 'all') return await sql`SELECT * FROM blog_posts ORDER BY published_at DESC`;
      return await sql`SELECT * FROM blog_posts WHERE status = ${status} ORDER BY published_at DESC`;
    }
  }
  const posts = loadBlogPosts();
  if (status === 'all') return posts.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
  return posts.filter(p => p.status === status).sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
}

export async function getBlogPostById(id) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql`SELECT * FROM blog_posts WHERE id = ${Number(id)}`;
      return rows.length > 0 ? rows[0] : null;
    }
  }
  const posts = loadBlogPosts();
  return posts.find(p => p.id === Number(id) || p.id === id) || null;
}

export async function getBlogPostBySlug(slug) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug}`;
      return rows.length > 0 ? rows[0] : null;
    }
  }
  const posts = loadBlogPosts();
  return posts.find(p => p.slug === slug) || null;
}

let blogIdCounter = 100;

export async function createBlogPost(data) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        INSERT INTO blog_posts (slug, title, excerpt, content, category, tags, author, featured_image, meta_description, reading_time, status)
        VALUES (${data.slug}, ${data.title}, ${data.excerpt || ''}, ${data.content || ''}, ${data.category || 'General'}, ${data.tags || []}, ${data.author || 'Chafiktech Ai'}, ${data.featured_image || ''}, ${data.meta_description || ''}, ${data.reading_time || 5}, ${data.status || 'draft'})
        RETURNING id
      `;
      return rows[0];
    }
  }
  const posts = loadBlogPosts();
  if (posts.length > 0) blogIdCounter = Math.max(...posts.map(p => Number(p.id) || 0)) + 1;
  const now = new Date().toISOString();
  const post = {
    id: blogIdCounter++,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt || '',
    content: data.content || '',
    category: data.category || 'General',
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()) : []),
    author: data.author || 'Chafiktech Ai',
    featured_image: data.featured_image || '',
    meta_description: data.meta_description || '',
    reading_time: data.reading_time || 5,
    status: data.status || 'draft',
    published_at: data.status === 'published' ? now : null,
    created_at: now,
    updated_at: now
  };
  posts.push(post);
  saveBlogPosts(posts);
  return post;
}

export async function updateBlogPost(id, data) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      const sets = [];
      const vals = [];
      let i = 1;
      for (const [key, val] of Object.entries(data)) {
        if (key === 'id') continue;
        sets.push(`${key} = $${i}`);
        vals.push(key === 'tags' ? (Array.isArray(val) ? val : []) : val);
        i++;
      }
      vals.push(Number(id));
      await sql`
        UPDATE blog_posts SET ${sql(sets.join(', '), ...vals)}, updated_at = NOW()
        WHERE id = ${id}
      `;
      return;
    }
  }
  const posts = loadBlogPosts();
  const idx = posts.findIndex(p => p.id === Number(id) || p.id === id);
  if (idx >= 0) {
    posts[idx] = { ...posts[idx], ...data, id: posts[idx].id, updated_at: new Date().toISOString() };
    if (data.status === 'published' && !posts[idx].published_at) posts[idx].published_at = new Date().toISOString();
    saveBlogPosts(posts);
  }
}

export async function deleteBlogPost(id) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) { await sql`DELETE FROM blog_posts WHERE id = ${Number(id)}`; return; }
  }
  const posts = loadBlogPosts();
  saveBlogPosts(posts.filter(p => p.id !== Number(id) && p.id !== id));
}

export async function getLogs(limit = 100) {
  const sql = getSql();
  if (!sql) return [];
  return await sql`SELECT * FROM logs ORDER BY timestamp DESC LIMIT ${limit}`;
}

export async function writeLog(level, message, details = {}) {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`INSERT INTO logs (level, message, details) VALUES (${level}, ${message}, ${JSON.stringify(details)}::jsonb)`;
  } catch (err) {
    console.error('Log write failed:', err);
  }
}

const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');

function loadPrompts() {
  return readJsonFile(PROMPTS_FILE);
}

function savePrompts(prompts) {
  writeJsonFile(PROMPTS_FILE, prompts);
}

let promptIdCounter = 1;

export async function getPrompts(category = '') {
  const prompts = loadPrompts();
  if (!category) return prompts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return prompts.filter(p => p.category === category).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getPromptBySlug(slug) {
  const prompts = loadPrompts();
  return prompts.find(p => p.slug === slug) || null;
}

export async function getPromptById(id) {
  const prompts = loadPrompts();
  return prompts.find(p => p.id === Number(id) || p.id === id) || null;
}

export async function createPrompt(data) {
  const prompts = loadPrompts();
  if (prompts.length > 0) promptIdCounter = Math.max(...prompts.map(p => Number(p.id) || 0)) + 1;
  const now = new Date().toISOString();
  const prompt = {
    id: promptIdCounter++,
    slug: data.slug,
    title: data.title,
    cover_image: data.cover_image || '',
    category: data.category || 'General',
    tool: data.tool || '',
    usage_guide: data.usage_guide || '',
    content: data.content || '',
    views: 0,
    trending: 0,
    status: data.status || 'published',
    created_at: now,
    updated_at: now
  };
  prompts.push(prompt);
  savePrompts(prompts);
  return prompt;
}

export async function updatePrompt(id, data) {
  const prompts = loadPrompts();
  const idx = prompts.findIndex(p => p.id === Number(id) || p.id === id);
  if (idx >= 0) {
    prompts[idx] = { ...prompts[idx], ...data, id: prompts[idx].id, updated_at: new Date().toISOString() };
    savePrompts(prompts);
  }
}

export async function deletePrompt(id) {
  const prompts = loadPrompts();
  savePrompts(prompts.filter(p => p.id !== Number(id) && p.id !== id));
}

export async function incrementPromptViews(slug) {
  const prompts = loadPrompts();
  const p = prompts.find(pr => pr.slug === slug);
  if (p) { p.views = (p.views || 0) + 1; savePrompts(prompts); }
}

// User management
const USERS_DATA_FILE = path.join(DATA_DIR, 'users-data.json');

function loadUsersData() {
  return readJsonFile(USERS_DATA_FILE);
}

function saveUsersData(users) {
  writeJsonFile(USERS_DATA_FILE, users);
}

export async function getUsers() {
  return loadUsersData();
}

export async function getUserByEmail(email) {
  const users = loadUsersData();
  return users.find(u => u.email === email) || null;
}

export async function createUserRecord(userData) {
  const users = loadUsersData();
  const now = new Date().toISOString();
  const user = {
    id: users.length + 1,
    email: userData.email,
    name: userData.name || userData.email.split('@')[0],
    status: 'active',
    total_generations: 0,
    last_login: now,
    created_at: now,
    updated_at: now
  };
  users.push(user);
  saveUsersData(users);
  return user;
}

export async function updateUser(id, data) {
  const users = loadUsersData();
  const idx = users.findIndex(u => u.id === Number(id) || u.id === id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...data, updated_at: new Date().toISOString() };
    saveUsersData(users);
  }
}

export async function deleteUserRecord(id) {
  const users = loadUsersData();
  saveUsersData(users.filter(u => u.id !== Number(id) && u.id !== id));
}

export async function getUsersStats() {
  const users = loadUsersData();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    newToday: users.filter(u => u.created_at && u.created_at.startsWith(today)).length,
    newThisWeek: users.filter(u => u.created_at && u.created_at >= sevenDaysAgo).length,
    newThisMonth: users.filter(u => u.created_at && u.created_at >= thirtyDaysAgo).length
  };
}
