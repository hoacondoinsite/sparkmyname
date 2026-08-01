// qh-status.js — live progress for the founder watch page (and later a customer "creating…" screen).
const L = require('./qh-lib.js');
exports.handler = async (event) => {
  let job_id = '';
  try { if (event.httpMethod === 'POST') job_id = (JSON.parse(event.body || '{}').job_id || '').trim(); else job_id = ((event.queryStringParameters || {}).job_id || '').trim(); } catch (e) {}
  if (!job_id) return resp(400, { ok: false, error: 'no_job_id' });
  try {
    const job = (await L.sbSelect('qh_jobs', 'id=eq.' + job_id + '&select=*'))[0];
    if (!job) return resp(404, { ok: false, error: 'job_not_found' });
    const lanes = await L.sbSelect('qh_lanes', 'job_id=eq.' + job_id + '&select=*');
    const concepts = await L.sbSelect('qh_concepts', 'job_id=eq.' + job_id + '&select=lane,name,domain,score,accepted,passed,safe,review,reason,safety_reason&order=score.desc.nullslast');
    const out = L.LANES.map(ln => {
      const lane = lanes.find(l => l.lane === ln) || { tier: 5, target: job.target_per_lane, complete: false, passes: 0, no_progress: 0 };
      const accepted = concepts.filter(c => c.lane === ln && c.accepted === true && Number(c.score) >= lane.tier).sort((a, b) => b.score - a.score);
      const rejected = concepts.filter(c => c.lane === ln && c.accepted !== true);
      return { lane: ln, label: L.LANE_LABEL[ln], tier: lane.tier, target: lane.target, passes: lane.passes, no_progress: lane.no_progress || 0, complete: lane.complete, filled: accepted.length, accepted, rejected };
    });
    return resp(200, { ok: true, job: { id: job.id, seed: job.seed, status: job.status, target: job.target_per_lane }, lanes: out });
  } catch (e) { return resp(500, { ok: false, error: String(e && e.message || e) }); }
};
function resp(c, o) { return { statusCode: c, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
