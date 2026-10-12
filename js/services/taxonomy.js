// taxonomy: التخصصات من Supabase (جدول specialties) مع fallback محلي - بدون تكرار
import { loadCatalog } from './supabase.js';

const FALLBACK_AREAS = ['كفر الشيخ', 'بيلا', 'الحامول', 'بلطيم', 'دسوق'];

const SERVICES = [
  { id: 'كشف', name_ar: 'كشف' },
  { id: 'استشارة', name_ar: 'استشارة' },
];

async function specialties() {
  const { specialties: list } = await loadCatalog();
  const seen = new Set();
  return list.filter((s) => (seen.has(s.name_ar) ? false : seen.add(s.name_ar)));
}

async function areas() {
  const { areas: fromData, providers } = await loadCatalog();
  const names = fromData || [...new Set([...FALLBACK_AREAS, ...providers.map((p) => p.area_name).filter(Boolean)])];
  return names.map((n) => ({ id: n, name_ar: n, city_id: 'kfs' }));
}

export const taxonomy = {
  specialties,
  areas,
  services: async () => SERVICES,
};

export { specialties, areas };
export const services = taxonomy.services;

/** رابط البحث للتصنيف: الأطباء بالتخصص، والباقي بنوع مقدم الخدمة */
export function categoryHref(s) {
  return s.provider_type && s.provider_type !== 'DOCTOR'
    ? `search.html?type=${encodeURIComponent(s.provider_type)}`
    : `search.html?specialty=${encodeURIComponent(s.id)}`;
}
