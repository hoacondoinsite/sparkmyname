// STRUCTURAL INTEGRITY — added 2026-07-27 after an orphan </div> closed .card early and
// threw the deck, tabs, panels and mosaic outside it. Every suite checked that controls were
// PRESENT and BOUND; none checked that the markup BALANCED. This one does.
const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};
function fnBody(name){
  const i=src.indexOf('function '+name+'(');
  if(i<0) return '';
  let d=0,k=src.indexOf('{',i);
  for(let p=k;p<src.length;p++){ if(src[p]==='{')d++; if(src[p]==='}'){d--; if(d===0) return src.slice(i,p+1);} }
  return '';
}
function balance(body,tag){
  const b=body.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  const o=(b.match(new RegExp('<'+tag+'\\b','g'))||[]).length;
  const c=(b.match(new RegExp('</'+tag+'>','g'))||[]).length;
  return [o,c];
}
['mainHTML','openBrandsBrowser','openGuidePanel','openConciergePanel','openDesignerPage','renderWsNav'].forEach(fn=>{
  const body=fnBody(fn);
  if(!body){ ok(fn+' exists', false); return; }
  const [o,c]=balance(body,'div');
  ok(fn+' div balance ('+o+' open / '+c+' close)', o===c);
});
// the card must contain the deck, tabs, panels AND mosaic — not emit them as siblings
const main=fnBody('mainHTML');
const order=['<div class="card">','<div class="deck">','class="onebar"','class="panelwrap"','<div class="bkmosaic">'];
let last=-1, seq=true;
order.forEach(t=>{ const i=main.indexOf(t); if(i<0||i<last) seq=false; last=i; });
ok('card contains deck -> tabs -> panels -> mosaic, in order', seq);
console.log(fail===0?'\nSTRUCTURE CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
