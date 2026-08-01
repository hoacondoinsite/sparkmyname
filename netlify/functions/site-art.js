// SparkMyName — SITE ACCENT REGISTRY (CO220, Founder-approved 2026-07-22)
// One tiny registry: which shot dresses which surface of the july22 site.
// GET  -> { ok, art: { surface: url, ... } }   (public, cached 5 min)
// POST -> { key, surface, url }  merges + saves site-art/manifest.json  (founder key gated)
// Rides the existing sb-storage wiring. New file; nothing existing touched.
'use strict';
var storage = require('./sb-storage.js');
var SB_URL = process.env.SUPABASE_URL || '';
var BUCKET = process.env.SMN_HEADER_BUCKET || 'brand-headers';
var PATH = 'site-art/manifest.json';

async function readManifest() {
  try {
    var r = await fetch(SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + PATH, { method: 'GET' });
    if (r.status >= 300) return {};
    return await r.json();
  } catch (e) { return {}; }
}
exports.handler = async function (event) {
  if (event.httpMethod === 'GET') {
    var art = await readManifest();
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify({ ok: true, art: art }) };
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };
  var KEY = process.env.ORDER_START_KEY || '';
  var b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  if (!KEY || b.key !== KEY) return { statusCode: 403, body: 'no' };
  var surface = String(b.surface || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  var url = String(b.url || '').slice(0, 500);
  if (!surface) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'surface required' }) };
  if (url && !(url.indexOf(SB_URL) === 0)) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'url must be our own storage' }) };
  try { await storage.ensureBucket(); } catch (e) {}
  var art = await readManifest();
  if (url) art[surface] = url; else delete art[surface];
  var up = await storage.uploadPng(PATH, Buffer.from(JSON.stringify(art)).toString('base64'), 'application/json');
  return { statusCode: 200, body: JSON.stringify({ ok: !!(up && up.ok), art: art, error: up && up.error }) };
};
