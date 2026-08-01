// Soft-delete / recover a logged-in customer's OWN report(s).
// Nothing is ever destroyed: "delete" sets a deleted_at timestamp (hides it from the
// main hub); "recover" clears it (brings it back). Security mirrors my-reports.js:
// the browser sends its Supabase access token; we verify it to get the real email,
// and only ever touch rows for THAT email.
// Body: { access_token, id, action:'delete'|'recover' }   -> one report
//       { access_token, all:true, action:'delete'|'recover' } -> all of this email's
// Requires a nullable column on the reports table:  deleted_at timestamptz
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let token = '', id = '', all = false, action = 'delete';
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    id = String(b.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    all = (b.all === true);
    action = (b.action === 'recover') ? 'recover' : 'delete';
  } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });

  // 1) Verify the token -> the real email of whoever is logged in.
  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', {
      headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE }
    });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  const H = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
  const patchBody = JSON.stringify({ deleted_at: action === 'recover' ? null : new Date().toISOString() });

  try {
    if (all) {
      // Only flip the ones that aren't already in the target state.
      const filter = action === 'recover' ? '&deleted_at=not.is.null' : '&deleted_at=is.null';
      const r = await fetch(SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) + filter, { method: 'PATCH', headers: H, body: patchBody });
      if (r.status >= 300) return resp(502, { ok: false, error: 'update_failed' });
      return resp(200, { ok: true, action: action, scope: 'all' });
    }
    if (!id) return resp(400, { ok: false, error: 'no_id' });

    // Confirm THIS email owns the report before touching it.
    const chk = await fetch(
      SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id) + '&email=eq.' + encodeURIComponent(email) + '&select=id',
      { headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' } }
    );
    const owned = await chk.json().catch(function () { return []; });
    if (!Array.isArray(owned) || !owned.length) return resp(200, { ok: true, action: action, note: 'not_owned' });

    const r = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id) + '&email=eq.' + encodeURIComponent(email), { method: 'PATCH', headers: H, body: patchBody });
    if (r.status >= 300) return resp(502, { ok: false, error: 'update_failed' });
    return resp(200, { ok: true, action: action, id: id });
  } catch (e) {
    return resp(502, { ok: false, error: 'op_failed' });
  }
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
