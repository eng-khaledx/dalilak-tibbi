// providers من js/data/catalog.js - متوافق مع search.js + provider.html
import { PROVIDERS } from '../data/catalog.js';
import { TYPE_ALIASES } from '../lib/config.js';

const DATA = PROVIDERS.filter((p) => p.active && p.verified);

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

function matches(p, { q, specialtyId, specialty, areaId, area, type }) {
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

/** مميزون متنوعين: دكتور / معمل / دكتور / صيدلية / أشعة / دكتور ... كل دكتور من تخصص مختلف */
function diverseFeatured(limit) {
  const pool = DATA.filter((p) => p.is_featured);
  const byType = {};
  pool.forEach((p) => { (byType[p.type] = byType[p.type] || []).push(p); });
  const usedSpecs = new Set();
  const pattern = ['DOCTOR', 'LAB', 'DOCTOR', 'PHARMACY', 'RADIOLOGY_CENTER', 'DOCTOR', 'HOSPITAL', 'DOCTOR', 'MEDICAL_CENTER'];
  const out = [];
  for (let i = 0; out.length < limit && i < limit * 4; i++) {
    const t = pattern[i % pattern.length];
    const list = byType[t] || [];
    const idx = list.findIndex((p) => t !== 'DOCTOR' || !usedSpecs.has(p.specialty_id));
    if (idx === -1) continue;
    const [p] = list.splice(idx, 1);
    usedSpecs.add(p.specialty_id);
    out.push(p);
  }
  return out;
}

export const providers = {
  all: async () => DATA,

  get: async (id) => {
    if (!id) return null;
    const low = String(id).toLowerCase();
    return DATA.find((p) => p.id.toLowerCase() === low || p.slug.toLowerCase() === low) || null;
  },

  featured: async (limit = 20) => (limit <= 12 ? diverseFeatured(limit) : DATA.slice(0, limit)),

  /** كل النتائج بدون pagination (للعروض وغيرها) */
  list: async (filters = {}) => DATA.filter((p) => matches(p, filters)),

  search: async ({ q, specialtyId, specialty, areaId, area, type, page = 1 } = {}) => {
    const filtered = DATA.filter((p) => matches(p, { q, specialtyId, specialty, areaId, area, type }));
    const total = filtered.length;
    const pageSize = 12;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), pages);
    const start = (currentPage - 1) * pageSize;
    return { items: filtered.slice(start, start + pageSize), total, pages, page: currentPage };
  },

  // عشان search.js بيناديها
  withOfferFlags: async () => {},
};
