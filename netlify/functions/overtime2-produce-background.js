// OVERTIME2 — Overtime Social v2, the Founder's director's cut. Commissioned 2026-07-14.
// ===== THE REEL LAW (Founder — PERMANENT) =====
// overtime2 is a VIRGIN reel (verified 0 hits). The original goldreel is frozen history — never
// read, never written. Every prior reel stays untouched.
// ==============================================
// THE DIRECTOR'S NOTES (Founder, verbatim intent — all implemented):
//  1. Concept is perfect — same story as goldreel, rebuilt.  2. Voice was OUT OF SYNC → v2 runs on
//  the voice-clock player; captions timed scene by scene, retimed to the measured take at sign-off.
//  3. Scene 5 dome spelling fixed: exactly 'Overtime Social Restaurant & Sports Bar'.  4. Scene 3 is
//  4 seconds.  5. ONE consistent building: the huge round building in S3 is the same building the
//  giant globe is mounted on in S4, ignites on in S5, and hosts opening night in S6/S7 — identical
//  size and design everywhere (BUILDING & DOME LOCK on every prompt).  6. All stray/misspelled
//  render text (e.g. 'restaiurantt', 'sport bar') eliminated by the TEXT LOCK: only the three exact
//  approved strings may appear.  7. Voice: much more energetic and upbeat, projected louder; music:
//  energetic, motivational; voice always clearly above it.  8. 'A film by Spark Studios' credit
//  REMOVED from the final card; the player's live end card carries $29 · same day · 100% Satisfaction
//  Guaranteed with green checks and jumps to the real speak/type box.
// ANTI-FREE LAW: v2 script is law-clean — 'saved in your online workspace' (never 'free').
// QUOTA: 8 Veo renders + 1 Lyria + TTS. Retakes: &only=N · voice: &voice=1 · all: &redo=1.
// SECURITY LAW: Founder inserts keys personally; none live here. Founder fires:
//   https://sparkmyname.netlify.app/.netlify/functions/overtime2-produce-background?key=YOUR_ORDER_START_KEY
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now();

const FILM = {
  slug: 'overtime2',   // virgin, permanent, never reused
  nm: 'Overtime Social — Director\'s Cut',
  voice: 'ash',
  vibe: "Upbeat, motivational American male — bright, alive, and infectious, a coach on the best day " +
        "of the season, yet always real and never a cheesy hype announcer. CRITICAL PACING LAW " +
        "(Founder's stopwatch): the read is SEVEN CHAPTERS separated by long ellipsis pauses; speak " +
        "very slowly and spaciously — like telling a story by a fire, never like reading copy — and " +
        "let silence carry the remainder of every chapter. The energy lives in the TONE, never in " +
        "the tempo. Honor every ellipsis as a long, real pause of genuine silence. " +
        "Strong, clear, well-PROJECTED studio level — full presence, noticeably above the music, every " +
        "word crisp. Momentum builds scene by scene: excited wonder as the brand is born, rising " +
        "thrill as the dome ignites, pure joy on opening night, and a proud, victorious finish. A " +
        "clear pause before 'Spark your name.'",
  // v2 script — the goldreel story, law-clean ('online workspace', never 'free').
  // FOUNDER'S STOPWATCH SCRIPT — seven chapters with long pause chains between them. This is the
  // exact script of the LOCKED take now in storage (measured 70.46s; the player grid is cut to it).
  // VOICE LOCK: do not re-record without re-measuring and re-cutting the grid (Sync Law).
  script: "You've always had the idea… … a place of your own… … every game on… … every seat, the " +
    "best in the house… … … So one night… you open your laptop… … and on a page that simply says… " +
    "Spark My Name… … you type… one sentence… … … and it comes… to life… … … " +
    "Your name… … your logos… your colors… your website… your social pages… … your menus, and " +
    "shirts, and signs… … everything, saved in your online workspace… … … " +
    "So you find the room… … the perfect room… … " +
    "The sign goes up… … … the lights come on… … … and above it all… … … your dome… ignites… … … " +
    "Opening night… … a line down the block… … … the doors open wide… … … " +
    "The place, alive… … every screen… and every seat… … … and a roar… when the home team scores… … … " +
    "Your brand… everywhere… … all of it, from one idea… for a fraction of what it used to cost… " +
    "because Spark only wins… when you do… … … Your idea… … Your name… … Your brand… … … " +
    "Spark brings your great idea… to life."
};

// MUSIC — Founder's note: energetic and motivational. No ballads.
const MUSIC = "Energetic, motivational, modern brand-film underscore, instrumental only, absolutely no " +
  "vocals, about eighty-five seconds: a confident driving pulse — punchy drums, bright synth and " +
  "electric-piano accents, stadium-scale energy building steadily scene by scene — a euphoric lift as " +
  "the dome ignites, full joyful drive through opening night, and a big, proud, resolved finish with a " +
  "clean tail. Uplifting and alive from the first bar; never mournful, never slow strings, never " +
  "corporate-stock. Generous voice-friendly headroom: the narration always sits clearly on top.";

const LOCK = " BUILDING & DOME LOCK — IF AND ONLY IF the scene description above includes the round " +
 "building or its dome: they are the SAME huge, modern, ROUND circular building, five stories tall " +
 "with a curved glass facade, crowned by the SAME massive Las-Vegas-Sphere-style LED dome globe — " +
 "identical size, proportion, and design wherever they appear. IN EVERY SCENE WHOSE DESCRIPTION DOES " +
 "NOT MENTION THE BUILDING: strictly exclude ALL building exteriors, domes, globes, and cityscapes — " +
 "stay entirely inside the described setting. TEXT LOCK (ANTI-GARBLE, Founder's law) — the ONLY lettering anywhere in the frame is exactly 'Overtime Social Restaurant & Sports Bar', 'overtimesocial.com', or 'SPARKMYNAME', always spelled letter-perfect. RENDER TEXT LARGE AND FEW: the full name appears at most twice per scene, always big, sharp, and fully readable. ANY surface too small to letter perfectly — small tiles, distant signs, menus, shirts, phone screens — shows ONLY the circular arena-ring emblem with NO words at all. When in doubt, use the emblem alone. Strictly exclude every other word, partial word, or stray lettering of any kind. PACING LAW — ONE continuous shot, no cuts, the camera never stops; no " +
 "stalls, no dead moments, no black frames; energetic premium commercial pace. Photorealistic, cinematic.";

// THE 8 SCENES — the goldreel story, director's cut. SCHED: [0,12,22,26,36,46,56,68], end ~82s.
const STORY = [
 // S1 (0–12) Dreamer & brand born
 "Night in a warm modern home; a mid-40s man in casual at-home clothes at a kitchen table, laptop glow " +
 "on his hopeful face; on the laptop screen a dark page with a gold 'SPARKMYNAME' wordmark and a type " +
 "box — he types one sentence, and the sentence flows off the screen as a gold ribbon of light into a " +
 "black void where the brand blooms: 'Overtime Social Restaurant & Sports Bar' resolves with a circular " +
 "arena-ring emblem in stadium amber on midnight navy, and 'overtimesocial.com' appears with a bright " +
 "green available checkmark. The ENTIRE scene stays at the kitchen table and inside the black void " +
 "of the blooming brand card — NO buildings, NO exteriors, NO domes or globes of any kind appear " +
 "anywhere in this scene; it ends on the glowing brand card, nothing else. Hopeful, premium, " +
 "energetic." + LOCK,
 // S2 (12–22) Everything you get
 "A flying lateral glide along a gallery wall of glowing tiles on black: a full set of Overtime Social " +
 "logo variations (main mark, dark version, round O symbol, horizontal lockup), color chips and " +
 "typography specimens in motion, four phones with branded social pages, a laptop with a simple branded " +
 "web page, floating mockups of a menu, a folded tee with the chest emblem, a storefront sign and web " +
 "banners — all one identical brand look — arriving at a glowing workspace dashboard holding all of it." + LOCK,
 // S3 (22–26, FOUR SECONDS) The empty round space
 "A quick confident beat: exterior of the huge round five-story building with a For-Lease banner on its " +
 "curved glass, then inside — a vast EMPTY circular commercial space with great bones, tall curved " +
 "windows, afternoon light shafting in; the founder and a friend stride the round room pointing to " +
 "where the center bar and the ring of screens will go; a warm landlord handshake." + LOCK,
 // S4 (26–36) The transformation — the globe is mounted, full size
 "At golden dusk: a heavy-lift crane lowers the MASSIVE LED dome globe — venue-scale, Sphere-sized — " +
 "onto the crown of the SAME huge round five-story building, which visibly carries it with ease; as it " +
 "seats, the exterior sign 'Overtime Social Restaurant & Sports Bar' is installed and lights up on the " +
 "curved facade, window graphics wrap the round wall, banners hang, interior lights flick on floor by " +
 "floor. Construction giving way to glow; the building and its globe now one landmark silhouette." + LOCK,
 // S5 (36–46) The dome ignites — letter-perfect
 "Blue hour: the colossal LED dome globe crowning the same round building IGNITES and slowly rotates — " +
 "at its center glows the arena-ring emblem with the name spelled EXACTLY 'Overtime Social Restaurant & " +
 "Sports Bar', large, crisp, letter-perfect; surrounding it the entire curved dome surface plays many " +
 "live moving panels of FICTIONAL sports with invented teams — racing, baseball, football, boxing, " +
 "tennis, golf — all in motion, wrapping the globe in light. The camera orbits the base of the SAME " +
 "five-story building, awe-inspiring, volumetric glow." + LOCK,
 // S6 Opening night — ACROSS THE STREET, ARRIVALS ONLY (Founder: the line is OUTSIDE, period)
 "Night, filmed from ACROSS THE STREET at eye height, camera never tilting up and never entering: a " +
 "long, happy line of diverse friends and couples stands on the SIDEWALK OUTSIDE a grand curved " +
 "building facade, every person facing the closed glass entry doors beneath the lit 'Overtime Social " +
 "Restaurant & Sports Bar' sign; a greeter opens the door and admits guests ONE AT A TIME, each " +
 "stepping forward and INSIDE as the line advances; the interior is never shown. Strictly exclude: " +
 "anyone exiting, anyone walking away, any view inside the building, cars, valets. The upper floors " +
 "and roof stay out of frame. Cinematic night grade, anticipation, joy." + LOCK,
 // S7 The room alive — THE ROAR COMES LAST (Founder: they roar when the home team scores, not before)
 "Interior of the huge CIRCULAR sports bar under its domed ceiling: a center bar, tables wrapping all " +
 "the way around, packed with a diverse joyful crowd in their 20s to 50s; a massive RING of screens " +
 "plays fast-moving FICTIONAL sports with invented teams; servers in branded gear weave through with " +
 "wings and drinks. FOR THE FIRST FIVE SECONDS the crowd watches INTENTLY — leaning in, gripped, " +
 "murmuring, eyes on the screens, NO cheering yet. Then, ONLY IN THE FINAL THREE SECONDS of the shot, " +
 "the home team scores and the room ERUPTS in one collective roar — hands flying up, laughter, " +
 "clinking glasses. The eruption must come at the END of the shot, never earlier. Electric, warm, alive." + LOCK,
 // S8 (68–82) Your brand everywhere + clean final card (NO studio credit)
 "Quick beautiful moments inside the packed circular bar: the brand logo on a wall sign; a branded menu " +
 "with a specials card; a merch case of tees, hats and mugs; a happy guest holding up a branded shirt; " +
 "the SAME mid-40s man from the start, now the proud owner, standing tall in his glowing room. The " +
 "scene resolves to a clean final card on solid black using only black, gold and white: the 'SPARKMYNAME' " +
 "wordmark and beneath it a refined gold capsule reading 'Spark your name' — nothing else on the card. " +
 "The final frame holds with a slow cinematic zoom." + LOCK,
 // S9 (NEW — opening beat for the two-clip first chapter): pure dreaming & typing, NO brand card yet
 "Night in a warm modern home; a mid-40s man in casual at-home clothes at a kitchen table, thinking, " +
 "dreaming, a small hopeful smile; he opens his laptop, the glow lighting his face, and begins slowly " +
 "typing on a dark page that shows only a gold 'SPARKMYNAME' wordmark and an empty type box with a " +
 "blinking cursor. He types, pauses, looks at the words, types again — savoring the moment. NOTHING " +
 "ELSE appears: no gold ribbon, no brand card, no logos, no buildings — just the man, the laptop, and " +
 "the quiet hope on his face. Warm, intimate, cinematic." + LOCK
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
    console.log('OVERTIME2 tts retry',a,r.status); await delay(10000*a);
  }
  if(!r.ok) throw new Error('tts http '+r.status+' '+(await r.text()).slice(0,180));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('overtime2/overtime2-voice.mp3', b64, 'audio/mpeg');
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
  const up = await storage.uploadPng('overtime2/overtime2-music.mp3', aud.data, mime);
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
        console.error('OVERTIME2 veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429 || r.status>=500){
          lastErr=(r.status===429?'VEO QUOTA/RATE 429: ':'VEO server '+r.status+': ')+t;
          if(a<3){ const w=BACKOFFS[a-1]; console.log('OVERTIME2 backoff',ix,model,w+'ms'); await delay(w); continue; }
          if(r.status===429) throw new Error(lastErr);
          break;
        }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('OVERTIME2 veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('OVERTIME2 veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('overtime2/overtime2-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('overtime2/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('OVERTIME2 MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const ONLY = String(q.only||'').split(',').map(function(x){return parseInt(x.trim(),10);}).filter(function(n){return n>=1;});
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('OVERTIME2 BUILD RUN',RUN,'redo='+(q.redo||'(none)')+' only='+(q.only||'(none)'));
  console.log('OVERTIME2 KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ overtime2:{ nm:FILM.nm } } };
  const g = man.brands.overtime2;
  try{ const prev=await fetch(SBP+'/overtime2/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.overtime2) Object.assign(g, pj.brands.overtime2); } }catch(e){}
  g.nm = FILM.nm;
  g.shots = Array.isArray(g.shots) ? g.shots.slice(0, STORY.length) : [];
  if (redo) g.shots = [];
  delete g.shot_errors; delete g.voice_error; delete g.music_error;
  const wantVoice = (q.voice==='1') || redo || !g.voice;
  if(wantVoice){
    try{ g.voice = await tts(); console.log('OVERTIME2 voice OK (new take — retime captions)'); }
    catch(e){ console.error('OVERTIME2 VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  } else { console.log('OVERTIME2 voice REUSED'); }
  try{
    const mu = SBP+'/overtime2/overtime2-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('OVERTIME2 music REUSED'); }
    else { g.music = await lyria(); console.log('OVERTIME2 music OK'); }
  }catch(e){ console.error('OVERTIME2 MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/overtime2/overtime2-scene'+ix+'.mp4';
      const head = (redo || ONLY.indexOf(ix)>=0) ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('OVERTIME2 scene REUSED',ix); }
      else {
        await delay(STAGGER_MS);
        g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('OVERTIME2 scene OK',ix);
      }
    }catch(e){ console.error('OVERTIME2 SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220));
      if(redo || ONLY.indexOf(ix)>=0) g.shots[ix-1]=null; }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('OVERTIME2 checkpoint',ix);
  }
  await saveManifest(man);
  console.log('OVERTIME2 COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
