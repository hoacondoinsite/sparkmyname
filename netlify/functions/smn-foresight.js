// SparkMyName — THE ESTIMATOR (Foresight Rule, SOP Appendix C — NEW FILE, 2026-07-05)
// The machine checks its timings BEFORE acting. Every call writes a receipt (units, ms,
// dept, model); learned speeds right-size every ask before it is sent. Cold start is
// conservative; learning never stops. Receipts persist to smn_receipts when the table
// exists (one-paste SQL ships with this disc) and degrade silently to per-invocation
// memory when it does not — foresight can never break a delivery.
'use strict';

var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY;
function sbH(extra){ var o={ 'apikey':SB_KEY, 'Authorization':'Bearer '+SB_KEY }; if(extra){for(var k in extra)o[k]=extra[k];} return o; }

var SOFT_MS  = parseInt(process.env.SMN_CALL_SOFT_MS  || '20000', 10); // the steering line
var GUARD_MS = parseInt(process.env.SMN_CALL_GUARD_MS || '22000', 10); // the abort wall
var CUSHION  = 1.5;            // safety multiplier on every estimate (Appendix C, F3)
var OVERHEAD_MS = 1500;        // fixed per-call overhead assumption

// Conservative cold-start seeds: ms per unit when no receipts exist yet (F5).
var SEEDS = {
  'engine':   2200,  // ms per name asked of the naming engine
  'judge':    900,   // ms per candidate judged
  'governor': 6000,  // ms per brief (units=1)
  'gate':     5000,  // ms per review (units=1)
  'image':    16000, // ms per image piece
  'svg':      50,    // ms per composed board (code-only)
};

var mem = {}; // per-invocation cache: key -> {perUnit, n}
function key(dept, model){ return String(dept||'x') + '|' + String(model||'x'); }

// Load recent receipts for a dept/model (best-effort, once per invocation per key).
async function warm(dept, model){
  var k = key(dept, model);
  if (mem[k] && mem[k].warmed) return mem[k];
  var slot = mem[k] = mem[k] || { perUnit: SEEDS[dept] || 8000, n: 0 };
  slot.warmed = true;
  if (!SB_URL || !SB_KEY) return slot;
  try {
    var r = await fetch(SB_URL + '/rest/v1/smn_receipts?dept=eq.' + encodeURIComponent(dept) +
      '&model=eq.' + encodeURIComponent(model || 'x') + '&order=created_at.desc&limit=12&select=units,ms',
      { headers: sbH({ 'Accept': 'application/json' }) });
    if (r.ok) {
      var rows = await r.json();
      if (Array.isArray(rows) && rows.length) {
        var tot = 0, u = 0;
        rows.forEach(function(row){ if (row.units > 0 && row.ms > 0) { tot += row.ms; u += row.units; } });
        if (u > 0) { slot.perUnit = tot / u; slot.n = rows.length; }
      }
    }
  } catch (_) {} // table absent or unreachable — seeds govern; foresight never blocks
  return slot;
}

// F1: record a receipt (memory always; table best-effort, fire-and-forget-safe).
async function record(dept, model, units, ms){
  try {
    var k = key(dept, model);
    var slot = mem[k] = mem[k] || { perUnit: SEEDS[dept] || 8000, n: 0 };
    if (units > 0 && ms > 0) { // rolling blend: recent evidence weighs in immediately
      slot.perUnit = slot.n > 0 ? (slot.perUnit * 0.6 + (ms / units) * 0.4) : (ms / units);
      slot.n++;
    }
    if (SB_URL && SB_KEY) {
      await fetch(SB_URL + '/rest/v1/smn_receipts', {
        method: 'POST', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
        body: JSON.stringify({ dept: String(dept||'x'), model: String(model||'x'), units: units|0, ms: ms|0 }),
      }).catch(function(){});
    }
  } catch (_) {}
}

// F3: predict milliseconds for an ask of `units`.
async function estimate(dept, model, units){
  var slot = await warm(dept, model);
  return Math.round(OVERHEAD_MS + units * slot.perUnit * CUSHION);
}

// F4: the largest ask (1..maxUnits) whose estimate fits under the soft target.
async function rightSize(dept, model, maxUnits, softMs){
  var budget = softMs || SOFT_MS;
  var slot = await warm(dept, model);
  var fit = Math.floor((budget - OVERHEAD_MS) / (slot.perUnit * CUSHION));
  if (fit < 1) fit = 1;                       // the un-failable floor: one unit always legal
  if (fit > maxUnits) fit = maxUnits;
  return fit;
}

module.exports = { record: record, estimate: estimate, rightSize: rightSize, warm: warm,
                   SOFT_MS: SOFT_MS, GUARD_MS: GUARD_MS, SEEDS: SEEDS };
