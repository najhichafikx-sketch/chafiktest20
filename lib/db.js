import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';

const DATABASE_URL = () => process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';
const MAX_RETRIES = 3;

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSb() {
  if (!SB_URL || !SB_KEY) return null;
  return createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
}

function dbAvailable() {
  return !!(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);
}

export function getSql() {
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
    } catch {
      if (attempt === MAX_RETRIES) return null;
      await new Promise(r => setTimeout(r, attempt * 200));
    }
  }
  return null;
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
    await sql.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_link_label TEXT DEFAULT ''`);
    await sql.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS has_image BOOLEAN DEFAULT FALSE`);
    try { await sql.query(`UPDATE blog_posts SET has_image = TRUE WHERE featured_image != '' AND featured_image IS NOT NULL AND has_image = FALSE`); } catch {}
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

    await sql.query(`CREATE TABLE IF NOT EXISTS platform_users (
      id TEXT PRIMARY KEY,
      credits INTEGER DEFAULT 10 NOT NULL,
      total_earned INTEGER DEFAULT 0,
      total_spent INTEGER DEFAULT 0,
      videos_submitted INTEGER DEFAULT 0,
      feedback_given INTEGER DEFAULT 0,
      tests_completed INTEGER DEFAULT 0,
      watched_intro BOOLEAN DEFAULT FALSE,
      lab_points INTEGER DEFAULT 0,
      lab_sessions INTEGER DEFAULT 0,
      lab_earned INTEGER DEFAULT 0,
      lab_spent INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE TABLE IF NOT EXISTS platform_transactions (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES platform_users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      description TEXT DEFAULT '',
      reference_id TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_pt_user ON platform_transactions(user_id)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_pt_created ON platform_transactions(created_at DESC)`);
    await sql.query(`CREATE TABLE IF NOT EXISTS platform_videos (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES platform_users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'Other',
      language TEXT DEFAULT 'English',
      duration_minutes INTEGER DEFAULT 1,
      credits_spent INTEGER DEFAULT 0,
      feedback_type TEXT DEFAULT 'general',
      source TEXT DEFAULT 'exchange',
      status TEXT DEFAULT 'active',
      views INTEGER DEFAULT 0,
      completions INTEGER DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      avg_score REAL DEFAULT 0,
      priority REAL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_pv_status ON platform_videos(status)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_pv_priority ON platform_videos(priority DESC)`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_pv_user ON platform_videos(user_id)`);
    await sql.query(`CREATE TABLE IF NOT EXISTS platform_watch_sessions (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES platform_users(id) ON DELETE CASCADE,
      video_id TEXT REFERENCES platform_videos(id) ON DELETE CASCADE,
      duration_seconds INTEGER DEFAULT 0,
      video_duration_seconds INTEGER DEFAULT 0,
      completion_pct REAL DEFAULT 0,
      credits_earned INTEGER DEFAULT 0,
      feedback_quality REAL DEFAULT 0,
      is_completed BOOLEAN DEFAULT FALSE,
      skip_detected BOOLEAN DEFAULT FALSE,
      ip_address TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_pws_user_video ON platform_watch_sessions(user_id, video_id)`);
    await sql.query(`CREATE TABLE IF NOT EXISTS platform_feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES platform_users(id) ON DELETE CASCADE,
      video_id TEXT REFERENCES platform_videos(id) ON DELETE CASCADE,
      hook_score INTEGER DEFAULT 0,
      editing_score INTEGER DEFAULT 0,
      audio_score INTEGER DEFAULT 0,
      thumbnail_score INTEGER DEFAULT 0,
      retention_score INTEGER DEFAULT 0,
      cta_score INTEGER DEFAULT 0,
      what_worked TEXT DEFAULT '',
      what_improve TEXT DEFAULT '',
      would_continue TEXT DEFAULT '',
      quality_score REAL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_pf_video ON platform_feedback(video_id)`);
    await sql.query(`CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    const settingsCheck = await sql`SELECT COUNT(*)::int AS c FROM platform_settings`;
    if ((settingsCheck[0]?.c || 0) === 0) {
      const defaultSettings = {
        registration_bonus: 10, credit_cost_per_minute: 2, watch_reward_per_minute: 1,
        watch_bonus_completion: 2, min_watch_seconds: 10, max_daily_watch_earnings: 50,
        anti_abuse_min_seconds: 5, priority_base: 1.0, priority_credit_multiplier: 0.1,
        priority_view_penalty: 0.05, priority_review_bonus: 0.2, queue_batch_size: 20,
        new_user_visibility_boost: 0.5
      };
      for (const [k, v] of Object.entries(defaultSettings)) {
        await sql`INSERT INTO platform_settings (key, value) VALUES (${k}, ${JSON.stringify(v)}::jsonb)`;
      }
    }
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

const BLOG_BASE_COLUMNS = `id, slug, locale, title, excerpt, category, tags, author, meta_description, seo_title, keywords, reading_time, status, published_at, created_at, updated_at, external_link, external_link_label, has_image, featured_image`;
const BLOG_LIST_COLUMNS = BLOG_BASE_COLUMNS;
const BLOG_DETAIL_COLUMNS = `id, slug, locale, title, excerpt, content, category, tags, author, meta_description, seo_title, keywords, reading_time, status, published_at, created_at, updated_at, external_link, external_link_label, has_image, featured_image`;
const BLOG_ADMIN_COLUMNS = `id, slug, locale, title, excerpt, content, category, tags, author, meta_description, seo_title, keywords, reading_time, status, published_at, created_at, updated_at, external_link, external_link_label, has_image, featured_image`;
const ALLOWED_BLOG_FIELDS = new Set([
  'slug', 'locale', 'title', 'excerpt', 'content', 'category', 'tags', 'author',
  'featured_image', 'meta_description', 'seo_title', 'keywords',
  'reading_time', 'status', 'external_link', 'external_link_label', 'has_image'
]);

function filterBlogFields(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (ALLOWED_BLOG_FIELDS.has(k)) out[k] = v;
  }
  return out;
}

export async function getBlogPosts(status = 'published') {
  const sb = getSb();
  if (!sb) return [];
  try {
    let query = sb.from('blog_posts').select(BLOG_LIST_COLUMNS);
    if (status !== 'all') query = query.eq('status', status);
    const { data } = await query
      .order('published_at', { ascending: false, nullsLast: true })
      .order('updated_at', { ascending: false, nullsLast: true });
    return data || [];
  } catch { return []; }
}

export async function getBlogPostById(id) {
  const sb = getSb();
  if (!sb) return null;
  try {
    const numId = Number(id);
    let query = sb.from('blog_posts').select(BLOG_ADMIN_COLUMNS);
    if (!isNaN(numId)) query = query.eq('id', numId);
    else query = query.eq('slug', id);
    const { data } = await query.single();
    return data;
  } catch { return null; }
}

export async function getBlogPostBySlug(slug, locale = 'en') {
  const sb = getSb();
  if (!sb) return null;
  try {
    let { data } = await sb.from('blog_posts')
      .select(BLOG_DETAIL_COLUMNS)
      .eq('slug', slug)
      .eq('locale', locale)
      .single();
    if (!data) {
      const { data: fallback } = await sb.from('blog_posts')
        .select(BLOG_DETAIL_COLUMNS)
        .eq('slug', slug)
        .single();
      data = fallback;
    }
    return data;
  } catch { return null; }
}

export async function getBlogPostFeaturedImage(slug, locale = 'en') {
  const sb = getSb();
  if (!sb) return null;
  try {
    let { data } = await sb.from('blog_posts')
      .select('featured_image, has_image, locale')
      .eq('slug', slug)
      .eq('locale', locale)
      .single();
    if (!data) {
      const { data: fallback } = await sb.from('blog_posts')
        .select('featured_image, has_image, locale')
        .eq('slug', slug)
        .single();
      data = fallback;
    }
    return data;
  } catch { return null; }
}

export async function createBlogPost(data) {
  const clean = filterBlogFields(data);
  const sb = getSb();
  if (!sb) throw new Error('Database not available');
  try {
    const { data: row, error } = await sb.from('blog_posts')
      .insert({
        slug: clean.slug,
        title: clean.title,
        excerpt: clean.excerpt || '',
        content: clean.content || '',
        category: clean.category || 'General',
        tags: Array.isArray(clean.tags) ? clean.tags : (clean.tags || []),
        author: clean.author || 'Chafiktech Ai',
        featured_image: clean.featured_image || '',
        meta_description: clean.meta_description || '',
        seo_title: clean.seo_title || '',
        keywords: Array.isArray(clean.keywords) ? clean.keywords : (clean.keywords || []),
        reading_time: clean.reading_time || 5,
        status: clean.status || 'draft',
        external_link: clean.external_link || '',
        external_link_label: clean.external_link_label || '',
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    return row;
  } catch (err) {
    throw new Error(`Failed to create blog post: ${err.message}`);
  }
}

export async function updateBlogPost(id, data) {
  const clean = filterBlogFields(data);
  const sb = getSb();
  if (!sb) throw new Error('Database not available');
  const numId = Number(id);
  const updates = { ...clean, updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(updates)) {
    if (Array.isArray(v)) updates[k] = v;
  }
  try {
    const { error } = await sb.from('blog_posts').update(updates).eq('id', numId);
    if (error) throw new Error(error.message);
  } catch (err) {
    throw new Error(`Failed to update blog post: ${err.message}`);
  }
}

export async function deleteBlogPost(id) {
  const sb = getSb();
  if (!sb) throw new Error('Database not available');
  const { error } = await sb.from('blog_posts').delete().eq('id', Number(id));
  if (error) throw new Error(error.message);
}

export async function getLogs(limit = 100) {
  const sql = getSql();
  if (!sql) return [];
  try {
    return await sql`SELECT * FROM logs ORDER BY timestamp DESC LIMIT ${limit}`;
  } catch { return []; }
}

export async function writeLog(level, message, details = {}) {
  const sql = getSql();
  if (!sql) return;
  try {
    await sql`INSERT INTO logs (level, message, details) VALUES (${level}, ${message}, ${JSON.stringify(details)}::jsonb)`;
  } catch {}
}

export async function getAdSettings() {
  const sql = getSql();
  if (!sql) return [];
  try {
    return await sql`SELECT * FROM ad_settings ORDER BY id`;
  } catch { return []; }
}

export async function saveAdSetting(id, data) {
  const sql = getSql();
  if (!sql) throw new Error('Database not available');
  try {
    if (id) {
      await sql`UPDATE ad_settings SET enabled = ${data.enabled}, code = ${data.code}, updated_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`INSERT INTO ad_settings (location, enabled, code) VALUES (${data.location}, ${data.enabled}, ${data.code})`;
    }
  } catch (err) {
    throw new Error(`Failed to save ad setting: ${err.message}`);
  }
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

export async function getPrompts(category = '', status = 'published') {
  const sql = getSql();
  if (!sql) return [];
  try {
    if (status === 'all') {
      if (category) return await sql`SELECT * FROM prompts WHERE category = ${category} ORDER BY created_at DESC`;
      return await sql`SELECT * FROM prompts ORDER BY created_at DESC`;
    }
    if (category) return await sql`SELECT * FROM prompts WHERE status = ${status} AND category = ${category} ORDER BY created_at DESC`;
    return await sql`SELECT * FROM prompts WHERE status = ${status} ORDER BY created_at DESC`;
  } catch { return []; }
}

export async function getPromptBySlug(slug) {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`SELECT * FROM prompts WHERE slug = ${slug}`;
    return rows.length > 0 ? rows[0] : null;
  } catch { return null; }
}

export async function getPromptById(id) {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`SELECT * FROM prompts WHERE id = ${Number(id)}`;
    return rows.length > 0 ? rows[0] : null;
  } catch { return null; }
}

export async function createPrompt(data) {
  const sql = getSql();
  if (!sql) throw new Error('Database not available');
  const rows = await sql`
    INSERT INTO prompts (slug, title, cover_image, description, tags, category, tool, usage_guide, content, status)
    VALUES (${data.slug}, ${data.title}, ${data.cover_image || ''}, ${data.description || ''}, ${data.tags || []}, ${data.category || 'General'}, ${data.tool || ''}, ${data.usage_guide || ''}, ${data.content || ''}, ${data.status || 'published'})
    RETURNING id
  `;
  return rows[0];
}

export async function updatePrompt(id, data) {
  const sql = getSql();
  if (!sql) throw new Error('Database not available');
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
  await sql.query(`UPDATE prompts SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i}`, vals);
}

export async function deletePrompt(id) {
  const sql = getSql();
  if (!sql) throw new Error('Database not available');
  await sql`DELETE FROM prompts WHERE id = ${Number(id)}`;
}

export async function incrementPromptViews(slug) {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE prompts SET views = views + 1 WHERE slug = ${slug}`;
}

export async function getRateLimitLastUsed(key) {
  const sql = getSql();
  if (!sql) return 0;
  try {
    const rows = await sql`SELECT last_used FROM rate_limits WHERE key = ${key} LIMIT 1`;
    if (rows.length > 0) return new Date(rows[0].last_used).getTime();
  } catch {}
  return 0;
}

export async function setRateLimitLastUsed(key) {
  const sql = getSql();
  if (!sql) return false;
  try {
    await sql`
      INSERT INTO rate_limits (key, last_used) VALUES (${key}, NOW())
      ON CONFLICT (key) DO UPDATE SET last_used = NOW()
    `;
    return true;
  } catch { return false; }
}

export async function getDailyUsageCount() {
  const sql = getSql();
  if (!sql) return 0;
  try {
    const rows = await sql`SELECT COUNT(*)::int AS c FROM rate_limits WHERE last_used >= CURRENT_DATE`;
    return rows[0]?.c || 0;
  } catch { return 0; }
}

export async function getLPRateLimit(userIdentifier) {
  const sql = getSql();
  if (!sql) return { lastUsed: 0, found: false };
  try {
    const rows = await sql`SELECT last_generated_at FROM landing_page_rate_limits WHERE user_identifier = ${userIdentifier} LIMIT 1`;
    if (rows.length > 0) return { lastUsed: new Date(rows[0].last_generated_at).getTime(), found: true };
  } catch {}
  return { lastUsed: 0, found: false };
}

export async function setLPRateLimit(userIdentifier) {
  const sql = getSql();
  if (!sql) return false;
  try {
    await sql`
      INSERT INTO landing_page_rate_limits (user_identifier, last_generated_at) VALUES (${userIdentifier}, NOW())
      ON CONFLICT (user_identifier) DO UPDATE SET last_generated_at = NOW()
    `;
    return true;
  } catch { return false; }
}

export async function getMonthlyUsageCount() {
  const sql = getSql();
  if (!sql) return 0;
  try {
    const rows = await sql`SELECT COUNT(*)::int AS c FROM landing_page_rate_limits WHERE last_generated_at >= date_trunc('month', CURRENT_DATE)`;
    return rows[0]?.c || 0;
  } catch { return 0; }
}

export async function getLastUsedTimestamp() {
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = await sql`SELECT last_generated_at FROM landing_page_rate_limits ORDER BY last_generated_at DESC LIMIT 1`;
    if (rows.length > 0) return new Date(rows[0].last_generated_at).toISOString();
  } catch {}
  return null;
}

export async function queryOne(text, params = []) {
  const sql = getSql();
  if (!sql) return null;
  try {
    const result = await sql.query(text, params);
    return result.rows?.[0] || null;
  } catch {
    return null;
  }
}

export async function execute(text, params = []) {
  const sql = getSql();
  if (!sql) return null;
  try {
    const result = await sql.query(text, params);
    return result;
  } catch {
    return null;
  }
}
