const STATUS_LABELS = {
  yangi: "Yangi",
  boglanildi: "Bog'lanildi",
  muvaffaqiyatli: "Muvaffaqiyatli",
  bekor_qilindi: "Bekor qilindi",
};

const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

let allLeads = [];
let draggedId = null;

function getToken() { return localStorage.getItem('unique_admin_token'); }
function setToken(t) { localStorage.setItem('unique_admin_token', t); }
function clearToken() { localStorage.removeItem('unique_admin_token'); }

function authFetch(url, options = {}) {
  const headers = Object.assign({}, options.headers, { Authorization: `Bearer ${getToken()}` });
  return fetch(url, { ...options, headers }).then((r) => {
    if (r.status === 401) {
      clearToken();
      showLogin();
      throw new Error('Sessiya tugagan, qayta kiring');
    }
    return r;
  });
}

function showLogin() {
  loginView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
}
function showDashboard() {
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  loadAll();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
    .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        loginError.textContent = data.error || 'Xatolik yuz berdi';
        loginError.classList.remove('hidden');
        return;
      }
      setToken(data.token);
      document.getElementById('adminEmail').textContent = data.email;
      showDashboard();
    })
    .catch(() => {
      loginError.textContent = 'Serverga ulanib bo\'lmadi';
      loginError.classList.remove('hidden');
    });
});

logoutBtn.addEventListener('click', () => {
  clearToken();
  showLogin();
});

// ---------- Parolni o'zgartirish modali logikasi ----------
const passwordModal = document.getElementById('passwordModal');
const openPasswordModalBtn = document.getElementById('openPasswordModalBtn');
const closePasswordModalBtn = document.getElementById('closePasswordModalBtn');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
const passwordForm = document.getElementById('passwordForm');
const passwordAlert = document.getElementById('passwordAlert');

function openPasswordModal() {
  passwordAlert.className = 'hidden';
  passwordAlert.textContent = '';
  passwordForm.reset();
  passwordModal.classList.remove('hidden');
}

function closePasswordModal() {
  passwordModal.classList.add('hidden');
}

if (openPasswordModalBtn) openPasswordModalBtn.addEventListener('click', openPasswordModal);
if (closePasswordModalBtn) closePasswordModalBtn.addEventListener('click', closePasswordModal);
if (cancelPasswordBtn) cancelPasswordBtn.addEventListener('click', closePasswordModal);

passwordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  passwordAlert.className = 'hidden';
  passwordAlert.textContent = '';

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    passwordAlert.className = 'alert-error';
    passwordAlert.textContent = 'Yangi parollar bir-biriga mos kelmadi';
    return;
  }

  if (newPassword.length < 6) {
    passwordAlert.className = 'alert-error';
    passwordAlert.textContent = 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak';
    return;
  }

  authFetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
    .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        passwordAlert.className = 'alert-error';
        passwordAlert.textContent = data.error || 'Xatolik yuz berdi';
        return;
      }
      passwordAlert.className = 'alert-success';
      passwordAlert.textContent = data.message || 'Parol muvaffaqiyatli yangilandi!';
      passwordForm.reset();
      setTimeout(() => {
        closePasswordModal();
      }, 1500);
    })
    .catch((err) => {
      passwordAlert.className = 'alert-error';
      passwordAlert.textContent = err.message || 'Serverga ulanishda xatolik';
    });
});

document.getElementById('downloadContractBtn').addEventListener('click', () => {
  authFetch('/api/legal/contract')
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Xizmat_shartnomasi_Unique.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch(() => alert('Hujjatni yuklab bo\'lmadi'));
});

function loadAll() {
  loadStats();
  loadLeads();
  loadDay(document.getElementById('dayFilterInput').value || todayStr());
  loadBookings();
  loadArticles();
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

document.getElementById('dayFilterInput').value = todayStr();
document.getElementById('dayFilterBtn').addEventListener('click', () => {
  loadDay(document.getElementById('dayFilterInput').value || todayStr());
});
document.getElementById('dayFilterTodayBtn').addEventListener('click', () => {
  document.getElementById('dayFilterInput').value = todayStr();
  loadDay(todayStr());
});

function loadDay(date) {
  authFetch(`/api/stats/day?date=${encodeURIComponent(date)}`)
    .then((r) => r.json())
    .then((d) => {
      document.getElementById('dayStatRow').innerHTML = `
        <div class="item"><div class="n">${d.views}</div><div class="l">Tashriflar (${d.date})</div></div>
        <div class="item"><div class="n">${d.leads}</div><div class="l">Yangi lidlar</div></div>
      `;
      document.getElementById('dayPathsWrap').innerHTML = d.byPath.length
        ? d.byPath.map((p) => `
            <div class="bar-row">
              <div class="bar-label">${escapeHtml(p.path)}</div>
              <div class="bar-track"><i style="width:${(p.n / d.byPath[0].n) * 100}%"></i></div>
              <div class="bar-count">${p.n}</div>
            </div>
          `).join('')
        : '<p style="color:var(--ink-400); font-size:0.85rem;">Bu kunda tashrif qayd etilmagan</p>';
    })
    .catch(() => {});
}

function loadStats() {
  authFetch('/api/stats')
    .then((r) => r.json())
    .then((s) => {
      document.getElementById('statTotalLeads').textContent = s.totalLeads;
      document.getElementById('statTodayLeads').textContent = s.leadsToday;
      document.getElementById('statViews').textContent = s.totalPageviews;
      const conv = s.totalPageviews > 0 ? ((s.totalLeads / s.totalPageviews) * 100).toFixed(1) : '0';
      document.getElementById('statConversion').textContent = `${conv}%`;

      const maxBudget = Math.max(1, ...s.budgetRows.map((b) => b.n));
      document.getElementById('budgetBars').innerHTML = s.budgetRows.map((b) => `
        <div class="bar-row">
          <div class="bar-label">${escapeHtml(b.budget)}</div>
          <div class="bar-track"><i style="width:${(b.n / maxBudget) * 100}%"></i></div>
          <div class="bar-count">${b.n}</div>
        </div>
      `).join('') || '<p style="color:var(--ink-400); font-size:0.85rem;">Hali ma\'lumot yo\'q</p>';

      const maxTrend = Math.max(1, ...s.last7.flatMap((d) => [d.leads, d.views]));
      document.getElementById('trendRow').innerHTML = s.last7.map((d) => {
        const day = new Date(d.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
        return `
          <div class="trend-col">
            <div class="trend-bars">
              <div class="b-leads" style="height:${(d.leads / maxTrend) * 84}px" title="${d.leads} lid"></div>
              <div class="b-views" style="height:${(d.views / maxTrend) * 84}px" title="${d.views} tashrif"></div>
            </div>
            <span>${day}</span>
          </div>
        `;
      }).join('');
    })
    .catch(() => {});
}

function loadLeads() {
  authFetch('/api/leads')
    .then((r) => r.json())
    .then((leads) => {
      allLeads = leads;
      renderLeads();
    })
    .catch(() => {});
}

function renderLeads() {
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = Object.entries(STATUS_LABELS).map(([status, label]) => {
    const cards = allLeads.filter((l) => l.status === status);
    return `
      <div class="kanban-col" data-status="${status}">
        <div class="kanban-col-head"><span>${label}</span><span class="count">${cards.length}</span></div>
        <div class="kanban-cards" data-status="${status}">
          ${cards.length ? cards.map(cardHtml).join('') : '<div class="kanban-empty">Bo\'sh</div>'}
        </div>
      </div>
    `;
  }).join('');

  board.querySelectorAll('.kanban-card').forEach((card) => {
    card.addEventListener('dragstart', () => {
      draggedId = card.dataset.id;
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });

  board.querySelectorAll('.kanban-col').forEach((col) => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (!draggedId) return;
      changeStatus(draggedId, col.dataset.status);
    });
  });

  board.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Ushbu lidni o\'chirmoqchimisiz?')) return;
      const id = btn.dataset.id;
      authFetch(`/api/leads/${id}`, { method: 'DELETE' }).then(() => {
        allLeads = allLeads.filter((l) => String(l.id) !== String(id));
        renderLeads();
        loadStats();
      });
    });
  });
}

function cardHtml(l) {
  return `
    <div class="kanban-card" draggable="true" data-id="${l.id}">
      <div class="name">${escapeHtml(l.name)}</div>
      <div class="meta phone">📞 <a href="tel:${escapeAttr(l.phone || '')}">${escapeHtml(l.phone || '—')}</a></div>
      ${l.company ? `<div class="meta">🏢 ${escapeHtml(l.company)}</div>` : ''}
      ${l.budget ? `<div class="meta">💰 ${escapeHtml(l.budget)}</div>` : ''}
      ${l.message ? `<div class="msg">"${escapeHtml(l.message)}"</div>` : ''}
      <div class="date">${new Date(l.created_at).toLocaleString('uz-UZ')}</div>
      <div class="card-actions"><button class="btn-danger delete-btn" data-id="${l.id}">O'chirish</button></div>
    </div>
  `;
}

function changeStatus(id, status) {
  const lead = allLeads.find((l) => String(l.id) === String(id));
  if (!lead || lead.status === status) return;
  lead.status = status;
  renderLeads();
  authFetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then(() => loadStats());
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }

if (getToken()) {
  showDashboard();
} else {
  showLogin();
}

/* ---------------- Bookings calendar ---------------- */

const BOOKING_STATUS_LABELS = {
  pending_meet: "Meet kutilmoqda",
  confirmed: "Tasdiqlangan",
  cancelled: "Bekor qilingan",
  done: "Bo'lib o'tgan",
};

let allBookings = [];
let calViewYear, calViewMonth;
let calSelectedDay = null;
let calActiveRange = 'day';

(function initBookingsCalendar() {
  const now = new Date();
  calViewYear = now.getFullYear();
  calViewMonth = now.getMonth();

  document.getElementById('adminCalPrev').addEventListener('click', () => {
    calViewMonth -= 1;
    if (calViewMonth < 0) { calViewMonth = 11; calViewYear -= 1; }
    renderAdminCalGrid();
  });
  document.getElementById('adminCalNext').addEventListener('click', () => {
    calViewMonth += 1;
    if (calViewMonth > 11) { calViewMonth = 0; calViewYear += 1; }
    renderAdminCalGrid();
  });

  document.getElementById('calRangeTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.status-tab');
    if (!btn) return;
    calActiveRange = btn.dataset.range;
    calSelectedDay = null;
    Array.from(document.getElementById('calRangeTabs').children).forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    renderAdminCalGrid();
    renderBookingsTable();
  });
})();

function loadBookings() {
  authFetch('/api/bookings')
    .then((r) => r.json())
    .then((rows) => {
      allBookings = rows;
      renderAdminCalGrid();
      renderBookingsTable();
    })
    .catch(() => {});
}

function pad2(n) { return String(n).padStart(2, '0'); }
function dateStrOf(y, m, d) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }

function renderAdminCalGrid() {
  const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  document.getElementById('adminCalLabel').textContent = `${monthNames[calViewMonth]} ${calViewYear}`;

  const grid = document.getElementById('adminCalGrid');
  grid.innerHTML = '';
  ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'].forEach((d) => {
    const el = document.createElement('div');
    el.className = 'admin-cal-dow';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calViewYear, calViewMonth, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();
  const today = todayStr();

  const countByDate = {};
  allBookings.forEach((b) => { countByDate[b.date] = (countByDate[b.date] || 0) + 1; });

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'admin-cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = dateStrOf(calViewYear, calViewMonth, d);
    const el = document.createElement('div');
    el.className = 'admin-cal-day';
    if (dateStr === today) el.classList.add('today');
    if (calSelectedDay === dateStr) el.classList.add('selected');
    const count = countByDate[dateStr];
    el.innerHTML = `<span>${d}</span>${count ? `<span class="badge">${count}</span>` : ''}`;
    el.addEventListener('click', () => {
      calSelectedDay = (calSelectedDay === dateStr) ? null : dateStr;
      renderAdminCalGrid();
      renderBookingsTable();
    });
    grid.appendChild(el);
  }
}

function getRangeBounds() {
  const now = new Date();
  const today = todayStr();
  if (calActiveRange === 'day') return { from: today, to: today };
  if (calActiveRange === 'week') {
    const day = now.getDay() || 7; // Monday=1..Sunday=7
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
  }
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

function renderBookingsTable() {
  const tbody = document.getElementById('bookingsBody');
  let rows;
  if (calSelectedDay) {
    rows = allBookings.filter((b) => b.date === calSelectedDay);
  } else {
    const { from, to } = getRangeBounds();
    rows = allBookings.filter((b) => b.date >= from && b.date <= to);
  }

  if (rows.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Bu oraliqda band qilingan konsultatsiya yo\'q</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((b) => `
    <tr data-id="${b.id}">
      <td>${escapeHtml(b.date)}</td>
      <td>${escapeHtml(b.time)}</td>
      <td>${escapeHtml(b.name)}</td>
      <td><a href="tel:${escapeAttr(b.phone || '')}">${escapeHtml(b.phone || '—')}</a></td>
      <td class="meet-link-cell">
        ${b.meet_link
          ? `<a href="${escapeAttr(b.meet_link)}" target="_blank" rel="noopener">Meet havolasi</a>`
          : `<input type="text" class="meet-link-input" placeholder="Meet havolasini qo'ying" data-id="${b.id}">`}
      </td>
      <td>
        <select class="status-select" data-id="${b.id}">
          ${Object.entries(BOOKING_STATUS_LABELS).map(([val, label]) => `
            <option value="${val}" ${b.status === val ? 'selected' : ''}>${label}</option>
          `).join('')}
        </select>
      </td>
      <td><button class="btn-danger delete-booking-btn" data-id="${b.id}" style="padding:6px 12px; font-size:0.78rem;">O'chirish</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.meet-link-input').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const id = input.dataset.id;
      const val = input.value.trim();
      if (!val) return;
      authFetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetLink: val, status: 'confirmed' }),
      }).then(() => loadBookings());
    });
  });

  tbody.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', () => {
      const id = sel.dataset.id;
      authFetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: sel.value }),
      }).then(() => {
        const b = allBookings.find((x) => String(x.id) === String(id));
        if (b) b.status = sel.value;
      });
    });
  });

  tbody.querySelectorAll('.delete-booking-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Ushbu band qilishni o\'chirmoqchimisiz?')) return;
      const id = btn.dataset.id;
      authFetch(`/api/bookings/${id}`, { method: 'DELETE' }).then(() => loadBookings());
    });
  });
}

/* ---------------- Articles Management & Moderation ---------------- */
let allArticlesList = [];
let activeArticleFilter = 'pending';
let currentPreviewArticleId = null;
let currentEditArticleId = null;

const articleStatusTabs = document.getElementById('articleStatusTabs');
const articlesTableBody = document.getElementById('articlesTableBody');
const articlePreviewModal = document.getElementById('articlePreviewModal');
const closeArticlePreviewBtn = document.getElementById('closeArticlePreviewBtn');
const closeArticlePreviewBtnBottom = document.getElementById('closeArticlePreviewBtnBottom');
const modalApproveBtn = document.getElementById('modalApproveBtn');
const modalRejectBtn = document.getElementById('modalRejectBtn');
const modalEditBtn = document.getElementById('modalEditBtn');

// Edit Modal Elements
const articleEditModal = document.getElementById('articleEditModal');
const closeArticleEditBtn = document.getElementById('closeArticleEditBtn');
const cancelArticleEditBtn = document.getElementById('cancelArticleEditBtn');
const articleEditForm = document.getElementById('articleEditForm');
const editArticleAlert = document.getElementById('editArticleAlert');

if (articleStatusTabs) {
  articleStatusTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.status-tab');
    if (!btn) return;
    activeArticleFilter = btn.dataset.status;
    Array.from(articleStatusTabs.children).forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    renderArticlesTable();
  });
}

function loadArticles() {
  authFetch('/api/articles/admin/all')
    .then((r) => r.json())
    .then((articles) => {
      allArticlesList = Array.isArray(articles) ? articles : [];
      updateArticleCountsAndTable();
    })
    .catch(() => {
      // Fallback to localStorage user articles if offline/testing
      let localUserArticles = [];
      try {
        localUserArticles = JSON.parse(localStorage.getItem('unique_user_articles') || '[]');
      } catch(e) {
        localUserArticles = [];
      }
      allArticlesList = localUserArticles;
      updateArticleCountsAndTable();
    });
}

function updateArticleCountsAndTable() {
  const pendingCount = allArticlesList.filter((a) => a.status === 'pending').length;
  const publishedCount = allArticlesList.filter((a) => a.status === 'published' || !a.status).length;
  const rejectedCount = allArticlesList.filter((a) => a.status === 'rejected').length;

  const statPending = document.getElementById('statPendingArticles');
  if (statPending) statPending.textContent = pendingCount;

  const badgePending = document.getElementById('pendingArticlesBadge');
  if (badgePending) badgePending.textContent = `${pendingCount} ta kutilmoqda`;

  const elAll = document.getElementById('countArtAll');
  if (elAll) elAll.textContent = allArticlesList.length;
  const elPending = document.getElementById('countArtPending');
  if (elPending) elPending.textContent = pendingCount;
  const elPublished = document.getElementById('countArtPublished');
  if (elPublished) elPublished.textContent = publishedCount;
  const elRejected = document.getElementById('countArtRejected');
  if (elRejected) elRejected.textContent = rejectedCount;

  renderArticlesTable();
}

function renderArticlesTable() {
  if (!articlesTableBody) return;

  let filtered = allArticlesList;
  if (activeArticleFilter === 'pending') {
    filtered = allArticlesList.filter((a) => a.status === 'pending');
  } else if (activeArticleFilter === 'published') {
    filtered = allArticlesList.filter((a) => a.status === 'published' || !a.status);
  } else if (activeArticleFilter === 'rejected') {
    filtered = allArticlesList.filter((a) => a.status === 'rejected');
  }

  if (filtered.length === 0) {
    const emptyMsg = activeArticleFilter === 'pending'
      ? '⏳ Hozirda tekshiruv uchun kutilayotgan yangi maqolalar yo\'q'
      : (activeArticleFilter === 'published' ? '✅ Chop etilgan maqolalar yo\'q' : 'Ushbu bo\'limda hozircha maqolalar yo\'q');
    articlesTableBody.innerHTML = `<tr class="empty-row"><td colspan="7" style="text-align:center; padding:32px; color:var(--ink-400);">${emptyMsg}</td></tr>`;
    return;
  }

  articlesTableBody.innerHTML = filtered.map((a) => {
    const status = a.status || 'published';
    const statusLabel = status === 'pending' ? '⏳ Kutilmoqda' : (status === 'published' ? '✅ Tasdiqlangan' : '❌ Rad etilgan');
    const statusClass = status === 'pending' ? 'pending' : (status === 'published' ? 'published' : 'rejected');
    const dateStr = a.created_at ? new Date(a.created_at).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    const catUpper = (a.category || 'FACEBOOK').toUpperCase();

    return `
      <tr data-id="${a.id}">
        <td>
          <img src="${a.image_url || '/images/logo-mark.png'}" alt="Thumb" class="article-thumb-img">
        </td>
        <td>
          <div class="article-title-cell">${escapeHtml(a.title)}</div>
          <small style="color:var(--ink-400); font-size:0.75rem;">Slug: ${escapeHtml(a.slug || '')}</small>
        </td>
        <td>
          <span style="font-size:0.75rem; font-weight:700; color:var(--flow-700); background:var(--flow-50); padding:2px 8px; border-radius:4px;">${catUpper}</span>
        </td>
        <td>
          <div class="article-author-meta">
            <img src="${a.author_image || '/images/logo-mark.png'}" alt="Avatar">
            <span>${escapeHtml(a.author || 'The Unique Media')}</span>
          </div>
        </td>
        <td style="font-size:0.8rem; color:var(--ink-600);">${dateStr}</td>
        <td>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </td>
        <td style="text-align:right; white-space:nowrap;">
          <button type="button" class="btn-preview preview-art-btn" data-id="${a.id}" title="To'liq o'qish">👁 Ko'rish</button>
          <button type="button" class="btn-edit edit-art-btn" data-id="${a.id}" title="Tahrirlash">✏️ Tahrirlash</button>
          ${status === 'pending' || status === 'rejected' ? `<button type="button" class="btn-approve approve-art-btn" data-id="${a.id}" title="Tasdiqlash">✅ Tasdiqlash</button>` : ''}
          ${status === 'pending' || status === 'published' ? `<button type="button" class="btn-reject reject-art-btn" data-id="${a.id}" title="Rad etish">❌ Rad etish</button>` : ''}
          <button type="button" class="btn-danger delete-art-btn" data-id="${a.id}" style="padding:5px 8px; font-size:0.75rem;" title="O'chirish">🗑</button>
        </td>
      </tr>
    `;
  }).join('');

  // Action listeners
  articlesTableBody.querySelectorAll('.preview-art-btn').forEach((btn) => {
    btn.addEventListener('click', () => openArticlePreview(btn.dataset.id));
  });

  articlesTableBody.querySelectorAll('.edit-art-btn').forEach((btn) => {
    btn.addEventListener('click', () => openArticleEdit(btn.dataset.id));
  });

  articlesTableBody.querySelectorAll('.approve-art-btn').forEach((btn) => {
    btn.addEventListener('click', () => setArticleStatus(btn.dataset.id, 'published'));
  });

  articlesTableBody.querySelectorAll('.reject-art-btn').forEach((btn) => {
    btn.addEventListener('click', () => setArticleStatus(btn.dataset.id, 'rejected'));
  });

  articlesTableBody.querySelectorAll('.delete-art-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteArticle(btn.dataset.id));
  });
}

function openArticlePreview(id) {
  currentPreviewArticleId = id;
  const localFound = allArticlesList.find((x) => String(x.id) === String(id));

  authFetch(`/api/articles/admin/${id}`)
    .then((r) => r.json())
    .then((art) => renderPreviewModalData(art))
    .catch(() => {
      if (localFound) renderPreviewModalData(localFound);
    });

  if (localFound) renderPreviewModalData(localFound);
  articlePreviewModal.classList.remove('hidden');
}

function renderPreviewModalData(art) {
  document.getElementById('prevModalTitle').textContent = art.title || '';
  document.getElementById('prevModalExcerpt').textContent = art.excerpt || '';
  document.getElementById('prevModalAuthor').textContent = art.author || 'The Unique Media';
  document.getElementById('prevModalAuthorImg').src = art.author_image || '/images/logo-mark.png';
  document.getElementById('prevModalDate').textContent = art.created_at ? new Date(art.created_at).toLocaleDateString('uz-UZ') : '';
  document.getElementById('prevModalReadTime').textContent = `⏱ ${art.read_time || '5 daqiqa'}`;
  document.getElementById('prevModalCatBadge').textContent = (art.category || 'FACEBOOK').toUpperCase();
  document.getElementById('prevModalBody').innerHTML = art.content || '<p>Matn mavjud emas</p>';

  const coverWrap = document.getElementById('prevModalCoverWrap');
  const coverImg = document.getElementById('prevModalCover');
  if (art.image_url) {
    coverImg.src = art.image_url;
    coverWrap.style.display = 'block';
  } else {
    coverWrap.style.display = 'none';
  }

  const statusBadge = document.getElementById('prevModalStatusBadge');
  const status = art.status || 'published';
  statusBadge.className = `status-badge ${status}`;
  statusBadge.textContent = status === 'pending' ? '⏳ KUTILMOQDA' : (status === 'published' ? '✅ TASDIQLANGAN' : '❌ RAD ETILGAN');
}

function closeArticlePreview() {
  articlePreviewModal.classList.add('hidden');
  currentPreviewArticleId = null;
}

if (closeArticlePreviewBtn) closeArticlePreviewBtn.addEventListener('click', closeArticlePreview);
if (closeArticlePreviewBtnBottom) closeArticlePreviewBtnBottom.addEventListener('click', closeArticlePreview);

if (modalEditBtn) {
  modalEditBtn.addEventListener('click', () => {
    if (currentPreviewArticleId) {
      const id = currentPreviewArticleId;
      closeArticlePreview();
      openArticleEdit(id);
    }
  });
}

if (modalApproveBtn) {
  modalApproveBtn.addEventListener('click', () => {
    if (currentPreviewArticleId) {
      setArticleStatus(currentPreviewArticleId, 'published');
      closeArticlePreview();
    }
  });
}

if (modalRejectBtn) {
  modalRejectBtn.addEventListener('click', () => {
    if (currentPreviewArticleId) {
      setArticleStatus(currentPreviewArticleId, 'rejected');
      closeArticlePreview();
    }
  });
}

/* ---------------- Article Edit System ---------------- */
function openArticleEdit(id) {
  currentEditArticleId = id;
  editArticleAlert.className = 'hidden';
  editArticleAlert.textContent = '';

  const localFound = allArticlesList.find((x) => String(x.id) === String(id));

  function populateEditForm(art) {
    document.getElementById('editArticleId').value = art.id || id;
    document.getElementById('editArticleTitle').value = art.title || '';
    document.getElementById('editArticleSlug').value = art.slug || '';
    document.getElementById('editArticleCategory').value = (art.category || 'facebook').toLowerCase();
    document.getElementById('editArticleAuthor').value = art.author || 'The Unique Media';
    document.getElementById('editArticleReadTime').value = art.read_time || '6 daqiqa';
    document.getElementById('editArticleStatus').value = art.status || 'published';
    
    let tagsStr = '';
    if (Array.isArray(art.tags)) {
      tagsStr = art.tags.join(', ');
    } else if (typeof art.tags === 'string') {
      try { tagsStr = JSON.parse(art.tags).join(', '); } catch { tagsStr = art.tags; }
    }
    document.getElementById('editArticleTags').value = tagsStr;
    document.getElementById('editArticleImage').value = art.image_url || '';
    document.getElementById('editArticleExcerpt').value = art.excerpt || '';
    document.getElementById('editArticleContent').value = art.content || '';
  }

  if (localFound) populateEditForm(localFound);

  authFetch(`/api/articles/admin/${id}`)
    .then((r) => r.json())
    .then((art) => {
      populateEditForm(art);
    })
    .catch(() => {});

  articleEditModal.classList.remove('hidden');
}

function closeArticleEdit() {
  articleEditModal.classList.add('hidden');
  currentEditArticleId = null;
}

if (closeArticleEditBtn) closeArticleEditBtn.addEventListener('click', closeArticleEdit);
if (cancelArticleEditBtn) cancelArticleEditBtn.addEventListener('click', closeArticleEdit);

if (articleEditForm) {
  articleEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    editArticleAlert.className = 'hidden';
    editArticleAlert.textContent = '';

    const id = document.getElementById('editArticleId').value || currentEditArticleId;
    const title = document.getElementById('editArticleTitle').value.trim();
    const slug = document.getElementById('editArticleSlug').value.trim();
    const category = document.getElementById('editArticleCategory').value;
    const author = document.getElementById('editArticleAuthor').value.trim() || 'The Unique Media';
    const read_time = document.getElementById('editArticleReadTime').value.trim() || '5 daqiqa';
    const status = document.getElementById('editArticleStatus').value;
    const tagsInput = document.getElementById('editArticleTags').value;
    const image_url = document.getElementById('editArticleImage').value.trim();
    const excerpt = document.getElementById('editArticleExcerpt').value.trim();
    const content = document.getElementById('editArticleContent').value.trim();

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      title,
      slug,
      category,
      author,
      read_time,
      status,
      tags,
      image_url,
      excerpt,
      content
    };

    authFetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          editArticleAlert.className = 'alert-error';
          editArticleAlert.textContent = data.error || 'Tahrirlashda xatolik yuz berdi';
          return;
        }

        // Update in memory list
        const item = allArticlesList.find((x) => String(x.id) === String(id));
        if (item) {
          Object.assign(item, payload);
        }

        // Update in localStorage if present
        try {
          let local = JSON.parse(localStorage.getItem('unique_user_articles') || '[]');
          const lItem = local.find((x) => String(x.id) === String(id));
          if (lItem) {
            Object.assign(lItem, payload);
            localStorage.setItem('unique_user_articles', JSON.stringify(local));
          }
        } catch(e) {}

        editArticleAlert.className = 'alert-success';
        editArticleAlert.textContent = '✅ Maqola muvaffaqiyatli saqlandi!';

        setTimeout(() => {
          closeArticleEdit();
          updateArticleCountsAndTable();
        }, 800);
      })
      .catch((err) => {
        editArticleAlert.className = 'alert-error';
        editArticleAlert.textContent = err.message || 'Serverga ulanishda xatolik';
      });
  });
}

function setArticleStatus(id, newStatus) {
  authFetch(`/api/articles/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  })
    .then((r) => r.json())
    .then(() => {
      updateLocalArticleStatus(id, newStatus);
    })
    .catch(() => {
      updateLocalArticleStatus(id, newStatus);
    });
}

function updateLocalArticleStatus(id, newStatus) {
  const item = allArticlesList.find((x) => String(x.id) === String(id));
  if (item) item.status = newStatus;

  try {
    let local = JSON.parse(localStorage.getItem('unique_user_articles') || '[]');
    const lItem = local.find((x) => String(x.id) === String(id));
    if (lItem) {
      lItem.status = newStatus;
      localStorage.setItem('unique_user_articles', JSON.stringify(local));
    }
  } catch(e) {}

  updateArticleCountsAndTable();
}

function deleteArticle(id) {
  if (!confirm("Haqiqatan ham ushbu maqolani o'chirmoqchimisiz?")) return;

  authFetch(`/api/articles/${id}`, { method: 'DELETE' })
    .then(() => {
      removeLocalArticle(id);
    })
    .catch(() => {
      removeLocalArticle(id);
    });
}

function removeLocalArticle(id) {
  allArticlesList = allArticlesList.filter((x) => String(x.id) !== String(id));

  try {
    let local = JSON.parse(localStorage.getItem('unique_user_articles') || '[]');
    local = local.filter((x) => String(x.id) !== String(id));
    localStorage.setItem('unique_user_articles', JSON.stringify(local));
  } catch(e) {}

  updateArticleCountsAndTable();
}
