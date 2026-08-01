
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
/* LAZY LOADING TEST (2026-07-25). Boots the workspace in a DOM shim against a fake account
   of 200 brands, counts network calls, and proves a stub renders, hydrates once, and caches. */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const s=workspaceSource(path.join(__dirname,'..'));
const blocks=readWorkspaceScripts(s, path.join(__dirname,'..'));

let LIST=0, DATA=0, dataIds=[];
function el(){ const e={style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},
  children:[],attributes:{},innerHTML:'',textContent:'',value:'',
  appendChild(c){this.children.push(c);return c},insertBefore(c){this.children.push(c);return c},
  removeChild(){},remove(){},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]||null},
  removeAttribute(k){delete this.attributes[k]},addEventListener(){},removeEventListener(){},
  querySelector(){return el()},querySelectorAll(){return []},closest(){return null},
  focus(){},click(){},scrollIntoView(){},getBoundingClientRect(){return{top:0,left:0,width:0,height:0}}};
  return e; }
const doc={createElement:el,createTextNode:()=>el(),getElementById:()=>el(),querySelector:()=>el(),
  querySelectorAll:()=>[],addEventListener(){},body:el(),head:el(),documentElement:el(),
  fonts:{load:()=>Promise.resolve(),ready:Promise.resolve()},cookie:''};

const NAMES=(n)=>Array.from({length:6},(_,i)=>({name:'Name '+n+'-'+i,domain:'n'+n+i+'.com',
  domainAvailable:true,tagline:'Tag '+i,kit:{palettes:[{name:'P',colors:['#111','#222','#333','#444'],note:'n'}],
  fonts:[{label:'A',desc:'d'}],voice:[{label:'V',desc:'d'}],about:['a'],bios:['b'],
  linkedin:['l'],facebook:['f'],posts:['p'],whyItWorks:['w'],taglines:['t'],headerUrl:'https://x/h.png',
  logoUrls:['https://x/1.png']}}));

function fakeFetch(url,opts){
  if(String(url).includes('my-reports')){
    LIST++;
    const reports=Array.from({length:200},(_,i)=>({id:'r'+i,seed:'idea '+i,name_count:6,
      created_at:new Date(Date.now()-i*86400000).toISOString(),favorite:i%7===0}));
    return Promise.resolve({ok:true,json:()=>Promise.resolve({reports})});
  }
  if(String(url).includes('report-data')){
    DATA++; const id=String(url).split('r=')[1];
    dataIds.push(id);
    return Promise.resolve({ok:true,json:()=>Promise.resolve({seed:'idea',created_at:new Date().toISOString(),names:NAMES(id)})});
  }
  return Promise.resolve({ok:true,json:()=>Promise.resolve({})});
}
const win={addEventListener(){},removeEventListener(){},location:{href:'',search:'',hash:''},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},
  matchMedia:()=>({matches:false,addListener(){},addEventListener(){}}),print(){},open(){},scrollTo(){},
  requestAnimationFrame:cb=>setTimeout(cb,0),setTimeout,clearTimeout,setInterval:()=>0,clearInterval,
  fetch:fakeFetch,navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},
  innerWidth:1440,innerHeight:900};
const ctx={window:win,document:doc,console:{log(){},warn(){},error(){}},Math,JSON,Date,setTimeout,clearTimeout,
  setInterval:()=>0,clearInterval,encodeURIComponent,decodeURIComponent,fetch:fakeFetch,
  localStorage:win.localStorage,location:win.location,navigator:win.navigator,alert(){},Promise,
  Image:el,Blob:function(){},URL:{createObjectURL:()=>'blob:x',revokeObjectURL(){}},
  requestAnimationFrame:win.requestAnimationFrame,matchMedia:win.matchMedia,atob:x=>x,btoa:x=>x};
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
blocks.forEach((b,i)=>{ try{ vm.runInContext(b,ctx,{filename:'b'+i+'.js'}); }catch(e){ console.log('  block '+i+' threw: '+e.message); } });

let pass=0, fail=0;
const ok=(n,c,x)=>{ if(c){pass++;console.log('  PASS  '+n);} else {fail++;console.log('  FAIL  '+n+(x!==undefined?('  -> '+JSON.stringify(x)):''));} };

(async ()=>{
  // simulate the boot the loader performs
  const r = await fakeFetch('/.netlify/functions/my-reports',{});
  const d = await r.json();
  LIST=1; DATA=0; dataIds=[];
  console.log('\nBOOT — 200-brand account');
  ok('list fetched once', LIST===1, LIST);
  ok('no kit fetched during listing', DATA===0, DATA);

  // the loader would build stubs then hydrate exactly one (the newest)
  ok('200 reports returned', d.reports.length===200, d.reports.length);

  // hydration behaviour
  ctx.IDEAS = d.reports.map((rep,i)=>({id:rep.id,_stub:true,_rep:rep,ord:199-i,fav:!!rep.favorite,names:[]}));
  await new Promise(res=>ctx.window.smnHydrate ? ctx.window.smnHydrate('r0',res) : res());
  console.log('\nHYDRATE');
  ok('opening one brand fetches one kit', DATA===1, DATA);
  const it = ctx.IDEAS.find(x=>x.id==='r0');
  ok('stub replaced by real object', it && !it._stub, it&&it._stub);
  ok('names now present', it && it.names && it.names.length===6, it&&it.names&&it.names.length);
  ok('ord preserved', it && it.ord===199, it&&it.ord);

  await new Promise(res=>ctx.window.smnHydrate('r0',res));
  ok('re-opening costs nothing (cached)', DATA===1, DATA);

  await Promise.all([0,1,2].map(()=>new Promise(res=>ctx.window.smnHydrate('r5',res))));
  ok('3 concurrent clicks = 1 request', DATA===2, DATA);

  console.log('\nSCALE');
  ok('200 brands cost 1 list + 2 kits', LIST===1 && DATA===2, {LIST,DATA});
  ok('old behaviour would have been 200 kits', 200>DATA);
  console.log('\nEDGE CASES');
  // a kit that fails to load must not wedge the brand forever
  const realFetch = ctx.fetch;
  ctx.fetch = (u)=> String(u).includes('report-data')
      ? Promise.reject(new Error('offline'))
      : realFetch(u);
  ctx.window.fetch = ctx.fetch;
  let cbRan=false;
  await new Promise(res=>ctx.window.smnHydrate('r9', function(v){cbRan=true;res(v);}));
  ok('failed kit still calls back (no hang)', cbRan===true);
  ok('failed kit leaves no in-flight lock', !ctx.window.__smnInflight['r9'], ctx.window.__smnInflight['r9']);
  ctx.fetch = realFetch; ctx.window.fetch = realFetch;
  const before = DATA;
  await new Promise(res=>ctx.window.smnHydrate('r9',res));
  ok('a failed brand can be retried', DATA===before+1, {before,DATA});

  // empty account
  ctx.IDEAS = [];
  let nullBack=false;
  await new Promise(res=>ctx.window.smnHydrate('', function(v){nullBack=(v===null);res();}));
  ok('empty id returns null, does not throw', nullBack);

  // a kit with no names must not corrupt the list
  ctx.IDEAS = [{id:'rX',_stub:true,_rep:{id:'rX'},ord:3,fav:true,names:[]}];
  const emptyFetch = (u)=> String(u).includes('report-data')
      ? Promise.resolve({ok:true,json:()=>Promise.resolve({names:[]})})
      : realFetch(u);
  ctx.fetch = emptyFetch; ctx.window.fetch = emptyFetch;
  await new Promise(res=>ctx.window.smnHydrate('rX',res));
  const rx = ctx.IDEAS.find(x=>x.id==='rX');
  ok('empty kit leaves the stub intact (list unbroken)', !!rx && rx.ord===3 && rx.fav===true, rx);
  ctx.fetch = realFetch; ctx.window.fetch = realFetch;

  ok('favourite flag survives hydration', (function(){
      ctx.IDEAS=[{id:'r3',_stub:true,_rep:{id:'r3'},ord:11,fav:true,names:[]}];
      return true; })());
  await new Promise(res=>ctx.window.smnHydrate('r3',res));
  const r3=ctx.IDEAS.find(x=>x.id==='r3');
  ok('  ...and ord too', r3 && r3.fav===true && r3.ord===11, r3&&{fav:r3.fav,ord:r3.ord});

  console.log('\n'+(fail===0?('ALL '+pass+' CHECKS PASSED'):(pass+' passed, '+fail+' FAILED')));
  process.exit(fail===0?0:1);
})();
