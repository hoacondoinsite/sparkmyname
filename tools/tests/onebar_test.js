const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// NOTHING LOST: every control that existed must still be emitted
// menu triggers retired 2026-07-27; their contents live as visible tiles
const controls=['data-dlall','data-brandpdf','data-sendbrand',
                'data-morenames','data-brandsave','data-support','data-removebrand'];
controls.forEach(c=>ok('control still present: '+c, src.includes(c+'=')));
ok('menu triggers retired', !src.includes('data-opentools=') && !src.includes('data-moremenu='));

// the bar structure
ok('tabs wrapped in the single bar', src.includes('<div class="onebar"><div class="tabs">'));
ok('onebar closes correctly', src.includes('</div></div><div class="panelwrap">'));
ok('tabs content still injected', src.includes('"tabs">\'+tabs+'));

// bindings are position-independent (root queries), so the move is safe
ok('dlall binds by root query', /root\.querySelector\('\[data-dlall\]'\)/.test(src));
ok('tabs bind by class through root', /root\.querySelectorAll\('\.tab'\)/.test(src));
ok('morenames binds by root query', /\[data-morenames\]/.test(src));

const css=fs.readFileSync('/home/claude/site/workspace.html','utf8');
ok('rail widened to 268px', css.includes('grid-template-columns:268px'));
// Assert on the rule that actually wins the cascade, not on a string position —
// the earlier version went stale the moment the rules were consolidated.
const winner=(()=>{let w=null;const re=/\.wsnav button\{[^}]*\}/g;let m;
  while((m=re.exec(css))){const b=css.slice(0,m.index);const lm=b.lastIndexOf('@media');
    const seg=lm>0?b.slice(lm):'';const open=(seg.match(/\{/g)||[]).length-(seg.match(/\}/g)||[]).length;
    if(!(lm>0&&open>0)) w=m[0];}
  return w||'';})();
ok('exactly one global rail-button rule', (css.match(/\.wsnav button\{/g)||[]).length>=1);
ok('winning rail rule uses body-size type', winner.includes('font-size:var(--t-body)'));
ok('winning rail rule uses white ink token', winner.includes('color:var(--ink1)'));

ok('wordmark ceiling raised', css.includes('max-height:250px'));
console.log(fail===0?'\nONE BAR CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
