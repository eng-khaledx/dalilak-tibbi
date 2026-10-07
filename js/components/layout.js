/** Header, mobile nav, footer and floating contact — rendered from CONFIG. */
import { CONFIG, NAV_LINKS } from '../lib/config.js';
import { esc } from '../lib/utils.js';
import { whatsapp } from '../services/whatsapp.js';

function currentFile() {
  const f = window.location.pathname.split('/').pop();
  return f || 'index.html';
}

function isActive(link) {
  const cur = currentFile();
  const target = (link.match || link.href).split('?')[0];
  if (target === 'index.html') return cur === 'index.html' || cur === '';
  return cur === target;
}

export function renderHeader() {
  const b = CONFIG.brand;
  const nav = NAV_LINKS.map((l) => `<a href="${l.href}" ${isActive(l) ? 'class="is-active" aria-current="page"' : ''}>${esc(l.label)}</a>`).join('');
  const mobile = NAV_LINKS.map((l) => `<a href="${l.href}" ${isActive(l) ? 'class="is-active"' : ''}><i class="fa-solid ${l.icon}" aria-hidden="true"></i>${esc(l.label)}</a>`).join('');

  return `
  <header class="site-header" id="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="index.html" aria-label="${esc(b.nameAr)} — الرئيسية">
        <img class="brand__logo" src="${esc(b.logoPath)}" alt="${esc(b.nameAr)}" width="44" height="44"
             onerror="this.style.display='none'">
        <span class="brand__text">
          <span class="brand__name">${esc(b.nameShortAr)}</span>
          <span class="brand__sub">${esc(b.nameSubAr)}</span>
        </span>
      </a>
      <nav class="nav" aria-label="القائمة الرئيسية">${nav}</nav>
      <div class="header-actions">
        <a class="btn btn--primary btn--sm header-phone" href="tel:${esc(CONFIG.contact.phoneTel)}">
          <i class="fa-solid fa-phone" aria-hidden="true"></i><span class="ltr">${esc(CONFIG.contact.phoneDisplay)}</span>
        </a>
        <a class="btn btn--soft btn--icon" href="search.html" aria-label="بحث"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></a>
        <button type="button" class="btn btn--soft btn--icon menu-toggle" id="menu-toggle" aria-label="القائمة" aria-expanded="false" aria-controls="mobile-nav">
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-nav" id="mobile-nav" aria-hidden="true">
    <div class="mobile-nav__backdrop" data-close-nav></div>
    <div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="القائمة">
      <div class="flex items-center justify-between">
        <span class="brand__name">${esc(b.nameAr)}</span>
        <button type="button" class="btn btn--soft btn--icon" data-close-nav aria-label="إغلاق"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <nav class="mobile-nav__links" aria-label="القائمة">${mobile}</nav>
      <a class="btn btn--primary btn--block" href="tel:${esc(CONFIG.contact.phoneTel)}"><i class="fa-solid fa-phone" aria-hidden="true"></i><span class="ltr">${esc(CONFIG.contact.phoneDisplay)}</span></a>
      <a class="btn btn--whatsapp btn--block" href="${whatsapp.platformLink()}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> واتساب</a>
    </div>
  </div>`;
}

export function renderFooter() {
  const b = CONFIG.brand;
  const main = NAV_LINKS.slice(0, 4).map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('');
  const more = NAV_LINKS.slice(4).map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')
    + '<li><a href="privacy.html">سياسة الخصوصية</a></li><li><a href="terms.html">الشروط والأحكام</a></li>';
  return `
  <footer class="site-footer" id="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="index.html">
            <img class="brand__logo" src="${esc(b.logoPath)}" alt="${esc(b.nameAr)}" width="44" height="44" onerror="this.style.display='none'">
            <span class="brand__text"><span class="brand__name">${esc(b.nameShortAr)}</span><span class="brand__sub">${esc(b.nameSubAr)}</span></span>
          </a>
          <p>${esc(b.tagline)}. نساعدك في الوصول إلى الأطباء والخدمات الطبية في ${esc(CONFIG.defaultCity.nameAr)} بسهولة.</p>
        </div>
        <div>
          <h3 class="footer-title">الأقسام</h3>
          <ul class="footer-links">${main}</ul>
        </div>
        <div>
          <h3 class="footer-title">روابط</h3>
          <ul class="footer-links">${more}</ul>
        </div>
        <div class="footer-contact">
          <h3 class="footer-title">تواصل معنا</h3>
          <a href="tel:${esc(CONFIG.contact.phoneTel)}"><i class="fa-solid fa-phone" aria-hidden="true"></i>${esc(CONFIG.contact.phoneDisplay)}</a>
          <div class="mt-2"><a href="${whatsapp.platformLink()}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>واتساب</a></div>
          <p class="text-muted mt-4" style="font-size:var(--text-sm)">${esc(CONFIG.defaultCity.nameAr)}، مصر</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${esc(b.nameAr)} — ${esc(b.nameEn)}</span>
        <span>المعلومات المعروضة لأغراض الدلالة فقط ولا تُعد استشارة طبية.</span>
      </div>
    </div>
  </footer>`;
}

export function renderFloatingContact() {
  const tg = CONFIG.contact.telegramUsername
    ? `<a class="floating-contact__telegram" href="https://t.me/${esc(CONFIG.contact.telegramUsername)}" target="_blank" rel="noopener" aria-label="تليجرام"><i class="fa-brands fa-telegram" aria-hidden="true"></i></a>`
    : '';
  return `
  <div class="floating-contact" id="floating-contact">
    ${tg}
    <a class="floating-contact__whatsapp" href="${whatsapp.platformLink()}" target="_blank" rel="noopener" aria-label="تواصل عبر واتساب ${esc(CONFIG.contact.phoneDisplay)}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
  </div>`;
}

/** Mount everything into the page's placeholders. */
export function mountLayout() {
  const mount = () => {
    const h = document.getElementById('header-root');
    const f = document.getElementById('footer-root');
    if (h && !h.hasChildNodes()) h.innerHTML = renderHeader();
    if (f && !f.hasChildNodes()) f.innerHTML = renderFooter();
    if (!document.getElementById('floating-contact') && !document.body.classList.contains('no-floating')) {
      document.body.insertAdjacentHTML('beforeend', renderFloatingContact());
    }

    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('mobile-nav');
    if (toggle && nav && !toggle.__bound) {
      toggle.__bound = true;
      const open = () => { nav.classList.add('is-open'); nav.setAttribute('aria-hidden', 'false'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
      const close = () => { nav.classList.remove('is-open'); nav.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
      toggle.addEventListener('click', open);
      nav.querySelectorAll('[data-close-nav]').forEach((el) => el.addEventListener('click', close));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}
