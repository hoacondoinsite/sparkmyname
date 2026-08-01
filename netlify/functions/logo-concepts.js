// logo-concepts.js — LOGO DEPARTMENT v3 DISPATCHER (2026-07-05).
// PUBLIC CONTRACT UNCHANGED: POST { r, name, seed, trigger } -> { ok, logos:[...] }.
// Cached concepts return instantly. Missing concepts are handed (awaited, 202-in-ms) to
// logo-concepts-background, which has the full 15-minute allowance; this dispatcher never
// generates and therefore can never be killed mid-run. Spend gate + cache laws preserved.
'use strict';
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var ON = String(process.env.SMN_LOGO_DEPT || '').toLowerCase() === 'on';
var CONCEPTS = 3;
function sbH(extra){ var h={ apikey:SB_KEY, Authorization:'Bearer '+SB_KEY }; if(extra)for(var k in extra)h[k]=extra[k]; return h; }

exports.handler = async function (event) {
  var out = function(o){ return { statusCode:200, headers:{'Content-Type':'application/json'}, body: JSON.stringify(o) }; };
  if (event.httpMethod !== 'POST') return { statusCode:405, body:'method' };
  if (!ON) return out({ ok:false, off:true });
  if (!SB_URL || !SB_KEY) return out({ ok:false, error:'env' });
  var b={}; try{ b=JSON.parse(event.body||'{}'); }catch(e){}
  var r = String(b.r||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64);
  var name = String(b.name||'').slice(0,80).trim();
  if (!r || !name) return out({ ok:false, error:'missing' });

  // SPEND GATE (unchanged): the (report, name) pair must exist — only purchased reports generate.
  var row=null;
  try{
    var q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) +
      '&name=eq.' + encodeURIComponent(name) + '&select=id,kit&limit=1', { headers: sbH({'Accept':'application/json'}) });
    if (q.status < 300) { var rows = await q.json(); row = (Array.isArray(rows)&&rows[0])?rows[0]:null; }
  }catch(e){}
  if (!row) return out({ ok:false, error:'not_found' });
  var kit = row.kit || {};

  // CACHE FIRST (unchanged): complete ledger or full URL list answers instantly.
  if (kit.logoDept && kit.logoDept.status==='complete' && Array.isArray(kit.logoDept.concepts) && kit.logoDept.concepts.length>=CONCEPTS)
    return out({ ok:true, cached:true, logos:kit.logoDept.concepts.map(function(c){return c.url;}), ledger:kit.logoDept });
  if (Array.isArray(kit.logoUrls) && kit.logoUrls.length >= CONCEPTS)
    return out({ ok:true, cached:true, logos:kit.logoUrls });

  // SELF-FORENSIC TRACER (2026-07-05): stamp the handoff on the ledger BEFORE dispatch —
  // any future silent failure now leaves fingerprints (status:'dispatched' + timestamp).
  try{
    kit.logoDept = Object.assign({}, kit.logoDept, { status:'dispatched', dispatchedAt:new Date().toISOString(), trigger:String(b.trigger||'') });
    await fetch(SB_URL + '/rest/v1/report_names?id=eq.' + encodeURIComponent(row.id), {
      method:'PATCH', headers: sbH({'Content-Type':'application/json','Prefer':'return=minimal'}),
      body: JSON.stringify({ kit: kit })
    });
  }catch(e){}
  // NOT CACHED -> the piecework RENDER SPINE takes the job (relay/resume/ladder — never fails at
  // any size). REROUTE 2026-07-10: was logo-concepts-background (old 2-attempts-then-quit path);
  // logos now ride the same self-metering spine the cinematics use, via the registered logo_lockups format.
  try{
    await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/art-render-background', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ r: r, name: name, seed: b.seed || '', domain: b.domain || '', format: 'logo_lockups' })
    });
  }catch(e){}
  return out({ ok:true, building:true, logos: Array.isArray(kit.logoUrls)?kit.logoUrls:[] });
};
