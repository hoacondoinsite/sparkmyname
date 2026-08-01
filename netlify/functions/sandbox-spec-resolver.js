// sandbox-spec-resolver.js — resolve layout/print specs for a vendor + deliverable type.
//
// HONEST BY DESIGN (contrast with the proposed specResolver.js, which faked a "dynamic web
// fetch" by discarding the search result and returning hardcoded numbers labelled as fetched):
//   1) DB FIRST — return a VERIFIED row from sandbox_vendor_specs if one exists.
//   2) STANDARD FALLBACK — else return the verified standard_global spec for that type. The
//      file is still print-correct; it is honestly labelled 'standard_fallback', not vendor-exact.
//   3) UNKNOWN VENDOR — never invents a vendor spec. It returns the standard spec AND logs the
//      miss (needs_review) so a VERIFIED vendor template can be researched and added later.
// Reads only verified=true rows, so a queued needs_review placeholder can never be served as real.
//
// Founder-gated. Dependency-free (native fetch, CommonJS). sandbox_* only. No secrets in code.
'use strict';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REST = () => SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/sandbox_vendor_specs';
const HDRS = () => ({ apikey: SERVICE, Authorization: 'Bearer ' + SERVICE, 'Content-Type': 'application/json' });

async function findVerified(vendor, type) {
  const url = REST() + '?vendor_name=eq.' + encodeURIComponent(vendor) +
    '&deliverable_type=eq.' + encodeURIComponent(type) + '&verified=eq.true&limit=1';
  const r = await fetch(url, { headers: HDRS() });
  if (!r.ok) return null;
  const rows = await r.json();
  return (Array.isArray(rows) && rows[0]) || null;
}

async function logMiss(vendor, type) {
  // Queue an unknown vendor/type for verified research — verified:false so it is never served.
  try {
    await fetch(REST() + '?on_conflict=vendor_name,deliverable_type', {
      method: 'POST',
      headers: Object.assign(HDRS(), { Prefer: 'resolution=ignore-duplicates' }),
      body: JSON.stringify([{ vendor_name: vendor, deliverable_type: type,
        verified: false, needs_review: true, source: 'auto-logged miss', notes: 'awaiting verified spec' }])
    });
  } catch (e) { /* logging is best-effort; never block a render on it */ }
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return resp(405, { error: 'POST only' });
    let b = {};
    try { b = JSON.parse(event.body || '{}'); } catch (_) { return resp(400, { error: 'bad JSON' }); }
    if (!b.founderToken || b.founderToken !== process.env.SMN_FOUNDER_TOKEN) {
      return resp(403, { error: 'sandbox is founder-gated' });
    }
    if (!SUPABASE_URL || !SERVICE) return resp(500, { error: 'supabase env missing' });

    const vendor = (b.vendorName ? String(b.vendorName) : '').toLowerCase().trim();
    const type = String(b.deliverableType || '').toLowerCase().trim();
    if (!type) return resp(400, { error: 'deliverableType required' });
    const dims = b.formatDimensions || {};

    // 1) exact vendor match (verified)
    if (vendor && vendor !== 'standard_global') {
      const hit = await findVerified(vendor, type);
      if (hit) return resp(200, { source: 'db_vendor', specs: hit });
    }
    // 2) verified standard_global for this type
    const std = await findVerified('standard_global', type);
    if (std) {
      // if a specific vendor was asked for but not found, queue it for verified research
      if (vendor && vendor !== 'standard_global') await logMiss(vendor, type);
      return resp(200, { source: vendor && vendor !== 'standard_global' ? 'standard_fallback' : 'db_standard', specs: std });
    }
    // 3) last resort: a sane, HONESTLY-labelled default (never claimed as vendor-exact)
    if (vendor && vendor !== 'standard_global') await logMiss(vendor, type);
    return resp(200, { source: 'default_unverified', specs: {
      vendor_name: 'standard_global', deliverable_type: type,
      trim_w_in: dims.width || null, trim_h_in: dims.height || null,
      bleed_in: 0.125, safe_margin_in: 0.125, dpi: 300, color_profile: 'CMYK', file_format: 'PDF',
      verified: false, notes: 'no verified spec on file — used industry-standard defaults'
    } });
  } catch (e) { return resp(500, { error: String(e.message || e) }); }
};

function resp(s, o) {
  return { statusCode: s, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) };
}
