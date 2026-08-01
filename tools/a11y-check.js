/* CLAUDE-SIDE AUDIT — every page, real DOM. Reports only what a DOM can actually establish. */
'use strict';
const fs=require('fs'), path=require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT='/home/claude/site';
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')).sort();
const rows=[];
pages.forEach(p=>{
  const errors=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError',e=>{const m=String(e.message||e); if(!/Could not load|Not implemented|css|stylesheet/i.test(m)) errors.push(m);});
  let dom=null;
  try{
    dom=new JSDOM(fs.readFileSync(path.join(ROOT,p),'utf8'),{
      runScripts:'dangerously',pretendToBeVisual:true,url:'https://sparkmyname.netlify.app/'+p,virtualConsole:vc,
      beforeParse(w){ w.fetch=()=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({}),text:()=>Promise.resolve('')});
        w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
        w.matchMedia=w.matchMedia||(q=>({matches:false,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}));
        w.addEventListener('error',e=>errors.push('onerror: '+(e.message||''))); }
    });
  }catch(e){ errors.push('parse: '+e.message); }
  const r={page:p,errors:errors.length,mangled:0,badStyle:0,
    links:0,deadLocal:[],extBlank:0,extUnsafe:0,
    btns:0,btnNoLabel:0,imgs:0,imgNoAlt:0,inputs:0,inputNoLabel:0,
    h1:0,headingSkips:0,tabindexPos:0,ariaBad:0};
  if(dom){
    const d=dom.window.document;
    d.querySelectorAll('*').forEach(el=>{
      for(const a of el.attributes){
        if(/["'\s]/.test(a.name)) r.mangled++;
        if(a.name==='style'&&a.value.indexOf('"')>=0) r.badStyle++;
      }
    });
    d.querySelectorAll('a[href]').forEach(a=>{
      const h=a.getAttribute('href'); r.links++;
      if(/^https?:/.test(h)){ if(a.getAttribute('target')==='_blank'){ r.extBlank++; if(!/noopener/.test(a.getAttribute('rel')||'')) r.extUnsafe++; } }
      else if(/\.html/.test(h)){ const f=h.split(/[#?]/)[0]; if(f && !fs.existsSync(path.join(ROOT,f)) && r.deadLocal.indexOf(f)<0) r.deadLocal.push(f); }
    });
    d.querySelectorAll('button,[role="button"]').forEach(b=>{ r.btns++;
      const t=(b.textContent||'').trim();
      if(!t && !b.getAttribute('aria-label') && !b.getAttribute('title')) r.btnNoLabel++; });
    d.querySelectorAll('img').forEach(i=>{ r.imgs++; if(i.getAttribute('alt')===null) r.imgNoAlt++; });
    d.querySelectorAll('input,select,textarea').forEach(i=>{ r.inputs++;
      const id=i.getAttribute('id');
      const lab=id?d.querySelector('label[for="'+id+'"]'):null;
      if(!lab && !i.getAttribute('aria-label') && !i.getAttribute('placeholder') && i.type!=='hidden') r.inputNoLabel++; });
    r.h1=d.querySelectorAll('h1').length;
    let last=0;
    d.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>{ const lv=+h.tagName[1];
      if(last && lv>last+1) r.headingSkips++; last=lv; });
    d.querySelectorAll('[tabindex]').forEach(e=>{ if(+e.getAttribute('tabindex')>0) r.tabindexPos++; });
    d.querySelectorAll('[aria-labelledby],[aria-describedby]').forEach(e=>{
      ['aria-labelledby','aria-describedby'].forEach(at=>{ const v=e.getAttribute(at);
        if(v) v.split(/\s+/).forEach(id=>{ if(id && !d.getElementById(id)) r.ariaBad++; }); });
    });
    try{ dom.window.close(); }catch(e){}
  }
  rows.push(r);
});
const T=(k)=>rows.reduce((a,b)=>a+(Array.isArray(b[k])?b[k].length:b[k]),0);
console.log('PAGES: '+rows.length);
console.log('  uncaught errors        : '+T('errors'));
console.log('  mangled attributes     : '+T('mangled'));
console.log('  broken style attrs     : '+T('badStyle'));
console.log('  links total            : '+T('links'));
console.log('  dead local links       : '+T('deadLocal'));
console.log('  new-tab external links : '+T('extBlank')+'  (unsafe: '+T('extUnsafe')+')');
console.log('  buttons                : '+T('btns')+'  (no accessible name: '+T('btnNoLabel')+')');
console.log('  images                 : '+T('imgs')+'  (no alt attribute: '+T('imgNoAlt')+')');
console.log('  form controls          : '+T('inputs')+'  (no label/aria/placeholder: '+T('inputNoLabel')+')');
console.log('  heading level skips    : '+T('headingSkips'));
console.log('  pages with no <h1>     : '+rows.filter(r=>r.h1===0).length);
console.log('  pages with >1 <h1>     : '+rows.filter(r=>r.h1>1).length);
console.log('  positive tabindex      : '+T('tabindexPos'));
console.log('  aria-* pointing nowhere: '+T('ariaBad'));
console.log('\nPER-PAGE PROBLEMS:');
rows.forEach(r=>{
  const p=[];
  if(r.errors) p.push(r.errors+' err');
  if(r.mangled) p.push(r.mangled+' mangled');
  if(r.badStyle) p.push(r.badStyle+' badStyle');
  if(r.deadLocal.length) p.push('dead: '+r.deadLocal.join(','));
  if(r.extUnsafe) p.push(r.extUnsafe+' unsafe _blank');
  if(r.btnNoLabel) p.push(r.btnNoLabel+' unlabelled btn');
  if(r.imgNoAlt) p.push(r.imgNoAlt+' img no alt');
  if(r.inputNoLabel) p.push(r.inputNoLabel+' unlabelled input');
  if(r.h1===0) p.push('no h1');
  if(r.h1>1) p.push(r.h1+' h1');
  if(r.headingSkips) p.push(r.headingSkips+' heading skip');
  if(r.tabindexPos) p.push(r.tabindexPos+' tabindex>0');
  if(r.ariaBad) p.push(r.ariaBad+' broken aria ref');
  if(p.length) console.log('  '+r.page.padEnd(34)+p.join(' | '));
});
