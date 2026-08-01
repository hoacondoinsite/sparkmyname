/* TEN NAV ITEMS SINCE 2026-07-26 — Concierge was added to the left bar by Founder order.
   See the warning on ACNAV in workspace-core.js: the panel it opens is not wired. */

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
/* CAPSULE + LINK AUDIT (2026-07-25). Renders every account section and every brand-card
   capsule, fires each, and verifies the return paths so a customer is never trapped. */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const s=workspaceSource(path.join(__dirname,'..'));
const blocks=readWorkspaceScripts(s, path.join(__dirname,'..'));
let RENDERED='';
const REG=[];
function mkEl(tag){
  const e={tagName:(tag||'div').toUpperCase(),style:{},dataset:{},attributes:{},children:[],
    innerHTML:'',textContent:'',value:'',disabled:false,
    classList:{_s:new Set(),add(x){this._s.add(x)},remove(x){this._s.delete(x)},
      toggle(x,f){f===undefined?(this._s.has(x)?this._s.delete(x):this._s.add(x)):(f?this._s.add(x):this._s.delete(x))},
      contains(x){return this._s.has(x)}},
    appendChild(c){this.children.push(c);return c},insertBefore(c){this.children.push(c);return c},
    removeChild(){},remove(){},
    setAttribute(k,v){this.attributes[k]=String(v);if(k.indexOf('data-')===0)this.dataset[k.slice(5).replace(/-(\w)/g,(m,c)=>c.toUpperCase())]=String(v);},
    getAttribute(k){return Object.prototype.hasOwnProperty.call(this.attributes,k)?this.attributes[k]:null;},
    removeAttribute(k){delete this.attributes[k]},
    addEventListener(ev,fn){if(ev==='click')REG.push({el:this,fn:fn});},
    removeEventListener(){},querySelector(sel){return QUERY(sel)[0]||null;},querySelectorAll(sel){return QUERY(sel);},
    closest(sel){const m=/\[data-([a-zA-Z0-9_-]+)\]/.exec(sel||'');
      if(m&&Object.prototype.hasOwnProperty.call(this.attributes,'data-'+m[1]))return this;
      return QUERY(sel)[0]||null;},
    focus(){},click(){},scrollIntoView(){},getBoundingClientRect(){return{top:0,left:0,width:0,height:0}},parentNode:null};
  return e;
}
function QUERY(sel){
  sel=String(sel||''); const out=[];
  const tagAt=(idx)=>{const a=RENDERED.lastIndexOf('<',idx),b=RENDERED.indexOf('>',idx);return (a>=0&&b>a)?RENDERED.slice(a,b):'';};
  const push=(tag)=>{const e=mkEl('button');
    if(tag){let a;const ra=/data-([a-zA-Z0-9_-]+)="([^"]*)"/g;
      while((a=ra.exec(tag))!==null)e.setAttribute('data-'+a[1],a[2]);
      const cm=/class="([^"]*)"/.exec(tag); if(cm)cm[1].split(/\s+/).forEach(c=>c&&e.classList.add(c));}
    out.push(e);};
  let m;
  if((m=/\[data-([a-zA-Z0-9_-]+)\]/.exec(sel))){
    const re=new RegExp('data-'+m[1]+'(?![a-zA-Z0-9_-])(?:="[^"]*")?','g');let h;
    while((h=re.exec(RENDERED))!==null){push(tagAt(h.index));if(out.length>60)break;}
  } else if((m=/^#([A-Za-z0-9_-]+)/.exec(sel))){ push(''); }
  else if((m=/\.([A-Za-z0-9_-]+)/.exec(sel))){
    const re=new RegExp('class="[^"]*\\b'+m[1]+'\\b[^"]*"','g');let h;
    while((h=re.exec(RENDERED))!==null){push(tagAt(h.index));if(out.length>60)break;}
  } else push('');
  return out;
}
const doc={createElement:mkEl,createTextNode:()=>mkEl(),getElementById:()=>mkEl(),
  querySelector:(x)=>QUERY(x)[0]||mkEl(),querySelectorAll:(x)=>QUERY(x),addEventListener(){},
  body:mkEl(),head:mkEl(),documentElement:mkEl(),fonts:{load:()=>Promise.resolve(),ready:Promise.resolve()},cookie:''};
const win={addEventListener(){},removeEventListener(){},location:{href:'',search:'',hash:''},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},
  matchMedia:()=>({matches:false,addListener(){},addEventListener(){}}),print(){},open(){},scrollTo(){},
  requestAnimationFrame:cb=>setTimeout(cb,0),setTimeout,clearTimeout,setInterval:()=>0,clearInterval,
  fetch:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({ok:true})}),
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}},innerWidth:1440,innerHeight:900};
const ctx={window:win,document:doc,console:{log(){},warn(){},error(){}},Math,JSON,Date,setTimeout,clearTimeout,
  setInterval:()=>0,clearInterval,encodeURIComponent,decodeURIComponent,fetch:win.fetch,
  localStorage:win.localStorage,location:win.location,navigator:win.navigator,alert(){},Promise,
  Image:mkEl,Blob:function(){},URL:{createObjectURL:()=>'b',revokeObjectURL(){}},
  requestAnimationFrame:win.requestAnimationFrame,matchMedia:win.matchMedia,atob:x=>x,btoa:x=>x};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);
blocks.forEach((b,i)=>{try{vm.runInContext(b,ctx,{filename:'b'+i+'.js'});}catch(e){console.log('  LOAD '+i+': '+e.message);}});

let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,120)):''));}};

console.log('ACCOUNT SECTIONS — every nav destination renders');
const NAV=[...s.matchAll(/\['([a-z]+)','&#\d+;','([A-Za-z ]+)','[^']*'\]/g)].map(m=>[m[1],m[2]]);
ok('twelve nav items found', NAV.length===12, NAV.length);
NAV.forEach(([key,label])=>{
  ctx.ACCT.sec=key;
  try{ const h=ctx.acSectionHTML(); ok(label+' ('+key+') renders', typeof h==='string'&&h.length>40, (h||'').length); }
  catch(e){ ok(label+' ('+key+') renders', false, e.message); }
});

console.log('\nRETURN PATHS — a customer must never be trapped');
ok('Escape closes the panel', /if\(\$\('#acctOv'\)\.classList\.contains\('open'\)\)closeAccount\(\)/.test(s.replace(/\s+/g,'')));
ok('the X button closes it', /data-acact="close"/.test(s));
ok('rail "Brands" returns to the workspace', /k==='brands'/.test(s));
ok('clicking a brand closes it', /\[data-openbrand\][\s\S]{0,120}closeAccount\(\)/.test(s));
const flat=s.replace(/\s+/g,' ');
ok('clicking the backdrop closes it', /if\(e\.target===ov\) closeAccount\(\);/.test(flat));
ok('rail nav toggles the open section shut', /isOpen && ACCT\.sec===k/.test(flat));
ok('nav shows which section is open', /x\.classList\.toggle\('on', x\.dataset\.wsnav===k\)/.test(flat));
ok('closing clears the nav highlight', /closeAccount\(\)\{[\s\S]{0,220}data-wsnav[\s\S]{0,60}remove\('on'\)/.test(flat));
console.log('  exits available: X, Escape, backdrop, Brands, same-section toggle, pick a brand = 6');

console.log('\nBRAND CARD CAPSULES');
const NAME={name:'N',mono:'NN',dom:'n.com',st:'Available',tag:'t',heroUrl:'https://x/h.png',
  logos:['https://x/1.png'],why:['a'],palettes:[{name:'P',note:'n',cols:['#111','#222','#333','#444']}],
  type:[{name:'Serif',note:'x'}],voice:[{name:'V',note:'x'}],taglines:['t'],biosT:['b'],aboutT:['a'],
  linkedinT:['l'],facebookT:['f'],postsT:['p']};
const IDEA={id:'c1',cat:'x',said:'y',ord:0,fav:false,header:'https://x/hdr.png',
  names:[NAME,NAME,NAME,NAME,NAME,NAME],palettes:NAME.palettes,type:NAME.type,voice:NAME.voice,
  biosT:NAME.biosT,aboutT:NAME.aboutT,linkedinT:NAME.linkedinT,facebookT:NAME.facebookT,
  postsT:NAME.postsT,why:NAME.why,taglines:NAME.taglines};
ctx.IDEAS=[IDEA];ctx.current='c1';ctx.curName=0;
ctx.window.__smnPicked=(ctx.IDEAS&&ctx.IDEAS[0]&&ctx.IDEAS[0].id)||'c1';  /* card is gated until a name is picked — pick one */
let html='';
try{html=ctx.mainHTML(IDEA);RENDERED=html;ok('brand card renders',html.length>1000,html.length);}
catch(e){ok('brand card renders',false,e.message);}
[['Favourite','data-brandsave'],['Download this brand','data-brandpdf'],['Send / share','data-sendbrand'],
 ['Support','data-support'],['Remove this brand','data-removebrand']].forEach(([l,k])=>{
  ok(l+' capsule present', html.indexOf(k)>=0);
  ok(l+' has a handler', new RegExp("\\[" + k + "\\]").test(s));
});

console.log('\nLINKS');
const hrefs=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
const ext=hrefs.filter(h=>/^https?:/.test(h));
const int=hrefs.filter(h=>/\.html/.test(h));
/* Reverse tabnabbing only applies to links that open a NEW TAB. A same-tab link cannot
   reach back through window.opener, so requiring rel=noopener on every external href was my
   error — it reported 28 problems that do not exist. */
const newTab=[...html.matchAll(/<a[^>]*target="_blank"[^>]*>/g)].map(a=>a[0]);
const unsafe=newTab.filter(a=>!/rel="noopener/.test(a));
ok('every new-tab link carries rel=noopener', unsafe.length===0, unsafe.length+' unsafe of '+newTab.length);
console.log('  links on the card: '+hrefs.length+' ('+ext.length+' external, '+int.length+' internal)');

console.log('\n'+(fail===0?('CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
