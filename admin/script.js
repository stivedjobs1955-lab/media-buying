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
