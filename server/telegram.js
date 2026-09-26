const https = require('node:https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function sendTelegramMessage(text, chatId = CHAT_ID) {
  if (!BOT_TOKEN || !chatId) {
    console.warn('[Telegram] Bot token yoki Chat ID .env da sozlanmagan. Xabar yuborilmadi.');
    return Promise.resolve(false);
  }

  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 8000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.ok) {
              resolve(true);
            } else {
              console.error('[Telegram Error]', data.description);
              resolve(false);
            }
          } catch (e) {
            resolve(false);
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error('[Telegram Request Error]', err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function notifyNewLead(lead) {
  const time = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

  const text = `🔔 <b>YANGI ARIZA / LID KELDI!</b>\n` +
    `🌐 <b>Sayt:</b> Unique Media Buying\n\n` +
    `👤 <b>Mijoz:</b> ${escapeHtml(lead.name || '—')}\n` +
    `📞 <b>Telefon:</b> <code>${escapeHtml(lead.phone || '—')}</code>\n` +
    `🏢 <b>Kompaniya:</b> ${escapeHtml(lead.company || '—')}\n` +
    `💰 <b>Byudjet:</b> ${escapeHtml(lead.budget || '—')}\n` +
    `💬 <b>Izoh:</b> ${escapeHtml(lead.message || '—')}\n\n` +
    `🕒 <b>Vaqt:</b> ${time}`;

  await sendTelegramMessage(text);
}

async function notifyNewArticle(article) {
  const time = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

  const text = `📝 <b>YANGI MAQOLA / KEYS MODERATSIYAGA YUBORILDI!</b>\n\n` +
    `📌 <b>Sarlavha:</b> ${escapeHtml(article.title || '—')}\n` +
    `👤 <b>Muallif:</b> ${escapeHtml(article.author || '—')}\n` +
    `📁 <b>Kategoriya:</b> ${escapeHtml(article.category ? article.category.toUpperCase() : '—')}\n` +
    `🕒 <b>O'qish vaqti:</b> ${escapeHtml(article.read_time || '5 daqiqa')}\n` +
    `📅 <b>Vaqt:</b> ${time}\n\n` +
    `⚡️ <i>Tasdiqlash yoki rad etish uchun admin panelga kiring.</i>`;

  await sendTelegramMessage(text);
}

// Umumiy admin xabarnomasi — booking (konsultatsiya band qilish) uchun ishlatiladi
async function notifyAdmin(text) {
  await sendTelegramMessage(text);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { sendTelegramMessage, notifyNewLead, notifyNewArticle, notifyAdmin };
