/* WHAT A CUSTOMER SEES WHEN A PIECE IS MISSING (2026-07-26)
   The art department can end terminal and delivery still ships — which is right; nobody should
   wait forever on a picture that will not come. But when it happened the section rendered
   blank. Colours, bios and launch posts showed a heading and then nothing, and the logo section
   promised "three signature lockups" above empty space.
   A promise with nothing behind it reads as a broken product rather than a piece on its way. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
function source(){ let s=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  return s.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g,(m,r)=>{
    try{ return '<scr'+'ipt>'+fs.readFileSync(path.join(ROOT,r),'utf8')+'</scr'+'ipt>'; }catch(e){ return m; }}); }
const SRC=source();
const CORE=fs.readFileSync(path.join(ROOT,'js','workspace-core.js'),'utf8');
const PAGE=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

const full=()=>({name:'Heartwood',mono:'HC',dom:'h.com',st:'Available',tag:'t',heroUrl:'https://x/h.png',
 logos:['https://x/a.png'],why:['it works'],
 palettes:[{name:'Warm Oak',note:'grounded',cols:['#111','#222','#333','#444']}],
 type:[{name:'Serif',note:'classic'}],voice:[{n:'Warm',d:'plain and human'}],
 taglines:['Crafting legacy'],biosT:['We build cabinetry that lasts.'],aboutT:['About Heartwood.'],
 linkedinT:['On LinkedIn.'],facebookT:['On Facebook.'],postsT:['Doors open Monday.']});
function run(nameO, ideaO){
  const errs=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  const dom=new JSDOM(SRC,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){w.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})});w.scrollTo=()=>{};
      w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.addEventListener('error',e=>errs.push(e.message));}});
  const w=dom.window;
  const nm=()=>Object.assign(full(), nameO||{});
  w.IDEAS=[Object.assign({id:'r1',cat:'Cabinetry',said:'custom cabinetry',ord:9,fav:false,tier:'bib',
    header:'https://x/h.png',names:[0,1,2,3,4,5].map(nm),palettes:full().palettes,type:full().type,
    voice:full().voice,biosT:full().biosT,aboutT:full().aboutT,linkedinT:full().linkedinT,
    facebookT:full().facebookT,postsT:full().postsT,why:full().why,taglines:full().taglines,
    date:'Jul 26',ts:9,emoji:'H'}, ideaO||{})];
  w.current='r1';w.curName=0;w.removed={};w.__smnPicked='r1';
  try{ w.paint(); }catch(e){ errs.push('paint: '+e.message); }
  return {dom,doc:w.document,main:w.document.getElementById('main'),errs};
}

W('A COMPLETE KIT SAYS NOTHING EXTRA');
{
  const b=run({},{});
  ok('no explanations appear', b.main.querySelectorAll('.emptynote').length===0,
     b.main.querySelectorAll('.emptynote').length);
  ok('  the colours are shown', /Warm Oak/.test(b.main.textContent));
  ok('  the bios are shown', /cabinetry that lasts/.test(b.main.textContent));
  ok('  the posts are shown', /Doors open Monday/.test(b.main.textContent));
  ok('nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nA MISSING PIECE EXPLAINS ITSELF');
[['colours','palettes','Your brand colours'],
 ['bios','biosT','Your profile bios'],
 ['launch posts','postsT','Your launch posts']].forEach(([label,field,expected])=>{
  const o={}; o[field]=[];
  const b=run(o,o);
  const note=b.main.querySelector('.emptynote');
  ok('missing '+label+' is explained', !!note);
  if(note){
    const t=(note.textContent||'').replace(/\s+/g,' ');
    ok('  it names what is missing', t.indexOf(expected)>=0, t.slice(0,50));
    ok('  it says when to expect it', /within 24 hours/.test(t));
    ok('  it promises an email', /email you/.test(t));
    ok('  it offers a way to complain', !!note.querySelector('a[href*="support"]'));
  }
  ok('  nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
});

W('\nSEVERAL MISSING AT ONCE');
{
  const o={palettes:[],biosT:[],postsT:[]};
  const b=run(o,o);
  ok('each gets its own explanation', b.main.querySelectorAll('.emptynote').length===3,
     b.main.querySelectorAll('.emptynote').length);
  ok('  and the card still renders', !!b.main.querySelector('.card'));
  ok('  and nothing throws', b.errs.length===0, b.errs[0]);
  b.dom.window.close();
}

W('\nTHE MESSAGE IS HONEST AND MATCHES THE PROMISE ELSEWHERE');
ok('it uses the 24-hour figure the site promises', /within 24 hours/.test(CORE));
ok('  which the order form also says', /24 hours/.test(CORE));
ok('it does not claim the piece is coming for certain', !/will arrive|guaranteed/.test(
   (CORE.match(/function emptyNote[\s\S]{0,700}/)||[''])[0]));
ok('the link opens the support desk', /href="support\.html"/.test(CORE));

W('\nIT IS LEGIBLE');
{
  const flat=PAGE.replace(/\s+/g,'');
  ok('the note has its own styling', /\.emptynote\{/.test(flat));
  ok('  a dashed border, so it reads as a gap not a card', /border:1pxdashed/.test(flat));
  ok('  and the link can be reached by keyboard', /\.emptynotea:focus-visible/.test(flat));
}

W('');
W(fail===0?('EMPTY STATES CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
