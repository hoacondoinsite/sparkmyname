// refresh-art.js — SELF-HEALING ARTWORK
// ----------------------------------------------------------------------------
// Founder order, 2026-07-27: "why can't we make a wire that says if that shows up
// like that, it automatically corrects... it'll call for the images and reload them."
//
// THE PROBLEM THIS ENDS: the art library banks one photograph per industry and reuses it
// forever. Anything banked during the July-17 vintage period kept being served long after the
// prompt was fixed, because a library HIT never calls the model. Versioning the shelf to
// library/v2 stopped NEW orders inheriting it — but an OLD order still points at the old file
// in its own kit, and would have stayed ugly for good.
//
// THE WIRE: when a brand is opened, the workspace asks this endpoint whether that order's
// artwork is stale. If it is, the art department is re-run for that order and fresh photography
// is written back into every name's kit. The customer is told plainly that new images are on
// the way. Nothing is deleted; the stale URL is simply replaced when the new one lands.
//
// POST { r: "<reportKey>" }
//   -> { ok, stale, refreshing, reason }
//
// HONESTY: if the art department is switched off, this reports refreshing:false and says so.
// It must never promise pictures the system will not produce.
'use strict';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ART_ON = String(process.env.SMN_ART_DEPT || '').toLowerCase() === 'on';
const SITE    = process.env.SITE_URL || process.env.URL || 'https://sparkmyname.netlify.app';

/* THE STALENESS TEST, IN ONE PLACE.
   Current artwork lives under library/v2/. Anything sitting in the old flat library/ folder was
   banked before the cinematic standard was restored and is exactly what kept haunting the
   Founder. Keep this the single definition — if the shelf is ever versioned again, this is the
   only line that changes. */
// CLARITY GENERATION v3 (2026-08-02). The July-30 'volumetric light through real atmosphere'
// phrase made heroes smoky and dim; it was removed and a CLARITY LAW added. Every hero painted
// since is written under /v3/. Anything else — the old banked library AND the hazy in-between
// batch — is stale, so opening that card repaints it with the corrected direction.
const CURRENT_GENERATION = '/v3/';
function isStale(url) {
  if (!url || typeof url !== 'string') return false;
  return url.indexOf(CURRENT_GENERATION) < 0;
}

function resp(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  const r = String(b.r || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
  if (!r || !SB_URL || !SB_KEY) return resp(200, { ok: false, error: 'missing' });

  try {
    // Read just the header URLs for this order — cheap, and enough to judge staleness.
    const q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
      '&select=hero:kit->>headerUrl&limit=12',
      { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
    if (!q.ok) return resp(200, { ok: false, error: 'read_failed' });
    const rows = await q.json().catch(() => []);
    const stale = (Array.isArray(rows) ? rows : []).some(x => isStale(x && x.hero));

    if (!stale) return resp(200, { ok: true, stale: false, refreshing: false });

    /* The art department is the only thing that may write artwork. If it is switched off we say
       so rather than showing a customer a promise nothing will keep. */
    if (!ART_ON) {
      return resp(200, { ok: true, stale: true, refreshing: false, reason: 'art_department_off' });
    }

    // Fetch the order's own seed so the regenerated scene matches the business, not a guess.
    let seed = '';
    try {
      const sq = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&select=seed&limit=1',
        { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } });
      if (sq.ok) { const sr = await sq.json().catch(() => []); seed = (sr[0] && sr[0].seed) || ''; }
    } catch (e) {}

    /* Fire and forget: the art department is a background worker and takes minutes. The customer
       is told to expect a wait rather than being made to sit on a spinner. */
    try {
      fetch(SITE + '/.netlify/functions/art-department-background', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ r: r, seed: seed, cursor: 0 })
      }).catch(function () {});
    } catch (e) {}

    return resp(200, { ok: true, stale: true, refreshing: true });
  } catch (e) {
    return resp(200, { ok: false, error: 'exception' });
  }
};

// exported so the workspace and the guard test share ONE definition of "stale"
exports.isStale = isStale;
exports.CURRENT_GENERATION = CURRENT_GENERATION;
