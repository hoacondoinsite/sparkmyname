// Netlify function: best-effort social-handle availability via profile-URL probing. Returns {available: true|false|null}.
const URLS = {
  instagram: h => 'https://www.instagram.com/' + h + '/',
  tiktok:    h => 'https://www.tiktok.com/@' + h,
  x:         h => 'https://x.com/' + h,
  youtube:   h => 'https://www.youtube.com/@' + h,
  github:    h => 'https://github.com/' + h
};
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  let platform = '', handle = '';
  try { const b = JSON.parse(event.body || '{}'); platform = b.platform; handle = (b.handle || '').replace(/[^A-Za-z0-9_.]/g, '').slice(0, 30); } catch (e) {}
  const build = URLS[platform];
  if (!build || !handle) return resp(400, { error: 'bad_request' });
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 3500);
    const r = await fetch(build(handle), { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SparkMyNameBot/1.0)' } });
    clearTimeout(t);
    if (r.status === 404) return resp(200, { available: true });
    if (r.status === 200) {
      const body = (await r.text()).slice(0, 60000).toLowerCase();
      const taken = ['couldn\'t find this account', 'sorry, this page', 'page isn\'t available', 'user not found', 'doesn\'t exist'];
      // these "not found" markers can appear on a 200 soft-404 page
      const notFound = taken.some(s => body.includes(s));
      return resp(200, { available: notFound ? true : false });
    }
    return resp(200, { available: null });
  } catch (e) { return resp(200, { available: null }); }
};
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
