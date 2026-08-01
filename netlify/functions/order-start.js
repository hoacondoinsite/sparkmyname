// order-start.js — creates a JOB on the Order Board (Agency OS). Founder/QA gated.
// DARK unless SMN_ASSEMBLY='shadow'|'on'; ALWAYS requires ORDER_START_KEY.
// Never wired to payment in this build: cutover (Phase D) is a separate Founder GO.
var B = require('./order-board.js');
var M = require('./order-manifests.js');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };
  if (!B.isLive()) return { statusCode: 200, body: JSON.stringify({ dark: true }) };
  var body = {}; try { body = JSON.parse(event.body || '{}'); } catch (e) {}
  if (!B.authOk(body)) return { statusCode: 403, body: 'no' };
  var seed = String(body.seed || '').slice(0, 600).trim();
  var email = String(body.email || '').slice(0, 160).trim();
  var tier = String(body.tier || 't1');
  if (!seed || !email) return { statusCode: 400, body: 'seed+email required' };
  var jid = 'ord' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  var job = { id: jid, seed: seed, email: email, tier: tier, status: 'open', qa: body.qa !== false,
    cost_cents: 0, budget_cents: parseInt(process.env.ORDER_BUDGET_CENTS || '200', 10),
    manifests: M.TIERS[tier] || M.TIERS.t1, flags: [], created_at: new Date().toISOString() };
  var tasks = M.buildTasks(jid, tier);
  await B.createJob(job, tasks);
  // kick the first crumb
  if (String(process.env.ORDER_CHAIN || 'on') !== 'off') {
    try { fetch(B.BASE + '/.netlify/functions/order-foreman-background', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: body.key }) }); } catch (e) {}
  }
  return { statusCode: 200, body: JSON.stringify({ ok: true, job: jid, tasks: tasks.length }) };
};
