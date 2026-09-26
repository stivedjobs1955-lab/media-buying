const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../token');

const router = express.Router();

// Helper to sanitize slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Public: List articles with category filter and search
router.get('/', (req, res) => {
  const { category, search, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT id, slug, title, excerpt, category, tags, image_url, author, read_time, views, created_at FROM articles WHERE 1=1';
  const params = [];

  if (category && category !== 'all' && category !== 'barchasi') {
    query += ' AND category = ?';
    params.push(category.toLowerCase());
  }

  if (search && String(search).trim()) {
    query += ' AND (title LIKE ? OR excerpt LIKE ? OR tags LIKE ?)';
    const term = `%${String(search).trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  try {
    const rows = db.prepare(query).all(...params);
    const parsed = rows.map((r) => {
      let tags = [];
      try { tags = JSON.parse(r.tags); } catch { tags = r.tags ? r.tags.split(',') : []; }
      return { ...r, tags };
    });
    res.json(parsed);
  } catch (err) {
    console.error('[Articles list error]', err);
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
});

// Public: Get single article by slug or id & increment view
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  try {
    const article = db.prepare('SELECT * FROM articles WHERE slug = ? OR id = ?').get(slug, Number(slug) || 0);
    if (!article) {
      return res.status(404).json({ error: 'Maqola topilmadi' });
    }

    // Increment view count
    db.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').run(article.id);
    article.views += 1;

    try {
      article.tags = JSON.parse(article.tags);
    } catch {
      article.tags = article.tags ? article.tags.split(',') : [];
    }

    // Get related articles (same category or recent)
    const related = db.prepare(
      'SELECT id, slug, title, excerpt, category, image_url, read_time, created_at FROM articles WHERE id != ? ORDER BY created_at DESC LIMIT 3'
    ).all(article.id);

    res.json({ article, related });
  } catch (err) {
    console.error('[Article get error]', err);
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
});

// Admin: Create new article
router.post('/', requireAuth, (req, res) => {
  const { title, excerpt, content, category, tags, image_url, author = 'Unique Media Buying', read_time = '5 daqiqa' } = req.body || {};
  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Sarlavha, qisqacha tavsif va matn talab qilinadi' });
  }

  const slug = slugify(req.body.slug || title) + '-' + Date.now().toString().slice(-4);
  const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify((tags || '').split(',').map(s => s.trim()).filter(Boolean));
  const createdAt = new Date().toISOString();

  try {
    const info = db.prepare(`
      INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      slug,
      String(title).trim(),
      String(excerpt).trim(),
      String(content).trim(),
      String(category || 'yangiliklar').toLowerCase().trim(),
      tagsStr,
      image_url || null,
      String(author).trim(),
      String(read_time).trim(),
      createdAt
    );

    res.status(201).json({ id: Number(info.lastInsertRowid), slug });
  } catch (err) {
    console.error('[Article create error]', err);
    res.status(500).json({ error: 'Maqolani saqlashda xatolik' });
  }
});

// Admin: Delete article
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const info = db.prepare('DELETE FROM articles WHERE id = ?').run(Number(req.params.id));
    if (info.changes === 0) return res.status(404).json({ error: 'Maqola topilmadi' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Maqolani o\'chirishda xatolik' });
  }
});

module.exports = router;
