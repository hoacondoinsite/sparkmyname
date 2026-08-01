const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
function grab(n){const i=src.indexOf('function '+n+'(');let d=0,j=src.indexOf('{',i);
 for(let k=j;k<src.length;k++){if(src[k]==='{')d++;if(src[k]==='}'){d--;if(d===0)return src.slice(i,k+1);}}}
const an=src.indexOf('var ACNAV=['), ae=src.indexOf('];',an)+2;
const gn=src.indexOf('var NAVGROUPS=['), ge=src.indexOf('];',gn)+2;
const code=[src.slice(an,ae),src.slice(gn,ge),grab('renderWsNav')].join('\n');

let html='';
const el={ set innerHTML(v){html=v;}, get innerHTML(){return html;},
  querySelectorAll(){return [];} };
global.window=global;
global.document={getElementById:()=>el,querySelectorAll:()=>[]};
global.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
global.ACCT={sec:'overview'};
(0,eval)(code+';window.__r={renderWsNav,ACNAV,NAVGROUPS};');
const R=global.__r;
R.renderWsNav();

let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

ok('three groups render', (html.match(/navgrp-h/g)||[]).length===3);
ok('group headings are plain language',
  html.includes('Your brand') && html.includes('with you') && html.includes('Account'));

// NOTHING LOST — every ACNAV key must still be reachable
const keys=R.ACNAV.map(n=>n[0]);
const rendered=[...html.matchAll(/data-wsnav="([a-z]+)"/g)].map(m=>m[1]);
ok('every nav item still present ('+keys.length+' items)', keys.every(k=>rendered.includes(k)));
ok('no item rendered twice', rendered.length===new Set(rendered).size);
ok('count matches exactly', rendered.length===keys.length);

// the untrue label is gone
ok('"Password" label retired (system is passwordless)', !html.includes('>Password<'));
ok('replaced with Sign-in', html.includes('>Sign-in<'));
ok('Tools clarified to AI tools', html.includes('>AI tools<'));
ok('Account clarified to Overview', html.includes('>Overview<'));
ok('brand language kept (Concierge, Designer)', html.includes('>Concierge<') && html.includes('>Designer<'));

// orphan safety net
const before=R.ACNAV.length;
R.ACNAV.push(['newthing','&#9733;','New thing','a hint']);
R.renderWsNav();
const rendered2=[...html.matchAll(/data-wsnav="([a-z]+)"/g)].map(m=>m[1]);
ok('an item added to ACNAV but not to a group STILL renders', rendered2.includes('newthing'));
R.ACNAV.length=before;

console.log(fail===0?'\nRAIL CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
