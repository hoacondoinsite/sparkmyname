const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const mr =fs.readFileSync('/home/claude/site/netlify/functions/my-reports.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// --- the DATA bug (the real cause of missing photos) ---
ok('header lookup is batched', /for \(let i = 0; i < ids2\.length; i \+= 100\)/.test(mr));
ok('each batch has an explicit row limit', mr.includes('&limit=2000'));
ok('batch is ordered (no arbitrary truncation)', mr.includes('&order=position.asc'));
ok('the 300-brand cap is gone', !/rows\.length <= 300/.test(mr));
ok('one failed batch cannot lose the rest', mr.includes('continue;'));
ok('still fails safe (wrapped in try)', /try \{[\s\S]{0,400}ids2/.test(mr));

// --- the RENDER speed work ---
ok('renders a first page, not all 247', /var PAGE=48/.test(src));
ok('appends more on scroll', src.includes('IntersectionObserver') && src.includes('appendPage'));
ok('has a no-observer fallback (brands never hidden)', src.includes('Show more brands'));
ok('one delegated click listener, not one per card', src.includes('grid.__bbBound'));
ok('images still lazy + async', src.includes('loading="lazy"') && src.includes('decoding="async"'));
ok('monogram fallback intact for brands with no photo', src.includes('bb-mono'));

// --- nothing lost ---
ok('search still repaints', /function paint\(q\)\{[\s\S]{0,120}cur=rows\(q\)/.test(src));
ok('count still truthful', src.includes("cur.length+(cur.length===1?' brand':' brands')"));
console.log(fail===0?'\nBRANDS GRID CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
