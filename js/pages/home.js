import { CONFIG } from '../lib/config.js';
import { esc, formatPrice, formatDateOnly } from '../lib/utils.js';
import { mountLayout } from '../components/layout.js';
import { initReveal, emptyState, errorState } from '../components/ui.js';
import { providerGrid } from '../components/provider-card.js';
import { bindLeadTriggers } from '../components/lead-modal.js';
import { taxonomy } from '../services/taxonomy.js';
import { providers } from '../services/providers.js';
import { offers } from '../services/offers.js';
import { setJsonLd, organizationJsonLd } from '../lib/seo.js';

mountLayout();
bindLeadTriggers();
initReveal();
setJsonLd('ld-org', organizationJsonLd());
setJsonLd('ld-site', {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: CONFIG.brand.nameAr,
  url: CONFIG.site.baseUrl || window.location.origin,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${CONFIG.site.baseUrl || window.location.origin}/search.html?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

/* ---------- Hero: area select ---------- */
async function loadAreas() {
  const sel = document.getElementById('hero-area');
  try {
    const areas = await taxonomy.areas({ cityId: CONFIG.defaultCity.id });
    sel.insertAdjacentHTML('beforeend', areas.map((a) => `<option value="${esc(a.id)}">${esc(a.name_ar)}</option>`).join(''));
  } catch (_) { /* select stays with default option */ }
}

/* ---------- Categories ---------- */
async function loadCategories() {
  const root = document.getElementById('category-grid');
  try {
    const specs = await taxonomy.specialties();
    root.innerHTML = specs.map((s) => `
      <a class="category-card" href="search.html?specialty=${encodeURIComponent(s.id)}">
        <span class="category-card__icon"><i class="fa-solid ${esc(s.icon || 'fa-stethoscope')}" aria-hidden="true"></i></span>
        <span class="category-card__label">${esc(s.name_ar)}</span>
      </a>`).join('');
  } catch (_) {
    root.innerHTML = errorState();
  }
}

/* ---------- Featured ---------- */
async function loadFeatured() {
  const root = document.getElementById('featured-root');
  try {
    const [list, live] = await Promise.all([providers.featured(6), offers.active()]);
    if (!list.length) {
      root.innerHTML = emptyState({
        icon: 'fa-user-doctor',
        title: 'سيتم إضافة مقدمي الخدمات الطبية قريبًا.',
        text: 'نعمل على إضافة الأطباء والمراكز في كفرالشيخ. لو محتاج مساعدة الآن، تواصل معنا وسنرشح لك الخدمة المناسبة.',
        actions: '<button type="button" class="btn btn--primary" data-open-lead data-source="home-featured-empty">اطلب المساعدة</button>'
          + '<button type="button" class="btn btn--outline" data-open-lead data-lead-type="PROVIDER" data-source="home-featured-empty">أنا مقدم خدمة</button>',
      });
      return;
    }
    const offersByProvider = {};
    live.forEach((o) => { if (!offersByProvider[o.provider_id]) offersByProvider[o.provider_id] = o; });
    root.innerHTML = providerGrid(list, { offersByProvider });
  } catch (err) {
    console.error(err);
    root.innerHTML = errorState();
  }
}

/* ---------- Offers (hidden unless real data) ---------- */
async function loadOffers() {
  const section = document.getElementById('offers-section');
  const root = document.getElementById('offers-root');
  try {
    const live = await offers.active();
    if (!live.length) return;
    section.hidden = false;
    root.innerHTML = live.slice(0, 3).map((o) => `
      <article class="offer-card">
        <span class="badge badge--gold" style="align-self:flex-start"><i class="fa-solid fa-tag" aria-hidden="true"></i> عرض</span>
        <h3 class="offer-card__title">${esc(o.title)}</h3>
        ${o.provider_name ? `<div class="offer-card__provider"><i class="fa-solid fa-hospital" aria-hidden="true"></i> ${esc(o.provider_name)}</div>` : ''}
        ${o.description ? `<p class="text-muted" style="font-size:var(--text-sm)">${esc(o.description)}</p>` : ''}
        ${(o.price_before || o.price_after) ? `<div class="offer-card__prices">${o.price_after ? `<span class="after">${esc(formatPrice(o.price_after))}</span>` : ''}${o.price_before ? `<span class="before">${esc(formatPrice(o.price_before))}</span>` : ''}</div>` : ''}
        ${o.ends_at ? `<div class="offer-card__ends">ساري حتى ${esc(formatDateOnly(o.ends_at))}</div>` : ''}
        ${o.provider_id ? `<a class="btn btn--outline btn--sm" href="provider.html?id=${encodeURIComponent(o.provider_id)}">عرض التفاصيل</a>` : ''}
      </article>`).join('');
  } catch (_) { /* keep hidden */ }
}

loadAreas();
loadCategories();
loadFeatured();
loadOffers();
