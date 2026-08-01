
const fs = require('fs');
const src = fs.readFileSync('/tmp/olin_main.js', 'utf8');

function el(){ return { innerHTML:'', textContent:'', value:'', style:{}, dataset:{},
  classList:{toggle(){},add(){},remove(){},contains(){return false;}},
  addEventListener(){}, setAttribute(){}, getAttribute(){return null;},
  querySelector(){return el();}, querySelectorAll(){return [];}, appendChild(){}, focus(){} }; }

global.window = global;
global.document = { addEventListener(){}, querySelector(){return el();},
  querySelectorAll(){return [];}, getElementById(){return el();}, body: el() };
global.localStorage = { getItem(){return null;}, setItem(){} };
global.sessionStorage = { getItem(){return null;}, setItem(){} };
global.location = { search:'', href:'' };
global.fetch = () => new Promise(()=>{});
global.scrollTo = () => {};
global.requestAnimationFrame = () => {};
global.toast = () => {};

(0,eval)(src + ';window.__t={VIEWS:VIEWS,mapHandoff:mapHandoff,CLIENTS:CLIENTS};');
const V=global.__t.VIEWS, MH=global.__t.mapHandoff, CL=global.__t.CLIENTS;

var full = MH({
  id:'oh_1', status:'new', brand_name:'Rat Pack Harmonies', client_name:'Peter K',
  client_email:'x@y.com', domain:'ratpackharmonies.com', idea:'a vintage vocal trio',
  business:'entertainment', report_id:'b08fpk5gxfldo5',
  logo_urls:['https://x/1.png','https://x/2.png','https://x/3.png'], header_url:'https://x/h.png',
  taglines:['Swing it','Croon on'], palette:['#7C5CFF','#FF4D8D'],
  palettes:[{name:'Velvet',colors:['#111','#222','#333','#444'],note:'moody'}],
  fonts:[{label:'Playfair',desc:'headline serif'},{label:'Inter',desc:'body'}],
  voice:[{label:'Smooth',desc:'velvet'},{label:'Classic',desc:''}],
  bios:['Bio one'], about:['About one'], posts:['Post one','Post two'],
  why:['Sounds great','Easy to say'],
  assets:[{label:'Favicon pack',url:'https://q.supabase.co/storage/v1/object/public/spark/fav.zip'},{label:'Vector logo (SVG)',url:'https://x/logo.svg'}],
  gallery:[{url:'https://x/h.png',label:'Brand header',kind:'header'},
           {url:'https://x/s1.png',label:'Rat Pack Harmonies',kind:'scene'},
           {url:'https://x/s2.png',label:'Second Name',kind:'scene'}]
});
var bare = MH({ id:'oh_2', status:'new', brand_name:'Bare Brand', client_name:'B', report_id:'' });
// fallback path: no normalized palette, only the raw palettes[] from the kit builder
var fb = MH({ id:'oh_3', status:'new', brand_name:'Fallback Brand', client_name:'F', report_id:'rk3',
  logo_urls:['https://x/a.png'], palettes:[{name:'Velvet',colors:['#101010','#202020'],note:'x'}] });

CL.length = 0; CL.push(full, bare, fb);

const html = V.files();
const must = ['Favicon pack','Vector logo (SVG)','Open the workspace',
  'workspace.html?r=b08fpk5gxfldo5','Playfair','Smooth','Swing it','Why the name works',
  'Launch posts','#7C5CFF','Their idea','Cinematic \u2014 Rat Pack Harmonies','Cinematic \u2014 Second Name'];
let fail = 0;
for (const m of must) {
  const ok = html.indexOf(m) >= 0;
  console.log((ok?'PASS  ':'FAIL  ') + m);
  if (!ok) fail++;
}
const bareCard = html.split('Bare Brand')[1] || '';
const bareOK = bareCard.indexOf('Open the workspace') < 0;
console.log((bareOK?'PASS  ':'FAIL  ') + 'bare client shows no workspace link (empty report_id)'); if(!bareOK)fail++;
const noObj = html.indexOf('[object Object]') < 0;
console.log(noObj ? 'PASS  no [object Object] anywhere' : 'FAIL  [object Object] leaked'); if(!noObj)fail++;
const fbOK = html.indexOf('#101010') >= 0;
console.log((fbOK?'PASS  ':'FAIL  ') + 'palettes[].colors fallback renders when palette is absent'); if(!fbOK)fail++;
const dupOK = (html.split('href="https://x/h.png"').length - 1) === 1 && (html.split('https://x/h.png').length - 1) === 1;
console.log((dupOK?'PASS  ':'FAIL  ') + 'header photo is ONE clickable tile (no gallery duplicate)'); if(!dupOK)fail++;
const links=['href="https://x/1.png"','href="https://q.supabase.co/storage/v1/object/public/spark/fav.zip?download=Favicon%20pack.png"','href="https://x/logo.svg"','href="https://x/s1.png"','href="https://x/s2.png"'];
for (const L of links){const ok2=html.indexOf(L)>=0;console.log((ok2?'PASS  ':'FAIL  ')+'download link '+L);if(!ok2)fail++;}
const sbDl = html.indexOf('/storage/v1/object/public/spark/fav.zip?download=')>=0;
console.log((sbDl?'PASS  ':'FAIL  ')+'supabase URL gets ?download= (true file save)'); if(!sbDl)fail++;
const plainNT = html.indexOf('href="https://x/logo.svg" target="_blank"')>=0;
console.log((plainNT?'PASS  ':'FAIL  ')+'plain URL stays a new-tab open'); if(!plainNT)fail++;
const hint = html.indexOf('download</div>')>=0 || html.indexOf('· <svg')>=0;
console.log((hint?'PASS  ':'FAIL  ')+'download hint shows on real files'); if(!hint)fail++;
const svgOK = (html.indexOf('viewBox="0 0 24 24"')>=0);
console.log((svgOK?'PASS  ':'FAIL  ')+'SVG glyphs render (no placeholder block)'); if(!svgOK)fail++;
const noDiamond = html.indexOf('\u25c8')<0;
console.log((noDiamond?'PASS  ':'FAIL  ')+'the \u25c8 placeholder is gone from the vault'); if(!noDiamond)fail++;
const photoG = html.split('M5 17.5l4.4-4.6').length-1;
const docG = html.split('M13 3v5.8h5.8').length-1;
console.log(((photoG>0&&docG>0)?'PASS  ':'FAIL  ')+'both glyph kinds present (photo:'+photoG+' doc:'+docG+')'); if(!(photoG>0&&docG>0))fail++;
const noFold = html.indexOf('<details')<0 && html.indexOf('<summary')<0;
console.log((noFold?'PASS  ':'FAIL  ')+'no details folds — brief fully open'); if(!noFold)fail++;
const openTxt = html.indexOf('Bio one')>=0 && html.indexOf('Post one')>=0 && html.indexOf('Sounds great')>=0 && html.indexOf('About one')>=0;
console.log((openTxt?'PASS  ':'FAIL  ')+'bios/posts/why/about text visible without expanding'); if(!openTxt)fail++;
const mv = V.messages();
const mvOK = mv.indexOf('No messages yet') >= 0;
console.log(mvOK ? 'PASS  messages view renders empty threads' : 'FAIL  messages view'); if(!mvOK)fail++;
// every view must render with real+bare clients loaded
for (const v of Object.keys(V)) { try { V[v](); console.log('PASS  view renders: '+v); } catch(e){ console.log('FAIL  view throws: '+v+' -> '+e.message); fail++; } }
console.log(fail===0 ? '\nALL RENDER CHECKS CLEAN' : '\n'+fail+' CHECKS FAILED');
process.exit(fail===0?0:1);
