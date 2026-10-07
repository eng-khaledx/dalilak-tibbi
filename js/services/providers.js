// providers.js - النسخة المصلحة
const CACHE_KEY = 'cache:providers:public:v4';

// داتا تجريبية لو مفيش داتا
const MOCK_PROVIDERS = [
  {
    id: '1',
    slug: 'doctor-ahmed',
    name_ar: 'د. أحمد محمد',
    specialty_name: 'أطفال',
    area_name: 'كفرالشيخ',
    phone: '01000000000',
    address: 'كفرالشيخ - المحطة',
    about: 'استشاري طب الأطفال',
    consultation_price: '200 جنيه',
    image_url: ''
  }
];

async function getProvidersData() {
  try {
    // حاول تقرا من localStorage الأول
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch(e){}
  
  // لو مفيش كاش، رجع الـ mock
  // هنا بعد كده هنربطه بـ Supabase
  return MOCK_PROVIDERS;
}

export const providers = {
  invalidate() {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch(e){}
  },
  
  async list() {
    return await getProvidersData();
  },
  
  async bySlug(slug) {
    const all = await getProvidersData();
    if (!slug) return null;
    return all.find(p => 
      String(p.slug).toLowerCase() === String(slug).toLowerCase() ||
      String(p.id) === String(slug)
    ) || null;
  },
  
  async byId(id) {
    const all = await getProvidersData();
    if (!id) return null;
    return all.find(p => String(p.id) === String(id)) || null;
  }
};