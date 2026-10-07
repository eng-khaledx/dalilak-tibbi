/**
 * Lead / contact request modal. Shared across all pages.
 * Usage: openLeadModal({ provider, service, leadType, source })
 */
import { esc } from '../lib/utils.js';
import { leads } from '../services/leads.js';
import { taxonomy } from '../services/taxonomy.js';
import { openModal, closeModal, bindModalClose, toast } from './ui.js';
import { whatsapp } from '../services/whatsapp.js';
import { CONFIG } from '../lib/config.js';

let modalEl = null;
let taxonomyLoaded = false;

function template() {
  return `
  <div class="modal" id="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__dialog">
      <div class="modal__header">
        <div>
          <h2 class="modal__title" id="lead-modal-title">اطلب التواصل</h2>
          <p class="modal__subtitle" id="lead-modal-subtitle">اترك بياناتك وسنتواصل معك بخصوص طلبك.</p>
        </div>
        <button type="button" class="modal__close" data-close aria-label="إغلاق"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <div class="modal__body">
        <form id="lead-form" novalidate>
          <input type="hidden" name="provider_id">
          <input type="hidden" name="lead_type" value="PATIENT">
          <input type="hidden" name="source" value="website">
          <!-- honeypot -->
          <div style="position:absolute;left:-9999px" aria-hidden="true"><label>الموقع<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>

          <div class="form-grid form-grid--2">
            <div class="field">
              <label class="field__label" for="lead-name">الاسم <span class="req">*</span></label>
              <input class="input" id="lead-name" name="name" autocomplete="name" maxlength="80" required>
              <span class="field__error"></span>
            </div>
            <div class="field">
              <label class="field__label" for="lead-phone">رقم الهاتف <span class="req">*</span></label>
              <input class="input ltr" id="lead-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="01xxxxxxxxx" maxlength="16" required>
              <span class="field__error"></span>
            </div>
            <div class="field span-2">
              <label class="field__label" for="lead-service">الخدمة / التخصص <span class="req">*</span></label>
              <select class="select" id="lead-service" name="service">
                <option value="">اختر...</option>
              </select>
              <span class="field__error"></span>
            </div>
            <div class="field span-2" id="lead-provider-field">
              <label class="field__label" for="lead-provider">الطبيب أو المركز</label>
              <input class="input" id="lead-provider" name="provider_name" maxlength="120" placeholder="اختياري">
            </div>
            <div class="field span-2">
              <label class="field__label" for="lead-area">المنطقة</label>
              <select class="select" id="lead-area" name="area_id">
                <option value="">اختر المنطقة</option>
              </select>
            </div>
            <div class="field span-2">
              <label class="field__label" for="lead-notes">ملاحظات</label>
              <textarea class="textarea" id="lead-notes" name="notes" maxlength="600" placeholder="اختياري — أي تفاصيل تساعدنا نخدمك أفضل"></textarea>
              <span class="field__hint">لا تكتب معلومات طبية حساسة. سنطلب ما نحتاجه عند التواصل.</span>
            </div>
          </div>

          <div class="alert alert--error mt-4" id="lead-form-error" hidden role="alert"></div>

          <button type="submit" class="btn btn--primary btn--lg btn--block mt-6" id="lead-submit">
            <span class="btn__label">إرسال الطلب</span>
          </button>
          <p class="text-muted text-center mt-4" style="font-size:var(--text-xs)">بإرسال الطلب أنت توافق على <a href="privacy.html" style="text-decoration:underline">سياسة الخصوصية</a>.</p>
        </form>

        <div id="lead-success" hidden>
          <div class="state" style="border-style:solid;border-color:var(--color-success-bg)">
            <div class="state__icon" style="background:var(--color-success-bg);color:var(--color-success)"><i class="fa-solid fa-check" aria-hidden="true"></i></div>
            <h3 class="state__title">تم استلام طلبك بنجاح</h3>
            <p class="state__text">سنتواصل معك بخصوص طلبك.</p>
            <div class="state__actions">
              <a class="btn btn--whatsapp" id="lead-success-wa" href="#" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> تواصل عبر واتساب الآن</a>
              <button type="button" class="btn btn--outline" data-close>إغلاق</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function ensureMounted() {
  if (modalEl) return modalEl;
  document.body.insertAdjacentHTML('beforeend', template());
  modalEl = document.getElementById('lead-modal');
  bindModalClose(modalEl);
  modalEl.querySelector('#lead-form').addEventListener('submit', onSubmit);
  // Clear field errors while typing
  modalEl.querySelectorAll('.input, .select, .textarea').forEach((el) => {
    el.addEventListener('input', () => el.closest('.field')?.classList.remove('is-invalid'));
  });
  return modalEl;
}

async function loadTaxonomy(leadType) {
  const svc = modalEl.querySelector('#lead-service');
  const area = modalEl.querySelector('#lead-area');
  const [specs, services, areas] = await Promise.all([taxonomy.specialties(), taxonomy.services(), taxonomy.areas({ cityId: CONFIG.defaultCity.id })]);

  const groups = leadType === 'PROVIDER'
    ? [{ label: 'نوع الخدمة', items: specs }]
    : [{ label: 'التخصصات', items: specs }, { label: 'الخدمات', items: services }];

  svc.innerHTML = '<option value="">اختر...</option>' + groups.map((g) => `<optgroup label="${esc(g.label)}">${g.items.map((i) => `<option value="${esc(i.name_ar)}">${esc(i.name_ar)}</option>`).join('')}</optgroup>`).join('')
    + '<option value="أخرى">أخرى</option>';
  area.innerHTML = '<option value="">اختر المنطقة</option>' + areas.map((a) => `<option value="${esc(a.id)}" data-name="${esc(a.name_ar)}">${esc(a.name_ar)}</option>`).join('');
  taxonomyLoaded = true;
}

function setError(field, msg) {
  const f = modalEl.querySelector(`[name="${field}"]`)?.closest('.field');
  if (!f) return;
  f.classList.add('is-invalid');
  const e = f.querySelector('.field__error');
  if (e) e.textContent = msg;
}

async function onSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const btn = form.querySelector('#lead-submit');
  const errBox = form.querySelector('#lead-form-error');
  errBox.hidden = true;
  form.querySelectorAll('.is-invalid').forEach((f) => f.classList.remove('is-invalid'));

  const fd = new FormData(form);
  const areaSel = form.querySelector('#lead-area');
  const payload = Object.fromEntries(fd.entries());
  payload.area_name = areaSel.selectedOptions[0]?.dataset.name || '';

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> جارٍ الإرسال...';
  try {
    const res = await leads.submit(payload);
    if (!res.ok) {
      if (res.errors._spam) { // silently "succeed" for bots
        showSuccess(payload);
        return;
      }
      Object.entries(res.errors).forEach(([k, v]) => { if (k === '_form') { errBox.textContent = v; errBox.hidden = false; } else setError(k, v); });
      const firstInvalid = form.querySelector('.is-invalid .input, .is-invalid .select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    showSuccess(payload);
    if (!res.notified) {
      // Not visible to end user — the lead is saved; ops gets it from admin.
      console.info('[leads] saved; telegram notification skipped/failed');
    }
  } catch (err) {
    console.error(err);
    errBox.textContent = 'تعذّر إرسال الطلب الآن. حاول مرة أخرى أو تواصل معنا عبر واتساب.';
    errBox.hidden = false;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn__label">إرسال الطلب</span>';
  }
}

function showSuccess(payload) {
  const form = modalEl.querySelector('#lead-form');
  const ok = modalEl.querySelector('#lead-success');
  form.hidden = true;
  ok.hidden = false;
  const who = payload.provider_name || payload.service || '';
  modalEl.querySelector('#lead-success-wa').href = who
    ? whatsapp.providerInquiryLink(who)
    : whatsapp.platformLink();
  toast('تم استلام طلبك بنجاح', 'success');
}

/**
 * @param {{provider?:object, service?:string, leadType?:'PATIENT'|'PROVIDER', source?:string, title?:string, subtitle?:string}} opts
 */
export async function openLeadModal(opts = {}) {
  ensureMounted();
  const leadType = opts.leadType || 'PATIENT';
  const form = modalEl.querySelector('#lead-form');
  form.reset();
  form.hidden = false;
  modalEl.querySelector('#lead-success').hidden = true;
  modalEl.querySelector('#lead-form-error').hidden = true;

  modalEl.querySelector('#lead-modal-title').textContent = opts.title || (leadType === 'PROVIDER' ? 'أضف خدمتك' : 'اطلب التواصل');
  modalEl.querySelector('#lead-modal-subtitle').textContent = opts.subtitle
    || (leadType === 'PROVIDER' ? 'اترك بياناتك وسنتواصل معك لإضافة خدمتك إلى الدليل.' : 'اترك بياناتك وسنتواصل معك بخصوص طلبك.');

  form.lead_type.value = leadType;
  form.source.value = opts.source || 'website';
  modalEl.querySelector('#lead-provider-field').hidden = leadType === 'PROVIDER';
  modalEl.querySelector('label[for="lead-service"]').innerHTML = leadType === 'PROVIDER'
    ? 'نوع الخدمة التي تقدمها <span class="req">*</span>'
    : 'الخدمة / التخصص <span class="req">*</span>';
  modalEl.querySelector('#lead-notes').placeholder = leadType === 'PROVIDER'
    ? 'اختياري — اسم العيادة/المركز، العنوان، مواعيد العمل'
    : 'اختياري — أي تفاصيل تساعدنا نخدمك أفضل';

  openModal(modalEl);

  if (!taxonomyLoaded || modalEl.__lastType !== leadType) {
    try { await loadTaxonomy(leadType); modalEl.__lastType = leadType; } catch (_) { /* selects stay minimal */ }
  }

  // Prefill
  if (opts.provider) {
    form.provider_id.value = opts.provider.id || '';
    form.provider_name.value = opts.provider.name_ar || '';
    if (opts.provider.specialty_name) selectByText(form.service, opts.provider.specialty_name);
    if (opts.provider.area_id) form.area_id.value = opts.provider.area_id;
  }
  if (opts.service) selectByText(form.service, opts.service);
}

function selectByText(select, text) {
  const opt = [...select.options].find((o) => o.value === text);
  if (opt) select.value = text;
  else {
    const o = document.createElement('option');
    o.value = text; o.textContent = text; o.selected = true;
    select.appendChild(o);
  }
}

/** Delegate clicks on [data-open-lead] anywhere in the page. */
export function bindLeadTriggers(root = document) {
  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-lead]');
    if (!t) return;
    e.preventDefault();
    openLeadModal({
      leadType: t.dataset.leadType || 'PATIENT',
      source: t.dataset.source || currentSource(),
      service: t.dataset.service || '',
      title: t.dataset.title || '',
    });
  });
}

function currentSource() {
  return (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '');
}
