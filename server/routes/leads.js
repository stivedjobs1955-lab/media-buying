const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../token');
const { notifyNewLead } = require('../telegram');

const router = express.Router();

const VALID_STATUSES = ['yangi', 'boglanildi', 'muvaffaqiyatli', 'bekor_qilindi'];

// Public: contact form submits here
router.post('/', (req, res) => {
  const { name, phone, company, budget, message } = req.body || {};
  if (!name || !String(name).trim() || !phone || !String(phone).trim()) {
    return res.status(400).json({ error: 'Ism va telefon raqami talab qilinadi' });
  }

  const cleanName = String(name).trim().slice(0, 200);
  const cleanPhone = String(phone).trim().slice(0, 50);
  const cleanCompany = company ? String(company).trim().slice(0, 200) : null;
  const cleanBudget = budget ? String(budget).trim().slice(0, 100) : null;
  const cleanMessage = message ? String(message).trim().slice(0, 2000) : null;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO leads (name, phone, company, budget, message, status, source, created_at)
    VALUES (?, ?, ?, ?, ?, 'yangi', 'sayt', ?)
  `);
  const info = stmt.run(
    cleanName,
    cleanPhone,
    cleanCompany,
    cleanBudget,
    cleanMessage,
    createdAt
  );

  // Send real-time Telegram notification
  notifyNewLead({
    name: cleanName,
    phone: cleanPhone,
    company: cleanCompany,
    budget: cleanBudget,
    message: cleanMessage,
    createdAt,
  }).catch((err) => console.error('[Telegram Notification Error]', err));

  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

// Admin: list leads
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json(rows);
});

// Admin: update lead status
router.patch('/:id', requireAuth, (req, res) => {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Status noto\'g\'ri' });
  }
  const info = db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: 'Lid topilmadi' });
  res.json({ ok: true });
});

// Admin: delete a lead
router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM leads WHERE id = ?').run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: 'Lid topilmadi' });
  res.json({ ok: true });
});

module.exports = router;
