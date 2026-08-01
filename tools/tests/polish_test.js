const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const css=fs.readFileSync('/home/claude/site/workspace.html','utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// US spelling in everything a customer reads
ok('no British spelling in shipped JS copy', !/[Cc]olour/.test(strip(src)));
ok('no British spelling in shipped markup', !/[Cc]olour/.test(strip(css)));
ok('the section is named "Color palettes"', src.includes("colors:['Color palettes'"));

// balance: wide sections get two columns
['handles','logo','typography','posts'].forEach(k=>
  ok('wide section spans two columns: '+k, css.includes('[data-bkacc="'+k+'"]')));
ok('span rule is desktop-only', /@media\(min-width:1000px\)\{[\s\S]{0,300}grid-column:span 2/.test(css));
// and those keys are real
const keys=(src.match(/SECMETA=\{[\s\S]*?\n/)||[''])[0];
['handles','logo','typography','posts'].forEach(k=>ok('  key exists in SECMETA: '+k, src.includes(k+":['")));

// handle rows can breathe
ok('handle label has room', css.includes('.hrow b{width:92px'));
ok('handle text at body size', css.includes('.hrow span{font-size:var(--t-body)'));
ok('handle row stacks on narrow screens', /@media\(max-width:620px\)\{[\s\S]{0,200}\.hrow\{flex-direction:column/.test(css));

// solid white body copy
ok('section body copy is white', css.includes('.bkmosaic .bkacc-b,'));
ok('white applied via the ink-1 token', /\.bkmosaic \.bkacc-b[\s\S]{0,180}color:var\(--ink1\)/.test(css));
ok('quiet metadata still stepped back', css.includes('.bkmosaic .note,.bkmosaic .subh'));

// nothing is being truncated
ok('collapseList renders every item (no hidden bios)', /function collapseList\([^)]*\)\s*\{\s*return items\.map/.test(src));
console.log(fail===0?'\nPOLISH CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
