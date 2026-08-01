const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
function grab(name){const i=src.indexOf('function '+name+'(');if(i<0)throw new Error(name+' missing');
 let d=0,j=src.indexOf('{',i);for(let k=j;k<src.length;k++){if(src[k]==='{')d++;if(src[k]==='}'){d--;if(d===0)return src.slice(i,k+1);}}}
const gt=src.indexOf('var GUIDE_TOPICS=');const gte=src.indexOf('];',gt)+2;
const code=[src.slice(gt,gte),grab('openBrandsBrowser'),grab('openGuidePanel'),grab('openConciergePanel'),grab('renderAccount')].join('\n');

function el(id){ if(!el.m)el.m={}; if(!el.m[id]) el.m[id]={id,style:{},value:'',textContent:'',_h:'',
  get innerHTML(){return this._h;}, set innerHTML(v){this._h=v;},
  insertAdjacentHTML(pos,html){this._h+=html;},
  remove(){},
  classList:{add(){},remove(){},toggle(){},contains(){return false;}},
  addEventListener(){},querySelectorAll(){return [];},querySelector(){return null;},dataset:{}};
  return el.m[id]; }
global.window=global; global.document={getElementById:id=>el(id),querySelectorAll:()=>[],body:{style:{}}};
global.$=s=>el(s.replace('#',''));
global.scrollTo=()=>{}; global.toast=()=>{};
global.ACCT={sec:'overview'}; global.ACTITLE={overview:'Your account',prefs:'Settings',refer:'Refer a friend'};
global.esc=s=>String(s==null?'':s);
global.acName=()=>'Peter';global.acEmail=()=>'p@x.com';global.acPlanName=()=>'Pro';global.acPlanKey=()=>'pro';
global.acSectionHTML=()=>'<div>SEC:'+ACCT.sec+'</div>'; global.bindAccount=()=>{};
global.IDEAS=[{id:'a1',cat:'jewelry',said:'luxury diamonds in NYC',header:'https://x/h1.png',names:[{name:'Park Avenue Diamonds',heroUrl:'https://x/h1.png'}]},
              {id:'b2',cat:'coffee',said:'a cozy cafe',names:[{name:'Bean Haven'}]}];
global.bpRows=q=>IDEAS.filter(d=>((d.names[0]&&d.names[0].name)||'').toLowerCase().includes((q||'').toLowerCase()));
global.selectIdea=()=>{}; global.closeAccount=()=>{};
global.smnLLM=(s,p,cb)=>cb('Here is how.');
global.fetch=()=>Promise.resolve({json:()=>Promise.resolve({ok:true})});
global.location={href:''};

(0,eval)(code+';window.__p={openBrandsBrowser,openGuidePanel,openConciergePanel,renderAccount};');
const P=global.__p; let fail=0; const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// BRANDS BROWSER
P.openBrandsBrowser();
let h=el('acctOv').innerHTML + el('bbGrid').innerHTML;
ok('brands: full-page panel renders with title', h.indexOf('Your brands')>=0);
ok('brands: wide search + sort + count on top', h.indexOf('bb-search')>=0 && h.indexOf('bb-sort')>=0 && h.indexOf('bb-count')>=0);
ok('brands: NO Create a new brand button', h.indexOf('Create a new brand')<0);
ok('brands: NO Save all my brands button', h.indexOf('Save all my brands')<0);
ok('brands: photo cards flow in the grid', el('bbGrid').innerHTML.indexOf('bb-card')>=0 && el('bbGrid').innerHTML.indexOf('Park Avenue Diamonds')>=0);
ok('brands: brand without photo gets monogram, not broken img', el('bbGrid').innerHTML.indexOf('bb-mono')>=0);
ok('brands: count is truthful', el('bbCount').textContent==='2 brands');

// LIVING GUIDE
P.openGuidePanel();
h=el('acctOv').innerHTML;
ok('guide: many subjects on top', (h.match(/gg-topic/g)||[]).length>=16);
ok('guide: no 1-of-6 tour, no X', h.indexOf('1 of 6')<0 && h.indexOf('ac-x')<0);
ok('guide: live ask box present', h.indexOf('ggIn')>=0 && h.indexOf('Ask')>=0);
ok('guide: first topic painted into body', el('ggBody').innerHTML.indexOf('Your brands')>=0);

// CONCIERGE
P.openConciergePanel();
h=el('acctOv').innerHTML;
ok('concierge: in-page, no drawer, no X', h.indexOf('Your concierge')>=0 && h.indexOf('cpClose')<0);
ok('concierge: NO false live-agent claim', h.indexOf('live agent')<0 && h.indexOf('Start a live chat')<0 && h.indexOf('connected')<0);
ok('concierge: honest replies-by-email copy', h.indexOf('replies to your email')>=0 || h.indexOf('reply to your email')>=0);
ok('concierge: wired to a real send button', h.indexOf('ccSend')>=0);
ok('concierge: reply-to shown truthfully', h.indexOf('p@x.com')>=0);

// HEADERS
ACCT.sec='prefs'; P.renderAccount();
ok('Settings header has NO identity strip', el('acctOv').innerHTML.indexOf('acp-me')<0 && el('acctOv').innerHTML.indexOf('Log out')<0);
ACCT.sec='overview'; P.renderAccount();
ok('Account page keeps identity + Log out', el('acctOv').innerHTML.indexOf('acp-me')>=0 && el('acctOv').innerHTML.indexOf('Log out')>=0);

console.log(fail===0?'\nPANEL PASS CLEAN':'\n'+fail+' FAILED');
process.exit(fail?1:0);
