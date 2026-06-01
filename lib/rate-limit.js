const store = new Map();

export function rateLimit({ interval = 60000, max = 10 } = {}) {
  return async (request) => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const now = Date.now();

    if (!store.has(ip)) {
      store.set(ip, []);
    }

    const timestamps = store.get(ip).filter(t => now - t < interval);
    if (timestamps.length >= max) {
      return { allowed: false, retryAfter: Math.ceil((timestamps[0] + interval - now) / 1000) };
    }

    timestamps.push(now);
    store.set(ip, timestamps);
    return { allowed: true };
  };
}

export function rateLimitMiddleware({ interval = 60000, max = 10 } = {}) {
  const limiter = rateLimit({ interval, max });
  return async (request) => {
    const result = await limiter(request);
    if (!result.allowed) {
      return Response.json(
        { success: false, error: `Rate limit exceeded. Try again in ${result.retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
      );
    }
    return null;
  };
}
