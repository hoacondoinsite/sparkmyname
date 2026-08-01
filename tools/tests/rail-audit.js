// FULL RAIL AUDIT — every section, every control, traced to a real target.
const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
function fnBody(name){
  const i=src.indexOf('function '+name+'(');
  if(i<0) return '';
  let d=0,k=src.indexOf('{',i);
  for(let p=k;p<src.length;p++){ if(src[p]==='{')d++; if(src[p]==='}'){d--; if(d===0) return src.slice(i,p+1);} }
  return '';
}
const SECTIONS=[['overview','secOverview'],['purchases','secPurchases'],['brands','secBrands'],
  ['ai','secAI'],['security','secSecurity'],['prefs','secPrefs'],['refer','secRefer'],
  ['privacy','secPrivacy'],['support','secSupport']];
const bound=new Set([...src.matchAll(/\[data-([a-z0-9]+)\]/g)].map(m=>m[1]));
const acHandled=new Set([...fnBody('acAction').matchAll(/a==='([a-z]+)'/g)].map(m=>m[1]));
const fns=new Set([...src.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));

let problems=[];
console.log('RAIL SECTION AUDIT');
console.log('='.repeat(70));
SECTIONS.forEach(([key,fn])=>{
  const b=fnBody(fn);
  if(!b){ console.log('\n'+key.toUpperCase()+'  *** BUILDER '+fn+' MISSING ***'); problems.push(key+': no builder'); return; }
  const ctrls=[...new Set([...b.matchAll(/data-([a-z0-9]+)=/g)].map(m=>m[1]))];
  const acts =[...new Set([...b.matchAll(/data-acact="([a-z]+)"/g)].map(m=>m[1]))];
  const links=[...new Set([...b.matchAll(/href="([^"']+)"/g)].map(m=>m[1]))].filter(h=>!h.startsWith("'"));
  console.log('\n'+key.toUpperCase()+'   ('+fn+', '+b.length+' chars)');
  ctrls.forEach(c=>{
    const isBound=bound.has(c);
    if(!isBound){ console.log('   control data-'+c+'  *** NOT BOUND ***'); problems.push(key+': data-'+c+' unbound'); }
  });
  acts.forEach(a=>{
    if(!acHandled.has(a)){ console.log('   action "'+a+'"  *** NOT HANDLED ***'); problems.push(key+': acact '+a+' unhandled'); }
  });
  links.forEach(h=>{
    if(/^https?:/.test(h)) console.log('   external link -> '+h);
    else if(h!=='#') console.log('   internal link -> '+h);
  });
  if(!ctrls.length && !links.length) console.log('   (no controls)');
});
console.log('\n'+'='.repeat(70));
console.log(problems.length? 'PROBLEMS FOUND: '+problems.length : 'no unbound controls or unhandled actions');
problems.forEach(p=>console.log('   - '+p));
