// PUBLIC BRAND CARD — behaviour + privacy + truth
const fs=require('fs');
const fn =fs.readFileSync('/home/claude/site/netlify/functions/brand-card.js','utf8');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// --- the whole point: crawler-readable share tags ---
['og:title','og:description','og:image','og:url','twitter:card','twitter:image'].forEach(t=>
  ok('share tag present: '+t, fn.includes(t)));
ok('server-rendered (crawlers cannot run JS)', fn.includes("'Content-Type': 'text/html"));
ok('large image card', fn.includes('summary_large_image'));

// --- PRIVACY: it must expose the brand and nothing else ---
ok('selects ONLY name, tag, domain, hero', /select=name,tag:kit->>tag,dom:kit->>dom,hero:kit->>headerUrl/.test(fn));
['email','client_email','logoUrls','assets','bios','posts','palettes'].forEach(f=>
  ok('does NOT expose '+f, !new RegExp('select=[^&]*'+f).test(fn)));
ok('report key sanitised', fn.includes("replace(/[^A-Za-z0-9_-]/g, '')"));
ok('name position bounded', fn.includes('Math.min(20'));
ok('only OUR public storage can be the share image', fn.includes("indexOf('/storage/v1/object/public/') > 0"));

// --- TRUTH: no claim beyond what the code does ---
ok('no trademark/registered overclaim', !/®/.test(fn));
ok('uses the trademark mark correctly', fn.includes('SparkMyName&trade;'));
ok('missing brand fails to a real page, not a crash', fn.includes('function notFound'));
ok('404 page is not indexed', /noindex/.test(fn));

// --- the workspace tile ---
ok('Share tile rendered', src.includes('data-sharelink="1"'));
ok('Share tile bound', src.includes('[data-sharelink]'));
ok('uses native share sheet when available', src.includes('navigator.share'));
ok('falls back to clipboard, then a new tab', src.includes('navigator.clipboard') && src.includes("window.open(url"));
ok('links to the right brand and name', src.includes("'&n='+(curName||0)"));
console.log(fail===0?'\nBRAND CARD CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
