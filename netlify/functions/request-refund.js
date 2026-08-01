// Customer asks for a refund. This NEVER refunds automatically.
// It verifies the order, then emails the Founder a one-click "Approve refund" link.
// Money only moves when the Founder clicks Approve (see approve-refund.js).
// Env: STRIPE_SECRET_KEY, RESEND_API_KEY, RESEND_FROM, REFUND_SECRET (fallback STRIPE key),
//      REFUND_NOTIFY_EMAIL (fallback support@sparkmyname.com), URL (Netlify auto)
const crypto = require('crypto');
const STRIPE = process.env.STRIPE_SECRET_KEY;
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <hello@sparkmyname.com>';
const NOTIFY = process.env.REFUND_NOTIFY_EMAIL || 'support@sparkmyname.com';
const SECRET = process.env.REFUND_SECRET || process.env.STRIPE_SECRET_KEY || 'sparkmyname';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!STRIPE) return resp(500, { ok: false, error: 'missing_stripe_key' });

  let id = '';
  try { id = (JSON.parse(event.body || '{}').session_id || '').slice(0, 200); } catch (e) {}
  if (!id || id.indexOf('cs_') !== 0) return resp(400, { ok: false, error: 'bad_session' });

  try {
    const sR = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(id), { headers: { 'Authorization': 'Bearer ' + STRIPE } });
    const s = await sR.json();
    if (s.error) return resp(400, { ok: false, error: s.error.message });
    if (s.payment_status !== 'paid') return resp(200, { ok: false, error: 'not_paid' });
    if (s.created && (Date.now() / 1000 - s.created) > 7 * 24 * 3600) return resp(200, { ok: false, error: 'window_closed' });

    const token = sign(id);
    const base = process.env.URL || ('https://' + (event.headers && (event.headers.host || event.headers.Host) || 'sparkmyname.com'));
    const approve = base + '/.netlify/functions/approve-refund?s=' + encodeURIComponent(id) + '&t=' + token;
    const amount = (typeof s.amount_total === 'number') ? ('$' + (s.amount_total / 100).toFixed(2)) : 'the order';
    const email = (s.customer_details && s.customer_details.email) || s.customer_email || 'unknown';
    const seed = (s.metadata && (s.metadata.seed || s.metadata.naming)) || '';

    if (RESEND) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + RESEND, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [NOTIFY], reply_to: email !== 'unknown' ? email : undefined, subject: 'Refund request \u2014 ' + amount + ' (' + email + ')', html: notice({ amount, email, seed, id, approve }) })
      }).catch(function () {});
    }
    return resp(200, { ok: true });
  } catch (e) { return resp(502, { ok: false, error: 'stripe_failed' }); }
};

function sign(id) { return crypto.createHmac('sha256', SECRET).update(id).digest('hex'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function notice(d) {
  return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">' +
    '<h2 style="margin:0 0 4px;">Refund request</h2>' +
    '<p style="color:#AFC2E1;margin:0 0 18px;">A customer asked for a refund. <b>Nothing has been refunded yet.</b> Review below and click Approve only if you want to refund.</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 20px;">' +
    row('Amount', esc(d.amount)) + row('Customer', esc(d.email)) + row('Was naming', esc(d.seed || '\u2014')) + row('Order', esc(d.id)) +
    '</table>' +
    '<a href="' + d.approve + '" style="display:inline-block;background:#3ECF7A;color:#fff;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:10px;">Approve this refund \u2192</a>' +
    '<p style="color:#888;font-size:12.5px;margin:18px 0 0;">If this looks like abuse, just ignore this email \u2014 no refund happens unless you click the button. This link works once.</p>' +
    '</div>';
}
function row(k, v) { return '<tr><td style="padding:7px 10px;border:1px solid #24365E;color:#888;width:120px;">' + k + '</td><td style="padding:7px 10px;border:1px solid #24365E;font-weight:600;">' + v + '</td></tr>'; }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
