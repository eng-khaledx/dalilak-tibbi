import { PROVIDER_TYPES, CONFIG } from '../../lib/config.js';
import { esc, normalizeArabic, formatPrice } from '../../lib/utils.js';
import { adminData } from '../data.js';
import { taxonomy } from '../../services/taxonomy.js';
import { toast, openModal, closeModal, bindModalClose } from '../../components/ui.js';

let all = [];
let tax = { specialties: [], areas: [], services: [] };
const state = { q: '', type: '', active: '' };

function typeOptions(val) {
  return Object.entries(PROVIDER_TYPES).map(([k, v]) => `<option value="${k}" ${val === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('');
}

function rows(list) {
  if (!list.length) return '<tr><td colspan="7" class="text-center text-muted" style="padding:40px">لا يوجد مقدمو خدمة. اضغط "إضافة مقدم خدمة" لبدء الإدخال.</td></tr>';
  return list.map((p) => `
    <tr>
      <td><strong>${esc(p.name_ar)}</strong><div class="muted">${esc(p.slug || '')}</div></td>
      <td>${esc(PROVIDER_TYPES[p.provider_type]?.label || p.provider_type || '-')}</td>
      <td>${esc(p.specialty_name || '-')}</td>
      <td>${esc(p.area_name || '-')}</td>
      <td>${p.consultation_price ? esc(formatPrice(p.consultation_price)) : '-'}</td>
      <td>
        <label class="switch" title="نشط"><input type="checkbox" data-toggle="is_active" data-id="${esc(p.id)}" ${p.is_active !== false ? 'checked' : ''}><span></span></label>
        <label class="switch" title="مميز" style="margin-inline-start:8px"><input type="checkbox" data-toggle="is_featured" data-id="${esc(p.id)}" ${p.is_featured ? 'checked' : ''}><span></span></label>
      </td>
      <td><div class="actions">
        <a class="btn btn--soft btn--sm btn--icon" href="../provider.html?slug=${encodeURIComponent(p.slug || p.id)}" target="_blank" rel="noopener" title="عرض" aria-label="عرض"><i class="fa-solid fa-eye"></i></a>
        <button type="button" class="btn btn--outline btn--sm btn--icon" data-edit="${esc(p.id)}" title="تعديل" aria-label="تعديل"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="btn btn--danger btn--sm btn--icon" data-delete="${esc(p.id)}" title="حذف" aria-label="حذف"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>`).join('');
}

function filtered() {
  const q = normalizeArabic(state.q);
  return all.filter((p) => (!state.type || p.provider_type === state.type)
    && (state.active === '' || (state.active === '1') === (p.is_active !== false))
    && (!q || (p.search_text || normalizeArabic(p.name_ar)).includes(q)))
    .sort((a, b) => String(a.name_ar).localeCompare(String(b.name_ar), 'ar'));
}

export async function providersView(el) {
  [all, tax.specialties, tax.areas, tax.services] = await Promise.all([
    adminData.providers.all(), taxonomy.specialties({ activeOnly: false }), taxonomy.areas({ activeOnly: false }), taxonomy.services({ activeOnly: false }),
  ]);
  el.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat__label">إجمالي</div><div class="stat__value">${all.length}</div></div>
      <div class="stat"><div class="stat__label">نشط</div><div class="stat__value" style="color:var(--color-success)">${all.filter((p) => p.is_active !== false).length}</div></div>
      <div class="stat"><div class="stat__label">مميز</div><div class="stat__value" style="color:var(--color-gold-600)">${all.filter((p) => p.is_featured).length}</div></div>
      <div class="stat"><div class="stat__label">غير نشط</div><div class="stat__value text-muted">${all.filter((p) => p.is_active === false).length}</div></div>
    </div>
    <div class="admin-toolbar">
      <input class="input" id="p-q" type="search" placeholder="بحث بالاسم..." value="${esc(state.q)}">
      <select class="select" id="p-type"><option value="">كل الأنواع</option>${typeOptions(state.type)}</select>
      <select class="select" id="p-active"><option value="">الكل</option><option value="1" ${state.active === '1' ? 'selected' : ''}>نشط</option><option value="0" ${state.active === '0' ? 'selected' : ''}>غير نشط</option></select>
      <span class="spacer"></span>
      <button type="button" class="btn btn--primary btn--sm" id="p-add"><i class="fa-solid fa-plus"></i> إضافة مقدم خدمة</button>
    </div>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>الاسم</th><th>النوع</th><th>التخصص</th><th>المنطقة</th><th>سعر الكشف</th><th>نشط / مميز</th><th>الإجراءات</th></tr></thead>
      <tbody></tbody></table></div>`;

  const tbody = el.querySelector('tbody');
  const draw = () => { tbody.innerHTML = rows(filtered()); };
  draw();
  el.querySelector('#p-q').addEventListener('input', (e) => { state.q = e.target.value; draw(); });
  el.querySelector('#p-type').addEventListener('change', (e) => { state.type = e.target.value; draw(); });
  el.querySelector('#p-active').addEventListener('change', (e) => { state.active = e.target.value; draw(); });
  el.querySelector('#p-add').addEventListener('click', () => openForm(null, draw));

  tbody.addEventListener('change', async (e) => {
    const t = e.target.closest('[data-toggle]');
    if (!t) return;
    try {
      await adminData.providers.toggle(t.dataset.id, t.dataset.toggle, t.checked);
      const p = all.find((x) => x.id === t.dataset.id); if (p) p[t.dataset.toggle] = t.checked;
      toast('تم الحفظ', 'success');
    } catch (_) { t.checked = !t.checked; toast('فشل الحفظ', 'error'); }
  });
  tbody.addEventListener('click', async (e) => {
    const ed = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-delete]');
    if (ed) openForm(all.find((x) => x.id === ed.dataset.edit), draw);
    if (del) {
      const p = all.find((x) => x.id === del.dataset.delete);
      if (p && confirm(`حذف "${p.name_ar}"؟ لا يمكن التراجع.`)) {
        try { await adminData.providers.remove(p.id); all = all.filter((x) => x.id !== p.id); draw(); toast('تم الحذف', 'success'); }
        catch (_) { toast('فشل الحذف', 'error'); }
      }
    }
  });
}

function openForm(p, onSaved) {
  const modal = document.getElementById('edit-modal');
  document.getElementById('edit-modal-title').textContent = p ? `تعديل: ${p.name_ar}` : 'إضافة مقدم خدمة';
  const opt = (items, val) => items.map((i) => `<option value="${esc(i.id)}" ${i.id === val ? 'selected' : ''}>${esc(i.name_ar)}</option>`).join('');
  const sel = new Set(p?.service_ids || []);
  document.getElementById('edit-modal-body').innerHTML = `
    <form id="provider-form" class="form-grid form-grid--2" novalidate>
      <div class="field span-2"><label class="field__label">الاسم <span class="req">*</span></label><input class="input" name="name_ar" required maxlength="120" value="${esc(p?.name_ar || '')}"></div>
      <div class="field"><label class="field__label">النوع</label><select class="select" name="provider_type">${typeOptions(p?.provider_type || 'DOCTOR')}</select></div>
      <div class="field"><label class="field__label">التخصص</label><select class="select" name="specialty_id"><option value="">—</option>${opt(tax.specialties, p?.specialty_id)}</select></div>
      <div class="field"><label class="field__label">المنطقة</label><select class="select" name="area_id"><option value="">—</option>${opt(tax.areas, p?.area_id)}</select></div>
      <div class="field"><label class="field__label">الرابط (slug)</label><input class="input ltr" name="slug" maxlength="80" placeholder="يُولَّد تلقائيًا" value="${esc(p?.slug || '')}"></div>
      <div class="field"><label class="field__label">الهاتف</label><input class="input ltr" name="phone" maxlength="16" value="${esc(p?.phone || '')}"></div>
      <div class="field"><label class="field__label">واتساب</label><input class="input ltr" name="whatsapp" maxlength="16" placeholder="201xxxxxxxxx" value="${esc(p?.whatsapp || '')}"></div>
      <div class="field"><label class="field__label">سعر الكشف (ج.م)</label><input class="input ltr" name="consultation_price" type="number" min="0" step="1" value="${p?.consultation_price ?? ''}"></div>
      <div class="field"><label class="field__label">رابط الصورة</label><input class="input ltr" name="image_url" type="url" maxlength="400" value="${esc(p?.image_url || '')}"></div>
      <div class="field span-2"><label class="field__label">الخدمات</label>
        <div class="chips">${tax.services.map((s) => `<label class="chip" style="cursor:pointer"><input type="checkbox" name="service_ids" value="${esc(s.id)}" data-name="${esc(s.name_ar)}" ${sel.has(s.id) ? 'checked' : ''} style="accent-color:var(--color-navy)"> ${esc(s.name_ar)}</label>`).join('')}</div></div>
      <div class="field span-2"><label class="field__label">العنوان</label><input class="input" name="address" maxlength="200" value="${esc(p?.address || '')}"></div>
      <div class="field span-2"><label class="field__label">مواعيد العمل</label><textarea class="textarea" name="working_hours" maxlength="400" style="min-height:70px">${esc(p?.working_hours || '')}</textarea></div>
      <div class="field span-2"><label class="field__label">نبذة</label><textarea class="textarea" name="about" maxlength="1200">${esc(p?.about || '')}</textarea></div>
      <div class="span-2 flex gap-3 wrap">
        <label class="checkbox"><input type="checkbox" name="is_active" ${p ? (p.is_active !== false ? 'checked' : '') : 'checked'}> نشط (يظهر في الموقع)</label>
        <label class="checkbox"><input type="checkbox" name="is_featured" ${p?.is_featured ? 'checked' : ''}> مميز (يظهر في الرئيسية)</label>
      </div>
      <div class="alert alert--error span-2" id="provider-form-error" hidden></div>
      <div class="span-2 flex gap-2"><button type="submit" class="btn btn--primary">حفظ</button><button type="button" class="btn btn--outline" data-close>إلغاء</button></div>
    </form>`;
  bindModalClose(modal);
  openModal(modal);

  const form = document.getElementById('provider-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = form.querySelector('#provider-form-error'); err.hidden = true;
    const fd = new FormData(form);
    const data = Object.fromEntries([...fd.entries()].filter(([k]) => k !== 'service_ids'));
    const checked = [...form.querySelectorAll('input[name="service_ids"]:checked')];
    data.service_ids = checked.map((c) => c.value);
    data.service_names = checked.map((c) => c.dataset.name);
    data.is_active = form.is_active.checked;
    data.is_featured = form.is_featured.checked;
    data.city_id = p?.city_id || CONFIG.defaultCity.id;
    data.specialty_name = tax.specialties.find((s) => s.id === data.specialty_id)?.name_ar || '';
    data.area_name = tax.areas.find((a) => a.id === data.area_id)?.name_ar || '';
    const btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
    try {
      const saved = await adminData.providers.save(data, p?.id);
      if (p) Object.assign(p, saved); else all.push(saved);
      closeModal(modal); onSaved(); toast('تم الحفظ', 'success');
    } catch (ex) { err.textContent = ex.message || 'فشل الحفظ'; err.hidden = false; }
    finally { btn.disabled = false; }
  });
}
