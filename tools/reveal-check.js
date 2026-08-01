
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

/* THE CORE MOVED OUT OF THE PAGE (2026-07-25). 441KB of JavaScript now lives in
   js/workspace-core.js so the browser can cache it. Any harness that reads inline <script>
   blocks would otherwise find almost nothing and pass while testing nothing — which is
   exactly what preflight caught the moment the file was split. */
function readWorkspaceScripts(src, root){
  const blocks=[...src.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m=>!/src=|json/.test(m[1])).map(m=>m[2]);
  const ext=[...src.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);
  const out=[];
  blocks.forEach(b=>out.push(b));
  ext.forEach(function(rel){
    try{ out.splice(1,0, require('fs').readFileSync(require('path').join(root, rel),'utf8')); }
    catch(e){}
  });
  return out;
}
/* FIRST-LOGIN + REVEAL TEST (2026-07-25). Proves the card is hidden until a name is picked,
   that picking one reveals it, that the paid 2K photo is gone, and that reduced motion wins. */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const s=workspaceSource(path.join(__dirname,'..'));
const flat=s.replace(/\s+/g,' ');
let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,120)):''));}};

console.log('THE PAID 2K PHOTO IS RETIRED');
ok('catalog entry removed', !/\['scene-2k','2K brand scene'/.test(s));
ok('no scene-2k anywhere but the note', (s.match(/scene-2k/g)||[]).length===1, (s.match(/scene-2k/g)||[]).length);
ok('a note explains why', /RETIRED \(2026-07-25, Founder order\): 'scene-2k'/.test(s));
ok('Photos & Art category still exists', /\['photo','Photos & Art'/.test(s));

console.log('\nNOTHING BELOW THE SIX NAMES ON ARRIVAL');
/* THE GATE IS GONE (2026-07-26, Founder order). The card used to wait for a pick. Someone who
   has paid for a finished brand should see the finished brand. */
ok('the card is no longer gated', !/if\(!_picked && IDEA\.names\.length>1\)/.test(flat));
ok('  and no pick-a-name prompt remains', !/class="pickhint"/.test(flat));
ok('the six names are still built first', flat.indexOf('var _namesTop')>0);
ok('arrival still renders the name boxes', /return _namesTop\+/.test(flat));

console.log('\nTHE REVEAL');
ok('uses the native View Transitions API', /document\.startViewTransition/.test(s));
ok('feature-detected, no polyfill', /&& document\.startViewTransition\)/.test(flat));
ok('falls back to a plain repaint', /\} else \{ paint\(\); \}/.test(flat));
ok('card has its own transition name', /#main \.card\{ view-transition-name: brandcard; \}/.test(flat));
ok('entry animation defined', /::view-transition-new\(brandcard\)/.test(s));
ok('guarded by @supports', /@supports \(view-transition-name: none\)/.test(s));
ok('reduced motion is handled MANUALLY (browser will not)', /matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/.test(flat));
ok('reduced motion also disables the CSS animation', /@media \(prefers-reduced-motion: reduce\)\{ ::view-transition-new\(brandcard\)/.test(flat));
ok('card is brought into view, not hunted for', /scrollIntoView\(\{block:'start'/.test(flat));
ok('smooth scroll skipped when motion is reduced', /behavior:reduce\?'auto':'smooth'/.test(flat));

console.log('\nRUN IT');
const blocks=readWorkspaceScripts(s, path.join(__dirname,'..'));
function mkEl(){const e={style:{},dataset:{},attributes:{},children:[],innerHTML:'',textContent:'',value:'',
  classList:{_s:new Set(),add(x){this._s.add(x)},remove(x){this._s.delete(x)},toggle(){},contains(){return false}},
  appendChild(c){return c},removeChild(){},remove(){},setAttribute(){},getAttribute(){return null},removeAttribute(){},
  addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(){return []},
  closest(){return null},focus(){},click(){},scrollIntoView(){},getBoundingClientRect(){return{top:0,left:0,width:0,height:0}}};return e;}
const doc={createElement:mkEl,createTextNode:()=>mkEl(),getElementById:()=>mkEl(),querySelector:()=>mkEl(),
  querySelectorAll:()=>[],addEventListener(){},body:mkEl(),head:mkEl(),documentElement:mkEl(),
  fonts:{load:()=>Promise.resolve(),ready:Promise.resolve()},cookie:''};
const win={addEventListener(){},removeEventListener(){},location:{href:'',search:'',hash:''},
  localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},
  matchMedia:()=>({matches:false,addListener(){},addEventListener(){}}),print(){},open(){},scrollTo(){},
  requestAnimationFrame:cb=>setTimeout(cb,0),setTimeout,clearTimeout,setInterval:()=>0,clearInterval,
  fetch:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})}),navigator:{userAgent:'node'},innerWidth:1440};
const ctx={window:win,document:doc,console:{log(){},warn(){},error(){}},Math,JSON,Date,setTimeout,clearTimeout,
  setInterval:()=>0,clearInterval,encodeURIComponent,decodeURIComponent,fetch:win.fetch,localStorage:win.localStorage,
  location:win.location,navigator:win.navigator,alert(){},Promise,Image:mkEl,Blob:function(){},
  URL:{createObjectURL:()=>'b',revokeObjectURL(){}},requestAnimationFrame:win.requestAnimationFrame,
  matchMedia:win.matchMedia,atob:x=>x,btoa:x=>x,HTMLElement:function(){}};
ctx.HTMLElement.prototype={};ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);
blocks.forEach((b,i)=>{try{vm.runInContext(b,ctx,{filename:'b'+i+'.js'});}catch(e){}});
const NM={name:'N',mono:'NN',dom:'n.com',st:'Available',tag:'t',heroUrl:'https://x/h.png',logos:['https://x/1.png'],
  why:['a'],palettes:[{name:'P',note:'n',cols:['#111','#222','#333','#444']}],type:[{name:'Serif',note:'x'}],
  voice:[{name:'V',note:'x'}],taglines:['t'],biosT:['b'],aboutT:['a'],linkedinT:['l'],facebookT:['f'],postsT:['p']};
const IDEA={id:'r1',cat:'x',said:'y',ord:0,fav:false,header:'https://x/hdr.png',
  names:[NM,NM,NM,NM,NM,NM],palettes:NM.palettes,type:NM.type,voice:NM.voice,biosT:NM.biosT,aboutT:NM.aboutT,
  linkedinT:NM.linkedinT,facebookT:NM.facebookT,postsT:NM.postsT,why:NM.why,taglines:NM.taglines};
ctx.IDEAS=[IDEA];ctx.current='r1';ctx.curName=0;

ctx.window.__smnPicked=null;   /* the flag holds the BRAND ID now, not a boolean */
let before='';
try{ before=ctx.mainHTML(IDEA); }catch(e){ ok('renders on arrival', false, e.message); }
/* The gate now sits AFTER the six names, so arrival is not empty — it is the names
   plus a hint, and no card. Asserting emptiness was asserting the bug. */
ok('ON ARRIVAL: names AND card both shown',
   before.indexOf('nopt brx')>=0 && before.indexOf('class="card"')>=0, before.length+' chars');

ctx.window.__smnPicked='r1';
let after='';
try{ after=ctx.mainHTML(IDEA); }catch(e){ ok('renders after a pick', false, e.message); }
ok('AFTER A PICK: full card appears', after.length>1000, after.length);
ok('  ...with all 13 sections', (after.match(/data-bkacc="/g)||[]).length===13, (after.match(/data-bkacc="/g)||[]).length);
ok('  ...with the availability header', after.indexOf('webavail')>=0);
ok('  ...with the action capsules', after.indexOf('data-brandsave')>=0);

/* A single-name order should never be gated — there is nothing to choose. */
const solo=Object.assign({},IDEA,{names:[NM]});
ctx.window.__smnPicked=null;
let s1='';
try{ s1=ctx.mainHTML(solo); }catch(e){}
ok('a one-name order is never gated', s1.length>1000, s1.length);

console.log('\nPAINT SURVIVES EVERY STATE');
/* The live "Cannot read properties of undefined (reading 'name')" came from bind() reading
   IDEA.names[curName] when there was no card. Both states that produce it are tested here. */
ctx.window.__smnPicked=null; ctx.IDEAS=[IDEA]; ctx.current='r1'; ctx.curName=0;
try{ ctx.paint(); ok('arrival, nothing picked', true); }catch(e){ ok('arrival, nothing picked', false, e.message); }
const stub={id:'r1',_stub:true,cat:'x',said:'y',ord:0,fav:false,names:[],palettes:[],type:[],voice:[],
  aboutT:[],biosT:[],linkedinT:[],facebookT:[],postsT:[],why:[],taglines:[]};
ctx.window.__smnPicked='r1'; ctx.IDEAS=[stub]; ctx.current='r1';
try{ ctx.paint(); ok('brand picked but kit not loaded yet', true); }catch(e){ ok('brand picked but kit not loaded yet', false, e.message); }
ctx.IDEAS=[IDEA]; ctx.current='r1'; ctx.curName=0;
try{ ctx.paint(); ok('brand picked and fully loaded', true); }catch(e){ ok('brand picked and fully loaded', false, e.message); }
ctx.curName=99;
try{ ctx.paint(); ok('name index out of range', true); }catch(e){ ok('name index out of range', false, e.message); }
ctx.curName=0;
ok('bind refuses to run without a card', /if\(!NM \|\| !root \|\| !root\.innerHTML\) return;/.test(flat));

console.log('\n'+(fail===0?('REVEAL CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
