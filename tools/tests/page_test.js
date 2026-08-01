// HOMEPAGE INTEGRITY — written 27 July 2026 after shipping a BLANK PAGE.
// Root cause: HTML was injected into a JavaScript string, the script stopped parsing, and
// every section was opacity:0 waiting for that script. Nobody checked the script parsed.
const fs=require('fs');
const vm=require('vm');
const d=fs.readFileSync('/home/claude/site/index.html','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// 1. EVERY script block must actually parse. This is the check that was missing.
// Only executable script blocks. A type="application/ld+json" block is structured data,
// not JavaScript, and running it through a JS parser reports a false failure.
const blocks=[...d.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(m=>!/type\s*=\s*["'][^"']*json/i.test(m[1]))
  .map(m=>m[2]).filter(s=>s.trim());
blocks.forEach((s,i)=>{
  let good=true, err='';
  try{ new vm.Script(s); }catch(e){ good=false; err=e.message.slice(0,70); }
  ok('script block '+(i+1)+' parses'+(good?'':' — '+err), good);
});

// 2. The page must be readable WITHOUT JavaScript.
ok('content is visible by default', d.includes('.reveal{opacity:1;transform:none}'));
ok('the fade-in is opt-in only', d.includes('html.js-anim .reveal{opacity:0'));
ok('opt-in happens inside the script', d.includes("classList.add('js-anim')"));

// 3. No HTML injected into JS strings (the exact fault).
blocks.forEach((s,i)=>{
  ok('block '+(i+1)+' has no raw newline inside a string literal',
     !/'[^'\n]*<div[^'\n]*\n/.test(s));
});

// 4. Markup properly nested, ignoring anything inside scripts.
const spans=[...d.matchAll(/<script[\s\S]*?<\/script>/g)].map(m=>[m.index,m.index+m[0].length]);
const inScript=p=>spans.some(([a,b])=>p>=a&&p<b);
let depth=0, orphan=false;
for(const m of d.matchAll(/<div\b[^>]*>|<\/div>/g)){
  if(inScript(m.index)) continue;
  if(m[0].startsWith('</')){ if(depth===0){orphan=true;break;} depth--; } else depth++;
}
ok('markup properly nested', !orphan && depth===0);
ok('sections balanced', (d.match(/<section/g)||[]).length===(d.match(/<\/section>/g)||[]).length);

// 5. The money path.
ok('checkout endpoint called', d.includes('/.netlify/functions/create-checkout'));
ok('buy buttons present', (d.match(/data-buy/g)||[]).length>=4);
ok('the idea is sent along', /seed:\s*seed/.test(d));

// 6. THE SCRIPT MUST ACTUALLY RUN, not merely parse. Parsing catches syntax errors; it does
//    not catch a handler reaching for an element that was deleted. That threw on load and
//    blanked the page once already.
const vm2=require('vm');
const htmlOnly=d.replace(/<script[\s\S]*?<\/script>/g,'');
const realIds=new Set([...htmlOnly.matchAll(/id="([A-Za-z0-9_-]+)"/g)].map(m=>m[1]));
const el=()=>({style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},
  addEventListener(){},querySelectorAll(){return []},querySelector(){return null},innerHTML:'',
  textContent:'',value:'',dataset:{},setAttribute(){},getAttribute(){return null},
  removeAttribute(){},appendChild(){},remove(){},focus(){},scrollIntoView(){},
  insertAdjacentHTML(){},disabled:false});
const doc={getElementById:id=>realIds.has(id)?el():null,querySelector:()=>null,
  querySelectorAll:()=>[],createElement:()=>el(),addEventListener(){},
  documentElement:{classList:{add(){},remove(){}}},body:el()};
const ctx={document:doc,navigator:{},location:{href:''},console:{log(){},warn(){},error(){}},
  setTimeout:()=>0,setInterval:()=>0,clearInterval(){},clearTimeout(){},
  fetch:()=>Promise.resolve({json:()=>({})}),
  IntersectionObserver:function(){this.observe=()=>{};this.unobserve=()=>{};this.disconnect=()=>{}},
  performance:{now:()=>0},sessionStorage:{getItem:()=>null,setItem(){}},JSON,Math,Date,encodeURIComponent};
ctx.window=ctx; ctx.globalThis=ctx;
let ran=true, why='';
try{ vm2.createContext(ctx); blocks.forEach(s=>new vm2.Script(s).runInContext(ctx)); }
catch(e){ ran=false; why=e.message.slice(0,60); }
ok('the page script RUNS without throwing'+(ran?'':' — '+why), ran);
console.log(fail===0?'\nHOMEPAGE CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
