const fs=require('fs');
const src=fs.readFileSync('/home/claude/site/js/workspace-core.js','utf8');
const css=fs.readFileSync('/home/claude/site/workspace.html','utf8');
let fail=0;const ok=(n,c)=>{console.log((c?'PASS  ':'FAIL  ')+n);if(!c)fail++;};

const map=src.match(/var f=\{([^}]*)\}\[k\]/);
ok('aiAction maps every tool', !!map);
['assistant','content','logo','names','market','health','voice','image'].forEach(k=>
  ok('  tool mapped: '+k, !!map && map[1].includes(k+':')));
['wToolAssistant','wToolContent','toolLogo','wToolNames','wToolMarket','wToolHealth','wToolVoice','toolImage']
  .forEach(f=>ok('  handler exists: '+f, src.includes('function '+f+'(')));

ok('opens in the in-page panel, not a modal', src.includes("var ov=document.getElementById('acctOv')"));
ok('sets its own section', src.includes("ACCT.sec='aitool'"));
ok('hides the brand column while open', /aiOpen[\s\S]{0,1200}m\.style\.display='none'/.test(src));
ok('has a way back to the tool list', src.includes('data-aitoolback'));
ok('falls back to the modal if the panel is missing', /panel missing/.test(src));
ok('AI Studio opens the same page', src.includes("function openAIStudio(){ try{ return openAccount('ai'); }"));
ok('title never renders undefined', src.includes("aitool:'AI tool'"));
ok('returning to the list works from inside a tool', src.includes("if(sec==='ai' && ACCT.sec==='aitool')"));
ok('tools reach the real LLM bridge', src.includes('window.smnLLM=function'));
ok('bridge points at a function that exists', src.includes('/.netlify/functions/ai-assist') && fs.existsSync('/home/claude/site/netlify/functions/ai-assist.js'));

ok('account headings on the head token', css.includes('.acp-h{font-size:var(--t-head)'));
ok('account body on the body token', css.includes('.ac-sec{font-size:var(--t-body)'));
ok('account rows use the card surface', css.includes('.ac-row{border:1px solid var(--line);background:#0D1B38'));
ok('AI cards use the card surface', css.includes('.ac-ai .aicard{border:1px solid var(--line);background:#0D1B38'));
ok('tool body gets the full column', css.includes('.aitoolbody{max-width:1100px}'));
ok('chat area full height, not a small box', css.includes('.aitoolbody .aichat{min-height:320px!important'));
console.log(fail===0?'\nAI TOOLS CLEAN':'\n'+fail+' FAILED');process.exit(fail?1:0);
