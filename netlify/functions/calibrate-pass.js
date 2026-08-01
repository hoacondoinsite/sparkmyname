// calibrate-pass.js — CALIBRATION PASS (installed 2026-07-03, Founder order).
// One POST call: takes a seed + judged candidates and applies the full decision stack:
//   1. Legal / domain safety   (uses judge legal score + domainAvailable flags passed in)
//   2. Category profile classification (keyword table; gpt-4o-mini fallback, stricter on doubt)
//   3. Appropriateness filter  (five tests + mandatory rejection conditions, one model call)
//   4. Lane viability for the category (profile lane caps / restrictions)
//   5. Score threshold         (judge score is ONE signal, not the only signal)
//   6. Final ranking & output balancing (appropriateness → commercial plausibility → score)
//
// OVERRIDE RULE: appropriateness outranks score. A high-scoring but tonally wrong name is
// rejected. A modest-scoring, highly appropriate, commercially plausible name may pass
// (floor: overall >= 3.2 with plausibility >= 4).
//
// COUNT POLICY: formal-sensitive = 10, all other profiles = 12. COUNT REDUCTION RULE: if the
// category can't fill the target with appropriate names, return fewer — never pad with bad fits.
// The console re-runs generation internally for shortfalls; this function never pads.
//
// LOCKED ENGINE UNTOUCHED: this function does not import or modify clean-names.js,
// judge-names.js, or any locked/graveyard file.

const CP = require('./category-profiles.js');
const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const MODEL = process.env.CALIBRATE_MODEL || 'gpt-4o-mini';

const resp = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });

async function ask(sys, user, maxTokens) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8500);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
      body: JSON.stringify({ model: MODEL, temperature: 0.2, max_tokens: maxTokens || 900,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] })
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const data = await r.json();
    let content = (((data.choices || [])[0] || {}).message || {}).content || '';
    content = content.replace(/```json|```/g, '').trim();
    try { return JSON.parse(content); } catch (e) { return null; }
  } catch (e) { clearTimeout(t); return null; }
}

// Model fallback classifier — only when the keyword table has no hit. Stricter on doubt.
async function classifyWithModel(seed) {
  const sys = 'You classify a business category into exactly one naming profile. Profiles, strictest first: "formal-sensitive" (grief, legal, lending, insurance, compliance, fiduciary, serious medical — trust and sobriety dominate), "trust-practical" (competence-first services with modest warmth latitude), "balanced-general" (trust and personality both matter), "expressive-acceptable" (personality/entertainment/food/creator brands where sparkle sells). RULE: if torn between two profiles, always choose the STRICTER one. Return ONLY JSON: {"profile":"<key>"}';
  const out = await ask(sys, 'Business: "' + seed + '"', 60);
  const p = out && CP.PROFILES[out.profile] ? out.profile : 'trust-practical';
  return p;
}

// Appropriateness filter — the five tests + mandatory rejection conditions, per profile.
async function appropriatenessFilter(seed, profileKey, names) {
  const prof = CP.PROFILES[profileKey];
  const sys =
`You are the appropriateness gate for SparkMyName. Category profile: ${prof.label}.
PROFILE TONE RULES: ${prof.tone}

${CP.FIVE_TESTS}

${CP.MANDATORY_REJECTS}

Judge each candidate for THIS business only. Appropriateness outranks cleverness, novelty, and structural polish. For each candidate return:
- verdict: "pass" or "reject"
- plausibility: 1-5, how commercially plausible it is that a real owner in this exact category proudly chooses this name (5 = obvious real-world choice, 1 = embarrassing)
- reason: max 10 words
Return ONLY JSON: {"results":[{"name":"...","verdict":"pass|reject","plausibility":N,"reason":"..."}]} — one entry per candidate, same order.`;
  const user = 'Business: "' + seed + '"\nCandidates:\n' + names.map((n, i) => (i + 1) + '. ' + n.name + ' [lane: ' + n.lane + ']').join('\n');
  const out = await ask(sys, user, 1100);
  const map = {};
  if (out && Array.isArray(out.results)) {
    for (const r of out.results) { if (r && r.name) map[String(r.name).toLowerCase()] = { verdict: (r.verdict === 'pass' ? 'pass' : 'reject'), plausibility: Math.max(1, Math.min(5, +r.plausibility || 1)), reason: String(r.reason || '').slice(0, 90) }; }
  }
  return names.map(n => Object.assign({}, n, map[n.name.toLowerCase()] || { verdict: 'reject', plausibility: 1, reason: 'filter unavailable — failed safe' }));
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!KEY) return resp(500, { ok: false, error: 'missing_openai_key' });
  let seed = '', names = [], mode = 'full', threshold = 4.0, thresholds = null, profileOverride = '';
  let deliveryCount = 5, deliveryMode = 'top-overall', reserveCount = 0;
  try {
    const b = JSON.parse(event.body || '{}');
    seed = (b.seed || '').slice(0, 300);
    mode = b.mode === 'classify' ? 'classify' : 'full';
    threshold = Math.max(1, Math.min(5, +b.threshold || 4.0));
    // Optional per-lane thresholds from the console: {professional:4.2, standard:4.2, human:4.2, clever:4.2}
    if (b.thresholds && typeof b.thresholds === 'object') {
      thresholds = {};
      for (const lane of ['professional', 'standard', 'human', 'clever']) thresholds[lane] = Math.max(1, Math.min(5, +b.thresholds[lane] || threshold));
    }
    // FINAL DELIVERY COUNT (separate from generation depth). Default 5. Ceiling applied later
    // against the profile count. deliveryMode: top-overall (default) | balanced-by-lane |
    // profile-balanced. reserveCount: internal bench of next-best survivors, default 0.
    deliveryCount = Math.max(1, Math.min(20, parseInt(b.deliveryCount, 10) || 5));
    deliveryMode = ['top-overall', 'balanced-by-lane', 'profile-balanced'].indexOf(b.deliveryMode) >= 0 ? b.deliveryMode : 'top-overall';
    reserveCount = Math.max(0, Math.min(10, parseInt(b.reserveCount, 10) || 0));
    profileOverride = CP.PROFILES[b.profileOverride] ? b.profileOverride : '';
    if (Array.isArray(b.names)) names = b.names.map(n => ({
      name: String((n && n.name) || '').trim(),
      lane: ['professional', 'standard', 'clever', 'human'].indexOf((n && n.lane) || '') >= 0 ? n.lane : 'standard',
      overall: +((n && n.overall) || 0),
      legal: +((n && n.legal) || 0),
      domainAvailable: !!(n && n.domainAvailable),
      domain: String((n && n.domain) || ''),
      safety: String((n && n.safety) || 'pass')
    })).filter(n => n.name).slice(0, 48);
  } catch (e) {}
  if (!seed) return resp(400, { ok: false, error: 'no_seed' });

  // ---- STACK STEP 2: profile classification (table first, model fallback, stricter on doubt)
  let cls = CP.classifyProfile(seed);
  let profile = profileOverride || cls.profile;
  let via = profileOverride ? 'override' : (cls.confident ? 'table:' + cls.matched : 'model');
  if (!profileOverride && !cls.confident) profile = await classifyWithModel(seed);
  const prof = CP.PROFILES[profile];

  if (mode === 'classify' || !names.length) {
    return resp(200, { ok: true, seed, profile, profileLabel: prof.label, via, count: prof.count, laneTargets: prof.laneTargets, decisionStack: CP.DECISION_STACK });
  }

  // ---- STACK STEP 1: legal / domain safety (gates everything)
  const rejects = [];
  let pool = [];
  for (const n of names) {
    if (n.safety === 'reject') { rejects.push(Object.assign({ stage: 'safety', reason: 'safety filter reject' }, n)); continue; }
    if (n.legal && n.legal <= 2) { rejects.push(Object.assign({ stage: 'legal', reason: 'judge legal score ' + n.legal }, n)); continue; }
    if (!n.domainAvailable) { rejects.push(Object.assign({ stage: 'domain', reason: 'no open ending' }, n)); continue; }
    pool.push(n);
  }

  // ---- STACK STEP 3: appropriateness filter (the five tests + mandatory rejections)
  pool = pool.length ? await appropriatenessFilter(seed, profile, pool) : [];
  const appropriate = [];
  for (const n of pool) {
    if (n.verdict !== 'pass') { rejects.push(Object.assign({ stage: 'appropriateness' }, n)); continue; }
    appropriate.push(n);
  }

  // ---- STACK STEP 5 + OVERRIDE: score threshold as ONE signal.
  // Pass = overall >= threshold, OR (appropriate + plausibility >= 4 + overall >= 3.2).
  // High score never rescues an appropriateness reject (already out above).
  const scored = [];
  for (const n of appropriate) {
    const laneTh = thresholds ? thresholds[n.lane] : threshold;
    const passScore = n.overall >= laneTh;
    const passOverride = n.plausibility >= 4 && n.overall >= 3.2;
    if (passScore || passOverride) { scored.push(Object.assign({ passedVia: passScore ? 'score' : 'appropriateness-override' }, n)); }
    else rejects.push(Object.assign({ stage: 'score', reason: 'overall ' + n.overall + ' below lane threshold ' + laneTh }, n));
  }

  // ---- STACK STEPS 4 & 6: lane viability, ranking, DELIVERY SELECTION (installed 2026-07-03).
  // INTERNAL GENERATION DEPTH and CUSTOMER DELIVERY COUNT are separate settings. Everything
  // above builds the SURVIVOR STACK (all valid names). Below, only the top N survivors are
  // delivered, where N = deliveryCount (default 5), selected per deliveryMode. Survivors never
  // auto-ship in full; a reserve bench can hold the next-best for swaps. Profile lane caps still
  // bind (restricted lanes stay restricted), and the profile count is the hard ceiling on N.
  scored.sort((a, b) => (b.plausibility - a.plausibility) || (b.overall - a.overall));
  const survivors = scored;                                    // the unified survivor stack
  const caps = {};
  for (const lane of ['professional', 'standard', 'human', 'clever']) caps[lane] = prof.laneTargets[lane][1];
  const byLane = { professional: [], standard: [], human: [], clever: [] };
  for (const n of survivors) byLane[n.lane].push(n);

  const N = Math.max(1, Math.min(prof.count, deliveryCount));  // ceiling: profile count (10/12)
  const final = [];
  const laneCount = () => { const m = { professional: 0, standard: 0, human: 0, clever: 0 }; for (const x of final) m[x.lane]++; return m; };
  const canTake = (n) => final.indexOf(n) === -1 && laneCount()[n.lane] < caps[n.lane];
  const fillBestOverall = () => { for (const n of survivors) { if (final.length >= N) break; if (canTake(n)) final.push(n); } };

  if (deliveryMode === 'balanced-by-lane') {
    // One best per viable lane first (skipping lanes with no survivor or a zero cap),
    // then fill the remainder with the best remaining overall.
    for (const lane of ['professional', 'standard', 'human', 'clever']) {
      if (final.length >= N) break;
      const top = byLane[lane][0];
      if (top && canTake(top)) final.push(top);
    }
    fillBestOverall();
  } else if (deliveryMode === 'profile-balanced') {
    // Original profile balancing: lane minimums first (scaled to N), then best-ranked to caps.
    const mins = {};
    for (const lane of ['professional', 'standard', 'human', 'clever']) mins[lane] = prof.laneTargets[lane][0];
    const scale = Math.min(1, N / prof.count);
    for (const lane of ['professional', 'standard', 'human', 'clever']) {
      const want = Math.max(caps[lane] > 0 ? Math.floor(mins[lane] * scale) : 0, 0);
      for (let i = 0; i < Math.min(want, byLane[lane].length); i++) { if (final.length >= N) break; if (canTake(byLane[lane][i])) final.push(byLane[lane][i]); }
    }
    fillBestOverall();
  } else {
    // TOP OVERALL (default): highest-ranked survivors across all lanes, lane caps respected.
    fillBestOverall();
  }
  final.sort((a, b) => (b.plausibility - a.plausibility) || (b.overall - a.overall));

  // INTERNAL RESERVE: the next-best survivors held back from delivery, available for swaps.
  const reserve = [];
  if (reserveCount > 0) {
    for (const n of survivors) { if (reserve.length >= reserveCount) break; if (final.indexOf(n) === -1) reserve.push(n); }
  }

  const mix = { professional: 0, standard: 0, human: 0, clever: 0 };
  for (const n of final) mix[n.lane]++;
  // Shortfall now measures against what delivery needs (N + reserve), so re-runs top up
  // the survivor stack only when delivery is actually threadbare. Never pad.
  const shortfall = Math.max(0, (N + reserveCount) - (final.length + reserve.length));

  return resp(200, {
    ok: true, seed, profile, profileLabel: prof.label, via,
    deliveryCount: N, deliveryMode, reserveCount,
    targetCount: N, delivered: final.length, shortfall,
    survivorCount: survivors.length, profileCeiling: prof.count,
    laneTargets: prof.laneTargets, laneMix: mix,
    names: final, reserve, rejects,
    note: shortfall ? 'COUNT REDUCTION RULE applied: category could not fill delivery target with appropriate names. Re-run generation for shortfall lanes; do not pad.' : ''
  });
};
