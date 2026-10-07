/**
 * Thin, safe wrapper around the RESTful Table API.
 * All database access flows through here — never fetch tables from UI code.
 */

const BASE = new URL('../../tables', import.meta.url).href;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.message || j.error || msg; } catch (_) { /* ignore */ }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

const enc = encodeURIComponent;

export const api = {
  /**
   * List records. Returns { data, total, page, limit }.
   * @param {string} table
   * @param {{page?:number, limit?:number, search?:string, sort?:string}} params
   */
  list(table, params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.sort) q.set('sort', params.sort);
    const qs = q.toString();
    return request(`${enc(table)}${qs ? `?${qs}` : ''}`);
  },

  /** Fetch every (non-deleted) row, paginating transparently. */
  async listAll(table, { limit = 200, sort } = {}) {
    const out = [];
    let page = 1;
    // hard cap to avoid runaway loops
    for (let i = 0; i < 25; i++) {
      const res = await this.list(table, { page, limit, sort });
      const rows = (res && res.data) || [];
      out.push(...rows.filter((r) => !r.deleted));
      if (rows.length < limit || out.length >= (res.total || 0)) break;
      page += 1;
    }
    return out;
  },

  get(table, id) {
    return request(`${enc(table)}/${enc(id)}`);
  },

  create(table, data) {
    return request(enc(table), { method: 'POST', body: JSON.stringify(data) });
  },

  update(table, id, data) {
    return request(`${enc(table)}/${enc(id)}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  put(table, id, data) {
    return this.update(table, id, data);
  },

  patch(table, id, data) {
    return request(`${enc(table)}/${enc(id)}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  remove(table, id) {
    return request(`${enc(table)}/${enc(id)}`, { method: 'DELETE' });
  },
};

/** Simple in-memory + sessionStorage cache for reference data (taxonomy). */
const memCache = new Map();
export async function cached(key, ttlMs, loader) {
  const now = Date.now();
  const hit = memCache.get(key);
  if (hit && hit.expires > now) return hit.value;
  try {
    const raw = sessionStorage.getItem(`dlk:${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expires > now) {
        memCache.set(key, parsed);
        return parsed.value;
      }
    }
  } catch (_) { /* storage unavailable */ }
  const value = await loader();
  const entry = { value, expires: now + ttlMs };
  memCache.set(key, entry);
  try { sessionStorage.setItem(`dlk:${key}`, JSON.stringify(entry)); } catch (_) { /* ignore */ }
  return value;
}

export function invalidateCache(prefix = '') {
  for (const k of [...memCache.keys()]) if (k.startsWith(prefix)) memCache.delete(k);
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(`dlk:${prefix}`)) sessionStorage.removeItem(k);
    }
  } catch (_) { /* ignore */ }
}
