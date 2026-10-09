import { PROVIDER_TYPES } from '../lib/config.js';
import { esc } from '../lib/utils.js';
import { whatsapp } from '../services/whatsapp.js';

export function providerUrl(p) {
  return `provider.html?id=${encodeURIComponent(p.id)}`;
}

export function providerCard(p, opts = {}) {
  const type = PROVIDER_TYPES[p.provider_type] || { label: 'طبيب', icon: 'fa-user-doctor' };
  const url = providerUrl(p);
  
  // fallback محسن - صورة بأول حرف من اسم الدكتور بدل الأيقونة بس
  const initials = encodeURIComponent(p.name_ar ? p.name_ar.charAt(0) : 'د');
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${initials}&background=071F49&color=fff&size=200&font-size=0.5&bold=true`;
  
  const avatar = p.image_url
    ? `<img src="${esc(p.image_url)}" alt="${esc(p.name_ar)}" loading="lazy" width="64" height="64" 
       onerror="this.onerror=null; this.src='${fallbackAvatar}'" 
       style="width:64px;height:64px;border-radius:50%;object-fit:cover">`
    : `<div style="width:64px;height:64px;border-radius:50%;background:#071F49;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px">${esc(p.name_ar ? p.name_ar.charAt(0) : 'د')}</div>`;

  const whatsappLink = whatsapp.providerInquiryLink ? whatsapp.providerInquiryLink(p.name_ar) : (p.phone ? `https://wa.me/2${p.phone.replace(/\D/g,'')}` : '#');

  return `
  <article class="provider-card" data-id="${esc(p.id)}">
    <div class="provider-card__header">
      <div class="provider-card__avatar" style="width:64px;height:64px;flex-shrink:0">${avatar}</div>
      <div style="flex:1;min-width:0">
        <h3 class="provider-card__name"><a href="${url}">${esc(p.name_ar)}</a></h3>
        <div class="provider-card__tags">
          ${p.specialty_name ? `<span class="tag tag--blue">${esc(p.specialty_name)}</span>` : ''}
          ${p.area_name ? `<span class="tag tag--gray">${esc(p.area_name)}</span>` : ''}
          ${p.rating_avg ? `<span class="tag tag--gold"><i class="fa-solid fa-star"></i> ${esc(p.rating_avg)}</span>` : ''}
        </div>
        ${p.address ? `<div class="provider-card__address"><i class="fa-solid fa-location-dot"></i> ${esc(p.address)}</div>` : ''}
        ${p.phone ? `<div class="provider-card__phone"><i class="fa-solid fa-phone"></i> ${esc(p.phone)}</div>` : ''}
      </div>
    </div>
    <div class="provider-card__footer">
      <a class="btn btn--primary btn--sm" href="${url}">عرض الملف</a>
      <a class="btn btn--whatsapp btn--sm" href="${whatsappLink}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
    </div>
  </article>`;
}

export function providerGrid(list, { offersByProvider = {}, className = '' } = {}) {
  if (!list || list.length === 0) {
    return `<div style="text-align:center;padding:40px;color:#64748b"><i class="fa-solid fa-user-doctor" style="font-size:40px;opacity:.3"></i><p style="margin-top:12px">لا يوجد أطباء حاليا في هذا القسم</p></div>`;
  }
  return `<div class="provider-grid ${className}">${list.map((p) => providerCard(p, { offer: offersByProvider[p.id] })).join('')}</div>`;
}