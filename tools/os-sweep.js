/* OS-WIDE BUG SWEEP (2026-07-25). Hunts classes of fault I have NOT previously checked:
   duplicate ids, functions defined twice, conflicting CSS rules for the same selector,
   handlers bound repeatedly, and functions that throw when required. */
'use strict';
const fs=require('fs'), path=require('path');
const {JSDOM,VirtualConsole}=require('jsdom');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')).sort();
let issues=0;

W('=== 1. DUPLICATE ELEMENT IDs (getElementById returns only the first) ===');
pages.forEach(p=>{
  const vc=new VirtualConsole(); vc.on('jsdomError',()=>{});
  let d;
  try{ d=new JSDOM(fs.readFileSync(path.join(ROOT,p),'utf8'),{virtualConsole:vc}).window.document; }catch(e){ return; }
  const seen={}, dup=[];
  d.querySelectorAll('[id]').forEach(el=>{ const id=el.getAttribute('id');
    if(seen[id]) { if(dup.indexOf(id)<0) dup.push(id); } else seen[id]=1; });
  if(dup.length){ issues++; W('  '+p+': '+dup.slice(0,8).join(', ')); }
});
W('  (nothing above = every id is unique)');

W('\n=== 2. FUNCTIONS DEFINED TWICE (the later one silently wins) ===');
pages.forEach(p=>{
  const s=fs.readFileSync(path.join(ROOT,p),'utf8');
  const blocks=[...s.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
  const names={};
  for(const m of blocks.matchAll(/^\s*function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) names[m[1]]=(names[m[1]]||0)+1;
  const dup=Object.keys(names).filter(k=>names[k]>1);
  if(dup.length){ issues++; W('  '+p+': '+dup.map(k=>k+'×'+names[k]).slice(0,8).join(', ')); }
});
W('  (nothing above = no function is defined twice)');

W('\n=== 3. CONFLICTING CSS — same selector, same property, different values ===');
W('  (this is the class of fault that collapsed the brand list)');
pages.forEach(p=>{
  const s=fs.readFileSync(path.join(ROOT,p),'utf8');
  const styles=[...s.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
  const flat=styles.replace(/\/\*[\s\S]*?\*\//g,'');
  const rules={};
  for(const m of flat.matchAll(/([^{}@]+)\{([^}]*)\}/g)){
    const sel=m[1].trim().replace(/\s+/g,' ');
    if(!sel || sel.indexOf('%')>=0) continue;
    for(const dm of m[2].matchAll(/([a-z-]+)\s*:\s*([^;!]+)/g)){
      const k=sel+' | '+dm[1].trim(); const v=dm[2].trim();
      (rules[k]=rules[k]||[]).push(v);
    }
  }
  const bad=Object.keys(rules).filter(k=>{
    const vals=[...new Set(rules[k])];
    return vals.length>1 && /max-height|height|display|flex|position|overflow|grid-template/.test(k);
  });
  if(bad.length){ issues++; W('  '+p+':');
    bad.slice(0,6).forEach(k=>W('     '+k+'  =  '+[...new Set(rules[k])].join('  |  '))); }
});
W('  (nothing above = no layout property is declared twice with different values)');
