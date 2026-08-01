// SparkMyName — DOWNLOAD EVENT AUDIT LOG (NEW FILE, Founder order 2026-07-05)
// Every download attempt logs: who, what, when, under which acceptance, allowed or blocked.
'use strict';
const { dbInsert } = require('./os-db.js');
exports.handler = async (event) => {
  let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  const email = String(b.email || '').trim().slice(0, 160).toLowerCase();
  if (!email) return { statusCode: 200, body: '{"ok":false}' };
  const h = event.headers || {};
  await dbInsert('smn_download_log', [{
    id: crypto.randomUUID(),
    email, asset: String(b.asset || 'unknown').slice(0, 200), section: String(b.section || '').slice(0, 80),
    ack_id: b.ack_id || null, allowed: b.allowed === true,
    user_agent: (h['user-agent'] || '').slice(0, 300),
    at: new Date().toISOString(),
    ip: (h['x-nf-client-connection-ip'] || h['x-forwarded-for'] || '').split(',')[0].trim().slice(0, 60),
  }]);
  return { statusCode: 200, body: '{"ok":true}' };
};
