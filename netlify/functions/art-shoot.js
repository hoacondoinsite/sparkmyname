// art-shoot.js — FOUNDER SHOOT KIT (Pass Two, Memorial Charter workstream 2).
// Generates cinematic CANDIDATE images for site surfaces using the locked Graphic SOP method
// (studio-engine, textless master-prompt discipline), banks them under shoot/ in Supabase Storage,
// and returns their URLs so the Founder can pick winners like a creative director.
// FOUNDER-ONLY: requires ORDER_START_KEY. Never linked from any public page. Never in the order flow.
// Cost note: each candidate ~$0.134 (Pro 2K). Batches capped at 4 per call.
var engine = require('./studio-engine.js');
var storage = require('./sb-storage.js');

function slug(s){return String(s||'surface').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'surface';}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };
  var KEY = process.env.ORDER_START_KEY || '';
  var b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  if (!KEY || b.key !== KEY) return { statusCode: 403, body: 'no' };

  /* A MISSING SURFACE NAME IS NOW AN ERROR, NOT A SILENT DEFAULT (2026-07-26).
     slug() falls back to the literal string 'surface', so any shoot sent without a name was
     filed under shoot/surface/ — 107 images, 258MB, unattributable to anything and impossible
     to clean up safely because nobody can tell what they were for.
     Failing loudly costs one retry; failing silently cost a quarter of a gigabyte. */
  var rawSurface = String(b.surface || '').trim();
  if (!rawSurface) {
    return { statusCode: 400, body: JSON.stringify({ ok: false,
      error: 'surface_required',
      message: 'Name the surface this shot is for (for example "home-hero" or "detail-domains") so it can be found again.' }) };
  }
  var surface = slug(rawSurface);
  var prompt = String(b.prompt || '').slice(0, 2000).trim();
  var n = Math.max(1, Math.min(4, parseInt(b.n || '2', 10) || 2));
  var size = (b.size === '1K') ? '1K' : '2K';
  if (!prompt) return { statusCode: 400, body: JSON.stringify({ ok: false, error: 'prompt required' }) };
  // The two-layer law, enforced at the gate: scenes are textless, always.
  if (!/NO text/i.test(prompt)) prompt += ' CRITICAL: absolutely NO text, words, letters, numbers, signage, logos, labels, or typography of any kind anywhere \u2014 a purely visual, text-free scene.';

  try { await storage.ensureBucket(); } catch (e) {}
  var urls = [], errors = [];
  for (var i = 0; i < n; i++) {
    try {
      var r = await engine.generateImage(prompt, { imageSize: size, aspectRatio: '16:9' });
      if (r && r.ok && r.b64) {
        var path = 'shoot/' + surface + '/' + Date.now() + '-' + (i + 1) + '.png';
        var up = await storage.uploadPng(path, r.b64, r.mime || 'image/png');
        if (up && up.ok && up.url) urls.push({ url: up.url, engine: r.engine || '' });
        else errors.push('upload failed #' + (i + 1));
      } else errors.push((r && r.error) || 'generation failed #' + (i + 1));
    } catch (e) { errors.push(String(e && e.message || e).slice(0, 120)); }
  }
  return { statusCode: 200, body: JSON.stringify({ ok: urls.length > 0, surface: surface, candidates: urls, errors: errors }) };
};
