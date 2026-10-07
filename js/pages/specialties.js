import { providers } from '../services/providers.js';
import { providerGrid } from '../components/provider-card.js';

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function render() {
  const specialty = getParam('specialty');
  const area = getParam('area');
  const q = getParam('q');
  
  const container = document.getElementById('doctors-grid') || document.getElementById('providers-grid') || document.querySelector('.provider-grid')?.parentElement || document.querySelector('main');
  
  if (container) {
    container.innerHTML = '<p style="text-align:center;padding:40px">جاري تحميل الدكاترة...</p>';
  }

  let list = [];
  if (specialty || area || q) {
    list = await providers.search({ specialty, area, q });
  } else {
    list = await providers.featured(100);
  }

  // عنوان الصفحة
  const titleEl = document.getElementById('page-title') || document.querySelector('h1');
  if (titleEl && specialty) {
    titleEl.textContent = `دكاترة ${specialty}`;
    document.title = `دكاترة ${specialty} - دليلك الطبي`;
  }

  if (container) {
    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:50px;background:#fff;border-radius:12px">
          <i class="fa-solid fa-user-doctor" style="font-size:48px;color:#cbd5e1;margin-bottom:15px"></i>
          <p>مفيش دكاترة في قسم ${specialty || 'ده'} حاليا</p>
          <a href="index.html" style="color:#0ea5e9">رجوع للرئيسية</a>
        </div>`;
    } else {
      container.innerHTML = providerGrid(list);
    }
  }
}

document.addEventListener('DOMContentLoaded', render);