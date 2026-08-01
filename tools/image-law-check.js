#!/usr/bin/env node
/* image-law-check.js — MACHINE ENFORCEMENT OF docs/SPARK_IMAGE_LAW.md
 * Founder order, 2026-07-27: "how do I make sure no other Claude gets near it?"
 * A written rule can be skimmed past. This fails the build instead.
 * Run:  node tools/image-law-check.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'netlify', 'functions');
const read = f => { try { return fs.readFileSync(path.join(F, f), 'utf8'); } catch (e) { return ''; } };
/* rules apply to PROMPT TEXT, not to the comments that explain this history */
const live = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let fail = 0;
const ok = (n, c, why) => {
  console.log((c ? '  PASS  ' : '  FAIL  ') + n);
  if (!c) { fail++; if (why) console.log('        -> ' + why); }
};

console.log('\nSPARK IMAGE LAW — enforcement\n');

// ---- 1. the vintage library must stay abandoned ----------------------------
const adb = read('art-department-background.js');
ok('library is versioned (LIBRARY_GENERATION present)',
   /var LIBRARY_GENERATION\s*=\s*'v\d+'/.test(adb),
   'art-department-background.js must declare LIBRARY_GENERATION');
ok('library path uses the generation',
   /'library\/'\s*\+\s*LIBRARY_GENERATION\s*\+\s*'\/'/.test(adb),
   'path must be library/{generation}/{key}.png');
ok('the flat vintage path is never rebuilt',
   !/'library\/'\s*\+\s*ik/.test(live(adb)),
   "found 'library/' + ik — that is the vintage shelf. See SPARK_IMAGE_LAW section 1.");

// ---- 2. ageing language banned on the brand-photo path ---------------------
const AGE = /film ?grain|vintage|retro|sepia|faded|antique|nostalg|desaturat|washed[- ]out|editorial/i;
['studio-engine.js', 'art-department-background.js', 'art-render-background.js'].forEach(f => {
  const hit = AGE.exec(live(read(f)));
  ok('no ageing language in ' + f, !hit,
     hit ? ('found "' + hit[0] + '" — banned on the photo path (films and name-intel are exempt)') : '');
});

// ---- 3. preview models: barred on photos, required on logos ----------------
const eng = read('studio-engine.js');
ok('engine has one canonical photo ladder',
   /var PHOTO_LADDER\s*=\s*\['gemini-3\.1-flash-image', 'gemini-2\.5-flash-image'\]/.test(eng));
ok('preview ban is opt-out, not global',
   eng.includes('if (!opts.allowPreview)'),
   'a global ban silently downgrades LOGO quality — this exact mistake was made on 27 July');
['art-department-background.js', 'art-render-background.js'].forEach(f => {
  ok('photo path does not opt into preview: ' + f, !read(f).includes('allowPreview'));
  ok('photo path passes no ad-hoc tier list: ' + f, !read(f).includes('geminiModels'));
});
const lcb = read('logo-concepts-background.js');
ok('logo path opts into preview', lcb.includes('allowPreview:true'),
   'logos must use the Pro model — without this they silently drop to Flash');
ok('logo path leads with the Pro model',
   /'gemini-3-pro-image-preview'/.test(lcb));

// ---- 4. one author per prompt ---------------------------------------------
ok('Translator is the only logo prompt author',
   lcb.includes('translator.logoPrompt(') &&
   !/set inside or above a dynamic\s+containing shape/.test(live(lcb)),
   'a second hardcoded logo prompt once produced every shield the Founder rejected');
ok('engine is the only brand-photo prompt author',
   /function heroPrompt\(/.test(eng) && adb.includes('engine.heroPrompt'));
ok('cinematic standard note still present', eng.includes('CINEMATIC STANDARD RESTORED'));
ok('photoreal guard still present', eng.includes('never a digital illustration'));

// ---- 5. the self-healing wire ---------------------------------------------
const ra = read('refresh-art.js');
ok('self-healing endpoint exists', ra.length > 500);
ok('staleness rule defined in one place', /const CURRENT_GENERATION = '\/library\/v2\/'/.test(ra));
ok('never promises images when the art dept is off', ra.includes('art_department_off'));

console.log('\n' + (fail === 0
  ? 'IMAGE LAW UPHELD — retired paths remain retired.\n'
  : fail + ' VIOLATION(S). Read docs/SPARK_IMAGE_LAW.md before changing anything.\n'));
process.exit(fail === 0 ? 0 : 1);
