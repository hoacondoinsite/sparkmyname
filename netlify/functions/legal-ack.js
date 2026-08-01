// SparkMyName — LEGAL ACKNOWLEDGMENT capture + retrieval (NEW FILE, Founder order 2026-07-05)
// POST: records an affirmative, signed, versioned acceptance with request metadata.
// GET ?email=            -> { accepted, version, ack_id }  (minimal, for gating)
// GET ?email=&key=ADMIN  -> full audit record: acceptances + every download (admin retrieval)
'use strict';
const { dbSelect, dbInsert } = require('./os-db.js');
const meta = (event) => ({
  user_agent: ((event.headers || {})['user-agent'] || '').slice(0, 300),
  ip: ((event.headers || {})['x-nf-client-connection-ip'] || (event.headers || {})['x-forwarded-for'] || '').split(',')[0].trim().slice(0, 60),
});
exports.handler = async (event) => {
  const J = (o) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) });
  if (event.httpMethod === 'POST') {
    let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
    const email = String(b.email || '').trim().slice(0, 160).toLowerCase();
    const typed = String(b.typed_name || '').trim().slice(0, 160);
    if (!email || email.indexOf('@') < 1) return J({ ok: false, err: 'email required' });
    if (!typed || typed.length < 2) return J({ ok: false, err: 'typed full name required' });
    if (b.understood !== true) return J({ ok: false, err: 'understanding checkbox required' });
    if (!b.ack_version || !b.ack_hash) return J({ ok: false, err: 'version required' });
    const m = meta(event);
    const rows = await dbInsert('smn_legal_acks', [{
    id: crypto.randomUUID(),
      email, typed_name: typed, ack_version: String(b.ack_version).slice(0, 40),
      ack_hash: String(b.ack_hash).slice(0, 80), understood: true,
      user_agent: m.user_agent, ip: m.ip, accepted_at: new Date().toISOString(),
    }]);
    const id = rows && rows[0] && rows[0].id;
    return J({ ok: !!id, ack_id: id || null });
  }
  const q = event.queryStringParameters || {};
  const email = String(q.email || '').trim().toLowerCase();
  if (!email) return J({ ok: false, err: 'email required' });
  const acks = await dbSelect('smn_legal_acks', 'email=eq.' + encodeURIComponent(email) + '&order=accepted_at.desc&limit=10');
  const latest = acks && acks[0];
  // ADMIN RETRIEVAL — full defensible record, key-protected
  if (q.key && process.env.LEGAL_AUDIT_KEY && q.key === process.env.LEGAL_AUDIT_KEY) {
    const downloads = await dbSelect('smn_download_log', 'email=eq.' + encodeURIComponent(email) + '&order=at.desc&limit=500');
    return J({ ok: true, email, acceptances: acks || [], downloads: downloads || [] });
  }
  return J({ ok: true, accepted: !!latest, version: latest ? latest.ack_version : null, ack_id: latest ? latest.id : null, accepted_at: latest ? latest.accepted_at : null });
};
