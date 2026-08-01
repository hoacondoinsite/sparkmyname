// SparkMyName — THE FORMAT REGISTRY (SOP-ART-001 — NEW FILE, 2026-07-05)
// Every deliverable is ONE DATA ROW: physics (distance · duration · decision), spec,
// engine class, pieces, and its switch. Adding a format = adding a row — never a rewrite.
// The Translator and the render spine never special-case a format by name.
'use strict';

// engine: 'image' (AI generation) | 'svg' (code-composed board) | 'derived' (re-uses an
// existing Shelf asset — zero generation cost) | 'tiles' (multi-piece image, relay class).
var ROWS = {
  // 2K LOGOS (2026-07-27, Founder order). This row said size:'1K', and the render ladder in
  // art-render-background reads it literally — sizes = spec.size==='2K' ? ['2K','1K'] : ['1K'].
  // So every logo this platform has ever delivered was generated at 1K while every photo ran
  // at 2K. The ledger cost is identical either way (studio-engine prices by MODEL tier, not by
  // resolution), so the platform has been paying 2K rates for 1K artwork. 1K stays behind it
  // as the ladder's fallback, exactly as it does for every other 2K row.
  logo_lockups: { id: 'logo_lockups', label: 'AI logo lockups (3 directions)',
    physics: { distance: 'medium', duration: '2s', decision: 'recognize & remember' },
    spec: { aspect: '1:1', size: '2K', pieces: 3 }, engine: 'image', switch: 'SMN_LOGO_DEPT', phase: 'exists' },
  hero_moment: { id: 'hero_moment', label: 'Hero brand moment',
    physics: { distance: 'close', duration: '5s', decision: 'believe & proceed' },
    spec: { aspect: '16:9', size: '2K', pieces: 1 }, engine: 'image', switch: 'SMN_ART_DEPT', phase: 'exists' },
  brand_board: { id: 'brand_board', label: 'Brand presentation board',
    physics: { distance: 'close', duration: 'minutes', decision: 'be convinced' },
    spec: { aspect: 'document', size: 'html', pieces: 1 }, engine: 'derived', switch: 'SMN_ART_DEPT', phase: 'exists' },
  business_card: { id: 'business_card', label: 'Business card board',
    physics: { distance: 'arm', duration: '3s', decision: 'keep & recall' },
    spec: { aspect: '3.5x2in', size: 'svg', pieces: 1, w: 1050, h: 600 }, engine: 'svg', switch: 'SMN_PRINT_BASICS', phase: 'ART-2' },
  letterhead: { id: 'letterhead', label: 'Letterhead board',
    physics: { distance: 'arm', duration: 'reading', decision: 'trust' },
    spec: { aspect: 'letter', size: 'svg', pieces: 1, w: 1275, h: 1650 }, engine: 'svg', switch: 'SMN_PRINT_BASICS', phase: 'ART-2' },
  summary_sheet: { id: 'summary_sheet', label: 'Summary sheet header',
    physics: { distance: 'arm', duration: 'scan', decision: 'orient' },
    spec: { aspect: 'banner', size: 'svg', pieces: 1, w: 1400, h: 400 }, engine: 'svg', switch: 'SMN_PRINT_BASICS', phase: 'ART-2' },
  avatar: { id: 'avatar', label: 'Profile avatar (mark #1, crop-safe)',
    physics: { distance: 'thumb', duration: '1s', decision: 'identify' },
    spec: { aspect: '1:1', size: 'derived', pieces: 1 }, engine: 'derived', switch: 'SMN_AVATAR', phase: 'ART-3' },
  support_image: { id: 'support_image', label: 'Supporting brand moment',
    physics: { distance: 'close', duration: '3s', decision: 'feel' },
    spec: { aspect: '4:5', size: '2K', pieces: 1 }, engine: 'image', switch: 'SMN_SUPPORT_IMAGE', phase: 'ART-3' },
  social_tiles: { id: 'social_tiles', label: 'Social tile pack',
    physics: { distance: 'thumb-scroll', duration: '3s', decision: 'stop' },
    spec: { aspect: 'set', size: '1K', pieces: 3, aspects: ['1:1', '9:16', '16:9'] }, engine: 'image', switch: 'SMN_SOCIAL_PACK', phase: 'ART-3' },
  truck_wrap: { id: 'truck_wrap', label: 'Truck wrap (tiled)',
    physics: { distance: 'street', duration: '1-2s', decision: 'identify & impress' },
    spec: { aspect: 'panoramic', size: '2K', pieces: 6 }, engine: 'tiles', switch: 'SMN_BIGCANVAS', phase: 'ART-4' },
  billboard: { id: 'billboard', label: 'Billboard (tiled)',
    physics: { distance: 'highway', duration: '1s', decision: 'one idea' },
    spec: { aspect: '14:5', size: '2K', pieces: 4 }, engine: 'tiles', switch: 'SMN_BIGCANVAS', phase: 'ART-4' },
  menu_board: { id: 'menu_board', label: 'Menu / table talker boards',
    physics: { distance: 'table', duration: 'minutes', decision: 'appetite' },
    spec: { aspect: 'document', size: 'svg', pieces: 2, w: 1275, h: 1650 }, engine: 'svg', switch: 'SMN_BIGCANVAS', phase: 'ART-4' },
  storyboard: { id: 'storyboard', label: 'TV / video storyboard',
    physics: { distance: 'couch', duration: '15-30s', decision: 'feel & recall' },
    spec: { aspect: '16:9', size: '1K', pieces: 6 }, engine: 'tiles', switch: 'SMN_BIGCANVAS', phase: 'ART-4' },
  web_pack: { id: 'web_pack', label: 'Website hero pack (size set)',
    physics: { distance: 'close', duration: '5s', decision: 'proceed' },
    spec: { aspect: 'set', size: '2K', pieces: 3, aspects: ['16:9', '21:9', '4:5'] }, engine: 'tiles', switch: 'SMN_BIGCANVAS', phase: 'ART-4' },
};

function row(id){ return ROWS[id] || null; }
function active(id, env){
  var r = ROWS[id]; if (!r) return false;
  return String(((env || process.env)[r.switch]) || '').toLowerCase() === 'on';
}
function list(){ return Object.keys(ROWS).map(function(k){ return ROWS[k]; }); }

module.exports = { ROWS: ROWS, row: row, active: active, list: list };
