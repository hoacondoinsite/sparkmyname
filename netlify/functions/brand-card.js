// BRAND CARD — the public, shareable page for ONE brand name.
// Founder order, 2026-07-27. Research pass (46 sources) named the gap: the workspace carries no
// Open Graph tags, so when a customer pastes their new brand into a text, Slack or Facebook it
// renders as a naked blue URL and SparkMyName is invisible. A share card lifts click-through
// materially, and "exposure virality" — customers showing off their own work — is the one growth
// loop a brand product owns naturally.
//
// WHY A FUNCTION AND NOT A PAGE: social crawlers do not run JavaScript. Open Graph tags must be
// in the HTML at crawl time, so this is server-rendered.
//
// GET /.netlify/functions/brand-card?r=<reportKey>&n=<position>
//
// WHAT IT EXPOSES, DELIBERATELY NARROW: the chosen name, its tagline, its domain and its hero
// photograph. Nothing else. Not the customer's email, not the other names, not a single download,
// not the order. The report key is the same unguessable credential the delivery emails already
// use; this page shows strictly less than the workspace that key already opens.
'use strict';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE    = process.env.SITE_URL || 'https://sparkmyname.netlify.app';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function html(code, body) {
  return {
    statusCode: code,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // crawlers cache aggressively; a short TTL lets a corrected card refresh the same day
      'Cache-Control': 'public, max-age=600'
    },
    body
  };
}

/* A shared brand is a page we WANT indexed and unfurled, so no noindex here — but it carries
   nothing private, which is what makes that safe. */
function page(o) {
  const title = o.name + (o.tag ? ' — ' + o.tag : '');
  const desc  = o.tag
    ? (o.tag + '  ·  A new brand, built with SparkMyName.')
    : ('A new brand, built with SparkMyName.');
  const img   = o.hero || (SITE + '/assets/og-default.png');
  const url   = SITE + '/.netlify/functions/brand-card?r=' + encodeURIComponent(o.r) + '&n=' + o.n;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="SparkMyName">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:image:width" content="1536">
<meta property="og:image:height" content="1024">
<meta property="og:url" content="${esc(url)}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap" rel="stylesheet">
<style>
  :root{--bg:#0A1428;--panel:#101F3D;--ink:#FFFFFF;--ink2:#B9CBE8;--ink3:#8399BD;
        --line:rgba(160,190,255,.18);--cyan:#21D4FD;--violet:#7C5CFF;--pink:#FF4D8D;--ok:#3BE88F}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink2);
       font-family:Inter,system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.6}
  .aurora{position:fixed;inset:0;z-index:-1;overflow:hidden}
  .orb{position:absolute;border-radius:50%;filter:blur(90px);opacity:.26}
  .o1{width:620px;height:620px;background:var(--violet);top:-200px;left:-140px}
  .o2{width:520px;height:520px;background:var(--cyan);bottom:-180px;right:-140px;opacity:.18}
  .wrap{max-width:940px;margin:0 auto;padding:40px 22px 64px}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:26px;overflow:hidden;
        box-shadow:0 40px 90px -50px rgba(124,92,255,.7)}
  .shot{position:relative;width:100%;aspect-ratio:2/1;overflow:hidden;background:#0A1428}
  .shot img{width:100%;height:100%;object-fit:cover;display:block}
  .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,10,24,0) 38%,rgba(6,10,24,.9) 96%)}
  .over{position:absolute;left:0;right:0;bottom:0;padding:26px 30px}
  h1{margin:0;font-size:clamp(31px,5vw,49px);font-weight:900;letter-spacing:-.03em;
     line-height:1.05;color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.55)}
  .tag{margin-top:8px;font-size:clamp(16px,2vw,20px);font-weight:500;color:#EAF2FF;opacity:.94}
  .body{padding:30px}
  .dom{font-size:20px;font-weight:700;color:var(--ink2);margin-bottom:14px;word-break:break-word}
  .chip{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--line);
        background:rgba(160,190,255,.08);border-radius:999px;padding:9px 18px;
        font-size:13px;font-weight:700;color:var(--ink)}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 10px rgba(59,232,143,.85)}
  .foot{margin-top:26px;padding-top:22px;border-top:1px solid var(--line);
        display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .made{font-size:13px;color:var(--ink3)}
  .made b{color:var(--ink);font-weight:800}
  .cta{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:13px 26px;
       background:linear-gradient(92deg,var(--violet),var(--pink));color:#fff;font-weight:800;
       font-size:15px;text-decoration:none;box-shadow:0 12px 30px -12px rgba(255,77,141,.55)}
  .cta:hover{filter:brightness(1.07)}
  .mono{width:100%;aspect-ratio:2/1;display:flex;align-items:center;justify-content:center;
        background:var(--panel);font-size:56px;font-weight:900;color:var(--violet)}
  @media(max-width:600px){.body{padding:22px}.over{padding:18px 20px}}
</style>
</head>
<body>
<div class="aurora"><div class="orb o1"></div><div class="orb o2"></div></div>
<div class="wrap">
  <div class="card">
    <div class="shot">
      ${o.hero
        ? `<img src="${esc(o.hero)}" alt="${esc(o.name)}">`
        : `<div class="mono">${esc((o.name || 'B').slice(0, 2).toUpperCase())}</div>`}
      <div class="scrim"></div>
      <div class="over">
        <h1>${esc(o.name)}</h1>
        ${o.tag ? `<div class="tag">${esc(o.tag)}</div>` : ''}
      </div>
    </div>
    <div class="body">
      ${o.dom ? `<div class="dom">${esc(o.dom)}</div>` : ''}
      <span class="chip"><span class="dot"></span>A brand built with SparkMyName</span>
      <div class="foot">
        <div class="made">Every name, logo, colour and photograph created in minutes.<br>
          <b>SparkMyName&trade;</b> &middot; one sentence in, a whole brand out.</div>
        <a class="cta" href="${esc(SITE)}/">Build mine &rarr;</a>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

function notFound() {
  return html(404, `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Brand not found — SparkMyName</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:#0A1428;color:#B9CBE8;font-family:Inter,system-ui,sans-serif;text-align:center;padding:24px}
a{color:#A78BFA}</style></head><body><div>
<h1 style="color:#fff;font-weight:900;margin:0 0 8px">That brand link is not available</h1>
<p>The link may be mistyped, or the brand may have been removed.</p>
<p><a href="${esc(SITE)}/">Go to SparkMyName</a></p></div></body></html>`);
}

exports.handler = async (event) => {
  const q = (event && event.queryStringParameters) || {};
  const r = String(q.r || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
  const n = Math.max(0, Math.min(20, parseInt(q.n, 10) || 0));
  if (!r || !SB_URL || !SB_KEY) return notFound();

  try {
    const res = await fetch(
      SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
      '&position=eq.' + n +
      '&select=name,tag:kit->>tag,dom:kit->>dom,hero:kit->>headerUrl&limit=1',
      { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
    if (!res.ok) return notFound();
    const rows = await res.json().catch(() => []);
    const row = rows && rows[0];
    if (!row || !row.name) return notFound();

    /* Only serve a hero we recognise as our own public storage. A URL pasted into the kit by
       any other route must never become the image we broadcast under our own name. */
    const hero = (typeof row.hero === 'string' && row.hero.indexOf('/storage/v1/object/public/') > 0)
      ? row.hero : '';

    return html(200, page({
      r, n,
      name: row.name,
      tag:  row.tag || '',
      dom:  row.dom || '',
      hero
    }));
  } catch (e) {
    return notFound();
  }
};
