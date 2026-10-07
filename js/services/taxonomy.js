/** Reference data: cities, areas, specialties, services. Cached per session. */
import { api, cached, invalidateCache } from '../lib/api.js';

const TTL = 10 * 60 * 1000;
const bySort = (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999);

export const taxonomy = {
  async cities() {
    return cached('cities', TTL, () => api.listAll('cities'));
  },
  async areas({ cityId, activeOnly = true } = {}) {
    const rows = await cached('areas', TTL, () => api.listAll('areas'));
    return rows
      .filter((a) => (!cityId || a.city_id === cityId) && (!activeOnly || a.is_active !== false))
      .sort(bySort);
  },
  async specialties({ activeOnly = true } = {}) {
    const rows = await cached('specialties', TTL, () => api.listAll('specialties'));
    return rows.filter((s) => !activeOnly || s.is_active !== false).sort(bySort);
  },
  async services({ activeOnly = true } = {}) {
    const rows = await cached('services', TTL, () => api.listAll('services'));
    return rows.filter((s) => !activeOnly || s.is_active !== false).sort(bySort);
  },
  async specialtyBySlug(slug) {
    const all = await this.specialties({ activeOnly: false });
    return all.find((s) => s.slug === slug) || null;
  },
  async areaBySlug(slug) {
    const all = await this.areas({ activeOnly: false });
    return all.find((a) => a.slug === slug) || null;
  },
  invalidate() { invalidateCache(''); },
};
