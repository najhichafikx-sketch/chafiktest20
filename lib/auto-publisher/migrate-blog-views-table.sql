-- ============================================================
-- Migration: Create blog_views table for page view tracking
-- Run this in Supabase Dashboard SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_views (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  path TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  country TEXT DEFAULT 'Unknown',
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_views_slug ON blog_views (slug);
CREATE INDEX IF NOT EXISTS idx_blog_views_date ON blog_views (date);
CREATE INDEX IF NOT EXISTS idx_blog_views_country ON blog_views (country);
CREATE INDEX IF NOT EXISTS idx_blog_views_slug_date ON blog_views (slug, date);
CREATE INDEX IF NOT EXISTS idx_blog_views_date_country ON blog_views (date, country);

-- Enable Row Level Security (optional, but good practice)
ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role (used by our API)
CREATE POLICY "Service role can insert" ON blog_views
  FOR INSERT TO service_role WITH CHECK (true);

-- Allow reads from service role
CREATE POLICY "Service role can select" ON blog_views
  FOR SELECT TO service_role USING (true);
