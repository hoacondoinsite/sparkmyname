const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const css=fs.readFileSync('/home/claude/site/workspace.html','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// ---- NOTHING LOST: every control still rendered AND still bound ----
const controls=['dlall','brandpdf','sendbrand','morenames','support','brandsave','removebrand',
                'dlallnames','olin','tool'];
controls.forEach(c=>{
  ok('rendered: data-'+c, src.indexOf('data-'+c+'=')>=0);
  ok('  bound: data-'+c, src.includes('[data-'+c+']'));
});
// the three Tools entries survive as visible tiles
['ai','success','concierge'].forEach(t=>ok('tool tile present: '+t, src.includes('data-tool="'+t+'"')));

// ---- the download scope fix ----
ok('downloadAll takes a scope argument', src.includes('function downloadAll(IDEA,btn,scope)'));
ok('default packages the ACTIVE name only', src.includes("var _all = (scope==='all')") && src.includes('curName'));
ok('all-names path preserved, now explicit', src.includes("downloadAll(IDEA,dlan,'all')"));

// ---- the truth fix ----
const codeOnly=src.replace(/\/\*[\s\S]*?\*\//g,'');
ok('no live-chat promise in shipped code', !/[Ll]ive (agent|chat)/.test(codeOnly));
ok('no live-chat promise in markup', !/Start a live chat/.test(css));

// ---- the grid itself ----
ok('grid of groups exists', src.includes('dkgrid') && src.includes('dkgroup'));
ok('three labelled groups', (src.match(/dkgh">/g)||[]).length===3);
ok('tiles explain what they do', src.includes('Made to print.'));
ok('grid styled', css.includes('.dkgrid{display:grid'));
console.log(fail===0?'\nOPEN GRID CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
