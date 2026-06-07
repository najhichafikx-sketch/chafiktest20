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
      return await sql.query(text, params);
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
    await sql.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      salt TEXT NOT NULL,
      credits INTEGER DEFAULT 5,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS generations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      tool_id TEXT NOT NULL,
      input_text TEXT,
      result_html TEXT,
      model_used TEXT,
      is_saved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS api_settings (
      provider TEXT PRIMARY KEY,
      api_key TEXT,
      status TEXT DEFAULT 'inactive',
      settings JSONB DEFAULT '{}',
      usage_count INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      details JSONB DEFAULT '{}'
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS ad_settings (
      id SERIAL PRIMARY KEY,
      location TEXT UNIQUE NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      code TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS tool_settings (
      tool_id TEXT PRIMARY KEY,
      enabled BOOLEAN DEFAULT TRUE,
      model TEXT DEFAULT 'openai/gpt-4o-mini',
      system_prompt TEXT DEFAULT '',
      monetization_tier TEXT DEFAULT 'standard',
      ad_frequency TEXT DEFAULT 'normal',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_id INTEGER,
      page_url TEXT DEFAULT '',
      session_id TEXT DEFAULT '',
      metadata JSONB DEFAULT '{}',
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp)`);
    await sql.query(`CREATE TABLE IF NOT EXISTS ad_config (
      tool_id TEXT PRIMARY KEY,
      tier TEXT DEFAULT 'standard',
      sidebar_enabled BOOLEAN DEFAULT FALSE,
      content_ads_enabled BOOLEAN DEFAULT TRUE,
      max_ads_per_page INTEGER DEFAULT 3,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS blog_posts (
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
      seo_title TEXT DEFAULT '',
      keywords TEXT[] DEFAULT '{}',
      reading_time INTEGER DEFAULT 5,
      status TEXT DEFAULT 'published',
      published_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT ''`);
    await sql.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}'`);
    await sql.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_link TEXT DEFAULT ''`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at)`);
    await sql.query(`CREATE TABLE IF NOT EXISTS prompts (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      cover_image TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tags TEXT[] DEFAULT '{}',
      category TEXT DEFAULT 'General',
      tool TEXT DEFAULT '',
      usage_guide TEXT DEFAULT '',
      content TEXT DEFAULT '',
      views INTEGER DEFAULT 0,
      trending INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_prompts_slug ON prompts(slug)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_prompts_tool ON prompts(tool)`);
    await sql.query(`CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      last_used TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS landing_page_rate_limits (
      user_identifier TEXT PRIMARY KEY,
      last_generated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    try {
      await seedBlogPostsFromFile();
    } catch (seedErr) {
      console.warn('Blog seed from file failed (non-fatal):', seedErr.message);
    }
    return true;
  } catch (err) {
    console.error('DB init failed:', err);
    return false;
  }
}

async function seedBlogPostsFromFile() {
  const sql = getSql();
  if (!sql) return;
  const check = await sql`SELECT COUNT(*)::int AS c FROM blog_posts`;
  const existing = check[0]?.c || 0;
  if (existing > 0) {
    console.log(`Blog seed: ${existing} posts already in DB, skipping`);
    return;
  }
  const fs = require('fs');
  const file = BLOG_FILE;
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const posts = Array.isArray(data) ? data : (data.posts || []);
  console.log(`Blog seed: inserting ${posts.length} posts from file into DB`);
  for (const p of posts) {
    try {
      await sql`
        INSERT INTO blog_posts (id, slug, title, excerpt, content, category, tags, author, featured_image, meta_description, seo_title, keywords, reading_time, status, published_at, created_at, updated_at)
        VALUES (${Number(p.id) || null}, ${p.slug || ''}, ${p.title || ''}, ${p.excerpt || ''}, ${p.content || ''}, ${p.category || 'General'}, ${Array.isArray(p.tags) ? p.tags : []}, ${p.author || 'Chafiktech Ai'}, ${p.featured_image || ''}, ${p.meta_description || ''}, ${p.seo_title || ''}, ${Array.isArray(p.keywords) ? p.keywords : []}, ${Number(p.reading_time) || 5}, ${p.status || 'published'}, ${p.published_at || null}, ${p.created_at || null}, NOW())
        ON CONFLICT (id) DO NOTHING
      `;
    } catch (e) {
      console.warn(`Blog seed: failed to insert ${p.slug}:`, e.message);
    }
  }
  console.log('Blog seed: complete');
  try {
    await sql.query(`SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM blog_posts))`);
    console.log('Blog seed: sequence synced');
  } catch (e) {
    console.warn('Blog seed: sequence sync failed:', e.message);
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
    try {
      const sql = getSql();
      if (sql) {
        if (status === 'all') return await sql`SELECT * FROM blog_posts ORDER BY COALESCE(published_at, updated_at, created_at) DESC NULLS LAST`;
        return await sql`SELECT * FROM blog_posts WHERE status = ${status} ORDER BY COALESCE(published_at, updated_at, created_at) DESC NULLS LAST`;
      }
    } catch (err) {
      console.warn('getBlogPosts DB query failed, falling back to file:', err.message);
    }
  }
  const posts = loadBlogPosts();
  if (status === 'all') return posts.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
  return posts.filter(p => p.status === status).sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
}

export async function getBlogPostById(id) {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        const rows = await sql`SELECT * FROM blog_posts WHERE id = ${Number(id)}`;
        if (rows.length > 0) return rows[0];
      }
    } catch (err) {
      console.warn('getBlogPostById DB query failed, falling back to file:', err.message);
    }
  }
  const posts = loadBlogPosts();
  return (posts || []).find(p => p.id === Number(id) || p.id === id) || null;
}

export async function getBlogPostBySlug(slug) {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug}`;
        if (rows.length > 0) return rows[0];
      }
    } catch (err) {
      console.warn('getBlogPostBySlug DB query failed, falling back to file:', err.message);
    }
  }
  const posts = loadBlogPosts();
  return (posts || []).find(p => p.slug === slug) || null;
}

let blogIdCounter = 100;

const ALLOWED_BLOG_FIELDS = new Set([
  'slug', 'title', 'excerpt', 'content', 'category', 'tags', 'author',
  'featured_image', 'meta_description', 'seo_title', 'keywords',
  'reading_time', 'status', 'external_link'
]);

function filterBlogFields(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (ALLOWED_BLOG_FIELDS.has(k)) out[k] = v;
  }
  return out;
}

export async function createBlogPost(data) {
  const clean = filterBlogFields(data);
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      await sql.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_link TEXT DEFAULT ''`).catch(() => {});
      await sql.query(`SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 0) FROM blog_posts), false)`).catch(() => {});
      const rows = await sql`
        INSERT INTO blog_posts (slug, title, excerpt, content, category, tags, author, featured_image, meta_description, seo_title, keywords, reading_time, status, external_link)
        VALUES (${clean.slug}, ${clean.title}, ${clean.excerpt || ''}, ${clean.content || ''}, ${clean.category || 'General'}, ${clean.tags || []}, ${clean.author || 'Chafiktech Ai'}, ${clean.featured_image || ''}, ${clean.meta_description || ''}, ${clean.seo_title || ''}, ${clean.keywords || []}, ${clean.reading_time || 5}, ${clean.status || 'draft'}, ${clean.external_link || ''})
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
    ...clean,
    tags: Array.isArray(clean.tags) ? clean.tags : (clean.tags ? clean.tags.split(',').map(t => t.trim()) : []),
    keywords: Array.isArray(clean.keywords) ? clean.keywords : (clean.keywords ? clean.keywords.split(',').map(k => k.trim()) : []),
    excerpt: clean.excerpt || '',
    content: clean.content || '',
    category: clean.category || 'General',
    author: clean.author || 'Chafiktech Ai',
    featured_image: clean.featured_image || '',
    meta_description: clean.meta_description || '',
    seo_title: clean.seo_title || '',
    reading_time: clean.reading_time || 5,
    status: clean.status || 'draft',
    published_at: clean.status === 'published' ? now : null,
    created_at: now,
    updated_at: now
  };
  posts.push(post);
  saveBlogPosts(posts);
  return post;
}

export async function updateBlogPost(id, data) {
  const clean = filterBlogFields(data);
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      await sql.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_link TEXT DEFAULT ''`).catch(() => {});
      const numId = Number(id);
      const exists = await sql`SELECT id FROM blog_posts WHERE id = ${numId} LIMIT 1`;
      if (exists.length === 0) {
        const fromFile = (loadBlogPosts() || []).find(p => Number(p.id) === numId || p.id === id);
        if (fromFile) {
          try {
            await sql`
              INSERT INTO blog_posts (id, slug, title, excerpt, content, category, tags, author, featured_image, meta_description, seo_title, keywords, reading_time, status, external_link, published_at, created_at, updated_at)
              VALUES (${numId}, ${fromFile.slug || ''}, ${fromFile.title || 'Untitled'}, ${fromFile.excerpt || ''}, ${fromFile.content || ''}, ${fromFile.category || 'General'}, ${Array.isArray(fromFile.tags) ? fromFile.tags : []}, ${fromFile.author || 'Chafiktech Ai'}, ${fromFile.featured_image || ''}, ${fromFile.meta_description || ''}, ${fromFile.seo_title || ''}, ${Array.isArray(fromFile.keywords) ? fromFile.keywords : []}, ${Number(fromFile.reading_time) || 5}, ${fromFile.status || 'published'}, ${fromFile.external_link || ''}, ${fromFile.published_at || null}, ${fromFile.created_at || null}, NOW())
              ON CONFLICT (id) DO NOTHING
            `;
          } catch (seedErr) {
            console.warn('updateBlogPost: ensure-exists failed:', seedErr.message);
          }
        }
      }
      const sets = [];
      const vals = [];
      let i = 1;
      for (const [key, val] of Object.entries(clean)) {
        if (key === 'id') continue;
        sets.push(`${key} = $${i}`);
        vals.push((key === 'tags' || key === 'keywords') ? (Array.isArray(val) ? val : []) : val);
        i++;
      }
      if (sets.length === 0) return;
      vals.push(numId);
      await sql.query(
        `UPDATE blog_posts SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
        vals
      );
      return;
    }
  }
  const posts = loadBlogPosts();
  const idx = posts.findIndex(p => p.id === Number(id) || p.id === id);
  if (idx >= 0) {
    posts[idx] = { ...posts[idx], ...clean, id: posts[idx].id, updated_at: new Date().toISOString() };
    if (clean.status === 'published' && !posts[idx].published_at) posts[idx].published_at = new Date().toISOString();
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

export async function getPrompts(category = '', status = 'published') {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      if (status === 'all') {
        if (category) return await sql`SELECT * FROM prompts WHERE category = ${category} ORDER BY created_at DESC`;
        return await sql`SELECT * FROM prompts ORDER BY created_at DESC`;
      }
      if (category) return await sql`SELECT * FROM prompts WHERE status = ${status} AND category = ${category} ORDER BY created_at DESC`;
      return await sql`SELECT * FROM prompts WHERE status = ${status} ORDER BY created_at DESC`;
    }
  }
  const prompts = loadPrompts();
  let filtered = status === 'all' ? prompts : prompts.filter(p => p.status === status);
  if (!category) return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return filtered.filter(p => p.category === category).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getPromptBySlug(slug) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql`SELECT * FROM prompts WHERE slug = ${slug}`;
      return rows.length > 0 ? rows[0] : null;
    }
  }
  const prompts = loadPrompts();
  return prompts.find(p => p.slug === slug) || null;
}

export async function getPromptById(id) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql`SELECT * FROM prompts WHERE id = ${Number(id)}`;
      return rows.length > 0 ? rows[0] : null;
    }
  }
  const prompts = loadPrompts();
  return prompts.find(p => p.id === Number(id) || p.id === id) || null;
}

export async function createPrompt(data) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        INSERT INTO prompts (slug, title, cover_image, description, tags, category, tool, usage_guide, content, status)
        VALUES (${data.slug}, ${data.title}, ${data.cover_image || ''}, ${data.description || ''}, ${data.tags || []}, ${data.category || 'General'}, ${data.tool || ''}, ${data.usage_guide || ''}, ${data.content || ''}, ${data.status || 'published'})
        RETURNING id
      `;
      return rows[0];
    }
  }
  const prompts = loadPrompts();
  if (prompts.length > 0) promptIdCounter = Math.max(...prompts.map(p => Number(p.id) || 0)) + 1;
  const now = new Date().toISOString();
  const prompt = {
    id: promptIdCounter++,
    slug: data.slug,
    title: data.title,
    cover_image: data.cover_image || '',
    description: data.description || '',
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
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
      await sql.query(
        `UPDATE prompts SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
        vals
      );
      return;
    }
  }
  const prompts = loadPrompts();
  const idx = prompts.findIndex(p => p.id === Number(id) || p.id === id);
  if (idx >= 0) {
    prompts[idx] = { ...prompts[idx], ...data, id: prompts[idx].id, updated_at: new Date().toISOString() };
    savePrompts(prompts);
  }
}

export async function deletePrompt(id) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) { await sql`DELETE FROM prompts WHERE id = ${Number(id)}`; return; }
  }
  const prompts = loadPrompts();
  savePrompts(prompts.filter(p => p.id !== Number(id) && p.id !== id));
}

export async function incrementPromptViews(slug) {
  if (dbAvailable()) {
    const sql = getSql();
    if (sql) { await sql`UPDATE prompts SET views = views + 1 WHERE slug = ${slug}`; return; }
  }
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

export async function getRateLimitLastUsed(key) {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        const rows = await sql`SELECT last_used FROM rate_limits WHERE key = ${key} LIMIT 1`;
        if (rows.length > 0) return new Date(rows[0].last_used).getTime();
      }
    } catch (err) {
      console.warn('getRateLimitLastUsed DB query failed:', err.message);
    }
  }
  return 0;
}

export async function setRateLimitLastUsed(key) {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        await sql`
          INSERT INTO rate_limits (key, last_used) VALUES (${key}, NOW())
          ON CONFLICT (key) DO UPDATE SET last_used = NOW()
        `;
        return true;
      }
    } catch (err) {
      console.warn('setRateLimitLastUsed DB query failed:', err.message);
    }
  }
  return false;
}

export async function getDailyUsageCount() {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        const rows = await sql`SELECT COUNT(*)::int AS c FROM rate_limits WHERE last_used >= CURRENT_DATE`;
        return rows[0]?.c || 0;
      }
    } catch (err) {
      console.warn('getDailyUsageCount DB query failed:', err.message);
    }
  }
  return 0;
}

export async function getLPRateLimit(userIdentifier) {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        const rows = await sql`SELECT last_generated_at FROM landing_page_rate_limits WHERE user_identifier = ${userIdentifier} LIMIT 1`;
        if (rows.length > 0) return { lastUsed: new Date(rows[0].last_generated_at).getTime(), found: true };
      }
    } catch (err) {
      console.warn('getLPRateLimit DB query failed:', err.message);
    }
  }
  return { lastUsed: 0, found: false };
}

export async function setLPRateLimit(userIdentifier) {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        await sql`
          INSERT INTO landing_page_rate_limits (user_identifier, last_generated_at) VALUES (${userIdentifier}, NOW())
          ON CONFLICT (user_identifier) DO UPDATE SET last_generated_at = NOW()
        `;
        return true;
      }
    } catch (err) {
      console.warn('setLPRateLimit DB query failed:', err.message);
    }
  }
  return false;
}

export async function getMonthlyUsageCount() {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        const rows = await sql`SELECT COUNT(*)::int AS c FROM landing_page_rate_limits WHERE last_generated_at >= date_trunc('month', CURRENT_DATE)`;
        return rows[0]?.c || 0;
      }
    } catch (err) {
      console.warn('getMonthlyUsageCount DB query failed:', err.message);
    }
  }
  return 0;
}

export async function getLastUsedTimestamp() {
  if (dbAvailable()) {
    try {
      const sql = getSql();
      if (sql) {
        const rows = await sql`SELECT last_generated_at FROM landing_page_rate_limits ORDER BY last_generated_at DESC LIMIT 1`;
        if (rows.length > 0) return new Date(rows[0].last_generated_at).toISOString();
      }
    } catch (err) {
      console.warn('getLastUsedTimestamp DB query failed:', err.message);
    }
  }
  return null;
}
