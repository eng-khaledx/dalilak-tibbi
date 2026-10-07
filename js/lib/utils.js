/** Generic helpers shared across features. */

/** Escape user/DB text before inserting into HTML strings. */
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Normalise Arabic text for tolerant searching. */
export function normalizeArabic(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '') // tashkeel + tatweel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Convert Arabic-Indic digits to Latin digits and strip non-digits/plus. */
export function normalizePhone(input = '') {
  const map = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
  return String(input).replace(/[٠-٩]/g, (d) => map[d]).replace(/[^\d+]/g, '');
}

/** Egyptian mobile validation: 010/011/012/015 + 8 digits (optionally +20 / 0020). */
export function isValidEgyptianMobile(input) {
  let p = normalizePhone(input);
  if (p.startsWith('+20')) p = '0' + p.slice(3);
  else if (p.startsWith('0020')) p = '0' + p.slice(4);
  else if (p.startsWith('20') && p.length === 12) p = '0' + p.slice(2);
  return /^01[0125]\d{8}$/.test(p);
}

/** Return the canonical local format 01xxxxxxxxx */
export function toLocalPhone(input) {
  let p = normalizePhone(input);
  if (p.startsWith('+20')) p = '0' + p.slice(3);
  else if (p.startsWith('0020')) p = '0' + p.slice(4);
  else if (p.startsWith('20') && p.length === 12) p = '0' + p.slice(2);
  return p;
}

/** 01xxxxxxxxx -> 201xxxxxxxxx for wa.me */
export function toInternationalDigits(input) {
  const local = toLocalPhone(input);
  return local.startsWith('0') ? `20${local.slice(1)}` : local;
}

export function slugify(str = '') {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function uid(prefix = '') {
  const rand = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}-${rand}` : rand;
}

export function formatPrice(n) {
  if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) return '';
  return `${Number(n).toLocaleString('ar-EG')} ج.م`;
}

export function formatDate(ts) {
  if (!ts) return '';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDateOnly(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-EG', { dateStyle: 'medium' });
}

export function qs(name, search = window.location.search) {
  return new URLSearchParams(search).get(name) || '';
}

export function debounce(fn, wait = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

export function truncate(str = '', n = 120) {
  const s = String(str);
  return s.length > n ? `${s.slice(0, n).trim()}…` : s;
}

/** Client-side rate limiter using localStorage (anti-spam helper). */
export function checkRateLimit(key, { minGapSec, maxPerHour }) {
  const now = Date.now();
  let log = [];
  try { log = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { log = []; }
  log = log.filter((t) => now - t < 3600_000);
  if (log.length && now - log[log.length - 1] < minGapSec * 1000) {
    return { ok: false, reason: 'too_soon', waitSec: Math.ceil((minGapSec * 1000 - (now - log[log.length - 1])) / 1000) };
  }
  if (log.length >= maxPerHour) return { ok: false, reason: 'too_many' };
  return { ok: true, commit() { log.push(now); try { localStorage.setItem(key, JSON.stringify(log)); } catch (_) { /* ignore */ } } };
}
