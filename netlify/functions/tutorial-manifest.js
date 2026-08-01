// TUTORIAL manifest — serves an optional "watch how" tutorial reel's media (scenes + voice + music)
// to the Live Agent guide player. Generic, read-only, one reel per request.
// No keys exposed. Reads only the isolated <slug>/manifest.json in the SB public bucket.
// Returns {"brands":{}} on any miss/error so the guide stays text-only and never breaks.
const storage = require('./sb-storage.js');
const SB_URL = process.env.SUPABASE_URL;
const EMPTY = '{"brands":{}}';
const OK = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
exports.handler = async (event) => {
  try {
    const q = (event && event.queryStringParameters) || {};
    const slug = String(q.reel || '').toLowerCase();
    if (!/^[a-z0-9]{3,40}$/.test(slug)) return { statusCode: 200, headers: OK, body: EMPTY };
    const r = await fetch(SB_URL + '/storage/v1/object/public/' + storage.BUCKET + '/' + slug + '/manifest.json?cb=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return { statusCode: 200, headers: OK, body: EMPTY };
    return { statusCode: 200, headers: OK, body: await r.text() };
  } catch (e) { return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: EMPTY }; }
};
