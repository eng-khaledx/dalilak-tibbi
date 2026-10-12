import { providers } from './providers.js';

// عروض حقيقية - مبنية على الدكاترة اللي عندك فعلا
const REAL_OFFERS = [
  { 
    id: 'offer_1',
    provider_id: 'dr-noura-sayed',
    title: 'كشف جلدية + متابعة مجانية لمدة شهر',
    description: 'كشف شامل لأمراض الجلدية مع متابعة مجانية',
    discount: 30,
    old_price: 250,
    new_price: 175,
    tag: 'جلدية',
    type: 'جلدية',
    specialty: 'جلدية',
    valid_until: '2026-10-20',
    badge: 'الأكثر طلباً',
    badge_color: '#ef4444'
  },
  { 
    id: 'offer_2',
    provider_id: 'dr-sara-ali',
    title: 'باقة متابعة نمو الطفل 3 شهور',
    description: '3 زيارات + تطعيمات + استشارة تغذية',
    discount: 40,
    old_price: 450,
    new_price: 270,
    tag: 'أطفال',
    type: 'أطفال',
    specialty: 'أطفال',
    valid_until: '2026-10-30',
    badge: 'باقة عائلية',
    badge_color: '#0ea5e9'
  },
  { 
    id: 'offer_3',
    provider_id: 'dr-ahmed-mansour',
    title: 'رسم قلب + كشف قلب مجانا',
    description: 'فحص شامل للقلب مع رسم قلب كهربائي',
    discount: 50,
    old_price: 400,
    new_price: 200,
    tag: 'قلب',
    type: 'قلب',
    specialty: 'قلب',
    valid_until: '2026-10-15',
    badge: 'عرض اليوم',
    badge_color: '#f59e0b'
  },
  { 
    id: 'offer_4',
    provider_id: 'dr-noura-sayed',
    title: 'جلسة ديرما بن + بلازما + كشف',
    description: 'جلسة نضارة للبشرة بأحدث الأجهزة',
    discount: 35,
    old_price: 800,
    new_price: 520,
    tag: 'جلدية',
    type: 'جلدية',
    specialty: 'جلدية',
    valid_until: '2026-10-18',
    badge: 'جديد',
    badge_color: '#10b981'
  },
  { 
    id: 'offer_5',
    provider_id: 'dr-sara-ali',
    title: 'كشف أطفال + تحليل أنيميا مجاني',
    description: 'اطمن على طفلك مع تحليل هيموجلوبين',
    discount: 25,
    old_price: 200,
    new_price: 150,
    tag: 'أطفال',
    type: 'أطفال',
    specialty: 'أطفال',
    valid_until: '2026-10-25',
    badge: 'محدود',
    badge_color: '#8b5cf6'
  },
  { 
    id: 'offer_6',
    provider_id: 'dr-ahmed-mansour',
    title: 'متابعة ضغط وسكر لمدة شهرين',
    description: '4 زيارات + قياس ضغط وسكر + خطة علاج',
    discount: 30,
    old_price: 600,
    new_price: 420,
    tag: 'قلب',
    type: 'باطنة',
    specialty: 'قلب',
    valid_until: '2026-11-01',
    badge: 'أوفر باقة',
    badge_color: '#06b6d4'
  },
  {
    id: 'offer_7',
    provider_id: 'lab-1',
    title: 'خصم 20% على التحاليل - معمل البرج',
    description: 'خصم على كل التحاليل الطبية بالمعمل',
    discount: 20,
    old_price: 500,
    new_price: 400,
    tag: 'تحاليل',
    type: 'تحاليل',
    specialty: 'معامل تحاليل',
    provider_type: 'lab',
    valid_until: '2026-11-05',
    badge: 'خصم',
    badge_color: '#0ea5e9'
  },
  {
    id: 'offer_8',
    provider_id: 'dr-dental-1',
    title: 'تنظيف أسنان مجاني مع كل حشو',
    description: 'تنظيف وتلميع مجاني عند عمل أي حشو',
    discount: 30,
    old_price: 350,
    new_price: 245,
    tag: 'أسنان',
    type: 'أسنان',
    specialty: 'أسنان',
    valid_until: '2026-11-10',
    badge: 'مجاني',
    badge_color: '#f59e0b'
  },
  {
    id: 'offer_9',
    provider_id: 'dr-ophthalmology-1',
    title: 'كشف رمد مجاني للأطفال',
    description: 'كشف رمد للأطفال بدون رسوم',
    discount: 100,
    old_price: 250,
    new_price: 0,
    tag: 'رمد',
    type: 'رمد',
    specialty: 'رمد',
    valid_until: '2026-11-10',
    badge: 'مجاني',
    badge_color: '#ec4899'
  },
];

export const offers = {
  active: async () => {
    // حاول تجيب من Supabase لو موجود، لو لا ارجع العروض الحقيقية
    try {
      // لو عندك supabase
      // const { data } = await supabase.from('offers').select('*').eq('is_active', true);
      // if (data && data.length) return data;
    } catch(e){}
    return REAL_OFFERS;
  },
  get: async (id) => REAL_OFFERS.find(o => o.id === id) || null,
  byProvider: async (provider_id) => REAL_OFFERS.filter(o => o.provider_id === provider_id),

  /** مقدمو الخدمة المطابقين لتخصص/نوع العرض فقط (مش كل الدكاترة) */
  getDoctorsForOffer: (offer) => getDoctorsForOffer(offer),
};

export async function getDoctorsForOffer(offer) {
  if (!offer) return [];
  const specialty = offer.specialty || offer.tag || '';
  const type = offer.provider_type || '';
  if (!specialty && !type) return offer.provider_id ? [await providers.get(offer.provider_id)].filter(Boolean) : [];
  return providers.list({ specialty, type });
}
