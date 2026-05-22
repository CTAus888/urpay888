/* UrPay — Project 888 — Main JS v2 */

// ── Nav: glass on scroll
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 48);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Scroll reveal (Intersection Observer)
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  revealEls.forEach(el => io.observe(el));
}

// ── Animated counter
function counter(el, end, duration = 1800, suffix = '') {
  const start = performance.now();
  const isDecimal = String(end).includes('.');
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    const val = isDecimal ? (ease * end).toFixed(1) : Math.round(ease * end).toLocaleString();
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const countEls = document.querySelectorAll('[data-count]');
if (countEls.length) {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const end = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        counter(el, end, 1800, suffix);
        cio.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  countEls.forEach(el => cio.observe(el));
}

// ── Mobile nav
const burger = document.getElementById('hamburger');
if (burger) {
  let open = false;
  burger.addEventListener('click', () => {
    open = !open;
    const links = document.querySelector('.nav-links');
    const cta   = document.querySelector('.nav-cta');
    if (links) {
      Object.assign(links.style, open ? {
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 'var(--nav-h)',
        left: '0', right: '0', bottom: '0',
        background: 'rgba(10,7,26,0.98)',
        backdropFilter: 'blur(24px)',
        padding: '32px 28px', gap: '28px',
        zIndex: '150', alignItems: 'flex-start',
        fontSize: '1.125rem',
      } : { display: '', position: '', background: '',
            backdropFilter: '', padding: '', gap: '',
            flexDirection: '' });
    }
    burger.classList.toggle('open', open);
  });
  // close on link click
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => { open = false; burger.click(); burger.click(); })
  );
}

// ── Scheme strip pause on hover (already in CSS, backup)
const strip = document.querySelector('.strip-track');
if (strip) {
  strip.addEventListener('mouseenter', () => strip.style.animationPlayState = 'paused');
  strip.addEventListener('mouseleave', () => strip.style.animationPlayState = 'running');
}
