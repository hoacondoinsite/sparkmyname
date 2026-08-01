// Serves a stored report as a clean, print-ready HTML page.
// Renders LIVE from the customer's saved names (report_names) so template
// improvements — and, soon, their curation — always show. Falls back to the
// frozen html snapshot for legacy reports that have no saved name rows.
// Link shape: /.netlify/functions/view-report?r=KEY
const { buildReportPage } = require('./report-template.js');

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sbHeaders() {
  return { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' };
}

function fmtWhen(iso) {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch (e) { return ''; }
}

function notFound() {
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Report not found &mdash; SparkMyName&trade;</title></head>' +
    '<body style="font-family:Arial,Helvetica,sans-serif;background:#faf7f2;margin:0;">' +
    '<div style="max-width:460px;margin:14vh auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:34px 30px;text-align:center;">' +
    '<div style="font-size:22px;font-weight:800;color:#1a1411;margin-bottom:8px;">We couldn&rsquo;t find that report</div>' +
    '<p style="color:#555;font-size:15px;line-height:1.55;margin:0;">This report link may have expired or is incorrect. If you just created it, try again from your results page, or email <a href="mailto:support@sparkmyname.com">support@sparkmyname.com</a>.</p>' +
    '<p style="color:#bbb;font-size:12px;margin:22px 0 0;">SparkMyName&trade;</p></div></body></html>';
  return { statusCode: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
}

exports.handler = async (event) => {
  const q = (event.queryStringParameters || {});
  const key = (q.r || '').replace(/[^a-z0-9]/g, '').slice(0, 32);
  const shareFlag = (q.share === '1' || q.share === 'true');
  const pickRaw = String(q.pick || '');
  const pickSet = pickRaw ? new Set(pickRaw.split(',').map(function (s) { return parseInt(s, 10); }).filter(function (n) { return !isNaN(n); })) : null;
  if (!key) return notFound();
  if (!SB_URL || !SB_KEY) return notFound();

  try {
    // 1) Report meta (seed + date) and the legacy html fallback.
    let seed = '', when = '', legacyHtml = '';
    try {
      const r = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(key) + '&select=seed,created_at,html&limit=1', { headers: sbHeaders() });
      if (r.status >= 300) return notFound();
      const rows = await r.json().catch(function () { return []; });
      const row = (Array.isArray(rows) && rows[0]) ? rows[0] : null;
      if (!row) return notFound();
      seed = row.seed || '';
      when = fmtWhen(row.created_at);
      legacyHtml = row.html || '';
    } catch (e) { return notFound(); }

    // 2) Live name rows — everything buildReportPage needs.
    let names = [];
    try {
      const r = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(key) +
        '&select=position,name,tagline,domain,domain_available,handle,score,kind,kit&order=position.asc&limit=200', { headers: sbHeaders() });
      const rows = await r.json().catch(function () { return []; });
      if (Array.isArray(rows)) {
        names = rows.filter(function (n) { return n && n.name; }).map(function (n) {
          var kit = (n.kit && typeof n.kit === 'object' && !Array.isArray(n.kit)) ? n.kit : {};
          return {
            name: n.name,
            score: n.score,
            tagline: n.tagline || '',
            domain: n.domain || '',
            domainAvailable: (n.domain_available === true),
            handle: n.handle || '',
            kind: n.kind || 'brand',
            lane: (kit.lane || n.lane || '').toString().toLowerCase(),
            kit: kit,
            position: (typeof n.position === 'number') ? n.position : 0,
            kept: (kit._kept === true),
            removed: (kit._removed === true),
            chosen: (kit._chosen === true),
            note: (typeof kit._note === 'string' ? kit._note : '')
          };
        });
      }
    } catch (e) {}

    // If a share link picked specific names, narrow to those (full kits, just for them).
    if (pickSet && pickSet.size && names.length) {
      const picked = names.filter(function (n) { return pickSet.has(n.position); });
      if (picked.length) names = picked;
    }

    // 3) Render live if we have name rows; else fall back to the stored snapshot.
    let html;
    if (names.length) html = buildReportPage({ names: names, seed: seed, when: when, share: shareFlag });
    else if (legacyHtml) html = legacyHtml;
    else return notFound();

    // Final safety net: never serve a third-party brand name, even from an old frozen snapshot.
    html = String(html || '').replace(/an original rival brand to [^<>\u2014\n;:.!?]+/gi, 'an original rival brand');
    html = html.replace(/\b(?:an? )?rival(?:ing)? (?:brand )?to [^<>\u2014\n;:.!?]+/gi, 'a bold original brand');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store, max-age=0' },
      body: html
    };
  } catch (e) {
    return notFound();
  }
};
