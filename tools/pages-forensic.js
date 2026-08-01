/* EVERY PAGE, IN A REAL DOM (2026-07-25). Loads all 42 pages with scripts running and reports
   any uncaught error, any mangled attribute, and any broken style attribute. */
'use strict';
const fs=require('fs'), path=require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT=path.join(__dirname,'..');
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')).sort();
let bad=0, checked=0;
const report=[];
pages.forEach(p=>{
  const errors=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError', e=>{ const m=String(e.message||e);
    if(!/Could not load|Not implemented|css/i.test(m)) errors.push(m); });
  let dom;
  try{
    dom=new JSDOM(fs.readFileSync(path.join(ROOT,p),'utf8'),{
      runScripts:'dangerously', pretendToBeVisual:true, url:'https://sparkmyname.netlify.app/'+p,
      virtualConsole:vc,
      beforeParse(win){
        win.fetch=()=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({}),text:()=>Promise.resolve('')});
        win.scrollTo=()=>{}; win.HTMLElement.prototype.scrollIntoView=function(){};
        win.matchMedia=win.matchMedia||(q=>({matches:false,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}));
        win.addEventListener('error', e=>errors.push('onerror: '+(e.message||'')));
      }
    });
  }catch(e){ errors.push('parse: '+e.message); }
  checked++;
  let mangled=0, badStyle=0;
  if(dom){
    const d=dom.window.document;
    d.querySelectorAll('*').forEach(el=>{
      for(const a of el.attributes){
        if(/["'\s]/.test(a.name)) mangled++;
        if(a.name==='style' && a.value.indexOf('"')>=0) badStyle++;
      }
    });
    try{ dom.window.close(); }catch(e){}
  }
  const problems=[];
  if(errors.length) problems.push(errors.length+' error(s): '+errors[0].slice(0,70));
  if(mangled) problems.push(mangled+' mangled attribute(s)');
  if(badStyle) problems.push(badStyle+' broken style attribute(s)');
  if(problems.length){ bad++; report.push('  FAIL  '+p+'  -> '+problems.join(' | ')); }
});
report.forEach(r=>console.log(r));
console.log('\n  '+checked+' pages loaded in a real DOM, '+bad+' with problems');
process.exit(bad===0?0:1);
