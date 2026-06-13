-- ============================================================
-- Migration: Add missing columns to blog_posts table
-- Run this in Supabase Dashboard SQL Editor
-- Fixes: "Could not find the 'article_schema' column" error
-- ============================================================

-- SEO / Schema columns
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS primary_keyword TEXT DEFAULT '';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS secondary_keywords JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS long_tail_keywords JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_search_terms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS faq_schema JSONB;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS article_schema JSONB;

-- Multilingual support columns
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS base_slug TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';

-- Image prompt
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- Model used to generate
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS model TEXT;

-- Country tracking (was already in the system)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON blog_posts (locale);
CREATE INDEX IF NOT EXISTS idx_blog_posts_base_slug ON blog_posts (base_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_primary_keyword ON blog_posts (primary_keyword);
CREATE INDEX IF NOT EXISTS idx_blog_posts_country ON blog_posts (country);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by our API)
DROP POLICY IF EXISTS "Service role full access" ON blog_posts;
CREATE POLICY "Service role full access" ON blog_posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
