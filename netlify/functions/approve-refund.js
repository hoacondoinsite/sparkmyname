// Founder-only refund approval. Opened by clicking the link in the refund-request email.
// Verifies a signed token, then issues the Stripe refund. Returns a simple HTML page.
// Env: STRIPE_SECRET_KEY, REFUND_SECRET (fallback STRIPE key)
const crypto = require('crypto');
const STRIPE = process.env.STRIPE_SECRET_KEY;
const SECRET = process.env.REFUND_SECRET || process.env.STRIPE_SECRET_KEY || 'sparkmyname';

exports.handler = async (event) => {
  const q = (event.queryStringParameters || {});
  const id = (q.s || '').slice(0, 200);
  const t = (q.t || '').slice(0, 200);
  if (!id || id.indexOf('cs_') !== 0 || !t) return page('Invalid link', 'This approval link is missing information.');
  if (!STRIPE) return page('Not configured', 'Stripe key is missing on the server.');

  // verify token (timing-safe)
  const want = crypto.createHmac('sha256', SECRET).update(id).digest('hex');
  let okTok = false;
  try { okTok = (t.length === want.length) && crypto.timingSafeEqual(Buffer.from(t), Buffer.from(want)); } catch (e) { okTok = false; }
  if (!okTok) return page('Invalid link', 'This approval link could not be verified. No refund was made.');

  try {
    const sR = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(id), { headers: { 'Authorization': 'Bearer ' + STRIPE } });
    const s = await sR.json();
    if (s.error) return page('Order not found', s.error.message);
    if (s.payment_status !== 'paid') return page('Nothing to refund', 'This order is not in a paid state.');
    const pi = s.payment_intent;
    if (!pi) return page('Nothing to refund', 'No payment was found on this order.');

    const body = new URLSearchParams();
    body.append('payment_intent', pi);
    body.append('reason', 'requested_by_customer');
    const rR = await fetch('https://api.stripe.com/v1/refunds', { method: 'POST', headers: { 'Authorization': 'Bearer ' + STRIPE, 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    const r = await rR.json();
    if (r.error) {
      const msg = (r.error.message || '').toLowerCase();
      if (msg.indexOf('already') !== -1) return page('Already refunded', 'This order was already refunded \u2014 nothing more to do.');
      return page('Could not refund', r.error.message);
    }
    const amt = (typeof r.amount === 'number') ? ('$' + (r.amount / 100).toFixed(2)) : '';
    return page('Refund approved \u2713', 'The refund' + (amt ? ' of ' + amt : '') + ' is on its way back to the customer\u2019s card. You can close this tab.');
  } catch (e) { return page('Something went wrong', 'We could not reach Stripe. Please try the link again in a moment.'); }
};

function page(title, msg) {
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + '</title></head>' +
    '<body style="font-family:Arial,Helvetica,sans-serif;background:#faf7f2;margin:0;"><div style="max-width:460px;margin:14vh auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:34px 30px;text-align:center;">' +
    '<div style="font-size:22px;font-weight:800;color:#1a1411;margin-bottom:8px;">' + esc(title) + '</div>' +
    '<p style="color:#555;font-size:15px;line-height:1.55;margin:0;">' + esc(msg) + '</p>' +
    '<p style="color:#bbb;font-size:12px;margin:22px 0 0;">SparkMyName&trade;</p></div></body></html>';
  return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: html };
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
