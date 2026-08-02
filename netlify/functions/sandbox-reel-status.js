// sandbox-reel-status.js — reads a cinematic reel's manifest so the page can poll progress.
// Reports exactly what is in storage: scenes that actually uploaded, real errors, real status.
const SB_URL = process.env.SUPABASE_URL;
const BUCKET = process.env.SANDBOX_BUCKET || 'brand-headers';

exports.handler = async function (event) {
  const id = ((event.queryStringParameters || {}).reelId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (!id) return { statusCode: 400, body: '{"error":"reelId required"}' };
  try {
    const r = await fetch(`${SB_URL}/storage/v1/object/public/${BUCKET}/sandbox/reels/${id}/manifest.json?cb=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'pending', scenes: [] }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: await r.text() };
  } catch (e) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'pending', scenes: [], note: String(e.message || e) }) };
  }
};
