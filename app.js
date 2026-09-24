(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme */
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const themeBtn = document.getElementById('themeToggle');
  const applyTheme = () => {
    root.setAttribute('data-theme', theme);
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#141311' : '#f2eee6');
  };
  applyTheme();
  themeBtn.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; applyTheme(); });

  /* Header state */
  const header = document.getElementById('header');
  const hero = document.querySelector('.hero');
  let lastY = window.scrollY;
  const onScrollHeader = () => {
    const y = window.scrollY;
    const heroEnd = hero.offsetHeight - 80;
    header.classList.toggle('is-solid', y > heroEnd);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (y > heroEnd + 200 && goingDown) header.classList.add('is-hidden');
    else if (goingUp || y < heroEnd) header.classList.remove('is-hidden');
    lastY = y;
  };

  /* Parallax */
  const pEls = reduce ? [] : [...document.querySelectorAll('[data-parallax]')];
  const parallax = () => {
    const vh = window.innerHeight;
    pEls.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const f = parseFloat(el.dataset.parallax) || 0.05;
      const offset = (r.top + r.height / 2 - vh / 2) * f;
      const limit = r.height * 0.04;
      const y = Math.max(-limit, Math.min(limit, offset));
      el.style.translate = `0 ${y.toFixed(1)}px`;
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollHeader(); parallax(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', parallax);
  onScrollHeader(); parallax();

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal, .reveal-img');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));

    /* Gentle stagger for siblings revealed together */
    document.querySelectorAll('.amenities, .principles, .intro__body, .feature__text, .cafes__text, .residences__head, .approach__head, .contact__inner, .collection__list').forEach((group) => {
      [...group.querySelectorAll(':scope > .reveal')].forEach((el, i) => { el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`; });
    });
  }

  /* Collection index: hover swaps image */
  const items = [...document.querySelectorAll('.index__item')];
  const frames = [...document.querySelectorAll('.collection__frame img')];
  const activate = (i) => {
    items.forEach((it, j) => it.classList.toggle('is-active', i === j));
    frames.forEach((f, j) => f.classList.toggle('is-shown', i === j));
  };
  items.forEach((it, i) => {
    it.addEventListener('mouseenter', () => activate(i));
    it.querySelector('a').addEventListener('focus', () => activate(i));
  });

  /* Menu */
  const menu = document.getElementById('menu');
  const openBtn = document.getElementById('menuOpen');
  const closeBtn = document.getElementById('menuClose');
  const menuImg = document.getElementById('menuImg');
  let closeTimer;

  const openMenu = () => {
    clearTimeout(closeTimer);
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    setTimeout(() => closeBtn.focus(), 300);
  };
  const closeMenu = (returnFocus = true) => {
    menu.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    closeTimer = setTimeout(() => { menu.hidden = true; }, reduce ? 0 : 900);
    if (returnFocus) openBtn.focus();
  };
  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => closeMenu());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    if (e.key === 'Tab' && menu.classList.contains('is-open')) {
      const f = [...menu.querySelectorAll('a, button')];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  menu.querySelectorAll('.menu__nav a').forEach((a) => {
    const swap = () => {
      const src = a.dataset.img;
      if (!src || menuImg.getAttribute('src') === src) return;
      menuImg.classList.add('is-swapping');
      setTimeout(() => { menuImg.src = src; menuImg.classList.remove('is-swapping'); }, 250);
    };
    a.addEventListener('mouseenter', swap);
    a.addEventListener('focus', swap);
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu(false);
      setTimeout(() => target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), reduce ? 0 : 450);
    });
  });
})();
