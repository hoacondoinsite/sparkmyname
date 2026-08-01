/* TOOLS REORGANISATION (2026-07-26, Founder order: reorganise, do not move).
   Each tool had three or four routes — page header, left rail, and the brand itself. This
   proves there is now ONE navigation route per tool, that it lives inside the brand, and that
   every opener still fires. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const postcss=require('postcss');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
function source(){ let s=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  return s.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g,(m,r)=>{
    try{ return '<scr'+'ipt>'+fs.readFileSync(path.join(ROOT,r),'utf8')+'</scr'+'ipt>'; }catch(e){ return m; }}); }
const SRC=source(), CORE=fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,100)):''));} };

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
  return {dom,win:w,doc:w.document,errs,main:w.document.getElementById('main')};
}

W('ONE NAVIGATION ROUTE PER TOOL');
{
  const b=boot();
  const d=b.doc;
  ok('the page header no longer carries tools',
     !d.querySelector('#aiStudioBtn') && !d.querySelector('#successBtn') && !d.querySelector('#conciergeBtn'),
     [d.querySelector('#aiStudioBtn'),d.querySelector('#successBtn'),d.querySelector('#conciergeBtn')].filter(Boolean).length+' left');
  ok('the rail no longer carries tools', d.querySelectorAll('[data-wshelp]').length===0,
     d.querySelectorAll('[data-wshelp]').length);
  ok('the Tools capsule is inside the brand', !!b.main.querySelector('[data-opentools]'));
  ok('  and it is a menu, not a shortcut', !!b.main.querySelector('.tools-menu'));
  ['ai','success','concierge'].forEach(t=>
    ok('  '+t+' is in the menu', !!b.main.querySelector('[data-tool="'+t+'"]')));
  ok('each item explains itself', b.main.querySelectorAll('.tools-menu .mi-s').length===3,
     b.main.querySelectorAll('.tools-menu .mi-s').length);
  b.dom.window.close();
}

W('\nTHE MENU BEHAVES');
{
  const b=boot();
  const btn=b.main.querySelector('[data-opentools]');
  const menu=b.main.querySelector('.tools-menu');
  ok('it starts closed', menu.hidden===true);
  ok('  and says so', btn.getAttribute('aria-expanded')==='false');
  btn.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('pressing Tools opens it', menu.hidden===false);
  ok('  and announces it', btn.getAttribute('aria-expanded')==='true');
  btn.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('pressing again closes it', menu.hidden===true);
  btn.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Escape closes it', menu.hidden===true);
  btn.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  b.doc.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('clicking away closes it', menu.hidden===true);
  b.dom.window.close();
}

W('\nEVERY OPENER STILL FIRES');
{
  ['ai','success','concierge'].forEach(t=>{
    const b=boot();
    const btn=b.main.querySelector('[data-opentools]');
    btn.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
    const item=b.main.querySelector('[data-tool="'+t+'"]');
    const before=b.errs.length;
    try{ item.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true})); }catch(e){ b.errs.push(e.message); }
    ok(t+' opens without error', b.errs.length===before, b.errs.slice(before)[0]);
    ok('  and the menu closes behind it', b.main.querySelector('.tools-menu').hidden===true);
    b.dom.window.close();
  });
}

W('\nTHE OPENERS THEMSELVES ARE UNTOUCHED');
['openAIStudio','openSuccess','openConcierge'].forEach(fn=>
  ok(fn+' still exists', CORE.indexOf('function '+fn) >= 0 || CORE.indexOf(fn+'=function') >= 0
     || CORE.indexOf('window.'+fn+'=') >= 0));
ok('nothing was reimplemented', /TOOLS=\{ ai:'openAIStudio', success:'openSuccess', concierge:'openConcierge' \}/.test(CORE));

W('\nNO DEAD CODE LEFT BEHIND');
ok('the rail binder is gone', !/function bindWsHelp\(\)/.test(CORE));
ok('  and is not called', !/bindWsHelp\(\)/.test(CORE.replace(/bindWsHelp is gone[\s\S]{0,300}/,'')));
ok('its CSS is gone', !/\.wshelp\b/.test(SRC));
ok('removed header handlers are guarded', /_successBtn\)\s*_successBtn\.addEventListener/.test(CORE));

W('\nSTILL REACHABLE, STILL CORRECT');
{
  const b=boot();
  ok('a new brand is still one tap away', !!b.doc.querySelector('.newbrandbtn')||!!b.doc.querySelector('.bp-new'));
  ok('Support is still in the More menu', !!b.main.querySelector('[data-support]'));
  ok('four capsules, not five', b.main.querySelectorAll('.cardacts > .cact, .cardacts > .cact-more > .cact').length===4,
     b.main.querySelectorAll('.cardacts > .cact, .cardacts > .cact-more > .cact').length);
  ok('nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}
/* The stylesheet is the PAGE's <style> blocks. SRC has the JavaScript core inlined, and that
   core builds CSS inside template strings — parsing it as a stylesheet fails on the string
   concatenation. Same mistake fold-check made; same fix. */
const PAGE=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
const css=[...PAGE.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
try{ postcss.parse(css); ok('the stylesheet still parses', true); }catch(e){ ok('the stylesheet still parses', false, e.message); }

W('');
W(fail===0?('TOOLS CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
