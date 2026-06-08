import { verifyAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'blog');
const JSON_FILE = path.join(process.cwd(), 'data', 'blog.json');
const TMP_JSON = path.join('/tmp', 'data', 'blog.json');

async function findPostInFile(id) {
  for (const file of [TMP_JSON, JSON_FILE]) {
    try {
      if (!fs.existsSync(file)) continue;
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const posts = Array.isArray(data) ? data : (data.posts || []);
      const numId = Number(id);
      const found = posts.find(p => Number(p.id) === numId || p.id === id || p.slug === id);
      if (found) return found;
    } catch {}
  }
  return null;
}

async function updateJson(id, data) {
  for (const file of [JSON_FILE, TMP_JSON]) {
    try {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let posts;
      if (fs.existsSync(file)) {
        posts = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (!Array.isArray(posts)) posts = posts.posts || [];
      } else {
        posts = [];
      }
      const idx = posts.findIndex(p => Number(p.id) === Number(id) || p.id === id);
      if (idx >= 0) {
        posts[idx] = { ...posts[idx], ...data };
      } else {
        posts.push({ id: Number(id), ...data });
      }
      fs.writeFileSync(file, JSON.stringify(posts, null, 2), 'utf-8');
    } catch {}
  }
}

async function ensurePostExists(id) {
  try {
    const check = await query('SELECT id FROM blog_posts WHERE id = $1', [Number(id)]);
    if (check && check.length > 0) return true;
  } catch {}

  const fromFile = await findPostInFile(id);
  if (!fromFile) return false;

  try {
    await query(
      `INSERT INTO blog_posts (id, slug, title, excerpt, content, category, tags, author, featured_image, meta_description, seo_title, keywords, reading_time, status, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        Number(fromFile.id) || null, fromFile.slug || '', fromFile.title || 'Untitled',
        fromFile.excerpt || '', fromFile.content || '', fromFile.category || 'General',
        Array.isArray(fromFile.tags) ? fromFile.tags : [], fromFile.author || 'Chafiktech Ai',
        fromFile.featured_image || '', fromFile.meta_description || '', fromFile.seo_title || '',
        Array.isArray(fromFile.keywords) ? fromFile.keywords : [], Number(fromFile.reading_time) || 5,
        fromFile.status || 'published', fromFile.published_at || null, fromFile.created_at || null
      ]
    );
  } catch {}
  return true;
}

function dataUrlToBuffer(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const header = dataUrl.slice(0, comma);
  const extMatch = header.match(/image\/(\w+)/);
  const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'jpg';
  const base64 = dataUrl.slice(comma + 1);
  const buf = Buffer.from(base64, 'base64');
  return { buf, ext };
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
      return Response.json({ success: false, message: `Post ${id} not found` }, { status: 404 });
    }

    const { buf, ext } = dataUrlToBuffer(image);
    const filename = `${numId}_${Date.now()}.${ext}`;
    let finalImage = image;

    // 1) Upload to Vercel Blob (persistent across deploys)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`blog/${filename}`, buf, {
          access: 'public',
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });
        finalImage = blob.url;
      } catch (e) {
        console.warn('Blob upload failed, falling back to file:', e.message);
      }
    }

    // 2) Save as file cache
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      const filePath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filePath, buf);
    } catch {}

    // 3) Store in DB
    try {
      await query(
        'UPDATE blog_posts SET featured_image = $1, has_image = TRUE, updated_at = NOW() WHERE id = $2',
        [finalImage, numId]
      );
    } catch {}

    // 4) Store in JSON (/tmp + data/)
    await updateJson(numId, { featured_image: finalImage, has_image: true });

    return Response.json({
      success: true,
      message: 'Image saved',
      post_id: numId,
      url: finalImage,
      size: buf.length
    });
  } catch (err) {
    return Response.json({ success: false, message: err.message || 'Failed to save image' }, { status: 500 });
  }
}