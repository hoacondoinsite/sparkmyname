/* CONTAINER QUERIES (2026-07-26).
   The brand card lives in what the rail leaves behind, not in the window. This resolves each
   @container block against the CARD's real width — computed from the window minus the rail,
   the gap and the shell padding — and asserts the right rules win. */
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

/* What the card actually gets, from the layout rules this file now uses. */
function cardWidth(win){
  const rail = win < 600 ? 0 : (win < 1080 ? 196 : 236);
  const gap  = win < 600 ? 0 : (win < 1080 ? 16 : 20);
  const pad  = Math.max(12, Math.min(22, win*0.022)) * 2;
  return Math.round(Math.min(win, 1440) - rail - gap - pad);
}
function containerMatches(params, cw){
  const mx=/max-width:\s*(\d+)px/.exec(params), mn=/min-width:\s*(\d+)px/.exec(params);
  if(mx && cw > +mx[1]) return false;
  if(mn && cw < +mn[1]) return false;
  return !!(mx||mn);
}
/* Resolve for a card of width cw: base rules, then container blocks that match. */
function resolve(cw){
  const out={};
  const take=r=>r.selectors.forEach(sel=>{
    const k=sel.trim().replace(/\s+/g,' '); const bag=out[k]||(out[k]={});
    r.walkDecls(d=>bag[d.prop]=String(d.value).replace('!important','').trim()); });
  TREE.walkRules(r=>{ if(!r.parent || r.parent.type==='root') take(r); });
  TREE.walkAtRules('supports', sup=>{
    sup.each(n=>{
      if(n.type==='rule') take(n);
      else if(n.type==='atrule' && n.name==='container' && containerMatches(n.params, cw))
        n.each(c=>{ if(c.type==='rule') take(c); });
    });
  });
  return out;
}
const G=(o,s,p)=>((o[s]||{})[p]||null);

W('THE CARD IS NOT THE WINDOW');
[[390,'phone'],[673,'fold open'],[820,'tablet'],[1180,'laptop'],[1440,'desktop']].forEach(([w,label])=>{
  W('  '+String(w).padStart(4)+'px window  ->  '+String(cardWidth(w)).padStart(4)+'px card   ('+label+')');
});

W('\nCAPSULES WRAP ON THE CARD, NOT THE WINDOW');
{
  const fold=cardWidth(673);
  ok('an unfolded Fold gives the card '+fold+'px', fold<520, fold);
  const r=resolve(fold);
  ok('  so the capsules go 2x2 there', G(r,'.cardacts','grid-template-columns')==='1fr 1fr',
     G(r,'.cardacts','grid-template-columns'));
  const tab=cardWidth(820);
  ok('a tablet gives the card '+tab+'px', tab>520, tab);
  const r2=resolve(tab);
  ok('  so they stay in one row', G(r2,'.cardacts','display')==='flex', G(r2,'.cardacts','display'));
  const desk=cardWidth(1440);
  const r3=resolve(desk);
  ok('desktop keeps one row at '+desk+'px', G(r3,'.cardacts','display')==='flex');
}

W('\nTHE TAB ROW');
{
  const r=resolve(cardWidth(673));
  ok('scrolls sideways on a narrow card', G(r,'.tabs','overflow-x')==='auto', G(r,'.tabs','overflow-x'));
  ok('  and does not wrap', G(r,'.tabs','flex-wrap')==='nowrap');
  const r2=resolve(cardWidth(1440));
  ok('a wide card does not scroll', G(r2,'.tabs','overflow-x')!=='auto', G(r2,'.tabs','overflow-x'));
}

W('\nTHE AVAILABILITY HEADER SCALES TO THE CARD');
{
  const r=resolve(cardWidth(600));
  ok('the name uses container units', /cqi/.test(G(r,'.wa-name','font-size')||''), G(r,'.wa-name','font-size'));
  ok('  and so does the domain', /cqi/.test(G(r,'.wa-domain','font-size')||''), G(r,'.wa-domain','font-size'));
}

W('\nSAFE WHERE @container IS NOT UNDERSTOOD');
ok('the whole block is behind @supports', /@supports \(container-type: inline-size\)/.test(CSS));
ok('the container is declared on #main', /#main\{ container-type: inline-size/.test(CSS));
ok('it is named, not anonymous', /container-name: card/.test(CSS));
ok('every query targets that name', (()=>{ let bad=0;
  TREE.walkAtRules('container',a=>{ if(!/^card\b/.test(a.params.trim())) bad++; }); return bad===0; })());
ok('the viewport rule survives as a floor', /@media \(max-width: 430px\)[\s\S]{0,400}\.cardacts\{ display:grid/.test(CSS));

W('\nSWEEP — every window width, checking the CARD');
{
  let bad=[];
  for(let w=320; w<=1920; w+=8){
    const cw=cardWidth(w), r=resolve(cw);
    const grid=G(r,'.cardacts','grid-template-columns');
    if(cw<=520 && grid!=='1fr 1fr') bad.push(w+' (card '+cw+'): not 2x2');
    if(cw>520 && G(r,'.cardacts','display')!=='flex') bad.push(w+' (card '+cw+'): not a row');
  }
  ok('every window resolves to the right card layout', bad.length===0, bad.slice(0,3).join(' | '));
  W('  windows swept: 201');
}

W('');
W(fail===0?('CONTAINER QUERIES CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
