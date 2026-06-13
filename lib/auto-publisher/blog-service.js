// lib/auto-publisher/blog-service.js
// Supabase save layer for the auto-publisher.
//
// What changed vs the previous version:
//   - Accepts the new multilingual bundle shape produced by writer.writeArticle()
//   - Persists one row per language (en / ar / fr) sharing the same base slug
//     + a locale suffix, so /blog/<slug>-en, /blog/<slug>-ar, /blog/<slug>-fr
//     all live as independent posts
//   - Stores all SEO metadata: primaryKeyword, secondaryKeywords, longTailKeywords,
//     relatedSearchTerms, hashtags, keyTakeaways, keyFacts
//   - Builds JSON-LD FAQPage schema per language
//   - All other helpers (getStats, getRecentArticles, getExistingSlugs) are
//     kept intact for back-compat with the admin dashboard

import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSb() {
  if (!SB_URL || !SB_KEY) return null;
  return createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
}

// =====================================================================
// READ HELPERS (unchanged from previous version)
// =====================================================================

export async function getStats() {
  try {
    const sb = getSb();
    if (!sb) return { total: 0, today: 0, published: 0 };

    const { count: total } = await sb.from('blog_posts').select('*', { count: 'exact', head: true });
    const today = await sb.from('blog_posts').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]);
    const { count: published } = await sb.from('blog_posts').select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    return {
      total: total || 0,
      today: today?.count || 0,
      published: published || 0
    };
  } catch (err) {
    console.error('getStats failed:', err);
    return { total: 0, today: 0, published: 0 };
  }
}

export async function getRecentArticles(limit = 50) {
  try {
    const sb = getSb();
    if (!sb) return [];

    const { data } = await sb.from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    return data || [];
  } catch (err) {
    console.error('getRecentArticles failed:', err);
    return [];
  }
}

export async function getExistingSlugs() {
  try {
    const sb = getSb();
    if (!sb) return [];

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await sb.from('blog_posts')
      .select('slug')
      .gte('created_at', thirtyDaysAgo);

    return (data || []).map(r => r.slug);
  } catch (err) {
    console.warn('Could not fetch existing slugs:', err.message);
    return [];
  }
}

// =====================================================================
// CREATE / UPSERT — single language (back-compat)
// =====================================================================

/**
 * Save a single article (one language) to Supabase.
 * This is the legacy entry point used by older tests / scripts.
 * New code should prefer createMultilingualPosts().
 */
export async function createBlogPost(article, metadata = {}) {
  try {
    const sb = getSb();
    if (!sb) throw new Error('Supabase not configured');

    const post = buildPostRow(article, metadata, metadata.language || article.language || 'en');

    const { data, error } = await sb.from('blog_posts')
      .upsert(post, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) throw new Error(error.message);
    return { id: data.id, slug: post.slug };
  } catch (err) {
    console.error('Failed to create blog post:', err);
    throw new Error(`DB insert failed: ${err.message}`);
  }
}

// =====================================================================
// CREATE / UPSERT — multilingual bundle
// =====================================================================

/**
 * Persist every language variant of a multilingual bundle.
 *
 * @param {object} bundle      Output of writer.writeArticle()
 * @param {object} metadata    { source, trend, seoScore, scheduleAt }
 * @returns {Promise<{saved: Array<{language, id, slug}>, errors: object}>}
 */
export async function createMultilingualPosts(bundle, metadata = {}) {
  const sb = getSb();
  if (!sb) throw new Error('Supabase not configured');

  if (!bundle || !bundle.languages || Object.keys(bundle.languages).length === 0) {
    throw new Error('Bundle has no language variants to save');
  }

  const saved = [];
  const errors = {};

  for (const [lang, article] of Object.entries(bundle.languages)) {
    if (!article) continue;
    try {
      const row = buildPostRow(article, metadata, lang, bundle);
      const { data, error } = await sb.from('blog_posts')
        .upsert(row, { onConflict: 'slug' })
        .select('id, slug')
        .single();

      if (error) throw new Error(error.message);
      saved.push({ language: lang, id: data.id, slug: row.slug });
    } catch (err) {
      console.error(`[blog-service] Failed to save [${lang}]:`, err.message);
      errors[lang] = err.message;
    }
  }

  return { saved, errors: Object.keys(errors).length ? errors : null };
}

// =====================================================================
// ROW BUILDER
// =====================================================================

/**
 * Build the Supabase row for a single language variant of an article.
 * Centralized so the legacy single-language path and the new multilingual
 * path produce identical row shapes.
 */
function buildPostRow(article, metadata, language, bundle = null) {
  const baseSlug = bundle?.baseSlug || article.slug;
  const localizedSlug = `${baseSlug}-${language}`;

  const faqSchema = article.faqs && article.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  } : null;

  // Article-level schema.org JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    inLanguage: language,
    keywords: (article.secondaryKeywords || []).join(', '),
    author: { '@type': 'Organization', name: 'Chafiktech AI' },
    publisher: { '@type': 'Organization', name: 'Chafiktech' },
    datePublished: metadata.scheduleAt || new Date().toISOString(),
    dateModified: new Date().toISOString()
  };

  return {
    // Identity
    slug: localizedSlug,
    base_slug: baseSlug,
    locale: language,

    // Core content
    title: article.title,
    excerpt: article.excerpt || article.metaDescription,
    content: article.content,

    // SEO
    meta_title: article.title,
    meta_description: article.metaDescription,
    og_title: article.ogTitle || article.title,
    og_description: article.ogDescription || article.metaDescription,
    primary_keyword: article.primaryKeyword || '',
    secondary_keywords: article.secondaryKeywords || [],
    long_tail_keywords: article.longTailKeywords || [],
    related_search_terms: article.relatedSearchTerms || [],
    internal_links: article.internalLinks || [],
    keywords: [
      article.primaryKeyword,
      ...(article.secondaryKeywords || []),
      ...(article.longTailKeywords || [])
    ].filter(Boolean).join(', '),

    // Organization
    category: article.category || 'General',
    tags: article.tags || [],
    hashtags: article.hashtags || '',

    // Snippet-friendly blocks
    key_facts: article.keyFacts || [],
    key_takeaways: article.keyTakeaways || [],

    // FAQ / schema.org
    faqs: article.faqs || [],
    faq_schema: faqSchema,
    article_schema: articleSchema,

    // Media
    featured_image: article.featured_image || null,
    image_prompt: article.imagePrompt || '',

    // Metadata
    status: 'published',
    published_at: metadata.scheduleAt || new Date().toISOString(),
    source: metadata.source || 'auto-publisher',
    trend_title: metadata.trend || '',
    seo_score: metadata.seoScore || null,
    word_count: metadata.wordCount || article.wordCount,
    reading_time: article.readingTime || Math.ceil((article.wordCount || 0) / 200),
    model: article.model || null,

    author: 'Chafiktech AI',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
