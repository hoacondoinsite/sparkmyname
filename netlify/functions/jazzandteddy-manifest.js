// JAZZANDTEDDY manifest — serves the marquee film's media (scenes + voice + music) to the player.
// No keys exposed. Reads only the isolated jazzandteddy/ folder. Reel Law: never reads any other reel.
const storage = require('./sb-storage.js');
const SB_URL = process.env.SUPABASE_URL;
exports.handler = async () => {
  try{
    const r = await fetch(SB_URL+'/storage/v1/object/public/'+storage.BUCKET+'/jazzandteddy/manifest.json?cb='+Date.now(),{cache:'no-store'});
    if(!r.ok) return { statusCode:200, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}, body:'{"brands":{}}' };
    return { statusCode:200, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}, body: await r.text() };
  }catch(e){ return { statusCode:200, headers:{'Content-Type':'application/json'}, body:'{"brands":{}}' }; }
};
