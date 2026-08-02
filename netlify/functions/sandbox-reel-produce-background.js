// sandbox-reel-produce-background.js — REAL cinematic brand reel.
// Generates actual video footage with Google Veo 3.1 (which renders native audio), plus an
// optional OpenAI TTS voiceover track, uploads every asset to Supabase storage, and writes a
// manifest the player reads. Scenes play back-to-back in the player, so no ffmpeg stitching.
//
// Background function: Netlify allows these to run for minutes (a Veo render takes minutes),
// which a normal function cannot do.
//
// Dependency-free CommonJS. Truth rails: nothing is marked ready unless the bytes actually
// landed in storage; every failure is written to the manifest as a real error.
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SANDBOX_BUCKET || 'brand-headers';
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

const H = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY };
const TPL = require('./templateRegistry');  // CURATED EXCELLENCE: deterministic per-industry direction

async function put(path, buf, type) {
  const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: Object.assign({}, H, { 'Content-Type': type, 'x-upsert': 'true' }),
    body: buf
  });
  if (!r.ok) throw new Error('upload failed ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function writeManifest(id, obj) {
  return put(`sandbox/reels/${id}/manifest.json`, Buffer.from(JSON.stringify(obj)), 'application/json');
}

async function audit(action, id, meta) {
  try {
    await fetch(`${SB_URL}/rest/v1/sandbox_audit_logs`, {
      method: 'POST', headers: Object.assign({}, H, { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      body: JSON.stringify({ actor_id: 'reel_producer', action, target_table: 'storage', record_id: id, metadata: meta || {} })
    });
  } catch (e) {}
}

// ---- Veo 3.1: real footage, vertical, with native audio -----------------------------
async function veo(prompt, ix) {
  const base = 'https://generativelanguage.googleapis.com/v1beta';
  const MODELS = ['veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.0-fast-generate-001', 'veo-3.0-generate-001'];
  const start = (model, withPerson) => fetch(`${base}/models/${model}:predictLongRunning?key=${GK}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: withPerson ? { aspectRatio: '9:16', personGeneration: 'allow_adult' } : { aspectRatio: '9:16' } })
  });
  let op = null, lastErr = '';
  outer:
  for (const model of MODELS) {
    for (let a = 1; a <= 2; a++) {
      let r = await start(model, true);
      if (r.ok) { op = await r.json(); break outer; }
      const t = (await r.text()).slice(0, 400);
      if (r.status === 429) {
        lastErr = 'VEO QUOTA 429 (daily render limit reached on this API key): ' + t;
        if (a < 2) { await new Promise(res => setTimeout(res, 20000)); continue; }
        throw new Error(lastErr);
      }
      if (/personGeneration|person_generation/i.test(t)) {
        r = await start(model, false);
        if (r.ok) { op = await r.json(); break outer; }
      }
      lastErr = `veo ${model} ${r.status} ${t}`; break;
    }
  }
  if (!op) throw new Error(lastErr || 'veo: all models failed');
  for (let i = 0; i < 60 && !op.done; i++) {
    await new Promise(res => setTimeout(res, 6000));
    op = await (await fetch(`${base}/${op.name}?key=${GK}`)).json();
  }
  if (!op.done) throw new Error('veo timeout on scene ' + ix);
  if (op.error) throw new Error('veo op ' + JSON.stringify(op.error).slice(0, 300));
  const gv = (op.response || {}).generateVideoResponse || op.response || {};
  const samp = (gv.generatedSamples && gv.generatedSamples[0]) || (gv.generatedVideos && gv.generatedVideos[0]) || null;
  const uri = samp && ((samp.video && samp.video.uri) || samp.uri || (samp.video && samp.video.url));
  if (!uri) throw new Error('veo: no video uri returned');
  const dl = await fetch(uri + (uri.indexOf('?') > -1 ? '&' : '?') + 'key=' + GK);
  if (!dl.ok) throw new Error('veo download ' + dl.status);
  return Buffer.from(await dl.arrayBuffer());
}

// ---- OpenAI TTS voiceover -----------------------------------------------------------
async function narrate(script, voice) {
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST', headers: { Authorization: 'Bearer ' + OA, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: voice || 'onyx', input: script, response_format: 'mp3' })
  });
  if (!r.ok) throw new Error('tts ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return Buffer.from(await r.arrayBuffer());
}

exports.handler = async function (event) {
  const q = event.queryStringParameters || {};
  let b = {};
  try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  const opts = Object.assign({}, q, b);

  if (!opts.founderToken || opts.founderToken !== process.env.SMN_FOUNDER_TOKEN)
    return { statusCode: 401, body: '{"error":"founder token required"}' };
  if (!SB_URL || !SB_KEY) return { statusCode: 500, body: '{"error":"supabase env missing"}' };
  if (!GK) return { statusCode: 500, body: '{"error":"GEMINI_API_KEY not set — Veo cannot run"}' };

  const reelId = String(opts.reelId || ('reel_' + Date.now())).replace(/[^a-zA-Z0-9_-]/g, '');
  const seconds = Math.max(8, Math.min(32, Number(opts.seconds) || 16));
  const sceneCount = Math.max(1, Math.min(4, Math.round(seconds / 8)));

  const brandName = opts.brandName || 'the brand';
  const headline = opts.headline || '';
  const industry = opts.industry || '';
  const look = opts.scenePrompt || 'bright cinematic commercial advertising film, vibrant saturated color, crisp sunlight, upbeat and energetic, premium and aspirational — never dark, moody, gloomy, somber or melancholy';
  const tagline = opts.tagline || '';
  const website = opts.website || '';

  const base = { reelId, brandName, headline, seconds, sceneCount, status: 'rendering', startedAt: new Date().toISOString(), scenes: [], errors: [] };
  try { await writeManifest(reelId, base); } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'cannot write manifest: ' + e.message }) };
  }
  await audit('REEL_STARTED', reelId, { brandName, seconds, sceneCount });

  // CURATED EXCELLENCE: scene direction comes from the locked industry archetype, not a
  // fresh guess. An 8s request renders the single deterministic HOOK; longer reels extend it
  // with the archetype scene. Free-form scenePrompt is honoured only as an accent.
  const tpl = TPL.archetypeFor(industry);
  const hook = TPL.hookFor(industry, brandName, headline);
  const scene = TPL.sceneFor(industry, opts.scenePrompt || '');
  const beats = (sceneCount <= 1 ? [hook] : [hook].concat(
    new Array(Math.max(0, sceneCount - 1)).fill(0).map((_, i) =>
      scene + (i === sceneCount - 2 ? ' Final triumphant hero shot that makes the viewer want to come in right now.' : ' A second angle on the same bright, appealing subject.'))
  )).slice(0, sceneCount);

  const scenes = [];
  for (let i = 0; i < beats.length; i++) {
    try {
      const buf = await veo(beats[i], i + 1);
      const url = await put(`sandbox/reels/${reelId}/scene_${i + 1}.mp4`, buf, 'video/mp4');
      scenes.push({ n: i + 1, url, bytes: buf.length });
      await writeManifest(reelId, Object.assign({}, base, { scenes, status: 'rendering' }));
    } catch (e) {
      base.errors.push({ scene: i + 1, error: String(e.message || e) });
      await writeManifest(reelId, Object.assign({}, base, { scenes, status: 'rendering' }));
    }
  }

  // Voiceover — only claimed if the audio actually uploaded.
  let voiceUrl = null;
  if (OA && opts.narration !== 'off') {
    try {
      const script = opts.script || [headline || `${brandName}.`, tagline, website ? `Visit ${website}.` : ''].filter(Boolean).join(' ');
      const mp3 = await narrate(script, opts.voice);
      voiceUrl = await put(`sandbox/reels/${reelId}/voice.mp3`, mp3, 'audio/mpeg');
    } catch (e) { base.errors.push({ stage: 'narration', error: String(e.message || e) }); }
  }

  const final = Object.assign({}, base, {
    scenes, voiceUrl,
    status: scenes.length ? 'ready' : 'failed',
    finishedAt: new Date().toISOString(),
    template: tpl.key,
    engine: 'google-veo-3.1' + (voiceUrl ? ' + openai-tts' : '')
  });
  await writeManifest(reelId, final);
  await audit(scenes.length ? 'REEL_READY' : 'REEL_FAILED', reelId, { scenes: scenes.length, errors: final.errors.length });

  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(final) };
};
