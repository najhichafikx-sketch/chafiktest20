const CATEGORY_COLORS = {
  Technology: ['#6366f1', '#22d3ee'],
  Business: ['#f59e0b', '#ef4444'],
  Finance: ['#10b981', '#059669'],
  Health: ['#ec4899', '#8b5cf6'],
  Science: ['#14b8a6', '#06b6d4'],
  Entertainment: ['#f97316', '#eab308'],
  Sports: ['#3b82f6', '#1d4ed8'],
  Marketing: ['#8b5cf6', '#6366f1'],
  AI: ['#7c3aed', '#22d3ee'],
  Crypto: ['#f59e0b', '#d97706'],
  General: ['#6366f1', '#22d3ee']
};

function getColors(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.General;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(str, len) {
  return (str || '').length > len ? str.slice(0, len) + '...' : (str || '');
}

function generateSvg(title, category) {
  const [c1, c2] = getColors(category);
  const lines = splitIntoLines(truncate(title, 60), 25);

  let textElements = lines.map((line, i) =>
    `<text x="600" y="${280 + i * 42}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.92)">${escapeXml(line)}</text>`
  ).join('\n    ');

  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.15)" />
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="200" cy="150" r="250" fill="url(#glow)" />
  <circle cx="1000" cy="480" r="300" fill="url(#glow)" />
  ${textElements}
  <text x="600" y="${280 + lines.length * 42 + 30}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="rgba(255,255,255,0.5)" letter-spacing="3" text-transform="uppercase">${escapeXml(category || '')}</text>
</svg>`)}`;
}

function splitIntoLines(text, maxLen) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxLen) {
      current += (current ? ' ' : '') + word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

export async function generateFeaturedImage(article) {
  try {
    const title = article.title || 'Article';
    const category = article.category || 'General';
    return {
      url: generateSvg(title, category),
      source: 'generated',
      has_image: true
    };
  } catch (err) {
    console.error('[IMAGOGEN] Failed:', err.message);
    return { url: '', source: 'none', has_image: false };
  }
}

export function getCategoryImage(category) {
  const [c1, c2] = getColors(category);
  return { gradient: [c1, c2] };
}
