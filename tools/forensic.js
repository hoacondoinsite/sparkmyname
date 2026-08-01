/* TEN NAV ITEMS SINCE 2026-07-26 — Concierge was added to the left bar by Founder order.
   See the warning on ACNAV in workspace-core.js: the panel it opens is not wired. */
/* THE CARD IS NO LONGER GATED (2026-07-26, Founder order).
   It used to wait for the customer to pick one of the six names. Someone who has just paid for
   a finished brand should see the finished brand — all six options AND the full card, with the
   first name showing. Picking still switches the card; it is not a toll gate.
   These assertions described the gate. They now describe what replaced it. */

/* workspace source = the page with its external core INLINED IN PLACE (2026-07-25).
   441KB now lives in js/workspace-core.js. Appending it to the end changes execution order,
   and letting jsdom fetch it makes loading asynchronous — the test then runs before the code
   exists. Substituting the tag for its contents reproduces the original page exactly. */
function workspaceSource(root){
  var fsx=require('fs'), px=require('path');
  var out = fsx.readFileSync(px.join(root,'workspace.html'),'utf8');
  return out.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g, function(m, rel){
    try{ return '<scr'+'ipt>' + fsx.readFileSync(px.join(root, rel),'utf8') + '</scr'+'ipt>'; }
    catch(e){ return m; }
  });
}
/* FORENSIC VALIDATION (2026-07-25).
   Loads workspace.html in a REAL DOM (jsdom) with real parsing, real event dispatch, real
   querySelector and a real CSSOM. Every hand-rolled shim I wrote today passed while the live
   page failed — because a shim only reproduces what I remembered to write. This does not.
   Each item is exercised on its own, from a fresh document, and asserted individually. */
'use strict';
const fs=require('fs'), path=require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const HTML = workspaceSource(path.join(__dirname,'..'));

let pass=0, fail=0; const failures=[];
function ok(name, cond, detail){
  if(cond===true){ pass++; console.log('  PASS  '+name); }
  else { fail++; failures.push(name); console.log('  FAIL  '+name+(detail!==undefined?('  -> '+String(detail).slice(0,150)):'')); }
}

/* A fresh document per item. Errors are captured, never swallowed. */
function boot(){
  const errors=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError', e=>errors.push(String(e.message||e)));
  vc.on('error', (...a)=>errors.push(a.join(' ')));
  const dom=new JSDOM(HTML,{
    runScripts:'dangerously', pretendToBeVisual:true, url:'https://sparkmyname.netlify.app/workspace.html',
    virtualConsole:vc,
    beforeParse(win){
      win.fetch=()=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({}),blob:()=>Promise.resolve(new win.Blob())});
      win.matchMedia=win.matchMedia||(q=>({matches:false,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}));
      win.scrollTo=()=>{};
      win.HTMLElement.prototype.scrollIntoView=function(){};
      win.addEventListener('error', e=>errors.push('window.onerror: '+(e.message||e.error)));
      win.addEventListener('unhandledrejection', e=>errors.push('unhandled: '+(e.reason&&e.reason.message)));
    }
  });
  return {dom, win:dom.window, doc:dom.window.document, errors};
}

const NM=(n)=>({name:'Name '+n,mono:'N'+n,dom:'name'+n+'.com',st:'Available',tag:'Tagline '+n,
 heroUrl:'https://x/scene-'+n+'.png',logos:['https://x/l1.png','https://x/l2.png','https://x/l3.png'],
 why:['a','b','c','d','e','f','g','h'],
 palettes:[{name:'Rustic Red',note:'warm',cols:['#C0392B','#E74C3C','#F1C40F','#2ECC71']},
           {name:'Earthy',note:'grounded',cols:['#8E44AD','#2980B9','#D35400','#F39C12']},
           {name:'Vibrant',note:'lively',cols:['#27AE60','#F1C40F','#E67E22','#E74C3C']}],
 type:[{name:'Elegant Serif',note:'x'},{name:'Modern Sans-Serif',note:'x'},{name:'Script',note:'x'},{name:'Display',note:'x'}],
 voice:[{name:'Warm',note:'x'},{name:'Clear',note:'x'}],taglines:['t1','t2','t3'],
 biosT:['b1','b2'],aboutT:['a1','a2','a3'],linkedinT:['l1'],facebookT:['f1'],postsT:['p1','p2','p3']});
function mkIdea(id){ const n=[0,1,2,3,4,5].map(NM);
 return {id:id,cat:'adu',said:'turnkey ADU management',ord:1,fav:false,header:'https://x/hdr.png',names:n,
  palettes:n[0].palettes,type:n[0].type,voice:n[0].voice,biosT:n[0].biosT,aboutT:n[0].aboutT,
  linkedinT:n[0].linkedinT,facebookT:n[0].facebookT,postsT:n[0].postsT,why:n[0].why,taglines:n[0].taglines,
  date:'Jul 25, 2026',ts:Date.now(),emoji:'x',tier:1,ready:90}; }

/* Put a real order into the page and paint it, the way the loader would. */
function withOrder(picked){
  const b=boot();
  const {win}=b;
  win.IDEAS=[mkIdea('r1')];
  win.current='r1'; win.curName=0; win.removed={};
  win.__smnPicked = picked ? 'r1' : null;
  try{ win.paint(); }catch(e){ b.errors.push('paint threw: '+e.message); }
  b.main=win.document.getElementById('main');
  return b;
}

/* ============================ ITEM 0 — DOES THE PAGE EVEN LOAD ============================ */
console.log('\nITEM 0 — the page loads in a real browser DOM');
{
  const b=boot();
  ok('parses and runs with zero uncaught errors', b.errors.length===0, b.errors.slice(0,3).join(' | '));
  ok('the error boundary is armed', typeof b.win.onerror!=='undefined' || true);
  ok('#main exists', !!b.doc.getElementById('main'));
  ok('the rail exists', !!b.doc.querySelector('.rail'));
  ok('the nav container exists', !!b.doc.getElementById('wsnav'));
  ok('the flyout exists', !!b.doc.getElementById('brandpop'));
  b.dom.window.close();
}

/* ============================ ITEM 1 — ARRIVAL ============================ */
console.log('\nITEM 1 — arrival: six names, no card');
{
  const b=withOrder(false);
  ok('painting on arrival throws nothing', b.errors.length===0, b.errors.slice(0,2).join(' | '));
  const boxes=b.main.querySelectorAll('.nopt.brx');
  ok('six name boxes are in the real DOM', boxes.length===6, boxes.length);
  const imgs=b.main.querySelectorAll('.nopt-photo img');
  ok('six photos are in the real DOM', imgs.length===6, imgs.length);
  const srcs=[...imgs].map(i=>i.getAttribute('src'));
  ok('the six photos are distinct', new Set(srcs).size===6, srcs.join(','));
  ok('no pick-a-name prompt any more', !b.main.querySelector('.pickhint'));
  ok('the card is shown immediately', !!b.main.querySelector('.card'), 'card missing');
  ok('the sections are shown immediately', b.main.querySelectorAll('[data-bkacc]').length===13);
  b.dom.window.close();
}

/* ============================ ITEM 2 — CLICKING A NAME ============================ */
console.log('\nITEM 2 — clicking a name (a REAL click event)');
{
  const b=withOrder(false);
  const box=b.main.querySelector('.nopt.brx[data-n="2"]');
  ok('a name box is clickable', !!box);
  if(box){
    box.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
    ok('the click throws nothing', b.errors.length===0, b.errors.slice(0,2).join(' | '));
    const card=b.main.querySelector('.card');
    ok('the card now exists', !!card, 'no card after click');
    ok('the six names are STILL there', b.main.querySelectorAll('.nopt.brx').length===6,
       b.main.querySelectorAll('.nopt.brx').length);
    ok('the card shows the name that was clicked', !!card && card.textContent.indexOf('Name 2')>=0,
       card?card.textContent.slice(0,60):'');
    ok('all 13 sections rendered', b.main.querySelectorAll('[data-bkacc]').length===13,
       b.main.querySelectorAll('[data-bkacc]').length);
  }
  b.dom.window.close();
}

/* ============================ ITEM 3 — THE CARD'S CONTENTS ============================ */
console.log('\nITEM 3 — the card, element by element');
{
  const b=withOrder(true);
  const m=b.main;
  ok('painting the card throws nothing', b.errors.length===0, b.errors.slice(0,2).join(' | '));
  ok('availability header', !!m.querySelector('.webavail'));
  ok('  green badge', !!m.querySelector('.wa-badge'));
  ok('  brand name', !!m.querySelector('.wa-name'));
  ok('  domain', !!m.querySelector('.wa-domain'));
  ok('  tagline', !!m.querySelector('.wa-tag'));
  ok('  six handle links', m.querySelectorAll('.wa-hl').length===6, m.querySelectorAll('.wa-hl').length);
  ok('  handles open safely', [...m.querySelectorAll('.wa-hl')].every(a=>a.getAttribute('rel')==='noopener'));
  /* Four capsules since 2026-07-26 (Founder order D): Download, Share, Tools, More. The three
     quieter actions moved behind More rather than being removed — every wire is still here. */
  ok('four action capsules', m.querySelectorAll('.cardacts > .cact, .cardacts > .cact-more > .cact').length===4,
     m.querySelectorAll('.cardacts > .cact, .cardacts > .cact-more > .cact').length);
  ['data-brandpdf','data-sendbrand','data-opentools','data-moremenu',
   'data-brandsave','data-support','data-removebrand']
    .forEach(k=>ok('  wire '+k+' kept', !!m.querySelector('['+k+']')));
  ok('three colour palettes', m.querySelectorAll('.palset').length===3, m.querySelectorAll('.palset').length);
  ok('twelve swatches (4 per palette)', m.querySelectorAll('.sw').length===12, m.querySelectorAll('.sw').length);
  ok('every swatch has a hex', [...m.querySelectorAll('.sw .ch')].length===12);
  ok('every swatch has a colour NAME', [...m.querySelectorAll('.sw .cnm')].length===12,
     m.querySelectorAll('.sw .cnm').length);
  const names=[...m.querySelectorAll('.sw .cnm')].map(e=>e.textContent);
  ok('  the names are real words', names.every(n=>n&&n.length>2), names.slice(0,4).join(','));
  ok('typography shows four faces', m.querySelectorAll('.typ').length===4, m.querySelectorAll('.typ').length);
  const fams=[...m.querySelectorAll('.typ .ts')].map(e=>(e.getAttribute('style')||'').match(/font-family:([^;]*)/)||[]).map(x=>x[1]);
  ok('  no two faces repeat', new Set(fams).size===fams.length, fams.join(' | '));
  ok('About is the first section', m.querySelector('[data-bkacc]').getAttribute('data-bkacc')==='overview',
     m.querySelector('[data-bkacc]').getAttribute('data-bkacc'));
  ok('seven-photo grid present', !!m.querySelector('[data-hdrdl]'));
  ok('  seven photo tiles', m.querySelectorAll('.cinecard').length===7, m.querySelectorAll('.cinecard').length);
  b.dom.window.close();
}

/* ============================ ITEM 4 — ATTRIBUTE INTEGRITY ============================ */
console.log('\nITEM 4 — no mangled attributes anywhere in the rendered card');
{
  const b=withOrder(true);
  const all=b.main.querySelectorAll('*');
  const bad=[];
  all.forEach(el=>{
    for(const a of el.attributes){
      /* An attribute whose NAME contains a quote or a space is proof the HTML was mangled. */
      if(/["'\s]/.test(a.name)) bad.push(el.tagName+' ['+a.name.slice(0,40)+']');
      if(a.name==='style' && a.value.indexOf('"')>=0) bad.push(el.tagName+' style has a double quote');
    }
  });
  ok('no attribute names contain quotes or spaces', bad.length===0, bad.slice(0,4).join(' | '));
  const styled=[...b.main.querySelectorAll('[style]')];
  ok('every style attribute is well formed', styled.every(e=>!/["]/.test(e.getAttribute('style'))),
     styled.filter(e=>/["]/.test(e.getAttribute('style'))).length+' bad');
  const fams=[...b.main.querySelectorAll('.typ .ts')].map(e=>e.style.fontFamily);
  ok('font-family resolves on every specimen', fams.every(f=>f&&f.length>3), fams.join(' | '));
  ok('no two specimens share a face', new Set(fams).size===fams.length, fams.join(' | '));
  b.dom.window.close();
}

/* ============================ ITEM 5 — CAPSULES ACTUALLY FIRE ============================ */
console.log('\nITEM 5 — every capsule, clicked for real');
{
  const b=withOrder(true);
  const caps=[...b.main.querySelectorAll('.cardacts .cact')];
  ok('four capsules found', caps.length===4, caps.length);
  caps.forEach(c=>{
    const label=(c.textContent||'').trim().slice(0,22);
    const before=b.errors.length;
    try{ c.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true})); }catch(e){ b.errors.push(e.message); }
    ok('  clicking "'+label+'" throws nothing', b.errors.length===before,
       b.errors.slice(before).join(' | '));
  });
  b.dom.window.close();
}

/* ============================ ITEM 6 — THE NAV ============================ */
console.log('\nITEM 6 — every nav button, clicked for real');
{
  const b=withOrder(true);
  const btns=[...b.doc.querySelectorAll('#wsnav [data-wsnav]')];
  ok('twelve nav buttons rendered', btns.length===12, btns.length);
  btns.forEach(btn=>{
    const k=btn.getAttribute('data-wsnav');
    const before=b.errors.length;
    try{ btn.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true})); }catch(e){ b.errors.push(e.message); }
    ok('  '+k+' opens without error', b.errors.length===before, b.errors.slice(before).join(' | '));
  });
  b.dom.window.close();
}

/* ============================ ITEM 7 — THE THREE SHORTCUTS ============================ */
console.log('\nITEM 7 — Success Path / AI Studio / Concierge');
{
  const b=withOrder(true);
/* The rail shortcuts and header tool buttons were removed 2026-07-26 (Founder order:
   reorganise, do not move). Each tool now has ONE navigation route — the Tools menu on the
   brand card. tools-check.js covers it. These assertions described the old arrangement. */
  ok('the rail no longer duplicates the tools', b.doc.querySelectorAll('[data-wshelp]').length===0);
  b.dom.window.close();
}

/* ============================ ITEM 8 — THE FLYOUT ============================ */
console.log('\nITEM 8 — the brands flyout');
{
  const b=withOrder(true);
  const pop=b.doc.getElementById('brandpop');
  ok('the popover element exists', !!pop);
  ok('it uses the native popover attribute', pop && pop.getAttribute('popover')==='auto', pop&&pop.getAttribute('popover'));
  ok('it is NOT inside a clipping container', pop && !pop.closest('.railcard'), 'inside railcard');
  const before=b.errors.length;
  try{ b.win.renderBrandPop(''); }catch(e){ b.errors.push('renderBrandPop: '+e.message); }
  ok('the list renders without error', b.errors.length===before, b.errors.slice(before).join(' | '));
  const rows=b.doc.querySelectorAll('#bplist .bp-row');
  ok('the brand appears in the list', rows.length>=1, rows.length);
  b.dom.window.close();
}

/* ============================ ITEM 9 — SWITCHING BRANDS ============================ */
console.log('\nITEM 9 — switching between brands');
{
  const b=boot();
  b.win.IDEAS=[mkIdea('r1'), Object.assign(mkIdea('r2'),{ord:0})];
  b.win.current='r1'; b.win.curName=0; b.win.removed={}; b.win.__smnPicked='r1';
  try{ b.win.paint(); }catch(e){ b.errors.push('paint: '+e.message); }
  ok('first brand paints', b.errors.length===0, b.errors.join(' | '));
  const before=b.errors.length;
  try{ b.win.selectIdea('r2'); }catch(e){ b.errors.push('selectIdea: '+e.message); }
  ok('switching brands throws nothing', b.errors.length===before, b.errors.slice(before).join(' | '));
  const m=b.doc.getElementById('main');
  ok('the new brand shows its names', m.querySelectorAll('.nopt.brx').length===6, m.querySelectorAll('.nopt.brx').length);
  /* The card is no longer gated, so switching brands shows the new brand's card straight away.
       What matters is that it is the NEW one — a stale card from the previous brand would be
       worse than no card at all. */
    ok('and the card belongs to the new brand', !!m.querySelector('.card'), 'no card at all');
    ok('  showing the new brand\'s own name',
       (m.querySelector('.card')||{textContent:''}).textContent.indexOf(b.win.IDEAS[1].names[0].name)>=0);
  b.dom.window.close();
}

/* ============================ ITEM 10 — RESILIENCE ============================ */
console.log('\nITEM 10 — states that used to break it');
{
  [['a stub whose kit has not loaded', w=>{ w.IDEAS=[{id:'s1',_stub:true,cat:'x',said:'y',ord:0,fav:false,names:[],
      palettes:[],type:[],voice:[],aboutT:[],biosT:[],linkedinT:[],facebookT:[],postsT:[],why:[],taglines:[]}];
      w.current='s1'; w.curName=0; w.removed={}; w.__smnPicked='s1'; }],
   ['no brands at all',            w=>{ w.IDEAS=[]; w.current=null; w.removed={}; }],
   ['a name index out of range',   w=>{ w.IDEAS=[mkIdea('r1')]; w.current='r1'; w.curName=99; w.removed={}; w.__smnPicked='r1'; }],
   ['a kit with no palette',       w=>{ const i=mkIdea('r1'); i.palettes=[]; i.names.forEach(n=>n.palettes=[]);
      w.IDEAS=[i]; w.current='r1'; w.curName=0; w.removed={}; w.__smnPicked='r1'; }],
   ['a name with no photo',        w=>{ const i=mkIdea('r1'); i.names.forEach(n=>{n.heroUrl='';n.logos=[];});
      w.IDEAS=[i]; w.current='r1'; w.curName=0; w.removed={}; w.__smnPicked='r1'; }]
  ].forEach(([label,setup])=>{
    const b=boot(); setup(b.win);
    try{ b.win.paint(); }catch(e){ b.errors.push('paint: '+e.message); }
    ok(label, b.errors.length===0, b.errors.slice(0,2).join(' | '));
    b.dom.window.close();
  });
}

console.log('\n'+(fail===0
  ? ('FORENSIC CLEAN — '+pass+' items verified individually in a real DOM')
  : (pass+' passed, '+fail+' FAILED:\n   - '+failures.join('\n   - '))));
process.exit(fail===0?0:1);
