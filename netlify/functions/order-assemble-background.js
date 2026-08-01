// SparkMyName Agency OS — ASSEMBLER WORKER (2026-07-05). Full composition pipeline moved
// under the background allowance: save-report + art + logos + delivery email can exceed the
// synchronous wall, which could kill the run between the art trigger and the logo trigger.
// When a job's required tasks are green, composes the needs-only report, ENFORCES the
// Founder's locked card counts, reveals it in the Studio, and triggers the ready email.
// Graceful-degradation law: a report always ships complete at its tier — never late, never never.
'use strict';
const { manifestFor } = require('./os-manifests.js');
const { dbSelect, dbInsert, dbUpdate, dbClaim } = require('./os-db.js');
const BASE = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, ''); // RUNTIME BASE FIX 2026-07-05: URL is not set for running functions on this site — SITE_URL (proven by the baton) leads the chain

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const jobs = await dbSelect('smn_jobs', 'id=eq.' + body.job_id + '&limit=1');
  const job = jobs && jobs[0];
  if (!job) return { statusCode: 404, body: '{"ok":false,"err":"no job"}' };
  const m = manifestFor(job.tier);
  const tasks = await dbSelect('smn_tasks', 'job_id=eq.' + job.id);
  const byKey = {}; (tasks || []).forEach(t => { byKey[t.key] = t; });

  // required (non-assemble) tasks must be done
  const requiredOpen = m.tasks.filter(t => t.required && t.key !== 'assemble')
    .filter(t => !(byKey[t.key] && byKey[t.key].status === 'done'));
  if (requiredOpen.length) return { statusCode: 200, body: JSON.stringify({ ok: false, waiting: requiredOpen.map(t => t.key) }) };

  // ATOMIC JOB CLAIM (2026-07-05): flip open->assembling; a second assemble call exits ok —
  // duplicate reports and duplicate delivery emails are impossible by construction.
  const won = await dbClaim('smn_jobs', 'id=eq.' + job.id + '&status=eq.open', { status: 'assembling', updated_at: new Date().toISOString() });
  if (!won.length) return { statusCode: 200, body: JSON.stringify({ ok: true, already: job.status }) };

  // GATE SURVIVORS FIRST (SOP-BG-001, 2026-07-05): when the Selection Gate ran, its
  // reviewed order IS the presentation order; judge order otherwise — byte-parity off.
  const gateArt = (byKey.gate && byKey.gate.artifact) || null;
  // CURATION (Founder order, 2026-07-05 evening): when the Selection Gate ran, its six
  // stand; otherwise the baton's quality department curates the wide judged pool —
  // the 4.2 bar, the 42/42/10/6 lane weighting, and the Six-Names law.
  const judgedWide = (byKey.judge && byKey.judge.artifact && byKey.judge.artifact.names) || [];
  const judged = (gateArt && gateArt.gated && gateArt.names && gateArt.names.length ? gateArt.names
                 : require('./smn-curate.js').curate(judgedWide)) || [];
  const govBrief = (byKey.governor && byKey.governor.artifact && byKey.governor.artifact.brief) || null;
  const kitArt = (byKey.copy_kit && byKey.copy_kit.artifact) || {};
  const kit = kitArt.kit || {};
  const c = m.caps;

  // FOUNDER-LOCKED CARD COUNTS — enforced at composition, whatever departments returned
  const trimmedKit = Object.assign({}, kit, govBrief ? { gov: govBrief } : {}, {
    taglines: (kit.taglines || []).slice(0, c.taglines),
    bios:     (kit.bios     || []).slice(0, c.bios),
    posts:    (kit.posts    || kit.launchPosts || []).slice(0, c.posts),
    palettes: (kit.palettes || []).slice(0, 1),
  });
  // Six names; the LEAD name carries the full kit (chosen-name path). Others render on the
  // report's proven fallbacks — same behavior the template already guarantees.
  // CROWN THE LEAD (2026-07-05): copy the judge verdict into the score field the report
  // template sorts and promotes by — the presented lead now always matches the kitted lead.
  const names = judged.slice(0, c.names).map((n, i) => Object.assign({}, n, { score: (typeof n.judge === 'number' ? n.judge : n.score) }, i === 0 ? { kit: trimmedKit } : {}));
  // CO-54 SIX-NAMES TRIPWIRE (Founder, 2026-07-06 — the plumber breach): on any order whose
  // manifest promises six, delivering fewer is FORBIDDEN. Park loudly; never ship a rip-off.
  if ((c.names|0) >= 6 && names.length < (c.names|0)) {
    console.error('SIX-NAMES BREACH: job ' + job.id + ' (' + (job.email||'') + ') produced only ' + names.length + ' of ' + c.names + ' — PARKED, no save, no email. Judged pool was ' + judgedWide.length + '.');
    try { await dbUpdate('smn_jobs', 'id=eq.' + job.id, { status: 'parked', updated_at: new Date().toISOString() }); } catch(_){}
    return { statusCode: 200, body: JSON.stringify({ ok:false, parked:true, reason:'six_names_breach', got:names.length }) };
  }
  // CO-19 EMERGENCY PARITY (2026-07-06): the CO-11 gate audits TAGLINES on EVERY row —
  // the lead-only kit starved the gate on the Order Board path (the ambulance park).
  // Build a full kit for every delivered name, with one retry, exactly like deliver-background.
  for (let ki = 1; ki < names.length; ki++) {
    for (let attempt = 0; attempt < 2 && !names[ki].kit; attempt++) {
      try {
        const kj = await fetch(BASE + '/.netlify/functions/build-kit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: names[ki].name, seed: job.seed, kind: 'brand' }) }).then(x => x.json()).catch(() => null);
        if (kj && !kj.error && (kj.taglines || (kj.kit && kj.kit.taglines))) { names[ki].kit = kj.kit || kj; }
      } catch (e) {}
    }
    if (!names[ki].kit) console.error('CO-19: kit failed twice for ' + names[ki].name + ' — the gate will name it');
  }
  const lead = kitArt.lead || (names[0] && names[0].name) || '';

  // Reveal through save-report with the BATON'S EXACT payload: {names, to, email, seed}
  const sr = await fetch(BASE + '/.netlify/functions/save-report', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ names: names, to: job.email, email: job.email, seed: job.seed }),
  }).then(x => x.json()).catch(() => ({}));

  // Post-report departments — the baton's proven triggers, behind their existing switches.
  if (sr && sr.key && String(process.env.SMN_ART_DEPT || '').toLowerCase() === 'on') {
    try { await fetch(BASE + '/.netlify/functions/art-department-background', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ r: sr.key, seed: job.seed, cursor: 0 }) }); } catch (_) {}
  }
  // UNIVERSAL ART DEPARTMENT (SOP-ART-001, 2026-07-05): dispatch every ACTIVE registry
  // format through the ONE render spine. Each format's own switch is the door — the
  // spine re-checks it, so this dispatch is inert until a switch turns on. Fire-and-
  // forget: art NEVER blocks the core delivery.
  if (sr && sr.key && lead) {
    try {
      const reg = require('./art-registry.js');
      const NEW_FORMATS = ['business_card', 'letterhead', 'summary_sheet', 'avatar', 'support_image', 'social_tiles'];
      for (const fmt of NEW_FORMATS) {
        if (!reg.active(fmt)) continue;
        try { await fetch(BASE + '/.netlify/functions/art-render-background', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ r: sr.key, name: lead, seed: job.seed, format: fmt, domain: (names[0] && names[0].domain) || '' }) }); } catch (_) {}
      }
    } catch (_) {}
  }
  if (sr && sr.key && String(process.env.SMN_LOGO_DEPT || '').toLowerCase() === 'on') {
    // CO-19 EMERGENCY PARITY (2026-07-06 ~0330): the CO-11 gate audits EVERY row for marks;
    // this assembler was still supplying the LEAD only — starving its own gate into a park
    // (the ambulance order). Dispatch marks for EVERY delivered name, like deliver-background.
    var _dnames = (names && names.length) ? names : [];
    for (var _li = 0; _li < _dnames.length; _li++) {
      var _nm = _dnames[_li] && _dnames[_li].name; if (!_nm) continue;
      try { await fetch(BASE + '/.netlify/functions/logo-concepts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ r: sr.key, name: String(_nm), seed: job.seed, trigger: 'auto' }) }); } catch (_) {}
      if (_li < _dnames.length - 1) await new Promise(function (rs) { setTimeout(rs, 8000); }); // CO-21: stagger — never spike the per-minute cap
    }
  }

  await dbUpdate('smn_jobs', 'id=eq.' + job.id, { status: 'done', stage: 'delivered', updated_at: new Date().toISOString() });
  try {
    // THE COMPLETENESS GATE (Founder order, 2026-07-05 evening): NO REPORT LEAVES
    // INCOMPLETE. The e-mail waits until the hero and the logos are ON the rows.
    // Terminal failure or timeout = the order PARKS with an alert — never half a brand.
    if (String(process.env.SMN_COMPLETE_DELIVERY || 'on').toLowerCase() !== 'off') {
      try {
        const comp = require('./smn-curate.js');
        const w = await comp.waitForArt({ r: sr.key, lead: lead });
        console.log('completeness gate: ' + (w.ok ? 'COMPLETE' : 'HELD') + ' after ' + Math.round(w.waitedMs/1000) + 's — ' + w.reason);
        if (!w.ok) { await comp.parkDelivery(sr.key, lead, w.reason); return { key: sr.key, parked: true, reason: w.reason }; }
      } catch (e) { console.error('completeness gate error (delivering anyway would violate the order — parking): ' + String(e && e.message || e)); return { key: sr.key, parked: true, reason: 'gate error' }; }
    }
    await fetch(BASE + '/.netlify/functions/send-kit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: job.email, names: names, reportUrl: (sr && sr.url) || (BASE + '/account.html'), accountUrl: BASE + '/account.html' }),
    });
  } catch (_) {}
  return { statusCode: 200, body: JSON.stringify({ ok: true, chosen: lead, counts: { names: names.length, taglines: trimmedKit.taglines.length, bios: trimmedKit.bios.length, posts: trimmedKit.posts.length } }) };
};
