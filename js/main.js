/* ========== helpers ========== */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const toFa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

/* ========== navbar scroll ========== */
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });

/* ========== reveal on scroll ========== */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      el.style.setProperty('--d', (el.dataset.delay || 0) + 'ms');
      el.classList.add('in');
      io.unobserve(el);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
/* test/debug: ?r=off disables scroll-reveal */
if (location.search.includes('r=off')) {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}
/* ========== lightbox (profile image zoom) ========== */
const lb = document.getElementById('lightbox');
const openLb = () => { lb.classList.add('open'); document.body.classList.add('menu-open'); document.documentElement.classList.add('menu-open'); };
const closeLb = () => { lb.classList.remove('open'); document.body.classList.remove('menu-open'); document.documentElement.classList.remove('menu-open'); };
document.querySelectorAll('[data-lightbox]').forEach(el => el.addEventListener('click', openLb));
document.getElementById('lbClose')?.addEventListener('click', closeLb);
lb?.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });


/* ========== mobile nav drawer ========== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const isMobileNav = () => matchMedia('(max-width:900px)').matches;
const setMenu = on => {
  navLinks.classList.toggle('open', on);
  navToggle.classList.toggle('open', on);
  document.body.classList.toggle('menu-open', on);
  document.documentElement.classList.toggle('menu-open', on);
  navToggle.setAttribute('aria-expanded', on);
};
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  /* tap dark backdrop (not a link) → close */
  navLinks.addEventListener('click', e => { if (e.target === navLinks) setMenu(false); });
  /* link → close menu first, then scroll AFTER the lock is released.
     (scrolling while body is overflow:hidden freezes the page on Android) */
  let scrollT;
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id && id.startsWith('#') && isMobileNav()) {
      e.preventDefault();
      setMenu(false);
      const target = document.querySelector(id);
      clearTimeout(scrollT);
      scrollT = setTimeout(() => {
        target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
      }, 120);
    } else { setMenu(false); }
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', () => { if (!isMobileNav()) setMenu(false); });
}
/* ========== spotlight mouse-tracking ========== */
document.querySelectorAll('.spotlight, .project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ========== 3D tilt on project cards ========== */
if (!reduced && matchMedia('(min-width: 900px)').matches) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      card.style.transform = '';
      setTimeout(() => card.style.transition = '', 600);
    });
  });
}

/* ========== cursor glow ========== */
const glow = document.getElementById('cursorGlow');
if (!reduced && matchMedia('(pointer:fine)').matches) {
  addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
} else { glow.style.opacity = 0; }

/* ========== typewriter ========== */
const phrases = [
  'React + TypeScript',
  'Tailwind CSS & Framer Motion',
  'Responsive UI that feels alive',
  'Git Flow & Pull Requests',
];
const tw = document.getElementById('typewriter');
if (tw) {
  let pi = 0, ci = 0, del = false;
  (function tick() {
    const p = phrases[pi];
    tw.textContent = p.slice(0, ci) + (del ? '' : '');
    // keep trailing cursor via CSS on sibling
    if (!del) {
      ci++;
      if (ci > p.length) { del = true; return setTimeout(tick, 1700); }
      setTimeout(tick, 55);
    } else {
      ci--;
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      setTimeout(tick, 28);
    }
  })();
}

/* ========== animated counters ========== */
const counters = document.querySelectorAll('.stat-num');
const cio = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    cio.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1600;
    (function step(t) {
      const k = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - k, 3);
      el.textContent = toFa(Math.round(end * ease).toLocaleString('en-US').replace(/,/g, '٬')) + suf;
      k < 1 && requestAnimationFrame(step);
    })(t0);
  });
}, { threshold: .5 });
counters.forEach(c => cio.observe(c));

/* ========== nav active section ========== */
const sections = [...document.querySelectorAll('section[id], header[id]')];
const links = [...document.querySelectorAll('.nav-links a')];
const sio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => sio.observe(s));

/* ========== particles background ========== */
const cv = document.getElementById('particles');
if (cv && !reduced) {
  const ctx = cv.getContext('2d');
  let W, H, parts = [];
  const resize = () => {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    parts = Array.from({ length: innerWidth < 700 ? 24 : 48 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + .4,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      o: Math.random() * .4 + .12
    }));
  };
  resize(); addEventListener('resize', resize);
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = `rgba(20,184,166,${p.o})`; ctx.fill();
    }
    // connect lines near cursor
    requestAnimationFrame(loop);
  })();
}

