import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

let initialized = false;

const HTML_REDIRECTS = {
  '/index.html': '/',
  '/blog.html': '/blog',
  '/about.html': '/about',
  '/contact.html': '/contact',
  '/faq.html': '/faq',
  '/privacy.html': '/privacy',
  '/terms.html': '/terms',
  '/disclaimer.html': '/disclaimer',
  '/pricing.html': '/pricing',
  '/login.html': '/login',
  '/register.html': '/register',
  '/admin.html': '/admin-login',
  '/sitemap.html': '/sitemap.xml',
  '/seo-article-generator.html': '/tools/seo-article-generator',
  '/image-to-prompt.html': '/tools/image-to-prompt',
  '/video-to-prompt.html': '/tools/video-to-prompt',
  '/youtube-suite.html': '/tools/youtube-suite',
  '/ai-humanizer.html': '/tools/ai-humanizer',
  '/ad-copy-generator.html': '/tools/ad-copy-generator',
  '/amazon-listing-generator.html': '/tools/amazon-listing-generator',
  '/product-description-generator.html': '/tools/product-description-generator',
  '/etsy-listing-generator.html': '/tools/etsy-listing-generator',
  '/landing-page-generator.html': '/tools/landing-page-generator'
};

const CSP = [
  "default-src 'self'",
   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.adsterra.com https://*.effectivecpmnetwork.com https://*.adsterratrk.com https://*.adsterra.biz https://www.googletagmanager.com https://www.google-analytics.com https://cdn.tiny.cloud http://www.highperformanceformat.com https://www.highperformanceformat.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src https: http:",
   "connect-src 'self' http: https: http://www.highperformanceformat.com https://www.highperformanceformat.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

export async function proxy(request) {
  if (!initialized) {
    try { await initDB(); } catch { /* DB unavailable */ }
    initialized = true;
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (HTML_REDIRECTS[path]) {
    return NextResponse.redirect(new URL(HTML_REDIRECTS[path], request.url), { status: 301 });
  }

  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
