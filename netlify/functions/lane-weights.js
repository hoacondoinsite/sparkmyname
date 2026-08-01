// lane-weights.js — Generator Baseline v2 (2026-07-03). CATEGORY-BASED LANE WEIGHTING.
// The buffet philosophy is preserved: every category still receives a spread across all
// lanes (weights shape the spread, they do not collapse it) — with ONE exception: Clever is
// closed in dignity-sensitive categories unless the Founder re-opens it per category.
var REGULATED = ['law','accounting','consulting','insurance','financial','banking','mortgage',
 'title_escrow','engineering','architecture','medical','dental','orthodontist','dermatology',
 'urgent_care','pharmacy','audiology','optometry','chiro','chiropractor','physical_therapy',
 'vet','surveying','notary','staffing'];
var DIGNITY = ['recovery','therapy','funeral','senior_care','weight_loss','home_health','hospice'];
var TRADES = ['plumbing','electrical','hvac','roofing','landscaping','cleaning','pest','painting',
 'painter','handyman','moving','pool','pool_service','pool_builder','towing','junk_removal',
 'tree_service','locksmith','power_washing','snow_removal','gutter','fence','concrete','paving',
 'flooring','cabinetry','countertop','garage_door','septic','chimney','appliance_repair',
 'lawn_care','irrigation','demolition','excavation','welding','auto_repair','detailing',
 'oil_change','brake_muffler','transmission','mobile_mechanic','tire_shop','auto_glass',
 'window_tint','duct_cleaning','mold','restoration','mosquito','wildlife','deck_builder','hardscape'];
var PLAY = ['gaming','escape_room','axe_throwing','board_game','photo_booth','party_rental',
 'toy_store','toy_brand','ice_cream','dj','youth_sports','kids_party'];
function toSet(a){ var o={}; for(var i=0;i<a.length;i++) o[a[i]]=1; return o; }
var R=toSet(REGULATED), D=toSet(DIGNITY), T=toSet(TRADES), P=toSet(PLAY);
function classFor(key){
  key=String(key||'');
  if (D[key]) return 'dignity';
  if (R[key]) return 'regulated';
  if (T[key]) return 'trade';
  if (P[key]) return 'play';
  return 'default';
}
// Multipliers on the per-lane base target. Each row sums to ~4.0 so total volume is preserved.
var WEIGHTS = {
  regulated: { professional:1.6, standard:1.2, clever:0.5, human:0.7 },
  dignity:   { professional:1.4, standard:1.2, clever:0.0, human:1.4 },
  trade:     { professional:1.1, standard:1.0, clever:1.1, human:0.8 },
  play:      { professional:0.6, standard:0.6, clever:1.4, human:1.4 },
  default:   { professional:1.0, standard:0.9, clever:0.9, human:1.2 }
};
function laneTargets(cls, base){
  var w = WEIGHTS[cls] || WEIGHTS.default; base = base || 12; var out = {};
  ['professional','standard','clever','human'].forEach(function(L){
    out[L] = Math.max(0, Math.round(base * w[L]));
  });
  return out;
}
module.exports = { classFor: classFor, laneTargets: laneTargets, WEIGHTS: WEIGHTS,
                   REGULATED: REGULATED, DIGNITY: DIGNITY, TRADES: TRADES, PLAY: PLAY };
