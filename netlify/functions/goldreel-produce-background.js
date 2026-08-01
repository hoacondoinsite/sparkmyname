// GOLDREEL — standalone cinematic producer for the SparkMyName homepage film.
// 100% isolated: its OWN file, its OWN storage folder (goldreel/), its OWN single film.
// Imports no other film, references no other producer. Guarded by ORDER_START_KEY.
// Renders: narration (OpenAI gpt-4o-mini-tts) + Lyria music bed + 8 Veo scenes, ~60s total.
const storage = require('./sb-storage.js');
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GK = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const V = Date.now(); // cache-buster stamped on every manifest URL

const FILM = {
  slug: 'goldreel',
  nm: 'Overtime Social Restaurant & Sports Bar',
  voice: 'onyx',
  vibe: "Mid-age American male, neutral accent \u2014 warm, grounded, believable, the friend a little further down the road who genuinely believes in you. Opens quiet and intimate at a kitchen table; lifts with quiet excitement as the brand comes alive and the doors open, but never shouts; lands the final lines soft, warm, and personal. Plain and human, never salesy, never a hype announcer. A clear micro-pause before 'Spark your name.' Strong, clear, well-projected studio narration level \u2014 full presence over the underscore, never buried by the music.",
  script: "You've always had the idea \u2014 a place of your own, every game on, every seat the best in the house. So one night you open your laptop, and on a page that simply says Spark My Name, you type one sentence. And it comes to life. Your name. Your logos, your colors, your website, your social pages, your menus and shirts and signs \u2014 everything, saved in your free workspace. So you find the room. The sign goes up, the lights come on, and above it all your dome ignites. Opening night \u2014 a line down the block, the place alive, every screen and every seat, a roar when the home team scores. Your brand, everywhere. All of it, from one idea \u2014 for a fraction of what it used to cost, because Spark only wins when you do. Your name. Your brand. Your turn. Spark your name."
};

const MUSIC = "Cinematic uplifting sports-bar brand-film underscore, instrumental only, absolutely no vocals, about sixty seconds: warm modern orchestral-hybrid with a confident heartbeat pulse, bright optimistic strings and subtle anthemic brass, a gentle hopeful open building with rising energy to a proud arena-scale swell for opening night, then settling warm; celebratory but never rowdy, premium and human, with plenty of voice-friendly headroom so the narration always sits clearly on top, loop-friendly ending.";

const STORY = [
 // 1 — Dreamer & brand born
 "Cinematic brand film, ONE continuous slow push-in, no cuts, the camera never stops. Night in a warm modern home; a mid-40s man in casual at-home clothes at a kitchen table, laptop glow on his hopeful face; on the laptop screen the real SparkMyName website \u2014 a dark page, a gold SPARKMYNAME wordmark, a 'type your idea' box \u2014 he types one sentence. The sentence flows off the screen as a gold ribbon of light into a black void where the brand blooms: the name 'Overtime Social Restaurant & Sports Bar' resolves with a circular arena-ring emblem in stadium amber on midnight navy, and a line reads overtimesocial.com with a bright green AVAILABLE tick. BRAND LOCK \u2014 the name reads exactly 'Overtime Social Restaurant & Sports Bar'; the platform mark reads exactly SPARKMYNAME. Strictly exclude: real logos, garbled text, cuts. Photorealistic, gold and white on deep black, hopeful and premium.",
 // 2 — Everything you get
 "Cinematic brand film, ONE continuous smooth lateral glide, no cuts, the camera never stops. The camera flies along a gallery wall of glowing tiles on black: a whole SET of Overtime Social logos (main mark, dark-background version, simple O symbol, horizontal lockup, favicons), then color chips with hex codes and typography specimens in motion, then four phones showing branded Facebook, Instagram, X and LinkedIn pages with first posts, a laptop showing a simple first web page, then floating mockups of a menu, a folded tee with the chest logo, a storefront sign, and web-banner ads \u2014 all sharing the exact Overtime Social look \u2014 arriving at a glowing free-workspace dashboard holding all of it. BRAND LOCK \u2014 the arena-ring mark legible throughout. Strictly exclude: real platform logos, real product labels, garbled text, cuts. Photorealistic premium motion design, black gold white and stadium-amber palette.",
 // 3 — The empty circular space
 "Cinematic brand film, ONE continuous smooth shot, no cuts, the camera never stops. A large EMPTY ROUND, CIRCULAR commercial space with good bones, a curved outer wall of tall windows, a For-Lease sign in the glass, afternoon light shafting in; the founder and a friend walk the circular room gesturing where the center bar and the ring of screens will go, then a warm handshake with a landlord. Spacious real-estate-tour realism, slow drift. Strictly exclude: a square or rectangular room, real logos, garbled text, black frames, shaky camera, cuts.",
 // 4 — The transformation (round building + dome)
 "Cinematic brand film, ONE continuous energetic shot, no cuts, at dusk, the camera never stops. A brisk build of a modern LARGE ROUND, CIRCULAR building crowned by a big dome on top: an exterior sign reading 'Overtime Social Restaurant & Sports Bar' is installed and lights up on the curved facade, see-through window graphics wrap the round wall, banners hang, door lettering appears, interior lights flick on. Construction giving way to glow, golden dusk sky, elegant motion. BRAND LOCK \u2014 signage reads exactly 'Overtime Social Restaurant & Sports Bar' with the arena-ring mark, legible. Strictly exclude: a square or boxy building, garbled text, real third-party logos, cuts.",
 // 5 — The dome ignites (center logo + surrounding moving fictional sports)
 "Cinematic brand film, ONE continuous orbiting hero shot, no cuts, at blue hour, the camera never stops. A huge Las Vegas Sphere-style LED dome crowns the large round building and ignites, rotating: at the very center of the dome glows the 'Overtime Social Restaurant & Sports Bar' logo, the circular arena-ring emblem, and SURROUNDING the logo the entire curved dome surface plays many LIVE, moving panels of FICTIONAL sports with invented teams \u2014 stock-car racing, baseball, American football, mixed martial arts cage fighting, boxing, tennis, golf, open-wheel formula racing, and high-energy action sports \u2014 all in motion at once, wrapping the dome in light. A luminous venue-scale landmark beacon against the dusk sky; the camera slowly orbits the base, awe-inspiring, volumetric glow. Strictly exclude: real teams, players, leagues, jerseys, or logos; still frozen images (all sports must be moving); garbled text; cuts.",
 // 6 — Opening night arrives
 "Cinematic brand film, ONE continuous crane move, no cuts, at night, the camera never stops. The large ROUND, CIRCULAR building with its glowing rotating dome above as a beacon; cars pull into a full lot; a happy line of diverse friends and couples along the sidewalk; a valet works the entrance; a warm greeter welcomes people beneath the amber 'Overtime Social Restaurant & Sports Bar' sign on the curved facade. Cinematic night grade, signage glow, anticipation and energy. Strictly exclude: a square building, real logos, garbled text, shaky camera, cuts.",
 // 7 — The room alive (circular interior, ring of screens, crowd, servers, roar)
 "Cinematic brand film, ONE continuous weaving shot, no cuts, the camera never stops. Interior of a huge CIRCULAR modern sports bar under a domed ceiling: a center bar, tables wrapping all the way around, packed with a diverse joyful crowd of beautiful women and handsome men aged 20s to late 50s, all in motion, having the time of their lives. A massive RING of large TV screens plays fast-moving FICTIONAL sports with invented teams (baseball, soccer, combat sports, golf, tennis, motorsport); overhead the interior dome ceiling drifts cool abstract sports visuals. Servers in branded Overtime Social gear weave through carrying food and drinks \u2014 invented non-alcoholic drinks, beer, wine, cocktails, and wings; a collective cheer as the home team scores \u2014 hands up, laughter, clinking glasses \u2014 while the working staff keep serving right through the cheer. Warm, cozy but electric. Strictly exclude: real broadcasts, real team logos or jerseys, real product or drink labels, garbled text, cuts.",
 // 8 — Your brand everywhere + came true + final card
 "Cinematic brand film, ONE continuous shot resolving to a held final card, no cuts. Quick beautiful moments inside the packed circular bar: the 'Overtime Social Restaurant & Sports Bar' logo on a wall sign; a branded menu with a specials tent-card; a merch case of folded tees, hats, and mugs; a happy guest buying and holding up a branded t-shirt; a warm host at the door hands a leaving couple a branded card and gestures come back, and a phone shows the venue's own simple 'Events \u2014 Book online' page in the brand look; then the SAME mid-40s man from the start, now dressed like the owner, stands proud in his glowing room. The scene resolves to a clean brand card on a solid black background using only black, gold, and white: the official SparkMyName wordmark with a small trademark mark, the line 'Spark your name' inside a refined gold capsule button, and a small credit line reading 'A film by Spark Studios.' BRAND LOCK \u2014 the arena-ring mark legible; the final platform wordmark reads exactly SPARKMYNAME. Strictly exclude: real logos or labels, garbled text, cuts."
];

async function tts(){
  const r = await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',
    headers:{'Authorization':'Bearer '+OA,'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-4o-mini-tts',voice:FILM.voice,input:FILM.script,instructions:FILM.vibe,response_format:'mp3'})});
  if(!r.ok) throw new Error('tts '+r.status+' '+(await r.text()).slice(0,200));
  const b64 = Buffer.from(await r.arrayBuffer()).toString('base64');
  const up = await storage.uploadPng('goldreel/goldreel-voice.mp3', b64, 'audio/mpeg');
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
  const up = await storage.uploadPng('goldreel/goldreel-music.mp3', aud.data, mime);
  if(!up.ok) throw new Error('music upload failed');
  return up.url+'?v='+V;
}
async function veo(prompt, ix){
  const base='https://generativelanguage.googleapis.com/v1beta';
  const MODELS=['veo-3.1-fast-generate-preview','veo-3.1-generate-preview','veo-3.0-fast-generate-001','veo-3.0-generate-001'];
  async function start(model, withPerson){
    const params = withPerson ? {aspectRatio:'16:9',personGeneration:'allow_adult'} : {aspectRatio:'16:9'};
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
        console.error('GOLDREEL veo start FAIL',ix,model,'try',a,r.status,t.slice(0,240));
        if(r.status===429){ lastErr='VEO QUOTA 429 (daily render limit reached on this API key): '+t;
          if(a<2){ await new Promise(res=>setTimeout(res,20000)); continue; } throw new Error(lastErr); }
        if(/personGeneration|person_generation/i.test(t)){
          r=await start(model,false);
          if(r.ok){ op=await r.json(); console.log('GOLDREEL veo OK (no-person)',model,ix); break outer; }
          lastErr='veo '+model+' person retry '+r.status; break; }
        lastErr='veo '+model+' '+r.status+' '+t; break;
      } else { op=await r.json(); console.log('GOLDREEL veo OK',model,ix); break outer; }
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
  const up = await storage.uploadPng('goldreel/goldreel-scene'+ix+'.mp4', b64, 'video/mp4');
  if(!up.ok) throw new Error('scene upload failed');
  return up.url+'?v='+V;
}
async function saveManifest(man){
  try{
    const mb64 = Buffer.from(JSON.stringify(man)).toString('base64');
    await storage.uploadPng('goldreel/manifest.json', mb64, 'application/json');
  }catch(e){ console.error('GOLDREEL MANIFEST SAVE FAIL', e.message); }
}
exports.handler = async (event) => {
  const q=(event&&event.queryStringParameters)||{};
  if(!process.env.ORDER_START_KEY || q.key!==process.env.ORDER_START_KEY)
    return { statusCode:403, body:'forbidden' };
  const redo = (q.redo==='1'||q.redo==='shots'||q.redo==='all');
  const RUN=Math.random().toString(36).slice(2,8).toUpperCase();
  console.log('GOLDREEL BUILD RUN',RUN,'redo='+(q.redo||'(none)'));
  console.log('GOLDREEL KEYS openai:'+(OA?'present':'MISSING')+' gemini:'+(GK?'present':'MISSING'));
  await storage.ensureBucket();
  const SBP = process.env.SUPABASE_URL+'/storage/v1/object/public/'+storage.BUCKET;
  const man = { made_at:new Date().toISOString(), film:FILM.nm, brands:{ goldreel:{ nm:FILM.nm } } };
  const g = man.brands.goldreel;
  // seed from existing manifest so a partial re-run never blanks finished media
  try{ const prev=await fetch(SBP+'/goldreel/manifest.json?cb='+Date.now());
    if(prev.ok){ const pj=await prev.json(); if(pj&&pj.brands&&pj.brands.goldreel) Object.assign(g, pj.brands.goldreel); } }catch(e){}
  // voice — re-record each run (cheap)
  try{ g.voice = await tts(); console.log('GOLDREEL voice OK'); }
  catch(e){ console.error('GOLDREEL VOICE FAIL',e.message); g.voice_error=String(e.message).slice(0,200); }
  // music — reuse unless redo
  try{
    const mu = SBP+'/goldreel/goldreel-music.mp3';
    const mhead = redo ? {ok:false} : await fetch(mu,{method:'HEAD'});
    if(mhead.ok){ g.music = mu+'?v='+V; console.log('GOLDREEL music REUSED'); }
    else { g.music = await lyria(); console.log('GOLDREEL music OK'); }
  }catch(e){ console.error('GOLDREEL MUSIC FAIL',e.message); g.music_error=String(e.message).slice(0,200); }
  // scenes — reuse unless redo; checkpoint after each so a killed run never loses finished media
  g.shots = g.shots || [];
  for(let ix=1; ix<=STORY.length; ix++){
    try{
      const u = SBP+'/goldreel/goldreel-scene'+ix+'.mp4';
      const head = redo ? {ok:false} : await fetch(u,{method:'HEAD'});
      if(head.ok){ g.shots[ix-1]=u+'?v='+V; console.log('GOLDREEL scene REUSED',ix); }
      else { g.shots[ix-1]=await veo(STORY[ix-1], ix); console.log('GOLDREEL scene OK',ix); }
    }catch(e){ console.error('GOLDREEL SCENE FAIL',ix,e.message);
      g.shot_errors=(g.shot_errors||[]).concat('scene'+ix+': '+String(e.message).slice(0,220)); }
    g.shots = g.shots.filter(Boolean);
    if(g.shots.length) g.shot=g.shots[0];
    await saveManifest(man);
    console.log('GOLDREEL checkpoint',ix);
  }
  await saveManifest(man);
  console.log('GOLDREEL COMPLETE RUN',RUN, JSON.stringify(man));
  return { statusCode:200, body:JSON.stringify(man) };
};
