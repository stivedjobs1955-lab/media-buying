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
const calcMetricBoxes = document.querySelectorAll('.calc-metric-box');

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Convert 0..100 logarithmic slider scale to $500 .. $1,000,000 USD
function sliderToBudget(val) {
  const min = Math.log(500);
  const max = Math.log(1000000);
  const scale = (max - min) / 100;
  const raw = Math.exp(min + scale * val);

  if (raw < 1000) return Math.round(raw / 50) * 50;
  if (raw < 10000) return Math.round(raw / 250) * 250;
  if (raw < 50000) return Math.round(raw / 1000) * 1000;
  if (raw < 200000) return Math.round(raw / 5000) * 5000;
  if (raw < 500000) return Math.round(raw / 25000) * 25000;
  return Math.round(raw / 50000) * 50000;
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
  const t = Math.max(0, Math.min(1, sliderVal / 100));

  // Realistic ROAS: Curves gently sideways (diminishing return curve)
  // At $500: ~3.2x – 5.0x
  // At $10k: ~2.8x – 4.2x
  // At $50k: ~2.5x – 3.8x
  // At $100k: ~2.3x – 3.5x
  // At $1M: ~2.0x – 3.0x
  const minRoasNum = Math.max(2.0, (3.3 - t * 1.3));
  const maxRoasNum = Math.max(3.0, (4.8 - t * 1.8));

  if (calcRoasVal) {
    calcRoasVal.textContent = `${minRoasNum.toFixed(1)}x – ${maxRoasNum.toFixed(1)}x`;
  }

  // Expected Gross Revenue (Savdo hajmi)
  const minRev = Math.round(usd * minRoasNum);
  const maxRev = Math.round(usd * maxRoasNum);
  const calcRevenueVal = document.getElementById('calcRevenueVal');
  if (calcRevenueVal) {
    calcRevenueVal.textContent = `$${formatNumber(minRev)} – $${formatNumber(maxRev)}`;
  }

  // Expected Qualified Leads (realistic CPL gently rises with scale)
  const cplMin = 4.5 + t * 4.5;
  const cplMax = 8.5 + t * 6.5;
  const minLeads = Math.max(1, Math.round(usd / cplMax));
  const maxLeads = Math.max(1, Math.round(usd / cplMin));
  if (calcLeadsVal) {
    calcLeadsVal.textContent = `${formatNumber(minLeads)} – ${formatNumber(maxLeads)} ${leadsUnit}`;
  }

  // Estimated Reach (realistic CPM ~$3.5 - $6.5)
  const minReach = Math.round(usd * (160 - t * 25));
  const maxReach = Math.round(usd * (240 - t * 40));
  if (calcReachVal) {
    if (usd >= 100000) {
      calcReachVal.textContent = `${(minReach / 1000000).toFixed(1)}M – ${(maxReach / 1000000).toFixed(1)}M`;
    } else {
      calcReachVal.textContent = `${formatNumber(minReach)} – ${formatNumber(maxReach)}`;
    }
  }

  // Update Tier Badge and Curve Note
  const climbTierBadge = document.getElementById('climbTierBadge');
  const climbCurveNote = document.getElementById('climbCurveNote');
  let tierName = '';
  let curveNote = '';

  if (usd < 3000) {
    tierName = currentLang === 'ru' ? '🧪 Тест и валидация' : (currentLang === 'en' ? '🧪 Test & Validation' : '🧪 Test & Validatsiya');
    curveNote = currentLang === 'ru' ? 'Быстрый старт ROI' : (currentLang === 'en' ? 'Agile initial ROI' : 'Tezkor boshlang\'ich ROI');
  } else if (usd < 30000) {
    tierName = currentLang === 'ru' ? '🚀 Оптимальный масштаб (Sweet Spot)' : (currentLang === 'en' ? '🚀 Optimal Scale (Sweet Spot)' : '🚀 Optimal masshtab (Sweet Spot)');
    curveNote = currentLang === 'ru' ? 'Максимальная эффективность' : (currentLang === 'en' ? 'Peak Efficiency' : 'Maksimal samaradorlik');
  } else if (usd < 150000) {
    tierName = currentLang === 'ru' ? '⚡ Высокообъемный рост' : (currentLang === 'en' ? '⚡ High-Volume Scaling' : '⚡ Yuqori hajmli o\'sish');
    curveNote = currentLang === 'ru' ? 'Устойчивый объем продаж' : (currentLang === 'en' ? 'Steady Sales Volume' : 'Barqaror savdo hajmi');
  } else {
    tierName = currentLang === 'ru' ? '🏢 Корпоративное лидерство' : (currentLang === 'en' ? '🏢 Enterprise Market Leadership' : '🏢 Korporativ yetakchilik');
    curveNote = currentLang === 'ru' ? 'Глобальный охват рынка' : (currentLang === 'en' ? 'Global Market Reach' : 'Global bozor qamrovi');
  }

  if (climbTierBadge) climbTierBadge.textContent = tierName;
  if (climbCurveNote) climbCurveNote.textContent = curveNote;

  // Move Tracker Dot along SVG Curve
  const trackerDot = document.getElementById('climbTrackerDot');
  if (trackerDot) {
    const dotX = Math.round(t * 590 + 5);
    const dotY = Math.round(110 - Math.pow(t, 0.42) * 94);
    trackerDot.setAttribute('cx', dotX);
    trackerDot.setAttribute('cy', dotY);
  }
}

if (calcSlider) {
  calcSlider.addEventListener('input', updateCalculator);
  calcSlider.addEventListener('change', updateCalculator);
  updateCalculator();
}

// Enable clicking / selecting ANY metric box in calculator
calcMetricBoxes.forEach((box) => {
  box.addEventListener('click', () => {
    document.querySelectorAll('.calc-metric-box').forEach((b) => b.classList.remove('highlight'));
    box.classList.add('highlight');
  });
});

// FAQ Accordion
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
