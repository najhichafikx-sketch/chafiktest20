<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Notes

## Ad Networks (Monetag + Adsterra)
- Confirmed working on `chafiktech.com` after fixing local DNS/SSL (Cloudflare DNS `1.1.1.1` / `1.0.0.1`).
- If banner ads do NOT show in the browser, check FIRST: local network/DNS/SSL (e.g. ISP blocks ad CDN domains like `gtagserv.com`, `highperformanceformat.com`, `profitabledisplaynetwork.com`, `094kk.com`).
  - Quick test: switch DNS to Cloudflare or use 5G/mobile data.
  - If ads appear on mobile but not PC → it's a local network/ISP issue, not code.
- Code locations:
  - Monetag scripts: `app/layout.js` (head/body) + SW `public/sw.js` (zone `11103150`).
  - Adsterra banner: `components/AdsterraBanner.js` (tries 3 CDNs with fallback + dynamic size).
  - Monetag banner slot: `components/MonetagBanner.js`.
  - `public/ads.txt` has chafiktech.com zone IDs (29505513-29505516).
- Vercel CSP in `proxy.ts` is already permissive (`script-src https: http: data: blob:` etc).

