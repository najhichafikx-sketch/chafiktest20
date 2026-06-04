import { SEED_POSTS } from '../lib/seed-blog.js';
import { YOUTUBE_BLOG_POSTS } from '../lib/blog-content.js';
import fs from 'fs';
import path from 'path';

const now = new Date().toISOString();
let id = 1;

function mapPost(p, isYouTube = false) {
  return {
    id: id++,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content || '',
    category: p.category || (isYouTube ? 'YouTube' : 'General'),
    tags: p.tags || [],
    author: p.author || 'Chafiktech Ai',
    featured_image: p.featured_image || '',
    meta_description: p.meta_description || '',
    reading_time: p.reading_time || 5,
    status: 'published',
    published_at: now,
    created_at: now,
    updated_at: now
  };
}

const allPosts = [
  ...SEED_POSTS.map(p => mapPost(p, false)),
  ...YOUTUBE_BLOG_POSTS.map(p => mapPost(p, true))
];

const outPath = path.join(process.cwd(), 'data', 'blog.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(allPosts, null, 2), 'utf-8');
console.log(`Seeded ${allPosts.length} posts to ${outPath}`);
