import { esc, formatPrice, formatDateOnly } from '../../lib/utils.js';
import { adminData } from '../data.js';
import { toast, openModal, closeModal, bindModalClose } from '../../components/ui.js';

let all = [];
let provs = [];

function rows(list) {
  if (!list.length) return '<tr><td colspan="6" class="text-center text-muted" style="padding:40px">لا توجد عروض. أضف عرضًا حقيقيًا من مقدم خدمة مسجّل.</td></tr>';
  return list.map((o) => {
    const expired = o.ends_at && new Date(o.ends_at).getTime() < Date.now();
    return `<tr>
      <td><strong>${esc(o.title)}</strong>${o.description ? `<div class="muted">${esc(o.description.slice(0, 80))}</div>` : ''}</td>
      <td>${esc(o.provider_name || '-')}</td>
      <td>${o.price_after ? esc(formatPrice(o.price_after)) : '-'}${o.price_before ? ` <span class="muted" style="text-decoration:line-through">${esc(formatPrice(o.price_before))}</span>` : ''}</td>
      <td>${o.ends_at ? esc(formatDateOnly(o.ends_at)) : '-'}${expired ? ' <span class="badge badge--danger">منتهي</span>' : ''}</td>
      <td><label class="switch"><input type="checkbox" data-toggle data-id="${esc(o.id)}" ${o.is_active !== false ? 'checked' : ''}><span></span></label></td>
      <td><div class="actions">
        <button type="button" class="btn btn--outline btn--sm btn--icon" data-edit="${esc(o.id)}" aria-label="تعديل"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="btn btn--danger btn--sm btn--icon" data-delete="${esc(o.id)}" aria-label="حذف"><i class="fa-solid fa-trash"></i></button>
      </div></td></tr>`;
  }).join('');
}

export async function offersView(el) {
  [all, provs] = await Promise.all([adminData.offers.all(), adminData.providers.all()]);
  el.innerHTML = `
    <div class="admin-toolbar">
      <span class="text-muted" style="font-size:var(--text-sm)">${all.length} عرض</span>
      <span class="spacer"></span>
      <button type="button" class="btn btn--primary btn--sm" id="o-add" ${provs.length ? '' : 'disabled title="أضف مقدم خدمة أولًا"'}><i class="fa-solid fa-plus"></i> إضافة عرض</button>
    </div>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>العرض</th><th>مقدم الخدمة</th><th>السعر</th><th>ينتهي</th><th>نشط</th><th>الإجراءات</th></tr></thead>
      <tbody></tbody></table></div>`;
  const tbody = el.querySelector('tbody');
  const draw = () => { tbody.innerHTML = rows(all.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))); };
  draw();
  el.querySelector('#o-add').addEventListener('click', () => openForm(null, draw));
  tbody.addEventListener('change', async (e) => {
    const t = e.target.closest('[data-toggle]'); if (!t) return;
    try { await adminData.offers.toggle(t.dataset.id, t.checked); const o = all.find((x) => x.id === t.dataset.id); if (o) o.is_active = t.checked; toast('تم الحفظ', 'success'); }
    catch (_) { t.checked = !t.checked; toast('فشل الحفظ', 'error'); }
  });
  tbody.addEventListener('click', async (e) => {
    const ed = e.target.closest('[data-edit]'); const del = e.target.closest('[data-delete]');
    if (ed) openForm(all.find((x) => x.id === ed.dataset.edit), draw);
    if (del && confirm('حذف هذا العرض؟')) {
      try { await adminData.offers.remove(del.dataset.delete); all = all.filter((x) => x.id !== del.dataset.delete); draw(); toast('تم الحذف', 'success'); }
      catch (_) { toast('فشل الحذف', 'error'); }
    }
  });
}

function openForm(o, onSaved) {
  const modal = document.getElementById('edit-modal');
  document.getElementById('edit-modal-title').textContent = o ? 'تعديل عرض' : 'إضافة عرض';
  const endsLocal = o?.ends_at ? new Date(o.ends_at).toISOString().slice(0, 10) : '';
  document.getElementById('edit-modal-body').innerHTML = `
    <form id="offer-form" class="form-grid form-grid--2" novalidate>
      <div class="field span-2"><label class="field__label">عنوان العرض <span class="req">*</span></label><input class="input" name="title" required maxlength="120" value="${esc(o?.title || '')}"></div>
      <div class="field span-2"><label class="field__label">مقدم الخدمة <span class="req">*</span></label>
        <select class="select" name="provider_id" required><option value="">اختر...</option>${provs.map((p) => `<option value="${esc(p.id)}" data-name="${esc(p.name_ar)}" ${o?.provider_id === p.id ? 'selected' : ''}>${esc(p.name_ar)}</option>`).join('')}</select></div>
      <div class="field"><label class="field__label">السعر قبل</label><input class="input ltr" name="price_before" type="number" min="0" value="${o?.price_before ?? ''}"></div>
      <div class="field"><label class="field__label">السعر بعد</label><input class="input ltr" name="price_after" type="number" min="0" value="${o?.price_after ?? ''}"></div>
      <div class="field"><label class="field__label">ينتهي في</label><input class="input ltr" name="ends_at" type="date" value="${endsLocal}"></div>
      <div class="field" style="justify-content:flex-end"><label class="checkbox"><input type="checkbox" name="is_active" ${o ? (o.is_active !== false ? 'checked' : '') : 'checked'}> نشط</label></div>
      <div class="field span-2"><label class="field__label">الوصف</label><textarea class="textarea" name="description" maxlength="400">${esc(o?.description || '')}</textarea></div>
      <div class="alert alert--error span-2" id="offer-form-error" hidden></div>
      <div class="span-2 flex gap-2"><button type="submit" class="btn btn--primary">حفظ</button><button type="button" class="btn btn--outline" data-close>إلغاء</button></div>
    </form>`;
  bindModalClose(modal); openModal(modal);
  const form = document.getElementById('offer-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = form.querySelector('#offer-form-error'); err.hidden = true;
    const data = Object.fromEntries(new FormData(form).entries());
    data.is_active = form.is_active.checked;
    data.provider_name = form.provider_id.selectedOptions[0]?.dataset.name || '';
    try {
      const saved = await adminData.offers.save(data, o?.id);
      if (o) Object.assign(o, saved); else all.push(saved);
      closeModal(modal); onSaved(); toast('تم الحفظ', 'success');
    } catch (ex) { err.textContent = ex.message || 'فشل الحفظ'; err.hidden = false; }
  });
}
