
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
const fs=require('fs'), vm=require('vm');
const s=fs.readFileSync(require('path').join(__dirname,'..','workspace.html'),'utf8');
const blocks=readWorkspaceScripts(s, path.join(__dirname,'..'));

function el(){ const e={ style:{}, dataset:{}, classList:{add(){},remove(){},toggle(){},contains(){return false}},
  children:[], attributes:{}, innerHTML:'', textContent:'', value:'',
  appendChild(c){this.children.push(c);return c}, insertBefore(c){this.children.push(c);return c},
  removeChild(){}, remove(){}, setAttribute(k,v){this.attributes[k]=v}, getAttribute(k){return this.attributes[k]||null},
  addEventListener(){}, removeEventListener(){}, querySelector(){return el()}, querySelectorAll(){return []},
  closest(){return null}, focus(){}, click(){}, scrollIntoView(){}, getBoundingClientRect(){return{top:0,left:0,width:0,height:0}} };
  return e; }
const doc={ createElement:el, createTextNode:()=>el(), getElementById:()=>el(),
  querySelector:()=>el(), querySelectorAll:()=>[], addEventListener(){}, body:el(), head:el(),
  documentElement:el(), fonts:{load:()=>Promise.resolve(),ready:Promise.resolve()}, cookie:'' };
const win={ addEventListener(){}, removeEventListener(){}, location:{href:'',search:'',hash:''},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}}, sessionStorage:{getItem:()=>null,setItem(){}},
  matchMedia:()=>({matches:false,addListener(){},addEventListener(){}}), print(){}, open(){}, scrollTo(){},
  requestAnimationFrame:cb=>setTimeout(cb,0), setTimeout, clearTimeout, setInterval:()=>0, clearInterval,
  fetch:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({}),blob:()=>Promise.resolve({})}),
  navigator:{userAgent:'node',clipboard:{writeText:()=>Promise.resolve()}}, innerWidth:1440, innerHeight:900 };
const ctx={ window:win, document:doc, console, Math, JSON, Date, setTimeout, clearTimeout,
  setInterval:()=>0, clearInterval, encodeURIComponent, decodeURIComponent, fetch:win.fetch,
  localStorage:win.localStorage, location:win.location, navigator:win.navigator, alert(){},
  Promise, Image:el, Blob:function(){}, URL:{createObjectURL:()=>'blob:x',revokeObjectURL(){}},
  requestAnimationFrame:win.requestAnimationFrame, matchMedia:win.matchMedia, atob:x=>x, btoa:x=>x };
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
blocks.forEach((b,i)=>{
  try{ vm.runInContext(b, ctx, {filename:'block'+i+'.js'}); console.log('  block '+i+' loaded'); }
  catch(e){ console.log('  block '+i+' THREW ON LOAD: '+e.message); }
});
console.log('  mainHTML defined:', typeof ctx.mainHTML);

const NAME={ name:'Palacio del Caribe', mono:'PC', dom:'palaciodelcaribe.com', st:'Available',
  tag:'Experience Paradise in Luxury.', heroUrl:'https://x/h.png',
  logos:['https://x/1.png','https://x/2.png','https://x/3.png'],
  why:['a','b','c','d','e','f','g','h'],
  palettes:[{name:'Tropical Elegance',note:'Warm.',cols:['#FFB74D','#FF5722','#4CAF50','#1976D2']},
            {name:'Ocean Serenity',note:'Calm.',cols:['#00796B','#B2DFDB','#FFEB3B','#FFD54F']},
            {name:'Sunset Bliss',note:'Vibrant.',cols:['#D32F2F','#F57F17','#FBC02D','#8E24AA']}],
  type:[{name:'Elegant Serif',note:'Classic.'},{name:'Modern Sans-Serif',note:'Clean.'},
        {name:'Script',note:'Flowing.'},{name:'Display',note:'Bold.'}],
  voice:[{name:'Warm',note:'x'},{name:'Luxurious',note:'x'}],
  taglines:['t1','t2','t3','t4','t5','t6'], biosT:['b1','b2','b3','b4','b5','b6'],
  aboutT:['a1','a2','a3'], linkedinT:['l1','l2','l3'], facebookT:['f1','f2','f3'],
  postsT:['p1','p2','p3','p4','p5','p6'] };
const IDEA={ id:'demo1', cat:'hotel', said:'a hotel and casino', ord:5, fav:false,
  header:'https://x/header.png', names:[NAME,NAME,NAME,NAME,NAME,NAME],
  palettes:NAME.palettes, type:NAME.type, voice:NAME.voice, biosT:NAME.biosT,
  aboutT:NAME.aboutT, linkedinT:NAME.linkedinT, facebookT:NAME.facebookT, postsT:NAME.postsT,
  why:NAME.why, taglines:NAME.taglines };
ctx.IDEAS=[IDEA]; ctx.current='demo1'; ctx.curName=0;
try{
  const html=ctx.mainHTML(IDEA);
  console.log('  mainHTML RETURNED OK — ' + html.length + ' chars');
  /* INSPECT */
  const want=[['brand photo','cinehero'],['Download capsule','data-brandpdf'],['Save capsule','data-brandsave'],
    ['count pills','bkacc-n'],['palette head','palhead'],['hex label bar','class="ch"'],
    ['seven-photo grid','data-hdrdl'],['tab row','tab tab-dl'],['13 sections','bkacc-t']];
  want.forEach(([l,k])=>console.log('    '+(html.includes(k)?'present ':'MISSING ')+l));
  const secs=(html.match(/data-bkacc="/g)||[]).length;
  console.log('    sections rendered: '+secs);
  const pills=(html.match(/class="bkacc-n"/g)||[]).length;
  console.log('    count pills rendered: '+pills);
  const pal=(html.match(/class="palset"/g)||[]).length;
  console.log('    palettes rendered: '+pal);
}catch(e){
  console.log('  mainHTML THREW: ' + e.constructor.name + ': ' + e.message);
  console.log('  stack: ' + String(e.stack).split('\n').slice(1,4).join(' | '));
}

/* NAME GRID CHECK (2026-07-25) — six distinct photos, no crop, responsive. */
{
  const NAMES = ['Structure Stewardship','SpaceSimplicity','WarmNest Partners',
                 'KeyHome Management','Space Steward','DwellDynamics'];
  const IDEA2 = { id:'grid', cat:'adu', said:'Turnkey ADU management.', ord:9, fav:false,
    header:'https://x/hdr.png',
    names: NAMES.map((nm,k)=>Object.assign({}, NAME, {
      name:nm, mono:nm.slice(0,2).toUpperCase(),
      dom:nm.toLowerCase().replace(/[^a-z]/g,'')+'.com', st:'Available',
      tag:'Tagline for '+nm,
      heroUrl:'https://x/scene-'+k+'.png' })),
    palettes:NAME.palettes, type:NAME.type, voice:NAME.voice, biosT:NAME.biosT,
    aboutT:NAME.aboutT, linkedinT:NAME.linkedinT, facebookT:NAME.facebookT,
    postsT:NAME.postsT, why:NAME.why, taglines:NAME.taglines };
  ctx.IDEAS=[IDEA2]; ctx.current='grid'; ctx.curName=0;
  const html = ctx.mainHTML(IDEA2);
  const photos = [...html.matchAll(/class="nopt-photo"><img src="([^"]+)"/g)].map(m=>m[1]);
  console.log('  --- name grid ---');
  console.log('    photo frames rendered : ' + photos.length + ' (expect 6)');
  console.log('    all distinct          : ' + (new Set(photos).size === photos.length));
  console.log('    urls                  : ' + photos.map(u=>u.split('/').pop()).join(', '));
  console.log('    logo used instead     : ' + (html.match(/ph-logo/g)||[]).length);
  console.log('    monogram fallback     : ' + (html.match(/ph-mono/g)||[]).length);
  console.log('    lazy + async on each  : ' + ((html.match(/loading="lazy" decoding="async"/g)||[]).length >= 6));
  // a name with no photo must still render a complete card
  const IDEA3 = JSON.parse(JSON.stringify(IDEA2));
  IDEA3.names[2].heroUrl=''; IDEA3.names[2].logos=[];
  IDEA3.names[4].heroUrl='';
  ctx.IDEAS=[IDEA3]; ctx.current='grid';
  const h3 = ctx.mainHTML(IDEA3);
  console.log('    with 2 photos missing : ' +
    ((h3.match(/class="nopt-photo"><img/g)||[]).length) + ' photos, ' +
    ((h3.match(/ph-logo/g)||[]).length) + ' logo, ' +
    ((h3.match(/ph-mono/g)||[]).length) + ' monogram');
  console.log('    cards still rendered  : ' + (h3.match(/class="nopt brx/g)||[]).length + '/6');
}

/* HEADER + ACTION ROW CHECK (2026-07-25) */
{
  ctx.IDEAS=[IDEA]; ctx.current='demo1'; ctx.curName=0;
  const h = ctx.mainHTML(IDEA);
  const has = (k)=>h.includes(k);
  console.log('  --- header + actions ---');
  [['availability header','class="webavail"'],['green badge','wa-badge'],
   ['name at display size','wa-name'],['domain','wa-domain'],['tagline italic','wa-tag'],
   ['handles one line','wa-handlelist'],['handle links out','wa-hl']]
   .forEach(([l,k])=>console.log('    '+(has(k)?'yes ':'NO  ')+l));
  const acts=[...h.matchAll(/class="cact[^"]*"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)</g)].length;
  console.log('    action buttons        : '+(h.match(/class="cact/g)||[]).length);
  [['Favourite','data-brandsave'],['Download this brand','data-brandpdf'],
   ['Send / share','data-sendbrand'],['Support','data-support'],['Remove','data-removebrand']]
   .forEach(([l,k])=>console.log('    '+(has(k)?'yes ':'NO  ')+l));
  console.log('    old duplicate capsules: '+((h.match(/>Download<\/button>/g)||[]).length));
  console.log('    label is "Download this brand": '+h.includes('Download this brand'));
  console.log('    no "Download kit" left : '+(!h.includes('Download kit')));
  // section order
  const order=[...h.matchAll(/data-bkacc="([a-z]+)"/g)].map(m=>m[1]);
  console.log('    first section         : '+order[0]+'  (expect overview)');
  console.log('    section order         : '+order.join(' > '));
  // centring
  console.log('    name cards centred    : '+/\.nopt\.brx \.brx-l\{text-align:center\}/.test(
     require('fs').readFileSync(require('path').join(__dirname,'..','workspace.html'),'utf8').replace(/\n\s*/g,'')));
}
