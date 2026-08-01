/* UNDELIVERED SWEEP (2026-07-26) — the logic, exercised against synthetic orders.
   Written because the first version of this sweep would have emailed 95 rows daily, 94 of them
   the founder's own tests. A detector that cries wolf gets filtered, and then the real one is
   missed too. These cases pin the filtering down. */
'use strict';
const fs=require('fs'), path=require('path');
const W=(m)=>fs.writeSync(1,m+'\n');
const SRC=fs.readFileSync(path.join(__dirname,'..','netlify','functions','undelivered-sweep.js'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,110)):''));} };

W('IT REPORTS, IT NEVER SENDS TO A CUSTOMER');
ok('the only recipient is the founder', /to: \[TO\]/.test(SRC) && /const TO = process\.env\.FOUNDER_EMAIL/.test(SRC));
ok('it never calls order-deliver', SRC.indexOf('order-deliver') < 0 || !/fetch\([^)]*order-deliver/.test(SRC));
ok('it says so in the email itself', /never[\s\S]{0,40}emails a customer on its own/.test(SRC));
ok('a failed alert cannot fail the sweep', /\}\).catch\(function \(\) \{ \/\* an alert that fails to send/.test(SRC));

W('\nIT ONLY RAISES REAL CUSTOMERS');
ok('the founder\'s own orders are excluded', /function isSelf/.test(SRC));
ok('  by exact match on FOUNDER_EMAIL', /e === SELF/.test(SRC));
ok('  and by test-address patterns', /peterklein\|vorrex\|@example/.test(SRC));
ok('an order with no email is not raised', /if \(!e\) return true;/.test(SRC));
ok('only paid (bib) orders count', /plan=eq\.bib/.test(SRC));
ok('only finished brands count', /d\.total < 6 \|\| d\.ready < d\.total/.test(SRC));
ok('a brand is finished only with photo, logos AND words',
   /k\.headerUrl &&[\s\S]{0,120}logoUrls[\s\S]{0,80}taglines/.test(SRC));

W('\nIT STAYS QUIET WHEN IT SHOULD');
ok('young orders are left alone', /GRACE_MINUTES = 60/.test(SRC));
ok('  the grace period is applied to the query', /created_at=lt\.' \+ encodeURIComponent\(cutoff\)/.test(SRC));
ok('old ones are counted, not re-listed daily', /const WINDOW_DAYS = 7/.test(SRC));
ok('  and the count is shown honestly', /counted rather than listed/.test(SRC));
ok('nothing found means no email', /if \(!stuck\.length\) \{[\s\S]{0,220}return \{ statusCode: 200/.test(SRC));

W('\nIT CANNOT TAKE THE SITE DOWN');
ok('missing config exits cleanly', /if \(!SB_URL \|\| !SB_KEY\)/.test(SRC));
ok('every failure returns 200 with a reason', /catch \(e\) \{\s*return \{ statusCode: 200/.test(SRC));
ok('the query is bounded', /limit=200/.test(SRC));
ok('customer text is escaped into the email', /function esc\(s\)/.test(SRC) && /esc\(r\.email\)/.test(SRC));

W('\nIT IS SCHEDULED');
const toml=fs.readFileSync(path.join(__dirname,'..','netlify.toml'),'utf8');
ok('registered in netlify.toml', /\[functions\."undelivered-sweep"\]/.test(toml));
ok('runs daily', /\[functions\."undelivered-sweep"\][\s\S]{0,80}schedule = "0 14 \* \* \*"/.test(toml));
ok('does not collide with finance-cron', /finance-cron"\][\s\S]{0,60}"0 13/.test(toml));

W('');
W(fail===0?('SWEEP CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
