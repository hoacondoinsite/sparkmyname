/* LIVE PROGRESS (2026-07-25) — real DOM, simulated build advancing stage by stage. */
'use strict';
const fs=require('fs'),path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const HTML=fs.readFileSync(path.join(__dirname,'..','result.html'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,120)):''));} };

function boot(progressSeq, url){
  const errs=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  let call=0;
  const dom=new JSDOM(HTML,{runScripts:'dangerously',pretendToBeVisual:true,
    url:url||'https://x/result.html?session_id=cs_test_123', virtualConsole:vc,
    beforeParse(w){
      w.scrollTo=()=>{};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.fetch=function(u,o){
        if(String(u).indexOf('get-session')>=0){
          const p = progressSeq[Math.min(call, progressSeq.length-1)]; call++;
          return Promise.resolve({ok:true,json:()=>Promise.resolve(p)});
        }
        return Promise.resolve({ok:true,json:()=>Promise.resolve({})});
      };
      w.addEventListener('error',e=>errs.push(e.message));
    }});
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded',{bubbles:true}));
  return {dom,win:dom.window,doc:dom.window.document,errs,calls:()=>call};
}
const P=(stage,names,words,photos,logos)=>({ok:true,progress:{stage:stage,names:names,words:words,photos:photos,logos:logos}});
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));

(async ()=>{
  W('STAGE 1 — the order has been placed but nothing is built yet');
  {
    const b=boot([P('queued',0,0,0,0)]);
    await wait(60);
    ok('page loads with no error', b.errs.length===0, b.errs[0]);
    ok('the progress panel is shown', b.doc.getElementById('buildbox').hidden===false, 'still hidden');
    ok('the static wait line is hidden', b.doc.getElementById('waitLine').style.display==='none');
    ok('four stages listed', b.doc.querySelectorAll('.bb-list li').length===4);
    ok('nothing is ticked yet', b.doc.querySelectorAll('.bb-list li.on').length===0,
       b.doc.querySelectorAll('.bb-list li.on').length);
    b.dom.window.close();
  }

  W('\nSTAGE 2 — six names found');
  {
    const b=boot([P('named',6,0,0,0)]);
    await wait(60);
    const names=b.doc.querySelector('[data-bb="names"]');
    ok('names ticked', names.classList.contains('on'));
    ok('names shows a count', names.querySelector('.bb-n').textContent==='6 of 6',
       names.querySelector('.bb-n').textContent);
    ok('photos NOT ticked yet', !b.doc.querySelector('[data-bb="photos"]').classList.contains('on'));
    b.dom.window.close();
  }

  W('\nSTAGE 3 — photography part-way through');
  {
    const b=boot([P('photos',6,6,3,0)]);
    await wait(60);
    const ph=b.doc.querySelector('[data-bb="photos"]');
    ok('photos shows partial progress', ph.querySelector('.bb-n').textContent==='3 of 6',
       ph.querySelector('.bb-n').textContent);
    ok('photos not ticked while partial', !ph.classList.contains('on'));
    ok('words already ticked', b.doc.querySelector('[data-bb="words"]').classList.contains('on'));
    b.dom.window.close();
  }

  W('\nSTAGE 4 — finished');
  {
    const b=boot([P('ready',6,6,6,6)]);
    await wait(60);
    ok('all four stages ticked', b.doc.querySelectorAll('.bb-list li.on').length===4,
       b.doc.querySelectorAll('.bb-list li.on').length);
    ok('the title changes', b.doc.getElementById('bbTitle').textContent==='Your brand is ready.',
       b.doc.getElementById('bbTitle').textContent);
    ok('the spinner stops', b.doc.getElementById('buildbox').classList.contains('done'));
    b.dom.window.close();
  }

  W('\nFAILURE PATHS — the customer must never be worse off');
  {
    const b=boot([{ok:true}]);   /* paid, but no progress available */
    await wait(60);
    ok('no progress: panel stays hidden', b.doc.getElementById('buildbox').hidden===true);
    ok('no progress: the static line survives', b.doc.getElementById('waitLine').style.display!=='none',
       b.doc.getElementById('waitLine').style.display);
    b.dom.window.close();
  }
  {
    const b=boot([{ok:false,error:'not_paid'}]);
    await wait(60);
    ok('not paid yet: nothing shown, no error', b.errs.length===0 && b.doc.getElementById('buildbox').hidden===true);
    b.dom.window.close();
  }
  {
    const b=boot([P('ready',6,6,6,6)], 'https://x/result.html');   /* no session_id */
    await wait(60);
    ok('arrived without a session: page is untouched', b.doc.getElementById('buildbox').hidden===true);
    ok('  and the static line still shows', b.doc.getElementById('waitLine').style.display!=='none');
    b.dom.window.close();
  }

  W('\nSAFETY');
  ok('polls every 8 seconds, not faster', /setInterval\(tick, 8000\)/.test(HTML));
  ok('gives up after 20 minutes', /MAX=150/.test(HTML));
  ok('stops on completion', /if\(timer\) clearInterval\(timer\);/.test(HTML));
  ok('stops when the tab closes', /beforeunload/.test(HTML));
  ok('a dropped request is not fatal', /catch\(function\(\)\{ \/\* a dropped request/.test(HTML));
  ok('announced to screen readers', /aria-live="polite"/.test(HTML));
  ok('reduced motion respected', /prefers-reduced-motion:reduce\)\{\.bb-spin/.test(HTML.replace(/\s+/g,'')));

  W('');
  W(fail===0?('PROGRESS CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
  process.exit(fail===0?0:1);
})();
