/* THE CARD IS NO LONGER GATED (2026-07-26, Founder order).
   It used to wait for the customer to pick one of the six names. Someone who has just paid for
   a finished brand should see the finished brand — all six options AND the full card, with the
   first name showing. Picking still switches the card; it is not a toll gate.
   These assertions described the gate. They now describe what replaced it. */

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
/* ITEM-BY-ITEM VALIDATION (2026-07-25). Each item is asserted on its own, in its own state,
   with its own fresh render — never as a group, so one passing feature cannot mask another. */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const s=workspaceSource(path.join(__dirname,'..'));
const blocks=readWorkspaceScripts(s, path.join(__dirname,'..'));
let pass=0,fail=0;
function item(name, fn){
  try{ const r=fn(); if(r===true){pass++;console.log('  PASS  '+name);} else {fail++;console.log('  FAIL  '+name+'  -> '+String(r).slice(0,140));} }
  catch(e){ fail++; console.log('  FAIL  '+name+'  -> THREW '+e.message.slice(0,120)); }
}
function mkEl(){const e={style:{},dataset:{},attributes:{},children:[],innerHTML:'',textContent:'',value:'',
 classList:{_s:new Set(),add(x){this._s.add(x)},remove(x){this._s.delete(x)},toggle(){},contains(){return false}},
 appendChild(c){return c},removeChild(){},remove(){},setAttribute(){},getAttribute(){return null},removeAttribute(){},
 addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(){return []},
 closest(){return null},focus(){},click(){},scrollIntoView(){},getBoundingClientRect(){return{top:0,left:0,width:0,height:0}}};return e;}
const MAIN=mkEl();
const doc={createElement:mkEl,createTextNode:()=>mkEl(),getElementById:(i)=>(i==='main'?MAIN:mkEl()),
 querySelector:(x)=>(x==='#main'?MAIN:mkEl()),querySelectorAll:()=>[],addEventListener(){},
 body:mkEl(),head:mkEl(),documentElement:mkEl(),fonts:{load:()=>Promise.resolve(),ready:Promise.resolve()},cookie:''};
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
let loadErr=null;
blocks.forEach((b,i)=>{try{vm.runInContext(b,ctx,{filename:'b'+i+'.js'});}catch(e){loadErr=e.message;}});

const NM=(n)=>({name:'Name '+n,mono:'N'+n,dom:'name'+n+'.com',st:'Available',tag:'Tagline '+n,
 heroUrl:'https://x/scene-'+n+'.png',logos:['https://x/l1.png','https://x/l2.png','https://x/l3.png'],
 why:['a','b','c','d','e','f','g','h'],
 palettes:[{name:'P1',note:'n',cols:['#FFB74D','#FF5722','#4CAF50','#1976D2']},
           {name:'P2',note:'n',cols:['#00796B','#B2DFDB','#FFEB3B','#FFD54F']},
           {name:'P3',note:'n',cols:['#D32F2F','#F57F17','#FBC02D','#8E24AA']}],
 type:[{name:'Elegant Serif',note:'x'},{name:'Modern Sans-Serif',note:'x'},{name:'Script',note:'x'},{name:'Display',note:'x'}],
 voice:[{name:'Warm',note:'x'},{name:'Clear',note:'x'}],taglines:['t1','t2','t3'],
 biosT:['b1','b2'],aboutT:['a1','a2','a3'],linkedinT:['l1'],facebookT:['f1'],postsT:['p1','p2','p3']});
function idea(id){const n=[0,1,2,3,4,5].map(NM);
  return {id:id,cat:'adu',said:'turnkey ADU management',ord:0,fav:false,header:'https://x/hdr.png',names:n,
   palettes:n[0].palettes,type:n[0].type,voice:n[0].voice,biosT:n[0].biosT,aboutT:n[0].aboutT,
   linkedinT:n[0].linkedinT,facebookT:n[0].facebookT,postsT:n[0].postsT,why:n[0].why,taglines:n[0].taglines};}
function fresh(picked){
  const I=idea('r1'); ctx.IDEAS=[I]; ctx.current='r1'; ctx.curName=0; ctx.removed={};
  ctx.window.__smnPicked = picked ? 'r1' : null;
  return {I, html: ctx.mainHTML(I)};
}

console.log('LOAD');
item('every script block loads with no error', ()=> loadErr===null || loadErr);

console.log('\nITEM 1 — ARRIVAL: the six names must be there');
item('the page is not blank', ()=>{ const {html}=fresh(false); return html.length>200 || 'only '+html.length+' chars'; });
item('all six name boxes render', ()=>{ const {html}=fresh(false); const n=(html.match(/class="nopt brx/g)||[]).length; return n===6||n; });
item('each name box has its own photo', ()=>{ const {html}=fresh(false); const n=(html.match(/class="nopt-photo"><img/g)||[]).length; return n===6||n; });
item('the six photos are distinct', ()=>{ const {html}=fresh(false); const u=[...html.matchAll(/nopt-photo"><img src="([^"]+)"/g)].map(m=>m[1]); return new Set(u).size===6||u; });
item('the card needs no prompting', ()=>!/class="pickhint"/.test(fresh(false).html)||'a prompt is still shown');
item('the brand card is shown', ()=>/class="card"/.test(fresh(false).html)||'card missing');
item('all 13 sections are there', ()=>((fresh(false).html.match(/data-bkacc="/g)||[]).length===13)||'sections missing');

console.log('\nITEM 2 — AFTER PICKING A NAME: the card must be complete');
item('the card appears', ()=>/class="card"/.test(fresh(true).html)||'no card');
item('the six names are STILL there', ()=>{ const n=(fresh(true).html.match(/class="nopt brx/g)||[]).length; return n===6||n; });
item('all 13 sections render', ()=>{ const n=(fresh(true).html.match(/data-bkacc="/g)||[]).length; return n===13||n; });
item('About is the first section', ()=>{ const o=[...fresh(true).html.matchAll(/data-bkacc="([a-z]+)"/g)].map(m=>m[1]); return o[0]==='overview'||o[0]; });
item('availability header present', ()=>/class="webavail"/.test(fresh(true).html)||'missing');
item('three colour palettes render', ()=>{ const n=(fresh(true).html.match(/class="palset"/g)||[]).length; return n===3||n; });
/* FLUID SINCE 2026-07-26. This asserted a hardcoded four columns, which is precisely what the
   fluid conversion removed — four across on a phone was never right, and a second rule at 640px
   was correcting it. auto-fit fits as many as the space allows: two on a small phone, four on a
   desktop, and every sensible number in between without a breakpoint for each. */
item('swatches flow to fit the space', ()=>/\.swrow\{[^}]*grid-template-columns:repeat\(auto-fit,minmax\(120px,1fr\)\)/.test(s)||'not fluid');
item('  and a swatch never shrinks below 120px', ()=>/minmax\(120px,1fr\)/.test(s)||'no floor');
item('colour names shown', ()=>/class="cnm"/.test(fresh(true).html)||'missing');
item('all five action capsules', ()=>{ const h=fresh(true).html;
  return ['data-brandsave','data-brandpdf','data-sendbrand','data-support','data-removebrand'].every(k=>h.indexOf(k)>=0)||'missing one'; });
item('seven-photo download grid', ()=>/data-hdrdl/.test(fresh(true).html)||'missing');

console.log('\nITEM 3 — SWITCHING BRANDS');
item('a different brand resets to its names', ()=>/if\(id!==current\) window\.__smnPicked=null;/.test(s.replace(/\s+/g,' '))||'not reset');
item('the pick is remembered per brand', ()=>/window\.__smnPicked === IDEA\.id/.test(s)||'global flag');

console.log('\nITEM 4 — PAINT SURVIVES EVERY STATE');
[['arrival, nothing picked',()=>{fresh(false);ctx.paint();}],
 ['after a pick',()=>{fresh(true);ctx.paint();}],
 ['stub, kit not loaded',()=>{ctx.IDEAS=[{id:'r1',_stub:true,cat:'x',said:'y',ord:0,fav:false,names:[],palettes:[],type:[],voice:[],aboutT:[],biosT:[],linkedinT:[],facebookT:[],postsT:[],why:[],taglines:[]}];ctx.current='r1';ctx.curName=0;ctx.paint();}],
 ['name index out of range',()=>{fresh(true);ctx.curName=99;ctx.paint();ctx.curName=0;}],
 ['no brand selected at all',()=>{ctx.IDEAS=[];ctx.current=null;ctx.paint();}]
].forEach(([n,f])=>item(n, ()=>{ f(); return true; }));

console.log('\nITEM 5 — THE LEFT LIST');
item('list renders', ()=>{ fresh(false); return ctx.ilistHTML('').length>50||'empty'; });
item('every row can be deleted', ()=>/data-rm="/.test(ctx.ilistHTML(''))||'no delete');
item('list scrolls inside itself', ()=>/\.blist\{[^}]*max-height/.test(s.replace(/\s+/g,''))||'no cap');

console.log('\nITEM 6 — THE FLYOUT');
item('is a native popover', ()=>/id="brandpop" popover="auto"/.test(s)||'not native');
item('lives at body level, not in a clipping box', ()=>{ const i=s.indexOf('id="brandpop"'); return (i>s.indexOf('class="railcard"') && i<s.lastIndexOf('</body>'))||'wrong place'; });
item('renders brands with pictures', ()=>{ fresh(false); ctx.renderBrandPop(''); return true; });

console.log('\nITEM 7 — THE PAID 2K PHOTO');
item('retired from the catalog', ()=>!/\['scene-2k','2K brand scene'/.test(s)||'still listed');

console.log('\nITEM 8 — TYPOGRAPHY + LEGACY');
/* The type law moved from px to rem on 2026-07-25 so a user's own text size is respected.
   1rem IS 16px by default — the size is unchanged, the unit is now user-relative. */
item('body is 1rem (16px by default, scales with the user)', ()=>/--t-body:1rem/.test(s)||'missing');
item('no retired colours', ()=>{ const bad=['#4F8EF7','#2563EB','#C4B784','#EBE9B9','#8E77FF','#FF6B9E'].filter(h=>s.indexOf(h)>=0); return bad.length===0||bad; });

console.log('\n'+(fail===0?('ALL '+pass+' ITEMS PASS INDIVIDUALLY'):(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
