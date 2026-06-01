export function sanitizeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeInput(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').slice(0, 10000);
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6 && password.length <= 128;
}

export function validateApiKey(key) {
  if (!key || typeof key !== 'string') return false;
  return /^sk-or-v1-[a-zA-Z0-9]{32,}$/.test(key);
}
