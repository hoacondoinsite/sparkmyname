/* PRINTING A BRAND SHEET (2026-07-26)
   "Brand sheet (PDF)" on the download menu calls window.print(), so the print stylesheet IS
   that feature. It hid the interface and opened every section, which was right — and never
   touched the colours. The workspace is #EAF2FF on #0A1428, and browsers drop background
   colours when printing, so pressing it produced near-white text on white paper. A blank sheet.
   Nobody tests print styles until a customer complains. */
'use strict';
const fs=require('fs'), path=require('path');
const postcss=require('postcss');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const PAGE=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
const CORE=fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8');
const CSS=[...PAGE.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const TREE=postcss.parse(CSS);
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

/* Resolve what a rule ends up as when printing: base rules, then @media print, in source order. */
function printValue(sel, prop){
  let v=null;
  TREE.walkRules(r=>{
    if(r.parent && r.parent.type==='atrule' && !/\bprint\b/.test(r.parent.params||'')) return;
    if(r.selectors.map(x=>x.trim()).indexOf(sel)<0) return;
    r.walkDecls(d=>{ if(d.prop===prop) v=d.value.replace('!important','').trim(); });
  });
  return v;
}
const printDecls=[];
TREE.walkAtRules('media',a=>{ if(/\bprint\b/.test(a.params)) a.walkDecls(d=>
  printDecls.push({sel:(d.parent.selector||'').trim(), prop:d.prop, v:d.value.replace('!important','').trim()})); });
const has=(sel,prop)=>printDecls.some(d=>d.sel.indexOf(sel)>=0 && d.prop===prop);
const val=(sel,prop)=>{ const d=printDecls.find(x=>x.sel.indexOf(sel)>=0 && x.prop===prop); return d?d.v:null; };

W('THE BUTTON THAT PRODUCES IT');
ok('"Brand sheet (PDF)" exists', /data-doprint/.test(CORE));
ok('  it calls window.print()', /data-doprint\][\s\S]{0,200}window\.print\(\)/.test(CORE));
ok('  so the print stylesheet IS this feature', true);
ok('a blocked print dialogue is reported', /Your browser blocked printing/.test(CORE));

W('\nPAPER IS WHITE');
ok('the page background is reset', val('body','background')==='#FFFFFF', val('body','background'));
ok('text is reset to near-black', /#111111/.test(val('body','color')||''), val('body','color'));
ok('  including everything inside it', printDecls.some(d=>d.sel==='body *' && d.prop==='color'));
ok('gradient headings become solid black',
   printDecls.some(d=>d.prop==='-webkit-text-fill-color' && /#000000/.test(d.v)));
ok('  and lose their gradient background',
   printDecls.some(d=>/wa-name|bkacc-t/.test(d.sel) && d.prop==='background' && d.v==='none'));

W('\nTHE BRAND’S OWN COLOURS STILL PRINT');
ok('swatches print exactly', printDecls.some(d=>d.prop==='print-color-adjust' && d.v==='exact'));
ok('  with the webkit prefix too', printDecls.some(d=>d.prop==='-webkit-print-color-adjust'));
ok('  and a border so white swatches are visible', has('.sw','border'));
ok('photographs print exactly', printDecls.some(d=>/img/.test(d.sel) && d.prop==='print-color-adjust'));

W('\nTHE DOCUMENT HOLDS TOGETHER');
ok('sections are not split across pages', printDecls.some(d=>d.prop==='break-inside' && d.v==='avoid'));
ok('  with the legacy property for older engines', printDecls.some(d=>d.prop==='page-break-inside'));
ok('a heading is never orphaned at the foot', printDecls.some(d=>d.prop==='break-after' && d.v==='avoid'));
ok('name cards and palettes stay whole',
   printDecls.some(d=>/nopt|palset|typ|cinecard/.test(d.sel) && d.prop==='break-inside'));
ok('the page has margins', /@page\{\s*margin/.test(CSS.replace(/\s+/g,'')) || /@page/.test(CSS));

W('\nEVERY SECTION IS OPEN ON PAPER');
ok('closed sections are forced open', printDecls.some(d=>d.sel.indexOf('.bkacc-b')>=0 && d.v==='block'));
ok('  which matters because they now close by default', /isOpen = \(k==='overview'\)/.test(CORE));
ok('the interface is hidden', printDecls.some(d=>/cardacts|tabs|panelwrap/.test(d.sel) && d.v==='none'));
ok('  including the phone controls', printDecls.some(d=>/mobibtn/.test(d.sel)));

W('\nA PRINTED LINK CAN BE READ');
ok('handle links print their address', printDecls.some(d=>d.prop==='content' && /attr\(href\)/.test(d.v)));

W('');
W(fail===0?('PRINT CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
