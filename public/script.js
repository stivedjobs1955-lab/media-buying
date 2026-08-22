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

// Clients marquee — duplicate the cards once inside the same track so the
// 0% -> -50% scroll loops seamlessly (the two halves are identical).
const clientsTrack = document.getElementById('clientsTrack');
if (clientsTrack) {
  const originalCards = Array.from(clientsTrack.children);
  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clientsTrack.appendChild(clone);
  });
}

// Pageview tracking (for the admin panel's stats)
fetch('/api/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: location.pathname, referrer: document.referrer }),
}).catch(() => {});

// Contact form — submits the lead to the CRM (visible in /admin)
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formError.style.display = 'none';
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

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
        submitBtn.disabled = false;
        if (!ok) {
          formError.textContent = data.error || 'Xatolik yuz berdi, qayta urinib ko\'ring.';
          formError.style.display = 'block';
          return;
        }
// Scroll Progress Bar
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
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

function updateCalculator() {
  if (!calcSlider) return;
  const budget = parseInt(calcSlider.value, 10);
  const currentLang = localStorage.getItem('unique_lang') || 'uz';
  const currencyUnit = currentLang === 'ru' ? 'сум' : "so'm";
  const leadsUnit = currentLang === 'ru' ? 'лидов' : 'ta lid';

  // Format budget display
  if (calcBudgetVal) calcBudgetVal.textContent = `${formatNumber(budget)} ${currencyUnit}`;

  // Estimate Reach (CPM roughly ~25k - 40k UZS)
  const minReach = Math.round((budget / 45000) * 1000);
  const maxReach = Math.round((budget / 25000) * 1000);
  if (calcReachVal) calcReachVal.textContent = `${formatNumber(minReach)} – ${formatNumber(maxReach)}`;

  // Estimate Leads (CPL roughly ~45k - 95k UZS)
  const minLeads = Math.max(15, Math.round(budget / 95000));
  const maxLeads = Math.max(30, Math.round(budget / 48000));
  if (calcLeadsVal) calcLeadsVal.textContent = `${minLeads} – ${maxLeads} ${leadsUnit}`;

  // Estimate ROAS
  let roasMin = '3.0x';
  let roasMax = '4.2x';
  if (budget >= 15000000 && budget < 30000000) {
    roasMin = '3.4x';
    roasMax = '4.8x';
  } else if (budget >= 30000000) {
    roasMin = '3.8x';
    roasMax = '5.5x';
  }
  if (calcRoasVal) calcRoasVal.textContent = `${roasMin} – ${roasMax}`;
}

if (calcSlider) {
  calcSlider.addEventListener('input', updateCalculator);
  updateCalculator();
}

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
