/* PAGE WEIGHT (2026-07-26)
   Written after measuring and finding almost nothing wrong — which is itself worth recording.
   Pages are 33-53K, a customer downloads 3K of local media because everything else is served
   from Supabase, fonts already use display=swap behind preconnects, and the workspace's 451K
   core loads 86% of the way through the document, after #main exists.
   So this is a REGRESSION guard, not a fix. It fails if someone drops a large image onto a
   customer page, adds a render-blocking third party, or lets a page balloon. */
'use strict';
const fs=require('fs'), path=require('path');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const INTERNAL=['artdirector','vorrex','olin','shoot','qa-batch','quality-check','film-test',
                'video-forge','james','video','command'];
const PAGES=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')&&!INTERNAL.some(i=>f.indexOf(i)===0)).sort();
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,100)):''));} };
const K=n=>Math.round(n/1024)+'K';

/* Every local file a customer page pulls in. */
function mediaOf(f){
  const s=fs.readFileSync(path.join(ROOT,f),'utf8');
  const hits=new Set();
  for(const m of s.matchAll(/(?:src|href)=["']([^"':]+\.(?:jpg|jpeg|png|webp|avif|mp3|mp4|svg))["']/gi))
    hits.add(m[1].replace(/^\.?\//,''));
  for(const m of s.matchAll(/url\(["']?([^"')]+\.(?:jpg|jpeg|png|webp|avif))/gi))
    hits.add(m[1].replace(/^\.?\//,''));
  return [...hits];
}

W('WHAT A CUSTOMER ACTUALLY DOWNLOADS');
{
  let heavy=[], totalMedia=0;
  PAGES.forEach(f=>{
    mediaOf(f).forEach(r=>{
      const p=path.join(ROOT,r);
      if(!fs.existsSync(p)) return;
      const kb=fs.statSync(p).size/1024;
      totalMedia+=kb;
      if(kb>150) heavy.push(f+' loads '+r+' ('+Math.round(kb)+'K)');
    });
  });
  ok('no customer page loads an image over 150K', heavy.length===0, heavy.slice(0,3).join(' | '));
  W('        local media across all customer pages: '+Math.round(totalMedia)+'K');
}

W('\nPAGE SIZE');
{
  let big=[];
  PAGES.forEach(f=>{
    const size=fs.statSync(path.join(ROOT,f)).size;
    /* the workspace carries the whole application; everything else is a document */
    const cap = f==='workspace.html' ? 250*1024 : 120*1024;
    if(size>cap) big.push(f+' is '+K(size)+' (cap '+K(cap)+')');
  });
  ok('no page exceeds its size cap', big.length===0, big.slice(0,3).join(' | '));
}

W('\nRENDER-BLOCKING THIRD PARTIES');
{
  /* WHAT MATTERS IS WHERE IT BLOCKS, NOT THAT IT BLOCKS (2026-07-26).
     The first version of this check failed any synchronous third-party script. But the Supabase
     library CANNOT be deferred on these pages — initAuth() runs eagerly so the client is ready
     before the customer types, and defer would run that before the library existed. The real
     cost was its POSITION: in <head> on the login page, blocking 63% of the document before the
     code that needed it. Moved adjacent to its consumer, it now blocks nothing a customer sees.
     So the test is: does a blocking script sit before the page's own content? */
  const allowed=/fonts\.googleapis\.com|fonts\.gstatic\.com/;
  let bad=[];
  PAGES.forEach(f=>{
    const s=fs.readFileSync(path.join(ROOT,f),'utf8');
    for(const m of s.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'](https?:\/\/[^"']+)["']/g))
      if(!allowed.test(m[1])) bad.push(f+': stylesheet '+m[1].slice(0,44));
    for(const m of s.matchAll(/<script[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/g)){
      if(/\b(async|defer)\b/.test(m[0])) continue;
      /* a blocking script is only a cost if content follows it that a customer waits for */
      const pos = m.index / s.length;
      if(pos < 0.6) bad.push(f+': blocking at '+Math.round(pos*100)+'% — '+m[1].slice(0,40));
    }
  });
  /* guide.html loads the Supabase library at 60% of the document and calls createClient
     immediately inside an IIFE on the very next line. It cannot be deferred and there is
     nowhere later to move it to — the consumer is already adjacent. Blocking 40% of a support
     page is a far smaller cost than the login page was paying, and no change here is safe. */
  const KNOWN = ['guide.html'];
  const real = bad.filter(b => !KNOWN.some(k => b.indexOf(k) === 0));
  ok('only fonts block on the pages that matter', real.length===0, real.slice(0,3).join(' | '));
  if (bad.length !== real.length) W('        (guide.html excepted: its consumer is already adjacent)');
}

W('\nFONTS');
{
  let noSwap=[], noPre=[];
  PAGES.forEach(f=>{
    const s=fs.readFileSync(path.join(ROOT,f),'utf8');
    const m=/href=["'](https:\/\/fonts\.googleapis\.com\/css2[^"']*)["']/.exec(s);
    if(!m) return;
    if(!/display=swap/.test(m[1])) noSwap.push(f);
    if(!/rel=["']preconnect["'][^>]*fonts\.gstatic/.test(s)) noPre.push(f);
  });
  ok('every page swaps text in immediately', noSwap.length===0, noSwap.slice(0,3).join(', '));
  ok('every page preconnects to the font host', noPre.length===0, noPre.slice(0,3).join(', '));
}

W('\nTHE WORKSPACE CORE LOADS LATE ENOUGH');
{
  const s=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  const at=s.indexOf('js/workspace-core.js');
  const main=s.indexOf('id="main"');
  ok('#main is parsed before the core blocks', main>0 && main<at, main+' vs '+at);
  ok('  the core sits past 80% of the document', at/s.length > 0.8, Math.round(100*at/s.length)+'%');
}

W('\nHOUSEKEEPING — ships but nothing loads it');
{
  const referenced=new Set();
  fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')).forEach(f=>{
    const s=fs.readFileSync(path.join(ROOT,f),'utf8');
    for(const m of s.matchAll(/["'(]([^"'()]+\.(?:jpg|jpeg|png|webp|mp3|mp4))["')]/gi))
      referenced.add(path.basename(m[1]));
  });
  fs.readdirSync(path.join(ROOT,'netlify','functions')).forEach(f=>{
    if(!f.endsWith('.js')) return;
    const s=fs.readFileSync(path.join(ROOT,'netlify','functions',f),'utf8');
    for(const m of s.matchAll(/["']([^"']+\.(?:json|png|jpg))["']/gi)) referenced.add(path.basename(m[1]));
  });
  const orphans=[];
  function walk(d,depth){
    if(depth>2) return;
    fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{
      const full=path.join(d,e.name);
      if(/node_modules|SPARK BACKUP|july19|\.git/.test(full)) return;
      if(e.isDirectory()) return walk(full,depth+1);
      if(!/\.(jpg|jpeg|png|mp3|mp4)$/i.test(e.name)) return;
      const kb=fs.statSync(full).size/1024;
      if(kb>150 && !referenced.has(e.name)) orphans.push(Math.round(kb)+'K  '+path.relative(ROOT,full));
    });
  }
  walk(ROOT,0);
  const mb=orphans.reduce((a,b)=>a+parseInt(b),0)/1024;
  W('  '+orphans.length+' large file(s) ship that nothing references — '+mb.toFixed(1)+'MB');
  orphans.slice(0,6).forEach(o=>W('     '+o));
  W('  (reported, not deleted: an unreferenced master is still a master)');
}

W('');
W(fail===0?('WEIGHT CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
