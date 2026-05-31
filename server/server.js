const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const db = require('./db');
const openRouter = require('./lib/openrouter');

const app = express();
const PORT = process.env.PORT || 8080;
const ENV_PATH = path.join(__dirname, '.env');
const LOGS_PATH = path.join(__dirname, 'logs.json');

app.use(cors());
app.use(express.json());

// Serve the static frontend
app.use(express.static(path.join(__dirname, '../public_html')));

// --- Logs System ---
function writeLog(level, message, details = {}) {
  let logs = [];
  try {
    if (fs.existsSync(LOGS_PATH)) {
      logs = JSON.parse(fs.readFileSync(LOGS_PATH, 'utf8'));
    }
  } catch (e) {
    console.error("Could not read logs file");
  }
  
  logs.unshift({
    timestamp: new Date().toISOString(),
    level,
    message,
    details
  });
  
  // Keep last 100 logs
  if (logs.length > 100) logs = logs.slice(0, 100);
  
  try {
    fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error("Could not write to logs file");
  }
}

// --- API Admin Routes ---

// Admin Authentication Middleware
const verifyAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    next();
  });
};

// Admin Login Route
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
    writeLog('INFO', 'Admin logged in successfully');
    res.json({ success: true, token });
  } else {
    writeLog('WARN', 'Failed admin login attempt');
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// --- OpenRouter Admin Settings ---

app.get('/api/admin/settings/openrouter', verifyAdmin, (req, res) => {
  try {
    const stmt = db.prepare("SELECT api_key, usage_count, status FROM api_settings WHERE provider = 'openrouter'");
    const row = stmt.get();
    
    if (row && row.api_key) {
      // Return a masked version of the key
      const maskedKey = 'sk-or-v1-' + '*'.repeat(16) + row.api_key.slice(-4);
      res.json({ success: true, isConfigured: true, maskedKey, usageCount: row.usage_count, status: row.status });
    } else {
      res.json({ success: true, isConfigured: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/admin/settings/openrouter', verifyAdmin, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
    return res.status(400).json({ success: false, message: 'Invalid OpenRouter API Key format' });
  }

  try {
    const encryptedKey = openRouter.encrypt(apiKey);
    const stmt = db.prepare(`
      INSERT INTO api_settings (provider, api_key, status, updated_at) 
      VALUES ('openrouter', ?, 'active', CURRENT_TIMESTAMP)
      ON CONFLICT(provider) DO UPDATE SET api_key = excluded.api_key, status = 'active', updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(encryptedKey);
    writeLog('INFO', 'OpenRouter API Key updated securely by Admin');
    res.json({ success: true, message: 'OpenRouter API Key saved securely.' });
  } catch (err) {
    writeLog('ERROR', 'Failed to save OpenRouter API Key', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to save API Key' });
  }
});

app.post('/api/admin/settings/openrouter/test', verifyAdmin, async (req, res) => {
  const { apiKey } = req.body;
  
  // We can either test the provided key or test the currently saved one.
  // For safety, let's just do a tiny fetch with the provided key.
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (response.ok) {
      res.json({ success: true, message: 'Connection successful!' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid API Key' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Connection failed' });
  }
});

// Get Logs
app.get('/api/admin/logs', verifyAdmin, (req, res) => {
  let logs = [];
  if (fs.existsSync(LOGS_PATH)) {
    try {
      logs = JSON.parse(fs.readFileSync(LOGS_PATH, 'utf8'));
    } catch(e) {}
  }
  res.json(logs);
});

// Dashboard Status
app.get('/api/admin/status', verifyAdmin, (req, res) => {
  const hasApi = !!openRouter.getOpenRouterKey();
  
  // Tool registry — update when a new tool is linked
  const totalTools = 25;
  const linkedTools = 25; // All tools now routed through OpenRouter
  
  res.json({
    totalTools: totalTools,
    activeTools: hasApi ? linkedTools : 0,
    mockTools: hasApi ? 0 : linkedTools,
    missingKeys: hasApi ? 0 : 1,
    apiStatus: hasApi ? 'Online' : 'Offline',
    systemHealth: 'Optimal',
    uptime: process.uptime()
  });
});

// --- User Authentication & API Routes ---

const verifyUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    if (decoded.role === 'admin') {
      req.user = { id: 0, role: 'admin' };
      return next();
    }
    req.user = decoded;
    next();
  });
};

// Optional auth - attaches user if token present, continues if not
const optionalUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    req.user = null; // Guest user
    return next();
  }
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, decoded) => {
    if (err) {
      req.user = null; // Invalid token, treat as guest
      return next();
    }
    if (decoded.role === 'admin') {
      req.user = { id: 0, role: 'admin' };
      return next();
    }
    req.user = decoded;
    next();
  });
};

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  try {
    const stmtCheck = db.prepare('SELECT id FROM users WHERE email = ?');
    if (stmtCheck.get(email)) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const stmtInsert = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const info = stmtInsert.run(email, hash);

    const token = jwt.sign({ id: info.lastInsertRowid, email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ success: true, token, message: 'Registration successful' });
  } catch (err) {
    writeLog('ERROR', 'Registration error', { error: err.message });
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ success: true, token, message: 'Login successful' });
  } catch (err) {
    writeLog('ERROR', 'Login error', { error: err.message });
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

app.get('/api/auth/me', verifyUser, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ success: true, user: { email: 'admin', credits: 'Unlimited', plan: 'premium', daily_generations: 0 } });
  }
  const stmt = db.prepare('SELECT id, email, credits, plan, created_at FROM users WHERE id = ?');
  const user = stmt.get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  // Count today's generations
  const today = new Date().toISOString().split('T')[0];
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM generations WHERE user_id = ? AND date(created_at) = ?');
  const genCount = countStmt.get(req.user.id, today);
  user.daily_generations = genCount ? genCount.count : 0;
  user.plan = user.plan || 'free';
  
  res.json({ success: true, user });
});

// User History & Saved Results
app.get('/api/user/history', verifyUser, (req, res) => {
  if (req.user.role === 'admin') return res.json({ success: true, history: [] });
  const stmt = db.prepare('SELECT * FROM generations WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
  const history = stmt.all(req.user.id);
  res.json({ success: true, history });
});

app.get('/api/user/saved', verifyUser, (req, res) => {
  if (req.user.role === 'admin') return res.json({ success: true, saved: [] });
  const stmt = db.prepare('SELECT * FROM generations WHERE user_id = ? AND is_saved = 1 ORDER BY created_at DESC');
  const saved = stmt.all(req.user.id);
  res.json({ success: true, saved });
});

app.post('/api/user/save', verifyUser, (req, res) => {
  const { generation_id } = req.body;
  if (req.user.role === 'admin') return res.json({ success: true });
  const stmt = db.prepare('UPDATE generations SET is_saved = 1 WHERE id = ? AND user_id = ?');
  const info = stmt.run(generation_id, req.user.id);
  if (info.changes > 0) {
    res.json({ success: true, message: 'Result saved' });
  } else {
    res.status(404).json({ success: false, message: 'Generation not found' });
  }
});

app.delete('/api/user/saved/:id', verifyUser, (req, res) => {
  const generation_id = req.params.id;
  if (req.user.role === 'admin') return res.json({ success: true });
  const stmt = db.prepare('UPDATE generations SET is_saved = 0 WHERE id = ? AND user_id = ?');
  const info = stmt.run(generation_id, req.user.id);
  res.json({ success: true });
});

// --- AI Generation Route ---

// Rate Limiting Middleware
const generateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 10,
  message: { success: false, error: 'Rate limit exceeded. Please wait a minute before trying again.' },
  handler: (req, res, next, options) => {
    writeLog('WARN', `Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

app.post('/api/generate', generateLimiter, optionalUser, async (req, res) => {
  const { toolId, input, prompt } = req.body;
  
  writeLog('INFO', `Generate request received for tool: ${toolId}`, { input, user: req.user?.email || req.user?.role || 'guest' });

  // Check Credits (skip for guests and admins)
  let userCredits = 0;
  const isGuest = !req.user;
  const isAdmin = req.user && req.user.role === 'admin';
  const isPremium = req.user && req.user.plan === 'premium';
  
  if (!isGuest && !isAdmin && !isPremium) {
    const stmt = db.prepare('SELECT credits, plan FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });
    if (user.credits <= 0) {
      return res.status(403).json({ success: false, error: 'Insufficient credits. Please recharge your account.' });
    }
    userCredits = user.credits;
  }

  // Model Routing Strategy
  let model = 'anthropic/claude-3-haiku'; // Default fast/cheap
  
  const highQualityTools = ['seo-article', 'landing-page', 'sales-copy'];
  const seoTools = ['seo-titles', 'keyword-optimizer', 'shopify-seo'];
  
  if (highQualityTools.includes(toolId)) {
    model = 'openai/gpt-4o';
  } else if (seoTools.includes(toolId)) {
    model = 'google/gemini-2.5-flash';
  }

  try {
    const fullPrompt = prompt || `You are an expert AI assistant. Complete the task for tool: ${toolId}. Input: ${input}. Provide HTML formatted output, using <h3> and <p> tags appropriately. Do not use markdown backticks in the final output.`;
    
    let resultText = await openRouter.generateAIContent({
      prompt: fullPrompt,
      systemPrompt: "You are a helpful assistant that outputs clean HTML.",
      model: model,
      temperature: 0.7
    });

    // Clean up potential markdown formatting from LLM
    resultText = resultText.replace(/^```html/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    if (!resultText) {
      throw new Error("Empty response");
    }

    // Deduct credit & save history (skip for guests and premium)
    let generationId = null;
    if (!isGuest && !isAdmin) {
      if (!isPremium) {
        db.prepare('UPDATE users SET credits = credits - 1 WHERE id = ?').run(req.user.id);
      }
      const stmt = db.prepare('INSERT INTO generations (user_id, tool_id, input_text, result_html) VALUES (?, ?, ?, ?)');
      const info = stmt.run(req.user.id, toolId, input, resultText);
      generationId = info.lastInsertRowid;
    }

    return res.json({
      success: true,
      html: resultText,
      source: 'api',
      modelUsed: model,
      generationId
    });

  } catch (error) {
    writeLog('ERROR', `Generation failed for tool: ${toolId}`, { error: error.message });
    console.error("API Error:", error.message);
    return res.status(500).json({ success: false, error: 'Failed to generate content: ' + error.message });
  }
});

// --- Image to Prompt Route ---
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const imagePromptLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: 'Rate limit exceeded. Maximum 5 requests per minute per IP.' }
});

app.post('/api/image-to-prompt', imagePromptLimiter, optionalUser, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image provided.' });
  }

  // Check Credits (skip for guests and admins)
  const isGuest = !req.user;
  const isAdmin = req.user && req.user.role === 'admin';
  const isPremium = req.user && req.user.plan === 'premium';
  
  if (!isGuest && !isAdmin && !isPremium) {
    const stmt = db.prepare('SELECT credits, plan FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });
    if (user.credits <= 0) {
      return res.status(403).json({ success: false, error: 'Insufficient credits. Please recharge your account.' });
    }
  }

  try {
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    const systemPrompt = `You are an expert AI prompt engineer for image generation models like Midjourney, DALL-E, and Stable Diffusion.
Your task is to analyze the provided image and generate an ultra-professional, highly detailed prompt that would recreate this image (or an enhanced version of it).
The prompt MUST include:
1. Scene description (main subject, action)
2. Style (cinematic, realistic, anime, digital art, etc.)
3. Lighting (dramatic, soft, neon, natural, etc.)
4. Camera angle / lens (e.g., shallow depth of field, 35mm lens, wide angle)
5. Environment/Background
6. Ultra detailed keywords & Quality tags (8k, ultra realistic, hyper detailed, masterpiece)
Respond ONLY with the final prompt text. Do not include introductory or concluding remarks.`;

    const generatedPrompt = await openRouter.generateAIContent({
      prompt: "Analyze this image and create a prompt for it.",
      systemPrompt: systemPrompt,
      model: "openai/gpt-4o",
      maxTokens: 300,
      imageBase64: base64Image,
      imageMimeType: mimeType
    });

    // Deduct credit & save history
    let generationId = null;
    if (!isGuest && !isAdmin) {
      if (!isPremium) {
        db.prepare('UPDATE users SET credits = credits - 1 WHERE id = ?').run(req.user.id);
      }
      const stmt = db.prepare('INSERT INTO generations (user_id, tool_id, input_text, result_html) VALUES (?, ?, ?, ?)');
      const info = stmt.run(req.user.id, 'image-to-prompt', 'Image Upload', generatedPrompt);
      generationId = info.lastInsertRowid;
    }

    return res.json({
      success: true,
      prompt: generatedPrompt,
      generationId
    });

  } catch (error) {
    writeLog('ERROR', `Image to prompt generation failed`, { error: error.message });
    return res.status(500).json({ success: false, error: 'Failed to generate prompt. ' + error.message });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SaaS Backend running on http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
