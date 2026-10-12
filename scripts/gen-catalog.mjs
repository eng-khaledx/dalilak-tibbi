// Single source of truth for sample catalog data.
// Run: node scripts/gen-catalog.mjs  -> writes js/data/catalog.js + supabase/migrations/20261011000000_seed_catalog.sql
import { writeFileSync, mkdirSync } from 'node:fs';

const AREAS = ['كفر الشيخ', 'بيلا', 'الحامول', 'بلطيم', 'دسوق'];
const STREETS = ['شارع الجيش', 'شارع البحر', 'شارع الجمهورية', 'شارع المحطة', 'شارع النيل', 'ميدان الساعة'];

const SPECS = [
  ['cardiology', 'قلب', 'fa-heart-pulse'],
  ['pediatrics', 'أطفال', 'fa-baby'],
  ['orthopedics', 'عظام', 'fa-bone'],
  ['obgyn', 'نساء وتوليد', 'fa-person-pregnant'],
  ['dermatology', 'جلدية', 'fa-spa'],
  ['ent', 'أنف وأذن وحنجرة', 'fa-ear-listen'],
  ['ophthalmology', 'رمد', 'fa-eye'],
  ['dental', 'أسنان', 'fa-tooth'],
  ['neurology', 'مخ وأعصاب', 'fa-brain'],
  ['internal', 'باطنة', 'fa-stethoscope'],
  ['urology', 'مسالك بولية', 'fa-droplet'],
  ['psychiatry', 'نفسية وعصبية', 'fa-comments'],
  ['general-surgery', 'جراحة عامة', 'fa-syringe'],
  ['nutrition-physio', 'تغذية وعلاج طبيعي', 'fa-apple-whole'],
  ['oncology', 'أورام', 'fa-ribbon'],
  ['allergy-immunology', 'حساسية ومناعة', 'fa-wind'],
].map(([slug, name, icon]) => ({ slug, name, icon, jsType: 'DOCTOR', dbType: 'doctor' }));

const TYPE_CATS = [
  ['labs', 'معامل تحاليل', 'fa-vial', 'LAB', 'lab'],
  ['radiology', 'مراكز أشعة', 'fa-x-ray', 'RADIOLOGY_CENTER', 'radiology'],
  ['pharmacies', 'صيدليات', 'fa-prescription-bottle-medical', 'PHARMACY', 'pharmacy'],
  ['hospitals', 'مستشفيات', 'fa-hospital', 'HOSPITAL', 'hospital'],
  ['cosmetic', 'مراكز تجميل', 'fa-wand-magic-sparkles', 'MEDICAL_CENTER', 'clinic'],
].map(([slug, name, icon, jsType, dbType]) => ({ slug, name, icon, jsType, dbType }));

const CATS = [...SPECS, ...TYPE_CATS];
const cat = (slug) => CATS.find((c) => c.slug === slug);

const FIRST = ['أحمد', 'محمد', 'محمود', 'خالد', 'عمرو', 'طارق', 'هاني', 'سامح', 'وائل', 'ياسر', 'مصطفى', 'إبراهيم', 'نورا', 'منى', 'هالة', 'سارة', 'دعاء', 'رانيا', 'أمل', 'ريم', 'هبة', 'داليا', 'شيرين', 'مروة'];
const LAST = ['السيد', 'منصور', 'الشناوي', 'عبد الله', 'البحيري', 'الدسوقي', 'فرج', 'حجازي', 'النجار', 'الجمال', 'سليمان', 'عطية', 'الصاوي', 'غنيم', 'عيسى', 'خليل', 'زيدان', 'الحداد', 'رمضان', 'مرسي', 'الفقي', 'عامر', 'شلبي', 'بكر'];

const providers = [];
let phoneN = 0;
const phone = () => '010' + String(20000000 + ((++phoneN) * 137911) % 80000000).padStart(8, '0');
const avatar = (name) =>
  'https://ui-avatars.com/api/?name=' + encodeURIComponent(name.replace(/^د\.\s*/, '')) + '&background=0ea5e9&color=fff&size=112&bold=true';

const add = (p) => {
  const i = providers.length;
  const area = AREAS[i % AREAS.length];
  const ph = phone();
  providers.push({
    area,
    address: area + ' - ' + STREETS[i % STREETS.length],
    phone: ph,
    whatsapp: ph,
    rating_avg: +(4.2 + ((i * 7) % 8) / 10).toFixed(1),
    rating_count: 20 + ((i * 53) % 180),
    image_url: avatar(p.name),
    is_featured: false,
    ...p,
  });
};

let d = 0;
SPECS.forEach((s) => {
  for (let k = 0; k < 3; k++, d++) {
    add({
      id: 'dr-' + s.slug + '-' + (k + 1),
      name: 'د. ' + FIRST[d % 24] + ' ' + LAST[(d * 5 + k + Math.floor(d / 24) * 3) % 24],
      catSlug: s.slug,
      price: 250 + ((d * 50) % 200),
      is_featured: k === 0,
    });
  }
});

const labs = ['معمل البرج للتحاليل', 'المختبر للتحاليل الطبية', 'معمل ألفا', 'معامل كفر الشيخ'];
const rads = ['مركز النيل للأشعة', 'مركز كفر الشيخ للأشعة', 'تكنو سكان'];
const pharms = ['صيدلية النجار', 'صيدلية الشفاء', 'صيدلية د. أحمد', 'صيدلية العزبي'];
const hosps = ['مستشفى الحياة التخصصي', 'مستشفى النور'];
const cosm = ['مركز لمسة للتجميل', 'مركز بيوتي كير'];
labs.forEach((n, k) => add({ id: 'lab-' + (k + 1), name: n, catSlug: 'labs', specialty_name: 'تحاليل طبية', is_featured: k < 2 }));
rads.forEach((n, k) => add({ id: 'rad-' + (k + 1), name: n, catSlug: 'radiology', specialty_name: 'أشعة', is_featured: k < 2 }));
pharms.forEach((n, k) => add({ id: 'pharm-' + (k + 1), name: n, catSlug: 'pharmacies', specialty_name: 'صيدلية عامة', is_featured: k < 2 }));
hosps.forEach((n, k) => add({ id: 'hosp-' + (k + 1), name: n, catSlug: 'hospitals', specialty_name: 'مستشفى خاص', is_featured: k === 0 }));
cosm.forEach((n, k) => add({ id: 'cosm-' + (k + 1), name: n, catSlug: 'cosmetic', specialty_name: 'تجميل', is_featured: k === 0 }));

// Legacy ids still referenced by offers (js/services/offers.js, js/pages/offers.js)
add({ id: 'dr-noura-sayed', name: 'د. نورا السيد', catSlug: 'dermatology', price: 300, is_featured: false });
add({ id: 'dr-sara-ali', name: 'د. سارة علي', catSlug: 'pediatrics', price: 300, area: 'دسوق', address: 'دسوق - شارع الجيش', is_featured: false });
add({ id: 'dr-ahmed-mansour', name: 'د. أحمد منصور', catSlug: 'cardiology', price: 350, is_featured: false });

/* ---------- JS catalog ---------- */
const jsSpecs = CATS.map((c) => ({ id: c.name, slug: c.slug, name_ar: c.name, icon: c.icon, provider_type: c.jsType }));
const jsProviders = providers.map((p) => {
  const c = cat(p.catSlug);
  const sn = p.specialty_name || c.name;
  return {
    id: p.id, slug: p.id, name_ar: p.name, type: c.jsType,
    specialty: sn, specialty_name: sn, specialty_id: c.name,
    area: p.area, area_name: p.area, area_id: p.area, address: p.address,
    phone: p.phone, whatsapp: p.whatsapp, rating_avg: p.rating_avg, rating_count: p.rating_count,
    consultation_price: p.price ?? null, image_url: p.image_url, is_featured: p.is_featured,
    active: true, verified: true,
  };
});
mkdirSync('js/data', { recursive: true });
writeFileSync(
  'js/data/catalog.js',
  '// GENERATED by scripts/gen-catalog.mjs - sample data (fictional names/phones). Do not edit by hand.\n' +
    'export const AREAS = ' + JSON.stringify(AREAS) + ';\n' +
    'export const SPECIALTIES = ' + JSON.stringify(jsSpecs, null, 1) + ';\n' +
    'export const PROVIDERS = ' + JSON.stringify(jsProviders, null, 1) + ';\n'
);

/* ---------- SQL ---------- */
const q = (v) => {
  if (v == null) return 'null';
  if (typeof v === 'number') return String(v);
  return "'" + String(v).split("'").join("''") + "'";
};
const specRows = CATS.map((c, i) => '  (' + [q(c.slug), q(c.name), q(c.icon), q(c.dbType), i + 1].join(', ') + ')').join(',\n');
const provRows = providers.map((p) => {
  const c = cat(p.catSlug);
  const vals = [
    q(c.dbType), q(p.specialty_name || c.name), q(c.slug), q(p.name), q('كفر الشيخ'), q(p.area), q(p.address),
    q(p.phone), q(p.whatsapp), q(p.price ?? null), p.is_featured ? 'true' : 'false', q(p.image_url),
    q(p.rating_avg), q(p.rating_count), 'true', 'true',
  ];
  return '  (' + vals.join(', ') + ')';
}).join(',\n');

const sql = `-- Seed: specialties/categories + sample providers (fictional names and phone numbers).
-- GENERATED by scripts/gen-catalog.mjs. Idempotent: re-running does not duplicate rows.
-- Must run after add_all_types.sql (which creates public.providers).

create table if not exists public.specialties (
  id            text primary key,
  name_ar       text not null unique,
  icon          text,
  provider_type text not null default 'doctor',
  sort_order    int  not null default 0
);

alter table public.providers add column if not exists active       boolean not null default true;
alter table public.providers add column if not exists verified     boolean not null default false;
alter table public.providers add column if not exists specialty_id text references public.specialties(id);
alter table public.providers add column if not exists rating_avg   numeric;
alter table public.providers add column if not exists rating_count int;
create unique index if not exists providers_name_area_uidx on public.providers (name, area);

insert into public.specialties (id, name_ar, icon, provider_type, sort_order) values
${specRows}
on conflict (id) do update set name_ar = excluded.name_ar, icon = excluded.icon,
  provider_type = excluded.provider_type, sort_order = excluded.sort_order;

insert into public.providers
  (type, specialty, specialty_id, name, city, area, address, phone, whatsapp, price, is_featured, image_url, rating_avg, rating_count, active, verified) values
${provRows}
on conflict (name, area) do nothing;
`;
writeFileSync('supabase/migrations/20261011000000_seed_catalog.sql', sql);
console.log(CATS.length + ' categories, ' + providers.length + ' providers');
