// PERMANENT purge of a logged-in customer's OWN already-trashed reports.
// SAFETY: this can ONLY hard-delete rows that are ALREADY soft-deleted
// (deleted_at IS NOT NULL) for the verified email. It can never touch a live
// Brand Identity Strategy. Mirrors delete-report.js security (verify token -> email,
// only ever touch THAT email's rows).
// Body: { access_token }            -> empties this email's Recently Deleted
//       { access_token, id }        -> forever-deletes ONE trashed report
// Deletes the report_names children first, then the reports rows.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let token = '', id = '';
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    id = String(b.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
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

  const GET = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' };
  const DEL = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Prefer': 'return=minimal' };

  try {
    // 2) Collect the TRASHED report ids for this email (and the one id, if given).
    //    CRITICAL: we only ever select rows where deleted_at IS NOT NULL.
    let url = SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) + '&deleted_at=not.is.null&select=id';
    if (id) url += '&id=eq.' + encodeURIComponent(id);
    const r = await fetch(url, { headers: GET });
    if (r.status >= 300) return resp(502, { ok: false, error: 'lookup_failed' });
    const rows = await r.json().catch(function () { return []; });
    const ids = (Array.isArray(rows) ? rows : []).map(function (x) { return x && x.id; }).filter(Boolean);
    if (!ids.length) return resp(200, { ok: true, purged: 0, note: 'nothing_in_trash' });

    const inList = '(' + ids.map(function (x) { return encodeURIComponent(x); }).join(',') + ')';

    // 3) Delete child name rows first (best-effort; ignore if table/col differs or cascades).
    try {
      await fetch(SB_URL + '/rest/v1/report_names?report_id=in.' + inList, { method: 'DELETE', headers: DEL });
    } catch (e) {}

    // 4) Hard-delete the trashed reports themselves \u2014 scoped to email AND deleted_at NOT NULL.
    const d = await fetch(
      SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) + '&deleted_at=not.is.null&id=in.' + inList,
      { method: 'DELETE', headers: DEL }
    );
    if (d.status >= 300) return resp(502, { ok: false, error: 'purge_failed' });
    return resp(200, { ok: true, purged: ids.length });
  } catch (e) {
    return resp(502, { ok: false, error: 'op_failed' });
  }
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
