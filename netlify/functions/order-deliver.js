// ORDER-DELIVER (Phase 2, Founder tool) — GROUP DELIVERY upgrade (Founder order, 2026-07-23).
// POST {key, id} (single, backward compatible) or {key, ids:[...]} (a finished batch).
// Marks every order delivered, then sends ONE email per client that:
//   1) names EACH custom-made piece,
//   2) speaks in the warm Spark voice ("we're rooting for your idea"),
//   3) carries the CAPSULE — a one-tap, no-sign-in link straight into their workspace
//      (workspace.html?r=REPORT — the report key is the credential, same model as the kit email).
// key = ORDER_START_KEY (same founder key family as the art tools).
'use strict';
const SB_URL=process.env.SUPABASE_URL, SB_SERVICE=process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEY=process.env.ORDER_START_KEY||'';
const RESEND=process.env.RESEND_API_KEY, FROM=process.env.RESEND_FROM||'SparkMyName <hello@sparkmyname.com>';
const SITE=(process.env.SITE_URL||process.env.URL||'https://sparkmyname.netlify.app').replace(/\/$/,'');

/* PLAIN TEXT ALTERNATIVE (2026-07-26).
   Every email here was HTML only. That costs twice: spam filters treat a single-part HTML mail
   as a weaker signal than a proper multipart one, and a reader on a text-only client — or a
   screen reader set to plain text — gets nothing at all. send-kit.js already did this; the rest
   did not. The text is derived from the HTML that was actually sent, so the two cannot drift
   apart the way a hand-written second copy would. */
function plainTextFrom(html, fallbackUrl) {
  var t = String(html || '');
  t = t.replace(/<style[\s\S]*?<\/style>/gi, '');
  t = t.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
        function (m, href, label) {
          var clean = String(label).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
          /* a newline after the URL, or the link runs into whatever follows it:
             "...?r=abc123No sign-in needed." */
          return (clean ? (clean + ': ' + href) : href) + '\n';
        });
  t = t.replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n');
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<[^>]+>/g, '');
  t = t.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>').replace(/&mdash;/g, '—').replace(/&hellip;/g, '…')
       .replace(/&rsquo;/g, "'").replace(/&#8217;/g, "'").replace(/&quot;/g, '"');
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (fallbackUrl && t.indexOf(fallbackUrl) < 0) t += '\n\n' + fallbackUrl;
  return t || (fallbackUrl || 'Open your workspace at https://sparkmyname.com/');
}

exports.handler=async(event)=>{
  if(event.httpMethod!=='POST') return resp(405,{ok:false});
  let b={}; try{b=JSON.parse(event.body||'{}');}catch(e){}
  if(!KEY||String(b.key||'')!==KEY) return resp(401,{ok:false});
  const clean=(v)=>String(v||'').replace(/[^a-zA-Z0-9_]/g,'').slice(0,64);
  const items=(Array.isArray(b.items)?b.items:[]).map(it=>({id:clean(it&&it.id),assets:(Array.isArray(it&&it.assets)?it.assets:[]).map(u=>String(u||'').slice(0,600)).filter(u=>/^https?:\/\//.test(u)).slice(0,24)})).filter(it=>it.id);
  const ids=(items.length?items.map(it=>it.id):(Array.isArray(b.ids)?b.ids:[b.id]).map(clean)).filter(Boolean).slice(0,60);
  if(!ids.length) return resp(400,{ok:false});
  try{
    const inList='in.('+ids.map(i=>'"'+i+'"').join(',')+')';
    const g=await fetch(SB_URL+'/rest/v1/smn_orders?id='+encodeURIComponent(inList)+'&select=id,email,item_name,brand,report',{headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE}});
    const rows=g.ok?await g.json():[];
    await fetch(SB_URL+'/rest/v1/smn_orders?id='+encodeURIComponent(inList),{method:'PATCH',headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({status:'delivered',delivered_at:new Date().toISOString()})});
    // Attach the finished artifact URLs to each order (best-effort per row — a missing
    // column can never block the delivery or the email).
    for(const it of items){ if(!it.assets.length) continue;
      try{ await fetch(SB_URL+'/rest/v1/smn_orders?id=eq.'+it.id,{method:'PATCH',headers:{'apikey':SB_SERVICE,'Authorization':'Bearer '+SB_SERVICE,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({assets:it.assets})}); }catch(e){}
    }
    // Group by client so a finished batch arrives as ONE email, never a drip.
    const byEmail={};
    rows.forEach(o=>{ if(!o||!o.email) return; (byEmail[o.email]=byEmail[o.email]||[]).push(o); });
    if(RESEND){
      for(const email of Object.keys(byEmail)){
        const os=byEmail[email];
        const brand=esc(os[0].brand||'your brand');
        const rkey=String(os.map(o=>o.report).filter(Boolean)[0]||'');
        const capsule=rkey?(SITE+'/workspace.html?r='+encodeURIComponent(rkey)):(SITE+'/account.html');
        const list=os.map(o=>'<li style="margin:6px 0"><b>'+esc(o.item_name||'Custom piece')+'</b></li>').join('');
        const many=os.length>1;
        const subject=many?('Custom-made and ready — '+os.length+' new pieces for '+(os[0].brand||'your brand')):('Custom-made and ready — '+(os[0].item_name||'your new piece'));
        const html='<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#F0F7F3;"><div style="font-family:Inter,Arial,sans-serif;max-width:560px;color:#14161A">'
          +'<h2 style="margin:0 0 8px">Custom-made for you. Ready now.</h2>'
          +'<p>'+(many?'These pieces were':'This piece was')+' custom-made for <b>'+brand+'</b> and '+(many?'are':'is')+' waiting in your free online workspace:</p>'
          +'<ul style="padding-left:20px;margin:10px 0 18px">'+list+'</ul>'
          +'<p style="margin:0 0 18px"><a href="'+capsule+'" style="display:inline-block;background:linear-gradient(96deg,#189850,#189850);color:#FFFFFF;text-decoration:none;font-weight:800;padding:14px 26px;border-radius:12px">Open your workspace — no sign-in needed</a></p>'
          +'<p style="color:#565664">Everything is yours to view, download, and share. Spark is rooting for you — we want your idea to succeed, and we\u2019re glad to be part of it.</p>'
          +'<p style="color:#889;font-size:12px">© 2026 SparkMyName\u2122. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).</p></div>';
        await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+RESEND,'Content-Type':'application/json'},
          body:JSON.stringify({from:FROM,to:[email],subject:subject,text: plainTextFrom(html), html:html})});
      }
    }
    return resp(200,{ok:true,delivered:ids.length,emails:Object.keys(byEmail).length});
  }catch(e){ return resp(500,{ok:false}); }
};
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function resp(code,obj){return {statusCode:code,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(obj)};}
