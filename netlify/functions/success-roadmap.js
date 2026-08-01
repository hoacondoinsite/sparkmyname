// File: netlify/functions/success-roadmap.js | Date: 2026-07-16
// BRAND SUCCESS ROADMAP — reads/writes the customer's milestone state
// (Logos Downloaded → Domain Connected → First Launch Graphic Posted).
// Storage: kit._roadmap JSON on the order's LEAD report_names row — an existing
// JSON column, written the same way production curation writes kit._kept/_chosen.
// No new columns, no invented tables.
//   GET  ?r=KEY                                → { ok, roadmap }   (key-holder read, same trust model as report-data)
//   POST { access_token, r, step, done }       → { ok, roadmap }   (token verified → email → ownership enforced, set-favorite pattern)
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY)
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';
const STEPS = ['logos', 'domain', 'post'];

function resp(code, obj){ return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
function cleanKey(v){ return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64); }
function normalize(rm){
  var out = {};
  for (var i = 0; i < STEPS.length; i++) out[STEPS[i]] = !!(rm && rm[STEPS[i]] === true);
  return out;
}
function svcH(extra){
  var h = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' };
  for (var k in (extra || {})) h[k] = extra[k];
  return h;
}
async function leadRow(r){
  const q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
    '&select=position,kit&order=position.asc&limit=1', { headers: svcH() });
  if (!q.ok) return null;
  const rows = await q.json().catch(function(){ return []; });
  return (Array.isArray(rows) && rows[0]) ? rows[0] : null;
}

exports.handler = async function (event) {
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  /* ---------- GET: read the roadmap ---------- */
  if (event.httpMethod === 'GET'){
    const r = cleanKey((event.queryStringParameters || {}).r);
    if (!r) return resp(400, { ok: false, error: 'missing_r' });
    try {
      const row = await leadRow(r);
      if (!row) return resp(404, { ok: false, error: 'not_found' });
      const kit = (row.kit && typeof row.kit === 'object' && !Array.isArray(row.kit)) ? row.kit : {};
      return resp(200, { ok: true, roadmap: normalize(kit._roadmap) });
    } catch (e) { return resp(502, { ok: false, error: 'read_failed' }); }
  }

  /* ---------- POST: toggle one milestone ---------- */
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  let token = '', r = '', step = '', done = false;
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    r = cleanKey(b.r);
    step = String(b.step || '').toLowerCase().slice(0, 12);
    done = (b.done === true);
  } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });
  if (!r) return resp(400, { ok: false, error: 'missing_r' });
  if (STEPS.indexOf(step) < 0) return resp(400, { ok: false, error: 'bad_step' });

  // 1) token → the real signed-in email (set-favorite pattern)
  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE } });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  try {
    // 2) only the owner may write
    const chk = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) +
      '&email=eq.' + encodeURIComponent(email) + '&select=id', { headers: svcH() });
    const owned = await chk.json().catch(function(){ return []; });
    if (!Array.isArray(owned) || !owned.length) return resp(403, { ok: false, error: 'not_owned' });

    // 3) read-merge-write kit._roadmap on the lead row
    const row = await leadRow(r);
    if (!row) return resp(404, { ok: false, error: 'not_found' });
    const kit = (row.kit && typeof row.kit === 'object' && !Array.isArray(row.kit)) ? row.kit : {};
    const rm = normalize(kit._roadmap);
    rm[step] = done;
    kit._roadmap = { logos: rm.logos, domain: rm.domain, post: rm.post, updated_at: new Date().toISOString() };

    const w = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
      '&position=eq.' + encodeURIComponent(String(row.position)), {
      method: 'PATCH',
      headers: svcH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ kit: kit })
    });
    if (w.status >= 300) return resp(502, { ok: false, error: 'write_failed' });
    return resp(200, { ok: true, roadmap: rm });
  } catch (e) { return resp(502, { ok: false, error: 'op_failed' }); }
};
