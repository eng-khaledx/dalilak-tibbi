// taxonomy يدوي بدون Supabase - متوافق 100% مع search.js
const SPECIALTIES = [
  { id: 'جلدية', name_ar: 'جلدية', provider_type: 'DOCTOR' },
  { id: 'قلب', name_ar: 'قلب', provider_type: 'DOCTOR' },
  { id: 'أطفال', name_ar: 'أطفال', provider_type: 'DOCTOR' },
  { id: 'اطفال', name_ar: 'أطفال', provider_type: 'DOCTOR' },
  { id: 'عظام', name_ar: 'عظام', provider_type: 'DOCTOR' },
  { id: 'نساء', name_ar: 'نساء وتوليد', provider_type: 'DOCTOR' },
  // انجليزي
  { id: 'skin', name_ar: 'جلدية', provider_type: 'DOCTOR' },
  { id: 'cardio', name_ar: 'قلب', provider_type: 'DOCTOR' },
];

const AREAS = [
  { id: 'كفر الشيخ', name_ar: 'كفر الشيخ', city_id: 'kfs' },
  { id: 'الرياض', name_ar: 'الرياض', city_id: 'kfs' },
  { id: 'دسوق', name_ar: 'دسوق', city_id: 'kfs' },
  { id: 'بيلا', name_ar: 'بيلا', city_id: 'kfs' },
];

const SERVICES = [
  { id: 'كشف', name_ar: 'كشف' },
  { id: 'استشارة', name_ar: 'استشارة' },
];

export const taxonomy = {
  specialties: async (args) => SPECIALTIES,
  areas: async (args) => AREAS,
  services: async (args) => SERVICES,
  // دول اللي كانوا ناقصين وبيوقعوا search.js
  listSpecialties: () => SPECIALTIES,
  listAreas: () => AREAS,
  listServices: () => SERVICES,
};

// exports مباشرة للتوافق
export const specialties = taxonomy.specialties;
export const areas = taxonomy.areas;
export const services = taxonomy.services;
1