import { TOOL_BLOG_ARTICLES } from './tool-blog-articles';

function toSeedPost(a, idx) {
  const now = new Date(Date.now() - idx * 60000).toISOString();
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    tags: a.tags,
    meta_description: a.excerpt,
    seo_title: a.title,
    keywords: a.keywords,
    reading_time: 2,
    external_link: `/tools/${a.tool}`,
    external_link_label: `Try ${a.toolName}`,
    content: a.content,
    published_at: now,
    created_at: now,
    updated_at: now
  };
}

export const SEED_POSTS = TOOL_BLOG_ARTICLES.map((a, i) => toSeedPost(a, i));
