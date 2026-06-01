export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chafiktech.com';
  const staticPages = [
    '/', '/about', '/contact', '/faq', '/privacy', '/terms', '/disclaimer',
    '/pricing', '/login', '/register', '/dashboard', '/ecommerce', '/blog'
  ];
  const tools = [
    'seo-article-generator', 'image-to-prompt', 'video-to-prompt', 'tiktok-tools',
    'youtube-suite', 'ai-humanizer', 'prompt-viral', 'prompt-article',
    'ad-copy-generator', 'amazon-listing-generator', 'digital-product-creator',
    'digital-product-email-writer', 'digital-product-name-generator',
    'dropshipping-research', 'etsy-listing-generator', 'landing-page-generator',
    'pricing-optimizer', 'product-description-generator', 'product-idea-finder',
    'product-image-enhancer', 'product-title-generator', 'review-response-generator',
    'sales-copy-generator', 'shopify-seo-generator'
  ];
  const blogArticles = [
    'ai-seo-article-generator', 'image-to-prompt-ai', 'video-to-prompt-ai',
    'tiktok-ai-tools', 'youtube-ai-suite', 'ai-humanizer-guide',
    'ai-ad-copy-generator', 'amazon-ai-listing', 'ai-product-descriptions',
    'etsy-ai-listing', 'ai-landing-page-generator', 'ai-sales-copy',
    'shopify-ai-seo', 'ai-product-titles', 'ai-review-responses',
    'ai-pricing-optimization', 'ai-product-ideas', 'ai-product-images',
    'ai-digital-products', 'ai-product-names', 'ai-email-marketing',
    'ai-dropshipping-research', 'ai-writing-prompts', 'viral-content-prompts'
  ];

  const entries = [
    ...staticPages.map(p => ({ url: `${baseUrl}${p}`, lastModified: new Date(), changeFrequency: 'weekly', priority: p === '/' ? 1.0 : 0.8 })),
    ...tools.map(t => ({ url: `${baseUrl}/tools/${t}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 })),
    ...blogArticles.map(s => ({ url: `${baseUrl}/blog/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 }))
  ];

  return entries;
}
