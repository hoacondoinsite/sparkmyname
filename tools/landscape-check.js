/* SHORT SCREENS (2026-07-26). Resolves the cascade at real viewport heights with postcss and
   asserts on the winning value. A phone on its side, a split-screen window and a car screen all
   have the same problem: plenty of width, almost no height. Nothing in this file had ever been
   keyed on height — there was not one max-height or orientation rule before today. */
'use strict';
const fs=require('fs'), path=require('path');
const postcss=require('postcss');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const PAGE=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
const CSS=[...PAGE.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const TREE=postcss.parse(CSS);
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,80)):''));} };

function matches(params,w,h){
  if(/print|hover:|pointer:|prefers-|orientation/.test(params)) return false;
  const mxw=/max-width:\s*(\d+)px/.exec(params), mnw=/min-width:\s*(\d+)px/.exec(params);
  const mxh=/max-height:\s*(\d+)px/.exec(params), mnh=/min-height:\s*(\d+)px/.exec(params);
  if(!mxw&&!mnw&&!mxh&&!mnh) return false;
  if(mxw && w>+mxw[1]) return false;
  if(mnw && w<+mnw[1]) return false;
  if(mxh && h>+mxh[1]) return false;
  if(mnh && h<+mnh[1]) return false;
  return true;
}
function resolve(w,h){
  const out={};
  const take=r=>r.selectors.forEach(sel=>{
    const k=sel.trim().replace(/\s+/g,' '); const bag=out[k]||(out[k]={});
    r.walkDecls(d=>bag[d.prop]=String(d.value).replace('!important','').trim()); });
  TREE.each(n=>{
    if(n.type==='rule') take(n);
    else if(n.type==='atrule'&&n.name==='media'&&matches(n.params,w,h)) n.each(c=>{ if(c.type==='rule') take(c); });
    else if(n.type==='atrule'&&n.name==='supports') n.each(c=>{ if(c.type==='rule') take(c); });
  });
  return out;
}
const G=(o,s,p)=>((o[s]||{})[p]||null);
const num=v=>v?parseFloat(v):0;

/* Real devices, on their side. */
const LAND_PHONE = resolve(844,390);   // iPhone / most Android phones, landscape
const LAND_SMALL = resolve(740,320);   // small phone, landscape
const KEYBOARD   = resolve(844,300);   // landscape with the keyboard up
const TABLET     = resolve(1180,820);  // tablet landscape — plenty of height
const DESKTOP    = resolve(1440,900);

W('A PHONE ON ITS SIDE — 844 x 390');
ok('the frame stops claiming vertical room', G(LAND_PHONE,'.shell','padding-top')==='8px',
   G(LAND_PHONE,'.shell','padding-top'));
ok('the header bar slims down', G(LAND_PHONE,'.bar-in','padding-top')==='6px',
   G(LAND_PHONE,'.bar-in','padding-top'));
ok('the AI panel keeps its content, not its chrome', G(LAND_PHONE,'.aimhead','padding')==='10px 16px',
   G(LAND_PHONE,'.aimhead','padding'));
ok('  and uses nearly the whole height', G(LAND_PHONE,'.aimcard','max-height')==='96dvh',
   G(LAND_PHONE,'.aimcard','max-height'));
ok('the command palette stops sitting a third of the way down',
   G(LAND_PHONE,'.cmdkwrap','padding-top')==='5dvh', G(LAND_PHONE,'.cmdkwrap','padding-top'));
ok('the brands flyout gets the screen', G(LAND_PHONE,'#brandpop:popover-open','max-height')==='88dvh',
   G(LAND_PHONE,'#brandpop:popover-open','max-height'));
ok('  its rows stay tappable at 48px', num(G(LAND_PHONE,'.bp-row','min-height'))>=48,
   G(LAND_PHONE,'.bp-row','min-height'));
ok('section headers stay tappable at 44px', num(G(LAND_PHONE,'.bkacc-h','min-height'))>=44,
   G(LAND_PHONE,'.bkacc-h','min-height'));
ok('the rail uses dvh, so a moving URL bar cannot cut it off',
   /dvh/.test(G(LAND_PHONE,'.rail','max-height')||''), G(LAND_PHONE,'.rail','max-height'));

W('\nA SMALL PHONE ON ITS SIDE — 740 x 320');
ok('the same rules apply', G(LAND_SMALL,'.shell','padding-top')==='8px');
ok('touch targets are not sacrificed', num(G(LAND_SMALL,'.bkacc-h','min-height'))>=44);

W('\nLANDSCAPE WITH THE KEYBOARD UP — 844 x 300');
ok('the header stops sticking', G(KEYBOARD,'.bar','position')==='static', G(KEYBOARD,'.bar','position'));
ok('the rail stops capping its height', G(KEYBOARD,'.rail','max-height')==='none',
   G(KEYBOARD,'.rail','max-height'));
ok('the palette rises to the top', G(KEYBOARD,'.cmdkwrap','padding-top')==='2dvh',
   G(KEYBOARD,'.cmdkwrap','padding-top'));

W('\nTALL SCREENS ARE UNTOUCHED');
ok('tablet keeps its normal padding', G(TABLET,'.shell','padding-top')!=='8px',
   G(TABLET,'.shell','padding-top'));
ok('desktop header still sticks', G(DESKTOP,'.bar','position')!=='static', G(DESKTOP,'.bar','position'));
ok('desktop palette keeps its position', G(DESKTOP,'.cmdkwrap','padding-top')==='12vh',
   G(DESKTOP,'.cmdkwrap','padding-top'));

W('\nHEIGHT SWEEP — 280px to 1200px');
let bad=[];
for(let h=280; h<=1200; h+=8){
  const r=resolve(844,h);
  const shortRules = G(r,'.shell','padding-top')==='8px';
  if(h<=500 && !shortRules) bad.push(h+': short rules missing');
  if(h>500 && shortRules) bad.push(h+': short rules leaking into a tall screen');
  if(num(G(r,'.bkacc-h','min-height'))<44) bad.push(h+': section header under 44px');
}
ok('every height resolves correctly', bad.length===0, bad.slice(0,3).join(' | '));
W('  heights swept: 116 (280 to 1200 in 8px steps)');

W('');
W(fail===0?('SHORT SCREENS CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
