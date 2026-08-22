(function () {
  const overlay = document.getElementById('bookingOverlay');
  const closeBtn = document.getElementById('bookingClose');
  const doneBtn = document.getElementById('bookingDoneBtn');
  const calGrid = document.getElementById('calGrid');
  const calMonthLabel = document.getElementById('calMonthLabel');
  const calPrev = document.getElementById('calPrev');
  const calNext = document.getElementById('calNext');
  const slotsList = document.getElementById('slotsList');
  const slotsTitle = document.getElementById('slotsTitle');
  const stepPicker = document.getElementById('bookingStepPicker');
  const stepConfirm = document.getElementById('bookingStepConfirm');
  const confirmTitle = document.getElementById('bookingConfirmTitle');
  const confirmText = document.getElementById('bookingConfirmText');
  const meetLinkEl = document.getElementById('bookingMeetLink');

  if (!overlay) return;

  const DOW = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
  const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

  let viewYear, viewMonth;
  let selectedDate = null;
  let selectedTime = null;
  let currentLead = null; // { leadId, name, phone }

  function pad(n) { return String(n).padStart(2, '0'); }
  function toDateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

  function formatDateLabel(dateStr, withYear) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${d}-${MONTHS[m - 1]}${withYear ? ` ${y}` : ''}`;
  }

  function renderCalendar() {
    calMonthLabel.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    calGrid.innerHTML = '';
    DOW.forEach((d) => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      calGrid.appendChild(el);
    });

    const firstDay = new Date(viewYear, viewMonth, 1);
    let startOffset = firstDay.getDay(); // 0=Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startOffset; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      calGrid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(viewYear, viewMonth, d);
      const thisDate = new Date(viewYear, viewMonth, d);
      const isPast = thisDate < today;
      const isSunday = thisDate.getDay() === 0;
      const isToday = thisDate.getTime() === today.getTime();

      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cal-day';
      el.textContent = d;
      if (isPast || isSunday) el.classList.add('disabled');
      if (isToday) el.classList.add('today');
      if (selectedDate === dateStr) el.classList.add('selected');

      if (!isPast && !isSunday) {
        el.addEventListener('click', () => selectDate(dateStr));
      }
      calGrid.appendChild(el);
    }
  }

  function selectDate(dateStr) {
    selectedDate = dateStr;
    selectedTime = null;
    renderCalendar();
    loadSlots(dateStr);
  }

  function loadSlots(dateStr) {
    slotsTitle.textContent = 'Yuklanmoqda...';
    slotsList.innerHTML = '';
    fetch(`/api/bookings/slots?date=${encodeURIComponent(dateStr)}`)
      .then((r) => r.json())
      .then((data) => {
        const label = formatDateLabel(dateStr, false);
        slotsTitle.textContent = `${label} — bo'sh vaqtlar`;
        if (!data.slots || data.slots.length === 0) {
          slotsList.innerHTML = '<div class="slot-empty">Bu kunda bo\'sh vaqt yo\'q, boshqa sanani tanlang</div>';
          return;
        }
        slotsList.innerHTML = data.slots.map((t) => `<button type="button" class="slot-btn" data-time="${t}">${t}</button>`).join('');
        slotsList.querySelectorAll('.slot-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            slotsList.querySelectorAll('.slot-btn').forEach((b) => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedTime = btn.dataset.time;
            confirmBooking();
          });
        });
      })
      .catch(() => {
        slotsTitle.textContent = 'Xatolik';
        slotsList.innerHTML = '<div class="slot-empty">Vaqtlarni yuklab bo\'lmadi, birozdan so\'ng qayta urining</div>';
      });
  }

  function confirmBooking() {
    if (!selectedDate || !selectedTime || !currentLead) return;

    stepPicker.style.display = 'none';
    stepConfirm.style.display = 'block';
    confirmTitle.textContent = 'Band qilinmoqda...';
    confirmText.textContent = 'Bir necha soniya kuting.';
    meetLinkEl.style.display = 'none';
    doneBtn.style.display = 'none';

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId: currentLead.leadId,
        name: currentLead.name,
        phone: currentLead.phone,
        date: selectedDate,
        time: selectedTime,
      }),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        doneBtn.style.display = '';
        const dateLabel = formatDateLabel(selectedDate, true);
        if (!ok) {
          confirmTitle.textContent = 'Xatolik';
          confirmText.textContent = data.error || 'Band qilib bo\'lmadi, qayta urinib ko\'ring.';
          return;
        }
        confirmTitle.textContent = 'Band qilindi!';
        if (data.meetLink) {
          confirmText.textContent = `${dateLabel}, soat ${selectedTime} — konsultatsiyangiz tasdiqlandi. Google Meet havolasi tayyor.`;
          meetLinkEl.href = data.meetLink;
          meetLinkEl.style.display = 'inline-flex';
        } else {
          confirmText.textContent = `${dateLabel}, soat ${selectedTime} — konsultatsiyangiz qabul qilindi. Google Meet havolasini tez orada Telegram/telefon orqali yuboramiz.`;
        }
        if (typeof fbq === 'function') fbq('track', 'Schedule');
      })
      .catch(() => {
        doneBtn.style.display = '';
        confirmTitle.textContent = 'Xatolik';
        confirmText.textContent = 'Serverga ulanib bo\'lmadi, birozdan so\'ng qayta urinib ko\'ring.';
      });
  }

  function resetModal() {
    const now = new Date();
    viewYear = now.getFullYear();
    viewMonth = now.getMonth();
    selectedDate = null;
    selectedTime = null;
    stepPicker.style.display = 'block';
    stepConfirm.style.display = 'none';
    slotsTitle.textContent = 'Avval sanani tanlang';
    slotsList.innerHTML = '';
    renderCalendar();
  }

  window.openBookingModal = function (leadData) {
    currentLead = leadData || {};
    resetModal();
    overlay.classList.add('open');
  };

  function closeModal() {
    overlay.classList.remove('open');
  }

  closeBtn.addEventListener('click', closeModal);
  doneBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  calPrev.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    renderCalendar();
  });
  calNext.addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    renderCalendar();
  });
})();
