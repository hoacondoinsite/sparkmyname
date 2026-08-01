// SparkMyName Agency OS — THE WATCHDOG (NEW FILE, Phase B)
// Re-queues stalled tasks with backoff, enforces budgets, never blocks an order.
'use strict';
const { dbSelect, dbInsert, dbUpdate } = require('./os-db.js');
const STALL_MIN = parseInt(process.env.OS_STALL_MINUTES || '5', 10);

/* THE WATCHDOG NOW RESPECTS THE FLAG THAT PARKS WHAT IT WATCHES (2026-07-26).
   The Agency OS is dark by design — order-start.js says so plainly: "DARK unless
   SMN_ASSEMBLY='shadow'|'on' ... cutover is a separate Founder GO." The queue has been parked
   since 10 July with 28 open jobs and 48 failed tasks from testing, and it is parked, not
   broken. But this ran every five minutes regardless: 288 invocations a day, 8,640 a month,
   querying a queue nobody is filling. order-board.js already owns the flag; asking it is one
   line and keeps a single source of truth. When the Founder gives the GO, this wakes with the
   rest of the system and no code has to change. */
function assemblyMode(){
  try{ return String(process.env.SMN_ASSEMBLY || '').toLowerCase(); }catch(e){ return ''; }
}

exports.handler = async () => {
  const mode = assemblyMode();
  if (mode !== 'shadow' && mode !== 'on') {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, skipped: 'assembly_dark',
        note: 'The Order Board is parked (SMN_ASSEMBLY is not set). Nothing to watch.' }) };
  }

  const stalledBefore = new Date(Date.now() - STALL_MIN * 60000).toISOString();
  // tasks stuck in 'running' past the stall window go back to pending with backoff
  const stalled = await dbSelect('smn_tasks', 'status=eq.running&updated_at=lt.' + encodeURIComponent(stalledBefore) + '&select=id,attempts&limit=20');
  for (const t of (stalled || [])) {
    const attempts = (t.attempts || 0) + 1;
    await dbUpdate('smn_tasks', 'id=eq.' + t.id, {
      status: attempts >= 5 ? 'failed' : 'pending', attempts: attempts,
      not_before: new Date(Date.now() + Math.min(10, attempts * 2) * 60000).toISOString(),
      last_error: 'watchdog: stalled, re-queued',
    });
  }
  // budget caps: jobs over budget get remaining optional tasks failed (graceful degradation)
  const hot = await dbSelect('smn_jobs', 'cost_cents=gt.0&select=id,cost_cents,budget_cents&limit=50');
  for (const j of (hot || [])) {
    if (j.budget_cents && j.cost_cents >= j.budget_cents) {
      await dbUpdate('smn_tasks', 'job_id=eq.' + j.id + '&status=eq.pending&required=eq.false', { status: 'failed', last_error: 'budget cap' });
    }
  }
  // CO-48a: required tasks that failed on a still-open job get ONE more bounded life (attempts<7) — with a loud alarm either way.
  const deadReq = await dbSelect('smn_tasks', "status=eq.failed&required=eq.true&select=id,job_id,key,attempts&limit=20");
  for (const t of (deadReq || [])) {
    const jrows = await dbSelect('smn_jobs', 'id=eq.' + t.job_id + '&select=id,status,email&limit=1');
    const j = jrows && jrows[0];
    if (!j || j.status !== 'open') continue;
    if ((t.attempts || 0) < 7) {
      await dbUpdate('smn_tasks', 'id=eq.' + t.id, { status: 'pending', not_before: new Date().toISOString(), last_error: 'watchdog: failed-required revived' });
      console.error('WATCHDOG ALARM: revived failed required task ' + t.key + ' on job ' + t.job_id + ' (' + (j.email||'') + ')');
    } else {
      console.error('WATCHDOG ALARM: job ' + t.job_id + ' (' + (j.email||'') + ') PARKED — required task ' + t.key + ' exhausted');
      await dbUpdate('smn_jobs', 'id=eq.' + t.job_id, { status: 'parked', updated_at: new Date().toISOString() });
    }
  }
  // CO-48b: jobs stuck in 'assembling' beyond 10 minutes are a crashed claim — reopen and re-poke the composer.
  const staleAsm = new Date(Date.now() - 10 * 60000).toISOString();
  const stuck = await dbSelect('smn_jobs', 'status=eq.assembling&updated_at=lt.' + encodeURIComponent(staleAsm) + '&select=id,email&limit=10');
  for (const j of (stuck || [])) {
    console.error('WATCHDOG ALARM: job ' + j.id + ' (' + (j.email||'') + ') stuck assembling — reopened for a fresh claim');
    await dbUpdate('smn_jobs', 'id=eq.' + j.id, { status: 'open', updated_at: new Date().toISOString() });
    try { await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/order-assemble-background', { method: 'POST', body: JSON.stringify({ job_id: j.id }) }); } catch (_) {}
  }
  // CO-49 (Founder's six-test forensics): OPEN jobs whose work is all finished but whose final
  // assemble poke came too early sit ready-and-unclaimed forever — the composer only ever heard
  // task-completion knocks. The watchdog now knocks for them directly.
  const openJobs = await dbSelect('smn_jobs', "status=eq.open&select=id&order=created_at.desc&limit=15");
  for (const j of (openJobs || [])) {
    const open = await dbSelect('smn_tasks', 'job_id=eq.' + j.id + "&required=eq.true&status=neq.done&select=id&limit=1");
    if (!open || !open.length) {
      console.error('WATCHDOG: job ' + j.id + ' is ready-and-unclaimed — poking the composer');
      try { await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/order-assemble-background', { method: 'POST', body: JSON.stringify({ job_id: j.id }) }); } catch (_) {}
    }
  }
  // wake the foreman in case anything is runnable
  try { await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/order-foreman-background', { method: 'POST', body: '{}' }); } catch (_) {} // AWAITED (QA defect, 2026-07-05)
  return { statusCode: 200, body: JSON.stringify({ ok: true, requeued: (stalled || []).length }) };
};
