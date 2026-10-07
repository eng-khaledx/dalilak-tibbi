// providers يدوي - متوافق مع search.js + provider.html

const DATA = [
  {
    id: 'dr-noura-sayed',
    slug: 'dr-noura-sayed',
    name_ar: 'د. نورا السيد',
    specialty: 'جلدية',
    specialty_name: 'جلدية',
    specialty_id: 'جلدية',
    area: 'كفر الشيخ',
    area_name: 'كفر الشيخ',
    area_id: 'كفر الشيخ',
    address: 'كفر الشيخ - شارع الجيش - أمام المستشفى العام',
    phone: '01012345678',
    rating_avg: 4.8,
    rating_count: 124,
    consultation_price: 300,
    image_url: 'images/doctor-placeholder.png',
    type: 'DOCTOR',
    is_featured: true,
  },
  {
    id: 'dr-ahmed-mansour',
    slug: 'dr-ahmed-mansour',
    name_ar: 'د. أحمد منصور',
    specialty: 'قلب',
    specialty_name: 'قلب',
    specialty_id: 'قلب',
    area: 'الرياض',
    area_name: 'الرياض',
    area_id: 'الرياض',
    address: 'الرياض - كفر الشيخ - شارع المركز',
    phone: '01098765432',
    rating_avg: 4.9,
    rating_count: 98,
    consultation_price: 350,
    image_url: 'images/doctor-placeholder.png',
    type: 'DOCTOR',
    is_featured: true,
  },
];

function matches(p, { q, specialtyId, specialty, areaId, area }) {
  const s = (specialtyId || specialty || '').toLowerCase();
  const a = (areaId || area || '').toLowerCase();
  const qq = (q || '').toLowerCase();
  
  if (s && s !== 'all' && s !== 'skin') {
    // skin = جلدية
    const spec = (p.specialty_id || p.specialty || '').toLowerCase();
    if (s === 'skin' && spec !== 'جلدية' && spec !== 'جلديه') return false;
    else if (s !== 'skin' && !spec.includes(s) && s !== spec) return false;
  }
  if (a && (p.area_id || p.area || '').toLowerCase() !== a && !(p.area_name||'').toLowerCase().includes(a)) {
    // تساهل
    if (a && !(p.area_name||'').toLowerCase().includes(a)) {
      // لا
    }
  }
  if (qq) {
    const hay = `${p.name_ar} ${p.specialty_name} ${p.area_name} ${p.address}`.toLowerCase();
    if (!hay.includes(qq)) return false;
  }
  return true;
}

export const providers = {
  all: async () => DATA,
  
  get: async (id) => {
    if (!id) return null;
    const low = String(id).toLowerCase();
    return DATA.find(p => p.id === id || p.slug === id || p.id.toLowerCase() === low || p.slug.toLowerCase() === low || p.specialty_id.toLowerCase() === low) || null;
  },
  
  featured: async (limit = 20) => DATA.slice(0, limit),
  
  search: async ({ q, specialtyId, specialty, areaId, area, type, serviceId, hasOffer, page = 1 } = {}) => {
    let filtered = DATA.filter(p => matches(p, { q, specialtyId, specialty, areaId, area }));
    
    const total = filtered.length;
    const pageSize = 12;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), pages);
    const start = (currentPage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    
    return { items, total, pages, page: currentPage };
  },
  
  // عشان search.js بيناديها
  withOfferFlags: async () => {},
};