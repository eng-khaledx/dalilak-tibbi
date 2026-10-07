export const providers = {
  async featured(limit = 50) {
    const data = [
      {
        id: "1791394039908",
        slug: "1791394039908",
        name_ar: "د. نورا السيد",
        specialty_name: "جلدية",
        area_name: "الرياض",
        provider_type: "doctor",
        image_url: "images/doctors/dr-1791394039908.jpg",
        phone: "01014707246",
        address: "شارع السوق أعلي صيدلية القدس",
        rating_avg: 4.5,
        rating_count: 15,
        consultation_price: 150
      },
      {
        id: "1",
        slug: "1",
        name_ar: "د. أحمد منصور",
        specialty_name: "قلب",
        area_name: "كفر الشيخ",
        provider_type: "doctor",
        image_url: "images/doctors/dr-ahmed-mansour.jpg",
        phone: "01012345678",
        address: "شارع الجيش - بجوار المستشفى العام",
        rating_avg: 4.8,
        rating_count: 24,
        consultation_price: 200
      },
      {
        id: "2",
        slug: "2",
        name_ar: "د. سارة علي",
        specialty_name: "أطفال",
        area_name: "دسوق",
        provider_type: "doctor",
        image_url: "images/doctors/dr-sara-ali.jpg",
        phone: "01098765432",
        address: "ميدان المحطة - برج النور",
        rating_avg: 4.9,
        rating_count: 31,
        consultation_price: 180
      }
    ];
    return data.slice(0, limit);
  },
  async get(id) {
    const all = await this.featured(200);
    return all.find(d => String(d.id) === String(id) || String(d.slug) === String(id)) || null;
  },
  async list() { return this.featured(200); },
  async search({ specialty, area, q }) {
    let all = await this.featured(200);
    if (specialty) all = all.filter(p => p.specialty_name.includes(specialty));
    if (area) all = all.filter(p => p.area_name.includes(area));
    if (q) all = all.filter(p => p.name_ar.includes(q));
    return all;
  }
};