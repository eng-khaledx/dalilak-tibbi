/** Small reusable UI primitives: states, toasts, modal control, reveal. */
import { esc } from '../lib/utils.js';

export function emptyState({ icon = 'fa-folder-open', title, text = '', actions = '' , variant = '' }) {
  return `
    <div class="state ${variant}" role="status">
      <div class="state__icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></div>
      <h3 class="state__title">${esc(title)}</h3>
      ${text ? `<p class="state__text">${esc(text)}</p>` : ''}
      ${actions ? `<div class="state__actions">${actions}</div>` : ''}
    </div>`;
}

export function errorState(text = 'حدث خطأ أثناء تحميل البيانات. حاول مرة أخرى.') {
  return emptyState({
    icon: 'fa-triangle-exclamation',
    title: 'تعذّر التحميل',
    text,
    variant: 'state--error',
    actions: '<button type="button" class="btn btn--outline btn--sm" onclick="location.reload()">إعادة المحاولة</button>',
  });
}

export function skeletonCards(n = 3) {
  return Array.from({ length: n }, () => '<div class="skeleton skeleton-card" aria-hidden="true"></div>').join('');
}

/* ---------- Toasts ---------- */
let stack;
export function toast(message, type = '') {
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast ${type ? `toast--${type}` : ''}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ---------- Modal ---------- */
export function openModal(el) {
  if (!el) return;
  el.classList.add('is-open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const first = el.querySelector('input, select, textarea, button:not(.modal__close)');
  if (first) setTimeout(() => first.focus(), 50);
  const onKey = (e) => { if (e.key === 'Escape') { closeModal(el); } };
  el.__onKey = onKey;
  document.addEventListener('keydown', onKey);
}
export function closeModal(el) {
  if (!el) return;
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (el.__onKey) document.removeEventListener('keydown', el.__onKey);
}
export function bindModalClose(el) {
  el.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => closeModal(el)));
}

/* ---------- Dropdowns ---------- */
export function initDropdowns(root = document) {
  root.querySelectorAll('.dropdown > [data-dropdown-toggle]').forEach((btn) => {
    if (btn.__bound) return;
    btn.__bound = true;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = btn.parentElement;
      const open = dd.classList.contains('is-open');
      document.querySelectorAll('.dropdown.is-open').forEach((d) => d.classList.remove('is-open'));
      if (!open) dd.classList.add('is-open');
    });
  });
  if (!document.__ddBound) {
    document.__ddBound = true;
    document.addEventListener('click', () => document.querySelectorAll('.dropdown.is-open').forEach((d) => d.classList.remove('is-open')));
  }
}

/* ---------- Scroll reveal (respects reduced motion) ---------- */
export function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { threshold: 0.08 });
  els.forEach((e) => io.observe(e));
}
