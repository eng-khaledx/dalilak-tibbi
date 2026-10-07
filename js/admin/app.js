/** Admin dashboard controller: routing between views, login, shell. */
import { auth } from './auth.js';
import { toast } from '../components/ui.js';
import { leadsView } from './views/leads.js';
import { providersView } from './views/providers.js';
import { offersView } from './views/offers.js';
import { taxonomyView } from './views/taxonomy.js';
import { auditView } from './views/audit.js';

const VIEWS = {
  leads: { title: 'الطلبات', render: leadsView },
  providers: { title: 'مقدمو الخدمة', render: providersView },
  offers: { title: 'العروض', render: offersView },
  specialties: { title: 'التخصصات', render: (el) => taxonomyView(el, 'specialties') },
  services: { title: 'الخدمات', render: (el) => taxonomyView(el, 'services') },
  areas: { title: 'المناطق', render: (el) => taxonomyView(el, 'areas') },
  audit: { title: 'سجل النشاط', render: auditView },
};

const loginEl = document.getElementById('admin-login');
const appEl = document.getElementById('admin-app');
const content = document.getElementById('admin-content');
const sidebar = document.getElementById('admin-sidebar');
const backdrop = document.getElementById('admin-sidebar-backdrop');

function currentView() {
  const h = (location.hash || '#leads').slice(1);
  return VIEWS[h] ? h : 'leads';
}

async function renderView() {
  const key = currentView();
  document.getElementById('view-title').textContent = VIEWS[key].title;
  document.querySelectorAll('.admin-nav a').forEach((a) => a.classList.toggle('is-active', a.dataset.view === key));
  closeSidebar();
  content.innerHTML = '<div class="skeleton" style="height:120px"></div><div class="skeleton mt-4" style="height:320px"></div>';
  try {
    await VIEWS[key].render(content);
  } catch (err) {
    console.error(err);
    content.innerHTML = `<div class="alert alert--error">تعذّر تحميل البيانات: ${err.message || ''}</div>`;
  }
}

function openSidebar() { sidebar.classList.add('is-open'); backdrop.classList.add('is-open'); }
function closeSidebar() { sidebar.classList.remove('is-open'); backdrop.classList.remove('is-open'); }

function showApp() {
  loginEl.hidden = true;
  appEl.hidden = false;
  renderView();
}

function showLogin() {
  appEl.hidden = true;
  loginEl.hidden = false;
  setTimeout(() => document.getElementById('admin-pass').focus(), 50);
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('admin-pass');
  const err = document.getElementById('login-error');
  const field = input.closest('.field');
  field.classList.remove('is-invalid');
  const res = await auth.login(input.value);
  if (res.ok) { input.value = ''; showApp(); toast('مرحبًا بك', 'success'); }
  else { err.textContent = res.error; field.classList.add('is-invalid'); }
});

document.getElementById('logout-btn').addEventListener('click', () => { auth.logout(); showLogin(); });
document.getElementById('refresh-btn').addEventListener('click', renderView);
document.getElementById('admin-menu-btn').addEventListener('click', openSidebar);
backdrop.addEventListener('click', closeSidebar);
window.addEventListener('hashchange', () => { if (auth.isAuthenticated()) renderView(); });

if (auth.isAuthenticated()) showApp(); else showLogin();
