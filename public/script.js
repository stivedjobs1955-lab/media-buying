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

  // 1$ uchun o'rtacha 500 ta qamrov (oxvat)
  const minReach = Math.round(usd * 450);
  const maxReach = Math.round(usd * 550);
  if (calcReachVal) {
    calcReachVal.textContent = `${formatNumber(minReach)} – ${formatNumber(maxReach)}`;
  }

  // 1$ uchun 0.3 tadan 1 tagacha lid
  const minLeads = Math.max(1, Math.round(usd * 0.3));
  const maxLeads = Math.max(1, Math.round(usd * 1.0));
  if (calcLeadsVal) {
    calcLeadsVal.textContent = `${formatNumber(minLeads)} – ${formatNumber(maxLeads)} ${leadsUnit}`;
  }

  // ROAS: 1.5x dan boshlanib byudjet $1M gacha yetganda 100x gacha borishi mumkin
  const ratio = Math.max(0, Math.min(1, sliderVal / 100));
  const minRoas = (1.5 + ratio * 28.5).toFixed(1);
  const maxRoas = Math.round(3.0 + ratio * 97.0);
  if (calcRoasVal) {
    calcRoasVal.textContent = `${minRoas}x – ${maxRoas}x`;
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
    calcMetricBoxes.forEach((b) => b.classList.remove('highlight'));
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
