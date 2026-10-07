import { CONFIG, PROVIDER_TYPES } from '../lib/config.js';
import { esc, debounce } from '../lib/utils.js';
import { mountLayout } from '../components/layout.js';
import { emptyState, errorState, skeletonCards } from '../components/ui.js';
import { providerGrid } from '../components/provider-card.js';
import { bindLeadTriggers } from '../components/lead-modal.js';
import { taxonomy } from '../services/taxonomy.js';
import { providers } from '../services/providers.js';
import { offers } from '../services/offers.js';
import { whatsapp } from '../services/whatsapp.js';
import { setPageMeta, setJsonLd } from '../lib/seo.js';

mountLayout();
bindLeadTriggers();

const state = {
  q: '', specialty: '', area: '', type: '', service: '', offer: false, page: 1,
};
let tax = { specialties: [], areas: [], services: [] };
let liveOffers = [];

/* ---------- ترجمة الانجليزي للعربي ---------- */
const SPECIALTY_MAP = {
  'skin': 'جلدية',
  'derma': 'جلدية',
  'dermatology': 'جلدية',
  'جلديه': 'جلدية',
  'cardio': 'قلب',
  'heart': 'قلب',
  'cardiology': 'قلب',
  'pediatric': 'أطفال',
  'pediatrics': 'أطفال',
  'children': 'أطفال',
  'اطفال': 'أطفال',
  'bones': 'عظام',
  'ortho': 'عظام',
};

function normalizeSpecialty(val) {
  if (!val) return '';
  const low = String(val).toLowerCase().trim();
  return SPECIALTY_MAP[low] || val;
}

/* ---------- URL <-> state ---------- */
function readUrl() {
  const p = new URLSearchParams(window.location.search);
  state.q = p.get('q') || '';
  state.specialty = normalizeSpecialty(p.get('specialty') || '');
  state.area = p.get('area') || '';
  state.type = p.get('type') || '';
  state.service = p.get('service') || '';
  state.offer = p.get('offer') === '1';
  state.page = Math.max(1, parseInt(p.get('page') || '1', 10) || 1);
}
function writeUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.specialty) p.set('specialty', state.specialty);
  if (state.area) p.set('area', state.area);
  if (state.type) p.set('type', state.type);
  if (state.service) p.set('service', state.service);
  if (state.offer) p.set('offer', '1');
  if (state.page > 1) p.set('page', String(state.page));
  const qs = p.toString();
  history.replaceState(null, '', `search.html${qs ? `?${qs}` : ''}`);
}

/* ---------- Filters UI ---------- */
function filtersHtml(suffix) {
  const opt = (items, val, label = 'name_ar') => (items || []).map((i) => `<option value="${esc(i.id)}" ${i.id === val ? 'selected' : ''}>${esc(i[label] || i.id)}</option>`).join('');
  const types = Object.entries(PROVIDER_TYPES).map(([k, v]) => `<option value="${k}" ${state.type === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('');
  return `
    <div class="filters__group">
      <label class="filters__title" for="f-specialty-${suffix}">التخصص</label>
      <select class="select" id="f-specialty-${suffix}" data-filter="specialty"><option value="">كل التخصصات</option>${opt(tax.specialties, state.specialty)}</select>
    </div>
    <div class="filters__group">
      <label class="filters__title" for="f-area-${suffix}">المنطقة</label>
      <select class="select" id="f-area-${suffix}" data-filter="area"><option value="">كل المناطق</option>${opt(tax.areas, state.area)}</select>
    </div>
    <div class="filters__group">
      <label class="filters__title" for="f-type-${suffix}">نوع الخدمة</label>
      <select class="select" id="f-type-${suffix}" data-filter="type"><option value="">الكل</option>${types}</select>
    </div>
    <div class="filters__group">
      <label class="filters__title" for="f-service-${suffix}">الخدمة</label>
      <select class="select" id="f-service-${suffix}" data-filter="service"><option value="">كل الخدمات</option>${opt(tax.services, state.service)}</select>
    </div>
    <div class="filters__group">
      <span class="filters__title">العروض</span>
      <label class="checkbox"><input type="checkbox" data-filter="offer" ${state.offer ? 'checked' : ''}> مقدمو خدمة لديهم عروض حالية</label>
    </div>
    <button type="button" class="btn btn--ghost btn--sm" data-reset-filters><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> مسح الفلاتر</button>`;
}

function renderFilters() {
  const dEl = document.getElementById('filters-content-desktop');
  const mEl = document.getElementById('filters-content-mobile');
  if (dEl) dEl.innerHTML = filtersHtml('d');
  if (mEl) mEl.innerHTML = filtersHtml('m');
  document.querySelectorAll('[data-filter]').forEach((el) => {
    el.addEventListener('change', () => {
      const key = el.dataset.filter;
      state[key] = el.type === 'checkbox' ? el.checked : el.value;
      state.page = 1;
      syncFilterControls();
      run();
    });
  });
  document.querySelectorAll('[data-reset-filters]').forEach((b) => b.addEventListener('click', () => {
    Object.assign(state, { specialty: '', area: '', type: '', service: '', offer: false, page: 1 });
    syncFilterControls();
    run();
  }));
}
function syncFilterControls() {
  document.querySelectorAll('[data-filter]').forEach((el) => {
    const key = el.dataset.filter;
    if (el.type === 'checkbox') el.checked = !!state[key]; else el.value = state[key] || '';
  });
  const areaTop = document.getElementById('area-top');
  if (areaTop) areaTop.value = state.area || '';
  const qEl = document.getElementById('q');
  if (qEl) qEl.value = state.q;
  const n = ['specialty', 'area', 'type', 'service'].filter((k) => state[k]).length + (state.offer ? 1 : 0);
  const badge = document.getElementById('filters-badge');
  if (badge) { badge.hidden = n === 0; badge.textContent = n; }
}

/* ---------- Active filter chips ---------- */
function renderActiveChips() {
  const chips = [];
  const find = (arr, id) => (arr || []).find((x) => x.id === id);
  if (state.q) chips.push({ k: 'q', label: `"${state.q}"` });
  if (state.specialty && find(tax.specialties, state.specialty)) chips.push({ k: 'specialty', label: find(tax.specialties, state.specialty).name_ar });
  else if (state.specialty) chips.push({ k: 'specialty', label: state.specialty });
  if (state.area && find(tax.areas, state.area)) chips.push({ k: 'area', label: find(tax.areas, state.area).name_ar });
  if (state.type && PROVIDER_TYPES[state.type]) chips.push({ k: 'type', label: PROVIDER_TYPES[state.type].label });
  if (state.service && find(tax.services, state.service)) chips.push({ k: 'service', label: find(tax.services, state.service).name_ar });
  if (state.offer) chips.push({ k: 'offer', label: 'لديهم عروض' });
  const root = document.getElementById('active-filters');
  if (!root) return;
  root.innerHTML = chips.map((c) => `<button type="button" class="chip is-active" data-remove="${c.k}" aria-label="إزالة فلتر ${esc(c.label)}">${esc(c.label)} <i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`).join('');
  root.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.remove;
    state[k] = k === 'offer' ? false : '';
    state.page = 1;
    syncFilterControls();
    run();
  }));
}

/* ---------- Title ---------- */
function updateTitle(total) {
  const spec = (tax.specialties || []).find((s) => s.id === state.specialty);
  const area = (tax.areas || []).find((a) => a.id === state.area);
  const type = PROVIDER_TYPES[state.type];
  let subject = 'أطباء وخدمات طبية';
  if (spec) subject = spec.provider_type === 'DOCTOR' && spec.id !== 'sp-doctors' ? `أطباء ${spec.name_ar}` : spec.name_ar;
  else if (state.specialty) subject = `أطباء ${state.specialty}`;
  else if (type) subject = type.plural;
  const place = area ? area.name_ar : (CONFIG.defaultCity?.nameAr || '');
  let title = place ? `${subject} في ${place}` : subject;
  if (state.q) title = `نتائج البحث عن "${state.q}"${spec || area ? ` — ${subject} في ${place}` : ''}`;
  const titleEl = document.getElementById('results-title');
  if (titleEl) titleEl.textContent = title;
  const subEl = document.getElementById('results-subtitle');
  if (subEl) subEl.textContent = total ? `تم العثور على ${total} نتيجة مطابقة.` : 'ابحث بالاسم أو التخصص أو الخدمة أو المنطقة.';
  const canonical = new URLSearchParams();
  if (state.specialty) canonical.set('specialty', state.specialty);
  if (state.area) canonical.set('area', state.area);
  if (state.type) canonical.set('type', state.type);
  setPageMeta({
    title,
    description: `${subject} في ${place} — ${CONFIG.site.defaultDescription}`,
    canonicalPath: `search.html${canonical.toString() ? `?${canonical}` : ''}`,
    noindex: !!state.q,
  });
  setJsonLd('ld-breadcrumb', {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${window.location.origin}/index.html` },
      { '@type': 'ListItem', position: 2, name: title },
    ],
  });
}

/* ---------- Run search ---------- */
let running = 0;
async function run() {
  const my = ++running;
  writeUrl();
  renderActiveChips();
  const root = document.getElementById('results-root');
  const count = document.getElementById('results-count');
  if (!root) return;
  root.innerHTML = `<div class="provider-grid">${skeletonCards(3)}</div>`;
  try {
    if (state.offer && providers.withOfferFlags) await providers.withOfferFlags(liveOffers);
    const res = await providers.search({
      q: state.q, specialtyId: state.specialty, specialty: state.specialty, areaId: state.area, area: state.area, type: state.type,
      serviceId: state.service, hasOffer: state.offer, page: state.page,
    });
    if (my !== running) return;
    const items = res.items || res || [];
    const total = res.total ?? items.length;
    updateTitle(total);
    if (count) count.innerHTML = total ? `<strong>${total}</strong> نتيجة` : '';
    if (!items.length) {
      root.innerHTML = emptyState({
        icon: 'fa-magnifying-glass',
        title: 'لا توجد نتائج مطابقة حاليًا',
        text: `مفيش دكاترة في قسم "${esc(state.specialty || state.q || '')}" حاليا. جرّب قسم تاني أو ابعتلنا.`,
        actions: `<button type="button" class="btn btn--primary" data-open-lead data-source="search-empty" data-service="${esc(specialtyName())}">اطلب المساعدة</button>
                  <a class="btn btn--whatsapp" href="${whatsapp.helpLink(state.q || specialtyName())}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> واتساب</a>`,
      });
      const pag = document.getElementById('pagination');
      if (pag) pag.innerHTML = '';
      return;
    }
    const offersByProvider = {};
    (liveOffers || []).forEach((o) => { if (!offersByProvider[o.provider_id]) offersByProvider[o.provider_id] = o; });
    root.innerHTML = providerGrid(items, { offersByProvider });
    renderPagination(res);
  } catch (err) {
    console.error(err);
    if (my === running) root.innerHTML = errorState();
  }
}
function specialtyName() {
  return (tax.specialties || []).find((s) => s.id === state.specialty)?.name_ar || state.specialty || '';
}

function renderPagination(res) {
  const nav = document.getElementById('pagination');
  if (!nav) return;
  const pages = res.pages || 1;
  const page = res.page || 1;
  if (pages <= 1) { nav.innerHTML = ''; return; }
  const btn = (p, label, disabled = false, active = false) => `<button type="button" class="btn ${active ? 'btn--primary' : 'btn--outline'} btn--sm" data-page="${p}" ${disabled ? 'disabled' : ''} ${active ? 'aria-current="page"' : ''}>${label}</button>`;
  let html = btn(page - 1, '<i class="fa-solid fa-chevron-right"></i>', page === 1);
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) html += btn(p, p, false, p === page);
    else if (Math.abs(p - page) === 2) html += '<span class="text-muted">…</span>';
  }
  html += btn(page + 1, '<i class="fa-solid fa-chevron-left"></i>', page === pages);
  nav.innerHTML = html;
  nav.querySelectorAll('[data-page]').forEach((b) => b.addEventListener('click', () => {
    state.page = parseInt(b.dataset.page, 10);
    run();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));
}

/* ---------- Init - FIXED ---------- */
async function init() {
  readUrl();
  try {
    // آمن - لو أي function مش موجودة هيرجع []
    const specialties = await (taxonomy.specialties ? taxonomy.specialties() : Promise.resolve([])).catch(() => []);
    const areas = await (taxonomy.areas ? taxonomy.areas({ cityId: CONFIG.defaultCity?.id }) : Promise.resolve([])).catch(() => []);
    const services = await (taxonomy.services ? taxonomy.services() : Promise.resolve([])).catch(() => []);
    const live = await (offers.active ? offers.active() : Promise.resolve([])).catch(() => []);
    tax = { specialties: specialties || [], areas: areas || [], services: services || [] };
    liveOffers = live || [];
  } catch (err) {
    console.error('taxonomy load error', err);
    tax = { specialties: [], areas: [], services: [] };
  }
  const areaTop = document.getElementById('area-top');
  if (areaTop && tax.areas.length) {
    areaTop.insertAdjacentHTML('beforeend', tax.areas.map((a) => `<option value="${esc(a.id)}">${esc(a.name_ar)}</option>`).join(''));
  }
  renderFilters();
  syncFilterControls();

  const form = document.getElementById('search-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.q = document.getElementById('q').value.trim();
      const at = document.getElementById('area-top');
      if (at) state.area = at.value;
      state.page = 1;
      syncFilterControls();
      run();
    });
  }
  const qInput = document.getElementById('q');
  if (qInput) {
    qInput.addEventListener('input', debounce(() => {
      state.q = document.getElementById('q').value.trim();
      state.page = 1;
      run();
    }, 350));
  }
  const areaSelect = document.getElementById('area-top');
  if (areaSelect) {
    areaSelect.addEventListener('change', (e) => { state.area = e.target.value; state.page = 1; syncFilterControls(); run(); });
  }

  // Mobile drawer
  const drawer = document.getElementById('filters-drawer');
  const openBtn = document.getElementById('open-filters');
  if (openBtn && drawer) {
    openBtn.addEventListener('click', () => { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; });
    drawer.querySelectorAll('[data-close-drawer]').forEach((b) => b.addEventListener('click', () => { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }));
  }

  run();
}
init();
