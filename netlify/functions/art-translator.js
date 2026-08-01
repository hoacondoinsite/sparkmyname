// SparkMyName — THE TRANSLATOR (SOP-ART-001 — NEW FILE, 2026-07-05)
// Fuses the Governor brief with a registry row into ONE Work Order: must-signals become
// the subject metaphors, cliches become explicit bans, palette/light/shape/dials become
// style directives, and the Law (exact name, banned claims) rides inline. When no brief
// exists, legacy prompts are emitted UNCHANGED — byte-parity with switches off.
'use strict';
var registry = require('./art-registry.js');
var schema = require('./governor-schema.js');

function j(list, cap){ return (list || []).slice(0, cap || 4).join('; '); }

// ---- LOGO LOCKUPS: the Ultimate Buzz anatomy, now brief-fed --------------------------
// THE THREE DIRECTIONS (rewritten 2026-07-27, Founder order: Landor-grade, retire the cheap look).
// Direction 1 used to instruct "set inside or above a dynamic containing shape (ring, shield, or
// badge)" — which is why every delivered suite came back wearing a shield. Badges and crests are
// the visual signature of cheap stock identity work; no serious identity house has led with one in
// thirty years. The three directions now describe how real studios actually differentiate a suite:
// by reduction, by letterform, and by typographic authority.
// RESTORED VERBATIM (2026-07-27, Founder order: "preserve what is good and working").
// These three directions and the requirement block below were rewritten earlier today while
// chasing a flat-vector, Landor-style bench. That was the wrong target for this product: the
// emblem style these produce — a symbol inside a shield or ring, stacked over the wordmark —
// is exactly what the Founder approved and what real trade businesses use. Direction 1's
// containing shape is a FEATURE, not the defect I mistook it for.
// Recovered byte-for-byte from the session-start disc, not retyped from memory.
var DIRECTIONS = [
  'Direction 1 — EMBLEM + WORDMARK: an iconic symbol that fuses one or two visual metaphors drawn from the business, set inside or above a dynamic containing shape (ring, shield, or badge), stacked over the wordmark.',
  'Direction 2 — INTEGRATED LETTERFORM: the first letter or a key letterform of the name transformed into the symbol itself, with the full wordmark beside or beneath it.',
  'Direction 3 — WORDMARK-FORWARD: the name as a powerful custom-drawn wordmark with one distinctive modified letter or embedded icon detail; small supporting symbol optional.'
];

function logoPrompt(name, seed, kit, concept, brief){
  var pal = (kit && kit.colors && kit.colors.length)
    ? (' Brand color palette (use these, dominant first): ' + kit.colors.slice(0, 3).map(function(c){ return (c && c.hex) || c; }).join(', ') + '.')
    : ' Choose a confident two-color brand palette plus black or white.';
  var psych = '';
  if (brief) {
    psych = ' BRAND PSYCHOLOGY (obey precisely):' +
      (brief.signal && brief.signal.must_signal ? ' The symbol\'s metaphors must come from: ' + j(brief.signal.must_signal, 3) + '.' : '') +
      (brief.world ? ' Overall feel: ' + (brief.world.feel || '') + '. Shape language: ' + (brief.world.shape_language || '') + '.' : '') +
      (brief.shift ? ' The mark must embody the AFTER state (' + brief.shift.after + '), never the before (' + brief.shift.before + ').' : '') +
      (brief.signal && brief.signal.cliches_to_avoid && brief.signal.cliches_to_avoid.length
        ? ' STRICTLY FORBIDDEN as the main idea: ' + j(brief.signal.cliches_to_avoid, 5) + '.' : '') +
      (brief.world && brief.world.forbidden_visuals && brief.world.forbidden_visuals.length
        ? ' Never depict: ' + j(brief.world.forbidden_visuals, 5) + '.' : '');
  }
  return 'Professional brand identity logo LOCKUP for a business named "' + name + '"' +
    (seed ? (' — the business: ' + String(seed).slice(0, 300)) + '.' : '.') + pal + psych +
    ' ' + DIRECTIONS[(concept - 1) % 3] +
    ' REQUIREMENTS: the wordmark must spell EXACTLY "' + name + '" — correct spelling, every letter, nothing added.' +
    ' Bold, modern, premium flat vector style; strong silhouette; dynamic and confident; custom typography with real character (angled cuts, motion, weight contrast) — never a plain default font.' +
    ' Clean solid white background, perfectly centered composition, generous margins.' +
    ' NO taglines, NO extra words beyond the business name, NO mockups, NO photographs, NO watermarks — a finished, gallery-quality logo an established brand would actually use.';
}

// ---- HERO / IMAGE MOMENTS: show the world AFTER the shift ----------------------------
function heroPrompt(seed, brief, aspectNote){
  if (!brief) return null; // caller falls back to the legacy engine prompt — parity
  var h = brief.human || {}, sh = brief.shift || {}, w = brief.world || {};
  return 'Premium cinematic brand photograph — a BRAND MOMENT: the human situation AFTER the emotional shift.' +
    ' The business: ' + String(seed || '').slice(0, 240) + '.' +
    ' The human: ' + (h.primary_audience || 'the customer') + ' — now ' + (sh.after || 'confident') + ', never ' + (sh.before || 'stressed') + '.' +
    ' Scene mood: ' + (w.feel || 'calm professional confidence') + '. Light: ' + (w.light || 'clean natural light') + '.' +
    ' Composition: ' + (w.composition || 'single focal idea, generous space') + '.' +
    (w.forbidden_visuals && w.forbidden_visuals.length ? ' Never depict: ' + j(w.forbidden_visuals, 5) + '.' : '') +
    ' No text, no logos, no watermarks.' + (aspectNote || '');
}

// ---- SVG BOARDS: precision print basics from brief tokens + the mark ------------------
function esc(t){ return String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function pick(kit, brief){
  var colors = (kit && kit.colors || []).map(function(c){ return (c && c.hex) || c; }).filter(Boolean);
  return { dom: colors[0] || '#171410', acc: colors[1] || '#A8802A', neu: '#FBF9F3',
           font: (kit && kit.typography && kit.typography.heading) || 'Georgia, serif',
           feel: (brief && brief.world && brief.world.feel) || '' };
}
function svgBoard(formatId, name, domain, kit, brief, markUrl){
  var r = registry.row(formatId); if (!r || r.engine !== 'svg') return null;
  var t = pick(kit, brief), W = r.spec.w, H = r.spec.h;
  var mark = markUrl ? '<image href="' + esc(markUrl) + '" x="' + (W * 0.06) + '" y="' + (H * 0.10) + '" width="' + (H * 0.32) + '" height="' + (H * 0.32) + '"/>' : '';
  var nm = esc(name), dm = esc(domain || '');
  if (formatId === 'business_card')
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<rect width="' + W + '" height="' + H + '" fill="' + t.neu + '"/>' +
      '<rect x="0" y="0" width="' + W + '" height="14" fill="' + t.acc + '"/>' + mark +
      '<text x="' + (W * 0.06) + '" y="' + (H * 0.62) + '" font-family="' + esc(t.font) + '" font-size="' + (H * 0.13) + '" font-weight="bold" fill="' + t.dom + '">' + nm + '</text>' +
      '<text x="' + (W * 0.06) + '" y="' + (H * 0.78) + '" font-family="' + esc(t.font) + '" font-size="' + (H * 0.07) + '" fill="' + t.acc + '">' + dm + '</text></svg>';
  if (formatId === 'letterhead')
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<rect width="' + W + '" height="' + H + '" fill="#FFFFFF"/>' +
      '<rect x="0" y="0" width="' + W + '" height="10" fill="' + t.dom + '"/>' + mark +
      '<text x="' + (W * 0.28) + '" y="' + (H * 0.115) + '" font-family="' + esc(t.font) + '" font-size="46" font-weight="bold" fill="' + t.dom + '">' + nm + '</text>' +
      '<text x="' + (W * 0.28) + '" y="' + (H * 0.145) + '" font-family="' + esc(t.font) + '" font-size="24" fill="' + t.acc + '">' + dm + '</text>' +
      '<rect x="' + (W * 0.06) + '" y="' + (H * 0.94) + '" width="' + (W * 0.88) + '" height="3" fill="' + t.acc + '"/></svg>';
  if (formatId === 'summary_sheet' || formatId === 'menu_board')
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + (formatId === 'summary_sheet' ? r.spec.h : H) + '" viewBox="0 0 ' + W + ' ' + (formatId === 'summary_sheet' ? r.spec.h : H) + '">' +
      '<rect width="100%" height="100%" fill="' + t.dom + '"/>' + 
      '<text x="50%" y="55%" text-anchor="middle" font-family="' + esc(t.font) + '" font-size="72" font-weight="bold" fill="' + t.neu + '">' + nm + '</text>' +
      '<text x="50%" y="78%" text-anchor="middle" font-family="' + esc(t.font) + '" font-size="30" fill="' + t.acc + '">' + dm + '</text></svg>';
  return null;
}

// ---- THE WORK ORDER: one instruction object, Law inline -------------------------------
function workOrder(input){ // { format, name, domain, seed, kit, brief, markUrl }
  var r = registry.row(input.format); if (!r) return { error: 'unknown format' };
  var wo = { format: r.id, engine: r.engine, spec: r.spec, physics: r.physics,
             law: { requireName: input.name || '', banned: schema.BANNED_TERMS }, pieces: r.spec.pieces || 1 };
  if (r.engine === 'image' || r.engine === 'tiles') {
    wo.prompts = [];
    if (r.id === 'logo_lockups') { for (var c = 1; c <= 3; c++) wo.prompts.push(logoPrompt(input.name, input.seed, input.kit, c, input.brief)); }
    else {
      var base = heroPrompt(input.seed, input.brief) || ('Premium cinematic brand photograph for: ' + String(input.seed || '').slice(0, 240) + '. No text, no logos.');
      var n = wo.pieces; var aspects = r.spec.aspects || [];
      for (var p = 0; p < n; p++) wo.prompts.push(base + (aspects[p] ? (' Aspect: ' + aspects[p] + '.') : (n > 1 ? (' Panel ' + (p + 1) + ' of ' + n + ' of one continuous scene.') : '')));
    }
    // LAW: claim floor on every assembled prompt (truth check applies to lockups only).
    wo.prompts = wo.prompts.map(function(pr){
      var lf = schema.lawFloor(pr, r.id === 'logo_lockups' ? { requireName: input.name } : null);
      return lf.pass ? pr : pr; // prompts are OURS: violations here indicate a build bug — surfaced by tests, never shipped silently
    });
  }
  if (r.engine === 'svg') wo.svg = svgBoard(r.id, input.name, input.domain, input.kit, input.brief, input.markUrl);
  if (r.engine === 'derived') wo.derive = r.id === 'avatar' ? { from: 'logoUrls[0]' } : { from: 'existing' };
  return wo;
}

module.exports = { workOrder: workOrder, logoPrompt: logoPrompt, heroPrompt: heroPrompt, svgBoard: svgBoard };
