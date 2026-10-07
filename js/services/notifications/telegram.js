/**
 * Telegram notification adapter (client side).
 *
 * Security model:
 *   The browser NEVER holds TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.
 *   Instead it POSTs a small JSON payload to a relay endpoint
 *   (CONFIG.notifications.telegram.webhookUrl) — e.g. the Cloudflare
 *   Worker in services/notifications/telegram/worker.example.js — which
 *   reads the secrets from its environment and calls the Bot API.
 *
 * Failure model:
 *   This function never throws. The caller saves the lead first and only
 *   then calls notify(); a Telegram failure can never lose a lead.
 */
import { CONFIG } from '../../lib/config.js';

function formatLeadMessage(lead) {
  const lines = [
    `🩺 طلب جديد — ${CONFIG.brand.nameAr}`,
    '',
    `👤 الاسم: ${lead.name}`,
    `📞 الهاتف: ${lead.phone}`,
    lead.service ? `🔎 الخدمة: ${lead.service}` : null,
    lead.provider_name ? `🏥 الطبيب/المركز: ${lead.provider_name}` : null,
    lead.area_name ? `📍 المنطقة: ${lead.area_name}` : null,
    lead.notes ? `📝 ملاحظات: ${lead.notes}` : null,
    '',
    `النوع: ${lead.lead_type === 'PROVIDER' ? 'مقدم خدمة' : 'مريض'}`,
    `المصدر: ${lead.source || '-'}`,
    `المعرف: ${lead.id}`,
  ];
  return lines.filter((l) => l !== null).join('\n');
}

export const telegram = {
  isConfigured() {
    return Boolean(CONFIG.notifications.telegram.webhookUrl);
  },

  /**
   * @returns {Promise<{ok:boolean, skipped?:boolean, error?:string}>}
   */
  async notifyLead(lead) {
    const { webhookUrl, timeoutMs } = CONFIG.notifications.telegram;
    if (!webhookUrl) return { ok: false, skipped: true };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lead', lead_id: lead.id, text: formatLeadMessage(lead) }),
        signal: controller.signal,
      });
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err && err.message ? err.message : 'network' };
    } finally {
      clearTimeout(timer);
    }
  },
};
