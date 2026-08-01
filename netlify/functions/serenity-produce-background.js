// SERENITY — cinematic marquee producer (reel serenity1). Direct Founder commission, 2026-07-14.
// ===== THE REEL LAW (Founder — PERMANENT) =====
// serenity1 is a VIRGIN reel (verified 0 hits across the disc before this file was written).
// Once cut it is NEVER overwritten; every future cut of any film gets a brand-new name.
// All retired reels (homemarquee1/, blessed75/, signhome1/, sayborn1/, sparkfilm*, goldreel/,
// mastergold/, truehome1/, brilliant90/) are frozen history — never read, never written.
// ==============================================
// SERENITY — the $29 Value Spectrum. 8 continuous cinematic scenes, one consistent protagonist,
// a two-part parade of the Founder's REAL owned brands rendered IN-WORLD (Founder's Branding Law:
// the text ban is LIFTED for this film — names, text, and logos are physically part of the scenes:
// painted on vans, printed on cards, pressed into lawns as signs). Slogan integrated:
// "Spark Brings Great Ideas To Life."
// ANTI-FREE LAW: the word "free" never appears in the film, voiceover, captions, or end card.
// QUOTA: 8 Veo renders + 1 Lyria + TTS (negligible). NOTE: if today's Veo quota is already spent,
// the run stops cleanly at the first 429 and RESUMES on a later fire of the same URL — finished
// media is checkpointed, reused, never re-billed. Selective retake: &only=4 · voice: &voice=1 · all: &redo=1.
// SECURITY LAW: the Founder inserts all keys personally in Netlify env; none live in this file.
// Fire URL: https://sparkmyname.netlify.app/.netlify/functions/serenity-produce-background?key=YOUR_ORDER_START_KEY
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now();

const FILM = {
  slug: 'serenity1',   // virgin, permanent, never reused
  nm: 'SERENITY',
  voice: 'ash',
  vibe: "Warm, grounded mentor. Open at a near-whisper. Keep a steady inner pulse, no pity, energy " +
        "coiled. Brighten through the parade with short, rhythmic phrases. The guarantee is slow, low, " +
        "and certain — ending pitch down. Quietest moment at the end. Honor every ellipsis and dash as " +
        "a true pause. Clear studio level, always above the music.",
  // The Founder's verbatim SERENITY voiceover.
  script: "You've watched others begin. You've always had the idea — nobody ever showed you how. " +
    "So say it out loud in your own words. Tap the gold microphone on your screen, say your idea, " +
    "and let Spark bring your brand to life. Spark brings great ideas to life. " +
    "Watch. Names made just for your idea. Every single one checked, with the web address ready to claim. " +
    "Pick your favorite, and your whole brand is born around it. Your logos, your colors, and your words " +
    "that sound just like you. " +
    "A lawn. A rescue. A consultant. A clean. The cards, the signs, the covers, the flyers — all of it " +
    "done, and ready. " +
    "A firm. A table. A show. A recovery. Everything saved in your workspace — yours, to use anywhere. " +
    "Your guide walks you through every step: your web address, protecting your name, making it official. " +
    "Our guarantee: love it, or it costs you nothing. " +
    "Your idea finally real. Your journey begun. Spark your name... and watch it be born."
};

// MUSIC — Founder's music law: moves with the film, never over the voice.
const MUSIC = "Warm hopeful brand-film underscore, instrumental only, absolutely no vocals, about " +
  "ninety-five seconds: a gentle intimate open (soft piano, warm pads, a quiet heartbeat); a tender lift " +
  "as one idea comes to light; a confident, gently driving warmth through a long parade of new businesses, " +
  "soft rhythmic lifts landing every few seconds; ease back low and certain under the guarantee; and the " +
  "quietest, warmest resolve at the very end under a held final frame. Human-scale and kind — never epic, " +
  "never corporate-stock, never trailer hype. Generous voice-friendly headroom throughout; loop-friendly ending.";

// THE CONTINUITY LOCKS — byte-identical on every prompt (Founder's spec).
const LOCKS =
 " CAST LOCK: Featuring one consistent protagonist: a warm, passionate male entrepreneur in his late 30s, " +
 "wearing a clean charcoal gray kitchen apron over a white linen shirt. His physical features, hair, and " +
 "wardrobe must remain identical, never replaced, substituted, or joined by anyone else across scenes." +
 " CREW LOCK: Any support staff wear matching charcoal gray brand shirts. All branding, text, and logos are " +
 "spelled exactly as 'VINELLO PIZZERIA' in a clean, professional, modern sans-serif font." +
 " HERO ASSET LOCK: The primary business assets — the wood-fired oven pizzeria, the fanned business cards, " +
 "and the mobile delivery van — maintain consistent branding. The delivery van is a clean, modern matte-black " +
 "cargo van featuring the clean white logo 'VINELLO PIZZERIA' and 'vinellopizzeria.com' cleanly painted on " +
 "its side panels." +
 " PACING & QUALITY LAW: Continuous elegant motion first frame to last: no stalls, no dead moments, no black " +
 "frames; unhurried luxury commercial pace, never rushed, never stopped. Photorealistic, matte cinematic " +
 "textures, warm light.";

// THE 8 SCENES — the $29 Value Spectrum (timeline: player schedule; clips render ~8s each and the
// player's Living Frame push-in carries each scene to its scheduled mark).
const STORY = [
 // S1 (0:00–10.5) Dreamers
 "Dreamers at dawn. Continuous dawn glide over three dreamers beginning their day: a woman unlocking her " +
 "small empty shop; a young man settling in at a studio microphone; a volunteer kneeling with a rescue dog. " +
 "Golden-hour light, real faces, shallow focus, film grain." + LOCKS,
 // S2 (10.5–20) The Sentence
 "The sentence. Close-up of the protagonist at his kitchen table at night lifting his phone; its screen is " +
 "a soft glowing blank (the site player composites the Spark interface). He speaks a few quiet words — a " +
 "small brave breath first, hope in his eyes. Warm home light, tender, real." + LOCKS,
 // S3 (20–30) The Birth
 "The birth. The protagonist's face blooms into wonder as warm golden light rises from the phone; the screen " +
 "reveals beautiful custom business names, checked and ready — clean, crisp, professional type on a warm " +
 "interface. A hand to his mouth; a disbelieving smile; eyes glistening." + LOCKS,
 // S4 (30–41.5) The Assets
 "The assets, real. The protagonist admires real physical brand pieces at his table: beautifully textured " +
 "business cards fanned in his hand showing a crisp, ungarbled, modern 'VINELLO PIZZERIA' logo; a folded " +
 "menu; warm lamplight catching the matte card stock. His pride is the subject." + LOCKS,
 // S5 (41.5–54) Parade Part 1
 "The parade, part one. Continuous cinematic glide through active businesses: a 'LawnEssence' " +
 "(lawnessence.com) yard sign pressed into fresh green grass; a volunteer holding a 'PawHaven Rescue' " +
 "(pawhavenrescue.org) flyer with a happy scruffy dog; a crisp business card handed over for 'ChartEdge " +
 "Consulting' (charteredgeconsulting.com); and a matte-black 'JetForce Clean' (jetforceclean.com) pressure " +
 "washing van rolling past in morning light. Every sign and logo crisp, clean, professionally printed." + LOCKS,
 // S6 (54–66) Parade Part 2
 "The parade, part two. The flow continues: a warm modern office lobby for 'Accident Allies' " +
 "(accidentallies.net); a steaming plate of fresh pasta on a linen table at 'Romanesco Delight' " +
 "(romanescodelight.com); a glowing studio microphone for 'Wave Narratives' (wavenarratives.com); and steam " +
 "rising off a cold-plunge wellness setup at 'Radiant Revival' (radiantrevival.net). Each brand name crisp " +
 "and cleanly printed in-world." + LOCKS,
 // S7 (66–78) The Workspace
 "The workspace. A laptop in warm evening light showing a clean brand workspace dashboard; the protagonist " +
 "follows along as a friendly guide walks him through the final setup steps — a pointing finger, a nod, a " +
 "quiet satisfied yes, a soft fist on the table. Lamplight, calm certainty." + LOCKS,
 // S8 (78–90 + hold) The Invitation
 "The invitation. A young woman by a window at dusk lifts her phone close, lips parting to speak with a " +
 "smile beginning; the camera pushes in slowly as warm golden light rises around her — an open door, a new " +
 "beginning. The final frame holds with a slow cinematic zoom." + LOCKS
];

// ---- RATE-LIMIT SHIELD (standing) ----
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const STAGGER_MS = 4000;
const BACKOFFS   = [15000, 30000, 60000];

async function tts(){
  let r;
  for(let a=1;a<=3;a++){
    r = await fetch('https://api.openai.com/v1/audio/speech',{
      method:'POST',
      headers:{'Authorization':'Bearer '+OA,'Content-Type':'application/json'},
      body: JSON.stringify({ model:'gpt-4o-mini-tts', voice:FILM.voice, input:FILM.script,
        instructions:FILM.vibe, response_format:'mp3' })
    });
    if(r.ok || (r.status!==429 && r.status<500) || a===3) break;
    console.log('SERENITY tts retry',a,r.status); await delay(10000*a);
  }
  if(!r.ok) throw new Error('tts http '+r.status+' '+(await r.text()).slice(0,180));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('serenity1/serenity1-voice.mp3', b64, 'audio/mpeg');
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
    await delay(6000);
    r = await fetch(base+'/interactions/'+(j.id||j.name),{headers:{'x-goog-api-key':GK,'Api-Revision':'2026-05-20'}});
    if(r.ok) j = await r.json(); aud = findAudio(j);
  }
  if(j.status==='failed') throw new Error('lyria failed '+JSON.stringify(j).slice(0,200));
  if(!aud) throw new Error('lyria: no audio block '+JSON.stringify(j).slice(0,200));
  const mime=(aud.mime_type||aud.mimeType||'audio/mpeg');
  const up = await storage.uploadPng('serenity1/serenity1-music.mp3', aud.data, mime);
  if(!up.ok) throw new Error('music upload failed');
  return up.url+'?v='+V;
}
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
    for(let a=1;a<=3;a++){
      let r=await start(model,true);
      if(!r.ok){
        const t=(await r.text()).slice(0,400);
        console.error('SERENITY veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429 || r.status>=500){
          lastErr=(r.status===429?'VEO QUOTA/RATE 429: ':'VEO server '+r.status+': ')+t;
          if(a<3){ const w=BACKOFFS[a-1]; console.log('SERENITY backoff',ix,model,w+'ms'); await delay(w); continue; }
          if(r.status===429) throw new Error(lastErr);
          break;
        }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('SERENITY veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('SERENITY veo OK',model,ix); break outer; }
    }
  }
  if(!op) throw new Error(lastErr||'veo: all models failed');
  for(let i=0;i<60 && !op.done;i++){ await delay(6000);
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
  const up = await storage.uploadPng('serenity1/serenity1-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('serenity1/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('SERENITY MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('SERENITY BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('SERENITY KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ serenity1:{ nm:FILM.nm } } };
  const g = man.brands.serenity1;
  try{ const prev=await fetch(SBP+'/serenity1/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.serenity1) Object.assign(g, pj.brands.serenity1); } }catch(e){}
  g.nm = FILM.nm;
  g.shots = Array.isArray(g.shots) ? g.shots.slice(0, STORY.length) : [];
  if (redo) g.shots = [];
  delete g.shot_errors; delete g.voice_error; delete g.music_error;
  const wantVoice = (q.voice==='1') || redo || !g.voice;
  if(wantVoice){
    try{ g.voice = await tts(); console.log('SERENITY voice OK (new take — retime captions)'); }
    catch(e){ console.error('SERENITY VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('SERENITY voice REUSED'); }
  try{
    const mu = SBP+'/serenity1/serenity1-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('SERENITY music REUSED'); }
    else { g.music = await lyria(); console.log('SERENITY music OK'); }
  }catch(e){ console.error('SERENITY MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/serenity1/serenity1-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('SERENITY scene REUSED',ix); }
      else {
        await delay(STAGGER_MS);
        g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('SERENITY scene OK',ix);
      }
    }catch(e){ console.error('SERENITY SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('SERENITY checkpoint',ix);
  }
  await saveManifest(man);
  console.log('SERENITY COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
