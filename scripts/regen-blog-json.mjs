import { TOOL_BLOG_ARTICLES } from '../lib/tool-blog-articles.js';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUT_FILE = path.join(DATA_DIR, 'blog.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const posts = TOOL_BLOG_ARTICLES.map((a, idx) => {
  const now = new Date(Date.now() - idx * 60000).toISOString();
  return {
    id: idx + 1,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    category: a.category,
    tags: a.tags,
    author: 'Chafiktech Ai',
    featured_image: '',
    meta_description: a.excerpt,
    seo_title: a.title,
    keywords: a.keywords,
    external_link: `/tools/${a.tool}`,
    external_link_label: `Try ${a.toolName}`,
    reading_time: 2,
    status: 'published',
    published_at: now,
    created_at: now,
    updated_at: now
  };
});

fs.writeFileSync(OUT_FILE, JSON.stringify(posts, null, 2), 'utf-8');
console.log(`Wrote ${posts.length} posts to ${OUT_FILE}`);
