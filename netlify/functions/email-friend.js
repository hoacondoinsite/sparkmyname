// email-friend.js — Studio "Email a Friend" (2026-07-03). Token-gated Resend referral.
// Security: requires a valid customer session token (verified against Supabase exactly like
// my-reports), one recipient per call — never an open relay. Failure-safe: any error returns
// ok:false and your workspace falls back to the visitor's own mail client.
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
const SB_URL = process.env.SUPABASE_URL;
const SB_ANON = process.env.SUPABASE_ANON_KEY || process.env.SMN_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

exports.handler = async (event) => {
  const resp=(c,o)=>({statusCode:c,headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});
  if (event.httpMethod !== 'POST') return resp(405,{ok:false,error:'method'});
  if (!KEY || !SB_URL) return resp(200,{ok:false,error:'not_configured'});
  let token='',to='';
  try{ const b=JSON.parse(event.body||'{}'); token=(b.access_token||'').slice(0,4000); to=String(b.to||'').trim().slice(0,120); }catch(e){}
  if(!token) return resp(200,{ok:false,error:'no_token'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) return resp(200,{ok:false,error:'bad_email'});
  // Verify the sender is a real signed-in customer.
  let sender='';
  try{
    const u=await fetch(SB_URL+'/auth/v1/user',{headers:{'Authorization':'Bearer '+token,'apikey':SB_ANON}});
    if(u.status>=300) return resp(200,{ok:false,error:'bad_token'});
    const user=await u.json(); sender=(user&&user.email)?String(user.email):'';
  }catch(e){ return resp(200,{ok:false,error:'verify_failed'}); }
  if(!sender) return resp(200,{ok:false,error:'no_sender'});
  const site='https://sparkmyname.com/';
  const esc=(t)=>String(t).replace(/[<>&]/g,'');
  const html = '<div style="font:15px/1.65 Arial,Helvetica,sans-serif;color:#F2F6FF;max-width:540px;margin:0 auto">'
    + '<p style="font-size:20px;font-weight:800;margin:0 0 6px">A friend thinks you\u2019re building something.</p>'
    + '<p style="margin:0 0 14px">' + esc(sender) + ' \u2014 one of our clients \u2014 thought of you and asked us to send this along.</p>'
    + '<p style="margin:0 0 14px"><b>SparkMyName\u2122</b> gives your business its name and look. Tell us what you\u2019re building, and the same day you get names with web addresses you can buy, a logo, colors, taglines \u2014 a complete brand, ready to use.</p>'
    + '<p style="margin:0 0 20px">No calls, no contracts, no code \u2014 $29, one time, no subscription.</p>'
    + '<p style="margin:0 0 24px"><a href="' + site + '" style="display:inline-block;background:#7C5CFF;color:#fff;font-weight:800;text-decoration:none;border-radius:999px;padding:14px 26px">See what your brand could look like \u2192</a></p>'
    + '<p style="font-size:12px;color:#AFC2E1;margin:22px 0 0;border-top:1px solid #24365E;padding-top:12px">You received this one-time note because ' + esc(sender) + ' referred you. We won\u2019t email you again unless you ask us to. To make sure of it, just reply with the word <b>unsubscribe</b>.<br>SparkMyName\u2122 \u00b7 Owned by VORREX IGNITE LLC \u00b7 U.S. Patent Pending (App. 19/704,386)</p></div>';
  try{
    const r=await fetch('https://api.resend.com/emails',{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEY},
      body:JSON.stringify({from:FROM,to:[to],reply_to:sender,subject:sender.split('@')[0]+' thought you\u2019d like SparkMyName\u2122',text: plainTextFrom(html), html:html})});
    if(r.status>=300) return resp(200,{ok:false,error:'send_failed'});
    return resp(200,{ok:true});
  }catch(e){ return resp(200,{ok:false,error:'send_exception'}); }
};
