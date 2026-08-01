// EVERYTHING LEAVES BY RESEND — no mailto, no third-party mail client.
const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const live=strip(src);
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

/* Two kinds of mailto exist and only one is a violation:
   - SPARK sending its own mail (support, billing, the founder) must go via Resend. Banned here.
   - THE CUSTOMER emailing their own brand to a friend, as a fallback when their device has no
     native share sheet. That is their mail client, their message. Removing it breaks sharing. */
const mailtos=[...live.matchAll(/mailto:[^"'\s)]*/g)].map(m=>m[0]);
const sparkMail=mailtos.filter(m=>/@sparkmyname/.test(m));
ok('Spark never sends its own mail by mailto ('+sparkMail.length+' found)', sparkMail.length===0);
if(sparkMail.length) sparkMail.forEach(m=>console.log('        -> '+m));
ok('customer share fallback preserved', mailtos.some(m=>m==='mailto:?subject='));

ok('founder message routes through support', /a==='founder'[\s\S]{0,400}smnSupportSend/.test(src));
ok('billing email routes through support', /a==='billemail'[\s\S]{0,300}smnSupportSend/.test(src));
ok('payment request routes through support', /a==='pay'[\s\S]{0,300}smnSupportSend/.test(src));
ok('support path hits support-request', src.includes("'/.netlify/functions/support-request'"));
ok('support-request delivers via Resend',
   fs.readFileSync('/home/claude/site/netlify/functions/support-request.js','utf8').includes('RESEND_API_KEY'));
ok('Share brand email uses Resend (email-brand)',
   fs.readFileSync('/home/claude/site/netlify/functions/email-brand.js','utf8').includes('RESEND'));
ok('overview no longer advertises AI tools it does not show', !/Everything about your brands, purchases, and AI tools/.test(src));
ok('help center link explains where it goes', src.includes('Open help center'));
console.log(fail===0?'\nRESEND ROUTING CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
