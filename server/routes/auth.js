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

module.exports = router;
