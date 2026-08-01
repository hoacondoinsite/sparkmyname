// File: netlify/functions/judge-logo.js | Date: 2026-07-27
// THE JUDGE — looks at the rendered mark and rejects it.
//
// WHY THIS EXISTS
// ---------------
// SPARK LOGO LAW is written into the prompts, and a prompt is a request, not a guarantee. Until
// something LOOKS at the output, nobody knows whether the law was obeyed — the badge survived
// three prompt rewrites precisely because no one was checking the result, only the instruction.
//
// What separates a studio from a generator is not that its first attempt is better. It is that
// a studio throws work away. This module is that. It scores a rendered mark against the exact
// rejection test in docs/SPARK_LOGO_LAW.md and returns a verdict plus the specific defects, so
// the next attempt can be told what was wrong rather than simply rolled again.
//
// HARD GATES vs SCORE
// -------------------
// Some failures are not matters of degree. A container around the mark, a misspelled name, a
// gradient, a mark that dissolves at thumbnail size — any one of those is a reject at any score.
// Everything else contributes to a 100-point total with a floor. Both must pass.
//
// FAILURE POSTURE: the judge NEVER blocks delivery. If the vision call is unreachable, times
// out, or returns something unparseable, the verdict is 'unknown' and the caller ships the art.
// A judge that can strand a paid customer's order is worse than no judge.
//
// Env: OPENAI_API_KEY
'use strict';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.SMN_JUDGE_MODEL || 'gpt-4o-mini';
// 20s was too generous: the judge sits INSIDE a synchronous function that has already spent
// 25s rendering, and the platform kills the whole invocation before anything is saved. A
// verdict that arrives after the function is dead is worth nothing. 8s is comfortably enough
// for a single vision call on one image, and a slow judge now degrades to 'unknown' — which
// ships the art — instead of taking the render down with it.
const TIMEOUT_MS = parseInt(process.env.SMN_JUDGE_TIMEOUT_MS || '7000', 10);

// The floor a mark must clear on the scored portion. Deliberately high: this is the standard
// the Founder set — Nike, Apple, FedEx, Mercedes — not a passing grade.
// RECALIBRATED 2026-07-27. Was 82 with a codex floor of 8.5 on all four axioms at once, while
// the brief told the judge "most work does not reach 8.5". Nothing could pass, and the law
// would have rejected Mercedes (a star in a ring — has_container), Nike and Apple (no letters,
// so grid_uniformity scored near zero), National Geographic (a frame) and IBM (stripes that
// muddy at 16px). A standard that rejects four of the eight marks it was written to emulate is
// not strict, it is broken.
//
// The bar is now set where a clean, specific, well-drawn mark for a real local business passes,
// and 9-10 is reserved for elite execution. The judge RANKS; only genuinely broken work is
// vetoed.
const SCORE_FLOOR = parseInt(process.env.SMN_JUDGE_FLOOR || '72', 10);

// THE GLOBAL DESIGN CODEX (2026-07-27, Founder order). Four master axioms, each scored 0-10
// and each with its own floor. This is STRICTER than the aggregate: a mark could previously
// total 82 while being weak on one axiom and still pass, because strength elsewhere covered
// for it. An identity has no elsewhere — a wobbling wordmark is not redeemed by a clever
// symbol. Every axiom must clear on its own.
const CODEX_FLOOR = parseFloat(process.env.SMN_CODEX_FLOOR || '7.5');
const CODEX_AXIOMS = ['elemental_simplicity', 'grid_uniformity', 'silhouette_integrity', 'flatness'];

// Any true value here is an immediate reject regardless of score.
// Applies only when the mark actually carries lettering. A favicon has no wordmark by law —
// punishing it for that is punishing it for obeying the brief.
const TYPE_DEPENDENT = ['name_misspelled', 'letterforms_inconsistent'];
const TYPE_DEPENDENT_AXIOM = 'grid_uniformity';

const HARD_GATES = [
  'has_container',        // ring, shield, badge, crest, frame holding it together
  'has_gradient',         // gradient, gloss, metallic, bevel, drop shadow, glow, 3D
  'name_misspelled',      // the single most expensive failure — it reaches print
  'fails_silhouette',     // becomes a blob when filled solid black
  'fails_thumbnail',      // unreadable at 16px
  'letterforms_inconsistent', // wordmark not drawn to one system
  'is_photograph'         // a photo, a mockup, a material surface — not flat artwork
];

const SYS = [
  'You are the brand director who signs off identity work at a strong studio. You are here to',
  'RANK, and to catch genuine faults. You are not here to fail everything: a clean, specific,',
  'well-drawn mark for a real business is good work and should be recognised as good work.',
  '',
  'You will be shown a rendered brand mark and told the business name it must carry.',
  '',
  'FIRST, one observation that changes how you judge the rest:',
  '  has_wordmark — does the image contain the business name as lettering? Some marks are',
  '                 symbol-only by design (favicons, app icons, avatars). If there is no',
  '                 lettering, has_wordmark is false and you must NOT penalise it for that.',
  '',
  'Then these gates. Each is a true/false observation about what you can actually SEE — not',
  'what you assume was intended. Only mark one true when it is plainly, visibly the case:',
  '  has_container            — is the mark propped up by a decorative frame doing work the mark',
  '                             could not do alone? A ring, roundel or geometric enclosure that IS',
  '                             the idea is fine — the Mercedes star sits in a ring and that ring',
  '                             is structure, not a hiding place. A generic shield, crest or badge',
  '                             wrapped around an unrelated symbol is the failure. Judge the',
  '                             intent of the geometry, not the presence of a shape.',
  '  has_gradient             — a visible gradient, gloss, metallic sheen, bevel, drop shadow,',
  '                             glow or 3D extrusion. Flat colour is not a gradient.',
  '  name_misspelled          — ONLY IF has_wordmark. Read the lettering character by character.',
  '                             Any missing, doubled, malformed or invented letter is true. If',
  '                             there is no lettering, return false.',
  '  fails_silhouette         — filled solid black with all interior detail removed, does it',
  '                             become an unidentifiable blob? A mark that stays recognisable in',
  '                             solid black passes, even if it loses some refinement.',
  '  fails_thumbnail          — at 16 pixels wide, would it become genuinely unreadable? Fine',
  '                             detail softening is normal and acceptable — IBM\'s stripes soften',
  '                             and that mark is a masterpiece. Only mark true if the mark would',
  '                             be unidentifiable, not merely simplified.',
  '  letterforms_inconsistent — ONLY IF has_wordmark. Do the letters share one stroke weight, one',
  '                             proportion and one spacing logic? Obvious wobble, drift or',
  '                             mismatched weight is true. If there is no lettering, return false.',
  '  is_photograph            — a photograph, a mockup, or artwork sitting on a material surface,',
  '                             rather than flat graphic artwork.',
  '',
  'THE GLOBAL DESIGN CODEX. Four axioms, each scored 0 to 10, drawing on Paul Rand, Apple\'s',
  'Human Interface Guidelines and IBM Carbon.',
  '',
  'CALIBRATION — anchor yourself to real work, not to an abstract ideal:',
  '  10  Nike, Apple, FedEx, Mercedes-Benz. Permanent, inevitable, nothing to remove.',
  '  9   Elite execution. A mark a top-tier studio would present and defend.',
  '  8   Clean, specific, well-drawn, genuinely usable. A good local business would be proud of',
  '      it and it would serve them for years. THIS IS A PASS AND IT IS NOT A CONSOLATION.',
  '  6   Competent but forgettable. Nothing wrong, nothing memorable.',
  '  4   Generic. Interchangeable with any company in the trade.',
  '  2   Broken. Clutter, incoherence, or a fault you can name in one glance.',
  '',
  '  elemental_simplicity  — reduced to its elemental form, no clutter, no unnecessary stroke.',
  '                          Score 8 when nothing obvious is left to remove; 9-10 when the',
  '                          reduction itself is the achievement.',
  '  grid_uniformity       — ONLY IF has_wordmark. Do the letterforms sit on one system:',
  '                          consistent stroke weight, consistent optical proportion, deliberate',
  '                          kerning? Judge spacing as carefully as shapes. IF there is no',
  '                          lettering, return null for this axiom — not zero.',
  '  silhouette_integrity  — does it hold at small size and stand without a frame propping it up?',
  '  flatness              — flat vector-ready graphic work. Visible gradient, metallic texture,',
  '                          gloss, drop shadow, bevel or 3D extrusion scores below 5.',
  '',
  'Then score these, 0 to the maximum shown:',
  '  idea (25)        — one clear idea, specific to this business, not interchangeable with any',
  '                     other company in its trade',
  '  reduction (20)   — could anything be removed without breaking it? Fewer shapes scores higher',
  '  craft (20)       — geometric precision, optical balance, deliberate negative space',
  '  typography (20)  — ONLY IF has_wordmark: letterform quality and the fit between wordmark and',
  '                     symbol. If there is no lettering, return null.',
  '  originality (15) — does it resemble any existing mark in the world, or any stock trope?',
  '',
  'Return JSON only, with exactly these keys: has_wordmark, has_container, has_gradient,',
  'name_misspelled, fails_silhouette, fails_thumbnail, letterforms_inconsistent, is_photograph',
  '(all booleans); elemental_simplicity, grid_uniformity, silhouette_integrity, flatness',
  '(numbers 0-10, or null where not applicable); idea, reduction, craft, typography, originality',
  '(integers, or null where not applicable); defects (array of up to 4 short imperative strings',
  'naming exactly what is wrong — "remove the circular frame", "thicken the counter of the P");',
  'and one_line (a single sentence verdict).'
].join(' ');

function clampInt(v, lo, hi) {
  const n = Math.round(Number(v));
  if (!isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}
function asBool(v) { return v === true || v === 'true' || v === 1; }
function clampAxiom(v) {
  const n = Number(v);
  if (!isFinite(n)) return 0;                    // absent or garbage is a zero, never a free pass
  return Math.min(10, Math.max(0, Math.round(n * 10) / 10));
}

// Pure, synchronous, and exported so it can be tested without a network.
function verdictFrom(raw, floor, codexFloor) {
  const F  = typeof floor === 'number' ? floor : SCORE_FLOOR;
  const CF = typeof codexFloor === 'number' ? codexFloor : CODEX_FLOOR;

  // Does this mark carry lettering at all? Everything typographic hangs off this. A favicon is
  // symbol-only BY LAW, so scoring it against letterform quality punished it for obeying the
  // brief — and silently failed every small mark we made.
  const hasWordmark = asBool(raw && raw.has_wordmark);

  const gates = {};
  HARD_GATES.forEach(function (g) {
    const tripped = asBool(raw && raw[g]);
    // A type-dependent gate cannot fire on a mark with no type.
    gates[g] = (!hasWordmark && TYPE_DEPENDENT.indexOf(g) >= 0) ? false : tripped;
  });
  const failed = HARD_GATES.filter(function (g) { return gates[g]; });

  // Codex. grid_uniformity is not applicable without lettering — null, never zero.
  const codex = {};
  CODEX_AXIOMS.forEach(function (a) {
    if (!hasWordmark && a === TYPE_DEPENDENT_AXIOM) { codex[a] = null; return; }
    codex[a] = clampAxiom(raw && raw[a]);
  });
  const codexFailed = CODEX_AXIOMS.filter(function (a) {
    return codex[a] !== null && codex[a] < CF;
  });

  // Scored portion, normalised to 100 over whatever actually applies. Typography drops out
  // for a symbol-only mark, so its 20 points are removed from the denominator rather than
  // scored as zero — otherwise every favicon starts 20 points down for no fault of its own.
  const MAXES = { idea: 25, reduction: 20, craft: 20, typography: 20, originality: 15 };
  const scores = {};
  let earned = 0, possible = 0;
  Object.keys(MAXES).forEach(function (k) {
    if (!hasWordmark && k === 'typography') { scores[k] = null; return; }
    scores[k] = clampInt(raw && raw[k], 0, MAXES[k]);
    earned += scores[k];
    possible += MAXES[k];
  });
  const total = possible ? Math.round((earned / possible) * 100) : 0;

  const defects = (Array.isArray(raw && raw.defects) ? raw.defects : [])
    .slice(0, 4).map(function (d) { return String(d).slice(0, 120); });

  return {
    pass: failed.length === 0 && codexFailed.length === 0 && total >= F,
    total: total,
    floor: F,
    has_wordmark: hasWordmark,
    codex: codex,
    codex_floor: CF,
    failed_axioms: codexFailed,
    gates: gates,
    failed_gates: failed,
    scores: scores,
    defects: defects,
    one_line: String((raw && raw.one_line) || '').slice(0, 240),
    verdict: failed.length ? 'hard_reject'
           : (codexFailed.length ? 'codex_fail'
           : (total >= F ? 'pass' : 'below_floor'))
  };
}

// The unknown verdict. Never blocks: pass is true so a caller that ships on pass still ships.
function unknown(reason) {
  return {
    pass: true, unknown: true, reason: reason, total: null, floor: SCORE_FLOOR,
    gates: {}, failed_gates: [], scores: {}, defects: [], one_line: '',
    codex: {}, codex_floor: CODEX_FLOOR, failed_axioms: [],
    verdict: 'unknown'
  };
}

// imageB64 — raw base64, no data: prefix. mime — image/png or image/jpeg.
async function judge(imageB64, mime, name, opts) {
  opts = opts || {};
  const floor = typeof opts.floor === 'number' ? opts.floor : SCORE_FLOOR;
  if (!OPENAI_KEY) return unknown('no_api_key');
  if (!imageB64)   return unknown('no_image');

  const ctrl = new AbortController();
  const t = setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,                       // judging is not a creative act
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYS },
          { role: 'user', content: [
            { type: 'text', text: 'The business name this mark must carry, spelled exactly: "' +
                                  String(name || '').slice(0, 80) + '". Judge the image.' },
            { type: 'image_url', image_url: {
                url: 'data:' + (mime || 'image/png') + ';base64,' + imageB64, detail: 'high' } }
          ] }
        ]
      })
    });
    clearTimeout(t);
    if (!r.ok) return unknown('http_' + r.status);
    const data = await r.json();
    let c = (((data.choices || [])[0] || {}).message || {}).content || '';
    c = c.replace(/```json|```/g, '').trim();
    let parsed;
    try { parsed = JSON.parse(c); } catch (e) { return unknown('unparseable'); }
    if (!parsed || typeof parsed !== 'object') return unknown('not_an_object');
    return verdictFrom(parsed, floor);
  } catch (e) {
    clearTimeout(t);
    return unknown(/abort/i.test(String(e && e.message || e)) ? 'timeout' : 'error');
  }
}

// Turn a verdict into a correction the next attempt can act on. Empty string when there is
// nothing to say, so a caller can test it directly.
function correctionFrom(v) {
  if (!v || v.unknown || v.pass) return '';
  const parts = [];
  const NAMED = {
    has_container:            'Remove the ring, shield, badge, crest or frame entirely — the mark must stand with no container.',
    has_gradient:             'Remove every gradient, gloss, metallic finish, bevel, drop shadow, glow and any 3D or faux depth. Flat colour only.',
    name_misspelled:          'The name is misspelled. Set every character correctly, exactly as given, nothing added or dropped.',
    fails_silhouette:         'It collapses when filled solid black. Rebuild it so the silhouette alone is identifiable.',
    fails_thumbnail:          'It dies at small size. Remove fine lines, small gaps and interior detail; thicken every stroke.',
    letterforms_inconsistent: 'The letterforms are not on one system. Redraw the wordmark with a single stroke weight, one proportion and even spacing.',
    is_photograph:            'This must be flat graphic artwork on plain white — no photograph, no mockup, no material surface, no lighting.'
  };
  const AXIOM = {
    elemental_simplicity: 'Codex failure, elemental simplicity: the mark is not reduced far enough. ' +
      'Delete every element that is not carrying meaning and rebuild it from the fewest forms that survive.',
    grid_uniformity: 'Codex failure, grid uniformity: the letterforms show stroke drift and inconsistent ' +
      'kerning. Redraw the wordmark on one strict mathematical system — a single stroke weight, one optical ' +
      'proportion, deliberate and even letter-spacing.',
    silhouette_integrity: 'Codex failure, silhouette integrity: it does not hold at 16x16 or it is leaning ' +
      'on a container. Thicken every stroke, open every gap, and remove any box, ring or shield propping it up.',
    flatness: 'Codex failure, flatness: strip every gradient, metallic texture, gloss, drop shadow, bevel and ' +
      'any 3D extrusion. Pure flat vector-ready artwork only.'
  };
  (v.failed_gates || []).forEach(function (g) { if (NAMED[g]) parts.push(NAMED[g]); });
  (v.failed_axioms || []).forEach(function (a) { if (AXIOM[a]) parts.push(AXIOM[a]); });
  (v.defects || []).forEach(function (d) { if (d) parts.push(d); });
  if (!parts.length && (v.verdict === 'below_floor' || v.verdict === 'codex_fail')) {
    parts.push('It is competent but forgettable. Find a stronger, more specific idea and reduce it further.');
  }
  return parts.length ? ('CORRECT THESE FAULTS FROM THE PREVIOUS ATTEMPT: ' + parts.join(' ')) : '';
}

module.exports = {
  judge: judge,
  CODEX_AXIOMS: CODEX_AXIOMS,
  CODEX_FLOOR: CODEX_FLOOR,
  verdictFrom: verdictFrom,
  correctionFrom: correctionFrom,
  HARD_GATES: HARD_GATES,
  SCORE_FLOOR: SCORE_FLOOR
};
