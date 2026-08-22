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
