import { PROVIDER_TYPES } from '../lib/config.js';
import { esc } from '../lib/utils.js';
import { whatsapp } from '../services/whatsapp.js';

export function providerUrl(p) {
  return `provider.html?id=${encodeURIComponent(p.id)}`;
}

export function providerCard(p, opts = {}) {
  const type = PROVIDER_TYPES[p.provider_type] || { label: 'طبيب', icon: 'fa-user-doctor' };
  const url = providerUrl(p);

  const initials = encodeURIComponent(p.name_ar ? p.name_ar.charAt(0) : 'د');
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${initials}&background=071F49&color=fff&size=200&font-size=0.5&bold=true`;

  const avatar = p.image_url
    ? `<img src="${esc(p.image_url)}" alt="${esc(p.name_ar)}" loading="lazy" width="56" height="56"
       onerror="this.onerror=null; this.src='${fallbackAvatar}'"
       style="width:56px;height:56px;border-radius:14px;object-fit:cover">`
    : `<div class="doc-avatar"><i class="fa-solid fa-user-doctor"></i></div>`;

  const whatsappLink = whatsapp.providerInquiryLink ? whatsapp.providerInquiryLink(p.name_ar) : (p.phone ? `https://wa.me/2${p.phone.replace(/\D/g,'')}` : '#');
  
  const spec = p.specialty_name || '';
  const area = p.area_name || p.city || '';
  const priceText = p.price ? `${esc(p.price)} ج.م` : '--';

  return `
  <article class="doc-card" data-id="${esc(p.id)}">
    <div class="doc-card__head">
      <div class="doc-card__meta">
        <div class="doc-type">${esc(type.label)} <span class="dot">·</span> <span class="badge-featured">مميز</span></div>
        <h3 class="doc-name"><a href="${url}" style="color:inherit;text-decoration:none">${esc(p.name_ar)}</a></h3>
        <div class="doc-sub">
          ${spec ? `<span><i class="fa-solid fa-stethoscope"></i> ${esc(spec)}</span>` : ''}
          ${area ? `<span><i class="fa-solid fa-location-dot"></i> ${esc(area)}</span>` : ''}
        </div>
        <div class="doc-price">سعر الكشف: <b>${priceText}</b></div>
      </div>
      <div class="provider-card__avatar" style="width:56px;height:56px;flex-shrink:0">${avatar}</div>
    </div>
    <div class="doc-card__actions">
      <a class="btn--whatsapp" href="${whatsappLink}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
      <a class="btn--profile" href="${url}">عرض الملف</a>
    </div>
  </article>`;
}

export function providerGrid(list, { offersByProvider = {}, className = '' } = {}) {
  if (!list || list.length === 0) {
    return `<div style="text-align:center;padding:40px;color:#64748b"><i class="fa-solid fa-user-doctor" style="font-size:40px;opacity:.3"></i><p style="margin-top:12px">لا يوجد أطباء حاليا في هذا القسم</p></div>`;
  }
  return `<div class="provider-grid ${className}">${list.map((p) => providerCard(p, { offer: offersByProvider[p.id] })).join('')}</div>`;
}