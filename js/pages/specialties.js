import { mountLayout } from '../components/layout.js';
import { taxonomy, categoryHref } from '../services/taxonomy.js';
import { esc } from '../lib/utils.js';

try { mountLayout(); } catch (e) { console.warn('layout', e); }

async function render() {
  const root = document.getElementById('specialties-grid');
  if (!root) return;
  root.innerHTML = Array.from({ length: 12 }, () => '<div class="skeleton" style="height:104px" aria-hidden="true"></div>').join('');
  const specs = await taxonomy.specialties();
  root.innerHTML = specs.map((s) => `
    <a class="category-card" href="${categoryHref(s)}">
      <span class="category-card__icon"><i class="fa-solid ${esc(s.icon || 'fa-stethoscope')}" aria-hidden="true"></i></span>
      <span class="category-card__label">${esc(s.name_ar)}</span>
    </a>`).join('');
}

document.addEventListener('DOMContentLoaded', render);
