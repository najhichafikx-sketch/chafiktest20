import { TOOL_BLOG_ARTICLES } from './tool-blog-articles';

const YOUTUBE_SLUGS = [
  'viral-video-ideas-guide',
  'youtube-title-guide',
  'viral-hook-guide',
  'youtube-script-guide',
  'thumbnail-prompt-guide',
  'youtube-description-guide',
  'youtube-tags-guide',
  'youtube-seo-guide',
  'faceless-video-guide',
  'viral-shorts-guide',
  'storytelling-script-guide',
  'community-post-guide',
  'comment-reply-guide',
  'video-repurposer-guide',
  'youtube-creator-guide'
];

function toYouTubePost(a, idx) {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    tags: a.tags,
    reading_time: 2,
    content: a.content
  };
}

export const YOUTUBE_BLOG_POSTS = YOUTUBE_SLUGS
  .map(s => TOOL_BLOG_ARTICLES.find(a => a.slug === s))
  .filter(Boolean)
  .map((a, i) => toYouTubePost(a, i));
