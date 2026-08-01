// OLIN FOLLOW-UP — Olin taps "I contacted them" in his handoff email (or command center).
// This notifies Spark (FOUNDER_EMAIL) that Olin followed up, and shows Olin a friendly
// confirmation page. GET (link) or POST (from the command center).
//
// Env: RESEND_API_KEY, RESEND_FROM, FOUNDER_EMAIL (default founder inbox).
//
// GET  ?client=&email=&brand=   → HTML confirmation page + emails Spark
// POST { client, email, brand }  → { ok:true }

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com';

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  let body = {};
  if (event.httpMethod === 'POST') { try { body = JSON.parse(event.body || '{}'); } catch (e) {} }
  const client = clip(body.client || q.client, 160) || 'a client';
  const email = clip(body.email || q.email, 160);
  const brand = clip(body.brand || q.brand, 160);

  if (KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM, to: [FOUNDER_EMAIL],
          subject: 'Olin followed up with ' + client,
          html: '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px">' +
            '<h2 style="font:800 18px Arial;color:#F2F6FF">Olin followed up ✅</h2>' +
            '<p style="color:#AFC2E1;font:400 14px/1.6 Arial">Olin Creative has contacted <b>' + esc(client) + '</b>' + (brand ? ' (' + esc(brand) + ')' : '') + (email ? ' · ' + esc(email) : '') + '.</p>' +
            '<p style="color:#7E93B8;font:400 12px Arial">Logged automatically by SparkMyName.</p></div>'
        })
      });
    } catch (e) {}
  }

  if (event.httpMethod === 'POST') return resp(200, { ok: true, emailed: !!KEY });

  // Friendly confirmation page for the emailed link.
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Follow-up logged</title>' +
    '<style>body{margin:0;background:#0A1428;color:#F2F6FF;font-family:Inter,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}' +
    '.c{max-width:460px}.t{width:78px;height:78px;border-radius:50%;background:linear-gradient(120deg,#7C5CFF,#7C5CFF 55%,#FFB020);display:flex;align-items:center;justify-content:center;font-size:38px;color:#F2F6FF;margin:0 auto 22px}' +
    'h1{font-size:26px;margin:0 0 10px}p{color:rgba(255,255,255,.75);font-size:15px;line-height:1.6}a{color:#7C5CFF;font-weight:700}</style></head><body>' +
    '<div class="c"><div class="t">✓</div><h1>Thanks — follow-up logged.</h1>' +
    '<p>We\'ve let the Spark team know you\'ve reached out to <b style="color:#fff">' + esc(client) + '</b>. Nice work — that\'s how great client relationships start.</p>' +
    '<p style="margin-top:18px"><a href="https://sparkmyname.netlify.app/olin.html">← Back to your command center</a></p></div></body></html>';
  return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
};

function clip(s, n) { return s == null ? '' : String(s).slice(0, n); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(obj) }; }
