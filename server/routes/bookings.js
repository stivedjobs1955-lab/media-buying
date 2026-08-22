const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../token');
const { createMeetEvent, isConfigured } = require('../google');
const { notifyAdmin } = require('../telegram');

const router = express.Router();

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
function formatUzDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}-${UZ_MONTHS[m - 1]} ${y}`;
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const SLOT_MINUTES = 60;
const TIMEZONE_OFFSET = '+05:00'; // Asia/Tashkent

function isWorkingDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0 = Sunday
  return day !== 0;
}

function buildDaySlots() {
  const slots = [];
  for (let h = WORK_START_HOUR; h < WORK_END_HOUR; h += SLOT_MINUTES / 60) {
    const hh = String(Math.floor(h)).padStart(2, '0');
    const mm = String(Math.round((h % 1) * 60)).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

// Public: available slots for a given date
router.get('/slots', (req, res) => {
  const date = req.query.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
    return res.status(400).json({ error: 'date=YYYY-MM-DD kerak' });
  }

  if (!isWorkingDay(date)) {
    return res.json({ date, slots: [] });
  }

  const taken = db.prepare(`
    SELECT time FROM bookings WHERE date = ? AND status != 'cancelled'
  `).all(date).map((r) => r.time);

  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);

  const slots = buildDaySlots().filter((time) => {
    if (taken.includes(time)) return false;
    if (isToday) {
      const [h, m] = time.split(':').map(Number);
      const slotTime = new Date(now);
      slotTime.setHours(h, m, 0, 0);
      if (slotTime.getTime() <= now.getTime()) return false;
    }
    return true;
  });

  res.json({ date, slots });
});

// Public: create a booking (client picks a slot after submitting the lead form)
router.post('/', async (req, res) => {
  const { leadId, name, phone, date, time, notes } = req.body || {};

  if (!name || !String(name).trim() || !date || !time) {
    return res.status(400).json({ error: 'Ism, sana va vaqt talab qilinadi' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: 'Sana yoki vaqt formati noto\'g\'ri' });
  }

  const clash = db.prepare(`
    SELECT id FROM bookings WHERE date = ? AND time = ? AND status != 'cancelled'
  `).get(date, time);
  if (clash) {
    return res.status(409).json({ error: 'Bu vaqt allaqachon band qilingan, boshqasini tanlang' });
  }

  const createdAt = new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO bookings (lead_id, name, phone, date, time, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending_meet', ?)
  `).run(leadId || null, String(name).trim().slice(0, 200), phone ? String(phone).trim().slice(0, 50) : null,
    date, time, notes ? String(notes).trim().slice(0, 500) : null, createdAt);

  const bookingId = Number(info.lastInsertRowid);

  let meetLink = null;
  let calendarEventId = null;
  let status = 'pending_meet';

  if (isConfigured()) {
    try {
      const startISO = `${date}T${time}:00${TIMEZONE_OFFSET}`;
      const [h, m] = time.split(':').map(Number);
      const endHour = String(h + Math.floor(SLOT_MINUTES / 60)).padStart(2, '0');
      const endISO = `${date}T${endHour}:${String(m).padStart(2, '0')}:00${TIMEZONE_OFFSET}`;

      const result = await createMeetEvent({
        summary: `Unique — Konsultatsiya: ${name}`,
        description: `Mijoz: ${name}\nTelefon: ${phone || '—'}\nIzoh: ${notes || '—'}`,
        startISO,
        endISO,
      });
      if (result && result.meetLink) {
        meetLink = result.meetLink;
        calendarEventId = result.eventId;
        status = 'confirmed';
        db.prepare('UPDATE bookings SET status = ?, meet_link = ?, calendar_event_id = ? WHERE id = ?')
          .run(status, meetLink, calendarEventId, bookingId);
      }
    } catch (err) {
      console.error('Google Meet yaratishda xatolik:', err.message);
    }
  }

  const dateLabel = formatUzDate(date);
  const lines = [
    '📅 <b>Yangi konsultatsiya band qilindi</b>',
    `👤 ${escapeHtml(name)}`,
    phone ? `📞 ${escapeHtml(phone)}` : null,
    `🗓 ${dateLabel}, soat ${time}`,
    notes ? `📝 ${escapeHtml(notes)}` : null,
    meetLink ? `🔗 Google Meet: ${meetLink}` : '⚠️ Google Meet hali sozlanmagan — admin paneldan qo\'lda link qo\'shing.',
  ].filter(Boolean);
  notifyAdmin(lines.join('\n'));

  res.status(201).json({ id: bookingId, status, meetLink });
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Admin: list bookings (optionally ?from=YYYY-MM-DD&to=YYYY-MM-DD)
router.get('/', requireAuth, (req, res) => {
  const { from, to } = req.query;
  let rows;
  if (from && to) {
    rows = db.prepare('SELECT * FROM bookings WHERE date BETWEEN ? AND ? ORDER BY date, time').all(from, to);
  } else {
    rows = db.prepare('SELECT * FROM bookings ORDER BY date, time').all();
  }
  res.json(rows);
});

// Admin: update a booking (status, or manually add a meet link)
router.patch('/:id', requireAuth, (req, res) => {
  const { status, meetLink } = req.body || {};
  const fields = [];
  const values = [];
  if (status) { fields.push('status = ?'); values.push(status); }
  if (meetLink !== undefined) { fields.push('meet_link = ?'); values.push(meetLink); }
  if (!fields.length) return res.status(400).json({ error: 'Hech narsa yangilanmadi' });

  values.push(Number(req.params.id));
  const info = db.prepare(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  if (info.changes === 0) return res.status(404).json({ error: 'Band qilish topilmadi' });
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, (req, res) => {
  const info = db.prepare('DELETE FROM bookings WHERE id = ?').run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: 'Band qilish topilmadi' });
  res.json({ ok: true });
});

module.exports = router;
