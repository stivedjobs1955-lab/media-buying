const https = require('node:https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '***TELEGRAM_BOT_TOKEN_REDACTED***';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '***TELEGRAM_CHAT_ID_REDACTED***';

/**
 * Send a message via Telegram Bot API
 */
function sendTelegramMessage(text, chatId = CHAT_ID) {
  if (!BOT_TOKEN || !chatId) {
    console.warn('[Telegram] Bot token or Chat ID is missing. Message not sent.');
    return Promise.resolve(false);
  }

  const payload = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
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

/**
 * Notify new lead
 */
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

  const targetChats = (process.env.TELEGRAM_CHAT_ID || CHAT_ID || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (targetChats.length > 0) {
    for (const id of targetChats) {
      await sendTelegramMessage(text, id);
    }
  } else {
    console.log('[Telegram] No TELEGRAM_CHAT_ID configured yet.');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { sendTelegramMessage, notifyNewLead };
