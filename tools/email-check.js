/* EMAIL AUDIT (2026-07-26)
   The product ends in an email and no test had ever looked at one. Email clients are not
   browsers: Gmail strips <style> blocks in some contexts, Outlook renders through Word and
   ignores flexbox and grid entirely, and most clients block images until the reader asks for
   them. Rules that are ordinary on the web are broken in an inbox. */
'use strict';
const fs=require('fs'), path=require('path');
const W=(m)=>fs.writeSync(1,m+'\n');
const DIR=path.join(__dirname,'..','netlify','functions');

/* The emails a CUSTOMER receives. Founder alerts are held to a lower bar deliberately —
   nobody's purchase depends on how a spend warning looks. */
/* generate-asset.js dropped 2026-07-26: its notify() was dead code and was removed, so it no
   longer sends anything. Auditing a file that sends no email reports issues nobody can hit. */
const CUSTOMER=['send-kit.js','order-deliver.js','email-brand.js','email-friend.js',
                'share-names.js','generate-asset-background.js',
                'personalize-assets.js','olin-handoff.js','olin-report.js'];

let pass=0,fail=0; const notes=[];
const ok=(n,c,x)=>{ if(c===true){pass++;} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,90)):''));} };

/* Pull the HTML a function actually sends: the string handed to Resend. */
function htmlOf(src){
  const out=[];
  for(const m of src.matchAll(/html\s*:\s*([A-Za-z_$][\w$]*)/g)) out.push({kind:'var',name:m[1]});
  for(const m of src.matchAll(/html\s*:\s*(['"`])/g)) out.push({kind:'inline'});
  return out;
}
function bodyText(src){
  /* everything that looks like markup in the file — good enough to judge the techniques used */
  const chunks=[];
  for(const m of src.matchAll(/<(table|div|p|a|img|h[1-6]|td|tr|span|body|style)[^>]*>/gi)) chunks.push(m[0]);
  return chunks.join('\n');
}

W('CUSTOMER EMAILS — '+CUSTOMER.length+' checked');
W('');
const results=[];
CUSTOMER.forEach(f=>{
  const p=path.join(DIR,f);
  if(!fs.existsSync(p)) return;
  const src=fs.readFileSync(p,'utf8');
  const markup=bodyText(src);
  const r={f, issues:[]};

  /* Outlook renders through Word: no flex, no grid. */
  if(/display\s*:\s*flex/.test(src))  r.issues.push('uses flexbox — Outlook ignores it');
  if(/display\s*:\s*grid/.test(src))  r.issues.push('uses grid — Outlook ignores it');

  /* Images are blocked by default almost everywhere. */
  const imgs=[...src.matchAll(/<img[^>]*>/gi)].map(m=>m[0]);
  const noAlt=imgs.filter(t=>!/alt\s*=/.test(t));
  if(noAlt.length) r.issues.push(noAlt.length+' image(s) with no alt — blocked images leave a blank');

  /* A <style> block is stripped in several clients; anything critical must be inline. */
  if(/<style/i.test(src) && !/style\s*=/.test(markup))
    r.issues.push('relies on a <style> block with no inline fallback');

  /* Scripts never run and can trip spam filters. */
  if(/<script/i.test(src)) r.issues.push('contains a <script> tag');

  /* A plain-text alternative helps deliverability and screen readers. */
  /* ES6 shorthand — { subject, html } — is as valid as { html: html }, and olin-handoff and
     olin-report both use it. The first version of this check only understood the long form and
     reported them as having no HTML at all. */
  if(!/\btext\s*:/.test(src) && /api\.resend\.com/.test(src))
    r.issues.push('no plain-text alternative sent');

  /* Width: an email wider than ~600px is cropped or zoomed on a phone. */
  const wide=[...src.matchAll(/max-width\s*:\s*(\d+)px/g)].map(m=>+m[1]).filter(v=>v>640);
  if(wide.length) r.issues.push('max-width '+wide[0]+'px — over the ~600px an inbox gives you');

  /* Dark mode: many clients invert, and a hardcoded dark background then fights it. */
  if(/background\s*:\s*#0[0-9A-Fa-f]{5}/.test(src) && !/prefers-color-scheme/.test(src))
    r.issues.push('dark background with no prefers-color-scheme handling');

  /* Links must be absolute — a relative href in an inbox goes nowhere.
     CORRECTED 2026-07-26: the first version flagged eight, and all eight were
     href="' + esc(variable) + '" — URLs built at runtime, every one absolute when traced.
     A quote followed by a concatenation is the normal way to write these, not a fault. */
  const rel=[...src.matchAll(/href\s*=\s*\\?['"](?!\s*['"]?\s*\+|https?:|mailto:|#|\{|\$)/g)];
  if(rel.length) r.issues.push(rel.length+' relative link(s) — an inbox has no base URL');

  results.push(r);
});

results.forEach(r=>{
  W('  '+r.f.padEnd(32)+(r.issues.length?(r.issues.length+' issue(s)'):'clean'));
  r.issues.forEach(i=>W('       - '+i));
});

W('');
W('SUMMARY BY PROBLEM');
const tally={};
results.forEach(r=>r.issues.forEach(i=>{
  const k=i.replace(/^\d+ /,'').replace(/\d+px/,'Npx');
  tally[k]=(tally[k]||0)+1;
}));
Object.entries(tally).sort((a,b)=>b[1]-a[1]).forEach(([k,n])=>W('  '+String(n).padStart(3)+'x  '+k));

const total=results.reduce((a,b)=>a+b.issues.length,0);
W('');
W('THE PLAIN-TEXT CONVERTER');
{
  const fnSrc=fs.readFileSync(path.join(DIR,'order-deliver.js'),'utf8');
  const i=fnSrc.indexOf('function plainTextFrom');
  const j=fnSrc.indexOf('\n}', i)+2;
  let plainTextFrom;
  try{ plainTextFrom=eval('('+fnSrc.slice(i,j).replace(/^function /,'function ')+')'); }
  catch(e){ eval(fnSrc.slice(i,j)); }
  const sample='<div style="background:#0A1428"><h1>Your brand is ready</h1>'+
    '<p>Six names &amp; photographs.</p>'+
    '<a href="https://x/workspace.html?r=abc123" style="padding:12px">Open your Command Center</a>'+
    '<p>No sign-in needed.</p></div>';
  const t=plainTextFrom(sample);
  ok('the capsule link survives', t.indexOf('workspace.html?r=abc123')>=0);
  ok('the link keeps its label', t.indexOf('Open your Command Center:')>=0);
  ok('the link sits on its own line', /abc123\s*\n/.test(t), JSON.stringify(t.slice(-60)));
  ok('no markup leaks through', !/<[a-z]/i.test(t));
  ok('no style attributes leak', t.indexOf('padding')<0 && t.indexOf('background')<0);
  ok('entities are decoded', t.indexOf('&amp;')<0 && t.indexOf('&')>=0);
  ok('it is never empty', plainTextFrom('').length>0);
}


W('\nTHE TWO CUSTOMER EMAILS, RENDERED');
{
  const src=fs.readFileSync(path.join(DIR,'send-kit.js'),'utf8');
  process.env.SITE_URL='https://sparkmyname.netlify.app';
  const mod={exports:{}};
  let api=null;
  try{
    new Function('module','exports','process','require',
      src+'\n;module.exports.__t={c:buildConfirmEmail,e:buildEmail};')(mod,mod.exports,process,require);
    api=mod.exports.__t;
  }catch(e){ ok('send-kit loads', false, e.message); }

  if(api){
    /* --- the confirmation, sent the moment payment lands --- */
    const c=api.c('a custom glass blowing studio','https://x/w.html','https://x/s.html');
    ok('confirmation does NOT link to the workspace', c.indexOf('Open my Command Center')<0);
    ok('  because nothing is behind it yet', !/workspace\.html[^"]*"[^>]*>\s*Open/.test(c));
    ok('it echoes the idea back', c.indexOf('custom glass blowing studio')>=0);
    ok('it says where to look if it seems missing', /spam or promotions/.test(c));
    ok('  and how to stop that happening again', /to your contacts/.test(c));
    ok('it gives one clear threshold', /15 minutes/.test(c));
    ok('  and only one', !/few hours/.test(c));
    ok('it links to the support desk', /support\.html/.test(c));

    /* --- the delivery, sent when the brand exists --- */
    const names=[{name:'Emberlight Glass',domain:'e.com',domainAvailable:true,score:94,
                  kit:{headerUrl:'https://sb.co/storage/v1/object/public/brand-headers/x/h.png'}},
                 {name:'Kiln & Co',domain:'k.com',domainAvailable:true,score:88}];
    const d=api.e(names,'https://x/r','https://x/account.html','','a custom glass blowing studio');
    ok('delivery opens with a celebration', /It is here/.test(d));
    ok('  which renders without images or scripts', /linear-gradient/.test(d) && !/<script/.test(d));
    ok('it shows the customer their own words', d.indexOf('a custom glass blowing studio')>=0);
    ok('it includes a photograph', /<img[^>]+brand-headers/.test(d));
    ok('  with alt text for a blocked image', /alt="A first look at Emberlight Glass"/.test(d));
    ok('  and a caption saying where the rest are', /The rest are in your workspace/.test(d));
    ok('it opens the workspace directly', /account\.html|view-report|workspace/.test(d));
    ok('  with no magic link or password', /no password, no login/.test(d));
    ok('it lists what was made', /Brandable business names/.test(d) && /Colou?r palette/.test(d));
    ok('it offers the support desk', /support\.html/.test(d));

    /* --- a missing photo must not break the email --- */
    const noPhoto=api.e([{name:'X',domain:'x.com',score:1}],'https://x/r','https://x/a.html','','an idea');
    ok('a missing photograph is simply absent', noPhoto.indexOf('<img')<0 || !/brand-headers/.test(noPhoto));
    ok('  and the email still builds', noPhoto.length>500);
    const noSeed=api.e(names,'https://x/r','https://x/a.html','','');
    ok('a missing idea is simply absent', noSeed.indexOf('You told us')<0);
    ok('  and the email still builds', noSeed.length>500);
  }

  /* --- the founder's standing mark policy --- */
  /* MARK POLICY REVERSED 2026-07-26 by Founder order. This enforced the 9 July rule of no
     mark anywhere. The rule now runs the other way: the wordmark and the copyright line
     carry the trademark mark. A registered symbol is still wrong — the mark is not
     registered, and claiming otherwise would be a false statement. */
  ok('the email wordmark carries the mark', /Name<span[^>]*>&trade;/.test(src));
  ok('the copyright line carries it', /2026 SparkMyName&trade;|2026 SparkMyName\\u2122/.test(src));
  ok('no registered symbol is claimed', !/&reg;|\\u00AE/.test(src));
}

W('');
W('  emails checked: '+results.length+'   total issues: '+total);
W('  checks passed : '+pass+(fail?('   FAILED: '+fail):''));
W('');
W('  NOTE: this reads the source, not a rendered inbox. It catches techniques known to break');
W('  in Outlook, Gmail and Apple Mail. It cannot tell you how an email LOOKS — that needs a');
W('  real client, and that is your side.');
process.exit(fail===0?0:1);
