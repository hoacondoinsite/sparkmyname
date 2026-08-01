// SparkMyName — THE BRAND GOVERNOR: SCHEMA & LAW (SOP-BG-001 — NEW FILE, 2026-07-05)
// The seven objects, the frozen vocabularies (spec passes 1–3, Founder-approved), the
// deterministic law floor, the fallback brief, and the Identity Triple rules (Appendix D).
// Pure rules — zero AI, zero network. Every constant here is FROZEN by specification.
'use strict';

// ---- FROZEN PRIMITIVES (July 5, 2026 spec) -------------------------------------------
var SITUATIONS = ['urgent_problem','high_trust_decision','appetite_sensory_desire',
  'aspirational_upgrade','identity_expression','safety_protection','expert_guidance',
  'convenience_relief','status_prestige','community_belonging','transformation','entertainment_delight'];

var BEFORE = ['stressed','anxious','skeptical','overwhelmed','confused','exposed','stuck',
  'burdened','bored','ordinary','craving','curious'];
var AFTER  = ['relieved','confident','guided','reassured','protected','in_control','eager',
  'delighted','proud','belonging','elevated','moved'];

// Universal claim floor (LAW: claim_safety) — deterministic, absolute.
var BANNED_TERMS = ['guaranteed','guarantee','risk-free','risk free','no risk','miracle',
  'always approved','guaranteed approval','guaranteed savings','guaranteed returns','cure',
  'cures','instant results','100% safe','best in the world','we always win'];

// Red-zone territories: human_review_required defaults TRUE regardless of confidence.
var RED_ZONES = ['legal','law','attorney','medical','health','clinic','doctor','therapy',
  'finance','financial','insurance','mortgage','wealth','childcare','eldercare','security',
  'surgery','vascular','pharma'];

// Fear-word floor for name review (Selection Gate lock): the before-state may never be
// bolted onto a brand name. Extended per-brief by gate_kill_words.
var FEAR_WORDS = ['leak','drain','clog','crack','breakdown','failure','pain','debt','crash',
  'mold','pest','stain','damage','emergency','panic','broke','broken'];

// ---- BRIEF VALIDATION -----------------------------------------------------------------
// The seven objects, compact form the AI must return. Required keys per object.
var SHAPE = {
  truth:   ['name'],                                     // TruthLock (name verbatim; missing[] honest)
  human:   ['primary_audience','situation'],             // HumanModel
  shift:   ['before','after','promise'],                 // ShiftCore
  trust:   ['competence','warmth','vitality','builders','destroyers'], // TrustFrame
  signal:  ['must_signal','cliches_to_avoid'],           // SignalMap (+ optional kill_words)
  world:   ['feel','shape_language','light','palette_logic','voice','words_to_avoid'], // WorldRules
  gate:    ['weights'],                                  // JudgmentGate (per-brand emphasis)
};

function validateBrief(b){
  var issues = [];
  if (!b || typeof b !== 'object') return { ok:false, issues:['not an object'] };
  Object.keys(SHAPE).forEach(function(obj){
    if (!b[obj] || typeof b[obj] !== 'object') { issues.push('missing object: ' + obj); return; }
    SHAPE[obj].forEach(function(f){
      var v = b[obj][f];
      var emptyLegal = (obj === 'truth' && f === 'name'); // front door: name not yet chosen
      if (v === undefined || v === null || (!emptyLegal && v === '')) issues.push(obj + '.' + f + ' missing');
    });
  });
  if (b.human && SITUATIONS.indexOf(b.human.situation) === -1) issues.push('situation not in frozen 12');
  if (b.shift && BEFORE.indexOf(b.shift.before) === -1) issues.push('before not in frozen vocabulary');
  if (b.shift && AFTER.indexOf(b.shift.after)   === -1) issues.push('after not in frozen vocabulary');
  if (b.trust) {
    var sum = (b.trust.competence|0) + (b.trust.warmth|0) + (b.trust.vitality|0);
    if (sum !== 100) issues.push('trust mix must sum to 100 (got ' + sum + ')');
  }
  if (!b.meta || typeof b.meta.human_review_required !== 'boolean') issues.push('meta.human_review_required missing');
  return { ok: issues.length === 0, issues: issues };
}

function isRedZone(text){
  var t = String(text || '').toLowerCase();
  return RED_ZONES.some(function(z){ return t.indexOf(z) !== -1; });
}

// Neutral professional fallback (SOP: the order NEVER stalls on the brain).
function fallbackBrief(seed){
  return {
    truth:  { name: '', missing: ['tagline','palette','core_copy'] },
    human:  { primary_audience: 'a capable adult choosing a provider for: ' + String(seed||'').slice(0,140),
              situation: 'expert_guidance', urgency: 'medium', trust_required: 'high' },
    shift:  { before: 'skeptical', after: 'confident',
              promise: 'From skeptical to confident in a provider who clearly knows the work.' },
    trust:  { competence: 60, warmth: 30, vitality: 10,
              builders: ['clarity','specificity','visible process','clean craft'],
              destroyers: ['hype','clutter','overclaiming'] },
    signal: { must_signal: ['what this business is, within two seconds','professional competence'],
              can_signal: [], must_not: [], cliches_to_avoid: ['generic stock tropes'], kill_words: [] },
    world:  { feel: 'calm professional confidence', shape_language: 'grounded, precise',
              light: 'clean, even, natural', palette_logic: 'one confident dominant, one accent, quiet neutral',
              composition: 'single focal idea, generous space',
              voice: ['clear','steady','specific'], words_to_use: [], words_to_avoid: BANNED_TERMS.slice(0,6),
              forbidden_visuals: ['panic imagery','clutter','cartoonish styling'] },
    gate:   { weights: { situation_fit: 3, distinctiveness: 3, cliche: 3 } },
    meta:   { fallback: true, confidence: { category: 0.5, audience: 0.5, psychology: 0.5 },
              assumptions: ['fallback brief: the Governor call failed twice; neutral professional defaults govern'],
              human_review_required: true },
  };
}

// ---- LAW FLOOR (truth_integrity + claim_safety) — deterministic, absolute --------------
function lawFloor(text, opts){
  var violations = [];
  var t = String(text || '');
  var low = t.toLowerCase();
  BANNED_TERMS.forEach(function(term){ if (low.indexOf(term) !== -1) violations.push({ law: 'claim_safety', term: term }); });
  if (opts && opts.requireName) {
    if (t.indexOf(opts.requireName) === -1) violations.push({ law: 'truth_integrity', term: 'approved name missing/altered: ' + opts.requireName });
  }
  return { pass: violations.length === 0, violations: violations };
}

// ---- IDENTITY TRIPLE (Appendix D) — deterministic, zero cost ---------------------------
function deriveHandle(name){
  return String(name || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '').slice(0, 24);
}
function domainRoot(domain){
  return String(domain || '').toLowerCase().replace(/^www\./, '').split('.')[0].replace(/[^a-z0-9]/g, '');
}
// Lock 2 — handle harmony: <=15 chars (fits every platform identically), clean charset,
// derivable without hacks, and it MUST match the domain root.
function harmony(name, domain){
  var handle = deriveHandle(name);
  var root = domainRoot(domain);
  var reasons = [];
  if (!handle) reasons.push('no derivable handle');
  if (handle.length > 15) reasons.push('handle exceeds 15 characters (' + handle.length + ') — fails strictest platform');
  if (root && handle && handle !== root) reasons.push('handle "' + handle + '" does not match domain root "' + root + '"');
  return { handle: handle ? '@' + handle : '', pass: reasons.length === 0, reasons: reasons,
           availability: 'check_and_claim' }; // radical honesty: no platform registry exists;
                                              // 'appears_open' is reserved for probed-clean results only.
}

module.exports = { SITUATIONS: SITUATIONS, BEFORE: BEFORE, AFTER: AFTER,
  BANNED_TERMS: BANNED_TERMS, RED_ZONES: RED_ZONES, FEAR_WORDS: FEAR_WORDS,
  validateBrief: validateBrief, fallbackBrief: fallbackBrief, isRedZone: isRedZone,
  lawFloor: lawFloor, deriveHandle: deriveHandle, harmony: harmony };
