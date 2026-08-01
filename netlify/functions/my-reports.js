// Returns the list of reports belonging to a logged-in customer.
// Security: the browser sends the Supabase access token it got at login.
// We verify that token with Supabase (so a user can ONLY see their own email's
// reports), then read the reports list with the service role.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let token = '', scope = 'active';
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    scope = (b.scope === 'deleted') ? 'deleted' : 'active';
  } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });

  // 1) Verify the token -> get the real email of whoever is logged in.
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

  // 2) Read THIS email's reports (service role; never exposes other users' data).
  //    Filter by the soft-delete marker; if the column doesn't exist yet, fall back
  //    to the unfiltered list so the hub never breaks.
  const base = SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) + '&select=id,seed,name_count,created_at,favorite&order=created_at.desc&limit=2000';
  const baseBasic = SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) + '&select=id,seed,name_count,created_at&order=created_at.desc&limit=2000';
  const SBH = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' };
  const filt = scope === 'deleted' ? '&deleted_at=not.is.null' : '&deleted_at=is.null';
  try {
    let rows = [];
    let r = await fetch(base + filt, { headers: SBH });
    if (r.status >= 300) {
      // Column likely not added yet — fall back to everything (active view only).
      if (scope === 'deleted') return resp(200, { ok: true, email: email, reports: [], deleted_count: 0 });
      r = await fetch(baseBasic + filt, { headers: SBH });
      if (r.status >= 300) return resp(502, { ok: false, error: 'read_failed' });
      rows = await r.json().catch(function () { return []; });
      return resp(200, { ok: true, email: email, reports: Array.isArray(rows) ? rows : [], deleted_count: 0 });
    }
    rows = await r.json().catch(function () { return []; });

    // For the active view, also report how many are sitting in "recently deleted".
    let deletedCount = 0;
    if (scope === 'active') {
      try {
        const dc = await fetch(SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) + '&select=id&deleted_at=not.is.null&limit=2000', { headers: SBH });
        if (dc.status < 300) { const dr = await dc.json().catch(function () { return []; }); deletedCount = Array.isArray(dr) ? dr.length : 0; }
      } catch (e) {}
    }
    // Defensive: mark which reports have a chosen ("this is the one") name. Never breaks the hub.
    /* SAME FIX, SAME REASON (2026-07-27). This block had the identical fault as the header
       lookup below: one unbounded request for every brand, plus a 300-brand cap that hid the
       problem by simply giving up. Batched with an explicit limit so the "chosen" flag is
       correct for a customer with 20 brands or 2,000. */
    if (scope === 'active' && Array.isArray(rows) && rows.length) {
      try {
        const ids = rows.map(function (x) { return x && x.id; }).filter(Boolean);
        const chosen = {};
        for (let i = 0; i < ids.length; i += 100) {
          const batch = ids.slice(i, i + 100);
          const inList = '(' + batch.map(function (b) { return encodeURIComponent(b); }).join(',') + ')';
          const cq = await fetch(SB_URL + '/rest/v1/report_names?report_id=in.' + inList +
            '&kit->>_chosen=eq.true&select=report_id&limit=2000', { headers: SBH });
          if (cq.status >= 300) continue;
          const cr = await cq.json().catch(function () { return []; });
          (Array.isArray(cr) ? cr : []).forEach(function (x) { if (x && x.report_id) chosen[x.report_id] = 1; });
        }
        rows.forEach(function (x) { if (x && chosen[x.id]) x.chosen = true; });
      } catch (e) {}
    }
    // Defensive: attach the shared category header image (Art Department library) + vertical.
    // One image per category, same across every concept in the report. Never breaks the hub.
    /* BATCHED HEADER LOOKUP (2026-07-27 — BUG FIX).
       THE BUG: this asked for every brand's header in ONE request with no row limit. Supabase
       returns at most 1000 rows by default. A customer with 247 brands has ~1,480 name-rows, so
       roughly a third were silently dropped — and with no ORDER clause, WHICH third was
       arbitrary, so the missing photos looked random and moved around on refresh. It read like
       slow loading; the images were simply never sent. The old 300-brand cap hid the same fault
       by giving up entirely above 300.
       THE FIX: ask in batches of 100 ids with an explicit limit, so every brand is covered no
       matter how many they own, and the request URL can never grow long enough to be rejected. */
    if (scope === 'active' && Array.isArray(rows) && rows.length) {
      try {
        const ids2 = rows.map(function (x) { return x && x.id; }).filter(Boolean);
        const seen = {};
        for (let i = 0; i < ids2.length; i += 100) {
          const batch = ids2.slice(i, i + 100);
          const inList2 = '(' + batch.map(function (b) { return encodeURIComponent(b); }).join(',') + ')';
          const hq = await fetch(SB_URL + '/rest/v1/report_names?report_id=in.' + inList2 +
            '&kit->>headerUrl=not.is.null&select=report_id,header:kit->>headerUrl,vertical:kit->>vertical' +
            '&order=position.asc&limit=2000', { headers: SBH });
          if (hq.status >= 300) continue;          // one bad batch must not lose the others
          const hr = await hq.json().catch(function () { return []; });
          (Array.isArray(hr) ? hr : []).forEach(function (x) {
            if (x && x.report_id && x.header && !seen[x.report_id]) seen[x.report_id] = { h: x.header, v: x.vertical || '' };
          });
        }
        rows.forEach(function (x) { if (x && seen[x.id]) { x.header = seen[x.id].h; x.vertical = seen[x.id].v; } });
      } catch (e) {}
    }
    return resp(200, { ok: true, email: email, reports: Array.isArray(rows) ? rows : [], deleted_count: deletedCount });
  } catch (e) { return resp(502, { ok: false, error: 'read_exception' }); }
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
