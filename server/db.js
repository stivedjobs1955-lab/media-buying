const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'unique.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    budget TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'yangi',
    source TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pageviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    referrer TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    name TEXT NOT NULL,
    phone TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    meet_link TEXT,
    calendar_event_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (lead_id) REFERENCES leads(id)
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT NOT NULL,
    image_url TEXT,
    author TEXT NOT NULL DEFAULT 'The Unique Media',
    read_time TEXT NOT NULL DEFAULT '7 daqiqa',
    views INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL
  );
`);

// Migration for existing databases without status column
try {
  db.exec("ALTER TABLE articles ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");
} catch (e) {
  // Column already exists
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function ensureDefaultAdmin(email, password) {
  const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
  if (existing) return;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  db.prepare('INSERT INTO admins (email, salt, hash, created_at) VALUES (?, ?, ?, ?)')
    .run(email, salt, hash, new Date().toISOString());
}

let SEED_ARTICLES = [];
try {
  const articlesModule = require(path.join(__dirname, '..', 'public', 'articles-data.js'));
  if (articlesModule && articlesModule.ARTICLES_DATA) {
    SEED_ARTICLES = articlesModule.ARTICLES_DATA;
  }
} catch (e) {
  console.warn('[DB] Could not load articles-data.js for seeding:', e.message);
}

function ensureSeedArticles() {
  if (!SEED_ARTICLES || SEED_ARTICLES.length === 0) return;

  const insertStmt = db.prepare(`
    INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
  `);

  const updateStmt = db.prepare(`
    UPDATE articles SET title = ?, excerpt = ?, content = ?, category = ?, tags = ?, image_url = ?, author = ?, read_time = ?, created_at = ?
    WHERE slug = ?
  `);

  for (const art of SEED_ARTICLES) {
    const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(art.slug);
    const tagsStr = JSON.stringify(art.tags || []);
    const contentStr = (art.content || '').trim();

    if (!existing) {
      insertStmt.run(
        art.slug,
        art.title,
        art.excerpt,
        contentStr,
        art.category,
        tagsStr,
        art.image_url,
        art.author || 'The Unique Media',
        art.read_time || '7 daqiqa',
        art.views || 0,
        art.created_at || new Date().toISOString()
      );
    } else {
      updateStmt.run(
        art.title,
        art.excerpt,
        contentStr,
        art.category,
        tagsStr,
        art.image_url,
        art.author || 'The Unique Media',
        art.read_time || '7 daqiqa',
        art.created_at || new Date().toISOString(),
        art.slug
      );
    }
  }
}

try {
  ensureSeedArticles();
} catch (e) {
  console.warn('[DB] Seed sync note:', e.message);
}

module.exports = { db, hashPassword, ensureDefaultAdmin, ensureSeedArticles };
