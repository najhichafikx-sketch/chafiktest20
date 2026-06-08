import { getBlogPostFeaturedImage } from '@/lib/db';
import { getSql } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function placeholderSVG(slug) {
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const bg = '#111114';
  const fg = '#d4a827';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="#0d0d0f"/></linearGradient></defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <rect x="1" y="1" width="798" height="448" fill="none" stroke="${fg}" stroke-opacity="0.15" stroke-width="2" rx="8"/>
    <text x="400" y="210" text-anchor="middle" fill="${fg}" font-size="28" font-weight="700" font-family="system-ui,sans-serif">${title}</text>
    <text x="400" y="245" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="system-ui,sans-serif">chafiktech.com</text>
  </svg>`;
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const isPngRequest = request.nextUrl.searchParams.get('__fmt') === 'png';
    const post = await getBlogPostFeaturedImage(slug);

    // No post or no image → return placeholder
    if (!post || !post.featured_image) {
      const svg = placeholderSVG(slug);
      const buf = Buffer.from(svg);
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': isPngRequest ? 'image/png' : 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
          'Content-Length': String(buf.length)
        }
      });
    }

    const img = post.featured_image;

    // File-based image
    if (typeof img === 'string' && img.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', img);
      if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        const mime = isPngRequest ? 'image/png' : (() => {
          const ext = path.extname(filePath).slice(1);
          return ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        })();
        return new Response(buf, {
          status: 200,
          headers: {
            'Content-Type': mime,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Length': String(buf.length)
          }
        });
      }
      // File missing — try DB for base64 (survives deploys)
      try {
        const sql = getSql();
        if (sql) {
          const rows = await sql.query(`SELECT featured_image FROM blog_posts WHERE slug = $1`, [slug]);
          const row = rows.rows ? rows.rows[0] : rows?.[0];
          if (row?.featured_image?.startsWith('data:')) {
            const comma = row.featured_image.indexOf(',');
            const mime2 = row.featured_image.slice(5, comma).split(';')[0] || 'image/jpeg';
            const base64 = row.featured_image.slice(comma + 1);
            const b = Buffer.from(base64, 'base64');
            return new Response(b, {
              status: 200,
              headers: { 'Content-Type': isPngRequest ? 'image/png' : mime2, 'Cache-Control': 'public, max-age=31536000, immutable', 'Content-Length': String(b.length) }
            });
          }
        }
      } catch { /* hard fallback to placeholder */ }
      const svg = placeholderSVG(slug);
      const b = Buffer.from(svg);
      return new Response(b, {
        status: 200,
        headers: { 'Content-Type': isPngRequest ? 'image/png' : 'image/svg+xml', 'Cache-Control': 'public, max-age=3600', 'Content-Length': String(b.length) }
      });
    }

    // Legacy base64 image
    if (typeof img !== 'string' || !img.startsWith('data:')) {
      const svg = placeholderSVG(slug);
      const buf = Buffer.from(svg);
      return new Response(buf, {
        status: 200,
        headers: {
          'Content-Type': isPngRequest ? 'image/png' : 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
          'Content-Length': String(buf.length)
        }
      });
    }
    const comma = img.indexOf(',');
    const mime = isPngRequest ? 'image/png' : (img.slice(5, comma).split(';')[0] || 'image/jpeg');
    const base64 = img.slice(comma + 1);
    const buf = Buffer.from(base64, 'base64');
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buf.length)
      }
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
