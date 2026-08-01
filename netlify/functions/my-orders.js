// MY-ORDERS (Phase 2): the client's own order tracker feed.
// POST {access_token} -> orders for the signed-in email.
// CAPSULE ACCESS (Founder order, 2026-07-23): POST {r} -> orders for that report only.
// The report key is the credential — the exact trust model report-data already grants.
'use strict';
const SB_URL=process.env.SUPABASE_URL, SB_SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON=process.env.SUPABASE_ANON_KEY||process.env.SMN_SUPABASE_ANON_KEY||'';
exports.handler=async(event)=>{
  if(event.httpMethod!=='POST') return resp(405,{orders:[]});
  let tok='',rkey=''; try{const b=JSON.parse(event.body||'{}');tok=String(b.access_token||'').trim();rkey=String(b.r||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64);}catch(e){}
  let filter='';
  if(tok){
    let email='';
    try{const u=await fetch(SB_URL+'/auth/v1/user',{headers:{'apikey':SB_ANON,'Authorization':'Bearer '+tok}});
      if(!u.ok) return resp(401,{orders:[]}); email=String((await u.json()).email||'').toLowerCase();}catch(e){return resp(401,{orders:[]});}
    if(!email) return resp(401,{orders:[]});
    filter='email=eq.'+encodeURIComponent(email);
  } else if(rkey){
    filter='report=eq.'+encodeURIComponent(rkey);
  } else return resp(400,{orders:[]});
  try{
    const base=SB_URL+'/rest/v1/smn_orders?'+filter+'&order=created_at.desc&limit=60&select=';
    let g=await fetch(base+'id,item_name,brand,status,created_at,assets',{headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE}});
    if(!g.ok) g=await fetch(base+'id,item_name,brand,status,created_at',{headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE}}); // assets column may not exist yet
    if(!g.ok) return resp(200,{orders:[]});
    return resp(200,{orders:await g.json()});
  }catch(e){ return resp(200,{orders:[]}); }
};
function resp(code,obj){return {statusCode:code,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(obj)};}
