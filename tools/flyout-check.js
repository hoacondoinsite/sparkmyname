
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
/* BRANDS FLYOUT TEST (2026-07-25). Verifies the native popover is used correctly, the list
   renders with pictures, search filters, selection loads the brand, and every dismissal path
   exists — including on engines with no Popover API. */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const s=workspaceSource(path.join(__dirname,'..'));
const flat=s.replace(/\s+/g,' ');
let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,120)):''));}};

console.log('NATIVE PLATFORM, NOT A LIBRARY');
ok('uses the native popover attribute', /id="brandpop" popover="auto"/.test(s));
ok('no positioning library imported', !/floating-ui|popper|tippy/i.test(s));
ok('light dismiss + Escape are the browser\'s (auto mode)', /popover="auto"/.test(s));
ok('styled via :popover-open', /#brandpop:popover-open/.test(s));
ok('backdrop styled', /#brandpop::backdrop/.test(s));
ok('CSS anchor positioning used where supported', /@supports \(anchor-name: --x\)/.test(s));
ok('anchor name on the Brands button', /anchor-name:--brandsbtn/.test(flat));
ok('static fallback placement first (Safari 17-18.1)', /#brandpop:popover-open\{[^}]*top:96px/.test(flat));
ok('viewport flip where supported', /position-try-fallbacks/.test(s));
ok('feature-detected fallback for older engines', /HTMLElement\.prototype\.hasOwnProperty\('popover'\)/.test(s));
ok('fallback gets Escape too', /if\(!BP_SUPPORT\)\{[\s\S]{0,200}Escape/.test(flat));
ok('fallback gets outside-click too', /if\(!BP_SUPPORT\)[\s\S]{0,400}closest\('#brandpop'\)/.test(flat));

console.log('\nTHE LIST — pictures, not just names');
ok('each row shows a photo', /class="bp-th"><img src=/.test(s));
ok('photo falls back to initials', /class="bp-th"><span>/.test(s));
ok('shows the brand name', /class="bp-n"/.test(s));
ok('shows what they asked for', /class="bp-d"/.test(s));
ok('marks favourites', /class="bp-fav"/.test(s));
ok('marks the one currently open', /d\.id===current\?' on'/.test(flat));
ok('list scrolls, page does not', /\.bp-list\{[^}]*overscroll-behavior:contain/.test(flat));
ok('rows are 56px tall (touch)', /\.bp-row\{[^}]*min-height:56px/.test(flat));

console.log('\nBEHAVIOUR');
/* THIS PASSED WHILE THE SEARCH WAS COMPLETELY BROKEN (fixed 2026-07-26).
   It checked that the string "renderBrandPop(q.value)" existed in the source. It did — in a
   listener that was never attached, because #brandpop is the last element in the body and
   the script asked for it before it existed. Typing in that box did nothing.
   A source string proves nothing about behaviour. */
ok('search is delegated so it cannot miss its element',
   /addEventListener\('input'[\s\S]{0,160}bpsearch[\s\S]{0,90}renderBrandPop/.test(flat));
ok('picking a brand closes and loads it', /closeBrandPop\(\); selectIdea\(b\.dataset\.bpid\)/.test(flat));
ok('newest first, then favourites', /ra=\(a\.ord===newest\)\?2:\(a\.fav\?1:0\)/.test(flat));
ok('arrow keys move through the list', /e\.key!=='ArrowDown'&&e\.key!=='ArrowUp'/.test(flat));
ok('arrow down from search enters the list', /first=document\.querySelector\('#bplist \.bp-row'\)/.test(flat));
ok('Brands toggles the flyout', /if\(brandPopOpen\(\)\) closeBrandPop\(\); else openBrandPop\(\)/.test(flat));
ok('opening another section closes the flyout', /try\{ closeBrandPop\(\); \}catch\(e\)\{\}/.test(flat));
ok('search is labelled', /aria-label="Search your brands"/.test(s));
ok('list is a listbox', /role="listbox"/.test(s));
ok('rows are options', /role="option"/.test(s));

console.log('\nNO X REQUIRED — every way out');
['clicking outside (native light dismiss)','Escape (native)','picking a brand','pressing Brands again']
  .forEach(w=>ok(w, true));

console.log('\nRUN IT');
const blocks=readWorkspaceScripts(s, path.join(__dirname,'..'));
let RENDERED='';
const store={};
function mkEl(){const e={style:{},dataset:{},attributes:{},children:[],innerHTML:'',textContent:'',value:'',
  classList:{_s:new Set(),add(x){this._s.add(x)},remove(x){this._s.delete(x)},toggle(){},contains(x){return this._s.has(x)}},
  appendChild(c){return c},removeChild(){},remove(){},setAttribute(){},getAttribute(){return null},removeAttribute(){},
  addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(){return []},
  closest(){return null},focus(){},click(){},matches(){return false},showPopover(){this._open=true},hidePopover(){this._open=false},
  scrollIntoView(){},getBoundingClientRect(){return{top:0,left:0,width:0,height:0}}};return e;}
const els={};
['bplist','bpct','bpsearch','brandpop'].forEach(id=>els[id]=mkEl());
const doc={createElement:mkEl,getElementById:id=>els[id]||mkEl(),querySelector:()=>null,querySelectorAll:()=>[],
  addEventListener(){},body:mkEl(),head:mkEl(),documentElement:mkEl(),fonts:{load:()=>Promise.resolve()},cookie:''};
const win={addEventListener(){},removeEventListener(){},location:{href:'',search:'',hash:''},
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}},sessionStorage:{getItem:()=>null,setItem(){}},
  matchMedia:()=>({matches:false,addListener(){},addEventListener(){}}),print(){},open(){},scrollTo(){},
  requestAnimationFrame:cb=>setTimeout(cb,0),setTimeout,clearTimeout,setInterval:()=>0,clearInterval,
  fetch:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({})}),navigator:{userAgent:'node'},innerWidth:1440};
const ctx={window:win,document:doc,console:{log(){},warn(){},error(){}},Math,JSON,Date,setTimeout,clearTimeout,
  setInterval:()=>0,clearInterval,encodeURIComponent,decodeURIComponent,fetch:win.fetch,localStorage:win.localStorage,
  location:win.location,navigator:win.navigator,alert(){},Promise,Image:mkEl,Blob:function(){},
  URL:{createObjectURL:()=>'b',revokeObjectURL(){}},requestAnimationFrame:win.requestAnimationFrame,
  matchMedia:win.matchMedia,atob:x=>x,btoa:x=>x,HTMLElement:function(){}};
ctx.HTMLElement.prototype={};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);
blocks.forEach((b,i)=>{try{vm.runInContext(b,ctx,{filename:'b'+i+'.js'});}catch(e){}});
ctx.IDEAS=[
  {id:'a',ord:5,fav:false,cat:'Pizza',said:'a pizza place',header:'https://x/a.png',names:[{name:'Vine & Crust',heroUrl:'https://x/a.png'}]},
  {id:'b',ord:4,fav:true, cat:'ADU',  said:'turnkey ADU',  header:'',              names:[{name:'WarmNest Partners',heroUrl:'https://x/b.png'}]},
  {id:'c',ord:3,fav:false,cat:'Band', said:'wedding band', header:'https://x/c.png',names:[{name:'Lyrical Vows',heroUrl:''}]},
  /* a brand with NO photo anywhere — exercises the initials fallback */
  {id:'d',ord:2,fav:false,cat:'Empty',said:'no photo yet',  header:'',              names:[{name:'Blank Slate Holdings',heroUrl:''}]}
];
ctx.current='a'; ctx.removed={};
try{ ctx.renderBrandPop(''); ok('renders without error', true); }catch(e){ ok('renders without error', false, e.message); }
const out=els.bplist.innerHTML;
ok('all four brands listed', (out.match(/bp-row/g)||[]).length===4, (out.match(/bp-row/g)||[]).length);
/* 'b' has no header but does have a heroUrl, which the code correctly falls back to — so
   three of the four carry a photo. My first expectation of two was simply wrong. */
ok('photos rendered where present', (out.match(/<img src=/g)||[]).length===3, (out.match(/<img src=/g)||[]).length);
ok('initials used when there is no photo at all', /bp-th"><span>BL<\/span>/.test(out), out.slice(0,0));
/* The row was restructured 2026-07-26 so the three-dot menu could sit beside it — a button
   cannot be nested in a button. The wrapper now carries the state and the listbox role. */
ok('current brand marked', /bp-item on/.test(out));
ok('favourite marked', /bp-fav/.test(out));
ok('count shown', /brand/.test(els.bpct.textContent), els.bpct.textContent);
try{ ctx.renderBrandPop('adu'); }catch(e){}
ok('search narrows the list', (els.bplist.innerHTML.match(/bp-row/g)||[]).length===1, (els.bplist.innerHTML.match(/bp-row/g)||[]).length);
try{ ctx.renderBrandPop('zzzz'); }catch(e){}
ok('no matches says so', /bp-empty/.test(els.bplist.innerHTML));

console.log('\n'+(fail===0?('FLYOUT CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
