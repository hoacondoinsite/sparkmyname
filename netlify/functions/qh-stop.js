// qh-stop.js — founder stop: mark a job 'stopped' so the tick chain halts at the next pass.
const L = require('./qh-lib.js');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  let job_id = ''; try { job_id = (JSON.parse(event.body || '{}').job_id || '').trim(); } catch (e) {}
  if (!job_id) return resp(400, { ok: false, error: 'no_job_id' });
  try { await L.sbUpdate('qh_jobs', 'id=eq.' + job_id, { status: 'stopped', updated_at: new Date().toISOString() }); return resp(200, { ok: true }); }
  catch (e) { return resp(500, { ok: false, error: String(e && e.message || e) }); }
};
function resp(c, o) { return { statusCode: c, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
