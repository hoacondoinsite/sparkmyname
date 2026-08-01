// BROADWAY1 — "The Broadway Cut" cinematic marquee producer. Direct Founder commission, 2026-07-14.
// ===== THE REEL LAW (Founder — PERMANENT) =====
// broadway1 is a VIRGIN reel (verified 0 hits across the disc before this file was written).
// Once cut it is NEVER overwritten; every future cut gets a brand-new name. All prior reels
// (serenity1/, blessed75/, homemarquee1/, and every older run) are frozen history — never read, never written.
// ==============================================
// THE BROADWAY CUT — one single unified visual anchor: a premium modern movie theater. The camera sits
// behind a viewer in a plush leather seat, looking at a massive glowing silver screen. Every UI step,
// deliverable, and brand appears ON that giant screen — using ONLY the Founder's five verified owned
// brands (Zest Quest, Glam Caravan, Palacio del Caribe, Brightpath Lending, Paws and Hearts) so nothing
// on screen is invented.
// ANTI-FREE LAW (Founder, standing + re-affirmed for this cut): the word "free" is never spoken and never
// shown — anywhere. Scene 2 uses the Founder's law-compliant narration; the S8 line ships as "a list of
// words" and the launch guide shows "IRS EIN" (never "free EIN").
// QUOTA: 8 Veo renders + 1 Lyria + TTS. Tier 2 confirmed: 50 Veo/day, 16 used — plenty of room, and the
// 4-second stagger keeps the per-minute limit smooth. Retakes: &only=N · voice: &voice=1 · all: &redo=1.
// SECURITY LAW: the Founder inserts all keys personally; none live in this file. The Founder fires:
//   https://sparkmyname.netlify.app/.netlify/functions/broadway1-produce-background?key=YOUR_ORDER_START_KEY
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now();

const FILM = {
  slug: 'broadway1',   // virgin, permanent, never reused
  nm: 'THE BROADWAY CUT',
  voice: 'ash',
  vibe: "Grade-3 plain English. Short, calm sentences a nervous person can read in one breath. Low, " +
        "reassuring, grounded tone — never hypey, artificial, or salesy. A warm, honest guide. Honor " +
        "every dash and ellipsis as a true pause. Pitch down on the final lines — the quietest, most " +
        "certain moment of the whole read. Clear studio level, always above the music.",
  // The locked Broadway narration — Founder's verbatim blocks; S2 is the Founder's law-compliant
  // rewrite; S3 bridges without repeating S2; S8 drops the banned word per the standing law.
  script: "Almost everyone has a dream. A hope for a better life, financial freedom for your family, " +
    "or a desire to build something with real purpose and self-worth. Whatever stage of life you are in, " +
    "you want your idea to matter. " +
    "So, you say it in one simple sentence. Spark does the hard part. Many chatbots will dump a list of " +
    "generic words that are already taken — names that destroy your dream before it starts. We instantly " +
    "search the global registries to find great choices that are actually open and ready for you to claim. " +
    "Now watch your idea take the stage. A cooking dream becomes Zest Quest. A salon on wheels becomes " +
    "Glam Caravan. Real names, made just for your idea. " +
    "This isn't a list of words. It is a real-world brand system. For twenty-nine dollars, you get the " +
    "entire Starter Package. Multiple full-color logo choices, brand fonts, custom colors, and taglines " +
    "that connect with people. " +
    "You get professional Vector SVG logos built for high-end print. Ready-to-run web banners in all " +
    "three standard advertising sizes. Your social cover art, profile icons, and first marketing posts " +
    "already written for you. " +
    "An honest note: we don't do legal filings or trademark searches for you. But we don't leave you " +
    "hanging. In your workspace, we hand you the exact resource links and coaching guidance real " +
    "founders use to make it official. " +
    "We show you exactly where to search trademarks, register your business, claim your domain, and " +
    "take payments. The tools you need to open for business, all in one place, giving you the best " +
    "chance of success. " +
    "One time. No subscriptions. A money-back guarantee. Don't settle for a list of words that gets " +
    "ignored. Let's make your brand real. Spark your name... and watch it be born."
};

// MUSIC — Founder's Broadway brief: deep, emotional, minimalist strings.
const MUSIC = "Deep, emotional, minimalist string underscore, instrumental only, absolutely no vocals, " +
  "about ninety-five seconds: a quiet, intimate cello-and-violin chord structure that builds steadily in " +
  "warmth through the middle — patient, human, cinematic — then drops to near-silence for the final " +
  "handoff block, resolving on one soft, certain chord with a gentle tail. Never hypey, never " +
  "corporate-stock, never trailer bombast. Generous voice-friendly headroom throughout; the narration " +
  "always sits clearly on top. Loop-friendly ending.";

// THE THEATER LOCK — byte-identical on every prompt: one unified canvas, zero drift.
const LOCK =
 " THEATER LOCK: One single unified setting for the entire film — a premium, modern, luxurious movie " +
 "theater. The camera is positioned behind a viewer seated in a plush leather seat, looking directly at " +
 "a massive, glowing silver cinema screen that fills the view. Everything the story shows appears ON that " +
 "giant screen; the dark elegant theater, the seat, and the silhouette stay constant and identical across " +
 "every scene. All names and words shown on the cinema screen are spelled EXACTLY as written, in clean, " +
 "modern, professional sans-serif type — crisp and ungarbled, never misspelled, never distorted." +
 " PACING & QUALITY LAW: Continuous elegant motion first frame to last: no stalls, no dead moments, no " +
 "black frames; unhurried luxury commercial pace, never rushed, never stopped. Photorealistic, matte " +
 "textures, warm cinematic light.";

// THE 8 SCENES — player schedule [0, 11, 22, 33, 45, 56, 68, 79] on the voice clock.
const STORY = [
 // S1 (0:00–0:11) The Dream
 "The Dream. A dark, premium modern theater. The silhouette of a person sits in a plush leather seat, " +
 "looking up at a massive, glowing silver screen showing only a faint, patient blinking cursor on a deep " +
 "charcoal field. Quiet grandeur, soft screen-glow on the seat leather, dust motes in the projector beam." + LOCK,
 // S2 (0:11–0:22) The Friction
 "The Friction. On the giant silver screen: a dry, generic bulleted list of plain name words in a bland " +
 "chat interface. One by one the names are stamped with a red 'Taken' mark, the list dimming as it fails. " +
 "The silhouette watches, still. The screen's cold light washes the theater." + LOCK,
 // S3 (0:22–0:33) The Spark
 "The Spark. The cinema screen transitions warmly: a hand taps a glowing gold microphone icon, and live " +
 "typing appears in elegant type — 'Zest Quest' with 'zestquest.net', then 'Glam Caravan' with " +
 "'glamcaravan.com' — each landing with a soft golden shimmer. Warm gold light now fills the theater." + LOCK,
 // S4 (0:33–0:45) The Deliverables Spectrum
 "The Deliverables. The giant screen displays a premium digital brand workspace loading: curated entries " +
 "'Palacio del Caribe' with 'palaciodelcaribe.com' and 'Brightpath Lending' with 'brightpathlending.net' " +
 "check themselves with bold green checkmarks; full-color logo tiles, font cards, and color palettes " +
 "assemble in clean rows on the silver screen." + LOCK,
 // S5 (0:45–0:56) The Vector & Marketing Proof
 "The Proof. The silver screen zooms into a crisp vector logo for 'Paws and Hearts' with " +
 "'pawsandhearts.net', scaling up with perfect mathematical clarity — razor-sharp edges at any size. " +
 "Beside it, three standard web banner shapes — one wide, one tall, one rectangular — and neatly written " +
 "social posts align in a clean grid on the screen." + LOCK,
 // S6 (0:56–1:08) The Honest Coaching
 "The Honest Coaching. The theater screen switches to a clean 'Resources' guide: simple text link rows " +
 "reading 'ZenBusiness' and 'USPTO Trademark Search' in plain professional type on warm cards — text " +
 "links only, no logos. Calm, trustworthy, uncluttered design on the giant screen." + LOCK,
 // S7 (1:08–1:19) The Launch Guide
 "The Launch Guide. The silver screen scrolls smoothly through clean, numbered step-by-step launch steps, " +
 "highlighting simple text setup links reading 'IRS EIN', 'Namecheap', and 'Stripe' — each step checking " +
 "itself as the scroll glides on. Ordered, calm, confidence-building." + LOCK,
 // S8 (1:19–1:30 + hold) The Handoff
 "The Handoff. The silver screen swells into a beautiful, pulsing gold bloom that gently settles back " +
 "into a clean gold microphone input box with a patient blinking cursor — the same cursor from the first " +
 "frame, now glowing and inviting. The silhouette leans forward slightly. The final frame holds with a " +
 "slow cinematic zoom." + LOCK
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
    console.log('BROADWAY1 tts retry',a,r.status); await delay(10000*a);
  }
  if(!r.ok) throw new Error('tts http '+r.status+' '+(await r.text()).slice(0,180));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('broadway1/broadway1-voice.mp3', b64, 'audio/mpeg');
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
  const up = await storage.uploadPng('broadway1/broadway1-music.mp3', aud.data, mime);
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
        console.error('BROADWAY1 veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429 || r.status>=500){
          lastErr=(r.status===429?'VEO QUOTA/RATE 429: ':'VEO server '+r.status+': ')+t;
          if(a<3){ const w=BACKOFFS[a-1]; console.log('BROADWAY1 backoff',ix,model,w+'ms'); await delay(w); continue; }
          if(r.status===429) throw new Error(lastErr);
          break;
        }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('BROADWAY1 veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('BROADWAY1 veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('broadway1/broadway1-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('broadway1/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('BROADWAY1 MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('BROADWAY1 BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('BROADWAY1 KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ broadway1:{ nm:FILM.nm } } };
  const g = man.brands.broadway1;
  try{ const prev=await fetch(SBP+'/broadway1/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.broadway1) Object.assign(g, pj.brands.broadway1); } }catch(e){}
  g.nm = FILM.nm;
  g.shots = Array.isArray(g.shots) ? g.shots.slice(0, STORY.length) : [];
  if (redo) g.shots = [];
  delete g.shot_errors; delete g.voice_error; delete g.music_error;
  const wantVoice = (q.voice==='1') || redo || !g.voice;
  if(wantVoice){
    try{ g.voice = await tts(); console.log('BROADWAY1 voice OK (new take — retime captions)'); }
    catch(e){ console.error('BROADWAY1 VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('BROADWAY1 voice REUSED'); }
  try{
    const mu = SBP+'/broadway1/broadway1-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('BROADWAY1 music REUSED'); }
    else { g.music = await lyria(); console.log('BROADWAY1 music OK'); }
  }catch(e){ console.error('BROADWAY1 MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/broadway1/broadway1-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('BROADWAY1 scene REUSED',ix); }
      else {
        await delay(STAGGER_MS);
        g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('BROADWAY1 scene OK',ix);
      }
    }catch(e){ console.error('BROADWAY1 SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('BROADWAY1 checkpoint',ix);
  }
  await saveManifest(man);
  console.log('BROADWAY1 COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
