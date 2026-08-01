/* THE CARD IS NO LONGER GATED (2026-07-26, Founder order).
   It used to wait for the customer to pick one of the six names. Someone who has just paid for
   a finished brand should see the finished brand — all six options AND the full card, with the
   first name showing. Picking still switches the card; it is not a toll gate.
   These assertions described the gate. They now describe what replaced it. */
/* MOBILE + CAPSULE REWORK (2026-07-26, Founder order A–E). Real DOM, real clicks. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
function workspaceSource(root){
  var f=require('fs'), p=require('path');
  return f.readFileSync(p.join(root,'workspace.html'),'utf8')
    .replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g,(m,r)=>{
      try{ return '<scr'+'ipt>'+f.readFileSync(p.join(root,r),'utf8')+'</scr'+'ipt>'; }catch(e){ return m; }});
}
const ROOT=path.join(__dirname,'..');
const SRC=workspaceSource(ROOT), FLAT=SRC.replace(/\s+/g,'');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,110)):''));} };
const NM=n=>({name:'Name '+n,mono:'M'+n,dom:'n'+n+'.com',st:'Available',tag:'t'+n,heroUrl:'https://x/'+n+'.png',
 logos:['https://x/a.png'],why:['a'],palettes:[{name:'P',note:'n',cols:['#111','#222','#333','#444']}],
 type:[{name:'S',note:'x'}],voice:[{name:'V',note:'x'}],taglines:['t'],biosT:['b'],aboutT:['a'],
 linkedinT:['l'],facebookT:['f'],postsT:['p']});
function boot(picked){
  const errs=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  const dom=new JSDOM(SRC,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errs.push(e.message));}});
  const w=dom.window;
  const I={id:'r1',cat:'ADU',said:'turnkey ADU',ord:9,fav:false,header:'https://x/h.png',
    names:[0,1,2,3,4,5].map(NM),palettes:NM(0).palettes,type:NM(0).type,voice:NM(0).voice,
    biosT:['b'],aboutT:['a'],linkedinT:['l'],facebookT:['f'],postsT:['p'],why:['a'],taglines:['t'],date:'J',ts:9};
  w.IDEAS=[I]; w.current='r1'; w.curName=0; w.removed={}; w.__smnPicked = picked?'r1':null;
  try{ w.paint(); }catch(e){ errs.push('paint: '+e.message); }
  return {dom,win:w,doc:w.document,errs,main:w.document.getElementById('main')};
}

W('A — ON A PHONE THE BRAND COMES FIRST');
ok('the card is ordered first below 1080px', /\.main\{order:1\}/.test(FLAT));
ok('the rail is ordered second', /\.rail\{position:static;order:2\}/.test(FLAT));
ok('the markup order is unchanged for screen readers',
   SRC.indexOf('<aside class="rail"') < SRC.indexOf('<main class="main"'));
ok('the desktop grid is untouched', /\.shell\{max-width:1440px[^}]*236pxminmax\(0,1fr\)/.test(FLAT));

W('\nB — THE MOBILE HEADER CARRIES ONLY HEADER THINGS');
/* THIS TEST USED TO LIE (2026-07-26). It asserted that the string ".topbar.<class>" appeared
   somewhere in the stylesheet. It did — in a rule that selected NOTHING, because the header is
   .bar, not .topbar. The test passed, the header was untouched on the Founder's phone, and I
   shipped it. A selector is only real if it matches an element, so that is what is checked now.
   phone-check.js covers the resolved cascade at each width; this covers the DOM. */
{
  const probe=new JSDOM(SRC,{virtualConsole:new VirtualConsole()}).window.document;
  /* The three tool buttons were removed from the header entirely on 2026-07-26, not merely
     hidden — they duplicated the Tools menu inside the brand. Only these two remain. */
  ['newbrandbtn','iconbtn'].forEach(c=>{
    const n=probe.querySelectorAll('.bar .'+c).length;
    ok('  .bar .'+c+' selects a real element', n>=1, n);
  });
  ['aistudiobtn','successbtn','conciergebtn'].forEach(c=>
    ok('  .bar .'+c+' is gone from the header', probe.querySelectorAll('.bar .'+c).length===0));
  ok('  .topbar selects nothing (the old rule was dead)', probe.querySelectorAll('.topbar').length===0);
  probe.defaultView.close();
}
ok('the tools live on the brand card instead',
   ['data-tool="ai"','data-tool="success"','data-tool="concierge"'].every(x=>SRC.indexOf(x)>=0));

W('\nC — NOTHING EXPANDS UNTIL IT IS ASKED FOR');
{
  const b=boot(true);
  const all=[...b.main.querySelectorAll('[data-bkacc]')];
  const open=all.filter(a=>/(^|\s)open(\s|$)/.test(a.className));
  ok('thirteen sections render', all.length===13, all.length);
  ok('exactly one is open', open.length===1, open.length);
  ok('  and it is About', open[0] && open[0].getAttribute('data-bkacc')==='overview');
  ok('aria-expanded tells the truth', all.every(a=>{
    const o=/(^|\s)open(\s|$)/.test(a.className);
    return a.querySelector('.bkacc-h').getAttribute('aria-expanded')===String(o); }));
  b.dom.window.close();
}

W('\nD — FOUR CAPSULES, EVERY WIRE KEPT');
{
  const b=boot(true);
  const caps=[...b.main.querySelectorAll('.cardacts > .cact, .cardacts > .cact-more > .cact')];
  ok('four capsules in the row', caps.length===4, caps.map(c=>c.textContent.trim()).join(' | '));
  ok('  Download is the primary', !!b.main.querySelector('.cact-primary[data-brandpdf]'));
  ['data-brandpdf','data-sendbrand','data-opentools','data-moremenu','data-brandsave','data-support','data-removebrand']
    .forEach(k=>ok('  '+k+' still present', !!b.main.querySelector('['+k+']')));
  const menu=b.main.querySelector('.cact-menu');
  ok('the More menu starts closed', menu && menu.hidden===true);
  const more=b.main.querySelector('[data-moremenu]');
  more.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('pressing More opens it', menu.hidden===false);
  ok('  and announces it', more.getAttribute('aria-expanded')==='true');
  more.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('pressing again closes it', menu.hidden===true);
  more.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Escape closes it', menu.hidden===true);
  b.dom.window.close();
}

W('\n   every capsule fires without error');
{
  const b=boot(true);
  ['data-brandpdf','data-sendbrand','data-opentools','data-brandsave','data-support']
    .forEach(k=>{
      const before=b.errs.length;
      /* re-open More before each pass: a previous click may legitimately have closed it */
      const more=b.main.querySelector('[data-moremenu]');
      const menu=b.main.querySelector('.cact-menu');
      if(more && menu && menu.hidden) more.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
      const el=b.main.querySelector('['+k+']');
      ok('   '+k+' is still on the card', !!el);
      if(!el) return;
      try{ el.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true})); }catch(e){ b.errs.push(e.message); }
      ok('   '+k+' throws nothing', b.errs.length===before, b.errs.slice(before)[0]);
    });
  ok('   Download did not destroy the More menu', !!b.main.querySelector('[data-brandsave]'));
  b.dom.window.close();
}

W('\nE — NO HERO IMAGE, DELIVERABLES INTACT');
{
  const b=boot(true);
  ok('no hero on the card', b.main.querySelectorAll('.cinehero').length===0,
     b.main.querySelectorAll('.cinehero').length);
  ok('no hero above the names', b.main.querySelectorAll('.brandhero').length===0);
  ok('the six name photos remain', b.main.querySelectorAll('.nopt-photo img').length===6,
     b.main.querySelectorAll('.nopt-photo img').length);
  ok('all seven photos remain downloadable', b.main.querySelectorAll('.cinecard').length===7,
     b.main.querySelectorAll('.cinecard').length);
  ok('nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nARRIVAL IS STILL CORRECT');
{
  const b=boot(false);
  ok('six name boxes', b.main.querySelectorAll('.nopt.brx').length===6);
  ok('the card is shown on arrival', !!b.main.querySelector('.card'));
  ok('nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('');
W(fail===0?('MOBILE REWORK CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
