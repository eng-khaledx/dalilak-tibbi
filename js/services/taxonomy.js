export const taxonomy = {
  async areas() {
    return [
      { id: 'kafr', name_ar: 'كفر الشيخ' },
      { id: 'biala', name_ar: 'بيلا' },
      { id: 'desouk', name_ar: 'دسوق' }
    ];
  },
  async specialties() {
    return [
      { id: 'cardio', name_ar: 'قلب', icon: 'fa-heart-pulse' },
      { id: 'kids', name_ar: 'أطفال', icon: 'fa-baby' },
      { id: 'teeth', name_ar: 'أسنان', icon: 'fa-tooth' },
      { id: 'eye', name_ar: 'عيون', icon: 'fa-eye' },
      { id: 'bones', name_ar: 'عظام', icon: 'fa-bone' },
      { id: 'skin', name_ar: 'جلدية', icon: 'fa-hand-dots' }
    ];
  }
};