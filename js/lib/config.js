/**
 * Central site configuration — the ONLY place brand constants live.
 * Change the logo path, phone number, or integration endpoints here.
 */
export const CONFIG = Object.freeze({
  brand: {
    nameAr: 'دليلك الطبي بكفرالشيخ',
    nameShortAr: 'دليلك الطبي',
    nameSubAr: 'بكفرالشيخ',
    nameEn: 'Medical Guide Kafr El Sheikh',
    tagline: 'كل خدماتك الطبية في مكان واحد',
    /** Official logo supplied by the owner. Place the real file here. */
    logoPath: 'brand/logo.png',
  },

  contact: {
    /** Display format used in the UI */
    phoneDisplay: '01550111914',
    /** tel: link format */
    phoneTel: '+201550111914',
    /** WhatsApp international number, digits only */
    whatsappNumber: '201550111914',
    /**
     * Public Telegram username (without @). Leave empty to hide the
     * Telegram floating button — we never render a fake link.
     */
    telegramUsername: '',
  },

  /** Default city for this deployment. Architecture supports more cities. */
  defaultCity: {
    id: 'city-kafr-el-sheikh',
    slug: 'kafr-el-sheikh',
    nameAr: 'كفرالشيخ',
  },

  site: {
    /** Set to the production origin once known (used for canonical/OG). */
    baseUrl: '',
    defaultTitle: 'دليلك الطبي بكفرالشيخ | أطباء وخدمات طبية',
    defaultDescription:
      'ابحث عن الأطباء والعيادات والمراكز والصيدليات والمعامل والخدمات الطبية في كفرالشيخ.',
  },

  notifications: {
    telegram: {
      /**
       * A secure relay endpoint (e.g. Cloudflare Worker — see
       * /services/notifications/telegram/worker.example.js) that holds
       * TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID server-side.
       * The browser never sees the bot token.
       * Leave empty to disable notifications (leads are still saved).
       */
      webhookUrl: '',
      timeoutMs: 6000,
    },
  },

  leads: {
    /** Minimum seconds between two submissions from the same browser */
    minSecondsBetweenSubmissions: 60,
    /** Max submissions per browser per rolling hour */
    maxPerHour: 5,
  },

  search: {
    pageSize: 12,
    /** How many rows to pull from the table API per request */
    fetchLimit: 200,
  },
});

/**
 * Keys are the canonical values stored/queried across the app (search.js
 * `?type=DOCTOR`, admin forms). `specialties` feeds the filters and forms.
 * Lowercase aliases (see TYPE_ALIASES) are accepted for DB rows that use
 * `doctor | lab | radiology | pharmacy | hospital | clinic`.
 */
export const PROVIDER_TYPES = Object.freeze({
  DOCTOR: {
    label: 'طبيب', icon: 'fa-user-doctor', plural: 'أطباء',
    specialties: [
      'قلب وأوعية دموية', 'مخ وأعصاب', 'عظام ومفاصل', 'جلدية وتناسلية',
      'أطفال وحديثي الولادة', 'نساء وتوليد', 'أنف وأذن وحنجرة', 'عيون',
      'أسنان', 'جراحة عامة', 'جراحة تجميل', 'جراحة أوعية دموية',
      'مسالك بولية', 'صدر وحساسية', 'باطنة عامة', 'كلى',
      'كبد وجهاز هضمي', 'أورام', 'نفسية وعصبية', 'تخاطب',
      'علاج طبيعي وروماتيزم', 'تغذية علاجية', 'سمنة ونحافة',
      'ذكورة وعقم', 'حساسية ومناعة', 'روماتيزم', 'سكر وغدد صماء',
      'أوعية دموية', 'جراحة قلب وصدر', 'جراحة مخ وأعصاب',
    ],
  },
  DENTAL_CLINIC: { label: 'عيادة أسنان', icon: 'fa-tooth', plural: 'عيادات أسنان', specialties: [] },
  PHARMACY: {
    label: 'صيدلية', icon: 'fa-prescription-bottle-medical', plural: 'صيدليات',
    specialties: ['صيدلية عامة', 'صيدلية 24 ساعة', 'صيدلية توصيل'],
  },
  LAB: {
    label: 'معمل تحاليل', icon: 'fa-vial', plural: 'معامل تحاليل',
    specialties: ['تحاليل طبية', 'تحاليل كورونا', 'تحاليل وراثية'],
  },
  RADIOLOGY_CENTER: {
    label: 'مركز أشعة', icon: 'fa-x-ray', plural: 'مراكز أشعة',
    specialties: ['أشعة عادية', 'أشعة مقطعية', 'رنين مغناطيسي', 'سونار', 'ماموجرافي'],
  },
  MEDICAL_CENTER: {
    label: 'مركز طبي', icon: 'fa-house-medical', plural: 'مراكز طبية',
    specialties: ['مركز طبي', 'عيادات متخصصة'],
  },
  HOSPITAL: {
    label: 'مستشفى', icon: 'fa-hospital', plural: 'مستشفيات',
    specialties: ['مستشفى عام', 'مستشفى خاص', 'مستشفى جامعي'],
  },
  PHYSIOTHERAPY_CENTER: { label: 'مركز علاج طبيعي', icon: 'fa-person-walking', plural: 'مراكز علاج طبيعي', specialties: [] },
});

/** DB-friendly lowercase type values -> canonical PROVIDER_TYPES keys */
export const TYPE_ALIASES = Object.freeze({
  doctor: 'DOCTOR',
  dental: 'DENTAL_CLINIC',
  pharmacy: 'PHARMACY',
  lab: 'LAB',
  radiology: 'RADIOLOGY_CENTER',
  clinic: 'MEDICAL_CENTER',
  hospital: 'HOSPITAL',
  physiotherapy: 'PHYSIOTHERAPY_CENTER',
});

/** Resolve any stored type value (canonical or alias) to a PROVIDER_TYPES key. */
export function normalizeType(value) {
  if (!value) return 'DOCTOR';
  const v = String(value);
  if (PROVIDER_TYPES[v]) return v;
  return TYPE_ALIASES[v.toLowerCase()] || 'DOCTOR';
}

export const LEAD_STATUSES = Object.freeze({
  NEW: { label: 'جديد', badge: 'badge--info' },
  CONTACTED: { label: 'تم التواصل', badge: 'badge--warning' },
  CONFIRMED: { label: 'مؤكد', badge: 'badge' },
  COMPLETED: { label: 'مكتمل', badge: 'badge--success' },
  CANCELLED: { label: 'ملغي', badge: 'badge--danger' },
  NO_SHOW: { label: 'لم يحضر', badge: 'badge--muted' },
});

/** Navigation shared by header, mobile drawer and footer */
export const NAV_LINKS = Object.freeze([
  { href: 'index.html', label: 'الرئيسية', icon: 'fa-house' },
  { href: 'search.html?type=DOCTOR', label: 'الأطباء', icon: 'fa-user-doctor', match: 'search.html' },
  { href: 'specialties.html', label: 'التخصصات', icon: 'fa-stethoscope' },
  { href: 'services.html', label: 'الخدمات الطبية', icon: 'fa-briefcase-medical' },
  { href: 'offers.html', label: 'العروض', icon: 'fa-tag' },
  { href: 'for-providers.html', label: 'للأطباء', icon: 'fa-hospital-user' },
  { href: 'contact.html', label: 'تواصل معنا', icon: 'fa-phone' },
]);
