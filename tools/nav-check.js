
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
/* NAV TEST (2026-07-25) — one-word labels, rail width, and the nav actually rendering. */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const s=workspaceSource(path.join(__dirname,'..'));
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c){pass++;console.log('  PASS  '+n);} else {fail++;console.log('  FAIL  '+n+(x!==undefined?('  -> '+JSON.stringify(x)):''));} };

const nav = s.match(/var ACNAV=\[(.*?)\];/s)[1];
/* ACNAV entries gained a fourth field (the plain-English hint) on 2026-07-25. Reading the
   LAST quoted value now returns the hint, not the label — which is why this reported nine
   "labels" of up to 29 characters. The label is the third field. */
const labels = [...nav.matchAll(/\['[a-z]+','[^']*','([^']+)','[^']*'\]/g)].map(m=>m[1]);
console.log('LABELS');
ok('twelve categories', labels.length===12, labels.length);
ok('every label is one or two words', labels.every(l=>l.split(' ').length<=2), labels.filter(l=>l.split(' ').length>2));
console.log('        '+labels.join(' · '));
const longest = labels.reduce((a,b)=>a.length>b.length?a:b);
ok('longest label <= 9 chars', longest.length<=9, longest);

console.log('\nRAIL');
const shell = s.match(/\.shell\{[^}]*\}/)[0];
ok('rail is 236px', shell.includes('236px'), shell);
ok('card column cannot overflow', shell.includes('minmax(0,1fr)'), shell);
/* Stacking moved to below 600px on 2026-07-26: 600-1079px is the tablet range and keeps
     two columns, which is what makes an unfolded Z Fold and an iPad useful. */
  ok('stacks below 600px', /@media\(max-width:599px\)\{\.shell\{grid-template-columns:1fr/.test(s.replace(/\n\s*/g,'')));

console.log('\nRENDER');
ok('nav element exists in markup', s.includes('id="wsnav"'));
ok('renderWsNav defined', /function renderWsNav\(\)/.test(s));
ok('called from paint, once', s.includes('window.__wsNavDone'));
ok('reuses ACNAV (no second list)', (s.match(/var ACNAV=/g)||[]).length===1);
ok('reuses the existing panel', s.includes('ACCT.sec=k; openAccount()'));
ok('Brands returns to the workspace', s.includes("k==='brands'"));

console.log('\nTOUCH TARGETS');
const btn = s.match(/\.wsnav button\{[^}]*\}/)[0];
ok('nav buttons >= 38px tall', /min-height:38px/.test(btn), btn.slice(0,80));
ok('pill row on narrow screens', /@media\(max-width:1080px\)[\s\S]{0,200}\.wsnav\{flex-direction:row/.test(s.replace(/\n\s*/g,'')));

console.log('\n'+(fail===0?('ALL '+pass+' CHECKS PASSED'):(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
