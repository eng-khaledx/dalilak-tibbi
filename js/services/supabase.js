/**
 * Single data entry point. Reads providers/specialties from Supabase and falls
 * back to the bundled js/data/catalog.js if Supabase is not configured, is
 * unreachable, times out, or returns no rows - so the site never goes blank.
 */
import { CONFIG, normalizeType } from '../lib/config.js';
import { matches } from '../lib/match.js';

const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

let clientPromise = null;
/** Lazy client: the library is only downloaded when credentials are configured. */
export function getSupabase() {
  const { url, anonKey } = CONFIG.supabase || {};
  if (!url || !anonKey) return Promise.resolve(null);
  clientPromise ||= import(SUPABASE_ESM).then(({ createClient }) => createClient(url, anonKey));
  return clientPromise;
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('Supabase timeout')), ms))]);
}

function mapSpecialty(r) {
  return { id: r.name_ar, slug: r.id, name_ar: r.name_ar, icon: r.icon, provider_type: normalizeType(r.provider_type) };
}

function mapProvider(r, specBySlug) {
  const spec = specBySlug[r.specialty_id];
  const id = r.slug || r.id;
  return {
    id, slug: id, uuid: r.id,
    name_ar: r.name, type: normalizeType(r.type),
    specialty: r.specialty, specialty_name: r.specialty || spec?.name_ar || '',
    specialty_id: spec?.name_ar || r.specialty || '',
    area: r.area, area_name: r.area, area_id: r.area, address: r.address || '',
    phone: r.phone, whatsapp: r.whatsapp || r.phone,
    rating_avg: r.rating_avg, rating_count: r.rating_count,
    consultation_price: r.price, image_url: r.image_url,
    is_featured: !!r.is_featured, active: r.active !== false, verified: !!r.verified,
  };
}

async function fromSupabase() {
  const sb = await getSupabase();
  if (!sb) throw new Error('Supabase not configured');
  const [provs, specs] = await Promise.all([
    sb.from('providers').select('*').eq('active', true).eq('verified', true).order('created_at').limit(1000),
    sb.from('specialties').select('*').order('sort_order'),
  ]);
  if (provs.error) throw provs.error;
  if (specs.error) throw specs.error;
  if (!provs.data?.length) throw new Error('Supabase returned no providers');
  const specialties = (specs.data || []).map(mapSpecialty);
  const bySlug = Object.fromEntries(specialties.map((s) => [s.slug, s]));
  return { source: 'supabase', providers: provs.data.map((r) => mapProvider(r, bySlug)), specialties, areas: null };
}

async function fromFallback() {
  const m = await import('../data/catalog.js');
  return { source: 'fallback', providers: m.PROVIDERS.filter((p) => p.active && p.verified), specialties: m.SPECIALTIES, areas: m.AREAS };
}

let cache = null;
/** Loaded once per page; resolves to { source, providers, specialties, areas } */
export function loadCatalog() {
  cache ||= withTimeout(fromSupabase(), CONFIG.supabase?.timeoutMs || 6000).catch((err) => {
    if (CONFIG.supabase?.url) console.warn('[supabase] falling back to local data:', err.message || err);
    return fromFallback();
  });
  return cache;
}

/** getProviders({ specialty, type, area, q }) -> all matching providers (no pagination). */
export async function getProviders(filters = {}) {
  const { providers } = await loadCatalog();
  return providers.filter((p) => matches(p, filters));
}

export async function getSpecialties() {
  return (await loadCatalog()).specialties;
}
