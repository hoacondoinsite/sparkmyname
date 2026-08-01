// context-library.js — EXPERIMENTAL Business Context Library resolver (2026-07-03).
// EXPERIMENT ONLY. Informational only: resolves the already-determined category to one
// judge_context_summary from the Business Context Library and returns it EXACTLY as stored —
// never summarized, rewritten, reinterpreted, or enhanced. Provides no scores, no
// recommendations, overrides nothing. The existing Judge remains the authority.
// Kill switch: SMN_CONTEXT_LIB=off disconnects the library instantly (previous behavior).
// Fail-safe: any uncertainty returns '' and the judge runs exactly as before.
var LIB = [];
try { LIB = require('./business-context-slim.json'); } catch (e) { LIB = []; }

// Curated map: SparkMyName category keys -> exact NAICS records (the categories that matter most).
var MAP = {
  law:'541110', accounting:'541211', consulting:'541611', insurance:'524210', financial:'523930',
  banking:'522110', mortgage:'522310', medical:'621111', dental:'621210', orthodontist:'621210',
  dermatology:'621111', urgent_care:'621493', pharmacy:'446110', optometry:'621320', chiro:'621310',
  chiropractor:'621310', physical_therapy:'621340', vet:'541940', therapy:'621330', recovery:'623220',
  hospice:'623110', senior_care:'623312', home_health:'621610', weight_loss:'812191', funeral:'812210',
  plumbing:'238220', hvac:'238220', electrical:'238210', roofing:'238160', landscaping:'561730',
  lawn_care:'561730', cleaning:'561720', janitorial:'561720', pest:'561710', painting:'238320',
  painter:'238320', handyman:'236118', moving:'484210', towing:'488410', locksmith:'561622',
  power_washing:'561790', junk_removal:'562119', tree_service:'561730', septic:'562991',
  auto_repair:'811111', detailing:'811192', tire_shop:'441320', restaurant:'722511', cafe:'722515',
  bakery:'311811', food_truck:'722330', catering:'722320', bar:'722410', brewery:'312120',
  salon:'812112', barber:'812111', nails:'812113', spa:'812199', fitness:'713940', gym:'713940',
  photography:'541921', wedding:'812990', florist:'453110', real_estate:'531210',
  property_management:'531311', daycare:'624410', childcare:'624410', tutoring:'611691',
  podcast:'512290', media:'512110', marketing:'541810', design:'541430', software:'541511',
  it_services:'541512', cybersecurity:'541512', staffing:'561311', logistics:'484110',
  hotel:'721110', travel:'561510', pet_grooming:'812910', pet_boarding:'812910', dog_grooming:'812910',
  jewelry:'448310', boutique:'448140', ecommerce:'454110', youth_sports:'713990', kids_party:'713120',
  solar:'238220', roofer:'238160', construction:'236118', builder:'236117', engineering:'541330',
  architecture:'541310', surveying:'541370', notary:'541199', title_escrow:'541191'
};
var IDX = null;
function norm(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim(); }
function buildIdx(){
  IDX = {};
  for (var i=0;i<LIB.length;i++){
    var words = norm(LIB[i].t + ' ' + LIB[i].s).split(' ');
    for (var w=0; w<words.length; w++){
      var k=words[w]; if (k.length<4) continue;
      (IDX[k]=IDX[k]||[]).push(i);
    }
  }
}
function byCode(code){
  for (var i=0;i<LIB.length;i++) if (LIB[i].c===code) return LIB[i];
  return null;
}
function summaryFor(key, label){
  if (String(process.env.SMN_CONTEXT_LIB||'').toLowerCase()==='off') return '';
  if (!LIB.length) return '';
  try{
    var code = MAP[String(key||'')];
    if (code){ var r=byCode(code); if (r) return r.j; }
    // conservative fallback: token overlap on the resolved category label only
    var toks = norm(label||key).split(' ').filter(function(t){return t.length>=4;});
    if (!toks.length) return '';
    if (!IDX) buildIdx();
    var score={};
    toks.forEach(function(t){ (IDX[t]||[]).forEach(function(i){ score[i]=(score[i]||0)+1; }); });
    var best=-1,bs=0;
    for (var i in score){ if (score[i]>bs){ bs=score[i]; best=+i; } }
    // require at least 2 overlapping meaningful tokens, or 1 token that IS the whole label
    if (best>=0 && (bs>=2 || (bs===1 && toks.length===1))) return LIB[best].j;
  }catch(e){}
  return '';
}
module.exports = { summaryFor: summaryFor };
