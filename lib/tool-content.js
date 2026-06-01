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
  'prompt-viral': { name: 'Viral Prompt Generator', icon: '🔥', category: 'Content Writing' }
};

export const TOOL_ARTICLES = {
  'seo-article': { slug: 'ai-seo-article-generator', title: 'How to Generate SEO Articles with AI – Complete Guide 2026' },
  'image-to-prompt': { slug: 'image-to-prompt-ai', title: 'Image to Prompt AI – How to Generate Perfect Prompts' },
  'video-to-prompt': { slug: 'video-to-prompt-ai', title: 'Video to Prompt AI Explained – Turn Videos Into Prompts' },
  'tiktok': { slug: 'tiktok-ai-tools', title: 'Best AI Tools for TikTok Content Creation in 2026' },
  'youtube': { slug: 'youtube-ai-suite', title: 'YouTube SEO with AI Suite – Rank Higher in 2026' },
  'ai-humanizer': { slug: 'ai-humanizer-guide', title: 'AI Humanizer – Make AI Text Undetectable in 2026' },
  'ad-copy': { slug: 'ai-ad-copy-generator', title: 'How to Write Viral Ad Copy Using AI – Step by Step' },
  'amazon-listing': { slug: 'amazon-ai-listing', title: 'Amazon Listing Optimization with AI – Boost Sales' },
  'product-description': { slug: 'ai-product-descriptions', title: 'AI Product Description Generator – Complete Guide' },
  'etsy-listing': { slug: 'etsy-ai-listing', title: 'Etsy SEO with AI Listing Generator – Sell More' },
  'landing-page': { slug: 'ai-landing-page-generator', title: 'Landing Page Copy with AI – Conversion Focused' },
  'sales-copy': { slug: 'ai-sales-copy', title: 'AI Sales Copy That Converts – Proven Templates' },
  'shopify-seo': { slug: 'shopify-ai-seo', title: 'Shopify SEO with AI Tools – Rank Your Store' },
  'product-title': { slug: 'ai-product-titles', title: 'AI Product Title Generator – Click Worthy Titles' },
  'review-response': { slug: 'ai-review-responses', title: 'Automate Review Responses with AI – Save Time' },
  'pricing': { slug: 'ai-pricing-optimization', title: 'AI Pricing Optimization Strategy – Maximize Profit' },
  'product-idea': { slug: 'ai-product-ideas', title: 'Find Profitable Product Ideas with AI – 2026 Guide' },
  'product-image': { slug: 'ai-product-images', title: 'Enhance Product Images with AI – Ecommerce Guide' },
  'digital-product': { slug: 'ai-digital-products', title: 'Create Digital Products with AI – Complete Guide' },
  'digital-name': { slug: 'ai-product-names', title: 'AI Digital Product Name Generator – Creative Names' },
  'email-writer': { slug: 'ai-email-marketing', title: 'AI Email Marketing Copy Guide – Higher Open Rates' },
  'dropshipping': { slug: 'ai-dropshipping-research', title: 'AI Dropshipping Product Research – Find Winners' },
  'prompt-article': { slug: 'ai-writing-prompts', title: 'Best AI Writing Prompts for Content Creation' },
  'prompt-viral': { slug: 'viral-content-prompts', title: 'Viral Content Prompts with AI – Go Viral on Social' }
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
  'prompt-viral': ['tiktok', 'ai-humanizer', 'prompt-article']
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
  ]
};
