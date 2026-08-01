// SparkMyName Agency OS — REST DB helper (NEW FILE). House pattern: PostgREST over fetch,
// zero npm dependencies — deploys exactly like every locked department.
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (already set in Netlify).
'use strict';
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const H = () => ({ apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' });

async function dbSelect(table, query) { // query: PostgREST string, e.g. 'status=eq.pending&limit=1'
  const r = await fetch(SB_URL + '/rest/v1/' + table + '?' + query, { headers: H() });
  return r.ok ? r.json() : [];
}
async function dbInsert(table, rows) {
  const r = await fetch(SB_URL + '/rest/v1/' + table, {
    method: 'POST', headers: Object.assign(H(), { Prefer: 'return=representation' }),
    body: JSON.stringify(rows),
  });
  if (r.ok) return r.json();
  // DIAGNOSIS (2026-07-05): surface WHY PostgREST rejected — table missing, column, RLS…
  let why = ''; try { why = (await r.text()).slice(0, 300); } catch (_) {}
  console.error('dbInsert rejected: ' + table + ' HTTP ' + r.status + ' — ' + why);
  dbInsert.lastError = table + ' HTTP ' + r.status + ': ' + why;
  return null;
}
async function dbUpdate(table, query, patch) {
  const r = await fetch(SB_URL + '/rest/v1/' + table + '?' + query, {
    method: 'PATCH', headers: H(), body: JSON.stringify(patch),
  });
  return r.ok;
}
async function dbClaim(table, query, patch) { // atomic: PATCH with state filter; returns claimed rows
  const r = await fetch(SB_URL + '/rest/v1/' + table + '?' + query, {
    method: 'PATCH', headers: Object.assign(H(), { Prefer: 'return=representation' }),
    body: JSON.stringify(patch),
  });
  if (!r.ok) return [];
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}
module.exports = { dbSelect, dbInsert, dbUpdate, dbClaim };
