// Emails an enterprise lead to the SparkMyName™ team via Resend. Dependency-free (raw fetch).
// Env: RESEND_API_KEY (required), RESEND_FROM (verified domain), ENTERPRISE_TO (where leads go).
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
const TO = process.env.ENTERPRISE_TO || process.env.SUPPORT_TO || 'support@sparkmyname.com';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!KEY) return resp(500, { ok: false, error: 'missing_resend_key' });

  let name = '', email = '', company = '', seats = '', phone = '', message = '';
  try {
    const b = JSON.parse(event.body || '{}');
    name    = clean(b.name, 120);
    email   = clean(b.email, 160);
    company = clean(b.company, 160);
    seats   = clean(String(b.seats || ''), 12);
    phone   = clean(b.phone, 60);
    message = clean(b.message, 2000);
  } catch (e) { return resp(400, { ok: false, error: 'bad_body' }); }

  if (!email || email.indexOf('@') < 1) return resp(400, { ok: false, error: 'need_email' });

  const html =
    '<h2>New SparkMyName™ Enterprise lead</h2>' +
    row('Name', name) + row('Company', company) + row('Email', email) +
    row('Phone', phone) + row('Team size (seats)', seats) +
    (message ? ('<p style="margin-top:14px;"><b>Message</b><br>' + esc(message).replace(/\n/g, '<br>') + '</p>') : '') +
    '<p style="color:#888;font-size:12px;margin-top:18px;">Sent from the SparkMyName™ enterprise page.</p>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: 'Enterprise lead: ' + (company || name || email) + (seats ? (' (' + seats + ' seats)') : ''),
        html: html
      })
    });
    if (!r.ok) { const t = await r.text(); return resp(502, { ok: false, error: 'send_failed', detail: t.slice(0, 200) }); }
    return resp(200, { ok: true });
  } catch (e) { return resp(502, { ok: false, error: 'send_exception' }); }
};

function clean(s, n) { return String(s || '').trim().slice(0, n); }
function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function row(label, val) { return val ? ('<p style="margin:4px 0;"><b>' + esc(label) + ':</b> ' + esc(val) + '</p>') : ''; }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(obj) }; }
