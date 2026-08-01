// FAV-TOGGLE (2026-07-22, Command Center 2026): sets the favorite flag on the
// logged-in client's own report. POST {access_token, r, fav} -> {ok}
// Auth: the Supabase access token is verified against auth/v1/user; the update
// is scoped to id + the verified email, so nobody can touch another client's row.
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405,{error:'method'});
  if (!SB_URL || !SB_SERVICE) return resp(500,{error:'not_configured'});
  let tok='', r='', fav=false;
  try { const b=JSON.parse(event.body||'{}');
    tok=String(b.access_token||'').trim();
    if(!tok){ const h=event.headers.authorization||event.headers.Authorization||''; if(/^Bearer /.test(h)) tok=h.slice(7).trim(); }
    r=String(b.r||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64);
    fav=!!b.fav;
  } catch(e){}
  if(!tok||!r) return resp(400,{error:'missing_fields'});
  try{
    const u=await fetch(SB_URL+'/auth/v1/user',{headers:{'apikey':SB_ANON,'Authorization':'Bearer '+tok}});
    if(!u.ok) return resp(401,{error:'auth'});
    const user=await u.json();
    const email=(user&&user.email||'').toLowerCase();
    if(!email) return resp(401,{error:'auth'});
    const q=SB_URL+'/rest/v1/reports?id=eq.'+encodeURIComponent(r)+'&email=eq.'+encodeURIComponent(email);
    const p=await fetch(q,{method:'PATCH',headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({favorite:fav})});
    if(!p.ok) return resp(500,{error:'update'});
    return resp(200,{ok:true,fav:fav});
  }catch(e){ return resp(500,{error:'server'}); }
};
function resp(code,obj){return {statusCode:code,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(obj)};}
