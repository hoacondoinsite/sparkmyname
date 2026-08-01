// REFINE (async) — the customer-satisfaction safety net. Triggered by add-names (the button),
// this BACKGROUND function does the slow work off-screen: generate 25 fresh names (never
// repeats), build a COMPLETE brand kit for each, append them to the report, mark them NEW
// for ~7 days, rebuild the saved snapshot, and email the customer "your additional concepts
// are ready." The customer never waits on a page — they get an email and the names are
// already in their Brand Library. Netlify runs *-background functions async for up to 15 min,
// so building 25 full kits serially is safe and reliable.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. SITE_URL/URL for internal engine calls.

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = (process.env.SITE_URL || process.env.URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');
const { buildReportPage } = require('./report-template.js');

const HARD_CAP = 100;
const BATCH = 25;
const NEW_DAYS = 7;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false });
  if (!SB_URL || !SB_KEY) { console.error('refine-bg: missing supabase env'); return resp(200, { ok: false }); }

  let id = '', more = '';
  try {
    const b = JSON.parse(event.body || '{}');
    id = (b.r || b.report_id || '').replace(/[^a-z0-9]/g, '').slice(0, 32);
    more = (b.more || '').slice(0, 400);
  } catch (e) {}
  if (!id) return resp(200, { ok: false });

  // 1) Load the report.
  let report = null;
  try {
    const r = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id) + '&select=id,seed,email,name_count&limit=1', { headers: sbHeaders() });
    const rows = await r.json().catch(function () { return []; });
    report = (Array.isArray(rows) && rows[0]) ? rows[0] : null;
  } catch (e) {}
  if (!report) { console.error('refine-bg: report not found', id); return resp(200, { ok: false }); }

  const curCount = report.name_count || 0;
  if (curCount >= HARD_CAP) { console.log('refine-bg: capped', id); return resp(200, { ok: false, capped: true }); }

  // 2) Load existing names (to exclude + rebuild snapshot).
  let existing = [];
  try {
    const r = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(id) +
      '&select=position,name,tagline,domain,domain_available,handle,score,kind,kit&order=position.asc&limit=200', { headers: sbHeaders() });
    existing = await r.json().catch(function () { return []; });
    if (!Array.isArray(existing)) existing = [];
  } catch (e) {}
  const exclude = existing.map(function (n) { return n.name; }).filter(Boolean);

  // 3) Generate a fresh batch — exclude everything already seen.
  const seed = ((report.seed || 'a brand') + (more ? (' \u2014 also: ' + more) : '')).slice(0, 600);
  let fresh = [];
  try {
    const gn = await postFn('clean-names', { seed: seed, count: BATCH + 6, avoid: exclude }); // ENGINE SWAP (was generate-names)
    if (gn && Array.isArray(gn.names)) fresh = gn.names.filter(function (n) { return n && n.name; });
  } catch (e) { console.error('refine-bg: generate failed', e && e.message ? e.message : String(e)); }

  const have = {}; exclude.forEach(function (n) { have[slug(n)] = 1; });
  const room = HARD_CAP - curCount;
  const toAdd = [];
  for (let i = 0; i < fresh.length && toAdd.length < Math.min(BATCH, room); i++) {
    const k = slug(fresh[i].name);
    if (k && !have[k]) { have[k] = 1; toAdd.push(fresh[i]); }
  }
  if (!toAdd.length) { console.log('refine-bg: no new names', id); return resp(200, { ok: false }); }

  // 3.5) Build the FULL kit for each new name — SERIAL, reliable (background has 15 min).
  for (let i = 0; i < toAdd.length; i++) {
    try {
      const kit = await postFn('build-kit', { name: toAdd[i].name, seed: seed, kind: 'brand' });
      if (kit && !kit.error) toAdd[i].kit = kit;
    } catch (e) { console.warn('refine-bg: build-kit failed for ' + toAdd[i].name); }
  }

  // 4) Insert the new names.
  const rows = toAdd.map(function (n, i) {
    return {
      report_id: id, email: report.email || null, position: curCount + i,
      name: n.name, tagline: n.tagline || null, domain: n.domain || null,
      domain_available: (n.domainAvailable === true), handle: n.handle || null,
      score: (typeof n.score === 'number') ? n.score : null, kind: 'brand', kit: n.kit || {}
    };
  });
  try {
    await fetch(SB_URL + '/rest/v1/report_names', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, sbHeaders()),
      body: JSON.stringify(rows)
    });
  } catch (e) { console.error('refine-bg: insert failed', e && e.message ? e.message : String(e)); }

  // 5) Update count + rebuild snapshot. New names carry newUntil so the report badges them NEW.
  const newCount = curCount + toAdd.length;
  const newUntil = Date.now() + NEW_DAYS * 24 * 60 * 60 * 1000;
  try {
    await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, sbHeaders()),
      body: JSON.stringify({ name_count: newCount })
    });
  } catch (e) {}
  try {
    const allNames = existing.map(mapRow).concat(toAdd.map(function (n) {
      return { name: n.name, score: n.score, tagline: n.tagline, domain: n.domain, domainAvailable: (n.domainAvailable === true), handle: n.handle, kit: n.kit || {}, newUntil: newUntil };
    }));
    const when = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = buildReportPage({ names: allNames, seed: report.seed || '', when: when });
    await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, sbHeaders()),
      body: JSON.stringify({ html: html })
    });
  } catch (e) { console.error('refine-bg: snapshot rebuild failed', e && e.message ? e.message : String(e)); }

  // 6) Email the customer that their additional concepts are ready.
  if (report.email) {
    try {
      await postFn('send-kit', { to: report.email, kind: 'refine', added: toAdd.length, accountUrl: BASE + '/account.html' });
    } catch (e) { console.error('refine-bg: notify email failed', e && e.message ? e.message : String(e)); }
  }

  // Category Cinematic Image parity: stamp the shared library header onto ALL concepts,
  // including the 25 new ones. Library HIT = $0 and no regeneration; failure never blocks refine.
  if (String(process.env.SMN_ART_DEPT || '').toLowerCase() === 'on') {
    try { await postFn('art-department-background', { r: id, seed: report.seed || '', cursor: 0 }); }
    catch (e) { console.error('refine-bg: art-dept trigger failed', e && e.message ? e.message : String(e)); }
  }

  console.log('refine-bg DONE for ' + id + ' \u2014 added ' + toAdd.length + ' (total ' + newCount + ')');
  return resp(200, { ok: true, added: toAdd.length, total: newCount });
};

function mapRow(n) {
  return { name: n.name, score: n.score, tagline: n.tagline, domain: n.domain, domainAvailable: (n.domain_available === true || n.domainAvailable === true), handle: n.handle, kit: n.kit || {} };
}
function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function sbHeaders() { return { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }; }
async function postFn(fn, body) {
  const r = await fetch(BASE + '/.netlify/functions/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  let d = {}; try { d = await r.json(); } catch (e) {}
  return d;
}
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
