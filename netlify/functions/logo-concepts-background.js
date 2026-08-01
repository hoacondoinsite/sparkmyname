// logo-concepts-background.js — LOGO DEPARTMENT v3 WORKER (2026-07-05).
// The full pipeline (3 concepts, 2 attempts, ledger, founder alert) — moved verbatim into a
// BACKGROUND function because 3 serial image generations exceed the synchronous limit; the
// old sync handler was killed mid-run before the ledger ever saved. Crumb law restored.
// The Logo Department is responsible for every logo SparkMyName will ever generate. Nothing else.
//
// INPUTS   : { r: reportId, name, seed, trigger, force? } — kit (colors/typography/category) is read from the row.
// OUTPUTS  : three premium textless emblem concepts (two-layer law: mark textless, wordmark is typography).
// CACHE    : permanent — Supabase Storage logos/{report}/{slug}/1..3.png + a full ledger on kit.logoDept:
//            { reportId, nameId, name, prompt, generatedAt, status, concepts:[{url,thumb}] }.
//            NEVER regenerates. force:true regenerates ONLY when it matches env SMN_FOUNDER_TOKEN (Founder-only);
//            without that env set, regeneration is impossible by design.
// RETRY    : two attempts per concept; one bad concept never blocks the others.
// FALLBACK : on total failure the report continues on the premium monogram (status "fallback-monogram")
//            and the Founder is notified by email (Resend, FOUNDER_ALERT_EMAIL).
// REUSE    : downstream departments read kit.logoUrls (compatibility) and kit.logoDept (ledger). Never regenerate.
var engine  = require('./studio-engine.js');
var judged  = require('./render-judged.js');
var judgeLib= require('./judge-logo.js');
var storage = require('./sb-storage.js');
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var ON = String(process.env.SMN_LOGO_DEPT || '').toLowerCase() === 'on';
var CONCEPTS = parseInt(process.env.SMN_LOGO_CONCEPTS || '2', 10); // CO-56 (Founder promise audit): TWO marks per name — concept 1 the main everyday logo, concept 2 the DARK-BACKGROUND version the homepage promises.
var ATTEMPTS = 2; // per concept
var ALERT_TO = process.env.FOUNDER_ALERT_EMAIL || 'peterkleinusa@gmail.com';
function sbH(extra){ var o={ 'apikey':SB_KEY, 'Authorization':'Bearer '+SB_KEY }; if(extra){for(var k in extra)o[k]=extra[k];} return o; }
function slug(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'name'; }
function publicUrl(p){ return SB_URL + '/storage/v1/object/public/' + storage.BUCKET + '/' + p; }
async function exists(url){ try{ var r=await fetch(url,{method:'HEAD'}); return r.status>=200&&r.status<300; }catch(e){ return false; } }
async function alertFounder(subject, text){
  try{
    var KEY=process.env.RESEND_API_KEY; if(!KEY) return;
    await fetch('https://api.resend.com/emails',{method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEY},
      body:JSON.stringify({from:process.env.RESEND_FROM||'SparkMyName <onboarding@resend.dev>',
        to:[ALERT_TO],subject:'[Logo Department] '+subject,
        html:'<pre style="font:13px/1.5 Menlo,monospace">'+String(text).replace(/[<>&]/g,'')+'</pre>'})});
  }catch(e){}
}
var translator = require('./art-translator.js'); // SOP-ART-001: brief-fed lockups (switched)
function buildPrompt(name, seed, kit, j){
  // ONE PROMPT, ONE PLACE (2026-07-27, Founder order).
  //
  // This function used to hold a SECOND, hardcoded copy of the logo prompt — used whenever
  // SMN_ART_REGISTRY was off or the Governor brief was absent, which in practice was most
  // orders. It still carried the original Direction 1: "set inside or above a dynamic
  // containing shape (ring, shield, or badge)". So every shield the Founder objected to was
  // this copy doing exactly what it was told, while SPARK LOGO LAW was rewritten one file
  // over in art-translator.js and never reached a single client order.
  //
  // The duplicate is gone. The Translator is now the only author of a logo prompt anywhere in
  // this codebase, brief or no brief — logoPrompt handles a null brief by simply omitting the
  // psychology block, which is exactly the parity the old fallback existed to provide.
  // See docs/SPARK_LOGO_LAW.md.
  return translator.logoPrompt(name, seed, kit, j, (kit && kit.gov) || null);
}


exports.handler = async function (event) {
  var out = function(o){ return { statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify(o) }; };
  if (event.httpMethod !== 'POST') return { statusCode:405, body:'method' };
  if (!ON) return out({ ok:false, off:true });
  if (!SB_URL || !SB_KEY) return out({ ok:false, error:'env' });
  var b={}; try{ b=JSON.parse(event.body||'{}'); }catch(e){}
  var r = String(b.r||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64);
  var name = String(b.name||'').slice(0,80).trim();
  var force = b.force===true && !!process.env.SMN_FOUNDER_TOKEN && String(b.founder_token||'')===process.env.SMN_FOUNDER_TOKEN;
  if (!r || !name) return out({ ok:false, error:'missing' });

  // SPEND GATE: the (report, name) pair must exist — only purchased reports generate.
  var row=null;
  try{
    var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
      '&name=eq.' + encodeURIComponent(name) + '&select=id,kit,name&limit=1', { headers: sbH({'Accept':'application/json'}) });
    if (q.status < 300) { var rows = await q.json(); row = (Array.isArray(rows)&&rows[0])?rows[0]:null; }
  }catch(e){}
  if (!row) return out({ ok:false, error:'not_found' });
  var kit = row.kit || {};

  // CACHE FIRST — the ledger, then the kit list, then storage. Never regenerate.
  if (!force) {
    if (kit.logoDept && kit.logoDept.status==='complete' && Array.isArray(kit.logoDept.concepts) && kit.logoDept.concepts.length>=CONCEPTS)
      return out({ ok:true, cached:true, logos:kit.logoDept.concepts.map(function(c){return c.url;}), ledger:kit.logoDept });
    if (Array.isArray(kit.logoUrls) && kit.logoUrls.length >= CONCEPTS)
      return out({ ok:true, cached:true, logos:kit.logoUrls });
  }
  var base = 'logos/' + r + '/' + slug(name) + '/';
  var urls = [];
  if (!force) for (var i=1;i<=CONCEPTS;i++){ var u = publicUrl(base+i+'.png'); if (await exists(u)) urls.push(u); }

  // GENERATE only the missing concepts — two attempts each; one bad concept never blocks the rest.
  var prompt='';
  if (urls.length < CONCEPTS) {
    try{ await storage.ensureBucket(); }catch(e){}
    for (var j=urls.length+1; j<=CONCEPTS; j++){
      prompt = buildPrompt(name, b.seed, kit, j); if (j===2) prompt += ' VARIANT: DARK-BACKGROUND VERSION \u2014 the SAME logo identity rendered for dark surfaces: deep navy (#0A1428) background filling the entire frame edge to edge, the mark and any lettering reversed to clean white (#FFFFFF) for strong contrast, same composition and identity as the primary mark, no light backgrounds anywhere.';
      var lastErr=''; // ledger forensic voice (Netlify keeps no background history)

      // 2K, PRO-FIRST, JUDGED (2026-07-27, Founder order).
      //
      // THREE THINGS WERE WRONG HERE and all three were invisible from the outside:
      //  1. imageSize was hardcoded '1K'. The art-registry logo row was raised to 2K, but this
      //     department never reads the registry — so every client logo this platform has ever
      //     delivered was 1K while every photograph ran at 2K.
      //  2. No geminiModels were passed, so studio-engine fell back to its default tier list,
      //     which is FLASH-first. Pro was never even attempted. Cheapest model, smallest size,
      //     on the one asset a customer looks at hardest.
      //  3. Nothing looked at the result. SPARK LOGO LAW lived in the prompt and nowhere else.
      //
      // This is a BACKGROUND function with a 15-minute ceiling, so unlike the synchronous
      // command bar it can afford to render, judge, and render again knowing what was wrong.
      // That is the whole point of putting the judge here rather than there.
      var ENG_OPTS = { imageSize:'2K', aspectRatio:'1:1',
                       /* PRO LEADS ON IDENTITY (2026-07-27, corrected): the Pro preview model is the better
   draughtsman for logo work, and removing it in the photo clean-up cost visible quality.
   allowPreview says this is deliberate, so the engine's photo-side ban does not strip it. */
                       allowPreview:true,
                       geminiModels:['gemini-3-pro-image-preview','gemini-3.1-flash-image','gemini-2.5-flash-image'] };

      // Concept 1 is the primary mark and the one that is judged. Concept 2 is the same identity
      // reversed onto a dark field; judging it against a law written for flat-white deliverables
      // would reject it for being exactly what it was asked to be.
      var JUDGE_THIS = (j === 1);
      var verdict = null;

      try {
        var res = await judged.renderBestOf({
          // Single pass (2026-07-27, Founder order). 2K and Pro-first stay — those were the
          // real defects here. The multi-take loop goes.
          attempts: 1,
          budgetMs: 600000,                       // 10 minutes inside a 15-minute ceiling
          name: name,
          render: async function (correction) {
            var pr = correction ? (prompt + ' ' + correction) : prompt;
            try { return await engine.generateImage(pr, ENG_OPTS); }
            catch (e) { lastErr = 'THREW: ' + String(e && e.message || e).slice(0,300); return null; }
          },
          judge: JUDGE_THIS ? undefined : async function () {
            return { pass: true, unknown: true, reason: 'not_judged', total: null, verdict: 'unknown' };
          }
        });

        if (res && res.img && res.img.b64) {
          verdict = res.verdict;
          var up = await storage.uploadPng(base + j + '.png', res.img.b64, res.img.mime || 'image/png');
          if (up && up.ok && up.url) {
            urls.push(up.url);
            if (JUDGE_THIS && verdict) {
              console.log('LOGO JUDGE "' + name + '": ' + verdict.verdict +
                          ' score=' + verdict.total +
                          ' takes=' + res.attempts_used +
                          (verdict.failed_axioms && verdict.failed_axioms.length
                            ? ' failed=' + verdict.failed_axioms.join(',') : ''));
              kit.logoJudged = {
                total: verdict.total, verdict: verdict.verdict,
                codex: verdict.codex || {}, failed_axioms: verdict.failed_axioms || [],
                failed_gates: verdict.failed_gates || [], attempts: res.attempts_used,
                one_line: verdict.one_line || '', at: new Date().toISOString()
              };
            }
          } else {
            lastErr = 'UPLOAD: ' + JSON.stringify(up).slice(0,300);
            console.error('LOGO ' + j + ' UPLOAD FAILED: ' + JSON.stringify(up).slice(0,400));
          }
        } else {
          lastErr = lastErr || 'GEN: every attempt failed to render';
          console.error('LOGO ' + j + ' GENERATION FAILED after all attempts');
        }
      } catch (e) {
        lastErr = 'THREW: ' + String(e && e.message || e).slice(0,300);
        console.error('LOGO ' + j + ' THREW: ' + String(e && e.message || e));
      }
    }
  }

  // LEDGER — permanent record on the kit (thumb = same asset; browsers scale the 1K square).
  var now=new Date().toISOString();
  var status = urls.length>=CONCEPTS ? 'complete' : (urls.length>0 ? 'partial' : 'fallback-monogram');
  console.log('LOGO DEPT VERDICT: ' + status + ' — ' + urls.length + ' of ' + CONCEPTS + ' marks on the Shelf for "' + name + '"');
  kit.logoDept = { reportId:r, nameId:row.id, name:name, prompt:prompt||((kit.logoDept||{}).prompt||''),
                   generatedAt:now, status:status,
                   lastError: (typeof lastErr!=='undefined'&&lastErr)?lastErr:undefined, // ledger forensic voice (Netlify keeps no background history)
                   concepts: urls.map(function(u){ return { url:u, thumb:u }; }) };
  if (urls.length) kit.logoUrls = urls; // downstream compatibility — every department reuses this
  try{
    // MERGE-BEFORE-WRITE (forensic fix, 2026-07-05): re-fetch the row and lay ONLY our
    // fields onto the FRESH kit — a whole-kit PATCH from a stale read was erasing what
    // sibling departments (hero header, art ledger) wrote while logos were generating.
    var freshKit = kit;
    try{
      var fq = await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(row.id) + '&select=kit&limit=1', { headers: sbH({'Accept':'application/json'}) });
      var fr = fq.ok ? await fq.json() : [];
      if (fr && fr[0] && fr[0].kit) { freshKit = fr[0].kit; freshKit.logoUrls = kit.logoUrls; freshKit.logoDept = kit.logoDept; }
    }catch(_){ }
    await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(row.id), {
      method:'PATCH', headers: sbH({'Content-Type':'application/json','Prefer':'return=minimal'}),
      body: JSON.stringify({ kit: freshKit })
    });
    // AVATAR CHAIN (forensic fix, 2026-07-05): mark #1 now exists on the Shelf — wake the
    // spine for the derived avatar (its own switch is the door; off = this is a no-op).
    try{
      var reg = require('./art-registry.js');
      if (reg.active('avatar') && freshKit.logoUrls && freshKit.logoUrls[0]) {
        await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/art-render-background', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ r: r, name: name, seed: b.seed || '', format: 'avatar' })
        });
      }
    }catch(_){ }
  }catch(e){}

  if (!urls.length) {
    // FALLBACK: report continues on the premium monogram; Founder notified. Never fails the pipeline.
    await alertFounder('generation failed — report '+r,
      'Report: '+r+'\nName: '+name+'\nTrigger: '+String(b.trigger||'')+'\nTime: '+now+
      '\nAll '+CONCEPTS+' concepts failed after '+ATTEMPTS+' attempts each. Customer sees the premium monogram; nothing is blocked.');
    return out({ ok:false, error:'no_generation', fallback:'monogram', ledger:kit.logoDept });
  }
  return out({ ok:true, cached:false, logos:urls, ledger:kit.logoDept });
};
