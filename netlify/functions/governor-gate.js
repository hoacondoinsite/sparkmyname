// SparkMyName — THE SELECTION GATE (SOP-BG-001 Phase 2 — NEW FILE, 2026-07-05)
// The Governor reviews the judged pool before ANYTHING is released. Deterministic law
// floor first (fear-words, banned claims, harmony — free); then one AI review scoring
// survivors against the brief. Kill-reasons are logged on the artifact for the Founder.
// Six-Names floor preserved: shortfalls backfill from judge order, FLAGGED — delivery is
// never blocked, and nothing is dressed up as more workable than it is.
'use strict';
var schema = require('./governor-schema.js');
var ladder = require('./smn-ladder.js');
var foresight = require('./smn-foresight.js');

var KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
var MODEL = process.env.GOVERNOR_MODEL || 'gpt-4o-mini';

// ---- LOCK 1+2+claims: the deterministic floor (zero AI cents) --------------------------
function deterministicFloor(names, brief){
  var killWords = schema.FEAR_WORDS.slice();
  ((brief && brief.signal && brief.signal.kill_words) || []).forEach(function(w){
    w = String(w || '').toLowerCase().trim(); if (w && killWords.indexOf(w) === -1) killWords.push(w);
  });
  var survivors = [], killed = [];
  names.forEach(function(n){
    var low = String(n.name || '').toLowerCase();
    var hit = killWords.find(function(w){ return w.length > 2 && low.indexOf(w) !== -1; });
    if (hit) { killed.push({ name: n.name, lock: 'fear_word', reason: 'carries the customer\'s fear-word "' + hit + '" — the before-state may never be bolted onto a brand name' }); return; }
    var claims = schema.lawFloor(n.name);
    if (!claims.pass) { killed.push({ name: n.name, lock: 'claim_safety', reason: 'banned claim term in name: ' + claims.violations[0].term }); return; }
    var h = schema.harmony(n.name, n.domain);
    n.identity = { domain: n.domain || '', handle: h.handle, harmony: h.pass, availability: h.availability };
    if (!h.pass) { n.identity.harmony_reasons = h.reasons; } // harmony miss ≠ auto-kill; it costs rank + is shown honestly
    survivors.push(n);
  });
  return { survivors: survivors, killed: killed };
}

// ---- LOCK 3: the AI psychology review ---------------------------------------------------
function reviewPrompt(seed, brief, names){
  return 'You are the Selection Gate of a brand agency. The brief (JSON): ' +
    JSON.stringify({ human: brief.human, shift: brief.shift, trust: brief.trust, signal: brief.signal, world: { feel: brief.world && brief.world.feel } }).slice(0, 1600) +
    '\nBUSINESS: ' + String(seed || '').slice(0, 240) +
    '\nCANDIDATE NAMES: ' + JSON.stringify(names.map(function(n){ return n.name; })) +
    '\nScore each candidate 0-10 for how well it serves THIS human and THIS emotional shift. ' +
    'Punish hard: parts-inventory names (naming the equipment, not the promise), category cliches used as the whole idea, ' +
    'wrong-register vocabulary for the audience, names that evoke the BEFORE state instead of the AFTER. ' +
    'Reward: names that promise the after-state, are distinctive, and read cleanly at two seconds. ' +
    'Respond JSON only: {"reviews":[{"name":"...","score":0-10,"kill":boolean,"reason":"one short sentence"}]} — ' +
    'kill=true only for names that actively harm the brand psychology (score <= 3).';
}

async function aiReview(seed, brief, names){
  if (!KEY || !names.length) return null;
  var g = await ladder.ladderCall({ dept: 'gate', model: MODEL, rungs: [names.length] }, async function(count, signal){
    var r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
      body: JSON.stringify({ model: MODEL, temperature: 0.2, max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: reviewPrompt(seed, brief, names.slice(0, count)) }] }),
    });
    var j = await r.json();
    return JSON.parse(j.choices[0].message.content);
  });
  try { await foresight.record('gate', MODEL, names.length, (g.steps && g.steps[0] && g.steps[0].ms) || 0); } catch (_) {}
  return g.ok ? g.result : null;
}

// ---- THE GATE — full review; never blocks delivery --------------------------------------
// input: { seed, brief, names (judge-sorted), presentCount } → { names, killed, backfilled, gated }
async function gateReview(input){
  var presentCount = Math.max(1, parseInt(input.presentCount || process.env.SMN_PRESENT_COUNT || '6', 10));
  var pool = (input.names || []).slice();
  if (!pool.length) return { names: pool, killed: [], backfilled: 0, gated: false };
  var floor = deterministicFloor(pool, input.brief || {});
  var killed = floor.killed;
  var alive = floor.survivors;

  var review = null;
  try { review = await aiReview(input.seed, input.brief || {}, alive); } catch (_) {}
  if (review && review.reviews) {
    var byName = {}; review.reviews.forEach(function(rv){ byName[String(rv.name || '').toLowerCase()] = rv; });
    alive.forEach(function(n){
      var rv = byName[String(n.name).toLowerCase()];
      n.gov = rv ? { score: rv.score, reason: rv.reason } : { score: 5, reason: 'not reviewed' };
      if (n.identity && n.identity.harmony === false) n.gov.score = Math.max(0, (n.gov.score || 5) - 2); // harmony miss costs rank, honestly
    });
    var aiKilled = alive.filter(function(n){ var rv = byName[String(n.name).toLowerCase()]; return rv && rv.kill === true; });
    aiKilled.forEach(function(n){ killed.push({ name: n.name, lock: 'psychology', reason: (n.gov && n.gov.reason) || 'fails the brief' }); });
    alive = alive.filter(function(n){ var rv = byName[String(n.name).toLowerCase()]; return !(rv && rv.kill === true); });
    alive.sort(function(a, b){ return ((b.gov && b.gov.score) || 0) - ((a.gov && a.gov.score) || 0) || ((b.judge || 0) - (a.judge || 0)); });
  }
  // Six-Names floor: backfill from the judge order (killed names last resort), FLAGGED.
  var out = alive.slice(0, presentCount);
  var backfilled = 0;
  if (out.length < presentCount) {
    var have = {}; out.forEach(function(n){ have[String(n.name).toLowerCase()] = 1; });
    pool.forEach(function(n){
      if (out.length >= presentCount) return;
      if (have[String(n.name).toLowerCase()]) return;
      n.gate_backfill = true; out.push(n); backfilled++;
    });
  }
  return { names: out, killed: killed, backfilled: backfilled, gated: true };
}

exports.gateReview = gateReview;
exports.deterministicFloor = deterministicFloor;

// HTTP surface for QA: POST { seed, brief, names, presentCount }
exports.handler = async function (event) {
  var out = function(o){ return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };
  if (String(process.env.SMN_GATE || '').toLowerCase() !== 'on') return out({ ok: false, off: true });
  var b = {}; try { b = JSON.parse(event.body || '{}'); } catch (_) {}
  return out(Object.assign({ ok: true }, await gateReview(b)));
};
