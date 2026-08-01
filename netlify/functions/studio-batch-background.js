// ============================================================================
// SparkMyName — GRAPHIC DEPARTMENT · studio-batch-background
// ----------------------------------------------------------------------------
// BACKGROUND function (up to 15 min). Generates a Pro 2K cinematic cover for a
// PRESET list of stress-test brands (mixed easy/tough categories) and emails
// each one separately. One trigger -> ~14 covers. Isolated; live engines untouched.
// ============================================================================
var engine = require('./studio-engine.js');
var PDFLib = require('./vendor/pdf-lib.min.js');

var BRANDS = [
  { name:'Jet Force Clean', domain:'jetforceclean.com', industry:'pressure washing service' },
  { name:'Charter Edge Consulting', domain:'charteredge.co', industry:'business strategy consulting for founders' },
  { name:'Accident Allies', domain:'accidentallies.net', industry:'personal injury law practice' },
  { name:'Bark Avenue', domain:'barkavenue.com', industry:'dog grooming',
    subject:'a magnificent, freshly-groomed boxer dog as the hero, calm and dignified, looking directly and warmly into the camera' },
  { name:'Fluff & Co', domain:'fluffandco.com', industry:'dog grooming',
    subject:'an adorable, freshly-groomed white Maltese dog as the hero, fluffy and pristine, looking sweetly into the camera' },
  { name:'Pipe & Co Plumbing', domain:'pipeandco.com', industry:'plumbing service' },
  { name:'Northwind HVAC', domain:'northwindhvac.com', industry:'HVAC heating and cooling service' },
  { name:'Bright Hill Dental', domain:'brighthilldental.com', industry:'modern dental practice' },
  { name:'Sentinel Grid', domain:'sentinelgrid.io', industry:'cybersecurity firm' },
  { name:'Forge Method', domain:'forgemethod.com', industry:'fitness coaching studio' },
  { name:'ReadyHand Home Services', domain:'readyhand.com', industry:'handyman home services' },
  { name:'Signal Room', domain:'signalroom.fm', industry:'podcast show' },
  { name:'Nova Vale', domain:'novavale.com', industry:'lifestyle influencer creator brand' },
  { name:'Atlas Reign', domain:'atlasreign.com', industry:'travel and fitness influencer creator brand' }
];

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function slug(s){return String(s||'brand').replace(/[^a-z0-9]+/gi,'-').toLowerCase().replace(/^-|-$/g,'');}
function hexToRgb(h){h=String(h||'#0B5FFF').replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c;}).join('');var n=parseInt(h,16);return {r:((n>>16)&255)/255,g:((n>>8)&255)/255,b:(n&255)/255};}

async function toBytes(result){
  if(result.b64) return {bytes:Buffer.from(result.b64,'base64'),mime:result.mime||'image/png',b64:result.b64};
  if(result.url){ try{var r=await fetch(result.url);var ab=await r.arrayBuffer();var b=Buffer.from(ab);return {bytes:b,mime:'image/png',b64:b.toString('base64')};}catch(e){return null;} }
  return null;
}
async function coverPDF(brand,img){
  var PDFDocument=PDFLib.PDFDocument,StandardFonts=PDFLib.StandardFonts,rgb=PDFLib.rgb;
  var doc=await PDFDocument.create();
  var emb;
  try{ emb=(img.mime==='image/jpeg'||img.mime==='image/jpg')?await doc.embedJpg(img.bytes):await doc.embedPng(img.bytes); }
  catch(e){ try{emb=await doc.embedJpg(img.bytes);}catch(e2){emb=await doc.embedPng(img.bytes);} }
  var W=emb.width,H=emb.height,page=doc.addPage([W,H]);
  page.drawImage(emb,{x:0,y:0,width:W,height:H});
  var band=H*0.40;
  for(var i=0;i<8;i++){var op=0.10*(i+1)/8*1.9;page.drawRectangle({x:0,y:0,width:W,height:band*(1-i/9),color:rgb(0,0,0),opacity:Math.min(op,0.22)});}
  var serif=await doc.embedFont(StandardFonts.TimesRomanBold);
  var sans=await doc.embedFont(StandardFonts.Helvetica);
  var sansB=await doc.embedFont(StandardFonts.HelveticaBold);
  var ac=hexToRgb((brand.palette&&brand.palette[1])||'#C5402B');
  var pad=W*0.06;
  var ebSize=W*0.018;
  page.drawText('BRAND IDENTITY',{x:pad,y:H-pad-ebSize,size:ebSize,font:sansB,color:rgb(1,1,1),opacity:0.85,characterSpacing:ebSize*0.35});
  var nameSize=W*0.075,nameY=H*0.115;
  page.drawText(String(brand.name),{x:pad-2,y:nameY,size:nameSize,font:serif,color:rgb(1,1,1)});
  page.drawRectangle({x:pad,y:nameY+nameSize+H*0.022,width:W*0.07,height:Math.max(4,H*0.006),color:rgb(ac.r,ac.g,ac.b)});
  var domSize=W*0.028;
  page.drawText(String(brand.domain),{x:pad,y:nameY-domSize-H*0.012,size:domSize,font:sans,color:rgb(1,1,1),opacity:0.92,characterSpacing:domSize*0.06});
  return Buffer.from(await doc.save()).toString('base64');
}
async function emailOne(to,brand,result){
  var KEY=process.env.RESEND_API_KEY,FROM=process.env.RESEND_FROM||'SparkMyName <onboarding@resend.dev>';
  if(!KEY) return {ok:false,error:'missing_resend_key'};
  var ok=result&&result.ok,img=ok?await toBytes(result):null,cover=null,coverErr=null;
  if(img){ try{cover=await coverPDF(brand,img);}catch(e){coverErr=String(e&&e.message||e);} }
  var diag = ok
    ? 'Engine: <b>'+esc(result.engine)+'</b> &middot; '+esc(result.res||'?')+' '+esc(result.aspect||'')+' &middot; '+result.ms+' ms &middot; ~$'+(result.costEst||0).toFixed(3)+(coverErr?' &middot; cover err: '+esc(coverErr):'')
    : '<b style="color:#b00020">No image.</b> '+esc(JSON.stringify((result&&result.gemini)||result).slice(0,400));
  var html='<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#16233a;max-width:600px">'
    +'<div style="color:#0B5FFF;font-weight:700;font-size:12px;letter-spacing:.12em">STRESS TEST &middot; '+esc(brand.industry)+'</div>'
    +'<h2 style="margin:4px 0 12px">'+esc(brand.name)+' <span style="color:#5b6b86;font-weight:400;font-size:14px">'+esc(brand.domain)+'</span></h2>'
    +(img?'<div style="border-radius:12px;overflow:hidden;border:1px solid #e5e5ea"><img src="cid:hero" style="display:block;width:100%"/></div>'
         +(cover?'<p style="margin:12px 0 0;font-size:13.5px">Open the attached <b>'+esc(slug(brand.name))+'-cover.pdf</b> for the finished cover with the name on top.</p>':''):'')
    +'<div style="margin-top:12px;font-size:12.5px;color:#5b6b86">'+diag+'</div></div>';
  var att=[];
  if(img) att.push({filename:slug(brand.name)+'-scene.png',content:img.b64,content_id:'hero'});
  if(cover) att.push({filename:slug(brand.name)+'-cover.pdf',content:cover});
  var body={from:FROM,to:[to],subject:(ok?'Studio cover \u2713 '+brand.name+' ('+brand.industry+')':'Studio cover \u2717 '+brand.name),html:html};
  if(att.length) body.attachments=att;
  try{
    var r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
    var d=await r.json().catch(function(){return{};});
    if(r.status>=300||d.error) return {ok:false,status:r.status,error:(d.error&&(d.error.message||d.error))||'send_failed'};
    return {ok:true,id:d.id};
  }catch(e){return {ok:false,error:String(e&&e.message||e)};}
}

exports.handler = async function(event){
  var to='peterkleinusa@gmail.com';
  try{ if(event&&event.body){var p=JSON.parse(event.body); if(p&&p.to)to=p.to;} }catch(e){}
  for(var i=0;i<BRANDS.length;i++){
    var brand=BRANDS[i];
    try{
      var prompt=engine.heroPrompt(brand);
      var result=await engine.generateImage(prompt,{aspectRatio:'16:9',imageSize:'2K'});
      var mail=await emailOne(to,brand,result);
      console.log('batch '+(i+1)+'/'+BRANDS.length+' '+brand.name+':', JSON.stringify({ok:!!result.ok,engine:result.engine,ms:result.ms,emailed:mail.ok,err:mail.error||result.error||null}));
    }catch(e){ console.error('batch item failed '+brand.name, e&&e.message?e.message:String(e)); }
  }
  return { statusCode: 202 };
};
