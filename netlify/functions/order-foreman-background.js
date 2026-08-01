// SparkMyName Agency OS — THE FOREMAN (NEW FILE, Phase B)
// Wakes, takes exactly ONE pending task, finishes it in seconds, records the artifact,
// chains the next tick, exits. No invocation ever carries more than one crumb.
// Locked departments are called over HTTP exactly like the live baton. 24s guard per call.
'use strict';
const { manifestFor } = require('./os-manifests.js');

const { dbSelect, dbInsert, dbUpdate, dbClaim } = require('./os-db.js');
const gov = require('./governor-brief.js');            // SOP-BG-001: the brain (switched)
const gate = require('./governor-gate.js');            // SOP-BG-001: the gate (switched)
const foresight = require('./smn-foresight.js');       // Appendix C: predict before send
const ladder = require('./smn-ladder.js');             // Appendix A: the degradation ladder
const BASE = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, ''); // RUNTIME BASE FIX 2026-07-05
const CALL_MS = 24000;

async function callFn(name, payload) { // one external call, 24s-guarded — the proven pattern
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), CALL_MS);
  try {
    const r = await fetch(BASE + '/.netlify/functions/' + name, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: ctl.signal,
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, data: j };
  } finally { clearTimeout(t); }
}

// Department registry — every dept resolves to a call against LOCKED functions or code-only work.
const DEPTS = {
  governor: async (job) => {
    // SOP-BG-001 Phase 1 — one AI call, seven objects, fallback brief; NEVER stalls an order.
    const r = await gov.runGovernor(job.seed, '');
    return { brief: (r && r.brief) || null, fallback: !!(r && r.fallback) };
  },
  naming: async (job) => {
    // Real clean-names contract: {seed, count(<=8), avoid[]} -> {names:[{name,domain,domainAvailable,why,lane}]}
    // DEFAULT (SMN_HARVEST off): up to TWO waves of 8 — byte-identical to the live system.
    // WAVE HARVEST (SMN_HARVEST=on, SOP-BG-001 Phase 2 + Appendix E): parallel back-road
    // lanes with lane specialization, foresight-sized asks, ladder-caught misses, and
    // converge-dedupe at the Holding Room. The engine stays LOCKED — dispatch only changes.
    const HARVEST = String(process.env.SMN_HARVEST || '').toLowerCase() === 'on';
    let pool = [];
    const seen = {};
    const take = (got) => { (got || []).forEach(n => { const k = n && n.name && String(n.name).toLowerCase(); if (k && !seen[k]) { seen[k] = 1; pool.push(n); } }); };
    if (!HARVEST) {
      // FULL DEPTH (Founder order, 2026-07-05 evening): the board's default path now runs
      // the baton's exact generation machinery — four style lanes, category-weighted
      // targets, wave after wave. The thin two-call path that shipped this afternoon
      // silently replaced the proven pipeline; that ends here.
      const depth = require('./smn-naming-depth.js');
      const gp = await depth.generatePool({ seed: job.seed, budgetMs: 420000,
        callFn: async (name, payload) => { const r = await callFn(name, payload); return r.data || {}; } });
      take(gp.pool);
    } else {
      const TARGET = Math.max(6, parseInt(process.env.SMN_POOL_TARGET || '48', 10));
      const CAP    = Math.max(1, parseInt(process.env.SMN_WAVE_CAP || '8', 10));       // global wave cap
      const LANES  = Math.max(1, Math.min(6, parseInt(process.env.SMN_NAME_LANES || '4', 10)));
      const DIRECTIVES = ['professional', 'standard', 'human', 'clever'];               // lane specialization (H2)
      let waves = 0;
      while (pool.length < TARGET && waves < CAP) {
        const burst = Math.min(LANES, CAP - waves);
        const lanes = [];
        for (let L = 0; L < burst; L++) {
          const lane = DIRECTIVES[(waves + L) % DIRECTIVES.length];
          lanes.push((async () => {
            const ask = await foresight.rightSize('engine', 'clean-names', 8);          // F4: right-size BEFORE sending
            const run = await ladder.ladderCall({ dept: 'engine', model: 'clean-names', rungs: [8, 5, 3, 2, 1], startAt: ask },
              async (count, signal) => {
                const ctl = { signal };
                const r = await fetch(BASE + '/.netlify/functions/clean-names', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ seed: job.seed, count, avoid: pool.map(n => n.name), lanes: [lane] }), signal });
                const j = await r.json().catch(() => ({}));
                if (!r.ok || !(j && j.names && j.names.length)) throw new Error('empty wave');
                return j.names;
              });
            return run.ok ? run.result : [];
          })());
        }
        (await Promise.all(lanes)).forEach(take);                                       // H3: converge-dedupe, first arrival wins
        waves += burst;
      }
    }
    if (!pool.length) throw new Error('naming: empty wave');
    return { names: pool };
  },
  judge: async (job, inputs) => {
    // Real judge contract: {seed, names:[strings]} -> {ok, scores:[{...per-name numeric fields}]}
    // Batches of <=20 through the LOCKED judge (harvest pools exceed one batch); scores
    // merge positionally per batch — identical behavior to today when the pool is <=20.
    const names = (inputs.names && inputs.names.names || []).slice(0, 200);
    const scores = [];
    for (let off = 0; off < names.length; off += 20) {
      const chunk = names.slice(off, off + 20);
      const r = await callFn('judge-names', { seed: job.seed, names: chunk.map(n => n.name) });
      const got = (r.data && r.data.scores) || [];
      for (let i = 0; i < chunk.length; i++) scores.push(got[i] || {});
    }
    const merged = names.map((n, i) => {
      const s = scores[i] || {};
      const nums = Object.keys(s).map(k => s[k]).filter(v => typeof v === 'number');
      const overall = typeof s.overall === 'number' ? s.overall
        : typeof s.score === 'number' ? s.score
        : nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      return Object.assign({}, n, { judge: overall, judgeInfo: s });
    }).sort((a, b) => (b.judge || 0) - (a.judge || 0));
    return { names: merged }; // graceful: empty scores still ships judged=0 order
  },
  gate: async (job, inputs) => {
    // SOP-BG-001 Phase 2 — the Selection Gate: psychology review of the judged pool.
    // Kill-reasons ledgered on this artifact; Six-Names floor backfills, flagged.
    const judged = (inputs.judge && inputs.judge.names) || [];
    const brief = (inputs.governor && inputs.governor.brief) || null;
    if (!brief) return { names: judged, killed: [], gated: false, note: 'no brief — judge order stands' };
    return await gate.gateReview({ seed: job.seed, brief, names: judged });
  },
  copy: async (job, inputs) => {
    // Prefers the Gate's survivors when the gate task ran; judge order otherwise (parity).
    const names = (inputs.gate && inputs.gate.names) || (inputs.judge && inputs.judge.names) || [];
    const lead = names[0];
    if (!lead) throw new Error('copy: no lead name');
    const r = await callFn('build-kit', { seed: job.seed, name: lead.name, domain: lead.domain });
    return { lead: lead.name, kit: (r.data && (r.data.kit || r.data)) || {} };
  },
  design: async () => ({ skipped: 'SMN_PRINT_BASICS phase-A boards pending' }), // Phase A GO wires real boards
  assembler: async (job) => { // hands off to the Assembler function (single responsibility)
    const r = await callFn('order-assemble', { job_id: job.id });
    if (!r.ok || !(r.data && r.data.ok)) throw new Error('assemble failed: ' + JSON.stringify(r.data));
    return { assembled: true };
  },
};

exports.handler = async () => {
  const nowIso = new Date().toISOString();
  // ONE task: oldest runnable pending
  const tasks = await dbSelect('smn_tasks', 'status=eq.pending&not_before=lte.' + encodeURIComponent(nowIso) + '&order=created_at.asc&limit=1');
  const task = tasks && tasks[0];
  if (!task) return { statusCode: 200, body: JSON.stringify({ ok: true, idle: true }) };

  const jobs = await dbSelect('smn_jobs', 'id=eq.' + task.job_id + '&limit=1');
  const job = jobs && jobs[0];
  if (!job) { await dbUpdate('smn_tasks', 'id=eq.' + task.id, { status: 'failed', last_error: 'orphan task' }); return { statusCode: 200, body: '{"ok":true}' }; }

  // ATOMIC CLAIM (2026-07-05): only proceed if WE flipped it pending->running. A parallel
  // tick that lost the race exits quietly — no task ever runs twice.
  const claimed = await dbClaim('smn_tasks', 'id=eq.' + task.id + '&status=eq.pending', { status: 'running', updated_at: nowIso });
  if (!claimed.length) return { statusCode: 200, body: JSON.stringify({ ok: true, lost_race: task.key }) };
  try {
    // prior artifacts as inputs (URLs/keys and small JSON — never blobs through the baton)
    const done = await dbSelect('smn_tasks', 'job_id=eq.' + job.id + '&status=eq.done&select=key,artifact');
    const inputs = {}; (done || []).forEach(t => { inputs[t.key] = t.artifact; });
    const dept = DEPTS[task.dept];
    if (!dept) throw new Error('unknown dept ' + task.dept);
    const artifact = await dept(job, inputs, task);
    await dbUpdate('smn_tasks', 'id=eq.' + task.id, { status: 'done', artifact: artifact, updated_at: new Date().toISOString(), last_error: null });
    if (task.key !== 'assemble') await dbUpdate('smn_jobs', 'id=eq.' + job.id, { updated_at: new Date().toISOString(), stage: task.key }); // assembler owns the final 'delivered' stage
  } catch (e) {
    const attempts = (task.attempts || 0) + 1;
    const backoffMin = Math.min(10, attempts * 2);
    const patch = attempts >= 3 && !task.required
      ? { status: 'failed', attempts, last_error: String(e.message || e) }                 // optional task: fail WITHOUT blocking the order
      : { status: attempts >= 5 ? 'failed' : 'pending', attempts, last_error: String(e.message || e),
          not_before: new Date(Date.now() + backoffMin * 60000).toISOString() };
    await dbUpdate('smn_tasks', 'id=eq.' + task.id, patch);
  }
  // chain the next tick — the tick chain, not the tick, carries the order
  try { await fetch(BASE + '/.netlify/functions/order-foreman-background', { method: 'POST', body: '{}' }); } catch (_) {} // AWAITED: the chain must leave the building before we return (QA defect, 2026-07-05)
  return { statusCode: 200, body: JSON.stringify({ ok: true, ran: task.key }) };
};
