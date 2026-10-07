import { esc } from '../lib/utils.js';
import { mountLayout } from '../components/layout.js';
import { providers } from '../services/providers.js';

try { mountLayout(); } catch(e) { console.warn('layout', e); }

function getId() {
  const p = new URLSearchParams(window.location.search);
  return p.get('id') || p.get('slug') || p.get('provider') || p.get('doctor') || '';
}

function stars(avg) {
  const n = Math.round(avg || 5);
  return '★'.repeat(n) + '☆'.repeat(5-n);
}

async function init() {
  const id = decodeURIComponent(getId() || '').trim();
  const root = document.getElementById('profile-root');
  const sticky = document.getElementById('sticky-root');

  console.log('provider id from url:', id);

  if (!id) {
    if (root) root.innerHTML = `<div class="container" style="padding:60px;text-align:center"><h2>مفيش دكتور محدد</h2><a href="search.html" class="btn btn--primary">رجوع للبحث</a></div>`;
    return;
  }

  if (root) root.innerHTML = `<div class="container" style="padding:40px;text-align:center"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل ${esc(id)}...</div>`;

  try {
    let provider = null;
    try { provider = await providers.get(id); } catch(e){ console.warn(e); }
    
    if (!provider) {
      try {
        const res = await providers.search({ q: id });
        const items = res.items || res || [];
        provider = items[0] || null;
        console.log('search fallback', items);
      } catch(e){ console.warn(e); }
    }

    if (!provider) {
      if (root) root.innerHTML = `
        <div class="container" style="padding:80px 20px;text-align:center">
          <i class="fa-solid fa-user-doctor" style="font-size:64px;color:#cbd5e1;margin-bottom:20px;display:block"></i>
          <h2>الدكتور غير موجود</h2>
          <p style="color:#64748b">ID: ${esc(id)}</p>
          <p style="color:#64748b;font-size:13px;margin-top:10px">المتاح: dr-noura-sayed, dr-ahmed-mansour</p>
          <div style="margin-top:20px;display:flex;gap:10px;justify-content:center">
            <a href="search.html" class="btn btn--primary">رجوع للبحث</a>
            <a href="provider.html?id=dr-noura-sayed" class="btn btn--outline">جرب د. نورا</a>
          </div>
        </div>`;
      return;
    }

    const name = provider.name_ar || provider.name || 'دكتور';
    const spec = provider.specialty_name || provider.specialty || '';
    const area = provider.area_name || provider.area || '';
    const address = provider.address || `${area}`;
    const phone = provider.phone || '01000000000';
    const price = provider.consultation_price ? `${provider.consultation_price} جنيه` : 'اتصل للاستعلام';
    const rating = provider.rating_avg || 4.8;
    const ratingCount = provider.rating_count || 0;
    const img = provider.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=071F49&color=fff&size=200`;
    const waLink = `https://wa.me/2${phone.replace(/^0/, '').replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`السلام عليكم، عايز احجز عند ${name}`)}`;

    document.title = `${name} - ${spec} | دليلك الطبي`;

    if (root) root.innerHTML = `
      <section class="profile-head" style="background:linear-gradient(135deg,#071F49 0%,#1e40af 100%);color:#fff;padding:32px 0">
        <div class="container" style="display:flex;gap:20px;align-items:center;max-width:1100px;margin:0 auto;padding:0 16px">
          <img src="${esc(img)}" alt="${esc(name)}" style="width:96px;height:96px;border-radius:16px;object-fit:cover;background:#fff;border:3px solid #fff" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=96'">
          <div style="flex:1">
            <h1 style="margin:0 0 8px 0;font-size:28px">${esc(name)}</h1>
            <p style="margin:0 0 6px 0;opacity:.95"><i class="fa-solid fa-stethoscope"></i> ${esc(spec)} - ${esc(area)}</p>
            <p style="margin:0;opacity:.85;font-size:14px"><i class="fa-solid fa-location-dot"></i> ${esc(address)}</p>
            <div style="margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
              <span style="background:#fbbf24;color:#000;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:700">${stars(rating)} ${rating}</span>
              ${ratingCount ? `<span style="opacity:.9;font-size:13px">(${ratingCount} تقييم)</span>` : ''}
              <span style="background:rgba(255,255,255,.15);padding:4px 12px;border-radius:20px;font-size:13px">${esc(price)}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding:28px 0">
        <div class="container" style="display:grid;grid-template-columns:1fr 360px;gap:24px;max-width:1100px;margin:0 auto;padding:0 16px">
          
          <div style="display:flex;flex-direction:column;gap:20px">
            <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.06)">
              <h3 style="margin:0 0 12px 0"><i class="fa-solid fa-circle-info"></i> عن الطبيب</h3>
              <p style="line-height:1.9;color:#334155;margin:0">
                ${esc(name)} استشاري ${esc(spec)} في ${esc(area)}. خبرة أكثر من 10 سنوات في تشخيص وعلاج حالات ${esc(spec)}.
                حاصل على تقييم ${rating} من ${ratingCount || 'عشرات'} المرضى. عيادة مجهزة بأحدث الأجهزة.
              </p>
            </div>

            <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.06)">
              <h3 style="margin:0 0 12px 0"><i class="fa-solid fa-location-dot"></i> العنوان</h3>
              <p style="margin:8px 0"><i class="fa-solid fa-map" style="color:#0ea5e9"></i> ${esc(address)}</p>
              <p style="margin:8px 0"><i class="fa-solid fa-phone" style="color:#0ea5e9"></i> <a href="tel:${esc(phone)}" style="color:#0ea5e9;text-decoration:none;font-weight:700">${esc(phone)}</a></p>
              <div style="margin-top:14px;border-radius:12px;overflow:hidden">
                <iframe width="100%" height="240" style="border:0" loading="lazy" allowfullscreen src="https://maps.google.com/maps?q=${encodeURIComponent(address + ' كفر الشيخ')}&z=15&output=embed"></iframe>
              </div>
            </div>
          </div>

          <div>
            <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.08);position:sticky;top:20px">
              <h3 style="margin:0 0 16px 0">احجز الآن</h3>
              <div style="background:#f8fafc;padding:14px 16px;border-radius:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8f0">
                <span style="color:#64748b">سعر الكشف</span><strong style="color:#071F49;font-size:18px">${esc(price)}</strong>
              </div>
              <a href="${waLink}" target="_blank" style="width:100%;display:flex;justify-content:center;align-items:center;gap:8px;background:#25D366;color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:800;margin-bottom:10px;font-size:16px">
                <i class="fa-brands fa-whatsapp" style="font-size:22px"></i> احجز واتساب
              </a>
              <a href="tel:${esc(phone)}" style="width:100%;display:flex;justify-content:center;align-items:center;gap:8px;background:#071F49;color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:800;margin-bottom:12px">
                <i class="fa-solid fa-phone"></i> اتصل الآن
              </a>
              <p style="font-size:12px;color:#64748b;text-align:center;margin:0">الحجز متاح يومياً من 9 صباحاً حتى 10 مساءً</p>
              <div style="margin-top:14px;padding-top:14px;border-top:1px solid #f1f5f9;display:flex;gap:8px">
                <a href="search.html?specialty=${encodeURIComponent(spec)}" style="flex:1;text-align:center;padding:8px;background:#f8fafc;border-radius:8px;text-decoration:none;color:#334155;font-size:13px">دكاترة ${esc(spec)}</a>
                <a href="search.html?area=${encodeURIComponent(area)}" style="flex:1;text-align:center;padding:8px;background:#f8fafc;border-radius:8px;text-decoration:none;color:#334155;font-size:13px">${esc(area)}</a>
              </div>
            </div>
          </div>

        </div>
      </section>
    `;

    if (sticky) {
      sticky.innerHTML = `
        <div style="position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e2e8f0;padding:12px 16px;display:flex;gap:10px;z-index:100;box-shadow:0 -4px 20px rgba(0,0,0,.08)">
          <a href="tel:${esc(phone)}" style="flex:1;background:#f1f5f9;color:#071F49;padding:12px;border-radius:12px;text-align:center;text-decoration:none;font-weight:700"><i class="fa-solid fa-phone"></i> اتصال</a>
          <a href="${waLink}" target="_blank" style="flex:1;background:#25D366;color:#fff;padding:12px;border-radius:12px;text-align:center;text-decoration:none;font-weight:700"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
        </div>
        <div style="height:70px"></div>
      `;
    }

  } catch (e) {
    console.error(e);
    if (root) root.innerHTML = `<div class="container" style="padding:40px"><h3>حدث خطأ</h3><pre style="background:#f8fafc;padding:12px;border-radius:8px;overflow:auto">${esc(e.message)}\n${esc(e.stack||'')}</pre><a href="search.html">رجوع</a></div>`;
  }
}

init();
