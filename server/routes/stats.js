const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../token');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const totalLeads = db.prepare('SELECT COUNT(*) AS n FROM leads').get().n;

  const statusRows = db.prepare('SELECT status, COUNT(*) AS n FROM leads GROUP BY status').all();
  const leadsByStatus = { yangi: 0, boglanildi: 0, muvaffaqiyatli: 0, bekor_qilindi: 0 };
  for (const row of statusRows) leadsByStatus[row.status] = row.n;

  const budgetRows = db.prepare(`
    SELECT COALESCE(budget, 'Kiritilmagan') AS budget, COUNT(*) AS n
    FROM leads GROUP BY budget ORDER BY n DESC
  `).all();

  const todayStr = new Date().toISOString().slice(0, 10);
  const leadsToday = db.prepare(`
    SELECT COUNT(*) AS n FROM leads WHERE substr(created_at, 1, 10) = ?
  `).get(todayStr).n;

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dayStr = d.toISOString().slice(0, 10);
    const leadCount = db.prepare(`
      SELECT COUNT(*) AS n FROM leads WHERE substr(created_at, 1, 10) = ?
    `).get(dayStr).n;
    const viewCount = db.prepare(`
      SELECT COUNT(*) AS n FROM pageviews WHERE substr(created_at, 1, 10) = ?
    `).get(dayStr).n;
    last7.push({ date: dayStr, leads: leadCount, views: viewCount });
  }

  const totalPageviews = db.prepare('SELECT COUNT(*) AS n FROM pageviews').get().n;

  const topPaths = db.prepare(`
    SELECT path, COUNT(*) AS n FROM pageviews GROUP BY path ORDER BY n DESC LIMIT 8
  `).all();

  res.json({
    totalLeads,
    leadsToday,
    leadsByStatus,
    budgetRows,
    last7,
    totalPageviews,
    topPaths,
  });
});

router.get('/day', requireAuth, (req, res) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '') ? req.query.date : new Date().toISOString().slice(0, 10);

  const views = db.prepare(`SELECT COUNT(*) AS n FROM pageviews WHERE substr(created_at, 1, 10) = ?`).get(date).n;
  const leads = db.prepare(`SELECT COUNT(*) AS n FROM leads WHERE substr(created_at, 1, 10) = ?`).get(date).n;
  const byPath = db.prepare(`
    SELECT path, COUNT(*) AS n FROM pageviews WHERE substr(created_at, 1, 10) = ?
    GROUP BY path ORDER BY n DESC LIMIT 10
  `).all(date);

  res.json({ date, views, leads, byPath });
});

module.exports = router;
