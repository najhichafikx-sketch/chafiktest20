import { getAdSettings } from '@/lib/adSettings';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location');

  try {
    const dbAds = await getAdSettings();
    if (dbAds && dbAds.length > 0) {
      for (const a of dbAds) {
        if (a.location === location && a.enabled && a.code) {
          return Response.json({ success: true, html: a.code });
        }
      }
    }
  } catch {}

  return Response.json({ success: true, html: '' });
}
