// ORDER-REQUEST (Command Center 2026 Phase 2, 2026-07-22)
// A signed-in client orders one catalog item — free with their $99 package.
// POST {access_token, r, brand, item, itemName, fields:{...}}
//  -> verifies the token, records the order in smn_orders (best-effort),
//     emails the client a confirmation and the Founder a copy, returns {ok, id, stored}.
// Zero-loss design: even if the table is missing, the emails still carry the order.
'use strict';
const SB_URL = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || '';
const RESEND = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <hello@sparkmyname.com>';
const FOUNDER = process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405,{ok:false});
  let b={}; try{ b=JSON.parse(event.body||'{}'); }catch(e){}
  const tok=String(b.access_token||'').trim();
  const item=String(b.item||'').slice(0,60), itemName=String(b.itemName||'').slice(0,120);
  const brand=String(b.brand||'').slice(0,120), r=String(b.r||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64);
  const fields=(b.fields&&typeof b.fields==='object')?b.fields:{};
  if(!item||!itemName||(!tok&&!r)) return resp(400,{ok:false,err:'missing'});
  let email='';
  if(tok){
    try{
      const u=await fetch(SB_URL+'/auth/v1/user',{headers:{'apikey':SB_ANON,'Authorization':'Bearer '+tok}});
      if(!u.ok) return resp(401,{ok:false,err:'auth'});
      email=String((await u.json()).email||'').toLowerCase();
    }catch(e){ return resp(401,{ok:false,err:'auth'}); }
    if(!email) return resp(401,{ok:false,err:'auth'});
  } else {
    // CAPSULE PATH (repaired 2026-07-24): the unguessable report key IS the credential —
    // the same trust model report-data and my-orders already grant. Validate the key
    // against the reports table; pick up the client email if that column exists.
    try{
      let q=await fetch(SB_URL+'/rest/v1/reports?id=eq.'+encodeURIComponent(r)+'&select=id,email&limit=1',{headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE}});
      if(!q.ok) q=await fetch(SB_URL+'/rest/v1/reports?id=eq.'+encodeURIComponent(r)+'&select=id&limit=1',{headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE}}); // email column may not exist
      const rows=q.ok?await q.json():[];
      if(!rows.length) return resp(401,{ok:false,err:'auth'});
      email=String((rows[0]&&rows[0].email)||'').toLowerCase(); // may be '' — order still records; Founder copy still sends
    }catch(e){ return resp(401,{ok:false,err:'auth'}); }
  }
  const id='ord_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const nowIso=new Date().toISOString();
  let stored=false;
  try{
    const p=await fetch(SB_URL+'/rest/v1/smn_orders',{method:'POST',headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({id:id,email:email,report:r,brand:brand,item:item,item_name:itemName,fields:fields,status:'received',created_at:nowIso})});
    stored=p.ok;
  }catch(e){}
  const fieldLines=Object.keys(fields).map(k=>`<tr><td style="padding:4px 12px 4px 0;color:#556;font-size:13px">${escapeH(k)}</td><td style="padding:4px 0;font-size:13px"><b>${escapeH(String(fields[k]).slice(0,300))}</b></td></tr>`).join('');
  const table=fieldLines?`<table style="margin:10px 0">${fieldLines}</table>`:'';
  try{
    if(RESEND){
      if(email) await sendMail(email,`Order received — ${itemName} for ${brand}`,
        `<div style="font-family:Inter,Arial,sans-serif;max-width:560px"><h2 style="margin:0 0 8px">We've got it.</h2>
        <p>Your <b>${escapeH(itemName)}</b> for <b>${escapeH(brand)}</b> is in the kitchen — custom-built for you and delivered to your free online workspace within 24 hours. We'll email you the moment it's ready.</p>
        ${table}<p style="color:#667;font-size:12.5px">Included with your Business in a Box — no extra charge. Order ${id}.</p>
        <p style="color:#889;font-size:12px">© 2026 SparkMyName\u2122. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).</p></div>`);
      await sendMail(FOUNDER,`[ORDER] ${itemName} — ${brand} (${email})`,
        `<div style="font-family:Inter,Arial,sans-serif"><p><b>${escapeH(itemName)}</b> (${escapeH(item)}) for <b>${escapeH(brand)}</b><br>Client: ${escapeH(email)} · report ${escapeH(r)} · ${id} · stored:${stored}</p>${table}</div>`);
    }
  }catch(e){}
  return resp(200,{ok:true,id:id,stored:stored});
};
async function sendMail(to,subject,html){
  await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+RESEND,'Content-Type':'application/json'},
    body:JSON.stringify({from:FROM,to:[to],subject:subject,html:html})});
}
function escapeH(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function resp(code,obj){return {statusCode:code,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(obj)};}
