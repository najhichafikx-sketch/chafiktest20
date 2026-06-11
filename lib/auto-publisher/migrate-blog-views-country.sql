-- Add country column to blog_views table for geo-tracking
-- Run this in Supabase SQL Editor

ALTER TABLE blog_views ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Unknown';

-- Index for country-based queries
CREATE INDEX IF NOT EXISTS idx_blog_views_country ON blog_views (country);
CREATE INDEX IF NOT EXISTS idx_blog_views_date_country ON blog_views (date, country);
