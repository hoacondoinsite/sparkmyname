// File: netlify/functions/render-judged.js | Date: 2026-07-27
// BEST OF N — render, judge, correct, repeat. Keep the best.
//
// This is the loop that makes a studio a studio: produce, reject, produce again knowing what
// was wrong. It is deliberately a separate module with its dependencies INJECTED, because it
// is the only part of the identity pipeline that spends money in a loop, and a loop that
// spends money must be testable without spending any.
//
// RULES, in the order they matter:
//   1. A pass stops the loop immediately. Never pay for a fourth take of work already good.
//   2. An UNKNOWN verdict (judge unreachable, timed out, unparseable) is treated as a pass and
//      stops the loop. If the judge is blind, spending more on its opinion is spending blind.
//   3. Each retry is told exactly what was wrong via correctionFrom(), never simply rolled again.
//   4. If nothing passes, the highest-scoring attempt ships. The customer gets the best of what
//      was made, not the last of it.
//   5. A render failure does not end the loop — the next attempt still runs — but if every
//      attempt fails to render, the caller gets null and handles it as a generation failure.
//   6. THE CLOCK OUTRANKS EVERYTHING (2026-07-27). This loop runs inside a synchronous serverless
//      function with a hard execution ceiling. A render takes 23-28s; two renders plus two
//      judgements exceeded the ceiling and the platform killed the invocation before ANY art was
//      saved — no asset, no charge, nothing to show. Verified in production. So a second attempt
//      only starts if there is measurably time for it: the loop times attempt one and refuses to
//      begin another unless that much time plus a margin remains. Shipping a good-enough mark
//      always beats being killed while chasing a better one.
'use strict';

const judgeLib = require('./judge-logo.js');

// JUDGE OFF BY DEFAULT (2026-07-27, Founder order: "strip out the judge entirely").
//
// The reasoning, recorded so a future session does not quietly switch it back on: the elite
// standards belong in the PROMPT, upstream, where they demonstrably work — the photographs and
// the Rand construction language did the heavy lifting long before anything was judged. A
// judging loop standing over the renderer added takes, added minutes, and never once returned
// a verdict on a real image in production. Cost real, benefit theoretical.
//
// The module and its 118 tests are kept intact rather than deleted: dormant code costs nothing
// and the calibration work is sound. Set SMN_JUDGE_ENABLED=1 to bring it back.
const JUDGE_ENABLED = String(process.env.SMN_JUDGE_ENABLED || '0') === '1';

const DEFAULT_ATTEMPTS = Math.max(1, Math.min(5,
  parseInt(process.env.SMN_LOGO_ATTEMPTS || '2', 10)));

// opts:
//   attempts  — how many renders at most (default env SMN_LOGO_ATTEMPTS, capped 1..5)
//   render    — async (correctionText, attemptIndex) -> { ok, b64, mime, costEst } | falsy
//   judge     — async (b64, mime) -> verdict            (defaults to the real judge)
//   name      — business name, passed to the default judge
//   onAttempt — optional async (info) hook for logging
async function renderBestOf(opts) {
  opts = opts || {};
  // A money-spending loop must never spend MORE than it was asked for. `opts.attempts || DEFAULT`
  // turned an explicit 0 into 2, because 0 is falsy — caught by tools/test-render-judged.js.
  // An explicit non-positive number now floors to a single attempt; only an ABSENT value takes
  // the default.
  // With no judge there is nothing to retry AGAINST, so extra takes would be money spent to
  // pick blindly. One pass, straight through — the way the pipeline ran when it was fast.
  //
  // NOTE: the clamp applies only when this module is choosing the judge. A caller that INJECTS
  // one has asked for the loop deliberately and gets it — clamping that too broke ten tests and
  // would have silently disabled retries for any future caller doing its own evaluation.
  const usingRealJudge = JUDGE_ENABLED || typeof opts.judge === 'function';
  const asked = (typeof opts.attempts === 'number') ? (Math.floor(opts.attempts) || 1)
                                                    : DEFAULT_ATTEMPTS;
  const attempts = usingRealJudge ? Math.max(1, Math.min(5, asked)) : 1;
  const doRender = opts.render;
  const doJudge  = opts.judge || (JUDGE_ENABLED
    ? function (b64, mime) { return judgeLib.judge(b64, mime, opts.name || ''); }
    : async function () {
        return { pass: true, unknown: true, reason: 'judge_disabled', total: null, verdict: 'unknown' };
      });

  let best = null;          // { img, verdict, attempt }
  let correction = '';
  let spent = 0;
  let used = 0;
  const log = [];

  // The wall this loop must finish inside. Default 55s leaves room for storage, the kit write
  // and the notification after the loop returns.
  const started = (typeof opts.now === 'function') ? opts.now() : Date.now();
  const budgetMs = typeof opts.budgetMs === 'number' ? opts.budgetMs
                 : parseInt(process.env.SMN_LOGO_BUDGET_MS || '55000', 10);
  const now = (typeof opts.now === 'function') ? opts.now : Date.now;
  let slowestAttempt = 0;

  for (let i = 0; i < attempts; i++) {
    if (i > 0) {
      const elapsed = now() - started;
      const needed = slowestAttempt + 2000;      // the last round took this long; assume the next will
      if (elapsed + needed > budgetMs) {
        log.push({ attempt: used + 1, skipped: 'out_of_time', elapsed: elapsed });
        break;
      }
    }
    const attemptStart = now();
    used = i + 1;
    let img = null;
    try { img = await doRender(correction, i); } catch (e) { img = null; }

    if (!img || !img.ok || !img.b64) {
      slowestAttempt = Math.max(slowestAttempt, now() - attemptStart);
      log.push({ attempt: used, rendered: false });
      if (opts.onAttempt) { try { await opts.onAttempt({ attempt: used, rendered: false }); } catch (e) {} }
      continue;                                  // a failed render is not the end of the loop
    }
    spent += (typeof img.costEst === 'number' ? img.costEst : 0);

    let v = null;
    try { v = await doJudge(img.b64, img.mime || 'image/png'); } catch (e) { v = null; }
    if (!v) v = { pass: true, unknown: true, reason: 'judge_threw', total: null, verdict: 'unknown' };

    slowestAttempt = Math.max(slowestAttempt, now() - attemptStart);
    const entry = { attempt: used, rendered: true, verdict: v.verdict,
                    total: v.total, failed_gates: v.failed_gates || [],
                    ms: now() - attemptStart };
    log.push(entry);
    if (opts.onAttempt) { try { await opts.onAttempt(entry); } catch (e) {} }

    // Rule 4: keep the strongest attempt seen. An unknown verdict has no score, so it only
    // becomes best if nothing scored has been kept yet.
    const score = (typeof v.total === 'number') ? v.total : -1;
    const bestScore = best ? ((typeof best.verdict.total === 'number') ? best.verdict.total : -1) : -Infinity;
    if (!best || score > bestScore) best = { img: img, verdict: v, attempt: used };

    // Rules 1 and 2.
    if (v.pass) break;

    correction = judgeLib.correctionFrom(v);
  }

  if (!best) return null;
  return {
    img: best.img,
    verdict: best.verdict,
    attempt: best.attempt,
    attempts_used: used,
    elapsed_ms: now() - started,
    spent: Math.round(spent * 10000) / 10000,
    log: log
  };
}

module.exports = { renderBestOf: renderBestOf, DEFAULT_ATTEMPTS: DEFAULT_ATTEMPTS };
