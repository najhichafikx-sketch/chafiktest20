import { getBlogPostBySlug } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const isPngRequest = request.nextUrl.searchParams.get('__fmt') === 'png';
    const post = await getBlogPostBySlug(slug);
    if (!post || !post.featured_image) {
      return new Response(null, { status: 404 });
    }

    const img = post.featured_image;

    // File-based image
    if (typeof img === 'string' && img.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', img);
      if (!fs.existsSync(filePath)) return new Response(null, { status: 404 });
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

    // Legacy base64 image
    if (typeof img !== 'string' || !img.startsWith('data:')) {
      return new Response(null, { status: 404 });
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
