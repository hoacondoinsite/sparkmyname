// support-request.js — Studio CUSTOMER SERVICE channel (CO-5, Founder order, 2026-07-05).
// Mirrors email-friend's security exactly: a valid signed-in customer session is required,
// the message is captured and forwarded via Resend to SparkMyName customer support, with
// the customer's email as reply-to. Failure-safe: any error returns ok:false and the
// Studio tells the customer to use the Support page instead. Never an open relay.
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
/* Support goes to the support desk, not a personal inbox (2026-07-26, Founder order).
   SUPPORT_EMAIL still overrides it if you ever want it elsewhere. */
const TO = process.env.SUPPORT_EMAIL || 'support@sparkmyname.com';
const SB_URL = process.env.SUPABASE_URL;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

exports.handler = async (event) => {
  const resp = (c, o) => ({ statusCode: c, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!KEY || !SB_URL) return resp(200, { ok: false, error: 'not_configured' });
  let token = '', message = '', topic = '';
  try { const b = JSON.parse(event.body || '{}'); token = (b.access_token || '').slice(0, 4000); message = String(b.message || '').slice(0, 4000).trim();
      /* WHICH BUTTON SENT THIS (2026-07-26). Three places now use this endpoint — the
         concierge, Founder's Pulse, and a data-deletion request. Without a topic they
         all arrive looking identical and a deletion request could be missed among
         ordinary questions. Free text, bounded, defaults to the old behaviour. */
      topic = String(b.topic || '').slice(0, 40).replace(/[^A-Za-z0-9 &'\/-]/g, '').trim(); } catch (e) {}
  if (!token) return resp(200, { ok: false, error: 'no_token' });
  if (message.length < 5) return resp(200, { ok: false, error: 'empty' });
  // Verify the sender is a real signed-in customer.
  let sender = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON } });
    if (u.status >= 300) return resp(200, { ok: false, error: 'bad_token' });
    const user = await u.json(); sender = (user && user.email) ? String(user.email) : '';
  } catch (e) { return resp(200, { ok: false, error: 'verify_failed' }); }
  if (!sender) return resp(200, { ok: false, error: 'no_sender' });
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = '<div style="font:15px/1.6 Arial,sans-serif;color:#171410;max-width:560px">'
    + '<p><b>Customer service request — SparkMyName Studio</b></p>'
    + '<p><b>From:</b> ' + esc(sender) + '</p>'
    + '<p style="white-space:pre-wrap;border:1px solid #ECE7DB;border-radius:10px;padding:14px 16px;background:#FBF7EC">' + esc(message) + '</p>'
    + '<p style="color:#5C5340;font-size:12px">Received ' + new Date().toISOString() + ' · reply directly to reach the customer.</p></div>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: sender, subject: (topic ? (topic + ' — ') : 'Customer service — ') + sender, html: html }),
    });
    if (!r.ok) return resp(200, { ok: false, error: 'send_failed' });
    return resp(200, { ok: true });
  } catch (e) { return resp(200, { ok: false, error: 'send_failed' }); }
};
