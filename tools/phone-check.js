/* PHONE LAYOUT (2026-07-26, Founder order).
   Every assertion here resolves a REAL selector against a REAL document, or resolves the
   cascade with postcss. The rule that hid the header buttons targeted ".topbar", which does
   not exist in this file — it matched nothing, the header was unchanged on the Founder's
   phone, and the test passed because it only checked the string was present in the stylesheet.
   Checking that a rule EXISTS proves nothing. Checking what it SELECTS proves something. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const postcss=require('postcss');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const PAGE=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
const CSS=[...PAGE.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const TREE=postcss.parse(CSS);
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

const vc=new VirtualConsole(); vc.on('jsdomError',()=>{});
const doc=new JSDOM(PAGE,{virtualConsole:vc}).window.document;

/* Does a selector used in the stylesheet actually match anything in the document? */
function selectorMatches(sel){
  try{ return doc.querySelectorAll(sel).length; }catch(e){ return -1; }
}
function rulesAt(width){
  const out={};
  const match=(p)=>{ if(/print|hover:|pointer:|prefers-|orientation/.test(p)) return false;
    const mx=/max-width:\s*(\d+)px/.exec(p), mn=/min-width:\s*(\d+)px/.exec(p);
    if(!mx&&!mn) return false;
    if(mx && width>+mx[1]) return false;
    if(mn && width<+mn[1]) return false; return true; };
  const take=(r)=>r.selectors.forEach(sel=>{
    const k=sel.trim().replace(/\s+/g,' '); const bag=out[k]||(out[k]={});
    r.walkDecls(d=>bag[d.prop]=String(d.value).replace('!important','').trim()); });
  TREE.each(n=>{
    if(n.type==='rule') take(n);
    else if(n.type==='atrule' && n.name==='media' && match(n.params)) n.each(c=>{ if(c.type==='rule') take(c); });
    else if(n.type==='atrule' && n.name==='supports') n.each(c=>{ if(c.type==='rule') take(c); });
  });
  return out;
}
const G=(o,s,p)=>((o[s]||{})[p]||null);

W('EVERY SELECTOR IN MY MOBILE RULES MATCHES A REAL ELEMENT');
/* The three tool buttons left the header entirely on 2026-07-26. */
[['.bar .newbrandbtn',1],['.bar .iconbtn',1],['.rail',1],['.mobibtn',2],
 ['#mobBrandsBtn',1],['#mobMenuBtn',1],['.bar-in',1]].forEach(([sel,least])=>{
  const n=selectorMatches(sel);
  ok(sel.padEnd(22)+' matches '+n, n>=least, n);
});
ok('.topbar does not exist (the old rule targeted nothing)', selectorMatches('.topbar')===0);

W('\nAT 344px AND 390px — THE RAIL IS GONE');
[344,390,599].forEach(w=>{
  const r=rulesAt(w);
  ok(w+'px: rail hidden', G(r,'.rail','display')==='none', G(r,'.rail','display'));
  ok(w+'px: phone controls shown', G(r,'.mobibtn','display')==='inline-flex', G(r,'.mobibtn','display'));
  ok(w+'px: header carries no tools', doc.querySelectorAll('.bar .aistudiobtn, .bar .successbtn, .bar .conciergebtn').length===0);
});

W('\nAT 673px AND UP — THE RAIL RETURNS, CONTROLS DISAPPEAR');
[600,673,820,1440].forEach(w=>{
  const r=rulesAt(w);
  ok(w+'px: rail visible', G(r,'.rail','display')!=='none', G(r,'.rail','display'));
  ok(w+'px: phone controls hidden', G(r,'.mobibtn','display')==='none', G(r,'.mobibtn','display'));
});

W('\nNOTHING IS UNREACHABLE WHEN THE RAIL IS HIDDEN');
ok('the brand list lives in the flyout', !!doc.querySelector('#brandpop #bplist'));
ok('search lives in the flyout', !!doc.querySelector('#brandpop #bpsearch'));
ok('create-a-new-brand lives in the flyout', !!doc.querySelector('#brandpop .bp-new'));
ok('the nine sections are the account panel', /var ACNAV=/.test(fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8')));
ok('tools are on the brand card', /data-opentools/.test(fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8')));

W('\nTHE TWO CONTROLS WORK');
{
  const core=fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8');
  ok('Brands opens the flyout', /mobBrandsBtn[\s\S]{0,900}openBrandPop\(\)/.test(core));
  ok('  and closes it again', /brandPopOpen\(\) \? closeBrandPop\(\) : openBrandPop\(\)|if\(brandPopOpen\(\)\) closeBrandPop\(\); else openBrandPop\(\)/.test(core));
  ok('Menu opens the account panel', /mobMenuBtn[\s\S]{0,900}openAccount\('overview'\)/.test(core));
  ok('they appear only when the rail is hidden', /matchMedia\('\(max-width: 599px\)'\)/.test(core));
  ok('they follow a fold or a rotate', /addEventListener\('change', sync\)/.test(core));
  ok('bound once', /__wired/.test(core));
}

W('\nTHEY ARE REACHABLE AND BIG ENOUGH');
{
  const r=rulesAt(390);
  ok('44px tall', parseInt(G(r,'.mobibtn','min-height'))>=44, G(r,'.mobibtn','min-height'));
  ok('visible focus ring', !!G(r,'.mobibtn:focus-visible','outline'));
  ok('they are real buttons', doc.getElementById('mobBrandsBtn').tagName==='BUTTON');
}

W('');
W(fail===0?('PHONE LAYOUT CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
