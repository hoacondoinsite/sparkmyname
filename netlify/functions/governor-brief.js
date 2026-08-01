// SparkMyName — THE BRAND GOVERNOR (SOP-BG-001 Phase 1 — NEW FILE, 2026-07-05)
// Runs FIRST, from the seed alone: one AI call fills the seven objects. Validate; one
// retry on malformed; the neutral fallback on the second failure — an order can NEVER
// stall on the brain. House pattern: OpenAI chat completions, same key as the engine.
// Callable in-process (runGovernor) by the Foreman/baton, and over HTTP for QA.
'use strict';
var schema = require('./governor-schema.js');
var ladder = require('./smn-ladder.js');
var foresight = require('./smn-foresight.js');

var KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
var MODEL = process.env.GOVERNOR_MODEL || 'gpt-4o-mini';

function buildPrompt(seed, lead){
  return 'You are the Brand Governor: a brand psychologist. From the business description ' +
  'alone, produce ONE JSON object with exactly these seven keys — truth, human, shift, trust, ' +
  'signal, world, gate — plus meta. Respond with JSON only, no prose, no markdown.\n\n' +
  'BUSINESS: ' + String(seed || '').slice(0, 400) + (lead ? ('\nAPPROVED NAME (verbatim, never altered): ' + lead) : '') + '\n\n' +
  'RULES:\n' +
  '- truth: { "name": ' + JSON.stringify(String(lead||'')) + ', "missing": [items not yet approved e.g. "tagline","palette"] } — NEVER invent facts.\n' +
  '- human: { "primary_audience": one vivid sentence about the human and their moment (not demographics), ' +
    '"situation": exactly one of ' + JSON.stringify(schema.SITUATIONS) + ', "urgency": "low|medium|high", "trust_required": "low|medium|high|very_high" }\n' +
  '- shift: { "before": one of ' + JSON.stringify(schema.BEFORE) + ', "after": one of ' + JSON.stringify(schema.AFTER) + ', ' +
    '"promise": one plain sentence bridging them }. Honor the before; NEVER manufacture or amplify it.\n' +
  '- trust: { "competence": int, "warmth": int, "vitality": int (MUST sum to exactly 100), ' +
    '"builders": [3-5 specific signals that create belief here], "destroyers": [3-5 that break it] }\n' +
  '- signal: { "must_signal": [2-3 cues so a stranger knows what this is in two seconds], "can_signal": [], ' +
    '"must_not": [], "cliches_to_avoid": [3-5 tired tropes of this territory that may never carry the main idea], ' +
    '"kill_words": [words that name the customer\'s FEAR or the broken state — these may never appear inside a brand name] }\n' +
  '- world: { "feel": one phrase, "shape_language": e.g. grounded/dynamic/organic/precise, "light": style, ' +
    '"palette_logic": roles and meaning (dominant/accent/neutral), "composition": rule, ' +
    '"voice": [3-4 adjectives], "words_to_use": [3-5], "words_to_avoid": [3-6], "forbidden_visuals": [3-5] }\n' +
  '- gate: { "weights": { "situation_fit": 1-5, "distinctiveness": 1-5, "cliche": 1-5 } } — where judging should bear down for THIS brand.\n' +
  '- meta: { "confidence": { "category": 0-1, "audience": 0-1, "psychology": 0-1 }, ' +
    '"assumptions": [every guess you made], "human_review_required": boolean (true if any confidence < 0.65) }';
}

async function callModel(seed, lead, signal){
  var r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', signal: signal,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
    body: JSON.stringify({ model: MODEL, temperature: 0.4, max_tokens: 1400,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildPrompt(seed, lead) }] }),
  });
  var j = await r.json();
  var text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  return JSON.parse(text);
}

// The department entry: validate; ONE retry; fallback on second failure. Never throws.
async function runGovernor(seed, lead){
  if (String(process.env.SMN_GOVERNOR || '').toLowerCase() !== 'on') return { ok: false, off: true };
  if (!KEY) { var fb0 = schema.fallbackBrief(seed); fb0.truth.name = lead || ''; return { ok: true, brief: fb0, fallback: true }; }
  for (var attempt = 0; attempt < 2; attempt++) {
    var g = await ladder.guardedCall(function(signal){ return callModel(seed, lead, signal); });
    try { await foresight.record('governor', MODEL, 1, g.ms); } catch (_) {}
    if (g.ok) {
      var brief = g.result;
      // Deterministic hardening regardless of model output:
      if (brief && brief.truth) brief.truth.name = lead || brief.truth.name || '';
      if (brief && schema.isRedZone(seed)) { brief.meta = brief.meta || {}; brief.meta.human_review_required = true; brief.meta.red_zone = true; }
      var v = schema.validateBrief(brief);
      if (v.ok) return { ok: true, brief: brief };
      // malformed → one retry (loop)
    }
  }
  var fb = schema.fallbackBrief(seed); fb.truth.name = lead || '';
  return { ok: true, brief: fb, fallback: true };
}

exports.runGovernor = runGovernor;

// HTTP surface for QA: POST { seed, lead? } -> { ok, brief, fallback? }
exports.handler = async function (event) {
  var out = function(o){ return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };
  var b = {}; try { b = JSON.parse(event.body || '{}'); } catch (_) {}
  if (!b.seed) return out({ ok: false, error: 'missing seed' });
  return out(await runGovernor(String(b.seed).slice(0, 400), String(b.lead || '').slice(0, 80)));
};
