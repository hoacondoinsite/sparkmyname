// JAZZANDTEDDY — 60-second "Broadway Cut" workspace-UI marquee producer. Founder commission, 2026-07-14.
// ===== THE REEL LAW (Founder — PERMANENT) =====
// jazzandteddy is a VIRGIN reel (verified 0 hits across the disc before this file was written).
// Once cut it is NEVER overwritten; every future cut gets a brand-new name. All prior reels
// (broadway1/, serenity1/, blessed75/, homemarquee1/, and every older run) are frozen history —
// never read, never written.
// ==============================================
// JAZZANDTEDDY — 60 seconds, 7 scenes. NO theater, NO silhouette, NO people: the frame is 100%%
// the high-resolution Spark Brand Workspace UI, full-screen, dark-mode with gold accents. Each scene
// is one owned brand, static-crisp and perfectly legible, kept alive by the player's Living Frame.
// ASSET LOCK (Founder's real brands only): Zest Quest · Vinello Pizzeria · Palacio del Caribe ·
// Glam Caravan · LawnEssence · Paws and Hearts · Aura Revival.
// ANTI-FREE LAW (standing): the word "free" never spoken, never shown, anywhere. Machine-swept.
// QUOTA: 7 Veo renders + 1 Lyria + TTS. Retakes: &only=N · voice: &voice=1 · all: &redo=1.
// SECURITY LAW: the Founder inserts all keys personally; none live in this file. The Founder fires:
//   https://sparkmyname.netlify.app/.netlify/functions/jazzandteddy-produce-background?key=YOUR_ORDER_START_KEY
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now();

const FILM = {
  slug: 'jazzandteddy',   // virgin, permanent, never reused
  nm: 'JAZZANDTEDDY',
  voice: 'shimmer',
  vibe: "Warm, authoritative, positive female voice. High-energy, motivational, conversational — " +
        "and absolutely never hyped, never salesy, never artificial. Bright forward momentum with " +
        "grounded confidence; short punchy phrases land cleanly; a real smile in the voice on " +
        "'Spark brings it to life instantly.' Plain and proud on 'twenty-nine dollars, one time.' " +
        "Honor every dash as a crisp beat. Settled, certain finish on 'watch it be born.' " +
        "Clear studio level, always above the music.",
  // The Founder's verbatim 60-second script.
  script: "You have a dream — a business, a podcast, or a cause. But generic ideas won't drive " +
    "attention. You need a foundation. Speak your idea in one sentence. Spark brings it to life " +
    "instantly. " +
    "You get a name that's available, with a professional logo suite designed for print and screen. " +
    "We build your brand colors and typography — a style that holds together everywhere. " +
    "Everything you need to grow: pre-written social posts, custom flyers, and ad banners. " +
    "You get taglines and bios that sound just like you, designed to attract the people you want " +
    "to serve. " +
    "Your brand has a secure home, ready to view or download on any device. No guesswork. No " +
    "technical hurdles. Just your dream, ready to succeed. " +
    "Get your brand for twenty-nine dollars, one time. No subscriptions. Spark your name — and " +
    "watch it be born."
};

// MUSIC — Founder's brief: modern, upbeat, rhythmic pulse. No slow strings, nothing mournful.
const MUSIC = "Modern, upbeat, minimalist motivational underscore, instrumental only, absolutely no " +
  "vocals, about sixty-five seconds: a clean rhythmic pulse — crisp percussive heartbeat, warm plucked " +
  "synth and piano accents — steady confident tempo around 116 BPM, building energy in gentle steps " +
  "through the middle, a bright proud lift near the close, and a tight, resolved ending with a short " +
  "tail. Absolutely no slow strings, no ballad, no melancholy — forward motion and optimism throughout. " +
  "Generous voice-friendly headroom: the narration always sits clearly on top. Loop-friendly ending.";

// THE UI LOCK — byte-identical on every prompt: one interface language, zero drift, no people, no rooms.
const LOCK =
 " UI LOCK: The entire frame, edge to edge, is a single high-resolution premium software interface — " +
 "the Spark Brand Workspace: deep charcoal dark-mode UI with elegant gold accents, generous spacing, " +
 "modern professional sans-serif type. NO people, NO rooms, NO theater, NO camera environment — the " +
 "interface IS the frame. All names and words are spelled EXACTLY as written, crisp and perfectly " +
 "legible, never misspelled, never distorted, never garbled." +
 " MOTION & QUALITY LAW: calm, smooth, elegant on-screen motion — gentle panel slides, soft fades, " +
 "items assembling cleanly; no camera shake, no stalls, no dead moments, no black frames; unhurried " +
 "premium product-film pace. Photorealistic screen render, matte, flawless.";

// THE 7 SCENES — player schedule [0, 15, 22, 30, 38, 45, 53] on the voice clock (60s film).
const STORY = [
 // S1 (0:00–0:15) Zest Quest — Identity
 "Identity. The workspace hero: a glowing gold microphone icon pulses gently; a typed sentence " +
 "appears live in a clean input line — 'A joyful healthy cooking brand' — then the interface answers: " +
 "the name 'Zest Quest' lands in large elegant type with 'zestquest.net' beneath it and a bold green " +
 "checkmark, panels assembling around it." + LOCK,
 // S2 (0:15–0:22) Vinello Pizzeria — Logos
 "The logo suite. A clean grid of tiles slides in, each showing a different full-color logo variation " +
 "for 'VINELLO PIZZERIA' — primary mark, monogram, horizontal lockup — labeled 'Logo Suite' with " +
 "'vinellopizzeria.com' in the header. Crisp, professional, print-and-screen ready." + LOCK,
 // S3 (0:22–0:30) Palacio del Caribe — Color & Type
 "Color and typography. The workspace shows 'Palacio del Caribe' with 'palaciodelcaribe.com': a row " +
 "of rich color swatch cards sliding into place — deep teal, gold, warm ivory — beside large type " +
 "specimen cards showing elegant headline and body fonts, everything labeled cleanly." + LOCK,
 // S4 (0:30–0:38) Glam Caravan + LawnEssence — Marketing
 "Marketing made ready. A split workspace view: social post cards and a styled flyer for 'Glam " +
 "Caravan' with 'glamcaravan.com' on one side; ad banners and a yard-sign design for 'LawnEssence' " +
 "with 'lawnessence.com' on the other — every piece aligned in a clean grid, ready to use." + LOCK,
 // S5 (0:38–0:45) Paws and Hearts — Brand Voice
 "Brand voice. The workspace displays 'Paws and Hearts' with 'pawsandhearts.net': a large tagline " +
 "card reading 'Where Hearts Heal Paws' and neat bio text cards beneath it — warm, human words in " +
 "clean type, softly highlighted line by line." + LOCK,
 // S6 (0:45–0:53) Aura Revival — The Workspace Home
 "The secure home. A full workspace dashboard for 'Aura Revival' with 'aurarevival.net': the complete " +
 "brand — logo, colors, posts, files — organized in tidy labeled folders, shown simultaneously on a " +
 "desktop frame and a phone frame with a soft download icon pulsing. Everything in its place." + LOCK,
 // S7 (0:53–1:00 + hold) SparkMyName — CTA
 "The invitation. The interface clears to center on the gold microphone input box with a patient " +
 "blinking cursor and the wordmark 'SPARKMYNAME' above it; a gold capsule button reading 'Get my " +
 "brand — $29' glows softly beneath. A gentle golden pulse breathes through the frame. The final " +
 "frame holds with a slow zoom." + LOCK
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
    console.log('JAZZANDTEDDY tts retry',a,r.status); await delay(10000*a);
  }
  if(!r.ok) throw new Error('tts http '+r.status+' '+(await r.text()).slice(0,180));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('jazzandteddy/jazzandteddy-voice.mp3', b64, 'audio/mpeg');
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
  const up = await storage.uploadPng('jazzandteddy/jazzandteddy-music.mp3', aud.data, mime);
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
        console.error('JAZZANDTEDDY veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429 || r.status>=500){
          lastErr=(r.status===429?'VEO QUOTA/RATE 429: ':'VEO server '+r.status+': ')+t;
          if(a<3){ const w=BACKOFFS[a-1]; console.log('JAZZANDTEDDY backoff',ix,model,w+'ms'); await delay(w); continue; }
          if(r.status===429) throw new Error(lastErr);
          break;
        }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('JAZZANDTEDDY veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('JAZZANDTEDDY veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('jazzandteddy/jazzandteddy-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('jazzandteddy/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('JAZZANDTEDDY MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('JAZZANDTEDDY BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('JAZZANDTEDDY KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ jazzandteddy:{ nm:FILM.nm } } };
  const g = man.brands.jazzandteddy;
  try{ const prev=await fetch(SBP+'/jazzandteddy/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.jazzandteddy) Object.assign(g, pj.brands.jazzandteddy); } }catch(e){}
  g.nm = FILM.nm;
  g.shots = Array.isArray(g.shots) ? g.shots.slice(0, STORY.length) : [];
  if (redo) g.shots = [];
  delete g.shot_errors; delete g.voice_error; delete g.music_error;
  const wantVoice = (q.voice==='1') || redo || !g.voice;
  if(wantVoice){
    try{ g.voice = await tts(); console.log('JAZZANDTEDDY voice OK (new take — retime captions)'); }
    catch(e){ console.error('JAZZANDTEDDY VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('JAZZANDTEDDY voice REUSED'); }
  try{
    const mu = SBP+'/jazzandteddy/jazzandteddy-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('JAZZANDTEDDY music REUSED'); }
    else { g.music = await lyria(); console.log('JAZZANDTEDDY music OK'); }
  }catch(e){ console.error('JAZZANDTEDDY MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/jazzandteddy/jazzandteddy-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('JAZZANDTEDDY scene REUSED',ix); }
      else {
        await delay(STAGGER_MS);
        g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('JAZZANDTEDDY scene OK',ix);
      }
    }catch(e){ console.error('JAZZANDTEDDY SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('JAZZANDTEDDY checkpoint',ix);
  }
  await saveManifest(man);
  console.log('JAZZANDTEDDY COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
