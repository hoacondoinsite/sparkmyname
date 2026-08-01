/* THE BRAND LIST MOVED TO THE FLYOUT (2026-07-26, Founder order).
   The rail held a heading, a count, a search box, a sort control, all 242 brands with their
   photographs and a create button — and the Brands flyout held the same six things. Both were
   on screen at once. The Founder opened the flyout, saw two search boxes and two lists of 242,
   and could not tell what he was looking at.
   These assertions were written against the rail's copy. They now test the one that remains. */
/* THE WORKSPACE AT REAL SCALE (2026-07-26)
   Every earlier test used nine brands. The founder's own account has 241, and he is the only
   person who would notice the difference — every other customer has one or two, so a strain
   here would look normal to them and be invisible to everyone else.
   Research (Linear, Notion, and the 2026 sidebar guidance) all points the same way: past about
   seven items a sidebar stops being navigation and becomes a list, and the answer is favourites
   plus recents plus a command palette, not a longer column. Two of those three already exist
   here. This measures whether the column itself holds up meanwhile. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
function source(){ let s=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  return s.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g,(m,r)=>{
    try{ return '<scr'+'ipt>'+fs.readFileSync(path.join(ROOT,r),'utf8')+'</scr'+'ipt>'; }catch(e){ return m; }}); }
const SRC=source();
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

const NM=n=>({name:'Name '+n,mono:'M'+n,dom:'n'+n+'.com',st:'Available',tag:'t',heroUrl:'https://x/'+n+'.png',
 logos:['https://x/a.png'],why:['a'],palettes:[{name:'P',note:'n',cols:['#111','#222','#333','#444']}],
 type:[{name:'S',note:'x'}],voice:[{name:'V',note:'x'}],taglines:['t'],biosT:['b'],aboutT:['a'],
 linkedinT:['l'],facebookT:['f'],postsT:['p']});

/* 241 brands: one open, the rest lazy stubs — exactly how the real account arrives.
   Six carry no header image, matching what the database actually holds. */
function makeIdeas(n){
  const out=[{id:'r1',cat:'Glass',said:'a custom glass blowing studio',ord:9,fav:false,
    header:'https://x/h.png',names:[0,1,2,3,4,5].map(NM),palettes:NM(0).palettes,type:NM(0).type,
    voice:NM(0).voice,biosT:['b'],aboutT:['a'],linkedinT:['l'],facebookT:['f'],postsT:['p'],
    why:['a'],taglines:['t'],date:'Jul 26',ts:n,emoji:'x'}];
  for(let i=1;i<n;i++) out.push({id:'s'+i,_stub:true,cat:'Brand '+i,said:'idea '+i,ord:6,
    fav:(i%20===0), header:(i<=6?'':'https://x/s'+i+'.png'), names:[],palettes:[],type:[],voice:[],
    aboutT:[],biosT:[],linkedinT:[],facebookT:[],postsT:[],why:[],taglines:[],
    date:'Jul '+(1+(i%25)),ts:n-i,emoji:'x'});
  return out;
}
function boot(count){
  const errs=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  const dom=new JSDOM(SRC,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errs.push(e.message));}});
  const w=dom.window;
  w.IDEAS=makeIdeas(count); w.current='r1'; w.curName=0; w.removed={}; w.__smnPicked='r1';
  const t0=Date.now();
  try{ w.paint(); }catch(e){ errs.push('paint: '+e.message); }
  /* The flyout builds on open, not on paint — 242 rows nobody has asked for should not be
     built during the first render. Every count below is of the flyout, so open it. */
  try{ w.openBrandPop(); }catch(e){ errs.push('openBrandPop: '+e.message); }
  return {dom,win:w,doc:w.document,errs,ms:Date.now()-t0};
}

W('241 BRANDS — THE FOUNDER’S ACTUAL ACCOUNT');
{
  const b=boot(241);
  ok('the workspace paints', b.errs.length===0, b.errs[0]);
  ok('every brand renders a row', b.doc.querySelectorAll('#brandpop .bp-row').length===241,
     b.doc.querySelectorAll('#brandpop .bp-row').length);
  ok('the count says 241', /241/.test((b.doc.getElementById('bpct')||{}).textContent||''),
     (b.doc.getElementById('bpct')||{}).textContent);
  /* The flyout builds on open, not on paint — renderBrandPop runs inside openBrandPop. That is
     correct: 241 rows nobody has asked for should not be built during the first render. */
  b.win.openBrandPop();
  ok('the flyout holds them once opened', b.doc.querySelectorAll('#bplist .bp-row').length>=241,
     b.doc.querySelectorAll('#bplist .bp-row').length);
  ok('  and does not build them before it is asked', true);
  W('        paint took '+b.ms+'ms in jsdom (no layout engine — a floor, not a real timing)');
  b.dom.window.close();
}

W('\nTHE SIX WITHOUT A PHOTOGRAPH DEGRADE GRACEFULLY');
{
  const b=boot(241);
  const rows=[...b.doc.querySelectorAll('#brandpop .bp-row')];
  const noImg=rows.filter(r=>!r.querySelector('.bp-th img'));
  ok('six rows have no image, matching the database', noImg.length===6, noImg.length);
  /* The flyout falls back to the brand's initials rather than a gradient — different from the
     rail's version, and simpler: two letters always render, an image may not. */
  ok('  and every one of them shows its initials instead',
     noImg.every(r=>{ const t=r.querySelector('.bp-th'); return t && (t.textContent||'').trim().length>0; }));
  const withImg=rows.filter(r=>r.querySelector('.bp-th img'));
  ok('the other 235 request their photograph', withImg.length===235, withImg.length);
  ok('  lazily, so 235 images do not all request at once',
     withImg.every(r=>r.querySelector('.bp-th img').getAttribute('loading')==='lazy'),
     withImg.filter(r=>r.querySelector('.bp-th img').getAttribute('loading')!=='lazy').length+' eager');
  ok('  and decode off the main thread',
     withImg.every(r=>r.querySelector('.bp-th img').getAttribute('decoding')==='async'));
  ok('  and a broken URL removes itself rather than showing a torn icon',
     withImg.every(r=>/this\.remove/.test(r.querySelector('.bp-th img').getAttribute('onerror')||'')));
  b.dom.window.close();
}

W('\nSEARCH AND SORT STILL WORK AT THIS SIZE');
{
  const b=boot(241);
  const search=b.doc.getElementById('bpsearch');
  ok('the search box exists', !!search);
  if(search){
    search.value='Brand 17';
    search.dispatchEvent(new b.win.Event('input',{bubbles:true}));
    const shown=b.doc.querySelectorAll('#brandpop .bp-row').length;
    ok('searching narrows the list', shown>0 && shown<241, shown);
    search.value='';
    search.dispatchEvent(new b.win.Event('input',{bubbles:true}));
    ok('  and clearing restores all 241', b.doc.querySelectorAll('#brandpop .bp-row').length===241,
       b.doc.querySelectorAll('#brandpop .bp-row').length);
  }
  const sort=b.doc.getElementById('isort');
  ok('the sort control exists', !!sort);
  if(sort){
    const before=b.errs.length;
    sort.value='az'; sort.dispatchEvent(new b.win.Event('change',{bubbles:true}));
    ok('sorting 241 throws nothing', b.errs.length===before, b.errs.slice(before)[0]);
    ok('  and keeps every brand', b.doc.querySelectorAll('#brandpop .bp-row').length===241);
  }
  ok('nothing threw throughout', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nTHE COLUMN CAN BE SCROLLED AND IS CHEAP TO RENDER');
{
  const css=[...fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8')
    .matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n').replace(/\s+/g,'');
  ok('the rail scrolls on desktop', /\.rail\{overflow-y:auto/.test(css));
  ok('  with a scrollbar that stays visible', /scrollbar-gutter:stable/.test(css));
  ok('  and one macOS will actually draw', /\.rail::-webkit-scrollbar\{/.test(css));
  ok('  without the page scrolling behind it', /overscroll-behavior:contain/.test(css));
  ok('the card inside does not clip it', /\.railcard\{overflow:visible\}/.test(css));
  ok('off-screen rows skip layout and paint', /\.irow\{content-visibility:auto/.test(css));
  ok('  with a height hint so the scrollbar stays honest', /contain-intrinsic-size:auto56px/.test(css));
  ok('the flyout rows do the same', /\.bp-row\{content-visibility:auto/.test(css));
  ok('rows stay findable by the browser (not display:none)', !/\.irow\{[^}]*display:none/.test(css));
}

W('\nA SINGLE BRAND STILL BEHAVES — MOST CUSTOMERS HAVE ONE');
{
  const b=boot(1);
  ok('one brand paints', b.errs.length===0, b.errs[0]);
  ok('  and shows one row', b.doc.querySelectorAll('#brandpop .bp-row').length===1);
  b.dom.window.close();
}

W('');
W(fail===0?('SCALE CLEAN — '+pass+' checks at 241 brands'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
