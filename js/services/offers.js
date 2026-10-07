/** Offers — database driven only. Expired or inactive offers are hidden. */
import { api, cached, invalidateCache } from '../lib/api.js';

const TTL = 2 * 60 * 1000;

function isLive(o) {
  if (!o || o.deleted || o.is_active === false) return false;
  if (o.ends_at) {
    const end = new Date(o.ends_at).getTime();
    if (!Number.isNaN(end) && end < Date.now()) return false;
  }
  return true;
}

export const offers = {
  invalidate() { invalidateCache('offers'); },

  async active() {
    return cached('offers:active', TTL, async () => {
      const rows = await api.listAll('offers');
      return rows.filter(isLive);
    });
  },

  async forProvider(providerId) {
    const all = await this.active();
    return all.filter((o) => o.provider_id === providerId);
  },
};
