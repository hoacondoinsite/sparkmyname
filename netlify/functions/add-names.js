// REFINE TRIGGER — the button calls this. It does NO slow work: it checks the report exists
// and isn't at the cap, fires the async refine-background worker (which generates, builds full
// kits, saves, marks NEW, and emails), and returns immediately. The customer is told "we'll
// email you" — they never wait on the page. (Endpoint name kept as add-names so the live
// report button keeps working without a redeploy of the URL.)
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. SITE_URL/URL to reach the worker.

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = (process.env.SITE_URL || process.env.URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');
const HARD_CAP = 100;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_KEY) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let id = '', more = '';
  try {
    const b = JSON.parse(event.body || '{}');
    /* FOUNDER NOTIFY (order 2026-07-31): every more-names request emails the Founder the
       requester's report id so he can reach out. Best-effort — never blocks the customer. */
    try {
      const FK = process.env.RESEND_API_KEY, FTO = process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com';
      if (FK && b && b.r) fetch('https://api.resend.com/emails', { method: 'POST',
        headers: { Authorization: 'Bearer ' + FK, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>', to: [FTO],
          subject: 'More names requested \u2014 report ' + String(b.r).slice(0, 12),
          text: 'A customer just requested another name set.\nReport: ' + b.r + '\nView: ' + BASE + '/report.html?r=' + encodeURIComponent(b.r) + '\nTheir account email is on the report row in Supabase (reports table).' }) }).catch(function(){});
    } catch (e) {}
    id = (b.r || b.report_id || '').replace(/[^a-z0-9]/g, '').slice(0, 32);
    more = (b.more || '').slice(0, 400);
  } catch (e) {}
  if (!id) return resp(400, { ok: false, error: 'no_report' });

  // Quick guard: report must exist and not be at the hard cap.
  try {
    const r = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id) + '&select=name_count&limit=1', { headers: sbHeaders() });
    const rows = await r.json().catch(function () { return []; });
    const report = (Array.isArray(rows) && rows[0]) ? rows[0] : null;
    if (!report) return resp(404, { ok: false, error: 'not_found' });
    if ((report.name_count || 0) >= HARD_CAP) return resp(200, { ok: false, capped: true });
  } catch (e) { /* if the check fails, still try to queue */ }

  // Fire the async worker. Netlify returns 202 for *-background functions immediately,
  // so this resolves fast; we don't wait for the names to be built.
  try {
    await fetch(BASE + '/.netlify/functions/refine-background', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ r: id, more: more })
    });
  } catch (e) { console.error('refine trigger failed', e && e.message ? e.message : String(e)); return resp(502, { ok: false, error: 'queue_failed' }); }

  return resp(200, { ok: true, queued: true });
};

function sbHeaders() { return { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }; }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(obj) }; }
