import { PROVIDER_TYPES } from '../lib/config.js';
import { esc, formatPrice } from '../lib/utils.js';
import { whatsapp } from '../services/whatsapp.js';

export function providerUrl(p) {
  return `provider.html?id=${encodeURIComponent(p.id)}`;
}

export function providerCard(p, opts = {}) {
  const type = PROVIDER_TYPES[p.provider_type] || { label: 'طبيب', icon: 'fa-user-doctor' };
  const url = providerUrl(p);
  const avatar = p.image_url
    ? `<img src="${esc(p.image_url)}" alt="${esc(p.name_ar)}" loading="lazy" width="64" height="64" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><span style="display:none" class="avatar-fallback"><i class="fa-solid ${type.icon}"></i></span>`
    : `<i class="fa-solid ${type.icon}" aria-hidden="true"></i>`;

  return `
  <article class="provider-card" data-id="${esc(p.id)}">
    <div class="provider-card__header">
      <div class="provider-card__avatar">${avatar}</div>
      <div style="flex:1">
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
      <a class="btn btn--whatsapp btn--sm" href="${whatsapp.providerInquiryLink ? whatsapp.providerInquiryLink(p.name_ar) : 'https://wa.me/2'+p.phone}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
    </div>
  </article>`;
}

export function providerGrid(list, { offersByProvider = {}, className = '' } = {}) {
  return `<div class="provider-grid ${className}">${list.map((p) => providerCard(p, { offer: offersByProvider[p.id] })).join('')}</div>`;
}