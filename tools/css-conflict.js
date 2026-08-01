/* CONFLICTING CSS AT TOP LEVEL (2026-07-25). Only reports a selector declaring the SAME layout
   property twice OUTSIDE any media query — the case that silently collapsed the brand list.
   Media-query overrides are legitimate and are excluded. */
'use strict';
const fs=require('fs'),path=require('path');
const W=(m)=>fs.writeSync(1,m+'\n');
const ROOT=path.join(__dirname,'..');
const RISKY=/^(max-height|height|min-height|display|flex|flex-direction|position|overflow|overflow-y|grid-template-columns|width|max-width)$/;
let total=0;
fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')).sort().forEach(p=>{
  const src=fs.readFileSync(path.join(ROOT,p),'utf8');
  const styles=[...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n')
    .replace(/\/\*[\s\S]*?\*\//g,'');
  /* strip every @media / @supports block so only top-level rules remain */
  let top=''; let i=0, depth=0, inAt=false;
  while(i<styles.length){
    if(styles.startsWith('@media',i)||styles.startsWith('@supports',i)){
      inAt=true; depth=0;
      while(i<styles.length){ const c=styles[i];
        if(c==='{'){depth++;} else if(c==='}'){depth--; if(depth===0){i++;inAt=false;break;} }
        i++; }
      continue;
    }
    if(!inAt) top+=styles[i];
    i++;
  }
  const seen={};
  for(const m of top.matchAll(/([^{}@]+)\{([^}]*)\}/g)){
    const sel=m[1].trim().replace(/\s+/g,' ');
    if(!sel) continue;
    for(const d of m[2].matchAll(/([a-z-]+)\s*:\s*([^;!]+)/g)){
      const prop=d[1].trim(); if(!RISKY.test(prop)) continue;
      const k=sel+' || '+prop;
      (seen[k]=seen[k]||[]).push(d[2].trim());
    }
  }
  /* A vh/dvh pair is a deliberate progressive-enhancement fallback, not a conflict:
     the older unit is declared first so engines without dvh keep working. */
  const bad=Object.keys(seen).filter(k=>{
    const v=[...new Set(seen[k])];
    if(v.length<2) return false;
    if(v.length===2 && v.some(x=>/\dvh$/.test(x)) && v.some(x=>/\d(vh|px)$/.test(x))
       && v.join(',').indexOf('dvh')>=0) return false;
    return true;
  });
  if(bad.length){
    W('  '+p);
    bad.forEach(k=>{ total++; W('     '+k+'  =  '+[...new Set(seen[k])].join('   |   ')); });
  }
});
W('');
W('  '+total+' top-level conflicts (media-query overrides excluded)');
