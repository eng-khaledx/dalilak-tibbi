import { TYPE_ALIASES } from './config.js';

const SPEC_ALIASES = {
  skin: 'جلدية', derma: 'جلدية', dermatology: 'جلدية',
  cardio: 'قلب', heart: 'قلب', cardiology: 'قلب',
  pediatric: 'أطفال', pediatrics: 'أطفال', children: 'أطفال',
  bones: 'عظام', ortho: 'عظام',
};

/** توحيد النص العربي للمقارنة: بدون همزات/تشكيل، ي=ى، ه=ة، lowercase */
export function norm(v) {
  return String(v ?? '')
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function typeKey(t) {
  if (!t) return '';
  return TYPE_ALIASES[String(t).toLowerCase()] || String(t).toUpperCase();
}

/** فلتر موحّد (نفس النتيجة سواء من Supabase أو الـ fallback) */
export function matches(p, { q, specialtyId, specialty, areaId, area, type } = {}) {
  const raw = String(specialtyId || specialty || '').trim();
  const s = norm(SPEC_ALIASES[raw.toLowerCase()] || raw);
  const a = norm(areaId || area);
  const qq = norm(q);

  if (type && p.type !== typeKey(type)) return false;
  if (s && s !== 'all' && !norm(`${p.specialty_id} ${p.specialty_name}`).includes(s)) return false;
  if (a && !norm(p.area_name).includes(a)) return false;
  if (qq && !norm(`${p.name_ar} ${p.specialty_name} ${p.area_name} ${p.address}`).includes(qq)) return false;
  return true;
}
