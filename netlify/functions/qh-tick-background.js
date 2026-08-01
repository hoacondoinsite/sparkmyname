// qh-tick-background.js — THE RESUMABLE WORKER. A Netlify BACKGROUND function (the "-background"
// suffix), so a single small pass has plenty of headroom and can NEVER time out. Each invocation
// does exactly ONE small batch for ONE lane, saves everything to the database, updates lane state,
// then chains the next pass and exits. All progress is persisted; nothing lives only in memory.
// If a chain link drops, qh-watchdog (or a reopened watch page) resumes from the last saved state.
const L = require('./qh-lib.js');

exports.handler = async (event) => {
  let job_id = '';
  try { job_id = (JSON.parse(event.body || '{}').job_id || '').trim(); } catch (e) {}
  if (!job_id) return done();

  try {
    const job = (await L.sbSelect('qh_jobs', 'id=eq.' + job_id + '&select=*'))[0];
    if (!job || job.status !== 'running') return done();

    let lanes = await L.sbSelect('qh_lanes', 'job_id=eq.' + job_id + '&select=*');
    const concepts = await L.sbSelect('qh_concepts', 'job_id=eq.' + job_id + '&select=name,lane,score,accepted');
    const filledAtTier = (lane, tier) => concepts.filter(c => c.lane === lane && c.accepted === true && Number(c.score) >= tier).length;

    const open = lanes.filter(l => !l.complete);
    if (!open.length) { await finishJob(job_id); return done(); }
    // neediest incomplete lane first (lowest fill ratio), so all four progress together
    open.sort((a, b) => (filledAtTier(a.lane, a.tier) / a.target) - (filledAtTier(b.lane, b.tier) / b.target) || L.LANES.indexOf(a.lane) - L.LANES.indexOf(b.lane));
    const lane = open[0];

    // ---- ONE small generation pass for this single lane ----
    const avoid = concepts.filter(c => c.lane === lane.lane).map(c => c.name).slice(0, 150);
    const gen = await L.postFn('generate-v2', { seed: job.seed, count: L.BATCH, lanes: [lane.lane], avoid });
    const names = (gen && gen.names) || [];

    let newAcceptedAtTier = 0;
    if (names.length) {
      const nameStrs = names.map(n => n.name);
      const [jr, sr] = await Promise.all([
        L.postFn('judge-creative', { seed: job.seed, names: nameStrs }),
        L.postFn('safety-filter', { seed: job.seed, names: nameStrs })
      ]);
      const byJ = {}, byS = {};
      ((jr && jr.scores) || []).forEach(x => { byJ[x.name.toLowerCase()] = x; });
      ((sr && sr.results) || []).forEach(x => { byS[x.name.toLowerCase()] = x; });
      const existing = new Set(concepts.filter(c => c.lane === lane.lane).map(c => c.name.toLowerCase()));
      const rows = [];
      names.forEach(n => {
        const key = n.name.toLowerCase();
        if (existing.has(key)) return; existing.add(key);
        const j = byJ[key] || { score: 3, pass: true, reason: '' };
        const s = byS[key] || { safe: true, review: false, reason: '' };
        const score = Number(j.score) || 3;
        const accepted = (j.pass !== false) && (s.safe !== false);   // judge keep AND safe
        rows.push({ job_id, lane: lane.lane, name: n.name, domain: n.domain || '', score,
          passed: (j.pass !== false), safe: (s.safe !== false), review: !!s.review, accepted,
          reason: String(j.reason || '').slice(0, 120), safety_reason: String(s.reason || '').slice(0, 120) });
        concepts.push({ name: n.name, lane: lane.lane, score, accepted });   // keep local count accurate
        if (accepted && score >= lane.tier) newAcceptedAtTier++;
      });
      if (rows.length) await L.sbInsert('qh_concepts', rows);   // SAVE immediately (accepted + rejected for audit)
    }

    // ---- update lane state (quality-tier harvesting) ----
    let tier = lane.tier, no_progress = lane.no_progress, complete = false;
    const passes = lane.passes + 1;
    let filled = filledAtTier(lane.lane, tier);
    if (filled >= lane.target) complete = true;
    else if (newAcceptedAtTier === 0) {
      no_progress += 1;
      if (no_progress >= L.MAX_STALL) {
        if (tier > L.TIER_FLOOR) { tier -= 1; no_progress = 0; if (filledAtTier(lane.lane, tier) >= lane.target) complete = true; }
        else complete = true;   // exhausted at the quality floor — finish with the best we have
      }
    } else no_progress = 0;
    if (passes >= L.MAX_PASSES) complete = true;

    await L.sbUpdate('qh_lanes', 'id=eq.' + lane.id, { tier, no_progress, passes, complete, updated_at: new Date().toISOString() });
    await L.sbUpdate('qh_jobs', 'id=eq.' + job_id, { updated_at: new Date().toISOString() });

    // ---- chain or finish ----
    lanes = await L.sbSelect('qh_lanes', 'job_id=eq.' + job_id + '&select=complete');
    if (lanes.length && lanes.every(l => l.complete)) { await finishJob(job_id); return done(); }
    await L.fireForget('qh-tick-background', { job_id });   // next small pass
    return done();
  } catch (e) {
    // never crash the chain silently — let the watchdog resume from saved state
    try { await L.sbUpdate('qh_jobs', 'id=eq.' + job_id, { updated_at: new Date(Date.now() - 120000).toISOString() }); } catch (e2) {}
    return done();
  }
};
async function finishJob(job_id) {
  try { await L.sbUpdate('qh_jobs', 'id=eq.' + job_id, { status: 'complete', updated_at: new Date().toISOString() }); } catch (e) {}
  L.fireForget('qh-finalize', { job_id });
}
function done() { return { statusCode: 200, body: 'ok' }; }
