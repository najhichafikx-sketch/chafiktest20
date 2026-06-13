-- ============================================================
-- Migration: Add ALL missing columns to blog_posts table
-- Run this in Supabase Dashboard SQL Editor
-- This is comprehensive - covers every column blog-service.js uses
-- ============================================================

-- Identity / Multilingual
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS base_slug TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';

-- Core content
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS content TEXT;

-- SEO fields
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS keywords TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS primary_keyword TEXT DEFAULT '';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS secondary_keywords JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS long_tail_keywords JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_search_terms JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]'::jsonb;

-- Organization
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS hashtags TEXT;

-- Snippet blocks
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS key_facts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS key_takeaways JSONB DEFAULT '[]'::jsonb;

-- FAQ / Schema
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS faq_schema JSONB;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS article_schema JSONB;

-- Media
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- Metadata
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS trend_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_score INTEGER;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Chafiktech AI';

-- Timestamps
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_locale ON blog_posts (locale);
CREATE INDEX IF NOT EXISTS idx_blog_posts_base_slug ON blog_posts (base_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_country ON blog_posts (country);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Service role policy
DROP POLICY IF EXISTS "Service role full access" ON blog_posts;
CREATE POLICY "Service role full access" ON blog_posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
