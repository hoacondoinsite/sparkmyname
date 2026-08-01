// SparkMyName Agency OS — ORDER OPEN (NEW FILE, Phase B)
// One paid order -> one job row + its manifest tasks. Kicks the Foreman. That's all it does.
'use strict';
const { activeTasks } = require('./os-manifests.js');
const { dbSelect, dbInsert, dbUpdate } = require('./os-db.js');

exports.handler = async (event) => {
  const b = JSON.parse(event.body || '{}');
  if (!b.email || !b.seed) return { statusCode: 400, body: '{"ok":false,"err":"email+seed required"}' };
  // SELF-MINTED IDs (Founder forensic find, 2026-07-05): the live table lacks an id default,
  // so we send our own UUID + timestamps — the insert now succeeds on ANY table shape.
  const nowIso = new Date().toISOString();
  // CO-48c IDEMPOTENCY (Founder forensic find: six jobs in four minutes from one 2:41 AM order —
  // webhook retries multiplied the intake). Same email+seed within 20 minutes = the SAME order.
  try {
    const since = new Date(Date.now() - 20 * 60000).toISOString();
    const dup = await dbSelect('smn_jobs', 'email=eq.' + encodeURIComponent(b.email) + '&created_at=gt.' + encodeURIComponent(since) + '&select=id,seed,status&order=created_at.asc&limit=5');
    const same = (dup || []).find(j => j.seed === b.seed);
    if (same) { console.log('order-open: duplicate intake absorbed -> existing job ' + same.id); return { statusCode: 200, body: JSON.stringify({ ok: true, job_id: same.id, dedup: true }) }; }
  } catch (e) { console.error('order-open dedupe check failed (proceeding): ' + String(e && e.message || e)); }

  const jobIdNew = crypto.randomUUID();
  const jins = await dbInsert('smn_jobs', [{
    id: jobIdNew, email: b.email, seed: b.seed, tier: b.tier || 'needs_only_v1', status: 'open',
    budget_cents: parseInt(process.env.OS_BUDGET_CENTS || '200', 10),
    created_at: nowIso, updated_at: nowIso,
  }]);
  if (!jins || !jins[0]) {
    // NEVER 500 (2026-07-05): the caller falls through to the proven baton on ok:false;
    // the response carries the PostgREST reason so one log glance ends the mystery.
    const why = (dbInsert.lastError || 'insert rejected');
    console.error('order-open: Board unavailable — ' + why);
    return { statusCode: 200, body: JSON.stringify({ ok: false, err: 'board_unavailable', why: why }) };
  }
  const jobId = jins[0].id;
  const rows = activeTasks(b.tier || 'needs_only_v1').map(t => ({
    id: crypto.randomUUID(), job_id: jobId, key: t.key, dept: t.dept, type: t.type,
    required: !!t.required, status: 'pending', attempts: 0,
    not_before: nowIso, created_at: nowIso, updated_at: nowIso,
  }));
  await dbInsert('smn_tasks', rows);
  try { await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/order-foreman-background', { method: 'POST', body: '{}' }); } catch (_) {} // AWAITED: un-awaited fetches die when the handler returns (QA defect, 2026-07-05)
  return { statusCode: 200, body: JSON.stringify({ ok: true, job: jobId, tasks: rows.length }) };
};
