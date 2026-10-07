import { esc, formatDate } from '../../lib/utils.js';
import { adminData } from '../data.js';

const ACTIONS = { CREATE: 'إضافة', UPDATE: 'تعديل', DELETE: 'حذف', TOGGLE: 'تبديل حالة', UPDATE_STATUS: 'تغيير حالة طلب' };
const ENTITIES = { provider: 'مقدم خدمة', offer: 'عرض', lead: 'طلب', specialties: 'تخصص', services: 'خدمة', areas: 'منطقة' };

export async function auditView(el) {
  const logs = (await adminData.audit()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0)).slice(0, 300);
  el.innerHTML = `
    <div class="table-wrap"><table class="table">
      <thead><tr><th>التاريخ</th><th>المستخدم</th><th>الإجراء</th><th>الكيان</th><th>التفاصيل</th></tr></thead>
      <tbody>${logs.length ? logs.map((l) => `<tr>
        <td class="muted">${esc(formatDate(l.created_at))}</td>
        <td>${esc(l.actor || '-')}</td>
        <td><span class="badge">${esc(ACTIONS[l.action] || l.action)}</span></td>
        <td>${esc(ENTITIES[l.entity] || l.entity)} <span class="muted ltr">${esc(l.entity_id || '')}</span></td>
        <td>${esc(l.details || '')}</td></tr>`).join('')
      : '<tr><td colspan="5" class="text-center text-muted" style="padding:40px">لا يوجد نشاط مسجّل بعد.</td></tr>'}</tbody>
    </table></div>`;
}
