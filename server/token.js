const crypto = require('node:crypto');

const SECRET = process.env.ADMIN_TOKEN_SECRET || 'unique-agency-dev-secret-change-me';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 kun

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payloadObj) {
  const payload = { ...payloadObj, exp: Date.now() + TTL_MS };
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp < Date.now()) return null;
  return payload;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verify(token);
  if (!payload) return res.status(401).json({ error: 'Avtorizatsiya talab qilinadi' });
  req.admin = payload;
  next();
}

module.exports = { sign, verify, requireAuth };
