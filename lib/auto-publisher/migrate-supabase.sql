-- Safe to run multiple times (uses IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  tags JSONB DEFAULT '[]',
  faqs JSONB DEFAULT '[]',
  faq_schema JSONB DEFAULT NULL,
  featured_image TEXT DEFAULT '',
  author TEXT DEFAULT 'Chafiktech AI',
  source TEXT DEFAULT 'manual',
  trend_title TEXT DEFAULT '',
  seo_score INTEGER DEFAULT NULL,
  word_count INTEGER DEFAULT NULL,
  status TEXT DEFAULT 'published',
  external_link TEXT DEFAULT '',
  external_link_label TEXT DEFAULT '',
  reading_time INTEGER DEFAULT 5,
  has_image BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_source ON blog_posts(source);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
