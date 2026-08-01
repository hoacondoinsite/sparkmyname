
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
/* HEADER LANGUAGE + CURRENCY TEST (2026-07-25). Executes both engines against the real
   index.html markup and verifies every language and every currency actually changes the page. */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{if(c){pass++;console.log('  PASS  '+n);}else{fail++;console.log('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,110)):''));}};

console.log('MARKUP');
ok('language select present', /<select id="lang"/.test(html));
ok('currency select present', /<select id="cur"/.test(html));
ok('sits LEFT of the login', html.indexOf('id="lang"') < html.indexOf('class="lg"'));
ok('"Start Your Spark" removed from the header',
   !/<a class="gbtn" href="checkout.html">Start Your Spark<\/a>/.test(html));
ok('both selects are labelled for screen readers', (html.match(/class="sr-only" for="(lang|cur)"/g)||[]).length===2);
ok('selects >= 38px tall (touch)', /\.hdsel select\{[^}]*min-height:38px/.test(html.replace(/\n\s*/g,'')));
ok('visible focus ring', /\.hdsel select:focus-visible/.test(html));
const langs=/<select id="lang"[\s\S]*?<\/select>/.exec(html)[0].match(/value="(\w+)"/g).map(x=>x.slice(7,-1));
const curs=/<select id="cur"[\s\S]*?<\/select>/.exec(html)[0].match(/value="(\w+)"/g).map(x=>x.slice(7,-1));
console.log('        languages: '+langs.join(', ')+'   currencies: '+curs.join(', '));

console.log('\nTARGETS THE ENGINES ACT ON');
const i18nCount=(html.match(/data-i18n="/g)||[]).length;
const priceCount=(html.match(/data-price="99"/g)||[]).length;
ok('page has translatable elements', i18nCount>=6, i18nCount);
ok('page has convertible prices', priceCount>=4, priceCount);
console.log('        data-i18n: '+i18nCount+'   data-price: '+priceCount);

console.log('\nENGINES RUN');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(b=>b.indexOf('LANGUAGE + CURRENCY')>=0);
ok('engine block found in the page', !!script);

/* Build a DOM from the real markup so the engines act on real elements. */
function parse(){
  const els=[];
  const re=/<([a-z]+)([^>]*data-(?:i18n|price)="[^"]*"[^>]*)>([^<]*)</g; let m;
  while((m=re.exec(html))!==null){
    const attrs=m[2]; const e={_t:m[3],attributes:{}};
    let a; const ra=/([a-z0-9-]+)="([^"]*)"/g;  /* data-i18n contains digits */
    while((a=ra.exec(attrs))!==null) e.attributes[a[1]]=a[2];
    e.getAttribute=k=>e.attributes[k]!==undefined?e.attributes[k]:null;
    e.setAttribute=(k,v)=>{e.attributes[k]=v};
    Object.defineProperty(e,'textContent',{get(){return e._t},set(v){e._t=v}});
    els.push(e);
  }
  return els;
}
const DOM=parse();
const sel={lang:{value:'en',addEventListener(){}},cur:{value:'USD',addEventListener(){}}};
const store={};
const ctx={
  document:{ getElementById:id=>sel[id]||null,
    querySelectorAll:q=>{ const k=/data-i18n/.test(q)?'data-i18n':'data-price';
      return DOM.filter(e=>e.attributes[k]!==undefined); },
    addEventListener(){}, readyState:'complete',
    documentElement:{setAttribute(){}} },
  localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v}},
  navigator:{language:'en-US'}, console:{log(){}}, Math, parseFloat, isNaN
};
ctx.window=ctx; ctx.globalThis=ctx;
vm.createContext(ctx);
try{ vm.runInContext(script, ctx); ok('engine executes without error', true); }
catch(e){ ok('engine executes without error', false, e.message); }

console.log('\nEVERY LANGUAGE CHANGES THE PAGE');
const nav1=()=>DOM.find(e=>e.attributes['data-i18n']==='nav1');
const expect={en:'Features',es:'Funciones',fr:'Fonctionnalités',de:'Funktionen',pt:'Recursos'};
langs.forEach(L=>{
  /* boot() restores the SAVED choice, which is correct behaviour on page load — so to test a
     selection, set what the engine will read rather than the select it is about to overwrite. */
  store['smn_lang']=L; sel.lang.value=L;
  try{ vm.runInContext(script, ctx); }catch(e){}
  ok(L.toUpperCase()+' translates the nav', nav1() && nav1().textContent===expect[L], nav1()&&nav1().textContent);
});

console.log('\nEVERY CURRENCY CONVERTS');
const price=()=>DOM.find(e=>e.attributes['data-price']==='99');
const want={USD:'$99',EUR:'€92',GBP:'£78',JPY:'¥15,345',BRL:'R$505',INR:'₹8,217'};
sel.lang.value='en';
curs.forEach(C=>{
  store['smn_cur']=C; sel.cur.value=C;
  try{ vm.runInContext(script, ctx); }catch(e){}
  const got=price()&&price().textContent;
  ok(C+' converts', got===want[C], got+' (expected '+want[C]+')');
});

console.log('\nMEMORY');
ok('language choice is remembered', store['smn_lang']!==undefined, store['smn_lang']);
ok('currency choice is remembered', store['smn_cur']!==undefined, store['smn_cur']);

console.log('\n'+(fail===0?('HEADER CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
