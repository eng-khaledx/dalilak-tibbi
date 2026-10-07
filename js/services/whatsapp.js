/**
 * WhatsApp link abstraction.
 * Today this builds wa.me deep links; later a WhatsApp Business API
 * adapter can replace `buildLink` without touching UI code.
 */
import { CONFIG } from '../lib/config.js';

function encodeMsg(text) {
  return encodeURIComponent(text);
}

export const whatsapp = {
  /** Platform WhatsApp (the owner's number). */
  platformLink(message) {
    const text = message || `مرحبًا، أريد الاستفسار من خلال ${CONFIG.brand.nameAr}.`;
    return `https://wa.me/${CONFIG.contact.whatsappNumber}?text=${encodeMsg(text)}`;
  },

  /** Prefilled message about a specific provider, sent to the platform. */
  providerInquiryLink(providerName) {
    const text = `مرحبًا، أريد الاستفسار عن ${providerName} من خلال ${CONFIG.brand.nameAr}.`;
    return this.platformLink(text);
  },

  /** Help request (when nothing was found). */
  helpLink(query) {
    const text = query
      ? `مرحبًا، أبحث عن "${query}" ولم أجده في ${CONFIG.brand.nameAr}. هل يمكنكم مساعدتي؟`
      : `مرحبًا، أحتاج مساعدة في إيجاد خدمة طبية من خلال ${CONFIG.brand.nameAr}.`;
    return this.platformLink(text);
  },

  /** Direct link to a specific number (admin actions). */
  directLink(internationalDigits, message = '') {
    const base = `https://wa.me/${internationalDigits}`;
    return message ? `${base}?text=${encodeMsg(message)}` : base;
  },
};
