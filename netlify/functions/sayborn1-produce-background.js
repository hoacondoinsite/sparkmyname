// SAYBORN1 — standalone cinematic producer for the SparkMyName homepage film.
// ===== THE REEL LAW (Founder, 2026-07-11 — PERMANENT) =====
// A video name is a film reel. Once a reel is cut it is NEVER overwritten. Every new cut of any film
// gets a BRAND-NEW name (producer + storage folder + manifest): sayborn1 is virgin, permanent, never reused.
// Old reels (sparkfilm*, goldreel/, mastergold/, premiere films) are frozen history — never read, never written.
// ============================================================
// SAYBORN — "say your sentence and see your name born." Warm-mentor narration + two customer voice cameos +
// Lyria music + 9 Veo scenes, ~66-second honest-demo cut.
// 100% isolated: its OWN file, its OWN storage folder (sayborn1/), its OWN manifest, its OWN single film.
// Shares NOTHING with any other reel's folder — those folders are never read or written.
// Imports no other film, references no other producer. Guarded by ORDER_START_KEY.
// Selective re-render: &only=1,2,6 re-renders just those scenes (others reused). &redo=1 = everything.
// Voice re-audition: &voice=1 re-records the master (then captions must be retimed to the new take).
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now(); // cache-buster stamped on every manifest URL

const FILM = {
  slug: 'sayborn1',   // virgin, permanent, never reused
  nm: 'SAYBORN',
  voice: 'ash',       // starting voice (warm mentor). Comment: founder may re-audition echo/onyx and re-fire with voice=1 + caption retime.
  vibe: "Warm, grounded mentor — a kind friend across a kitchen table, never an announcer. Open at a true near-whisper: slow, close, zero performance. Keep a steady inner pulse — matter-of-fact, no pity, the energy always coiled. Brighten naturally through the birth and the parade: short phrases, conversational-big, landing like drumbeats. The guarantee is low, slow, certain — every sentence ends pitching DOWN. The final line is the quietest moment of the whole read: a full pause at the ellipsis, then an invitation, soft and certain — a door held open, never a command. Honor every ellipsis as a real pause. Clear studio level, always above the music.",
  script: "You've always had the idea. Nobody ever showed you how. Say it out loud — in your own words. Names — made just for your idea. Every one checked. Pick your favorite — and your whole brand is built around it. Your logos. Your colors. Your words. Say a different dream — get a different brand. Only yours. A lawn service. A store. A restaurant. A podcast. A channel. A cause. Whatever you're starting — the cards, the signs, the posts, the covers, the flyers — done, and ready. Everything saved in your free workspace. And your guide walks you through every step: your web address, protecting your name, making it official. Our guarantee: love it, or it costs you nothing. Your idea — finally real. Say your sentence… and see your name born."
};

// CUSTOMER VOICES — two separate small TTS takes in DIFFERENT voices than the narrator ('ash'), mixed into the
// master track at their exact timecodes, then the master uploads as sayborn1-voice.mp3 and is voice-locked.
//   HER  (warm female voice, window 0:09–0:11.5): "I mow lawns in my neighborhood."
//   PODCASTER (young male voice, window 0:24–0:26): "I'm starting a sports podcast."
// ASSEMBLY (documented): sparkfilm1 handles voice as a single OpenAI TTS take uploaded straight to storage.
// SAYBORN mirrors that fetch-based handling but must lay two cameos over the narration, so instead of asking the
// API for one finished mp3 we ask OpenAI TTS for LINEAR PCM (response_format:'wav') for all three takes, decode
// each WAV to 16-bit samples, and additively mix each cameo into the narrator bed at floor(timecode * sampleRate)
// with hard clamping to int16. The mixed bed is re-wrapped in a WAV container and written to the fixed object
// name sayborn1/sayborn1-voice.mp3 (the manifest/player contract requires that exact name; the site player builds
// the element with `new Audio(url)`, which is container-agnostic). No ffmpeg / external audio dependency.
const CUST = [
  { who: 'HER',       voice: 'shimmer', at: 9.0,  line: "I mow lawns in my neighborhood.", instr: "Warm, ordinary woman, plain and true — half-shy, half-proud, like naming her dream out loud for the first time. Conversational, unhurried, no performance." },
  { who: 'PODCASTER', voice: 'echo',    at: 24.0, line: "I'm starting a sports podcast.", instr: "Young man, bright and eager, leaning into the mic — quick, confident, a spark of new-energy excitement. Natural, not announced." }
];

const MUSIC = "Organic-electronic indie-anthemic underscore, instrumental only, no vocals, about 112 to 118 BPM, and the pulse never dies. Felt piano, muted guitar, warm analog pad, a real-feeling kit, hand claps and stomps — human textures, never corporate. Open on a 'spark motif': a short rising figure that lands on a confident downbeat inside the first two seconds, then hangs unresolved under the mic. Half-time drum feel early; straight time from the brand reveal for a perceived doubling of energy with no tempo change. One single biggest lift lands exactly on the brand reveal — one riser, one key lift maximum. Kit-parade hits cut-synced to each reveal. The proof beat breathes: percussion pulled back one notch, human warmth forward. One beat of near-silence immediately before the end. End on an unresolved suspended chord — sit on the IV or V, never the tonic; the viewer's spoken sentence is the resolution. Generous voice-friendly headroom; music sits well under every spoken line. Banned: corporate ukulele-whistle-claps, EDM supersaw drops, epic-trailer braams, gospel swells, anything 'Uplifting Corporate.'";

// STORY — 9 Veo prompts (T1..T9). Each core has the standing armor APPENDED VERBATIM (inlined per take).
const STORY = [
 // T1 (0:00–0:08)
 "Cinematic brand film. Night glide over four dreamers in one move — first a tight face of a man in his late fifties with warm rim light (never a black frame), eyes carrying an idea for decades; then a woman cradling a small scruffy rescue dog with a hand-drawn wordless fundraising sheet behind her; then a young woman at her ring light, phone lowered, leaning forward; settling on a lawn-care woman at her kitchen table, a notepad open to a hand-drawn mower and route map, her hand reaching for her phone. Continuous lateral glide, warm domestic pools of light, cool-to-warm grade, tender and human. Wordless sketches only. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T2 (0:08–0:16)
 "Cinematic brand film. Slow push-in on her phone showing the real idea card: a dark card, a gold microphone glyph over a static wordmark, a white input box, a gold-ringed mic. Her thumb taps; a soft gold pulse rings the mic only; her face lifts with relief. The name cards rise in a cascade as clean card surfaces the player will label — the take shows the card shapes and her reaction, not letters. Intimate, warm kitchen light. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T3 (0:16–0:24)
 "Cinematic brand film. A text-free interface birth: the chosen card unfolds; a friendly emblem draws itself line by line; three logo mark variants appear in sequence and the chosen one settles as the others bow away; four brand color chips slide into a row; abstract type-bars fan beneath suggesting words without letters; a large green check draws itself with a soft glow. Photorealistic premium UI motion design, shapes and color only. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T4 (0:24–0:30)
 "Cinematic brand film. New energy: a young podcaster in warm ring light taps the same gold mic and speaks; the screen blooms a completely different brand — a bold athletic emblem shape, a hot palette, a wave-and-microphone motif; for one beat two distinct brand cards sit side by side, unmistakably not one template wearing two names. Text-free interface; the player draws his words. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T5 (0:30–0:38)
 "Cinematic brand film. Kit parade, continuous glide, one group per musical beat: a yard sign staked in grass with a trailer decal and business cards; a storefront banner with product tags and a branded bag; a beautiful restaurant menu with a table sign and cards. Maximum three items per frame, the hero item first. All printed surfaces are text-free mockup shapes the player will label. Warm, quick, confident rhythm. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T6 (0:38–0:46)
 "Cinematic brand film. Kit parade continues and pulls back: a podcast cover-art square with a channel banner and an episode post; channel profile art with post art and thumbnails; a fundraiser flyer framed around a scruffy rescue dog's photo with a donation card; then the camera lifts and all six finished kits array into one breathtaking wide. Text-free surfaces throughout. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T7 (0:46–0:55)
 "Cinematic brand film. Every design streams like drawn light into one tidy dashboard that lands on a phone held in a hand and a laptop on a kitchen table; three step cards flip up carrying only icons — a globe, a shield, an official seal; the lawn-care woman completes the first step and a green check lands like a quiet victory as we cut to her face. Warm domestic morning light. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T8 (0:55–1:00)
 "Cinematic brand film. Three warm returns in one flowing move: the lawn-care woman leaning on her branded trailer in golden light; the podcaster with headphones round his neck, his screen glowing; the late-fifties man hanging a small elegant sign in a window — decades of carrying, finally over. Signs and decals are shape-only for the player to label. Dignified, golden, human. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts.",
 // T9 (1:00–1:06+)
 "Cinematic brand film. The real idea card fills the frame — a gold-ringed microphone pulsing softly, a thumb hovering just above it; a slow drift in; then a single full-screen warm gold bloom that holds with the gentlest living drift, a patient stillness for the end screen to rise inside. ONE continuous shot, no cuts, the camera never stops. Character locks are repeated word-for-word for every character who appears. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: real logos, garbled text, cuts."
];

// ---- voice: OpenAI TTS as linear PCM (wav) so cameos can be mixed into the narrator bed ----
async function ttsWav(voice, script, instructions){
  const r = await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',
    headers:{'Authorization':'Bearer '+OA,'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-4o-mini-tts',voice:voice,input:script,instructions:instructions,response_format:'wav'})});
  if(!r.ok) throw new Error('tts '+voice+' '+r.status+' '+(await r.text()).slice(0,200));
  return Buffer.from(await r.arrayBuffer());
}
// Minimal WAV (PCM16) reader: returns {sampleRate, channels, samples:Int16Array}.
function decodeWav(buf){
  if(buf.length<44 || buf.toString('ascii',0,4)!=='RIFF') throw new Error('voice: not a RIFF/WAV take');
  let sampleRate=24000, channels=1, bits=16, dataOff=-1, dataLen=0;
  let p=12;
  while(p+8<=buf.length){
    const id=buf.toString('ascii',p,p+4); const sz=buf.readUInt32LE(p+4); const body=p+8;
    if(id==='fmt '){ channels=buf.readUInt16LE(body+2); sampleRate=buf.readUInt32LE(body+4); bits=buf.readUInt16LE(body+14); }
    else if(id==='data'){ dataOff=body; dataLen=sz; break; }
    p=body+sz+(sz&1); // chunks are word-aligned
  }
  if(dataOff<0) throw new Error('voice: no WAV data chunk');
  if(bits!==16) throw new Error('voice: expected 16-bit PCM, got '+bits);
  const n=Math.floor(Math.min(dataLen, buf.length-dataOff)/2);
  const s=new Int16Array(n);
  for(let i=0;i<n;i++) s[i]=buf.readInt16LE(dataOff+i*2);
  return { sampleRate:sampleRate, channels:channels, samples:s };
}
// Encode Int16 mono PCM to a WAV container.
function encodeWav(samples, sampleRate){
  const n=samples.length, dataLen=n*2, head=44;
  const out=Buffer.alloc(head+dataLen);
  out.write('RIFF',0); out.writeUInt32LE(36+dataLen,4); out.write('WAVE',8);
  out.write('fmt ',12); out.writeUInt32LE(16,16); out.writeUInt16LE(1,20); out.writeUInt16LE(1,22);
  out.writeUInt32LE(sampleRate,24); out.writeUInt32LE(sampleRate*2,28); out.writeUInt16LE(2,32); out.writeUInt16LE(16,34);
  out.write('data',36); out.writeUInt32LE(dataLen,40);
  for(let i=0;i<n;i++) out.writeInt16LE(samples[i],head+i*2);
  return out;
}
// Take stereo/mono PCM16 down to a mono Int16Array (average channels).
function toMono(dec){
  if(dec.channels<=1) return dec.samples;
  const c=dec.channels, n=Math.floor(dec.samples.length/c), m=new Int16Array(n);
  for(let i=0;i<n;i++){ let a=0; for(let k=0;k<c;k++) a+=dec.samples[i*c+k]; m[i]=Math.round(a/c); }
  return m;
}
async function voiceMaster(){
  // 1) narrator bed + 2) two customer cameos, all as PCM16 wav in the same TTS voice model/rate.
  const bedDec=decodeWav(await ttsWav(FILM.voice, FILM.script, FILM.vibe));
  const rate=bedDec.sampleRate;
  const bed=Int16Array.from(toMono(bedDec)); // mutable copy = the master bed
  for(let ci=0; ci<CUST.length; ci++){
    const c=CUST[ci];
    const camDec=decodeWav(await ttsWav(c.voice, c.line, c.instr));
    const cam=toMono(camDec);
    const off=Math.floor(c.at * rate); // exact timecode → sample offset
    for(let i=0;i<cam.length;i++){
      const idx=off+i; if(idx>=bed.length) break;
      let v=bed[idx]+cam[i]; if(v>32767) v=32767; else if(v<-32768) v=-32768; // additive mix, hard clamp
      bed[idx]=v;
    }
    console.log('SAYBORN1 cameo mixed',c.who,'@'+c.at+'s ('+c.voice+')');
  }
  return encodeWav(bed, rate);
}
async function tts(){
  const wav=await voiceMaster();
  const b64=wav.toString('base64');
  // Fixed manifest/player object name; container is WAV (see ASSEMBLY note above).
  const up=await storage.uploadPng('sayborn1/sayborn1-voice.mp3', b64, 'audio/wav');
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
  const up = await storage.uploadPng('sayborn1/sayborn1-music.mp3', aud.data, mime);
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
        console.error('SAYBORN1 veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429){ lastErr='VEO QUOTA 429 (daily render limit reached on this API key): '+t;
          if(a<2){ await new Promise(res=>setTimeout(res,20000)); continue; } throw new Error(lastErr); }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('SAYBORN1 veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('SAYBORN1 veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('sayborn1/sayborn1-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('sayborn1/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('SAYBORN1 MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('SAYBORN1 BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('SAYBORN1 KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ sayborn1:{ nm:FILM.nm } } };
  const g = man.brands.sayborn1;
  // seed from existing manifest so a partial re-run never blanks finished media
  try{ const prev=await fetch(SBP+'/sayborn1/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.sayborn1) Object.assign(g, pj.brands.sayborn1); } }catch(e){}
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
    try{ g.voice = await tts(); console.log('SAYBORN1 voice OK (new take — retime captions)'); }
    catch(e){ console.error('SAYBORN1 VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('SAYBORN1 voice REUSED'); }
  // music — reuse unless redo
  try{
    const mu = SBP+'/sayborn1/sayborn1-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('SAYBORN1 music REUSED'); }
    else { g.music = await lyria(); console.log('SAYBORN1 music OK'); }
  }catch(e){ console.error('SAYBORN1 MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  // scenes — reuse unless redo; checkpoint after each so a killed run never loses finished media
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/sayborn1/sayborn1-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('SAYBORN1 scene REUSED',ix); }
      else { g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('SAYBORN1 scene OK',ix); }
    }catch(e){ console.error('SAYBORN1 SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; /* never show old film in a slot we were told to replace */ }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('SAYBORN1 checkpoint',ix);
  }
  await saveManifest(man);
  console.log('SAYBORN1 COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
