// providers من js/data/catalog.js - متوافق مع search.js + provider.html
import { loadCatalog, getProviders } from './supabase.js';
export { norm } from '../lib/match.js';

/** مميزون متنوعين: دكتور / معمل / دكتور / صيدلية / أشعة / دكتور ... كل دكتور من تخصص مختلف */
function diverseFeatured(DATA, limit) {
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
  all: async () => (await loadCatalog()).providers,

  get: async (id) => {
    if (!id) return null;
    const low = String(id).toLowerCase();
    const { providers: DATA } = await loadCatalog();
    return DATA.find((p) => p.id.toLowerCase() === low || p.uuid === id) || null;
  },

  featured: async (limit = 20) => {
    const { providers: DATA } = await loadCatalog();
    return limit <= 12 ? diverseFeatured(DATA, limit) : DATA.slice(0, limit);
  },

  /** كل النتائج بدون pagination (للعروض وغيرها) */
  list: (filters = {}) => getProviders(filters),

  search: async ({ q, specialtyId, specialty, areaId, area, type, page = 1 } = {}) => {
    const filtered = await getProviders({ q, specialtyId, specialty, areaId, area, type });
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
