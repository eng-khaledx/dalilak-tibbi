// taxonomy من js/data/catalog.js (مولّد من scripts/gen-catalog.mjs) - بدون تكرار
import { SPECIALTIES, AREAS as AREA_NAMES } from '../data/catalog.js';

// dedupe by name_ar (أي id تاني بنفس الاسم يتشال)
const seen = new Set();
const UNIQUE_SPECIALTIES = SPECIALTIES.filter((s) => (seen.has(s.name_ar) ? false : seen.add(s.name_ar)));

const AREAS = AREA_NAMES.map((n) => ({ id: n, name_ar: n, city_id: 'kfs' }));

const SERVICES = [
  { id: 'كشف', name_ar: 'كشف' },
  { id: 'استشارة', name_ar: 'استشارة' },
];

export const taxonomy = {
  specialties: async () => UNIQUE_SPECIALTIES,
  areas: async () => AREAS,
  services: async () => SERVICES,
  listSpecialties: () => UNIQUE_SPECIALTIES,
  listAreas: () => AREAS,
  listServices: () => SERVICES,
};

export const specialties = taxonomy.specialties;
export const areas = taxonomy.areas;
export const services = taxonomy.services;

/** رابط البحث للتصنيف: الأطباء بالتخصص، والباقي بنوع مقدم الخدمة */
export function categoryHref(s) {
  return s.provider_type && s.provider_type !== 'DOCTOR'
    ? `search.html?type=${encodeURIComponent(s.provider_type)}`
    : `search.html?specialty=${encodeURIComponent(s.id)}`;
}
