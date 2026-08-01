// Test harness for render-judged.js — run with: node tools/test-render-judged.js
// This is the only loop in the identity pipeline that spends money repeatedly, so every
// stopping condition is tested. No network: render and judge are both injected stubs.
'use strict';

const path = require('path');
const { renderBestOf } = require(path.join(__dirname, '..', 'netlify', 'functions', 'render-judged.js'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? ('  -> ' + JSON.stringify(extra)) : '')); }
}
function section(t) { console.log('\n' + t); }

const img = (tag) => ({ ok: true, b64: 'B64' + tag, mime: 'image/png', costEst: 0.134 });
const PASS = (total) => ({ pass: true,  total: total, verdict: 'pass', failed_gates: [], defects: [] });
const REJ  = (total, gate) => ({ pass: false, total: total, verdict: 'hard_reject',
                                 failed_gates: [gate], defects: ['remove the frame'] });
const LOW  = (total) => ({ pass: false, total: total, verdict: 'below_floor', failed_gates: [], defects: [] });
const UNK  = () => ({ pass: true, unknown: true, reason: 'timeout', total: null, verdict: 'unknown' });

(async function () {

section('STOPPING EARLY — never pay for work already good');
{
  let renders = 0;
  const r = await renderBestOf({
    attempts: 3,
    render: async () => { renders++; return img(renders); },
    judge:  async () => PASS(90)
  });
  ok('first attempt passing stops the loop', renders === 1, renders);
  ok('reports one attempt used', r.attempts_used === 1, r.attempts_used);
  ok('charges for one render only', r.spent === 0.134, r.spent);
  ok('returns the passing image', r.img.b64 === 'B641', r.img);
}
{
  let renders = 0;
  const r = await renderBestOf({
    attempts: 3,
    render: async () => { renders++; return img(renders); },
    judge:  async () => UNK()
  });
  ok('an unknown verdict also stops the loop', renders === 1, renders);
  ok('unknown ships the art', r.img.b64 === 'B641' && r.verdict.unknown === true, r.verdict);
}

section('RETRY AND SELECTION');
{
  let renders = 0; const seen = [];
  const r = await renderBestOf({
    attempts: 3,
    render: async (correction) => { renders++; seen.push(correction); return img(renders); },
    judge:  async () => { return renders === 1 ? REJ(70, 'has_container') : PASS(88); }
  });
  ok('a reject triggers a second render', renders === 2, renders);
  ok('first attempt gets no correction', seen[0] === '', seen[0]);
  ok('second attempt is told what was wrong', /Remove the ring, shield, badge/.test(seen[1]), seen[1]);
  ok('the passing second attempt is returned', r.img.b64 === 'B642', r.img);
  ok('charges for two renders', r.spent === 0.268, r.spent);
}
{
  let renders = 0;
  const scores = [64, 91, 55];
  const r = await renderBestOf({
    attempts: 3,
    render: async () => { renders++; return img(renders); },
    judge:  async () => { const s = scores[renders - 1]; return s >= 82 ? PASS(s) : LOW(s); }
  });
  ok('stops as soon as one clears the floor', renders === 2, renders);
  ok('keeps the attempt that cleared it', r.img.b64 === 'B642' && r.verdict.total === 91, r.verdict);
}
{
  let renders = 0;
  const scores = [58, 74, 66];
  const r = await renderBestOf({
    attempts: 3,
    render: async () => { renders++; return img(renders); },
    judge:  async () => LOW(scores[renders - 1])
  });
  ok('exhausts all attempts when nothing passes', renders === 3, renders);
  ok('ships the HIGHEST scoring attempt, not the last', r.img.b64 === 'B642', r.img);
  ok('reports the winning score', r.verdict.total === 74, r.verdict);
  ok('charges for all three', r.spent === 0.402, r.spent);
}

section('FAILURE HANDLING');
{
  let renders = 0;
  const r = await renderBestOf({
    attempts: 3,
    render: async () => { renders++; return renders === 1 ? null : img(renders); },
    judge:  async () => PASS(90)
  });
  ok('a failed render does not end the loop', renders === 2, renders);
  ok('returns the attempt that did render', r.img.b64 === 'B642', r.img);
  ok('a failed render costs nothing', r.spent === 0.134, r.spent);
}
{
  const r = await renderBestOf({
    attempts: 2,
    render: async () => null,
    judge:  async () => PASS(90)
  });
  ok('all renders failing returns null', r === null, r);
}
{
  let renders = 0;
  const r = await renderBestOf({
    attempts: 2,
    render: async () => { renders++; throw new Error('engine exploded'); },
    judge:  async () => PASS(90)
  });
  ok('a render that throws is caught', r === null, r);
  ok('and the loop still tried every attempt', renders === 2, renders);
}
{
  const r = await renderBestOf({
    attempts: 1,
    render: async () => img(1),
    judge:  async () => { throw new Error('judge exploded'); }
  });
  ok('a judge that throws does not lose the art', r && r.img.b64 === 'B641', r);
  ok('and is recorded as unknown', r.verdict.unknown === true, r.verdict);
}


section('THE CLOCK — a second attempt must not run us off the ceiling');
{
  // A fake clock so the test is instant and deterministic.
  let t = 0; const clock = () => t;
  let renders = 0;
  const r = await renderBestOf({
    attempts: 3, budgetMs: 55000, now: clock,
    render: async () => { renders++; t += 26000; return img(renders); },   // 26s per render
    judge:  async () => { t += 4000; return LOW(60); }                      // 4s per judgement
  });
  ok('stops before the ceiling instead of being killed', renders === 1, renders);
  ok('ships the one mark it made', r && r.img.b64 === 'B641', r && r.img);
  ok('records why it stopped', r.log.some(e => e.skipped === 'out_of_time'), r.log);
  ok('reports elapsed time', r.elapsed_ms === 30000, r.elapsed_ms);
}
{
  let t = 0; const clock = () => t;
  let renders = 0;
  await renderBestOf({
    attempts: 3, budgetMs: 55000, now: clock,
    render: async () => { renders++; t += 8000; return img(renders); },     // fast renders
    judge:  async () => { t += 2000; return LOW(60); }
  });
  ok('fast renders still get their retries', renders === 3, renders);
}
{
  let t = 0; const clock = () => t;
  let renders = 0;
  const r = await renderBestOf({
    attempts: 4, budgetMs: 40000, now: clock,
    render: async () => { renders++; t += 12000; return img(renders); },
    judge:  async () => { t += 3000; return LOW(50 + renders); }
  });
  ok('a tighter budget allows fewer attempts', renders === 2, renders);
  ok('and still ships the best of them', r.verdict.total === 52, r.verdict);
}
{
  let t = 0; const clock = () => t;
  let renders = 0;
  await renderBestOf({
    attempts: 3, budgetMs: 55000, now: clock,
    render: async () => { renders++; t += 26000; return img(renders); },
    judge:  async () => { t += 4000; return PASS(90); }
  });
  ok('a pass on attempt one is unaffected by the clock', renders === 1, renders);
}

section('BOUNDS');
{
  let renders = 0;
  await renderBestOf({ attempts: 99, render: async () => { renders++; return img(renders); }, judge: async () => LOW(50) });
  ok('attempts are capped at five', renders === 5, renders);
}
{
  let renders = 0;
  await renderBestOf({ attempts: 0, render: async () => { renders++; return img(renders); }, judge: async () => LOW(50) });
  ok('zero attempts is floored to one', renders === 1, renders);
}
{
  const r = await renderBestOf({
    attempts: 2,
    render: async () => ({ ok: true, b64: 'X', mime: 'image/png' }),   // no costEst
    judge:  async () => PASS(90)
  });
  ok('a missing cost estimate does not corrupt the total', r.spent === 0, r.spent);
}

section('AUDIT TRAIL');
{
  const r = await renderBestOf({
    attempts: 3,
    render: async (c, i) => (i === 0 ? null : img(i + 1)),
    judge:  async () => LOW(60)
  });
  ok('log records every attempt', r.log.length === 3, r.log);
  ok('log marks the failed render', r.log[0].rendered === false, r.log[0]);
  ok('log carries verdict and score', r.log[1].total === 60 && r.log[1].verdict === 'below_floor', r.log[1]);
}

console.log('\n' + (fail === 0 ? 'ALL ' + pass + ' CHECKS PASSED' : pass + ' passed, ' + fail + ' FAILED'));
process.exit(fail === 0 ? 0 : 1);
})();
