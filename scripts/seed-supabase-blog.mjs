import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogJson = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'blog.json'), 'utf-8'));

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SB_URL || !SB_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });

let success = 0;
let failed = 0;

for (const post of blogJson) {
  const row = {
    slug: post.slug,
    title: post.title || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    meta_title: post.seo_title || post.title || '',
    meta_description: post.meta_description || post.excerpt || '',
    keywords: Array.isArray(post.keywords) ? post.keywords.join(', ') : (post.keywords || ''),
    category: post.category || 'General',
    tags: Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : []),
    featured_image: post.featured_image || '',
    author: post.author || 'Chafiktech AI',
    status: post.status || 'published',
    external_link: post.external_link || '',
    external_link_label: post.external_link_label || '',
    reading_time: post.reading_time || 5,
    has_image: !!(post.featured_image),
    published_at: post.published_at || new Date().toISOString(),
    created_at: post.created_at || new Date().toISOString(),
    updated_at: post.updated_at || new Date().toISOString()
  };

  const { error } = await sb.from('blog_posts').upsert(row, { onConflict: 'slug' });
  if (error) {
    console.error(`FAIL: ${post.slug} - ${error.message}`);
    failed++;
  } else {
    console.log(`OK: ${post.slug}`);
    success++;
  }
}

console.log(`\nDone: ${success} imported, ${failed} failed`);
