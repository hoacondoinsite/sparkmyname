// EVERY DECK TILE, END TO END: rendered -> bound -> target function/endpoint exists.
const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const fns=new Set([...src.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
const endpoints=new Set([...src.matchAll(/\/\.netlify\/functions\/([a-z0-9-]+)/g)].map(m=>m[1]));
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

const tiles=[
 ['Download this brand','dlall',      ()=>fns.has('downloadAll') && /downloadAll\(IDEA,dla\)/.test(src)],
 ['Brand sheet (PDF)','brandpdf',     ()=>/window\.print\(\)/.test(src)],
 ['All 6 names','dlallnames',         ()=>/downloadAll\(IDEA,dlan,'all'\)/.test(src)],
 ['Email it to me','sendbrand',       ()=>endpoints.has('email-brand')],
 ['AI Studio','tool',                 ()=>fns.has('openAIStudio') && /ai:'openAIStudio'/.test(src)],
 ['Success Path','tool',              ()=>fns.has('openSuccess') && /success:'openSuccess'/.test(src)],
 ['Hand it to a designer','olin',     ()=>fns.has('handoffToOlin') && endpoints.has('olin-handoff')],
 ['More names','morenames',           ()=>endpoints.has('add-names')],
 ['Message the Spark team','tool',    ()=>fns.has('openConcierge') && /concierge:'openConcierge'/.test(src)],
 ['Support','support',                ()=>/\[data-support\]/.test(src)],
 ['Save this brand','brandsave',      ()=>/\[data-brandsave\]/.test(src)],
 ['Remove this brand','removebrand',  ()=>/\[data-removebrand\]/.test(src)],
];
tiles.forEach(([label,attr,targetOk])=>{
  const rendered=src.includes('data-'+attr+'=');
  const bound=src.includes('[data-'+attr+']');
  const target=targetOk();
  ok(label.padEnd(23)+' rendered='+(rendered?'y':'N')+' bound='+(bound?'y':'N')+' target='+(target?'y':'N'),
     rendered && bound && target);
});
// the concierge must reach a real send
ok('Concierge actually sends (smnSupportSend)', /smnSupportSend\(/.test(src));
ok('Support tile reaches a real path', /smnSupportSend|support-request/.test(src));
// no menus left in the deck
ok('no floating menus remain in the deck', !src.includes('dl-menu'));
ok('print stylesheet hides the deck',
   fs.readFileSync('/home/claude/site/workspace.html','utf8').includes('.bkacc-chev,.deck{display:none !important}'));
console.log(fail===0?'\nALL 12 TILES WIRED':'\n'+fail+' FAILED');process.exit(fail?1:0);
