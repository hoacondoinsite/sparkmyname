// Serves ONE name's full kit as a clean, print-ready page.
// Link shape: /.netlify/functions/view-name?r=REPORT_ID&p=POSITION
const { buildSingleNamePage } = require('./report-template.js');
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/* CO-HUBPOLISH (Founder, 2026-07-13): the single-name page itself is built by
   buildSingleNamePage -> buildReportPage, so it wears the same dark/gold page shell
   and ends with the standard smnFooter automatically. Only this fallback page needed
   dressing in the color law: stage #0A0A0A, gold #7C5CFF, white text, centered. */
function notFound() {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Name not found &mdash; SparkMyName&trade;</title></head>' +
    '<body style="font-family:Inter,-apple-system,BlinkMacSystemFont,\'Segoe UI\',Arial,sans-serif;background:#0A0A0A;color:#FFFFFF;margin:0;text-align:center;">' +
    '<div style="max-width:460px;margin:14vh auto;background:#111111;border:1px solid rgba(191,155,60,.28);border-radius:20px;padding:34px 30px;text-align:center;">' +
    '<div style="font-family:Georgia,\'Playfair Display\',serif;font-size:24px;font-weight:700;color:#7C5CFF;margin-bottom:8px;">We couldn&rsquo;t find that name</div>' +
    '<p style="color:rgba(255,255,255,.84);font-size:15px;line-height:1.55;margin:0;">This link may be incorrect. Try again from your brands, or email <a href="mailto:support@sparkmyname.com" style="color:#EBD98A;">support@sparkmyname.com</a>.</p>' +
    '<p style="margin:22px 0 0;"><a href="/account.html" style="display:inline-block;background:#7C5CFF;color:#FFFFFF;text-decoration:none;font-weight:800;font-size:14px;border-radius:999px;padding:13px 22px;">Back to my brands</a></p>' +
    '<p style="color:rgba(255,255,255,.55);font-size:12px;margin:22px 0 0;"><span style="color:#7C5CFF;font-weight:800;">Spark</span><span style="color:#FFFFFF;font-weight:800;">MyName</span><span style="color:#7C5CFF;">&#10022;</span></p></div></body></html>';
  return { statusCode: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
}

exports.handler = async (event) => {
  const q = (event.queryStringParameters || {});
  const rid = (q.r || '').replace(/[^a-z0-9]/g, '').slice(0, 32);
  const pos = parseInt(q.p, 10);
  if (!rid || isNaN(pos)) return notFound();
  if (!SB_URL || !SB_KEY) return notFound();
  try {
    const r = await fetch(
      SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(rid) +
      '&position=eq.' + pos + '&select=name,tagline,domain,domain_available,handle,score,kind,kit&limit=1',
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' } }
    );
    if (r.status >= 300) return notFound();
    const rows = await r.json().catch(function () { return []; });
    const row = Array.isArray(rows) && rows[0];
    if (!row || !row.name) return notFound();
    const m = {
      name: row.name, tagline: row.tagline, domain: row.domain,
      domainAvailable: row.domain_available, handle: row.handle,
      score: row.score, kind: row.kind || 'brand', kit: row.kit || {}
    };
    const html = buildSingleNamePage(m, { when: '' });
    return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'cache-control': 'private, max-age=3600' }, body: html };
  } catch (e) { return notFound(); }
};
