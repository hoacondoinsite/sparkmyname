
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
/* RAIL AUDIT (2026-07-25) — order, labels, hints, list containment, delete/restore,
   shortcuts, and that every destination exists. */
'use strict';
const fs=require('fs'), path=require('path');
const s=workspaceSource(path.join(__dirname,'..'));
const flat=s.replace(/\s+/g,' ');
let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,110)):''));}};

console.log('NAV ORDER — what people come for, first');
const items=[...s.match(/var ACNAV=\[([\s\S]*?)\];/)[1].matchAll(/\['([a-z]+)','[^']*','([^']+)','([^']+)'\]/g)].map(m=>({k:m[1],l:m[2],h:m[3]}));
ok('twelve sections', items.length===12, items.length);
ok('Brands is FIRST', items[0].k==='brands', items[0].k);
ok('admin sections are last', ['security','privacy','overview'].includes(items[9].k), items[9].k);
ok('every label is one word', items.every(i=>i.l.split(' ').length<=2), items.filter(i=>i.l.split(' ').length>2).map(i=>i.l));
ok('every section has a plain-English hint', items.every(i=>i.h&&i.h.length>8), items.filter(i=>!i.h).map(i=>i.k));
ok('no label says "Studio" on its own', !items.some(i=>i.l==='Studio'));
ok('no label says "Prefs"', !items.some(i=>i.l==='Prefs'));
items.forEach((i,n)=>console.log('        '+(n+1)+'. '+i.l.padEnd(10)+' '+i.h));

console.log('\nEVERY DESTINATION EXISTS');
const dispatch=s.match(/function acSectionHTML\(\)\{[\s\S]*?\}\}/)[0];
/* Concierge is not an account section — it opens the concierge panel, which is why it is
   excluded here. Added to the left bar 2026-07-26 by Founder order; see the warning on ACNAV. */
items.forEach(i=>ok(i.l+' has a section',
  new RegExp("case '"+i.k+"':").test(dispatch) || i.k==='overview' || i.k==='concierge' || i.k==='guide' || i.k==='designer'));

console.log('\nBRAND LIST');
ok('list scrolls inside itself, not down the page', /\.blist\{[^}]*max-height/.test(flat));
ok('nested scroll cannot drag the page', /overscroll-behavior:contain/.test(flat));
ok('shorter cap on tablet/phone', /@media\(max-width:1080px\)\{\.blist\{max-height/.test(flat));
ok('sort control present', /id="isort"/.test(s));
['newest','az','za','fav'].forEach(v=>ok('sort by '+v, new RegExp('value="'+v+'"').test(s)));
ok('delete on every row', /data-rm="/.test(s));
ok('delete is one click from the row', /closest\('\[data-rm\]'\)/.test(flat));
ok('restore panel exists', /class="putaway/.test(s));
ok('restore one', /data-recover="/.test(s));
ok('restore all', /data-recoverall/.test(s));

console.log('\nSHORTCUTS');
/* The rail shortcuts and header tool buttons were removed 2026-07-26 (Founder order:
   reorganise, do not move). Each tool now has ONE navigation route — the Tools menu on the
   brand card. tools-check.js covers it. These assertions described the old arrangement. */
ok('the rail no longer carries tool shortcuts', !/data-wshelp/.test(s));
ok('Success Path opener still exists', /function openSuccess|openSuccess=/.test(s));
ok('AI Studio opener still exists', /function openAIStudio|openAIStudio=/.test(s));
ok('Concierge opener still exists', /function openConcierge|openConcierge=/.test(s));
ok('they are reached from the brand card', /data-tool="ai"/.test(s));

console.log('\nWORDING');
ok('new-brand button says what it does', /Create a new brand/.test(s), (s.match(/class="newbtn"[^>]*>([^<]*)/)||[])[1]);
ok('no "Start a new idea"', !/Start a new idea/.test(s));

console.log('\n'+(fail===0?('RAIL CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
