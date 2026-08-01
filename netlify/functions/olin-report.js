// OLIN REFERRAL REPORT — emails a revenue + 10% referral report to BOTH Olin and Spark (Peter),
// so the numbers are always transparent to both parties. Called monthly (schedule it) or on demand
// from the command center's Referral panel.
//
// Env: RESEND_API_KEY, RESEND_FROM, OLIN_EMAIL (default olincreative@gmail.com),
//      FOUNDER_EMAIL (default founder inbox), REFERRAL_PCT (default 10).
//
// POST body: { period?, revenue?, quotes?:[{client,total,date}] }
// Returns: { ok, referral, revenue }

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
const OLIN_EMAIL = process.env.OLIN_EMAIL || 'olincreative@gmail.com';
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com';
const PCT = Math.max(0, Math.min(100, parseFloat(process.env.REFERRAL_PCT || '10')));

/* PLAIN TEXT ALTERNATIVE (2026-07-26).
   Every email here was HTML only. That costs twice: spam filters treat a single-part HTML mail
   as a weaker signal than a proper multipart one, and a reader on a text-only client — or a
   screen reader set to plain text — gets nothing at all. send-kit.js already did this; the rest
   did not. The text is derived from the HTML that was actually sent, so the two cannot drift
   apart the way a hand-written second copy would. */
function plainTextFrom(html, fallbackUrl) {
  var t = String(html || '');
  t = t.replace(/<style[\s\S]*?<\/style>/gi, '');
  t = t.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
        function (m, href, label) {
          var clean = String(label).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          /* a newline after the URL, or the link runs into whatever follows it:
             "...?r=abc123No sign-in needed." */
          return (clean ? (clean + ': ' + href) : href) + '\n';
        });
  t = t.replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n');
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<[^>]+>/g, '');
  t = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>').replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
       .replace(/&rsquo;/g, "'").replace(/&#8217;/g, "'").replace(/&quot;/g, '"');
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (fallbackUrl && t.indexOf(fallbackUrl) < 0) t += '\n\n' + fallbackUrl;
  return t || (fallbackUrl || 'Open your workspace at https://sparkmyname.com/');
}
exports.handler = async (event) => {
  let b = {};
  try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  const period = clip(b.period, 40) || 'This period';
  const quotes = Array.isArray(b.quotes) ? b.quotes.slice(0, 200) : [];
  let revenue = Number(b.revenue) || 0;
  if (!revenue && quotes.length) revenue = quotes.reduce((s, q) => s + (Number(q.total) || 0), 0);
  const referral = Math.round(revenue * PCT) / 100;

  const rows = quotes.map(q =>
    '<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;font:400 13px Arial">' + esc(clip(q.client, 80) || '—') + '</td>' +
    '<td style="padding:6px 12px;border-bottom:1px solid #eee;font:400 13px Arial;color:#777">' + esc(clip(q.date, 40) || '') + '</td>' +
    '<td style="padding:6px 12px;border-bottom:1px solid #eee;font:700 13px Arial;text-align:right">$' + fmt(q.total) + '</td></tr>'
  ).join('');

  const html =
    '<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">' +
    '<div style="background:#0D1220;border-radius:14px 14px 0 0;padding:22px 26px"><span style="color:#fff;font:800 20px Arial">Spark<span style="color:#A8802A">My</span>Name</span> &nbsp;·&nbsp; <b style="color:#fff">Olin Creative referral report</b></div>' +
    '<div style="border:1px solid #eee;border-top:0;border-radius:0 0 14px 14px;padding:26px">' +
    '<h2 style="margin:0 0 4px;font:800 20px Arial;color:#111">' + esc(period) + '</h2>' +
    '<p style="color:#444;font:400 14px/1.6 Arial;margin:0 0 18px">Automatic, transparent — sent to both Olin Creative and SparkMyName.</p>' +
    '<div style="display:flex;gap:12px;margin:0 0 18px">' +
    '<div style="flex:1;border:1px solid #eee;border-radius:12px;padding:16px"><div style="color:#777;font:700 11px Arial;text-transform:uppercase;letter-spacing:1px">Revenue</div><div style="font:900 26px Arial;color:#111">$' + fmt(revenue) + '</div></div>' +
    '<div style="flex:1;border:1px solid #7C5CFF;border-radius:12px;padding:16px;background:#f6f3ff"><div style="color:#7C5CFF;font:700 11px Arial;text-transform:uppercase;letter-spacing:1px">Spark referral (' + PCT + '%)</div><div style="font:900 26px Arial;color:#7C5CFF">$' + fmt(referral) + '</div></div>' +
    '</div>' +
    (rows ? ('<table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:10px;overflow:hidden"><tr><td style="padding:8px 12px;background:#fafafa;font:800 11px Arial;text-transform:uppercase;color:#777">Client</td><td style="padding:8px 12px;background:#fafafa;font:800 11px Arial;text-transform:uppercase;color:#777">Date</td><td style="padding:8px 12px;background:#fafafa;font:800 11px Arial;text-transform:uppercase;color:#777;text-align:right">Total</td></tr>' + rows + '</table>') : '') +
    '<p style="color:#999;font:400 12px/1.5 Arial;margin:18px 0 0">Per the Spark partnership, Olin Creative remits ' + PCT + '% of collected revenue to SparkMyName. This report keeps both sides honest and in sync.</p>' +
    '</div></div>';

  if (!KEY) return resp(200, { ok: true, emailed: false, revenue, referral, note: 'RESEND_API_KEY not set — report computed but email skipped.' });
  try {
    await send(OLIN_EMAIL, 'Your Spark referral report — ' + period, html);
    await send(FOUNDER_EMAIL, 'Olin Creative referral report — ' + period, html);
    return resp(200, { ok: true, emailed: true, revenue, referral });
  } catch (e) { return resp(502, { error: 'email_failed' }); }
};

async function send(to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, text: plainTextFrom(html), html })
  });
  return r.json();
}
function fmt(n) { n = Number(n) || 0; return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function clip(s, n) { return s == null ? '' : String(s).slice(0, n); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(obj) }; }
