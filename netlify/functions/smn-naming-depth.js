// SparkMyName — NAMING DEPTH (NEW FILE, Founder order, 2026-07-05 evening)
// The Order Board's naming department was thinner than the baton it replaced — two
// polite calls where the proven system hammers four style lanes, wave after wave,
// under category-weighted targets. This module gives the BOARD the baton's exact
// generation machinery (deliver-background remains untouched and proven). The
// engine stays LOCKED: clean-names is called over HTTP exactly as the baton calls it;
// name-intel is read the same read-only way the live baton has read it since Baseline v2.
'use strict';
var laneW = require('./lane-weights.js');
var overlayC = require('./classifier-overlay.js');
var intelC = require('./name-intel.js');           // read-only classifier use — identical to the live baton
var dignityG = require('./dignity-guard.js');

var GEN_LANES = ['professional', 'standard', 'clever', 'human'];

// Mirrors the baton loop: category-weighted lane targets, GEN_WAVES per lane,
// GEN_PER_LANE asks, domain-available intake filter, converge-dedupe, dignity belt.
// callFn(name, payload) -> parsed JSON (the caller provides its own transport).
async function generatePool(opts) {
  var seed = opts.seed;
  var callFn = opts.callFn;
  var deadline = Date.now() + (opts.budgetMs || 420000); // generous inside a 15-min background room
  var lowOnTime = function (reserve) { return (deadline - Date.now()) < (reserve || 0); };

  var GEN_PER_LANE = parseInt(process.env.GEN_PER_LANE || '16', 10);
  var GEN_WAVES = parseInt(process.env.GEN_WAVES || '2', 10);
  var catV2 = overlayC.refine(seed, intelC.classifyScored(seed));
  var laneClass = laneW.classFor(catV2.key);
  var GEN_TARGETS = laneW.laneTargets(laneClass, GEN_PER_LANE);
  console.log('board naming: category=' + catV2.key + ' class=' + laneClass + ' lane-targets=' + JSON.stringify(GEN_TARGETS));

  var pool = [];
  var have = {};
  function laneCount(L) { return pool.filter(function (n) { return String(n.lane || '').toLowerCase() === L; }).length; }
  function take(batch, L) {
    (batch || []).forEach(function (n) {
      if (!n || !n.name) return;
      if (n.domainAvailable !== true) return;                    // AVAILABLE-ONLY law at intake
      var k = String(n.name).toLowerCase();
      if (have[k]) return;
      have[k] = 1; n.lane = n.lane || L; pool.push(n);
    });
  }
  for (var li = 0; li < GEN_LANES.length && !lowOnTime(120000); li++) {
    var L = GEN_LANES[li];
    if (!GEN_TARGETS[L]) continue;                               // lane closed for this category class
    for (var w = 0; w < GEN_WAVES && laneCount(L) < GEN_TARGETS[L] && !lowOnTime(120000); w++) {
      try {
        var gn = await callFn('clean-names', { seed: seed, count: GEN_PER_LANE, avoid: pool.map(function (n) { return n.name; }), lanes: [L] });
        take((gn && gn.names) || [], L);
      } catch (e) { console.error('board lane ' + L + ' wave failed: ' + String(e && e.message || e)); }
    }
  }
  // Dignity belt — exactly where the baton applies it.
  try {
    if (dignityG.isDignityCategory(catV2.key)) {
      pool = pool.filter(function (n) { return !dignityG.dignityViolation(catV2.key, n.name); });
    }
  } catch (_) {}
  return { pool: pool, category: catV2.key, laneClass: laneClass };
}

module.exports = { generatePool: generatePool, GEN_LANES: GEN_LANES };
