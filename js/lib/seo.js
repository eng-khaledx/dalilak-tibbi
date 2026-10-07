/** Runtime metadata helpers for dynamic pages (provider / search). */
import { CONFIG } from './config.js';

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

export function setPageMeta({ title, description, canonicalPath, image, type = 'website', noindex = false }) {
  const fullTitle = title ? `${title} | ${CONFIG.brand.nameAr}` : CONFIG.site.defaultTitle;
  const desc = description || CONFIG.site.defaultDescription;
  document.title = fullTitle;
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:title', fullTitle);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:locale', 'ar_EG');
  upsertMeta('property', 'og:site_name', CONFIG.brand.nameAr);
  upsertMeta('name', 'twitter:card', 'summary');
  upsertMeta('name', 'twitter:title', fullTitle);
  upsertMeta('name', 'twitter:description', desc);
  if (noindex) upsertMeta('name', 'robots', 'noindex, nofollow');

  const origin = CONFIG.site.baseUrl || window.location.origin;
  const url = canonicalPath ? `${origin}/${canonicalPath.replace(/^\//, '')}` : `${origin}${window.location.pathname}`;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = url;
  upsertMeta('property', 'og:url', url);
  if (image) upsertMeta('property', 'og:image', image.startsWith('http') ? image : `${origin}/${image}`);
}

export function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function organizationJsonLd() {
  const origin = CONFIG.site.baseUrl || window.location.origin;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: CONFIG.brand.nameAr,
    alternateName: CONFIG.brand.nameEn,
    url: origin,
    logo: `${origin}/${CONFIG.brand.logoPath}`,
    telephone: CONFIG.contact.phoneTel,
    areaServed: { '@type': 'AdministrativeArea', name: CONFIG.defaultCity.nameAr },
  };
}
