import './common.js';
import { esc } from '../lib/utils.js';
import { taxonomy } from '../services/taxonomy.js';
import { errorState } from '../components/ui.js';

const root = document.getElementById('specialties-grid');
taxonomy.specialties().then((specs) => {
  root.innerHTML = specs.map((s) => `
    <a class="category-card" href="search.html?specialty=${encodeURIComponent(s.id)}">
      <span class="category-card__icon"><i class="fa-solid ${esc(s.icon || 'fa-stethoscope')}" aria-hidden="true"></i></span>
      <span class="category-card__label">${esc(s.name_ar)}</span>
    </a>`).join('');
}).catch(() => { root.innerHTML = errorState(); });
