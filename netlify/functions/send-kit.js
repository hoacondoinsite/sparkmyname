// Emails a buyer their creative kit via Resend. Dependency-free (raw fetch).
// Env: RESEND_API_KEY (required), RESEND_FROM (optional; must use a VERIFIED domain to email anyone).
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';

// Pull one name's fields out of an input object (used for both single and array modes).
function pickName(b) {
  return {
    name: (b.name || '').slice(0, 90),
    score: b.score,
    tagline: (b.tagline || '').slice(0, 160),
    why: (b.why || '').slice(0, 600),
    domain: (b.domain || '').slice(0, 120),
    domainAvailable: b.domainAvailable,
    handle: (b.handle || '').slice(0, 80),
    kit: b.kit || {}
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!KEY) return resp(500, { ok: false, error: 'missing_resend_key' });

  let to = '', names = [], reportUrl = '', accountUrl = '', conf = '', kind = '', added = 0, seed = '', plan = '';
  try {
    const b = JSON.parse(event.body || '{}');
    to = (b.to || '').slice(0, 160).trim();
    reportUrl = (b.reportUrl || '').slice(0, 400).trim();
    accountUrl = (b.accountUrl || '').slice(0, 400).trim();
    kind = (b.kind || '').trim();
    added = parseInt(b.added, 10) || 0;
    seed = (b.seed || '').slice(0, 300).trim();
    plan = (b.plan || '').slice(0, 20).trim();
    conf = (b.conf || '').slice(0, 40).trim();
    // NEW: combined mode — an array of names arrives as b.names.
    // OLD: single mode — one name arrives as top-level fields. Both supported.
    if (Array.isArray(b.names) && b.names.length) {
      names = b.names.slice(0, 60).map(pickName).filter(function (n) { return n.name; });
    } else if (b.name) {
      names = [pickName(b)];
    }
  } catch (e) {}

  if (!to || to.indexOf('@') < 1) return resp(400, { ok: false, error: 'bad_email' });

  // Short "refinement ready" notification (async Refine). No names in the body.
  if (kind === 'refine') {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [to], subject: 'Your new names are ready — come see them', text: 'Your new names are ready. See them in your Brand Home: https://sparkmyname.com/account.html', html: buildRefineEmail(added || 25, accountUrl) })
      });
      const d = await r.json().catch(function () { return {}; });
      if (r.status >= 300 || d.error) { console.error('resend refine failed', r.status); return resp(502, { ok: false, error: 'send_failed' }); }
      return resp(200, { ok: true, refine: true });
    } catch (e) { console.error('resend refine exception', e && e.message ? e.message : String(e)); return resp(502, { ok: false, error: 'send_failed' }); }
  }

  // Purchase confirmation — a warm receipt the moment payment lands, before the build.
  if (kind === 'confirm') {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [to], subject: 'Thank you \u2014 your SparkMyName order is confirmed', text: confirmText(seed), html: buildConfirmEmail(seed, '', FOUNDER_HELP) })
      });
      const d = await r.json().catch(function () { return {}; });
      if (r.status >= 300 || d.error) { console.error('resend confirm failed', r.status); return resp(502, { ok: false, error: 'send_failed' }); }
      return resp(200, { ok: true, confirm: true });
    } catch (e) { console.error('resend confirm exception', e && e.message ? e.message : String(e)); return resp(502, { ok: false, error: 'send_failed' }); }
  }

  if (!names.length) return resp(400, { ok: false, error: 'no_name' });

  // ONE email — whether it's 1 name or 60. This is the spam fix (P264):
  // a buyer's whole report arrives as a single message, never one-email-per-name.
  const subject = (names.length === 1)
    ? ('Your brand is ready \u2014 ' + names[0].name)
    : 'Your brand is ready \u2014 come see it';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject: subject, text: plainText(names, reportUrl, accountUrl), html: buildEmail(names, reportUrl, accountUrl, conf, seed) })
    });
    const d = await r.json().catch(function () { return {}; });
    if (r.status >= 300 || d.error) { console.error('resend failed', r.status, JSON.stringify(d).slice(0, 200)); return resp(502, { ok: false, error: (d.error && (d.error.message || d.error)) || 'send_failed' }); }
    return resp(200, { ok: true, sent: names.length });
  } catch (e) { console.error('resend exception', e && e.message ? e.message : String(e)); return resp(502, { ok: false, error: 'send_failed' }); }
};

// Build the customer's no-login workspace link from the report key baked into reportUrl.
function workspaceUrl(reportUrl, accountUrl) {
  try {
    var m = /[?&]r=([A-Za-z0-9_-]+)/.exec(reportUrl || '');
    var key = m ? m[1] : '';
    var origin = '';
    try { origin = (String(reportUrl || '').match(/^https?:\/\/[^\/]+/) || [])[0] || ''; } catch (e) {}
    if (!origin) { try { origin = (String(accountUrl || '').match(/^https?:\/\/[^\/]+/) || [])[0] || ''; } catch (e) {} }
    if (!origin) origin = 'https://sparkmyname.netlify.app';
    if (key) return origin + '/workspace.html?r=' + encodeURIComponent(key);
    return origin + '/account.html';
  } catch (e) { return 'https://sparkmyname.netlify.app/account.html'; }
}
var FOUNDER_HELP = 'mailto:support@sparkmyname.com?subject=' + encodeURIComponent('I need help with my SparkMyName order') + '&body=' + encodeURIComponent('Hi Peter, I need a hand with my order. Here is what is going on:');

function esc(s) { return String(s == null ? '' : s).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E000}-\u{F8FF}]/gu, '').replace(/\s{2,}/g, ' ').trim().replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

var INK = '#141414', MID = '#55605B', HAIR = 'rgba(24,152,80,.25)', FLAME = '#127A40', GREEN = '#189850'; var VOID='#FFFFFF', PANEL='#F4F6F5', GOLD='#B7791F';

// ONE name's content block (headline + domain + every Brand Identity Strategy section).
// `withTopRule` draws a divider above it so stacked names read as clean, separate sections.
function _emHandles(name){var h=String(name||'').toLowerCase().replace(/[^a-z0-9]/g,'');if(!h)return '';var P=[['Instagram','@'],['X','@'],['TikTok','@'],['Facebook','/'],['YouTube','@']];return '<table width="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;" cellpadding="0" cellspacing="0" role="presentation">'+P.map(function(p){return '<tr><td style="font:700 11px/1.7 Arial,Helvetica,sans-serif;color:#55605B;text-transform:uppercase;letter-spacing:.04em;padding:5px 0;border-bottom:1px solid rgba(24,152,80,.2);">'+p[0]+'</td><td align="right" style="font:700 14px/1.7 Arial,Helvetica,sans-serif;color:#141414;padding:5px 0;border-bottom:1px solid rgba(24,152,80,.2);">'+p[1]+esc(h)+'</td></tr>';}).join('')+'</table>';}
function nameBlock(m, withTopRule) {
  var kit = m.kit || {};
  var avail = m.domainAvailable === true;
  var LBL = 'font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:' + INK + ';';
  var BODY = 'font:400 15px/1.6 Arial,Helvetica,sans-serif;color:' + INK + ';';
  function sec(lbl, body) { return body ? ('<div style="margin:22px 0 0;"><div style="' + LBL + '">' + esc(lbl) + '</div><div style="border-top:1px solid ' + HAIR + ';margin:7px 0 10px;"></div><div style="' + BODY + '">' + body + '</div></div>') : ''; }
  function kv(arr){ if(!Array.isArray(arr)||!arr.length) return ''; return arr.map(function(o){ if(!o) return ''; if(typeof o==='string'){ var s=esc(o); return s?'<div style="margin:0 0 7px;">'+s+'</div>':''; } var l=o.label?'<strong>'+esc(o.label)+'</strong>':''; var dsc=o.desc?(l?' &mdash; ':'')+esc(o.desc):''; var line=l+dsc; return line?'<div style="margin:0 0 7px;">'+line+'</div>':''; }).join(''); }
  function bl(arr){ if(!Array.isArray(arr)||!arr.length) return ''; return arr.map(function(s){ s=esc(s); return s?'<div style="margin:0 0 7px;">'+s+'</div>':''; }).join(''); }
  function pals(arr){ if(!Array.isArray(arr)||!arr.length) return ''; return arr.map(function(p){ var sw=((p&&p.colors)||[]).map(function(hex){ hex=esc(String(hex)); return '<span style="display:inline-block;width:54px;vertical-align:top;margin:0 8px 6px 0;"><span style="display:block;height:30px;border-radius:6px;background:'+hex+';border:1px solid rgba(0,0,0,0.06);"></span><span style="display:block;font:400 10px/1.5 Arial,Helvetica,sans-serif;color:'+MID+';margin-top:3px;">'+hex+'</span></span>'; }).join(''); return '<div style="margin:0 0 16px;"><div style="font:700 13px/1.3 Arial,Helvetica,sans-serif;color:'+INK+';margin:0 0 7px;">'+esc((p&&p.name)||'Palette')+((p&&p.note)?' <span style="font-weight:400;color:'+MID+';">&mdash; '+esc(p.note)+'</span>':'')+'</div>'+sw+'</div>'; }).join(''); }

  return '' +
    (withTopRule ? '<div style="border-top:3px solid ' + HAIR + ';margin:38px 0 0;"></div>' : '') +
    '<div style="font:700 34px/1.15 Georgia,\'Times New Roman\',serif;color:' + INK + ';margin:30px 0 0;">' + esc(m.name) + '</div>' +
    (m.score ? '<div style="font:700 11px/1 Arial,Helvetica,sans-serif;letter-spacing:1.2px;color:' + INK + ';margin:14px 0 0;">NAME STRENGTH ' + esc(m.score) + ' / 100</div>' : '') +
    (m.tagline ? '<div style="font:400 17px/1.4 Arial,Helvetica,sans-serif;color:' + INK + ';margin:10px 0 0;">' + esc(m.tagline) + '</div>' : '') +
    (m.domain ? ('<div style="margin:22px 0 0;border:1px solid ' + HAIR + ';background:transparent;border-radius:8px;padding:16px 18px;"><table width="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;" cellpadding="0" cellspacing="0" role="presentation"><tr><td><div style="font:700 10px/1 Arial,Helvetica,sans-serif;letter-spacing:1.2px;color:' + MID + ';">YOUR DOMAIN</div><div style="font:700 22px/1.2 Arial,Helvetica,sans-serif;color:' + INK + ';margin:6px 0 2px;">' + esc(m.domain) + '</div><div style="font:400 13px/1.4 Arial,Helvetica,sans-serif;color:' + MID + ';">' + (avail ? 'Ready to buy today &mdash; you can claim this web address now.' : 'Someone already owns this one &mdash; try .co or .io, or add a word.') + '</div></td>' + (avail ? '<td align="right" valign="top" style="white-space:nowrap;"><span style="font:700 13px/1 Arial,Helvetica,sans-serif;color:' + GREEN + ';">&#9679; Available</span></td>' : '') + '</tr></table></div>') : '') +
    sec('Social handles', _emHandles(m.name)) +
    sec('Why this name works', (kit.whyItWorks && kit.whyItWorks.length) ? bl(kit.whyItWorks) : esc(m.why)) +
    ((kit.taglines && kit.taglines.length) ? sec('Taglines', bl(kit.taglines)) : '') +
    ((kit.palettes && kit.palettes.length) ? sec('Color palettes', pals(kit.palettes)) : '') +
    ((kit.fonts && kit.fonts.length) ? sec('Font pairings', kv(kit.fonts)) : '') +
    ((kit.voice && kit.voice.length) ? sec('Voice & tone', kv(kit.voice)) : '') +
    ((kit.bios && kit.bios.length) ? sec('Social bios', bl(kit.bios)) : '') +
    ((kit.about && kit.about.length) ? sec('About', bl(kit.about)) : '') +
    ((kit.linkedin && kit.linkedin.length) ? sec('LinkedIn "About" sections', bl(kit.linkedin)) : '') +
    ((kit.facebook && kit.facebook.length) ? sec('Facebook Page intros', bl(kit.facebook)) : '') +
    ((kit.posts && kit.posts.length) ? sec('Launch posts', bl(kit.posts)) : '');
}

// Short, premium "your additional concepts are ready" note for the async Refine.
function buildRefineEmail(added, accountUrl) {
  var ACCENT = '#189850', INKC = '#141414', MUTED = '#55605B', LINE = 'rgba(24,152,80,.25)';
  var SANS = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif";
  var portal = workspaceUrl('', accountUrl);
  return _emDocWrap('' +
  '<div style="margin:0;padding:38px 14px;background:#F0F7F3;font-family:' + SANS + ';">' +
  '<div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid ' + LINE + ';border-radius:20px;overflow:hidden;">' +
    '<div style="padding:36px 36px 34px;">' +
      '<span style="font:800 22px/1 Arial,Helvetica,sans-serif;letter-spacing:-.02em;color:#141414;">Spark<span style="color:#189850;">My</span>Name<span style=\"font-size:.55em;vertical-align:super\">&trade;</span></span>' +
      '<div style="font:800 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:' + ACCENT + ';margin:34px 0 0;">More names \u2014 on us</div>' +
      '<div style="font:800 30px/1.1 ' + SANS + ';letter-spacing:-.04em;color:' + INKC + ';margin:12px 0 0;">Your new names are ready.</div>' +
      '<div style="font:400 16px/1.6 ' + SANS + ';color:' + INKC + ';margin:14px 0 0;">Thank you for building with us. ' + added + ' fresh names are waiting in your workspace \u2014 each one with its full brand. One tap opens it, no login needed.</div>' +
      '<div style="margin:26px 0 0;">' +
        '<a href="' + esc(portal) + '" style="display:inline-block;font:800 16px/1 Arial,Helvetica,sans-serif;color:#FFFFFF;background:' + ACCENT + ';text-decoration:none;padding:17px 34px;border-radius:100px;">Open my workspace &rarr;</a>' +
      '</div>' +
      '<div style="font:400 13px/1.6 ' + SANS + ';color:' + MUTED + ';margin:16px 0 0;">Trouble getting in? <a href="' + FOUNDER_HELP + '" style="color:' + INKC + ';font-weight:700;">Message our founder, Peter Klein, directly &rarr;</a></div>' +
      '<div style="border-top:1px solid ' + LINE + ';margin:34px 0 0;padding:20px 0 0;">' +
        /* SOMETHING WRONG? (2026-07-26, Founder order). A mailto is a dead end if the customer is on
             a phone with no mail app set up. The support desk takes it either way and it gets tracked. */
        '<div style="font:400 14px/1.6 ' + SANS + ';color:' + MUTED + ';">'
          + 'Anything not right, or a piece missing? '
          + '<a href="' + esc(SUPPORT_URL) + '" style="color:' + INKC + ';font-weight:700;">Tell us and we will fix it &rarr;</a>'
          + ' &nbsp;&middot;&nbsp; <a href="mailto:support@sparkmyname.com" style="color:' + MUTED + ';">support@sparkmyname.com</a>'
        + '</div>' +
        '<div style="font:400 11px/1.55 Arial,Helvetica,sans-serif;color:#55605B;margin:14px 0 0;">AI-generated suggestions are informational only \u2014 not legal or trademark advice. Consult a qualified attorney before adopting any name.</div>' +
        '<div style="margin:26px 0 6px;padding:20px 22px;border:2px solid rgba(124,92,255,.55);border-radius:12px;background:rgba(124,92,255,.07)">'+'<div style="font:800 15px/1.4 Inter,Arial,sans-serif;color:#5B3FD6;margin:0 0 6px">&#10024; Your Spark Store is open \u2014 complimentary for your first 90 days</div>'+'<div style="font:400 13.5px/1.6 Inter,Arial,sans-serif;color:#26333F">Inside your workspace is a store of 100+ custom pieces \u2014 menus, flyers, posters, social posts, banners, event kits \u2014 each one built with your logo, your colors, your look, and delivered within 24 hours. Holiday special? Big trip? New promotion? Come shopping any time \u2014 it\u2019s how brands that grow stay everywhere. It\u2019s all included for your first 90 days, and everything ever delivered is yours forever.</div>'+'</div>'+'<div style="font:400 11px/1.55 Arial,Helvetica,sans-serif;color:#55605B;margin:5px 0 0;">&copy; 2026 SparkMyName&trade;. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).</div>' +
      '</div>' +
    '</div>' +
  '</div></div>', 'Fresh names are waiting in your workspace.');
}

// The email. MULTI-name = short Nike-style welcome that points to the portal/report
// (no giant stacked report in the body). SINGLE-name = the full kit (used by the
// per-card "email it to me" button).
function _emIni(name){var w=String(name||'').trim().split(/\s+/).filter(Boolean);if(!w.length)return'B';if(w.length===1)return w[0].slice(0,2).toUpperCase();return (w[0].charAt(0)+w[1].charAt(0)).toUpperCase();}
function _emLum(hex){try{var h=String(hex).replace('#','');if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];}var r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);return (0.299*r+0.587*g+0.114*b)/255;}catch(e){return 0;}}
function _emDocWrap(bodyHtml, preheader){
  return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
   + '<meta name="viewport" content="width=device-width,initial-scale=1">'
   + '<meta http-equiv="X-UA-Compatible" content="IE=edge"><title>SparkMyName</title></head>'
   + '<body style="margin:0;padding:0;background:#F0F7F3;">'
   + (preheader ? '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">'+preheader+'</div>' : '')
   + bodyHtml + '</body></html>';
}
function _emMono(name,c1,sz){var tile=c1||'#189850';var txt=_emLum(tile)>0.62?'#141414':'#FFFFFF';return '<span style="display:inline-block;width:'+sz+'px;height:'+sz+'px;border-radius:'+Math.round(sz*0.22)+'px;background:'+tile+';border:1px solid rgba(20,60,40,.15);color:'+txt+';font:800 '+Math.round(sz*0.42)+'px/'+sz+'px Arial,sans-serif;text-align:center;">'+esc(_emIni(name))+'</span>';}
function _emPickColors(m){try{var pals=m&&m.kit&&m.kit.palettes;if(pals&&pals[0]&&pals[0].colors&&pals[0].colors.length){var cs=pals[0].colors;return {c1:cs[0]||'#EAF7F0',c2:(cs[1]||'#189850')};}}catch(e){}return {c1:'#EAF7F0',c2:'#189850'};}
function _emLaneGroups(names){var ORDER=[['professional','Professional'],['standard','Standard'],['clever','Clever'],['human','Human Touch']];var has=false;for(var i=0;i<names.length;i++){if(names[i].lane){has=true;break;}}if(!has)return '';var out='';for(var g=0;g<ORDER.length;g++){var lk=ORDER[g][0],ll=ORDER[g][1],rows='';for(var i=0;i<names.length;i++){if((names[i].lane||'').toLowerCase()===lk){rows+='<tr><td style="font:600 15px/1.5 Arial,Helvetica,sans-serif;color:#141414;padding:5px 0;">'+esc(names[i].name)+'</td><td style="font:400 13px/1.5 Arial,Helvetica,sans-serif;color:#55605B;padding:5px 0;text-align:right;">'+esc(names[i].domain||'')+'</td></tr>';}}if(!rows)continue;out+='<div style="font:800 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#189850;margin:22px 0 6px;">'+ll+'</div><table width="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;" cellpadding="0" cellspacing="0" role="presentation">'+rows+'</table>';}return out?('<div style="font:800 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#127A40;margin:36px 0 0;">Your names, by style</div><div style="border-top:1px solid rgba(24,152,80,.25);margin:12px 0 6px;"></div>'+out):'';}
function _emRestricted(names){var R={law:1,legal:1,cpa:1,realty:1,homes:1,realestate:1,inc:1,md:1,bank:1};var hit=false;for(var i=0;i<names.length;i++){var t=String(names[i].domain||'').split('.').pop().toLowerCase();if(R[t]){hit=true;break;}}if(!hit)return '';return '<div style="border:1px solid rgba(212,175,55,.35);background:rgba(212,175,55,.10);border-radius:12px;padding:12px 14px;margin:18px 0 0;font:500 12.5px/1.55 Arial,Helvetica,sans-serif;color:#FF8FB0;"><b>Eligibility required.</b> Some endings (.law, .cpa, and similar) are professional / restricted domains that require proof of credentials or licensing to register. Verify you qualify before purchasing.</div>';}
function plainText(names, reportUrl, accountUrl){
  names = Array.isArray(names)?names:[names];
  var L=['SparkMyName \u2014 your brand is ready.',''];
  names.forEach(function(m){ if(m&&m.name) L.push('\u2022 '+m.name+(m.domain?(' \u2014 '+m.domain):'')); });
  L.push('');
  if(reportUrl) L.push('See your brand: '+reportUrl);
  L.push('Your Brand Home: '+(accountUrl||'https://sparkmyname.com/account.html'));
  L.push('');L.push('\u00a9 2026 SparkMyName&trade;. Owned by VORREX IGNITE LLC.');
  return L.join('\n');
}
/* The photograph, if there is one. Names arrive with a `kit` from the report, and the header
   image lives inside it — but this email must never fail because a shape changed, so every
   step is guarded and a missing photo simply means no photo. */
function _emHeroUrl(names){
  try{
    var list = Array.isArray(names) ? names : [names];
    for (var i = 0; i < list.length; i++) {
      var k = list[i] && list[i].kit;
      var u = (k && (k.headerUrl || k.heroUrl)) || list[i].heroUrl || list[i].headerUrl;
      if (u && /^https?:\/\//.test(String(u))) return String(u);
    }
  }catch(e){}
  return '';
}

function buildEmail(names, reportUrl, accountUrl, conf, seed) {
  names = Array.isArray(names) ? names : [names];
  var multi = names.length > 1;
  var portal = (accountUrl && /^https?:\/\//.test(accountUrl)) ? accountUrl : 'https://sparkmyname.com/account.html';
  var hasReport = (reportUrl && /^https?:\/\//.test(reportUrl));

  // ---- SHORT WELCOME (multi-name): the email is just a warm doorway to the portal. ----
  if (multi) {
    var ACCENT = '#189850', INKC = '#141414', MUTED = '#55605B', LINE = 'rgba(24,152,80,.25)', GREEN2 = '#189850';
    var SANS = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif";
    var topPick = names[0];
    for (var ti = 1; ti < names.length; ti++) { if ((parseInt(names[ti].score, 10) || 0) > (parseInt(topPick.score, 10) || 0)) topPick = names[ti]; }
    var remaining = names.length - 1;
    var topAvail = topPick.domainAvailable === true;
    var pc = _emPickColors(topPick);
    var openUrl = workspaceUrl(reportUrl, accountUrl) || portal;
    var incl = ['Brandable business names','Available domains','Brand strategy','Brand voice','Color palette','Font recommendations','Social handles','Taglines','Social bios','Launch content'];
    var inclRows = incl.map(function (t) { return '<tr><td style="vertical-align:top;width:28px;padding:7px 0;"><span style="color:' + GREEN2 + ';font:700 15px/1 Arial,Helvetica,sans-serif;">&#10003;</span></td><td style="font:400 15px/1.5 ' + SANS + ';color:' + INKC + ';padding:7px 0;">' + t + '</td></tr>'; }).join('');
    return _emDocWrap('' +
    '<div style="margin:0;padding:38px 14px;background:#F0F7F3;font-family:' + SANS + ';">' +
    '<div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid ' + LINE + ';border-radius:22px;overflow:hidden;">' +
      '<div style="height:5px;background:linear-gradient(90deg,#189850,#33C273,#127A40);font-size:0;line-height:0;">&nbsp;</div>' +
      '<div style="padding:36px 36px 34px;">' +
        '<span style="font:800 22px/1 Arial,Helvetica,sans-serif;letter-spacing:-.02em;color:#141414;">Spark<span style="color:#189850;">My</span>Name<span style=\"font-size:.55em;vertical-align:super\">&trade;</span></span>' +
        /* THE ARRIVAL (2026-07-26, Founder order).
           A celebration band, then their own words back, then the photograph, then what was
           made. Confetti cannot fall in an email — no client runs JavaScript and Gmail and
           Outlook strip CSS animation — so the celebration is done with colour and type, which
           renders everywhere including with images blocked. */
        '<div style="margin:30px 0 0;padding:14px 18px;border-radius:100px;display:inline-block;'
          + 'background:linear-gradient(90deg,rgba(24,152,80,.16),rgba(51,194,115,.16),rgba(18,122,64,.16));'
          + 'border:1px solid rgba(24,152,80,.35);">'
          + '<span style="font:800 13px/1 ' + SANS + ';letter-spacing:.12em;text-transform:uppercase;color:#127A40;">'
          + '&#127881;&nbsp; It is here &nbsp;&#127881;</span>'
        + '</div>' +
        '<img src="https://sparkmyname.netlify.app/img/email-banner.jpg" alt="" width="560" style="display:block;width:100%;max-width:560px;border-radius:14px;margin:0 auto 14px;">' +
        '<div style="font:800 34px/1.08 ' + SANS + ';letter-spacing:-.04em;color:' + INKC + ';margin:18px 0 0;">Your brand is ready.</div>' +
        '<div style="margin:20px 0 6px;">' +
        '<a href="' + esc(openUrl) + '" style="display:inline-block;font:800 17px/1 ' + SANS + ';color:#FFFFFF;background:#189850;text-decoration:none;padding:16px 30px;border-radius:100px;">Open your workspace &rarr;</a>' +
        '<div style="font:400 13px/1.5 ' + SANS + ';color:' + MUTED + ';margin:10px 0 0;">One tap &mdash; no login needed.</div>' +
      '</div>' +
        
        (seed ? ('<div style="margin:20px 0 0;padding:16px 18px;border-left:3px solid ' + ACCENT + ';background:rgba(24,152,80,.06);border-radius:0 12px 12px 0;">'
            + '<div style="font:800 11px/1 ' + SANS + ';letter-spacing:.14em;text-transform:uppercase;color:' + ACCENT + ';">You told us</div>'
            + '<div style="font:400 15px/1.6 ' + SANS + ';color:' + INKC + ';margin:8px 0 0;font-style:italic;">&ldquo;' + esc(String(seed).slice(0,260)) + '&rdquo;</div>'
            + '<div style="font:400 14px/1.6 ' + SANS + ';color:' + MUTED + ';margin:10px 0 0;">We built every part of what follows around exactly that.</div>'
          + '</div>') : '') +
        (_emHeroUrl(names) ? ('<div style="margin:22px 0 0;">'
            + '<img src="' + esc(_emHeroUrl(names)) + '" width="520" alt="A first look at ' + esc(topPick.name || 'your brand') + '" '
            + 'style="width:100%;max-width:520px;height:auto;border-radius:14px;display:block;border:1px solid rgba(255,255,255,.14);" />'
            + '<div style="font:400 12px/1.5 ' + SANS + ';color:' + MUTED + ';margin:8px 0 0;">One of the photographs made for ' + esc(topPick.name || 'your brand') + '. The rest are in your workspace.</div>'
          + '</div>') : '') +
        '<div style="font:400 16px/1.6 ' + SANS + ';color:' + MUTED + ';margin:22px 0 0;">Thank you for trusting SparkMyName. We built this for you with real care \u2014 and we are honored to be a small part of your success. One tap below opens it \u2014 no password, no login, no wait.</div>' +
        '<div style="margin:28px 0 0;border:1px solid ' + LINE + ';background:#F7FBF9;border-radius:18px;padding:26px 28px;">' +
          '<div style="font:800 11px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:' + ACCENT + ';">Our Top Pick</div>' +
          '<table cellpadding="0" cellspacing="0" role="presentation" style="margin:12px 0 0;"><tr>'+'<td style="vertical-align:middle;padding-right:12px;">'+_emMono(topPick.name,pc.c2,48)+'</td>'+'<td style="vertical-align:middle;"><div style="font:800 28px/1.05 ' + SANS + ';letter-spacing:-.03em;color:#141414;">' + esc(topPick.name) + '</div>'+'<div style="margin-top:9px;"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:'+pc.c1+';border:1px solid rgba(20,60,40,.2);vertical-align:middle;"></span> <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:'+pc.c2+';border:1px solid rgba(20,60,40,.2);vertical-align:middle;margin-left:4px;"></span> <span style="font:600 12px/1 ' + SANS + ';color:#55605B;vertical-align:middle;margin-left:6px;">Your brand colors</span></div></td></tr></table>' +
          (topPick.domain ? ('<div style="margin:14px 0 0;"><span style="display:inline-block;font:700 14px/1 Arial,Helvetica,sans-serif;color:#127A40;background:#E7F5EC;border:1px solid rgba(24,152,80,.3);padding:9px 16px;border-radius:100px;">' + esc(topPick.domain) + (topAvail ? ' &nbsp;&#10003; Available' : '') + '</span></div>') : '') +
          (remaining > 0 ? ('<div style="font:400 14px/1.5 Arial,Helvetica,sans-serif;color:' + MUTED + ';margin:12px 0 0;">+' + remaining + ' more names inside</div>') : '') +
        '</div>' +
        '<div style="margin:26px 0 0;">' +
          '<a href="' + esc(openUrl) + '" style="display:inline-block;font:800 16px/1 Arial,Helvetica,sans-serif;color:#FFFFFF;background:' + ACCENT + ';text-decoration:none;padding:17px 34px;border-radius:100px;">Open my workspace &rarr;</a>' +
        '</div>' +
        '<div style="font:400 12px/1.55 Arial,Helvetica,sans-serif;color:#55605B;margin:14px 0 0;">Your logos, social graphics, and website visuals are all inside your workspace \u2014 generated for you automatically and ready to use. No design software, no camera, no recording; every asset is produced by Spark and yours to download and use anywhere.</div>' +
        '<div style="font:400 13px/1.6 ' + SANS + ';color:' + MUTED + ';margin:16px 0 0;">The button not opening? <a href="' + esc(FOUNDER_HELP) + '" style="color:' + INKC + ';font-weight:700;">Message our founder, Peter Klein, directly &rarr;</a> \u2014 he will personally make sure you get in.</div>' +
        _emLaneGroups(names) + _emRestricted(names) +
        '<div style="font:800 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:' + INKC + ';margin:38px 0 0;">Inside your Brand Home</div>' +
        '<div style="border-top:1px solid ' + LINE + ';margin:12px 0 6px;"></div>' +
        '<table width="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;" cellpadding="0" cellspacing="0" role="presentation">' + inclRows + '</table>' +
        '<div style="margin:32px 0 0;border:1px solid ' + LINE + ';border-radius:16px;padding:22px 24px;background:transparent;">' +
          '<div style="font:800 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:' + INKC + ';">Yours to keep</div>' +
          '<div style="font:400 15px/1.6 ' + SANS + ';color:' + INKC + ';margin:10px 0 0;">Your brand is saved in your Brand Home for good. Come back anytime to download it as a PDF, print it, or share it.</div>' +
        '</div>' +
        '<div style="border-top:1px solid ' + LINE + ';margin:34px 0 0;padding:20px 0 0;">' +
          /* SOMETHING WRONG? (2026-07-26, Founder order). A mailto is a dead end on a phone with
             no mail app configured, and nothing is tracked. The support desk takes it either way. */
          '<div style="font:400 14px/1.6 ' + SANS + ';color:' + MUTED + ';">'
            + 'Anything missing, or not quite right? '
            + '<a href="' + esc(SUPPORT_URL) + '" style="color:' + INKC + ';font-weight:700;">Tell us and we will fix it &rarr;</a>'
            + ' &nbsp;&middot;&nbsp; <a href="mailto:support@sparkmyname.com" style="color:' + MUTED + ';">support@sparkmyname.com</a>'
          + '</div>' +
          '<div style="font:400 11px/1.55 Arial,Helvetica,sans-serif;color:#55605B;margin:14px 0 0;">AI-generated suggestions are informational only &mdash; not legal or trademark advice. Consult a qualified attorney before adopting any name. We do not perform trademark clearance.</div>' +
          '<div style="margin:26px 0 6px;padding:20px 22px;border:2px solid rgba(124,92,255,.55);border-radius:12px;background:rgba(124,92,255,.07)">'+'<div style="font:800 15px/1.4 Inter,Arial,sans-serif;color:#5B3FD6;margin:0 0 6px">&#10024; Your Spark Store is open \u2014 complimentary for your first 90 days</div>'+'<div style="font:400 13.5px/1.6 Inter,Arial,sans-serif;color:#26333F">Inside your workspace is a store of 100+ custom pieces \u2014 menus, flyers, posters, social posts, banners, event kits \u2014 each one built with your logo, your colors, your look, and delivered within 24 hours. Holiday special? Big trip? New promotion? Come shopping any time \u2014 it\u2019s how brands that grow stay everywhere. It\u2019s all included for your first 90 days, and everything ever delivered is yours forever.</div>'+'</div>'+'<div style="font:400 11px/1.55 Arial,Helvetica,sans-serif;color:#55605B;margin:5px 0 0;">&copy; 2026 SparkMyName&trade;. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).</div>' +
        '</div>' +
      '</div>' +
    '</div></div>', 'Your brand is ready \u2014 one tap opens your workspace.');
  }

  // ---- FULL KIT (single name): used by the per-card "email it to me" button. ----
  var openBtn = hasReport
    ? ('<div style="margin:20px 0 0;"><a href="' + esc(reportUrl) + '" style="display:inline-block;font:700 14px/1 Arial,Helvetica,sans-serif;color:#FFFFFF;background:#189850;text-decoration:none;padding:13px 24px;border-radius:100px;">Open Your Brand Home</a></div>')
    : '';
  var blocks = names.map(function (m, idx) { return nameBlock(m, idx > 0); }).join('');

  return '' +
  '<div style="margin:0;padding:24px 12px;background:#FFFFFF;font-family:Arial,Helvetica,sans-serif;">' +
  '<div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid rgba(24,152,80,.2);">' +
    '<div style="height:5px;background:linear-gradient(90deg,#189850,#33C273,#127A40);font-size:0;line-height:0;">&nbsp;</div>' +
    '<div style="padding:30px 34px;">' +
      '<table width="100%" bgcolor="#FFFFFF" style="background:#FFFFFF;" cellpadding="0" cellspacing="0" role="presentation"><tr>' +
        '<td style="vertical-align:middle;"><span style="font:800 20px/1 Arial,Helvetica,sans-serif;letter-spacing:-.02em;color:#141414;">Spark<span style="color:#189850;">My</span>Name</span></td>' +
        '<td align="right" style="font:700 10px/1 Arial,Helvetica,sans-serif;letter-spacing:1.6px;color:' + MID + ';">YOUR BRAND</td>' +
      '</tr></table>' +
      '<div style="border-top:1px solid ' + HAIR + ';margin:14px 0 0;"></div>' +
      openBtn +
      blocks +
      
      '<div style="border-top:1px solid ' + HAIR + ';margin:28px 0 0;padding:18px 0 0;">' +
        '<div style="font:700 14px/1 Arial,Helvetica,sans-serif;color:' + INK + ';"><span style="color:' + FLAME + ';">&#10022;</span> SparkMyName</div>' +
        '<div style="font:400 13px/1.5 Arial,Helvetica,sans-serif;color:' + MID + ';margin:6px 0 0;">Questions? <a href="mailto:support@sparkmyname.com" style="color:' + MID + ';">support@sparkmyname.com</a> &nbsp;&middot;&nbsp; sparkmyname.com</div>' +
        '<div style="font:400 11px/1.5 Arial,Helvetica,sans-serif;color:#55605B;margin:12px 0 0;">AI-generated suggestions are informational only &mdash; not legal or trademark advice. Consult a qualified attorney before adopting any name. We do not perform trademark clearance.</div>' +
        '<div style="font:400 11px/1.5 Arial,Helvetica,sans-serif;color:#55605B;margin:4px 0 0;">&copy; 2026 SparkMyName&trade;. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).</div>' +
      '</div>' +
    '</div>' +
  '</div></div>';
}

// Back-compat: anything that still calls buildHtml(singleName) keeps working.
function buildHtml(m) { return buildEmail([m]); }

function confirmText(seed){
  return ['SparkMyName \u2014 your order is confirmed. Thank you!','',
    (seed ? ('Your idea: \u201c' + seed + '\u201d') : ''),
    'We are already hand-crafting your brand \u2014 names, domains, logo, colors, voice, and launch content. It usually arrives within minutes, and always the same day. The moment it is ready, we will email you a one-tap link straight into your workspace \u2014 no login needed.',
    '',
    /* The HTML version says 30 minutes; this said "a few hours". A customer reading the plain-text
     part of the same email got a different answer to the same question. Both say 30 now. */
    'Not there yet? Check your spam or promotions folder first \u2014 that is usually where it is.',
    'Adding hello@sparkmyname.com to your contacts keeps it out of there in future.',
    '',
    'Still nothing after 15 minutes? Tell us at ' + SUPPORT_URL + ' and we will sort it out.',
    '', '\u00a9 2026 SparkMyName&trade;. Owned by VORREX IGNITE LLC.'].filter(Boolean).join('\n');
}
var SUPPORT_URL = (process.env.SITE_URL || 'https://sparkmyname.netlify.app')
  .replace(/\/$/,'') + '/support.html';
function buildConfirmEmail(seed, wsUrl, helpUrl){
  var ACCENT='#189850', INKC='#141414', MUTED='#55605B', LINE='rgba(24,152,80,.25)', GREEN2='#189850';
  var SANS="Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif";
  var steps=[['We received your order','Payment confirmed \u2014 you are all set.'],['We are custom-preparing your brand','Names, domains, logo, colors, voice, and launch content \u2014 crafted for your idea right now.'],['It arrives today \u2014 usually within minutes','We will email you the moment it is ready, with a one-tap link into your workspace.']];
  var rows=steps.map(function(st,i){return '<tr><td style="vertical-align:top;width:34px;padding:10px 0;"><span style="display:inline-block;width:24px;height:24px;border-radius:50%;background:'+ACCENT+';color:#FFFFFF;font:800 12px/24px Arial,Helvetica,sans-serif;text-align:center;">'+(i+1)+'</span></td><td style="padding:10px 0;"><div style="font:800 15px/1.35 '+SANS+';color:'+INKC+';">'+esc(st[0])+'</div><div style="font:400 14px/1.55 '+SANS+';color:'+MUTED+';margin:3px 0 0;">'+esc(st[1])+'</div></td></tr>';}).join('');
  /* goPortal removed 2026-07-26: the confirmation email no longer links to the workspace,
     because at the moment it is sent there is nothing behind that link yet. */
  return _emDocWrap(''+
  '<img src="https://sparkmyname.netlify.app/img/email-building.jpg" alt="" width="560" style="display:block;width:100%;max-width:560px;border-radius:14px;margin:0 auto 14px;">'+'<div style="margin:0;padding:38px 14px;background:#F0F7F3;font-family:'+SANS+';">'+
  '<div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid '+LINE+';border-radius:20px;overflow:hidden;">'+
    '<div style="height:5px;background:linear-gradient(90deg,#189850,#33C273,#127A40);font-size:0;line-height:0;">&nbsp;</div>'+
    '<div style="padding:36px 36px 34px;">'+
      '<span style="font:800 22px/1 Arial,Helvetica,sans-serif;letter-spacing:-.02em;color:#141414;">Spark<span style="color:#189850;">My</span>Name<span style=\"font-size:.55em;vertical-align:super\">&trade;</span></span>'+
      '<div style="font:800 12px/1 '+SANS+';letter-spacing:.16em;text-transform:uppercase;color:'+GREEN2+';margin:34px 0 0;">&#10003; Order confirmed</div>'+
      '<div style="font:800 32px/1.1 '+SANS+';letter-spacing:-.04em;color:'+INKC+';margin:12px 0 0;">Thank you \u2014 you just took the first step.</div>'+
      '<div style="font:400 16px/1.6 '+SANS+';color:'+MUTED+';margin:14px 0 0;">We are genuinely grateful you chose SparkMyName, and we are already at work on your brand. Here is exactly what happens next:</div>'+
      (seed ? ('<div style="margin:22px 0 0;border:1px solid '+LINE+';border-radius:14px;padding:16px 18px;"><div style="font:700 10px/1 Arial,Helvetica,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:'+ACCENT+';">Your idea</div><div style="font:400 16px/1.5 '+SANS+';color:'+INKC+';margin:7px 0 0;font-style:italic;">&ldquo;'+esc(seed)+'&rdquo;</div></div>') : '')+
      '<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0 0;">'+rows+'</table>'+
      /* NO WORKSPACE LINK IN THIS EMAIL (2026-07-26, Founder order).
         This carried an "Open my Command Center" button and a paragraph saying the workspace
         opens with one tap. At the moment this email is sent nothing has been built yet, so a
         customer following it arrived at an empty room and reasonably concluded something had
         gone wrong. The link belongs in the NEXT email, when there is something behind it.
         What replaces it is the two things a person actually needs while waiting: where to look
         if it seems not to have arrived, and who to ask. */
      '<div style="margin:26px 0 0;padding:18px 20px;border:1px solid '+LINE+';border-radius:14px;background:rgba(24,152,80,.06);">'+
        '<div style="font:800 14px/1.4 '+SANS+';color:'+INKC+';margin:0 0 8px;">While you wait</div>'+
        '<div style="font:400 14px/1.65 '+SANS+';color:'+MUTED+';margin:0 0 10px;">'+
          'Your brand usually lands within 15 minutes. We will email you the moment it is ready '+
          'and that email opens your workspace in one tap.'+
        '</div>'+
        '<div style="font:400 14px/1.65 '+SANS+';color:'+MUTED+';margin:0 0 10px;">'+
          '<b style="color:'+INKC+';">Not there yet?</b> Check your spam or promotions folder first '+
          '\u2014 that is where it usually is. Adding <b style="color:'+INKC+';">hello@sparkmyname.com</b> '+
          'to your contacts keeps it out of there in future.'+
        '</div>'+
        '<div style="font:400 14px/1.65 '+SANS+';color:'+MUTED+';margin:0;">'+
          'Still nothing after <b style="color:'+INKC+';">15 minutes</b>? '+
          '<a href="'+esc(SUPPORT_URL)+'" style="color:'+GREEN2+';font-weight:700;">Tell us and we will sort it out &rarr;</a>'+
        '</div>'+
      '</div>'+
      '<div style="margin:28px 0 0;border-top:1px solid '+LINE+';padding:20px 0 0;">'+
        /* The old line here said "within a few hours" and sat directly beneath the new one saying
             30 minutes, so the email gave two different answers to the same question. The founder
             set 30 minutes; the block above says it once, with the support desk attached. */
        '<div style="font:400 14px/1.6 '+SANS+';color:'+MUTED+';">You are part of the SparkMyName family now, and your success is ours.</div>'+
        '<div style="font:400 11px/1.55 Arial,Helvetica,sans-serif;color:#55605B;margin:16px 0 0;">AI-generated suggestions are informational only \u2014 not legal or trademark advice. Consult a qualified attorney before adopting any name.</div>'+
        '<div style="font:400 11px/1.55 Arial,Helvetica,sans-serif;color:#55605B;margin:5px 0 0;">&copy; 2026 SparkMyName&trade;. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).</div>'+
      '</div>'+
    '</div>'+
  '</div></div>', 'Order confirmed \u2014 your brand is being crafted right now.');
}
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
exports.buildHtml = buildHtml;
exports.buildEmail = buildEmail;
