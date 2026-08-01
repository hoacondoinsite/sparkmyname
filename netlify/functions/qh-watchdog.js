// qh-watchdog.js — resume any 'running' job whose last pass is older than ~60s (a dropped chain).
// Call it manually, or schedule it later. It only nudges stalled jobs; active chains are left alone.
const L = require('./qh-lib.js');
exports.handler = async () => {
  try {
    const cutoff = new Date(Date.now() - 60000).toISOString();
    const stalled = await L.sbSelect('qh_jobs', 'status=eq.running&updated_at=lt.' + encodeURIComponent(cutoff) + '&select=id&limit=20');
    for (const j of stalled) await L.fireForget('qh-tick-background', { job_id: j.id });
    return resp(200, { ok: true, resumed: stalled.length });
  } catch (e) { return resp(500, { ok: false, error: String(e && e.message || e) }); }
};
function resp(c, o) { return { statusCode: c, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
