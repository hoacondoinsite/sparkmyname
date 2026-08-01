// SparkMyName — THE RENDER SPINE (SOP-ART-001 — NEW FILE, 2026-07-05)
// ONE pipeline for every format, present or future (P5: universal by construction).
// Piecework: every piece persists to the Storage Room the moment it completes (P1);
// a cursor on the ledger after every piece (P2); the relay hands the baton to a fresh
// invocation when pieces remain (P3); Foresight sizes, the Guard catches, the Ladder
// descends (Appendix A); assembly is a manifest of persisted pieces (P4). Lanes fan
// out per piece with atomic claims (Appendix B). If the engine is dark at the floor,
// the job PARKS with its cursor intact and a founder alert lands on the ledger —
// the order's core delivery is never blocked by art.
// INPUT: POST { r: reportId, name, seed, format, cursor? } — kit read from the row.
'use strict';
var registry = require('./art-registry.js');
var translator = require('./art-translator.js');
var engine = require('./studio-engine.js');
var storage = require('./sb-storage.js');
var foresight = require('./smn-foresight.js');

var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY;
var BASE = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, ''); // RUNTIME BASE FIX 2026-07-05
var LANES = Math.max(1, Math.min(6, parseInt(process.env.SMN_ART_LANES || '4', 10)));
function sbH(extra){ var o = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }; if (extra) { for (var k in extra) o[k] = extra[k]; } return o; }
function publicUrl(p){ return SB_URL + '/storage/v1/object/public/' + storage.BUCKET + '/' + p; }

async function getRow(r, name){
  var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
    '&name=eq.' + encodeURIComponent(name) + '&select=id,kit,name&limit=1', { headers: sbH({ 'Accept': 'application/json' }) });
  var rows = q.ok ? await q.json() : [];
  return rows && rows[0];
}
async function saveLedger(rowId, kit){
  // MERGE-BEFORE-WRITE (forensic fix, 2026-07-05): fresh row; only our artDept ledger.
  var body = kit;
  try{
    var fq = await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(rowId) + '&select=kit&limit=1', { headers: sbH({ 'Accept': 'application/json' }) });
    var fr = fq.ok ? await fq.json() : [];
    if (fr && fr[0] && fr[0].kit) { var fk = fr[0].kit; fk.artDept = kit.artDept;
      // LOGO BRIDGE (2026-07-10): also carry the compatibility fields the report + gate read.
      if (kit.logoUrls) fk.logoUrls = kit.logoUrls; if (kit.logoDept) fk.logoDept = kit.logoDept;
      body = fk; }
  }catch(_){ }
  await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(rowId), {
    method: 'PATCH', headers: sbH({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }),
    body: JSON.stringify({ kit: body }) });
}

// One piece, one lane: foresight-informed, guard-caught, ladder-by-size (image size steps down).
async function renderPiece(prompt, spec, pieceIdx, path){
  var sizes = spec.size === '2K' ? ['2K', '1K'] : ['1K'];             // the piece ladder
  for (var s = 0; s < sizes.length; s++) {
    var t0 = Date.now();
    try {
      var img = await engine.generateImage(prompt, {
        /* uses the house PHOTO_LADDER in studio-engine (2026-07-27) — no ad-hoc tier lists */ imageSize: sizes[s], aspectRatio: (spec.aspects && spec.aspects[pieceIdx]) || spec.aspect || '1:1' });
      await foresight.record('image', sizes[s], 1, Date.now() - t0);
      if (img && img.b64) {
        var up = await storage.uploadPng(path, img.b64, img.mime || 'image/png');
        if (up && up.ok !== false) return { ok: true, url: publicUrl(path) };
      }
    } catch (e) { await foresight.record('image', sizes[s], 1, Date.now() - t0); }
  }
  return { ok: false };
}

exports.handler = async function (event) {
  var out = function(o){ return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; };
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };
  if (!SB_URL || !SB_KEY) return out({ ok: false, error: 'env' });
  var b = {}; try { b = JSON.parse(event.body || '{}'); } catch (_) {}
  var r = String(b.r || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  var name = String(b.name || '').slice(0, 80).trim();
  var format = String(b.format || '').slice(0, 40);
  if (!r || !name || !format) return out({ ok: false, error: 'missing' });
  var row = registry.row(format);
  if (!row) return out({ ok: false, error: 'unknown format' });
  if (!registry.active(format)) return out({ ok: false, off: true, format: format }); // the switch is the door

  var dbRow = await getRow(r, name);
  if (!dbRow) return out({ ok: false, error: 'no purchased row' });               // spend gate: purchased reports only
  var kit = dbRow.kit || {};
  kit.artDept = kit.artDept || {};
  var led = kit.artDept[format] = kit.artDept[format] || { status: 'pending', cursor: 0, urls: [], pieces: row.spec.pieces || 1 };
  if (led.status === 'complete') return out({ ok: true, cached: true, urls: led.urls }); // the Shelf: never regenerate

  var brief = kit.gov || null;
  var markUrl = (kit.logoUrls && kit.logoUrls[0]) || null;
  var wo = translator.workOrder({ format: format, name: name, domain: b.domain || (kit.domain || ''), seed: b.seed || '', kit: kit, brief: brief, markUrl: markUrl });
  if (wo.error) return out({ ok: false, error: wo.error });

  try { await storage.ensureBucket(); } catch (_) {}
  led.status = 'running'; led.dispatchedAt = new Date().toISOString();

  // ---- DERIVED: zero-generation formats (avatar) — ledger reference, done. ----
  if (wo.engine === 'derived') {
    if (format === 'avatar' && markUrl) { led.urls = [markUrl]; led.cursor = 1; led.status = 'complete'; }
    else { led.status = 'parked'; led.note = 'waiting for mark #1 — the logo department re-kicks this format on completion'; } // expected-early state: quiet park, no alert
    await saveLedger(dbRow.id, kit); return out({ ok: led.status === 'complete', urls: led.urls, status: led.status });
  }
  // ---- SVG BOARDS: code-composed, uploaded, done in one motion. ----
  if (wo.engine === 'svg') {
    if (!wo.svg) { led.status = 'parked'; led.alert = true; led.note = 'svg composition failed'; await saveLedger(dbRow.id, kit); return out({ ok: false }); }
    var p = 'art/' + r + '/' + format + '/board.svg';
    var upl = await storage.uploadPng(p, Buffer.from(wo.svg, 'utf-8').toString('base64'), 'image/svg+xml');
    if (upl && upl.ok !== false) { led.urls = [publicUrl(p)]; led.cursor = 1; led.status = 'complete'; }
    else { led.status = 'parked'; led.alert = true; led.note = 'storage write failed'; }
    await saveLedger(dbRow.id, kit); return out({ ok: led.status === 'complete', urls: led.urls, status: led.status });
  }
  // ---- IMAGE / TILES: piecework with lanes, cursor, relay. ----
  var total = wo.pieces;
  // PER-NAME PATH (2026-07-10 fix): each name stores into its OWN folder so the six names never
  // collide on shared piece-N.png paths — the collision that made every card show name #1's logos
  // (jail) or only the first name land (gas). Slug the name; everything else is unchanged.
  var _nameSlug = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'name';
  var start = Math.max(led.cursor | 0, 0);
  var BATCH = Math.min(LANES, total - start, 4);                       // pieces this invocation, fanned out
  var lanes = [];
  for (var i = 0; i < BATCH; i++) {
    (function(idx){
      lanes.push((async function(){
        // ATOMIC PER-PIECE CLAIM (B: L2): first lane to mark the slot renders it; a lost
        // race exits silently — collision impossible by construction.
        if (led.urls[idx]) return { idx: idx, url: led.urls[idx], claimed: false };
        led.urls[idx] = 'claimed';
        var path = 'art/' + r + '/' + _nameSlug + '/' + format + '/piece-' + (idx + 1) + '.png';
        var res = await renderPiece(wo.prompts[idx] || wo.prompts[0], wo.spec, idx, path);
        return { idx: idx, url: res.ok ? res.url : null, claimed: true };
      })());
    })(start + i);
  }
  var done = await Promise.all(lanes);
  var failed = 0;
  done.forEach(function(d){ if (d.url && d.url !== 'claimed') led.urls[d.idx] = d.url; else if (d.claimed && !d.url) { led.urls[d.idx] = null; failed++; } });
  led.cursor = led.urls.filter(function(u){ return u && u !== 'claimed'; }).length; // P2: the cursor
  led.updated = new Date().toISOString();

  if (failed >= BATCH && BATCH > 0) {                                   // engine dark at the floor: PARK, alert, never lost
    led.status = 'parked'; led.alert = true; led.note = 'engine dark — parked at piece ' + led.cursor + ' of ' + total + '; cursor intact';
    await saveLedger(dbRow.id, kit);
    return out({ ok: false, parked: true, cursor: led.cursor });
  }
  if (led.cursor >= total) {                                            // P4: ASSEMBLY LAST — the manifest of persisted pieces
    led.status = 'complete'; led.completedAt = new Date().toISOString();
    // CRAFT GATE: every piece present and resolvable — broken craft never ships.
    if (led.urls.some(function(u){ return !u || u === 'claimed'; })) { led.status = 'running'; led.cursor = led.urls.filter(Boolean).length; }
    // LOGO BRIDGE (2026-07-10): logos rode the spine — mirror the finished marks into the
    // compatibility fields the report + completeness gate read, so they SHOW and the gate sees them.
    if (format === 'logo_lockups' && led.status === 'complete') {
      var _marks = led.urls.filter(function(u){ return u && u !== 'claimed'; });
      if (_marks.length) {
        kit.logoUrls = _marks;
        kit.logoDept = { reportId: r, name: name, status: 'complete', generatedAt: led.completedAt,
                         concepts: _marks.map(function(u){ return { url: u, thumb: u }; }), via: 'render-spine' };
      }
    }
    await saveLedger(dbRow.id, kit);
    // COMPLETION-FIRES-DELIVERY (2026-07-10): a piece just landed — if this was the LAST asset
    // the whole brand needed, fire the delivery email now (atomic: only the last completer wins).
    if (led.status === 'complete') {
      try { var _comp = require('./smn-curate.js'); await _comp.finalizeIfComplete(r, BASE); }
      catch (e) { console.error('finalize-on-complete failed (spine): ' + String(e && e.message || e)); }
    }
    return out({ ok: true, complete: true, urls: led.urls });
  }
  await saveLedger(dbRow.id, kit);
  // P3: THE RELAY — a fresh invocation resumes at the cursor; this runner exits well inside its allowance.
  try { await fetch(BASE + '/.netlify/functions/art-render-background', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ r: r, name: name, seed: b.seed || '', format: format, domain: b.domain || '' }) }); } catch (_) {}
  return out({ ok: true, relayed: true, cursor: led.cursor, of: total });
};
