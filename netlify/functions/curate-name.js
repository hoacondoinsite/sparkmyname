// Saves a customer's curation of ONE name in their report: keep (love it) or
// junk (remove it), plus the reverse (unkeep / restore). State is stored inside
// the name's existing `kit` JSON (flags _kept / _removed), so NO database schema
// change is needed. The live report (view-report) reads these flags on render.
//
// Auth: gated by the report's own unguessable key (?r=KEY) — the same secret that
// lets the owner open the report (matches add-names). No login required.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sbHeaders() {
  return { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' };
}
function resp(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(obj) };
}

const ACTIONS = {
  keep:    { _kept: true },
  unkeep:  { _kept: false },
  remove:  { _removed: true },
  restore: { _removed: false },
  choose:   { _chosen: true },
  unchoose: { _chosen: false }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SB_URL || !SB_KEY) return resp(500, { ok: false, error: 'missing_supabase_env' });

  let r = '', position = -1, action = '', note = '';
  try {
    const b = JSON.parse(event.body || '{}');
    r = (b.r || b.report_id || '').replace(/[^a-z0-9]/g, '').slice(0, 32);
    position = parseInt(b.position, 10);
    action = (b.action || '').slice(0, 16);
    note = (b.note != null ? String(b.note) : '').slice(0, 600);
  } catch (e) {}

  if (!r) return resp(400, { ok: false, error: 'no_report' });
  if (!(position >= 0 && position < 200)) return resp(400, { ok: false, error: 'bad_position' });
  if (action !== 'note' && !ACTIONS[action]) return resp(400, { ok: false, error: 'bad_action' });

  // 1) Read the current kit for this exact name row.
  let kit = {};
  try {
    const rr = await fetch(
      SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&position=eq.' + position + '&select=kit&limit=1',
      { headers: sbHeaders() }
    );
    if (rr.status >= 300) return resp(502, { ok: false, error: 'read_failed' });
    const rows = await rr.json().catch(function () { return []; });
    if (!Array.isArray(rows) || !rows[0]) return resp(404, { ok: false, error: 'not_found' });
    kit = rows[0].kit || {};
    if (typeof kit !== 'object' || Array.isArray(kit)) kit = {};
  } catch (e) {
    return resp(502, { ok: false, error: 'read_exception' });
  }

  // 2) Merge the curation flag, preserving everything else in the kit.
  const patch = (action === 'note') ? { _note: note } : ACTIONS[action];
  for (const k in patch) kit[k] = patch[k];

  // 3) Write it back.
  try {
    const wr = await fetch(
      SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&position=eq.' + position,
      { method: 'PATCH', headers: Object.assign(sbHeaders(), { 'Prefer': 'return=minimal' }), body: JSON.stringify({ kit: kit }) }
    );
    if (wr.status >= 300) {
      let t = ''; try { t = await wr.text(); } catch (e) {}
      console.error('curate write failed', wr.status, t.slice(0, 160));
      return resp(502, { ok: false, error: 'write_failed' });
    }
  } catch (e) {
    return resp(502, { ok: false, error: 'write_exception' });
  }

  return resp(200, { ok: true, position: position, action: action });
};
