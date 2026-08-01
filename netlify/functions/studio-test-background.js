// ============================================================================
// SparkMyName — GRAPHIC DESIGN DEPARTMENT · studio-test-background
// ----------------------------------------------------------------------------
// BACKGROUND function (up to 15 min). Generates ONE bespoke hero scene, then
// composites the brand NAME + WEBSITE on top as SHARP text into a PDF cover
// (renders reliably everywhere, previews inline in Gmail, savable/high-res),
// and emails it via Resend. No browser wait. Touches NO live engines.
// ============================================================================
var engine = require('./studio-engine.js');
var PDFLib = require('./vendor/pdf-lib.min.js');

var SAMPLE = {
  name: 'Ember & Oak', domain: 'emberoak.com', industry: 'upscale steakhouse',
  audience: 'diners seeking an indulgent, premium night out',
  tone: 'rich, warm, confident and indulgent',
  feel: 'a powerful, upscale, appetite-driven brand',
  palette: ['#1A1410', '#C5402B', '#E0A23B', '#3A2A22', '#8A6B45']
};

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
// Neutral base for brand OVERRIDES (so a dog groomer never inherits the tire shop's car/palette).
var NEUTRAL = { audience:'its ideal customers', tone:'premium, confident, modern', feel:'polished and aspirational' };
function slug(s){return String(s||'brand').replace(/[^a-z0-9]+/gi,'-').toLowerCase().replace(/^-|-$/g,'');}
function hexToRgb(h){ h=String(h||'#0B5FFF').replace('#',''); if(h.length===3)h=h.split('').map(function(c){return c+c;}).join(''); var n=parseInt(h,16); return {r:((n>>16)&255)/255,g:((n>>8)&255)/255,b:(n&255)/255}; }

async function toBytes(result){
  if(result.b64) return {bytes:Buffer.from(result.b64,'base64'), mime:result.mime||'image/png', b64:result.b64};
  if(result.url){ try{ var r=await fetch(result.url); var ab=await r.arrayBuffer(); var buf=Buffer.from(ab); return {bytes:buf, mime:'image/png', b64:buf.toString('base64')}; }catch(e){return null;} }
  return null;
}

// Build a report cover PDF: full-bleed hero + dark bottom scrim + sharp text.
async function coverPDF(brand, img){
  var PDFDocument=PDFLib.PDFDocument, StandardFonts=PDFLib.StandardFonts, rgb=PDFLib.rgb;
  var doc=await PDFDocument.create();
  var emb;
  try{ emb = (img.mime==='image/jpeg'||img.mime==='image/jpg') ? await doc.embedJpg(img.bytes) : await doc.embedPng(img.bytes); }
  catch(e){ try{ emb=await doc.embedJpg(img.bytes); }catch(e2){ emb=await doc.embedPng(img.bytes); } }
  var W=emb.width, H=emb.height;
  var page=doc.addPage([W,H]);
  page.drawImage(emb,{x:0,y:0,width:W,height:H});
  // bottom scrim for legibility (pdf-lib has no gradient; layered rects fake a fade)
  var band=H*0.40;
  for(var i=0;i<8;i++){ var op=0.10*(i+1)/8*1.9; page.drawRectangle({x:0,y:0,width:W,height:band*(1-i/9),color:rgb(0,0,0),opacity:Math.min(op,0.22)}); }
  var serif=await doc.embedFont(StandardFonts.TimesRomanBold);
  var sans=await doc.embedFont(StandardFonts.Helvetica);
  var sansB=await doc.embedFont(StandardFonts.HelveticaBold);
  var ac=hexToRgb((brand.palette&&brand.palette[1])||'#0B5FFF');
  var pad=W*0.06;
  // eyebrow (top)
  var eb='BRAND IDENTITY', ebSize=W*0.018;
  page.drawText(eb,{x:pad,y:H-pad-ebSize,size:ebSize,font:sansB,color:rgb(1,1,1),opacity:0.85,characterSpacing:ebSize*0.35});
  // name (big serif, lower area)
  var nameSize=W*0.082, nameY=H*0.115;
  page.drawText(String(brand.name),{x:pad-2,y:nameY,size:nameSize,font:serif,color:rgb(1,1,1)});
  // accent rule above name
  page.drawRectangle({x:pad,y:nameY+nameSize+H*0.022,width:W*0.07,height:Math.max(4,H*0.006),color:rgb(ac.r,ac.g,ac.b)});
  // website (below name)
  var domSize=W*0.030;
  page.drawText(String(brand.domain),{x:pad,y:nameY-domSize-H*0.012,size:domSize,font:sans,color:rgb(1,1,1),opacity:0.92,characterSpacing:domSize*0.06});
  var bytes=await doc.save();
  return Buffer.from(bytes).toString('base64');
}

async function emailResult(brand, result){
  var KEY=process.env.RESEND_API_KEY, FROM=process.env.RESEND_FROM||'SparkMyName <onboarding@resend.dev>';
  var to=brand._to||'peterkleinusa@gmail.com';
  if(!KEY) return {ok:false,error:'missing_resend_key'};
  var ok=result&&result.ok, img=ok?await toBytes(result):null;
  var coverB64=null, coverErr=null;
  if(img){ try{ coverB64=await coverPDF(brand,img); }catch(e){ coverErr=String(e&&e.message||e); } }
  var diag = ok
    ? ['Engine: <b>'+esc(result.engine)+'</b>',
       'Resolution: '+esc(result.res||'?')+' &middot; '+esc(result.aspect||'?'),
       'Time: '+result.ms+' ms','Est. cost: ~$'+(result.costEst||0).toFixed(3),
       (result.steppedDownFrom?'<b style="color:#b8860b">Stepped down from a higher model:</b> '+esc(JSON.stringify(result.steppedDownFrom).slice(0,300)):''),
       (result.fellBackFrom?'<b style="color:#b8860b">Fell back from Gemini:</b> '+esc(JSON.stringify(result.fellBackFrom).slice(0,300)):''),
       (coverErr?'<b style="color:#b00020">Cover build error:</b> '+esc(coverErr):'')]
    : ['<b style="color:#b00020">No image generated.</b>','Gemini: '+esc(JSON.stringify((result&&result.gemini)||result).slice(0,500)),
       (result&&result.openai?'OpenAI fallback: '+esc(JSON.stringify(result.openai).slice(0,500)):'')];
  var html='<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#16233a;max-width:600px">'
    +'<h2 style="margin:0 0 4px">SparkMyName Studio \u2014 report-cover preview</h2>'
    +'<div style="color:#5b6b86;margin-bottom:16px">'+esc(brand.name)+' &middot; '+esc(brand.industry)+' &middot; '+esc(brand.domain)+'</div>'
    +(img?'<div style="border-radius:12px;overflow:hidden;border:1px solid #e5e5ea"><img src="cid:hero" alt="generated hero scene" style="display:block;width:100%"/></div>':'')
    +(coverB64?'<p style="margin:14px 0 0;font-size:14px"><b>That is the raw AI scene above.</b> Open the attached <b>'+esc(slug(brand.name))+'-cover.pdf</b> \u2014 it is the same scene with <b>'+esc(brand.name)+'</b> and <b>'+esc(brand.domain)+'</b> laid on top as sharp text (perfectly spelled, every time). That is the top-of-report moment a customer opens. PDFs preview right here in Gmail.</p>':'')
    +'<div style="margin-top:16px;line-height:1.8;font-size:13.5px">'+diag.filter(Boolean).join('<br>')+'</div>'
    +'<div style="margin-top:16px;color:#9a9aa2;font-size:12px">Isolated graphic-engine test. Naming and delivery were not touched.</div></div>';
  var attachments=[];
  if(img) attachments.push({filename:slug(brand.name)+'-scene.png',content:img.b64,content_id:'hero'});
  if(coverB64) attachments.push({filename:slug(brand.name)+'-cover.pdf',content:coverB64});
  var body={from:FROM,to:[to],subject:(ok?'Studio cover \u2713 '+brand.name+' \u2014 '+result.engine+' '+result.ms+'ms':'Studio cover \u2717 '+brand.name+' \u2014 no image'),html:html};
  if(attachments.length) body.attachments=attachments;
  try{
    var r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
    var d=await r.json().catch(function(){return{};});
    if(r.status>=300||d.error) return {ok:false,status:r.status,error:(d.error&&(d.error.message||d.error))||'send_failed'};
    return {ok:true,id:d.id};
  }catch(e){return {ok:false,error:String(e&&e.message||e)};}
}

exports.handler = async function(event){
  var brand=Object.assign({},SAMPLE);
  try{ if(event&&event.body){var p=JSON.parse(event.body); if(p){ if(p.brand)brand=Object.assign({},NEUTRAL,p.brand); if(p.to)brand._to=p.to; } } }catch(e){}
  var prompt=engine.heroPrompt(brand);
  var result=await engine.generateImage(prompt, { aspectRatio:'16:9', imageSize:'2K' });
  var mail=await emailResult(brand,result);
  console.log('studio-test-background DONE:', JSON.stringify({brand:brand.name,ok:!!result.ok,engine:result.engine,ms:result.ms,emailed:mail.ok,emailErr:mail.error||null}));
  return { statusCode: 202 };
};
