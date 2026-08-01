// SparkMyName — UNDELIVERED ORDER SWEEP (NEW FILE, 2026-07-26)
//
// WHY THIS EXISTS
// On 2026-07-26 an audit found order b08fpk5gxfldo5: a real customer, placed 22 July, six
// names with photos, logos and words all finished and sitting in the database — and
// emailed_at was null. They paid and nothing ever arrived. Four days passed and nobody knew.
//
// deliver-background.js already has a backstop that force-sends before its room closes. That
// protects a delivery RUN. It cannot help when the run itself dies — a background function
// killed at the platform limit, a deploy landing mid-flight, a cold start that never returns.
// order-watchdog.js re-queues stalled TASKS and contains no reference to emailed_at at all,
// so nothing in the system ever asks the one question that matters: is there a finished brand
// that never reached the person who paid for it?
//
// WHAT IT DOES — AND DELIBERATELY DOES NOT DO
// It reports. It does not send anything to a customer.
// Auto-delivering would mean a scheduled job emailing real people with no human in the loop;
// a bug there sends a stranger someone else's brand, or the same email fifty times. The cost
// of getting a detector wrong is a false alarm in the founder's inbox. The cost of getting an
// autonomous sender wrong lands on customers. So this finds them and says so, once per day,
// and the founder runs order-deliver for the ones that are real.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, RESEND_FROM,
//      FOUNDER_EMAIL (fallbacks match the rest of the codebase), SITE_URL
'use strict';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <hello@sparkmyname.com>';
const TO = process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com';
const SITE = process.env.SITE_URL || 'https://sparkmyname.netlify.app';

// An order younger than this is probably still being built. Fifteen minutes is the promise
// made on the results page; an hour gives the pipeline room before anyone is alarmed.
const GRACE_MINUTES = 60;

// A DETECTOR THAT CRIES WOLF IS WORSE THAN NONE (2026-07-26).
// The first version of this reported every undelivered order ever: 95 rows, 94 of them the
// founder's own test runs, with the single real customer buried in the middle. A daily email
// like that gets filtered within a week and then the next real one is missed too.
// So: the founder's own orders are excluded — they are tests, not customers — and only the
// last WINDOW_DAYS are listed. Anything older is summarised as a count, because if a week has
// passed and nobody acted, repeating the same list daily is noise, not information.
const WINDOW_DAYS = 7;
const SELF = (process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com').toLowerCase();
function isSelf(email) {
  const e = String(email || '').toLowerCase();
  if (!e) return true;                       // no address to deliver to — not a customer alert
  if (e === SELF) return true;
  return /peterklein|vorrex|@example\.|\+test|^test@/.test(e);
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sb(pathAndQuery) {
  const r = await fetch(SB_URL + '/rest/v1/' + pathAndQuery, {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
  });
  if (!r.ok) throw new Error('supabase ' + r.status);
  return r.json();
}

exports.handler = async function () {
  if (!SB_URL || !SB_KEY) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'no_supabase_config' }) };
  }

  try {
    const cutoff = new Date(Date.now() - GRACE_MINUTES * 60 * 1000).toISOString();

    // Candidates: delivered nothing, old enough to have been delivered.
    const reports = await sb(
      'reports?emailed_at=is.null&deleted_at=is.null&created_at=lt.' + encodeURIComponent(cutoff) +
      '&select=id,email,seed,created_at&order=created_at.desc&limit=200'
    );
    if (!Array.isArray(reports) || !reports.length) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, checked: 0, stuck: 0 }) };
    }

    const ids = reports.map(function (r) { return r.id; }).filter(Boolean);
    const inList = '(' + ids.map(encodeURIComponent).join(',') + ')';

    // Only a FINISHED brand counts. A half-built order is the pipeline's problem, not a
    // delivery failure, and raising it here would bury the real ones in noise.
    const names = await sb(
      'report_names?report_id=in.' + inList + '&select=report_id,kit'
    );
    const done = {};
    (Array.isArray(names) ? names : []).forEach(function (n) {
      const k = (n && n.kit) || {};
      const complete = !!k.headerUrl &&
        Array.isArray(k.logoUrls) && k.logoUrls.length > 0 &&
        Array.isArray(k.taglines) && k.taglines.length > 0;
      const d = done[n.report_id] || (done[n.report_id] = { total: 0, ready: 0 });
      d.total++;
      if (complete) d.ready++;
    });

    // Paid orders only. An entitlement of plan 'bib' is the $99 Business in a Box; free
    // builds are not expected to generate a delivery email and would be pure noise.
    const emails = [...new Set(reports.map(function (r) { return (r.email || '').toLowerCase(); }).filter(Boolean))];
    const paid = {};
    if (emails.length) {
      const eList = '(' + emails.map(encodeURIComponent).join(',') + ')';
      const ents = await sb('entitlements?email=in.' + eList + '&plan=eq.bib&select=email');
      (Array.isArray(ents) ? ents : []).forEach(function (e) {
        paid[(e.email || '').toLowerCase()] = true;
      });
    }

    const finishedAndPaid = reports.filter(function (r) {
      const d = done[r.id];
      if (!d || d.total < 6 || d.ready < d.total) return false;   // not finished
      if (isSelf(r.email)) return false;                          // the founder's own test run
      return !!paid[(r.email || '').toLowerCase()];                // not a paid order
    });

    const windowCut = Date.now() - WINDOW_DAYS * 86400000;
    const stuck = finishedAndPaid.filter(function (r) { return Date.parse(r.created_at) >= windowCut; });
    const older = finishedAndPaid.length - stuck.length;

    if (!stuck.length) {
      return { statusCode: 200, body: JSON.stringify({
        ok: true, checked: reports.length, stuck: 0, older_than_window: older }) };
    }

    const rows = stuck.map(function (r) {
      const age = Math.round((Date.now() - Date.parse(r.created_at)) / 3600000);
      return '<tr>' +
        '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb"><code>' + esc(r.id) + '</code></td>' +
        '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">' + esc(r.email) + '</td>' +
        '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">' + age + 'h ago</td>' +
        '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">' + esc(String(r.seed || '').slice(0, 60)) + '</td>' +
        '</tr>';
    }).join('');

    const html =
      '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#111;max-width:720px">' +
      '<h2 style="margin:0 0 6px">' + stuck.length + ' paid order' + (stuck.length === 1 ? '' : 's') +
      ' finished but never delivered</h2>' +
      '<p style="margin:0 0 16px;color:#444">Each of these has a complete brand — six names with ' +
      'photos, logos and words — and no delivery email was ever sent. They are older than ' +
      GRACE_MINUTES + ' minutes, so the pipeline is not still working on them.</p>' +
      '<table style="border-collapse:collapse;width:100%;font-size:14px">' +
      '<tr style="text-align:left;background:#f3f4f6">' +
      '<th style="padding:8px 12px">Order</th><th style="padding:8px 12px">Customer</th>' +
      '<th style="padding:8px 12px">Age</th><th style="padding:8px 12px">Their idea</th></tr>' +
      rows + '</table>' +
      '<p style="margin:18px 0 0;color:#444">To deliver one, POST to ' +
      '<code>' + esc(SITE) + '/.netlify/functions/order-deliver</code> with ' +
      '<code>{ "key": "&lt;ORDER_START_KEY&gt;", "id": "&lt;order id&gt;" }</code>.</p>' +
      (older ? ('<p style="margin:14px 0 0;color:#666;font-size:13px">' + older +
        ' further paid order' + (older === 1 ? ' is' : 's are') + ' undelivered but older than ' +
        WINDOW_DAYS + ' days, so they are counted rather than listed.</p>') : '') +
      '<p style="margin:14px 0 0;color:#777;font-size:12px">This sweep only reports. It never ' +
      'emails a customer on its own. The founder\u2019s own test orders are excluded.</p></div>';

    if (RESEND) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + RESEND, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM, to: [TO],
          subject: stuck.length + ' paid order' + (stuck.length === 1 ? '' : 's') + ' never delivered',
          html: html
        })
      }).catch(function () { /* an alert that fails to send must not fail the sweep */ });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true, checked: reports.length, stuck: stuck.length,
        older_than_window: older,
        ids: stuck.map(function (r) { return r.id; })
      })
    };
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: String(e && e.message || e) }) };
  }
};
