// Mark / unmark a logged-in customer's OWN kit as a favorite.
// Security mirrors delete-report.js: the browser sends its Supabase access token;
// we verify it to get the real email, and only ever touch rows for THAT email.
// Body: { access_token, id, favorite: true|false }
// Requires a column on the reports table:  favorite boolean default false
// If that column doesn't exist yet, we return ok with note:'no_column' so the
// hub never breaks — the heart just won't persist until the column is added.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let token = '', id = '', favorite = false;
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    id = String(b.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    favorite = (b.favorite === true);
  } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });
  if (!id) return resp(400, { ok: false, error: 'no_id' });

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

  try {
    // Confirm THIS email owns the kit before touching it.
    const chk = await fetch(
      SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id) + '&email=eq.' + encodeURIComponent(email) + '&select=id',
      { headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' } }
    );
    const owned = await chk.json().catch(function () { return []; });
    if (!Array.isArray(owned) || !owned.length) return resp(200, { ok: true, note: 'not_owned' });

    const r = await fetch(
      SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id) + '&email=eq.' + encodeURIComponent(email),
      { method: 'PATCH', headers: H, body: JSON.stringify({ favorite: favorite }) }
    );
    // 400 here almost always means the column isn't added yet — degrade gracefully.
    if (r.status >= 300) return resp(200, { ok: true, note: 'no_column' });
    return resp(200, { ok: true, id: id, favorite: favorite });
  } catch (e) {
    return resp(502, { ok: false, error: 'op_failed' });
  }
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
