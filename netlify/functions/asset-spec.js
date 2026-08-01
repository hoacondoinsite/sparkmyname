// File: netlify/functions/asset-spec.js | Date: 2026-07-26
// OPEN-REQUEST SPEC RESOLVER — turns free text into a real print/screen spec.
//
//   resolve('vehicle wrap for a 1979 Ford Pinto')
//     -> { slug, label, width, height, dpi, bleed, aspect, size, note, source }
//
// WHY THIS EXISTS
// ---------------
// art-registry.js holds the named rows the batch path renders. A customer who types
// something that is not a registry row ("curved expo banner", "restaurant thank-you card")
// gets `unknown_asset_type` and nothing else. This module is the missing middle: it turns
// arbitrary English into dimensions the image engine can actually be handed.
//
// THREE STEPS, cheapest first:
//   1. CACHE   asset_specs table, keyed by slug. A spec resolved once is never paid for again.
//   2. TABLE   a small built-in table of specs that are simply known facts (US business card
//              is 3.5x2in at 300dpi; nobody needs a model to say so).
//   3. MODEL   gpt-4o-mini in JSON mode, clamped hard on the way out.
//
// TRUTH NOTE: this resolver reasons from the model's own knowledge of print and screen
// standards. It does not browse the web, and nothing in the product claims that it does.
// Every field it returns is clamped into a range the engine can honour, and `source` records
// honestly which of the three steps produced the answer.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
'use strict';

const crypto = require('crypto');

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const MODEL      = 'gpt-4o-mini';

// Gemini accepts only this set. A ratio outside it is rejected by the API, so every
// resolved spec is snapped to the nearest member rather than passed through raw.
const ASPECTS = [
  ['1:1', 1], ['2:3', 0.6667], ['3:2', 1.5], ['3:4', 0.75], ['4:3', 1.3333],
  ['4:5', 0.8], ['5:4', 1.25], ['9:16', 0.5625], ['16:9', 1.7778], ['21:9', 2.3333]
];

// Known facts. No model call needed, no cache row needed.
const KNOWN = {
  business_card_us:  { w: 1050, h: 600,  dpi: 300, bleed: 36, label: 'Business card (US 3.5x2in)' },
  postcard_4x6:      { w: 1800, h: 1200, dpi: 300, bleed: 36, label: 'Postcard (4x6in)' },
  flyer_letter:      { w: 2550, h: 3300, dpi: 300, bleed: 36, label: 'Flyer (US Letter)' },
  poster_18x24:      { w: 5400, h: 7200, dpi: 300, bleed: 54, label: 'Poster (18x24in)' },
  yard_sign_24x18:   { w: 3600, h: 2700, dpi: 150, bleed: 36, label: 'Yard sign (24x18in)' },
  instagram_post:    { w: 1080, h: 1080, dpi: 72,  bleed: 0,  label: 'Instagram post' },
  instagram_story:   { w: 1080, h: 1920, dpi: 72,  bleed: 0,  label: 'Instagram story' },
  facebook_cover:    { w: 1640, h: 664,  dpi: 72,  bleed: 0,  label: 'Facebook cover' },
  email_header:      { w: 1200, h: 400,  dpi: 72,  bleed: 0,  label: 'Email header' },
  identity_mark:     { w: 2048, h: 2048, dpi: 300, bleed: 0,  label: 'Logo / identity mark' },
  small_mark:        { w: 1024, h: 1024, dpi: 72,  bleed: 0,  label: 'Icon / small mark' }
};
const KNOWN_HINTS = [
  [/\bbusiness\s*card/i,        'business_card_us'],
  [/\bpost\s*card|\b4\s*x\s*6/i,'postcard_4x6'],
  [/\bflyer|\bhandout/i,        'flyer_letter'],
  [/\bposter\b/i,               'poster_18x24'],
  [/\byard\s*sign|\blawn\s*sign/i,'yard_sign_24x18'],
  [/\binstagram\s*(post|square)/i,'instagram_post'],
  [/\b(instagram|ig)\s*stor|\breel\b/i,'instagram_story'],
  [/\bfacebook\s*(cover|banner)/i,'facebook_cover'],
  [/\bemail\s*(header|banner)/i,'email_header'],
  [/\bfavicon|app *icon|profile *(icon|picture|image)|avatar|browser *tab|tiny *(mark|icon)|small *mark|app *tile\b/i,'small_mark'],
  [/\blogo|logotype|wordmark|monogram|identity *mark|brand *mark|emblem\b/i,'identity_mark']
];

function slugify(text) {
  const clean = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const words = clean.replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 6).join('_');
  const hash  = crypto.createHash('sha1').update(clean).digest('hex').slice(0, 8);
  return ('open_' + (words || 'request') + '_' + hash).slice(0, 60);
}
function clampInt(v, lo, hi, dflt) {
  const n = Math.round(Number(v));
  if (!isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, n));
}
function snapAspect(w, h) {
  const r = w / h;
  let best = ASPECTS[0], gap = Infinity;
  for (const a of ASPECTS) { const g = Math.abs(Math.log(r / a[1])); if (g < gap) { gap = g; best = a; } }
  return best[0];
}
// The engine bills by tier, not by pixel: 1K is $0.039, 2K is $0.134, 4K is $0.24.
// FLOOR RAISED TO 2K (2026-07-26, Founder directive): 1K was being handed to small print
// pieces like business cards, where it is visibly soft in the hand for the sake of ten cents.
// Nothing on the open path generates below 2K now. 4K is reserved for genuinely large format,
// where the extra eleven cents buys detail a viewer can actually stand close to.
function sizeTier(w, h) {
  return Math.max(w, h) >= 4000 ? '4K' : '2K';
}
function svcH(extra) {
  const h = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' };
  for (const k in (extra || {})) h[k] = extra[k];
  return h;
}

// ---- cache ---------------------------------------------------------------------------------
// Cache misses are silent on purpose. If the asset_specs table has not been created yet the
// resolver still works end to end — it just pays the model each time instead of once.
async function cacheGet(slug) {
  if (!SB_URL || !SB_SERVICE) return null;
  try {
    const r = await fetch(SB_URL + '/rest/v1/asset_specs?asset_slug=eq.' +
      encodeURIComponent(slug) + '&select=*&limit=1', { headers: svcH() });
    if (r.status >= 300) return null;
    const rows = await r.json().catch(function () { return []; });
    return (Array.isArray(rows) && rows[0]) || null;
  } catch (e) { return null; }
}
async function cachePut(spec) {
  if (!SB_URL || !SB_SERVICE) return false;
  try {
    const r = await fetch(SB_URL + '/rest/v1/asset_specs', {
      method: 'POST',
      headers: svcH({ 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({
        asset_slug: spec.slug, label: spec.label, request_text: spec.request_text || spec.label,
        width: spec.width, height: spec.height, dpi: spec.dpi, bleed: spec.bleed,
        aspect: spec.aspect, size_tier: spec.size, layout_note: spec.note, source: spec.source
      })
    });
    return r.status < 300;
  } catch (e) { return false; }
}

// ---- model ---------------------------------------------------------------------------------
async function askModel(text) {
  if (!OPENAI_KEY) return null;
  const sys =
    'You are a production spec desk at a print and digital studio. Given a description of a ' +
    'physical or digital brand asset, return the standard production specification. Reply with ' +
    'JSON only, no prose, with exactly these keys: label (a short human name for the piece), ' +
    'width (pixels, integer), height (pixels, integer), dpi (integer, 300 for print, 150 for ' +
    'large-format viewed at distance, 72 for screen), bleed (pixels, 0 for screen), note (one ' +
    'sentence on layout: where the eye lands, how far away it is read from, what must stay ' +
    'legible). Use the real trade-standard dimensions for the piece. For very large formats ' +
    'give the proportionally correct pixel dimensions at the working dpi, capped at 8000px on ' +
    'the long edge.';
  const ctrl = new AbortController();
  // 6s. Same reasoning as the concept desk: this runs before the render, and the fallback
  // spec is a sane 3:2 sheet rather than a failure.
  const t = setTimeout(function () { ctrl.abort(); }, 6000);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
      body: JSON.stringify({
        model: MODEL, temperature: 0.2, max_tokens: 300,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: sys }, { role: 'user', content: String(text).slice(0, 300) }]
      })
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const data = await r.json();
    let content = (((data.choices || [])[0] || {}).message || {}).content || '';
    content = content.replace(/```json|```/g, '').trim();
    return JSON.parse(content);
  } catch (e) { clearTimeout(t); return null; }
}

// ---- resolve -------------------------------------------------------------------------------
// Never throws and never returns null. A model outage degrades to a sane 3:2 print sheet
// rather than stranding a paid customer with an error.
async function resolve(text) {
  const request = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const slug = slugify(request);

  const hit = await cacheGet(slug);
  if (hit) {
    return {
      slug: slug, label: hit.label || request, width: hit.width, height: hit.height,
      dpi: hit.dpi, bleed: hit.bleed, aspect: hit.aspect || snapAspect(hit.width, hit.height),
      size: hit.size_tier || sizeTier(hit.width, hit.height), note: hit.layout_note || '',
      source: 'cache', request_text: request
    };
  }

  for (const [re, key] of KNOWN_HINTS) {
    if (re.test(request)) {
      const k = KNOWN[key];
      const spec = {
        slug: slug, label: k.label, width: k.w, height: k.h, dpi: k.dpi, bleed: k.bleed,
        aspect: snapAspect(k.w, k.h), size: sizeTier(k.w, k.h),
        note: 'Standard trade dimensions for this piece.', source: 'known', request_text: request
      };
      await cachePut(spec);
      return spec;
    }
  }

  const m = await askModel(request);
  const w = clampInt(m && m.width,  200, 8000, 3000);
  const h = clampInt(m && m.height, 200, 8000, 2000);
  const spec = {
    slug: slug,
    label: String((m && m.label) || request).slice(0, 90),
    width: w, height: h,
    dpi:   clampInt(m && m.dpi, 72, 600, 300),
    bleed: clampInt(m && m.bleed, 0, 200, 0),
    aspect: snapAspect(w, h),
    size:  sizeTier(w, h),
    note:  String((m && m.note) || '').slice(0, 300),
    source: m ? 'resolved' : 'fallback',
    request_text: request
  };
  await cachePut(spec);
  return spec;
}

module.exports = { resolve: resolve, slugify: slugify, snapAspect: snapAspect, sizeTier: sizeTier };
