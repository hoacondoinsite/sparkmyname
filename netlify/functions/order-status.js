// SparkMyName Agency OS — INSTANT STATUS (NEW FILE, Phase B)
// Feeds your workspace's living card: "Names ✓ · Words in the kitchen…" — honest stages, no machinery.
'use strict';
const { dbSelect, dbInsert, dbUpdate } = require('./os-db.js');
const LABELS = { names: 'Finding your names', judge: 'Checking quality & domains', copy_kit: 'Writing your words',
  image_main: 'Creating your brand image', image_support: 'One more image', print_basics: 'Print pieces', assemble: 'Composing your workspace' };

exports.handler = async (event) => {
  const q = (event.queryStringParameters || {});
  const filt = q.job ? ('id=eq.' + q.job) : ('email=eq.' + encodeURIComponent(q.email || ''));
  const jobs = await dbSelect('smn_jobs', filt + '&select=id,status,stage,tier,created_at&order=created_at.desc&limit=1');
  const job = jobs && jobs[0];
  if (!job) return { statusCode: 200, body: JSON.stringify({ ok: true, none: true }) };
  const tasks = await dbSelect('smn_tasks', 'job_id=eq.' + job.id + '&select=key,status');
  const done = (tasks || []).filter(t => t.status === 'done').map(t => t.key);
  // SELF-HEALING (2026-07-05): a status check on a job with open tasks wakes the Foreman.
  if ((tasks || []).some(t => t.status === 'pending' || t.status === 'running')) {
    try { await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/order-foreman-background', { method: 'POST', body: '{}' }); } catch (_) {}
  }
  const current = (tasks || []).find(t => t.status === 'running' || t.status === 'pending');
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
    ok: true, status: job.status, stage: job.stage,
    line: job.status === 'done' ? 'Your brand is ready.' : (current ? (LABELS[current.key] || 'Working') + '\u2026' : 'Finishing up\u2026'),
    done, total: (tasks || []).length,
  }) };
};
