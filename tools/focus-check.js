/* KEYBOARD AND SCREEN-READER BEHAVIOUR OF OVERLAYS (2026-07-26)
   Opening the account panel, the AI Studio, the concierge or the Success Path left focus behind
   the overlay. A mouse user never notices. Someone on a keyboard carried on tabbing through the
   page underneath — invisible to them — and a screen reader read a page they could not see.
   Closing dropped focus to <body>, so they started again from the top.
   The brands flyout was already correct, because it is a native popover and the browser does
   all of this for free. That is what is being reproduced for the rest. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
function source(){ let s=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  return s.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g,(m,r)=>{
    try{ return '<scr'+'ipt>'+fs.readFileSync(path.join(ROOT,r),'utf8')+'</scr'+'ipt>'; }catch(e){ return m; }}); }
const SRC=source();
const CORE=fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

function boot(){
  const errs=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  const dom=new JSDOM(SRC,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errs.push(e.message));}});
  const w=dom.window;
  const NM=n=>({name:'N'+n,mono:'M'+n,dom:'n.com',st:'Available',tag:'t',heroUrl:'https://x/'+n+'.png',
   logos:['https://x/a.png'],why:['a'],palettes:[{name:'P',note:'n',cols:['#111','#222','#333','#444']}],
   type:[{name:'S',note:'x'}],voice:[{name:'V',note:'x'}],taglines:['t'],biosT:['b'],aboutT:['a'],
   linkedinT:['l'],facebookT:['f'],postsT:['p']});
  const I={id:'r1',cat:'x',said:'y',ord:9,fav:false,header:'https://x/h.png',names:[0,1,2,3,4,5].map(NM),
   palettes:NM(0).palettes,type:NM(0).type,voice:NM(0).voice,biosT:['b'],aboutT:['a'],linkedinT:['l'],
   facebookT:['f'],postsT:['p'],why:['a'],taglines:['t'],date:'J',ts:1};
  w.IDEAS=[I]; w.current='r1'; w.curName=0; w.removed={}; w.__smnPicked='r1';
  try{ w.paint(); }catch(e){ errs.push('paint: '+e.message); }
  return {dom,win:w,doc:w.document,errs};
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));

(async ()=>{
  W('EVERY OVERLAY ANNOUNCES ITSELF');
  {
    const b=boot();
    [['#acctOv','account panel'],['#cpanel','concierge'],['#brandpop','brands flyout'],
     ['#modal','modal'],['#aiOv','AI Studio'],['#sxOv','Success Path']].forEach(([sel,label])=>{
      const el=b.doc.querySelector(sel);
      ok(label+' is a dialog', !!el && el.getAttribute('role')==='dialog', el?el.getAttribute('role'):'missing');
      ok('  '+label+' has a name', !!el && !!(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')));
    });
    b.dom.window.close();
  }

  W('\nFOCUS MOVES IN, AND COMES BACK');
  {
    const b=boot();
    const trigger=b.doc.querySelector('#wsnav [data-wsnav="purchases"]') || b.doc.querySelector('button');
    trigger.focus();
    const before=b.doc.activeElement;
    ok('focus starts on the button that opens it', before===trigger);
    b.win.openAccount('purchases');
    await wait(60);
    const ov=b.doc.getElementById('acctOv');
    ok('focus moves inside the panel', ov.contains(b.doc.activeElement),
       b.doc.activeElement ? b.doc.activeElement.tagName+'.'+(b.doc.activeElement.className||'') : 'null');
    b.win.closeAccount();
    await wait(20);
    ok('focus returns to where it came from', b.doc.activeElement===before,
       b.doc.activeElement===b.doc.body ? 'fell to <body>' : (b.doc.activeElement||{}).tagName);
    b.dom.window.close();
  }

  W('\nTAB STAYS INSIDE AN OPEN OVERLAY');
  {
    const b=boot();
    b.win.openAccount('overview');
    await wait(60);
    const ov=b.doc.getElementById('acctOv');
    const inside=[...ov.querySelectorAll('button,a[href],input,select,textarea')].filter(e=>!e.hidden);
    ok('the panel has focusable controls', inside.length>0, inside.length);
    if(inside.length){
      inside[inside.length-1].focus();
      b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));
      await wait(10);
      ok('Tab from the last control wraps to the first', ov.contains(b.doc.activeElement),
         b.doc.activeElement===b.doc.body?'escaped to <body>':'stayed inside');
      inside[0].focus();
      b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));
      await wait(10);
      ok('Shift+Tab from the first wraps to the last', ov.contains(b.doc.activeElement));
    }
    b.win.closeAccount();
    b.dom.window.close();
  }

  W('\nTHE IMPLEMENTATION IS SOUND');
  ok('one manager, not four copies', (CORE.match(/var SMN_FOCUS/g)||[]).length===1);
  ok('it remembers the element focus came from', /from: document\.activeElement/.test(CORE));
  ok('it only restores an element still on the page', /document\.contains\(from\)/.test(CORE));
  ok('it skips hidden controls', /el\.hidden\) return false/.test(CORE));
  ok('  and aria-hidden ones', /aria-hidden'\)==='true'/.test(CORE));
  ok('it nests, so one overlay over another still returns correctly', /stack\.push/.test(CORE) && /stack\.splice/.test(CORE));
  ok('every overlay opens through it',
     ['acctOv','cpanel','sxOv','aiOv'].every(id=>CORE.indexOf("SMN_FOCUS.open($('#"+id+"'))")>=0));
  ok('every overlay closes through it',
     ['acctOv','cpanel','sxOv','aiOv'].every(id=>CORE.indexOf("SMN_FOCUS.close($('#"+id+"'))")>=0));
  ok('the native popover is left alone', !/SMN_FOCUS\.open\(\$\('#brandpop'\)\)/.test(CORE));

  W('');
  W(fail===0?('FOCUS CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
  process.exit(fail===0?0:1);
})();
