// IDENTITY BLOCK TEST — rewritten 2026-07-27 after the Founder ordered the white logo plate
// removed ("if that's how it's gonna look, get it out of there"). The previous version tested
// the wordmark plate, which no longer exists; keeping it would have been testing a ghost.
const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const start=src.indexOf("'<div class=\"webavail\">'+");
const chipEnd=src.indexOf("someone else does</div>':'')+",start);
const end=src.indexOf("'</div>'+",chipEnd)+"'</div>'+".length;
const expr=src.slice(start,end)+"''";
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function _logoFor(NMx,p){var L=(NMx&&NMx.logos)||[];return p==='wide'?(L[2]||L[0]||''):(L[0]||'');}
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};
const render=NM=>eval(expr);

let h=render({logos:['p.png','i.png','w.png'],name:'Palm Sound Warehouse',
  dom:'palmsoundwarehouse.com',tag:'Feel the Sound of Palm Beach',st:'Available'});
ok('NO white logo plate', !h.includes('wam-mark'));
ok('the NAME leads, large', h.includes('wa-name') && h.includes('Palm Sound Warehouse'));
ok('domain beneath it', h.includes('wa-domain') && h.includes('palmsoundwarehouse.com'));
ok('tagline present', h.includes('wa-tag') && h.includes('Feel the Sound'));
ok('availability chip present', h.includes('wam-chip'));
ok('no logo image at all in the identity block', !h.includes('<img'));

h=render({logos:[],name:'Bean Haven',dom:'beanhaven.com',tag:'',st:'Available'});
ok('no tagline -> no empty quotes', !h.includes('wa-tag'));
ok('name still shows without any logo files', h.includes('Bean Haven'));

h=render({logos:[],name:'X',dom:'x.com',tag:'t',st:'Taken'});
ok('unavailable -> no false chip', !h.includes('wam-chip'));

h=render({logos:[],name:'A & B <Co>',dom:'ab.com',tag:'"q"',st:'Available'});
ok('name and tagline escaped', h.includes('A &amp; B &lt;Co&gt;') && !h.includes('<Co>'));

// the idea pull-quote still stands
const qi=src.indexOf('<figure class="reqline">');
ok('idea renders as figure/blockquote', qi>0 && src.slice(qi,qi+400).includes('<blockquote class="rl-v'));
ok('idea guarded when empty', src.slice(qi-60,qi).includes('IDEA.said?'));
console.log(fail===0?'\nIDENTITY CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
