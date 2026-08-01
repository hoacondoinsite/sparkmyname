// crutch-lexicon.js — Generator Baseline v2 (2026-07-03). Single source of truth for the
// recurring comfort-word / fallback vocabulary. Consumed by the JUDGE for deterministic
// scoring penalties. The generator's own screen door keeps its identical local copy — the
// clean-room file is intentionally untouched. Additions here require Founder authorization.
var CRUTCHES = ['nestle','pinnacle','catalyst','canvas','haven','ember','grove','nexus',
  'harmony','forge','bridge','sphere','mosaic','oasis','bloom','whisper',
  'elevate','thrive','summit','apex','beacon','pulse',
  'precision','junction','handshake','savvy','pathway','pathfinder','gavel','ledger'];
function hasCrutch(name){
  var low = ' ' + String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ') + ' ';
  for (var i=0;i<CRUTCHES.length;i++){ var c=CRUTCHES[i];
    if (low.indexOf(' '+c+' ')>=0 || low.indexOf(c)>=0) return c; }
  return '';
}
module.exports = { CRUTCHES: CRUTCHES, hasCrutch: hasCrutch };
