/* ── Active nav link ── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    const isHome = (page === '' || page === 'index.html') && href === 'index.html';
    if (href === page || isHome) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ── Hamburger menu ── */
function initHamburger() {
  const btn   = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // Close when a nav link is clicked
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}

/* ── Hero banner slider ── */
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.slide-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current]?.classList.remove('active');
    current = ((index % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current]?.classList.add('active');
  }

  /* Initialise: hide all non-first slides from AT */
  slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== 0)));

  function startAuto() { timer = setInterval(() => goTo(current + 1), 4500); }
  function stopAuto()  { clearInterval(timer); }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));
  document.querySelector('.slide-arrow.prev')?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  document.querySelector('.slide-arrow.next')?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  // Keyboard accessibility for arrows
  document.querySelectorAll('.slide-arrow').forEach(arrow => {
    arrow.setAttribute('tabindex', '0');
    arrow.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') arrow.click(); });
  });

  goTo(0);
  startAuto();
}

/* ── Scroll reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

/* ── Animated counters ── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.getAttribute('data-count'), 10);
      const suffix  = el.getAttribute('data-suffix') || '';
      const prefix  = el.getAttribute('data-prefix') || '';
      const duration = 1800;
      const steps   = Math.ceil(duration / 16);
      const inc     = target / steps;
      let current   = 0;

      const tick = setInterval(() => {
        current += inc;
        if (current >= target) {
          current = target;
          clearInterval(tick);
        }
        el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
      }, 16);

      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initHamburger();
  initSlider();
  initScrollReveal();
  initCounters();
});
