// FULL SITE SWEEP — every page, every category. Reports facts, fixes nothing.
const fs=require('fs'), path=require('path'), vm=require('vm');
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const problems=[];
const P=(cat,page,detail)=>problems.push({cat,page,detail});

for(const f of pages){
  const d=fs.readFileSync(f,'utf8');

  // --- 1. JavaScript must parse ---
  const blocks=[...d.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m=>!/type\s*=\s*["'][^"']*json/i.test(m[1]) && !/\bsrc\s*=/.test(m[1]))
    .map(m=>m[2]).filter(s=>s.trim());
  blocks.forEach((s,i)=>{ try{ new vm.Script(s); }catch(e){ P('JS SYNTAX',f,'block '+(i+1)+': '+e.message.slice(0,50)); } });

  // --- 2. Internal links must resolve ---
  [...d.matchAll(/href="(?!https?:|mailto:|tel:|sms:|facetime:|geo:|#|\/\.netlify)([^"]+)"/g)].forEach(m=>{
    let raw=m[1];
    if(/\$\{|'\s*\+|\+\s*'|^\$\d/.test(raw)) return;   // JS template, not a path
    let t=raw.split('#')[0].split('?')[0];
    if(!t) return;
    const p=t.startsWith('/')?t.slice(1):t;
    if(!fs.existsSync(p)) P('BROKEN LINK',f,raw);
  });

  // --- 3. Referenced assets must exist ---
  [...d.matchAll(/src="(?!https?:|data:)([^"]+)"/g)].forEach(m=>{
    let raw=m[1];
    // A JS template string is not a path. A query string is not part of the filename.
    if(/\$\{|'\s*\+|\+\s*'/.test(raw)) return;
    let p=raw.split('?')[0].split('#')[0];
    p=p.startsWith('/')?p.slice(1):p;
    if(p && !fs.existsSync(p)) P('MISSING ASSET',f,raw);
  });

  // --- 4. Mobile / device readiness ---
  if(!/<meta[^>]*name="viewport"/i.test(d)) P('NO VIEWPORT',f,'missing viewport meta');
  else if(!/width=device-width/i.test(d)) P('VIEWPORT',f,'not width=device-width');
  if(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i.test(d)) P('A11Y ZOOM',f,'blocks pinch zoom');
  if(!/<html[^>]*\blang=/i.test(d)) P('NO LANG',f,'html lang attribute missing');

  // --- 5. Accessibility basics ---
  const imgs=[...d.matchAll(/<img\b[^>]*>/g)];
  imgs.forEach(m=>{ if(!/\balt\s*=/.test(m[0])) P('IMG NO ALT',f,m[0].slice(0,50)); });
  if(!/<title>/i.test(d)) P('NO TITLE',f,'missing <title>');
  if(!/name="description"/i.test(d)) P('NO DESCRIPTION',f,'missing meta description');

  // --- 6. Weight / performance ---
  const kb=Buffer.byteLength(d)/1024;
  if(kb>250) P('HEAVY PAGE',f,Math.round(kb)+' KB of HTML');

  // --- 7. Markup nesting (scripts excluded) ---
  const spans=[...d.matchAll(/<script[\s\S]*?<\/script>/g)].map(m=>[m.index,m.index+m[0].length]);
  const inS=p=>spans.some(([a,b])=>p>=a&&p<b);
  let depth=0, orphan=false;
  for(const m of d.matchAll(/<div\b[^>]*>|<\/div>/g)){
    if(inS(m.index)) continue;
    if(m[0].startsWith('</')){ if(depth===0){orphan=true;break;} depth--; } else depth++;
  }
  if(orphan) P('ORPHAN TAG',f,'a closing div matches nothing');
  else if(depth!==0) P('UNCLOSED TAG',f,depth+' div(s) never closed');

  // --- 8. Comments must not nest (renders as visible text) ---
  [...d.matchAll(/<!--([\s\S]*?)-->/g)].forEach(m=>{ if(m[1].includes('--')) P('NESTED COMMENT',f,'renders as page text'); });
}

// --- 9. Netlify functions must parse ---
const fdir='netlify/functions';
if(fs.existsSync(fdir)) for(const f of fs.readdirSync(fdir).filter(x=>x.endsWith('.js'))){
  try{ new vm.Script(fs.readFileSync(path.join(fdir,f),'utf8')); }
  catch(e){ P('FN SYNTAX',f,e.message.slice(0,50)); }
}

const byCat={};
problems.forEach(p=>{ byCat[p.cat]=(byCat[p.cat]||0)+1; });
console.log('SWEEP OF '+pages.length+' PAGES + '+(fs.existsSync(fdir)?fs.readdirSync(fdir).filter(x=>x.endsWith('.js')).length:0)+' FUNCTIONS');
console.log('='.repeat(58));
if(!problems.length){ console.log('NO PROBLEMS FOUND'); }
else {
  Object.entries(byCat).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>console.log(String(n).padStart(5)+'  '+c));
  console.log('-'.repeat(58));
  console.log(problems.length+' TOTAL');
}
fs.writeFileSync('/tmp/problems.json', JSON.stringify(problems,null,1));
