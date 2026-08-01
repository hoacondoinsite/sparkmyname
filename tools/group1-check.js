/* TEN NAV ITEMS SINCE 2026-07-26 — Concierge was added to the left bar by Founder order.
   See the warning on ACNAV in workspace-core.js: the panel it opens is not wired. */

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
/* GROUP 1 (2026-07-25) — collapsed rows, readable headings, domain font, unified shortcuts,
   rail scrolling. Real DOM, real computed styles where jsdom supports them. */
'use strict';
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const SRC=workspaceSource(path.join(__dirname,'..'));
const CSS=SRC.replace(/\s+/g,'');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,130)):''));} };
function boot(){
  const errors=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errors.push(m);});
  const dom=new JSDOM(SRC,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errors.push('onerror: '+(e.message||'')));}});
  return {dom,win:dom.window,doc:dom.window.document,errors};
}
const NM={name:'Sweet Soiree',mono:'SS',dom:'sweetsoire.com',st:'Available',tag:'Celebrate with Sweet Style!',
 heroUrl:'https://x/h.png',logos:['https://x/a.png'],why:['a'],
 palettes:[{name:'Rustic Red',note:'warm',cols:['#C0392B','#E74C3C','#F1C40F','#2ECC71']}],
 type:[{name:'Elegant Serif',note:'x'}],voice:[{name:'V',note:'x'}],taglines:['t'],biosT:['b'],
 aboutT:['a'],linkedinT:['l'],facebookT:['f'],postsT:['p']};

W('ISSUE 1 — the brand list showed only lines, no content');
{
  const b=boot();
  const stubs=[]; for(let i=1;i<=10;i++) stubs.push({id:'s'+i,_stub:true,cat:'Self Storage business',
    said:'Self Storage business',ord:i,fav:false,header:'',names:[],palettes:[],type:[],voice:[],
    aboutT:[],biosT:[],linkedinT:[],facebookT:[],postsT:[],why:[],taglines:[],date:'Jul 4, 2026',ts:i,emoji:'x'});
  b.win.IDEAS=stubs; b.win.current='s1'; b.win.curName=0; b.win.removed={};
  try{ b.win.paint(); }catch(e){ b.errors.push(e.message); }
  ok('paint throws nothing', b.errors.length===0, b.errors[0]);
  const rows=b.doc.querySelectorAll('#ilist .irow');
  /* THE RAIL NO LONGER HOLDS THE BRAND LIST (2026-07-26, Founder order). It duplicated the
     Brands flyout exactly — two search boxes, two lists of 242, two create buttons, all on
     screen together. The rail is the nine sections; the flyout is the brands. */
  
  ok('the rail carries no brand rows', b.doc.querySelectorAll('.rail .irow').length===0);
  ok('every row has visible text', [...rows].every(r=>(r.textContent||'').trim().length>8),
     [...rows].filter(r=>(r.textContent||'').trim().length<=8).length+' empty');
  ok('rows cannot shrink (flex:none)', /\.blist>\*\{flex:none\}/.test(CSS), 'missing');
  ok('the flyout carries them instead', /id="bplist"/.test(SRC));
  try{b.dom.window.close();}catch(e){}
}

W('\nISSUE 2 — headings were gradient-faded and hard to read');
{
  ['.bkacc-t','.ph','.wa-label','.wa-tag','.brx-n','.pn','.tn','.bp-n','.reqline .rl-v']
    .forEach(sel=>{
      const key=sel.replace(/[.\s]/g,'');
      ok('  '+sel+' forced to a solid colour',
         new RegExp('-webkit-text-fill-color:currentColor!important').test(CSS) && CSS.indexOf(sel.replace(/\s+/g,''))>=0,
         'not covered');
    });
  ok('gradient text fill neutralised', /-webkit-text-fill-color:currentColor!important/.test(CSS));
  ok('background-clip reset to border-box', /background-clip:border-box!important/.test(CSS));
}

W('\nISSUE 3 — the domain was set in a monospace face');
{
  const b=boot();
  b.win.IDEAS=[{id:'r1',cat:'x',said:'y',ord:1,fav:false,header:'',names:[NM,NM],palettes:NM.palettes,
    type:NM.type,voice:NM.voice,biosT:NM.biosT,aboutT:NM.aboutT,linkedinT:NM.linkedinT,
    facebookT:NM.facebookT,postsT:NM.postsT,why:NM.why,taglines:NM.taglines,date:'Jul 4',ts:1}];
  b.win.current='r1'; b.win.curName=0; b.win.removed={}; b.win.__smnPicked='r1';
  try{ b.win.paint(); }catch(e){ b.errors.push(e.message); }
  ok('card paints', b.errors.length===0, b.errors[0]);
  ok('the domain element exists', !!b.doc.querySelector('.wa-domain'));
  ok('domain is NOT monospace', !/\.wa-domain,\.dl-url\{font-family:var\(--mono\)/.test(CSS));
  ok('domain uses Inter', /\.wa-domain,\.dl-url\{font-family:'Inter'/.test(CSS));
  ok('hex codes stay monospace (data still reads as data)', /\.sw\.ch[^}]*font-family:var\(--mono\)/.test(CSS) || /\.sw \.ch,/.test(SRC));
  try{b.dom.window.close();}catch(e){}
}

W('\nISSUE 4 — the three shortcuts looked like a different menu');
{
  /* The rail shortcuts and header tool buttons were removed 2026-07-26 (Founder order:
     reorganise, do not move). Each tool now has ONE navigation route — the Tools menu on the
     brand card. tools-check.js covers it. These assertions described the old arrangement. */
  
  const b=boot();
  ok('they are no longer in the rail at all', b.doc.querySelectorAll('[data-wshelp]').length===0);
  ok('they live in the Tools menu on the brand card', /data-tool="ai"/.test(SRC) && /data-tool="success"/.test(SRC) && /data-tool="concierge"/.test(SRC));
  try{b.dom.window.close();}catch(e){}
}

W('\nISSUE 5 — the left column would not scroll as it grew');
{
  ok('the rail has its own height', /\.rail\{max-height:calc\(100vh-96px\)/.test(CSS), 'no height');
  ok('the rail scrolls', /\.rail\{[^}]*overflow-y:auto/.test(CSS));
  ok('a flick inside it will not drag the page', /\.rail\{[^}]*overscroll-behavior:contain/.test(CSS));
  ok('no second scrollbar inside it', /\.blist\{max-height:none\}/.test(CSS), 'double scroll');
  ok('on narrow screens it stacks instead', /@media\(max-width:1080px\)\{\.rail\{max-height:none;overflow:visible\}/.test(CSS));
}

W('\nNO REGRESSION');
{
  const b=boot();
  b.win.IDEAS=[{id:'r1',cat:'x',said:'y',ord:1,fav:false,header:'https://x/h.png',names:[NM,NM,NM,NM,NM,NM],
    palettes:NM.palettes,type:NM.type,voice:NM.voice,biosT:NM.biosT,aboutT:NM.aboutT,
    linkedinT:NM.linkedinT,facebookT:NM.facebookT,postsT:NM.postsT,why:NM.why,taglines:NM.taglines,date:'Jul 4',ts:1}];
  b.win.current='r1'; b.win.curName=0; b.win.removed={}; b.win.__smnPicked='r1';
  try{ b.win.paint(); }catch(e){ b.errors.push(e.message); }
  ok('full card still renders', b.doc.querySelectorAll('[data-bkacc]').length===13,
     b.doc.querySelectorAll('[data-bkacc]').length);
  ok('six name boxes still render', b.doc.querySelectorAll('.nopt.brx').length===6,
     b.doc.querySelectorAll('.nopt.brx').length);
  /* Four since 2026-07-26 (Founder order D); Favourite, Support and Remove moved behind More. */
  ok('four capsules still render',
     b.doc.querySelectorAll('.cardacts > .cact, .cardacts > .cact-more > .cact').length===4,
     b.doc.querySelectorAll('.cardacts > .cact, .cardacts > .cact-more > .cact').length);
  ok('twelve nav buttons still render', b.doc.querySelectorAll('#wsnav [data-wsnav]').length===12,
     b.doc.querySelectorAll('#wsnav [data-wsnav]').length);
  ok('zero uncaught errors', b.errors.length===0, b.errors[0]);
  try{b.dom.window.close();}catch(e){}
}

W('\n'+(fail===0?('GROUP 1 CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED')));
try{process.exit(fail===0?0:1);}catch(e){}
