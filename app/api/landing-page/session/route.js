function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

export async function GET() {
  const sessionId = generateSessionId();
  return Response.json({ sessionId }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Set-Cookie': `lp_sid=${sessionId}; Path=/; Max-Age=2592000; SameSite=Lax`
    }
  });
}
