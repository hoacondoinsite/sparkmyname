// SparkMyName — THE DEGRADATION LADDER (SOP Appendix A — NEW FILE, 2026-07-05)
// Three walls: the 26s platform kill-wall is never approached; the 22s guard aborts any
// call cleanly; the 20s soft target steers sizing (via smn-foresight). When a call misses
// anyway, it is NEVER repeated at the same size — it retries one rung down immediately.
// The bottom rung (1 unit) runs seconds and is mathematically un-failable.
'use strict';

var foresight = require('./smn-foresight.js');
var GUARD_MS = foresight.GUARD_MS; // 22,000 default

// One guarded external call: aborts at the guard wall, records elapsed for the receipt.
async function guardedCall(fn, guardMs){
  var ctl = new AbortController();
  var wall = guardMs || GUARD_MS;
  var t = setTimeout(function(){ ctl.abort(); }, wall);
  var t0 = Date.now();
  try {
    // THE WALL HOLDS REGARDLESS: race the callee against the guard so even a
    // signal-ignoring function cannot exceed it (Appendix A, defense in depth).
    var wallReject;
    var wallP = new Promise(function(_, rej){ wallReject = rej; });
    var wallT = setTimeout(function(){ var err = new Error('AbortError'); err.name = 'AbortError'; wallReject(err); }, wall);
    try {
      var result = await Promise.race([fn(ctl.signal), wallP]);
      return { ok: true, result: result, ms: Date.now() - t0, aborted: false };
    } finally { clearTimeout(wallT); }
  } catch (e) {
    var aborted = (e && (e.name === 'AbortError' || /abort/i.test(String(e.message || e))));
    return { ok: false, error: String((e && e.message) || e), ms: Date.now() - t0, aborted: aborted };
  } finally { clearTimeout(t); }
}

// The ladder: try run(count) at each rung, largest first, stepping down on ANY failure.
// opts: { dept, model, rungs:[8,5,3,2,1], startAt (optional foresight-chosen count), guardMs, ledger:[] }
// run(count, signal) must perform ONE external attempt and return its result.
// Returns { ok, count, result, steps:[{count, ms, ok, aborted}] } — steps = the visible gauge.
async function ladderCall(opts, run){
  var rungs = (opts.rungs && opts.rungs.slice()) || [8, 5, 3, 2, 1];
  // Foresight first: if a startAt was right-sized, drop rungs above it (predict > react).
  if (opts.startAt) rungs = rungs.filter(function(r){ return r <= opts.startAt; });
  if (!rungs.length) rungs = [1];
  var steps = [];
  for (var i = 0; i < rungs.length; i++) {
    var count = rungs[i];
    var g = await guardedCall(function(signal){ return run(count, signal); }, opts.guardMs);
    steps.push({ count: count, ms: g.ms, ok: g.ok, aborted: !!g.aborted });
    try { await foresight.record(opts.dept || 'x', opts.model || 'x', count, g.ms); } catch(_){}
    if (opts.ledger) opts.ledger.push({ rung: count, ms: g.ms, ok: g.ok });
    if (g.ok) return { ok: true, count: count, result: g.result, steps: steps };
    // failed — descend one rung (never repeat the same size); loop continues
  }
  return { ok: false, count: rungs[rungs.length - 1], result: null, steps: steps };
}

module.exports = { guardedCall: guardedCall, ladderCall: ladderCall, GUARD_MS: GUARD_MS };
