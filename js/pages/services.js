import './common.js';
import { esc } from '../lib/utils.js';
import { taxonomy } from '../services/taxonomy.js';
import { errorState } from '../components/ui.js';

const ICONS = {
  consultation: 'fa-stethoscope', 'follow-up': 'fa-rotate', 'home-visit': 'fa-house-chimney-medical', 'lab-tests': 'fa-vial',
  'home-sample': 'fa-syringe', 'x-ray': 'fa-x-ray', ultrasound: 'fa-wave-square', 'ct-mri': 'fa-circle-radiation',
  'dental-cleaning': 'fa-tooth', 'dental-implant': 'fa-teeth', orthodontics: 'fa-teeth-open', 'physiotherapy-session': 'fa-person-walking',
  'pharmacy-delivery': 'fa-truck-medical', emergency: 'fa-kit-medical',
};

const root = document.getElementById('services-grid');
taxonomy.services().then((list) => {
  root.innerHTML = list.map((s) => `
    <a class="category-card" href="search.html?service=${encodeURIComponent(s.id)}">
      <span class="category-card__icon"><i class="fa-solid ${ICONS[s.slug] || 'fa-briefcase-medical'}" aria-hidden="true"></i></span>
      <span class="category-card__label">${esc(s.name_ar)}</span>
    </a>`).join('');
}).catch(() => { root.innerHTML = errorState(); });
