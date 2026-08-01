// export-names.js — ONE-SHOT export of EVERY report this logged-in customer owns.
// Reads the customer's own saved reports (reports) + names (report_names) by email,
// groups names under each report's seed, and returns both structured JSON and a
// ready-to-save plain-text block. Auth = the same access_token the hub uses.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (or SMN_SUPABASE_ANON_KEY).
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
const SBH = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let token = '';
  try { token = (JSON.parse(event.body || '{}').access_token || '').slice(0, 4000); } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });

  // 1) token -> email (only ever returns THIS user's own data)
  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE } });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  // 2) all this email's reports (for the seed/title of each group)
  const seedOf = {}; const order = []; let reportCount = 0;
  try {
    const r = await fetch(SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) +
      '&select=id,seed,created_at&deleted_at=is.null&order=created_at.asc&limit=2000', { headers: SBH });
    const rows = r.status < 300 ? await r.json().catch(function () { return []; }) : [];
    (Array.isArray(rows) ? rows : []).forEach(function (x) { seedOf[x.id] = x.seed || '(untitled)'; order.push(x.id); reportCount++; });
  } catch (e) { return resp(502, { ok: false, error: 'reports_read_failed' }); }

  // 3) ALL names for this email — paginated so any volume comes back (225 reports x ~18 = thousands)
  const namesByReport = {}; let nameCount = 0; let offset = 0; const PAGE = 1000;
  try {
    for (let guard = 0; guard < 50; guard++) {
      const q = SB_URL + '/rest/v1/report_names?email=eq.' + encodeURIComponent(email) +
        '&select=report_id,position,name,domain,domain_available,score' +
        '&order=report_id.asc,position.asc&limit=' + PAGE + '&offset=' + offset;
      const r = await fetch(q, { headers: SBH });
      if (r.status >= 300) break;
      const rows = await r.json().catch(function () { return []; });
      if (!Array.isArray(rows) || !rows.length) break;
      rows.forEach(function (n) {
        (namesByReport[n.report_id] = namesByReport[n.report_id] || []).push(n);
        nameCount++;
      });
      if (rows.length < PAGE) break;
      offset += PAGE;
    }
  } catch (e) { return resp(502, { ok: false, error: 'names_read_failed' }); }

  // 4) assemble grouped result + a ready-to-save text block
  const reports = [];
  const seen = {};
  const idsInOrder = order.length ? order : Object.keys(namesByReport);
  idsInOrder.forEach(function (id) {
    if (seen[id]) return; seen[id] = 1;
    const ns = (namesByReport[id] || []).map(function (n) {
      return { name: n.name, domain: n.domain || '', available: n.domain_available === true, score: (typeof n.score === 'number' ? n.score : null) };
    });
    if (ns.length) reports.push({ seed: seedOf[id] || '(untitled)', names: ns });
  });

  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  let text = 'SparkMyName — All Brand Reports Export\n' + email + '  —  ' + reports.length + ' reports, ' + nameCount + ' names  —  ' + stamp + ' UTC\n';
  reports.forEach(function (rep, i) {
    text += '\n=== ' + (i + 1) + '. ' + rep.seed + ' ===\n';
    rep.names.forEach(function (n, j) {
      text += (j + 1) + '. ' + n.name + (n.domain ? ('  —  ' + n.domain + (n.available ? ' (open)' : '')) : '') + (n.score != null ? ('  [' + n.score + ']') : '') + '\n';
    });
  });

  return resp(200, { ok: true, email: email, report_count: reports.length, name_count: nameCount, reports: reports, text: text });
};
