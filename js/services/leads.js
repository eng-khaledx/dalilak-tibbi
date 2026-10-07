/**
 * Lead pipeline:  validate → save to DB → notify Telegram (best effort).
 * A lead is never lost because a notification failed.
 */
import { api } from '../lib/api.js';
import { CONFIG } from '../lib/config.js';
import { uid, isValidEgyptianMobile, toLocalPhone, normalizeArabic, checkRateLimit } from '../lib/utils.js';
import { telegram } from './notifications/telegram.js';

const MAX = { name: 80, service: 120, provider: 120, notes: 600 };

function clean(v, max) {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Returns { ok, errors:{field:msg}, data } */
export function validateLead(input) {
  const errors = {};
  const data = {
    name: clean(input.name, MAX.name),
    phone: toLocalPhone(input.phone || ''),
    service: clean(input.service, MAX.service),
    provider_id: clean(input.provider_id, 80),
    provider_name: clean(input.provider_name, MAX.provider),
    area_id: clean(input.area_id, 80),
    area_name: clean(input.area_name, 80),
    notes: clean(input.notes, MAX.notes),
    lead_type: input.lead_type === 'PROVIDER' ? 'PROVIDER' : 'PATIENT',
    source: clean(input.source, 80) || 'website',
  };

  if (data.name.length < 2) errors.name = 'من فضلك أدخل الاسم.';
  if (!isValidEgyptianMobile(data.phone)) errors.phone = 'أدخل رقم موبايل مصري صحيح (مثال: 01xxxxxxxxx).';
  if (data.lead_type === 'PATIENT' && !data.service && !data.provider_name) {
    errors.service = 'اختر الخدمة أو التخصص المطلوب.';
  }
  if (data.lead_type === 'PROVIDER' && !data.service) errors.service = 'اختر نوع الخدمة التي تقدمها.';
  // Honeypot
  if (input.website) errors._spam = 'spam';

  return { ok: Object.keys(errors).length === 0, errors, data };
}

export const leads = {
  /**
   * Submit a lead. Resolves { ok, lead, notified } or { ok:false, errors }.
   */
  async submit(input) {
    const v = validateLead(input);
    if (!v.ok) return { ok: false, errors: v.errors };

    const rl = checkRateLimit('dlk:lead-rl', {
      minGapSec: CONFIG.leads.minSecondsBetweenSubmissions,
      maxPerHour: CONFIG.leads.maxPerHour,
    });
    if (!rl.ok) {
      const msg = rl.reason === 'too_soon'
        ? `تم إرسال طلب قبل قليل. يمكنك المحاولة بعد ${rl.waitSec} ثانية.`
        : 'تم الوصول للحد الأقصى من الطلبات مؤقتًا. تواصل معنا عبر واتساب.';
      return { ok: false, errors: { _form: msg } };
    }

    const record = {
      id: uid('lead'),
      ...v.data,
      status: 'NEW',
      page_url: window.location.href.slice(0, 300),
      notified_telegram: false,
      search_text: normalizeArabic([v.data.name, v.data.phone, v.data.service, v.data.provider_name, v.data.area_name].join(' ')),
    };

    // 1) Save FIRST
    const saved = await api.create('leads', record);
    rl.commit();

    // 2) Notify (best effort, never throws)
    const n = await telegram.notifyLead(saved);
    if (n.ok) {
      try { await api.patch('leads', saved.id, { notified_telegram: true }); } catch (_) { /* non-critical */ }
    }
    return { ok: true, lead: saved, notified: n.ok };
  },

  /* ---------- Admin ---------- */
  async all() {
    return api.listAll('leads', { limit: 200 });
  },
  async updateStatus(id, status) {
    return api.patch('leads', id, { status });
  },
};
