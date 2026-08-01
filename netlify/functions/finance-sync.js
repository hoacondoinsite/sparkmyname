// FINANCE SYNC — stores the Olin Finance Center ledger server-side (Netlify Blobs) so the
// scheduled function can send statements even when the browser is closed.
// POST { ledger } -> saves.   GET -> returns the saved ledger.
// Netlify Blobs is provided by the Netlify Functions runtime. Loaded via a computed dynamic
// import so the bundler never hard-fails if it resolves the module differently.

const STORE = 'olin-finance';
const K = 'ledger';
let _blobs;

async function store() {
  if (_blobs === undefined) {
    try { _blobs = await import(['@netlify', 'blobs'].join('/')); }
    catch (e) { _blobs = null; }
  }
  if (!_blobs) return null;
  try { return _blobs.getStore(STORE); } catch (e) { return null; }
}

exports.handler = async (event) => {
  const s = await store();
  if (!s) return resp(200, { ok: false, error: 'blobs_unavailable' });

  if (event.httpMethod === 'GET') {
    try { const data = await s.get(K, { type: 'json' }); return resp(200, { ok: true, ledger: data || null }); }
    catch (e) { return resp(200, { ok: false, error: 'read_failed' }); }
  }
  if (event.httpMethod === 'POST') {
    let ledger = null;
    try { const b = JSON.parse(event.body || '{}'); ledger = b.ledger || b; } catch (e) {}
    if (!ledger || typeof ledger !== 'object') return resp(400, { error: 'no_ledger' });
    try { await s.setJSON(K, ledger); return resp(200, { ok: true, saved: true }); }
    catch (e) { return resp(200, { ok: false, error: 'write_failed' }); }
  }
  return resp(405, { error: 'method' });
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) }; }
