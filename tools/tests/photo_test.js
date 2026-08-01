// PHOTO ENGINE CONSISTENCY — added after the Founder reported aged-looking 2K photos.
const fs=require('fs');
const P='/home/claude/site/netlify/functions/';
const eng=fs.readFileSync(P+'studio-engine.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

ok('one canonical ladder exists', eng.includes("var PHOTO_LADDER = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image']"));
ok('ladder is exported', eng.includes('PHOTO_LADDER:PHOTO_LADDER'));
ok('preview models are demoted, not led with', eng.includes('/preview/i.test(m)'));
ok('step-down is logged, not silent', eng.includes('PHOTO STEPPED DOWN'));
ok('openai fallback is logged', eng.includes('FELL BACK TO OPENAI'));

// no photo path may carry its own tier list
['art-department-background.js','art-render-background.js','generate-asset-background.js'].forEach(f=>{
  ok(f+' has no ad-hoc tier list', !fs.readFileSync(P+f,'utf8').includes('geminiModels'));
});

// the good prompt must still be the one in use
ok('cinematic standard prompt intact', eng.includes('CINEMATIC STANDARD RESTORED'));
ok('photoreal guard intact', eng.includes('never a digital illustration'));
const art=fs.readFileSync(P+'art-department-background.js','utf8');
ok('order photos use engine.heroPrompt', art.includes('engine.heroPrompt'));
ok('no ageing language in variants',
   !/vintage|film grain|sepia|faded|antique|desaturat/i.test((art.match(/VARIANTS\s*=\s*\[[^\]]*\]/)||[''])[0]));

// Demotion was replaced by outright refusal (Founder: "I never wanna see it again"),
// so the old assertion no longer describes the code. Refusal is asserted above.

// THE LIBRARY GENERATION — the actual haunting. Old photos were reused forever.
const adb=fs.readFileSync(P+'art-department-background.js','utf8');
ok('photo library is versioned', adb.includes("var LIBRARY_GENERATION = 'v2'"));
ok('library path uses the generation', adb.includes("'library/' + LIBRARY_GENERATION + '/' + ik"));
ok('old vintage shelf is never referenced', !/'library\/'\s*\+\s*ik/.test(adb));
// preview models are refused outright, not merely demoted
ok('preview models refused, not demoted', eng.includes('tiers = tiers.filter(function(m){ return !/preview/i.test(m); });'));
ok('ladder survives an all-preview request', eng.includes('if (!tiers.length) tiers = PHOTO_LADDER.slice();'));
// no ageing language anywhere on the brand-photo path
['studio-engine.js','art-department-background.js','art-render-background.js'].forEach(f=>{
  let c=fs.readFileSync(P+f,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  ok(f+' free of ageing language',
     !/film ?grain|vintage|retro|sepia|faded|antique|nostalg|desaturat|washed[- ]out|editorial/i.test(c));
});
console.log(fail===0?'\nPHOTO ENGINE CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
