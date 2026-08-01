// LOGO PIPELINE — added after a photo clean-up accidentally dropped logo work from Pro to Flash.
const fs=require('fs');
const P='/home/claude/site/netlify/functions/';
const eng=fs.readFileSync(P+'studio-engine.js','utf8');
const lcb=fs.readFileSync(P+'logo-concepts-background.js','utf8');
const tr =fs.readFileSync(P+'art-translator.js','utf8');
const adb=fs.readFileSync(P+'art-department-background.js','utf8');
const arb=fs.readFileSync(P+'art-render-background.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// the quality model is back on identity work
ok('logo path leads with the Pro model', lcb.includes("'gemini-3-pro-image-preview','gemini-3.1-flash-image'"));
ok('logo path opts in explicitly', lcb.includes('allowPreview:true'));
ok('engine honours the opt-in', eng.includes('if (!opts.allowPreview)'));

// photographs are still protected — the original complaint must not regress
ok('photo path does NOT opt in', !adb.includes('allowPreview') && !arb.includes('allowPreview'));
ok('photo ladder unchanged', eng.includes("var PHOTO_LADDER = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image']"));
ok('photo library still versioned', adb.includes("var LIBRARY_GENERATION = 'v2'"));

// one prompt author, and it is the LOGO LAW one
ok('Translator is the only logo prompt author', lcb.includes('translator.logoPrompt('));
ok('no duplicate hardcoded logo prompt', !/set inside or above a dynamic\s+containing shape/.test(lcb));
ok('brand palette fed to the mark', tr.includes('Brand color palette (use these, dominant first)'));
ok('brief psychology honoured', tr.includes('BRAND PSYCHOLOGY (obey precisely)'));
ok('cliches can be forbidden', tr.includes('STRICTLY FORBIDDEN as the main idea'));

// the comment I mangled is repaired
ok('no comment nested inside a comment', !lcb.includes('No /* preview model purged'));
console.log(fail===0?'\nLOGO PIPELINE CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
