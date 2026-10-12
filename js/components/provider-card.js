import { PROVIDER_TYPES, normalizeType } from '../lib/config.js';
import { esc } from '../lib/utils.js';
import { whatsapp } from '../services/whatsapp.js';

export function providerUrl(p) {
  return `provider.html?id=${encodeURIComponent(p.id)}`;
}

export function providerCard(p, opts = {}) {
  const type = PROVIDER_TYPES[normalizeType(p.provider_type || p.type)];
  const url = providerUrl(p);
  const avatar = `<div class="doc-avatar"><i class="fa-solid ${esc(type.icon)}" aria-hidden="true"></i>${
    p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name_ar)}" loading="lazy" width="56" height="56" onerror="this.remove()">` : ''
  }</div>`;
  const whatsappLink = whatsapp.providerInquiryLink ? whatsapp.providerInquiryLink(p.name_ar) : (p.phone ? `https://wa.me/2${p.phone.replace(/\D/g,'')}` : '#');
  const spec = p.specialty_name || '';
  const area = p.area_name || '';
  const price = p.price || p.consultation_price;
  const priceText = price ? `${esc(price)} ج.م` : '--';

  return `
  <article class="doc-card" data-id="${esc(p.id)}">
    <div class="doc-card__head">
      <div class="doc-card__meta">
        <div class="doc-type">${esc(type.label)} <span class="dot">·</span> ${(p.badge || p.is_featured) ? `<span class="badge-featured">${esc(p.badge || 'مميز')}</span>` : ''}</div>
        <h3 class="doc-name"><a href="${url}">${esc(p.name_ar)}</a></h3>
        <div class="doc-sub">
          ${spec ? `<span><i class="fa-solid fa-stethoscope"></i> ${esc(spec)}</span>` : ''}
          ${area ? `<span><i class="fa-solid fa-location-dot"></i> ${esc(area)}</span>` : ''}
        </div>
        <div class="doc-price">سعر الكشف: <b>${priceText}</b></div>
      </div>
      ${avatar}
    </div>
    <div class="doc-card__actions">
      <a class="btn btn--whatsapp" href="${whatsappLink}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> واتساب</a>
      <a class="btn btn--outline btn--profile" href="${url}">عرض الملف</a>
    </div>
  </article>`;
}

export function providerGrid(list, { offersByProvider = {}, className = '' } = {}) {
  if (!list || list.length === 0) {
    return `<div style="text-align:center;padding:40px;color:#64748b">لا يوجد أطباء حاليا</div>`;
  }
  return `<div class="provider-grid ${className}">${list.map((p) => providerCard(p, { offer: offersByProvider[p.id] })).join('')}</div>`;
}