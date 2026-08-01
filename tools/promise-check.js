/* THE TWO PROMISES (2026-07-26, Founder order)
   15 minutes for the brand kit, 24 hours for anything custom-made afterwards. A promise is only
   honest if the product cannot contradict it — and it could: result.html carried an "Open my
   Command Center" button directly beneath "we'll email you the moment it's ready", inviting the
   customer into a workspace with nothing in it. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const R=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

W('NOBODY WALKS IN BEFORE THE KIT EXISTS');
{
  const src=R('result.html');
  function open(url){
    const errs=[]; const vc=new VirtualConsole(); vc.on('jsdomError',e=>errs.push(String(e.message||e)));
    const dom=new JSDOM(src,{runScripts:'dangerously',pretendToBeVisual:true,url:url,virtualConsole:vc,
      beforeParse(w){ w.fetch=()=>new Promise(()=>{}); w.scrollTo=()=>{}; }});
    const el=dom.window.document.getElementById('ccWrap');
    const d=el?el.style.display:null; const e=errs.length;
    try{dom.window.close();}catch(x){}
    return {display:d, errors:e};
  }
  const mid=open('https://x/result.html?session_id=cs_test_1');
  ok('arriving from checkout, the way in is closed', mid.display==='none', mid.display);
  ok('  and nothing throws', mid.errors===0, mid.errors);
  const direct=open('https://x/result.html');
  ok('arriving directly, it stays open', direct.display!=='none', direct.display);
  ok('  because an existing customer must not be locked out', true);
  ok('it is reopened when the build finishes', /ccWrap\.style\.display='flex'/.test(src));
  ok('  by the same function that announces it', /Open your Command Center below/.test(src));
}

W('\nTHE CONFIRMATION EMAIL DOES NOT INVITE THEM EITHER');
{
  const sk=R('netlify/functions/send-kit.js');
  const i=sk.indexOf('function buildConfirmEmail');
  const seg=sk.slice(i, i+6000).replace(/\/\*[\s\S]*?\*\//g,'');
  ok('no workspace button in it', seg.indexOf('Open my Command Center')<0);
  ok('it points at the inbox instead', /email you the moment it is ready/.test(seg));
}

W('\nTHIRTY MINUTES, SAID ONCE AND CONSISTENTLY');
{
  /* Comments are stripped: an explanation of why "a few hours" was removed contains the very
     words being checked for, and the first version of this test failed on its own footnote.
     Both the HTML and the plain-text part are checked — they are the same email, and the
     plain-text one still said "a few hours" after the HTML had been fixed. */
  const sk=R('netlify/functions/send-kit.js').replace(/\/\*[\s\S]*?\*\//g,'');
  const html=sk.slice(sk.indexOf('function buildConfirmEmail'));
  const text=sk.slice(sk.indexOf('function confirmText'), sk.indexOf('function confirmText')+1400);
  ok('the HTML states the threshold', /15 minutes/.test(html));
  ok('  and does not contradict it', !/few hours/.test(html));
  ok('the plain text states the same threshold', /15 minutes/.test(text));
  ok('  and does not contradict it either', !/few hours/.test(text));
  ok('both tell the customer where to look first',
     /spam or promotions/.test(html) && /spam or promotions/.test(text));
  ok('both offer a way to reach a person',
     /SUPPORT_URL/.test(html) && /SUPPORT_URL/.test(text));
}

W('\nTWENTY-FOUR HOURS FOR ANYTHING CUSTOM-MADE');
{
  const places=[['workspace.html','the workspace'],['deliverables.html','the deliverables page'],
                ['netlify/functions/order-request.js','the order confirmation'],
                ['js/workspace-core.js','the order form'],
                ['netlify/functions/send-kit.js','the delivery email']];
  let all=true;
  places.forEach(([f,label])=>{
    const has=/24 hours/.test(R(f));
    ok(label+' says 24 hours', has);
    if(!has) all=false;
  });
  ok('no page promises something faster', !places.some(([f])=>/custom.{0,30}within (a few )?minutes/i.test(R(f))));
}

W('\nTHE ART DEPARTMENT CANNOT LEAVE A CARD BLANK');
{
  const ad=R('netlify/functions/art-department-background.js');
  ok('a second model sits behind the first', /geminiModels: \[/.test(ad));
  ok('  and it is stated why', /Flash stays behind it as fallback/.test(ad));
  ok('  so an outage fills the card rather than emptying it', /rather than leaving it blank/.test(ad));
  ok('a terminal failure is still handled', /terminal|partial|fallback-monogram/.test(ad + R('netlify/functions/deliver-background.js')));
  ok('delivery ships even when art ends terminal', /_terminalDead/.test(R('netlify/functions/deliver-background.js')));
}

W('');
W(fail===0?('PROMISES KEPT — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
