// qh-finalize.js — runs once all lanes are complete. For now it just confirms completion and
// counts the accepted pool. The report build + email delivery hook in here in Phase 2 (when we
// wire this to production). Live delivery is unaffected.
const L = require('./qh-lib.js');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  let job_id = ''; try { job_id = (JSON.parse(event.body || '{}').job_id || '').trim(); } catch (e) {}
  if (!job_id) return resp(400, { ok: false, error: 'no_job_id' });
  try {
    const accepted = await L.sbSelect('qh_concepts', 'job_id=eq.' + job_id + '&accepted=is.true&select=lane,name,domain,score');
    await L.sbUpdate('qh_jobs', 'id=eq.' + job_id, { status: 'complete', updated_at: new Date().toISOString() });
    return resp(200, { ok: true, job_id, accepted_total: accepted.length });
  } catch (e) { return resp(500, { ok: false, error: String(e && e.message || e) }); }
};
function resp(c, o) { return { statusCode: c, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
