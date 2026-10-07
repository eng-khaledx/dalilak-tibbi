/** Admin data layer — full CRUD on all tables + audit logging. */
import { api } from '../lib/api.js';
import { uid, normalizeArabic, slugify } from '../lib/utils.js';
import { buildSearchText } from '../services/providers.js';
import { taxonomy } from '../services/taxonomy.js';
import { providers } from '../services/providers.js';
import { offers } from '../services/offers.js';
import { auth } from './auth.js';

async function audit(action, entity, entityId, details = '') {
  try {
    await api.create('audit_logs', { id: uid('log'), actor: auth.actor(), action, entity, entity_id: entityId, details: String(details).slice(0, 500) });
  } catch (_) { /* audit failure must not block ops */ }
}

function invalidateAll() { taxonomy.invalidate(); providers.invalidate(); offers.invalidate(); }

export const adminData = {
  /* ---------- Leads ---------- */
  leads: {
    all: () => api.listAll('leads'),
    async setStatus(id, status) {
      const r = await api.patch('leads', id, { status });
      audit('UPDATE_STATUS', 'lead', id, status);
      return r;
    },
  },

  /* ---------- Providers ---------- */
  providers: {
    all: () => api.listAll('providers'),
    async save(input, existingId) {
      const data = { ...input };
      data.name_ar = String(data.name_ar || '').trim();
      if (!data.name_ar) throw new Error('اسم مقدم الخدمة مطلوب.');
      data.slug = slugify(data.slug || data.name_ar) || uid('p');
      data.service_ids = Array.isArray(data.service_ids) ? data.service_ids : [];
      data.service_names = Array.isArray(data.service_names) ? data.service_names : [];
      data.consultation_price = data.consultation_price === '' || data.consultation_price === null ? null : Number(data.consultation_price);
      data.is_active = !!data.is_active;
      data.is_featured = !!data.is_featured;
      data.search_text = buildSearchText(data);
      let res;
      if (existingId) {
        res = await api.update('providers', existingId, { id: existingId, ...data });
        audit('UPDATE', 'provider', existingId, data.name_ar);
      } else {
        res = await api.create('providers', { id: uid('prov'), ...data });
        audit('CREATE', 'provider', res.id, data.name_ar);
      }
      invalidateAll();
      return res;
    },
    async toggle(id, field, value) {
      const r = await api.patch('providers', id, { [field]: value });
      audit('TOGGLE', 'provider', id, `${field}=${value}`);
      invalidateAll();
      return r;
    },
    async remove(id) {
      await api.remove('providers', id);
      audit('DELETE', 'provider', id);
      invalidateAll();
    },
  },

  /* ---------- Offers ---------- */
  offers: {
    all: () => api.listAll('offers'),
    async save(input, existingId) {
      const data = { ...input };
      data.title = String(data.title || '').trim();
      if (!data.title) throw new Error('عنوان العرض مطلوب.');
      if (!data.provider_id) throw new Error('اختر مقدم الخدمة.');
      data.price_before = data.price_before === '' ? null : Number(data.price_before);
      data.price_after = data.price_after === '' ? null : Number(data.price_after);
      data.ends_at = data.ends_at ? new Date(data.ends_at).toISOString() : null;
      data.is_active = !!data.is_active;
      let res;
      if (existingId) { res = await api.update('offers', existingId, { id: existingId, ...data }); audit('UPDATE', 'offer', existingId, data.title); }
      else { res = await api.create('offers', { id: uid('offer'), ...data }); audit('CREATE', 'offer', res.id, data.title); }
      invalidateAll();
      return res;
    },
    async toggle(id, value) { const r = await api.patch('offers', id, { is_active: value }); audit('TOGGLE', 'offer', id, `is_active=${value}`); invalidateAll(); return r; },
    async remove(id) { await api.remove('offers', id); audit('DELETE', 'offer', id); invalidateAll(); },
  },

  /* ---------- Taxonomy (specialties / services / areas) ---------- */
  taxonomy(table) {
    const prefix = { specialties: 'sp', services: 'sv', areas: 'area' }[table] || 'tx';
    return {
      all: () => api.listAll(table),
      async save(input, existingId) {
        const data = { ...input };
        data.name_ar = String(data.name_ar || '').trim();
        if (!data.name_ar) throw new Error('الاسم مطلوب.');
        data.slug = slugify(data.slug || data.name_ar);
        data.sort_order = Number(data.sort_order) || 99;
        data.is_active = !!data.is_active;
        let res;
        if (existingId) { res = await api.update(table, existingId, { id: existingId, ...data }); audit('UPDATE', table, existingId, data.name_ar); }
        else { res = await api.create(table, { id: uid(prefix), ...data }); audit('CREATE', table, res.id, data.name_ar); }
        invalidateAll();
        return res;
      },
      async toggle(id, value) { const r = await api.patch(table, id, { is_active: value }); audit('TOGGLE', table, id, `is_active=${value}`); invalidateAll(); return r; },
      async remove(id) { await api.remove(table, id); audit('DELETE', table, id); invalidateAll(); },
    };
  },

  cities: () => api.listAll('cities'),
  audit: () => api.listAll('audit_logs'),
  normalize: normalizeArabic,
};
