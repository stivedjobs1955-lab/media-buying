// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Reveal-on-scroll
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// Clients marquee tracks (Row 1 & Row 2)
document.querySelectorAll('.clients-track').forEach((track) => {
  const originalCards = Array.from(track.children);
  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
});

// Pageview tracking
fetch('/api/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: location.pathname, referrer: document.referrer }),
}).catch(() => {});

// Contact form
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (formError) formError.style.display = 'none';
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const payload = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      company: document.getElementById('company').value,
      budget: document.getElementById('budget').value,
      message: document.getElementById('message').value,
    };

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (submitBtn) submitBtn.disabled = false;
        if (!ok) {
          if (formError) {
            formError.textContent = data.error || 'Xatolik yuz berdi, qayta urinib ko\'ring.';
            formError.style.display = 'block';
          }
          return;
        }
        if (formSuccess) formSuccess.classList.add('show');
        contactForm.reset();
      })
      .catch(() => {
        if (submitBtn) submitBtn.disabled = false;
        if (formError) {
          formError.textContent = 'Serverga ulanib bo\'lmadi. Birozdan so\'ng qayta urinib ko\'ring.';
          formError.style.display = 'block';
        }
      });
  });
}

// Scroll Progress Bar & Fixed Header Blur State
const scrollProgress = document.getElementById('scrollProgress');
const siteHeader = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  if (siteHeader) {
    if (scrollTop > 15) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
}, { passive: true });

// Interactive ROI / Byudjet Kalkulyatori
const calcSlider = document.getElementById('calcSlider');
const calcBudgetVal = document.getElementById('calcBudgetVal');
const calcReachVal = document.getElementById('calcReachVal');
const calcLeadsVal = document.getElementById('calcLeadsVal');
const calcRoasVal = document.getElementById('calcRoasVal');

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Convert 0..300 slider scale to $500 .. $1,000,000 USD matching marks at exactly 0, 100, 200, 300
function sliderToBudget(val) {
  if (val <= 0) return 500;
  if (val >= 300) return 1000000;

  if (val <= 100) {
    // Segment 1: $500 -> $10 000 (val 0 -> 100)
    const ratio = val / 100;
    const raw = 500 * Math.pow(10000 / 500, ratio);
    if (raw < 2000) return Math.round(raw / 100) * 100;
    if (raw < 5000) return Math.round(raw / 250) * 250;
    return Math.round(raw / 500) * 500;
  } else if (val <= 200) {
    // Segment 2: $10 000 -> $100 000 (val 100 -> 200)
    const ratio = (val - 100) / 100;
    const raw = 10000 * Math.pow(100000 / 10000, ratio);
    if (raw < 30000) return Math.round(raw / 1000) * 1000;
    if (raw < 70000) return Math.round(raw / 2500) * 2500;
    return Math.round(raw / 5000) * 5000;
  } else {
    // Segment 3: $100 000 -> $1 000 000 (val 200 -> 300)
    const ratio = (val - 200) / 100;
    const raw = 100000 * Math.pow(1000000 / 100000, ratio);
    if (raw < 300000) return Math.round(raw / 10000) * 10000;
    if (raw < 700000) return Math.round(raw / 25000) * 25000;
    return Math.round(raw / 50000) * 50000;
  }
}

function updateCalculator() {
  if (!calcSlider) return;
  const sliderVal = parseInt(calcSlider.value, 10);
  const usd = sliderToBudget(sliderVal);
  const currentLang = localStorage.getItem('unique_lang') || 'uz';
  const leadsUnit = currentLang === 'ru' ? 'лидов' : (currentLang === 'en' ? 'leads' : 'ta lid');

  // Format budget display in USD ($)
  if (calcBudgetVal) {
    calcBudgetVal.textContent = `$${formatNumber(usd)}`;
  }

  // Normalized progress parameter 0..1
  const t = Math.max(0, Math.min(1, sliderVal / 300));

  // Prognoz ROAS: Keng va jozibador oraliq (3.2x dan to 25x+ gacha)
  const minRoasNum = (3.2 + t * 3.6).toFixed(1);
  const maxRoasNum = (7.5 + t * 17.5).toFixed(1);

  if (calcRoasVal) {
    calcRoasVal.textContent = `${minRoasNum}x – ${maxRoasNum}x`;
  }

  // Kutilayotgan lidlar: Keng va erkin oraliq (1$ = ~0.35 dan 1.8 tagacha lid)
  const minLeads = Math.max(1, Math.round(usd * (0.35 - t * 0.05)));
  const maxLeads = Math.max(1, Math.round(usd * (1.80 - t * 0.15)));
  if (calcLeadsVal) {
    calcLeadsVal.textContent = `${formatNumber(minLeads)} – ${formatNumber(maxLeads)} ${leadsUnit}`;
  }

  // Taxminiy qamrov (Oxvat): 1$ uchun ~400 tadan 850 tagacha qamrov
  const minReach = Math.round(usd * 400);
  const maxReach = Math.round(usd * 850);
  if (calcReachVal) {
    if (usd >= 100000) {
      calcReachVal.textContent = `${(minReach / 1000000).toFixed(1)}M – ${(maxReach / 1000000).toFixed(1)}M`;
    } else {
      calcReachVal.textContent = `${formatNumber(minReach)} – ${formatNumber(maxReach)}`;
    }
  }
}

if (calcSlider) {
  calcSlider.addEventListener('input', updateCalculator);
  calcSlider.addEventListener('change', updateCalculator);
  updateCalculator();
}

// Enable clicking / selecting ANY metric box in calculator
document.querySelectorAll('.calc-metric-box').forEach((box) => {
  box.addEventListener('click', () => {
    document.querySelectorAll('.calc-metric-box').forEach((b) => b.classList.remove('highlight'));
    box.classList.add('highlight');
  });
});
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const questionBtn = item.querySelector('.faq-question');
  if (questionBtn) {
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach((i) => {
        i.classList.remove('active');
        const icon = i.querySelector('.faq-icon');
        if (icon) icon.textContent = '＋';
      });
      if (!isOpen) {
        item.classList.add('active');
        const icon = item.querySelector('.faq-icon');
        if (icon) icon.textContent = '✕';
      }
    });
  }
});
