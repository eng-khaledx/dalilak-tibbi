
import { esc } from '../lib/utils.js';
import { mountLayout } from '../components/layout.js';
import { providers } from '../services/providers.js';
import { offers } from '../services/offers.js';

try { mountLayout(); } catch(e){}

const OFFERS_MOCK = [
  { id: 'off1', provider_id: 'dr-noura-sayed', title: 'كشف جلدية + متابعة مجانية', discount: 30, old_price: 250, new_price: 175, tag: 'جلدية', valid_until: '2026-10-15', type: 'كشف' },
  { id: 'off2', provider_id: 'dr-sara-ali', title: 'باقة متابعة أطفال 3 شهور', discount: 40, old_price: 300, new_price: 180, tag: 'أطفال', valid_until: '2026-10-20', type: 'أطفال' },
  { id: 'off3', provider_id: 'dr-ahmed-mansour', title: 'رسم قلب + كشف مجانا', discount: 50, old_price: 400, new_price: 200, tag: 'قلب', valid_until: '2026-10-10', type: 'قلب' },
  { id: 'off4', provider_id: 'dr-noura-sayed', title: 'جلسة ديرما بن + كشف', discount: 25, old_price: 500, new_price: 375, tag: 'جلدية', valid_until: '2026-10-25', type: 'جلدية' },
];

function offerCard(offer, provider) {
  const name = provider?.name_ar || provider?.name || 'دكتور';
  const spec = provider?.specialty_name || provider?.specialty || offer.tag || '';
  const area = provider?.area_name || provider?.area || '';
  const phone = provider?.phone || '01000000000';
  const img = provider?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=071F49&color=fff&size=100`;
  const wa = `https://wa.me/2${phone.replace(/^0/,'').replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`عايز استفيد من عرض: ${offer.title} عند ${name}`)}`;

  return `
  <div class="offer-card" data-tag="${esc(offer.tag)}" data-type="${esc(offer.type)}" style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);border:1px solid #f1f5f9;position:relative;transition:.2s">
    <div style="position:absolute;top:12px;left:12px;background:#ef4444;color:#fff;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:800;z-index:2">-${offer.discount}%</div>
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);padding:16px;display:flex;gap:12px;align-items:center">
      <img src="${esc(img)}" style="width:56px;height:56px;border-radius:12px;object-fit:cover;background:#fff;border:2px solid #fff" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=56'">
      <div style="flex:1">
        <div style="font-weight:800;color:#071F49;font-size:15px">${esc(name)}</div>
        <div style="font-size:12px;color:#475569">${esc(spec)} - ${esc(area)}</div>
      </div>
      <div style="background:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;color:#92400e"><i class="fa-solid fa-clock"></i> ينتهي ${offer.valid_until}</div>
    </div>
    <div style="padding:16px">
      <h3 style="margin:0 0 8px 0;font-size:16px;color:#0f172a">${esc(offer.title)}</h3>
      <div style="display:flex;align-items:center;gap:10px;margin:12px 0">
        <span style="font-size:20px;font-weight:800;color:#071F49">${offer.new_price} جنيه</span>
        <span style="font-size:13px;color:#94a3b8;text-decoration:line-through">${offer.old_price} جنيه</span>
        <span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:20px;font-size:11px">وفر ${offer.old_price - offer.new_price} جنيه</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <a href="${wa}" target="_blank" style="flex:1;background:#25D366;color:#fff;text-align:center;padding:10px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px"><i class="fa-brands fa-whatsapp"></i> احجز العرض</a>
        <a href="provider.html?id=${esc(offer.provider_id)}" style="padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;text-decoration:none;color:#334155;font-size:14px">الملف</a>
      </div>
    </div>
  </div>`;
}

async function init() {
  const root = document.getElementById('offers-root');
  const countEl = document.getElementById('offers-count');

  let liveOffers = [];
  try { liveOffers = await offers.active(); } catch(e){ console.warn('offers service', e); }

  const allOffers = (liveOffers && liveOffers.length ? liveOffers : OFFERS_MOCK).map(o => ({
    ...o,
    title: o.title || o.name_ar || 'عرض خاص',
    discount: o.discount || 20,
    old_price: o.old_price || o.price_before || 300,
    new_price: o.new_price || o.price_after || 200,
    tag: o.tag || o.specialty || 'عام',
    type: o.type || o.specialty || 'كشف',
    valid_until: o.valid_until || o.ends_at || '2026-10-30',
    provider_id: o.provider_id || o.providerId || 'dr-noura-sayed'
  }));

  // حمل بيانات الدكاترة
  const providersMap = {};
  try {
    const res = await providers.search({});
    const list = res.items || res || [];
    list.forEach(p => providersMap[p.id] = p);
  } catch(e){}

  function render(filter = 'all') {
    const filtered = filter === 'all' ? allOffers : allOffers.filter(o => (o.tag||'').includes(filter) || (o.type||'').includes(filter));
    if (countEl) countEl.textContent = filtered.length;
    if (!filtered.length) {
      root.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:16px"><i class="fa-solid fa-tags" style="font-size:48px;color:#cbd5e1;margin-bottom:12px;display:block"></i><h3>مفيش عروض في القسم ده حاليا</h3><p style="color:#64748b">جرب قسم تاني أو تابعنا على الواتساب</p></div>`;
      return;
    }
    root.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">${filtered.map(o => offerCard(o, providersMap[o.provider_id])).join('')}</div>`;
  }

  render('all');

  document.querySelectorAll('.offer-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.offer-filter').forEach(b => { b.style.background='#fff'; b.style.color='#000'; b.classList.remove('active'); });
      btn.style.background='#071F49'; btn.style.color='#fff'; btn.classList.add('active');
      render(btn.dataset.filter);
    });
  });
}

init();

1