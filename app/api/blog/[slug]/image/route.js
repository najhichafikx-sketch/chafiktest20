import { getBlogPostFeaturedImage } from '@/lib/db';
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

function respond(buf, contentType, cache, isPng) {
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': isPng ? 'image/png' : contentType,
      'Cache-Control': cache,
      'Content-Length': String(buf.length)
    }
  });
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const isPng = request.nextUrl.searchParams.get('__fmt') === 'png';
    const post = await getBlogPostFeaturedImage(slug);

    if (!post || !post.featured_image) {
      const svg = placeholderSVG(slug);
      return respond(Buffer.from(svg), 'image/svg+xml', 'public, max-age=3600', isPng);
    }

    const img = post.featured_image;

    // URL-based (Vercel Blob)
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      try {
        const res = await fetch(img, { cache: 'force-cache' });
        if (res.ok) {
          const blob = await res.arrayBuffer();
          return respond(Buffer.from(blob), res.headers.get('Content-Type') || 'image/jpeg', 'public, max-age=31536000, immutable', isPng);
        }
      } catch {}
    }

    // File-based
    if (typeof img === 'string' && img.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', img);
      if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        const mime = isPng ? 'image/png' : (() => {
          const ext = path.extname(filePath).slice(1);
          return ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        })();
        return respond(buf, mime, 'public, max-age=31536000, immutable', isPng);
      }
      // File missing — try /tmp/blog.json for runtime base64
      try {
        const tmpFile = path.join('/tmp', 'data', 'blog.json');
        if (fs.existsSync(tmpFile)) {
          const posts = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
          const p = (Array.isArray(posts) ? posts : posts.posts || []).find(x => x.slug === slug);
          if (p?.featured_image?.startsWith('data:')) {
            const comma = p.featured_image.indexOf(',');
            const mime2 = p.featured_image.slice(5, comma).split(';')[0] || 'image/jpeg';
            const base64 = p.featured_image.slice(comma + 1);
            return respond(Buffer.from(base64, 'base64'), mime2, 'public, max-age=31536000, immutable', isPng);
          }
        }
      } catch {}
    }

    // Base64 image
    if (typeof img === 'string' && img.startsWith('data:')) {
      const comma = img.indexOf(',');
      const mime = isPng ? 'image/png' : (img.slice(5, comma).split(';')[0] || 'image/jpeg');
      const base64 = img.slice(comma + 1);
      return respond(Buffer.from(base64, 'base64'), mime, 'public, max-age=31536000, immutable', isPng);
    }

    const svg = placeholderSVG(slug);
    return respond(Buffer.from(svg), 'image/svg+xml', 'public, max-age=3600', isPng);
  } catch {
    return new Response(null, { status: 500 });
  }
}