// Test harness for judge-logo.js — run with: node tools/test-judge.js
// Covers scoring, hard gates, malformed model output, network failure posture, and the
// correction text fed back into the next attempt. No network required: fetch is stubbed.
'use strict';

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key-not-used-by-stub';
process.env.SMN_JUDGE_TIMEOUT_MS = '50';

const path = require('path');
const J = require(path.join(__dirname, '..', 'netlify', 'functions', 'judge-logo.js'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (extra ? ('  -> ' + JSON.stringify(extra)) : '')); }
}
function section(t) { console.log('\n' + t); }

const CLEAN = {
  has_wordmark: true,
  has_container: false, has_gradient: false, name_misspelled: false,
  fails_silhouette: false, fails_thumbnail: false, letterforms_inconsistent: false,
  is_photograph: false,
  idea: 22, reduction: 18, craft: 17, typography: 17, originality: 13,   // 87 of 100
  elemental_simplicity: 9, grid_uniformity: 9, silhouette_integrity: 9.5, flatness: 10,
  defects: [], one_line: 'Strong and specific.'
};
function withGate(g) { const o = Object.assign({}, CLEAN); o[g] = true; return o; }

// ---------------------------------------------------------------- scoring
section('SCORING');
{
  const v = J.verdictFrom(CLEAN);
  ok('clean mark totals 87', v.total === 87, v.total);
  ok('clean mark passes', v.pass === true, v);
  ok('verdict is pass', v.verdict === 'pass', v.verdict);
}
{
  const weak = Object.assign({}, CLEAN, { idea: 12, reduction: 10, craft: 12, typography: 12, originality: 8 }); // 54
  const v = J.verdictFrom(weak);
  ok('forgettable mark totals 54', v.total === 54, v.total);
  ok('forgettable mark fails on floor', v.pass === false, v);
  ok('verdict is below_floor', v.verdict === 'below_floor', v.verdict);
}
{
  const edge = Object.assign({}, CLEAN, { idea: 18, reduction: 15, craft: 15, typography: 14, originality: 10 }); // 72
  ok('exactly at the floor passes', J.verdictFrom(edge).total === 72 && J.verdictFrom(edge).pass === true, J.verdictFrom(edge).total);
  const under = Object.assign({}, edge, { originality: 9 }); // 71
  ok('one point under the floor fails', J.verdictFrom(under).pass === false, J.verdictFrom(under).total);
}
{
  const v = J.verdictFrom(Object.assign({}, CLEAN, { idea: 999, reduction: -5, craft: 'x' }));
  ok('scores clamp to their maxima', v.scores.idea === 25, v.scores);
  ok('negative scores clamp to zero', v.scores.reduction === 0, v.scores);
  ok('non-numeric scores clamp to zero', v.scores.craft === 0, v.scores);
}

// ---------------------------------------------------------------- hard gates
section('HARD GATES — any one is a reject at any score');
J.HARD_GATES.forEach(function (g) {
  const v = J.verdictFrom(withGate(g));
  ok(g + ' rejects a mark scoring 87', v.pass === false && v.verdict === 'hard_reject', v);
  ok(g + ' is named in failed_gates', v.failed_gates.indexOf(g) >= 0, v.failed_gates);
});
{
  const perfect = Object.assign({}, CLEAN, { idea: 25, reduction: 20, craft: 20, typography: 20, originality: 15, has_container: true });
  const v = J.verdictFrom(perfect);
  ok('a perfect 100 with a container still rejects', v.total === 100 && v.pass === false, v);
}
{
  const v = J.verdictFrom(Object.assign({}, CLEAN, { has_container: 'true', name_misspelled: 1 }));
  ok('string "true" counts as a gate failure', v.gates.has_container === true, v.gates);
  ok('numeric 1 counts as a gate failure', v.gates.name_misspelled === true, v.gates);
  const v2 = J.verdictFrom(Object.assign({}, CLEAN, { has_container: 'false', has_gradient: 0, is_photograph: null }));
  ok('"false", 0 and null do NOT trip a gate', v2.pass === true, v2.gates);
}

// ---------------------------------------------------------------- malformed output
section('MALFORMED MODEL OUTPUT');
{
  const v = J.verdictFrom({});
  ok('empty object scores zero and fails', v.total === 0 && v.pass === false, v);
  ok('empty object trips no gates', v.failed_gates.length === 0, v.failed_gates);
}
{
  const v = J.verdictFrom(null);
  ok('null does not throw', v && v.total === 0, v);
}
{
  const v = J.verdictFrom(Object.assign({}, CLEAN, { defects: 'not an array' }));
  ok('non-array defects degrade to empty', Array.isArray(v.defects) && v.defects.length === 0, v.defects);
}
{
  const many = Object.assign({}, CLEAN, { has_container: true, defects: ['a','b','c','d','e','f'] });
  ok('defects cap at four', J.verdictFrom(many).defects.length === 4);
}


section('THE GLOBAL DESIGN CODEX — four axioms, each with its own floor');
{
  const v = J.verdictFrom(CLEAN);
  ok('all four axioms above the floor passes', v.pass === true && v.verdict === 'pass', v.verdict);
  ok('failed_axioms is empty', v.failed_axioms.length === 0, v.failed_axioms);
}
J.CODEX_AXIOMS.forEach(function (a) {
  const o = Object.assign({}, CLEAN); o[a] = 5;
  const v = J.verdictFrom(o);
  ok(a + ' below floor blocks an 87-point mark', v.pass === false && v.verdict === 'codex_fail', v.verdict);
  ok(a + ' is named in failed_axioms', v.failed_axioms.indexOf(a) >= 0, v.failed_axioms);
});
{
  const at = Object.assign({}, CLEAN, { grid_uniformity: 7.5 });
  ok('exactly on the codex floor passes', J.verdictFrom(at).pass === true, J.verdictFrom(at).codex);
  const under = Object.assign({}, CLEAN, { grid_uniformity: 7.4 });
  ok('a tenth under the codex floor fails', J.verdictFrom(under).pass === false, J.verdictFrom(under).codex);
}
{
  const none = Object.assign({}, CLEAN);
  J.CODEX_AXIOMS.forEach(function (a) { delete none[a]; });
  const v = J.verdictFrom(none);
  ok('missing axioms score zero, never a free pass', v.pass === false && v.codex.flatness === 0, v.codex);
}
{
  const junk = Object.assign({}, CLEAN, { flatness: 'excellent', grid_uniformity: 99, elemental_simplicity: -4 });
  const v = J.verdictFrom(junk);
  ok('non-numeric axiom clamps to zero', v.codex.flatness === 0, v.codex);
  ok('over-range axiom clamps to ten', v.codex.grid_uniformity === 10, v.codex);
  ok('negative axiom clamps to zero', v.codex.elemental_simplicity === 0, v.codex);
}
{
  const perfect = Object.assign({}, CLEAN, { idea: 25, reduction: 20, craft: 20, typography: 20, originality: 15, flatness: 3 });
  const v = J.verdictFrom(perfect);
  ok('a perfect 100 with one failed axiom still rejects', v.total === 100 && v.pass === false, v.verdict);
}
{
  const o = Object.assign({}, CLEAN, { grid_uniformity: 4 });
  const c = J.correctionFrom(J.verdictFrom(o));
  ok('a codex failure produces its own imperative correction', /Codex failure, grid uniformity/.test(c), c);
  ok('and it names kerning specifically', /kerning/.test(c), c);
}
{
  const o = Object.assign({}, CLEAN, { flatness: 2, has_gradient: true });
  const c = J.correctionFrom(J.verdictFrom(o));
  ok('gate fault and axiom fault both appear', /Remove every gradient/.test(c) && /Codex failure, flatness/.test(c), c);
}


section('CALIBRATION — the bench must survive its own law');
{
  // A clean, specific mark for a real local business. Eights across the board.
  const local = Object.assign({}, CLEAN, {
    elemental_simplicity: 8, grid_uniformity: 8, silhouette_integrity: 8, flatness: 9,
    idea: 19, reduction: 16, craft: 16, typography: 16, originality: 11 });
  const v = J.verdictFrom(local);
  ok('a solid local business mark PASSES', v.pass === true, v.total + ' ' + v.verdict);
  ok('and scores in the high 70s', v.total >= 72 && v.total < 85, v.total);
}
{
  // Mercedes: a star inside a ring. The ring is structure, so has_container is false.
  const merc = Object.assign({}, CLEAN, { has_wordmark: false, has_container: false,
    elemental_simplicity: 10, silhouette_integrity: 10, flatness: 10,
    idea: 25, reduction: 20, craft: 20, originality: 15 });
  ok('Mercedes survives the container gate', J.verdictFrom(merc).pass === true, J.verdictFrom(merc).verdict);
}
{
  // Nike / Apple / GitHub: no lettering at all.
  const nike = { has_wordmark: false, has_container: false, has_gradient: false,
    name_misspelled: false, fails_silhouette: false, fails_thumbnail: false,
    letterforms_inconsistent: true, is_photograph: false,
    elemental_simplicity: 10, silhouette_integrity: 10, flatness: 10,
    idea: 24, reduction: 20, craft: 19, originality: 14 };
  const v = J.verdictFrom(nike);
  ok('a symbol-only mark is not failed for having no letters', v.pass === true, v.verdict);
  ok('grid_uniformity returns N/A rather than zero', v.codex.grid_uniformity === null, v.codex);
  ok('typography returns N/A rather than zero', v.scores.typography === null, v.scores);
  ok('the letterform gate cannot fire without letters', v.gates.letterforms_inconsistent === false, v.gates);
  ok('and it is scored out of 80, not penalised out of 100', v.total >= 90, v.total);
}
{
  // IBM: stripes soften at 16px but the mark is still IBM.
  const ibm = Object.assign({}, CLEAN, { fails_thumbnail: false,
    elemental_simplicity: 9, grid_uniformity: 10, silhouette_integrity: 9, flatness: 10,
    idea: 23, reduction: 18, craft: 20, typography: 20, originality: 14 });
  ok('IBM passes when softening is not treated as failure', J.verdictFrom(ibm).pass === true);
}
{
  // A genuinely broken mark still gets stopped.
  const bad = Object.assign({}, CLEAN, { has_gradient: true, flatness: 2 });
  ok('a gradient is still a hard reject', J.verdictFrom(bad).pass === false, J.verdictFrom(bad).verdict);
  const mis = Object.assign({}, CLEAN, { name_misspelled: true });
  ok('a misspelling is still a hard reject', J.verdictFrom(mis).pass === false, J.verdictFrom(mis).verdict);
}

// ---------------------------------------------------------------- network posture
section('NETWORK POSTURE — the judge must never block delivery');
(async function () {
  const realFetch = global.fetch;

  global.fetch = async function () { throw new Error('network down'); };
  let v = await J.judge('AAAA', 'image/png', 'Plow Patrol');
  ok('network failure returns unknown', v.unknown === true && v.reason === 'error', v);
  ok('network failure still passes (never blocks)', v.pass === true, v);

  global.fetch = async function () { return { ok: false, status: 429, json: async () => ({}) }; };
  v = await J.judge('AAAA', 'image/png', 'Plow Patrol');
  ok('429 returns unknown and passes', v.unknown === true && v.reason === 'http_429' && v.pass === true, v);

  global.fetch = async function () {
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'not json at all' } }] }) };
  };
  v = await J.judge('AAAA', 'image/png', 'Plow Patrol');
  ok('unparseable content returns unknown and passes', v.unknown === true && v.reason === 'unparseable' && v.pass === true, v);

  global.fetch = async function () {
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: '```json\n' + JSON.stringify(CLEAN) + '\n```' } }] }) };
  };
  v = await J.judge('AAAA', 'image/png', 'Plow Patrol');
  ok('markdown-fenced JSON parses correctly', v.total === 87 && v.pass === true, v);

  global.fetch = async function () {
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(withGate('name_misspelled')) } }] }) };
  };
  v = await J.judge('AAAA', 'image/png', 'Plow Patrol');
  ok('a real reject comes through as a reject', v.pass === false && v.failed_gates[0] === 'name_misspelled', v);

  global.fetch = async function () {
    return new Promise(function (res) { setTimeout(function () { res({ ok: true, status: 200, json: async () => ({}) }); }, 400); });
  };
  v = await J.judge('AAAA', 'image/png', 'Plow Patrol');
  ok('timeout returns unknown and passes', v.unknown === true && v.pass === true, v);

  v = await J.judge('', 'image/png', 'Plow Patrol');
  ok('missing image returns unknown without calling out', v.reason === 'no_image', v);

  global.fetch = realFetch;

  // ------------------------------------------------------------- corrections
  section('CORRECTION TEXT — what the next attempt is told');
  {
    ok('a passing verdict yields no correction', J.correctionFrom(J.verdictFrom(CLEAN)) === '');
    ok('an unknown verdict yields no correction', J.correctionFrom({ unknown: true, pass: true }) === '');

    const c = J.correctionFrom(J.verdictFrom(withGate('has_container')));
    ok('container fault names the fix', /Remove the ring, shield, badge/.test(c), c);

    const c2 = J.correctionFrom(J.verdictFrom(Object.assign({}, withGate('fails_thumbnail'),
      { defects: ['thicken the counter of the P'] })));
    ok('specific defects are passed through', /thicken the counter of the P/.test(c2), c2);
    ok('gate fix and defect both appear', /dies at small size/.test(c2) && /counter of the P/.test(c2), c2);

    const weak = Object.assign({}, CLEAN, { idea: 12, reduction: 10, craft: 12, typography: 12, originality: 8, defects: [] });
    const c3 = J.correctionFrom(J.verdictFrom(weak));
    ok('a below-floor mark with no named defects still gets direction', /competent but forgettable/.test(c3), c3);
  }

  console.log('\n' + (fail === 0 ? 'ALL ' + pass + ' CHECKS PASSED' : pass + ' passed, ' + fail + ' FAILED'));
  process.exit(fail === 0 ? 0 : 1);
})();
