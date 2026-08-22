const express = require('express');
const crypto = require('node:crypto');
const { db, hashPassword } = require('../db');
const { sign } = require('../token');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parol talab qilinadi' });
  }
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  if (!admin) return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

  const hash = hashPassword(password, admin.salt);
  const hashBuf = Buffer.from(hash);
  const storedBuf = Buffer.from(admin.hash);
  const ok = hashBuf.length === storedBuf.length && crypto.timingSafeEqual(hashBuf, storedBuf);
  if (!ok) return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });

  const token = sign({ sub: admin.id, email: admin.email });
  res.json({ token, email: admin.email });
});

router.post('/change-password', require('../token').requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Joriy va yangi parol kiritilishi shart' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
  }

  const adminId = (req.admin && req.admin.sub) || (req.user && req.user.sub);
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(adminId);
  if (!admin) return res.status(404).json({ error: 'Admin topilmadi' });

  const currentHash = hashPassword(currentPassword, admin.salt);
  const hashBuf = Buffer.from(currentHash);
  const storedBuf = Buffer.from(admin.hash);
  const ok = hashBuf.length === storedBuf.length && crypto.timingSafeEqual(hashBuf, storedBuf);
  if (!ok) return res.status(400).json({ error: 'Joriy parol noto\'g\'ri' });

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(newPassword, newSalt);

  db.prepare('UPDATE admins SET salt = ?, hash = ? WHERE id = ?').run(newSalt, newHash, admin.id);
  res.json({ ok: true, message: 'Parol muvaffaqiyatli o\'zgartirildi' });
});

module.exports = router;
