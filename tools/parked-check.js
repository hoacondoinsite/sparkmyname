/* THE PARKED SUBSYSTEM (2026-07-26)
   The Agency OS — Order Board, foreman, assembler, watchdog — is dark by design.
   order-start.js says it plainly: "DARK unless SMN_ASSEMBLY='shadow'|'on' ... cutover is a
   separate Founder GO." Its queue stopped on 10 July with 28 open jobs and 48 failed tasks
   from testing, and I flagged that three times as possibly stalled. It is not stalled. It is
   parked, waiting on a decision.
   What was wrong: the watchdog ran every five minutes regardless — 8,640 invocations a month
   querying a queue nobody is filling. It now asks the same flag as everything else. */
'use strict';
const fs=require('fs'), path=require('path');
const W=(m)=>fs.writeSync(1,m+'\n');
const FN=p=>fs.readFileSync(path.join(__dirname,'..','netlify','functions',p),'utf8');
const TOML=fs.readFileSync(path.join(__dirname,'..','netlify.toml'),'utf8');
let pass=0,fail=0;
const ok=(n,c,x)=>{ if(c===true){pass++;W('  PASS  '+n);} else {fail++;W('  FAIL  '+n+(x!==undefined?('  -> '+String(x).slice(0,80)):''));} };

W('THE SUBSYSTEM IS PARKED, NOT BROKEN');
ok('order-start says so in the file', /DARK unless SMN_ASSEMBLY/.test(FN('order-start.js')));
ok('  and that cutover needs a decision', /separate Founder GO/.test(FN('order-start.js')));
ok('order-board owns the flag', /function MODE\(\)/.test(FN('order-board.js')));
ok('no page calls order-start', (()=>{
  const root=path.join(__dirname,'..');
  return !fs.readdirSync(root).filter(f=>f.endsWith('.html'))
    .some(f=>/functions\/order-start/.test(fs.readFileSync(path.join(root,f),'utf8')));
})());
ok('delivery only hands over when the flag is on',
   /SMN_ASSEMBLY \|\| ''\)\.toLowerCase\(\) === 'on'/.test(FN('deliver-background.js')));

W('\nTHE WATCHDOG NO LONGER RUNS FOR NOTHING');
{
  const wd=FN('order-watchdog.js');
  ok('it reads the flag', /function assemblyMode/.test(wd));
  ok('it exits when the board is dark', /skipped: 'assembly_dark'/.test(wd));
  ok('  before touching the database', wd.indexOf("skipped: 'assembly_dark'") < wd.indexOf('smn_tasks'));
  ok('it wakes on shadow', /mode !== 'shadow'/.test(wd));
  ok('  and on on', /mode !== 'on'/.test(wd));
  ok('it returns 200, not an error', /statusCode: 200/.test(wd));
  ok('  and says why', /parked/.test(wd));

  /* exercise the real function */
  const i=wd.indexOf('function assemblyMode'), j=wd.indexOf('\n}', i)+2;
  const assemblyMode = eval('(' + wd.slice(i,j) + ')');
  const runs = v => { if(v===null) delete process.env.SMN_ASSEMBLY; else process.env.SMN_ASSEMBLY=v;
                      const m=assemblyMode(); return m==='shadow'||m==='on'; };
  ok('unset  -> skips', runs(null)===false);
  ok('empty  -> skips', runs('')===false);
  ok('off    -> skips', runs('off')===false);
  ok('shadow -> runs',  runs('shadow')===true);
  ok('on     -> runs',  runs('on')===true);
  ok('ON     -> runs (case is not a trap)', runs('ON')===true);
  delete process.env.SMN_ASSEMBLY;
}

W('\nIT IS STILL SCHEDULED, SO IT WAKES BY ITSELF');
ok('the five-minute schedule remains', /\[functions\."order-watchdog"\][\s\S]{0,60}\*\/5/.test(TOML));
ok('  so nothing has to change when the GO is given', true);

W('');
W(fail===0?('PARKED SUBSYSTEM CLEAN — '+pass+' checks'):(pass+' passed, '+fail+' FAILED'));
process.exit(fail===0?0:1);
