// File: netlify/functions/generate-asset.js | Date: 2026-07-26
// ON-DEMAND SINGLE-ASSET GENERATION — the Smart Command Bar's only backend.
//
//   POST /api/generate-asset          (mapped in netlify.toml)
//   POST /.netlify/functions/generate-asset
//   body: { access_token, brand_id, asset_type }
//
//   200 -> { success:true,  asset_id, download_url, timestamp }
//   4xx -> { success:false, error, timestamp }
//
// WHY THIS EXISTS
// ---------------
// The art department fires as a BATCH from deliver-background.js, gated by seven global
// switches (SMN_ART_DEPT, SMN_PRINT_BASICS, …). A switch is all-or-nothing: turn one on and
// every row behind it renders for every order, whether the customer wanted it or not.
//
// This function is the opposite shape. One request, one named asset, one generation call,
// one email. No batch loop, no global switch consulted, no cursor, no relay. The customer
// asks for a business card and gets a business card.
//
// FIVE GATES, in order — each can only make the call cheaper or safer:
//   1. OWNERSHIP   token -> email -> report ownership. The house pattern every customer-data
//                  function here uses. An id from the browser is never trusted alone.
//   2. ACTIVATION  the brand must be activated. Activation happens after checkout, so an
//                  unpaid brand cannot spend a cent of API budget.
//   3. IDEMPOTENCY brand + asset + a 60s window hashed into a storage claim. A double-click,
//                  a retried fetch, or an impatient customer cannot buy the same image twice.
//   4. CACHE       an asset already rendered returns its stored URL and costs nothing.
//   5. SPEND CAP   a per-brand ledger persisted ON THE KIT (not in module memory — Netlify
//                  reuses warm containers, so module state leaks between customers). Reserve
//                  before spending, settle to the engine's real costEst after.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY,
//      RESEND_API_KEY, RESEND_FROM, SITE_URL,
//      SMN_ASSET_CAP_USD (default 20.00), SMN_ASSET_COST_FALLBACK (default 0.24)
'use strict';

const crypto    = require('crypto');
const registry  = require('./art-registry.js');
const specDesk  = require('./asset-spec.js');
const variants  = require('./art-variants.js');
const conceptDesk = require('./identity-concept.js');
const judged      = require('./render-judged.js');
const translator= require('./art-translator.js');
const engine    = require('./studio-engine.js');
const storage   = require('./sb-storage.js');

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON    = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';
const RESEND     = process.env.RESEND_API_KEY;
const FROM       = process.env.RESEND_FROM || 'SparkMyName <hello@sparkmyname.com>';
const SITE       = (process.env.SITE_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');

// PER-BRAND SPEND CAP. Raised 6.00 -> 20.00 (2026-07-27, Founder order: "I want the best").
// The 6.00 default arrived with an earlier build and was never a decision made in the open. It
// is a runaway guard, not a quality budget: it exists so a loop, a retry storm or a bug like the
// 2026-07-27 double-charge cannot bill a brand into the ground unnoticed. At 13.4c a piece,
// 20.00 is roughly 149 assets on one brand — far past any honest use, which is exactly where a
// safety net belongs. Override per environment with SMN_ASSET_CAP_USD.
const CAP_USD       = Math.max(0, parseFloat(process.env.SMN_ASSET_CAP_USD || '20.00'));
const FALLBACK_COST = parseFloat(process.env.SMN_ASSET_COST_FALLBACK || '0.24');
// Wide enough to cover a whole generation run. It was 60s, which was fine when the browser
// was the only caller and gave up at the ten-second wall. Now the shelf polls past that wall,
// and a poll landing in the NEXT window would hash differently, miss the claim, and start a
// second paid generation of an asset already being made. Five minutes comfortably outlasts a
// render. The cost of the wider window is that a genuinely failed asset cannot be retried for
// a few minutes — cheap next to paying twice.
const IDEM_WINDOW_S = 300;

function resp(code, obj) {
  const body = Object.assign({ timestamp: new Date().toISOString() }, obj);
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
function fail(code, error, extra) { return resp(code, Object.assign({ success: false, error: error }, extra || {})); }
function svcH(extra) {
  const h = { 'apikey': SB_SERVICE, 'Authorization': 'Bearer ' + SB_SERVICE, 'Accept': 'application/json' };
  for (const k in (extra || {})) h[k] = extra[k];
  return h;
}
function r4(n) { return Math.round((Number(n) || 0) * 10000) / 10000; }
// Slice first, then encode — encoding first and slicing after can cut a percent-escape
// ("%2") in half and produce a storage path the API rejects.
function safeSeg(s, n) { return encodeURIComponent(String(s || '').slice(0, n)).replace(/%2F/gi, '_'); }

// ---- SPEND LEDGER, PERSISTED ON THE KIT --------------------------------------------------
// Deliberately NOT a module-scope variable. Netlify reuses warm execution contexts, so a
// module-level total leaks from one customer's order into the next — invisible in testing,
// and it would cap an innocent brand at zero. The book lives on the kit, per brand, forever.
function book(kit) {
  kit.assetSpend = kit.assetSpend || {};
  if (!kit.assetSpend.parts || typeof kit.assetSpend.parts !== 'object') kit.assetSpend.parts = {};
  if (!kit.assetSpend.resv  || typeof kit.assetSpend.resv  !== 'object') kit.assetSpend.resv  = {};
  return kit.assetSpend;
}
// Derived, never accumulated: recomputed from the parts each time, so a lost write self-heals.
function spendTotal(kit) {
  const b = book(kit); let t = 0, k;
  for (k in b.parts) if (typeof b.parts[k] === 'number') t += b.parts[k];
  for (k in b.resv)  if (typeof b.resv[k]  === 'number') t += b.resv[k];
  return r4(t);
}
function spendReserve(kit, key) {
  const b = book(kit);
  if (typeof b.parts[key] === 'number') return true;              // already paid, idempotent
  if (spendTotal(kit) + FALLBACK_COST > CAP_USD) return false;    // check the dearest outcome
  b.resv[key] = FALLBACK_COST;
  return true;
}
function spendSettle(kit, key, actual) {
  const b = book(kit);
  delete b.resv[key];
  b.parts[key] = r4(typeof actual === 'number' ? actual : FALLBACK_COST);
}
function spendRelease(kit, key) { delete book(kit).resv[key]; }

// ---- data access -------------------------------------------------------------------------
async function loadRow(reportId, brandName) {
  const q = SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(reportId) +
            '&select=position,name,kit&order=position.asc&limit=24';
  const res = await fetch(q, { headers: svcH() });
  const rows = await res.json().catch(function () { return []; });
  if (!Array.isArray(rows) || !rows.length) return null;
  if (!brandName) return rows.find(function (x) { return x && x.kit && x.kit._activated === true; }) || null;
  return rows.find(function (x) { return x && x.name === brandName; }) || null;
}
async function saveKit(reportId, position, kit) {
  const url = SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(reportId) +
              '&position=eq.' + encodeURIComponent(position);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: svcH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
    body: JSON.stringify({ kit: kit })
  });
  return res.status < 300;
}

// ---- notification ------------------------------------------------------------------------
// Best-effort by design: a mail failure must never lose an asset the customer already paid
// for in API spend. The asset is saved and returned regardless.
// notify() removed 2026-07-26: it was defined here and never called. The working one
// lives in generate-asset-background.js, which sends a proper workspace link. A dead
// email builder is worse than none — it reads as coverage that does not exist.

function esc(t) {
  return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

// WHICH FRAME, DECIDED HERE (2026-07-27, Founder order: "the client should never have to
// know anything"). The six frames used to be a question. Asking a customer to choose between
// "sweeping wide establishing" and "dynamic three-quarter angle" is asking them to art-direct,
// which is the job they are paying us to do. So the piece itself decides: a billboard wants
// the wide establishing frame, a business card wants the close-up, a vehicle wrap wants the
// three-quarter. Anything unrecognised gets the premium showcase, which flatters most subjects.
// A customer who does have an opinion can still state it in plain words in their request, and
// wantsIllustration / the prompt body carry it through.
const FRAME_RULES = [
  [/billboard|banner|expo|trade *show|storefront|sign|marquee|mural|wrap.*wall/i, 1],
  [/business *card|menu|thank|invitation|card\b|label|tag\b|sticker|packaging/i,   2],
  [/vehicle|truck|van|car\b|fleet|trailer|boat|wrap\b/i,                          3],
  [/social|instagram|facebook|story|reel|post\b|email|newsletter|web|hero/i,       5],
  [/flyer|brochure|leaflet|handout|mailer|postcard|door *hanger/i,                 4]
];
function frameFor(text) {
  for (const [re, n] of FRAME_RULES) if (re.test(text)) return String(n);
  return '6';                                   // premium showcase
}

// ---- open-request work order ---------------------------------------------------------------
// The registry path gets its prompt from art-translator, which reads a named row. An open
// request has no row, so the prompt is assembled here from three things and nothing else:
// the resolved spec, the brand's own palette and name, and whatever the customer answered in
// the questionnaire. No invented facts about the business, no claims the piece cannot keep.
//
// THE PHOTOREAL STANDARD (2026-07-26). The first version of this builder asked for
// "professional agency-quality artwork" and got exactly that: clean flat vector illustration.
// The house already had the right language — studio-engine.heroPrompt, restored by Founder
// order on 2026-07-23 — including the guard that it must read as a real photograph and never
// as an illustration, render, or 3D graphic. That standard now governs this path too.
//
// A customer who actually wants flat art can still say so in the third question; the word is
// looked for and the guard steps aside rather than fighting them.
// IDENTITY MODE (2026-07-27, Founder order). A logo is not a photograph, and the cinematic
// standard that makes the plow poster beautiful would make a photograph OF a logo — glossy,
// lit, three-dimensional, useless. So an identity request switches the whole brief.
//
// Deliberately, this carries NO prescribed structure. art-translator's logoPrompt hands the
// model three named directions and tells it where the symbol sits; this path hands it the
// brand card and gets out of the way. The palette, the typography and the business itself are
// the only inputs, and the concept is the engine's to find. That is the Founder's ask: see
// what it comes up with when nobody tells it what a logo is supposed to look like.
function wantsIdentity(text) {
  return (/\blogo|logotype|wordmark|monogram|identity|brand *mark|emblem\b/i.test(text || '') ||
          wantsSmallMark(text)) && !wantsMockup(text);
}
// THE PRESENTATION STUDY (2026-07-27, Founder order). The mark, photographed as a physical
// object — engraved in brushed metal, embossed into heavy stock, cast, etched. This is the
// image that sells the identity on a homepage or a pitch deck. It is deliberately a SEPARATE
// artifact from the mark itself: a prompt asking for "pure vector, black and white" and
// "macro photography of engraved titanium" in the same breath returns a photograph of a logo,
// which is beautiful and unusable. The flat mark is the deliverable; this is the presentation.
function wantsMockup(text) {
  // NOTE (2026-07-27): "agency presentation page" and "app tile" were both documented as
  // presentation materials but were missing from this test, so they routed to the flat
  // identity builder instead — the two materials added last would never have been reachable.
  // Caught by the routing check in the bug sweep, not by reading the code.
  return /\bmockup|mock-up|engraved|embossed|etched|debossed|app *tile|presentation *(study|piece|image|page|board)|agency *(presentation|page|board)|case *study *(board|page)?|cotton *rag|editorial *macro|on +(?:[a-z]+ +){0,2}(metal|titanium|brass|bronze|steel|wood|leather|paper|glass|charcoal|stone)|signage *study|material *study\b/i
    .test(text || '');
}
// THE SMALL MARK (2026-07-27, Founder order). A favicon is not a smaller logo — it is the symbol
// alone, with the wordmark removed and the detail budget cut to nothing. Apple at 16x16, Nike
// without its name, GitHub as pure silhouette. Same identity, different survival test.
function wantsSmallMark(text) {
  return /\bfavicon|app *icon|profile *(icon|picture|image)|avatar|browser *tab|tiny *(mark|icon)|small *mark|app *tile\b/i
    .test(text || '');
}

function wantsIllustration(answers) {
  const said = [(answers && answers.custom) || '', (answers && answers.purpose) || ''].join(' ');
  return /\b(illustration|illustrated|vector|flat art|cartoon|line art|graphic style|drawing)\b/i.test(said);
}

function openWorkOrder(spec, name, kit, answers) {
  const pal = (kit.palette && Array.isArray(kit.palette) ? kit.palette : [])
    .map(function (c) { return (c && (c.hex || c)) || ''; }).filter(Boolean).slice(0, 4);
  const illustrated = wantsIllustration(answers);

  const parts = [];

  // identity requests are handled before this function is reached (they are async)

  if (illustrated) {
    parts.push('A polished, high-end commercial illustration for: ' + spec.request_text + '.');
  } else {
    parts.push('A cinematic, award-winning commercial photograph for: ' + spec.request_text + '.');
    // The chosen frame, in the Founder-approved words the brand cards already use.
    const frame = variants.lineFor((answers && answers.look) || frameFor(spec.request_text));
    if (frame) parts.push('Variation: ' + frame + '.');
    parts.push('Shot on a full-frame camera with a fast prime lens. Dramatic cinematic lighting, ' +
               'volumetric light through real atmosphere, true-to-life materials with honest ' +
               'reflections and micro-texture, shallow depth of field with a sharp focal point, ' +
               'rich depth, flagship advertising-campaign quality, expensive-looking.');
    parts.push('It must feel like a real photograph — never a digital illustration, never a ' +
               'render, never a 3D graphic, never flat vector art.');
  }

  parts.push('Made for the brand "' + name + '".');
  if (answers && answers.purpose) parts.push('Its purpose: ' + answers.purpose + '.');
  if (answers && answers.format)  parts.push('Format the customer specified: ' + answers.format + '.');
  if (answers && answers.custom)  parts.push('Customer notes: ' + answers.custom + '.');

  parts.push('Finished dimensions ' + spec.width + 'x' + spec.height + 'px at ' + spec.dpi + ' DPI' +
             (spec.bleed ? (' with ' + spec.bleed + 'px bleed on every edge') : '') + '.');
  if (spec.note) parts.push(spec.note);

  // Composed for type that gets set afterwards, not painted in.
  parts.push('Composition: one strong focal point, clear visual hierarchy, and a calm, ' +
             'uncluttered area of held negative space in the upper third — dark or tonally ' +
             'even — deliberately reserved so brand typography can be set over it cleanly. ' +
             'Nothing important within the trim margin.');

  if (pal.length) parts.push('Brand palette, honoured in the lighting and the scene: ' + pal.join(', ') + '.');

  parts.push('CRITICAL: absolutely NO text, NO words, NO letters, NO numbers, NO signage, ' +
             'NO logos, NO labels and NO typography of any kind anywhere in the image — a ' +
             'purely visual, text-free scene. Type is set in the layout afterwards.');
  parts.push('OUTPUT HYGIENE: no watermarks, no signatures, no stray marks, no low-resolution or ' +
             'upscaled texture, no JPEG mush, no muddy or banded colour, no halos or fringing at ' +
             'edges, no added borders or frame edges. Clean, crisp, native resolution throughout.');

  return { format: spec.slug, engine: 'image', spec: { aspect: spec.aspect, size: spec.size, pieces: 1 },
           pieces: 1, prompts: [parts.join(' ')] };
}

function identityIntent(text) {
  const t = String(text || '');
  return {
    fullColour: /\bfull colou?r|colou?rful|multi-?colou?r|rich colou?r/i.test(t),
    wantsTagline: /\btagline|slogan|strap ?line/i.test(t),
    tagline: (t.match(/["\u201c]([^"\u201d]{2,60})["\u201d]/) || [])[1] || ''
  };
}

// THE PROMPT GOT OUT OF THE WAY (2026-07-27, Founder order, from a tested result).
//
// The previous version of this ran to 3,020 characters: Landor, Rand, four laws, a twenty-item
// forbidden list, output hygiene, a codex. It also FORBADE two things the Founder's own working
// prompt asked for — full colour, and a tagline — and it never described the actual business in
// plain words, because the subject had been handed to the concept desk as an abstraction.
//
// The prompt that produced good work in shoot.html was fifty words: what the company is, what
// it does, that the name goes in the mark, and the tagline. Subject first, standards second,
// prohibitions last and short. That is what this now does. The elite standards are still here
// — they are simply no longer shouting over the brief.
async function identityWorkOrder(spec, name, kit, smallMark) {
  const hexes = [];
  ((kit && kit.palettes) || []).forEach(function (p) {
    ((p && p.colors) || []).forEach(function (c) { const h = (c && (c.hex || c)) || ''; if (h) hexes.push(h); });
  });
  ((kit && kit.colors) || []).forEach(function (c) { const h = (c && (c.hex || c)) || ''; if (h) hexes.push(h); });
  const pal = hexes.filter(function (h, i) { return hexes.indexOf(h) === i; }).slice(0, 4);

  const business = (kit && kit.seed) || '';
  const intent = identityIntent(spec.request_text);
  const p = [];

  if (smallMark) {
    p.push('A clean, brandable app icon and favicon mark for "' + name + '"' +
           (business ? ', a company that ' + String(business).slice(0, 200) : '') + '.');
    p.push('The symbol alone — no lettering, no name, no tagline anywhere in the image.');
    p.push('Pure geometric form and the negative space between shapes. Bold, simple, ' +
           'unmistakable at sixteen pixels: thick strokes, no fine detail, no small gaps. ' +
           'Reads as a solid silhouette. Sits correctly in a circle and in a rounded square.');
  } else {
    p.push('A commercial brand logo for "' + name + '"' +
           (business ? ', a company that ' + String(business).slice(0, 200) : '') + '.');
    p.push('The wording "' + name + '" is part of the logo design, spelled exactly, in ' +
           'confident custom letterforms drawn to one consistent weight and spacing.');
    if (intent.wantsTagline && intent.tagline) {
      p.push('A separate tagline beneath, set smaller and lighter: "' + intent.tagline + '".');
    }
    p.push('One strong symbol paired with the wordmark, reduced to the fewest shapes that carry ' +
           'the idea — the Paul Rand principle. Balanced, memorable, and readable small.');
  }

  // Colour follows the request, not a rule. The old prompt capped it at two and the Founder's
  // working prompt asked for full colour; the request should decide.
  if (intent.fullColour) {
    p.push('Full, rich colour — a confident brand palette, cleanly applied in flat areas.');
    if (pal.length) p.push('Build it around ' + pal.join(', ') + '.');
  } else if (pal.length) {
    p.push('Brand colours: ' + pal.join(', ') + '.');
  }

  p.push('Professional, brandable, agency quality. Flat vector artwork on a plain white ' +
         'background, centered with generous margins.');
  p.push('Avoid: gradients, gloss, bevels, drop shadows, 3D effects, generic swooshes, shields ' +
         'and badges, clip-art, and any stray or garbled lettering. Crisp edges, clean flat colour.');

  return { format: spec.slug, engine: 'image',
           spec: { aspect: '1:1', size: '2K', pieces: 1 }, pieces: 1, prompts: [p.join(' ')] };
}

// The identity, photographed as a physical object. Concept-led like the mark itself, so the
// form shown is the same idea — but note honestly what this is and is not: the engine paints
// the mark again inside the photograph rather than compositing the delivered file, so it is a
// presentation VISUALIZATION, not a photograph of the exact artwork. Pixel-identical mockups
// require compositing the real mark onto a material plate, which is a different build.
const MATERIALS = [
  'precision-engraved into a brushed dark titanium plate, the cut catching a hard raking light',
  'deep-embossed into heavy matte cotton paper stock, lit from a low angle so the emboss casts real shadow',
  'cast in solid antiqued brass, hand-polished on the raised surfaces only',
  'etched into thick low-iron glass, backlit so the frosted cut glows against a dark field',
  'blind-debossed into full-grain leather, the grain visible, the impression clean',
  // AGENCY PRESENTATION PAGE (2026-07-27, Founder sheet). The identity as it appears on a
  // presentation board in a design house — printed on heavy warm-white cotton rag, shot as an
  // editorial macro. This is the look the sheet asked for, kept where it belongs: on the
  // presentation artifact, never on the deliverable file.
  'printed on a heavy textured warm-white cotton rag presentation page, laid flat on a studio ' +
    'surface and shot as an editorial macro — crisp raking shadow across the paper grain, ' +
    'museum-archive presentation quality',
  // THE APP TILE. The small mark presented as a physical object, per the same sheet.
  'rendered as a physical minimalist tile with subtle tactile depth, centered on a solid matte ' +
    'charcoal field, studio rim lighting picking out the edge of the form'
];
function materialFor(text, slug) {
  if (/titanium|metal|steel|aluminium|aluminum/i.test(text)) return MATERIALS[0];
  if (/paper|card|stationery|letterhead|stock/i.test(text)) return MATERIALS[1];
  if (/brass|bronze|gold|medal/i.test(text))                return MATERIALS[2];
  if (/glass|acrylic|window/i.test(text))                   return MATERIALS[3];
  if (/leather|hide/i.test(text))                           return MATERIALS[4];
  if (/presentation *page|agency|case *study|board|cotton|rag|editorial/i.test(text)) return MATERIALS[5];
  if (/tile|app *icon|favicon|charcoal|dark *field/i.test(text))                      return MATERIALS[6];
  let h = 0; for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return MATERIALS[h % MATERIALS.length];
}

async function mockupWorkOrder(spec, name, kit) {
  const hexes = [];
  ((kit && kit.palettes) || []).forEach(function (p) {
    ((p && p.colors) || []).forEach(function (c) { const h = (c && (c.hex || c)) || ''; if (h) hexes.push(h); });
  });
  ((kit && kit.colors) || []).forEach(function (c) { const h = (c && (c.hex || c)) || ''; if (h) hexes.push(h); });
  const pal = hexes.filter(function (h, i) { return hexes.indexOf(h) === i; }).slice(0, 3);
  const business = (kit && kit.seed) || '';

  let c = null;
  try { c = await conceptDesk.concept(name, business, pal); } catch (e) { c = null; }

  const p = [];
  p.push('A cinematic macro product photograph of a brand identity rendered as a physical object.');
  p.push('THE MARK IN THE PHOTOGRAPH: ' + (c && c.symbol
    ? c.symbol
    : 'a single reductive geometric symbol carrying one idea, in the fewest possible shapes, with no container around it.'));
  if (c && c.idea) p.push('It means: ' + c.idea);
  if (!wantsSmallMark(spec.request_text)) {
    p.push('Beneath the symbol, the name "' + name + '" set in immaculate custom letterforms — every ' +
           'letter correct, all on one system, one stroke weight, one proportion.');
  } else {
    p.push('The symbol ALONE — no wordmark, no letters, no name anywhere on the object.');
  }
  p.push('THE MATERIAL: ' + materialFor(spec.request_text, spec.slug) + '.');
  p.push('Cinematic studio lighting, macro photography, shallow depth of field, sharp focus on the ' +
         'mark, honest material texture, real shadow, restrained reflection. Museum-object ' +
         'photography, not advertising gloss.');
  if (pal.length) p.push('Where colour appears it is drawn from ' + pal.join(', ') + ' and nowhere else.');
  p.push('Absolute design restraint: no gradients painted into the mark, no drop shadows on the ' +
         'artwork itself, no bevels, no 3D extrusion of the letterforms, no swooshes, arrows, ' +
         'chevrons, globes, shields, crests or badges. The depth in this image comes from the ' +
         'physical material and the light, never from effects applied to the design.');
  p.push('One object, centered, generous negative space around it, plain dark or neutral surface ' +
         'beneath. Nothing else in the frame — no hands, no props, no text other than the name on ' +
         'the object itself.');

  return { format: spec.slug, engine: 'image',
           spec: { aspect: (spec.aspect || '1:1'), size: '2K', pieces: 1 },
           pieces: 1, prompts: [p.join(' ')], concept: c };
}

// ---- handler -----------------------------------------------------------------------------
// THE SYNCHRONOUS BUDGET (2026-07-27). This function is NOT a background function — it has a
// hard platform ceiling somewhere under a minute, and it is the command bar's only backend.
//   spec desk  up to  9s
//   concept    up to  9s   (identity requests only)
//   render        ~26s
//   judge      up to  8s   (identity requests only)
// A photograph is spec + render and finishes comfortably. Identity work added two more model
// calls and the invocation was killed before ANY art was saved — no asset, no charge, nothing
// on the shelf. Verified twice in production.
//
// So the judge is now TIME-AWARE on this path: it only runs if there is measurably room after
// the render. It always runs in logo-concepts-background.js, which is a real background
// function with a 15-minute ceiling and where client logos are actually made.
const SYNC_JUDGE_BUDGET_MS = parseInt(process.env.SMN_SYNC_JUDGE_BUDGET_MS || '30000', 10);

exports.handler = async function (event) {
  const T0 = Date.now();
  if (event.httpMethod === 'OPTIONS') return resp(200, { success: true });
  if (event.httpMethod !== 'POST') return fail(405, 'method_not_allowed');
  if (!SB_URL || !SB_SERVICE) return fail(500, 'missing_supabase_env');

  let token = '', reportId = '', assetType = '', brandName = '', openText = '', answers = {}, take = '';
  try {
    const b = JSON.parse(event.body || '{}');
    token     = String(b.access_token || '').slice(0, 4000);
    reportId  = String(b.brand_id || b.r || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    assetType = String(b.asset_type || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
    brandName = String(b.brand_name || b.name || '').slice(0, 120);
    openText  = String(b.custom_request || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    // Caller-supplied take token. Sanitised hard: it becomes part of a storage path and a
    // database key, so only lowercase letters and digits survive.
    take      = String(b.take || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
    if (b.answers && typeof b.answers === 'object' && !Array.isArray(b.answers)) {
      answers = {
        purpose: String(b.answers.purpose || '').slice(0, 200),
        format:  String(b.answers.format  || '').slice(0, 120),
        custom:  String(b.answers.custom  || '').slice(0, 300),
        look:    String(b.answers.look    || '').slice(0, 60)
      };
    }
  } catch (e) { return fail(400, 'bad_request_body'); }

  if (!token)    return fail(401, 'no_token');
  if (!reportId) return fail(400, 'missing_brand_id');
  if (!assetType && !openText) return fail(400, 'missing_asset_type');

  // TWO SHAPES, ONE ENGINE.
  //   Registry path — a named row, exactly as before.
  //   Open path     — free text the customer typed. Resolved to a real spec by the spec desk
  //                   and handed to the same five gates. Nothing below this line branches on
  //                   which shape it is except the prompt itself, which is the point.
  let row, spec = null, openMode = false;
  if (assetType) {
    // NOTE: registry.active() is deliberately NOT consulted — the global switches govern the
    // batch path, and this path is per-request.
    row = registry.row(assetType);
    if (!row) return fail(400, 'unknown_asset_type', { allowed: Object.keys(registry.ROWS) });
  } else {
    openMode = true;
    try { spec = await specDesk.resolve(openText); }
    catch (e) { return fail(500, 'spec_resolution_failed'); }
    assetType = spec.slug;                       // slug is already [a-z0-9_] and length-capped
    row = { id: spec.slug, label: spec.label, engine: 'image',
            spec: { aspect: spec.aspect, size: spec.size, pieces: 1 } };
  }

  // GATE 1 — ownership. token -> email -> report.
  let email = '';
  try {
    const u = await fetch(SB_URL + '/auth/v1/user', {
      headers: { 'Authorization': 'Bearer ' + token, 'apikey': SB_ANON || SB_SERVICE }
    });
    if (u.status >= 300) return fail(401, 'invalid_token');
    const user = await u.json();
    email = (user && user.email) ? String(user.email).toLowerCase() : '';
  } catch (e) { return fail(401, 'token_verification_failed'); }
  if (!email) return fail(401, 'no_email_on_token');

  try {
    const own = await fetch(
      SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(reportId) + '&select=id,email&limit=1',
      { headers: svcH() });
    const rows = await own.json().catch(function () { return []; });
    const rep = Array.isArray(rows) && rows[0];
    if (!rep) return fail(404, 'brand_not_found');
    if (String(rep.email || '').toLowerCase() !== email) return fail(403, 'not_your_brand');
  } catch (e) { return fail(500, 'ownership_check_failed'); }

  const dbRow = await loadRow(reportId, brandName);
  if (!dbRow) return fail(404, 'no_activated_brand');
  const kit = (dbRow.kit && typeof dbRow.kit === 'object' && !Array.isArray(dbRow.kit)) ? dbRow.kit : {};
  const name = dbRow.name || brandName || '';

  // GATE 2 — activation. Only a paid, activated brand may spend.
  // EXCEPTION (2026-07-30, Founder order): a PRESENTATION STUDY is allowed for any name in an
  // order the caller OWNS, activated or not — so every one of the six names can be shown "in the
  // world." Safe: an openMode wantsMockup request can ONLY build a study (the wantsMockup ->
  // mockupWorkOrder routing), so no other paid asset slips through, and ownership above is still
  // required. Kept in lockstep with the same gate in generate-asset-background.js.
  if (kit._activated !== true && !(openMode && wantsMockup(openText))) return fail(402, 'brand_not_activated');

  // WHERE THIS ASSET WILL LIVE.
  // Normally the resolved id: ask twice, get the cached copy back for free.
  //
  // A FRESH TAKE IS NAMED BY THE CALLER, NOT BY THE SERVER (2026-07-27). The first version
  // of this took "fresh" to mean "file under the next free slot" — _v2, then _v3. That is
  // fine exactly once. But the shelf polls the identical request while a render is running,
  // and by the second poll _v2 had saved, so the server found the next free slot and started
  // a SECOND PAID RENDER. One click, two charges, thirty-six seconds apart. Confirmed in
  // production and paid for by the Founder.
  //
  // So the caller now stamps each take with its own token and repeats that token on every
  // poll. The key is then stable for the life of the take: the idempotency claim catches the
  // poll while the render runs, and the cache gate catches it the moment it finishes. A new
  // take costs money only when a human presses the button, which was always the intent.
  kit.assets = kit.assets || {};
  const storeKey = take ? (assetType + '_' + take) : assetType;

  // GATE 4 (checked before 3: a cache hit costs nothing and needs no claim).
  if (kit.assets[storeKey] && kit.assets[storeKey].url) {
    return resp(200, {
      success: true, asset_id: storeKey, download_url: kit.assets[storeKey].url,
      label: kit.assets[storeKey].label || row.label || assetType, open: openMode,
      cached: true, spent: spendTotal(kit), cap: r4(CAP_USD)
    });
  }

  // GATE 3 — idempotency. Brand + asset + a 60-second window, hashed into a storage claim.
  // claimOnce uploads with x-upsert:false; the storage API 409s if the object exists, which
  // makes it a genuine atomic test-and-set rather than a read-then-write race.
  const windowId = Math.floor(Date.now() / 1000 / IDEM_WINDOW_S);
  const idemHash = crypto.createHash('sha256')
    .update(reportId + '|' + name + '|' + storeKey + '|' + windowId).digest('hex').slice(0, 32);
  // THE CLAIM MOVED TO THE BACKGROUND SIDE (2026-07-27). It used to be taken here, which meant
  // a dispatch that silently failed still left the key claimed — locking the customer out of
  // retrying the same words for five minutes while nothing was actually running. The background
  // twin claims instead: two rapid clicks both dispatch, the first claim wins, the second exits.
  void idemHash;

  // ---- HAND OFF ------------------------------------------------------------------------------
  // Everything above is fast: auth, ownership, activation, spec lookup, cache, the claim.
  // Everything below WAS slow — a 21-25 second render inside a function Netlify kills at 26.
  // It now runs in generate-asset-background.js, which has a 15-minute ceiling.
  //
  // The shelf already knows how to wait: it re-sends the identical request every six seconds,
  // the claim above answers 'duplicate_request_in_progress' while work is in flight, and the
  // cache gate hands back the finished URL the moment it lands. Nothing on the client had to
  // change except understanding the word 'queued'.
  const BASE = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL ||
                'https://sparkmyname.netlify.app').replace(/\/$/, '');
  // THE HAND-OFF MUST BE VERIFIED (2026-07-27). fetch does NOT throw on 404 or 500 — a missing
  // or broken background endpoint returned quietly and this function reported 'queued' for work
  // that was never started. The shelf then polled for four minutes against nothing. A silent
  // dispatch failure is the worst kind: it looks exactly like success.
  //
  // Netlify answers a background invocation with 202 Accepted. Anything else is a real failure
  // and is now named on the pill rather than swallowed.
  let dispatchStatus = 0;
  try {
    // AWAITED deliberately: an un-awaited fetch dies when the handler returns. That defect was
    // found and fixed elsewhere in this codebase on 2026-07-05; it is not being repeated here.
    const d = await fetch(BASE + '/.netlify/functions/generate-asset-background', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(JSON.parse(event.body || '{}'))
    });
    dispatchStatus = d.status;
  } catch (e) {
    return fail(502, 'dispatch_failed', { detail: String(e && e.message || e).slice(0, 200) });
  }
  if (dispatchStatus !== 202 && (dispatchStatus < 200 || dispatchStatus >= 300)) {
    return fail(502, 'background_not_reachable', { status: dispatchStatus, base: BASE });
  }

  return resp(202, {
    success: false,           // not done yet — the shelf keeps polling on this
    queued: true,
    error: 'queued',
    asset_id: storeKey,
    label: row.label || assetType,
    open: openMode,
    spent: spendTotal(kit),
    cap: r4(CAP_USD)
  });
};

