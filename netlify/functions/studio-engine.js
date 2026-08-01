// ============================================================================
// SparkMyName — GRAPHIC DESIGN DEPARTMENT · engine
// ----------------------------------------------------------------------------
// Turns APPROVED brand data into a cinematic, textless brand HERO scene.
// Quality-tiered: Gemini 3 Pro Image (Nano Banana Pro, best) -> Gemini 2.5
// Flash Image (cheaper) -> OpenAI (fallback). Implements the SOP scene-recipe
// translation layer. Touches NO naming/copy/delivery engine. No npm deps.
// ============================================================================

function gUrl(model){ return 'https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent'; }
var OPENAI_URL = 'https://api.openai.com/v1/images/generations';

// ---- Scene-recipe translation layer (concrete nouns the engine obeys) -------
var RECIPES = [
  { k:/pressure wash|power wash|exterior clean/i,
    subject:'a dramatic, glistening clean-stripe reveal on a surface as the hero, with an arc of water spray catching bright sunlight',
    cues:'brilliant daylight, a sparkling spotless area beside a grimy one, powerful spray and crisp water droplets, satisfying and immaculate' },
  { k:/plumb/i,
    subject:'a gleaming, freshly-installed chrome faucet or fixture with a single bead of water as the hero, pristine',
    cues:'a clean modern bathroom or kitchen, soft light, spotless polished surfaces, professional and trustworthy' },
  { k:/hvac|heating|cooling|air[- ]?condition/i,
    subject:'a sleek modern climate system and elegant thermostat in a perfectly comfortable home as the hero',
    cues:'a crisp comfortable interior, balanced warm-and-cool light, immaculate equipment, a deep sense of comfort and reliability' },
  { k:/\bdental|\bdentist|denture|orthodont|endodont|periodont|\bteeth\b|\btooth\b/i,
    subject:'a pristine, modern dental treatment suite as the hero, immaculate and calming',
    cues:'soft clean light, elegant premium materials, reassuring and luxurious, spotless surfaces' },
  { k:/cyber|infosec|\bsecurity\b/i,
    subject:'an elegant security operations command space as the hero, sleek screens with abstract flowing data',
    cues:'refined blue-toned light, serious, advanced and controlled, high-stakes calm, no clutter or hacker cliches' },
  { k:/fitness|\bgym|\btrain|athletic|\bcoach/i,
    subject:'a focused athlete mid-movement, or premium training equipment, as the hero in a high-end studio',
    cues:'strong directional light, discipline and intensity, a sense of transformation, elite and motivating' },
  { k:/handyman|home service|\brepair\b/i,
    subject:'professional tools arranged with precision and a tidy in-progress repair as the hero',
    cues:'a clean residential setting, orderly and ready, reliable, capable and approachable' },
  { k:/podcast/i,
    subject:'a polished podcast studio with an elegant microphone as the hero under warm directional light',
    cues:'rich acoustic textures, layered lighting, authority and energy, modern and influential' },
  { k:/influencer|creator|lifestyle|content/i,
    subject:'a striking, aspirational lifestyle setting as the hero with strong magazine-cover styling and identity',
    cues:'magnetic and expensive, culturally relevant, shareable, polished and impossible to ignore' },
  { k:/consult|advisor|strateg/i,
    subject:'a refined executive strategy setting as the hero — a sleek boardroom or clean modern desk with a skyline beyond',
    cues:'calm authoritative light, clarity and direction, intelligent and confident, uncluttered and premium' },
  { k:/steak|chophouse|grill house|butcher/i,
    subject:'a single, perfectly-plated, freshly-seared premium steak as the hero, glistening and juicy with wisps of steam',
    cues:'dark wood and leather surroundings, subtle firelight and glowing embers, rich warm shadows, intimate upscale mood' },
  { k:/\bdog\b|\bdogs\b|groom|\bpet\b|\bpets\b|puppy|canine|\bcat\b|\bkitten/i,
    subject:'a stunning, freshly-groomed dog as the hero, calm and dignified, looking directly and warmly into the camera',
    cues:'a bright, clean, upscale grooming studio, soft natural window light, immaculate surfaces, warm welcoming tones' },
  { k:/tire|auto|mechanic|\bcar\b/i,
    subject:'a premium performance tire and alloy wheel as the hero object, pristine and powerful',
    cues:'a clean modern service bay, organized tools softly out of focus, strong directional light, polished concrete, depth' },
  { k:/coffee|caf|espresso|roaster/i,
    subject:'a beautifully crafted latte with crisp latte-art and gently rising steam as the hero',
    cues:'warm morning light, artisanal ceramic and wood, shallow depth of field, cozy premium craft atmosphere' },
  { k:/spa|wellness|massage/i,
    subject:'a tranquil, beautifully styled spa detail as the hero',
    cues:'natural stone, soft textiles, warm candle-soft light, serene restorative mood' },
  { k:/bak|pastry|bread/i,
    subject:'beautifully crafted artisan breads and pastries as the hero, golden and textured',
    cues:'early-morning light, natural wood and flour textures, handmade quality, grounded neighborhood warmth' },
  { k:/\blaw\b|attorney|legal|injury|advocate/i,
    subject:'a refined, composed corner of an elite office as the hero',
    cues:'polished dark wood, glass, a skyline influence, calm authoritative light, discretion and intelligence' }
];
function recipeFor(industry){
  industry = String(industry||'');
  for (var i=0;i<RECIPES.length;i++){ if (RECIPES[i].k.test(industry)) return RECIPES[i]; }
  return { subject:'the single most iconic, emotionally compelling subject for this business as the hero',
           cues:'an authentic, premium setting full of believable detail that signals quality, care, and trust' };
}

// ---- Cinematic, textless prompt (SOP master template) -----------------------
function heroPrompt(brand){
  brand = brand || {};
  var industry = brand.industry || 'a modern premium business';
  var audience = brand.audience || 'its ideal customers';
  var tone = brand.tone || 'confident, premium, magnetic';
  var feel = brand.feel || 'a premium, trustworthy, aspirational brand';
  var r = recipeFor(industry);
  var subject = brand.subject || r.subject;
  var cues = brand.cues || r.cues;
  // CINEMATIC STANDARD RESTORED (2026-07-23, Founder order): the July-17 "Agency Pivot"
  // editorial/film-grain/desaturated language produced old, vintage-looking photos and is
  // retired. This is the July-4 vault cinematic prompt, verbatim, plus the photoreal guard.
  return [
    'A cinematic, award-winning commercial brand HERO photograph for a ' + industry + ' brand.',
    'The hero of the frame is ' + subject + '.',
    'Setting and atmosphere: ' + cues + '.',
    'It must instantly communicate the category and make ' + audience + ' feel ' + tone + ' — it should feel like ' + feel + '.',
    /* CAMERA LANGUAGE ADDED 2026-07-30. The site has TWO cinematic prompts. The asset call in
       generate-asset.js already carried real photographic direction — a named camera and lens,
       volumetric light, honest reflections, micro-texture — and its pictures came out visibly
       better. This header prompt had the mood words but none of the optics, which is why the
       photo crowning every workspace looked flatter than the assets beneath it. Same direction,
       now on both. */
    'Shot on a full-frame camera with a fast prime lens.',
    'Dramatic cinematic lighting, volumetric light through real atmosphere, true-to-life materials',
    'with honest reflections and micro-texture, ultra-detailed, photoreal, shallow depth of field',
    'with a sharp focal point, rich atmosphere and depth,',
    'flagship advertising-campaign quality, a single strong focal point, clear visual hierarchy, balanced negative space, expensive-looking.',
    'Modern and current — photographed today, not a period or archival image.',
    'It must feel like a real photograph, never a digital illustration, render, 3D graphic, or flat vector art.',
    'CRITICAL: absolutely NO text, NO words, NO letters, NO numbers, NO signage, NO logos, NO labels,',
    'and NO typography of any kind anywhere in the image — a purely visual, text-free scene.'
  ].join(' ');
}

// ART CALL BUDGET (CORRECTED, 2026-07-05 evening): the 24s wall belongs to SYNCHRONOUS
// functions, which die at 26s. Every caller of this engine is a BACKGROUND worker with a
// 15-minute allowance — and real image models routinely need 20-60s (gpt-image-1) or
// 15-40s (Gemini 3 Pro at 2K). The old 24s guard was silently strangling every
// generation this system ever attempted. The guard now matches the room it runs in:
// 110s per attempt (env ART_CALL_MS to tune) — generous for the model, tiny vs. 15min.
var ART_CALL_MS = parseInt(process.env.ART_CALL_MS || '110000', 10);
function guardedFetch(url, opts){
  var ctl = new AbortController();
  var t = setTimeout(function(){ ctl.abort(); }, ART_CALL_MS);
  opts = opts || {}; opts.signal = ctl.signal;
  return fetch(url, opts).finally(function(){ clearTimeout(t); });
}
// ---- Gemini (quality-aware) -------------------------------------------------
async function genGemini(prompt, opts){
  opts = opts || {};
  var key = process.env.GEMINI_API_KEY;
  var model = opts.model || 'gemini-2.5-flash-image';
  if (!key) return { ok:false, engine:model, error:'GEMINI_API_KEY not set' };
  var isHi = /3-pro|3\.1/.test(model);
  var body = { contents:[{ parts:[{ text: prompt }] }] };
  if (isHi) {
    body.generationConfig = { responseModalities:['TEXT','IMAGE'],
      imageConfig:{ aspectRatio: opts.aspectRatio || '16:9', imageSize: opts.imageSize || '2K' } };
  }
  var t = Date.now();
  try{
    var r = await guardedFetch(gUrl(model), { method:'POST',
      headers:{ 'x-goog-api-key':key, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    var ms = Date.now()-t;
    if(!r.ok){ var e=await r.text(); return { ok:false, engine:model, status:r.status, ms, error:e.slice(0,500) }; }
    var j = await r.json();
    var parts = ((((j.candidates||[])[0]||{}).content)||{}).parts||[];
    var img=null;
    for(var i=0;i<parts.length;i++){
      if(parts[i].inlineData && parts[i].inlineData.data){ img=parts[i].inlineData; break; }
      if(parts[i].inline_data && parts[i].inline_data.data){ img=parts[i].inline_data; break; }
    }
    if(!img) return { ok:false, engine:model, ms, error:'No image in response', raw:JSON.stringify(j).slice(0,300) };
    var cost = isHi ? (opts.imageSize==='4K'?0.24:0.134) : 0.039;
    return { ok:true, engine:model, model:model, ms,
             mime: img.mimeType||img.mime_type||'image/png', b64: img.data, costEst: cost,
             res: isHi ? (opts.imageSize||'2K') : '1K', aspect: isHi ? (opts.aspectRatio||'16:9') : '1:1' };
  }catch(e){ var _ab=/abort/i.test(String(e&&e.message||e)); return { ok:false, engine:model, ms:Date.now()-t, error:_ab?('aborted at the '+ART_CALL_MS+'ms guard — model slower than the wall'):String(e&&e.message||e) }; }
}

// ---- OpenAI (final fallback) ------------------------------------------------
async function genOpenAI(prompt){
  // OPENAI_IMAGE_MODEL override (2026-07-27): gpt-image-1 shuts down 2026-10-23. This is the
  // last-resort tier behind Gemini, and the request shape (size 1536x1024) is unchanged for
  // gpt-image-2, so when the day comes the migration is a one-word env flip, no code change.
  var IMG_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  var key = process.env.OPENAI_IMAGE_KEY || process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if(!key) return { ok:false, engine:'openai', error:'No OpenAI key available' };
  var t=Date.now();
  try{
    var r = await guardedFetch(OPENAI_URL, { method:'POST',
      headers:{ 'Authorization':'Bearer '+key, 'Content-Type':'application/json' },
      body: JSON.stringify({ model:IMG_MODEL, prompt:prompt, size:'1536x1024', n:1 }) });
    var ms=Date.now()-t;
    if(!r.ok){ var e=await r.text(); return { ok:false, engine:'openai', status:r.status, ms, error:e.slice(0,500) }; }
    var j=await r.json(); var d=(j.data||[])[0]||{};
    if(d.b64_json) return { ok:true, engine:'openai', model:IMG_MODEL, ms, mime:'image/png', b64:d.b64_json, costEst:0.07, res:'1536x1024', aspect:'3:2' };
    if(d.url) return { ok:true, engine:'openai', model:IMG_MODEL, ms, url:d.url, costEst:0.07, res:'1536x1024', aspect:'3:2' };
    return { ok:false, engine:'openai', ms, error:'No image in response' };
  }catch(e){ var _ab=/abort/i.test(String(e&&e.message||e)); return { ok:false, engine:'openai', ms:Date.now()-t, error:_ab?('aborted at the '+ART_CALL_MS+'ms guard — model slower than the wall'):String(e&&e.message||e) }; }
}

// ---- Orchestrator: best quality first, step down, never crash ---------------
/* ONE CANONICAL PHOTO LADDER (2026-07-27, Founder-reported: "it's making the old photos...
   one gives a bright premium look, and one gives its age").
   THE FAULT: callers each passed their own tier list, and the photo path led with
   'gemini-3-pro-image-preview'. A PREVIEW model rate-limits and retires without notice, so
   when it failed each photograph silently dropped to a different engine — which is why one
   order could contain both premium frames and dull, aged-looking ones. The prompt was never
   the problem; the ENGINE was changing underneath it.
   THE FIX: one ladder, defined here, used by everything. Preview models are barred from the
   lead position. A caller may still override for an experiment, but the house standard is
   this and nothing has to remember it. */
var PHOTO_LADDER = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
async function generateImage(prompt, opts){
  opts = opts || {};
  var tiers = (opts.geminiModels || PHOTO_LADDER).slice();
  /* PREMIUM PHOTO TIER (2026-07-30, Founder order: "wire the premium call, I'll pay for the
     best, every order from now on"). SMN_PHOTO_PRO puts Gemini 3 Pro (Nano Banana Pro) at the
     LEAD for photographs. It DEFAULTS ON. The current premium tier (gemini-3.1-flash-image, 2K,
     ~13.4c) sits immediately behind it, so if Pro rate-limits or is unavailable the photo steps
     straight down to today's tier — it can NEVER come out worse than before. Set env
     SMN_PHOTO_PRO=off to return to the 3.1 lead. Pro is a preview model; the July-27
     inconsistency is mitigated because the immediate fallback is premium 3.1, not aged flash. */
  var _pp = String(process.env.SMN_PHOTO_PRO || 'on').toLowerCase();
  var proOn = (_pp==='on' || _pp==='1' || _pp==='true' || _pp==='yes');
  if (proOn && !opts.geminiModels && tiers.indexOf('gemini-3-pro-image-preview') < 0) tiers.unshift('gemini-3-pro-image-preview');
  /* PREVIEW MODELS: BARRED ON PHOTOGRAPHS, ALLOWED ON IDENTITY (2026-07-27, corrected).
     The Founder's order — "I never wanna see it again" — was about the VINTAGE PHOTOGRAPH, and
     the true cause of that was a library that reused one stored image per industry forever.
     A first pass over-applied the ban to every image type, which quietly dropped LOGO work from
     the Pro preview model down to Flash and cost real quality. Photographs still refuse preview
     tiers, because a set of photos drawn by different models is what made them disagree. Logo
     work opts in explicitly with allowPreview, because Pro is the better draughtsman there and
     a logo set is generated as one batch. */
  if (!opts.allowPreview && !proOn) {
    tiers = tiers.filter(function(m){ return !/preview/i.test(m); });
    if (!tiers.length) tiers = PHOTO_LADDER.slice();
  }
  var attempts=[];
  for(var i=0;i<tiers.length;i++){
    var g = await genGemini(prompt, Object.assign({}, opts, { model: tiers[i] }));
    // CO-21: 429 = slow down, not give up — same quota bucket feeds every tier.
    for(var rt=0; rt<2 && !g.ok && g.status===429; rt++){
      await new Promise(function(rs){ setTimeout(rs, 22000 + rt*15000); });
      g = await genGemini(prompt, Object.assign({}, opts, { model: tiers[i] }));
    }
    if(g.ok){
      if(i>0) g.steppedDownFrom = attempts.slice();
      /* say WHICH engine drew it — a silent step-down is what hid this bug */
      if(i>0) console.error('PHOTO STEPPED DOWN to ' + tiers[i] + ' after: ' + JSON.stringify(attempts).slice(0,300));
      return g;
    }
    attempts.push({ model: tiers[i], status: g.status, error: g.error });
  }
  var o = await genOpenAI(prompt);
  if(o.ok){
    o.fellBackFrom = { gemini: attempts };
    console.error('PHOTO FELL BACK TO OPENAI — every Gemini tier failed: ' + JSON.stringify(attempts).slice(0,400));
    return o;
  }
  return { ok:false, engine:'none', gemini: attempts, openai: o };
}

module.exports = { PHOTO_LADDER:PHOTO_LADDER, heroPrompt:heroPrompt, generateImage:generateImage, genGemini:genGemini, genOpenAI:genOpenAI, recipeFor:recipeFor };
