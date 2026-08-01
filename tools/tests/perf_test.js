// LOAD PERFORMANCE — what a real phone actually has to download before the page is usable.
const fs=require('fs'), path=require('path');
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const size=p=>{ try{ return fs.statSync(p).size; }catch(e){ return 0; } };
const rows=[];
for(const f of pages){
  const d=fs.readFileSync(f,'utf8');
  let critical=Buffer.byteLength(d);   // the HTML itself, styles and scripts inline
  let deferred=0, ext=0;
  // local scripts and stylesheets that block
  [...d.matchAll(/<script([^>]*)\bsrc="(?!https?:)([^"]+)"/g)].forEach(m=>{
    const p=m[2].split('?')[0].replace(/^\//,''); const s=size(p);
    if(/defer|async/.test(m[1])) deferred+=s; else critical+=s;
  });
  [...d.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="(?!https?:)([^"]+)"/g)].forEach(m=>{
    critical += size(m[1].split('?')[0].replace(/^\//,''));
  });
  // images above the fold (not lazy)
  let eager=0;
  [...d.matchAll(/<img\b[^>]*>/g)].forEach(m=>{
    if(/loading\s*=\s*["']lazy/.test(m[0])) return;
    const s=(m[0].match(/src="(?!https?:|data:)([^"]+)"/)||[])[1];
    if(s) eager += size(s.split('?')[0].replace(/^\//,''));
  });
  ext = [...d.matchAll(/<(?:script|link)[^>]*(?:src|href)="https?:\/\/[^"]+"/g)].length;
  rows.push({f, critical, eager, deferred, ext, total:critical+eager});
}
rows.sort((a,b)=>b.total-a.total);
console.log('PAGE                      CRITICAL   EAGER IMG    TOTAL   3G TIME   EXTERNAL');
console.log('-'.repeat(76));
const K=b=>(b/1024).toFixed(0)+'K';
let worst=0;
rows.slice(0,10).forEach(r=>{
  const secs=(r.total/1024/(1.6*1024/8)).toFixed(1);   // ~1.6 Mbps slow 4G
  if(+secs>worst) worst=+secs;
  console.log(r.f.padEnd(24)+K(r.critical).padStart(9)+K(r.eager).padStart(11)+
    K(r.total).padStart(9)+(secs+'s').padStart(10)+String(r.ext).padStart(11));
});
console.log('-'.repeat(76));
const over=rows.filter(r=>r.total>250*1024);
console.log(over.length? over.length+' page(s) over 250KB: '+over.map(r=>r.f).join(', ')
                       : 'every page under 250KB of critical weight');
console.log('slowest page on a slow 4G connection: '+worst+'s');
