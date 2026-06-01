import { trackEvent } from '@/lib/analytics';
import { optionalUser } from '@/lib/auth';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ success: false }, { status: 400 });
  }

  const { event_type, page_url, metadata } = body;
  if (!event_type) {
    return Response.json({ success: false, message: 'event_type required' }, { status: 400 });
  }

  const user = optionalUser(request);

  await trackEvent(event_type, {
    userId: user?.id || null,
    pageUrl: page_url || '',
    sessionId: request.headers.get('x-session-id') || '',
    metadata: metadata || {}
  });

  return Response.json({ success: true });
}
