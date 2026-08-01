// order-board.js — THE ORDER BOARD (Agency OS conveyor, Phase B core). NOT an endpoint.
// Shared library: Supabase REST access to smn_jobs / smn_tasks, task claiming with
// optimistic locking, idempotent recording, budgets, and the assembler (late-attach
// semantics: core delivers when required crumbs are green; optional crumbs attach late).
// Built 2026-07-01 on Founder GO. Dark unless SMN_ASSEMBLY is 'shadow' or 'on'.
// GENERATOR LOCK honored: this file only CALLS departments over HTTP; it edits nothing.
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var BASE = (process.env.SITE_URL || process.env.URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');

function MODE() { return String(process.env.SMN_ASSEMBLY || '').toLowerCase(); } // '' | 'shadow' | 'on'
function isLive() { var m = MODE(); return m === 'shadow' || m === 'on'; }
function authOk(body) {
  var k = process.env.ORDER_START_KEY || '';
  return !!k && body && body.key === k; // no key configured = nothing runs (dark by construction)
}

function H(extra) { var o = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
async function sb(method, path, body, extra) {
  var r = await fetch(SB_URL + '/rest/v1/' + path, { method: method, headers: H(extra), body: body ? JSON.stringify(body) : undefined });
  var t = await r.text(); var d = null; try { d = JSON.parse(t); } catch (e) {}
  if (!r.ok) throw new Error(method + ' ' + path.split('?')[0] + ' ' + r.status + ' ' + t.slice(0, 180));
  return d;
}
async function postFn(fn, body) {
  var r = await fetch(BASE + '/.netlify/functions/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  var d = {}; try { d = await r.json(); } catch (e) {}
  return d;
}

// ---- jobs ----
async function createJob(job, tasks) {
  await sb('POST', 'smn_jobs', [job], { Prefer: 'return=minimal' });
  // insert tasks in chunks to stay tiny
  for (var i = 0; i < tasks.length; i += 20) await sb('POST', 'smn_tasks', tasks.slice(i, i + 20), { Prefer: 'return=minimal' });
  return job.id;
}
async function getJob(jid) { var r = await sb('GET', 'smn_jobs?id=eq.' + encodeURIComponent(jid) + '&limit=1'); return r && r[0]; }
async function patchJob(jid, patch) { await sb('PATCH', 'smn_jobs?id=eq.' + encodeURIComponent(jid), patch, { Prefer: 'return=minimal' }); }
async function jobTasks(jid) { return await sb('GET', 'smn_tasks?job_id=eq.' + encodeURIComponent(jid) + '&order=id.asc&limit=200'); }

// ---- claiming: optimistic lock via conditional PATCH (only wins if still pending) ----
async function claimNext() {
  var nowIso = new Date().toISOString();
  var cands = await sb('GET', 'smn_tasks?status=eq.pending&not_before=lte.' + encodeURIComponent(nowIso) + '&order=id.asc&limit=5');
  for (var i = 0; i < (cands || []).length; i++) {
    var t = cands[i];
    var job = await getJob(t.job_id);
    if (!job || job.status === 'attention' || job.status === 'closed') continue;
    var won = await sb('PATCH', 'smn_tasks?id=eq.' + encodeURIComponent(t.id) + '&status=eq.pending',
      { status: 'running', started_at: nowIso }, { Prefer: 'return=representation' });
    if (won && won.length) { won[0]._job = job; return won[0]; }
  }
  return null;
}

// ---- idempotent recording ----
async function recordDone(task, artifact, costCents) {
  await sb('PATCH', 'smn_tasks?id=eq.' + encodeURIComponent(task.id), { status: 'done', artifact: artifact || {}, last_error: null }, { Prefer: 'return=minimal' });
  if (costCents) {
    var j = await getJob(task.job_id);
    await patchJob(task.job_id, { cost_cents: (j.cost_cents || 0) + costCents });
  }
}
async function recordFail(task, err) {
  var attempts = (task.attempts || 0) + 1;
  var MAXA = parseInt(process.env.ORDER_MAX_ATTEMPTS || '3', 10);
  if (attempts >= MAXA) {
    var terminal = task.optional ? 'skipped' : 'failed';
    await sb('PATCH', 'smn_tasks?id=eq.' + encodeURIComponent(task.id), { status: terminal, attempts: attempts, last_error: String(err).slice(0, 300) }, { Prefer: 'return=minimal' });
    return terminal;
  }
  var backoffMs = 15000 * Math.pow(2, attempts); // 30s, 60s, ...
  await sb('PATCH', 'smn_tasks?id=eq.' + encodeURIComponent(task.id), { status: 'pending', attempts: attempts, not_before: new Date(Date.now() + backoffMs).toISOString(), last_error: String(err).slice(0, 300) }, { Prefer: 'return=minimal' });
  return 'retry';
}

// ---- assembler: late-attach semantics (validated 2026-07-01, test T3 fix) ----
async function assemble(jid) {
  var job = await getJob(jid); if (!job) return { ok: false };
  var ts = await jobTasks(jid);
  var required = ts.filter(function (t) { return !t.optional; });
  var reqDone = required.every(function (t) { return t.status === 'done'; });
  var reqFailed = required.some(function (t) { return t.status === 'failed'; });
  var flags = ts.filter(function (t) { return t.optional && t.status === 'skipped'; }).map(function (t) { return t.dept + ':' + t.type; });
  if (reqFailed && job.status !== 'attention') { await patchJob(jid, { status: 'attention', flags: flags }); return { ok: false, status: 'attention' }; }
  if (reqDone && job.status === 'open') { await patchJob(jid, { status: 'delivered', flags: flags }); return { ok: true, status: 'delivered', flags: flags }; }
  if (job.status === 'delivered') { await patchJob(jid, { flags: flags }); } // keep late-attach flags fresh
  return { ok: job.status === 'delivered', status: job.status };
}

module.exports = { MODE: MODE, isLive: isLive, authOk: authOk, BASE: BASE, postFn: postFn, sb: sb,
  createJob: createJob, getJob: getJob, patchJob: patchJob, jobTasks: jobTasks,
  claimNext: claimNext, recordDone: recordDone, recordFail: recordFail, assemble: assemble };
