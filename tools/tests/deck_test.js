const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const css=fs.readFileSync('/home/claude/site/workspace.html','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// NOTHING LOST — every control must still be emitted, exactly once
// The Tools and More MENUS were retired 2026-07-27 — their contents are now visible tiles in
// the open grid, so the two trigger buttons should be GONE while every item they held survives.
['data-dlall','data-brandpdf','data-sendbrand','data-brandsave','data-support','data-removebrand'].forEach(c=>{
  const n=(src.match(new RegExp(c+'="','g'))||[]).length;
  ok('control present exactly once: '+c, n===1);
});
ok('Tools menu trigger retired (contents now visible)', !src.includes('data-opentools='));
ok('More menu trigger retired (contents now visible)', !src.includes('data-moremenu='));
ok('everything the Tools menu held survives as tiles',
   ['ai','success','concierge'].every(t=>src.includes('data-tool="'+t+'"')));
const mn=(src.match(/data-morenames="/g)||[]).length;
ok('More names appears twice on purpose (grid tile + tab strip)', mn===2);
ok('  and BOTH copies are bound', src.includes("querySelectorAll('[data-morenames]')"));
ok('all controls live in the deck', src.includes('<div class="deck">'));
ok('tabs still adjacent to their panels', src.includes('</div></div><div class="panelwrap">'));
ok('controls no longer inside the identity area', !/webavail[\s\S]{0,900}cardacts/.test(src));

// identity block
ok('white plate markup gone', !src.includes('wam-mark'));
ok('name leads the identity', src.includes('\'<div class="wa-name">\'+esc(NM.name)'));
ok('tagline restored under domain', src.includes('<div class="wa-tag">'));
ok('availability chip kept', src.includes('wam-chip'));
ok('plate hidden in CSS too', css.includes('.wam-mark{display:none}'));
ok('green box removed', css.includes('.webavail{background:none!important;border:0!important'));
ok('name set large', css.includes('clamp(var(--t-display),5vw,var(--t-hero))'));
console.log(fail===0?'\nDECK CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
