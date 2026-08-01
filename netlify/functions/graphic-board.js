// graphic-board.js — Graphic Department board renderer (Stage 1)
// Renders the premium, Butcher's-Table-grade identity board from the REAL engine kit.
// Input m = { name, domain, seed, kit:{ whyItWorks[], taglines[], palettes[{name,colors[],note}],
//             fonts[{label,desc}], voice[{label,desc}], bios[], about[], posts[], linkedin[], facebook[] } }
// Pure, self-contained, no deps. Returns an HTML string (the "bottom of the card").

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function hx(h){h=String(h||'').trim();if(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(h))return h.charAt(0)==='#'?h:'#'+h;return '';}
function _rgb(h){h=hx(h).replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c;}).join('');var n=parseInt(h,16);return [ (n>>16)&255,(n>>8)&255,n&255 ];}
function _lum(h){var r=_rgb(h);return 0.2126*r[0]+0.7152*r[1]+0.0722*r[2];}
function _sat(h){var r=_rgb(h).map(function(x){return x/255;});var mx=Math.max.apply(null,r),mn=Math.min.apply(null,r);return mx===0?0:(mx-mn)/mx;}
function _mix(h,t,amt){var a=_rgb(h),b=_rgb(t);return '#'+[0,1,2].map(function(i){var v=Math.round(a[i]+(b[i]-a[i])*amt);return ('0'+v.toString(16)).slice(-2);}).join('');}

function _palette(kit){
  var hexes=[];((kit&&kit.palettes)||[]).forEach(function(p){((p&&p.colors)||[]).forEach(function(c){var v=hx(c);if(v)hexes.push(v);});});
  if(!hexes.length)hexes=['#0B1622','#1E73BE','#3FA7E0','#DCE6F2'];
  var sorted=hexes.slice().sort(function(a,b){return _lum(a)-_lum(b);});
  var ink=sorted[0];
  var accent=hexes.slice().sort(function(a,b){return _sat(b)-_sat(a);})[0]||hexes[0];
  var accent2=hexes.filter(function(c){return c!==accent;}).sort(function(a,b){return _sat(b)-_sat(a);})[0]||accent;
  var paper=_mix(accent,'#ffffff',0.92);
  return {ink:ink,accent:accent,accent2:accent2,paper:paper};
}
function _ini(name){var s=String(name||'').trim();if(!s)return 'B';var w=s.split(/[\s\-_]+/).filter(Boolean);if(w.length===1){var c=w[0].match(/[A-Z][a-z0-9]*/g);if(c&&c.length>=2)return (c[0].charAt(0)+c[1].charAt(0)).toUpperCase();return w[0].slice(0,2).toUpperCase();}return (w[0].charAt(0)+w[1].charAt(0)).toUpperCase();}
function _handle(name,dom){var h=dom?String(dom).split('.')[0]:String(name||'');return h.replace(/[^a-z0-9]/gi,'').toLowerCase();}

function _band(lbl,rt,P){return '<div style="display:flex;align-items:center;gap:14px;margin:30px 0 6px"><span style="background:'+P.ink+';color:#fff;font:800 10px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;letter-spacing:.14em;padding:6px 12px;border-radius:6px">'+lbl+'</span><span style="flex:1;height:1px;background:#dfe3ea"></span><span style="font:800 10px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;letter-spacing:.14em;color:#1a222e">'+rt+'</span></div>';}
function _h(n,t,P){return '<h2 style="font-family:Georgia,\'Times New Roman\',serif;font-size:22px;margin:22px 0 13px;color:'+P.ink+';font-weight:700"><span style="font:800 13px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:'+P.accent+';letter-spacing:.08em;vertical-align:3px;margin-right:10px">'+n+'</span>'+t+'</h2>';}
function _why(arr,P){var li=(arr||[]).map(function(w){return '<li style="list-style:none;position:relative;padding-left:18px;font:600 15px/1.55 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#161e29"><span style="color:'+P.accent+';position:absolute;left:0;top:1px;font-size:10px">\u25C6</span>'+esc(w)+'</li>';}).join('');return '<div style="border:1px solid #e9ecf1;border-radius:14px;padding:18px 20px"><ul style="margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:11px 24px">'+li+'</ul></div>';}
function _tags(arr,P){return (arr||[]).map(function(t){return '<div style="font-family:Georgia,serif;font-style:italic;font-size:16px;color:#161e29;padding:10px 0;border-bottom:1px solid #eef0f4">\u201c'+esc(t)+'\u201d</div>';}).join('');}
function _kv(arr,P){return (arr||[]).map(function(o){var lab=esc(o&&(o.label||o.name)||''),desc=esc(o&&(o.desc||o.description)||'');return '<div style="padding:11px 0;border-bottom:1px solid #eef0f4"><b style="font-family:Georgia,serif;font-size:16px;color:'+P.ink+'">'+lab+'</b>'+(desc?'<span style="display:block;font:700 14px/1.55 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#141b25;margin-top:2px">'+desc+'</span>':'')+'</div>';}).join('');}
function _palettes(pals,P){return (pals||[]).map(function(p){var sw=((p&&p.colors)||[]).map(function(c){var v=hx(c);return v?'<div style="flex:1;border-radius:10px;overflow:hidden;border:1px solid #eceef2"><div style="height:54px;background:'+v+'"></div><div style="padding:6px 7px;font:800 11px/1.2 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:'+P.ink+'">'+v+'</div></div>':'';}).join('');return '<div style="margin:0 0 16px"><div style="font:800 11px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;letter-spacing:.06em;color:'+P.accent+';margin-bottom:8px">'+esc((p&&p.name)||'Palette')+(p&&p.note?' <span style="color:#1a222e;font-weight:700;letter-spacing:0">\u2014 '+esc(p.note)+'</span>':'')+'</div><div style="display:flex;gap:9px">'+sw+'</div></div>';}).join('');}
function _list(arr){return (arr||[]).map(function(s){return '<div style="font:600 15px/1.6 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#161e29;padding:9px 0;border-bottom:1px solid #f1f3f6">'+esc(s)+'</div>';}).join('');}
function _logoRow(name,P){var ini=esc(_ini(name)),nm=esc(name);
  function tile(inner,cap){return '<div><div style="border:1px solid #e9ecf1;border-radius:14px;height:96px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px">'+inner+'</div><span style="display:block;text-align:center;font:700 12px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#1a222e;margin-top:6px">'+cap+'</span></div>';}
  var mk='<div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:800;font-size:15px;';
  return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:13px">'
    +tile(mk+'background:'+P.accent+';color:#fff">'+ini+'</div><div style="font-family:Georgia,serif;font-weight:700;font-size:14px;color:'+P.ink+'">'+nm+'</div>','Primary')
    +tile('<div style="font-family:Georgia,serif;font-weight:700;font-size:14px;color:#fff">'+nm+'</div>','Reversed').replace('height:96px;display','height:96px;background:'+P.ink+';display')
    +tile(mk+'background:'+P.accent2+';color:#fff;width:46px;height:46px;font-size:18px">'+ini+'</div>','Mark')
    +'</div>';
}
function _inprodLine(P,msg){return '<div style="border:1px dashed '+P.accent+';border-radius:14px;padding:18px 16px;text-align:center;font:600 13.5px/1.6 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#2E3A4E">'+msg+'</div>';}
function _spineImgs(urls,alt){return '<table width="100%" cellpadding="0" cellspacing="0"><tr>'+urls.map(function(u,i){return '<td width="'+Math.floor(98/urls.length)+'%" valign="top"><img src="'+esc(u)+'" alt="'+esc(alt)+' '+(i+1)+'" loading="lazy" style="width:100%;border:1px solid #e9ecf1;border-radius:12px;display:block;background:#fff"></td>'+(i<urls.length-1?'<td width="2%">&nbsp;</td>':'');}).join('')+'</tr></table>';}
function _stationery(m,P){
  // REAL BOARDS ONLY (Founder order, 2026-07-05): the art spine's business card and
  // letterhead render when they exist on the Shelf; one honest line until then.
  var ad=(m.kit&&m.kit.artDept)||{};
  var urls=[].concat((ad.business_card&&ad.business_card.status==='complete'&&ad.business_card.urls)||[],(ad.letterhead&&ad.letterhead.status==='complete'&&ad.letterhead.urls)||[]).filter(Boolean);
  if(urls.length)return _spineImgs(urls,'Stationery board for '+String(m.name||''));
  return _inprodLine(P,'Your business card and letterhead boards are being prepared &mdash; they appear here automatically.');
}
function _stationery_RETIRED(name,dom,P){var ini=esc(_ini(name)),nm=esc(name),d=esc(dom||'');
  var card='<div style="border:1px solid #e9ecf1;border-radius:12px;overflow:hidden;display:flex;min-height:128px"><div style="width:108px;background:'+P.ink+';display:flex;align-items:center;justify-content:center"><div style="width:46px;height:46px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:800;font-size:18px;color:#fff;border:2px solid rgba(255,255,255,.4)">'+ini+'</div></div><div style="padding:16px 18px"><div style="font-family:Georgia,serif;font-weight:700;font-size:18px;color:'+P.ink+'">'+nm+'</div><div style="height:3px;width:32px;background:'+P.accent+';margin:8px 0 10px;border-radius:2px"></div><div style="font:700 12.5px/1.7 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#141b25">'+d+'<br>hello@'+d+'</div></div></div>';
  var lh='<div style="border:1px solid #e9ecf1;border-radius:12px;overflow:hidden"><div style="background:'+P.ink+';padding:13px 18px;display:flex;align-items:center;justify-content:space-between"><span style="font-family:Georgia,serif;color:#fff;font-weight:700;font-size:16px">'+nm+'</span><span style="color:rgba(255,255,255,.8);font:600 12px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif">'+d+'</span></div><div style="height:4px;background:'+P.accent+'"></div><div style="padding:18px"><div style="font:700 12px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#1a222e;margin-bottom:10px">Concept &middot; letterhead layout</div><div style="height:8px;width:46%;background:#eef0f4;border-radius:4px;margin:9px 0"></div><div style="height:7px;width:92%;background:#f3f5f8;border-radius:4px;margin:7px 0"></div><div style="height:7px;width:80%;background:#f3f5f8;border-radius:4px;margin:7px 0"></div></div></div>';
  return '<table width="100%" cellpadding="0" cellspacing="0"><tr><td width="49%" valign="top">'+card+'</td><td width="2%">&nbsp;</td><td width="49%" valign="top">'+lh+'</td></tr></table>';
}

function boardHTML(m){
  m=m||{}; var kit=m.kit||{};
  if((kit.kind||m.kind||'brand')!=='brand')return '';
  var P=_palette(kit);
  var nm=esc(m.name), dom=esc(m.domain||''), handle=esc(_handle(m.name,m.domain));
  var lead=(kit.taglines&&kit.taglines[0])?esc(kit.taglines[0]):'';
  var hdr=(kit.headerUrl||m.headerUrl)?String(kit.headerUrl||m.headerUrl):'';
  var H='';
  /* CO-16 (Founder): board header retired — the story presents name/domain/tag; the board begins at 01. */
  // why
  H+=_band('BRAND','UNDERSTAND THE BRAND',P)+_h('01','Why it works',P)+_why(kit.whyItWorks,P);
  // THE SHIFT PROMISE (SOP-ART-001, 2026-07-05): one brief-fed framing line — the
  // emotional shift in plain language. Renders ONLY when the Governor's brief exists
  // on the kit (data-conditional; display-only; no invention; parity when absent).
  if (kit && kit.gov && kit.gov.shift && kit.gov.shift.promise) {
    H+='<div style="margin:14px 0 0;padding:14px 18px;border-left:3px solid '+P.accent+';background:#faf8f4;font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.5;color:#161e29">'+esc(String(kit.gov.shift.promise).slice(0,180))+'</div>';
  }
  // AI LOGO CONCEPTS (wired 2026-07-05): the generated marks LEAD the Logo system —
  // plated, aspect-preserved, layout-disciplined — with the code lockups beneath as the
  // wordmark/lockup system. Renders only when marks exist; nothing fake, ever.
  var _marks=(kit&&Array.isArray(kit.logoUrls))?kit.logoUrls.slice(0,3):[];
  H+=_h('02','Logo system',P);
  if(_marks.length){
    H+='<div style="font:800 11px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;letter-spacing:.14em;color:'+P.accent+';text-transform:uppercase;margin:2px 0 10px"></div>'+
       '<div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin:0 0 8px">'+
       _marks.map(function(u){return '<img src="'+esc(u)+'" alt="AI logo concept for '+esc(m.name)+'" loading="lazy" style="width:132px;height:132px;object-fit:contain;padding:14px;background:#fff;border:1px solid '+P.accent+';border-radius:20px;box-sizing:border-box">';}).join('')+
       '</div>'+
       '<div style="font:500 12px/1.5 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#2E3A4E;text-align:center;margin:0 0 14px"></div>';
  } else {
    // HONEST IN-PRODUCTION STATE (Founder order, 2026-07-05): no code monograms, no
    // placeholders pretending to be logos — one true sentence while the marks render.
    H+='<div style="border:1px dashed '+P.accent+';border-radius:16px;padding:22px 20px;text-align:center;font:600 14px/1.6 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#2E3A4E;margin:0 0 14px">Your three logo concepts are being drawn right now &mdash; they appear here automatically. Refresh in a minute.</div>';
  }
  // Code lockups RETIRED from the Logo system (Founder order, 2026-07-05): the AI marks
  // ARE the logo system. _logoRow stays in the file untouched for other surfaces.

  // deliverables
  /* CO-8 (Founder): deliverables/receive band retired \u2014 they already have it */
  H+=_h('03','Colour palettes',P)+_palettes(kit.palettes,P);
  if(kit.fonts&&kit.fonts.length)H+=_h('04','Typography',P)+'<div style="border:1px solid #e9ecf1;border-radius:14px;padding:6px 20px">'+_kv(kit.fonts,P)+'</div>';
  if(kit.voice&&kit.voice.length)H+=_h('05','Voice &amp; tone',P)+'<div style="border:1px solid #e9ecf1;border-radius:14px;padding:6px 20px">'+_kv(kit.voice,P)+'</div>';
  if(kit.taglines&&kit.taglines.length)H+=_h('06','Taglines',P)+'<div>'+_tags(kit.taglines,P)+'</div>';
  /* CO-8 (Founder): stationery section retired \u2014 no business card / letterhead offer */
  H+=_h('07','Social avatar',P)+_avatarSec(m,P);
  if(kit.bios&&kit.bios.length)H+=_h('08','Social bios',P)+'<div>'+_list(kit.bios)+'</div>';
  if(handle)H+=_h('09','Social handle recommendations',P)+_handlesSec(handle);
  if(kit.about&&kit.about.length)H+=_h('10','About / profile',P)+'<div>'+_list(kit.about)+'</div>';
  if(kit.linkedin&&kit.linkedin.length)H+=_h('11','LinkedIn intros',P)+'<div>'+_list(kit.linkedin)+'</div>';
  if(kit.facebook&&kit.facebook.length)H+=_h('12','Facebook intros',P)+'<div>'+_list(kit.facebook)+'</div>';
  if(kit.posts&&kit.posts.length)H+=_h('13','Launch posts',P)+'<div>'+_list(kit.posts)+'</div>';
  // final summary board (GDD section 12) — kit strip + export-ready asset list
  var strip=_kitStrip(kit,P);
  H+=_h('14','Final summary',P);
  H+='<div style="background:'+P.paper+';border-radius:14px;padding:24px;margin-top:4px"><div style="display:flex;height:32px;border-radius:8px;overflow:hidden;margin-bottom:14px">'+strip+'</div><div style="font-family:Georgia,serif;font-size:20px;color:'+P.ink+'">A complete brand identity, ready to launch.</div>'+_exportList(kit,P)+'</div>';
  // footer
  H+='<div style="border-top:1px solid #eef0f4;margin-top:24px;padding-top:18px"><div style="font:600 11px/1.55 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#1a222e">Brand concepts (social, website) are AI-generated starting points for your designer &mdash; not final artwork, and not reviewed or approved by SparkMyName&trade;. Check trademark / copyright and have a professional finalize before commercial use.</div></div>';
  H+='</div>';
  return H;
}

function _avatarSec(m,P){var nm=esc(m.name),h=esc(_handle(m.name,m.domain)),d=esc(m.domain||'');
  // REAL AVATAR ONLY (Founder order, 2026-07-05): the AI mark is the avatar. The
  // monogram circle is retired. One honest line until the mark lands on the Shelf.
  var ad=(m.kit&&m.kit.artDept)||{};
  var _mk=(ad.avatar&&ad.avatar.status==='complete'&&ad.avatar.urls&&ad.avatar.urls[0])||(m.kit&&Array.isArray(m.kit.logoUrls)&&m.kit.logoUrls[0])||'';
  if(!_mk)return _inprodLine(P,'Your profile avatar is drawn from logo mark #1 &mdash; it appears here the moment your logos land.');
  return '<div style="border:1px solid #e9ecf1;border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">'
    +'<img src="'+esc(_mk)+'" alt="Profile avatar &mdash; AI mark for '+nm+'" loading="lazy" style="width:87px;height:87px;border-radius:50%;object-fit:cover;background:#fff;border:1px solid #e9ecf1;flex:none">'
    +'<div><div style="font:800 16px/1.2 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#0b0e13">'+nm+'</div>'
    +'<div style="font:600 14px/1.5 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#2E3A4E;margin-top:3px">@'+h+(d?' &middot; '+d:'')+'</div></div></div>';}
function _exportList(kit,P){var items=['Primary logo lockup','Reversed logo','Standalone mark','Colour palette with hex','Typography pairings','Voice &amp; tone directions','Taglines','Letterhead concept','Social avatar concept','Social bios','About / profile copy','LinkedIn &amp; Facebook intros','Launch posts','Social handle recommendations'];
  var cells=items.map(function(t){return '<div style="font:600 14px/1.6 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#161e29;padding:6px 0;border-bottom:1px solid #e4e8ee"><span style="color:'+P.accent+'">\u2713</span>&nbsp;&nbsp;'+t+'</div>';}).join('');
  return '<div style="margin-top:18px"><div style="font:800 12px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;letter-spacing:.1em;color:#2E3A4E;margin-bottom:8px">EXPORT-READY IN THIS PACKAGE</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 26px">'+cells+'</div></div>';}
function _kitStrip(kit,P){var h=[];((kit&&kit.palettes)||[]).forEach(function(p){((p&&p.colors)||[]).forEach(function(c){var v=hx(c);if(v)h.push(v);});});if(!h.length)h=[P.ink,P.accent,P.accent2,P.paper];return h.slice(0,8).map(function(c){return '<span style="flex:1;background:'+c+'"></span>';}).join('');}

function _handlesSec(h){var PL=[['Instagram','@','https://instagram.com/'],['Facebook','/','https://facebook.com/'],['X','@','https://x.com/'],['TikTok','@','https://tiktok.com/@'],['YouTube','@','https://youtube.com/@'],['LinkedIn','/','https://www.linkedin.com/company/']];var rows=PL.map(function(p){var url=p[2]+encodeURIComponent(h);return '<tr><td style="font:700 12px/1.6 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#2E3A4E;text-transform:uppercase;letter-spacing:.04em;padding:8px 0;border-bottom:1px solid #eef0f4">'+p[0]+'</td><td style="font:700 13px/1.6 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#0b0e13;text-align:right;padding:8px 0;border-bottom:1px solid #eef0f4">'+p[1]+esc(h)+'</td><td style="text-align:right;padding:8px 0 8px 12px;border-bottom:1px solid #eef0f4"><a href="'+url+'" target="_blank" rel="noopener nofollow" style="font:800 12px/1 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#0B5FFF;text-decoration:none;white-space:nowrap">Confirm on platform &rarr;</a></td></tr>';}).join('');return '<div style="border:1px solid #e9ecf1;border-radius:14px;padding:10px 20px 6px"><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">'+rows+'</table><div style="font:400 13px/1.55 Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;color:#2E3A4E;padding:10px 0 8px">These are recommended social handles based on brand consistency. SparkMyName does not check, verify, or guarantee availability on any platform. Please confirm availability directly on each platform before claiming a handle.</div></div>';}

module.exports = { boardHTML: boardHTML };
