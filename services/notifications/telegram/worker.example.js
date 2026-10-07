/**
 * Telegram relay — Cloudflare Worker (example, deploy separately).
 *
 * Purpose: keep TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID off the browser.
 * The static site POSTs { type:'lead', lead_id, text } to this worker;
 * the worker forwards it to the Telegram Bot API.
 *
 * Deploy:
 *   wrangler secret put TELEGRAM_BOT_TOKEN
 *   wrangler secret put TELEGRAM_CHAT_ID
 *   wrangler secret put ALLOWED_ORIGIN   (e.g. https://your-domain.com)
 *
 * Then set CONFIG.notifications.telegram.webhookUrl in js/lib/config.js
 * to the worker URL.
 */
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '*';
    const cors = {
      'Access-Control-Allow-Origin': allowed === '*' ? '*' : (origin === allowed ? origin : 'null'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });
    if (allowed !== '*' && origin !== allowed) return new Response('Forbidden', { status: 403, headers: cors });

    let body;
    try { body = await request.json(); } catch (_) { return new Response('Bad Request', { status: 400, headers: cors }); }

    const text = typeof body.text === 'string' ? body.text.slice(0, 3500) : '';
    if (!text) return new Response('Bad Request', { status: 400, headers: cors });

    // Very small in-memory rate limit per IP (best effort on the edge)
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    });

    return new Response(JSON.stringify({ ok: res.ok }), {
      status: res.ok ? 200 : 502,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
