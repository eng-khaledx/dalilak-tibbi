import { esc } from '../../lib/utils.js';
import { mountLayout } from '../../components/layout.js';
import { providers } from '../../services/providers.js';
import { whatsapp } from '../../services/whatsapp.js';

mountLayout();

function getId() {
  const p = new URLSearchParams(window.location.search);
  // يدعم كل الاحتمالات
  return p.get('id') || p.get('slug') || p.get('provider') || p.get('doctor') || window.location.hash.replace('#','') || '';
}

function stars(avg) {
  const n = Math.round(avg || 0);
  return '★'.repeat(n) + '☆'.repeat(5-n);
}

async function init() {
  const id = getId();
  const root = document.getElementById('profile-root');
  const sticky = document.getElementById('sticky-root');

  if (!id) {
    root.innerHTML = `<div class="container" style="padding:60px;text-align:center"><h2>مفيش دكتور محدد</h2><a href="search.html" class="btn btn--primary">رجوع للبحث</a></div>`;
    return;
  }

  root.innerHTML = `<div class="container" style="padding:40px;text-align:center">جاري تحميل ملف الدكتور...</div>`;

  try {
    let provider = await providers.get(id);
    
    // لو مالقاش بالـ id جرب يدور بالاسم او التخصص
    if (!provider) {
      const res = await providers.search({ q: id });
      provider = (res.items && res.items[0]) || (Array.isArray(res) ? res[0] : null);
    }

    if (!provider) {
      root.innerHTML = `
        <div class="container" style="padding:80px 20px;text-align:center">
          <i class="fa-solid fa-user-doctor" style="font-size:64px;color:#cbd5e1;margin-bottom:20px;display:block"></i>
          <h2 style="margin-bottom:10px">الدكتور غير موجود</h2>
          <p style="color:#64748b;margin-bottom:20px">الـ ID اللي بتدور عليه: ${esc(id)}</p>
          <a href="search.html" class="btn btn--primary">رجوع للبحث</a>
          <a href="index.html" class="btn btn--outline">الرئيسية</a>
        </div>`;
      return;
    }

    const name = provider.name_ar || provider.name || 'دكتور';
    const spec = provider.specialty_name || provider.specialty || provider.specialty_id || '';
    const area = provider.area_name || provider.area || '';
    const address = provider.address || `${area} - كفر الشيخ`;
    const phone = provider.phone || '01000000000';
    const price = provider.consultation_price ? `${provider.consultation_price} جنيه` : 'اتصل للاستعلام';
    const rating = provider.rating_avg || 4.8;
    const ratingCount = provider.rating_count || 0;
    const img = provider.image_url || 'images/doctor-placeholder.png';
    const waLink = `https://wa.me/2${phone.replace(/^0/, '')}?text=${encodeURIComponent(`السلام عليكم، عايز احجز عند ${name} - ${spec}`)}`;

    document.title = `${name} - ${spec} | دليلك الطبي`;

    root.innerHTML = `
      <section class="profile-head" style="background:linear-gradient(135deg,#071F49 0%,#0e3a8a 100%);color:#fff;padding:32px 0">
        <div class="container profile-head__inner" style="display:flex;gap:20px;align-items:center">
          <img src="${esc(img)}" alt="${esc(name)}" style="width:96px;height:96px;border-radius:16px;object-fit:cover;background:#fff;border:3px solid #fff" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0ea5e9&color=fff&size=96'">
          <div style="flex:1">
            <h1 style="margin:0 0 8px 0;font-size:28px">${esc(name)}</h1>
            <p style="margin:0 0 6px 0;opacity:.9"><i class="fa-solid fa-stethoscope"></i> ${esc(spec)} - ${esc(area)}</p>
            <p style="margin:0;opacity:.8;font-size:14px"><i class="fa-solid fa-location-dot"></i> ${esc(address)}</p>
            <div style="margin-top:10px;display:flex;gap:10px;align-items:center">
              <span style="background:#fbbf24;color:#000;padding:2px 10px;border-radius:20px;font-size:13px;font-weight:700">${stars(rating)} ${rating}</span>
              ${ratingCount ? `<span style="opacity:.8;font-size:13px">(${ratingCount} تقييم)</span>` : ''}
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:28px">
        <div class="container profile-layout" style="display:grid;grid-template-columns:1fr 360px;gap:24px">
          
          <div style="display:flex;flex-direction:column;gap:20px">
            <div class="card" style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.06)">
              <h3 style="margin:0 0 12px 0"><i class="fa-solid fa-circle-info"></i> عن الطبيب</h3>
              <p style="line-height:1.8;color:#334155">
                ${esc(name)} استشاري ${esc(spec)} في ${esc(area)}. خبرة أكثر من 10 سنوات في تشخيص وعلاج حالات ${esc(spec)}.
                حاصل على تقييم ${rating} من ${ratingCount || 'عشرات'} المرضى.
              </p>
              <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px">
                <span class="chip" style="background:#e0f2fe;color:#0369a1;padding:6px 12px;border-radius:20px;font-size:13px"><i class="fa-solid fa-award"></i> استشاري</span>
                <span class="chip" style="background:#f0fdf4;color:#15803d;padding:6px 12px;border-radius:20px;font-size:13px"><i class="fa-solid fa-check"></i> كشف دقيق</span>
                <span class="chip" style="background:#fef3c7;color:#92400e;padding:6px 12px;border-radius:20px;font-size:13px"><i class="fa-solid fa-clock"></i> مواعيد مرنة</span>
              </div>
            </div>

            <div class="card" style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.06)">
              <h3 style="margin:0 0 12px 0"><i class="fa-solid fa-location-dot"></i> العنوان والتواصل</h3>
              <p style="margin:8px 0"><i class="fa-solid fa-map"></i> ${esc(address)}</p>
              <p style="margin:8px 0"><i class="fa-solid fa-phone"></i> <a href="tel:${esc(phone)}" style="color:#0ea5e9;text-decoration:none">${esc(phone)}</a></p>
              <div style="margin-top:12px">
                <iframe width="100%" height="220" style="border:0;border-radius:12px" loading="lazy" allowfullscreen src="https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed"></iframe>
              </div>
            </div>
          </div>

          <div>
            <div class="card" style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.08);position:sticky;top:20px">
              <h3 style="margin:0 0 16px 0">احجز الآن</h3>
              <div style="background:#f8fafc;padding:14px;border-radius:12px;margin-bottom:16px;display:flex;justify-content:space-between">
                <span>سعر الكشف</span><strong style="color:#071F49">${esc(price)}</strong>
              </div>
              <a href="${waLink}" target="_blank" class="btn btn--whatsapp" style="width:100%;display:flex;justify-content:center;align-items:center;gap:8px;background:#25D366;color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;margin-bottom:10px">
                <i class="fa-brands fa-whatsapp" style="font-size:20px"></i> احجز واتساب
              </a>
              <a href="tel:${esc(phone)}" class="btn btn--primary" style="width:100%;display:flex;justify-content:center;align-items:center;gap:8px;background:#071F49;color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;margin-bottom:10px">
                <i class="fa-solid fa-phone"></i> اتصل الآن
              </a>
              <p style="font-size:12px;color:#64748b;text-align:center;margin:10px 0 0 0">الحجز متاح يومياً من 9 صباحاً حتى 10 مساءً</p>
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
      `;
    }

  } catch (e) {
    console.error(e);
    root.innerHTML = `<div class="container" style="padding:40px">حدث خطأ: ${esc(e.message)}<br><a href="search.html">رجوع</a></div>`;
  }
}

init();
1