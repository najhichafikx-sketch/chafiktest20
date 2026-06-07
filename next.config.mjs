/** @type {import('next').NextConfig} */

// Validate required environment variables at build/startup time
const requiredVars = ['OPENROUTER_API_KEY', 'JWT_SECRET', 'ADMIN_PASSWORD'];
const optionalVars = [
  { key: 'NEXT_PUBLIC_SITE_URL', default: 'https://www.chafiktech.com' },
  { key: 'NEXT_PUBLIC_GA_ID', default: null },
  { key: 'DATABASE_URL', default: null }
];

const missing = requiredVars.filter(k => !process.env[k]);
const warnings = optionalVars.filter(v => !process.env[v.key]);

if (missing.length > 0) {
  console.error('\n========================================');
  console.error('  MISSING REQUIRED ENVIRONMENT VARIABLES');
  console.error('========================================\n');
  missing.forEach(k => console.error(`  ❌ ${k}\n`));
  console.error('  Set these in your .env.local or Vercel environment.\n');
  console.error('  The build will continue but features will be broken.\n');
}

if (warnings.length > 0) {
  console.warn('\n========================================');
  console.warn('  MISSING OPTIONAL ENVIRONMENT VARIABLES');
  console.warn('========================================\n');
  warnings.forEach(v => {
    console.warn(`  ⚠️  ${v.key}`);
    if (v.default) console.warn(`     Default: ${v.default}\n`);
  });
}

if (missing.length === 0 && warnings.length === 0) {
  console.log('\n✅ All environment variables configured.\n');
}

const REDIRECTS = [
  ['ai-seo-article-generator', 'seo-article-generator-guide'],
  ['image-to-prompt-ai', 'image-to-prompt-guide'],
  ['video-to-prompt-ai', 'video-to-prompt-guide'],
  ['tiktok-ai-tools', 'tiktok-tools-guide'],
  ['youtube-ai-suite', 'youtube-suite-guide'],
  ['ai-humanizer-guide', 'ai-humanizer-guide'],
  ['ai-ad-copy-generator', 'ad-copy-generator-guide'],
  ['amazon-ai-listing', 'amazon-listing-guide'],
  ['ai-product-descriptions', 'product-description-guide'],
  ['etsy-ai-listing', 'etsy-listing-guide'],
  ['ai-landing-page-generator', 'landing-page-generator-guide'],
  ['ai-sales-copy', 'sales-copy-generator-guide'],
  ['shopify-ai-seo', 'shopify-seo-guide'],
  ['ai-product-titles', 'product-title-generator-guide'],
  ['ai-review-responses', 'review-response-guide'],
  ['ai-pricing-optimization', 'pricing-optimizer-guide'],
  ['ai-product-ideas', 'product-idea-finder-guide'],
  ['ai-product-images', 'product-image-enhancer-guide'],
  ['ai-digital-products', 'digital-product-creator-guide'],
  ['ai-product-names', 'digital-product-name-guide'],
  ['ai-email-marketing', 'email-writer-guide'],
  ['ai-dropshipping-research', 'dropshipping-research-guide'],
  ['ai-writing-prompts', 'article-prompt-guide'],
  ['viral-content-prompts', 'viral-prompt-guide'],
  ['youtube-viral-ideas', 'viral-video-ideas-guide'],
  ['youtube-title-optimization', 'youtube-title-guide'],
  ['viral-hook-generation', 'viral-hook-guide'],
  ['ai-youtube-script-writing', 'youtube-script-guide'],
  ['ai-thumbnail-prompts', 'thumbnail-prompt-guide'],
  ['youtube-seo-descriptions', 'youtube-description-guide'],
  ['youtube-tag-strategy', 'youtube-tags-guide'],
  ['youtube-seo-optimization', 'youtube-seo-guide'],
  ['faceless-video-creation', 'faceless-video-guide'],
  ['viral-shorts-strategy', 'viral-shorts-guide'],
  ['storytelling-youtube-scripts', 'storytelling-script-guide'],
  ['youtube-community-engagement', 'community-post-guide'],
  ['youtube-comment-management', 'comment-reply-guide'],
  ['video-content-repurposing', 'video-repurposer-guide']
];

const nextConfig = {
  serverExternalPackages: ['jsonwebtoken'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  async redirects() {
    return REDIRECTS.map(([from, to]) => ({
      source: `/blog/${from}`,
      destination: `/blog/${to}`,
      permanent: true
    }));
  }
};

export default nextConfig;
