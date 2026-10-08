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
};
