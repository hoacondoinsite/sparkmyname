const fs=require('fs');
// Extract the pieces we need from workspace-core.js and run them against a stub DOM.
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
function grab(name){const i=src.indexOf('function '+name+'(');if(i<0)throw new Error(name+' not found');
 let d=0,j=src.indexOf('{',i);for(let k=j;k<src.length;k++){if(src[k]==='{')d++;if(src[k]==='}'){d--;if(d===0)return src.slice(i,k+1);}}}
const code=[grab('openAccount'),grab('closeAccount'),grab('renderAccount')].join('\n');

// stubs
const els={};
function el(id){if(!els[id])els[id]={id,style:{},innerHTML:'',classes:new Set(),
  classList:{add(c){els[id].classes.add(c);},remove(c){els[id].classes.delete(c);},contains(c){return els[id].classes.has(c);},toggle(c,on){on?els[id].classes.add(c):els[id].classes.delete(c);}},
  querySelectorAll(){return [];},querySelector(){return null;}};return els[id];}
global.document={getElementById:id=>el(id),querySelectorAll:()=>[],body:{style:{}}};
global.window=global; global.scrollTo=()=>{};
global.$=s=>el(s.replace('#',''));
global.ACCT={sec:'overview',prefs:{}};
global.ACTITLE={overview:'Your account',tools:'Tools',billing:'Billing',refer:'Refer',support:'Help',purchases:'Billing',prefs:'Settings'};
global.esc=s=>String(s==null?'':s);
global.acName=()=>'Peter'; global.acEmail=()=>'p@x.com'; global.acPlanName=()=>'Pro'; global.acPlanKey=()=>'pro';
global.acSectionHTML=()=>'<div>SECTION:'+ACCT.sec+'</div>';
global.bindAccount=()=>{};
(0,eval)(code+';global.__f={openAccount,closeAccount,renderAccount};');
const {openAccount,closeAccount}=global.__f;

let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// 1) open Tools: panel opens in place, brands hidden, page NOT scroll-locked
openAccount('tools');
ok('panel opens', el('acctOv').classes.has('open'));
ok('brands area hidden', el('main').style.display==='none');
ok('page scroll NOT locked', !document.body.style.overflow);
ok('content is the Tools section', el('acctOv').innerHTML.indexOf('SECTION:tools')>=0);
ok('no duplicate sidebar', el('acctOv').innerHTML.indexOf('ac-side')<0);
ok('no Back to your brands', el('acctOv').innerHTML.indexOf('Back to your brands')<0);
ok('no X close control', el('acctOv').innerHTML.indexOf('ac-x')<0);
ok('Tools header is clean — no Log out (Founder order: identity lives on Account only)', el('acctOv').innerHTML.indexOf('logout')<0);

// 2) switch section in place (what the rail handler does: ACCT.sec=k; openAccount())
openAccount('billing');
ok('switch swaps content in place', el('acctOv').innerHTML.indexOf('SECTION:billing')>=0);
ok('still open, brands still hidden', el('acctOv').classes.has('open') && el('main').style.display==='none');

// 3) close: brands come back
closeAccount();
ok('panel closes', !el('acctOv').classes.has('open'));
ok('brands area restored', el('main').style.display==='');
ok('page scroll clean after close', !document.body.style.overflow);

// 4) THE ROUTING BUG (from the Founder's screenshots): every item must land on ITS OWN section
global.ACTITLE.refer='Refer a friend'; global.ACTITLE.support='Help & support'; global.ACTITLE.purchases='Billing & receipts';
for (const k of ['tools','support','refer','purchases','billing']) {
  const key = (k==='tools')?'tools':(k==='billing'?'purchases':k);
}
openAccount('refer');
ok('Refer shows the Refer section (not overview)', el('acctOv').innerHTML.indexOf('SECTION:refer')>=0 && el('acctOv').innerHTML.indexOf('SECTION:overview')<0);
openAccount('support');
ok('Help shows the Help section', el('acctOv').innerHTML.indexOf('SECTION:support')>=0);
openAccount('purchases');
ok('Billing shows the Billing section', el('acctOv').innerHTML.indexOf('SECTION:purchases')>=0);
ACCT.sec='prefs'; openAccount();
ok('no-arg call preserves a preset section (never resets to overview)', el('acctOv').innerHTML.indexOf('SECTION:prefs')>=0);
console.log(fail===0?'\nNAV CONVERSION CLEAN':'\n'+fail+' FAILED');
process.exit(fail?1:0);
