export const TOOL_NAMES = {
  'seo-article': { name: 'SEO Article Generator', icon: '📝', category: 'Content Writing' },
  'image-to-prompt': { name: 'Image to Prompt Generator', icon: '📸', category: 'Image AI' },
  'video-to-prompt': { name: 'Video to Prompt Generator', icon: '🎬', category: 'Video AI' },
  'tiktok': { name: 'TikTok Tools', icon: '🎵', category: 'Social Media' },
  'youtube': { name: 'YouTube Suite', icon: '▶️', category: 'Video AI' },
  'ai-humanizer': { name: 'AI Humanizer', icon: '✍️', category: 'Content Writing' },
  'ad-copy': { name: 'Ad Copy Generator', icon: '📢', category: 'Marketing' },
  'amazon-listing': { name: 'Amazon Listing Generator', icon: '📦', category: 'Ecommerce' },
  'product-description': { name: 'Product Description Generator', icon: '🏷️', category: 'Ecommerce' },
  'etsy-listing': { name: 'Etsy Listing Generator', icon: '🛍️', category: 'Ecommerce' },
  'landing-page': { name: 'Landing Page Generator', icon: '🖥️', category: 'Marketing' },
  'sales-copy': { name: 'Sales Copy Generator', icon: '💰', category: 'Marketing' },
  'shopify-seo': { name: 'Shopify SEO Generator', icon: '🛒', category: 'Ecommerce' },
  'product-title': { name: 'Product Title Generator', icon: '📛', category: 'Ecommerce' },
  'review-response': { name: 'Review Response Generator', icon: '⭐', category: 'Customer Service' },
  'pricing': { name: 'Pricing Optimizer', icon: '📊', category: 'Business' },
  'product-idea': { name: 'Product Idea Finder', icon: '💡', category: 'Ecommerce' },
  'product-image': { name: 'Product Image Enhancer', icon: '🖼️', category: 'Image AI' },
  'digital-product': { name: 'Digital Product Creator', icon: '💻', category: 'Digital Products' },
  'digital-name': { name: 'Digital Product Name Generator', icon: '🏷️', category: 'Digital Products' },
  'email-writer': { name: 'Digital Product Email Writer', icon: '📧', category: 'Marketing' },
  'dropshipping': { name: 'Dropshipping Research', icon: '🔍', category: 'Ecommerce' },
  'prompt-article': { name: 'Article Prompt Generator', icon: '📄', category: 'Content Writing' },
  'prompt-viral': { name: 'Viral Prompt Generator', icon: '🔥', category: 'Content Writing' },
  'viral-ideas': { name: 'Viral Video Idea Generator', icon: '💡', category: 'YouTube' },
  'youtube-title': { name: 'YouTube Title Generator', icon: '📺', category: 'YouTube' },
  'viral-hook': { name: 'Viral Hook Generator', icon: '🪝', category: 'YouTube' },
  'youtube-script': { name: 'YouTube Script Generator', icon: '📜', category: 'YouTube' },
  'thumbnail-prompt': { name: 'Thumbnail Prompt Generator', icon: '🖼️', category: 'YouTube' },
  'youtube-description': { name: 'YouTube Description Generator', icon: '📋', category: 'YouTube' },
  'youtube-tags': { name: 'YouTube Tags Generator', icon: '🏷️', category: 'YouTube' },
  'youtube-seo': { name: 'YouTube SEO Optimizer', icon: '🔍', category: 'YouTube' },
  'faceless-video': { name: 'Faceless Video Generator', icon: '🎭', category: 'YouTube' },
  'viral-shorts': { name: 'Viral Shorts Generator', icon: '📱', category: 'YouTube' },
  'storytelling-script': { name: 'Storytelling Script Generator', icon: '📖', category: 'YouTube' },
  'community-post': { name: 'Community Post Generator', icon: '📢', category: 'YouTube' },
  'comment-reply': { name: 'Comment Reply Generator', icon: '💬', category: 'YouTube' },
  'video-repurposer': { name: 'Video Content Repurposer', icon: '🔄', category: 'YouTube' },
  'youtube-creator': { name: 'YouTube AI Content Suite', icon: '🎬', category: 'YouTube' },
  'ai-digital-creator': { name: 'AI Digital Creator', icon: '🎯', category: 'Digital Products' },
  'cv-generator': { name: 'AI CV Generator', icon: '📄', category: 'Business' },
  'watermark-remover': { name: 'Watermark Remover', icon: '🧹', category: 'Image AI' }
};

export const TOOL_INPUT_HINTS = {
  'seo-article': 'Paste a topic or keyword. Example: <code>how to start dropshipping in 2026</code>',
  'image-to-prompt': 'Click above to upload an image (JPG, PNG, WebP). The AI will analyze it and generate a detailed prompt.',
  'video-to-prompt': 'Paste a video URL or upload a video file. Example: <code>https://youtube.com/watch?v=dQw4w9WgXcQ</code>',
  'tiktok-tools': 'Enter your TikTok niche or topic. Example: <code>fitness tips for beginners</code>',
  'youtube-suite': 'Enter a YouTube topic or channel URL. Example: <code>https://youtube.com/@MrBeast</code> or <code>tech reviews 2026</code>',
  'ai-humanizer': 'Paste your AI-generated text. Example: <code>In today\'s fast-paced world, businesses need AI tools to stay competitive...</code>',
  'prompt-viral': 'Describe the type of viral prompt you need. Example: <code>Instagram caption for a new coffee shop</code>',
  'prompt-article': 'Enter your article topic. Example: <code>The future of remote work in 2026</code>',
  'ad-copy': 'Describe your product/service. Example: <code>Online course about digital marketing for small businesses</code>',
  'amazon-listing': 'Enter your product details. Example: <code>Stainless steel water bottle, 750ml, BPA-free, keeps drinks cold 24h</code>',
  'digital-product': 'Describe your digital product idea. Example: <code>Ebook about meal planning for busy professionals</code>',
  'digital-product-email': 'Describe your digital product and audience. Example: <code>Notion template for content creators, target: solopreneurs</code>',
  'digital-product-name': 'Describe your digital product. Example: <code>Online course teaching photographers how to edit in Lightroom</code>',
  'dropshipping-research': 'Enter a product niche. Example: <code>pet accessories for small dogs</code>',
  'etsy-listing': 'Describe your Etsy product. Example: <code>Handmade ceramic mug with floral design, 12oz</code>',
  'faceless-video': 'Enter your video topic. Example: <code>Top 5 most expensive materials in the world</code>',
  'landing-page': 'Fill the form fields on the right. Product name, headline, description, CTA.',
  'pricing-optimizer': 'Describe your product and market. Example: <code>Premium project management SaaS for agencies, $49/mo</code>',
  'product-description': 'Enter product name and features. Example: <code>Wireless earbuds, noise-cancelling, 30h battery, IPX5</code>',
  'product-idea': 'Describe your niche or audience. Example: <code>eco-friendly home products for millennials</code>',
  'product-image': 'Upload your product image. Describe the desired style in your text.',
  'product-title': 'Describe your product. Example: <code>Yoga mat made from natural rubber, non-slip, 6mm thick</code>',
  'review-response': 'Paste the customer review. Example: <code>The product arrived late but quality is good. 3 stars.</code>',
  'sales-copy': 'Describe your offer. Example: <code>Weight loss program, 12-week course, $197, target: busy moms</code>',
  'shopify-seo': 'Enter product name and keywords. Example: <code>Boho wall art, canvas print, living room decor, 24x36 inches</code>',
  'storytelling-script': 'Enter your story topic. Example: <code>The mystery of the lost city of Atlantis, documentary style</code>',
  'thumbnail-prompt': 'Describe your video topic and emotion. Example: <code>React video, shocked face, bright red background, bold text "I WAS WRONG"</code>',
  'viral-ideas': 'Enter your channel niche. Example: <code>personal finance for Gen Z, YouTube Shorts</code>',
  'viral-shorts': 'Enter your Shorts topic. Example: <code>3 life hacks you didn\'t know</code>',
  'viral-hook': 'Describe your topic and audience. Example: <code>Video about saving money, target: college students</code>',
  'video-repurposer': 'Paste your video transcript or notes. Example: <code>In this video I\'ll show you 5 productivity tips that changed my life...</code>',
  'youtube-description': 'Enter your video title and target keywords. Example: <code>"How to Edit YouTube Videos Fast", keywords: video editing, premiere pro, beginner</code>',
  'youtube-script': 'Enter your video topic. Specify format: <code>Shorts / Long-form / Faceless</code>',
  'youtube-seo': 'Paste your title first, then description. Example: <code>"My Video Title" | "My video description with keywords here"</code>',
  'youtube-tags': 'Enter your video topic. Example: <code>how to learn Spanish fast, beginner Spanish tutorial</code>',
  'youtube-title': 'Enter your video topic. Example: <code>iPhone 16 Pro Max review after 1 month</code>',
  'community-post': 'Describe your channel and topic. Example: <code>Tech review channel, want to ask about next iPhone</code>',
  'comment-reply': 'Paste the YouTube comment. Example: <code>"Great video! How do you edit so fast?"</code>',
};

export const TOOL_ARTICLES = {
  'seo-article': { slug: 'seo-article-generator-guide', title: 'SEO Article Generator: How to Write Rank-Ready Articles in 30 Seconds', toolUrl: 'seo-article-generator' },
  'image-to-prompt': { slug: 'image-to-prompt-guide', title: 'Image to Prompt: Turn Any Image Into Perfect AI Prompts', toolUrl: 'image-to-prompt' },
  'video-to-prompt': { slug: 'video-to-prompt-guide', title: 'Video to Prompt: Extract AI Prompts From Any Video', toolUrl: 'video-to-prompt' },
  'tiktok': { slug: 'tiktok-tools-guide', title: 'TikTok AI Tools: Create Viral Content Faster in 2026', toolUrl: 'tiktok-tools' },
  'youtube': { slug: 'youtube-suite-guide', title: 'YouTube AI Suite: Rank Higher and Get More Views in 2026', toolUrl: 'youtube-suite' },
  'youtube-creator': { slug: 'youtube-creator-guide', title: 'YouTube AI Content Suite: 10 Tools in One Creator Dashboard', toolUrl: 'youtube-creator' },
  'ai-humanizer': { slug: 'ai-humanizer-guide', title: 'AI Humanizer: Make AI Text Undetectable and Natural in 2026', toolUrl: 'ai-humanizer' },
  'ad-copy': { slug: 'ad-copy-generator-guide', title: 'Ad Copy Generator: Write High-Converting Ads in Seconds', toolUrl: 'ad-copy-generator' },
  'amazon-listing': { slug: 'amazon-listing-guide', title: 'Amazon Listing Generator: Rank #1 on Amazon in 2026', toolUrl: 'amazon-listing-generator' },
  'product-description': { slug: 'product-description-guide', title: 'Product Description Generator: Sell More With Better Copy', toolUrl: 'product-description-generator' },
  'etsy-listing': { slug: 'etsy-listing-guide', title: 'Etsy Listing Generator: Rank Higher and Sell More in 2026', toolUrl: 'etsy-listing-generator' },
  'landing-page': { slug: 'landing-page-generator-guide', title: 'Landing Page Generator: Build High-Converting Pages in Minutes', toolUrl: 'landing-page-generator' },
  'sales-copy': { slug: 'sales-copy-generator-guide', title: 'Sales Copy Generator: Write Copy That Converts in 2026', toolUrl: 'sales-copy-generator' },
  'shopify-seo': { slug: 'shopify-seo-guide', title: 'Shopify SEO Generator: Rank Your Store on Google in 2026', toolUrl: 'shopify-seo-generator' },
  'product-title': { slug: 'product-title-generator-guide', title: 'Product Title Generator: Click-Worthy Titles That Sell', toolUrl: 'product-title-generator' },
  'review-response': { slug: 'review-response-guide', title: 'Review Response Generator: Reply to Reviews in Seconds', toolUrl: 'review-response-generator' },
  'pricing': { slug: 'pricing-optimizer-guide', title: 'Pricing Optimizer: Find the Perfect Price to Maximize Profit', toolUrl: 'pricing-optimizer' },
  'product-idea': { slug: 'product-idea-finder-guide', title: 'Product Idea Finder: Discover Winning Products Before Everyone Else', toolUrl: 'product-idea-finder' },
  'product-image': { slug: 'product-image-enhancer-guide', title: 'Product Image Enhancer: Make Listings Look Pro in One Click', toolUrl: 'product-image-enhancer' },
  'digital-product': { slug: 'digital-product-creator-guide', title: 'Digital Product Creator: Build & Sell Digital Products With AI', toolUrl: 'digital-product-creator' },
  'digital-name': { slug: 'digital-product-name-guide', title: 'Digital Product Name Generator: Catchy Names That Sell', toolUrl: 'digital-product-name-generator' },
  'email-writer': { slug: 'email-writer-guide', title: 'Email Marketing Writer: High-Converting Campaigns With AI', toolUrl: 'digital-product-email-writer' },
  'dropshipping': { slug: 'dropshipping-research-guide', title: 'Dropshipping Research: Find Winning Products With AI', toolUrl: 'dropshipping-research' },
  'prompt-article': { slug: 'article-prompt-guide', title: 'Article Prompt Generator: Better Prompts, Better Content', toolUrl: 'prompt-article' },
  'prompt-viral': { slug: 'viral-prompt-guide', title: 'Viral Prompt Generator: Create Content That Goes Viral', toolUrl: 'prompt-viral' },
  'viral-ideas': { slug: 'viral-video-ideas-guide', title: 'Viral Video Ideas Generator: Never Run Out of Content', toolUrl: 'viral-video-ideas' },
  'youtube-title': { slug: 'youtube-title-guide', title: 'YouTube Title Generator: Rank Higher and Get More Clicks', toolUrl: 'youtube-title-generator' },
  'viral-hook': { slug: 'viral-hook-guide', title: 'Viral Hook Generator: Scroll-Stopping Hooks in 5 Seconds', toolUrl: 'viral-hook-generator' },
  'youtube-script': { slug: 'youtube-script-guide', title: 'YouTube Script Generator: Write Engaging Scripts in Minutes', toolUrl: 'youtube-script-generator' },
  'thumbnail-prompt': { slug: 'thumbnail-prompt-guide', title: 'Thumbnail Prompt Generator: Click-Worthy Thumbnails With AI', toolUrl: 'thumbnail-prompt-generator' },
  'youtube-description': { slug: 'youtube-description-guide', title: 'YouTube Description Generator: SEO Descriptions That Rank', toolUrl: 'youtube-description-generator' },
  'youtube-tags': { slug: 'youtube-tags-guide', title: 'YouTube Tags Generator: Rank With the Right Keywords', toolUrl: 'youtube-tags-generator' },
  'youtube-seo': { slug: 'youtube-seo-guide', title: 'YouTube SEO Optimizer: Rank Your Videos in 2026', toolUrl: 'youtube-seo-optimizer' },
  'faceless-video': { slug: 'faceless-video-guide', title: 'Faceless Video Generator: Build a YouTube Channel Without Showing Face', toolUrl: 'faceless-video-generator' },
  'viral-shorts': { slug: 'viral-shorts-guide', title: 'Viral Shorts Generator: Grow Fast on YouTube Shorts & TikTok', toolUrl: 'viral-shorts-generator' },
  'storytelling-script': { slug: 'storytelling-script-guide', title: 'Storytelling Script Generator: Engage Audiences With Stories', toolUrl: 'storytelling-script-generator' },
  'community-post': { slug: 'community-post-guide', title: 'YouTube Community Post Generator: Boost Engagement', toolUrl: 'community-post-generator' },
  'comment-reply': { slug: 'comment-reply-guide', title: 'YouTube Comment Reply Generator: Engage Every Commenter', toolUrl: 'comment-reply-generator' },
  'video-repurposer': { slug: 'video-repurposer-guide', title: 'Video Content Repurposer: One Video, Many Platforms', toolUrl: 'video-content-repurposer' },
  'ai-digital-creator': { slug: 'ai-digital-creator-guide', title: 'AI Digital Creator: Optimize Etsy, KDP & Gumroad Products With AI', toolUrl: 'ai-digital-creator' },
  'cv-generator': { slug: 'cv-generator-guide', title: 'AI CV Generator: Build a Job-Winning Resume in Minutes', toolUrl: 'cv-generator' },
  'watermark-remover': { slug: 'watermark-remover-guide', title: 'Watermark Remover: Remove Watermarks Locally in Your Browser', toolUrl: 'watermark-remover' }
};

export const RELATED_TOOLS = {
  'seo-article': ['ad-copy', 'ai-humanizer', 'youtube'],
  'image-to-prompt': ['video-to-prompt', 'product-image', 'prompt-article'],
  'video-to-prompt': ['image-to-prompt', 'tiktok', 'youtube'],
  'tiktok': ['video-to-prompt', 'ai-humanizer', 'prompt-viral'],
  'youtube': ['seo-article', 'tiktok', 'video-to-prompt'],
  'ai-humanizer': ['seo-article', 'ad-copy', 'prompt-article'],
  'ad-copy': ['sales-copy', 'landing-page', 'seo-article'],
  'amazon-listing': ['product-description', 'product-title', 'etsy-listing'],
  'product-description': ['amazon-listing', 'etsy-listing', 'sales-copy'],
  'etsy-listing': ['amazon-listing', 'product-description', 'product-title'],
  'landing-page': ['ad-copy', 'sales-copy', 'seo-article'],
  'sales-copy': ['ad-copy', 'landing-page', 'email-writer'],
  'shopify-seo': ['product-description', 'product-title', 'seo-article'],
  'product-title': ['amazon-listing', 'product-description', 'shopify-seo'],
  'review-response': ['sales-copy', 'email-writer', 'product-description'],
  'pricing': ['product-idea', 'dropshipping', 'digital-product'],
  'product-idea': ['dropshipping', 'pricing', 'digital-product'],
  'product-image': ['image-to-prompt', 'product-description', 'amazon-listing'],
  'digital-product': ['digital-name', 'email-writer', 'product-idea'],
  'digital-name': ['digital-product', 'email-writer', 'product-idea'],
  'email-writer': ['sales-copy', 'ad-copy', 'digital-product'],
  'dropshipping': ['product-idea', 'pricing', 'amazon-listing'],
  'prompt-article': ['seo-article', 'ai-humanizer', 'prompt-viral'],
  'prompt-viral': ['tiktok', 'ai-humanizer', 'prompt-article'],
  'viral-ideas': ['youtube-title', 'viral-hook', 'youtube-script'],
  'youtube-title': ['viral-ideas', 'youtube-description', 'youtube-tags'],
  'viral-hook': ['viral-ideas', 'youtube-script', 'viral-shorts'],
  'youtube-script': ['viral-hook', 'storytelling-script', 'faceless-video'],
  'thumbnail-prompt': ['youtube-title', 'youtube-seo', 'youtube-description'],
  'youtube-description': ['youtube-title', 'youtube-tags', 'youtube-seo'],
  'youtube-tags': ['youtube-description', 'youtube-seo', 'youtube-title'],
  'youtube-seo': ['youtube-title', 'youtube-description', 'youtube-tags'],
  'faceless-video': ['youtube-script', 'viral-shorts', 'video-repurposer'],
  'viral-shorts': ['viral-hook', 'faceless-video', 'youtube-script'],
  'storytelling-script': ['youtube-script', 'faceless-video', 'comment-reply'],
  'community-post': ['youtube-description', 'youtube-title', 'comment-reply'],
  'comment-reply': ['community-post', 'youtube-description', 'video-repurposer'],
  'video-repurposer': ['youtube-script', 'youtube-description', 'faceless-video'],
  'youtube-creator': ['youtube', 'viral-ideas', 'youtube-title'],
  'ai-digital-creator': ['digital-product', 'etsy-listing', 'product-idea'],
  'cv-generator': ['ai-humanizer', 'review-response', 'email-writer'],
  'watermark-remover': ['product-image', 'image-to-prompt', 'ai-digital-creator']
};

export const USAGE_GUIDES = {
  'seo-article': `<ol>
    <li><strong>Enter your topic</strong> – Type the main subject or keywords you want to rank for</li>
    <li><strong>Set your focus</strong> – Specify if you want a blog post, listicle, or tutorial</li>
    <li><strong>Generate</strong> – Click generate and get a fully structured SEO article</li>
    <li><strong>Edit & publish</strong> – Review, customize, and publish on your website</li>
  </ol>`,

  'image-to-prompt': `<ol>
    <li><strong>Upload an image</strong> – Drag and drop or click to select any image</li>
    <li><strong>AI analysis</strong> – Our AI analyzes composition, style, colors, and subject</li>
    <li><strong>Get your prompt</strong> – Receive a detailed prompt ready for Midjourney, DALL-E, or Stable Diffusion</li>
  </ol>`,

  'video-to-prompt': `<ol>
    <li><strong>Upload a video</strong> – Paste a YouTube link or upload a video file</li>
    <li><strong>AI extracts frames</strong> – Key frames are analyzed for visual elements</li>
    <li><strong>Receive prompts</strong> – Get scene-by-scene prompts for image generation</li>
  </ol>`,

  'tiktok': `<ol>
    <li><strong>Describe your content</strong> – Tell us what your TikTok is about</li>
    <li><strong>Choose style</strong> – Educational, entertaining, or promotional</li>
    <li><strong>Generate script</strong> – Get optimized TikTok scripts with hooks and CTAs</li>
  </ol>`,

  'youtube': `<ol>
    <li><strong>Enter your video topic</strong> – What is your video about?</li>
    <li><strong>Generate SEO metadata</strong> – Get title, description, tags, and timestamps</li>
    <li><strong>Optimize</strong> – Use our suggestions to rank higher on YouTube search</li>
  </ol>`,

  'ai-humanizer': `<ol>
    <li><strong>Paste AI text</strong> – Paste content generated by ChatGPT, Claude, or other AI</li>
    <li><strong>Choose humanization level</strong> – Light, moderate, or heavy</li>
    <li><strong>Get humanized text</strong> – Receive natural, undetectable content</li>
  </ol>`,

  'ad-copy': `<ol>
    <li><strong>Describe your product</strong> – What are you selling? Who is your target audience?</li>
    <li><strong>Choose ad format</strong> – Facebook, Google, Instagram, or LinkedIn</li>
    <li><strong>Generate ad copy</strong> – Get multiple variations with hooks, benefits, and CTAs</li>
  </ol>`,

  'amazon-listing': `<ol>
    <li><strong>Enter product details</strong> – Product name, features, and target keywords</li>
    <li><strong>Generate listing</strong> – AI creates optimized title, bullets, description, and backend terms</li>
    <li><strong>Paste to Amazon</strong> – Copy and paste directly to Seller Central</li>
  </ol>`,

  'product-description': `<ol>
    <li><strong>Enter product info</strong> – Product name, category, and key features</li>
    <li><strong>Select tone</strong> – Professional, casual, or persuasive</li>
    <li><strong>Generate</strong> – Get compelling product descriptions optimized for conversions</li>
  </ol>`,

  'etsy-listing': `<ol>
    <li><strong>Describe your product</strong> – What handmade or vintage item are you selling?</li>
    <li><strong>Add keywords</strong> – Include Etsy SEO keywords</li>
    <li><strong>Generate listing</strong> – Get optimized title, tags, and description for Etsy</li>
  </ol>`,

  'landing-page': `<ol>
    <li><strong>Describe your offer</strong> – What product or service are you promoting?</li>
    <li><strong>Choose structure</strong> – SaaS, ecommerce, or lead generation</li>
    <li><strong>Generate</strong> – Get a complete landing page copy with AIDA structure</li>
  </ol>`,

  'sales-copy': `<ol>
    <li><strong>Enter product details</strong> – What are you selling and to whom?</li>
    <li><strong>Select pain points</strong> – What problems does your product solve?</li>
    <li><strong>Generate</strong> – Get persuasive sales copy with proven frameworks</li>
  </ol>`,

  'shopify-seo': `<ol>
    <li><strong>Enter your product</strong> – What are you selling on Shopify?</li>
    <li><strong>Add target keywords</strong> – What terms do you want to rank for?</li>
    <li><strong>Generate SEO content</strong> – Get optimized meta titles, descriptions, and product text</li>
  </ol>`,

  'product-title': `<ol>
    <li><strong>Describe your product</strong> – What is it? What are its key features?</li>
    <li><strong>Select marketplace</strong> – Amazon, Etsy, eBay, or Shopify</li>
    <li><strong>Generate titles</strong> – Get click-worthy, SEO-optimized product titles</li>
  </ol>`,

  'review-response': `<ol>
    <li><strong>Paste the review</strong> – Copy the customer review text</li>
    <li><strong>Select sentiment</strong> – Positive, negative, or neutral</li>
    <li><strong>Generate response</strong> – Get a professional, empathetic reply</li>
  </ol>`,

  'pricing': `<ol>
    <li><strong>Describe your product</strong> – What are you pricing?</li>
    <li><strong>Enter costs</strong> – Production, marketing, and operational costs</li>
    <li><strong>Get optimized pricing</strong> – Receive pricing recommendations based on market data</li>
  </ol>`,

  'product-idea': `<ol>
    <li><strong>Enter your niche</strong> – What market are you interested in?</li>
    <li><strong>Set criteria</strong> – Profit margin, competition level, trends</li>
    <li><strong>Generate ideas</strong> – Get data-backed product ideas with market analysis</li>
  </ol>`,

  'product-image': `<ol>
    <li><strong>Upload product image</strong> – Upload your product photo</li>
    <li><strong>Select enhancement</strong> – Background removal, color correction, or upscaling</li>
    <li><strong>Get enhanced image</strong> – Download your professional-grade product image</li>
  </ol>`,

  'digital-product': `<ol>
    <li><strong>Choose product type</strong> – Ebook, course, template, or software</li>
    <li><strong>Describe your expertise</strong> – What knowledge are you packaging?</li>
    <li><strong>Generate</strong> – Get a complete digital product with outline and content</li>
  </ol>`,

  'digital-name': `<ol>
    <li><strong>Describe your product</strong> – What digital product are you naming?</li>
    <li><strong>Select style</strong> – Professional, creative, or modern</li>
    <li><strong>Generate names</strong> – Get catchy, brandable product names</li>
  </ol>`,

  'email-writer': `<ol>
    <li><strong>Describe your offer</strong> – What digital product are you promoting?</li>
    <li><strong>Select email type</strong> – Launch, nurture, or sales</li>
    <li><strong>Generate</strong> – Get high-converting email copy</li>
  </ol>`,

  'dropshipping': `<ol>
    <li><strong>Enter your niche</strong> – What market are you targeting?</li>
    <li><strong>Set budget</strong> – Product cost and shipping constraints</li>
    <li><strong>Get products</strong> – Receive researched product recommendations with suppliers</li>
  </ol>`,

  'prompt-article': `<ol>
    <li><strong>Enter your topic</strong> – What do you want to write about?</li>
    <li><strong>Select format</strong> – Blog post, tutorial, listicle, or review</li>
    <li><strong>Generate prompts</strong> – Get powerful AI prompts to create your content</li>
  </ol>`,

  'prompt-viral': `<ol>
    <li><strong>Enter your niche</strong> – What type of viral content do you create?</li>
    <li><strong>Choose platform</strong> – TikTok, Instagram, YouTube, or Twitter</li>
    <li><strong>Generate viral prompts</strong> – Get engagement-optimized content ideas</li>
  </ol>`,

  'viral-ideas': `<ol>
    <li><strong>Enter your niche</strong> – Describe your YouTube channel topic</li>
    <li><strong>Select content type</strong> – Tutorial, entertainment, educational, or vlog</li>
    <li><strong>Generate viral ideas</strong> – Receive trending video concepts with high viral potential</li>
  </ol>`,

  'youtube-title': `<ol>
    <li><strong>Enter video topic</strong> – What is your video about?</li>
    <li><strong>Choose title style</strong> – SEO-focused, click-driven, or shorts-optimized</li>
    <li><strong>Generate titles</strong> – Get 5+ optimized titles with high CTR potential</li>
  </ol>`,

  'viral-hook': `<ol>
    <li><strong>Describe your video</strong> – What is the main topic or story?</li>
    <li><strong>Select hook duration</strong> – First 5 seconds, first 15 seconds, or scroll-stopping</li>
    <li><strong>Generate hooks</strong> – Receive attention-grabbing hooks that stop the scroll</li>
  </ol>`,

  'youtube-script': `<ol>
    <li><strong>Enter video topic</strong> – What is your video about?</li>
    <li><strong>Choose format</strong> – Shorts, long-form, or faceless video</li>
    <li><strong>Generate script</strong> – Get a complete script with intro, main content, and CTA</li>
  </ol>`,

  'thumbnail-prompt': `<ol>
    <li><strong>Describe video topic</strong> – What is the video about?</li>
    <li><strong>Select emotion</strong> – Curious, excited, shocked, or inspired</li>
    <li><strong>Generate thumbnail prompts</strong> – Receive AI prompts for click-worthy thumbnails</li>
  </ol>`,

  'youtube-description': `<ol>
    <li><strong>Enter video title and topic</strong> – What is your video about?</li>
    <li><strong>Add target keywords</strong> – SEO keywords you want to rank for</li>
    <li><strong>Generate description</strong> – Get an SEO-optimized description with hashtags and timestamps</li>
  </ol>`,

  'youtube-tags': `<ol>
    <li><strong>Enter video topic</strong> – Describe your video content</li>
    <li><strong>Add primary keyword</strong> – Your main target keyword</li>
    <li><strong>Generate tags</strong> – Receive relevant tags and long-tail keywords</li>
  </ol>`,

  'youtube-seo': `<ol>
    <li><strong>Enter your title</strong> – Paste your video title</li>
    <li><strong>Enter your description</strong> – Paste your video description</li>
    <li><strong>Get SEO analysis</strong> – Receive a detailed SEO score and actionable suggestions</li>
  </ol>`,

  'faceless-video': `<ol>
    <li><strong>Enter video topic</strong> – What is your faceless video about?</li>
    <li><strong>Choose niche</strong> – Tech, finance, history, or educational</li>
    <li><strong>Generate</strong> – Get script, voiceover prompts, visual prompts, and B-roll ideas</li>
  </ol>`,

  'viral-shorts': `<ol>
    <li><strong>Enter your topic</strong> – What should the Shorts be about?</li>
    <li><strong>Select duration</strong> – 30s, 45s, or 60s</li>
    <li><strong>Generate Shorts</strong> – Receive viral-optimized short-form scripts</li>
  </ol>`,

  'storytelling-script': `<ol>
    <li><strong>Choose channel type</strong> – History, mystery, documentary, or educational</li>
    <li><strong>Enter your story topic</strong> – What story do you want to tell?</li>
    <li><strong>Generate script</strong> – Get a narrative-driven script with hooks and emotional beats</li>
  </ol>`,

  'community-post': `<ol>
    <li><strong>Describe your channel</strong> – What is your YouTube channel about?</li>
    <li><strong>Choose post type</strong> – Poll, discussion, announcement, or behind-the-scenes</li>
    <li><strong>Generate post</strong> – Get an engaging community post with high interaction potential</li>
  </ol>`,

  'comment-reply': `<ol>
    <li><strong>Paste the comment</strong> – Copy the YouTube comment text</li>
    <li><strong>Select tone</strong> – Professional, friendly, humorous, or educational</li>
    <li><strong>Generate reply</strong> – Get a thoughtful, engaging reply that builds community</li>
  </ol>`,

  'video-repurposer': `<ol>
    <li><strong>Paste video transcript or description</strong> – What is the video about?</li>
    <li><strong>Select target format</strong> – Blog article, Twitter thread, Instagram post, or LinkedIn post</li>
    <li><strong>Generate repurposed content</strong> – Receive platform-optimized content from your video</li>
  </ol>`
};

export const FAQS = {
  'seo-article': [
    { q: 'How long should an SEO article be?', a: 'For competitive keywords, aim for 1500-2500 words. Our AI generates comprehensive content that balances depth with readability.' },
    { q: 'Can I use these articles on my website?', a: 'Yes, all generated content is original and ready to publish. We recommend reviewing and customizing before publishing.' },
    { q: 'Does this support multiple languages?', a: 'Currently optimized for English, but the AI can generate content in other languages with varying quality.' }
  ],
  'image-to-prompt': [
    { q: 'What AI image generators are supported?', a: 'Our prompts work with Midjourney, DALL-E 3, Stable Diffusion, and Leonardo AI.' },
    { q: 'What image formats are accepted?', a: 'We accept JPG, PNG, WEBP, and GIF files up to 20MB.' },
    { q: 'Is this free to use?', a: 'Yes, our image to prompt generator is completely free with no usage limits.' }
  ],
  'video-to-prompt': [
    { q: 'Can I use YouTube links?', a: 'Yes, paste any YouTube URL and we will analyze the video content.' },
    { q: 'How long can the video be?', a: 'We support videos up to 10 minutes for optimal analysis.' },
    { q: 'What can I use the prompts for?', a: 'Use them to recreate scenes, generate storyboards, or create consistent visual styles.' }
  ],
  'tiktok': [
    { q: 'How long should a TikTok script be?', a: 'Optimal TikTok videos are 15-60 seconds. Our scripts are timed for maximum engagement.' },
    { q: 'Can I generate multiple script variations?', a: 'Yes, simply generate again to get fresh script ideas.' }
  ],
  'youtube': [
    { q: 'What makes a good YouTube title?', a: 'Good titles include target keywords, create curiosity, and promise value. Our AI optimizes for all three.' },
    { q: 'How many tags should I use?', a: 'YouTube allows up to 500 characters of tags. We generate 10-15 optimized tags.' }
  ],
  'ai-humanizer': [
    { q: 'Does this bypass AI detectors?', a: 'Our humanizer is designed to reduce AI detection scores while maintaining readability and meaning.' },
    { q: 'What AI detectors are supported?', a: 'Works with GPTZero, Originality.ai, Turnitin, and CopyLeaks.' }
  ],
  'ad-copy': [
    { q: 'Which ad platforms are supported?', a: 'Facebook, Google Ads, Instagram, LinkedIn, and TikTok ads.' },
    { q: 'How many ad variations should I test?', a: 'We recommend testing 3-5 variations to find the highest converting copy.' }
  ],
  'amazon-listing': [
    { q: 'Does this include backend search terms?', a: 'Yes, we generate backend search terms optimized for Amazon A9 algorithm.' },
    { q: 'Can I use this for Amazon Europe?', a: 'Currently optimized for Amazon US. Multilingual support coming soon.' }
  ],
  'product-description': [
    { q: 'How long should a product description be?', a: '150-300 words for most products. Include features, benefits, and social proof.' },
    { q: 'Can I generate descriptions in bulk?', a: 'Yes, generate one at a time or use our API for bulk generation.' }
  ],
  'etsy-listing': [
    { q: 'How many tags does Etsy allow?', a: 'Etsy allows 13 tags. We generate all 13 with high-volume keywords.' },
    { q: 'What makes a good Etsy title?', a: 'Front-load with your most important keywords. Keep it natural and descriptive.' }
  ],
  'landing-page': [
    { q: 'What is AIDA framework?', a: 'Attention, Interest, Desire, Action – the proven copywriting structure for conversions.' },
    { q: 'Can I customize the structure?', a: 'Yes, after generation you can edit any section to match your brand voice.' }
  ],
  'sales-copy': [
    { q: 'What copy frameworks are used?', a: 'AIDA, PAS (Problem-Agitate-Solution), and FAB (Features-Advantages-Benefits).' },
    { q: 'How long should sales copy be?', a: 'Depends on your product price. Higher priced items need longer, more detailed copy.' }
  ],
  'shopify-seo': [
    { q: 'How does Shopify SEO differ from Amazon?', a: 'Shopify relies more on Google rankings. We optimize for both search engines and conversions.' },
    { q: 'Does this include meta descriptions?', a: 'Yes, we generate optimized meta titles and descriptions for each product.' }
  ],
  'product-title': [
    { q: 'How many titles should I test?', a: 'We recommend A/B testing 2-3 title variations to find the best performer.' },
    { q: 'Should I include my brand name?', a: 'Put your brand at the end of the title for Amazon, or the beginning for brand recognition.' }
  ],
  'review-response': [
    { q: 'How quickly should I respond to reviews?', a: 'Within 24-48 hours for best customer satisfaction and SEO impact.' },
    { q: 'Should I respond to negative reviews?', a: 'Yes, professional responses to negative reviews show you care about customer experience.' }
  ],
  'pricing': [
    { q: 'What pricing strategies are supported?', a: 'Cost-plus, value-based, competitive, and psychological pricing strategies.' },
    { q: 'How often should I update prices?', a: 'Review pricing quarterly or when market conditions change significantly.' }
  ],
  'product-idea': [
    { q: 'How do I validate a product idea?', a: 'Check search volume, competition, profit margins, and customer demand before investing.' },
    { q: 'What makes a good product niche?', a: 'Passionate audience, reasonable competition, good margins, and room for differentiation.' }
  ],
  'product-image': [
    { q: 'What image enhancements are available?', a: 'Background removal, color correction, brightness adjustment, and AI upscaling to 4K.' },
    { q: 'Is there a size limit?', a: 'Images up to 20MB and 4000x4000px are supported.' }
  ],
  'digital-product': [
    { q: 'What types of digital products can I create?', a: 'Ebooks, online courses, templates, software, printables, and digital art.' },
    { q: 'Do I need technical skills?', a: 'No, our AI guides you through the entire creation process step by step.' }
  ],
  'digital-name': [
    { q: 'What makes a good product name?', a: 'Memorable, descriptive, unique, and easy to spell. We optimize for all these factors.' },
    { q: 'Can I check domain availability?', a: 'We recommend checking domain availability separately after generating names.' }
  ],
  'email-writer': [
    { q: 'What is a good email open rate?', a: 'Industry average is 20-25%. Our copy is optimized to beat these benchmarks.' },
    { q: 'How long should marketing emails be?', a: '50-125 words for promotional emails, 200-300 words for nurture sequences.' }
  ],
  'dropshipping': [
    { q: 'What suppliers are recommended?', a: 'AliExpress, CJ Dropshipping, Spocket, and US-based suppliers depending on your niche.' },
    { q: 'What profit margin should I target?', a: 'Aim for 30-50% profit margin after product cost, shipping, and advertising.' }
  ],
  'prompt-article': [
    { q: 'What makes a good writing prompt?', a: 'Clear context, specific requirements, desired tone, and target audience makes prompts effective.' },
    { q: 'Can I reuse prompts?', a: 'Yes, save your best prompts and reuse them with different topics for consistent quality.' }
  ],
  'prompt-viral': [
    { q: 'What content goes viral?', a: 'Content that triggers strong emotions, provides value, or is highly relatable tends to go viral.' },
    { q: 'How often should I post?', a: 'Consistency matters more than frequency. Aim for 3-5 times per week minimum.' }
  ],

  'viral-ideas': [
    { q: 'How do I find viral video ideas?', a: 'Our AI analyzes trending topics, audience interests, and viral patterns to generate high-potential video concepts.' },
    { q: 'How many ideas will I get?', a: 'Each generation produces 5-7 unique viral video ideas with detailed descriptions and angle suggestions.' }
  ],

  'youtube-title': [
    { q: 'What makes a good YouTube title?', a: 'A great title includes target keywords, creates curiosity, promises value, and is under 60 characters for full display.' },
    { q: 'How many title variations will I get?', a: 'You get 5+ SEO-optimized titles per generation, including click-driven and shorts-optimized variations.' }
  ],

  'viral-hook': [
    { q: 'How long should a video hook be?', a: 'The first 5 seconds are critical for retention. We generate hooks of varying lengths for different video types.' },
    { q: 'What makes a hook scroll-stopping?', a: 'A strong hook creates curiosity, addresses a pain point, or makes a bold statement that demands attention.' }
  ],

  'youtube-script': [
    { q: 'How long should my script be?', a: 'For Shorts: 30-60 seconds. For long-form: 8-15 minutes. For faceless: 5-10 minutes with visual variety.' },
    { q: 'What structure does the script follow?', a: 'Hook → Problem → Solution → Value → CTA. Each section is optimized for retention and engagement.' }
  ],

  'thumbnail-prompt': [
    { q: 'What makes a good thumbnail?', a: 'High contrast, clear subject, emotional expression, and text overlay. Our prompts optimize for all these elements.' },
    { q: 'Can I use these prompts in any AI image generator?', a: 'Yes, they work with Midjourney, DALL-E, Stable Diffusion, and Leonardo AI.' }
  ],

  'youtube-description': [
    { q: 'How long should a description be?', a: '200-300 words with keywords in the first 150 characters. Include timestamps, links, and a CTA.' },
    { q: 'How many hashtags should I use?', a: '3-5 relevant hashtags are optimal. We generate high-performing hashtags for your niche.' }
  ],

  'youtube-tags': [
    { q: 'How many tags does YouTube allow?', a: 'YouTube allows up to 500 characters of tags. We generate 10-15 optimized tags per video.' },
    { q: 'Should I use broad or specific tags?', a: 'A mix of broad and long-tail tags works best. We optimize for both reach and relevance.' }
  ],

  'youtube-seo': [
    { q: 'What is a good SEO score?', a: 'A score above 80/100 is excellent. We provide specific suggestions to improve your ranking.' },
    { q: 'What factors does the SEO analysis check?', a: 'Title optimization, keyword usage, description structure, tag relevance, and engagement potential.' }
  ],

  'faceless-video': [
    { q: 'What niches work best for faceless channels?', a: 'Tech, finance, history, educational, and motivational niches perform exceptionally well.' },
    { q: 'Do I need editing skills?', a: 'No, we provide detailed visual prompts and B-roll suggestions that you can use with AI video tools.' }
  ],

  'viral-shorts': [
    { q: 'How long should a YouTube Shorts be?', a: '30-60 seconds is optimal. We generate scripts for 30s, 45s, and 60s durations.' },
    { q: 'What makes a Shorts go viral?', a: 'Fast pacing, strong hook, trending audio, and high retention in the first 3 seconds.' }
  ],

  'storytelling-script': [
    { q: 'What storytelling structures are used?', a: 'The Hero\'s Journey, Three-Act Structure, and Problem-Solution frameworks for maximum engagement.' },
    { q: 'How long should a storytelling script be?', a: '8-15 minutes for documentary/history, 5-8 minutes for mystery, 3-5 minutes for educational.' }
  ],

  'community-post': [
    { q: 'How often should I post to Community?', a: '2-3 times per week maintains engagement. Polls get the highest response rates.' },
    { q: 'What type of posts perform best?', a: 'Polls, behind-the-scenes content, and discussion starters typically get the most engagement.' }
  ],

  'comment-reply': [
    { q: 'How quickly should I reply to comments?', a: 'Within 24 hours for best algorithm performance and community building.' },
    { q: 'Should I reply to all comments?', a: 'Replying to the first 50-100 comments signals engagement to YouTube\'s algorithm.' }
  ],

  'video-repurposer': [
    { q: 'What formats can I repurpose to?', a: 'Blog articles, Twitter/X threads, Instagram posts/carousels, and LinkedIn articles.' },
    { q: 'How long should repurposed content be?', a: 'Blog: 800-1500 words. Thread: 10-20 tweets. Instagram: 2-3 slides. LinkedIn: 300-500 words.' }
  ]
};
