// art-department-background.js — GRAPHIC DEPARTMENT, LIBRARY model (Stage 2)
// ----------------------------------------------------------------------------
// One cinematic header PER INDUSTRY, reused forever — not one per name.
//   1. Classify the order's idea into an industry key (via the engine's recipes).
//   2. Look in the shared library (Supabase Storage: library/v2/{key}.png).
//      - HIT  -> reuse it for every name in the order. $0, no generation.
//      - MISS -> generate ONE textless scene (~$0.13), save it to the library,
//                then reuse it. Every future order in that industry is then free.
//   3. Stamp the shared header onto every name (kit.headerUrl) so each card shows it.
// The name/domain/tagline are drawn in big black ON THE CARD (below the image),
// so the library image stays textless and universal.
// Behind OFF switch (SMN_ART_DEPT=on). Failure-safe. Touches no naming/judge code.
// ----------------------------------------------------------------------------
var engine = require('./studio-engine.js');
var storage = require('./sb-storage.js');

var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var ON = String(process.env.SMN_ART_DEPT || '').toLowerCase() === 'on';

function sbH(extra) { var o = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }; if (extra) { for (var k in extra) o[k] = extra[k]; } return o; }

// Stable short hash (djb2) for turning a recipe's subject into a library key.
function djb2(s) { var h = 5381; s = String(s || ''); for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; } return h.toString(36); }

// Map the customer's idea to a stable library key.
// Known industries (dental, plumbing, law...) collapse to one key each;
// unknown ideas (e.g. "nuclear physicist") get their own slug key and seed the library.
function industryKey(seed) {
  var s = String(seed || '').toLowerCase().trim();
  var r = null; try { r = engine.recipeFor(s); } catch (e) {}
  if (r && r.subject && !/single most iconic/.test(r.subject)) return 'cls-' + djb2(r.subject);
  var slug = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return 'seed-' + (slug || 'general');
}

function publicUrl(path) { return SB_URL + '/storage/v1/object/public/' + storage.BUCKET + '/' + path; }

/* libraryHas() removed 2026-07-30 — nothing shares images any more. */

async function getNames(key) {
  try {
    var r = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(key) + '&select=id,kit&order=position.asc', { headers: sbH({ 'Accept': 'application/json' }) });
    if (r.status >= 300) return [];
    return await r.json();
  } catch (e) { return []; }
}

async function saveKit(rowId, kit) {
  try {
    // MERGE-BEFORE-WRITE (forensic fix, 2026-07-05): fresh row, our field only.
    try{
      var fq = await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(rowId) + '&select=kit&limit=1', { headers: sbH({'Accept':'application/json'}) });
      var fr = fq.ok ? await fq.json() : [];
      if (fr && fr[0] && fr[0].kit) { var fk = fr[0].kit; fk.headerUrl = kit.headerUrl; kit = fk; }
    }catch(_){ }
    var r = await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(rowId), {
      method: 'PATCH', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }), body: JSON.stringify({ kit: kit })
    });
    return r.status < 300;
  } catch (e) { return false; }
}

exports.handler = async function (event) {
  if (!ON) return { statusCode: 200, body: 'art-dept off' };
  var b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  var key = String(b.r || '').replace(/[^a-z0-9]/g, '').slice(0, 32);
  var seed = String(b.seed || '');
  if (!key || !SB_URL || !SB_KEY) return { statusCode: 200, body: 'missing key/env' };

  await storage.ensureBucket();

  // 1) which industry, and is it already in the library?
  var ik = industryKey(seed);
  /* ===== THE INDUSTRY LIBRARY IS DELETED (2026-07-30, Founder order:
     "get rid of the old library, cancel that whole thing, I never want that again... I don't
     want to store any images anymore like that. It's nothing but trouble.")

     WHAT IT WAS: one photograph banked per industry and reused for every customer in that
     industry, forever, to save money.

     WHY IT HAD TO GO: a banked photograph is permanent. When a bad frame got stored — a
     vintage-looking one, or a tyre shop's picture landing on a dentist — every customer in
     that industry inherited it and NO prompt fix could ever reach them, because a library HIT
     never regenerates. It was fixed twice (restore the prompt on 07-23, orphan the shelf to v2
     on 07-27) and the pictures still came out wrong, because the fault was never the prompt.
     It was the storing.

     WHAT HAPPENS NOW: every order generates its own header, fresh, from the current cinematic
     prompt. Nothing is banked, nothing is shared, nothing can be inherited. A bad frame can
     only ever affect the one order it was made for, and the next order starts clean.
     Nothing is deleted from storage — the old shelves are simply never read again. ===== */
  var libUrl = '';
  var reused = false;
  try {
    var prompt = engine.heroPrompt({ industry: (seed || 'a modern premium business') +
      '. Variation: a premium showcase frame, flagship advertising-campaign quality, expensive-looking' });
    var img = await engine.generateImage(prompt, { imageSize: '2K', aspectRatio: '16:9' });
    if (!(img && img.ok && img.b64)) {
      console.error('HERO GENERATION FAILED: ' + JSON.stringify(img).slice(0,600));
      try {
        var _rows0 = await getNames(key);
        if (_rows0 && _rows0[0]) { var _k0 = _rows0[0].kit || {}; _k0.heroDept = { status: 'failed', lastError: JSON.stringify(img).slice(0, 400), at: new Date().toISOString() }; await saveKit(_rows0[0].id, _k0); }
      } catch (_) {}
    }
    if (img && img.ok && img.b64) {
      /* Stored under THIS ORDER's own key, never under a shared industry name, so it can
         never be served to anybody else. */
      // CLARITY GENERATION v3 (2026-08-02): heroes made AFTER the haze fix live under /v3/.
      // Anything without /v3/ predates the fix and is treated as stale, so opening an old card
      // regenerates it with the bright, clean direction.
      var ownPath = 'orders/' + key + '/v3/header.png';
      var up = await storage.uploadPng(ownPath, img.b64, img.mime || 'image/png');
      if (up && up.ok) { reused = true; libUrl = up.url; }
    }
  } catch (e) { /* generation failed: leave headers off, never block delivery */ }

  if (!reused) return { statusCode: 200, body: 'industry=' + ik + ' no_image' };

  // 3) CO-8 (Founder-approved spend, 2026-07-05): every name gets its OWN distinct
  //    industry-related 2K scene (~14c each). Lead keeps the banked library hero
  //    (also the page hero); every other row gets a fresh variation. N-scalable.
  //    Any single failure falls back to the shared library scene - never a blank card.
  var rows = await getNames(key);
  var applied = 0;
  var ownUrls = [];
  // CINEMATIC variations (restored 2026-07-23, Founder order): six different frames from
  // the same flagship commercial shoot — rich, dramatic, expensive-looking. The July-17
  // editorial/desaturated variants (deep shadow, still-life, film grain) are retired.
  var VARIANTS = ['a sweeping wide establishing frame with dramatic cinematic lighting and rich depth','a rich hero close-up, ultra-detailed, shallow depth of field, glowing highlights','a dynamic three-quarter angle full of energy, atmosphere and dimension','a warm golden-hour frame, radiant light, aspirational and inviting','a bold vibrant frame with saturated color and a strong single focal point','a premium showcase frame, flagship advertising-campaign quality, expensive-looking'];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i] || {}, kit = row.kit || {};
    // EVERY NAME GETS ITS OWN PHOTO (2026-07-27, Founder order).
    //
    // This used to read `if (i > 0)`, which meant the LEAD name silently reused the shared
    // industry library scene as its card photo. So an order produced six photos across six
    // names, one of which was not its own — and if the customer activated the lead name, the
    // photo on their card was a stock scene shared with every other order in that industry.
    // The library hero stays exactly as it is: banked once per industry, used as the ORDER
    // header. Every name, including the first, now gets a distinct 2K scene of its own.
    // Cost: one extra render per order, about 13c.
    var wantUrl = libUrl;
    {
      try {
        var vPrompt = engine.heroPrompt({ industry: (seed || 'a modern premium business') + '. Variation: ' + VARIANTS[i % VARIANTS.length] });
        // PRO FIRST (2026-07-27, Founder order). These six ran on flash while the shared
        // header — and every other image path in this codebase — ran on gemini-3-pro. Same
        // words, weaker engine, and the cards showed it. Flash stays behind it as fallback,
        // so a Pro outage still fills the card rather than leaving it blank.
        var vImg = await engine.generateImage(vPrompt, { /* uses the house PHOTO_LADDER in studio-engine (2026-07-27) — no ad-hoc tier lists */ imageSize: '2K', aspectRatio: '16:9' });
        if (vImg && vImg.ok && vImg.b64) {
          var vUp = await storage.uploadPng('orders/' + key + '/v3/card-hero-' + i + '.png', vImg.b64, vImg.mime || 'image/png');
          if (vUp && vUp.ok) wantUrl = vUp.url;
        } else { console.error('CARD HERO ' + i + ' FAILED: ' + JSON.stringify(vImg).slice(0, 300)); }
      } catch (e) { /* fall back to the library scene */ }
    }
    kit.headerUrl = wantUrl;
    ownUrls[i] = wantUrl;
    if (await saveKit(row.id, kit)) applied++;
  }

  // THE SEVEN (2026-07-27, Founder order). The customer paid for every one of these scenes,
  // not just the one attached to the name they happened to activate. The full set — the order
  // header plus each name's own photo — is written onto EVERY name's kit, so whichever brand
  // they choose, all seven are theirs to download.
  //
  // Written in a second pass because the set is not complete until the loop above finishes.
  try {
    var gallery = [];
    if (libUrl) gallery.push({ url: libUrl, label: 'Brand header', kind: 'header' });
    for (var g = 0; g < rows.length; g++) {
      if (ownUrls[g] && ownUrls[g] !== libUrl) {
        gallery.push({ url: ownUrls[g], label: (rows[g] && rows[g].name) || ('Scene ' + (g + 1)), kind: 'scene' });
      }
    }
    if (gallery.length > 1) {
      for (var q = 0; q < rows.length; q++) {
        var rk = (rows[q] && rows[q].kit) || {};
        rk.gallery = gallery;
        await saveKit(rows[q].id, rk);
      }
    }
  } catch (e) { console.error('gallery write failed: ' + String(e && e.message || e)); }
  // COMPLETION-FIRES-DELIVERY (2026-07-10): the hero just landed — if the logos are done too,
  // this may be the last asset the brand needed; fire the delivery email (atomic: fires once).
  try { var _comp = require('./smn-curate.js'); await _comp.finalizeIfComplete(key, (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app')); }
  catch (e) { console.error('finalize-on-complete failed (hero): ' + String(e && e.message || e)); }
  return { statusCode: 200, body: 'industry=' + ik + ' fromLibrary=' + (reused) + ' applied=' + applied };
};
