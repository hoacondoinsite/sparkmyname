// ============================================================================
// SparkMyName — GRAPHIC DEPARTMENT · studio-batch  (fast trigger)
// ----------------------------------------------------------------------------
// Fires studio-batch-background (one trigger -> ~14 Pro 2K covers by email,
// over a few minutes). Returns instantly. Optional ?to=you@example.com
// ============================================================================
var BASE=(process.env.SITE_URL||process.env.URL||'').replace(/\/$/,'');

function page(to,fired,err){
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex">'
   +'<title>Studio batch test</title><style>'
   +'body{margin:0;background:#07172F;color:#E8EEF7;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;line-height:1.6}'
   +'.wrap{max-width:640px;margin:0 auto;padding:60px 24px}.ey{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#6FA0FF;font-weight:700}'
   +'h1{font-size:27px;margin:12px 0 8px}.acc{height:3px;width:54px;background:#0B5FFF;border-radius:2px;margin:0 0 22px}'
   +'p{color:#A9BBD6;font-size:15.5px}b{color:#E8EEF7}.card{background:#0C2447;border:1px solid #1C3B6B;border-radius:14px;padding:20px 22px;margin-top:18px}'
   +'.warn{background:#3a1216;border-color:#6b1f27;color:#ffd7da}</style></head><body><div class="wrap">'
   +'<div class="ey">SparkMyName Studio</div><h1>'+(fired?'Batch started \u2713':'Could not start the batch')+'</h1><div class="acc"></div>'
   +(fired
     ? '<p>Generating <b>14 cinematic Pro 2K covers</b> across mixed industries in the background. They will arrive as <b>individual emails</b> at <b>'+to.replace(/[<>&]/g,'')+'</b>, trickling in over about <b>5\u20137 minutes</b> (each cover takes ~25s).</p>'
       +'<div class="card"><p style="margin:0">Each email subject starts <b>"Studio cover \u2713 [Name]"</b> with the industry in parentheses, and includes the finished <b>-cover.pdf</b>. Watch them roll in; no need to refresh.</p></div>'
       +'<p style="margin-top:18px;font-size:13px;color:#7E93B5">Approx. cost for all 14: ~$1.90.</p>'
     : '<p>I could not trigger the batch.'+(err?' Error: <b>'+err.replace(/[<>&]/g,'')+'</b>':'')+'</p><div class="card warn"><p style="margin:0">Tell me this exact message and I\u2019ll fix it.</p></div>')
   +'</div></body></html>';
}

exports.handler = async function(event){
  var host=(event&&event.headers&&(event.headers.host||event.headers.Host))||'';
  var base=BASE||(host?('https://'+host):'https://sparkmyname.netlify.app');
  var to=(event&&event.queryStringParameters&&event.queryStringParameters.to)||'peterkleinusa@gmail.com';
  var fired=false,err=null;
  try{
    var r=await fetch(base+'/.netlify/functions/studio-batch-background',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:to})});
    fired=(r.status===202||r.ok); if(!fired) err='trigger returned status '+r.status;
  }catch(e){ err=String(e&&e.message||e); }
  return {statusCode:200,headers:{'Content-Type':'text/html; charset=utf-8'},body:page(to,fired,err)};
};
