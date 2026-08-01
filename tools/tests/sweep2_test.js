// SWEEP 2 — device readiness, performance, wiring, accessibility depth.
const fs=require('fs'), vm=require('vm'), path=require('path');
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const P=[]; const add=(c,p,d)=>P.push({c,p,d});

for(const f of pages){
  const d=fs.readFileSync(f,'utf8');
  const css=[...d.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');

  // --- DEVICE: horizontal overflow risks ---
  if(/width:\s*100vw/.test(css) && !/overflow-x:\s*hidden/.test(css))
    add('OVERFLOW RISK',f,'100vw width without overflow-x guard');
  // fixed pixel widths larger than a small phone, outside media queries
  // A fixed width only overflows if nothing caps it. A max-width elsewhere for the same
  // selector, or a root overflow guard, makes it safe.
  const guarded=/overflow-x:\s*hidden/.test(css);
  const bigFixed=[...css.matchAll(/([^{}]{0,50})\{[^}]*(?:^|[;{])\s*width:\s*(\d{3,})px/g)]
    .filter(m=>+m[2]>360 && !/max-width/.test(m[0]))
    .filter(m=>{ const sel=m[1].trim().split(/[\s,]/).pop();
                 return sel && !new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^{]*\\{[^}]*max-width').test(css); });
  if(bigFixed.length && !guarded) add('FIXED WIDTH',f,bigFixed.length+' unguarded rule(s), e.g. '+bigFixed[0][2]+'px');

  // --- DEVICE: touch targets ---
  // Only interactive elements need a 44px target. A status line or a caption does not.
  const INTERACTIVE=/(^|[\s,>])(a|button|select|summary|input|\.btn|\.tab|\.pill|\.chip|\.exp|\.act|\[role="button"\])(\b|[.:\[])/i;
  const smallTap=[...css.matchAll(/([^{}]+)\{[^}]*min-height:\s*(\d+)px/g)]
    .filter(m=>+m[2]>0 && +m[2]<44 && INTERACTIVE.test(m[1]));
  if(smallTap.length) add('SMALL TAP TARGET',f,smallTap.length+' interactive rule(s) under 44px: '+smallTap[0][1].trim().slice(-30));

  // --- DEVICE: iOS zoom on input focus ---
  const inputFont=[...css.matchAll(/(?:input|textarea|select)[^{]*\{[^}]*font-size:\s*(\d+)px/g)].map(m=>+m[1]).filter(v=>v<16);
  if(inputFont.length) add('IOS ZOOM',f,'input font under 16px triggers Safari zoom');

  // --- PERFORMANCE ---
  const imgs=[...d.matchAll(/<img\b[^>]*>/g)];
  const noDim=imgs.filter(m=>(!/width\s*=/.test(m[0])||!/height\s*=/.test(m[0]))
    && !/\$\{|'\s*\+|\+\s*'/.test(m[0]));   // a JS template has no measurable file
  if(noDim.length) add('LAYOUT SHIFT',f,noDim.length+' image(s) without width/height');
  const noLazy=imgs.filter(m=>!/loading\s*=/.test(m[0]) && !/\$\{|'\s*\+|\+\s*'/.test(m[0]));
  if(noLazy.length>1) add('NO LAZY LOAD',f,noLazy.length+' image(s) load eagerly');
  // A local config file that later scripts read MUST run first; deferring it breaks them.
  const blocking=[...d.matchAll(/<script(?![^>]*(?:async|defer|type=["']application\/(?:ld\+)?json))[^>]*\bsrc="([^"]+)"/g)]
    .filter(m=>!/config|supabase-config|workspace-core/i.test(m[1]));
  if(blocking.length) add('BLOCKING SCRIPT',f,blocking.length+' external script(s) block first paint');

  // --- WIRING: buttons that go nowhere ---
  let js=[...d.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m=>!/json/i.test(m[1])&&!/\bsrc=/.test(m[1])).map(m=>m[2]).join('\n');
  // include any local script the page loads — handlers often live there
  [...d.matchAll(/<script[^>]*\bsrc="(?!https?:)([^"]+)"/g)].forEach(m=>{
    const p=m[1].split('?')[0].replace(/^\//,'');
    if(fs.existsSync(p)) js += '\n' + fs.readFileSync(p,'utf8');
  });
  const html=d.replace(/<script[\s\S]*?<\/script>/g,'');
  const btnAttrs=new Set([...html.matchAll(/<button[^>]*\bdata-([a-z0-9]+)\s*=/g)].map(m=>m[1]));
  btnAttrs.forEach(a=>{
    // a handler may bind by attribute, by dataset, or by the element's class — all count
    const classBound = new RegExp("querySelectorAll\\('\\.[a-z-]+'\\)[\\s\\S]{0,200}dataset\\."+a).test(js);
    if(!new RegExp('\\[data-'+a+'\\]').test(js) && !new RegExp('dataset\\.'+a).test(js)
       && !classBound && a!=='i18n' && a!=='buy')
      add('DEAD BUTTON',f,'data-'+a+' has no handler');
  });
  const onclicks=[...html.matchAll(/onclick="(\w+)\(/g)].map(m=>m[1]);
  [...new Set(onclicks)].forEach(fn=>{
    if(!new RegExp('function\\s+'+fn+'\\b|'+fn+'\\s*=\\s*function|window\\.'+fn+'\\s*=').test(js+d))
      add('MISSING FUNCTION',f,fn+'() called but never defined');
  });

  // --- ACCESSIBILITY depth ---
  const clean=html.replace(/<!--[\s\S]*?-->/g,'').replace(/\/\*[\s\S]*?\*\//g,'');
  const h1=(clean.match(/<h1\b/g)||[]).length;
  if(h1===0) add('NO H1',f,'page has no h1');
  if(h1>1) add('MULTIPLE H1',f,h1+' h1 elements');
  const btnNoText=[...html.matchAll(/<button[^>]*>\s*<\/button>/g)];
  if(btnNoText.length) add('EMPTY BUTTON',f,btnNoText.length+' button(s) with no label');
}
const by={}; P.forEach(x=>by[x.c]=(by[x.c]||0)+1);
console.log('SWEEP 2 — DEVICE, PERFORMANCE, WIRING, ACCESSIBILITY');
console.log('='.repeat(58));
if(!P.length) console.log('NO PROBLEMS FOUND');
else{
  Object.entries(by).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>console.log(String(n).padStart(5)+'  '+c));
  console.log('-'.repeat(58)); console.log(P.length+' TOTAL');
}
fs.writeFileSync('/tmp/p2.json', JSON.stringify(P,null,1));
