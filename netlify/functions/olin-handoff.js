// OLIN HANDOFF — a client approves handing their brand to Olin Creative. This pushes the
// client's info to Olin (email to OLIN_EMAIL) and notifies Spark (FOUNDER_EMAIL), with a
// one-click "I followed up" link Olin taps once he has contacted the client. That link hits
// olin-followup and emails Spark back so Peter can see the loop closed.
//
// Env: RESEND_API_KEY, RESEND_FROM (verified domain to email real inboxes),
//      OLIN_EMAIL (default olincreative@gmail.com), FOUNDER_EMAIL (default the founder inbox),
//      SITE_URL.
//
// POST body: { name, email, phone, business, idea, brand, domain, reportKey, plan }
// Returns: { ok:true }

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
const OLIN_EMAIL = process.env.OLIN_EMAIL || 'olincreative@gmail.com';
const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com';
const SITE = process.env.SITE_URL || 'https://sparkmyname.netlify.app';
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  let f = {};
  try { f = JSON.parse(event.body || '{}'); } catch (e) {}
  const c = {
    name: clip(f.name, 120) || 'A Spark client',
    email: clip(f.email, 160),
    phone: clip(f.phone, 40),
    business: clip(f.business, 200),
    idea: clip(f.idea, 600),
    brand: clip(f.brand, 160),
    domain: clip(f.domain, 160),
    plan: clip(f.plan, 40),
    reportKey: String(f.reportKey || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80)
  };
  const workspaceLink = c.reportKey ? (SITE + '/workspace.html?r=' + encodeURIComponent(c.reportKey)) : (SITE + '/account.html');
  const followUp = SITE + '/.netlify/functions/olin-followup?client=' + encodeURIComponent(c.name) + '&email=' + encodeURIComponent(c.email || '') + '&brand=' + encodeURIComponent(c.brand || '');
  const namePos = Math.max(0, parseInt(f.namePosition, 10) || 0);

  /* WHAT OLIN ACTUALLY GETS (2026-07-26, Founder order).
     This used to send a link into the CUSTOMER's own workspace — if that brand was ever
     removed, or the link expired, Olin's copy went with it. It now writes a permanent record
     in olin_handoffs and reads the chosen name's kit (logos, header photo, palette, taglines)
     straight from report_names, so the email lists exactly what he has to work with rather
     than sending him to go look for it. The kit itself is not duplicated — read live, so a
     re-render is never stale in his inbox. */
  let kit = null, handoffId = '';
  if (SB_URL && SB_KEY) {
    /* Read the chosen name's kit for the email's asset list — only possible when a report key
       rode along. Its absence must NEVER stop the pending-client row from being created. */
    if (c.reportKey) {
      try {
        const kr = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(c.reportKey) +
          '&position=eq.' + namePos + '&select=kit,name&limit=1',
          { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
        const kj = kr.ok ? await kr.json() : [];
        kit = (kj[0] && kj[0].kit) || null;
      } catch (e) { /* the email still goes out with what the form itself sent */ }
    }

    /* ALWAYS create the pending-client row (2026-07-27, Founder order: referring a client must
       land in Olin's roster as a new pending client EVERY time, with or without a report key).
       Before today this whole block was gated on c.reportKey, so a referral made from anywhere
       the ?r= key was not in the URL wrote nothing at all and the client silently never reached
       Olin. report_id may now be empty; olin-clients.js already guards its live kit read on
       report_id, so the card still shows the full client info as a new pending client, and the
       downloadable deliverables (logos, header photo, palette, taglines) attach automatically
       the moment a report_id resolves a rendered kit. Only columns already on the table are
       written — no schema change, so the insert cannot fail on an unknown column and drop the
       client. */
    handoffId = 'oh_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    try {
      await fetch(SB_URL + '/rest/v1/olin_handoffs', {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          id: handoffId, report_id: c.reportKey, name_position: namePos,
          client_name: c.name, client_email: c.email, client_phone: c.phone,
          business: c.business, idea: c.idea, brand_name: c.brand, domain: c.domain,
          plan: c.plan, status: 'new'
        })
      });
    } catch (e) { /* the client's request must still succeed even if the record fails to save */ }
  }

  const assetRows = kit ? [
    kit.headerUrl ? ('<a href="' + esc(kit.headerUrl) + '" style="color:#7C5CFF">Header photo</a>') : '',
    (Array.isArray(kit.logoUrls) && kit.logoUrls.length) ?
      kit.logoUrls.map(function (u, i) { return '<a href="' + esc(u) + '" style="color:#7C5CFF">Logo ' + (i + 1) + '</a>'; }).join(' &middot; ') : '',
    (Array.isArray(kit.taglines) && kit.taglines.length) ? ('Taglines: ' + kit.taglines.map(esc).join(' / ')) : '',
    (kit.palette && Array.isArray(kit.palette.cols)) ? ('Palette: ' + kit.palette.cols.join(', ')) : ''
  ].filter(Boolean) : [];

  if (!KEY) {
    // No email configured yet — succeed so the client UX completes; the record is returned for logs.
    return resp(200, { ok: true, emailed: false, note: 'RESEND_API_KEY not set — handoff recorded but email skipped.', client: c });
  }

  const rows = [
    ['Client', c.name], ['Email', c.email], ['Phone', c.phone], ['Business', c.business],
    ['Chosen brand', c.brand], ['Domain', c.domain], ['Plan', c.plan], ['Their idea', c.idea]
  ].filter(r => r[1]).map(r =>
    '<tr><td style="padding:7px 12px;border-bottom:1px solid #eee;color:#AFC2E1;font:600 13px Arial;white-space:nowrap">' + esc(r[0]) + '</td><td style="padding:7px 12px;border-bottom:1px solid #eee;font:400 14px Arial;color:#F2F6FF">' + esc(r[1]) + '</td></tr>'
  ).join('');

  const olinHtml =
    '<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">' +
    '<div style="background:#061021;border-radius:14px 14px 0 0;padding:22px 26px"><span style="color:#fff;font:800 20px Arial">Spark<span style="color:#7C5CFF">My</span>Name</span> &nbsp;→&nbsp; <b style="color:#fff">Olin Creative</b></div>' +
    '<div style="border:1px solid #24365E;border-top:0;border-radius:0 0 14px 14px;padding:26px">' +
    '<h2 style="margin:0 0 6px;font:800 20px Arial;color:#F2F6FF">A new client is ready for you 🎉</h2>' +
    '<p style="color:#AFC2E1;font:400 14px/1.6 Arial;margin:0 0 16px">This client approved Spark handing their project to Olin Creative. Everything is set up and ready — just reach out.</p>' +
    '<table style="width:100%;border-collapse:collapse;border:1px solid #24365E;border-radius:10px;overflow:hidden;margin:0 0 18px">' + rows + '</table>' +
    (assetRows.length ? ('<div style="background:#0D1B38;border:1px solid #24365E;border-radius:10px;padding:14px 16px;margin:0 0 16px;font:400 13px/1.7 Arial;color:#C9D8F5">' +
      '<b style="color:#F2F6FF;display:block;margin:0 0 6px">Ready to work with</b>' + assetRows.join('<br>') + '</div>') : '') +
    '<a href="' + esc(SITE + '/olin.html') + '" style="display:inline-block;background:#7C5CFF;color:#fff;text-decoration:none;font:800 14px Arial;padding:13px 22px;border-radius:10px;margin:0 8px 8px 0">Open in my Command Center</a>' +
    '<a href="' + esc(workspaceLink) + '" style="display:inline-block;background:#24365E;color:#fff;text-decoration:none;font:800 14px Arial;padding:13px 22px;border-radius:10px;margin:0 8px 8px 0">View the client\'s own workspace</a>' +
    '<a href="' + esc(followUp) + '" style="display:inline-block;background:#7C5CFF;color:#FFFFFF;text-decoration:none;font:800 14px Arial;padding:13px 22px;border-radius:10px">✓ I contacted them</a>' +
    '<p style="color:#7E93B8;font:400 12px Arial;margin:16px 0 0">Tap "I contacted them" once you\'ve reached out — it lets the Spark team know the loop is closed.</p>' +
    '</div></div>';

  const founderHtml =
    '<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;padding:20px">' +
    '<h2 style="font:800 18px Arial;color:#F2F6FF">Olin handoff created ✅</h2>' +
    '<p style="color:#AFC2E1;font:400 14px/1.6 Arial">A client approved a handoff to Olin Creative. Olin has been emailed all the details and a one-click follow-up link.</p>' +
    '<table style="width:100%;border-collapse:collapse;border:1px solid #24365E;border-radius:10px;overflow:hidden">' + rows + '</table></div>';

  try {
    await sendMail(OLIN_EMAIL, 'New Spark client ready for you — ' + c.name, olinHtml);
    await sendMail(FOUNDER_EMAIL, 'Olin handoff created — ' + c.name, founderHtml);
    return resp(200, { ok: true, emailed: true });
  } catch (e) {
    return resp(502, { error: 'email_failed' });
  }
};

async function sendMail(to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, text: plainTextFrom(html), html })
  });
  return r.json();
}
function clip(s, n) { return s == null ? '' : String(s).slice(0, n); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(obj) }; }
