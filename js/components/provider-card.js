/**
 * <ProviderCard /> — one component for every provider type.
 * Only renders data that actually exists on the record.
 */
import { PROVIDER_TYPES } from '../lib/config.js';
import { esc, formatPrice } from '../lib/utils.js';
import { whatsapp } from '../services/whatsapp.js';

export function providerUrl(p) {
  return `provider.html?slug=${encodeURIComponent(p.slug || p.id)}`;
}

/**
 * @param {object} p provider record
 * @param {{offer?:object}} opts
 */
export function providerCard(p, opts = {}) {
  const type = PROVIDER_TYPES[p.provider_type] || { label: '', icon: 'fa-hospital' };
  const url = providerUrl(p);
  const avatar = p.image_url
    ? `<img src="${esc(p.image_url)}" alt="${esc(p.name_ar)}" loading="lazy" width="64" height="64">`
    : `<i class="fa-solid ${type.icon}" aria-hidden="true"></i>`;

  const meta = [];
  if (p.specialty_name) meta.push(`<span><i class="fa-solid fa-stethoscope"></i>${esc(p.specialty_name)}</span>`);
  if (p.area_name) meta.push(`<span><i class="fa-solid fa-location-dot"></i>${esc(p.area_name)}</span>`);

  const price = p.consultation_price
    ? `<div class="provider-card__price">سعر الكشف: <strong>${esc(formatPrice(p.consultation_price))}</strong></div>` : '';

  const offer = opts.offer
    ? `<div class="provider-card__offer"><span class="badge badge--gold"><i class="fa-solid fa-tag"></i>${esc(opts.offer.title)}</span></div>` : '';

  return `
  <article class="provider-card" data-id="${esc(p.id)}">
    <div class="provider-card__body">
      <div class="provider-card__avatar">${avatar}</div>
      <div class="provider-card__info">
        <div class="provider-card__type">${esc(type.label)}${p.is_featured ? ' · <span class="badge badge--gold" style="vertical-align:middle">مميز</span>' : ''}</div>
        <h3 class="provider-card__name"><a href="${url}">${esc(p.name_ar)}</a></h3>
        ${meta.length ? `<div class="provider-card__meta">${meta.join('')}</div>` : ''}
        ${price}${offer}
      </div>
    </div>
    <div class="provider-card__footer">
      <a class="btn btn--primary btn--sm" href="${url}">عرض الملف</a>
      <a class="btn btn--whatsapp btn--sm" href="${whatsapp.providerInquiryLink(p.name_ar)}" target="_blank" rel="noopener" aria-label="واتساب — ${esc(p.name_ar)}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> واتساب</a>
    </div>
  </article>`;
}

export function providerGrid(list, { offersByProvider = {}, className = '' } = {}) {
  return `<div class="provider-grid ${className}">${list.map((p) => providerCard(p, { offer: offersByProvider[p.id] })).join('')}</div>`;
}
