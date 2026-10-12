import { PROVIDER_TYPES, normalizeType } from '../lib/config.js';
import { esc } from '../lib/utils.js';
import { norm } from '../lib/match.js';
import { whatsapp } from '../services/whatsapp.js';

/** أيقونة دائرية بجراديانت حسب التخصص / نوع مقدم الخدمة */
const ICON_BY_SPECIALTY = [
  ["اطفال", ["#10b981", "#065f46"], "👶"],
  ["نساء", ["#ec4899", "#be185d"], "🤰"],
  ["اسنان", ["#06b6d4", "#0891b2"], "🦷"],
  ["عظام", ["#f59e0b", "#d97706"], "🦴"],
  ["باطنه", ["#8b5cf6", "#7c3aed"], "🫀"],
];
const ICON_BY_TYPE = {
  LAB: [["#3b82f6", "#1d4ed8"], "🧪"],
  PHARMACY: [["#10b981", "#047857"], "💊"],
  RADIOLOGY_CENTER: [["#6366f1", "#4f46e5"], "🩻"],
  HOSPITAL: [["#0ea5e9", "#0369a1"], "🏥"],
};
function iconFor(typeKey, specialty) {
  if (ICON_BY_TYPE[typeKey]) return ICON_BY_TYPE[typeKey];
  const sp = norm(specialty);
  const hit = ICON_BY_SPECIALTY.find(([k]) => sp.includes(k));
  return hit ? [hit[1], hit[2]] : [["#3b82f6", "#1e40af"], "🩺"];
}

export function providerUrl(p) {
  return `provider.html?id=${encodeURIComponent(p.id)}`;
}

export function providerCard(p, opts = {}) {
  const type = PROVIDER_TYPES[normalizeType(p.provider_type || p.type)];
  const url = providerUrl(p);
  const [grad, emoji] = iconFor(normalizeType(p.provider_type || p.type), p.specialty_name || p.specialty);
  const avatar = `<div class="doc-avatar" style="background:linear-gradient(135deg,${grad[0]},${grad[1]})" aria-hidden="true">${emoji}</div>`;
  const whatsappLink = whatsapp.providerInquiryLink ? whatsapp.providerInquiryLink(p.name_ar) : (p.phone ? `https://wa.me/2${p.phone.replace(/\D/g,'')}` : '#');
  const spec = p.specialty_name || '';
  const area = p.area_name || '';
  const price = p.price || p.consultation_price;

  return `
  <article class="doc-card" data-id="${esc(p.id)}">
    <div class="doc-card__head">
      <div class="doc-card__meta">
        <div class="doc-type">${esc(type.label)}${(p.badge || p.is_featured) ? ` <span class="dot">·</span> <span class="badge-featured">${esc(p.badge || 'مميز')}</span>` : ''}</div>
        <h3 class="doc-name"><a href="${url}">${esc(p.name_ar)}</a></h3>
        <div class="doc-sub">
          ${spec ? `<span><i class="fa-solid fa-stethoscope"></i> ${esc(spec)}</span>` : ''}
          ${area ? `<span><i class="fa-solid fa-location-dot"></i> ${esc(area)}</span>` : ''}
        </div>
        ${price ? `<div class="doc-price">سعر الكشف: <b>${esc(price)} ج.م</b></div>` : ''}
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