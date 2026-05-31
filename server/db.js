const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite DB
const db = new Database(path.join(dataDir, 'saas.db'), { verbose: console.log });

// Create Tables
const initDb = () => {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      credits INTEGER DEFAULT 50,
      plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Generations History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tool_id TEXT NOT NULL,
      input_text TEXT,
      result_html TEXT,
      is_saved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // We are using is_saved inside generations table instead of a separate saved_results table
  // for simplicity. If a result is saved, is_saved = 1.

  // API Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT UNIQUE NOT NULL,
      api_key TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      usage_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add 'plan' column to users table
  try {
    db.exec(`ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free'`);
    console.log("✅ Migration: Added 'plan' column to users table");
  } catch (e) {
    // Column already exists, ignore
  }

  console.log("✅ SQLite Database Initialized");
};

initDb();

module.exports = db;
