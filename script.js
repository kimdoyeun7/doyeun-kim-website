/* DOYEUN KIM / V3 — tiny interactions, no frameworks or build step */
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  // Mobile menu; every link opens a new HTML page.
  const menu = $('#menu-toggle');
  const mobileNav = $('#mobile-nav');
  if (menu && mobileNav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
  }

  // Hide empty image tags; a labelled placeholder remains until an actual artwork is added.
  $$('img[data-art-image]').forEach((img) => {
    const loaded = () => { if (img.naturalWidth > 0) img.classList.add('is-loaded'); };
    img.addEventListener('load', loaded);
    img.addEventListener('error', () => img.classList.remove('is-loaded'));
    if (img.complete) loaded();
  });

  // INTRO: V2 full-screen upward slide, with V3's "show once per tab" behaviour.
  // Opening screen auto-closes after 1.8 seconds; ENTER closes it immediately.
  const intro = $('#intro');
  const introButton = $('#intro-enter');
  const replay = $('#replay-intro');
  let introTimer = null;
  let exitTimer = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storage = {
    get() { try { return sessionStorage.getItem('doyeun_intro_seen_v6'); } catch { return null; } },
    set() { try { sessionStorage.setItem('doyeun_intro_seen_v6', 'yes'); } catch {} }
  };
  const closeIntro = () => {
    if (!intro || !intro.classList.contains('is-visible') || intro.classList.contains('is-leaving')) return;
    clearTimeout(introTimer);
    clearTimeout(exitTimer);
    storage.set();
    intro.classList.add('is-leaving'); // CSS moves the entire coloured screen UP.
    document.body.classList.remove('intro-active');
    exitTimer = setTimeout(() => {
      intro.classList.remove('is-visible', 'is-leaving');
      intro.setAttribute('aria-hidden', 'true');
    }, reducedMotion ? 30 : 920);
  };
  const openIntro = (auto = true) => {
    if (!intro) return;
    clearTimeout(introTimer);
    clearTimeout(exitTimer);
    intro.classList.remove('is-leaving');
    intro.classList.add('is-visible');
    intro.setAttribute('aria-hidden', 'false');
    document.body.classList.add('intro-active');
    if (auto) introTimer = setTimeout(closeIntro, reducedMotion ? 500 : 1800);
  };
  if (intro && !storage.get()) openIntro();
  introButton?.addEventListener('click', closeIntro);
  replay?.addEventListener('click', () => openIntro(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && intro?.classList.contains('is-visible')) closeIntro();
  });

  // Optional detail/process photos appear only if the actual files exist.
  document.querySelectorAll('[data-optional-photo]').forEach((figure) => {
    const image = figure.querySelector('img');
    const reveal = () => {
      if (image.naturalWidth > 0) {
        figure.hidden = false;
        const gallery = figure.closest('[data-process-gallery]');
        if (gallery) gallery.hidden = false;
      }
    };
    image.addEventListener('load', reveal);
    if (image.complete) reveal();
  });
})();
