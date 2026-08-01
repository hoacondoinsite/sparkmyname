const fs=require('fs');
const ra=fs.readFileSync('/home/claude/site/netlify/functions/refresh-art.js','utf8');
const ws=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};
ok('endpoint exists and is POST-only', ra.includes("event.httpMethod !== 'POST'"));
ok('report key sanitised', ra.includes("replace(/[^A-Za-z0-9_-]/g, '')"));
ok('reads only header URLs (cheap)', ra.includes('select=hero:kit->>headerUrl'));
ok('uses the order\'s own seed, not a guess', ra.includes('select=seed'));
ok('re-runs the art department', ra.includes('art-department-background'));
ok('never promises images when the dept is off', ra.includes('art_department_off'));
ok('workspace detects stale art', ws.includes("indexOf('/library/v2/')<0"));
ok('workspace runs once per brand per session', ws.includes('__smnHealed'));
ok('notice only shown when a refresh really started', ws.includes('if(d && d.refreshing)'));
ok('notice is honest about the wait', ws.includes('within a few minutes'));
ok('failure is silent, never a false promise', ws.includes('.catch(function(){});'));

// the staleness rule must agree on both sides
const{isStale}=require('/home/claude/site/netlify/functions/refresh-art.js');
ok('stale: old flat library detected', isStale('https://x/storage/v1/object/public/spark/library/events.png')===true);
ok('fresh: v2 library passes', isStale('https://x/storage/v1/object/public/spark/library/v2/events.png')===false);
ok('non-library art untouched', isStale('https://x/storage/v1/object/public/spark/orders/abc/card-hero-0.png')===false);
ok('empty is not stale', isStale('')===false && isStale(null)===false);
console.log(fail===0?'\nSELF-HEALING CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
