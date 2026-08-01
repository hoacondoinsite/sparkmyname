// BLESSED75 — cinematic movie producer for the SparkMyName homepage marquee (BRILLIANT 75 script).
// ===== THE REEL LAW (Founder — PERMANENT) =====
// blessed75 is a VIRGIN reel (verified 0 hits across the disc before this file was written).
// Once cut it is NEVER overwritten; every future cut of any film gets a brand-new name.
// Old reels (homemarquee1/, signhome1/, sayborn1/, sparkfilm*, goldreel/, mastergold/, truehome1/,
// brilliant90/, premiere films) are frozen history — never read, never written.
// ==============================================
// BLESSED 75 — "no pitch decks, no slideshows, no text crawls" (Founder). A continuous, premium,
// full-movie-grade commercial: 8 Veo scenes of real human cinema + one studio voiceover + music.
// Uses the EXACT pipeline that built TRUEHOME/homemarquee1 successfully: same Veo call, same model
// fallback chain, same polling, same storage, same checkpointed manifest, same ABSOLUTE TEXT BAN.
// THE TEXT BAN is the truth armor: Veo never draws a word, letter, or logo — every word the viewer
// reads (VINELLO PIZZERIA, vinellopizzeria.com ✓ AVAILABLE, captions, $29) is drawn by the site
// player as a crisp, TRUE overlay. Cinema from Veo; truth from the player. No fake brand artwork.
// QUOTA: 8 Veo renders (within the 10/day limit, 2 spare for &only retakes) + 1 Lyria + TTS (negligible).
// SECURITY (Founder's law): the Founder inserts all keys personally in Netlify env; none live in this
// file. The Founder fires this URL himself and uploads the sealed disc himself:
//   https://sparkmyname.netlify.app/.netlify/functions/blessed75-produce-background?key=YOUR_ORDER_START_KEY
// Re-fire rules: &only=1,4 re-renders just those scenes · &voice=1 re-records voice (then retime
// captions to the measured take — Caption Sync Law) · &redo=1 = everything fresh (cache wiped).
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now(); // cache-buster stamped on every manifest URL

const FILM = {
  slug: 'blessed75',   // virgin, permanent, never reused
  nm: 'BLESSED 75',
  voice: 'ash', // warm, confident. Founder may re-audition (onyx/echo) with &voice=1 + caption retime.
  vibe: "Warm, confident, positive — a trusted friend, never an announcer. The voice LEADS the film. " +
        "Unhurried, studio-grade, crisp. Open bright: 'Whatever you're thinking' is an arm around the " +
        "shoulder. A real question-lift on 'trusted on sight?'. Bright and rhythmic through the " +
        "'your name — your logos — your words' run, each item landing like a soft beat. Plain and " +
        "proud on 'Twenty-nine dollars' — a strength, never an apology. Honor every dash and ellipsis " +
        "as a true pause. The close is an open door — soft, certain, a smile in the voice. " +
        "Falling, settled line endings. Clear studio level, always above the music.",
  // The locked BRILLIANT 75 narration — the Founder's approved script, verbatim.
  script: "Whatever you're thinking — a shop, a podcast, a cause, a whole new idea… " +
    "Say it, or type it — one sentence — and Spark brings your idea to life. " +
    "Anyone gets a name. One people remember — yours to claim, trusted on sight? That's the hard part. Spark does it… " +
    "Your name — checked, and open for you. Your logo designs, in full color. Your colors, your posts, " +
    "your handles, your cover art. Your cards, your flyers, your signs — print-ready designs. Your ads. " +
    "Your words that sound just like you. Every design, done for you, ready to use — kept in your Spark " +
    "workspace, where you pick the name you love and keep all you need… " +
    "A branding agency, sized for you. Twenty-nine dollars — one time, no subscription, no hidden costs… " +
    "Say it, or type it. Get my brand — and watch your idea come to life."
};

// MUSIC — the Founder's music law: positive energy, moves WITH the film — up as we move, slow as we
// need — and it NEVER overpowers the voice. The voice leads.
const MUSIC = "Warm, uplifting, motivational brand-film underscore, instrumental only, absolutely no vocals, " +
  "about eighty seconds: a bright confident open that states a gentle pulse; a warm building verse as one " +
  "person's dream comes to life; a joyful, gently driving middle with soft rhythmic lifts as new lives bloom; " +
  "ease back one notch — calm, certain — for the proud plain moment; then a warm, fully resolved finish that " +
  "lands its final chord cleanly with a gentle tail. Human and modern — felt piano, warm pads, real-feeling " +
  "soft drums — never corporate-stock, never trailer hype. Generous voice-friendly headroom throughout: the " +
  "narration always sits clearly on top. Loop-friendly ending.";

// STORY — 8 Veo prompts, one continuous cinematic movement each, cut to the BRILLIANT 75 voice blocks.
// The standing armor is APPENDED VERBATIM to every take (the exact armor that shipped TRUEHOME clean).
const ARMOR = " ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. " +
  "ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads " +
  "is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI " +
  "content, blank or empty placeholder objects, garbled marks, cuts.";
const STORY = [
 // S1 (~0:00–0:08) VO: "Whatever you're thinking — a shop, a podcast, a cause, a whole new idea…"
 "Dreamers of every kind. Continuous lateral glide through warm dawn vignettes: a woman pausing at the door " +
 "of her small empty shop, keys in hand, looking up with quiet hope; a young man in a cozy room leaning toward " +
 "a studio microphone, adjusting it with care; a volunteer cradling a small scruffy rescue dog against her " +
 "shoulder in soft window light. Golden-hour warmth, real faces, shallow focus, film grain, deeply human." + ARMOR,
 // S2 (~0:08–0:16) VO: "Say it, or type it — one sentence — and Spark brings your idea to life."
 "The sentence. Close-up of a man in his forties at a warm kitchen table at night, lifting his phone; its soft " +
 "golden glow lights his face from below as he speaks a few quiet words — a small brave breath first, hope in " +
 "his eyes. Stay on HIS FACE, never the screen. Warm home light, shallow depth of field, tender and real." + ARMOR,
 // S3 (~0:16–0:24) VO: "Anyone gets a name… That's the hard part. Spark does it." (player overlays the TRUE name + domain badges here)
 "The birth, felt. The same man's face slowly blooming into wonder — a slow warm pulse of golden light washes " +
 "across him as he watches his phone; a hand rises to his mouth; a small disbelieving smile grows into quiet " +
 "joy; eyes glistening. The phone glow warm on his skin, the kitchen soft behind him. Pure human reaction." + ARMOR,
 // S4 (~0:24–0:32) VO: "Your name — checked, and open for you. Your logo designs, in full color…"
 "The pizzeria alive. Months later: the same man in a warm, busy little pizzeria, sliding a blistered pizza " +
 "from a glowing wood-fired oven, setting it down proudly, wiping his hands on his apron and beaming; guests " +
 "and candlelight in warm bokeh behind him. Steam, fire-glow, joy of a dream made real." + ARMOR,
 // S5 (~0:32–0:40) VO: "…your posts, your handles, your cover art. Your cards, your flyers, your signs…"
 "New lives blooming. Continuous glide across three moments: a lawn-care woman rolling a mower down the ramp " +
 "of a clean dark van in bright morning light; a mobile-salon owner swinging open the gleaming door of her " +
 "boutique trailer at golden hour; hands pinning a colorful flyer to a community board at a natural oblique " +
 "angle, a scruffy dog sniffing happily below. Real places, warm practical light, genuine pride." + ARMOR,
 // S6 (~0:40–0:48) VO: "Your words that sound just like you. Every design, done for you, ready to use…"
 "The words made real. Over-the-shoulder cinematic: a woman at a sunlit kitchen table admiring warm printed " +
 "materials held at natural angles — cards fanned softly in her hands, a folded menu she lifts and turns with " +
 "delight — everything at shallow, dreamy focus; HER glowing face is the subject, never the print. She laughs " +
 "quietly, amazed. Golden light, dust motes, real hands, real joy." + ARMOR,
 // S7 (~0:48–0:56) VO: "A branding agency, sized for you. Twenty-nine dollars — one time…" (player overlays the TRUE price line)
 "The workspace, lived. A man at his laptop in warm evening light taps once and sits back with a quiet " +
 "satisfied yes — a soft fist landing on the table, a slow proud nod, deeply content; his phone glowing " +
 "beside a cooling cup of coffee. Lamplight, real hands and face, calm certainty." + ARMOR,
 // S8 (~0:56–0:64 + hold) VO: "Say it, or type it. Get my brand — and watch your idea come to life."
 "The invitation. Bookend: a young woman by a window at dusk lifts her phone close, lips parting to speak, " +
 "a small smile beginning; the camera pushes in slowly toward her hopeful face as warm golden light rises " +
 "around her — an open door, a new beginning. Cinematic, tender, full of possibility." + ARMOR
];

// ---- voice: single studio take (no cameos in this film), direct MP3 upload ----
async function tts(){
  let r;
  for(let a=1;a<=3;a++){ // gentle retry shield for 429/5xx (waits 10s, 20s)
    r = await fetch('https://api.openai.com/v1/audio/speech',{
      method:'POST',
      headers:{'Authorization':'Bearer '+OA,'Content-Type':'application/json'},
      body: JSON.stringify({ model:'gpt-4o-mini-tts', voice:FILM.voice, input:FILM.script,
        instructions:FILM.vibe, response_format:'mp3' })
    });
    if(r.ok || (r.status!==429 && r.status<500) || a===3) break;
    console.log('BLESSED75 tts retry',a,r.status); await new Promise(res=>setTimeout(res,10000*a));
  }
  if(!r.ok) throw new Error('tts http '+r.status+' '+(await r.text()).slice(0,180));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('blessed75/blessed75-voice.mp3', b64, 'audio/mpeg');
  if(!up.ok) throw new Error('voice upload failed');
  return up.url+'?v='+V;
}
function findAudio(node){
  if(!node || typeof node!=='object') return null;
  if(node.type==='audio' && node.data) return node;
  if(Array.isArray(node)){ for(const n of node){ const f=findAudio(n); if(f) return f; } return null; }
  for(const k in node){ const f=findAudio(node[k]); if(f) return f; }
  return null;
}
async function lyria(){
  const base='https://generativelanguage.googleapis.com/v1beta';
  let r = await fetch(base+'/interactions',{method:'POST',
    headers:{'Content-Type':'application/json','x-goog-api-key':GK,'Api-Revision':'2026-05-20'},
    body:JSON.stringify({model:'lyria-3-clip-preview',input:MUSIC})});
  if(!r.ok) throw new Error('lyria start '+r.status+' '+(await r.text()).slice(0,300));
  let j = await r.json(); let aud = findAudio(j);
  for(let i=0;i<20 && !aud && (j.id||j.name) && j.status && j.status!=='completed' && j.status!=='failed'; i++){
    await new Promise(res=>setTimeout(res,6000));
    r = await fetch(base+'/interactions/'+(j.id||j.name),{headers:{'x-goog-api-key':GK,'Api-Revision':'2026-05-20'}});
    if(r.ok) j = await r.json(); aud = findAudio(j);
  }
  if(j.status==='failed') throw new Error('lyria failed '+JSON.stringify(j).slice(0,200));
  if(!aud) throw new Error('lyria: no audio block '+JSON.stringify(j).slice(0,200));
  const mime=(aud.mime_type||aud.mimeType||'audio/mpeg');
  const up = await storage.uploadPng('blessed75/blessed75-music.mp3', aud.data, mime);
  if(!up.ok) throw new Error('music upload failed');
  return up.url+'?v='+V;
}
// ---- RATE-LIMIT SHIELD (Founder-requested) ----
// 1) NO PARALLEL BLASTING: scenes render strictly ONE AT A TIME (the handler's sequential loop below —
//    there is no Promise.all anywhere in this file). 2) STAGGERED DELAYS: a pause before every Veo start.
// 3) EXPONENTIAL BACKOFF: 429/5xx retries per scene wait 15s → 30s → 60s before giving up that attempt.
// 4) TIMEOUT SAFETY: Netlify background functions allow 15 minutes. If a run ever runs out of clock,
//    the checkpointed manifest + HEAD-reuse mean the Founder simply fires the SAME URL again and the run
//    resumes exactly where it stopped — finished scenes are reused, never re-billed, never re-rendered.
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const STAGGER_MS = 4000;          // pause before each Veo request (only when actually rendering)
const BACKOFFS   = [15000, 30000, 60000]; // exponential backoff for 429/5xx, per attempt

async function veo(prompt, ix){
  const base='https://generativelanguage.googleapis.com/v1beta';
  const MODELS=['veo-3.1-fast-generate-preview','veo-3.1-generate-preview','veo-3.0-fast-generate-001','veo-3.0-generate-001'];
  async function start(model, withPerson){
    const params = withPerson ? {aspectRatio:'16:9',personGeneration:'allow_all'} : {aspectRatio:'16:9'};
    return fetch(base+'/models/'+model+':predictLongRunning?key='+GK,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({instances:[{prompt:prompt}],parameters:params})});
  }
  let op=null,lastErr='';
  outer:
  for(const model of MODELS){
    for(let a=1;a<=3;a++){ // up to 3 attempts per model with exponential backoff
      let r=await start(model,true);
      if(!r.ok){
        const t=(await r.text()).slice(0,400);
        console.error('BLESSED75 veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429 || r.status>=500){
          lastErr=(r.status===429?'VEO QUOTA/RATE 429: ':'VEO server '+r.status+': ')+t;
          if(a<3){ const w=BACKOFFS[a-1]; console.log('BLESSED75 backoff',ix,model,w+'ms'); await delay(w); continue; }
          if(r.status===429) throw new Error(lastErr); // quota exhausted — stop burning attempts on other models
          break; // 5xx after 3 tries — let the next model in the chain try
        }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('BLESSED75 veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('BLESSED75 veo OK',model,ix); break outer; }
    }
  }
  if(!op) throw new Error(lastErr||'veo: all models failed');
  for(let i=0;i<60 && !op.done;i++){ await new Promise(res=>setTimeout(res,6000));
    const r=await fetch(base+'/'+op.name+'?key='+GK); op=await r.json(); }
  if(!op.done) throw new Error('veo timeout');
  if(op.error) throw new Error('veo op '+JSON.stringify(op.error).slice(0,400));
  const resp = op.response||{}; const gv = resp.generateVideoResponse||resp;
  const samp = (gv.generatedSamples&&gv.generatedSamples[0])||(gv.generatedVideos&&gv.generatedVideos[0])||null;
  const uri = samp && ((samp.video&&samp.video.uri)||samp.uri||(samp.video&&samp.video.url));
  if(!uri) throw new Error('veo: no video uri '+JSON.stringify(gv).slice(0,300));
  const dl = await fetch(uri+(uri.indexOf('?')>-1?'&':'?')+'key='+GK);
  if(!dl.ok) throw new Error('veo download '+dl.status);
  const b64 = Buffer.from(await dl.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('blessed75/blessed75-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('blessed75/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('BLESSED75 MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('BLESSED75 BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('BLESSED75 KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ blessed75:{ nm:FILM.nm } } };
  const g = man.brands.blessed75;
  // seed from existing manifest so a partial re-run never blanks finished media
  try{ const prev=await fetch(SBP+'/blessed75/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.blessed75) Object.assign(g, pj.brands.blessed75); } }catch(e){}
  // NO-MIXING LAW: the current script always wins; redo starts with a clean slate.
  g.nm = FILM.nm;
  g.shots = Array.isArray(g.shots) ? g.shots.slice(0, STORY.length) : [];
  if (redo) g.shots = [];
  delete g.shot_errors; delete g.voice_error; delete g.music_error;
  // voice — REUSE unless &voice=1 or &redo (VOICE LOCK: captions are timed to one measured take;
  // re-recording silently would slide words against pictures. Re-fire with voice=1 + retime captions).
  const wantVoice = (q.voice==='1') || redo || !g.voice;
  if(wantVoice){
    try{ g.voice = await tts(); console.log('BLESSED75 voice OK (new take — retime captions)'); }
    catch(e){ console.error('BLESSED75 VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('BLESSED75 voice REUSED'); }
  // music — reuse unless redo
  try{
    const mu = SBP+'/blessed75/blessed75-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('BLESSED75 music REUSED'); }
    else { g.music = await lyria(); console.log('BLESSED75 music OK'); }
  }catch(e){ console.error('BLESSED75 MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  // scenes — reuse unless redo/only; checkpoint after each so a killed run never loses finished media
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/blessed75/blessed75-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('BLESSED75 scene REUSED',ix); }
      else {
        await delay(STAGGER_MS); // staggered throttle — never hit the API back-to-back
        g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('BLESSED75 scene OK',ix);
      }
    }catch(e){ console.error('BLESSED75 SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; /* never show old film in a slot we were told to replace */ }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('BLESSED75 checkpoint',ix);
  }
  await saveManifest(man);
  console.log('BLESSED75 COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
