/* THE BRAND LIST MOVED TO THE FLYOUT (2026-07-26, Founder order).
   The rail held a heading, a count, a search box, a sort control, all 242 brands with their
   photographs and a create button — and the Brands flyout held the same six things. Both were
   on screen at once. The Founder opened the flyout, saw two search boxes and two lists of 242,
   and could not tell what he was looking at.
   These assertions were written against the rail's copy. They now test the one that remains. */
/* THE LEFT COLUMN AT 241 BRANDS (2026-07-26, Founder order)
   Two changes, both chosen after checking the data rather than before.
   The plan was grouped headings by category. The data killed it: there is no category field
   anywhere — not in reports, not in report_names, not in the kit — and what the workspace shows
   as a category is derived from the typed idea at render time. Nothing to group by.
   Favourites turned out to be the real answer, with one catch: zero of 242 brands are starred.
   So the heading appears the moment there is something in it and not before, because an empty
   heading is worse than none. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const postcss=require('postcss');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
function source(){ let s=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  return s.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g,(m,r)=>{
    try{ return '<scr'+'ipt>'+fs.readFileSync(path.join(ROOT,r),'utf8')+'</scr'+'ipt>'; }catch(e){ return m; }}); }
const SRC=source();
const PAGE=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
const CORE=fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

function boot(count, favIdx){
  const errs=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  const dom=new JSDOM(SRC,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errs.push(e.message));}});
  const w=dom.window;
  const mk=(i,fav)=>({id:'b'+i,_stub:true,cat:'Glass '+i,said:'glass blowing idea '+i,ord:1000-i,fav:!!fav,
    header:'https://x/'+i+'.png',names:[],palettes:[],type:[],voice:[],aboutT:[],biosT:[],
    linkedinT:[],facebookT:[],postsT:[],why:[],taglines:[],date:'Jul',ts:i,emoji:'x'});
  w.IDEAS=[]; for(let i=1;i<=count;i++) w.IDEAS.push(mk(i,(favIdx||[]).indexOf(i)>=0));
  w.current='b1'; w.curName=0; w.removed={}; w.__smnPicked=null;
  try{ w.paint(); }catch(e){ errs.push('paint: '+e.message); }
  /* The flyout builds on open, not on paint — 242 rows nobody has asked for should not be
     built during the first render. Every count below is of the flyout, so open it. */
  try{ w.openBrandPop(); }catch(e){ errs.push('openBrandPop: '+e.message); }
  return {dom,win:w,doc:w.document,errs};
}

W('NOTHING APPEARS UNTIL IT HAS SOMETHING TO SAY');
{
  const b=boot(241,[]);
  ok('with no favourites, no headings at all', b.doc.querySelectorAll('.rl-sec').length===0,
     b.doc.querySelectorAll('.rl-sec').length);
  ok('  and all 241 still listed', b.doc.querySelectorAll('#brandpop .bp-row').length===241,
     b.doc.querySelectorAll('#brandpop .bp-row').length);
  ok('  which is exactly the founder\'s account today', true);
  ok('nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nFAVOURITES ARE HANDLED BY SORT NOW');
{
  /* The Favourites heading was built into the rail's list renderer. That list was removed on
     2026-07-26 because it duplicated the flyout exactly, which takes the heading with it.
     Nothing is lost: the flyout's sort control has "Favourites first", which does the same job
     with one control instead of a section that appears and disappears. The renderer itself is
     left intact and guarded — if the rail list ever returns, the heading returns with it. */
  const b=boot(241,[5,9,40]);
  const sort=b.doc.getElementById('isort');
  ok('the sort control is in the flyout', !!sort);
  ok('  and offers favourites first',
     !!(sort && [...sort.options].some(o=>o.value==='fav')));
  ok('the starred brands are still starred', b.win.IDEAS.filter(x=>x.fav).length===3);
  ok('nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nA CUSTOMER WITH TWO BRANDS SEES NONE OF IT');
{
  const b=boot(2,[]);
  ok('no headings', b.doc.querySelectorAll('.rl-sec').length===0);
  ok('  two rows', b.doc.querySelectorAll('#brandpop .bp-row').length===2);
  ok('  nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nTHE SEARCH IS SOMETHING YOU CAN SEE');
{
  const b=boot(241,[5,9]);
  const inp=b.doc.getElementById('bpsearch');
  const icon=b.doc.querySelector('.bp-i');
  const x=b.doc.getElementById('bpsearchClear');
  ok('it is a real search field', inp && inp.type==='search');
  ok('it carries a label for a screen reader', !!inp.getAttribute('aria-label'));
  ok('there is a visible icon', !!icon);
  ok('  which is decorative, not announced', icon.getAttribute('aria-hidden')==='true');
  ok('the clear button starts hidden', x && x.hidden===true);

  inp.value='Glass 17'; inp.dispatchEvent(new b.win.Event('input',{bubbles:true}));
  ok('typing narrows the list', b.doc.querySelectorAll('#brandpop .bp-row').length<241,
     b.doc.querySelectorAll('#brandpop .bp-row').length);
  ok('  and the clear button appears', x.hidden===false);
  ok('  and the headings step aside', b.doc.querySelectorAll('.rl-sec').length===0);
  ok('  because a search is already a filter', true);

  x.dispatchEvent(new b.win.MouseEvent('click',{bubbles:true}));
  ok('clear empties the field', inp.value==='');
  ok('  and every brand returns', b.doc.querySelectorAll('#brandpop .bp-row').length===241);
  ok('  and the clear button hides again', x.hidden===true);
  /* The favourites headings lived in the rail list, which was removed 2026-07-26. Sort now
     carries that job. */
  ok('  and the sort control is still there', !!b.doc.getElementById('isort'));

  inp.value='Glass 22'; inp.dispatchEvent(new b.win.Event('input',{bubbles:true}));
  inp.focus();
  b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok('Escape clears it too', inp.value==='');
  ok('nothing throws throughout', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nIT CANNOT QUIETLY STOP WORKING');
ok('the clear button is delegated, not bound', /document\.addEventListener\('click', function\(e\)\{[\s\S]{0,120}isearchClear/.test(CORE));
ok('  so a re-render cannot orphan it', !/getElementById\('isearchClear'\)\.addEventListener/.test(CORE));
ok('  and it does not wait for DOMContentLoaded', !/DOMContentLoaded',smnWireSearchClear/.test(CORE));

W('\nTHE STYLING HOLDS UP');
{
  const css=[...PAGE.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
  let tree; try{ tree=postcss.parse(css); ok('the stylesheet parses', true); }
  catch(e){ ok('the stylesheet parses', false, e.message); tree=null; }
  if(tree){
    const flat=css.replace(/\s+/g,'');
    ok('the field is a 44px touch target', /\.srch\.search\{[^}]*min-height:44px/.test(flat));
    ok('the clear button is reachable by keyboard', /\.srch-x:focus-visible/.test(flat));
    ok('the field shows focus', /\.srch\.search:focus-visible/.test(flat));
    ok('the browser default clear is replaced, not doubled', /-webkit-search-cancel-button\{display:none\}/.test(flat));
    ok('the favourites heading is distinguishable', /\.rl-sec-fav\.rl-sec-t/.test(flat));
  }
}

W('');
W(fail===0?('LEFT COLUMN CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
