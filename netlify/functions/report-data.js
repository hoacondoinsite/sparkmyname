// SparkMyName — REPORT DATA (NEW FILE, Studio v4, 2026-07-05)
// Returns one purchased report as clean JSON for The Studio. The credential is the
// unguessable report key — the exact same credential view-report has always accepted
// and send-kit has always emailed to the buyer. No new access is granted anywhere:
// identical key, identical data, JSON instead of HTML. Heavy fields are trimmed.
// GET ?r=KEY -> { ok, seed, created_at, names:[{name,domain,domainAvailable,why,score,kit(light)}] }
'use strict';
var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
function sbH(extra){ var o={ 'apikey':SB_KEY, 'Authorization':'Bearer '+SB_KEY }; if(extra){for(var k in extra)o[k]=extra[k];} return o; }
function out(code, o){ return { statusCode: code, headers: { 'Content-Type':'application/json', 'Cache-Control':'no-store' }, body: JSON.stringify(o) }; }

function lightKit(kit){
  kit = kit || {};
  var gov = kit.gov || null;
  var out = {
    colors: kit.colors || [], palettes: (kit.palettes || []).slice(0, 1),
    fonts: (kit.fonts || []).slice(0, 4), voice: (kit.voice || []).slice(0, 6),
    taglines: (kit.taglines || []).slice(0, 3), bios: (kit.bios || []).slice(0, 2),
    about: (kit.about || []).slice(0, 3), posts: (kit.posts || kit.launchPosts || []).slice(0, 3),
    whyItWorks: (kit.whyItWorks || []).slice(0, 8),
    logoUrls: Array.isArray(kit.logoUrls) ? kit.logoUrls.slice(0, 3) : [],
    headerUrl: kit.headerUrl || '',
    handle: kit.handle || '',
    shiftPromise: (gov && gov.shift && gov.shift.promise) ? String(gov.shift.promise).slice(0, 200) : '',
    diag: { logo: kit.logoDept ? { status: kit.logoDept.status, lastError: kit.logoDept.lastError || '' } : null,
            hero: kit.heroDept ? { status: kit.heroDept.status, lastError: kit.heroDept.lastError || '' } : null },
  };
  // ENTITLEMENT / STATE PASSTHROUGH (2026-07-17, Phase 2 Step 0): the browser gates
  // Locked/Unlocked on these flags. Without them, a paid-and-activated brand renders
  // as a locked Concept on real orders. Allow-listed so nothing internal leaks.
  var STATE = ['_activated','_activation','_activated_at','_activation_session',
               '_chosen','_kept','_removed','_persona','_assets','_roadmap','_addons'];
  for (var i = 0; i < STATE.length; i++){ if (kit[STATE[i]] !== undefined) out[STATE[i]] = kit[STATE[i]]; }
  return out;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') return out(405, { ok:false, error:'method' });
  if (!SB_URL || !SB_KEY) return out(500, { ok:false, error:'env' });
  var q = event.queryStringParameters || {};
  var r = String(q.r || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  if (!r) return out(400, { ok:false, error:'missing r' });
  try {
    var rq = await fetch(SB_URL + '/rest/v1/reports?id=eq.' + encodeURIComponent(r) + '&select=id,seed,created_at,deleted_at&limit=1', { headers: sbH({ 'Accept':'application/json' }) });
    var reps = rq.ok ? await rq.json() : [];
    var rep = reps && reps[0];
    if (!rep) return out(404, { ok:false, error:'not_found' });
    if (rep.deleted_at) return out(404, { ok:false, error:'deleted' });
    // SCHEMA FIX (2026-07-16): the original select asked for a `why` column that does not
    // exist in report_names — PostgREST rejected the whole query (400), the `nq.ok ? … : []`
    // swallowed the rejection, and this function returned ZERO names for EVERY report.
    // The proven column list below is exactly what view-report has always read. `why` is
    // synthesized from the kit (whyItWorks) or the tagline. A minimal-select fallback keeps
    // this function alive through any future schema drift — and any names-read failure is
    // now LOUD in the response (names_error) instead of silently empty.
    var SEL_FULL = 'position,name,tagline,domain,domain_available,handle,score,kind,kit';
    var nq = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=' + SEL_FULL + '&order=position.asc&limit=24', { headers: sbH({ 'Accept':'application/json' }) });
    var rows = [], namesError = '';
    if (nq.ok) rows = await nq.json();
    else {
      var _e1 = ''; try { _e1 = (await nq.text()).slice(0, 160); } catch (_) {}
      console.error('report-data: full select failed ' + nq.status + ' — ' + _e1 + ' — retrying minimal select');
      var nq2 = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(r) + '&select=name,domain,kit&limit=24', { headers: sbH({ 'Accept':'application/json' }) });
      if (nq2.ok) rows = await nq2.json();
      else { var _e2 = ''; try { _e2 = (await nq2.text()).slice(0, 160); } catch (_) {} namesError = 'names read failed: ' + nq.status + ' then ' + nq2.status + ' — ' + (_e2 || _e1); }
    }
    var names = (rows || []).map(function(n){
      var k = n.kit || {};
      var why = (k.whyItWorks && k.whyItWorks[0]) ? String(k.whyItWorks[0]) : (n.tagline || (k.taglines && k.taglines[0]) || '');
      return { name: n.name, domain: n.domain || '', domainAvailable: n.domain_available !== false,
               why: why, score: n.score || 0, tagline: n.tagline || '', handle: n.handle || '', kit: lightKit(n.kit) };
    });
    var body = { ok:true, r: rep.id, seed: rep.seed || '', created_at: rep.created_at, names: names };
    if (namesError) body.names_error = namesError;
    return out(200, body);
  } catch (e) { return out(500, { ok:false, error:String(e && e.message || e).slice(0,200) }); }
};
