// SparkMyName — CURATION + COMPLETENESS (NEW FILE, Founder orders, 2026-07-05 evening)
// Part 1 — curate(): the baton's quality department, faithfully: the 4.2 premium bar,
// the 42/42/10/6 lane weighting, quality-over-quota floors, and the Six-Names law.
// Part 2 — waitForArt(): NO REPORT LEAVES INCOMPLETE. The delivery e-mail waits until
// the hero and the logos are actually ON the rows (or a terminal failure is ledgered,
// in which case the order PARKS with an alert instead of shipping half a brand).
'use strict';

var CURATE_TARGET = parseInt(process.env.CURATE_TARGET || '6', 10);   // SIX-NAMES LAW
var MIN_SCORE = parseFloat(process.env.PACK_MIN_SCORE || '4.2');      // PREMIUM BAR
var LANES = ['professional', 'standard', 'clever', 'human'];
var DELIV_PCT = { professional: 0.42, standard: 0.42, human: 0.10, clever: 0.06 };

// pool: [{name, domain, domainAvailable, why, lane, judge:number|null, ...}] judge-sorted or not.
function curate(pool) {
  pool = (pool || []).slice();
  var kept = pool.filter(function (n) { return typeof n.judge === 'number' && n.judge >= MIN_SCORE; })
                 .sort(function (a, b) { return (b.judge || 0) - (a.judge || 0); });
  function laneOf(n) { var l = String((n && n.lane) || '').toLowerCase(); return LANES.indexOf(l) >= 0 ? l : ''; }
  var anyLane = pool.some(function (n) { return laneOf(n); });
  var names = [];
  if (anyLane) {
    var DELIV = {}, fl = {}, used = 0;
    LANES.forEach(function (L) { var x = CURATE_TARGET * DELIV_PCT[L]; DELIV[L] = Math.floor(x); fl[L] = x - DELIV[L]; used += DELIV[L]; });
    LANES.slice().sort(function (a, b) { return fl[b] - fl[a]; }).forEach(function (L) { if (used < CURATE_TARGET) { DELIV[L] += 1; used += 1; } });
    var picked = {};
    LANES.forEach(function (L) {
      kept.filter(function (n) { return laneOf(n) === L; }).slice(0, DELIV[L]).forEach(function (n) {
        var k = String(n.name).toLowerCase();
        if (!picked[k]) { picked[k] = 1; names.push(n); }
      });
    });
    kept.forEach(function (n) { var k = String(n.name).toLowerCase();  // stronger lanes fill open quota — still above the bar
      if (!picked[k] && names.length < CURATE_TARGET) { picked[k] = 1; names.push(n); } });
  } else {
    names = kept.slice(0, CURATE_TARGET);
  }
  // SIX-NAMES LAW hard floor: fill from the judged-best remaining pool, best first —
  // pool entries are domain-available by construction, so the promise always holds.
  if (names.length < CURATE_TARGET) {
    var haveF = {}; names.forEach(function (n) { haveF[String(n.name).toLowerCase()] = 1; });
    pool.slice().sort(function (a, b) { return (b.judge || 0) - (a.judge || 0); }).forEach(function (n) {
      if (names.length >= CURATE_TARGET) return;
      var k = String(n.name).toLowerCase();
      if (!haveF[k]) { haveF[k] = 1; names.push(n); }
    });
  }
  return names.slice(0, CURATE_TARGET);
}

// ---- Part 2: THE COMPLETENESS GATE --------------------------------------------------
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
function sbH(extra) { var o = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }; if (extra) { for (var k in extra) o[k] = extra[k]; } return o; }

async function leadKit(r, lead) {
  try {
    var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
      '&name=eq.' + encodeURIComponent(lead) + '&select=kit&limit=1', { headers: sbH({ 'Accept': 'application/json' }) });
    var rows = q.ok ? await q.json() : [];
    return (rows && rows[0] && rows[0].kit) || {};
  } catch (e) { return {}; }
}

// Waits until every WANTED asset is on the lead row. Terminal worker failure = NOT ok
// (the order parks with an alert rather than shipping incomplete — Founder order).
// Returns { ok, reason, waitedMs }.
async function waitForArt(opts) {
  var r = opts.r, lead = opts.lead;
  var wantHero = String(process.env.SMN_ART_DEPT || '').toLowerCase() === 'on';
  var wantLogos = String(process.env.SMN_LOGO_DEPT || '').toLowerCase() === 'on';
  if (!wantHero && !wantLogos) return { ok: true, reason: 'no art departments active', waitedMs: 0 };
  var timeout = parseInt(process.env.SMN_ART_WAIT_MS || '480000', 10); // 8 minutes inside a 15-minute room
  var poll = parseInt(process.env.SMN_ART_POLL_MS || '9000', 10);
  var t0 = Date.now();
  var lastState = '';
  // CO-11 (Founder, 2026-07-05 night): the audit walks EVERY row — its own hero, at
  // least one mark with a complete ledger, and taglines — no card ships incomplete.
  async function allRows(rr) {
    try {
      var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(rr) + '&select=name,kit&order=position.asc', { headers: sbH({ 'Accept': 'application/json' }) });
      return q.ok ? await q.json() : [];
    } catch (e) { return []; }
  }
  while (Date.now() - t0 < timeout) {
    var rows = await allRows(r);
    if (!rows.length) {
      // CO-21: no rows after 90s = the report_names write failed — park LOUDLY and name it.
      if (Date.now() - t0 > 90000) return { ok: false, reason: 'NO WORKTABLE ROWS — the report_names insert failed for this order (see ROWS ALARM in save-report logs)', waitedMs: Date.now() - t0 };
      await new Promise(function (res) { setTimeout(res, poll); }); continue; }
    var waiting = [], dead = [];
    for (var ri = 0; ri < rows.length; ri++) {
      var kk = (rows[ri] && rows[ri].kit) || {};
      var nm = (rows[ri] && rows[ri].name) || ('#' + ri);
      var lg = kk.logoDept || {};
      var hOk = !wantHero || !!kk.headerUrl;
      var hDead = wantHero && kk.heroDept && kk.heroDept.status === 'failed';
      var lOk = !wantLogos || (Array.isArray(kk.logoUrls) && kk.logoUrls.length >= 1 && lg.status === 'complete');
      var lDead = wantLogos && (lg.status === 'fallback-monogram' || lg.status === 'partial');
      var tOk = !!(kk.taglines && kk.taglines.length);
      if (hDead || lDead) dead.push(nm + '(' + (hDead ? 'hero' : 'logos') + (lg.lastError ? ':' + String(lg.lastError).slice(0, 80) : '') + ')');
      else if (!hOk || !lOk || !tOk) waiting.push(nm + '(' + (!hOk ? 'hero ' : '') + (!lOk ? 'logos ' : '') + (!tOk ? 'taglines' : '') + ')');
    }
    lastState = rows.length + ' rows — waiting: [' + waiting.join(', ') + '] dead: [' + dead.join(', ') + ']';
    if (!waiting.length && !dead.length) return { ok: true, reason: 'ALL ' + rows.length + ' rows complete', waitedMs: Date.now() - t0 };
    if (dead.length && !waiting.length) return { ok: false, reason: 'terminal: ' + lastState, waitedMs: Date.now() - t0 };
    await new Promise(function (res) { setTimeout(res, poll); });
  }
  return { ok: false, reason: 'timeout after ' + Math.round((Date.now() - t0) / 1000) + 's — ' + lastState, waitedMs: Date.now() - t0 };
}

// Park marker: the truth written on the lead row when a delivery is held back.
async function parkDelivery(r, lead, reason) {
  try {
    var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
      '&name=eq.' + encodeURIComponent(lead) + '&select=id,kit&limit=1', { headers: sbH({ 'Accept': 'application/json' }) });
    var rows = q.ok ? await q.json() : [];
    if (!rows || !rows[0]) return;
    var kit = rows[0].kit || {};
    kit.delivery = { status: 'parked', alert: true, reason: String(reason).slice(0, 300), at: new Date().toISOString() };
    await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(rows[0].id), {
      method: 'PATCH', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ kit: kit }) });
  } catch (_) {}
}

// ---- Part 3: COMPLETION-FIRES-DELIVERY (Founder order, 2026-07-10) -------------------
// The old gate BLOCK-WAITED inside a time-limited function and gave up at a timeout —
// which could ship a brand before every logo landed. New model: the ART DEPARTMENT
// announces completion, and whoever places the LAST asset fires the email — ONCE.
// No clock, no give-up: a brand is only delivered when it is genuinely complete.

// Snapshot check (no waiting): is EVERY row's wanted art on the row right now?
async function isComplete(r) {
  var wantHero = String(process.env.SMN_ART_DEPT || '').toLowerCase() === 'on';
  var wantLogos = String(process.env.SMN_LOGO_DEPT || '').toLowerCase() === 'on';
  if (!wantHero && !wantLogos) return { complete: true, waiting: [], dead: [] };
  var rows = [];
  try {
    var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=name,kit&order=position.asc', { headers: sbH({ 'Accept': 'application/json' }) });
    rows = q.ok ? await q.json() : [];
  } catch (e) { return { complete: false, waiting: ['(query failed)'], dead: [] }; }
  if (!rows.length) return { complete: false, waiting: ['(no rows yet)'], dead: [] };
  var waiting = [], dead = [];
  for (var i = 0; i < rows.length; i++) {
    var kk = (rows[i] && rows[i].kit) || {}; var nm = (rows[i] && rows[i].name) || ('#' + i);
    var lg = kk.logoDept || {};
    var hOk = !wantHero || !!kk.headerUrl;
    var lOk = !wantLogos || (Array.isArray(kk.logoUrls) && kk.logoUrls.length >= 1 && lg.status === 'complete');
    var tOk = !!(kk.taglines && kk.taglines.length);
    if (!hOk || !lOk || !tOk) waiting.push(nm);
  }
  return { complete: (!waiting.length), waiting: waiting, dead: dead, rows: rows.length };
}

// FALLBACK once-only claim when the reports.emailed_at column is missing/unavailable.
// Marks the lead row's kit (_emailed) so a paid order still emails exactly once.
async function claimViaKit(r) {
  try {
    var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=id,kit&order=position.asc&limit=1', { headers: sbH({ 'Accept': 'application/json' }) });
    var rows = q.ok ? await q.json() : [];
    if (!rows || !rows[0]) return true; // no row to mark — better to send than to go silent
    var kit = (rows[0].kit && typeof rows[0].kit === 'object' && !Array.isArray(rows[0].kit)) ? rows[0].kit : {};
    if (kit._emailed === true) return false; // already sent via fallback
    kit._emailed = true; kit._emailed_at = new Date().toISOString();
    await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(rows[0].id), { method: 'PATCH', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }), body: JSON.stringify({ kit: kit }) });
    return true;
  } catch (e) { return true; } // on error, prefer sending (email must fire) over silence
}
async function releaseViaKit(r) {
  try {
    var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=id,kit&order=position.asc&limit=1', { headers: sbH({ 'Accept': 'application/json' }) });
    var rows = q.ok ? await q.json() : [];
    if (!rows || !rows[0]) return;
    var kit = rows[0].kit || {}; kit._emailed = false;
    await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(rows[0].id), { method: 'PATCH', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }), body: JSON.stringify({ kit: kit }) });
  } catch (_) {}
}

// If the report is complete, atomically claim the email (only the FIRST caller wins) and send it.
// FOUNDER ORDER (2026-07-16) — EVERY-TIME EMAIL LAW: opts.force=true skips the completeness
// check (the atomic once-only claim still applies) so a paid order ALWAYS emails, even when
// an art asset ended in a terminal state. Used by deliver-background's delivery backstop.
async function finalizeIfComplete(r, base, opts) {
  var force = !!(opts && opts.force);
  var st = force ? { complete: true, waiting: [] } : await isComplete(r);
  if (!st.complete) return { fired: false, reason: 'incomplete', waiting: st.waiting };
  if (force) console.log('finalize: FORCE ship (every-time email law) for report ' + r);
  // ATOMIC CLAIM: PATCH only the row whose emailed_at IS NULL; return=representation tells us
  // whether WE won the claim. Concurrent completers all call this; exactly one row comes back.
  var claimed = false, claimUnavailable = false, viaKit = false;
  try {
    var pr = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&emailed_at=is.null', {
      method: 'PATCH', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=representation' }),
      body: JSON.stringify({ emailed_at: new Date().toISOString() }) });
    if (pr.ok) { var prows = await pr.json(); claimed = Array.isArray(prows) && prows.length > 0; }
    else { console.error('finalize: emailed_at claim PATCH failed ' + pr.status + ' — using kit-marker fallback so the paid order is NEVER silently un-emailed'); claimUnavailable = true; }
  } catch (e) { console.error('finalize: emailed_at claim threw — using kit-marker fallback: ' + String(e && e.message || e)); claimUnavailable = true; }
  // EVERY-TIME EMAIL LAW: if reports.emailed_at is missing/unavailable, dedup on the lead
  // row's kit instead, so the delivery email still fires exactly once.
  if (!claimed && claimUnavailable) { viaKit = true; claimed = await claimViaKit(r); if (!claimed) return { fired: false, reason: 'already-emailed-fallback' }; }
  else if (!claimed) return { fired: false, reason: 'already-emailed' };
  // We own the delivery — gather email + names and fire send-kit exactly once.
  try {
    var er = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&select=email,seed&limit=1'  /* seed added 2026-07-26: the delivery email now shows the customer the idea they
     typed, so the brand arrives as an answer to their own words rather than out of
     nowhere. */, { headers: sbH({ 'Accept': 'application/json' }) });
    var erows = er.ok ? await er.json() : []; var email = (erows[0] && erows[0].email) || '';
      var seed  = (erows[0] && erows[0].seed)  || '';
    if (!email) return { fired: false, reason: 'no-email-on-report' };
    // SCHEMA FIX (2026-07-19): the old select asked for a `why` column that does NOT exist in
    // report_names — PostgREST rejected the whole query (400), names came back EMPTY, and send-kit
    // refused to email ("no_name"). That is why completed orders reached the workspace but the
    // "your brand is ready" email never fired. `why` removed (send-kit reads it from kit.whyItWorks);
    // a minimal fallback select guarantees the delivery email can never be blocked by a column mismatch.
    var nr = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=name,domain,tagline,handle,score,kit,domainAvailable:domain_available&order=position.asc', { headers: sbH({ 'Accept': 'application/json' }) });
    var names = nr.ok ? await nr.json() : [];
    if (!nr.ok || !Array.isArray(names) || !names.length) {
      var nrErr = ''; try { nrErr = nr.ok ? '' : (await nr.text()).slice(0, 160); } catch (_) {}
      if (nrErr) console.error('finalize: names select failed — ' + nrErr + ' — retrying minimal select');
      var nr2 = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=name,kit&order=position.asc', { headers: sbH({ 'Accept': 'application/json' }) });
      if (nr2.ok) { var n2 = await nr2.json().catch(function () { return []; }); if (Array.isArray(n2) && n2.length) names = n2; }
    }
    var b = (base || 'https://sparkmyname.netlify.app').replace(/\/$/, '');
    // Pass the report key so send-kit builds the no-login workspace link (/workspace.html?r=KEY).
    var sk = await fetch(b + '/.netlify/functions/send-kit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, seed: seed, names: names, reportUrl: b + '/.netlify/functions/view-report?r=' + encodeURIComponent(r), accountUrl: b + '/account.html' }) });
    if (!sk || !sk.ok) {
      // SEND FAILED — release the claim so a later completion check retries. Never silently lose an email.
      if (viaKit) { await releaseViaKit(r); }
      else { try { await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r), { method: 'PATCH', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }), body: JSON.stringify({ emailed_at: null }) }); } catch (_) {} }
      var _et = ''; try { _et = (await sk.text()).slice(0, 200); } catch (_) {}
      console.error('finalize: send-kit FAILED ' + (sk && sk.status) + ' ' + _et + ' — claim released for retry');
      return { fired: false, reason: 'send-failed', status: (sk && sk.status) };
    }
    console.log('DELIVERY FIRED (completion) for ' + email + ' — ' + names.length + ' names, report ' + r);
    return { fired: true, to: email, names: names.length };
  } catch (e) { console.error('finalize: email send threw — ' + String(e && e.message || e)); return { fired: true, reason: 'email-error' }; }
}

module.exports = { curate: curate, waitForArt: waitForArt, parkDelivery: parkDelivery,
                   isComplete: isComplete, finalizeIfComplete: finalizeIfComplete,
                   CURATE_TARGET: CURATE_TARGET, MIN_SCORE: MIN_SCORE };
