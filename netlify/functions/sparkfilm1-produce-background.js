// SPARKFILM1 — standalone cinematic producer for the SparkMyName homepage film.
// ===== THE REEL LAW (Founder, 2026-07-11 — PERMANENT) =====
// A video name is a film reel. Once a reel is cut it is NEVER overwritten. Every new cut of any film
// gets a BRAND-NEW name (producer + storage folder + manifest): sparkfilm2, sparkfilm3, ...
// Old reels (goldreel/, mastergold/, premiere films) are frozen history — never read, never written.
// ============================================================
// MASTER GOLD v4 (Vinello Edition) — combined master: Premiere story spine + Gold Reel craft.
// 100% isolated: its OWN file, its OWN storage folder (sparkfilm1/), its OWN manifest, its OWN single film.
// Shares NOTHING with goldreel/ or premiere films — those folders are never read or written.
// Imports no other film, references no other producer. Guarded by ORDER_START_KEY.
// Renders: narration + Lyria music + 5 Veo scenes \u2014 v8.1 'THE REAL THING', 40-second honest-demo cut,
// validated by an outside AI panel (psychology + CRO + trust red-team) and revised to their must-fixes:
// 'still available' not 'free to claim'; 'ready to print'; 'telling us costs nothing'; woman starts pre-business; letterhead beat.
// No dreamers-everywhere detour; kitchen appears once (scenes 1-2); the lead leases the room himself; deliverables get two full scenes.
// Selective re-render: &only=1,2,6 re-renders just those scenes (others reused). &redo=1 = everything.
// v4 law: price NEVER in the film. Narrator never speaks the venue name.
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now(); // cache-buster stamped on every manifest URL

const FILM = {
  slug: 'sparkfilm1',
  nm: 'The Real Thing \u2014 BrightNest and friends',
  voice: 'onyx',
  vibe: "Mid-age American voice, warm and grounded \u2014 a kind friend who finally shows you how, never a announcer. Gentle and sincere on 'Nobody ever showed you.' Encouraging and plain through the demo lines. Honest, unhurried clarity on 'still available' and 'ready to print.' The guarantee line is calm, plain reassurance \u2014 never a pitch. Keep the whole read patient and unhurried; let every period breathe. Lands 'Say it... and see' soft, warm, and inviting \u2014 a door held open. Honor every ellipsis as a real pause. Clear, well-projected studio level, always above the music.",
  script: "You've always had the idea. You just never knew where to start. Nobody ever showed you. So just say it \u2014 out loud, in your own words. One sentence. Then pick from lots of names. Your favorite comes custom \u2014 logo, colors, never a template \u2014 and we check, right then, that the website name is still available. Your cards, your shirts, your Facebook page \u2014 first posts written. Every design done \u2014 saved in your free online workspace, open anytime on your phone or computer. Ready to print \u2014 yours to keep. And your workspace walks you through every step \u2014 registering your website name, your trademark, your business \u2014 one simple guide. And our money-back guarantee means there's no risk in trying. Your idea. Your name. Say it... and see."
};

const MUSIC = "Warm hopeful brand-film underscore, instrumental only, absolutely no vocals, about forty-five seconds: gentle intimate open (soft piano, warm pads, a quiet heartbeat), a tender lift as ideas come to light, a modest proud warmth \u2014 never epic, never anthemic, human-scale and kind \u2014 settling to a soft hopeful resolve under a held end card; plenty of voice-friendly headroom so narration always sits clearly on top, loop-friendly ending.";

const STORY = [
 // 1 \u2014 The Dreamers (0:00-0:08)
 "Cinematic brand film, ONE continuous smooth lateral glide, no cuts, the camera never stops. Night; three warm vignettes in one move: a woman (the SAME woman in scenes 1, 2 and 5: mid-40s, warm tired eyes, hair in a practical ponytail, plain gray work polo) at her kitchen table with a bucket of cleaning supplies and a handwritten notepad of ideas \u2014 she has NOT started yet, this is only a dream; then a young man (the SAME young man in scenes 1 and 5: early 20s, hoodie, bright focused eyes) sketching a small sneaker-care logo idea on his phone in a lamplit room; then an older woman (the SAME older woman in scenes 1 and 5: mid-60s, silver hair, cardigan, reading glasses) at her kitchen table with seed packets and a hand-drawn 'COMMUNITY GARDEN' paper flyer. Each face carries the same quiet wish. Strictly exclude: any existing business signage or branded vehicles, real logos, garbled text, cuts. Photorealistic, warm pools of domestic light, tender and human.",
 // 2 \u2014 Say It (0:08-0:16)
 "Cinematic brand film, ONE continuous slow push-in, no cuts, the camera never stops. Close on a phone held by the SAME cleaning-dream woman (the SAME woman in scenes 1, 2 and 5: mid-40s, warm tired eyes, hair in a practical ponytail, plain gray work polo): the real SparkMyName page on screen \u2014 dark page, gold SPARKMYNAME wordmark, a 'type your idea' box with a small round gold MICROPHONE button; her thumb taps the microphone; she speaks, a soft gold pulse around the mic, and her own plain words appear in the box as she talks; her face lifts \u2014 relief, a small smile. BRAND LOCK \u2014 the platform mark reads exactly SPARKMYNAME; the spoken sentence appears as short plain English, perfectly legible. Strictly exclude: real logos, garbled text, cuts. Photorealistic, intimate, warm kitchen light on her face, the screen glow gentle.",
 // 3 \u2014 It Comes to Light (0:16-0:24)
 "Cinematic brand film, ONE continuous slow push-in, no cuts, the camera never stops. A phone in warm light showing a beautiful, minimal, TEXT-FREE interface: a soft white canvas; a simple friendly emblem \u2014 a little house with a soft shine mark \u2014 draws itself in deep teal, line by line, confident and warm; then four small solid color chips (deep teal, warm gold, soft gray, white) slide gently into a row beneath it; then a single large green checkmark draws itself with a soft glow, like a quiet victory. ABSOLUTE TEXT BAN \u2014 no letters, no words, no numbers, no labels, no typography, no writing of any kind anywhere in the frame; the interface communicates with shapes and color only. Strictly exclude: all text and lettering, real logos, menus, keyboards, garbled marks, cuts. Photorealistic premium UI motion design, deep teal, white, warm gray, a touch of gold, gentle and human.",
 // 4 \u2014 Everything, Done (0:24-0:32)
 "Cinematic brand film, ONE continuous smooth lateral glide, no cuts, the camera never stops. A clean gallery of finished designs gliding past for THREE different dreams, every item modest and real \u2014 nothing beyond what a small kit delivers: BrightNest Cleaning business cards front and back and a simple van-door decal DESIGN shown as a printable file mockup; a sneaker-care tee design and a small price-list card; the community-garden flyer designed beautifully and a Facebook page mockup with its first post already written; then one crisp professional beat \u2014 elegant letterhead and a simple banner for a consultant \u2014 all arriving into a tidy dashboard labeled as the customer's own account. Strictly exclude: real platform logos, real product labels, buildings, crowds, garbled text, cuts. Photorealistic premium design showcase, warm and clean.",
 // 5 \u2014 Yours to Keep + The Card (0:32-0:40, HOLDS)
 "Cinematic brand film, ONE continuous gentle shot resolving to a held final card, no cuts. Three small TRUE moments in one flowing move: the SAME cleaning-dream woman (the SAME woman in scenes 1, 2 and 5: mid-40s, warm tired eyes, hair in a practical ponytail, plain gray work polo) at a local print-shop counter smiling as she picks up her freshly printed decal and cards, then smoothing the new BrightNest decal onto her plain white van door with quiet pride; the SAME young man (the SAME young man in scenes 1 and 5: early 20s, hoodie, bright focused eyes) handing his new card to a customer; the SAME older woman (the SAME older woman in scenes 1 and 5: mid-60s, silver hair, cardigan, reading glasses) pinning her beautiful new flyer to a community notice board. Ordinary, attainable, honest \u2014 no buildings, no crowds, no spectacle; then the scene resolves to a clean brand card on solid black using only black, gold, and white: the large line 'Your dream \u2014 born today.' with the official SparkMyName wordmark beneath, the line 'Spark your name' inside a refined gold capsule button, and a small quiet credit at the bottom edge. The card HOLDS with the gentlest drift while the narration finishes. BRAND LOCK \u2014 the platform wordmark reads exactly SPARKMYNAME. Strictly exclude: real logos or labels, garbled text, cuts."
];

async function tts(){
  const r = await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',
    headers:{'Authorization':'Bearer '+OA,'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-4o-mini-tts',voice:FILM.voice,input:FILM.script,instructions:FILM.vibe,response_format:'mp3'})});
  if(!r.ok) throw new Error('tts '+r.status+' '+(await r.text()).slice(0,200));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('sparkfilm1/sparkfilm1-voice.mp3', b64, 'audio/mpeg');
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
  const up = await storage.uploadPng('sparkfilm1/sparkfilm1-music.mp3', aud.data, mime);
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
    for(let a=1;a<=2;a++){
      let r=await start(model,true);
      if(!r.ok){
        const t=(await r.text()).slice(0,400);
        console.error('SPARKFILM1 veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429){ lastErr='VEO QUOTA 429 (daily render limit reached on this API key): '+t;
          if(a<2){ await new Promise(res=>setTimeout(res,20000)); continue; } throw new Error(lastErr); }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('SPARKFILM1 veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('SPARKFILM1 veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('sparkfilm1/sparkfilm1-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('sparkfilm1/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('SPARKFILM1 MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('SPARKFILM1 BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('SPARKFILM1 KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ sparkfilm1:{ nm:FILM.nm } } };
  const g = man.brands.sparkfilm1;
  // seed from existing manifest so a partial re-run never blanks finished media
  try{ const prev=await fetch(SBP+'/sparkfilm1/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.sparkfilm1) Object.assign(g, pj.brands.sparkfilm1); } }catch(e){}
  // NO-MIXING LAW: the current script always wins. Never carry more scenes than this film has,
  // never carry a stale name, never carry old errors. redo starts with a clean slate.
  g.nm = FILM.nm;
  g.shots = Array.isArray(g.shots) ? g.shots.slice(0, STORY.length) : [];
  if (redo) g.shots = [];
  delete g.shot_errors; delete g.voice_error; delete g.music_error;
  // voice — REUSE unless &voice=1 or &redo (VOICE LOCK 2026-07-12: captions are forensically
  // timed to one recorded take; silently re-recording on every run slid words against pictures)
  const wantVoice = (q.voice==='1') || redo || !g.voice;
  if(wantVoice){
    try{ g.voice = await tts(); console.log('SPARKFILM1 voice OK (new take — retime captions)'); }
    catch(e){ console.error('SPARKFILM1 VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('SPARKFILM1 voice REUSED'); }
  // music — reuse unless redo
  try{
    const mu = SBP+'/sparkfilm1/sparkfilm1-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('SPARKFILM1 music REUSED'); }
    else { g.music = await lyria(); console.log('SPARKFILM1 music OK'); }
  }catch(e){ console.error('SPARKFILM1 MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  // scenes — reuse unless redo; checkpoint after each so a killed run never loses finished media
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/sparkfilm1/sparkfilm1-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('SPARKFILM1 scene REUSED',ix); }
      else { g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('SPARKFILM1 scene OK',ix); }
    }catch(e){ console.error('SPARKFILM1 SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; /* never show old film in a slot we were told to replace */ }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('SPARKFILM1 checkpoint',ix);
  }
  await saveManifest(man);
  console.log('SPARKFILM1 COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
