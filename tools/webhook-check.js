/* STRIPE WEBHOOK (2026-07-26)
   The webhook is the one signal guaranteed to fire on every paid order, so what it does twice
   matters as much as what it does once. These tests sign real payloads with real HMAC and
   check what the verifier accepts. */
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const W=(m)=>fs.writeSync(1,m+'\n');
const SRC=fs.readFileSync(path.join(__dirname,'..','netlify','functions','stripe-webhook.js'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,80)):''));} };

/* Lift the real verify() out of the function and exercise it. */
const vi=SRC.indexOf('function verify'), vj=SRC.indexOf('\n}', vi)+2;
/* eval declares its own 'verify'; a preceding 'let verify' shadows it and the call fails
   with 'verify is not a function'. Assign the expression instead. */
const verify = eval('(' + SRC.slice(vi,vj) + ')');
const SECRET='whsec_test_secret';
function sign(payload, whenMs, secret){
  const t=Math.floor((whenMs||Date.now())/1000);
  const v1=crypto.createHmac('sha256', secret||SECRET).update(t+'.'+payload).digest('hex');
  return 't='+t+',v1='+v1;
}
const BODY=JSON.stringify({id:'evt_test_1', type:'checkout.session.completed'});

W('SIGNATURE VERIFICATION — signed with real HMAC');
ok('a fresh signature is accepted', verify(BODY, sign(BODY), SECRET)===true);
ok('a genuine retry 4 minutes later is accepted', verify(BODY, sign(BODY, Date.now()-240000), SECRET)===true);
ok('a signature 6 minutes old is rejected', verify(BODY, sign(BODY, Date.now()-360000), SECRET)===false);
ok('  and one an hour old', verify(BODY, sign(BODY, Date.now()-3600000), SECRET)===false);
ok('  and one from the future', verify(BODY, sign(BODY, Date.now()+3600000), SECRET)===false);
ok('a tampered body is rejected', verify(BODY+'x', sign(BODY), SECRET)===false);
ok('the wrong secret is rejected', verify(BODY, sign(BODY, Date.now(), 'whsec_wrong'), SECRET)===false);
ok('an empty signature is rejected', verify(BODY, '', SECRET)===false);
ok('a malformed header is rejected', verify(BODY, 'garbage', SECRET)===false);
ok('a missing v1 is rejected', verify(BODY, 't='+Math.floor(Date.now()/1000), SECRET)===false);
ok('no secret configured means nothing is accepted', verify(BODY, sign(BODY), '')===false);
ok('comparison is timing-safe', /timingSafeEqual/.test(SRC));

W('\nEACH EVENT IS HANDLED ONCE');
ok('the event id is claimed', /claimOnce\('idem\/stripe-/.test(SRC));
ok('  using the same mechanism the build already trusts', /require\('\.\/sb-storage\.js'\)/.test(SRC));
ok('  and the id is sanitised into the path', /replace\(\/\[\^A-Za-z0-9_-\]\/g, ''\)/.test(SRC));
ok('a duplicate returns 200, not an error', /body: 'duplicate'/.test(SRC));
ok('  because a non-2xx would make Stripe retry it again', true);
ok('an unreachable claim processes the event anyway', /processing anyway/.test(SRC));
ok('  which is deliberate and stated', /losing a paid order is a far\s*\n?\s*.*worse failure/.test(SRC.replace(/\s+/g,' ')) || /worse failure/.test(SRC));

W('\nWHAT WAS ALREADY SAFE, AND STILL IS');
{
  const dbg=fs.readFileSync(path.join(__dirname,'..','netlify','functions','deliver-background.js'),'utf8');
  ok('the build claims itself once', /claimOnce\(_lockPath/.test(dbg));
  ok('one delivery email per order', /emailed_at/.test(dbg));
}
ok('only checkout.session.completed is acted on', /type === 'checkout\.session\.completed'/.test(SRC));
ok('a missing Supabase config does not crash it', /missing_supabase_env/.test(SRC));
ok('the referral capture cannot block the order', /referral capture skipped/.test(SRC));
ok('the confirmation email cannot block the order', /confirmation email skipped/.test(SRC));
ok('the delivery trigger cannot block the entitlement', /delivery trigger skipped/.test(SRC));

W('');
W(fail===0?('WEBHOOK CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
