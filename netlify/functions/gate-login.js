// GATE LOGIN — passcode check for the Olin / Vorrex command centers. The passcode lives
// server-side in an env var (never in the page source), so it can't be read from the browser.
// Set OLIN_PASSCODE and VORREX_PASSCODE in Netlify; the defaults below work on first deploy
// so you're never locked out — change them in Netlify to lock the centers down.
//
// POST { center:'olin'|'vorrex', code } -> { ok:boolean }

const CODES = {
  olin: process.env.OLIN_PASSCODE || '',
  vorrex: process.env.VORREX_PASSCODE || ''
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  let center = '', code = '';
  try { const b = JSON.parse(event.body || '{}'); center = String(b.center || '').toLowerCase().trim(); code = String(b.code || ''); } catch (e) {}
  const want = CODES[center];
  if (!want) return resp(400, { error: 'bad_center' });
  const ok = !!want && !!code && code === want;
  return resp(200, { ok });
};

function resp(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) };
}
