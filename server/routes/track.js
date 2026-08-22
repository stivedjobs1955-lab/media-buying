const express = require('express');
const { db } = require('../db');

const router = express.Router();

// Public: fired once per page load from the marketing site
router.post('/', (req, res) => {
  const { path: pagePath, referrer } = req.body || {};
  db.prepare('INSERT INTO pageviews (path, referrer, created_at) VALUES (?, ?, ?)').run(
    pagePath ? String(pagePath).slice(0, 300) : '/',
    referrer ? String(referrer).slice(0, 300) : null,
    new Date().toISOString(),
  );
  res.status(204).end();
});

module.exports = router;
