// qh-start.js — create a harvesting job + four lane records, then kick the first background tick.
// Founder test calls this now; production checkout will call it later (Phase 2). Live flow untouched.
const L = require('./qh-lib.js');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!L.SB_URL || !L.SB_KEY) return resp(500, { ok: false, error: 'missing_supabase_env' });
  let seed = '', email = '', target = L.DEFAULT_TARGET;
  try { const b = JSON.parse(event.body || '{}'); seed = (b.seed || '').trim().slice(0, 300); email = (b.email || '').trim().slice(0, 160); target = Math.max(3, Math.min(25, parseInt(b.target, 10) || L.DEFAULT_TARGET)); } catch (e) {}
  if (!seed) return resp(400, { ok: false, error: 'no_seed' });
  try {
    const job = (await L.sbInsert('qh_jobs', { seed, email, status: 'running', target_per_lane: target }))[0];
    await L.sbInsert('qh_lanes', L.LANES.map(lane => ({ job_id: job.id, lane, target, tier: 5, no_progress: 0, passes: 0, complete: false })));
    L.fireForget('qh-tick-background', { job_id: job.id });   // start the resumable chain
    return resp(200, { ok: true, job_id: job.id, target });
  } catch (e) { return resp(500, { ok: false, error: String(e && e.message || e) }); }
};
function resp(c, o) { return { statusCode: c, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
