// File: netlify/functions/activate-brand.js | Date: 2026-07-17
// PRODUCT ACTIVATION MODEL — the logic gate.
//   POST { access_token, r, name }
//   · First activation on an order → FREE (included with the purchase): flips
//     kit._activated on that name row and returns { ok, activated:true, free:true }.
//   · Any further activation → { ok:false, error:'payment_required' } so the client
//     routes through Stripe (plan 'activate'); the webhook flips the state on payment.
// Security: set-favorite pattern (token → email → ownership).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

function resp(code, obj){ return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
function svcH(extra){ const h = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' }; for (const k in (extra || {})) h[k] = extra[k]; return h; }

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });
  let token = '', r = '', name = '';
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    r = String(b.r || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    name = String(b.name || '').slice(0, 120);
  } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });
  if (!r || !name) return resp(400, { ok: false, error: 'missing_fields' });

  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE } });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  try {
    const chk = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&email=eq.' + encodeURIComponent(email) + '&select=id', { headers: svcH() });
    const owned = await chk.json().catch(function(){ return []; });
    if (!Array.isArray(owned) || !owned.length) return resp(403, { ok: false, error: 'not_owned' });

    const nq = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=position,name,kit&order=position.asc&limit=24', { headers: svcH() });
    const rows = await nq.json().catch(function(){ return []; });
    if (!Array.isArray(rows) || !rows.length) return resp(404, { ok: false, error: 'no_names' });
    const target = rows.find(function(x){ return x && x.name === name; });
    if (!target) return resp(404, { ok: false, error: 'name_not_found' });
    const kit = (target.kit && typeof target.kit === 'object' && !Array.isArray(target.kit)) ? target.kit : {};
    if (kit._activated === true) return resp(200, { ok: true, activated: true, already: true });

    const activatedCount = rows.filter(function(x){ return x && x.kit && x.kit._activated === true; }).length;
    if (activatedCount >= 1) return resp(402, { ok: false, error: 'payment_required' });

    kit._activated = true;
    kit._activated_at = new Date().toISOString();
    kit._activation = 'included';
    const w = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&position=eq.' + encodeURIComponent(String(target.position)), {
      method: 'PATCH', headers: svcH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ kit: kit })
    });
    if (w.status >= 300) return resp(502, { ok: false, error: 'write_failed' });
    return resp(200, { ok: true, activated: true, free: true });
  } catch (e) { return resp(502, { ok: false, error: 'op_failed' }); }
};
