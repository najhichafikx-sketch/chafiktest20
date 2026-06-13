// lib/auto-publisher/longtail.js
// Long-tail SEO article topic pool. Low-competition, high-informational-value topics.

const LONGTAIL_TOPICS = [
  // How-to guides
  { title: 'How to Remove Gemini Watermarks from AI-Generated Images for Free', traffic: 35000, weight: 1.8, category: 'Technology', source: 'longtail-howto' },
  { title: 'How to Create Viral YouTube Shorts with AI in Under 10 Minutes', traffic: 42000, weight: 2.0, category: 'Technology', source: 'longtail-howto' },
  { title: 'How to Automate Pinterest Pinning for Blog Traffic Using Free Tools', traffic: 28000, weight: 1.6, category: 'Marketing', source: 'longtail-howto' },
  { title: 'How to Install and Run DeepSeek Locally on Windows for Free', traffic: 38000, weight: 1.9, category: 'Technology', source: 'longtail-howto' },
  { title: 'How to Bypass AI Detection for Essays Without Getting Caught', traffic: 55000, weight: 2.3, category: 'Technology', source: 'longtail-howto' },
  { title: 'How to Turn ChatGPT into a Personalized Writing Assistant for Free', traffic: 32000, weight: 1.7, category: 'AI', source: 'longtail-howto' },

  // Comparison / vs articles
  { title: 'Hostinger vs Bluehost vs SiteGround: Best Web Hosting for Beginners 2026', traffic: 45000, weight: 2.1, category: 'Technology', source: 'longtail-comparison' },
  { title: 'WordPress vs Webflow vs Wix: Best Website Builder for SEO in 2026', traffic: 40000, weight: 2.0, category: 'Technology', source: 'longtail-comparison' },
  { title: 'Canva vs Adobe Express vs Kittl: Best Design Tool for Non-Designers', traffic: 35000, weight: 1.8, category: 'Technology', source: 'longtail-comparison' },
  { title: 'Shopify vs WooCommerce vs Wix Stores: Best E-Commerce Platform for Small Business', traffic: 48000, weight: 2.2, category: 'Business', source: 'longtail-comparison' },

  // Best-of lists
  { title: 'Best Free AI Image Generators for Commercial Use in 2026', traffic: 42000, weight: 2.0, category: 'AI', source: 'longtail-best' },
  { title: 'Best Free Plagiarism Checkers That Actually Work in 2026', traffic: 30000, weight: 1.7, category: 'Technology', source: 'longtail-best' },
  { title: 'Best Free Keyword Research Tools for Low-Competition SEO in 2026', traffic: 38000, weight: 1.9, category: 'Marketing', source: 'longtail-best' },
  { title: 'Best Free Online Photo Editors Without Watermarks in 2026', traffic: 35000, weight: 1.8, category: 'Technology', source: 'longtail-best' },

  // Problem-solving
  { title: 'Why Is My Website Not Showing on Google? Fix Crawl Indexing Issues Fast', traffic: 42000, weight: 2.0, category: 'Marketing', source: 'longtail-problem' },
  { title: 'Why Is ChatGPT Not Working Today? Common Issues and Fixes', traffic: 50000, weight: 2.2, category: 'Technology', source: 'longtail-problem' },
  { title: 'Can Google Detect AI Content in 2026? What You Need to Know', traffic: 48000, weight: 2.1, category: 'Marketing', source: 'longtail-problem' },
  { title: 'How Much Does a Professional Website Cost in 2026? Complete Pricing Guide', traffic: 35000, weight: 1.8, category: 'Business', source: 'longtail-guide' },

  // Niche step-by-step
  { title: 'Step-by-Step Guide to Monetize a Blog with AI Content Without Getting Penalized', traffic: 40000, weight: 2.0, category: 'Marketing', source: 'longtail-guide' },
  { title: 'Complete Guide to Starting an SEO Blog with No Experience in 2026', traffic: 45000, weight: 2.1, category: 'Marketing', source: 'longtail-guide' },
  { title: 'How to Use AI for Local SEO: Rank Your Small Business on Google Maps', traffic: 32000, weight: 1.7, category: 'Marketing', source: 'longtail-howto' },
  { title: 'How to Write SEO-Friendly Blog Posts That Rank Fast Using AI', traffic: 38000, weight: 1.9, category: 'Marketing', source: 'longtail-howto' },
  { title: 'Best AI Tools for Automating Social Media Posts in 2026', traffic: 36000, weight: 1.8, category: 'Marketing', source: 'longtail-best' },
  { title: 'How to Start a Faceless YouTube Channel with AI in 2026', traffic: 52000, weight: 2.2, category: 'Technology', source: 'longtail-howto' },

  // ============ HIGH-RPM MONETIZATION TOPICS ($5-15 RPM) ============
  // Added 2026-06-12 for revenue optimization

  // Insurance & Finance (highest RPM in market)
  { title: 'Best Life Insurance Companies of 2026: Complete Comparison Guide', traffic: 85000, weight: 3.0, category: 'Finance', source: 'longtail-finance' },
  { title: 'How to Get Approved for Personal Loans in 24 Hours (2026 Guide)', traffic: 95000, weight: 3.2, category: 'Finance', source: 'longtail-finance' },
  { title: 'Best Auto Insurance Rates in 2026: Save Up to $500/Year', traffic: 78000, weight: 2.8, category: 'Finance', source: 'longtail-finance' },
  { title: 'How to Refinance Your Mortgage in 2026: Step-by-Step Guide', traffic: 88000, weight: 3.0, category: 'Finance', source: 'longtail-finance' },
  { title: 'Best Health Insurance Plans for Self-Employed in 2026', traffic: 72000, weight: 2.7, category: 'Finance', source: 'longtail-finance' },
  { title: 'How Does Life Insurance Work? Complete Beginner Guide 2026', traffic: 65000, weight: 2.6, category: 'Finance', source: 'longtail-finance' },
  { title: 'Best Term Life Insurance Policies for Families in 2026', traffic: 70000, weight: 2.7, category: 'Finance', source: 'longtail-finance' },

  // Make Money Online (high RPM $3-8)
  { title: '12 Proven Ways to Make $1000/Week Online in 2026', traffic: 110000, weight: 3.3, category: 'Business', source: 'longtail-money' },
  { title: 'Best Passive Income Ideas That Actually Work in 2026', traffic: 95000, weight: 3.0, category: 'Business', source: 'longtail-money' },
  { title: 'How to Start a Profitable Side Hustle in 30 Days (2026)', traffic: 88000, weight: 2.9, category: 'Business', source: 'longtail-money' },
  { title: '7 Best AI Side Hustles to Start in 2026 (Earn $500+/Day)', traffic: 105000, weight: 3.2, category: 'Business', source: 'longtail-money' },
  { title: 'How to Make Money with AI Tools in 2026: Complete Guide', traffic: 98000, weight: 3.0, category: 'Business', source: 'longtail-money' },

  // Crypto (high RPM $3-10)
  { title: 'Bitcoin Price Prediction 2026: Will BTC Hit $200K?', traffic: 180000, weight: 3.5, category: 'Crypto', source: 'longtail-crypto' },
  { title: 'Best Cryptocurrencies to Buy Now for Maximum Gains in 2026', traffic: 145000, weight: 3.3, category: 'Crypto', source: 'longtail-crypto' },
  { title: 'Ethereum vs Solana 2026: Which is the Better Investment?', traffic: 95000, weight: 2.9, category: 'Crypto', source: 'longtail-crypto' },
  { title: 'How to Buy Bitcoin Safely in 2026: Complete Beginner Guide', traffic: 85000, weight: 2.8, category: 'Crypto', source: 'longtail-crypto' },

  // Health (high RPM $2-6)
  { title: 'Best Weight Loss Programs That Actually Work in 2026', traffic: 125000, weight: 3.2, category: 'Health', source: 'longtail-health' },
  { title: 'Keto Diet 30-Day Plan: Complete Guide for Beginners 2026', traffic: 110000, weight: 3.0, category: 'Health', source: 'longtail-health' },
  { title: 'How to Lose Belly Fat in 30 Days: Science-Backed Method', traffic: 140000, weight: 3.3, category: 'Health', source: 'longtail-health' },
  { title: 'Best Supplements for Muscle Gain in 2026: What Actually Works', traffic: 92000, weight: 2.9, category: 'Health', source: 'longtail-health' },
];

let currentIndex = 0;

export function getNextLongTailTopic() {
  const topic = LONGTAIL_TOPICS[currentIndex % LONGTAIL_TOPICS.length];
  currentIndex++;
  return {
    ...topic,
    pubDate: new Date().toISOString(),
    region: 'global',
    score: topic.traffic * topic.weight,
    isLongTail: true,
    matchData: null
  };
}

export function getLongTailPool() {
  return LONGTAIL_TOPICS;
}