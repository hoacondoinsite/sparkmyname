// File: netlify/functions/unlock-addon.js | Date: 2026-07-17 | Phase 2 Step 1
// ADD-ON ENTITLEMENT — state read + reconcile. All add-on tiers are PAID (Stripe);
// the webhook writes kit._addons on payment. This endpoint lets the Command Center
// confirm/refresh the current unlocked state for a brand right after checkout return,
// without polling the heavier report-data — and it honors the T3→T1+T2 cascade.
// Security: set-favorite pattern (token → email → ownership). No writes here except an
// optional idempotent cascade-repair when a paid tier's included sub-tiers are missing.
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

function resp(code, obj){ return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
function svcH(extra){ const h = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' }; for (const k in (extra || {})) h[k] = extra[k]; return h; }
function cascade(tier){ return tier === 't3' ? ['t1', 't2', 't3'] : tier === 't2' ? ['t2'] : tier === 't1' ? ['t1'] : []; }
// inclusive read: a tier counts as unlocked if its own flag is on OR a higher paid tier includes it
function unlockedMap(addons){
  addons = addons || {};
  const on = function (t) { return !!(addons[t] && addons[t].on === true); };
  const t3 = on('t3');
  return { t1: on('t1') || t3, t2: on('t2') || t3, t3: t3 };
}

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
    const target = (Array.isArray(rows) ? rows : []).find(function(x){ return x && x.name === name; });
    if (!target) return resp(404, { ok: false, error: 'name_not_found' });
    const kit = (target.kit && typeof target.kit === 'object' && !Array.isArray(target.kit)) ? target.kit : {};
    const addons = (kit._addons && typeof kit._addons === 'object') ? kit._addons : {};

    // idempotent cascade-repair: if a higher paid tier is on but an included sub-tier flag
    // is missing (e.g., a partial write), reconcile it. Never un-sets anything.
    let changed = false;
    if (addons.t3 && addons.t3.on === true) {
      ['t1', 't2'].forEach(function (t) { if (!addons[t] || addons[t].on !== true) { addons[t] = { on: true, at: (addons.t3.at || new Date().toISOString()), via: 't3' }; changed = true; } });
    }
    if (changed) {
      kit._addons = addons;
      try {
        await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&position=eq.' + encodeURIComponent(String(target.position)), {
          method: 'PATCH', headers: svcH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
          body: JSON.stringify({ kit: kit })
        });
      } catch (e) {}
    }

    return resp(200, { ok: true, unlocked: unlockedMap(addons), activated: kit._activated === true });
  } catch (e) { return resp(502, { ok: false, error: 'op_failed' }); }
};
