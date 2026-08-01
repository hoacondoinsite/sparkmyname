// ============================================================================
// SparkMyName — GRAPHIC DESIGN DEPARTMENT · studio-test  (fast trigger)
// ----------------------------------------------------------------------------
// Returns INSTANTLY (no 502). Fires studio-test-background, which generates the
// hero, composites the report cover, and emails it. Check email in ~30-60s.
// Optional overrides:  ?name=Bark+Avenue&domain=barkavenue.com&industry=dog+grooming
//                      ?to=you@example.com
// ============================================================================
var BASE=(process.env.SITE_URL||process.env.URL||'').replace(/\/$/,'');

function page(label, to, fired, err){
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
   +'<meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex">'
   +'<title>Studio cover test \u2014 started</title><style>'
   +'body{margin:0;background:#07172F;color:#E8EEF7;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;line-height:1.6}'
   +'.wrap{max-width:620px;margin:0 auto;padding:60px 24px}'
   +'.ey{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#6FA0FF;font-weight:700}'
   +'h1{font-size:27px;margin:12px 0 8px}.acc{height:3px;width:54px;background:#0B5FFF;border-radius:2px;margin:0 0 22px}'
   +'p{color:#A9BBD6;font-size:15.5px}b{color:#E8EEF7}'
   +'.card{background:#0C2447;border:1px solid #1C3B6B;border-radius:14px;padding:20px 22px;margin-top:18px}'
   +'.warn{background:#3a1216;border-color:#6b1f27;color:#ffd7da}</style></head><body><div class="wrap">'
   +'<div class="ey">SparkMyName Studio</div><h1>'+(fired?'Test started \u2713':'Could not start the test')+'</h1><div class="acc"></div>'
   +(fired
      ? '<p>Generating a bespoke <b>'+label+'</b> report cover in the background \u2014 the hero scene <b>plus the name and website laid on top, sharp</b>. '
        +'It will arrive by email at <b>'+to.replace(/[<>&]/g,'')+'</b> in about <b>30\u201360 seconds</b>.</p>'
        +'<div class="card"><p style="margin:0">The email shows the raw scene inline, and the finished cover is attached as an <b>.svg</b> file \u2014 open it to see the real top-of-report moment with the name perfectly spelled.</p></div>'
        +'<p style="margin-top:18px;font-size:13px;color:#7E93B5">No need to refresh. Just check your inbox.</p>'
      : '<p>I could not trigger the background job.'+(err?' Error: <b>'+err.replace(/[<>&]/g,'')+'</b>':'')+'</p><div class="card warn"><p style="margin:0">Tell me this exact message and I\u2019ll fix it.</p></div>')
   +'</div></body></html>';
}

exports.handler = async function(event){
  var q=(event&&event.queryStringParameters)||{};
  var host=(event&&event.headers&&(event.headers.host||event.headers.Host))||'';
  var base=BASE||(host?('https://'+host):'https://sparkmyname.netlify.app');
  var to=q.to||'peterkleinusa@gmail.com';
  var brand=null;
  if(q.name||q.domain||q.industry){ brand={}; if(q.name)brand.name=q.name; if(q.domain)brand.domain=q.domain; if(q.industry)brand.industry=q.industry; }
  var label=(brand&&brand.name)||'Ember & Oak';
  var payload={to:to}; if(brand)payload.brand=brand;
  var fired=false, err=null;
  try{
    var r=await fetch(base+'/.netlify/functions/studio-test-background',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    fired=(r.status===202||r.ok); if(!fired) err='trigger returned status '+r.status;
  }catch(e){ err=String(e&&e.message||e); }
  return {statusCode:200,headers:{'Content-Type':'text/html; charset=utf-8'},body:page(label,to,fired,err)};
};
