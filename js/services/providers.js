// providers من js/data/catalog.js - متوافق مع search.js + provider.html
import { PROVIDERS } from '../data/catalog.js';

const DATA = PROVIDERS.filter((p) => p.active && p.verified);

const SPEC_ALIASES = {
  skin: 'جلدية', derma: 'جلدية', dermatology: 'جلدية', 'جلديه': 'جلدية',
  cardio: 'قلب', heart: 'قلب', cardiology: 'قلب',
  pediatric: 'أطفال', pediatrics: 'أطفال', children: 'أطفال', 'اطفال': 'أطفال',
  bones: 'عظام', ortho: 'عظام',
};

function matches(p, { q, specialtyId, specialty, areaId, area, type }) {
  let s = String(specialtyId || specialty || '').trim().toLowerCase();
  s = (SPEC_ALIASES[s] || s).toLowerCase();
  const a = String(areaId || area || '').trim().toLowerCase();
  const qq = String(q || '').trim().toLowerCase();

  if (type && p.type !== type) return false;
  if (s && s !== 'all') {
    const spec = `${p.specialty_id} ${p.specialty_name}`.toLowerCase();
    if (p.specialty_id.toLowerCase() !== s && !spec.includes(s)) return false;
  }
  if (a && !(p.area_name || '').toLowerCase().includes(a)) return false;
  if (qq) {
    const hay = `${p.name_ar} ${p.specialty_name} ${p.area_name} ${p.address}`.toLowerCase();
    if (!hay.includes(qq)) return false;
  }
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
