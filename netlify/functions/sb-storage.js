// sb-storage.js — Supabase Storage helper for cinematic header images.
// Ensures a PUBLIC bucket exists, uploads PNG bytes, returns the public URL.
// No schema change required. Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var BUCKET = process.env.SMN_HEADER_BUCKET || 'brand-headers';

function h(extra) { var o = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }; if (extra) { for (var k in extra) o[k] = extra[k]; } return o; }

// Create the public bucket. If it already exists, that's fine — treat as success.
async function ensureBucket() {
  if (!SB_URL || !SB_KEY) return { ok: false, error: 'missing_supabase_env' };
  try {
    var r = await fetch(SB_URL + '/storage/v1/bucket', {
      method: 'POST', headers: h({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true })
    });
    if (r.status < 300) return { ok: true, created: true };
    var t = ''; try { t = await r.text(); } catch (e) {}
    if (/already exists|duplicate|resource already/i.test(t)) return { ok: true, created: false };
    return { ok: true, created: false, note: t.slice(0, 140) }; // best-effort; assume usable
  } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
}

// Upload base64 PNG bytes to bucket/path, return the public URL.
async function uploadPng(path, b64, contentType) {
  if (!SB_URL || !SB_KEY) return { ok: false, error: 'missing_supabase_env' };
  try {
    var bytes = Buffer.from(String(b64 || ''), 'base64');
    var r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST', headers: h({ 'Content-Type': contentType || 'image/png', 'x-upsert': 'true' }), body: bytes
    });
    if (r.status >= 300) { var t = ''; try { t = await r.text(); } catch (e) {} return { ok: false, status: r.status, error: t.slice(0, 200) }; }
    return { ok: true, url: SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + path };
  } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
}

// Atomic ONCE-ONLY claim. Writes an object only if it does NOT already exist (x-upsert:false).
// First caller  -> { claimed:true }.  Later callers -> { claimed:false, exists:true }.
// Store unreachable / any unexpected error -> { claimed:true, degraded:true }  (FAIL-OPEN:
// a paid order must never be silently dropped just because the lock store hiccuped).
// Used to guarantee a Stripe session is built + emailed exactly once even though delivery
// can now be triggered from two places (the success page AND the Stripe webhook).
async function claimOnce(path, note) {
  if (!SB_URL || !SB_KEY) return { claimed: true, degraded: true };
  try {
    var r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST',
      headers: h({ 'Content-Type': 'text/plain', 'x-upsert': 'false' }),
      body: String(note || '')
    });
    if (r.status < 300) return { claimed: true };
    var t = ''; try { t = await r.text(); } catch (e) {}
    if (r.status === 409 || /exist|duplicate/i.test(t)) return { claimed: false, exists: true };
    return { claimed: true, degraded: true, note: t.slice(0, 140) }; // fail-open
  } catch (e) { return { claimed: true, degraded: true, error: String(e && e.message || e) }; }
}

module.exports = { ensureBucket: ensureBucket, uploadPng: uploadPng, claimOnce: claimOnce, BUCKET: BUCKET };
