'use strict';
/*
 * services/specResolver.js — dependency-free vendor / global graphic-spec resolver.
 *
 * Resolution order:
 *   1. DB cache: exact vendor + deliverable_type in sandbox_vendor_specs
 *   2. DB standard: standard_global + deliverable_type
 *   3. Clean industry-standard fallback (never a fabricated "dynamic web fetch")
 *
 * Mirrors the codebase's raw-fetch Supabase idiom (apikey + Bearer SUPABASE_SERVICE_ROLE_KEY).
 * No npm SDK imports. Reads sandbox_* tables only. fetchImpl is injectable for testing.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Reliable industry-standard fallbacks by broad class — never fabricated per-vendor claims.
const STANDARD = {
  print_small: { bleed_in: 0.125, safe_margin_in: 0.125, dpi: 300, color_profile: 'CMYK' },
  print_large: { bleed_in: 0.25,  safe_margin_in: 0.5,   dpi: 150, color_profile: 'CMYK' },
  poster:      { bleed_in: 0.25,  safe_margin_in: 0.25,  dpi: 300, color_profile: 'CMYK' },
  digital:     { bleed_in: 0,     safe_margin_in: 0,     dpi: 72,  color_profile: 'sRGB' },
  apparel:     { bleed_in: 0,     safe_margin_in: 0.25,  dpi: 300, color_profile: 'sRGB' }
};
const TYPE_CLASS = {
  postcard: 'print_small', postcardback: 'print_small', flyer: 'print_small',
  businesscard: 'print_small', menu: 'print_small', brochure: 'print_small',
  shelftalker: 'print_small', countermat: 'print_small', bumpersticker: 'print_small',
  poster: 'poster',
  banner: 'print_large', yardsign: 'print_large', sign: 'print_large',
  social: 'digital', story: 'digital', webbanner: 'digital',
  tshirt: 'apparel', tshirtback: 'apparel', hoodieback: 'apparel', hoodiefront: 'apparel',
  polochest: 'apparel', dressshirt: 'apparel', toteback: 'apparel', hatfront: 'apparel'
};

function normType(t) { return String(t || '').toLowerCase().trim(); }
function normVendor(v) { return v ? String(v).toLowerCase().trim() : 'standard_global'; }

async function dbLookup(vendor, type, fetchImpl) {
  if (!SUPABASE_URL || !SERVICE) return null;
  const f = fetchImpl || fetch;
  const url = SUPABASE_URL.replace(/\/$/, '') +
    '/rest/v1/sandbox_vendor_specs' +
    '?vendor_name=eq.' + encodeURIComponent(vendor) +
    '&deliverable_type=eq.' + encodeURIComponent(type) +
    '&select=*&limit=1';
  try {
    const r = await f(url, { headers: { apikey: SERVICE, Authorization: 'Bearer ' + SERVICE } });
    if (!r.ok) return null;
    const rows = await r.json();
    return (Array.isArray(rows) && rows[0]) || null;
  } catch (e) { return null; }
}

function fromRow(row, dims) {
  return {
    width: (dims && dims.width) || row.width_px || null,
    height: (dims && dims.height) || row.height_px || null,
    bleed_in: row.bleed_in == null ? null : Number(row.bleed_in),
    safe_margin_in: row.safe_margin_in == null ? null : Number(row.safe_margin_in),
    dpi: row.dpi, color_profile: row.color_profile,
    vendor: row.vendor_name, verified: !!row.verified
  };
}

function fallbackSpec(type, dims) {
  const cls = TYPE_CLASS[normType(type)] || 'print_small';
  const s = STANDARD[cls];
  return {
    width: (dims && dims.width) || null,
    height: (dims && dims.height) || null,
    bleed_in: s.bleed_in, safe_margin_in: s.safe_margin_in,
    dpi: s.dpi, color_profile: s.color_profile,
    vendor: 'standard_global', verified: true, class: cls
  };
}

/**
 * resolveGraphicSpecs({ vendorName, deliverableType, formatDimensions, fetchImpl })
 * -> { source: 'cache_database' | 'standard_global_db' | 'default_global_fallback', specs: {...} }
 */
async function resolveGraphicSpecs(opts) {
  opts = opts || {};
  const type = normType(opts.deliverableType);
  const vendor = normVendor(opts.vendorName);
  const dims = opts.formatDimensions || null;
  const fetchImpl = opts.fetchImpl;

  // 1. exact vendor + type
  if (vendor !== 'standard_global') {
    const row = await dbLookup(vendor, type, fetchImpl);
    if (row) return { source: 'cache_database', specs: fromRow(row, dims) };
  }
  // 2. standard_global + type from DB
  const g = await dbLookup('standard_global', type, fetchImpl);
  if (g) return { source: 'standard_global_db', specs: fromRow(g, dims) };
  // 3. clean industry-standard fallback — never a fabricated web fetch
  return { source: 'default_global_fallback', specs: fallbackSpec(type, dims) };
}

module.exports = { resolveGraphicSpecs, fallbackSpec };
