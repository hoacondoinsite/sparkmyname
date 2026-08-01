// Returns the individual name cards for one of the logged-in customer's reports.
// Verifies the login token, confirms the report belongs to that email, then
// returns the lightweight card data (no heavy kit) for fast portal display.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let token = '', reportId = '';
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    reportId = (b.report_id || '').replace(/[^a-z0-9]/g, '').slice(0, 32);
  } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });
  if (!reportId) return resp(400, { ok: false, error: 'no_report_id' });

  // Verify token -> email
  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE } });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  // Read this report's names — but ONLY if the report belongs to this email.
  try {
    const r = await fetch(
      SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(reportId) +
      '&email=eq.' + encodeURIComponent(email) +
      '&select=position,name,tagline,domain,domain_available,handle,score,kind&order=position.asc&limit=200',
      { headers: { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' } }
    );
    if (r.status >= 300) return resp(502, { ok: false, error: 'read_failed' });
    const rows = await r.json().catch(function () { return []; });
    return resp(200, { ok: true, report_id: reportId, names: Array.isArray(rows) ? rows : [] });
  } catch (e) { return resp(502, { ok: false, error: 'read_exception' }); }
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
