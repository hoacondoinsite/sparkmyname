
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
/* CANONICAL HEADER (2026-07-25) — every customer page, real DOM. Same shape, working
   language and currency, symbol-led, and no sales button in the navigation furniture. */
'use strict';
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const INTERNAL=new Set(['artdirector.html','vorrex.html','olin.html','shoot.html','qa-batch.html',
 'quality-check.html','film-test.html','video-forge-internal-4t4o.html','james.html','video.html',
 'command.html','workspace.html','affiliate.html','my-brands.html','status.html']);
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')&&!INTERNAL.has(f)).sort();
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

W('CHECKING '+pages.length+' CUSTOMER PAGES');
let firstShape=null;
pages.forEach(p=>{
  const errs=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  const dom=new JSDOM(fs.readFileSync(path.join(ROOT,p),'utf8'),{
    runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/'+p,virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errs.push(e.message));}});
  const d=dom.window.document;
  d.dispatchEvent(new dom.window.Event('DOMContentLoaded',{bubbles:true}));

  ok(p+' loads without error', errs.length===0, errs[0]);
  const hd=d.querySelector('header.hd');
  ok(p+' has a header', !!hd);
  if(!hd){ try{dom.window.close();}catch(e){} return; }

  ok(p+' wordmark links home', !!hd.querySelector('a.wm[href="index.html"]'));
  const nav=[...hd.querySelectorAll('.nav a')].map(a=>a.textContent.trim());
  ok(p+' has five destinations', nav.length===5, nav.join(','));
  if(!firstShape) firstShape=nav.join('|');
  else ok(p+' navigation matches every other page', nav.join('|')===firstShape, nav.join('|'));

  ok(p+' language control present', !!hd.querySelector('#lang'));
  ok(p+' currency control present', !!hd.querySelector('#cur'));
  ok(p+' globe symbol present', !!hd.querySelector('.hdsel-i'));
  ok(p+' currency glyph present', !!hd.querySelector('#curSym'));
  ok(p+' log in present', !!hd.querySelector('a.lg'));

  const clean=hd.innerHTML.replace(/<!--[\s\S]*?-->/g,'');
  ok(p+' NO sales button in the header', clean.indexOf('Start Your Spark')<0);

  ok(p+' language is labelled', !!d.querySelector('label[for="lang"]'));
  ok(p+' currency is labelled', !!d.querySelector('label[for="cur"]'));

  /* the controls must actually work on this page */
  const cur=d.getElementById('cur');
  if(cur){
    cur.value='EUR'; cur.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
    const glyph=d.getElementById('curSym').textContent;
    ok(p+' currency glyph follows the selection', glyph==='\u20AC', glyph);
    const price=d.querySelector('[data-price]');
    if(price) ok(p+' price converts', price.textContent.indexOf('\u20AC')===0, price.textContent);
  }
  const lang=d.getElementById('lang');
  if(lang){
    lang.value='es'; lang.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
    const f=[...d.querySelectorAll('[data-i18n="nav1"]')][0];
    if(f) ok(p+' language changes the nav', f.textContent==='Funciones', f.textContent);
  }
  try{dom.window.close();}catch(e){}
});
W('');
W(fail===0 ? ('HEADER CONSISTENT — '+pass+' checks across '+pages.length+' pages')
           : (pass+' passed, '+fail+' FAILED'));
try{process.exit(fail===0?0:1);}catch(e){}
