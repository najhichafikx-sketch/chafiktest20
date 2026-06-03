import { kv } from '@vercel/kv';

const HARDCODED_ADS = {
  header: {
    id: 'header', location: 'header', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  },
  sidebar: {
    id: 'sidebar', location: 'sidebar', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  },
  content_top: {
    id: 'content_top', location: 'content_top', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  },
  content_bottom: {
    id: 'content_bottom', location: 'content_bottom', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  },
  footer: {
    id: 'footer', location: 'footer', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  },
  in_tool: {
    id: 'in_tool', location: 'in_tool', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  },
  loading_state: {
    id: 'loading_state', location: 'loading_state', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  },
  mid_result: {
    id: 'mid_result', location: 'mid_result', enabled: true, updated_at: '2026-01-01T00:00:00.000Z',
    code: `<script>atOptions={'key':'a64a753a91e1df2d14eac4534cea9820','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/a64a753a91e1df2d14eac4534cea9820/invoke.js"></script>`
  }
};

export async function getAdSettings() {
  try {
    const saved = await kv.get('ad_settings');
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
  } catch {}
  return Object.values(HARDCODED_ADS);
}

export async function saveAdSetting(id, data) {
  const ads = await getAdSettings();
  const existing = ads.findIndex(a => id ? a.id === id : a.location === data.location);
  const entry = { id: id || data.location, location: data.location, enabled: data.enabled !== false, code: data.code || '', updated_at: new Date().toISOString() };
  if (existing >= 0) ads[existing] = entry;
  else ads.push(entry);
  try {
    await kv.set('ad_settings', ads);
  } catch {}
}
