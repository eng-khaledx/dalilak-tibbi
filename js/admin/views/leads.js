import { LEAD_STATUSES } from '../../lib/config.js';
import { esc, formatDate, normalizeArabic, toInternationalDigits } from '../../lib/utils.js';
import { adminData } from '../data.js';
import { toast, openModal, bindModalClose } from '../../components/ui.js';
import { whatsapp } from '../../services/whatsapp.js';
import { telegram } from '../../services/notifications/telegram.js';

const state = { q: '', status: '', type: '' };
let all = [];

function statusBadge(s) {
  const m = LEAD_STATUSES[s] || { label: s || '-', badge: 'badge--muted' };
  return `<span class="badge ${m.badge}">${esc(m.label)}</span>`;
}

function statusSelect(lead) {
  return `<select class="select status-select" data-status-for="${esc(lead.id)}" aria-label="تغيير الحالة">${Object.entries(LEAD_STATUSES).map(([k, v]) => `<option value="${k}" ${lead.status === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}</select>`;
}

function filtered() {
  const q = normalizeArabic(state.q);
  return all
    .filter((l) => (!state.status || l.status === state.status) && (!state.type || (l.lead_type || 'PATIENT') === state.type))
    .filter((l) => !q || (l.search_text || normalizeArabic([l.name, l.phone, l.service, l.provider_name, l.area_name].join(' '))).includes(q))
    .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

function rows(list) {
  if (!list.length) return '<tr><td colspan="9" class="text-center text-muted" style="padding:40px">لا توجد طلبات مطابقة.</td></tr>';
  return list.map((l) => `
    <tr>
      <td><strong>${esc(l.name)}</strong><div class="muted">${l.lead_type === 'PROVIDER' ? 'مقدم خدمة' : 'مريض'}</div></td>
      <td class="ltr" style="text-align:right">${esc(l.phone)}</td>
      <td>${esc(l.service || '-')}</td>
      <td>${esc(l.provider_name || '-')}</td>
      <td>${esc(l.area_name || '-')}</td>
      <td>${statusBadge(l.status)}</td>
      <td><span class="muted">${esc(l.source || '-')}</span>${l.notified_telegram ? ' <i class="fa-brands fa-telegram" style="color:#229ED9" title="تم الإشعار"></i>' : ''}</td>
      <td class="muted">${esc(formatDate(l.created_at))}</td>
      <td>
        <div class="actions">
          <a class="btn btn--soft btn--sm btn--icon" href="tel:+${toInternationalDigits(l.phone)}" title="اتصال" aria-label="اتصال"><i class="fa-solid fa-phone"></i></a>
          <a class="btn btn--whatsapp btn--sm btn--icon" href="${whatsapp.directLink(toInternationalDigits(l.phone), `مرحبًا ${l.name}، معك فريق دليلك الطبي بكفرالشيخ بخصوص طلبك${l.service ? ` (${l.service})` : ''}.`)}" target="_blank" rel="noopener" title="واتساب" aria-label="واتساب"><i class="fa-brands fa-whatsapp"></i></a>
          <button type="button" class="btn btn--outline btn--sm btn--icon" data-view-lead="${esc(l.id)}" title="عرض" aria-label="عرض"><i class="fa-solid fa-eye"></i></button>
          ${statusSelect(l)}
        </div>
      </td>
    </tr>`).join('');
}

function stats() {
  const c = (s) => all.filter((l) => l.status === s).length;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return `
    <div class="stats">
      <div class="stat"><div class="stat__label">إجمالي الطلبات</div><div class="stat__value">${all.length}</div></div>
      <div class="stat"><div class="stat__label">جديدة</div><div class="stat__value" style="color:var(--color-info)">${c('NEW')}</div></div>
      <div class="stat"><div class="stat__label">اليوم</div><div class="stat__value">${all.filter((l) => (l.created_at || 0) >= today.getTime()).length}</div></div>
      <div class="stat"><div class="stat__label">مكتملة</div><div class="stat__value" style="color:var(--color-success)">${c('COMPLETED')}</div></div>
    </div>`;
}

export async function leadsView(el) {
  all = await adminData.leads.all();
  const navBadge = document.getElementById('nav-new-count');
  const newCount = all.filter((l) => l.status === 'NEW').length;
  navBadge.hidden = newCount === 0; navBadge.textContent = newCount;

  el.innerHTML = `
    ${stats()}
    ${telegram.isConfigured() ? '' : '<div class="alert alert--info mb-4"><i class="fa-solid fa-circle-info"></i> إشعارات تليجرام غير مفعّلة. الطلبات تُحفظ هنا دائمًا؛ لتفعيل الإشعارات اضبط webhookUrl في js/lib/config.js.</div>'}
    <div class="admin-toolbar">
      <input class="input" id="lead-q" type="search" placeholder="بحث بالاسم، الهاتف، الخدمة..." value="${esc(state.q)}">
      <select class="select" id="lead-status"><option value="">كل الحالات</option>${Object.entries(LEAD_STATUSES).map(([k, v]) => `<option value="${k}" ${state.status === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}</select>
      <select class="select" id="lead-type"><option value="">الكل</option><option value="PATIENT" ${state.type === 'PATIENT' ? 'selected' : ''}>مرضى</option><option value="PROVIDER" ${state.type === 'PROVIDER' ? 'selected' : ''}>مقدمو خدمة</option></select>
      <span class="spacer"></span>
      <span class="text-muted" id="lead-count" style="font-size:var(--text-sm)"></span>
    </div>
    <div class="table-wrap">
      <table class="table" id="leads-table">
        <thead><tr><th>الاسم</th><th>الهاتف</th><th>الخدمة</th><th>الطبيب</th><th>المنطقة</th><th>الحالة</th><th>المصدر</th><th>التاريخ</th><th>الإجراءات</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>`;

  const tbody = el.querySelector('tbody');
  const draw = () => {
    const list = filtered();
    tbody.innerHTML = rows(list);
    el.querySelector('#lead-count').textContent = `${list.length} طلب`;
  };
  draw();

  el.querySelector('#lead-q').addEventListener('input', (e) => { state.q = e.target.value; draw(); });
  el.querySelector('#lead-status').addEventListener('change', (e) => { state.status = e.target.value; draw(); });
  el.querySelector('#lead-type').addEventListener('change', (e) => { state.type = e.target.value; draw(); });

  tbody.addEventListener('change', async (e) => {
    const sel = e.target.closest('[data-status-for]');
    if (!sel) return;
    const id = sel.dataset.statusFor;
    sel.disabled = true;
    try {
      await adminData.leads.setStatus(id, sel.value);
      const lead = all.find((l) => l.id === id); if (lead) lead.status = sel.value;
      toast('تم تحديث الحالة', 'success');
      draw();
      const n = all.filter((l) => l.status === 'NEW').length; navBadge.hidden = n === 0; navBadge.textContent = n;
    } catch (err) { toast('فشل التحديث', 'error'); sel.disabled = false; }
  });

  tbody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-view-lead]');
    if (!b) return;
    const l = all.find((x) => x.id === b.dataset.viewLead);
    if (l) showLead(l);
  });
}

function showLead(l) {
  const modal = document.getElementById('edit-modal');
  document.getElementById('edit-modal-title').textContent = `طلب: ${l.name}`;
  const row = (k, v) => v ? `<dt>${k}</dt><dd>${esc(v)}</dd>` : '';
  document.getElementById('edit-modal-body').innerHTML = `
    <dl class="lead-detail" style="margin:0">
      ${row('الاسم', l.name)}${row('الهاتف', l.phone)}${row('النوع', l.lead_type === 'PROVIDER' ? 'مقدم خدمة' : 'مريض')}
      ${row('الخدمة / التخصص', l.service)}${row('الطبيب أو المركز', l.provider_name)}${row('المنطقة', l.area_name)}
      ${row('ملاحظات', l.notes)}${row('المصدر', l.source)}${row('الصفحة', l.page_url)}${row('التاريخ', formatDate(l.created_at))}
      <dt>الحالة</dt><dd>${statusBadge(l.status)}</dd>
      <dt>إشعار تليجرام</dt><dd>${l.notified_telegram ? 'تم الإرسال' : 'لم يُرسل'}</dd>
    </dl>
    <div class="flex gap-2 wrap mt-6">
      <a class="btn btn--primary" href="tel:+${toInternationalDigits(l.phone)}"><i class="fa-solid fa-phone"></i> اتصال</a>
      <a class="btn btn--whatsapp" href="${whatsapp.directLink(toInternationalDigits(l.phone))}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> واتساب</a>
    </div>`;
  bindModalClose(modal);
  openModal(modal);
}
