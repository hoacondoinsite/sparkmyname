// SparkMyName — ART SHOOT PRUNE (NEW FILE, 2026-07-26)
//
// WHY
// shoot/ holds 242 files and 613MB. Only one image per surface is ever displayed — the one the
// Accent Registry points at. Everything else is a superseded take, and another arrives every
// time the Art Director runs. Four surfaces account for 231 of those files.
//
// WHY IT DOES NOT SIMPLY DELETE THE OLD ONES
// "Old" is not the same as "unused". The Founder may have chosen the fourth take, not the most
// recent, and the registry is the only record of that choice. A prune that assumed newest-is-
// live would delete the image the homepage is currently showing. So:
//
//   1. It reads site-art/manifest.json FIRST. Every URL in it is untouchable, full stop.
//   2. It keeps the newest KEEP takes per surface regardless.
//   3. It deletes nothing unless explicitly told to. A GET reports; only POST with the founder
//      key and confirm:true removes anything.
//   4. It refuses to run at all if the registry cannot be read — because without it there is no
//      way to know what is in use, and guessing is how live art disappears.
//
// GET  /.netlify/functions/art-prune            -> what it WOULD delete, and why
// POST /.netlify/functions/art-prune {key, confirm:true} -> deletes, and reports what it did
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ORDER_START_KEY
'use strict';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FOUNDER_KEY = process.env.ORDER_START_KEY;
const BUCKET = 'brand-headers';
const PREFIX = 'shoot/';
const KEEP = 3;          // per surface, newest first, on top of anything the registry uses
const MAX_DELETE = 500;  // a ceiling, so a bug cannot empty the bucket in one call

function resp(code, body) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body, null, 2) };
}

async function sbList(prefix, limit, offset) {
  const r = await fetch(SB_URL + '/storage/v1/object/list/' + BUCKET, {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: prefix, limit: limit, offset: offset, sortBy: { column: 'created_at', order: 'desc' } })
  });
  if (!r.ok) throw new Error('list ' + r.status);
  return r.json();
}

async function readRegistry() {
  // The one source of truth for what is on screen. If this cannot be read, nothing is deleted.
  const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/site-art/manifest.json', {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
  });
  if (!r.ok) return null;
  try { return await r.json(); } catch (e) { return null; }
}

exports.handler = async function (event) {
  if (!SB_URL || !SB_KEY) return resp(200, { ok: false, error: 'no_supabase_config' });

  const isPost = (event.httpMethod || 'GET').toUpperCase() === 'POST';
  let body = {};
  if (isPost) { try { body = JSON.parse(event.body || '{}'); } catch (e) {} }

  if (isPost) {
    if (!FOUNDER_KEY || body.key !== FOUNDER_KEY) return resp(401, { ok: false, error: 'bad_key' });
    if (body.confirm !== true) {
      return resp(400, { ok: false, error: 'confirm_required',
        message: 'Send confirm:true. A dry run is a GET; deleting is deliberate.' });
    }
  }

  try {
    // ---- 1. what is live -------------------------------------------------
    const registry = await readRegistry();
    if (registry === null) {
      return resp(200, { ok: false, error: 'registry_unreadable',
        message: 'site-art/manifest.json could not be read. Nothing was deleted — without the ' +
                 'registry there is no way to tell which shot is on screen, and guessing is how ' +
                 'live art disappears.' });
    }
    const live = new Set();
    const art = (registry && registry.art) || registry || {};
    Object.keys(art).forEach(function (surface) {
      const url = String(art[surface] || '');
      const m = /\/brand-headers\/(.+)$/.exec(url);
      if (m) live.add(decodeURIComponent(m[1]));
    });

    // ---- 2. everything in shoot/ ----------------------------------------
    const surfaces = await sbList(PREFIX, 1000, 0);
    const all = [];
    for (const entry of (Array.isArray(surfaces) ? surfaces : [])) {
      if (!entry || !entry.name) continue;
      // list returns folders at this level; descend one step
      const inner = await sbList(PREFIX + entry.name + '/', 1000, 0);
      (Array.isArray(inner) ? inner : []).forEach(function (o) {
        if (!o || !o.name) return;
        all.push({
          path: PREFIX + entry.name + '/' + o.name,
          surface: entry.name,
          created: o.created_at || (o.metadata && o.metadata.lastModified) || '',
          bytes: (o.metadata && o.metadata.size) || 0
        });
      });
    }

    // ---- 3. decide, conservatively --------------------------------------
    const bySurface = {};
    all.forEach(function (o) { (bySurface[o.surface] = bySurface[o.surface] || []).push(o); });

    const keep = [], drop = [];
    Object.keys(bySurface).forEach(function (s) {
      const list = bySurface[s].sort(function (a, b) { return String(b.created).localeCompare(String(a.created)); });
      list.forEach(function (o, i) {
        if (live.has(o.path)) { keep.push({ ...o, why: 'on screen now' }); return; }
        if (i < KEEP) { keep.push({ ...o, why: 'one of the ' + KEEP + ' newest' }); return; }
        drop.push(o);
      });
    });

    const freed = drop.reduce(function (a, b) { return a + (b.bytes || 0); }, 0);
    const summary = {
      ok: true,
      mode: isPost ? 'deleted' : 'dry run — nothing was touched',
      surfaces: Object.keys(bySurface).length,
      total_files: all.length,
      protected_by_registry: [...live].length,
      keeping: keep.length,
      would_delete: drop.length,
      would_free_mb: Math.round(freed / 1048576),
      keep_per_surface: KEEP
    };

    if (!isPost) {
      summary.sample = drop.slice(0, 8).map(function (o) { return o.path; });
      return resp(200, summary);
    }

    // ---- 4. delete, in bounded batches ----------------------------------
    if (drop.length > MAX_DELETE) {
      return resp(200, { ...summary, ok: false, error: 'too_many',
        message: drop.length + ' files exceeds the ' + MAX_DELETE + ' ceiling for one call. ' +
                 'Run it again after this batch rather than raising the limit.' });
    }
    let removed = 0;
    for (let i = 0; i < drop.length; i += 50) {
      const batch = drop.slice(i, i + 50).map(function (o) { return o.path; });
      const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET, {
        method: 'DELETE',
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: batch })
      });
      if (r.ok) removed += batch.length;
    }
    return resp(200, { ...summary, deleted: removed, freed_mb: Math.round(freed / 1048576) });

  } catch (e) {
    return resp(200, { ok: false, error: String((e && e.message) || e),
      message: 'Nothing was deleted.' });
  }
};
