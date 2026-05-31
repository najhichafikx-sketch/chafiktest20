const crypto = require('crypto');
const db = require('../db');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';
// ENCRYPTION_SECRET must be 32 bytes for aes-256. If not provided, fallback to hashing JWT_SECRET
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'default_fallback_secret_key_12345';
  return crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
};

// --- Encryption Utilities ---

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getSecretKey()), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getSecretKey()), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Failed to decrypt API Key:', err.message);
    return null;
  }
}

// --- API Key Management ---

function getOpenRouterKey() {
  try {
    const stmt = db.prepare(`SELECT api_key FROM api_settings WHERE provider = 'openrouter' AND status = 'active'`);
    const result = stmt.get();
    
    if (result && result.api_key) {
      const decryptedKey = decrypt(result.api_key);
      if (decryptedKey) return decryptedKey;
    }
  } catch (err) {
    console.error('Error fetching OpenRouter key from DB:', err.message);
  }

  // Fallback to .env
  return process.env.OPENROUTER_API_KEY;
}

function incrementUsage() {
  try {
    const stmt = db.prepare(`UPDATE api_settings SET usage_count = usage_count + 1 WHERE provider = 'openrouter'`);
    stmt.run();
  } catch (err) {
    console.error('Error incrementing usage:', err.message);
  }
}

// --- AI Generation Service ---

/**
 * Reusable helper for all AI generation tasks.
 */
async function generateAIContent({ prompt, systemPrompt, model = 'openai/gpt-4o', temperature = 0.7, maxTokens = 1500, imageBase64 = null, imageMimeType = null }) {
  const apiKey = getOpenRouterKey();
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured in Admin Settings or .env');
  }

  const messages = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  if (imageBase64 && imageMimeType) {
    // Vision support
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: `data:${imageMimeType};base64,${imageBase64}`
          }
        }
      ]
    });
  } else {
    // Standard text
    messages.push({ role: 'user', content: prompt });
  }

  const payload = {
    model: model,
    messages: messages,
    temperature: temperature,
    max_tokens: maxTokens,
    // Optional model fallbacks can be passed in OpenRouter routing config, but we will rely on OpenRouter's native routing or specify an array
    models: [model, "google/gemini-2.5-flash", "anthropic/claude-3-haiku"]
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.SITE_URL || 'http://localhost:8080',
      'X-Title': 'SaaS Platform',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  // Track usage
  incrementUsage();

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  }
  
  throw new Error('No content returned from OpenRouter');
}

module.exports = {
  encrypt,
  decrypt,
  getOpenRouterKey,
  generateAIContent
};
