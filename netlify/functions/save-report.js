// Builds ONE combined report from picked names and stores it in Supabase
// (the `reports` table), returning a short link. Scale-proof: works for 1 or 100+ names.
// The customer's device does NO heavy lifting; the server holds the finished page.
// The login hub (next brick) reads the same table, keyed by email.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (already set in Netlify).
// Optional: SITE_URL to force the link host.
const { buildReportPage } = require('./report-template.js');

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function pick(b) {
  return {
    name: (b.name || '').slice(0, 90),
    lane: (b.lane || '').slice(0, 20),
    score: b.score,
    tagline: (b.tagline || '').slice(0, 200),
    why: (b.why || '').slice(0, 800),
    domain: (b.domain || '').slice(0, 120),
    domainAvailable: b.domainAvailable,
    handle: (b.handle || '').slice(0, 80),
    kind: b.kind || (b.kit && b.kit.kind) || 'brand',
    kit: b.kit || {}
  };
}

function id() {
  var s = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var out = '';
  for (var i = 0; i < 14; i++) out += s[Math.floor(Math.random() * s.length)];
  return out;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_KEY) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let names = [], email = '', seed = '';
  try {
    const b = JSON.parse(event.body || '{}');
    email = (b.to || b.email || '').slice(0, 160).trim();
    seed = (b.seed || '').slice(0, 300);
    if (Array.isArray(b.names)) names = b.names.slice(0, 120).map(pick).filter(function (n) { return n.name; });
  } catch (e) {}

  if (!names.length) return resp(400, { ok: false, error: 'no_names' });

  const when = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const html = buildReportPage({ names: names, seed: seed, when: when });
  const key = id();

  try {
    const r = await fetch(SB_URL + '/rest/v1/reports', {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: key,
        email: email || null,
        seed: seed || null,
        name_count: names.length,
        html: html
      })
    });
    if (r.status >= 300) {
      let t = ''; try { t = await r.text(); } catch (e) {}
      console.error('reports insert failed', r.status, t.slice(0, 200));
      return resp(502, { ok: false, error: 'store_failed' });
    }
  } catch (e) {
    return resp(502, { ok: false, error: 'store_exception' });
  }

  // Also save each name individually so the portal can show clickable cards
  // (best-effort: a failure here never blocks the report itself).
  try {
    const rows = names.map(function (n, i) {
      return {
        report_id: key,
        email: email || null,
        position: i,
        name: n.name,
        tagline: n.tagline || null,
        domain: n.domain || null,
        domain_available: (n.domainAvailable === true),
        handle: n.handle || null,
        score: (typeof n.score === 'number') ? n.score : null,
        kind: n.kind || 'brand',
        kit: (function () { var k = n.kit || {}; var ln = (n.lane || k.lane || '').toString().toLowerCase(); try { k.lane = ln; } catch (e) {} return k; })()
      };
    });
    // CO-21 (2026-07-06): LOAD-BEARING LAW. This table feeds the art pipeline and the
    // completeness gate — a failed write here starves every image and blocks the email.
    // Bulk first; on ANY failure, per-row with one retry each; every failure SCREAMS.
    var hdrs = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
    var bulk = await fetch(SB_URL + '/rest/v1/report_names', { method: 'POST', headers: hdrs, body: JSON.stringify(rows) });
    if (!bulk.ok) {
      var bt = ''; try { bt = (await bulk.text()).slice(0, 300); } catch (e) {}
      console.error('ROWS ALARM: bulk insert FAILED status=' + bulk.status + ' key=' + key + ' — ' + bt + ' — falling back per-row');
      var failed = 0;
      for (var ri = 0; ri < rows.length; ri++) {
        var ok1 = false;
        for (var at = 0; at < 2 && !ok1; at++) {
          try { var r1 = await fetch(SB_URL + '/rest/v1/report_names', { method: 'POST', headers: hdrs, body: JSON.stringify(rows[ri]) }); ok1 = r1.ok; } catch (e) {}
          if (!ok1 && at === 0) await new Promise(function (rs) { setTimeout(rs, 800); });
        }
        if (!ok1) { failed++; console.error('ROWS ALARM: row ' + ri + ' (' + rows[ri].name + ') FAILED twice key=' + key); }
      }
      if (failed) console.error('ROWS ALARM: ' + failed + '/' + rows.length + ' rows LOST for key=' + key + ' — the gate will park this order and name it');
    }
  } catch (e) { console.error('ROWS ALARM: insert threw for key=' + key + ' — ' + (e && e.message ? e.message : String(e))); }

  const base = (process.env.SITE_URL || ('https://' + ((event.headers && (event.headers.host || event.headers.Host)) || 'sparkmyname.com'))).replace(/\/$/, '');
  const url = base + '/.netlify/functions/view-report?r=' + key;
  return resp(200, { ok: true, url: url, key: key, count: names.length });
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(obj) }; }
