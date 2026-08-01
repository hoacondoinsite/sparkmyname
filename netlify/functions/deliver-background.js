// Netlify BACKGROUND function — the filename ending in "-background" makes Netlify run it
// ASYNCHRONOUSLY: it returns 202 to the caller immediately and keeps running server-side
// for up to 15 minutes, even if the buyer closes the page. THIS is the Amazon model:
// pay -> instant "we'll email you" -> this builds the whole package and delivers it.
//
// What it does: verifies the paid Stripe session, generates a BIG list of available names
// (in waves), builds each name's kit one at a time, saves the combined report, emails it.
// It reuses the existing functions over HTTP so all the proven logic (RDAP checks, OpenAI
// kits, Resend email, Supabase report) stays in one place.
//
// Env: STRIPE_SECRET_KEY (to verify the session). SITE_URL or URL for internal calls.
// The called functions own their own keys (OPENAI_API_KEY, RESEND_API_KEY, SUPABASE_*).

const STRIPE = process.env.STRIPE_SECRET_KEY;
const BASE = (process.env.SITE_URL || process.env.URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');

// ---- PREMIUM PACK PIPELINE (2026-06-21) ----
// Generate the basics + 5 enhanced directions (~150), keep only available .coms, then run the
// whole pool past the judge ("Nike agency") and deliver only names that clear the threshold.
const DIRECTIONS = ['basic', 'upscale', 'shorter', 'descriptive', 'fresh', 'playful'];
const PER_DIR    = 25;   // names requested per direction
const POOL_MAX   = 150;  // stop pooling at ~150
const JUDGE_BATCH = 16;
const laneW   = require('./lane-weights.js');        // Baseline v2: category lane weighting
const overlayC= require('./classifier-overlay.js');  // Baseline v2: classifier finishing
const intelC  = require('./name-intel.js');
const dignityG= require('./dignity-guard.js');       // Baseline v2: dignity belt at curation  // names per judge call (judge caps at ~20)
const MIN_SCORE  = parseFloat(process.env.PACK_MIN_SCORE || '4.2'); // PREMIUM BAR: 4.2 keeps only strong names. env PACK_MIN_SCORE to tune.
const CURATE_TARGET = parseInt(process.env.CURATE_TARGET || '6', 10); // SIX-NAMES LAW (Founder, 2026-07-05): exactly six names per delivery. Generation/judging stay wide; only the final presentation narrows. env CURATE_TARGET to tune.
const MIN_DELIVER  = parseInt(process.env.MIN_DELIVER || '6', 10);   // soft floor aligned to the Six-Names Law — may never exceed the cap
const KIT_MAX    = 25;   // full brand kits built (top names); the rest delivered as name + domain
// QA: lets the Founder build a REAL test pack WITHOUT payment (POST {qa:true,seed,email}).
// *** SET TO false BEFORE THE SITE GOES PUBLIC *** (otherwise anyone could trigger free token spend)
const QA_ENABLED = (process.env.QA_ENABLED === 'true'); // SECURE DEFAULT: off. To run a free test build, set QA_ENABLED=true in Netlify env; it is OFF for the public the moment that var is unset.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };

  let sid = '', seed = '', email = '', qa = false;
  try {
    const b = JSON.parse(event.body || '{}');
    sid = (b.session_id || '').slice(0, 200);
    seed = (b.seed || '').slice(0, 600);
    email = (b.email || '').slice(0, 160).trim();
    qa = (b.qa === true) && QA_ENABLED;
    // QA KEY GATE (bug hunt, 2026-07-05): if QA_KEY is set in Netlify, the free qa bypass
    // additionally requires the matching key — public discovery of the QA pages can no
    // longer spend Founder money. Unset QA_KEY = behavior unchanged.
    if (qa && process.env.QA_KEY && String(b.qaKey || '') !== String(process.env.QA_KEY)) {
      console.warn('deliver-background: qa request rejected — bad or missing qaKey');
      qa = false; sid = ''; // fall through to normal (unpaid -> abort) path
    }
  } catch (e) {}

  // 1) Verify the session actually PAID (anti-abuse). Pull seed/email from Stripe if needed.
  //    QA test path (qa:true) skips this so the Founder can build a real pack without paying.
  if (!qa && STRIPE && sid.indexOf('cs_') === 0) {
    try {
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sid), {
        headers: { 'Authorization': 'Bearer ' + STRIPE }
      });
      const s = await r.json();
      const paid = s && (s.payment_status === 'paid' || s.payment_status === 'no_payment_required' || s.status === 'complete');
      if (!paid) { console.log('deliver-background: session not paid, abort', sid); return { statusCode: 200, body: 'not_paid' }; }
      const md = s.metadata || {};
      if (!email) email = (s.customer_details && s.customer_details.email) || md.email || s.customer_email || '';
      // Anti-abuse cap: build the set of seeds this PAID session actually covers.
      // Batch sessions list one business per key (b0..bN); single sessions use md.seed.
      const allowed = [];
      const cnt = parseInt(md.count, 10) || 0;
      if (cnt > 0) { for (let i = 0; i < cnt && i < 50; i++) { if (md['b' + i]) allowed.push(md['b' + i]); } }
      if (md.seed) allowed.push(md.seed);
      const norm = function (x) { return (x || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
      if (!seed) {
        seed = md.seed || (allowed[0] || ''); // single-purchase fallback
      } else if (allowed.length && allowed.map(norm).indexOf(norm(seed)) < 0) {
        console.log('deliver-background: requested seed not on paid session, abort');
        return { statusCode: 200, body: 'seed_not_paid' };
      }
    } catch (e) {
      console.error('deliver-background verify error', e && e.message ? e.message : String(e));
      // If we can't verify but the caller already gave us both, proceed cautiously; otherwise stop.
      if (!email || !seed) return { statusCode: 200, body: 'verify_failed' };
    }
  }
  if (!seed) seed = 'a brand';
  if (!email || email.indexOf('@') < 1) { console.error('deliver-background: no email, abort'); return { statusCode: 200, body: 'no_email' }; }

  // ===== ONCE-PER-ORDER GUARD (2026-07-14) ======================================================
  // Delivery is now triggered from TWO places: the success page (fast path) AND the Stripe webhook
  // (the reliable server-side path — fires even if the buyer closes the tab). save-report mints a
  // NEW report row on every call, so two triggers would build twice and email twice. Claim this
  // (session + seed) exactly once: the first trigger builds, the second steps aside. Keyed by seed
  // too so a BATCH session (many businesses, one session id) isn't blocked after its first item.
  // FAIL-OPEN: if the lock store is unreachable we proceed — a paid order is never silently dropped.
  if (!qa && sid && sid.indexOf('cs_') === 0) {
    try {
      var _seedKey = (seed || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'seed';
      var _lockPath = 'dispatch-locks/' + sid.replace(/[^a-zA-Z0-9_-]/g, '') + '__' + _seedKey + '.lock';
      var _lock = await require('./sb-storage.js').claimOnce(_lockPath, email + ' @ ' + new Date().toISOString());
      if (_lock && _lock.claimed === false) {
        console.log('deliver-background: session already dispatched — skipping duplicate (' + sid + ' / ' + _seedKey + ')');
        return { statusCode: 200, body: 'duplicate_skip' };
      }
      if (_lock && _lock.degraded) console.warn('deliver-background: dispatch lock degraded, proceeding fail-open — ' + (_lock.note || _lock.error || 'no store'));
    } catch (e) { console.warn('deliver-background: dispatch lock threw, proceeding fail-open — ' + String(e && e.message || e)); }
  }

  // ===== AGENCY OS CUTOVER (Phase D switch — default OFF; Vault law: prior path = instant rollback)
  // PLACEMENT (QC fix 2026-07-05): AFTER payment verification and identity finalization —
  // the Board only ever receives VERIFIED paid (or Founder-QA) orders with real email+seed.
  // When SMN_ASSEMBLY=on, the paid order becomes a JOB on the Order Board (via order-open over
  // HTTP, baton-style) and the crumb conveyor carries it. Otherwise: today's live baton, unchanged.
  if (String(process.env.SMN_ASSEMBLY || '').toLowerCase() === 'on') {
    try {
      const rOS = await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/order-open', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, seed: seed, tier: 'needs_only_v1' })
      });
      const dOS = await rOS.json().catch(function () { return {}; });
      if (dOS && dOS.ok) return { statusCode: 200, body: JSON.stringify({ ok: true, os: 'order-board', job: dOS.job }) };
    } catch (e) { /* graceful: any OS hiccup falls through to the proven baton */ }
  }

  // ---- TIME BUDGET (never time out) ----------------------------------------------------------
  // Netlify background functions allow up to ~15 min. We stop starting NEW work well before that
  // and deliver whatever quality names we have. Quality over quantity: we'd rather ship 8 great
  // names than risk a timeout chasing 48. Tune with env DELIVER_BUDGET_MS.
  const START_TS = Date.now();
  const TIME_BUDGET_MS = parseInt(process.env.DELIVER_BUDGET_MS || '660000', 10); // 11 min of work; leaves buffer for save + email
  function msLeft() { return TIME_BUDGET_MS - (Date.now() - START_TS); }
  function lowOnTime(reserveMs) { return msLeft() < (reserveMs || 0); }

  // 2) GENERATION — generate each STYLE explicitly using the engine's own lane parameter, so all
  //    four categories (Professional / Standard / Clever / Human Touch) are GUARANTEED to fill.
  //    A single mixed call lets the model dump everything into one style (it defaults to
  //    "professional"); asking for one style at a time never collapses. Small, time-guarded chunks.
  let pool = [];
  const have = {};
  const GEN_LANES = ['professional', 'standard', 'clever', 'human'];
  const GEN_PER_LANE = parseInt(process.env.GEN_PER_LANE || '16', 10);
  // BATON PARITY (SOP-BG-001, 2026-07-05): the Governor runs at intake behind the same
  // switch as the Board path; the brief steers the Gate below and rides kit.gov.
  let govBrief = null;
  try { const g = await require('./governor-brief.js').runGovernor(seed, ''); if (g && g.brief) govBrief = g.brief; } catch (_) {}
  const GEN_WAVES = parseInt(process.env.GEN_WAVES || '2', 10); // waves per style to reach the target
  // Baseline v2 — CATEGORY LANE WEIGHTING: shape the buffet by category class. Volume is
  // preserved (weights sum to ~4.0); Clever closes only in dignity-sensitive categories.
  const catV2 = overlayC.refine(seed, intelC.classifyScored(seed));
  const laneClass = laneW.classFor(catV2.key);
  const GEN_TARGETS = laneW.laneTargets(laneClass, GEN_PER_LANE);
  console.log('deliver-background: category=' + catV2.key + ' class=' + laneClass +
              ' lane-targets=' + JSON.stringify(GEN_TARGETS));
  function poolLaneCount(L) { return pool.filter(function (n) { return String(n.lane || '').toLowerCase() === L; }).length; }
  for (let li = 0; li < GEN_LANES.length && !lowOnTime(240000); li++) {
    const L = GEN_LANES[li];
    if (!GEN_TARGETS[L]) continue; // lane closed for this category class (dignity: clever)
    for (let w = 0; w < GEN_WAVES && poolLaneCount(L) < GEN_TARGETS[L] && !lowOnTime(240000); w++) {
      const exclude = pool.map(function (n) { return n.name; });
      let batch = [];
      try {
        const gn = await postFn('clean-names', { seed: seed, count: GEN_PER_LANE, avoid: exclude, lanes: [L] });
        if (gn && Array.isArray(gn.names)) batch = gn.names.filter(function (n) { return n && n.name && n.domainAvailable === true; });
      } catch (e) { console.error('lane gen ' + L + ' failed', e && e.message ? e.message : String(e)); }
      let addedAny = false;
      for (let i = 0; i < batch.length; i++) {
        const key = String(batch[i].name).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (key && !have[key]) { have[key] = 1; if (!batch[i].lane) batch[i].lane = L; batch[i].direction = batch[i].lane; pool.push(batch[i]); addedAny = true; }
      }
      if (!addedAny) break; // engine returned nothing new for this style — move on
    }
  }
  // Baseline v2 — DIGNITY BELT: in dignity-sensitive categories, drop any name that defines
  // the customer by their wound before it can ever be judged or shipped. Never empties a pool
  // outside those categories; inside them, fewer-but-dignified beats plentiful-and-cruel.
  if (dignityG.isDignityCategory(catV2.key)) {
    var beforeD = pool.length;
    pool = pool.filter(function (n) { return !dignityG.dignityViolation(catV2.key, n.name); });
    if (pool.length !== beforeD) console.log('dignity belt removed ' + (beforeD - pool.length) + ' name(s)');
  }
  if (!pool.length) { console.error('deliver-background: no available names for', seed); return { statusCode: 200, body: 'no_names' }; }
  console.log('deliver-background: generated styles — prof=' + poolLaneCount('professional') + ' std=' + poolLaneCount('standard') + ' clever=' + poolLaneCount('clever') + ' human=' + poolLaneCount('human'));

  // 2b) THE JUDGE ("Nike agency") — score the pool in small batches; tag each name. Time-guarded
  //     so it never eats the whole budget. The judge RANKS; later curation makes sure it can never
  //     leave a whole style empty (the engine's names are strong on their own).
  const scoreOf = {};
  async function judgeNames(list) {
    for (let j = 0; j < list.length && !lowOnTime(180000); j += JUDGE_BATCH) {
      const chunk = list.slice(j, j + JUDGE_BATCH).map(function (n) { return n.name; });
      try {
        const jr = await postFn('judge-names', { seed: seed, names: chunk });
        if (jr && Array.isArray(jr.scores)) jr.scores.forEach(function (s) {
          if (s && s.name) scoreOf[String(s.name).toLowerCase()] = (typeof s.overall === 'number' ? s.overall : 0);
        });
      } catch (e) { console.error('judge batch failed', e && e.message ? e.message : String(e)); }
    }
    list.forEach(function (n) { var sc = scoreOf[String(n.name).toLowerCase()]; if (typeof sc === 'number') n.judge = sc; else if (n.judge === undefined || n.judge === null) n.judge = null; });
  }
  await judgeNames(pool);

  // 2c) FILL THE FOUR STYLES — quality over quantity. If a style is short on names that clear the
  //     bar, pull a SMALL targeted batch for just that style and judge it. Repeat until every style
  //     is filled OR we run low on time OR the engine has nothing new ("do it again, unless it can't").
  const LANES4 = ['professional', 'standard', 'clever', 'human'];
  const LANE_TARGET = parseInt(process.env.CURATE_PER_LANE || '12', 10);
  const CURATE_TARGETS = laneW.laneTargets(laneClass, LANE_TARGET); // Baseline v2 weighting
  function laneQualityCount(L) {
    return pool.filter(function (n) { return String(n.lane || '').toLowerCase() === L && n.domainAvailable === true && n.judge !== null && n.judge >= MIN_SCORE; }).length;
  }
  var topupTries = 0;
  var MAX_TOPUP = parseInt(process.env.DELIVER_MAX_TOPUP || '8', 10);
  while (topupTries < MAX_TOPUP && !lowOnTime(260000)) {
    var shortLanes = LANES4.filter(function (L) { return CURATE_TARGETS[L] > 0 && laneQualityCount(L) < CURATE_TARGETS[L]; });
    if (!shortLanes.length) break;                 // every style filled — done
    topupTries++;
    var excludeT = pool.map(function (n) { return n.name; });
    var batchT = [];
    try {
      var gnT = await postFn('clean-names', { seed: seed, count: 16, avoid: excludeT, lanes: shortLanes });
      if (gnT && Array.isArray(gnT.names)) batchT = gnT.names.filter(function (n) { return n && n.name && n.domainAvailable === true; });
    } catch (e) { console.error('lane top-up failed', e && e.message ? e.message : String(e)); break; }
    var addedT = [];
    for (var ti = 0; ti < batchT.length; ti++) {
      var keyT = String(batchT[ti].name).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (keyT && !have[keyT]) { have[keyT] = 1; pool.push(batchT[ti]); addedT.push(batchT[ti]); }
    }
    if (!addedT.length) break;                     // engine returned nothing new — can't, so stop
    await judgeNames(addedT);
  }
  console.log('deliver-background: pool ' + pool.length + ' after ' + topupTries + ' lane top-ups, ' + Math.round(msLeft() / 1000) + 's left');

  let kept = pool.filter(function (n) { return n.judge !== null && n.judge >= MIN_SCORE; });
  kept.sort(function (a, b) { return (b.judge || 0) - (a.judge || 0); });
  // CURATION: deliver the strongest names, BALANCED across the four styles so the report shows
  // four full lanes (Professional / Standard / Clever / Human Touch) — ~PER_LANE each, best-first.
  var PER_LANE = parseInt(process.env.CURATE_PER_LANE || '12', 10);
  var LANES = ['professional', 'standard', 'clever', 'human'];
  function laneOf(n) { var l = String((n && n.lane) || '').toLowerCase(); return LANES.indexOf(l) >= 0 ? l : ''; }
  var anyLane = pool.some(function (n) { return laneOf(n); });
  let names;
  if (anyLane) {
    // DELIVERY WEIGHTING DIRECTIVE (2026-07-03): the final delivered package prefers
    // Professional 42% / Standard 42% / Human Touch 10% / Clever 6% of CURATE_TARGET.
    // This is a delivery preference only — scoring, judging, and generation are untouched.
    // Quality always overrides quota: lanes are filled ONLY from names that meet the existing
    // bar (MIN_SCORE); a short lane is never forced — stronger lanes naturally fill the
    // remaining positions; and if fewer than CURATE_TARGET meet the bar, we deliver fewer.
    var DELIV_PCT = { professional: 0.42, standard: 0.42, human: 0.10, clever: 0.06 };
    var DELIV = {}; var fl = {}; var used = 0;
    LANES.forEach(function (L) { var x = CURATE_TARGET * DELIV_PCT[L]; DELIV[L] = Math.floor(x); fl[L] = x - DELIV[L]; used += DELIV[L]; });
    LANES.slice().sort(function (a, b) { return fl[b] - fl[a]; }).forEach(function (L) { if (used < CURATE_TARGET) { DELIV[L] += 1; used += 1; } });
    names = [];
    var picked = {};
    LANES.forEach(function (L) {
      kept.filter(function (n) { return laneOf(n) === L; }).slice(0, DELIV[L]).forEach(function (n) {
        var k = String(n.name).toLowerCase();
        if (!picked[k]) { picked[k] = 1; names.push(n); }
      });
    });
    // stronger lanes fill whatever the weighted quotas left open — still only names above the bar
    kept.forEach(function (n) { var k = String(n.name).toLowerCase();
      if (!picked[k] && names.length < CURATE_TARGET) { picked[k] = 1; names.push(n); } });
  } else {
    names = kept.slice(0, CURATE_TARGET);
  }
  // Soft floor: if the judge cleared too few, top up from best-available so a report is never thin.
  if (names.length < MIN_DELIVER) {
    var seenN = {}; names.forEach(function (n) { seenN[String(n.name).toLowerCase()] = 1; });
    // DELIVERY DIRECTIVE 2026-07-03: quality always overrides quantity — the floor may only
    // draw from names that meet the existing bar. If too few satisfy the methodology, we
    // deliver fewer names rather than filling with weak ones.
    var rest = pool.slice().sort(function (a, b) {
      return ((b.judge || 0) - (a.judge || 0));
    }).filter(function (n) { return !seenN[String(n.name).toLowerCase()] && n.judge !== null && n.judge >= MIN_SCORE; });
    names = names.concat(rest.slice(0, MIN_DELIVER - names.length));
  }
  // SAFETY NET: never ship a thin, one-bunch report. If the styles came back skewed (most names in
  // one style), top up with the best remaining names so the customer always gets a full lineup.
  var HEALTHY = parseInt(process.env.DELIVER_HEALTHY_MIN || '6', 10); // aligned to the Six-Names Law
  if (names.length < HEALTHY) {
    var have3 = {}; names.forEach(function (n) { have3[String(n.name).toLowerCase()] = 1; });
    var more = pool.filter(function (n) { return n.domainAvailable === true && !have3[String(n.name).toLowerCase()]; })
                   .sort(function (a, b) { return ((b.judge || 0) - (a.judge || 0)) || ((b.score || 0) - (a.score || 0)); });
    names = names.concat(more.slice(0, Math.max(0, Math.min(PER_LANE * 4, HEALTHY) - names.length)));
  }
  // SIX-NAMES LAW (Founder, 2026-07-05): the final delivery is exactly six — capped hard,
  // and guaranteed. If the quality ladders leave the report short (crowded namespaces like
  // towing where few domains are open and the 4.2 bar clears little), fill to the law from
  // the judged-best remaining pool names. Pool entries are domain-available by construction,
  // so the "domains checked" promise always holds; only the score bar relaxes, best first.
  var HARD_CAP = parseInt(process.env.DELIVER_HARD_CAP || '6', 10);
  if (names.length < HARD_CAP) {
    var haveF = {}; names.forEach(function (n) { haveF[String(n.name).toLowerCase()] = 1; });
    var lastResort = pool.filter(function (n) { return !haveF[String(n.name).toLowerCase()]; })
      .sort(function (a, b) { return ((b.judge || 0) - (a.judge || 0)) || ((b.score || 0) - (a.score || 0)); });
    names = names.concat(lastResort.slice(0, HARD_CAP - names.length));
  }
  if (names.length > HARD_CAP) names = names.slice(0, HARD_CAP);
  function _dCount(L) { return names.filter(function (n) { return laneOf(n) === L; }).length; }
  console.log('deliver-background: DELIVERING ' + names.length + ' — prof=' + _dCount('professional') + ' std=' + _dCount('standard') + ' clever=' + _dCount('clever') + ' human=' + _dCount('human') + ' (pool ' + pool.length + ', kept ' + kept.length + ')');

  // 3) Build kits for the TOP names (one at a time); the rest deliver as name + available domain
  //    and still render a rich view (handles, palette, why) in the report template.
  //    Build kits for the strongest names ACROSS all lanes (display is regrouped by lane anyway),
  //    so every lane's best names get a full kit, not just the first lane in the list.
  names.sort(function (a, b) { return ((b.judge || 0) - (a.judge || 0)); });
  // SINGLE-KIT MODE (Founder directive, 2026-07-05): while SMN_QA_SINGLE=on, only the LEAD
  // name receives a fully assembled kit; the other names ship minimal (name, domain, why,
  // lane) for your workspace view — the template's proven fallbacks render them cleanly.
  const QA_SINGLE = String(process.env.SMN_QA_SINGLE || '').toLowerCase() === 'on';
  const KIT_LIMIT = QA_SINGLE ? 1 : KIT_MAX;
  // THE SELECTION GATE (baton parity, SOP-BG-001): reviewed order becomes presentation order.
  if (govBrief && String(process.env.SMN_GATE || '').toLowerCase() === 'on') {
    try {
      const gr = await require('./governor-gate.js').gateReview({ seed: seed, brief: govBrief, names: names });
      if (gr && gr.gated && gr.names && gr.names.length) { names = gr.names; console.log('gate: ' + gr.killed.length + ' killed, ' + gr.backfilled + ' backfilled'); }
    } catch (e) { console.warn('gate skipped:', e && e.message ? e.message : String(e)); }
  }
  for (let i = 0; i < names.length && i < KIT_LIMIT; i++) {
    if (lowOnTime(45000)) { console.log('deliver-background: time budget low — stopping kit build at ' + i + ' of ' + Math.min(names.length, KIT_LIMIT) + ', delivering the rest as name + domain'); break; }
    try {
      const kit = await postFn('build-kit', { name: names[i].name, seed: seed, kind: 'brand' });
      if (kit && !kit.error) { kit.lane = names[i].lane || kit.lane || ''; if (i === 0 && govBrief) kit.gov = govBrief; names[i].kit = kit; }
    } catch (e) { console.warn('build-kit failed for ' + names[i].name, e && e.message ? e.message : String(e)); }
  }
  // CO-11 (Founder, 2026-07-05 night): SECOND PASS — any name whose kit failed gets ONE retry.
  // No missing taglines on delivered cards.
  for (let i = 0; i < names.length && i < KIT_LIMIT; i++) {
    if (names[i].kit || lowOnTime(40000)) continue;
    try {
      const kit2 = await postFn('build-kit', { name: names[i].name, seed: seed, kind: 'brand' });
      if (kit2 && !kit2.error) { kit2.lane = names[i].lane || kit2.lane || ''; names[i].kit = kit2; console.log('kit retry SUCCEEDED for ' + names[i].name); }
      else { console.error('kit retry failed for ' + names[i].name); }
    } catch (e) { console.error('kit retry threw for ' + names[i].name); }
  }

  // 3b) RULE REMOVED BY FOUNDER ORDER (2026-07-06, ~0630): the old "quality over
  //     quantity" trimmer silently dropped kit-less names before the save, shrinking
  //     deliveries below the Six-Names Law. It is repealed. ALL curated names ship;
  //     the CO-19 retry pass makes kit-less names rare, and the CO-11 completeness
  //     gate ensures nothing incomplete ever emails — it waits or parks LOUDLY,
  //     naming the rows. Never silently fewer. If any name is still kit-less here,
  //     we say so and ship it to the gate's judgment:
  (function(){ var kl = names.filter(function (n) { return !(n.kit && !n.kit.error); });
    if (kl.length) console.error('SIX-NAMES ALARM: ' + kl.length + ' name(s) reached delivery kit-less after retries: ' + kl.map(function(n){return n.name;}).join(', ') + ' — the gate will hold this order'); })();

  // 4) Save the combined report (server-side; the hub reads this by email).
  let reportUrl = BASE + '/account.html';
  let sr = null; // hoisted to outer scope so the completeness gate (separate try below) can read sr.key
  try {
    sr = await postFn('save-report', { names: names, to: email, email: email, seed: seed });
    if (sr && sr.ok && sr.url) reportUrl = sr.url;
    // Stage 2: fire the Art Department (cinematic headers) — behind OFF switch (SMN_ART_DEPT=on),
    // best-effort, never blocks the report or the email.
    if (sr && sr.key && String(process.env.SMN_ART_DEPT || '').toLowerCase() === 'on') {
      try { await postFn('art-department-background', { r: sr.key, seed: seed, cursor: 0 }); }
      catch (e) { console.error('art-dept trigger failed', e && e.message ? e.message : String(e)); }
    }
    // Baseline v2 — PREMIUM LOGO POLICY: three AI logo concepts for the TOP-RANKED name,
    // automatically, at delivery. Further names generate only on customer intent
    // (open / favorite / choose) via logo-concepts. Cached permanently; never regenerates.
    if (sr && sr.key && String(process.env.SMN_LOGO_DEPT || '').toLowerCase() === 'on') {
      try {
        // CO-11 (Founder): FULL PRE-GENERATION — every delivered name gets its marks at
        // delivery time; the completeness gate holds the email until they all land.
        // Workers run as parallel background rooms; dispatches are fire-and-verify.
        // ROOT-CAUSE FIX (2026-07-10): dispatch logos for the DELIVERED names (the exact six saved to
        // report_names) — NOT pool.slice(0,6). save-report returns no .names, so the old fallback asked
        // logo-concepts for pool names that were never saved; its spend-gate found nothing and exited
        // silently (logo_status=null). Using `names` makes every delivered name's spend-gate match.
        var _dl = (names && names.length) ? names : ((sr.names && sr.names.length) ? sr.names : ((pool || []).slice(0, 6)));
        for (var li = 0; li < _dl.length; li++) {
          var nmi = _dl[li] && (_dl[li].name || _dl[li]);
          if (!nmi) continue;
          try { await postFn('logo-concepts', { r: sr.key, name: String(nmi), seed: seed, trigger: 'auto' }); }
          catch (e) { console.error('logo dispatch failed for ' + nmi); }
          if (li < _dl.length - 1) await new Promise(function (rs) { setTimeout(rs, 8000); }); // CO-21 stagger
        }
      } catch (e) { console.error('logo-concepts trigger failed', e && e.message ? e.message : String(e)); }
    }
  } catch (e) { console.error('save-report failed', e && e.message ? e.message : String(e)); }

  // 5) Email the package (the delivery).
  try {
    var _ca = String(sid || '').replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase();
    var conf = _ca ? ('SMN-' + _ca) : '';
    // THE COMPLETENESS GATE (Founder order, 2026-07-05 evening) — baton parity.
    if (String(process.env.SMN_COMPLETE_DELIVERY || 'on').toLowerCase() !== 'off') {
      try {
        const comp = require('./smn-curate.js');
        const topN = names && names[0] && names[0].name;
        if (topN && sr && sr.key) {
          const w = await comp.waitForArt({ r: sr.key, lead: topN });
          console.log('completeness gate: ' + (w.ok ? 'COMPLETE' : 'DEFER') + ' after ' + Math.round(w.waitedMs/1000) + 's — ' + w.reason);
          if (w.ok) { await comp.finalizeIfComplete(sr.key, BASE); return { statusCode: 200, body: 'delivered' }; } // complete within the wait — fire now (idempotent)
          // ===== EVERY-TIME EMAIL LAW (Founder order, 2026-07-16) ================================
          // The old model returned here and trusted the art department to fire the email at
          // completion. Two silent holes: (a) a worker that dies never places the last asset, so
          // nobody ever finalizes; (b) art that ends terminal (fallback-monogram / partial /
          // failed) can NEVER satisfy isComplete, so every later finalize call returns
          // 'incomplete' forever. Either way the customer paid and no email ever arrived.
          // NEW MODEL — the delivery backstop: keep polling finalizeIfComplete inside this
          // background room, and before the room closes, FORCE the send. The atomic
          // emailed_at claim still guarantees exactly ONE email per order, so if the art
          // department completes first and fires, our force call steps aside (already-emailed).
          console.log('DELIVERY BACKSTOP ENGAGED — polling completion; guaranteed email before this room closes.');
          var _terminalDead = /^terminal:/.test(w.reason || '');
          if (_terminalDead) {
            // Art can never complete — ship NOW with what we have (monogram fallback is still a logo).
            var ff = await comp.finalizeIfComplete(sr.key, BASE, { force: true });
            console.log('backstop: terminal art — forced ship → ' + JSON.stringify(ff));
            return { statusCode: 200, body: ff && ff.fired ? 'delivered_forced' : 'delivered_by_other' };
          }
          var _bsPoll = parseInt(process.env.SMN_BACKSTOP_POLL_MS || '30000', 10);
          var _bsBudget = parseInt(process.env.SMN_BACKSTOP_BUDGET_MS || '240000', 10); // 4 more min of polling
          var _bsT0 = Date.now();
          while (Date.now() - _bsT0 < _bsBudget) {
            await new Promise(function (rs) { setTimeout(rs, _bsPoll); });
            var fp = await comp.finalizeIfComplete(sr.key, BASE);
            if (fp && (fp.fired || fp.reason === 'already-emailed')) {
              console.log('backstop: delivery fired during polling → ' + JSON.stringify(fp));
              return { statusCode: 200, body: 'delivered' };
            }
          }
          // Budget exhausted — the customer paid; the email goes out NOW, complete or not.
          var fz = await comp.finalizeIfComplete(sr.key, BASE, { force: true });
          console.log('backstop: budget exhausted — forced ship → ' + JSON.stringify(fz));
          return { statusCode: 200, body: fz && fz.fired ? 'delivered_forced' : 'delivered_by_other' };
        }
      } catch (e) {
        // EVERY-TIME EMAIL LAW: even a gate crash may not swallow the delivery — force the send.
        console.error('gate error — forcing delivery (every-time email law): ' + String(e && e.message || e));
        try {
          var fe = await require('./smn-curate.js').finalizeIfComplete(sr && sr.key, BASE, { force: true });
          console.log('backstop: gate-error forced ship → ' + JSON.stringify(fe));
        } catch (e2) {
          // Last resort: fire send-kit directly so a paid order NEVER goes silent.
          try { await postFn('send-kit', { to: email, names: names, reportUrl: reportUrl, accountUrl: BASE + '/account.html', conf: conf }); } catch (e3) {}
        }
        return { statusCode: 200, body: 'delivered_after_gate_error' };
      }
    }
    await postFn('send-kit', { to: email, names: names, reportUrl: reportUrl, accountUrl: BASE + '/account.html', conf: conf });
  } catch (e) { console.error('send-kit failed', e && e.message ? e.message : String(e)); }

  console.log('deliver-background DONE for ' + email + ' — ' + names.length + ' names');
  return { statusCode: 200, body: 'done' };
};

async function postFn(fn, body) {
  const r = await fetch(BASE + '/.netlify/functions/' + fn, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {})
  });
  let d = {}; try { d = await r.json(); } catch (e) {}
  return d;
}
