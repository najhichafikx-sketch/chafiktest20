const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function suggestTitles({ title, style }) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: 'You are a YouTube thumbnail expert. Given a video title and style, suggest 3 improved short punchy titles (max 5 words each) optimized for click-through rate. Return ONLY a JSON array: [{title: string, reason: string}]',
      messages: [{
        role: 'user',
        content: `Video title: "${title}"\nStyle: ${style}\n\nSuggest 3 optimized thumbnail titles:`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude error: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '[]';
  try {
    return JSON.parse(text);
  } catch {
    return [{ title, reason: 'Original title' }];
  }
}
