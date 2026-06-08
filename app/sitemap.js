export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chafiktech.com';
  const staticPages = [
    '/', '/about', '/contact', '/faq', '/privacy', '/terms', '/disclaimer',
    '/pricing', '/login', '/register', '/dashboard', '/blog',
    '/platforms-views', '/platforms-views/viral-exchange',
    '/platforms-views/feedback-exchange', '/platforms-views/audience-test-lab'
  ];
  const tools = [
    'seo-article-generator', 'image-to-prompt', 'video-to-prompt', 'tiktok-tools',
    'youtube-suite', 'youtube-creator', 'ai-content-generator', 'ai-humanizer', 'prompt-viral', 'prompt-article',
    'ad-copy-generator', 'amazon-listing-generator', 'digital-product-creator',
    'digital-product-email-writer', 'digital-product-name-generator',
    'dropshipping-research', 'etsy-listing-generator', 'landing-page-generator',
    'pricing-optimizer', 'product-description-generator', 'product-idea-finder',
    'product-image-enhancer', 'product-title-generator', 'review-response-generator',
    'sales-copy-generator', 'shopify-seo-generator',
    'viral-video-ideas', 'youtube-title-generator', 'viral-hook-generator',
    'youtube-script-generator', 'thumbnail-prompt-generator', 'youtube-description-generator',
    'youtube-tags-generator', 'youtube-seo-optimizer', 'faceless-video-generator',
    'viral-shorts-generator', 'storytelling-script-generator', 'community-post-generator',
    'comment-reply-generator', 'video-content-repurposer'
  ];
  const blogArticles = [
    'ai-content-generator-guide', 'image-to-prompt-ai', 'video-to-prompt-ai',
    'tiktok-ai-tools', 'youtube-ai-suite', 'ai-humanizer-guide',
    'ai-ad-copy-generator', 'amazon-ai-listing', 'ai-product-descriptions',
    'etsy-ai-listing', 'ai-landing-page-generator', 'ai-sales-copy',
    'shopify-ai-seo', 'ai-product-titles', 'ai-review-responses',
    'ai-pricing-optimization', 'ai-product-ideas', 'ai-product-images',
    'ai-digital-products', 'ai-product-names', 'ai-email-marketing',
    'ai-dropshipping-research', 'ai-writing-prompts', 'viral-content-prompts',
    'youtube-viral-ideas', 'youtube-title-optimization', 'viral-hook-generation',
    'ai-youtube-script-writing', 'ai-thumbnail-prompts', 'youtube-seo-descriptions',
    'youtube-tag-strategy', 'youtube-seo-optimization', 'faceless-video-creation',
    'viral-shorts-strategy', 'storytelling-youtube-scripts', 'youtube-community-engagement',
    'youtube-comment-management', 'video-content-repurposing',
    'viral-exchange', 'feedback-exchange', 'audience-test-lab'
  ];

  const entries = [
    ...staticPages.map(p => ({ url: `${baseUrl}${p}`, lastModified: new Date(), changeFrequency: 'weekly', priority: p === '/' ? 1.0 : 0.8 })),
    ...tools.map(t => ({ url: `${baseUrl}/tools/${t}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 })),
    ...blogArticles.map(s => ({ url: `${baseUrl}/blog/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 }))
  ];

  return entries;
}
