import { providers } from '../services/providers.js';
import { offers } from '../services/offers.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { esc } from '../lib/utils.js';
import { whatsapp } from '../services/whatsapp.js';

function getSlug() {
  const u = new URL(window.location.href);
  return u.searchParams.get('slug') || u.searchParams.get('id') || '';
}

function renderProfile(p, offer) {
  const root = document.getElementById('profile-root');
  if (!root) return;
  root.innerHTML = `
    <section class="profile-head">
      <div class="container profile-head__inner">
        <div class="profile-head__avatar">
          ${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name_ar)}">` : `<i class="fa-solid fa-user-doctor"></i>`}
        </div>
        <div class="profile-head__main">
          <h1>${esc(p.name_ar)}</h1>
          <div class="profile-head__meta">
            ${p.specialty_name ? `<span><i class="fa-solid fa-stethoscope"></i> ${esc(p.specialty_name)}</span>` : ''}
            ${p.area_name ? `<span><i class="fa-solid fa-location-dot"></i> ${esc(p.area_name)}</span>` : ''}
          </div>
          ${offer ? `<div style="margin-top:12px"><span class="badge badge--gold"><i class="fa-solid fa-tag"></i> ${esc(offer.title)} - خصم ${offer.discount_percent}%</span></div>` : ''}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container profile-layout">
        <div class="card">
          <h3>عن الطبيب</h3>
          <p>${esc(p.about || 'لا يوجد وصف متاح حاليا.')}</p>
          <div style="margin-top:16px"><strong>سعر الكشف:</strong> ${esc(p.consultation_price || p.price || 'غير محدد')}</div>
          <div style="margin-top:8px"><strong>العنوان:</strong> ${esc(p.address || p.area_name || '')}</div>
        </div>
        <div class="card">
          <h3>التواصل</h3>
          <a class="btn btn--whatsapp" href="${whatsapp.providerInquiryLink(p.name_ar)}" target="_blank"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
          <a class="btn btn--primary" href="tel:${p.phone || ''}" style="margin-top:8px;display:block">اتصال</a>
          <div style="margin-top:16px">
            <a href="/" class="btn btn--ghost">العودة للرئيسية</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderNotFound(slug) {
  const root = document.getElementById('profile-root');
  if (!root) return;
  root.innerHTML = `<div class="container" style="padding:40px;text-align:center"><h2>لم يتم العثور على الطبيب</h2><p>slug: ${esc(slug)}</p><a href="/" class="btn btn--primary">العودة</a></div>`;
}

async function init() {
  renderHeader();
  renderFooter();
  
  const slug = getSlug();
  if (!slug) { renderNotFound('فارغ'); return; }

  // حاول تمسح الكاش القديم اول مرة
  try {
    // لو الكاش v4 موجود امسحه
    if (localStorage.getItem('cache:providers:public:v4')) {
      localStorage.removeItem('cache:providers:public:v4');
      providers.invalidate();
    }
  } catch(e){}

  let p = await providers.bySlug(slug);
  if (!p) p = await providers.byId(slug);
  
  if (!p) { renderNotFound(slug); return; }

  let offer = null;
  try {
    const allOffers = await offers.list({ provider_id: p.id });
    offer = allOffers[0] || null;
  } catch(e){}

  renderProfile(p, offer);
}

init();
