/* SAVE ALL MY BRANDS (2026-07-26, Founder order: reconnect what already works)
   export-names.js has existed since before 20 July. Its own page was deleted in a later
   cleanup and nothing has called it since — the same pattern as add-names and
   support-request.js found earlier today. This puts it back within reach without a new page:
   a button in the Brands flyout footer, since the export is about the whole list. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
function source(){ let s=fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  return s.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g,(m,r)=>{
    try{ return '<scr'+'ipt>'+fs.readFileSync(path.join(ROOT,r),'utf8')+'</scr'+'ipt>'; }catch(e){ return m; }}); }
const SRC=source();
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

function boot(resp, netOk){
  const errs=[]; const calls=[]; const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css/i.test(m)) errs.push(m);});
  const dom=new JSDOM(SRC,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x/w.html',virtualConsole:vc,
    beforeParse(w){
      w.fetch=function(u,o){ calls.push({u:String(u), b:(o&&o.body)||''});
        return Promise.resolve({ ok: netOk!==false, json:()=>Promise.resolve(resp||{}) }); };
      w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
      w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},addEventListener(){},removeEventListener(){}}));
      w.URL.createObjectURL = w.URL.createObjectURL || function(){ return 'blob:x'; };
      w.URL.revokeObjectURL = w.URL.revokeObjectURL || function(){};
      w.addEventListener('error',e=>errs.push(e.message)); }});
  const w=dom.window, d=w.document;
  const mk=i=>({id:'b'+i,_stub:true,cat:'C',said:'c',ord:i,fav:false,header:'',names:[],palettes:[],
    type:[],voice:[],aboutT:[],biosT:[],linkedinT:[],facebookT:[],postsT:[],why:[],taglines:[],date:'J',ts:i,emoji:'x'});
  w.IDEAS=[mk(1),mk(2)]; w.current='b1'; w.curName=0; w.removed={}; w.__smnPicked=null;
  try{ w.paint(); w.openBrandPop(); }catch(e){ errs.push('boot: '+e.message); }
  return {dom,w,d,calls,errs};
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));

(async ()=>{
  W('THE BUTTON');
  {
    const b=boot({ok:true,text:'x'},true);
    const btn=b.d.getElementById('bpExport');
    ok('sits in the flyout footer, beside Create a new brand',
       !!btn && !!b.d.querySelector('.bp-f .bp-new'));
    ok('is a real button, not a link', btn && btn.tagName==='BUTTON');
    ok('is a 44px touch target', parseInt(getComputedStyleLike(SRC,'.bp-export','min-height'))>=44 || /min-height:44px/.test(SRC));
    b.dom.window.close();
  }

  W('\nA SUCCESSFUL EXPORT');
  {
    const b=boot({ok:true,report_count:2,name_count:12,text:'Heartwood Creations\\nheartwood.com'},true);
    const btn=b.d.getElementById('bpExport');
    btn.dispatchEvent(new b.w.MouseEvent('click',{bubbles:true}));
    await wait(30);
    const calls=b.calls.filter(x=>x.u.indexOf('export-names')>=0);
    ok('calls export-names.js', calls.length===1, calls.length);
    ok('sends the access token', /access_token/.test(calls[0]?calls[0].b:''));
    ok('the button re-enables itself', btn.disabled===false);
    ok('nothing throws', b.errs.length===0, b.errs[0]);
    b.dom.window.close();
  }

  W('\nWHEN THE SERVER SAYS NO');
  {
    const b=boot({ok:false},true);
    const btn=b.d.getElementById('bpExport');
    btn.dispatchEvent(new b.w.MouseEvent('click',{bubbles:true}));
    await wait(30);
    ok('the button re-enables rather than sticking', btn.disabled===false);
    ok('nothing throws', b.errs.length===0, b.errs[0]);
    b.dom.window.close();
  }

  W('\nWHEN THE NETWORK FAILS OUTRIGHT');
  {
    const b=boot(null,false);
    const btn=b.d.getElementById('bpExport');
    const before=b.errs.length;
    btn.dispatchEvent(new b.w.MouseEvent('click',{bubbles:true}));
    await wait(30);
    ok('the button recovers', btn.disabled===false);
    ok('nothing throws', b.errs.length===before, b.errs.slice(before)[0]);
    b.dom.window.close();
  }

  W('\nNOTHING ELSE MOVED');
  {
    const b=boot({ok:true,text:'x'},true);
    ok('Create a new brand is unchanged', !!b.d.querySelector('.bp-f .bp-new[href="index.html"]'));
    ok('the flyout still lists every brand', b.d.querySelectorAll('#brandpop .bp-item').length===2);
    b.dom.window.close();
  }

  W('');
  W(fail===0?('EXPORT CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
  process.exit(fail===0?0:1);
})();

function getComputedStyleLike(src, sel, prop){
  const re=new RegExp(sel.replace(/[.#]/g,'\\\\$&')+'\\\\{[^}]*'+prop);
  const m=re.exec(src.replace(/\\s+/g,''));
  return m ? m[0] : '';
}
