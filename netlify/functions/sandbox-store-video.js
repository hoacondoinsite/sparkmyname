// sandbox-store-video.js — stores a browser-rendered brand reel (.webm) in Supabase storage.
// Dependency-free CommonJS. Mirrors sandbox-store-pdf.js: founder-gated, base64 JSON body,
// raw fetch to the storage API. Returns the real public URL of the file that was actually
// written — no record is claimed unless the upload genuinely succeeded.
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SANDBOX_BUCKET || 'brand-headers';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '{"error":"POST only"}' };
  try {
    if (!SB_URL || !SB_KEY) return { statusCode: 500, body: '{"error":"supabase env missing"}' };
    const b = JSON.parse(event.body || '{}');
    if (!b.founderToken || b.founderToken !== process.env.SMN_FOUNDER_TOKEN) {
      return { statusCode: 401, body: '{"error":"founder token required"}' };
    }
    if (!b.brandId || !b.videoBase64) return { statusCode: 400, body: '{"error":"brandId and videoBase64 required"}' };

    const buf = Buffer.from(String(b.videoBase64).replace(/^data:video\/webm(;codecs=[^;]*)?;base64,/, ''), 'base64');
    if (!buf.length) return { statusCode: 400, body: '{"error":"empty video payload"}' };

    const safeId = String(b.brandId).replace(/[^a-zA-Z0-9_-]/g, '');
    const path = `sandbox/reels/${safeId}_${Date.now()}.webm`;

    const up = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'video/webm', 'x-upsert': 'true' },
      body: buf
    });
    if (!up.ok) {
      const t = await up.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'storage upload failed', status: up.status, detail: t.slice(0, 300) }) };
    }

    const url = `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;

    // Audit the real event (the ledger records only what actually happened).
    try {
      await fetch(`${SB_URL}/rest/v1/sandbox_audit_logs`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          actor_id: 'founder', action: 'REEL_STORED', target_table: 'storage', record_id: safeId,
          metadata: { path: path, bytes: buf.length, engine: 'canvas-motion-recorder', container: 'webm' }
        })
      });
    } catch (_) { /* audit is best-effort; never fail the upload over it */ }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, url: url, path: path, bytes: buf.length }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
