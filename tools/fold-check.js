/* FOLDABLE + TABLET RANGES (2026-07-26).
   Resolves the cascade with a REAL CSS parser (postcss) rather than a hand-rolled one. The
   first version of this file used regexes to walk the stylesheet and reported six failures
   that were its own bugs, not the site's — the same mistake made nine times today. postcss
   removes that whole class of error: it parses the stylesheet properly, and this only decides
   which media queries match and in what order, which is a much smaller thing to get wrong. */
'use strict';
const fs=require('fs'), path=require('path');
const postcss=require('postcss');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
/* The stylesheet lives in workspace.html. The external core is JavaScript, and it contains
   CSS inside template strings — inlining it here fed postcss a mixture of real stylesheet and
   quoted fragments, which it rightly refused to parse. Only the page's own <style> blocks are
   a stylesheet. */
const SRC=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
const CSS=[...SRC.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const ROOTNODE=postcss.parse(CSS);

let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

function queryMatches(params, w){
  if(/print|hover:|pointer:|prefers-|orientation/.test(params)) return false;
  const mx=/max-width:\s*(\d+(?:\.\d+)?)px/.exec(params);
  const mn=/min-width:\s*(\d+(?:\.\d+)?)px/.exec(params);
  if(!mx && !mn) return false;
  if(mx && w > parseFloat(mx[1])) return false;
  if(mn && w < parseFloat(mn[1])) return false;
  return true;
}
/* Walk in source order, collecting declarations for a width. Later wins, which is how a
   browser resolves equal-specificity rules. */
function resolve(width){
  const out={};
  function collectRule(rule){
    rule.selectors.forEach(sel=>{
      const key=sel.trim().replace(/\s+/g,' ');
      const bag=out[key]||(out[key]={});
      rule.walkDecls(d=>{ bag[d.prop]=String(d.value).trim(); });
    });
  }
  ROOTNODE.each(node=>{
    if(node.type==='rule') collectRule(node);
    else if(node.type==='atrule'){
      if(node.name==='media'){ if(queryMatches(node.params,width)) node.each(n=>{ if(n.type==='rule') collectRule(n); }); }
      else if(node.name==='supports'){ node.each(n=>{ if(n.type==='rule') collectRule(n); }); }
    }
  });
  return out;
}
const G=(o,sel,prop)=>((o[sel]||{})[prop]||null);
const px=(v)=>v?parseFloat(v):0;

const COVER=resolve(344), INNER=resolve(673), PHONE=resolve(390), TABLET=resolve(820), DESK=resolve(1440);

W('COVER SCREEN — 344px (folded)');
ok('capsules become a 2x2 grid', G(COVER,'.cardacts','grid-template-columns')==='1fr 1fr', G(COVER,'.cardacts','grid-template-columns'));
ok('nav buttons reach 44px', px(G(COVER,'.wsnav button','min-height'))>=44, G(COVER,'.wsnav button','min-height'));
/* .wshelp was removed 2026-07-26; the Tools menu items carry the touch target now. */
ok('Tools menu items reach 44px', px(G(COVER,'.cact-mi','min-height'))>=44, G(COVER,'.cact-mi','min-height'));
ok('the favourite heart reaches 44px', px(G(COVER,'.irow .fav','height'))>=44, G(COVER,'.irow .fav','height'));
ok('section headers reach 48px', px(G(COVER,'.bkacc-h','min-height'))>=48, G(COVER,'.bkacc-h','min-height'));
ok('tabs reach 44px', px(G(COVER,'.tab','min-height'))>=44, G(COVER,'.tab','min-height'));
ok('long domains wrap', /anywhere|break-word/.test(G(COVER,'.wa-domain','overflow-wrap')||''), G(COVER,'.wa-domain','overflow-wrap'));
ok('brand still comes first', G(COVER,'.main','order')==='1' && G(COVER,'.rail','order')==='2',
   G(COVER,'.main','order')+'/'+G(COVER,'.rail','order'));

W('\nINNER SCREEN — 673px (unfolded)');
ok('two columns, not one', /196px/.test(G(INNER,'.shell','grid-template-columns')||''), G(INNER,'.shell','grid-template-columns'));
ok('the rail sits beside the brand', G(INNER,'.rail','position')==='sticky', G(INNER,'.rail','position'));
ok('  neither forced below the other', G(INNER,'.main','order')==='0' && G(INNER,'.rail','order')==='0',
   G(INNER,'.main','order')+'/'+G(INNER,'.rail','order'));
ok('the rail scrolls on its own', /auto/.test(G(INNER,'.rail','overflow-y')||''), G(INNER,'.rail','overflow-y'));
ok('capsules stay in one row', G(INNER,'.cardacts','grid-template-columns')!=='1fr 1fr', G(INNER,'.cardacts','grid-template-columns'));

W('\nAN ORDINARY PHONE — 390px');
ok('brand first', G(PHONE,'.main','order')==='1', G(PHONE,'.main','order'));
ok('capsules 2x2', G(PHONE,'.cardacts','grid-template-columns')==='1fr 1fr', G(PHONE,'.cardacts','grid-template-columns'));
ok('single column', G(PHONE,'.shell','grid-template-columns')==='1fr', G(PHONE,'.shell','grid-template-columns'));

W('\nA TABLET IN PORTRAIT — 820px');
ok('two columns', /196px/.test(G(TABLET,'.shell','grid-template-columns')||''), G(TABLET,'.shell','grid-template-columns'));
ok('capsules in one row', G(TABLET,'.cardacts','grid-template-columns')!=='1fr 1fr');

W('\nDESKTOP UNTOUCHED — 1440px');
ok('the full-width rail returns', /236px/.test(G(DESK,'.shell','grid-template-columns')||''), G(DESK,'.shell','grid-template-columns'));
ok('no 2x2 capsules', G(DESK,'.cardacts','grid-template-columns')!=='1fr 1fr', G(DESK,'.cardacts','grid-template-columns'));
ok('rail sticky as before', G(DESK,'.rail','position')==='sticky', G(DESK,'.rail','position'));

W('\nEVERY WIDTH FROM 320 TO 1920 — STRUCTURAL SWEEP');
let bad=[];
for(let w=320; w<=1920; w+=8){
  const r=resolve(w);
  const shell=G(r,'.shell','grid-template-columns');
  if(!shell) { bad.push(w+': shell has no columns'); continue; }
  const caps=G(r,'.cardacts','grid-template-columns');
  if(w<=430 && caps!=='1fr 1fr') bad.push(w+': capsules not 2x2');
  if(w>600 && w<1080 && !/196px/.test(shell)) bad.push(w+': tablet range lost its two columns');
  if(w>=1080 && !/236px/.test(shell)) bad.push(w+': desktop lost its rail');
}
ok('all 201 widths resolve correctly', bad.length===0, bad.slice(0,3).join(' | '));
W('  widths swept: 201 (320 to 1920 in 8px steps)');

W('');
W(fail===0?('FOLD RANGES CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
