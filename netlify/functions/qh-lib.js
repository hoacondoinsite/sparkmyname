// qh-lib.js — shared helpers for the resumable Quality-Harvesting job system.
// Not an endpoint. Talks to Supabase via REST (service role) and to the engine functions.
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = (process.env.SITE_URL || process.env.URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');
const LANES = ['human', 'clever', 'standard', 'professional'];
const LANE_LABEL = { human: 'Human Touch', clever: 'Clever', standard: 'Standard', professional: 'Professional' };
const BATCH = 2;            // tiny, patient passes (founder spec 2026-06-26)
const DEFAULT_TARGET = 12;  // accepted concepts per lane (production target)
const TIER_FLOOR = 3;       // never accept below a 3 ("solid keep")
const MAX_STALL = 3;        // THREE consecutive no-progress passes before stepping the tier down
const MAX_PASSES = 30;      // hard cap per lane (larger, since passes are tiny) — guarantees termination

function H(extra) { return Object.assign({ apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' }, extra || {}); }
async function sbInsert(table, rows) {
  const r = await fetch(SB_URL + '/rest/v1/' + table, { method: 'POST', headers: H({ Prefer: 'return=representation' }), body: JSON.stringify(rows) });
  const t = await r.text(); let d = []; try { d = JSON.parse(t); } catch (e) {}
  if (!r.ok) throw new Error('insert ' + table + ' ' + r.status + ' ' + t.slice(0, 200));
  return Array.isArray(d) ? d : [d];
}
async function sbSelect(table, query) {
  const r = await fetch(SB_URL + '/rest/v1/' + table + '?' + query, { headers: H({ Accept: 'application/json' }) });
  const t = await r.text(); let d = []; try { d = JSON.parse(t); } catch (e) {}
  if (!r.ok) throw new Error('select ' + table + ' ' + r.status + ' ' + t.slice(0, 200));
  return Array.isArray(d) ? d : [];
}
async function sbUpdate(table, query, patch) {
  const r = await fetch(SB_URL + '/rest/v1/' + table + '?' + query, { method: 'PATCH', headers: H({ Prefer: 'return=representation' }), body: JSON.stringify(patch) });
  const t = await r.text(); if (!r.ok) throw new Error('update ' + table + ' ' + r.status + ' ' + t.slice(0, 200));
}
async function postFn(fn, body) {
  const r = await fetch(BASE + '/.netlify/functions/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  let d = {}; try { d = await r.json(); } catch (e) {}
  return d;
}
// fire-and-forget: kick a background function and don't wait for its work (it returns 202 fast).
async function fireForget(fn, body) {
  try { await fetch(BASE + '/.netlify/functions/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); } catch (e) {}
}
module.exports = { SB_URL, SB_KEY, BASE, LANES, LANE_LABEL, BATCH, DEFAULT_TARGET, TIER_FLOOR, MAX_STALL, MAX_PASSES, sbInsert, sbSelect, sbUpdate, postFn, fireForget };
