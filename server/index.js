require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const express = require('express');
const path = require('node:path');
const { ensureDefaultAdmin } = require('./db');

const PORT = process.env.PORT || 4400;

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@unique.uz';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Unique#2026';
ensureDefaultAdmin(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);

const app = express();
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/track', require('./routes/track'));
app.use('/api/legal', require('./routes/legal'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/articles', require('./routes/articles'));

// Clean URL routes (without .html)
app.get('/maqolalar', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'maqolalar.html'));
});
app.get('/maqola', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'maqola.html'));
});
app.get('/maqola/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'maqola.html'));
});
app.get('/oferta', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'oferta.html'));
});
app.get('/yozish', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'yozish.html'));
});
app.get('/telegraph', (req, res) => {
  res.redirect('/yozish');
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Unique agency server: http://localhost:${PORT}`);
  console.log(`Admin panel:          http://localhost:${PORT}/admin`);
  console.log(`Admin login:          ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
});
