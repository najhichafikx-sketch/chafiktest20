import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSb() {
  if (!SB_URL || !SB_KEY) return null;
  return createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
}

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

export async function createBlogPost(article, metadata = {}) {
  try {
    const sb = getSb();
    if (!sb) throw new Error('Supabase not configured');

    const faqSchema = article.faqs && article.faqs.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer }
      }))
    } : null;

    const post = {
      slug: article.slug,
      title: article.title,
      excerpt: article.metaDescription,
      content: article.content,
      meta_title: article.title,
      meta_description: article.metaDescription,
      keywords: article.tags ? article.tags.join(', ') : '',
      category: article.category || 'General',
      tags: article.tags || [],
      faqs: article.faqs || [],
      faq_schema: faqSchema,
      featured_image: article.featured_image || null,
      status: 'published',
      published_at: new Date().toISOString(),
      source: metadata.source || 'auto-publisher',
      trend_title: metadata.trend || '',
      seo_score: metadata.seoScore || null,
      word_count: metadata.wordCount || article.wordCount,
      author: 'Chafiktech AI',
      created_at: new Date().toISOString()
    };

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
