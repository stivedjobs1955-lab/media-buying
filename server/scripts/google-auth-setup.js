// Bir martalik sozlash skripti — Google Meet'ni avtomatik yaratish uchun.
//
// OLDIN BAJARING (Google Cloud Console'da):
//   1. https://console.cloud.google.com/ -> yangi loyiha yarating (yoki mavjudini tanlang)
//   2. "APIs & Services" -> "Library" -> "Google Calendar API" -ni yoqing (Enable)
//   3. "APIs & Services" -> "OAuth consent screen" -> "External" tanlang, ilova nomini
//      kiriting (masalan "Unique Booking"), o'z emailingizni qo'shing, saqlang.
//      "Test users" bo'limiga o'z Google emailingizni qo'shing.
//   4. "APIs & Services" -> "Credentials" -> "Create Credentials" -> "OAuth client ID"
//      -> Application type: "Desktop app" -> nomini kiriting -> Create.
//   5. Chiqqan Client ID va Client Secret'ni server/.env fayliga qo'ying:
//        GOOGLE_CLIENT_ID=...
//        GOOGLE_CLIENT_SECRET=...
//
// SO'NGRA shu skriptni ishga tushiring:
//   node server/scripts/google-auth-setup.js
// U brauzerda Google login sahifasini ochadi (yoki linkni qo'lda oching),
// o'z Google akkauntingiz bilan ruxsat bering — tayyor.

require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync } = require('node:child_process');
const { google } = require('googleapis');

const PORT = 53682;
const TOKEN_PATH = path.join(__dirname, '..', 'data', 'google-token.json');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Xatolik: server/.env faylida GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET to\'ldirilmagan.');
  console.error('Avval yuqoridagi izohdagi qadamlarni bajaring.');
  process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, `http://localhost:${PORT}/oauth2callback`);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
});

console.log('\nQuyidagi havolani brauzerda oching va Google akkauntingiz bilan ruxsat bering:\n');
console.log(authUrl + '\n');

try {
  execSync(`open "${authUrl}"`);
} catch (_) {
  // "open" mavjud bo'lmasa — havolani qo'lda ochish kifoya
}

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) {
    res.writeHead(404);
    res.end();
    return;
  }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get('code');

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2>Xatolik: kod topilmadi</h2>');
    return;
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2>Muvaffaqiyatli! Endi shu oynani yopsangiz bo\'ladi.</h2>');
    console.log('\nTayyor! Token saqlandi:', TOKEN_PATH);
    console.log('Endi serverni qayta ishga tushiring — Google Meet avtomatik yaratiladi.\n');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2>Xatolik yuz berdi, terminalni tekshiring.</h2>');
    console.error('Token olishda xatolik:', err.message);
  } finally {
    server.close();
    setTimeout(() => process.exit(0), 500);
  }
});

server.listen(PORT, () => {
  console.log(`Kutilmoqda... (localhost:${PORT})`);
});
