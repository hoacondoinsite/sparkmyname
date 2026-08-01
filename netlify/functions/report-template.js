// Shared report builder — turns an array of {name, ...fields, kit} into ONE
// clean, print-ready HTML page. Used by save-report (to store) and reused by
// the login hub later. Scale-proof: pure string assembly, no per-name network calls.
// No dependencies.

// TM RULE: trademark symbol stays OFF until SparkMyName is live + a real transaction
// occurs + Founder sends a screenshot. Flip to true then — it appears site-wide on reports.
var SHOW_TM = true;
var TM = SHOW_TM ? '&trade;' : '';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E000}-\u{F8FF}]/gu, '')
    .replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

var INK = '#111111', MID = '#6e6e73', HAIR = '#e5e5ea', FLAME = '#A8802A', GREEN = '#16833a', PAPER = '#ffffff', WASH = '#f5f5f7';

// Phase 2: brand strategy is computed live from the seed (no stored fields needed).
var _NI = null; try { _NI = require('./namingintelligence.js'); } catch (e) { _NI = null; }
// Stage 1: premium identity board renderer, behind an OFF switch.
// OFF by default. Turn on by setting Netlify env SMN_CARD_BOARD=on (then redeploy).
var _BOARD = null; try { _BOARD = require('./graphic-board.js'); } catch (e) { _BOARD = null; }
var BOARD_ON = (String(process.env.SMN_CARD_BOARD || '').toLowerCase() === 'on');
var CARD_LOGO = (String(process.env.SMN_CARD_LOGO || 'on').toLowerCase() !== 'off');

// ====== Brand Identity Concept — report-only logo (shown, never delivered) ======
// Colors come from the name's OWN palette; the "feel" comes from the industry.
// Fully defensive: any failure falls back to the plain name, so a report can
// never break. No external fonts, no network — pure string assembly.
function _logoHash(s){var h=0,i;s=String(s||'');for(i=0;i<s.length;i++){h=((h<<5)-h+s.charCodeAt(i))|0;}return Math.abs(h);}
function _logoLum(hex){hex=String(hex||'').replace('#','');if(hex.length===3){hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];}var r=parseInt(hex.slice(0,2),16)/255,g=parseInt(hex.slice(2,4),16)/255,b=parseInt(hex.slice(4,6),16)/255;if(isNaN(r)||isNaN(g)||isNaN(b))return 1;return 0.2126*r+0.7152*g+0.0722*b;}
function _logoSat(hex){hex=String(hex||'').replace('#','');if(hex.length===3){hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];}var r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);if(isNaN(r)||isNaN(g)||isNaN(b))return 0;var mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx===0?0:(mx-mn)/mx;}
function _logoColors(kit){
  var hexes=[];try{((kit&&kit.palettes)||[]).forEach(function(p){((p&&Array.isArray(p.colors))?p.colors:[]).forEach(function(h){if(/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(String(h)))hexes.push(String(h).charAt(0)==='#'?String(h):'#'+h);});});}catch(e){}
  if(!hexes.length)return {text:'#15202B',mark:FLAME};
  var byLum=hexes.slice().sort(function(a,b){return _logoLum(a)-_logoLum(b);});
  var text=byLum[0]; if(_logoLum(text)>0.55)text='#15202B';
  var bySat=hexes.slice().sort(function(a,b){return _logoSat(b)-_logoSat(a);});
  var mark=null,i,L;
  for(i=0;i<bySat.length;i++){L=_logoLum(bySat[i]);if(_logoSat(bySat[i])>0.15&&L>0.12&&L<0.82){mark=bySat[i];break;}}
  if(!mark){for(i=0;i<byLum.length;i++){L=_logoLum(byLum[i]);if(L>0.14&&L<0.82){mark=byLum[i];break;}}}
  if(!mark)mark=FLAME;
  return {text:text,mark:mark};
}
function _logoFeel(seed){
  var cat='';try{if(_NI&&seed){var p=_NI.buildProfile('business',String(seed));cat=(((p&&p.specific_category)||'')+' '+((p&&p.parent_category)||'')).toLowerCase();}}catch(e){}
  if(!cat)cat=String(seed||'').toLowerCase();
  cat=cat+' '+String(seed||'').toLowerCase();
  var fun=/(mexic|taco|burrito|cantina|pizza|burger|fast.?food|diner|ice.?cream|candy|kids|toy|party|creativ|music|game|juice|smoothie|food.?truck|bbq|barbe|cafe|coffee)/.test(cat);
  var formal=/(law|legal|attorney|advisor|consult|financ|account|wealth|capital|real.?estate|estate|luxur|fine.?din|steak|french|bistro|medical|dental|clinic|notary|insurance|architect)/.test(cat);
  if(formal)return {font:"Georgia,'Times New Roman',serif",ls:'.005em',weight:600};
  if(fun)return {font:"'Trebuchet MS','Segoe UI',Helvetica,Arial,sans-serif",ls:'-.01em',weight:700};
  return {font:"'Helvetica Neue',Helvetica,Arial,sans-serif",ls:'-.005em',weight:700};
}
function _logoMark(i,color){
  var c=esc(color),V='0 0 46 46';
  var marks=[
    '<rect x="3" y="31" width="7" height="11" rx="2" fill="'+c+'" opacity=".4"/><rect x="14" y="24" width="7" height="18" rx="2" fill="'+c+'" opacity=".62"/><rect x="25" y="16" width="7" height="26" rx="2" fill="'+c+'" opacity=".82"/><rect x="36" y="6" width="7" height="36" rx="2" fill="'+c+'"/>',
    '<path d="M23 6 L41 40 L5 40 Z" fill="'+c+'"/><path d="M23 19 L33 38 L13 38 Z" fill="#fff"/>',
    '<path d="M5 28 C12 21 16 21 23 28 C30 35 34 35 41 28" stroke="'+c+'" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M5 19 C12 12 16 12 23 19 C30 26 34 26 41 19" stroke="'+c+'" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".5"/>',
    '<path d="M23 6 C23 6 38 24 38 31 A15 15 0 1 1 8 31 C8 24 23 6 23 6 Z" fill="'+c+'"/>',
    '<circle cx="23" cy="23" r="17" fill="'+c+'"/><path d="M23 6 A17 17 0 0 1 23 40 Z" fill="#fff" opacity=".35"/>',
    '<g fill="none" stroke="'+c+'" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 13 L23 23 L11 33"/><path d="M23 13 L35 23 L23 33"/></g>',
    '<g fill="none" stroke-linecap="round"><path d="M15 23 A8 8 0 0 1 23 31" stroke="'+c+'" stroke-width="3.2" opacity=".55"/><path d="M15 15 A16 16 0 0 1 31 31" stroke="'+c+'" stroke-width="3.2"/><circle cx="15" cy="31" r="3.6" fill="'+c+'"/></g>',
    '<circle cx="23" cy="23" r="14" fill="none" stroke="'+c+'" stroke-width="3.4"/><circle cx="23" cy="23" r="5" fill="'+c+'"/>'
  ];
  return '<svg width="44" height="44" viewBox="'+V+'" aria-hidden="true" style="flex:none">'+marks[i%marks.length]+'</svg>';
}
function _kitHexes(kit){var h=[];try{((kit&&kit.palettes)||[]).forEach(function(p){((p&&Array.isArray(p.colors))?p.colors:[]).forEach(function(x){if(/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(String(x)))h.push(String(x).charAt(0)==='#'?String(x):'#'+x);});});}catch(e){}return h;}
function _iniR(name){var s=String(name||'').trim();if(!s)return 'B';var w=s.split(/[\s\-_]+/).filter(Boolean);if(w.length===1){var c=w[0].match(/[A-Z][a-z0-9]*/g);if(c&&c.length>=2)return (c[0].charAt(0)+c[1].charAt(0)).toUpperCase();return w[0].slice(0,2).toUpperCase();}return (w[0].charAt(0)+w[1].charAt(0)).toUpperCase();}
function _heroLogo(m){
  try{ var _au=(m&&m.kit&&Array.isArray(m.kit.logoUrls)&&m.kit.logoUrls[0])?m.kit.logoUrls[0]:'';
    if(_au){ return '<div class="name-logo"><img src="'+esc(_au)+'" alt="" style="width:64px;height:64px;border-radius:15px;object-fit:cover;border:1px solid #ECE7DB;background:#fff;box-shadow:0 2px 8px rgba(43,33,10,.10)"><div class="nl-wm">'+esc(m&&m.name)+'</div></div>'; } }catch(e){}
  var kit=(m&&m.kit)||{}; var c=_logoColors(kit);
  var ink=c.text||'#15202B', acc=c.mark||'#A8802A';
  var ini=esc(_iniR(m&&m.name)), nm=esc(m&&m.name);
  return '<div class="name-logo">'
    +'<div class="nl-tile" style="background:'+ink+'">'+ini+'</div>'
    +'<div class="nl-wm" style="color:'+ink+'">'+nm+'</div>'
    +'<div class="nl-rule" style="background:'+acc+'"></div>'
  +'</div>';
}
function _restNoteR(domain){var tld=String(domain||'').split('.').pop().toLowerCase();var R={law:1,legal:1,cpa:1,realty:1,homes:1,realestate:1,inc:1,md:1,bank:1};if(!R[tld])return '';return '<div style="border:1px solid #f0e2c4;background:#fdf8ec;border-radius:10px;padding:10px 12px;margin-top:12px;font:500 12px/1.5 Arial,sans-serif;color:#7a5b16"><b>Eligibility required.</b> The .'+esc(tld)+' extension is a professional / restricted domain that needs proof of credentials or licensing to register. Verify you qualify before purchasing.</div>';}
function _logoConcepts(m){try{
  var kit=(m&&m.kit)||{}; var col=_logoColors(kit); var hx=_kitHexes(kit);
  var c1, c2;
  if(hx.length){
    var _bl=hx.slice().sort(function(a,b){return _logoLum(a)-_logoLum(b);});
    c2=_bl[0]; if(_logoLum(c2)>0.5)c2='#15202B';
    var _rest=hx.filter(function(h){return h.toLowerCase()!==String(c2).toLowerCase();});
    var _bs=_rest.slice().sort(function(a,b){return _logoSat(b)-_logoSat(a);});
    c1=null; for(var _i=0;_i<_bs.length;_i++){var _L=_logoLum(_bs[_i]);if(_logoSat(_bs[_i])>0.18&&_L>0.22&&_L<0.86){c1=_bs[_i];break;}}
    if(!c1){for(var _j=0;_j<_rest.length;_j++){if(_logoLum(_rest[_j])>0.22){c1=_rest[_j];break;}}}
    if(!c1)c1=col.mark||'#A8802A';
    if(String(c1).toLowerCase()===String(c2).toLowerCase())c1='#A8802A';
  } else { c1=col.mark||'#A8802A'; c2=col.text||'#15202B'; }
  var nm=esc(m&&m.name); var feel=_logoFeel((m&&m.seed)||(m&&m.name)||'');
  var h=_logoHash(m&&m.name);
  function sized(sz,color,idx){return _logoMark(idx,color).replace('width="44" height="44"','width="'+sz+'" height="'+sz+'"');}
  function wm(color){return '<span style="font-family:'+feel.font+';font-weight:'+feel.weight+';letter-spacing:'+feel.ls+';color:'+color+';font-size:18px;line-height:1;margin-left:10px;vertical-align:middle">'+nm+'</span>';}
  var base='border:1px solid #e8e8ec;border-radius:12px;padding:16px;text-align:center;min-height:70px;vertical-align:middle;';
  var a='<td width="32%" valign="middle" style="'+base+'background:#fff">'+sized(32,c1,h)+wm(c2)+'</td>';
  var b='<td width="32%" valign="middle" style="'+base+'background:#fff">'+sized(32,c2,h+3)+wm(c1)+'</td>';
  var c='<td width="32%" valign="middle" style="'+base+'background:'+c1+'">'+sized(32,'#fff',h+5)+wm('#fff')+'</td>';
  return '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px"><tr>'+a+'<td width="2%">&nbsp;</td>'+b+'<td width="2%">&nbsp;</td>'+c+'</tr></table>';
}catch(e){return '';}}
function brandExtras(m){try{
  var kit=(m&&m.kit)||{}; if(((m&&m.kit&&m.kit.kind)||(m&&m.kind)||'brand')!=='brand')return '';
  var col=_logoColors(kit); var hexes=_kitHexes(kit);
  var c1=col.mark||'#1D1D1F', c2=null;
  for(var i=0;i<hexes.length;i++){if(hexes[i].toLowerCase()!==String(c1).toLowerCase()){c2=hexes[i];break;}} if(!c2)c2='#A8802A';
  var nm=esc(m&&m.name), dom=esc((m&&m.domain)||''), ini=esc(_iniR(m&&m.name));
  function mono(sz){return '<span style="display:inline-block;vertical-align:middle">'+_logoMark(_logoHash(m&&m.name),'#fff').replace('width="44" height="44"','width="'+sz+'" height="'+sz+'"')+'</span>';}
  var handle=String(dom||'').split('.')[0].replace(/[^a-z0-9]/gi,'').toLowerCase();
  var tag=esc(((kit.taglines&&kit.taglines[0])||m.tagline||'').toString().slice(0,80));
  var hdr=(kit.headerUrl?esc(kit.headerUrl):'');
  var aiL=(Array.isArray(kit.logoUrls)&&kit.logoUrls[0])?esc(kit.logoUrls[0]):'';
  function markCell(sz){ return aiL?('<img src="'+aiL+'" alt="" style="width:'+sz+'px;height:'+sz+'px;border-radius:'+(Math.round(sz*0.22))+'px;object-fit:cover;background:#fff">'):('<span style="display:inline-block;width:'+sz+'px;height:'+sz+'px;border-radius:'+(Math.round(sz*0.22))+'px;background:'+c1+';text-align:center;line-height:'+sz+'px">'+mono(Math.round(sz*0.55))+'</span>'); }
  // One premium composition, rendered at real platform ratios - built ONLY from the brand's
  // own generated assets: cinematic category image, logo (AI or monogram), palette, name,
  // tagline, domain. CSS-composed: zero generation cost, launch-ready proportions.
  function asset(label, ratioPct, big){
    var bg = hdr?('background:url(\''+hdr+'\') center/cover no-repeat'):('background:#FFFFFF');
    return '<div style="flex:1 1 '+(big?'100%':'46%')+';min-width:'+(big?'100%':'240px')+'">'
      +'<div style="font:800 10.5px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#7E6018;margin:0 0 7px">'+label+'</div>'
      +'<div style="position:relative;width:100%;padding-top:'+ratioPct+'%;'+bg+';border-radius:14px;overflow:hidden;border:1px solid #ECE7DB;box-shadow:0 10px 26px -14px rgba(43,33,10,.35)">'
      +'<div style="position:absolute;inset:0;background:#FFFFFF"></div>'
      +'<div style="position:absolute;left:0;right:0;bottom:0;padding:'+(big?'20px 24px':'12px 14px')+';display:flex;align-items:center;gap:'+(big?'14px':'10px')+'">'
      +markCell(big?46:32)
      +'<span style="min-width:0"><span style="display:block;font:800 '+(big?'20px':'14.5px')+'/1.15 Georgia,\'Playfair Display\',serif;color:#141414;letter-spacing:-.01em;text-shadow:0 1px 8px rgba(0,0,0,.35);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+nm+'</span>'
      +(tag?('<span style="display:block;font:600 '+(big?'12.5px':'10.5px')+'/1.3 Arial,sans-serif;color:rgba(255,255,255,.88);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+tag+'</span>'):'')
      +'</span>'
      +'<span style="margin-left:auto;flex:none;background:rgba(255,255,255,.92);color:#171410;font:800 '+(big?'11.5px':'10px')+'/1 Arial,sans-serif;padding:'+(big?'9px 14px':'7px 10px')+';border-radius:999px">'+dom+'</span>'
      +'</div></div></div>';
  }
  var comingSoon='<div style="flex:1 1 46%;min-width:240px">'
    +'<div style="font:800 10.5px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#7E6018;margin:0 0 7px">Coming Soon graphic</div>'
    +'<div style="position:relative;width:100%;padding-top:56%;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #ECE7DB;box-shadow:0 10px 26px -14px rgba(43,33,10,.35)">'
    +'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:14px">'
    +markCell(40)
    +'<span style="font:800 17px/1.2 Georgia,\'Playfair Display\',serif;color:#fff;margin-top:10px">'+nm+'</span>'
    +'<span style="font:800 10px/1 Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#E6D6A8;margin-top:9px">Coming&nbsp;Soon</span>'
    +'<span style="font:600 10.5px/1 Arial,sans-serif;color:rgba(255,255,255,.75);margin-top:8px">'+dom+'</span>'
    +'</div></div></div>';
  var emailSig='<div style="margin-top:14px"><div style="font:800 10.5px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#7E6018;margin:0 0 7px">Email signature</div>'
    +'<table cellpadding="0" cellspacing="0" style="border:1px solid #ECE7DB;border-radius:12px;background:#fff;padding:0;width:100%"><tr>'
    +'<td style="padding:14px 16px" width="56" valign="middle">'+markCell(40)+'</td>'
    +'<td style="padding:14px 16px 14px 0" valign="middle"><div style="font:800 14.5px/1.2 Arial,sans-serif;color:#171410">'+nm+'</div>'
    +(tag?('<div style="font:500 12px/1.4 Arial,sans-serif;color:#5C5340;margin-top:2px">'+tag+'</div>'):'')
    +'<div style="font:700 12px/1.4 Arial,sans-serif;color:#7E6018;margin-top:4px">'+dom+' &middot; @'+handle+'</div></td>'
    +'</tr></table></div>';
  var assets='<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:6px">'
    + asset('LinkedIn launch graphic',52,false)
    + asset('Facebook launch graphic',52,false)
    + asset('Instagram launch graphic',100,false)
    + asset('X launch graphic',50,false)
    + asset('Cover image &middot; profile banner',33,true)
    + asset('Website hero &middot; Open Graph image',52,false)
    + comingSoon
    +'</div>' + emailSig;
  return '<div style="margin-top:18px"><div style="font:800 11px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#3E3A32;margin-bottom:10px">Logo &amp; brand in the world &middot; AI concepts</div>'+_logoConcepts(m)
    +'<div style="font:800 11px/1 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#3E3A32;margin:18px 0 10px">Launch assets &middot; ready to use</div>'
    +assets
    +_restNoteR(m&&m.domain)
    +'<div style="font:400 11px/1.55 Arial,sans-serif;color:#3E3A32;margin-top:12px">Launch assets and logo concepts are AI-generated starting points built from your brand system &mdash; not final artwork, and not reviewed or approved by SparkMyName&trade;. Check trademark / copyright and have a professional finalize before commercial use.</div></div>';
}catch(e){return '';}}
function brandLogo(m, feel){
  try{
    var kind=(m&&m.kit&&m.kit.kind)||(m&&m.kind)||'brand';
    var nm=esc(m&&m.name);
    if(kind!=='brand'||!nm)return '<h2>'+nm+'</h2>';
    var col=_logoColors((m&&m.kit)||{});
    feel=feel||_logoFeel('');
    // Baseline v2 visual compliance: the generated cinematic logo replaces the temporary
    // monogram automatically the moment it exists; until then, the premium monogram shows.
    var aiUrl=(m&&m.kit&&Array.isArray(m.kit.logoUrls)&&m.kit.logoUrls[0])?m.kit.logoUrls[0]:'';
    var mk=aiUrl?('<img class="ai-mark" src="'+esc(aiUrl)+'" alt="" style="width:46px;height:46px;border-radius:12px;object-fit:cover;vertical-align:middle;border:1px solid #ECE7DB;background:#fff">'):_logoMark(_logoHash(m.name),col.mark);
    var wm='<span style="font-family:'+feel.font+';font-weight:'+feel.weight+';letter-spacing:'+feel.ls+';color:'+col.text+';line-height:1;">'+nm+'</span>';
    return '<h2 class="name-wm">'+mk+wm+'</h2>'+
      '<div class="logo-disc">Logo shown as a concept &mdash; not approved for use and does not clear trademark. Run your own trademark check before commercial use.</div>';
  }catch(e){return '<h2>'+esc(m&&m.name)+'</h2>';}
}
var _FEEL=null;

// Completion bar: shows the customer the package is whole.
function progressBar() {
  var steps = ['Brand Strategy', 'Brand Name Options', 'Brand Identity', 'Marketing Content', 'Domain Options', 'Launch Direction'];
  var cells = steps.map(function (s) {
    return '<div style="flex:1 1 140px;min-width:130px;display:flex;align-items:center;gap:8px;padding:10px 12px;background:rgba(22,122,61,.06);border:1px solid rgba(22,122,61,.25);border-radius:10px;">' +
      '<span style="flex:none;width:18px;height:18px;border-radius:50%;background:' + GREEN + ';color:#141414;font:700 11px/18px Arial,sans-serif;text-align:center;">&#10003;</span>' +
      '<span style="font:600 12.5px/1.3 Arial,Helvetica,sans-serif;color:' + INK + ';">' + esc(s) + '</span></div>';
  }).join('');
  return '<div style="margin:22px 0 0;padding:18px 18px 8px;background:' + PAPER + ';border:1px solid ' + HAIR + ';border-radius:16px;">' +
    '<div style="font:700 11px/1 Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:' + GREEN + ';margin:0 0 12px;">Your complete Brand Identity Strategy</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:10px;padding-bottom:8px;">' + cells + '</div></div>';
}

// Brand strategy panel: derived from the engine profile for this exact business.
function strategyPanel(seed) {
  if (!_NI || !seed) return '';
  var p; try { p = _NI.buildProfile('business', String(seed)); } catch (e) { return ''; }
  if (!p) return '';
  function row(label, val) {
    val = esc(String(val || '').trim());
    if (!val) return '';
    return '<div style="display:flex;gap:14px;padding:11px 0;border-bottom:1px solid ' + HAIR + ';"><div style="flex:none;width:128px;font:700 11px/1.5 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:' + MID + ';">' + esc(label) + '</div><div style="font:400 14.5px/1.5 Arial,Helvetica,sans-serif;color:' + INK + ';">' + val + '</div></div>';
  }
  function dial(label, n) {
    n = Math.max(1, Math.min(10, parseInt(n, 10) || 5));
    var pct = (n * 10);
    var L = String(label).toLowerCase(), word;
    if (L === 'creativity') word = n <= 3 ? 'Conservative' : n <= 6 ? 'Balanced' : n <= 8 ? 'Bold' : 'Highly original';
    else if (L === 'trust') word = n <= 4 ? 'Approachable' : n <= 7 ? 'Trusted' : 'High-trust';
    else if (L === 'clarity') word = n <= 4 ? 'Evocative' : n <= 7 ? 'Clear' : 'Crystal-clear';
    else if (L === 'premium') word = n <= 4 ? 'Everyday' : n <= 6 ? 'Elevated' : n <= 8 ? 'Premium' : 'Luxury';
    else word = n <= 4 ? 'Low' : n <= 7 ? 'Medium' : 'High';
    return '<div style="flex:1 1 150px;min-width:140px;"><div style="font:700 10px/1.4 Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:' + MID + ';margin:0 0 4px;">' + esc(label) + '</div><div style="font:700 14px/1.3 Arial,sans-serif;color:' + INK + ';margin:0 0 6px;">' + esc(word) + '</div><div style="height:7px;border-radius:100px;background:' + HAIR + ';overflow:hidden;"><div style="width:' + pct + '%;height:100%;background:' + FLAME + ';"></div></div></div>';
  }
  var cat = (p.specific_category && p.specific_category !== p.parent_category) ? (p.specific_category + ' (' + p.parent_category + ')') : (p.parent_category || '');
  var tone = Array.isArray(p.customer_emotion) ? p.customer_emotion.slice(0, 4).join(', ') : '';
  var personality = Array.isArray(p.naming_style) ? p.naming_style.slice(0, 4).join(', ') : '';
  var rows = row('Industry', cat) + row('Audience', p.audience) + row('Brand tone', tone) + row('Personality', personality) + row('Should feel like', p.must_sound_like);
  var dials = '<div style="font:600 12px/1.5 Arial,sans-serif;color:' + MID + ';margin:18px 0 2px;">The naming direction we dialed in for your industry &mdash; a guide for the names, not a grade on them:</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:16px;margin:8px 0 2px;">' +
    dial('Creativity', p.creativity_level) + dial('Trust', p.trust_level) + dial('Clarity', p.clarity_level) + dial('Premium', p.premium_level) + '</div>';
  return '<div style="margin:22px 0 0;padding:24px 26px;background:' + PAPER + ';border:1px solid ' + HAIR + ';border-radius:16px;">' +
    '<div style="font:700 11px/1 Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:' + FLAME + ';margin:0 0 4px;">Section 1</div>' +
    '<h2 style="margin:0 0 8px;font-size:21px;">Your Brand Strategy</h2>' +
    '<p style="margin:0 0 12px;color:' + MID + ';font-size:14px;">Every name below was built around this read of your business.</p>' +
    rows + dials + '</div>';
}

function bl(arr) {
  if (!Array.isArray(arr) || !arr.length) return '';
  return '<ul class="bl">' + arr.map(function (s) { s = esc(s); return s ? '<li>' + s + '</li>' : ''; }).join('') + '</ul>';
}
function kv(arr) {
  if (!Array.isArray(arr) || !arr.length) return '';
  return '<ul class="bl">' + arr.map(function (o) {
    if (!o) return '';
    if (typeof o === 'string') { var s = esc(o); return s ? '<li>' + s + '</li>' : ''; }
    var l = o.label ? '<strong>' + esc(o.label) + '</strong>' : '';
    var d = o.desc ? (l ? ' &mdash; ' : '') + esc(o.desc) : '';
    var line = l + d; return line ? '<li>' + line + '</li>' : '';
  }).join('') + '</ul>';
}
function pals(arr) {
  if (!Array.isArray(arr) || !arr.length) return '';
  return '<div class="pals">' + arr.map(function (p) {
    var sw = ((p && Array.isArray(p.colors)) ? p.colors : []).map(function (hex) {
      hex = esc(String(hex));
      return '<span class="sw"><span class="chip" style="background:' + hex + ';"></span><span class="hex">' + hex + '</span></span>';
    }).join('');
    return '<div class="pal"><div class="pal-h">' + esc((p && p.name) || 'Palette') +
      ((p && p.note) ? ' <span class="pal-note">&mdash; ' + esc(p.note) + '</span>' : '') + '</div>' + sw + '</div>';
  }).join('') + '</div>';
}

function sec(label, body) {
  return body ? ('<div class="sec"><h3>' + esc(label) + '</h3>' + body + '</div>') : '';
}
function secD(label, body) {
  return body ? ('<div class="sec deliv"><h3>' + esc(label) + '</h3>' + body + '</div>') : '';
}

// ONE name's full block.
var _FALLBACK_PALS = [
  ['#1F3A5F','#3E6CA8','#C9A24B','#F4F4F6'],
  ['#14532D','#2E7D52','#A7C4A0','#F3F6F2'],
  ['#5B3A29','#C68A4B','#2E2A26','#F5EFE8'],
  ['#3A2A5F','#6E4FA8','#C9A24B','#F4F2F7'],
  ['#7A1F2B','#B23A2E','#E0A458','#F7F0EE'],
  ['#0F4C5C','#2A9D8F','#E9C46A','#F1F7F6'],
  ['#1D1D1F','#3A6EA5','#A8802A','#F4F4F6'],
  ['#26323A','#5C7A99','#D9A441','#F2F4F5']
];
function _fallbackPals(name){ var idx = _logoHash(name) % _FALLBACK_PALS.length; return [{ name: 'Color direction', colors: _FALLBACK_PALS[idx] }]; }
function _handlesR(name){
  var h = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, ''); if (!h) return '';
  var P = [
    ['Instagram','@','https://instagram.com/'],
    ['Facebook','/','https://facebook.com/'],
    ['X','@','https://x.com/'],
    ['TikTok','@','https://tiktok.com/@'],
    ['YouTube','@','https://youtube.com/@'],
    ['LinkedIn','/','https://www.linkedin.com/company/']
  ];
  var rows = P.map(function (p) {
    var url = p[2] + encodeURIComponent(h);
    return '<tr>' +
      '<td style="font:700 11px/1.6 Arial,sans-serif;color:#2E3A4E;text-transform:uppercase;letter-spacing:.04em;padding:7px 0;border-bottom:1px solid #f0f0f3">' + p[0] + '</td>' +
      '<td style="font:700 13px/1.6 Arial,sans-serif;color:#1d1d1f;text-align:right;padding:7px 0;border-bottom:1px solid #f0f0f3">' + p[1] + esc(h) + '</td>' +
      '<td style="text-align:right;padding:7px 0 7px 12px;border-bottom:1px solid #f0f0f3"><a href="' + url + '" target="_blank" rel="noopener nofollow" style="font:800 12px/1 Arial,sans-serif;color:#A8802A;text-decoration:none;white-space:nowrap">Confirm on platform \u2192</a></td>' +
      '</tr>';
  }).join('');
  return '<table width="100%" cellpadding="0" cellspacing="0">' + rows + '</table>' +
    '<p style="font:400 11.5px/1.5 Arial,sans-serif;color:#2E3A4E;margin:10px 0 0">These are recommended social usernames based on brand consistency. SparkMyName does not check, verify, or guarantee availability on any platform. Please confirm availability directly on each platform before claiming a handle.</p>';
}
function nameBlock(m, index, isFav) {
  var kit = m.kit || {};
  if (!(kit.palettes && kit.palettes.length)) { try { kit.palettes = _fallbackPals(m.name); } catch (e) {} }
  var avail = m.domainAvailable === true;
  var kind = kit.kind || m.kind || 'brand';

  var domainBox = m.domain
    ? ('<div class="dom ' + (avail ? 'ok' : 'no') + '"><div class="dom-l">YOUR DOMAIN</div><div class="dom-d">' + esc(m.domain) + '</div>' +
       '<div class="dom-note">' + (avail ? 'Available to register now &mdash; secure it at any registrar.' : 'Currently taken &mdash; try .ai, .co, or add a short word.') + '</div>' +
       (avail ? '<span class="dom-badge">&#10003; Available</span>' : '') + '</div>')
    : '';

  var body;
  if (kind === 'brand') {
    body =
      sec('Why this name works', (kit.whyItWorks && kit.whyItWorks.length) ? bl(kit.whyItWorks) : (m.why ? '<p>' + esc(m.why) + '</p>' : '')) +
      sec('Tagline options', bl(kit.taglines)) +
      sec('Color palettes', pals(kit.palettes)) +
      sec('Font pairings', kv(kit.fonts)) +
      sec('Voice & tone', kv(kit.voice)) +
      sec('Social bios', bl(kit.bios)) +
      sec('Social handle recommendations', _handlesR(m.name)) +
      sec('About', bl(kit.about)) +
      secD('LinkedIn \u201cAbout\u201d \u2014 ready to paste', bl(kit.linkedin)) +
      secD('Facebook Page intro \u2014 ready to paste', bl(kit.facebook)) +
      secD('Launch posts \u2014 ready to post', bl(kit.posts));
  } else {
    body =
      (kit.meaning ? sec('Meaning', '<p>' + esc(kit.meaning) + '</p>') : '') +
      (kit.origin ? sec('Origin', '<p>' + esc(kit.origin) + '</p>') : '') +
      (kit.pronunciation ? sec('Pronunciation', '<p>' + esc(kit.pronunciation) + '</p>') : '') +
      sec('Why it fits', (kit.whyItFits && kit.whyItFits.length) ? bl(kit.whyItFits) : (m.why ? '<p>' + esc(m.why) + '</p>' : '')) +
      sec('Nicknames', bl(kit.nicknames)) +
      sec(kind === 'pet' ? 'Other great pet names' : 'Names you might also love', bl(kit.similar)) +
      (kind === 'person' ? sec('You share this name with', bl(kit.namesakes)) : '') +
      (kit.personality ? sec('Personality', '<p>' + esc(kit.personality) + '</p>') : '');
  }

  return '<article class="name" id="n' + index + '">' +
    '<div class="name-head">' +
      '<div class="name-num">' + (index + 1) + '</div>' +
      '<div class="name-id">' +
        (isFav ? '<div class="fav-pick">&#9733; Our favorite for you</div>' : '') +
        brandLogo(m, _FEEL) +
        (m.tagline ? '<div class="name-tag">' + esc(m.tagline) + '</div>' : '') +
        '' +
      '</div>' +
    '</div>' +
    domainBox +
    (m.handle ? '<div class="handle">Social handle &nbsp; @' + esc(String(m.handle).replace(/^@+/, '')) + '</div>' : '') +
    body +
    brandExtras(m) +
    '</article>';
}

// A compact tile for the grid view. Tapping the body opens the full kit;
// the action row lets the customer keep (love) or junk (remove) the name.
function nameTile(m, index, isFav) {
  var d = m.domain ? String(m.domain) : '';
  var av = (m.domainAvailable === true);
  var pos = (typeof m.position === 'number') ? m.position : index;
  var kept = (m.kept === true);
  var removed = (m.removed === true);
  var _sc = parseInt(m.score, 10);
  var tier = (_sc >= 97) ? '<span style="font:700 9px/1 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#141414;background:#141414;border-radius:100px;padding:4px 8px;margin-right:6px;">Elite</span>'
            : (_sc >= 94) ? '<span style="font:700 9px/1 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#141414;background:#FFD600;border-radius:100px;padding:4px 8px;margin-right:6px;">Platinum</span>' : '';
  return '<div class="tile' + (kept ? ' tile-fav' : '') + '" id="tile-' + pos + '"' + (removed ? ' style="display:none"' : '') + '>' +
    '<span class="tile-check" aria-hidden="true">&#10003;</span>' +
    '<button type="button" class="tile-body" onclick="tileClick(' + index + ',' + pos + ')" aria-label="Open the brand identity concept for ' + esc(m.name) + '">' +
      (kept ? '<div class="tile-badge">&#9733; Saved</div>' : '<div class="tile-rank">#' + (index + 1) + '</div>') +
      '<div class="tile-name">' + esc(m.name) + '</div>' +
      (d ? '<div class="tile-dom">' + esc(d) + (av ? '<span class="tile-av"> &middot; available</span>' : '') + '</div>' : '') +
      '<div class="tile-foot">' +
        '<span></span>' +
        '<span class="tile-open">See brand &rarr;</span>' +
      '</div>' +
    '</button>' +
    '<div class="tile-acts">' +
      '<button type="button" class="ta-keep' + (kept ? ' on' : '') + '" onclick="keepName(' + pos + ',this)" aria-pressed="' + (kept ? 'true' : 'false') + '" aria-label="Save this name">' + (kept ? '&#9829; Saved' : '&#9825; Save this one') + '</button>' +
    '</div>' +
  '</div>';
}

// The full standalone report page.
function smartAsk(seed) {
  var s = String(seed || '').toLowerCase();
  if (/restaurant|cafe|caf\u00e9|bistro|eatery|diner|grill|kitchen|bakery|\bpub\b|pizzeria|taqueria|cantina|trattoria|brasserie|food truck|\bdeli\b|steakhouse|coffee|tea house|tavern|bar\b/.test(s))
    return "What\u2019s the cuisine, and a signature dish or two? And the vibe \u2014 cozy, upscale, lively?";
  if (/paint|mural|portrait|\bartist|gallery|fine art|illustrat|sculpt|tattoo/.test(s))
    return "What kind of work \u2014 murals, portraits, commercial, fine art? And who\u2019s it for?";
  if (/salon|spa|barber|nail|hair|beauty|lash|\bwax|massage|aesthetic/.test(s))
    return "What\u2019s the feel \u2014 luxe, trendy, family-friendly? And who\u2019s your ideal client?";
  if (/gym|fitness|yoga|pilates|crossfit|trainer|wellness|recovery/.test(s))
    return "What\u2019s the energy \u2014 hardcore, welcoming, boutique? And who\u2019s it for?";
  if (/boutique|\bshop|store|apparel|clothing|jewelry|candle|handmade|etsy|reseller|vintage/.test(s))
    return "What do you sell, and what\u2019s the style \u2014 minimal, playful, luxe, rustic?";
  if (/app|software|saas|ai\b|tech|startup|platform|tool|dev\b/.test(s))
    return "What does it do in one line, and who uses it? Modern, bold, trustworthy?";
  return "What\u2019s the vibe, who\u2019s it for, and what should it feel like?";
}

// Never display a third-party brand name. The "name a rival" feature stores
// "an original rival brand to <Brand>"; strip the <Brand> everywhere it would show.
function safeSeed(s) {
  s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  s = s.replace(/an original rival brand to [^\u2014\n;:.]+/i, 'an original rival brand ');
  s = s.replace(/\b(?:an? )?rival(?:ing)? (?:brand )?to [^\u2014\n;:.]+/i, 'a bold original brand ');
  return s.replace(/\s+/g, ' ').trim();
}

// Turn a long dictated prompt into a short, clean descriptor for the report opening.
function descShort(s) {
  s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  if (!s) return '';
  var seg = s.split(/[.;:\n]|\s+[\u2013\u2014]\s+|\s+-\s+/)[0].trim() || s;
  if (seg.length > 54) {
    var cut = seg.slice(0, 54), sp = cut.lastIndexOf(' ');
    if (sp > 26) cut = cut.slice(0, sp);
    seg = cut.replace(/[\s,]+$/, '');
  }
  return seg;
}

function buildReportPage(opts) {
  opts = opts || {};
  var names = Array.isArray(opts.names) ? opts.names : [];
  // Present highest-rated names first (descending by Name Strength). Stable, so equal
  // scores keep their original order; each name's stored .position is untouched, so all
  // Keep/Junk/Modify buttons still work. Applies live to every report rendered here.
  names = names.slice().sort(function (a, b) {
    return ((parseInt(b && b.score, 10) || 0) - (parseInt(a && a.score, 10) || 0));
  });
  var seed = esc(opts.seed || '');
  _FEEL = _logoFeel(opts.seed || '');
  var when = esc(opts.when || '');
  var total = names.length;
  var share = (opts.share === true); // read-only "shared with you" view: hide owner-only controls

  // ===== Calm-middle delivered report (presentation layer only) =====
  var CALMCSS = `:root{
  --orange:#A8802A;
  --ink:#1d1d1f;
  --muted:#2E3A4E;
  --line:#e5e5ea;
  --soft:#f5f5f7;
  --white:#ffffff;
  --green:#16833a;
  --radius:26px;
  --shadow:0 22px 70px rgba(0,0,0,.07);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
  color:var(--ink);
  background:var(--white);
  line-height:1.45;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none}
button,input{font:inherit}
.topbar{
  position:sticky;top:0;z-index:20;
  background:rgba(255,255,255,.88);
  backdrop-filter:blur(18px);
  border-bottom:1px solid var(--line);
}
.nav{
  max-width:1120px;margin:auto;
  min-height:62px;
  display:flex;align-items:center;justify-content:space-between;gap:18px;
  padding:14px 24px;
}
.logo{font-weight:850;letter-spacing:-.03em;white-space:nowrap}
.logo-mark{
  display:inline-flex;align-items:center;justify-content:center;
  width:22px;height:22px;border-radius:7px;
  background:#111;color:#ffb000;font-size:14px;margin-right:7px;
}
.logo span{color:var(--orange)}
.nav-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.btn{
  appearance:none;border:0;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:42px;padding:11px 18px;border-radius:999px;
  background:#111;color:#FFFFFF;font-weight:750;font-size:14px;
  transition:transform .12s ease, background .12s ease, border-color .12s ease;
}
.btn:active{transform:scale(.98)}
.btn.secondary{background:#fff;color:#111;border:1px solid var(--line)}
.btn.secondary:hover{border-color:#c7c7cc;background:#fafafa}
.btn.quiet{background:var(--soft);color:#111;border:1px solid var(--line)}
.btn.orange{background:var(--orange);color:#141414}
.shell{max-width:1180px;margin:0 auto;padding:52px 24px 80px}
.hero{text-align:center;padding:30px 0 36px}
.kicker{
  color:var(--orange);text-transform:uppercase;font-size:12px;letter-spacing:.18em;font-weight:850;
}
h1{margin:14px auto 0;max-width:900px;font-family:'Playfair Display',Georgia,serif;font-size:clamp(44px,5.6vw,72px);line-height:1.02;letter-spacing:-.022em;font-weight:700}
.sub{margin:18px auto 0;max-width:680px;color:var(--muted);font-size:clamp(18px,2.2vw,23px);letter-spacing:-.025em}
.meta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:24px 0 0}
.chip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:9px 13px;color:#333;font-size:14px;font-weight:700}
.idea-card{text-align:center;margin:30px auto 0;max-width:800px;background:var(--soft);border:1px solid var(--line);border-radius:var(--radius);padding:24px 26px;text-align:left}
.idea-label{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#3A2F1B;font-weight:850;margin-bottom:7px}
.idea-text{font-size:22px;font-weight:760;letter-spacing:-.03em;color:#221C12}
.disclaimer{margin:16px auto 0;max-width:760px;color:var(--muted);font-size:14px}
.section{padding:34px 0}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:18px}
h2{margin:0;font-family:'Playfair Display',Georgia,serif;font-size:clamp(30px,3.8vw,44px);line-height:1.08;letter-spacing:-.018em;font-weight:700}
.lead{margin:10px 0 0;color:var(--muted);font-size:17px;max-width:680px}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
.recommended{background:#FFFFFF;padding:28px;display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:center}
.rec-badge{display:inline-flex;border:1px solid rgba(168,128,42,.24);background:rgba(168,128,42,.08);color:#141414;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.1em}
.rec-name{font-size:clamp(34px,4.4vw,56px);letter-spacing:-.06em;line-height:.98;font-weight:900;margin-top:16px}
.rec-why{margin:12px 0 0;color:var(--muted);font-size:17px}
.score-box{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;text-align:center}
.score-num{font-size:54px;letter-spacing:-.06em;font-weight:900;color:var(--ink)}
.score-label{font-size:14px;color:var(--muted);font-weight:750;text-transform:uppercase;letter-spacing:.12em}
.strategy{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px;background:var(--soft);border:1px solid var(--line);border-radius:var(--radius)}
.strategy-item{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px;min-height:128px}
.strategy-item b{display:block;font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin-bottom:9px}
.strategy-item span{display:block;font-size:18px;letter-spacing:-.03em;font-weight:750}
.name-grid{display:grid;grid-template-columns:1fr;gap:16px}
.name-card{padding:22px;position:relative;overflow:hidden}
.name-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}
.rank{width:34px;height:34px;border-radius:999px;background:var(--soft);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:850;color:var(--muted);font-size:14px}
.strength{font-size:14px;color:#141414;font-weight:850;background:rgba(22,131,58,.08);border:1px solid rgba(22,131,58,.18);border-radius:999px;padding:7px 10px;white-space:nowrap}
.name-title{font-size:28px;letter-spacing:-.05em;line-height:1.05;font-weight:900;margin:0}
.domain{margin-top:10px;font-size:15px;font-weight:750;color:#111}
.available{color:var(--green);font-size:14px;font-weight:850;margin-left:6px}
.why{margin:12px 0 0;color:var(--muted);font-size:15px;min-height:44px}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.keep.on{background:#E9F7EF;color:#147A3D;border:2px solid #147A3D;font-weight:800}
.detail-panel{display:none;margin-top:16px;background:var(--soft);border:1px solid var(--line);border-radius:22px;padding:22px}
.name-card.open .detail-panel{display:block}
.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.detail-block{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px}
.detail-block h3{margin:0 0 9px;font-size:14px;color:var(--muted);text-transform:uppercase;letter-spacing:.13em}
.detail-block p,.detail-block li{color:#333;font-size:14px;margin:0 0 7px}
.detail-block ul{margin:0;padding-left:18px}
.palette{display:flex;gap:8px;flex-wrap:wrap}
.swatch{width:44px;height:44px;border-radius:12px;border:1px solid rgba(0,0,0,.08);background:var(--swatch,#ddd)}
.refine{background:var(--soft);border:1px solid var(--line);border-radius:var(--radius);padding:28px;text-align:center}
.refine h2{font-size:34px}
.footer{border-top:1px solid var(--line);padding:26px 24px 42px;color:var(--muted);font-size:14px;text-align:center}
.footer b{color:var(--ink)}
@media(max-width:820px){
  .recommended{grid-template-columns:1fr}
  .strategy{grid-template-columns:1fr 1fr}
  .name-grid{grid-template-columns:1fr}
  .detail-grid{grid-template-columns:1fr}
  .section-head{display:block}
}
@media(max-width:560px){
  .nav{align-items:flex-start;flex-direction:column}
  .nav-actions{justify-content:flex-start}
  .strategy{grid-template-columns:1fr}
  .shell{padding-left:18px;padding-right:18px}
}
@media print{
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  @page{margin:15mm}
  .topbar,.actions,.refine,.restorebar,.note-toggle,.note-edit,.cmp-bar,.pb-next,.res-cta{display:none!important}
  body{background:#fff!important}
  .shell{max-width:100%;padding:0}
  .hero{padding:0 0 20px!important}
  .hero h1{font-size:44px!important;line-height:1.02!important}
  .name-card:not(.is-kept):not(.open),.name-card.is-deleted{display:none!important}
  .name-card.is-kept .detail-panel,.name-card.open .detail-panel{display:block!important}
  .card,.strategy,.recommended{box-shadow:none!important;break-inside:avoid}
  .name-card{break-inside:auto!important;box-shadow:none!important;border:1px solid var(--line)!important;margin:0 0 12px!important;overflow:visible!important}
  .detail-panel{break-inside:auto!important;background:transparent!important;padding:4px 0 0!important;margin-top:12px!important}
  .name-grid{display:block!important}
  .name-grid>.name-card{margin:0 0 14px!important}
  .detail-grid{display:block!important}
  .detail-grid>*{margin:0 0 14px!important}
  .detail-block,.detail-grid>*{break-inside:avoid}
  h1,h2,.section-head,.name-top,.recommended{break-after:avoid}
  .swatch{width:38px!important;height:38px!important;border:1px solid rgba(0,0,0,.18)!important}
}`;
  var CALMJS = `<script>
(function(){
  function closeAll(){document.querySelectorAll(".name-card.open").forEach(function(c){c.classList.remove("open");var ob=c.querySelector("[data-open]");if(ob)ob.textContent="See brand";});}
  window._seeMoreNames=function(){try{closeAll();var g=document.querySelector(".name-grid");if(g){g.scrollIntoView({behavior:"smooth",block:"start"});}else{window.scrollTo({top:0,behavior:"smooth"});}}catch(e){window.scrollTo({top:0});}};
  window.dlVector=function(btn){try{var card=btn&&btn.closest?btn.closest(".name-card"):null;var img=card?card.querySelector(".ai-logos img"):null;if(!img||!img.getAttribute("src")){alert("The logo is still being drawn \u2014 check back in a moment.");return;}var nm=(card&&card.getAttribute("data-brand-name")||"logo").replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"").toLowerCase()||"logo";if(btn){btn.disabled=true;var _t=btn.textContent;btn.textContent="Building\u2026";}var restore=function(){if(btn){btn.disabled=false;btn.textContent=_t||"\u2b07 Vector Logo (SVG)";}};var go=function(){var im=new Image();im.crossOrigin="anonymous";im.onload=function(){try{var w=im.naturalWidth||512,h=im.naturalHeight||512;var cv=document.createElement("canvas");cv.width=w;cv.height=h;var cx=cv.getContext("2d");cx.drawImage(im,0,0,w,h);var idata=cx.getImageData(0,0,w,h);var svg=window.ImageTracer.imagedataToSVG(idata,{numberofcolors:8,colorsampling:2,pathomit:8,ltres:1,qtres:1,rightangleenhance:true,linefilter:true,strokewidth:0,blurradius:0,scale:1});var bl=new Blob([svg],{type:"image/svg+xml"});var u=URL.createObjectURL(bl);var a=document.createElement("a");a.href=u;a.download=nm+"-vector-logo.svg";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},900);restore();}catch(e){restore();alert("The vector export hit a snag \u2014 please try again.");}};im.onerror=function(){restore();alert("Couldn\u2019t load the logo image to vectorize \u2014 please try again.");};im.src=img.getAttribute("src");};if(window.ImageTracer){go();}else{var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.js";s.onload=go;s.onerror=function(){restore();alert("The vector tool couldn\u2019t load \u2014 please check your connection and try again.");};document.head.appendChild(s);}}catch(e){}};
  function openCard(id){var card=document.querySelector('.name-card[data-name-id="'+id+'"]');if(!card)return;var already=card.classList.contains("open");closeAll();if(!already){card.classList.add("open");var ob=card.querySelector("[data-open]");if(ob)ob.textContent="Hide brand";card.scrollIntoView({behavior:"smooth",block:"start"});}}
  function _syncLanes(){var hs=document.querySelectorAll(".lane-head");for(var i=0;i<hs.length;i++){var g=hs[i].nextElementSibling;if(g&&g.className&&g.className.indexOf("name-grid")>-1){var cs=g.querySelectorAll(".name-card"),v=0;for(var j=0;j<cs.length;j++){if(cs[j].style.display!=="none"&&cs[j].className.indexOf("is-deleted")<0)v++;}hs[i].style.display=v?"":"none";}}}
  function _r(){return (new URLSearchParams(location.search).get("r"))||"";}
  function _cmpEsc(x){return String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function _blockByTitle(card,t){var bs=card.querySelectorAll(".detail-block");for(var i=0;i<bs.length;i++){var h=bs[i].querySelector("h3");if(h&&h.textContent.trim().toLowerCase()===t.toLowerCase())return bs[i];}return null;}
  function _cmpKept(){var a=[];var ns=document.querySelectorAll(".name-card.is-kept");for(var i=0;i<ns.length;i++){if(ns[i].className.indexOf("is-deleted")<0)a.push(ns[i]);}return a;}
  function _updateCmpBar(){var bar=document.getElementById("cmpBar");if(!bar)return;var n=_cmpKept().length;var b=document.getElementById("cmpOpen");if(n>=2){bar.style.display="";if(b)b.textContent="See saved together ("+n+")";}else{bar.style.display="none";}}
  function _openCompare(){var cards=_cmpKept();if(cards.length<2)return;var html=cards.map(function(c){var id=c.getAttribute("data-name-id");var nmEl=c.querySelector(".name-title");var nm=nmEl?nmEl.textContent:"";var domEl=c.querySelector(".domain");var dom="",av="";if(domEl){dom=domEl.textContent.replace(/Available/i,"").trim();if(domEl.querySelector(".available"))av='<span class="cmp-av">Available</span>';}var sws=[];var swEls=c.querySelectorAll(".detail-panel .swatch");for(var k=0;k<swEls.length&&sws.length<6;k++){var bg=swEls[k].style.background||swEls[k].style.backgroundColor;if(bg)sws.push(bg);}var swh=sws.map(function(b){return '<span class="cmp-sw" style="background:'+b+'"></span>';}).join("");var tag="";var tb=_blockByTitle(c,"Taglines");if(tb){var li=tb.querySelector("li");if(li)tag=li.textContent;}var voice="";var vb=_blockByTitle(c,"Voice");if(vb){var vli=vb.querySelector("li");voice=vli?vli.textContent:(vb.querySelector("p")?vb.querySelector("p").textContent:"");}return '<div class="cmp-col"><div class="cmp-name">'+_cmpEsc(nm)+'</div>'+(dom?'<div class="cmp-dom">'+_cmpEsc(dom)+av+'</div>' :"")+(swh?'<div class="cmp-pal">'+swh+'</div>':"")+(tag?'<div class="cmp-tag">\u201c'+_cmpEsc(tag)+'\u201d</div>':"")+(voice?'<div class="cmp-lbl">Voice</div><div class="cmp-voice">'+_cmpEsc(voice)+'</div>':"")+'<button class="btn secondary cmp-openbrand" type="button" data-open="'+id+'">See brand</button></div>';}).join("");var body=document.getElementById("cmpBody");if(body)body.innerHTML=html;var modal=document.getElementById("cmpModal");if(modal)modal.style.display="flex";}
  function _closeCompare(){var m=document.getElementById("cmpModal");if(m)m.style.display="none";}
  /* SHEETFIX (2026-07-13): if nothing is hearted yet, the chosen pick still shares —
     the banner's "Share your pick" may never be a silent dead button. Tagline comes from
     the embedded kit data first (board-mode cards have no "Taglines" block to scrape). */
  function _savedItems(){var cards=_cmpKept();if(!cards.length){var ch=_chosenCard();if(ch)cards=[ch];}return cards.map(function(c){var d=_sheetKit(c);var nmEl=c.querySelector(".name-title");var nm=(d&&d.name)||(nmEl?nmEl.textContent:"");var domEl=c.querySelector(".domain");var dom=(d&&d.domain)||"",av=d?(d.avail===true):false;if(!dom&&domEl){dom=domEl.textContent.replace(/Available/i,"").trim();}if(!d&&domEl){av=!!domEl.querySelector(".available");}var tag=(d&&d.taglines&&d.taglines[0])||"";if(!tag){var tb=_blockByTitle(c,"Taglines");if(tb){var li=tb.querySelector("li");if(li)tag=li.textContent;}}return {name:nm,domain:dom,tagline:tag,available:av};});}
  function _openShare(){var items=_savedItems();if(!items.length)return;var c=document.getElementById("shrCount");if(c)c.textContent=items.length;var msg=document.getElementById("shrMsg");if(msg)msg.textContent="";var m=document.getElementById("shrModal");if(m)m.style.display="flex";}
  function _closeShare(){var m=document.getElementById("shrModal");if(m)m.style.display="none";}
  function _noteClose(area){var ed=area.querySelector(".note-edit");if(ed)ed.style.display="none";var disp=area.querySelector(".note-display");var txt=disp?disp.querySelector(".note-text"):null;var has=!!(txt&&txt.textContent.trim());if(disp)disp.style.display=has?"flex":"none";var tg=area.querySelector(".note-toggle");if(tg){tg.style.display="";tg.textContent="";}}
  function _noteSave(area){var pos=parseInt(area.getAttribute("data-note-pos"),10);var ta=area.querySelector(".note-input");var val=ta?ta.value:"";var msg=area.querySelector(".note-msg");var btn=area.querySelector(".note-save");if(btn){btn.disabled=true;btn.textContent="Saving\u2026";}if(msg)msg.textContent="";fetch("/.netlify/functions/curate-name",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({r:_r(),position:pos,action:"note",note:val})}).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){if(btn){btn.disabled=false;btn.textContent="Save note";}if(d&&d.ok){var disp=area.querySelector(".note-display");var txt=disp?disp.querySelector(".note-text"):null;if(txt)txt.textContent=val;_noteClose(area);}else{if(msg){msg.style.color="#b00020";msg.textContent="Couldn\u2019t save \u2014 try again.";}}}).catch(function(){if(btn){btn.disabled=false;btn.textContent="Save note";}if(msg){msg.style.color="#b00020";msg.textContent="Couldn\u2019t reach the server.";}});}
  function _chosenCard(){return document.querySelector(".name-card.is-chosen");}
  function _bsList(card,title){var b=_blockByTitle(card,title);if(!b)return "";var lis=b.querySelectorAll("li");var out="";if(lis.length){for(var i=0;i<lis.length&&i<5;i++){out+="<li>"+_cmpEsc(lis[i].textContent)+"</li>";}return out;}var pp=b.querySelector("p");return pp?("<li>"+_cmpEsc(pp.textContent)+"</li>"):"";}
  /* SHEETFIX (2026-07-13): the sheet is built from the server-embedded kit JSON
     (#smnSheetData, keyed by data-name-id) \u2014 the card's rendered markup can change
     (graphic-board mode has no .detail-block/.swatch) but the data can't. DOM scraping
     survives only as a last-resort fallback, and empty columns are never rendered. */
  function _sheetKit(card){try{if(!card)return null;var el=document.getElementById("smnSheetData");if(!el)return null;var all=JSON.parse(el.textContent||"{}");return all[card.getAttribute("data-name-id")]||null;}catch(e){return null;}}
  function _openBrandSheet(){var card=_chosenCard();if(!card)return;var data=_sheetKit(card);var nm=(data&&data.name)||(card.querySelector(".name-title")||{}).textContent||"";var domEl=card.querySelector(".domain");var dom=(data&&data.domain)||(domEl?domEl.textContent.replace(/Available/i,"").trim():"");var avail=data?(data.avail===true):!!(domEl&&domEl.querySelector(".available"));var svg=card.querySelector(".detail-panel svg");var logoSvg=svg?svg.outerHTML:"";
    var sws=(data&&data.colors&&data.colors.length)?data.colors.slice(0,8):[];
    if(!sws.length){var swEls=card.querySelectorAll(".detail-panel .swatch");for(var k=0;k<swEls.length&&sws.length<8;k++){var bg=swEls[k].style.background||swEls[k].style.backgroundColor;if(bg)sws.push(bg);}}
    var swRow=sws.map(function(b){return '<span class="bs-sw" style="background:'+_cmpEsc(b).replace(/"/g,"")+'"></span>';}).join("");
    function _lis(arr){return (arr||[]).map(function(t){return "<li>"+_cmpEsc(t)+"</li>";}).join("");}
    var voice=(data&&data.voice&&data.voice.length)?_lis(data.voice):_bsList(card,"Voice");
    var tags=(data&&data.taglines&&data.taglines.length)?_lis(data.taglines):_bsList(card,"Taglines");
    var firstTag=(data&&data.taglines&&data.taglines[0])||"";
    if(!firstTag){var tb=_blockByTitle(card,"Taglines");if(tb){var l=tb.querySelector("li");if(l)firstTag=l.textContent;}}
    /* only columns with real content render \u2014 a header may never sit over an empty box */
    var cols="";
    if(swRow)cols+='<div class="bs-col"><div class="bs-h">Color palette</div><div class="bs-sw-row">'+swRow+'</div></div>';
    if(voice)cols+='<div class="bs-col"><div class="bs-h">Voice</div><ul class="bs-list">'+voice+'</ul></div>';
    if(tags)cols+='<div class="bs-col"><div class="bs-h">Taglines</div><ul class="bs-list">'+tags+'</ul></div>';
    var html='<div class="bs-eyebrow">Brand Identity Strategy</div>'+(logoSvg?'<div class="bs-logo">'+logoSvg+'<span class="bs-wm">'+_cmpEsc(nm)+'</span></div>':'')+'<div class="bs-name">'+_cmpEsc(nm)+'</div>'+(dom?'<div class="bs-dom">'+_cmpEsc(dom)+(avail?'<span class="bs-avail">Available</span>':'')+'</div>':'')+(firstTag?'<div class="bs-tag">\u201c'+_cmpEsc(firstTag)+'\u201d</div>':'')+(cols?'<div class="bs-grid">'+cols+'</div>':'')+'<div class="bs-foot">Brand concepts are for informational purposes only and are not legal, trademark, business-formation, or domain-registration advice.<br>\u00a9 2026 SparkMyName\u2122\u2122. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).</div>';var body=document.getElementById("brandSheetBody");if(body)body.innerHTML=html;var modal=document.getElementById("sheetModal");if(modal){modal.style.display="flex";_confetti(modal);}}
  function _closeSheet(){var m=document.getElementById("sheetModal");if(m)m.style.display="none";}
  function _printSheet(){document.body.classList.add("sheet-print");var done=function(){document.body.classList.remove("sheet-print");window.removeEventListener("afterprint",done);};window.addEventListener("afterprint",done);setTimeout(function(){window.print();setTimeout(function(){document.body.classList.remove("sheet-print");},1800);},60);}
  function _confetti(host){try{var cs=["#2E8CFF","#5AA0FF","#147A3D","#F5C518","#FF5A8A","#ffffff"];for(var i=0;i<16;i++){var d=document.createElement("span");d.className="confetti-bit";d.style.background=cs[i%cs.length];d.style.left=(8+Math.random()*84)+"%";d.style.animationDelay=(Math.random()*0.18)+"s";host.appendChild(d);(function(el){setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},1300);})(d);}}catch(e){}}
  function _updatePickBanner(){var bar=document.getElementById("pickBanner");if(!bar)return;var card=_chosenCard();if(!card){bar.style.display="none";return;}var nmEl=card.querySelector(".name-title");var domEl=card.querySelector(".domain");var nmT=nmEl?nmEl.textContent:"";var domT=domEl?domEl.textContent.replace(/Available/i,"").trim():"";var avail=!!(domEl&&domEl.querySelector(".available"));var pn=document.getElementById("pickName");if(pn)pn.textContent=nmT;var pd=document.getElementById("pickDom");if(pd)pd.textContent=domT;bar.style.display="block";}
  function _doChoose(){}
  function _shareSend(){var items=_savedItems();if(!items.length)return;var from=(document.getElementById("shrFrom")||{}).value||"";var to=(document.getElementById("shrTo")||{}).value||"";var note=(document.getElementById("shrNote")||{}).value||"";var msg=document.getElementById("shrMsg");var emails=to.split(",").map(function(x){return x.trim();}).filter(Boolean);if(!emails.length){if(msg){msg.style.color="#b00020";msg.textContent="Add at least one email address.";}return;}var btn=document.getElementById("shrEmail");if(btn){btn.disabled=true;btn.textContent="Sending\u2026";}fetch("/.netlify/functions/share-names",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sender:from,recipients:emails,note:note,items:items,reportUrl:location.href})}).then(function(r){return r.json().catch(function(){return{};});}).then(function(d){if(btn){btn.disabled=false;btn.textContent="Send email";}if(d&&d.ok){if(msg){msg.style.color="#147A3D";msg.textContent="Sent to "+d.sent+(d.sent===1?" person.":" people.");}setTimeout(_closeShare,1500);}else{var em=(d&&d.error)||"";if(msg){msg.style.color="#b00020";msg.textContent=em==="no_valid_recipients"?"Those email addresses don\u2019t look right.":(em==="no_resend_key"?"Email isn\u2019t configured on the server yet.":"Couldn\u2019t send \u2014 try again.");}}}).catch(function(){if(btn){btn.disabled=false;btn.textContent="Send email";}if(msg){msg.style.color="#b00020";msg.textContent="Couldn\u2019t reach the server.";}});}
  function _sharePdf(){_closeShare();setTimeout(function(){window.print();},250);}
  function _shareWord(){var items=_savedItems();if(!items.length)return;var rows=items.map(function(it){return '<p style="margin:0 0 2px;font-family:Arial;font-size:15pt;font-weight:bold;">'+_cmpEsc(it.name)+'</p>'+(it.domain?'<p style="margin:0;font-family:Arial;font-size:11pt;">'+_cmpEsc(it.domain)+(it.available?" (available)":"")+'</p>':"")+(it.tagline?'<p style="margin:0 0 12px;font-family:Arial;font-size:11pt;font-style:italic;color:#444;">\u201c'+_cmpEsc(it.tagline)+'\u201d</p>':'<div style="margin-bottom:12px"></div>');}).join("");var docHtml='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>Brand shortlist</title></head><body style="font-family:Arial;"><h2 style="font-family:Arial;">SparkMyName\u2122 \u2014 Brand shortlist</h2>'+rows+'<p style="font-family:Arial;font-size:8pt;color:#888;margin-top:24px;">Brand concepts are informational only and not legal, trademark, or domain advice. \u00a9 2026 SparkMyName\u2122. Owned by VORREX IGNITE LLC. U.S. Patent Pending (App. 19/704,386).</p></body></html>';var blob=new Blob(["\ufeff"+docHtml],{type:"application/msword"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="brand-shortlist.doc";document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(url);},600);}
  function _curate(pos,action){var r=_r();if(!r)return;fetch("/.netlify/functions/curate-name",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({r:r,position:pos,action:action})}).catch(function(){});}
  function _addRestore(id,nm,pos){var bar=document.getElementById("restorebar");if(!bar)return;bar.style.display="";var b=document.createElement("button");b.className="btn ghost";b.setAttribute("data-restore",id);b.setAttribute("data-pos",pos);b.type="button";b.textContent="\u21a9 "+nm;bar.appendChild(b);}
  window.addEventListener("beforeprint",function(){if(!document.querySelector(".name-card.is-kept, .name-card.open")){var c=document.querySelector(".name-card:not(.is-deleted)");if(c)c.classList.add("open");}});
  document.addEventListener("click",function(e){
    if(e.target&&e.target.id==="cmpModal"){_closeCompare();return;}
    if(e.target.closest&&e.target.closest("#cmpClose")){_closeCompare();return;}
    if(e.target.closest&&e.target.closest("#cmpOpen")){_openCompare();return;}
    if(e.target.closest&&e.target.closest(".cmp-openbrand")){_closeCompare();}
    if(e.target&&e.target.id==="shrModal"){_closeShare();return;}
    if(e.target.closest&&e.target.closest("#shrClose")){_closeShare();return;}
    if(e.target.closest&&e.target.closest("#shrOpen")){_openShare();return;}
    if(e.target.closest&&e.target.closest("#shrEmail")){_shareSend();return;}
    if(e.target.closest&&e.target.closest("#shrPdf")){_sharePdf();return;}
    if(e.target.closest&&e.target.closest("#shrWord")){_shareWord();return;}
    if(e.target.closest&&e.target.closest("#pickShare")){_openShare();return;}
    if(e.target.closest&&e.target.closest("#pickResources")){window.open("/resources.html","_blank","noopener");return;}
    if(e.target.closest&&e.target.closest("#pickOpen")){var _pc=_chosenCard();if(_pc)openCard(_pc.getAttribute("data-name-id"));return;}
    var _ntg=e.target.closest(".note-toggle");if(_ntg){var _na=_ntg.closest(".note-area");if(_na){var _ed=_na.querySelector(".note-edit");var _dp=_na.querySelector(".note-display");if(_ed){_ed.style.display="block";if(_dp)_dp.style.display="none";_ntg.style.display="none";var _ti=_ed.querySelector(".note-input");if(_ti){try{_ti.focus();}catch(_e){}}}}return;}
    var _ncl=e.target.closest(".note-cancel");if(_ncl){var _na2=_ncl.closest(".note-area");if(_na2)_noteClose(_na2);return;}
    var _nsv=e.target.closest(".note-save");if(_nsv){var _na3=_nsv.closest(".note-area");if(_na3)_noteSave(_na3);return;}
    if(e.target.closest&&e.target.closest("#pickSheet")){_openBrandSheet();return;}
    if(e.target.closest&&e.target.closest("#sheetPrint")){_printSheet();return;}
    if(e.target.closest&&e.target.closest("#sheetClose")){_closeSheet();return;}
    if(e.target&&e.target.className&&(""+e.target.className).indexOf("sheet-scroll")>-1){_closeSheet();return;}
    var o=e.target.closest("[data-open]");if(o){openCard(o.getAttribute("data-open"));return;}
    var k=e.target.closest("[data-keep]");if(k){var kc=k.closest(".name-card");var saving=!(kc&&kc.classList.contains("is-kept"));k.classList.toggle("on",saving);if(saving){k.innerHTML='<span style="color:#e0245e">♥</span> Saved';}else{k.textContent="♡ Save";}if(kc)kc.classList.toggle("is-kept",saving);var pos=parseInt(k.getAttribute("data-pos"),10);if(!isNaN(pos))_curate(pos,saving?"keep":"unkeep");if(saving){var prev=_chosenCard();if(prev&&prev!==kc){prev.classList.remove("is-chosen");var _pb=prev.querySelector(".chosen-badge");if(_pb&&_pb.parentNode)_pb.parentNode.removeChild(_pb);var _pk=prev.querySelector("[data-keep]");var _pp=_pk?parseInt(_pk.getAttribute("data-pos"),10):NaN;if(!isNaN(_pp))_curate(_pp,"unchoose");}kc.classList.add("is-chosen");if(!kc.querySelector(".chosen-badge")){var _nt=kc.querySelector(".name-top");if(_nt){var _bd=document.createElement("span");_bd.className="chosen-badge";_bd.textContent="\u2605 Your pick";_nt.appendChild(_bd);}}if(!isNaN(pos))_curate(pos,"choose");try{var _grids=document.querySelectorAll(".name-grid");if(_grids.length)_grids[0].insertBefore(kc,_grids[0].firstChild);}catch(_e){}_updatePickBanner();var _bar=document.getElementById("pickBanner");if(_bar){_confetti(_bar);try{_bar.scrollIntoView({behavior:"smooth",block:"nearest"});}catch(_e2){}}}else{if(kc&&kc.classList.contains("is-chosen")){kc.classList.remove("is-chosen");var _b=kc.querySelector(".chosen-badge");if(_b&&_b.parentNode)_b.parentNode.removeChild(_b);if(!isNaN(pos))_curate(pos,"unchoose");}_updatePickBanner();}if(typeof _updateCmpBar==="function")_updateCmpBar();return;}
    var hd=e.target.closest("[data-hide]");if(hd){var hc=hd.closest(".name-card");if(hc){hc.classList.add("is-deleted");hc.style.display="none";var nt=hc.querySelector(".name-title");_addRestore(hc.getAttribute("data-name-id"),nt?nt.textContent:"this name",hd.getAttribute("data-pos"));var hp=parseInt(hd.getAttribute("data-pos"),10);if(!isNaN(hp))_curate(hp,"remove");}_syncLanes();_updateCmpBar();return;}
    var rs=e.target.closest("[data-restore]");if(rs){var rid=rs.getAttribute("data-restore");var rc=document.querySelector('.name-card[data-name-id="'+rid+'"]');if(rc){rc.classList.remove("is-deleted");rc.style.display="";}var rp=parseInt(rs.getAttribute("data-pos"),10);if(!isNaN(rp))_curate(rp,"restore");if(rs.parentNode)rs.parentNode.removeChild(rs);var bar=document.getElementById("restorebar");if(bar&&!bar.querySelector("[data-restore]"))bar.style.display="none";_syncLanes();_updateCmpBar();return;}
  });
  document.addEventListener("keydown",function(e){if(e.key==="Escape"||e.keyCode===27){try{_closeSheet();}catch(_e){}try{if(typeof _closeCompare==="function")_closeCompare();}catch(_e2){}try{if(typeof _closeShare==="function")_closeShare();}catch(_e3){}}});
  var first=document.querySelector(".open-first");if(first){first.addEventListener("click",function(){var c=document.querySelector(".name-card");if(c)openCard(c.getAttribute("data-name-id"));});}
  var sh=document.getElementById("shareReport");if(sh){sh.addEventListener("click",function(){var u=location.href;if(navigator.share){navigator.share({title:document.title,url:u}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(u);sh.textContent="Link copied";setTimeout(function(){sh.textContent="Share";},1600);}else{prompt("Copy this link:",u);}});}
  var rf=document.getElementById("refineBtn");if(rf){try{var _ruk="smn_refines_"+(_r()||"");var _ru=parseInt(localStorage.getItem(_ruk)||"0",10);if(_ru>=1){rf.disabled=true;rf.textContent="For more brands, please email Customer Support.";}}catch(e){}rf.addEventListener("click",function(){var r=_r();if(!r){location.href="/account.html";return;}try{var uk="smn_refines_"+r;var u=parseInt(localStorage.getItem(uk)||"0",10);if(u>=1){rf.disabled=true;rf.textContent="For more brands, please email Customer Support.";return;}localStorage.setItem(uk,String(u+1));}catch(e){}rf.disabled=true;var box=document.getElementById("refineBox");if(box){box.innerHTML='<h2>We\u2019re working on another set of ideas for you.</h2><p class="lead" style="margin:8px auto 0;max-width:470px">We\u2019ll email you when they\u2019re ready and add them to this page automatically. Most new sets arrive within 15 minutes.</p><div class="actions" style="justify-content:center;margin-top:18px"><button class="btn secondary" type="button" disabled style="opacity:.55;cursor:default">Request received ✓</button></div>';}fetch("/.netlify/functions/add-names",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({r:r})}).then(function(x){return x.json().catch(function(){return{};});}).then(function(d){if(d&&d.capped){var b2=document.getElementById("refineBox");if(b2)b2.innerHTML='<p class="lead" style="margin:8px auto 0;max-width:470px">You\u2019ve reached the limit for this order \u2014 please email Customer Support for more.</p>';}}).catch(function(){});});}
  (function(){var now=Date.now();document.querySelectorAll(".name-card[data-new-until]").forEach(function(card){var u=parseInt(card.getAttribute("data-new-until"),10);if(!u||now>u){card.classList.remove("is-new");var b=card.querySelector(".new-badge");if(b&&b.parentNode)b.parentNode.removeChild(b);}});})();
  try{_syncLanes();_updateCmpBar();_updatePickBanner();}catch(e){}
})();
</script>`;

  var ideaRaw = opts.seed ? String(opts.seed) : "";
  ideaRaw = ideaRaw.replace(/\s+/g, " ").trim(); if (ideaRaw) { ideaRaw = ideaRaw.charAt(0).toUpperCase() + ideaRaw.slice(1); if (!/[.!?\u2026]$/.test(ideaRaw)) ideaRaw += "."; }
  var ideaDisp = ideaRaw ? esc(ideaRaw) : "your idea";

  function _list(arr){ if(!Array.isArray(arr)||!arr.length) return ""; return "<ul>"+arr.map(function(s){ if(s&&typeof s==="object"){ var l=s.label?esc(s.label):""; var d=s.desc?((l?" \u2014 ":"")+esc(s.desc)):""; s=l+d; } else { s=esc(String(s)); } return s?("<li>"+s+"</li>"):""; }).join("")+"</ul>"; }
  function _textOf(v){ if(Array.isArray(v)) return v.map(function(s){ if(s&&typeof s==="object"){ return [s.label,s.desc].filter(Boolean).join(" \u2014 "); } return String(s); }).filter(Boolean).join(" \u00b7 "); return v?String(v):""; }
  var _CNAMES=[["Harbor Mist",185,196,206],["Sky",127,181,230],["Powder Blue",176,206,235],["Cornflower",100,149,237],["Sunset Blue",46,111,176],["Azure",0,127,180],["Cobalt",11,95,255],["Royal Blue",0,51,160],["Sapphire",15,82,150],["Steel Blue",74,107,138],["Slate Blue",72,101,129],["Slate Navy",44,62,80],["Navy",28,42,71],["Midnight Navy",14,27,42],["Indigo",51,0,114],["Coastal Teal",42,157,143],["Teal",0,128,128],["Deep Teal",0,90,110],["Aqua",0,178,169],["Turquoise",48,213,200],["Peacock",0,110,130],["Mint",191,227,204],["Sage",156,175,136],["Meadow Green",91,161,91],["Emerald",46,204,113],["Kelly Green",67,176,42],["Forest",30,86,49],["Pine",23,54,44],["Olive",128,128,64],["Moss",103,123,46],["Fern",120,160,90],["White Willow",237,239,230],["Pearl",242,240,235],["Cloud White",250,251,253],["Ivory",255,255,240],["Linen",239,231,218],["Stone",201,194,182],["Greige",184,176,161],["Ash",160,162,165],["Silver",192,192,192],["Slate Gray",112,128,144],["Graphite",67,70,75],["Charcoal",54,57,62],["Ink",14,23,38],["Jet",17,17,17],["Espresso",75,53,32],["Walnut",92,67,39],["Coffee",111,78,55],["Bronze",122,92,46],["Chestnut",149,107,60],["Camel",193,154,107],["Tan",210,180,140],["Khaki",189,183,107],["Sand",224,201,166],["Wheat",245,222,179],["Taupe",139,121,94],["Terracotta",201,106,75],["Clay",178,107,86],["Rust",168,67,43],["Amber",240,165,0],["Gold",212,175,55],["Marigold",234,170,0],["Coral",231,111,81],["Apricot",240,180,120],["Butter",245,230,168],["Mustard",212,160,23],["Lemon",245,225,80],["Brick",155,45,32],["Crimson",192,57,43],["Cherry",200,30,60],["Garnet",130,30,45],["Plum",123,75,110],["Lavender",201,182,228],["Violet",142,97,177],["Berry",142,59,92],["Mauve",180,130,150],["Rose",232,160,168],["Blush",248,214,220]];;var _PMS=[["PMS 2935 C",0,87,184],["PMS 286 C",0,51,160],["PMS 300 C",0,94,184],["PMS 540 C",0,48,87],["PMS 7686 C",30,109,179],["PMS 285 C",65,143,222],["PMS 2925 C",0,156,222],["PMS 3125 C",0,174,199],["PMS 320 C",0,156,166],["PMS 327 C",0,131,125],["PMS 348 C",0,132,61],["PMS 355 C",0,158,73],["PMS 361 C",67,176,42],["PMS 368 C",105,190,40],["PMS 376 C",132,189,0],["PMS 575 C",103,123,46],["PMS 5535 C",23,54,44],["PMS 343 C",17,87,64],["PMS 7541 C",217,221,222],["PMS Cool Gray 5 C",177,179,179],["PMS Cool Gray 9 C",117,120,123],["PMS Cool Gray 11 C",83,86,90],["PMS 432 C",51,63,72],["PMS Black 6 C",16,24,32],["PMS 419 C",33,38,38],["PMS Warm Gray 4 C",184,175,167],["PMS 7527 C",224,220,207],["PMS 7499 C",240,229,197],["PMS 7401 C",245,229,186],["PMS 4525 C",191,167,108],["PMS 124 C",234,170,0],["PMS 7409 C",240,175,50],["PMS 1375 C",255,156,0],["PMS 165 C",255,103,31],["PMS 173 C",207,82,46],["PMS 484 C",155,45,40],["PMS 187 C",166,25,46],["PMS 200 C",186,12,47],["PMS 7421 C",110,29,52],["PMS 254 C",137,46,143],["PMS 2685 C",51,0,114],["PMS 2587 C",142,97,177],["PMS 663 C",224,213,228],["PMS 1905 C",247,180,193]];function _hex2rgb(h){h=String(h).replace("#","");if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}function _near(rgb,list){var best=list[0],bd=1e9;for(var i=0;i<list.length;i++){var e=list[i],dr=rgb[0]-e[1],dg=rgb[1]-e[2],db=rgb[2]-e[3],d=dr*dr+dg*dg+db*db;if(d<bd){bd=d;best=e;}}return best[0];}function _swatches(palettes){ var hx=[]; (Array.isArray(palettes)?palettes:[]).forEach(function(p){ ((p&&Array.isArray(p.colors))?p.colors:[]).forEach(function(h){ h=String(h); if(/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(h)){ hx.push(h.charAt(0)==="#"?h:("#"+h)); } }); }); hx=hx.slice(0,8); if(!hx.length) return '<span style="color:var(--muted);font-size:14px">Palette included in your package.</span>'; var items=hx.map(function(h){var rgb=_hex2rgb(h);return{h:h,name:_near(rgb,_CNAMES),pms:_near(rgb,_PMS),lum:0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2]};}); var counts={}; items.forEach(function(it){counts[it.name]=(counts[it.name]||0)+1;}); items.forEach(function(it){ if(counts[it.name]>1){ var grp=items.filter(function(x){return x.name===it.name;}).sort(function(a,b){return a.lum-b.lum;}); var idx=grp.indexOf(it); it.label=it.name+(grp.length<=2?(idx===0?' Deep':' Light'):(idx===0?' Deep':(idx===grp.length-1?' Light':' Mid'))); } else { it.label=it.name; } }); return items.map(function(it){return '<div class="sw-item"><div class="swatch" style="background:'+esc(it.h)+'"></div><div class="sw-name">'+esc(it.label)+'</div><div class="sw-pms">'+esc(it.pms)+'</div><div class="sw-hex">'+esc(it.h.toUpperCase())+'</div></div>';}).join("")+'<div class="sw-note">Color names are descriptive; Pantone is the closest coated match (approx.) — confirm against a Pantone book before printing.</div>'; }

  var P=null; try{ if(_NI && ideaRaw) P=_NI.buildProfile("business", ideaRaw); }catch(e){ P=null; }
  function _S(v,f){ v=(v==null?"":String(v)).trim(); return esc(v||f); }
  var sIndustry="\u2014",sAudience="\u2014",sTone="\u2014",sFeel="\u2014";
  if(P){ var pcat=(P.specific_category&&P.specific_category!==P.parent_category)?(P.specific_category+" ("+P.parent_category+")"):(P.parent_category||""); sIndustry=_S(pcat,"\u2014"); sAudience=_S(P.audience,"\u2014"); sTone=_S(Array.isArray(P.customer_emotion)?P.customer_emotion.slice(0,4).join(", "):"","\u2014"); sFeel=_S(P.must_sound_like,"\u2014"); }

  var rec = names[0]||{};
  var rfw=rec.kit?(Array.isArray(rec.kit.whyItWorks)?rec.kit.whyItWorks[0]:(typeof rec.kit.whyItWorks==="string"?rec.kit.whyItWorks:"")):"";
  var recWhy = (rec.why?esc(rec.why):"") || (rfw?esc(rfw):"") || "Best balance of memorability, brandability, domain quality, and positioning.";

  var _hu=''; try{ for(var _hz=0;_hz<names.length;_hz++){ var _kz=names[_hz]&&names[_hz].kit; if(_kz&&_kz.headerUrl){ _hu=_kz.headerUrl; break; } } }catch(e){ _hu=''; }
  var cardsHTML = names.map(function(m,i){
    var kit=m.kit||{}; if(!(kit.palettes&&kit.palettes.length)){kit.palettes=_fallbackPals(m.name);} m.kit=kit; var rank=i+1; var pos=(typeof m.position==="number")?m.position:i; var avail=(m.domainAvailable===true);
    var fw=Array.isArray(kit.whyItWorks)?kit.whyItWorks[0]:(typeof kit.whyItWorks==="string"?kit.whyItWorks:"");
    var why1=(m.why?esc(m.why):"")||(fw?esc(fw):"")||(m.tagline?esc(m.tagline):"");
    var _whyOne=String(m.why||fw||"").trim().toLowerCase();var _wiw=Array.isArray(kit.whyItWorks)?kit.whyItWorks.filter(function(x){var t=(x&&x.label)?(x.label+" "+(x.desc||"")):String(x);return t.trim().toLowerCase()!==_whyOne;}):[];var whyB=_wiw.length?_list(_wiw):((typeof kit.whyItWorks==="string"&&kit.whyItWorks.trim())?("<p>"+esc(kit.whyItWorks)+"</p>"):(m.why?("<p>"+esc(m.why)+"</p>"):""));
    var kept=(m.kept===true); var chosen=(m.chosen===true); var note=(typeof m.note==="string"?m.note:"");
    var _detail=''; var _kitRich=!!((kit.palettes&&kit.palettes.length)||(kit.taglines&&kit.taglines.length)||(kit.voice&&kit.voice.length)); if(_kitRich&&BOARD_ON&&_BOARD&&_BOARD.boardHTML&&(kit.kind||m.kind||'brand')==='brand'){try{var _mNoHero=Object.assign({},m,{kit:Object.assign({},kit,{headerUrl:''})});_detail=_BOARD.boardHTML(_mNoHero)||'';}catch(e){_detail='';}} // CO-3.2: thin kits use the guaranteed grid \u2014 a brand can never open empty
    return '<article class="card name-card'+(kept?" is-kept":"")+(chosen?" is-chosen":"")+(m.newUntil?" is-new":"")+'" data-name-id="'+rank+'" data-brand-name="'+esc(m.name)+'" data-hero="'+esc((m.kit&&m.kit.headerUrl)||_hu||'')+'"'+(m.newUntil?' data-new-until="'+m.newUntil+'"':'')+'>'+
      (((m.kit&&m.kit.headerUrl)||_hu)?('<div class="card-cine"><img src="'+esc((m.kit&&m.kit.headerUrl)||_hu)+'" alt="" loading="lazy"></div>'):'')+
      ((m.kit&&Array.isArray(m.kit.logoUrls)&&m.kit.logoUrls.length)?('<div class="ai-logos" data-ai-logos>'+m.kit.logoUrls.map(function(u){return '<img src="'+esc(u)+'" alt="AI logo concept" loading="lazy">';}).join('')+'</div>'+'<div class="ai-logos-k" style="margin:2px 0 10px">Vector Logo</div>'):'<div class="ai-logos" data-ai-logos hidden></div>')+
      '<div class="name-top">'+(m.newUntil?'<span class="new-badge">NEW</span>':'')+(chosen?'<span class="chosen-badge">\u2605 Your pick</span>':'')+'</div>'+
      '<h3 class="name-title">'+esc(m.name)+'</h3>'+ /* CO-6: initials stub retired \u2014 every card wears its name */
      (m.domain?('<div class="domain">'+esc(m.domain)+(avail?' <span class="available">Available</span>':'')+'</div>'):'')+ (function(){var h=String(m.name||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,28);return h?('<div class="story-handles">'+['Instagram','X','Facebook','LinkedIn','TikTok'].map(function(p){return '<span class="sh-i"><b>'+p+'</b> @'+h+'</span>';}).join(' \u00b7 ')+'</div>'):'';})()+ (function(){var tg=(kit.taglines&&kit.taglines.length)?(kit.taglines[0].text||kit.taglines[0]):'';return tg?('<div class="story-tag">\u201c'+esc(String(tg))+'\u201d</div>'):'';})()+
      '<p class="why">'+((kit.taglines&&kit.taglines.length)?('\u201c'+esc(String(kit.taglines[0].text||kit.taglines[0]))+'\u201d'):why1)+'</p>'+
      '<div class="actions">'+
        '<button class="btn" type="button" data-open="'+rank+'">See brand</button>'+'<button class="btn secondary" type="button" data-dlcard="'+rank+'">Download</button>'+
        '<button class="btn secondary keep'+(kept?" on":"")+'" type="button" data-keep="'+rank+'" data-pos="'+pos+'">'+'♡ Save'+'</button>'+
        '<button class="btn ghost hide-btn" type="button" data-hide="'+rank+'" data-pos="'+pos+'">Hide</button>'+
      '</div>'+
      (share?'':''&&''&&'<div class="note-area" data-note-pos="'+pos+'">'+'<div class="note-display"'+(note?'':' style="display:none"')+'><span class="note-ic">\u270e</span><span class="note-text">'+esc(note)+'</span></div>'+'<button class="note-toggle" type="button">'+(note?'\u270e Edit note':'\u270e Add a private note')+'</button>'+'<div class="note-edit" style="display:none"><textarea class="note-input" rows="2" placeholder="Private to you \u2014 e.g. partner likes this, check the trademark\u2026">'+esc(note)+'</textarea>'+'<div class="note-btns"><button class="note-save btn" type="button">Save note</button><button class="note-cancel btn secondary" type="button">Cancel</button><span class="note-msg"></span></div></div>'+'</div>')+'<div class="detail-panel" id="brand-detail-'+rank+'">'+(_detail||('<div class="detail-grid">'+
        '<div class="detail-block"><h3>Why it works</h3>'+(whyB||'<p style="color:var(--muted)">Included in your package.</p>')+'</div>'+
        '<div class="detail-block"><h3>Color palette</h3><div class="palette">'+_swatches(kit.palettes)+'</div></div>'+
        '<div class="detail-block"><h3>Social handle recommendations</h3>'+_handlesR(m.name)+'</div>'+
        '<div class="detail-block"><h3>Voice</h3>'+(_list(kit.voice)||('<p>'+(esc(_textOf(kit.voice))||"\u2014")+'</p>'))+'</div>'+
        '<div class="detail-block"><h3>Fonts</h3>'+(_list(kit.fonts)||('<p>'+(esc(_textOf(kit.fonts))||"\u2014")+'</p>'))+'</div>'+
        '<div class="detail-block"><h3>Taglines</h3>'+(_list(kit.taglines)||'<p style="color:var(--muted)">\u2014</p>')+'</div>'+
        '<div class="detail-block"><h3>Social bios</h3>'+(_list(kit.bios)||'<p style="color:var(--muted)">\u2014</p>')+'</div>'+
        '<div class="detail-block"><h3>Launch posts</h3>'+(_list(kit.posts)||'<p style="color:var(--muted)">\u2014</p>')+'</div>'+
      '</div>'+brandExtras(m)))+'</div>'+
    '</article>';
  });

  var _laneOrder=[['professional','Professional'],['standard','Standard'],['clever','Clever'],['human','Human Touch']];
  var _hasLane=false; /* lanes retired: always one flat list, no Professional/Standard/Clever/Human labels */
  var cardsRendered;
  if(_hasLane){
    var _g=''; var _used={};
    /* CO-22 (Founder, 2026-07-06): ONE board — six tiles, two across, no lane groupings. Lanes still ride each card's data; the board never splits. */ _g+='<div class="name-grid">'+cardsHTML.join('')+'</div>';
    cardsRendered=_g;
  } else { cardsRendered='<div class="name-grid">'+cardsHTML.join("")+'</div>'; }
  var _chosenM=null; for(var _ci=0;_ci<names.length;_ci++){ if(names[_ci]&&names[_ci].chosen===true){ _chosenM=names[_ci]; break; } }

  /* ===== SHEETFIX (2026-07-13) — the brand sheet is built from DATA, never scraped =====
     ROOT CAUSE of the empty sheet: _openBrandSheet used to read the chosen card's rendered
     DOM (".detail-block h3" titled Voice/Taglines and ".detail-panel .swatch"). When the
     card's detail panel is rendered by graphic-board.js (SMN_CARD_BOARD=on) that markup
     uses inline styles with NONE of those classes or headings, so every lookup came back
     empty and the sheet showed bare COLOR PALETTE / VOICE / TAGLINES headers.
     FIX: every name's real kit essentials (palette hexes, voice, taglines, domain) are
     serialized here, server-side, into a JSON <script> keyed by the card's data-name-id.
     The sheet reads this data first and only falls back to DOM scraping if it's missing.

     DOWNLOAD / SHARE DESIGN DECISION (behavioral psychology, Walmart-simple standard):
     Our customer has low computer skills. Every extra decision is a place to get lost, so
     the banner offers NO chooser and NO "designer package vs. print card" branching:
       - "Download your brand sheet"  -> instantly SHOWS the finished one-page brand card
         (recognition beats recall: seeing it builds trust), with ONE gold "Download PDF"
         button. Print/save-as-PDF is the one path every browser and every skill level has.
       - "Share your pick"           -> the existing email modal (one form, one Send).
     That is option (a): a print-PDF one-page brand card. The full designer package is NOT
     duplicated here — it already lives on the Downloads shelf inside the opened brand,
     where the customer who wants more will naturally find it. One button = one outcome. */
  var _sheetData = {};
  (function(){
    function _tx(v){ if(v&&typeof v==='object'){ return [String(v.label||v.text||v.name||''), String(v.desc||'')].filter(Boolean).join(' — '); } return String(v==null?'':v); }
    names.forEach(function(m, i){
      try{
        var kit=(m&&m.kit)||{};
        var colors=[];
        (Array.isArray(kit.palettes)?kit.palettes:[]).forEach(function(p){ (((p&&Array.isArray(p.colors))?p.colors:[])).forEach(function(h){ h=String(h==null?'':h).trim(); if(/^#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(h)) colors.push(h.charAt(0)==='#'?h:'#'+h); }); });
        _sheetData[String(i+1)] = {
          name: String((m&&m.name)||''),
          domain: String((m&&m.domain)||''),
          avail: (m&&m.domainAvailable)===true,
          colors: colors.slice(0,8),
          voice: (Array.isArray(kit.voice)?kit.voice:[]).map(_tx).map(function(s){return s.trim();}).filter(Boolean).slice(0,5),
          taglines: (Array.isArray(kit.taglines)?kit.taglines:[]).map(_tx).map(function(s){return s.trim();}).filter(Boolean).slice(0,5)
        };
      }catch(e){}
    });
  })();
  // < escaped so kit text can never close the tag or inject markup.
  var SHEETDATA = '<script type="application/json" id="smnSheetData">' + JSON.stringify(_sheetData).replace(/</g, '\\u003c') + '</scr' + 'ipt>';
  var EXTRACSS = '<style>.name-logo{text-align:center;margin:2px 0 16px}.nl-tile{width:64px;height:64px;border-radius:15px;display:inline-flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:800;font-size:26px;color:#141414;letter-spacing:.5px}.nl-wm{font-family:Georgia,\'Times New Roman\',serif;font-weight:700;font-size:30px;line-height:1.12;margin-top:12px;letter-spacing:-.01em;word-break:break-word}.nl-rule{width:64px;height:3px;border-radius:2px;margin:12px auto 0}.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.lane-head{margin:34px 0 14px;padding-bottom:9px;border-bottom:1px solid var(--line)}.lane-name{font:850 20px/1 Inter,-apple-system,sans-serif;letter-spacing:-.02em;color:var(--ink)}.domain{font-size:21px!important;font-weight:800!important;letter-spacing:-.02em;margin-top:12px!important}.btn.ghost,.hide-btn{background:#fff;color:var(--muted);border:1px solid var(--line)}.restorebar{margin:18px 0 0;padding:12px 14px;background:var(--soft);border:1px solid var(--line);border-radius:18px;font-size:14px;color:var(--muted);display:flex;gap:8px;flex-wrap:wrap;align-items:center}.restorebar-l{font-weight:800;color:var(--ink);margin-right:4px}.restorebar .btn{padding:8px 12px;font-size:14px}.name-card.open .btn[data-open]{background:#A8802A!important;border-color:#A8802A!important;color:#141414!important;box-shadow:0 0 0 4px rgba(168,128,42,.18)}.new-badge{display:inline-block;margin-left:10px;font:800 10px/1 Arial,Helvetica,sans-serif;letter-spacing:.12em;color:#141414;background:#A8802A;padding:5px 9px;border-radius:999px;vertical-align:middle}.name-card.is-new{box-shadow:0 0 0 2px #A8802A,0 18px 50px rgba(168,128,42,.12)!important;border-color:#A8802A!important}.new-banner{margin:18px 0 0;background:rgba(168,128,42,.08);border:1px solid rgba(168,128,42,.25);color:var(--ink);border-radius:16px;padding:14px 18px;font:700 15px/1.4 Inter,-apple-system,sans-serif;text-align:center}.refine-loading{text-align:center;padding:10px 0}.refine-spin{width:34px;height:34px;border:3px solid rgba(168,128,42,.22);border-top-color:#A8802A;border-radius:50%;margin:0 auto 14px;animation:smnspin .8s linear infinite}@keyframes smnspin{to{transform:rotate(360deg)}}.palette{gap:14px}.sw-item{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:92px}.sw-item .swatch{width:54px;height:54px;border-radius:12px}.sw-name{font-weight:800;font-size:14px;color:var(--ink);margin-top:6px;letter-spacing:-.01em}.sw-pms{font-size:12px;color:#A8802A;font-weight:750}.sw-hex{font-size:12px;color:var(--muted);font-family:ui-monospace,Menlo,monospace}.sw-note{flex-basis:100%;width:100%;font-size:14px;color:var(--muted);margin-top:10px;line-height:1.5}.cmp-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:6px 0 18px;padding:14px 18px;background:#FFFFFF;color:#141414;border-radius:16px}.cmp-bar-l{font-weight:800;font-size:15px}.cmp-bar .btn{background:#A8802A!important;border-color:#A8802A!important;color:#141414!important}.cmp-modal{position:fixed;inset:0;background:rgba(34,28,18,.55);z-index:9999;display:none;align-items:center;justify-content:center;padding:24px}.cmp-sheet{background:#fff;border-radius:22px;max-width:1040px;width:100%;max-height:86vh;display:flex;flex-direction:column;box-shadow:0 40px 120px rgba(0,0,0,.35)}.cmp-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--line)}.cmp-head h3{margin:0;font-size:20px;letter-spacing:-.02em}.cmp-body{display:flex;gap:14px;overflow-x:auto;padding:20px 22px}.cmp-col{flex:0 0 230px;min-width:230px;border:1px solid var(--line);border-radius:16px;padding:16px;background:var(--soft)}.cmp-name{font-size:19px;font-weight:900;letter-spacing:-.02em;line-height:1.1}.cmp-dom{margin-top:8px;font-size:14px;font-weight:750;color:#111;word-break:break-all}.cmp-av{color:var(--green);font-weight:850;margin-left:6px}.cmp-pal{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0}.cmp-sw{width:22px;height:22px;border-radius:6px;border:1px solid rgba(0,0,0,.08)}.cmp-tag{font-style:italic;color:var(--ink);font-size:14px;margin:6px 0 10px}.cmp-lbl{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:800;margin-top:8px}.cmp-voice{font-size:14px;color:#333;margin-top:4px}.cmp-openbrand{margin-top:14px;width:100%}.cmp-bar-btns{display:flex;gap:10px;flex-wrap:wrap}.cmp-bar .btn.secondary{background:transparent!important;border:1px solid rgba(255,255,255,.55)!important;color:#141414!important}.shr-modal{position:fixed;inset:0;background:rgba(34,28,18,.55);z-index:10000;display:none;align-items:center;justify-content:center;padding:24px}.shr-sheet{background:#fff;border-radius:22px;max-width:560px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 40px 120px rgba(0,0,0,.35)}.shr-head{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--line)}.shr-head h3{margin:0;font-size:20px;letter-spacing:-.02em}.shr-body{padding:20px 22px}.shr-sub{color:var(--muted);font-size:15px;margin:0 0 16px}.shr-l{display:block;font-size:14px;font-weight:750;color:var(--ink);margin:0 0 14px}.shr-l input,.shr-l textarea{display:block;width:100%;margin-top:6px;padding:11px 13px;border:1px solid var(--line);border-radius:12px;font:400 15px/1.4 Inter,-apple-system,sans-serif;color:var(--ink);box-sizing:border-box}.shr-l textarea{resize:vertical}.shr-acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}.get-domain{display:inline-flex;align-items:center;gap:4px;margin-top:10px;font:800 13px/1 Inter,-apple-system,sans-serif;color:#A8802A;text-decoration:none;border:1px solid #A8802A;border-radius:999px;padding:7px 12px}.get-domain:hover{background:#A8802A;color:#141414}.cmp-col .get-domain{margin-top:8px;font-size:12px;padding:6px 10px}.name-card .keep.on{background:#147A3D!important;border-color:#147A3D!important;color:#FFFFFF}.choose-btn{background:#fff;color:#141414;border:1px solid #A8802A}.choose-btn.on{background:#A8802A;color:#141414;border-color:#A8802A}.name-card.is-chosen{box-shadow:0 0 0 2px #A8802A,0 18px 50px rgba(168,128,42,.14)!important;border-color:#A8802A!important}.chosen-badge{display:inline-block;margin-left:10px;font:800 11px/1 Inter,-apple-system,sans-serif;letter-spacing:.04em;color:#141414;background:#A8802A;padding:6px 10px;border-radius:999px;vertical-align:middle}.pick-banner{position:relative;overflow:hidden;background:#FFFFFF;color:#141414;border-radius:20px;padding:24px 26px;margin:6px 0 20px;box-shadow:0 22px 60px rgba(34,28,18,.20);animation:pbpop .35s ease}@keyframes pbpop{from{transform:scale(.97);opacity:.4}to{transform:scale(1);opacity:1}}.pb-eyebrow{font:800 12px/1 Inter,-apple-system,sans-serif;letter-spacing:.08em;color:#404040;text-transform:uppercase;margin-bottom:8px}.pb-name{font:900 30px/1.04 Inter,-apple-system,sans-serif;letter-spacing:-.03em}.pb-dom{font:750 14px/1.4 Inter,-apple-system,sans-serif;color:#404040;margin-top:6px}.pb-next{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:16px}.pb-next-l{font:800 11px/1 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#404040}.pb-link{display:inline-flex;align-items:center;gap:4px;font:800 13px/1 Inter,-apple-system,sans-serif;color:#221C12;background:#fff;border:0;border-radius:999px;padding:9px 14px;text-decoration:none;cursor:pointer}.pb-link.pb-muted{background:transparent;color:#404040;border:1px solid rgba(255,255,255,.4)}.confetti-bit{position:absolute;top:14px;width:8px;height:12px;border-radius:2px;opacity:.95;animation:conffall 1.1s ease-out forwards}@keyframes conffall{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(170px) rotate(320deg);opacity:0}}.note-area{margin-top:12px}.note-display{display:flex;align-items:flex-start;gap:8px;background:#FBF7EC;border:1px solid #ECE7DB;border-left:3px solid #A8802A;border-radius:10px;padding:10px 12px;font:500 13.5px/1.5 Inter,-apple-system,sans-serif;color:#3E3A32;margin-bottom:8px}.note-ic{flex:none}.note-text{white-space:pre-wrap;word-break:break-word}.note-toggle{background:transparent;border:0;color:#A8802A;font:800 13px/1 Inter,-apple-system,sans-serif;cursor:pointer;padding:4px 0}.note-edit{margin-top:8px}.note-input{display:block;width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line);border-radius:10px;font:400 14px/1.5 Inter,-apple-system,sans-serif;color:var(--ink);resize:vertical}.note-btns{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}.note-msg{font-size:14px;font-weight:700}.sheet-modal{position:fixed;inset:0;background:rgba(34,28,18,.6);z-index:10001;display:none;flex-direction:column}.sheet-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;background:#221C12;color:#FFFFFF;flex-wrap:wrap}.sheet-bar-l{font:800 15px/1 Inter,-apple-system,sans-serif}.sheet-bar-acts{display:flex;gap:10px}.sheet-scroll{flex:1;overflow:auto;padding:28px 20px;display:flex;justify-content:center}.brand-sheet{background:#fff;width:100%;max-width:820px;height:fit-content;border-radius:14px;box-shadow:0 30px 90px rgba(0,0,0,.4)}.bs-inner{padding:54px 56px}.bs-eyebrow{font:800 12px/1 Inter,-apple-system,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#A8802A}.bs-logo{margin:26px 0 18px;display:flex;align-items:center;gap:14px}.bs-logo svg{width:54px;height:54px}.bs-wm{font:800 26px/1 Inter,-apple-system,sans-serif;letter-spacing:-.02em;color:#221C12}.bs-name{font:900 56px/0.98 Inter,-apple-system,sans-serif;letter-spacing:-.04em;color:#221C12}.bs-dom{font:750 16px/1.4 Inter,-apple-system,sans-serif;color:#171410;margin-top:10px}.bs-avail{color:#147A3D;font-weight:850;margin-left:8px}.bs-tag{font:italic 500 22px/1.4 Georgia,serif;color:#5C5340;margin:24px 0 30px;border-left:3px solid #A8802A;padding-left:16px}.bs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;border-top:1px solid #ECE7DB;padding-top:26px}.bs-h{font:800 11px/1 Inter,-apple-system,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#5C5340;margin-bottom:12px}.bs-sw-row{display:flex;flex-wrap:wrap;gap:8px}.bs-sw{width:34px;height:34px;border-radius:8px;border:1px solid rgba(0,0,0,.08)}.bs-list{margin:0;padding:0;list-style:none}.bs-list li{font:400 13.5px/1.5 Inter,-apple-system,sans-serif;color:#171410;margin-bottom:7px}.bs-foot{margin-top:34px;padding-top:16px;border-top:1px solid #ECE7DB;font:400 12px/1.55 Inter,-apple-system,sans-serif;color:#5C5340}@media(max-width:640px){.bs-grid{grid-template-columns:1fr}.bs-inner{padding:32px 26px}.bs-name{font-size:42px}}@media print{body.sheet-print *{visibility:hidden!important}body.sheet-print #brandSheet,body.sheet-print #brandSheet *{visibility:visible!important}body.sheet-print #brandSheet{position:absolute;left:0;top:0;width:100%;box-shadow:none!important;border-radius:0!important}body.sheet-print .sheet-modal{position:static!important;display:block!important;background:#fff!important;padding:0!important}body.sheet-print .sheet-bar{display:none!important}}.res-cta{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;background:#FBF7EC;border:1px solid #ECE7DB;border-radius:18px;padding:22px 24px;margin:28px 0 8px}.res-cta-h{font:850 19px/1.2 Inter,-apple-system,sans-serif;letter-spacing:-.02em;color:#221C12}.res-cta-s{font:400 14px/1.5 Inter,-apple-system,sans-serif;color:#5C5340;margin-top:5px;max-width:560px}.res-cta-btn{flex:none;display:inline-flex;align-items:center;gap:6px;font:800 14px/1 Inter,-apple-system,sans-serif;color:#141414;background:#A8802A;border-radius:999px;padding:13px 20px;text-decoration:none}.topbar{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}.return-studio{background:#A8802A!important;color:#141414!important;border-color:#A8802A!important;font-weight:800!important}.return-studio:hover{background:#7E6018!important;border-color:#7E6018!important;color:#FFFFFF}.hero{text-align:center!important;background:#FAF8F2;border:1px solid #ECE7DB;border-radius:26px;padding:44px 36px;margin-bottom:12px;color:#171410;box-shadow:0 2px 4px rgba(43,33,10,.04),0 24px 60px -28px rgba(43,33,10,.14)}.hero h1{color:#171410;text-align:center!important;width:100%;display:block}.hero .kicker{color:#7E6018}.hero .sub{color:#3E3A32}@media print{.topbar{position:static}.hero{background:#fff;color:#171410;padding:0;border-radius:0}.hero h1{color:#171410}.return-studio{display:none!important}}.hero-cine{margin:0 -36px -30px;border-radius:0 0 26px 26px;overflow:hidden}.hero-cine img{width:100%;height:auto;display:block} /* CO-7: the FULL hero, never cropped */@media(max-width:480px){.name-grid{gap:12px}.name-grid .name-card{padding:14px}.name-title{font-size:22px}}@media(max-width:640px){.hero-cine{margin:0 -36px -30px}.card-cine{max-height:230px}.card-cine img{height:min(48vw,230px)}}.br-storyk{font:800 12px/1 Inter,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#7E6018;margin:0 2px 12px}/* One image, one purpose: the hero presents it; the story needn’t repeat it. *//* CO-16: the PAGE hero wears the opened brand\u2019s own scene; the card\u2019s internal copy is retired. */#brStory .card-cine{display:none!important}/* Launch shelf (2026-07-04): a finished launch shelf, not a utility grid. */.cc-deliv{grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}.cc-dcard{padding:24px 24px 22px;border-radius:20px;gap:14px}.cc-dn{font-size:17px}.cc-dbtn{padding:12px 17px;font-size:14px}/* Card diet (2026-07-04): a finished concept, not a control panel. */.name-grid .name-card{text-align:center}.name-grid .name-card .actions{justify-content:center;width:100%;max-width:560px;margin-left:auto;margin-right:auto;display:flex;gap:8px;flex-wrap:nowrap}.name-grid .name-card .actions .btn{flex:1 1 0;min-width:0;padding:12px 6px;font-size:14px;white-space:nowrap}.name-grid .name-card .note-area,.name-grid .name-card .note-toggle{display:none!important}.name-grid .name-card .hide-btn{display:inline-flex!important}.name-grid .name-card .btn[data-open]{background:#141414!important;border-color:#FFFFFF!important;color:#FFFFFF!important;font-weight:800}/* Reveal layer (2026-07-04): preview, reveal, expand. Generous, never overwhelming. */.br-more-hide{display:none!important}.br-seemore{margin:20px auto 0;display:flex}.br-showmore{appearance:none;background:none;border:0;color:#7E6018;font:700 13.5px/1 Inter,sans-serif;padding:10px 0 2px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;min-height:40px}.br-showmore:hover{color:#141414}.br-reveal{opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .65s cubic-bezier(.2,.8,.2,1)}.br-in{opacity:1;transform:none}@media print{.br-more-hide{display:revert!important}.br-reveal{opacity:1!important;transform:none!important}.br-seemore,.br-showmore{display:none!important}}/* Brand Room polish pass (2026-07-04): spacing, typography, hierarchy, calm. CSS only. */#brStory{margin-top:30px}.br-actions{margin:22px 0 4px;gap:11px}.br-nav{padding:14px 2px;margin-top:8px}.section{margin-top:56px}.br-close{margin-top:64px;padding:clamp(44px,7vw,64px) 24px}#ccDeliv{margin-top:4px}.cc-group-k{margin:34px 2px 14px}#brStory .name-title{font-family:Playfair Display,Georgia,serif;font-weight:700;font-size:clamp(42px,6.6vw,60px);letter-spacing:-.024em;line-height:1.02;text-align:center;margin-top:10px}#brStory .name-top{text-align:center}#brStory .domain{display:block;text-align:center;font-size:clamp(21px,3.6vw,28px)!important;font-weight:850!important;margin-top:12px!important}#brStory .why{text-align:center;font-size:16.5px;line-height:1.55;max-width:64ch;margin:12px auto 0}#brStory .ai-logos-k{margin-top:16px}#brStory .name-card{padding:28px 30px 30px}@media(max-width:640px){#brStory .name-card{padding:20px 18px 24px}}#brStory .detail-panel>div,#brStory .detail-panel img{max-width:100%!important}#brStory .detail-panel{overflow-x:auto}#brStory .detail-panel{background:#fff;border:0;border-top:1px solid var(--line);border-radius:0;margin-top:22px;padding:26px 4px 4px}#brStory .detail-grid{gap:18px}#brStory .detail-block{border-color:#EFE9DC;border-radius:20px;padding:22px 22px 20px;box-shadow:0 1px 2px rgba(43,33,10,.03)}#brStory .detail-block h3{font-size:12px;letter-spacing:.22em;color:#7E6018;margin-bottom:12px}#brStory .detail-block p,#brStory .detail-block li{font-size:14.8px;line-height:1.62;color:#3E3A32;margin-bottom:8px}#brStory .swatch{width:52px;height:52px;border-radius:14px}.section-head .kicker{letter-spacing:.26em}.section-head .lead{margin-top:8px}.name-grid{gap:24px;margin-top:18px;display:grid;grid-template-columns:1fr}/* CO-27 (Founder): EVERYTHING under the marks is CENTERED — absolute law, immune to overrides. */.name-grid .name-card{min-width:0;max-width:100%;box-sizing:border-box;text-align:center!important}.name-grid .name-card .name-top{display:flex!important;justify-content:center!important;text-align:center!important}.name-grid .name-card .name-title{text-align:center!important;width:100%!important;margin-left:auto!important;margin-right:auto!important}.name-grid .name-card .domain{display:block!important;text-align:center!important;margin-left:auto!important;margin-right:auto!important}.name-grid .name-card .why{display:block;text-align:center!important;margin-left:auto!important;margin-right:auto!important;max-width:64ch}.name-grid .name-card .story-tag,.name-grid .name-card .story-handles{display:none!important}.name-grid .name-card .ai-logos{display:flex!important;justify-content:center!important}.name-grid .name-card .ai-logos-k,.name-grid .name-card .ai-logos-n{text-align:center!important}.name-grid .name-card .actions{display:flex!important;justify-content:center!important;margin-left:auto!important;margin-right:auto!important;flex-wrap:nowrap!important}@media(max-width:480px){.actions .btn{padding:11px 4px;font-size:12px;letter-spacing:0}.actions{gap:6px}}/* CO-33 UNIVERSAL CENTERING HAMMER (Founder): every element of every brand block, centered. */.name-grid .name-card,.name-grid .name-card *{text-align:center!important}.name-grid .name-card .name-top,.name-grid .name-card .actions,.name-grid .name-card .ai-logos{display:flex!important;justify-content:center!important}.name-grid .name-card .domain,.name-grid .name-card .why,.name-grid .name-card .name-title{margin-left:auto!important;margin-right:auto!important}.name-grid .name-card .domain,.name-grid .name-card .name-title,.name-grid .name-card .why{overflow-wrap:anywhere;word-break:break-word}.name-grid .name-card img{max-width:100%}.name-grid .name-card{border-color:#EDE5D2;transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s,border-color .2s}.name-grid .name-card:hover{transform:translateY(-3px);border-color:#E2CE96;box-shadow:0 3px 6px rgba(43,33,10,.05),0 26px 56px -30px rgba(43,33,10,.28)}.cc-dcard{padding:19px 20px;border-radius:18px}.cc-deliv{gap:13px}.br-close .bx{font-size:clamp(28px,5.4vw,42px)}.br-close p{font-size:15.5px;margin:14px auto 26px}.br-return{margin-top:18px}.br-nav button{color:#6b6252;border-color:#EDE5D2;padding:12px 18px}.br-nav button:hover{background:#FBF7EC}@media print{.name-grid .name-card{transform:none!important}body.print-all .name-card{display:block!important}}/* Brand Room (2026-07-04): one continuous story. No tabs. No drawer. */.br-actions{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 6px}.br-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;appearance:none;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:13px 22px;font:700 14px/1 Inter,sans-serif;cursor:pointer;min-height:48px}.br-btn:hover{border-color:#C6A035;background:#FBF7EC}.br-btn.gold{background:#141414;border-color:#FFFFFF;color:#FFFFFF;box-shadow:0 1px 2px rgba(102,76,15,.35),0 14px 30px -12px rgba(150,114,31,.55)}.br-nav{position:sticky;top:0;z-index:60;display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:12px 2px;margin:6px -2px 0;background:#FFFFFF;scrollbar-width:none}.br-nav::-webkit-scrollbar{display:none}.br-nav button{flex:none;appearance:none;color:#5C5340;border:1px solid var(--line);background:#fff;border-radius:999px;padding:11px 16px;font:700 13px/1 Inter,sans-serif;min-height:44px;cursor:pointer}.br-nav button:hover{border-color:#C6A035;color:#7E6018}#brStory{margin-top:26px;scroll-margin-top:86px}#brStory .name-card{position:static!important;width:auto!important;margin:0!important;grid-column:auto;border:1px solid #E2CE96;border-radius:26px;box-shadow:0 2px 4px rgba(43,33,10,.05),0 30px 70px -30px rgba(43,33,10,.28)}#brStory .detail-panel{display:block!important}#brStory [data-open],#brStory .hide-btn{display:none!important}#brStory .card-cine{max-height:none}#brStory .card-cine img{height:min(40vw,300px)}@media(max-width:640px){#brStory .card-cine img{height:min(56vw,300px)}}.br-gallery-k{font:800 12px/1 Inter,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#7E6018;margin:44px 2px 6px}.br-gallery-lead{color:#5C5340;font-size:15px;margin:0 2px 8px;max-width:64ch}.cc-group-k{font:800 12px/1 Inter,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#7E6018;margin:26px 2px 12px;padding-top:6px}.cc-deliv{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}@media(max-width:640px){.cc-deliv{grid-template-columns:1fr}}.cc-dcard{display:flex;flex-direction:column;gap:12px;justify-content:space-between;background:#fff;border:1px solid var(--line);border-radius:16px;padding:17px 18px}.cc-dcard:hover{border-color:#E2CE96}.cc-dn{font:700 15px/1.35 Inter,sans-serif;color:var(--ink)}.cc-dacts{display:flex;gap:8px;flex-wrap:wrap}.cc-dbtn{appearance:none;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:10px 14px;font:700 12.5px/1 Inter,sans-serif;cursor:pointer;min-height:44px}.cc-dbtn:hover{border-color:#C6A035;background:#FBF7EC}.cc-dbtn.primary{background:#141414;border-color:#FFFFFF;color:#FFFFFF}.cc-dsoon{font:700 11px/1 Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#141414;background:#F4F0E6;border-radius:999px;padding:8px 12px}.strategy{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.strategy-item{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:0 2px 4px rgba(43,33,10,.04),0 16px 40px -24px rgba(43,33,10,.16)}.br-close{margin-top:52px;text-align:center;background:#fff;border:1px solid #E2CE96;border-radius:28px;padding:44px 22px;box-shadow:0 2px 4px rgba(43,33,10,.05),0 30px 70px -30px rgba(43,33,10,.25)}.br-close .bx{font-family:Playfair Display,Georgia,serif;font-weight:700;font-size:clamp(26px,5vw,38px);letter-spacing:-.02em;color:var(--ink)}.br-close p{color:#5C5340;margin:12px auto 22px;max-width:48ch}.br-close .br-actions{justify-content:center}.br-return{display:inline-block;margin-top:14px;color:#7E6018;font:700 14px/1 Inter,sans-serif;text-decoration:underline;text-underline-offset:4px}.section{margin-top:34px}.section-head .lead{font-size:16.5px;color:#5C5340;max-width:70ch}@media print{.br-actions,.br-nav,.br-close .br-actions,.br-return{display:none!important}#brStory .detail-panel{display:block!important}}/* Brand Command Center */.cc-tabs{position:sticky;top:0;z-index:60;display:flex;gap:8px;flex-wrap:wrap;background:rgba(250,248,242,.94);backdrop-filter:blur(8px);padding:12px 4px;margin:6px 0 18px;border-bottom:1px solid var(--line)}.cc-tab{appearance:none;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:11px 18px;font:700 13.5px/1 Inter,-apple-system,sans-serif;cursor:pointer;transition:all .15s}.cc-tab:hover{border-color:#C6A035}.cc-tab.on{background:#141414;border-color:#FFFFFF;color:#FFFFFF;box-shadow:0 10px 24px -12px rgba(150,114,31,.55)}.cc-hidden{display:none!important}@media print{.cc-tabs{display:none}.cc-hidden{display:block!important}}@media(min-width:900px){.name-grid{grid-template-columns:1fr!important;gap:26px}}@media(min-width:640px) and (max-width:899px){.name-grid{grid-template-columns:1fr!important;gap:20px}}.name-card.open{grid-column:1/-1}.cc-deliv{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;margin-top:14px}.cc-dcard{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:8px;box-shadow:0 2px 4px rgba(43,33,10,.04),0 18px 44px -24px rgba(43,33,10,.18);transition:transform .15s,box-shadow .15s}.cc-dcard:hover{transform:translateY(-2px);box-shadow:0 2px 4px rgba(43,33,10,.05),0 26px 60px -26px rgba(43,33,10,.26)}.cc-dk{font:800 10px/1 Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#7E6018}.cc-dn{font:700 16.5px/1.25 Georgia,serif;letter-spacing:-.01em;color:var(--ink)}.cc-dacts{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto}.cc-dbtn{appearance:none;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 13px;font:700 12px/1 Inter,sans-serif;cursor:pointer;color:var(--ink)}.cc-dbtn:hover{border-color:#C6A035;background:#FBF7EC}.cc-dsoon{font:700 11px/1 Inter,sans-serif;color:#9a9088;border:1px dashed var(--line);border-radius:999px;padding:8px 13px}body{animation:smnDeck .55s ease both}@keyframes smnDeck{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media print{body{animation:none}}.ai-logos{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:0 0 6px}.ai-logos img{width:132px;height:132px;border-radius:20px;border:1px solid #E2CE96;object-fit:contain;padding:14px;background:#fff;box-shadow:0 2px 4px rgba(43,33,10,.05),0 18px 44px -22px rgba(126,96,24,.35)}.ai-logos[hidden]{display:none}.ai-logos-k{text-align:center;font:800 10.5px/1 Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#7E6018;margin:0 0 10px}.ai-logos-n{text-align:center;font:500 12px/1.5 Inter,sans-serif;color:#8A8069;margin:6px 0 14px}.story-handles,.story-tag{display:none}#brStory .story-handles{display:block;text-align:center;margin:14px auto 0;font:600 14.5px/1.9 Inter,-apple-system,sans-serif;color:#3E3A32;max-width:64ch}#brStory .story-handles b{color:#7E6018;font-weight:800}#brStory .story-tag{display:block;text-align:center;font:italic 500 clamp(19px,3vw,24px)/1.45 Georgia,serif;color:#5C5340;margin:16px auto 4px;max-width:56ch}#brStory .ai-logos img:not(:first-child){display:none}#brStory .ai-logos-k,#brStory .ai-logos-n{display:none}#brStory .why{display:none}.cinFoot{background:#fff;border-top:1px solid var(--gold-line,#ECE7DB);margin-top:6px}.cinFoot .in{max-width:1180px;margin:0 auto;padding:clamp(48px,6vw,64px) 24px 34px}.footGrid{display:grid;grid-template-columns:1.5fr repeat(4,1fr);gap:34px}.footGrid p{font:500 14.5px/1.65 var(--sans);color:var(--ink2);max-width:34ch;margin:12px 0 0}.footGrid b{display:block;font:800 12.5px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--ink);margin-bottom:14px}.footGrid a{display:block;font:500 14.5px/1.5 var(--sans);color:var(--ink2);padding:5px 0;transition:color .15s}.footGrid a:hover{color:var(--gold-deep)}.footFine{margin-top:44px;padding-top:26px;border-top:1px solid var(--line);font:500 12.5px/1.85 var(--sans);color:var(--ink3);max-width:88ch;margin-left:auto;margin-right:auto;text-align:center!important}.footFine .patent{font-weight:700;color:var(--ink2)}.cinFoot .footGrid a{padding:9px 0}.card-cine{margin:-2px -2px 16px;border-radius:14px 14px 0 0;overflow:hidden;max-height:none}.card-cine img{width:100%;height:auto;display:block}/* CO-47 (Founder): Brand Identity Strategies stands alone in gold \u2014 no capsule, flush to the top, photo immediately beneath. Desktop AND mobile. */.hero{background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:2px 0 0!important;margin:0!important}.hero h1{margin:0 auto!important}main.shell,.shell{padding-top:0!important}.hero+.section{margin-top:0!important}.hero+.section .section-head{display:none!important}.name-grid{margin-top:6px!important}.name-card .actions{display:flex!important;flex-wrap:nowrap!important;justify-content:center!important;width:100%!important;max-width:560px!important}.name-card .actions .btn{flex:1 1 0!important;min-width:0!important;white-space:nowrap!important}/* CO-CARDROW LAW (Founder, 2026-07-12): Open Brand / Download / Favorite / Delete ride ONE centered line on EVERY card, regardless of count. */ /* CO-60 CAPSULE LAW (Founder, 2026-07-13, rev2): much smaller action capsules, nudged a little lower under the tagline — every brand, all future reports. */ .name-card .why{min-height:0!important;margin-top:8px!important} .name-card .story-tag{margin-bottom:6px!important} .name-card .actions{margin-top:20px!important} .name-card .actions .btn{padding:6px 12px!important;font-size:11.5px!important;min-height:0!important;line-height:1.1!important}</style>';
  var shareHide = share ? '<style>.keep,.hide-btn,.cmp-bar,#refineBtn,.refine,.restorebar{display:none!important}</style>' : "";

  /* CO-HUBPOLISH (Founder, 2026-07-13): color law on the PAGE SHELL ONLY — near-black
     stage #0A0A0A, gold lettering #141414, Button Gold #141414 with white lettering,
     Playfair + Inter, centered. The name cards and everything inside them keep their
     current light design untouched; these rules dress page-level wrappers only. */
  var SHELLCSS = '<style>'
    +'html{background:#0A0A0A;color:#FFFFFF}'
    +'body{background:#0A0A0A!important;color:#FFFFFF}'
    /* light surfaces (the cards and sheets) keep their own dark ink — never inherit the stage's white */
    +'.card,.name-card,.cmp-sheet,.shr-sheet,.brand-sheet,.cc-dcard,.strategy-item,.score-box,.idea-card{color:#1d1d1f}'
    /* header joins the stage */
    +'.topbar{background:#0A0A0A!important;border-bottom:1px solid rgba(191,155,60,.28)!important;backdrop-filter:none!important;color:#FFFFFF}'
    +'.topbar .logo{color:#141414!important}'
    +'.topbar .logo span{color:#141414!important}'
    +'.topbar .logo-mark{background:transparent!important;color:#141414!important}'
    +'.topbar .btn,.return-studio{background:#141414!important;color:#FFFFFF!important;border:0!important}'
    +'.return-studio:hover{background:#7E6018!important;color:#FFFFFF}'
    +'.topbar .btn.secondary{background:transparent!important;color:#141414!important;border:1.5px solid rgba(255,255,255,.32)!important}'
    +'.topbar .btn.secondary:hover{border-color:#141414!important;background:transparent!important}'
    /* hero / heading area */
    +'.hero h1{color:#141414!important}'
    +'.section-head .kicker{color:#141414}'
    +'.section-head h2{color:#141414}'
    +'.section-head .lead{color:#404040}'
    /* page-level wrappers below the cards */
    +'.refine{background:transparent!important;border:0!important}'
    +'.refine h2{color:#141414}'
    +'.refine .lead{color:#404040}'
    +'.restorebar{background:#111111!important;border:1px solid rgba(191,155,60,.28)!important;color:rgba(255,255,255,.8)!important;justify-content:center}'
    +'.restorebar-l{color:#141414!important}'
    +'.restorebar .btn{background:#141414!important;color:#FFFFFF!important;border:0!important}'
    +'.res-cta{background:#111111!important;border:1px solid rgba(191,155,60,.28)!important;color:#FFFFFF}'
    +'.res-cta-h{color:#141414!important}'
    +'.res-cta-s{color:#404040}'
    +'.res-cta-btn{background:#141414!important;color:#FFFFFF!important}'
    +'#smnLegalBlock p{color:#404040}'
    /* story-mode page furniture (never the card itself) */
    +'.br-close{background:#111111!important;border-color:rgba(191,155,60,.28)!important;box-shadow:none!important;color:#FFFFFF}'
    +'.br-close .bx{color:#141414!important}'
    +'.br-close p{color:#404040}'
    +'.br-close .br-btn:not(.gold){background:transparent;border:1.5px solid rgba(255,255,255,.3);color:#141414}'
    +'.br-storyk,.br-gallery-k,.cc-group-k{color:#404040}'
    +'.br-gallery-lead{color:#404040}'
    +'.br-nav{background:transparent!important}'
    +'.cc-tabs{background:rgba(10,10,10,.94)!important;border-bottom-color:rgba(191,155,60,.28)!important;color:#FFFFFF}'
    /* "More things you can do" — one tidy, centered shelf */
    +'.more-sec{text-align:center;max-width:820px;margin:44px auto 0;padding:0 8px}'
    +'.more-h{font-family:\'Playfair Display\',Georgia,serif;font-weight:700;font-size:clamp(26px,3.6vw,36px);color:#141414;margin:0 0 6px;letter-spacing:-.01em}'
    +'.more-p{color:#404040;font-size:15.5px;margin:0 auto 8px;max-width:56ch}'
    +'.more-item{margin:22px auto 0}'
    +'.more-note{font:600 13px/1.5 Inter,-apple-system,sans-serif;color:#404040;margin-top:10px}'
    +'.fine-h{font:800 12px/1 Inter,-apple-system,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#404040;margin:44px auto 12px;text-align:center}'
    /* print stays paper-white */
    +'@media print{html,body{background:#fff!important;color:#111!important}}'
  +'</style>';

  var heroCine=''; try{ if(_hu){ heroCine='<div class="hero-cine"><img src="'+esc(_hu)+'" alt="" loading="eager"></div>'; } }catch(e){ heroCine=''; }
  return '<!doctype html><html lang="en"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width, initial-scale=1">'+
    '<meta name="robots" content="noindex,follow">'+
    '<title>Your Brand \u2014 SparkMyName\u2122</title>'+
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'+
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap" rel="stylesheet">'+
    '<style>'+CALMCSS+'</style>'+'<style>.name-card>.name-top,.name-card>.name-title,.name-card>.domain,.name-card>.story-handles,.name-card>.story-tag,.name-card>.why{text-align:center!important}.name-card .story-handles{justify-content:center!important;flex-wrap:wrap}.name-card .ai-logos{justify-content:center!important;text-align:center!important}</style>'+EXTRACSS+SHELLCSS+shareHide+
    '</head><body>'+
    '<header class="topbar"><nav class="nav">'+
      '<a class="logo" href="/account.html" style="font-size:24px;font-weight:900;letter-spacing:-.02em"><span class="logo-mark" style="font-size:24px">\u2726</span>Spark<span>MyName</span>\u2122</a>'+
      '<div class="nav-actions">'+
        /* CO-HUBPOLISH (Founder, 2026-07-13): back to wherever the customer came from; /account.html only when there is no history. */
        '<a class="btn return-studio" href="/account.html" onclick="if(history.length>1){history.back();return false}">← Back</a>'+
        '<button class="btn secondary" type="button" id="printAllBtn">Save or print</button>'+
        '<button class="btn secondary" type="button" id="shareReport">Share</button>'+
      '</div></nav></header>'+
    '<main class="shell">'+
      '<section class="hero" style="padding:2px 0 0">'+'<h1 style="font-family:\'Playfair Display\',Georgia,serif;font-weight:800;font-size:clamp(38px,6vw,62px);line-height:1.02;letter-spacing:-.022em;color:#141414;margin:0 auto;text-align:center;width:100%;display:block">Your Brand — everything we made for you</h1>'+/* CO-26 (Founder): the standalone page hero is retired — the only images below the title are the brands' own. */
      '</section>'+
      ''+
      '<section class="section" id="namesSec" style="margin-top:18px">'+(share?"":'<div class="pick-banner" id="pickBanner" style="display:'+(_chosenM?'block':'none')+'">'+'<div class="pb-eyebrow">\u2605 This is your favorite name</div>'+'<div class="pb-name" id="pickName">'+(_chosenM?esc(_chosenM.name):'')+'</div>'+'<div class="pb-dom" id="pickDom">'+((_chosenM&&_chosenM.domain)?esc(_chosenM.domain):'')+'</div>'+'<div class="pb-next"><span class="pb-next-l">What you can do next</span>'+'<button class="pb-link" type="button" id="pickOpen">See the full brand</button>'+'<button class="pb-link" type="button" id="pickSheet">Get your brand sheet</button>'+'<button class="pb-link" type="button" id="pickShare">Share your pick</button>'+/* SHEETFIX (2026-07-13, Founder): "Get your domain" button REMOVED from the banner \u2014 four plain actions max, no outbound registrar detour at the moment of celebration. */'<button class="pb-link" type="button" id="pickResources">Ways to launch</button>'+'</div></div>')+(share?"":'<div class="cmp-bar" id="cmpBar" style="display:none"><span class="cmp-bar-l">\u2665 Your saved names \u2014 look again or share them.</span><span class="cmp-bar-btns"><button class="btn" id="cmpOpen" type="button">See saved together (0)</button><button class="btn secondary" id="shrOpen" type="button">Share these</button></span></div>')+
        cardsRendered+'</section>'+
      /* CO-HUBPOLISH (Founder, 2026-07-13): everything below the cards rides ONE tidy,
         centered, plainly-labeled shelf. Every function is preserved — same ids, same
         handlers — just grouped and labeled so a first-time customer can't get lost. */
      (share?"":('<section class="section more-sec" id="moreSec" style="margin-top:34px;padding-top:0">'
        +'<div class="more-h">More things you can do</div>'
        +'<p class="more-p">Your brands above are finished and saved. Everything here is extra &mdash; use it only if you want to.</p>'
        +'<div class="more-item"><div class="refine" id="refineBox" style="text-align:center;background:none;border:0;box-shadow:none;padding:0;margin:0"><div class="actions" style="justify-content:center"><button class="btn secondary" type="button" id="refineBtn" style="background:#141414;border:0;color:#fff;font:900 17px/1 Inter,-apple-system,sans-serif;color:#FFFFFF;padding:21px 45px;border-radius:999px;min-width:min(420px,86vw);box-shadow:0 1px 2px rgba(102,76,15,.35),0 14px 30px -12px rgba(150,114,31,.55)">Make me more brands to pick from</button></div></div><div class="more-note">Want more ideas? We&rsquo;ll build another set and add them to this page for you.</div></div>'
        +'<div class="more-item"><div class="restorebar" id="restorebar" style="display:none"><span class="restorebar-l">Names you hid &mdash; tap one to bring it back:</span></div></div>'
        +'</section>'))+
    '</main>'+
    (share?"":'<div class="cmp-modal" id="cmpModal" style="display:none"><div class="cmp-sheet"><div class="cmp-head"><h3>Your saved names, side by side</h3><button class="btn ghost" id="cmpClose" type="button">Close</button></div><div class="cmp-body" id="cmpBody"></div></div></div>')+(share?"":'<div class="shr-modal" id="shrModal" style="display:none"><div class="shr-sheet"><div class="shr-head"><h3>Send your saved names</h3><button class="btn ghost" id="shrClose" type="button">Close</button></div><div class="shr-body"><p class="shr-sub">Sending your <b><span id="shrCount">0</span> saved names</b> \u2014 share them with a partner, your designer, or a friend.</p><label class="shr-l">Your name<input id="shrFrom" type="text" placeholder="e.g. Don Stevens"></label><label class="shr-l">Send to (emails, separated by commas)<input id="shrTo" type="text" placeholder="alex@studio.com, sam@firm.com"></label><label class="shr-l">Add a note (optional)<textarea id="shrNote" rows="3" placeholder="Take a look at these\u2026"></textarea></label><div class="shr-acts"><button class="btn" id="shrEmail" type="button">Send email</button><button class="btn secondary" id="shrPdf" type="button">Download PDF</button><button class="btn secondary" id="shrWord" type="button">Download Word</button></div><div id="shrMsg" class="shr-msg"></div></div></div></div>')+(share?"":'<div class="sheet-modal" id="sheetModal" style="display:none">'+'<div class="sheet-bar"><div class="sheet-bar-l">Your brand sheet</div><div class="sheet-bar-acts"><button class="btn" id="sheetPrint" type="button" style="background:#A8802A;color:#fff;border:0">Download PDF</button><button class="btn" id="sheetClose" type="button" style="background:#fff;color:#221C12;border:0;font-weight:800">✕ Close</button></div></div>'+'<div class="sheet-scroll"><div class="brand-sheet" id="brandSheet"><div class="bs-inner" id="brandSheetBody"></div></div></div>'+'</div>')+(share?"":'<div class="res-cta" style="display:none"><div class="res-cta-l"><div class="res-cta-h">Ready to launch your brand?</div><div class="res-cta-s">Forming the company, claiming your domain, getting online \u2014 here are the tools founders actually use to go from a name to open for business.</div></div><a class="res-cta-btn" href="/resources.html" target="_blank" rel="noopener">Open the launch toolkit \u2192</a></div>')+'<div class="fine-h">The fine print &mdash; please read</div><div id="smnLegalBlock" style="margin:4px auto 28px;text-align:center;max-width:70ch;padding:0 18px"><p style="font:450 13px/1.7 Inter,-apple-system,sans-serif;color:#2E2A22;margin:0 0 10px">SparkMyName\u2122 is a Creative Branding Agency and we generate brandable names and check domain availability at the moment we create and deliver your Brand Identity Strategies report. Social usernames are recommendations only — we do not check, verify, or guarantee their availability. We are not a law firm, trademark service, domain registrar, or financial advisor. Always conduct full trademark searches and business searches prior to any use. You should consult an licensed attorney \u2014 before you register or use any name.</p><p style="font:450 13px/1.7 Inter,-apple-system,sans-serif;color:#2E2A22;margin:0 0 6px">Brand concepts are provided for informational purposes only and are not legal, trademark, business-formation, or domain-registration advice.</p></div>'+'<footer class="smnFooter" style="background:#0A0A0A"><style>.smnFooter{background:#0A0A0A;color:#FFFFFF;font-family:Inter,-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Arial,sans-serif;padding:44px 22px 46px;text-align:center}.smnFooter .smnFmark{font-weight:900;font-size:22px;letter-spacing:-.02em;text-decoration:none;display:inline-block}.smnFooter .smnFmark .fs{color:#141414}.smnFooter .smnFmark .fn{color:#141414}.smnFooter .smnFmark .fk{color:#141414;margin-left:2px}.smnFooter nav{margin:16px auto 12px;display:flex;flex-wrap:wrap;gap:2px 24px;justify-content:center;max-width:900px}.smnFooter nav a{color:#404040;text-decoration:none;font-size:14px;font-weight:600;min-height:44px;display:inline-flex;align-items:center}.smnFooter nav a:hover{color:#141414}.smnFooter .smnFine{max-width:78ch;margin:0 auto;color:#404040;font-size:14px;line-height:1.7}.smnFooter .smnFine .fpt{color:#404040;font-weight:700}.smnFooter .smnFine a{color:#404040}</style><a class="smnFmark" href="/index.html"><span class="fs">Spark</span><span class="fn">MyName</span><span class="fk">&#10022;</span></a><nav><a href="/support.html">Support</a><a href="/account.html">Log in</a><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/cookies.html">Cookies</a><a href="/refund.html">Refund</a><a href="/accessibility.html">Accessibility</a><a href="/security.html">Security</a><a href="/press.html">Press</a></nav><p class="smnFine">Names, domains, colors, and brand materials are AI-generated suggestions for informational purposes only, and are not legal, trademark, tax, financial, or domain-registration advice. Domain availability is checked when your work is created and can change. See <a href="/terms.html">Terms of Service</a> for details.<br>You own your brand by registering the domain and securing your rights. SparkMyName does not provide trademark clearance or legal advice &mdash; always run your own trademark check before using any name.<br>&copy; 2026 SparkMyName&trade; &middot; VORREX IGNITE LLC &middot; <span class="fpt">U.S. Patent Pending (App. 19/704,386)</span></p></footer>'+
    SHEETDATA+
    CALMJS+
  '<script>(function(){try{var R=(new URLSearchParams(location.search)).get(\'r\')||\'\';if(!R)return;var asked={};function want(card){try{if(!card)return;var nm=card.getAttribute(\'data-brand-name\');if(!nm||asked[nm])return;asked[nm]=1;var slot=card.querySelector(\'[data-ai-logos]\');if(slot&&slot.children.length)return;fetch(\'/.netlify/functions/logo-concepts\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({r:R,name:nm,trigger:\'intent\'})}).then(function(x){return x.json()}).then(function(d){if(!d||!d.ok||!d.logos||!d.logos.length||!slot)return;slot.innerHTML=d.logos.map(function(u){return \'<img src=\"\'+u+\'\" alt=\"AI logo concept\" loading=\"lazy\">\';}).join(\'\');slot.hidden=false;}).catch(function(){});}catch(e){}}document.addEventListener(\'click\',function(e){try{var t=e.target.closest?e.target.closest(\'.btn[data-open],.choose-btn,.keep-btn,[data-keep],[data-fav]\'):null;if(!t)return;var card=t.closest?t.closest(\'.name-card\'):null;want(card);}catch(err){}},true);}catch(e){}})();</script><script>(function(){try{try{history.scrollRestoration="manual";}catch(e){}window.scrollTo(0,0);requestAnimationFrame(function(){window.scrollTo(0,0);});var shell=document.querySelector(".shell");if(!shell)return;var sections=[].slice.call(shell.querySelectorAll(":scope > .section"));if(!sections.length)return;function kick(sec){var k=sec.querySelector(".kicker");return k?k.textContent.trim().toLowerCase():"";}var strat=null,names=document.getElementById("namesSec");sections.forEach(function(sec){var k=kick(sec);if(k.indexOf("strategy")>-1&&!strat)strat=sec;else if(!names&&k.indexOf("name")>-1)names=sec;});if(!names)return;/* ---- THE STORY: the presented brand, expanded inline. One continuous scroll. ---- */var story=document.createElement("div");story.id="brStory";names.parentNode.insertBefore(story,names);if(strat&&strat.previousSibling!==story){names.parentNode.insertBefore(strat,names);}/* retitle the gallery */try{/* CO-6: the six boxes ARE the main event \u2014 server title stands */if(strat){var sk=strat.querySelector(".kicker");if(sk)sk.textContent="Why this brand works";var sl=strat.querySelector(".section-head .lead");if(sl)sl.textContent="Who it\u2019s for, the feeling it creates, and why it works in the real world.";};}catch(e){}/* ---- Launch Kit section ---- */var deliv=document.createElement("div");deliv.className="section";deliv.style.display="none";deliv.innerHTML="<div class=\\"section-head\\"><div class=\\"kicker\\">Downloads</div></div><div id=\\"ccDeliv\\"></div>";names.parentNode.insertBefore(deliv,names);try{var rc0=document.querySelector(".res-cta");if(rc0)names.parentNode.insertBefore(rc0,deliv);}catch(e){}/* ---- closing ---- */var closing=document.createElement("div");closing.className="br-close";closing.style.display="none";closing.innerHTML="<div class=\\"bx\\">You have everything you need to launch.</div><p>Your brand lives here forever. Come back any time, from any device \\u2014 it will be exactly as you left it.</p><div class=\\"br-actions\\"></div>";names.parentNode.insertBefore(closing,names.nextSibling);/* ---- promote/demote: opening a concept swaps the story, never a drawer ---- */function cards(){return [].slice.call(document.querySelectorAll(".name-card"));}function storyCard(){return story.querySelector(".name-card");}function grid(){return names.querySelector(".name-grid")||names.querySelector(".names")||(names.querySelector(".name-card")?names.querySelector(".name-card").parentNode:names);}function promote(card,scroll){try{  var cur=storyCard();  if(cur===card)return;  if(cur){cur.classList.remove("open");var g=grid();g.insertBefore(cur,g.firstChild);}  story.appendChild(card);card.classList.add("open");try{names.style.display="none";var rfx=document.getElementById("refineBox");if(rfx&&rfx.closest("section"))rfx.closest("section").style.display="none";var lgx=document.getElementById("smnLegalBlock");if(lgx)lgx.style.display="none";if(!document.getElementById("backAllTop")){var mk=function(id){var b=document.createElement("button");b.type="button";b.id=id;b.className="br-btn gold";b.style.cssText="display:block;margin:16px auto 8px;font-size:16px;padding:17px 30px;color:#fff";b.textContent="← See all your brands";b.onclick=function(){smnBackAll();};return b;};story.parentNode.insertBefore(mk("backAllTop"),story);closing.appendChild(mk("backAllBottom"));}document.getElementById("backAllTop").style.display="none";window.smnBackAll=function(){try{var cur=storyCard();if(cur){cur.classList.remove("open");var g=grid();g.insertBefore(cur,g.firstChild);}var hpi2=document.querySelector(".hero-cine img");if(hpi2&&hpi2.getAttribute("data-master"))hpi2.src=hpi2.getAttribute("data-master");names.style.display="";if(rfx&&rfx.closest("section"))rfx.closest("section").style.display="";if(lgx)lgx.style.display="";deliv.style.display="none";closing.style.display="none";var rc2=document.querySelector(".res-cta");if(rc2)rc2.style.display="none";var bt=document.getElementById("backAllTop");if(bt)bt.style.display="none";try{names.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){window.scrollTo(0,0);}}catch(e){}};}catch(e){}try{var hpi=document.querySelector(".hero-cine img");if(hpi){if(!hpi.getAttribute("data-master"))hpi.setAttribute("data-master",hpi.src);var hv=card.getAttribute("data-hero");if(hv)hpi.src=hv;}}catch(e){}try{var hnd=card.querySelector(".story-handles");if(hnd&&!card.querySelector(".br-one-acts")){var oa=document.createElement("div");oa.className="br-actions br-one-acts";oa.style.cssText="justify-content:center;margin:16px 0 2px";[["Download",function(){if(typeof gated==="function")gated(function(){window.print();});else window.print();}],["♡ Save",function(){var k=card.querySelector("[data-keep]");if(k)k.click();}],["Hide",function(){var hbtn=card.querySelector("[data-hide]");if(hbtn)hbtn.click();}]].forEach(function(p){var b=document.createElement("button");b.type="button";b.className="br-btn gold";b.textContent=p[0];b.onclick=p[1];oa.appendChild(b);});hnd.parentNode.insertBefore(oa,hnd.nextSibling);var tg2=card.querySelector(".story-tag");if(tg2)oa.parentNode.insertBefore(tg2,oa.nextSibling);}}catch(e){}deliv.style.display="block";closing.style.display="block";var rc=document.querySelector(".res-cta");if(rc)rc.style.display="flex";  if(scroll!==false){setTimeout(function(){try{story.scrollIntoView({behavior:"smooth",block:"start"});}catch(e){window.scrollTo(0,story.offsetTop-70);}},60);}}catch(e){}}/* CO-3.2 (Founder): no auto-open \u2014 six closed boxes; the customer chooses. */window.scrollTo(0,0);try{var pab=document.getElementById("printAllBtn");if(pab)pab.onclick=function(){document.body.classList.add("print-all");setTimeout(function(){window.print();setTimeout(function(){document.body.classList.remove("print-all");},400);},30);};}catch(e){}document.addEventListener("click",function(e){var k=e.target.closest?e.target.closest("[data-keep]"):null;if(!k)return;setTimeout(function(){var card=k.closest(".name-card");if(!card)return;var g=card.parentNode;if(!g||!/name-grid/.test(g.className||""))return;if(card.classList.contains("is-kept")){if(!card.getAttribute("data-saved-at"))card.setAttribute("data-saved-at",String(Date.now()));var kept=[].slice.call(g.querySelectorAll(".name-card.is-kept")).sort(function(a,b){return (+a.getAttribute("data-saved-at")||0)-(+b.getAttribute("data-saved-at")||0);});kept.reverse().forEach(function(c){g.insertBefore(c,g.firstChild);});}else{card.removeAttribute("data-saved-at");}},10);},true);/* gallery opens promote instead of any old behavior */document.addEventListener("click",function(e){var dt=e.target.closest?e.target.closest("[data-dlcard]"):null;if(dt){var dc=dt.closest(".name-card");if(dc){e.preventDefault();e.stopPropagation();if(dc!==storyCard())promote(dc,false);setTimeout(function(){if(typeof gated==="function")gated(function(){window.print();});else window.print();},250);}return;}  var t=e.target.closest?e.target.closest("[data-open]"):null;if(!t)return;  var card=t.closest(".name-card");if(!card)return;  e.preventDefault();e.stopPropagation();  if(card!==storyCard())promote(card,true);},true);document.addEventListener("click",function(e){var t=e.target.closest?e.target.closest(".choose-btn"):null;if(!t)return;var card=t.closest(".name-card");if(card&&card!==storyCard())setTimeout(function(){promote(card,true);},350);},true);/* ---- shortcuts: Name / Look / Words / Launch \\u2014 scroll only, never pages ---- */function blockEl(startsWith){var c=storyCard();if(!c)return null;var tgt=null;  [].slice.call(c.querySelectorAll(".detail-panel *")).some(function(el){var tx=(el.textContent||"").trim().toLowerCase();if(el.children.length<3&&startsWith.some(function(p){return tx.indexOf(p)===0;})){tgt=el;return true;}return false;});  return tgt;}function jump(el){if(!el)return;try{el.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}}function buildNav(){}/* ---- top actions: human words, one gold ---- */function noteMsg(m){var n=document.createElement("div");n.textContent=m;n.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#171410;color:#fff;font:700 13px/1 Inter,sans-serif;padding:12px 20px;border-radius:999px;z-index:99999";document.body.appendChild(n);setTimeout(function(){n.remove();},2000);}function doShare(){try{if(typeof shareReport==="function"){shareReport();return;}}catch(e){}  try{navigator.clipboard.writeText(location.href);noteMsg("Link copied \\u2014 send it to anyone.");}catch(e){noteMsg("Copy the address bar link to share.");}}var acts2=closing.querySelector(".br-actions");[["Download everything",true,function(){window.print();}],["Share this brand",false,doShare],["Print / PDF",false,function(){window.print();}]] .forEach(function(p){var b=document.createElement("button");b.type="button";b.className="br-btn"+(p[1]?" gold":"");b.textContent=p[0];b.onclick=p[2];acts2.appendChild(b);});/* ---- Launch Kit tiles ---- */function openIn(block){var el=blockEl([block]);if(el)jump(el);else jump(story);}function copyBlock(block,label){var c=storyCard();if(!c)return;var txt="";  [].slice.call(c.querySelectorAll(".detail-panel *")).some(function(el){var tx=(el.textContent||"").trim().toLowerCase();if(el.children.length<3&&tx.indexOf(block)===0){txt=((el.parentNode&&el.parentNode.innerText)||"").trim();return true;}return false;});  if(txt){try{navigator.clipboard.writeText(txt);noteMsg(label+" copied");}catch(e){noteMsg("Select and copy from your brand above");}}}function gated(fn){fn();} /* LEGAL GATE CLEARED by Founder\u2019s counsel, 2026-07-06 \u2014 site disclaimers govern; no acknowledgment popup. */ function copyBlockTxt(block){var c=storyCard();if(!c)return "";var txt="";[].slice.call(c.querySelectorAll(".detail-panel *")).some(function(el){var tx=(el.textContent||"").trim().toLowerCase();if(el.children.length<3&&tx.indexOf(block)===0){txt=((el.parentNode&&el.parentNode.innerText)||"").trim();return true;}return false;});return txt;} function dlText(txt,label){try{var bl=new Blob([txt],{type:\"text/plain\"});var a=document.createElement(\"a\");a.href=URL.createObjectURL(bl);a.download=label.replace(/\\s+/g,\"-\")+\".txt\";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);noteMsg(label+\" downloaded.\");}catch(e){try{navigator.clipboard.writeText(txt);noteMsg(label+\" copied.\");}catch(_){}}} function dlCopy(block,label){var t=copyBlockTxt(block);if(t){dlText(t,label);} else noteMsg("Open a brand first.");} function dlLogos(){var c=storyCard();var ims=c?[].slice.call(c.querySelectorAll(".ai-logos img")):[];if(!ims.length){noteMsg("Logos are still being drawn \u2014 check back shortly.");return;}ims.forEach(function(im,ix){var a=document.createElement("a");a.href=im.src;a.download="logo-"+(ix+1)+".png";a.target="_blank";document.body.appendChild(a);a.click();a.remove();});noteMsg("Logo files opening \u2014 save each one.");} function _img(u,cb){var im=new Image();im.crossOrigin=\"anonymous\";im.onload=function(){cb(im);};im.onerror=function(){noteMsg(\"Image blocked \"+String.fromCharCode(8212)+\" opening it instead.\");window.open(u,\"_blank\");};im.src=u;} function _dlCanvas(cv,fn){try{cv.toBlob(function(bl){var a=document.createElement(\"a\");a.href=URL.createObjectURL(bl);a.download=fn;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);noteMsg(fn+\" downloaded.\");},\"image/png\");}catch(e){noteMsg(\"Save blocked by the browser \"+String.fromCharCode(8212)+\" try Print instead.\");}} function _mark(){var c=storyCard();var im=c?c.querySelector(\".ai-logos img\"):null;return im?im.src:null;} function _scene(){var c=storyCard();var h=c?c.getAttribute(\"data-hero\"):null;if(h)return h;var hp=document.querySelector(\".hero-cine img\");return hp?hp.src:null;} function dlDark(){var u=_mark();if(!u){noteMsg(\"Open a brand first.\");return;}_img(u,function(im){var cv=document.createElement(\"canvas\");cv.width=1024;cv.height=1024;var x=cv.getContext(\"2d\");x.fillStyle=\"#0D2244\";x.fillRect(0,0,1024,1024);var s=Math.min(820/im.width,820/im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,(1024-w)/2,(1024-h)/2,w,h);_dlCanvas(cv,\"logo-dark-background.png\");});} function dlAvatar(){var u=_mark();if(!u){noteMsg(\"Open a brand first.\");return;}_img(u,function(im){var cv=document.createElement(\"canvas\");cv.width=512;cv.height=512;var x=cv.getContext(\"2d\");x.fillStyle=\"#FFFFFF\";x.fillRect(0,0,512,512);var m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,26,26,460,460);_dlCanvas(cv,\"profile-symbol-512.png\");});} function dlCover(){var u=_scene();if(!u){noteMsg(\"Open a brand first.\");return;}_img(u,function(im){var cv=document.createElement(\"canvas\");cv.width=1500;cv.height=500;var x=cv.getContext(\"2d\");var s=Math.max(1500/im.width,500/im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,(1500-w)/2,(500-h)/2,w,h);_dlCanvas(cv,\"social-cover-1500x500.png\");});} function dlHero(){var u=_scene();if(!u){noteMsg(\"Open a brand first.\");return;}var a=document.createElement(\"a\");a.href=u;a.download=\"website-hero.png\";a.target=\"_blank\";document.body.appendChild(a);a.click();a.remove();noteMsg(\"Website hero opening \"+String.fromCharCode(8212)+\" save it.\");} function _bname(){var c=storyCard();var t=c?c.querySelector(\".name-title\"):null;return t?t.textContent.trim():\"Your brand\";} function _btag(){var t=copyBlockTxt(\"tagline\");t=(t||\"\").split(String.fromCharCode(10)).filter(Boolean);return (t[1]||t[0]||\"\").replace(/^tagline.*$/i,\"\").trim()||\"Built to launch.\";} function dlSizes(){var u=_mark();if(!u){noteMsg(\"Open a brand first.\");return;}_img(u,function(im){[256,512,1024,2048].forEach(function(sz,ix){setTimeout(function(){var cv=document.createElement(\"canvas\");cv.width=sz;cv.height=sz;var x=cv.getContext(\"2d\");x.fillStyle=\"#FFFFFF\";x.fillRect(0,0,sz,sz);var s=Math.min(sz*.92/im.width,sz*.92/im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,(sz-w)/2,(sz-h)/2,w,h);_dlCanvas(cv,\"logo-\"+sz+\"px.png\");},ix*450);});});} function dlFavs(){var u=_mark();if(!u){noteMsg(\"Open a brand first.\");return;}_img(u,function(im){[16,32,48,180].forEach(function(sz,ix){setTimeout(function(){var cv=document.createElement(\"canvas\");cv.width=sz;cv.height=sz;var x=cv.getContext(\"2d\");var m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,sz,sz);_dlCanvas(cv,\"favicon-\"+sz+\".png\");},ix*450);});});} function dlLockup(){var u=_mark();if(!u){noteMsg(\"Open a brand first.\");return;}_img(u,function(im){var cv=document.createElement(\"canvas\");cv.width=1600;cv.height=480;var x=cv.getContext(\"2d\");x.fillStyle=\"#FFFFFF\";x.fillRect(0,0,1600,480);var s=380/Math.max(im.width,im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,60,(480-h)/2,w,h);x.fillStyle=\"#171410\";x.font=\"700 96px Georgia,serif\";x.textBaseline=\"middle\";x.fillText(_bname(),60+w+56,240,1600-(60+w+56)-60);x.fillStyle=\"#A8802A\";x.fillRect(60+w+56,312,220,6);_dlCanvas(cv,\"lockup-horizontal.png\");});} function _banner(W,H,fn){var u=_scene();if(!u){noteMsg(\"Open a brand first.\");return;}_img(u,function(im){var cv=document.createElement(\"canvas\");cv.width=W;cv.height=H;var x=cv.getContext(\"2d\");var s=Math.max(W/im.width,H/im.height);var w=im.width*s,h=im.height*s;x.drawImage(im,(W-w)/2,(H-h)/2,w,h);var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,\"rgba(13,20,34,.22)\");g.addColorStop(1,\"rgba(13,20,34,.78)\");x.fillStyle=g;x.fillRect(0,0,W,H);var nm=_bname(),tg=_btag();x.fillStyle=\"#FFFFFF\";x.textBaseline=\"alphabetic\";var big=H>=250?Math.round(H*.14):Math.round(H*.34);var sm=Math.max(13,Math.round(big*.44));if(W>H*3){x.font=\"800 \"+big+\"px Georgia,serif\";x.fillText(nm,24,H/2+big*.1,W*.52);x.font=\"500 \"+sm+\"px Arial,sans-serif\";x.fillStyle=\"#F0E6C8\";x.fillText(tg,24+ (W*.54),H/2+sm*.1,W*.42);}else{x.font=\"800 \"+big+\"px Georgia,serif\";x.fillText(nm,22,H-Math.round(H*.20),W-44);x.font=\"500 \"+sm+\"px Arial,sans-serif\";x.fillStyle=\"#F0E6C8\";x.fillText(tg,22,H-Math.round(H*.20)+sm+8,W-44);}x.fillStyle=\"#C6A035\";x.fillRect(0,H-6,W,6);_dlCanvas(cv,fn);});} function dlB1(){_banner(300,250,\"banner-300x250.png\");}function dlB2(){_banner(728,90,\"banner-728x90.png\");}function dlB3(){_banner(160,600,\"banner-160x600.png\");} function dlSite(){var nm=_bname(),tg=_btag();var c=storyCard();var dom=c?(c.querySelector(\".domain\")||{textContent:\"\"}).textContent.replace(/Available/i,\"\").trim():\"\";var bio=copyBlockTxt(\"social\")||\"\";var html=\"<!doctype html><html><head><meta charset=utf-8><meta name=viewport content=\"+String.fromCharCode(39)+\"width=device-width,initial-scale=1\"+String.fromCharCode(39)+\"><title>\"+nm+\"</title><style>body{margin:0;font-family:Georgia,serif;color:#171410}header{background:#0D2244;color:#FFFFFF;padding:72px 24px;text-align:center}h1{font-size:52px;margin:0}.tag{color:#404040;font-style:italic;font-size:22px;margin-top:12px}main{max-width:760px;margin:0 auto;padding:48px 24px;font-family:Arial;line-height:1.7}footer{background:#FAF8F2;border-top:1px solid #ECE7DB;text-align:center;padding:26px;font-family:Arial;font-size:14px;color:#5C5340}.cta{display:inline-block;margin-top:26px;background:#A8802A;color:#141414;padding:15px 30px;border-radius:999px;text-decoration:none;font-family:Arial;font-weight:800}</style></head><body><header><h1>\"+nm+\"</h1><div class=tag>\"+tg+\"</div><a class=cta href=\"+String.fromCharCode(39)+\"#contact\"+String.fromCharCode(39)+\">Get in touch</a></header><main><h2>About us</h2><p>\"+bio.split(String.fromCharCode(10)).slice(1,3).join(\" \")+\"</p><h2 id=contact>Contact</h2><p>\"+dom+\"</p></main><footer>&copy; \"+(new Date().getFullYear())+\" \"+nm+\"</footer></body></html>\";dlText(html,\"website-starter\");} function dlAllAssets(){noteMsg(\"Preparing your full asset kit \"+String.fromCharCode(8212)+\" files will download one by one.\");var seq=[dlLogos,dlDark,dlAvatar,dlHero,dlCover,dlLockup,dlB1,dlB2,dlB3,dlSite,function(){dlCopy(\"tagline\",\"Taglines\");},function(){dlCopy(\"social\",\"Social-bios\");},function(){dlCopy(\"launch\",\"Launch-posts\");},dlHandles,dlSizes,dlFavs];seq.forEach(function(fn,ix){setTimeout(function(){try{fn();}catch(e){}},ix*900);});} function dlHandles(){var c=storyCard();var h=c?c.querySelector(\".story-handles\"):null;if(h){dlText(h.innerText,\"Suggested-handles\");}else noteMsg(\"Open a brand first.\");} function dlVectorGrid(){var c=storyCard();if(!c){noteMsg(\"Open a brand first.\");return;}if(typeof window.dlVector===\"function\"){noteMsg(\"Building your vector logo…\");window.dlVector({closest:function(){return c;}});}else{noteMsg(\"Vector tool couldn’t load — please try again.\");}} var DL=[[\"Main logo\",function(){gated(dlLogos);}],[\"Vector logo (SVG)\",function(){gated(dlVectorGrid);}],[\"Logo \"+String.fromCharCode(8212)+\" dark background\",function(){gated(dlDark);}],[\"Logo size pack (256\"+String.fromCharCode(8211)+\"2048px)\",function(){gated(dlSizes);}],[\"Horizontal lockup\",function(){gated(dlLockup);}],[\"Favicon pack\",function(){gated(dlFavs);}],[\"Profile symbol (square)\",function(){gated(dlAvatar);}],[\"Website hero image\",function(){gated(dlHero);}],[\"Social cover (1500\"+String.fromCharCode(215)+\"500)\",function(){gated(dlCover);}],[\"Web banner 300\"+String.fromCharCode(215)+\"250\",function(){gated(dlB1);}],[\"Web banner 728\"+String.fromCharCode(215)+\"90\",function(){gated(dlB2);}],[\"Web banner 160\"+String.fromCharCode(215)+\"600\",function(){gated(dlB3);}],[\"Website starter page\",function(){gated(dlSite);}],[\"Taglines\",function(){gated(function(){dlCopy(\"tagline\",\"Taglines\");});}],[\"Your fonts\",function(){gated(function(){dlCopy(\"type\",\"Fonts\");});}],[\"Social bios\",function(){gated(function(){dlCopy(\"social\",\"Social-bios\");});}],[\"Launch posts\",function(){gated(function(){dlCopy(\"launch\",\"Launch-posts\");});}],[\"Suggested handles\",function(){gated(dlHandles);}],[\"DOWNLOAD ALL ASSETS\",function(){gated(dlAllAssets);}],[\"Saved in your workspace forever\",function(){location.href=\"account.html\";}]]; var gridEl=document.getElementById("ccDeliv");var gg=document.createElement("div");gg.className="cc-deliv";gridEl.appendChild(gg);DL.forEach(function(it){var d=document.createElement("div");d.className="cc-dcard";d.style.alignItems="center";d.style.textAlign="center";var dn=document.createElement("span");dn.className="cc-dn";dn.textContent=it[0];d.appendChild(dn);var a2=document.createElement("div");a2.className="cc-dacts";a2.style.justifyContent="center";var b=document.createElement("button");b.type="button";b.className="cc-dbtn primary";b.textContent=it[0]==="Saved in your workspace forever"?"Open Workspace":"Download";b.onclick=it[1];a2.appendChild(b);d.appendChild(a2);gg.appendChild(d);}); var row=document.createElement("div");row.className="br-actions";row.style.justifyContent="center";[["Email",function(){gated(function(){location.href="mailto:?subject="+encodeURIComponent("My brand from SparkMyName\u2122")+"&body="+encodeURIComponent(location.href);});}],["Share",doShare],["Print",function(){gated(function(){window.print();});}],["Copy",function(){gated(function(){try{navigator.clipboard.writeText(location.href);noteMsg("Link copied.");}catch(e){}});}]].forEach(function(p){var b=document.createElement("button");b.type="button";b.className="br-btn";b.textContent=p[0];b.onclick=p[1];row.appendChild(b);});gridEl.appendChild(row); try{var incWrap=document.createElement(\"div\");incWrap.style.cssText=\"margin:18px auto 6px;max-width:64ch;text-align:center\";var incK=document.createElement(\"div\");incK.style.cssText=\"font:800 12px/1 Inter,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#7E6018;margin-bottom:10px\";incK.textContent=\"Included with your brand\";var incP=document.createElement(\"p\");incP.style.cssText=\"font:500 14px/1.8 Inter,sans-serif;color:#3E3A32;margin:0\";incP.innerHTML=\"<b>Logos:</b> main, dark-background, size pack, horizontal lockup, favicons &middot; <b>Profiles:</b> square symbol, bios, launch posts, suggested handles &middot; <b>Imagery:</b> 2K hero, social cover, three web banners &middot; <b>Web:</b> starter page, brand sheet PDF &middot; all downloadable above, saved in your workspace forever.\";incWrap.appendChild(incK);incWrap.appendChild(incP);var ba=closing.querySelector(\".br-actions\");if(ba)closing.insertBefore(incWrap,ba);else closing.appendChild(incWrap);}catch(e){} (function(){var gm=document.getElementById("gateModal");if(!gm)return;var cb=document.getElementById("gateCheck");var ok=document.getElementById("gateAgree");var cancel=document.getElementById("gateCancel");if(cb&&ok)cb.onchange=function(){ok.disabled=!cb.checked;};if(cancel)cancel.onclick=function(){gm.style.display="none";};if(ok)ok.onclick=function(){if(cb&&!cb.checked)return;ok.disabled=true;ok.textContent="Recording\u2026";var em="";try{em=localStorage.getItem("smn_email")||"";}catch(e){}var R2="";try{R2=(new URLSearchParams(location.search)).get("r")||"";}catch(e){}fetch("/.netlify/functions/legal-ack",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:em||("report:"+R2),typed_name:em||("report:"+R2),understood:true,agreed:true,version:"report-download-v1",source:"report",r:R2})}).catch(function(){}).then(function(){try{localStorage.setItem(GATE_KEY,new Date().toISOString());}catch(e){}gm.style.display="none";ok.disabled=false;ok.textContent="I Agree and Accept";var fn=gm._pending;gm._pending=null;if(fn)fn();});};})();}catch(e){}})();</script><script>(function(){try{var story=document.getElementById("brStory");/* Preview first: three concepts invite, the rest reveal on request */var grid=document.querySelector(".name-grid");if(grid){var cards=[].slice.call(grid.querySelectorAll(".name-card"));  /* CO-3.2: all six names show \u2014 we sell six, we show six. */}/* Reveal the brand: the best line leads, the rest waits politely */var BEST=/tagline|bio|about|social|launch|handle|slogan/i;function trimLists(scope){[].slice.call(scope.querySelectorAll(".detail-block ul")).forEach(function(ul){  if(ul.getAttribute("data-trim"))return;var lis=[].slice.call(ul.children);  var blk=ul.closest?ul.closest(".detail-block"):null;var h=blk?blk.querySelector("h3"):null;var t=h?h.textContent:"";  var keep=BEST.test(t)?1:4; if(lis.length<=keep+1)return; ul.setAttribute("data-trim","1");  lis.slice(keep).forEach(function(li){li.classList.add("br-more-hide");});  var b=document.createElement("button");b.type="button";b.className="br-showmore";  b.textContent=keep===1?("View "+(lis.length-1)+" more"):("Show all "+lis.length);  ul.parentNode.insertBefore(b,ul.nextSibling);  b.onclick=function(){lis.forEach(function(li){li.classList.remove("br-more-hide");});b.remove();};});}function trimLogos(scope){var lg=scope.querySelector(".ai-logos");if(!lg||lg.getAttribute("data-trim"))return;var im=[].slice.call(lg.querySelectorAll("img"));if(im.length<4)return;lg.setAttribute("data-trim","1");im.slice(3).forEach(function(x){x.classList.add("br-more-hide");});var b=document.createElement("button");b.type="button";b.className="br-showmore";b.textContent="View logo variations";lg.parentNode.insertBefore(b,lg.nextSibling);b.onclick=function(){im.forEach(function(x){x.classList.remove("br-more-hide");});b.remove();};}if(story){trimLists(story);trimLogos(story);try{new MutationObserver(function(){trimLists(story);trimLogos(story);}).observe(story,{childList:true});}catch(e){}}/* Reveal, do not present: sections rise gently as the founder arrives */try{if(!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)&&"IntersectionObserver" in window){  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("br-in");io.unobserve(en.target);}});},{rootMargin:"0px 0px -8% 0px"});  [].slice.call(document.querySelectorAll(".section,.br-close,.cc-dcard,.name-grid .name-card")).forEach(function(el){el.classList.add("br-reveal");io.observe(el);});}}catch(e){}}catch(e){}})();</script></body></html>';
}


// A standalone page for ONE name (used when a customer clicks a single card in the portal).
function buildSingleNamePage(m, opts) {
  opts = opts || {};
  return buildReportPage({ names: [m], seed: opts.seed || '', when: opts.when || '', single: true });
}

module.exports = { buildReportPage: buildReportPage, buildSingleNamePage: buildSingleNamePage, esc: esc, brandLogo: brandLogo, _logoFeel: _logoFeel };
