const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const css=fs.readFileSync('/home/claude/site/workspace.html','utf8');
const aa =fs.readFileSync('/home/claude/site/netlify/functions/ai-assist.js','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

// --- THE OUTAGE ---
ok('a failing provider falls through to the next', aa.includes("errs.push('anthropic:"));
ok('openai failure also falls through', aa.includes("errs.push('openai:"));
ok('retired gemini-1.5-flash replaced', !aa.includes("'gemini-1.5-flash'") && aa.includes("'gemini-2.5-flash'"));
const bridge=(src.match(/window\.smnLLM=function[\s\S]{0,1200}?\n\};/)||[''])[0];
ok('AI bridge no longer aborts at 9s', !/,9000\)/.test(bridge) && /,26000\)/.test(bridge));
ok('client surfaces the real error', src.includes("onText(null, msg)"));
ok('tools display the reason, not a fake answer', src.includes("(err?('\\u26a0\\ufe0f '+err)"));

// --- DEAD BUTTONS ---
['billemail','pay','lang'].forEach(a=>ok('now handled: data-acact="'+a+'"', src.includes("a==='"+a+"'")));
ok('billing requests route through support (Resend)', /a==='billemail'[\s\S]{0,300}smnSupportSend/.test(src));

// --- FALSE CONFIRMATION ---
ok('copy honours the promise', src.includes("navigator.clipboard.writeText(txt).then("));
ok('copy has a real fallback', src.includes("document.execCommand&&document.execCommand('copy')"));
ok('copy only claims success when it succeeded', !/writeText\(t\);\}catch\(e\)\{\}toast\('Copied\.'\)/.test(src));
ok('"Get started" actually opens something', src.includes("window.open('/affiliate.html'"));

// --- LAYOUT ---
ok('AI cards four across on desktop', css.includes('@media(min-width:1180px){.ac-ai{grid-template-columns:repeat(4,1fr)}}'));
ok('AI cards bigger', css.includes('.ac-ai .aicard{padding:22px 20px;min-height:190px'));
ok('microphone is large and visible', css.includes('.unimic{width:56px;height:56px'));
ok('microphone shows it is listening', css.includes('.unimic.rec{background:linear-gradient'));
ok('hint invites speaking', src.includes('Type or speak'));
ok('speech recognition is real', /webkitSpeechRecognition|SpeechRecognition/.test(src));
console.log(fail===0?'\nWIRING CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
