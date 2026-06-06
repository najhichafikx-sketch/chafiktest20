import { verifyAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

async function findPostInFile(id) {
  try {
    const file = path.join(process.cwd(), 'data', 'blog.json');
    if (!fs.existsSync(file)) return null;
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const posts = Array.isArray(data) ? data : (data.posts || []);
    const numId = Number(id);
    return posts.find(p => Number(p.id) === numId || p.id === id || p.slug === id) || null;
  } catch {
    return null;
  }
}

async function ensurePostExists(id) {
  const check = await query('SELECT id FROM blog_posts WHERE id = $1', [Number(id)]);
  if (check && check.length > 0) return true;

  const fromFile = await findPostInFile(id);
  if (!fromFile) return false;

  try {
    await query(
      `INSERT INTO blog_posts (id, slug, title, excerpt, content, category, tags, author, featured_image, meta_description, seo_title, keywords, reading_time, status, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        Number(fromFile.id) || null,
        fromFile.slug || '',
        fromFile.title || 'Untitled',
        fromFile.excerpt || '',
        fromFile.content || '',
        fromFile.category || 'General',
        Array.isArray(fromFile.tags) ? fromFile.tags : [],
        fromFile.author || 'Chafiktech Ai',
        fromFile.featured_image || '',
        fromFile.meta_description || '',
        fromFile.seo_title || '',
        Array.isArray(fromFile.keywords) ? fromFile.keywords : [],
        Number(fromFile.reading_time) || 5,
        fromFile.status || 'published',
        fromFile.published_at || null,
        fromFile.created_at || null
      ]
    );
    return true;
  } catch (e) {
    console.error('ensurePostExists failed:', e.message);
    return false;
  }
}

export async function POST(request, { params }) {
  if (!verifyAdmin(request)) {
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = (await params).id;
    const numId = Number(id);
    const data = await request.json();
    const image = data.image;

    if (typeof image !== 'string') {
      return Response.json({ success: false, message: 'image must be a string' }, { status: 400 });
    }
    if (image.length > 5 * 1024 * 1024) {
      return Response.json({ success: false, message: 'image too large (max 5MB base64)' }, { status: 413 });
    }

    const ensured = await ensurePostExists(numId);
    if (!ensured) {
      return Response.json({ success: false, message: `Post ${id} not found in DB or file` }, { status: 404 });
    }

    const result = await query(
      'UPDATE blog_posts SET featured_image = $1, updated_at = NOW() WHERE id = $2 RETURNING id, length(featured_image) AS img_len',
      [image, numId]
    );

    if (!result || result.length === 0) {
      return Response.json({ success: false, message: 'Update returned 0 rows' }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Image saved',
      post_id: numId,
      image_length: result[0]?.img_len || image.length
    });
  } catch (err) {
    return Response.json({ success: false, message: err.message || 'Failed to save image' }, { status: 500 });
  }
}
