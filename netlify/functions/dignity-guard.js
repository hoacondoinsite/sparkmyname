// dignity-guard.js — Generator Baseline v2 (2026-07-03). LOCALIZED dignity subsystem.
// Principle: a name must never redefine the customer by their wound. This is NOT a global
// vocabulary ban — it fires ONLY in validated dignity-sensitive categories, and each
// category carries its own tight wound-word list. Conservative by design (do no harm):
// a false rejection costs one candidate; a false pass costs a customer their dignity.
var WOUNDS = {
  recovery:    ['addict','addicts','junkie','junkies','relapse','druggie','wasted','crackhead','tweaker'],
  therapy:     ['crazy','insane','lunatic','psycho','madhouse','broken','damaged','shrink'],
  funeral:     ['corpse','cadaver','stiff','bodybag','sixfeet'],
  senior_care: ['senile','decrepit','geezer','fossil','overthehill'],
  weight_loss: ['fat','fatty','obese','chubby','plump','tubby','blubber'],
  home_health: ['invalid','cripple','crippled','bedridden'],
  hospice:     ['corpse','deathbed','terminal','lastbreath']
};
function isDignityCategory(key){ return !!WOUNDS[String(key||'')]; }
function dignityViolation(key, name){
  var list = WOUNDS[String(key||'')]; if (!list) return '';
  var low = ' ' + String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ') + ' ';
  var flat = String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  for (var i=0;i<list.length;i++){ var w=list[i];
    if (low.indexOf(' '+w+' ')>=0 || flat.indexOf(w)>=0) return w; }
  return '';
}
module.exports = { WOUNDS: WOUNDS, isDignityCategory: isDignityCategory, dignityViolation: dignityViolation };
