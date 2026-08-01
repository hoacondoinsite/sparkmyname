// classifier-overlay.js — Generator Baseline v2 (2026-07-03). CLASSIFIER FINISHING.
// Wraps name-intel.classifyScored WITHOUT touching the frozen intel file. It only acts when
// the base classifier is weak (confidence < 0.70 or _generic/_creative fallback) AND a
// finishing pattern matches with strong evidence. Evidence for each mapping: live probe on
// 2026-07-03 showed these real seeds fell through to _generic/_creative.
var RULES = [
  { key:'recovery',    label:'Addiction recovery', re:/\b(addiction|recovery center|rehab|rehabilitation|sober living|sobriety|detox)\b/ },
  { key:'weight_loss', label:'Weight loss',        re:/\b(weight ?loss|bariatric|slimming|weight management)\b/ },
  { key:'hospice',     label:'Hospice care',       re:/\b(hospice|end of life|palliative)\b/ },
  { key:'youth_sports',label:'Youth sports',       re:/\b(little league|youth (baseball|soccer|basketball|football|hockey|sports)|kids? (baseball|soccer|sports) (team|league|club)|pee ?wee)\b/ },
  { key:'kids_party',  label:'Kids party & play',  re:/\b(bounce house|kids? part(y|ies)|birthday part(y|ies)|trampoline park|play center|playcenter|laser tag|arcade)\b/ }
];
function refine(seed, base){
  base = base || { key:'_generic', label:'business', confidence:0.3 };
  var weak = (base.confidence < 0.70) || base.key === '_generic' || (String(base.key||'').charAt(0) === '_');
  if (!weak) return base;
  var s = ' ' + String(seed||'').toLowerCase() + ' ';
  for (var i=0;i<RULES.length;i++){
    if (RULES[i].re.test(s)) {
      return { key: RULES[i].key, label: RULES[i].label, confidence: 0.85,
               needsRefine:false, broad:false, offerRefine:false, overlay:true };
    }
  }
  return base;
}
module.exports = { refine: refine, RULES: RULES };
