'use client';

const TIER1 = ['US', 'GB', 'CA', 'AU', 'DE', 'NL', 'FR', 'IT', 'ES', 'JP', 'SE', 'CH', 'NO', 'DK', 'FI', 'BE', 'AT', 'IE', 'NZ'];

const GEO_CACHE_KEY = 'chafik_geo';
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000;

const POPUNDER_KEY = 'last_popunder';
const POPUNDER_LIMIT = 3 * 60 * 60 * 1000;

const IPP_KEY = 'chafik_inpage_session';
const IPP_DELAY_MS = 10_000;

export function isUploading() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__isUploading);
}

export function setUploading(v) {
  if (typeof window === 'undefined') return;
  window.__isUploading = Boolean(v);
}

export function isOnHome() {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === '/';
}

export function isArticleOrBlog() {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  return p.startsWith('/blog') || p.startsWith('/prompts');
}

export function canFirePopunder() {
  if (typeof window === 'undefined') return false;
  if (isUploading()) return false;
  if (isOnHome()) return false;
  if (isArticleOrBlog()) return false;
  const last = Number(window.localStorage.getItem(POPUNDER_KEY) || 0);
  return !last || Date.now() - last > POPUNDER_LIMIT;
}

export function markPopunderFired() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(POPUNDER_KEY, String(Date.now()));
}

export function firePopunderMonetag() {
  if (typeof window === 'undefined') return;
  if (!canFirePopunder()) return;
  markPopunderFired();
  const s = document.createElement('script');
  s.dataset.zone = '11103201';
  s.src = 'https://al5sm.com/tag.min.js';
  (document.body || document.documentElement).appendChild(s);
}

export function canFireInPagePush() {
  if (typeof window === 'undefined') return false;
  if (isOnHome()) return false;
  if (window.sessionStorage.getItem(IPP_KEY)) return false;
  return true;
}

export function fireInPagePushDelayed() {
  if (typeof window === 'undefined') return;
  if (!canFireInPagePush()) return;
  window.sessionStorage.setItem(IPP_KEY, '1');
  window.setTimeout(() => {
    const s = document.createElement('script');
    s.dataset.zone = '11103207';
    s.src = 'https://nap5k.com/tag.min.js';
    (document.body || document.documentElement).appendChild(s);
  }, IPP_DELAY_MS);
}

export async function getGeoTier() {
  if (typeof window === 'undefined') return 2;
  try {
    const raw = window.localStorage.getItem(GEO_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.t && Date.now() - (parsed.ts || 0) < GEO_CACHE_TTL) {
        return parsed.t;
      }
    }
  } catch {}

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('geo failed');
    const j = await res.json();
    const country = String(j.country || '').toUpperCase();
    const tier = TIER1.includes(country) ? 1 : 2;
    window.localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ c: country, t: tier, ts: Date.now() }));
    return tier;
  } catch {
    return 2;
  }
}

export function isDesktopWide() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 1024;
}

export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}
