import './common.js';
import { esc, formatPrice, formatDateOnly } from '../lib/utils.js';
import { offers } from '../services/offers.js';
import { emptyState, errorState } from '../components/ui.js';

const root = document.getElementById('offers-root');

offers.active().then((list) => {
  if (!list.length) {
    root.innerHTML = emptyState({
      icon: 'fa-tag',
      title: 'لا توجد عروض متاحة حاليًا.',
      text: 'تابعنا — سيتم نشر العروض الطبية هنا فور توفرها من مقدمي الخدمات.',
      actions: '<a class="btn btn--primary" href="search.html">تصفح الأطباء والخدمات</a>',
    });
    return;
  }
  root.innerHTML = `<div class="provider-grid">${list.map((o) => `
    <article class="offer-card">
      <span class="badge badge--gold" style="align-self:flex-start"><i class="fa-solid fa-tag" aria-hidden="true"></i> عرض</span>
      <h2 class="offer-card__title">${esc(o.title)}</h2>
      ${o.provider_name ? `<div class="offer-card__provider"><i class="fa-solid fa-hospital" aria-hidden="true"></i> ${esc(o.provider_name)}</div>` : ''}
      ${o.description ? `<p class="text-muted" style="font-size:var(--text-sm)">${esc(o.description)}</p>` : ''}
      ${(o.price_before || o.price_after) ? `<div class="offer-card__prices">${o.price_after ? `<span class="after">${esc(formatPrice(o.price_after))}</span>` : ''}${o.price_before ? `<span class="before">${esc(formatPrice(o.price_before))}</span>` : ''}</div>` : ''}
      ${o.ends_at ? `<div class="offer-card__ends">ساري حتى ${esc(formatDateOnly(o.ends_at))}</div>` : ''}
      ${o.provider_id ? `<a class="btn btn--outline btn--sm" href="provider.html?id=${encodeURIComponent(o.provider_id)}">عرض مقدم الخدمة</a>` : ''}
    </article>`).join('')}</div>`;
}).catch(() => { root.innerHTML = errorState(); });
