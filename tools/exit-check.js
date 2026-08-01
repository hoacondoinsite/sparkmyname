
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
/* EXIT PATHS + STUB SAFETY (2026-07-25). Real DOM. Proves a customer can always leave the
   account panel without hunting for a corner control, and that a mostly-stub account renders. */
'use strict';
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,130)):''));} };
function boot(){
  const errors=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errors.push(m);});
  const dom=new JSDOM(workspaceSource(path.join(__dirname,'..')),{
    runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errors.push('onerror: '+(e.message||'')));}});
  return {dom,win:dom.window,doc:dom.window.document,errors};
}
const NM={name:'Vine & Crust',mono:'VC',dom:'v.com',st:'Available',tag:'t',heroUrl:'https://x/h.png',
 logos:['https://x/a.png'],why:['a'],palettes:[{name:'P',note:'n',cols:['#C0392B','#E74C3C','#F1C40F','#2ECC71']}],
 type:[{name:'S',note:'x'}],voice:[{name:'V',note:'x'}],taglines:['t'],biosT:['b'],aboutT:['a'],
 linkedinT:['l'],facebookT:['f'],postsT:['p']};
function realAccount(win, stubCount){
  const loaded={id:'r1',cat:'adu',said:'y',ord:999,fav:false,header:'https://x/h.png',names:[NM,NM,NM,NM,NM,NM],
   palettes:NM.palettes,type:NM.type,voice:NM.voice,biosT:NM.biosT,aboutT:NM.aboutT,linkedinT:NM.linkedinT,
   facebookT:NM.facebookT,postsT:NM.postsT,why:NM.why,taglines:NM.taglines,date:'Jul 4',ts:9};
  const list=[loaded];
  for(let i=1;i<=stubCount;i++) list.push({id:'s'+i,_stub:true,cat:'Brand '+i,said:'idea '+i,ord:i,
    fav:i%5===0,header:'',names:[],palettes:[],type:[],voice:[],aboutT:[],biosT:[],linkedinT:[],
    facebookT:[],postsT:[],why:[],taglines:[],date:'Jul 4',ts:i});
  win.IDEAS=list; win.current='r1'; win.curName=0; win.removed={}; win.__smnPicked='r1';
}

W('STUB SAFETY — the account is mostly stubs until kits load');
{
  const b=boot(); realAccount(b.win,40);
  try{ b.win.paint(); }catch(e){ b.errors.push('paint: '+e.message); }
  ok('paint with 40 stubs', b.errors.length===0, b.errors[0]);
  ['brands','purchases','overview','ai','support','refer','prefs','security','privacy'].forEach(sec=>{
    const before=b.errors.length;
    try{ b.win.ACCT.sec=sec; b.win.openAccount(sec); }catch(e){ b.errors.push(sec+': '+e.message); }
    ok('  '+sec+' opens', b.errors.length===before, b.errors.slice(before)[0]);
  });
  try{ b.dom.window.close(); }catch(e){}
}

W('\nEXIT PATHS — a customer must never be trapped');
{
  const b=boot(); realAccount(b.win,8);
  try{ b.win.paint(); b.win.openAccount('purchases'); }catch(e){ b.errors.push(e.message); }
  const ov=b.doc.getElementById('acctOv');
  ok('the panel is open', ov.classList.contains('open'));

  const shell=b.doc.querySelector('.ac-shell');
  ok('a real backdrop exists (panel is inset)', !!shell, 'no shell');
  const css=workspaceSource(path.join(__dirname,'..')).replace(/\s+/g,'');
  ok('  .ac-shell is inset, not edge to edge', /\.ac-shell\{position:absolute;inset:24px/.test(css), 'still inset:0');

  /* 1 — click the backdrop */
  ov.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('EXIT 1: clicking the backdrop closes it', !ov.classList.contains('open'), 'still open');

  /* 2 — Escape */
  b.win.openAccount('purchases');
  b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('EXIT 2: Escape closes it', !ov.classList.contains('open'), 'still open');

  /* 3 — the labelled back button */
  b.win.openAccount('purchases');
  const back=b.doc.querySelector('.ac-x');
  ok('EXIT 3: the corner control is LABELLED, not just an X',
     back && /Back to your brands/.test(back.textContent), back?back.textContent.trim():'missing');
  back.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('  and it closes the panel', !ov.classList.contains('open'), 'still open');

  /* 4 — pressing the section you are already in */
  b.win.openAccount('purchases');
  const same=b.doc.querySelector('[data-acnav="purchases"]');
  same.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('EXIT 4: pressing the open section closes it', !ov.classList.contains('open'), 'still open');

  /* 5 — Brands always returns */
  b.win.openAccount('purchases');
  b.doc.querySelector('[data-acnav="brands"]').dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('EXIT 5: Brands returns to the workspace', !ov.classList.contains('open'), 'still open');

  /* 6 — the rail nav toggles too */
  b.win.openAccount('purchases');
  const rail=b.doc.querySelector('#wsnav [data-wsnav="purchases"]');
  if(rail) rail.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('EXIT 6: the rail nav toggles it shut', !ov.classList.contains('open'), 'still open');

  ok('the back button is keyboard focusable and visible',
     /\.ac-x:focus-visible\{outline:2pxsolidvar\(--v\)/.test(css));
  ok('the back button meets 44px touch minimum', /\.ac-x\{[^}]*min-height:44px/.test(css));
  try{ b.dom.window.close(); }catch(e){}
}

W('\n'+(fail===0?('EXIT PATHS CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED')));
try{ process.exit(fail===0?0:1); }catch(e){}
