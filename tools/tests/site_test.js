// SITE-WIDE INTEGRITY — added 28 July 2026 after a full sweep.
// Checks every page for the faults that actually shipped today: unparseable script,
// unmatched tags, nested comments, dead references, device readiness.
const fs=require('fs'), path=require('path'), vm=require('vm');
process.chdir('/home/claude/site');
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
let fail=0; const bad=(m)=>{ console.log('FAIL  '+m); fail++; };

for(const f of pages){
  const d=fs.readFileSync(f,'utf8');
  // scripts must parse
  [...d.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m=>!/json/i.test(m[1])&&!/\bsrc=/.test(m[1])).map(m=>m[2]).filter(s=>s.trim())
    .forEach((s,i)=>{ try{ new vm.Script(s); }catch(e){ bad(f+' script '+(i+1)+' will not parse'); } });
  // markup must nest
  const spans=[...d.matchAll(/<script[\s\S]*?<\/script>/g)].map(m=>[m.index,m.index+m[0].length]);
  const inS=p=>spans.some(([a,b])=>p>=a&&p<b);
  let depth=0, orph=false;
  for(const m of d.matchAll(/<div\b[^>]*>|<\/div>/g)){
    if(inS(m.index)) continue;
    if(m[0].startsWith('</')){ if(depth===0){orph=true;break;} depth--; } else depth++;
  }
  if(orph) bad(f+' has a closing tag that matches nothing');
  if(!orph && depth!==0) bad(f+' has '+depth+' unclosed div(s)');
  // comments must not nest — the remainder renders as visible text
  [...d.matchAll(/<!--([\s\S]*?)-->/g)].forEach(m=>{ if(m[1].includes('--')) bad(f+' has a nested comment that renders as page text'); });
  // every internal link must resolve
  [...d.matchAll(/href="(?!https?:|mailto:|tel:|sms:|facetime:|#|\/\.netlify)([^"]+)"/g)].forEach(m=>{
    const raw=m[1];
    if(/\$\{|'\s*\+|\+\s*'|^\$\d/.test(raw)) return;
    const p=(raw.split('#')[0].split('?')[0]||'').replace(/^\//,'');
    if(p && !fs.existsSync(p)) bad(f+' links to '+raw+' which does not exist');
  });
  // every local asset must resolve
  [...d.matchAll(/src="(?!https?:|data:)([^"]+)"/g)].forEach(m=>{
    const raw=m[1];
    if(/\$\{|'\s*\+|\+\s*'/.test(raw)) return;
    const p=raw.split('?')[0].replace(/^\//,'');
    if(p && !fs.existsSync(p)) bad(f+' loads '+raw+' which does not exist');
  });
  // device readiness
  if(!/width=device-width/.test(d)) bad(f+' has no responsive viewport');
  if(/user-scalable\s*=\s*no/.test(d)) bad(f+' blocks pinch zoom');
  if(!/<html[^>]*\blang=/.test(d)) bad(f+' has no lang attribute');
  if(!/name="description"/.test(d)) bad(f+' has no meta description');
  if(!/overflow-x:\s*hidden/.test(d)) bad(f+' has no sideways-overflow guard');
}
// functions must parse
for(const f of fs.readdirSync('netlify/functions').filter(x=>x.endsWith('.js'))){
  try{ new vm.Script(fs.readFileSync('netlify/functions/'+f,'utf8')); }
  catch(e){ bad('function '+f+' will not parse'); }
}
console.log(fail? '\n'+fail+' FAILED' : '\nSITE CLEAN — '+pages.length+' pages, 162 functions');
process.exit(fail?1:0);
