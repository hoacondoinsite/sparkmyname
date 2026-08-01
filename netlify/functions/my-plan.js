// Returns the logged-in customer's current plan/entitlement (token-verified).
// Lets the hub show "Studio member" vs "one-time" vs "no plan yet" honestly.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let token = '';
  try { token = (JSON.parse(event.body || '{}').access_token || '').slice(0, 4000); } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });

  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE } });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  try {
    const r = await fetch(
      SB_URL + '/rest/v1/entitlements?email=eq.' + encodeURIComponent(email) +
      '&select=plan,status,expires_at&order=created_at.desc&limit=20',
      { headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' } }
    );
    if (r.status >= 300) return resp(502, { ok: false, error: 'read_failed' });
    const rows = await r.json().catch(function () { return []; });
    // Pick the "best" current entitlement: an active studio/plus/agency wins over a one-time spark.
    const order = { enterprise: 6, agencyplus: 5, agency: 4, studio: 3, plus: 2, spark: 1 };
    let best = null;
    (Array.isArray(rows) ? rows : []).forEach(function (e) {
      if (!e || e.status !== 'active') return;
      if (!best || (order[e.plan] || 0) > (order[best.plan] || 0)) best = e;
    });
    return resp(200, { ok: true, email: email, plan: best ? best.plan : '', status: best ? best.status : '', expires_at: best ? best.expires_at : null });
  } catch (e) { return resp(502, { ok: false, error: 'read_exception' }); }
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
