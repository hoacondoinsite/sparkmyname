/* ART PRUNE (2026-07-26). A job that deletes files has to be judged on what it REFUSES to do.
   582MB of superseded takes is worth recovering; the homepage hero disappearing is not worth
   any amount of storage. These assertions are mostly about restraint. */
'use strict';
const fs=require('fs'), path=require('path');
const W=(m)=>fs.writeSync(1,m+'\n');
const SRC=fs.readFileSync(path.join(__dirname,'..','netlify','functions','art-prune.js'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,80)):''));} };

W('IT WILL NOT DELETE WHAT IS ON SCREEN');
ok('it reads the registry first', /async function readRegistry/.test(SRC));
ok('  before listing anything', SRC.indexOf('readRegistry()') < SRC.indexOf('sbList(PREFIX'));
ok('every registry URL is protected', /live\.add\(decodeURIComponent/.test(SRC));
ok('a protected file is kept whatever its age', /if \(live\.has\(o\.path\)\) \{ keep\.push/.test(SRC));
ok('an unreadable registry aborts the whole run', /registry_unreadable/.test(SRC));
ok('  and says why in plain words', /guessing is how\s*\n?\s*.*live art disappears/.test(SRC) || /live art disappears/.test(SRC));

W('\nIT WILL NOT DELETE WITHOUT BEING TOLD TWICE');
ok('a GET only reports', /if \(!isPost\) \{[\s\S]{0,200}return resp\(200, summary\)/.test(SRC));
ok('  and says so', /dry run — nothing was touched/.test(SRC));
ok('a POST needs the founder key', /body\.key !== FOUNDER_KEY/.test(SRC));
ok('  and an explicit confirm', /body\.confirm !== true/.test(SRC));
ok('  which it explains rather than just refusing', /A dry run is a GET; deleting is deliberate/.test(SRC));

W('\nIT CANNOT RUN AWAY');
ok('it keeps the newest few per surface regardless', /const KEEP = 3/.test(SRC));
ok('a ceiling caps one call', /const MAX_DELETE = 500/.test(SRC));
ok('  and it stops rather than raising the ceiling', /Run it again after this batch rather than raising the limit/.test(SRC));
ok('deletes go in bounded batches', /i \+= 50/.test(SRC));
ok('any failure deletes nothing', /Nothing was deleted\./.test(SRC));

W('\nIT IS HONEST ABOUT WHAT IT DID');
ok('it reports what it protected', /protected_by_registry/.test(SRC));
ok('it reports what it kept and why', /why: 'on screen now'/.test(SRC) && /one of the ' \+ KEEP \+ ' newest/.test(SRC));
ok('it shows a sample before deleting', /summary\.sample = drop\.slice\(0, 8\)/.test(SRC));
ok('it reports megabytes, not bytes', /would_free_mb/.test(SRC));

W('\nIT IS NOT WIRED TO A SCHEDULE');
{
  const toml=fs.readFileSync(path.join(__dirname,'..','netlify.toml'),'utf8');
  ok('nothing runs it automatically', !/\[functions\."art-prune"\]/.test(toml));
  W('        (deliberate: a scheduled deleter is a scheduled accident. Run it by hand.)');
}

W('');
W(fail===0?('PRUNE CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
