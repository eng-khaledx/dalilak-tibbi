import { PROVIDER_TYPES, CONFIG } from '../../lib/config.js';
import { esc } from '../../lib/utils.js';
import { adminData } from '../data.js';
import { toast, openModal, closeModal, bindModalClose } from '../../components/ui.js';

const META = {
  specialties: { single: 'تخصص', hasIcon: true, hasType: true },
  services: { single: 'خدمة', hasIcon: false, hasType: false },
  areas: { single: 'منطقة', hasIcon: false, hasType: false, hasCity: true },
};

export async function taxonomyView(el, table) {
  const meta = META[table];
  const repo = adminData.taxonomy(table);
  let all = (await repo.all()).sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  const cities = meta.hasCity ? await adminData.cities() : [];

  const rows = () => all.length ? all.map((r) => `<tr>
      <td>${meta.hasIcon ? `<i class="fa-solid ${esc(r.icon || 'fa-circle')}" style="color:var(--color-navy-500);margin-inline-end:8px"></i>` : ''}<strong>${esc(r.name_ar)}</strong></td>
      <td class="ltr muted" style="text-align:right">${esc(r.slug || '')}</td>
      ${meta.hasType ? `<td>${esc(PROVIDER_TYPES[r.provider_type]?.label || '-')}</td>` : ''}
      ${meta.hasCity ? `<td>${esc(cities.find((c) => c.id === r.city_id)?.name_ar || '-')}</td>` : ''}
      <td>${r.sort_order ?? '-'}</td>
      <td><label class="switch"><input type="checkbox" data-toggle data-id="${esc(r.id)}" ${r.is_active !== false ? 'checked' : ''}><span></span></label></td>
      <td><div class="actions">
        <button type="button" class="btn btn--outline btn--sm btn--icon" data-edit="${esc(r.id)}" aria-label="تعديل"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="btn btn--danger btn--sm btn--icon" data-delete="${esc(r.id)}" aria-label="حذف"><i class="fa-solid fa-trash"></i></button>
      </div></td></tr>`).join('')
    : `<tr><td colspan="7" class="text-center text-muted" style="padding:40px">لا توجد عناصر.</td></tr>`;

  el.innerHTML = `
    <div class="admin-toolbar">
      <span class="text-muted" style="font-size:var(--text-sm)">${all.length} عنصر</span>
      <span class="spacer"></span>
      <button type="button" class="btn btn--primary btn--sm" id="t-add"><i class="fa-solid fa-plus"></i> إضافة ${meta.single}</button>
    </div>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>الاسم</th><th>Slug</th>${meta.hasType ? '<th>النوع الافتراضي</th>' : ''}${meta.hasCity ? '<th>المدينة</th>' : ''}<th>الترتيب</th><th>نشط</th><th>الإجراءات</th></tr></thead>
      <tbody>${rows()}</tbody></table></div>`;

  const tbody = el.querySelector('tbody');
  const draw = () => { all.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)); tbody.innerHTML = rows(); };

  el.querySelector('#t-add').addEventListener('click', () => openForm(null));
  tbody.addEventListener('change', async (e) => {
    const t = e.target.closest('[data-toggle]'); if (!t) return;
    try { await repo.toggle(t.dataset.id, t.checked); const r = all.find((x) => x.id === t.dataset.id); if (r) r.is_active = t.checked; toast('تم الحفظ', 'success'); }
    catch (_) { t.checked = !t.checked; toast('فشل الحفظ', 'error'); }
  });
  tbody.addEventListener('click', async (e) => {
    const ed = e.target.closest('[data-edit]'); const del = e.target.closest('[data-delete]');
    if (ed) openForm(all.find((x) => x.id === ed.dataset.edit));
    if (del) {
      const r = all.find((x) => x.id === del.dataset.delete);
      if (r && confirm(`حذف "${r.name_ar}"؟ مقدمو الخدمة المرتبطون لن يُحذفوا لكن سيفقدون هذا الربط في الفلاتر.`)) {
        try { await repo.remove(r.id); all = all.filter((x) => x.id !== r.id); draw(); toast('تم الحذف', 'success'); }
        catch (_) { toast('فشل الحذف', 'error'); }
      }
    }
  });

  function openForm(r) {
    const modal = document.getElementById('edit-modal');
    document.getElementById('edit-modal-title').textContent = r ? `تعديل ${meta.single}` : `إضافة ${meta.single}`;
    document.getElementById('edit-modal-body').innerHTML = `
      <form id="tax-form" class="form-grid form-grid--2" novalidate>
        <div class="field span-2"><label class="field__label">الاسم بالعربية <span class="req">*</span></label><input class="input" name="name_ar" required maxlength="80" value="${esc(r?.name_ar || '')}"></div>
        <div class="field"><label class="field__label">Slug</label><input class="input ltr" name="slug" maxlength="60" placeholder="يُولَّد تلقائيًا" value="${esc(r?.slug || '')}"></div>
        <div class="field"><label class="field__label">الترتيب</label><input class="input ltr" name="sort_order" type="number" min="0" value="${r?.sort_order ?? ''}"></div>
        ${meta.hasIcon ? `<div class="field"><label class="field__label">أيقونة (Font Awesome)</label><input class="input ltr" name="icon" maxlength="40" placeholder="fa-stethoscope" value="${esc(r?.icon || '')}"></div>` : ''}
        ${meta.hasType ? `<div class="field"><label class="field__label">النوع الافتراضي</label><select class="select" name="provider_type">${Object.entries(PROVIDER_TYPES).map(([k, v]) => `<option value="${k}" ${(r?.provider_type || 'DOCTOR') === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}</select></div>` : ''}
        ${meta.hasCity ? `<div class="field"><label class="field__label">المدينة</label><select class="select" name="city_id">${cities.map((c) => `<option value="${esc(c.id)}" ${(r?.city_id || CONFIG.defaultCity.id) === c.id ? 'selected' : ''}>${esc(c.name_ar)}</option>`).join('')}</select></div>` : ''}
        <div class="field span-2"><label class="checkbox"><input type="checkbox" name="is_active" ${r ? (r.is_active !== false ? 'checked' : '') : 'checked'}> نشط</label></div>
        <div class="alert alert--error span-2" id="tax-form-error" hidden></div>
        <div class="span-2 flex gap-2"><button type="submit" class="btn btn--primary">حفظ</button><button type="button" class="btn btn--outline" data-close>إلغاء</button></div>
      </form>`;
    bindModalClose(modal); openModal(modal);
    const form = document.getElementById('tax-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = form.querySelector('#tax-form-error'); err.hidden = true;
      const data = Object.fromEntries(new FormData(form).entries());
      data.is_active = form.is_active.checked;
      try {
        const saved = await repo.save(data, r?.id);
        if (r) Object.assign(r, saved); else all.push(saved);
        closeModal(modal); draw(); toast('تم الحفظ', 'success');
      } catch (ex) { err.textContent = ex.message || 'فشل الحفظ'; err.hidden = false; }
    });
  }
}
