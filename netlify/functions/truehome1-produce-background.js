// TRUEHOME1 — standalone cinematic producer for the SparkMyName homepage film (real-people recut).
// ===== THE REEL LAW (Founder, 2026-07-11 — PERMANENT) =====
// A video name is a film reel. Once a reel is cut it is NEVER overwritten. Every new cut of any film
// gets a BRAND-NEW name (producer + storage folder + manifest): truehome1 is virgin, permanent, never reused.
// Old reels (signhome1/, sayborn1/, sparkfilm*, goldreel/, mastergold/, premiere films) are frozen history — never read, never written.
// ============================================================
// TRUEHOME — "say your sentence and see your name born." Warm-mentor narration + three customer voice cameos +
// Lyria music + 12 Veo scenes, real-people recut. Same narration/cameos/vibe as signhome1; reshot with real
// people and the old warm sparkfilm1 music brief.
// 100% isolated: its OWN file, its OWN storage folder (truehome1/), its OWN manifest, its OWN single film.
// Shares NOTHING with any other reel's folder — those folders are never read or written.
// Imports no other film, references no other producer. Guarded by ORDER_START_KEY.
// Selective re-render: &only=1,2,6 re-renders just those scenes (others reused). &redo=1 = everything.
// Voice re-audition: &voice=1 re-records the master (then captions must be retimed to the new take).
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now(); // cache-buster stamped on every manifest URL

const FILM = {
  slug: 'truehome1',   // virgin, permanent, never reused
  nm: 'TRUEHOME',
  voice: 'ash',        // starting voice (warm mentor). Comment: founder may re-audition echo/onyx and re-fire with voice=1 + caption retime.
  vibe: "Warm, grounded mentor — a kind friend across a kitchen table, never an announcer. Open at a true near-whisper: slow, close, zero performance. Keep a steady inner pulse — matter-of-fact, no pity, the energy always coiled. Brighten naturally through the birth and the parade: short phrases, conversational-big, landing like drumbeats. The guarantee is low, slow, certain — every sentence ends pitching DOWN. The final line is the quietest moment of the whole read: a full pause at the ellipsis, then an invitation, soft and certain — a door held open, never a command. Honor every ellipsis as a real pause. Clear studio level, always above the music. This longer cut breathes twice — let the mid-film valley be felt: ease the read before the parade, then rise again. The three customer sentences are other voices, not yours; leave clean air around them.",
  script: "You've always had the idea. Nobody ever showed you how. So say it out loud — one sentence, in your own words. Watch. Names — lots of them, made just for your idea. Every one checked, with the web address ready to claim. Pick your favorite — your whole brand is built around it. Your logos — several, in full color. Your taglines, your bios — words that sound like you. Say a different dream — get a different brand. A business. A podcast. A cause. Yours, and only yours. A lawn service. A restaurant. A show of your own. A cause. Whatever you're starting — the cards, the signs, the covers, the flyers — done, and ready. Everything saved in your free workspace — yours, anywhere. And your guide walks you through every step: your web address, protecting your name, making it official. Our guarantee: love it, or it costs you nothing. Your idea — finally real. Say your sentence… and see your name born."
};

// CUSTOMER VOICES — three separate small TTS takes in DIFFERENT voices than the narrator ('ash'), mixed into the
// master track at their exact timecodes, then the master uploads as truehome1-voice.mp3 and is voice-locked.
//   HER       (warm female voice / shimmer, window 0:13–0:16):     "I mow lawns in my neighborhood."
//   PODCASTER (young male voice / echo, window 0:38–0:41.5):       "I'm starting a sports podcast."
//   VOLUNTEER (soft female voice / coral, window 0:41.5–0:43):     "We rescue dogs in Dayton."
// ASSEMBLY (documented): sparkfilm1 handles voice as a single OpenAI TTS take uploaded straight to storage.
// TRUEHOME mirrors that fetch-based handling but must lay three cameos over the narration, so instead of asking the
// API for one finished mp3 we ask OpenAI TTS for LINEAR PCM (response_format:'wav') for all four takes, decode
// each WAV to 16-bit samples, and additively mix each cameo into the narrator bed at floor(timecode * sampleRate)
// with hard clamping to int16. The mixed bed is re-wrapped in a WAV container and written to the fixed object
// name truehome1/truehome1-voice.mp3 (the manifest/player contract requires that exact name; the site player builds
// the element with `new Audio(url)`, which is container-agnostic). No ffmpeg / external audio dependency.
const CUST = [
  { who: 'HER',       voice: 'shimmer', at: 13.0, line: "I mow lawns in my neighborhood.", instr: "Warm, ordinary woman, plain and true — half-shy, half-proud, like naming her dream out loud for the first time. Conversational, unhurried, no performance." },
  { who: 'PODCASTER', voice: 'echo',    at: 38.0, line: "I'm starting a sports podcast.", instr: "Young man, bright and eager, leaning into the mic — quick, confident, a spark of new-energy excitement. Natural, not announced." },
  { who: 'VOLUNTEER', voice: 'coral',   at: 41.5, line: "We rescue dogs in Dayton.", instr: "Soft-spoken woman, gentle and sincere — a quiet, tender resolve, the warmth of someone who does this out of love. Close and unhurried, never announced." }
];

const MUSIC = "Warm hopeful brand-film underscore, instrumental only, absolutely no vocals, about forty-five seconds: gentle intimate open (soft piano, warm pads, a quiet heartbeat), a tender lift as ideas come to light, a modest proud warmth — never epic, never anthemic, human-scale and kind — settling to a soft hopeful resolve under a held end card; plenty of voice-friendly headroom so narration always sits clearly on top, loop-friendly ending.";

// STORY — 12 Veo prompts (T1..T12). Each core has the standing armor APPENDED VERBATIM (inlined per take,
// mirroring sayborn1's per-take inlining exactly, so the standing text-ban armor appears once per take).
const STORY = [
 // T1
 "The man who waited. Photorealistic cinematic slow push-in: a man in his late fifties by a window in warm early-morning light — a weathered, kind face, tired hopeful eyes looking just past the lens as if holding a lifelong dream. Soft rim light, dust motes in the sun, a lived-in room behind him, shallow depth of field, film grain, deeply human. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T2
 "The dreamers, gliding. Continuous lateral glide through warm home vignettes: a woman in her 40s at a sunny kitchen table looking up from a notepad with quiet hope; a young volunteer cradling a small scruffy rescue dog against her shoulder in soft window light; a young woman by a ring light lowering her phone, thoughtful. Golden-hour warmth, real homes, shallow focus. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T3
 "More dreamers; she reaches. Continuous glide: a woman with flour on her hands sketching in a warm kitchen; a man at a lamplit workbench sanding a handmade piece, sawdust in the air; the glide settles on the lawn-care woman as her hand reaches for her phone — a small brave breath before she taps. Warm light, real textures, human faces. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T4
 "The sentence, the wonder. Close-up of the lawn-care woman holding her phone, its soft glow lighting her face from below; she speaks a few quiet words, waits nervously, then her face slowly blooms into wonder and a small disbelieving smile. Stay on HER FACE, never the screen. Warm kitchen light, shallow focus, tender. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T5
 "The birth, felt. Her face and hands as joy grows — a hand rising to her mouth, eyes glistening, the phone glow warm on her skin, the kitchen soft behind her. Pure human reaction to a dream coming true. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T6
 "The others taste it. Montage of two more people in the same joyful moment: a bright-eyed young man in a cozy room leaning toward his mic setup, laughing with excitement; the young volunteer in a shelter doorway with the scruffy dog, eyes filling as she looks at her phone. Real warm rooms, genuine emotion. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T7
 "Three, together, hopeful. One continuous move across the lawn-care woman, the young podcaster, and the dog-rescue volunteer — each in their own warm real setting, each looking up with new hope and a smile, lit from within. Golden warmth, real faces full of possibility. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T8
 "Real life: the yard sign. Morning light: the lawn-care woman kneeling in a real green lawn, pressing a fresh professional yard sign firmly into the grass with both hands, then standing back, hands on hips, proud, surveying her work. Real suburban yard, dew on grass, warm sun; her pride is the subject, the sign a real weathered metal-and-vinyl prop at a natural angle. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T9
 "Real life: restaurant & creator. Continuous glide: a woman standing proudly at dusk under the warm glow of her small storefront, hands clasped, beaming; then the young podcaster leaning back in a cozy home studio, headphones on, eyes closed in a happy sigh of arrival. Real locations, warm practical light, genuine joy. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T10
 "Real life: the cause & shared joy. The dog-rescue volunteer kneeling at a community bulletin board in soft daylight, pinning a colorful flyer, the scruffy dog sniffing happily at her feet; she smiles down at the dog. Then a brief warm beat of a friend across town breaking into a delighted grin at her own phone. Tender and real. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T11
 "The workspace, lived. The lawn-care woman at her kitchen table at golden hour, laptop open and phone beside it glowing warmly; she taps, sits back with a quiet satisfied 'yes,' a soft fist on the table, deeply content. Warm home light, real hands and face, no visible screen content. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts.",
 // T12
 "The bookend; the man returns. Continuous move across the dreamers transformed and happy in their real settings — the restaurant owner under her glowing storefront, the volunteer beside an empty kennel with a wide smile, the podcaster mid-laugh — and finally the late-fifties man from shot one, now hanging a small elegant sign in a shop window, who turns and looks directly into the lens with a warm, proud, knowing smile — decades of waiting finally over. Golden light, cinematic, deeply human. ONE continuous shot, no cuts, the camera never stops. Photorealistic, warm cinematic light. ABSOLUTE TEXT BAN — the video model renders no words or letters of any kind; every word the viewer reads is drawn by the site player as an overlay. Strictly exclude: any readable text, logos, visible screen/UI content, blank or empty placeholder objects, garbled marks, cuts."
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
  // 1) narrator bed + 2) three customer cameos, all as PCM16 wav in the same TTS voice model/rate.
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
    console.log('TRUEHOME1 cameo mixed',c.who,'@'+c.at+'s ('+c.voice+')');
  }
  return encodeWav(bed, rate);
}
async function tts(){
  const wav=await voiceMaster();
  const b64=wav.toString('base64');
  // Fixed manifest/player object name; container is WAV (see ASSEMBLY note above).
  const up=await storage.uploadPng('truehome1/truehome1-voice.mp3', b64, 'audio/wav');
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
  const up = await storage.uploadPng('truehome1/truehome1-music.mp3', aud.data, mime);
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
        console.error('TRUEHOME1 veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429){ lastErr='VEO QUOTA 429 (daily render limit reached on this API key): '+t;
          if(a<2){ await new Promise(res=>setTimeout(res,20000)); continue; } throw new Error(lastErr); }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('TRUEHOME1 veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('TRUEHOME1 veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('truehome1/truehome1-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('truehome1/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('TRUEHOME1 MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('TRUEHOME1 BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('TRUEHOME1 KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ truehome1:{ nm:FILM.nm } } };
  const g = man.brands.truehome1;
  // seed from existing manifest so a partial re-run never blanks finished media
  try{ const prev=await fetch(SBP+'/truehome1/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.truehome1) Object.assign(g, pj.brands.truehome1); } }catch(e){}
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
    try{ g.voice = await tts(); console.log('TRUEHOME1 voice OK (new take — retime captions)'); }
    catch(e){ console.error('TRUEHOME1 VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('TRUEHOME1 voice REUSED'); }
  // music — reuse unless redo
  try{
    const mu = SBP+'/truehome1/truehome1-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('TRUEHOME1 music REUSED'); }
    else { g.music = await lyria(); console.log('TRUEHOME1 music OK'); }
  }catch(e){ console.error('TRUEHOME1 MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  // scenes — reuse unless redo; checkpoint after each so a killed run never loses finished media
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/truehome1/truehome1-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('TRUEHOME1 scene REUSED',ix); }
      else { g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('TRUEHOME1 scene OK',ix); }
    }catch(e){ console.error('TRUEHOME1 SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; /* never show old film in a slot we were told to replace */ }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('TRUEHOME1 checkpoint',ix);
  }
  await saveManifest(man);
  console.log('TRUEHOME1 COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
