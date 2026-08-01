// File: netlify/functions/email-brand.js | Date: 2026-07-17
// AUTOMATED ACTIONS HUB — one-click brand delivery by email (Resend).
//   mode 'self'     → sends the owner their Brand Card as an attached PDF.
//   mode 'designer' → DESIGNER HANDOVER: brand card PDF + logo files attached,
//                     body carries Brand Name, Why it works, Tone/Voice, and
//                     the strategic context (the customer's own words).
// Security: set-favorite pattern — access token → real email → ownership check.
// The PDF is built here, dependency-free (PDF 1.4, Helvetica, multi-page).
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, RESEND_API_KEY, RESEND_FROM
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';

function resp(code, obj){ return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
function li(v){ if (v && typeof v === 'object') return [String(v.label || v.name || v.text || ''), String(v.desc || '')].filter(Boolean).join(' — '); return String(v == null ? '' : v); }
function arr(v){ return (Array.isArray(v) ? v : (v ? [v] : [])).map(li).filter(Boolean); }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* ---------- PDF writer (text + DRAWN GRAPHICS, Helvetica, A4, auto-paging) ----------
   HONESTY PROMISE REBUILD (founder order 2026-07-16): the Brand Card is now a
   visual document — brand-color header band, real color swatches for ALL
   palettes, launch-graphic preview plates — drawn natively with PDF vector
   operators (re/f fills), no external libraries. */
const SMN_COLORS = require('./color-names-lib.js');
function hexPdf(hex){
  try {
    const c = SMN_COLORS.hex2rgb(hex);
    return (c[0] / 255).toFixed(3) + ' ' + (c[1] / 255).toFixed(3) + ' ' + (c[2] / 255).toFixed(3);
  } catch (e) { return '0 0 0'; }
}
function buildPdf(lines){
  // items: {t,size,bold,gap,color?}  {header:{...}}  {palette:{...}}  {plates:{...}}  {rule:{...}}
  const PW = 595, PH = 842, MX = 56, MTOP = 786, MBOT = 60, CW = PW - 2 * MX;
  function pdfEsc(t){ return String(t).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, function(ch){ const m = { '—': '-', '–': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '•': '*', '·': '*', '…': '...' }; return m[ch] || ''; }); }
  function wrap(t, size){
    const maxW = CW / (size * 0.5);
    const words = String(t).split(/\s+/); const out = []; let cur = '';
    words.forEach(function(w){
      if ((cur + ' ' + w).trim().length > maxW){ if (cur) out.push(cur); cur = w; }
      else cur = (cur ? cur + ' ' : '') + w;
    });
    if (cur) out.push(cur);
    return out.length ? out : [''];
  }
  const pages = []; let ops = []; let y = MTOP;
  function newPage(){ if (ops.length) pages.push(ops); ops = []; y = MTOP; }
  newPage(); pages.pop();
  function rect(x, yTop, w, h, colorHex){ ops.push(hexPdf(colorHex) + ' rg ' + x.toFixed(1) + ' ' + (yTop - h).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1) + ' re f'); }
  function txt(x, yBase, size, bold, colorHex, s){ ops.push(hexPdf(colorHex || '#F2F6FF') + ' rg BT /' + (bold ? 'FB' : 'F') + ' ' + size + ' Tf ' + x.toFixed(1) + ' ' + yBase.toFixed(1) + ' Td (' + pdfEsc(s) + ') Tj ET'); }
  function need(h){ if (y - h < MBOT) newPage(); }
  lines.forEach(function(L){
    if (L.header){
      // full-bleed brand band on the current page top
      const H = L.header, bandH = 118;
      rect(0, PH, PW, bandH, H.c1 || '#F2F6FF');
      rect(0, PH - bandH + 6, PW, 6, H.c2 || '#7C5CFF');
      txt(MX, PH - 52, 27, true, '#FFFFFF', H.name);
      if (H.tagline) txt(MX, PH - 74, 12, false, H.c2 || '#7C5CFF', '"' + H.tagline + '"');
      txt(MX, PH - 96, 9.5, false, '#FFFFFF', (H.domain ? H.domain + '   *   ' : '') + 'Made by SparkMyName from "' + (H.seed || '') + '"');
      y = PH - bandH - 30;
      return;
    }
    if (L.rule){
      need(L.rule.h + 6);
      rect(MX, y, L.rule.w || CW, L.rule.h || 3, L.rule.color || '#7C5CFF');
      y -= (L.rule.h || 3) + (L.rule.gap || 16);
      return;
    }
    if (L.palette){
      const P = L.palette, n2 = P.colors.length || 1;
      const colW = Math.min(120, CW / n2), swH = 30, labelH = 30, blockH = 16 + swH + labelH + 18;
      need(blockH);
      txt(MX, y, 11, true, '#F2F6FF', P.name);
      y -= 16;
      P.colors.forEach(function(c, i){
        const x = MX + i * colW;
        rect(x, y, colW - 8, swH, c.hex);
        // pale keyline under very light swatches so they never vanish into the page
        rect(x, y - swH, colW - 8, 0.75, '#7E93B8');
        txt(x, y - swH - 10, 7.5, true, '#F2F6FF', c.name);
        txt(x, y - swH - 19, 7, false, '#AFC2E1', c.pms);
        txt(x, y - swH - 28, 7, false, '#AFC2E1', String(c.hex).toUpperCase());
      });
      y -= swH + labelH + 18;
      return;
    }
    if (L.plates){
      const T = L.plates, plateH = 74;
      need(plateH + 26);
      txt(MX, y, 8.5, false, '#AFC2E1', 'Previews drawn to scale — full-size files live in your Download Center.');
      y -= 14;
      // wordmark plate (white, keyline, name + gold underline)
      rect(MX, y, 170, plateH, '#FFFFFF');
      rect(MX, y, 170, 1, '#7E93B8'); rect(MX, y - plateH + 1, 170, 1, '#7E93B8');
      rect(MX, y, 1, plateH, '#7E93B8'); rect(MX + 169, y, 1, plateH, '#7E93B8');
      txt(MX + 14, y - 40, Math.min(15, 300 / Math.max(6, T.name.length)) + 0, true, T.c1, T.name);
      rect(MX + 14, y - 50, 44, 4, T.c2);
      // mark plate (ink square, initials)
      rect(MX + 182, y, plateH, plateH, T.c1);
      txt(MX + 182 + plateH / 2 - 11, y - plateH / 2 - 8, 24, true, '#FFFFFF', T.ini);
      // banner strip (ink, name + gold base bar)
      rect(MX + 182 + plateH + 12, y, CW - (182 + plateH + 12), plateH, T.c1);
      rect(MX + 182 + plateH + 12, y - plateH + 5, CW - (182 + plateH + 12), 5, T.c2);
      txt(MX + 182 + plateH + 26, y - 32, 13, true, '#FFFFFF', T.name);
      txt(MX + 182 + plateH + 26, y - 50, 8.5, false, '#FFFFFF', T.tag || '');
      y -= plateH + 16;
      return;
    }
    const size = L.size || 11, lead = Math.round(size * 1.45);
    wrap(L.t, size).forEach(function(seg){
      if (y < MBOT){ newPage(); }
      txt(MX, y, size, !!L.bold, L.color, seg);
      y -= lead;
    });
    y -= (L.gap || 4);
  });
  if (ops.length) pages.push(ops);
  const objs = [];
  const kids = pages.map(function(_, i){ return (4 + i * 2) + ' 0 R'; }).join(' ');
  objs.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objs.push('2 0 obj << /Type /Pages /Kids [' + kids + '] /Count ' + pages.length + ' >> endobj');
  objs.push('3 0 obj << /F << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /FB << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> endobj');
  pages.forEach(function(p, i){
    const stream = p.join('\n');
    objs.push((4 + i * 2) + ' 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /Font 3 0 R >> /Contents ' + (5 + i * 2) + ' 0 R >> endobj');
    objs.push((5 + i * 2) + ' 0 obj << /Length ' + stream.length + ' >> stream\n' + stream + '\nendstream endobj');
  });
  let body = '%PDF-1.4\n'; const offs = [];
  objs.forEach(function(o){ offs.push(body.length); body += o + '\n'; });
  const xref = body.length;
  body += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n'
    + offs.map(function(o){ return String(o).padStart(10, '0') + ' 00000 n \n'; }).join('')
    + 'trailer << /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return Buffer.from(body, 'binary');
}

function normHex(c){
  // OBJECT-SAFE (Honesty Promise fix 2026-07-16): kits store colors as strings
  // OR objects ({hex}/{value}) — both must render, never "[object Object]".
  var v = (typeof c === 'string') ? c : (c && (c.hex || c.value)) || '';
  v = String(v).trim();
  if (!/^#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(v)) return '';
  return v.charAt(0) === '#' ? v : '#' + v;
}
function brandPdfLines(n, seed){
  const kit = n.kit || {}; const L = [];
  const push = function(t, size, bold, gap, color){ L.push({ t: t, size: size, bold: bold, gap: gap, color: color }); };
  const pals = (Array.isArray(kit.palettes) ? kit.palettes : [])
    .map(function(p){
      const cols = (Array.isArray(p && p.colors) ? p.colors : (Array.isArray(p) ? p : [])).map(normHex).filter(Boolean);
      return { name: (p && p.name) || 'Palette', note: (p && p.note) || '', cols: cols };
    }).filter(function(p){ return p.cols.length; });
  if (!pals.length && Array.isArray(kit.colors)){
    const cols = kit.colors.map(normHex).filter(Boolean);
    if (cols.length) pals.push({ name: 'Your colors', note: '', cols: cols });
  }
  const c1 = (pals[0] && pals[0].cols[0]) || '#F2F6FF';
  const c2 = (pals[0] && pals[0].cols[1]) || '#7C5CFF';
  const ini = String(n.name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function(w){ return w.charAt(0).toUpperCase(); }).join('');

  // 1 · VISUAL HEADER — the brand band in its own colors
  L.push({ header: { name: n.name, tagline: li(n.tagline || (kit.taglines && kit.taglines[0]) || ''), domain: n.domain || '', seed: seed || '', c1: c1, c2: c2 } });

  const sec = function(title, items){
    const list = arr(items); if (!list.length) return;
    push(title.toUpperCase(), 12, true, 2, '#7C5CFF');
    list.forEach(function(x){ push('*  ' + x, 10.5, false, 1); });
    push(' ', 6, false, 2);
  };
  sec('Why this name works', kit.whyItWorks);
  if (kit.meaning) sec('The story behind the name', kit.meaning);
  sec('Tagline options', kit.taglines);
  sec('Voice & tone', kit.voice);

  // 2 · COLOR PALETTES — every palette, drawn swatches, name + Pantone + HEX
  if (pals.length){
    push('COLOR PALETTES — ' + pals.length + ' full palette' + (pals.length === 1 ? '' : 's') + ', production-ready', 12, true, 4, '#7C5CFF');
    pals.forEach(function(p){
      L.push({ palette: { name: p.name + (p.note ? ' — ' + p.note : ''), colors: p.cols.map(function(hx){
        var nm2 = '', pm = '';
        try { nm2 = SMN_COLORS.nameOf(hx); pm = SMN_COLORS.pmsOf(hx); } catch (e) {}
        return { hex: hx, name: nm2, pms: pm };
      }) } });
    });
    push('Color names are descriptive; Pantone is the closest coated match (approximate) — confirm against a Pantone book before printing.', 8, false, 6, '#AFC2E1');
  }

  // 3 · TYPE
  sec('Your type pairing', kit.fonts);

  // 4 · LAUNCH GRAPHICS — drawn preview plates (wordmark · mark · banner)
  push('LAUNCH GRAPHICS', 12, true, 2, '#7C5CFF');
  L.push({ plates: { name: n.name, ini: ini || '*', c1: c1, c2: c2, tag: li(n.tagline || '') } });

  sec('Social bios', kit.bios);
  sec('About your brand', kit.about);
  sec('LinkedIn "About" — ready to paste', kit.linkedin);
  sec('Facebook Page intros — ready to paste', kit.facebook);
  sec('First posts', kit.posts);
  if (kit.handle || n.handle) push('SOCIAL HANDLE: ' + (kit.handle || n.handle) + '  (Instagram · Facebook · X · TikTok · YouTube · LinkedIn)', 10.5, true, 6);

  // 5 · DELIVERY CONFIRMATION — the format registry, vectors included (2026-07-09 decision)
  L.push({ rule: { h: 3, color: c2, gap: 18 } });
  push('YOUR DELIVERY PACKAGE — FORMAT REGISTRY', 12, true, 2, '#7C5CFF');
  push('*  Vector masters: logo as SVG and EPS, plus print-ready PDF.', 10.5, false, 1);
  push('*  Raster set: PNG at 2048px, transparent and white backgrounds.', 10.5, false, 1);
  push('*  Stationery: personalized business card and letterhead, print-ready PDF with bleed.', 10.5, false, 1);
  push('*  Words: every section on this card, plus a copy-ready text file in your Download Center.', 10.5, false, 1);
  push('*  AI logo art: attached to this email as PNG; vector mastering is part of your personalized file delivery.', 10.5, false, 4);
  push('SparkMyName — the brand is yours. Register the web address to lock it in, and run your own trademark check before use.', 8.5, false, 0, '#AFC2E1');
  return L;
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
  if (!RESEND) return resp(500, { ok: false, error: 'missing_resend_key' });

  let token = '', r = '', nameWant = '', mode = 'self', to = '', note = '';
  try {
    const b = JSON.parse(event.body || '{}');
    token = (b.access_token || '').slice(0, 4000);
    r = String(b.r || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    nameWant = String(b.name || '').slice(0, 120);
    mode = b.mode === 'designer' ? 'designer' : (b.mode === 'share' ? 'share' : 'self');
    to = String(b.to || '').trim().slice(0, 120);
    note = String(b.note || '').slice(0, 1200);
  } catch (e) {}
  if (!token) return resp(401, { ok: false, error: 'no_token' });
  if (!r) return resp(400, { ok: false, error: 'missing_r' });
  if (mode === 'designer' && (!to || to.indexOf('@') < 1)) return resp(400, { ok: false, error: 'bad_to' });
  if (mode === 'share') {
    if (!to || to.indexOf('@') < 1) return resp(400, { ok: false, error: 'bad_to' });
    /* SHARE MODE (Founder order 2026-07-31): a light card — the public link, no attachments. */
    const link = (b.link && String(b.link).indexOf('http') === 0) ? String(b.link) : '';
    if (!link) return resp(400, { ok: false, error: 'bad_link' });
    const bn = (b.name ? String(b.name).slice(0, 80) : 'a new brand');
    const sr = await fetch('https://api.resend.com/emails', { method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to],
        subject: bn + ' \u2014 come see this brand',
        text: 'Someone wants to show you a brand they created: ' + bn + '. See it here: ' + link,
        html: '<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:26px"><h2 style="color:#16202C">' + bn + '</h2><p style="color:#3A4A60">Someone wants to show you a brand they just created with SparkMyName\u2122.</p><p style="margin:22px 0"><a href="' + link + '" style="background:linear-gradient(90deg,#7C5CFF,#FF4D8D);color:#fff;padding:13px 22px;border-radius:12px;text-decoration:none;font-weight:700">See the brand \u2192</a></p><p style="color:#8A99AF;font-size:12px">Sent via SparkMyName\u2122 \u00b7 sparkmyname.netlify.app</p></div>' }) });
    if (!sr.ok) return resp(502, { ok: false, error: 'send_failed' });
    return resp(200, { ok: true });
  }

  // token → real email
  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', { headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE } });
    if (u.status >= 300) return resp(401, { ok: false, error: 'bad_token' });
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return resp(401, { ok: false, error: 'verify_failed' }); }
  if (!email) return resp(401, { ok: false, error: 'no_email' });

  const H = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' };
  try {
    // ownership + seed
    const chk = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&email=eq.' + encodeURIComponent(email) + '&select=id,seed', { headers: H });
    const owned = await chk.json().catch(function(){ return []; });
    if (!Array.isArray(owned) || !owned.length) return resp(403, { ok: false, error: 'not_owned' });
    const seed = owned[0].seed || '';

    // load the name rows; pick the requested name (else lead)
    const nq = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=position,name,tagline,domain,handle,kit&order=position.asc&limit=24', { headers: H });
    const rows = await nq.json().catch(function(){ return []; });
    if (!Array.isArray(rows) || !rows.length) return resp(404, { ok: false, error: 'no_names' });
    let n = rows[0];
    if (nameWant){ const hit = rows.find(function(x){ return x && x.name === nameWant; }); if (hit) n = hit; }
    n.kit = (n.kit && typeof n.kit === 'object') ? n.kit : {};

    // build the brand card PDF
    const pdf = buildPdf(brandPdfLines(n, seed));
    const attachments = [{ filename: n.name.replace(/[^a-zA-Z0-9]/g, '') + '-brand-card.pdf', content: pdf.toString('base64') }];

    // BOTH modes carry the logo files (best effort, capped) — the card's
    // delivery confirmation says "attached as PNG", so attach them we do.
    if (mode === 'designer' || mode === 'self'){
      const logos = (Array.isArray(n.kit.logoUrls) ? n.kit.logoUrls : []).slice(0, 3);
      for (let i = 0; i < logos.length; i++){
        try {
          const lr = await fetch(logos[i]);
          if (lr.ok){
            const buf = Buffer.from(await lr.arrayBuffer());
            if (buf.length < 4.5e6) attachments.push({ filename: n.name.replace(/[^a-zA-Z0-9]/g, '') + '-logo-' + (i + 1) + '.png', content: buf.toString('base64') });
          }
        } catch (e) {}
      }
    }

    // body
    const whys = arr(n.kit.whyItWorks).slice(0, 8);
    const voice = arr(n.kit.voice).slice(0, 6);
    const htmlBody = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#FFFFFF;color:#F2F6FF">'
      + '<h1 style="font-size:24px;margin:0 0 2px">' + esc(n.name) + '</h1>'
      + (n.tagline ? '<p style="font-style:italic;color:#AFC2E1;margin:0 0 10px">&ldquo;' + esc(li(n.tagline)) + '&rdquo;</p>' : '')
      + '<p style="margin:0 0 16px;color:#AFC2E1"><b>Web address:</b> ' + esc(n.domain || '') + '</p>'
      + (mode === 'designer'
        ? '<p style="color:#AFC2E1">A SparkMyName customer is handing this brand to you. The complete brand card is attached as a PDF, with the logo files.</p>'
          + (note ? '<div style="border-left:3px solid #7C5CFF;padding-left:12px;margin:12px 0;color:#AFC2E1">' + esc(note) + '</div>' : '')
          /* PRODUCTION REQUIREMENTS (founder order 2026-07-16): the attached logos are
             raster PNGs — the handover must demand vector masters back. */
          + '<h3 style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin:16px 0 6px">Production requirements</h3>'
          + '<ul>'
          + '<li style="margin:3px 0"><b>Vector masters required:</b> recreate/finalize the logo as <b>SVG and EPS</b> (plus a print-ready PDF). The attached PNGs are reference rasters only &mdash; final delivery must be vector.</li>'
          + '<li style="margin:3px 0">Include a 2048px transparent PNG export set derived from the vectors.</li>'
          + '<li style="margin:3px 0">Match the palette in the attached brand card exactly (HEX; Pantone as the coated reference for print).</li>'
          + '</ul>'
          + '<h3 style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin:16px 0 6px">Why this name works</h3><ul>' + whys.map(function(w){ return '<li style="margin:3px 0">' + esc(w) + '</li>'; }).join('') + '</ul>'
          + '<h3 style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin:16px 0 6px">Tone &amp; voice</h3><p>' + esc(voice.join(' · ')) + '</p>'
          + '<h3 style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin:16px 0 6px">Strategic context</h3><p>Built from the founder&rsquo;s own words: &ldquo;' + esc(seed) + '&rdquo;</p>'
        : '<p style="color:#AFC2E1">Your complete brand card is attached as a PDF &mdash; every word, color, and detail, ready to print or share.</p>')
      + '<p style="margin-top:20px;font-size:11px;color:#7E93B8">SparkMyName &middot; VORREX IGNITE LLC &middot; The brand is yours &mdash; run your own trademark check before use.</p></div>';

    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + RESEND, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [mode === 'designer' ? to : email],
        reply_to: email,
        subject: mode === 'designer' ? ('Designer handover: ' + n.name + ' — complete brand package') : ('Your brand card: ' + n.name),
        text: plainTextFrom(htmlBody), html: htmlBody,
        attachments: attachments
      })
    });
    if (send.status >= 300){
      const t2 = await send.text().catch(function(){ return ''; });
      console.error('email-brand resend failed', send.status, t2.slice(0, 200));
      return resp(502, { ok: false, error: 'send_failed' });
    }
    return resp(200, { ok: true, mode: mode, attachments: attachments.length });
  } catch (e) {
    console.error('email-brand exception', e && e.message ? e.message : String(e));
    return resp(502, { ok: false, error: 'op_failed' });
  }
};
