const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../token');
const { notifyNewArticle } = require('../telegram');

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

// Admin: Get all articles with moderation status
router.get('/admin/all', requireAuth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, slug, title, excerpt, category, tags, image_url, author, read_time, views, status, created_at 
      FROM articles 
      ORDER BY 
        CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
        created_at DESC
    `).all();

    const parsed = rows.map((r) => {
      let tags = [];
      try { tags = JSON.parse(r.tags); } catch { tags = r.tags ? r.tags.split(',') : []; }
      return { ...r, tags };
    });
    res.json(parsed);
  } catch (err) {
    console.error('[Admin articles list error]', err);
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
});

// Admin: Get full article details by ID (including content)
router.get('/admin/:id', requireAuth, (req, res) => {
  try {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(Number(req.params.id));
    if (!article) return res.status(404).json({ error: 'Maqola topilmadi' });
    try { article.tags = JSON.parse(article.tags); } catch { article.tags = article.tags ? article.tags.split(',') : []; }
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
});

// Admin: Update article moderation status (Approve: published, Reject: rejected)
router.patch('/:id/status', requireAuth, (req, res) => {
  const { status } = req.body || {};
  const validStatuses = ['published', 'rejected', 'pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Noto\'g\'ri status. Mumkin bo\'lganlar: published, rejected, pending' });
  }

  try {
    const info = db.prepare('UPDATE articles SET status = ? WHERE id = ?').run(status, Number(req.params.id));
    if (info.changes === 0) return res.status(404).json({ error: 'Maqola topilmadi' });
    res.json({ ok: true, id: req.params.id, status });
  } catch (err) {
    console.error('[Article status update error]', err);
    res.status(500).json({ error: 'Statusni yangilashda xatolik' });
  }
});

// Public: List approved articles with category filter and search
router.get('/', (req, res) => {
  const { category, search, limit = 50, offset = 0 } = req.query;

  let query = "SELECT id, slug, title, excerpt, category, tags, image_url, author, read_time, views, status, created_at FROM articles WHERE (status = 'published' OR status IS NULL)";
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
      "SELECT id, slug, title, excerpt, category, image_url, read_time, created_at FROM articles WHERE id != ? AND (status = 'published' OR status IS NULL) ORDER BY created_at DESC LIMIT 3"
    ).all(article.id);

    res.json({ article, related });
  } catch (err) {
    console.error('[Article get error]', err);
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  }
});

// Public / User Submission: Create new article for moderation
router.post('/', (req, res) => {
  const { title, excerpt, content, category, tags, image_url, author = 'The Unique Media', read_time = '5 daqiqa' } = req.body || {};
  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Sarlavha, qisqacha tavsif va matn talab qilinadi' });
  }

  const slug = slugify(req.body.slug || title) + '-' + Date.now().toString().slice(-4);
  const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify((tags || '').split(',').map(s => s.trim()).filter(Boolean));
  const createdAt = new Date().toISOString();
  
  // Public submissions default to 'pending' for admin moderation
  const status = req.body.status === 'published' && req.headers.authorization ? 'published' : 'pending';

  try {
    const info = db.prepare(`
      INSERT INTO articles (slug, title, excerpt, content, category, tags, image_url, author, read_time, views, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      slug,
      String(title).trim(),
      String(excerpt).trim(),
      String(content).trim(),
      String(category || 'facebook').toLowerCase().trim(),
      tagsStr,
      image_url || null,
      String(author).trim(),
      String(read_time).trim(),
      status,
      createdAt
    );

    const articleObj = {
      id: Number(info.lastInsertRowid),
      slug,
      title: String(title).trim(),
      author: String(author).trim(),
      category: String(category || 'facebook').toLowerCase().trim(),
      read_time: String(read_time).trim(),
      status
    };

    // Send Telegram Notification to Admin
    notifyNewArticle(articleObj).catch((e) => console.error('[Telegram Article Notify Error]', e));

    res.status(201).json({
      id: Number(info.lastInsertRowid),
      slug,
      status,
      message: 'Maqola qabul qilindi va moderator tasdiqiga yuborildi'
    });
  } catch (err) {
    console.error('[Article create error]', err);
    res.status(500).json({ error: 'Maqolani saqlashda xatolik' });
  }
});

// Admin: Edit full article
router.put('/:id', requireAuth, (req, res) => {
  const { title, slug, excerpt, content, category, tags, image_url, author, read_time, status } = req.body || {};
  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Sarlavha, qisqacha tavsif va matn talab qilinadi' });
  }

  const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify((tags || '').split(',').map(s => s.trim()).filter(Boolean));
  const validStatus = ['published', 'rejected', 'pending'].includes(status) ? status : 'published';

  try {
    const existing = db.prepare('SELECT id, slug FROM articles WHERE id = ?').get(Number(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Maqola topilmadi' });

    const finalSlug = slug ? slugify(slug) : existing.slug;

    db.prepare(`
      UPDATE articles 
      SET title = ?, slug = ?, excerpt = ?, content = ?, category = ?, tags = ?, image_url = ?, author = ?, read_time = ?, status = ?
      WHERE id = ?
    `).run(
      String(title).trim(),
      finalSlug,
      String(excerpt).trim(),
      String(content).trim(),
      String(category || 'facebook').toLowerCase().trim(),
      tagsStr,
      image_url || null,
      String(author || 'The Unique Media').trim(),
      String(read_time || '5 daqiqa').trim(),
      validStatus,
      Number(req.params.id)
    );

    res.json({ ok: true, id: req.params.id, message: 'Maqola muvaffaqiyatli tahrirlandi' });
  } catch (err) {
    console.error('[Article update error]', err);
    res.status(500).json({ error: 'Maqolani yangilashda xatolik yuz berdi' });
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
