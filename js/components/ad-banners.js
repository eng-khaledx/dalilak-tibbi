/** Auto-sliding ad banners (hero card + featured ads). Markup lives in index.html. */
const INTERVAL_MS = 4000;

function initSlider(root, slideSel, dotSel) {
  if (!root || root.dataset.ready) return;
  const slides = [...root.querySelectorAll(slideSel)];
  const dots = [...root.querySelectorAll(dotSel)];
  if (slides.length < 2) return;
  root.dataset.ready = '1';
  let current = 0;
  let timer = null;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === current));
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
  }
  const start = () => { stop(); timer = setInterval(() => show(current + 1), INTERVAL_MS); };
  const stop = () => { if (timer) clearInterval(timer); timer = null; };

  dots.forEach((d, idx) => d.addEventListener('click', () => { show(idx); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  start();
}

export function initAdBanners() {
  initSlider(document.getElementById('hero-ad'), '.hero-ad__slide', '.ad-dot');
  initSlider(document.getElementById('ads-slider'), '.ad-banner', '.ad-dot');
}

initAdBanners();
