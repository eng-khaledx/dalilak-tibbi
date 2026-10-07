/**
 * Admin access gate (client side).
 *
 * IMPORTANT — honest security note:
 * A static site cannot enforce real authentication; anything in the browser
 * can be read by a determined visitor. This gate stops casual access only.
 * For real protection, put /admin/ behind the hosting platform's route
 * access rules (Hosted Deploy → access control) or an auth proxy.
 *
 * To change the passcode: run in the browser console
 *   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-pass'))
 *     .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))
 * and paste the hex into PASSCODE_SHA256 below.
 */

/** Default passcode: "admin" — CHANGE THIS BEFORE GOING LIVE (see note above). */
export const PASSCODE_SHA256 = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

const KEY = 'dlk:admin-session';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const auth = {
  isAuthenticated() {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      return !!(s && s.ok && s.exp > Date.now());
    } catch (_) { return false; }
  },
  async login(passcode) {
    const state = JSON.parse(localStorage.getItem('dlk:admin-attempts') || '{"n":0,"until":0}');
    if (state.until > Date.now()) {
      return { ok: false, error: `محاولات كثيرة. حاول بعد ${Math.ceil((state.until - Date.now()) / 1000)} ثانية.` };
    }
    const hex = await sha256Hex(String(passcode || ''));
    if (hex === PASSCODE_SHA256) {
      sessionStorage.setItem(KEY, JSON.stringify({ ok: true, exp: Date.now() + 8 * 3600_000 }));
      localStorage.removeItem('dlk:admin-attempts');
      return { ok: true };
    }
    state.n += 1;
    if (state.n >= MAX_ATTEMPTS) { state.n = 0; state.until = Date.now() + LOCK_MS; }
    localStorage.setItem('dlk:admin-attempts', JSON.stringify(state));
    return { ok: false, error: 'كلمة المرور غير صحيحة.' };
  },
  logout() { sessionStorage.removeItem(KEY); },
  actor() { return 'admin'; },
};
