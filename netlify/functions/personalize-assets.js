// File: netlify/functions/personalize-assets.js | Date: 2026-07-17
// PERSONALIZATION WORKFLOW + 24-HOUR PROMISE.
//
//   CUSTOMER PATH — POST { access_token, r, name, persona:{fullName,title,phone,email,address} }
//     · set-favorite security pattern (token → email → ownership)
//     · brand must already be ACTIVATED (kit._activated === true)
//     · saves kit._persona + kit._assets = { status:'processing', requested_at }
//     · notifies the founder via Resend so the 24-hour clock starts (best-effort;
//       the save NEVER fails because email did)
//
//   ADMIN PATH — POST { admin_key, r, name, action:'ready', links:[{label,url}] }
//     · admin_key must equal env ASSETS_ADMIN_KEY (if unset, path is disabled)
//     · flips kit._assets.status = 'ready' (+ ready_at, links)
//     · emails the CUSTOMER "your personalized assets are ready" with their
//       Download Center link — this is the delivery promised at activation.
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
const FOUNDER = process.env.SUPPORT_EMAIL || 'peterkleinusa@gmail.com';
const ADMIN_KEY = process.env.ASSETS_ADMIN_KEY || '';
const SITE = process.env.SITE_URL || 'https://sparkmyname.netlify.app';

const crypto = require('crypto');
function adminKeyOk(given){
  try {
    const a = crypto.createHash('sha256').update(given, 'utf8').digest();
    const b2 = crypto.createHash('sha256').update(ADMIN_KEY, 'utf8').digest();
    return crypto.timingSafeEqual(a, b2);
  } catch (e) { return false; }
}
function resp(code, obj){ return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
function svcH(extra){ const h = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' }; for (const k in (extra || {})) h[k] = extra[k]; return h; }
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]; }); }
function cleanStr(v, n){ return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, n); }

async function loadRow(r, name){
  const nq = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=position,name,kit&order=position.asc&limit=24', { headers: svcH() });
  const rows = await nq.json().catch(function(){ return []; });
  if (!Array.isArray(rows) || !rows.length) return { err: resp(404, { ok: false, error: 'no_names' }) };
  const target = rows.find(function(x){ return x && x.name === name; });
  if (!target) return { err: resp(404, { ok: false, error: 'name_not_found' }) };
  const kit = (target.kit && typeof target.kit === 'object' && !Array.isArray(target.kit)) ? target.kit : {};
  return { target: target, kit: kit };
}
async function writeKit(r, position, kit){
  const w = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&position=eq.' + encodeURIComponent(String(position)), {
    method: 'PATCH', headers: svcH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
    body: JSON.stringify({ kit: kit })
  });
  return w.status < 300;
}
// DELIVERABILITY: every message ships a multipart pair (HTML + plain text).
// A missing text part is a classic spam-filter signal; the pair also gives
// text-only clients something readable. `preheader` is the inbox preview line.
function preheaderSpan(txt){
  return '<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">' + txt + '</span>';
}
async function sendMail(to, replyTo, subject, html, text){
  if (!RESEND) return false;
  try {
    const m = { from: FROM, to: [to], subject: subject, text: plainTextFrom(html, centerUrl), html: html };
    if (text) m.text = text;
    if (replyTo) m.reply_to = replyTo;
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + RESEND, 'Content-Type': 'application/json' },
      body: JSON.stringify(m)
    });
    return r.ok;
  } catch (e) { return false; }
}


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

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_SERVICE) return resp(500, { ok: false, error: 'missing_supabase_env' });
  let b = {};
  try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  const r = String(b.r || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const name = String(b.name || '').slice(0, 120);
  if (!r || !name) return resp(400, { ok: false, error: 'missing_fields' });

  // ============ ADMIN PATH: mark assets READY, email the customer ============
  if (b.admin_key !== undefined) {
    // FAIL-CLOSED: if ASSETS_ADMIN_KEY is not set in the environment, the admin
    // path is disabled entirely. Comparison is constant-time (timingSafeEqual)
    // so the key cannot be probed character-by-character.
    if (!ADMIN_KEY || !adminKeyOk(String(b.admin_key))) return resp(403, { ok: false, error: 'bad_admin_key' });
    if (b.action !== 'ready') return resp(400, { ok: false, error: 'bad_action' });
    try {
      const got = await loadRow(r, name);
      if (got.err) return got.err;
      const kit = got.kit;
      if (!kit._assets || kit._assets.status !== 'processing') return resp(409, { ok: false, error: 'not_processing' });
      const links = Array.isArray(b.links) ? b.links.slice(0, 8).map(function(l){
        return { label: cleanStr(l && l.label, 80) || 'Download', url: cleanStr(l && l.url, 500) };
      }).filter(function(l){ return /^https:\/\//.test(l.url); }) : [];
      kit._assets = { status: 'ready', requested_at: kit._assets.requested_at || null, ready_at: new Date().toISOString(), links: links };
      if (!(await writeKit(r, got.target.position, kit))) return resp(502, { ok: false, error: 'write_failed' });

      // Deliver the promise: email the customer their ready notice.
      let owner = '';
      try {
        const oq = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&select=email', { headers: svcH() });
        const os = await oq.json().catch(function(){ return []; });
        owner = (Array.isArray(os) && os[0] && os[0].email) ? String(os[0].email) : '';
      } catch (e) {}
      let mailed = false;
      if (owner) {
        const centerUrl = SITE + '/workspace.html?r=' + encodeURIComponent(r) + '&n=' + encodeURIComponent(name);
        const linkRows = links.map(function(l){ return '<p style="margin:6px 0"><a href="' + esc(l.url) + '" style="color:#7E6018;font-weight:bold">' + esc(l.label) + '</a></p>'; }).join('');
        const html = '<div style="font:15px/1.6 Arial,sans-serif;color:#171410;max-width:560px">'
          + preheaderSpan('The personalized files for ' + esc(name) + ' are finished — one tap to open them.')
          + '<p style="font-size:20px;font-weight:bold;color:#0A0A0A">Your personalized assets are ready.</p>'
          + '<p>Good news — the personalized files for <b>' + esc(name) + '</b> are finished and waiting for you.</p>'
          + '<p style="margin:18px 0"><a href="' + esc(centerUrl) + '" style="display:inline-block;background:#7C5CFF;color:#0A0A0A;font-weight:bold;padding:12px 22px;border-radius:999px;text-decoration:none">Open your Download Center</a></p>'
          + linkRows
          + '<p style="color:#5C5340;font-size:12px">Questions? Just reply to this email — a real person reads it.</p></div>';
        const text = 'Your personalized assets are ready.\n\n'
          + 'Good news — the personalized files for ' + name + ' are finished and waiting for you.\n\n'
          + 'Open your Download Center: ' + centerUrl + '\n'
          + links.map(function(l){ return l.label + ': ' + l.url; }).join('\n')
          + (links.length ? '\n' : '')
          + '\nQuestions? Just reply to this email — a real person reads it.';
        mailed = await sendMail(owner, FOUNDER, 'Your ' + name + ' files are ready — SparkMyName', html, text);
      }
      return resp(200, { ok: true, ready: true, mailed: mailed });
    } catch (e) { return resp(502, { ok: false, error: 'op_failed' }); }
  }

  // ============ CUSTOMER PATH: save persona, start the 24-hour clock ============
  const token = (b.access_token || '').slice(0, 4000);
  if (!token) return resp(401, { ok: false, error: 'no_token' });
  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE } });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  try {
    const chk = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&email=eq.' + encodeURIComponent(email) + '&select=id', { headers: svcH() });
    const owned = await chk.json().catch(function(){ return []; });
    if (!Array.isArray(owned) || !owned.length) return resp(403, { ok: false, error: 'not_owned' });

    const got = await loadRow(r, name);
    if (got.err) return got.err;
    const kit = got.kit;
    if (kit._activated !== true) return resp(409, { ok: false, error: 'not_activated' });

    const p = (b.persona && typeof b.persona === 'object') ? b.persona : {};
    const persona = {
      fullName: cleanStr(p.fullName, 80),
      title:    cleanStr(p.title, 80),
      phone:    cleanStr(p.phone, 40),
      email:    cleanStr(p.email, 120),
      address:  cleanStr(p.address, 200)
    };
    kit._persona = persona;
    kit._assets = { status: 'processing', requested_at: new Date().toISOString() };
    if (!(await writeKit(r, got.target.position, kit))) return resp(502, { ok: false, error: 'write_failed' });

    // Start the founder's 24-hour clock (best-effort; never blocks the save).
    try {
      const rows = ['Full name', 'Title', 'Phone', 'Email', 'Address'].map(function(lbl, i){
        const v = [persona.fullName, persona.title, persona.phone, persona.email, persona.address][i];
        return '<tr><td style="padding:4px 12px 4px 0;color:#5C5340">' + lbl + '</td><td style="padding:4px 0"><b>' + esc(v || '—') + '</b></td></tr>';
      }).join('');
      // PRODUCTION REQUIREMENTS (founder order 2026-07-16): every personalization
      // request carries the vector requirement so no file set ships raster-only.
      const REQS = [
        'Vector masters REQUIRED: primary logo, reverse, and mark as SVG **and** EPS (plus print-ready PDF).',
        'Raster set: PNG at 2048px (transparent + white background) derived from the vectors.',
        'Personalized business card + letterhead: print-ready PDF with 0.125" bleed, using the details above (placeholders where blank).',
        'Colors must match the brand palette exactly (HEX in the brand card; Pantone as the coated reference).'
      ];
      const html = '<div style="font:15px/1.6 Arial,sans-serif;color:#171410;max-width:560px">'
        + preheaderSpan('24-hour clock started: ' + esc(name) + ' for ' + esc(email))
        + '<p><b>PERSONALIZATION REQUEST — 24-hour clock started</b></p>'
        + '<p>Brand: <b>' + esc(name) + '</b> · Order: <b>' + esc(r) + '</b> · Customer: <b>' + esc(email) + '</b></p>'
        + '<table style="border:1px solid #ECE7DB;border-radius:10px;padding:10px;background:#FBF7EC">' + rows + '</table>'
        + '<p style="margin:16px 0 6px"><b>PRODUCTION REQUIREMENTS — deliverables must include:</b></p>'
        + '<ul style="margin:0 0 12px;padding-left:20px">' + REQS.map(function(q){ return '<li style="margin:4px 0">' + q.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') + '</li>'; }).join('') + '</ul>'
        + '<p style="color:#5C5340;font-size:12px">When the files are done, mark them Ready (admin action ‘ready’ on personalize-assets) and the customer is emailed automatically.</p></div>';
      const text = 'PERSONALIZATION REQUEST — 24-hour clock started\n\n'
        + 'Brand: ' + name + '\nOrder: ' + r + '\nCustomer: ' + email + '\n\n'
        + 'Full name: ' + (persona.fullName || '—') + '\nTitle: ' + (persona.title || '—')
        + '\nPhone: ' + (persona.phone || '—') + '\nEmail: ' + (persona.email || '—')
        + '\nAddress: ' + (persona.address || '—') + '\n\n'
        + 'PRODUCTION REQUIREMENTS — deliverables must include:\n'
        + REQS.map(function(q){ return '  • ' + q.replace(/\*\*/g, ''); }).join('\n') + '\n\n'
        + 'When the files are done, mark them Ready (admin action ‘ready’ on personalize-assets) and the customer is emailed automatically.';
      await sendMail(FOUNDER, email, 'ASSETS TO CRAFT (24h) — ' + name + ' · ' + r, html, text);
    } catch (e) {}

    return resp(200, { ok: true, status: 'processing' });
  } catch (e) { return resp(502, { ok: false, error: 'op_failed' }); }
};
