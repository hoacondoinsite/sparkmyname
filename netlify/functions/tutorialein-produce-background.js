// TUTORIALEIN — standalone tutorial-video producer for the SparkMyName Live Agent guide.
// ===== THE REEL LAW (Founder, 2026-07-11 — PERMANENT) =====
// A video name is a film reel. Once a reel is cut it is NEVER overwritten. Every new cut of any film
// gets a BRAND-NEW name (producer + storage folder + manifest): tutorialein is virgin, permanent, never reused.
// Old reels are frozen history — never read, never written.
// ============================================================
// Get Your Free Tax ID (EIN) — a single warm narrator (no customer cameos) + Lyria music + 4 Veo scenes,
// a calm instructional "watch how" tutorial cut for one Live Agent step.
// 100% isolated: its OWN file, its OWN storage folder (tutorialein/), its OWN manifest, its OWN single film.
// Shares NOTHING with any other reel's folder — those folders are never read or written.
// Imports no other film, references no other producer. Guarded by ORDER_START_KEY.
// Selective re-render: &only=1,2 re-renders just those scenes (others reused). &redo=1 = everything.
// Voice re-audition: &voice=1 re-records the master (then captions must be retimed to the new take).
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now(); // cache-buster stamped on every manifest URL

const FILM = {
  slug: "tutorialein",   // virgin, permanent, never reused
  nm: "Get Your Free Tax ID (EIN)",
  voice: 'ash',       // shared tutorial narrator (patient instructional friend)
  vibe: "Instructional-warm — a patient friend showing you how, never a lecturer. Steady, plain, unhurried. Speak at a calm, even pace with falling, certain sentence endings — downward and reassuring. No hype, no selling. Honor natural pauses. Clear studio level, gently above a soft music bed. End on quiet confidence.",
  script: "Your business needs a Tax ID, called an EIN. Here's the important part — it's free, straight from the IRS. Go to the IRS website and search 'apply for EIN.' Never pay another site for this; it is always free. A few minutes, and you're official. You've got this."
};

const MUSIC = "Calm instructional underscore, instrumental only, no vocals, low and warm and unobtrusive — soft felt piano and a gentle warm pad, a slow steady pulse, at most a very soft brushed kit. Never energetic, never a build, never corporate. Sits well under a speaking voice, ducked 4 to 6 dB. Warm, patient, reassuring. Banned: energetic EDM, corporate ukulele-whistle-claps, epic-trailer braams, anything 'Uplifting Corporate.'";

// STORY — 4 Veo prompts. Each core has the standing ARMOR APPENDED VERBATIM (inlined per take).
const STORY = [
 // T1
 "A person at a tidy desk, phone or laptop in hand, steady and calm. ONE continuous shot, no cuts, the camera never stops. Warm realistic lighting, photorealistic and human. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, readable text, garbled text, cuts.",
 // T2
 "Close on a finger tapping through a plain official-looking form on a screen; no readable text. ONE continuous shot, no cuts, the camera never stops. Warm realistic lighting, photorealistic and human. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, readable text, garbled text, cuts.",
 // T3
 "A green no-cost check draws with a soft glow — the free and done moment, shapes only. ONE continuous shot, no cuts, the camera never stops. Warm realistic lighting, photorealistic and human. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, readable text, garbled text, cuts.",
 // T4
 "The person exhales with a small satisfied smile — that was easier than expected. ONE continuous shot, no cuts, the camera never stops. Warm realistic lighting, photorealistic and human. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, readable text, garbled text, cuts."
];

async function tts(){
  const r = await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',
    headers:{'Authorization':'Bearer '+OA,'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-4o-mini-tts',voice:FILM.voice,input:FILM.script,instructions:FILM.vibe,response_format:'mp3'})});
  if(!r.ok) throw new Error('tts '+r.status+' '+(await r.text()).slice(0,200));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('tutorialein/tutorialein-voice.mp3', b64, 'audio/mpeg');
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
  const up = await storage.uploadPng('tutorialein/tutorialein-music.mp3', aud.data, mime);
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
        console.error('TUTORIALEIN veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429){ lastErr='VEO QUOTA 429 (daily render limit reached on this API key): '+t;
          if(a<2){ await new Promise(res=>setTimeout(res,20000)); continue; } throw new Error(lastErr); }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('TUTORIALEIN veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('TUTORIALEIN veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('tutorialein/tutorialein-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('tutorialein/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('TUTORIALEIN MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('TUTORIALEIN BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('TUTORIALEIN KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ tutorialein:{ nm:FILM.nm } } };
  const g = man.brands.tutorialein;
  // seed from existing manifest so a partial re-run never blanks finished media
  try{ const prev=await fetch(SBP+'/tutorialein/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.tutorialein) Object.assign(g, pj.brands.tutorialein); } }catch(e){}
  // NO-MIXING LAW: the current script always wins. Never carry more scenes than this film has,
  // never carry a stale name, never carry old errors. redo starts with a clean slate.
  g.nm = FILM.nm;
  g.shots = Array.isArray(g.shots) ? g.shots.slice(0, STORY.length) : [];
  if (redo) g.shots = [];
  delete g.shot_errors; delete g.voice_error; delete g.music_error;
  // voice — REUSE unless &voice=1 or &redo (VOICE LOCK: captions are forensically timed to one recorded take;
  // silently re-recording on every run would slide words against pictures. Re-fire with voice=1 + retime captions).
  const wantVoice = (q.voice==='1') || redo || !g.voice;
  if(wantVoice){
    try{ g.voice = await tts(); console.log('TUTORIALEIN voice OK (new take — retime captions)'); }
    catch(e){ console.error('TUTORIALEIN VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('TUTORIALEIN voice REUSED'); }
  // music — reuse unless redo
  try{
    const mu = SBP+'/tutorialein/tutorialein-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('TUTORIALEIN music REUSED'); }
    else { g.music = await lyria(); console.log('TUTORIALEIN music OK'); }
  }catch(e){ console.error('TUTORIALEIN MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  // scenes — reuse unless redo; checkpoint after each so a killed run never loses finished media
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/tutorialein/tutorialein-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('TUTORIALEIN scene REUSED',ix); }
      else { g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('TUTORIALEIN scene OK',ix); }
    }catch(e){ console.error('TUTORIALEIN SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; /* never show old film in a slot we were told to replace */ }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('TUTORIALEIN checkpoint',ix);
  }
  await saveManifest(man);
  console.log('TUTORIALEIN COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
