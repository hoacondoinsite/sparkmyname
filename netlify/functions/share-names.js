// share-names.js — email a customer's saved brand shortlist to one or more people.
// Zero npm dependencies (works with Netlify Drop). Mirrors send-kit.js's Resend usage.
// Env: RESEND_API_KEY (required), RESEND_FROM (optional; verified domain to email anyone).
const KEY  = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s){ return String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function resp(code,obj){ return { statusCode:code,
  headers:{ 'Content-Type':'application/json','access-control-allow-origin':'*' },
  body:JSON.stringify(obj) }; }


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
  if (event.httpMethod !== 'POST') return resp(405,{ ok:false, error:'method' });
  if (!KEY) return resp(500,{ ok:false, error:'no_resend_key' });

  let b={};
  try { b = JSON.parse(event.body || '{}'); } catch(e){ return resp(400,{ ok:false, error:'bad_json' }); }

  const sender = String(b.sender||'').slice(0,80).trim();
  const note   = String(b.note||'').slice(0,800).trim();
  let reportUrl = String(b.reportUrl||'').slice(0,400);
  if (!/^https?:\/\//.test(reportUrl)) reportUrl = '';

  let rec = b.recipients;
  if (typeof rec === 'string') rec = rec.split(',');
  if (!Array.isArray(rec)) rec = [];
  const seen = {}; const recipients = [];
  rec.map(function(x){ return String(x||'').trim(); })
     .filter(function(x){ return EMAIL_RE.test(x); })
     .forEach(function(e){ const k=e.toLowerCase(); if(!seen[k]){ seen[k]=1; recipients.push(e); } });
  const list = recipients.slice(0,10);
  if (!list.length) return resp(400,{ ok:false, error:'no_valid_recipients' });

  let items = Array.isArray(b.items) ? b.items.slice(0,12) : [];
  items = items.map(function(it){ return {
    name: String(it&&it.name||'').slice(0,120),
    domain: String(it&&it.domain||'').slice(0,120),
    tagline: String(it&&it.tagline||'').slice(0,200),
    available: !!(it&&it.available===true)
  }; }).filter(function(it){ return it.name; });
  if (!items.length) return resp(400,{ ok:false, error:'no_items' });

  const html = buildShareEmail(sender, note, items, reportUrl);
  const subject = (sender ? (sender + ' shared brand names with you')
                          : 'Someone shared brand names with you') + ' \u2014 SparkMyName\u2122';

  let sent=0, failed=0;
  for (let i=0;i<list.length;i++){
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers:{ 'Authorization':'Bearer '+KEY, 'Content-Type':'application/json' },
        body: JSON.stringify({ from: FROM, to:[list[i]], subject: subject, text: plainTextFrom(html), html: html })
      });
      if (r.ok) sent++; else failed++;
    } catch(e){ failed++; }
  }
  if (!sent) return resp(502,{ ok:false, error:'send_failed' });
  return resp(200,{ ok:true, sent: sent, failed: failed });
};

function buildShareEmail(sender, note, items, reportUrl){
  const NAVY='#07172F', BLUE='#0B5FFF', INK='#0E1726', MUTED='#3F4D63', LINE='#D7E5F5', GREEN='#147A3D';
  const SANS="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  const rows = items.map(function(it){
    return '<tr><td style="padding:14px 0;border-bottom:1px solid '+LINE+';">'
      + '<div style="font:800 18px/1.2 '+SANS+';color:'+INK+';letter-spacing:-.02em;">'+esc(it.name)+'</div>'
      + (it.domain ? ('<div style="font:700 13px/1.4 '+SANS+';color:'+INK+';margin-top:4px;">'+esc(it.domain)
          + (it.available ? (' <span style="color:'+GREEN+';font-weight:800;">Available</span>') : '') + '</div>') : '')
      + (it.tagline ? ('<div style="font:400 14px/1.5 '+SANS+';color:'+MUTED+';margin-top:6px;">\u201c'+esc(it.tagline)+'\u201d</div>') : '')
      + '</td></tr>';
  }).join('');
  const noteBlock = note ? ('<div style="background:#F7FBFF;border:1px solid '+LINE+';border-radius:12px;padding:14px 16px;font:400 15px/1.6 '+SANS+';color:'+INK+';margin:0 0 18px;">'+esc(note).replace(/\n/g,'<br>')+'</div>') : '';
  const who = sender ? (esc(sender)+' picked out these brand names and wanted you to see them.')
                     : 'Someone picked out these brand names and wanted you to see them.';
  const cta = reportUrl ? ('<div style="margin:22px 0 0;"><a href="'+esc(reportUrl)+'" style="display:inline-block;background:'+BLUE+';color:#fff;text-decoration:none;font:800 15px/1 '+SANS+';padding:14px 22px;border-radius:999px;">See the full brand</a></div>') : '';
  return '<div style="max-width:600px;margin:0 auto;padding:28px 24px;font-family:'+SANS+';">'
    + '<div style="font:800 18px/1 '+SANS+';color:'+INK+';margin-bottom:22px;">Spark<span style="color:'+BLUE+';">MyName</span>\u2122</div>'
    + '<div style="font:800 24px/1.15 '+SANS+';color:'+NAVY+';letter-spacing:-.02em;margin:0 0 10px;">Brand names, picked just for you.</div>'
    + '<div style="font:400 15px/1.6 '+SANS+';color:'+MUTED+';margin:0 0 18px;">'+who+'</div>'
    + noteBlock
    + '<table style="width:100%;border-collapse:collapse;">'+rows+'</table>'
    + cta
    + '<div style="margin:28px 0 0;padding-top:16px;border-top:1px solid '+LINE+';font:400 12px/1.5 '+SANS+';color:'+MUTED+';">'
    +   'Brand concepts are for informational purposes only and are not legal, trademark, business-formation, or domain-registration advice.<br>'
    +   '\u00a9 2026 SparkMyName\u2122. Owned by VORREX IGNITE LLC. All rights reserved. U.S. Patent Pending (App. 19/704,386).'
    + '</div></div>';
}
