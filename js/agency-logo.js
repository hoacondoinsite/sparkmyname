/* File: sandbox/js/agency-logo.js | 2026-07-17
   AGENCY-GRADE LOGO ENGINE — production. Pure, scalable, code-based vector art (SVG).
   No raster, no AI pixels. Geometry as native SVG primitives; typography as live SVG
   text in an editorial serif stack (one-click outline for press).
   Design discipline: monograms only (ruled-square, circle, stacked-serif, negative-space
   cut) + editorial wordmark lockup. Zero literal iconography.
   Split logic: this engine colors CLIENT BRAND KITS with the derived 3-color editorial
   palette (Ink / Paper / Accent). Site chrome keeps the SparkMyName ink-and-gold house
   palette elsewhere — this module never touches chrome.
   Exposes window.AGENCY_LOGO. */
(function () {
  var SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
  var NS = 'http://www.w3.org/2000/svg';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function normHex(c) {
    var v = (typeof c === 'string') ? c : (c && (c.hex || c.value)) || '';
    v = String(v).trim(); if (!/^#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(v)) return '';
    v = v.charAt(0) === '#' ? v : '#' + v;
    if (v.length === 4) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return v.toUpperCase();
  }
  function rgb(hex) { var h = hex.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function lum(hex) { var c = rgb(hex); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function sat(hex) { var c = rgb(hex), mx = Math.max.apply(0, c), mn = Math.min.apply(0, c); return mx === 0 ? 0 : (mx - mn) / mx; }
  /* Darken a colour toward black while keeping its hue (2026-07-30). A warm/pastel palette's
     "darkest" colour can still be a light coral, which makes an unreadable wordmark (e.g.
     #FF6F61 = 2.7:1 on white). Scaling every channel by the same factor preserves the hue and
     lands the colour at a target luminance so the mark always reads and still looks on-brand. */
  function scaleToLum(hex, target) {
    var c = rgb(hex), L = lum(hex);
    if (L <= target || L <= 0) return hex;
    var k = target / L;
    function ch(v) { return Math.max(0, Math.min(255, Math.round(v * k))); }
    return '#' + [ch(c[0]), ch(c[1]), ch(c[2])].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').toUpperCase();
  }
  function nameOf(hex) { try { return window.SMN_COLORS ? window.SMN_COLORS.nameOf(hex) : ''; } catch (e) { return ''; } }

  /* ---- initials: 1-2 letters, editorial ---- */
  function initials(name) {
    var words = String(name || '').trim().split(/\s+/).filter(function (w) { return !/^(the|and|&|of|a|an|co|inc|llc)$/i.test(w); });
    if (!words.length) words = ['B'];
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  /* ---- deterministic archetype from the name ---- */
  function hash(s) { var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  var MONO = ['ruled-square', 'circle', 'stacked', 'negcut'];
  function pickStyle(name) {
    var ini = initials(name);
    // two-letter marks read best boxed/cut; single letters can take any archetype
    if (ini.length > 1) { return [ 'ruled-square', 'negcut', 'stacked' ][hash(name) % 3]; }
    return MONO[hash(name) % MONO.length];
  }

  /* ---- SPLIT LOGIC: derive the restrained 3-color editorial palette from the kit ---- */
  function editorialPalette(kit) {
    kit = kit || {};
    var pool = [];
    (Array.isArray(kit.palettes) ? kit.palettes : []).forEach(function (p) {
      (Array.isArray(p && p.colors) ? p.colors : (Array.isArray(p) ? p : [])).forEach(function (c) { var h = normHex(c); if (h) pool.push(h); });
    });
    (Array.isArray(kit.colors) ? kit.colors : []).forEach(function (c) { var h = normHex(c); if (h) pool.push(h); });
    // de-dupe
    var seen = {}, uniq = [];
    pool.forEach(function (h) { if (!seen[h]) { seen[h] = 1; uniq.push(h); } });
    if (!uniq.length) uniq = ['#23262B', '#F1ECE3', '#B08D57'];
    var byLum = uniq.slice().sort(function (a, b) { return lum(a) - lum(b); });
    var ink = byLum[0];
    /* GUARANTEE A LEGIBLE INK (2026-07-30): the darkest palette colour can still be too light
       for wordmark text (a coral-only palette gave #FF6F61 = 2.7:1 on white). If the ink is not
       dark enough, darken it toward black on its own hue so the mark always reads. */
    if (lum(ink) > 90) ink = scaleToLum(ink, 72);
    var paper = byLum[byLum.length - 1];
    if (lum(paper) < 190) paper = '#F1ECE3'; // guarantee a true paper
    // accent = most chromatic that isn't ink/paper
    var accent = null, best = -1;
    uniq.forEach(function (h) {
      if (h === ink || h === paper) return;
      var s = sat(h) * (1 - Math.abs(lum(h) - 128) / 255); // favor mid, chromatic
      if (s > best) { best = s; accent = h; }
    });
    if (!accent) accent = (ink !== '#B08D57' && paper !== '#B08D57') ? '#B08D57' : '#7C2B34';
    /* The accent carries the dot and the rule; if the palette is pale it can be near-invisible
       on white (#FFBCBA = 1.6:1). Deepen it just enough to read, still brighter than the ink. */
    if (lum(accent) > 165) accent = scaleToLum(accent, 140);
    return {
      ink: ink, paper: paper, accent: accent,
      inkName: nameOf(ink) || 'Ink', paperName: nameOf(paper) || 'Paper', accentName: nameOf(accent) || 'Accent'
    };
  }

  /* ================= PURE-VECTOR MONOGRAM GEOMETRY ================= */
  /* every mark: square 200x200 viewBox, native primitives + serif text. */
  function markInner(style, ini, P, reverse) {
    var fg = reverse ? P.paper : P.ink, ac = P.accent, cx = 100, cy = 100;
    var fs = ini.length > 1 ? 66 : 92;
    var t = function (fill, size) { return '<text x="' + cx + '" y="' + cy + '" dy="0.34em" text-anchor="middle" font-family="' + SERIF + '" font-weight="500" font-size="' + (size || fs) + '" letter-spacing="' + (ini.length > 1 ? 2 : 0) + '" fill="' + fill + '">' + esc(ini) + '</text>'; };
    if (style === 'ruled-square') {
      var b = 150;
      return '<rect x="' + (cx - b / 2) + '" y="' + (cy - b / 2) + '" width="' + b + '" height="' + b + '" fill="none" stroke="' + ac + '" stroke-width="2"/>' + t(fg);
    }
    if (style === 'circle') {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="78" fill="none" stroke="' + ac + '" stroke-width="1.8"/>'
        + '<circle cx="' + cx + '" cy="22" r="2.6" fill="' + ac + '"/>' + t(fg);
    }
    if (style === 'negcut') {
      return '<rect x="18" y="34" width="164" height="118" fill="' + P.ink + '"/>'
        + '<rect x="18" y="146" width="164" height="8" fill="' + ac + '"/>'
        + t(P.paper, ini.length > 1 ? 62 : 84);
    }
    // stacked
    return '<text x="' + cx + '" y="86" text-anchor="middle" font-family="' + SERIF + '" font-weight="500" font-size="96" fill="' + fg + '">' + esc(ini) + '</text>'
      + '<line x1="' + (cx - 46) + '" y1="120" x2="' + (cx + 46) + '" y2="120" stroke="' + ac + '" stroke-width="2"/>';
  }
  function markSVG(spec, size, reverse) {
    var P = spec.palette, ini = spec.initials, style = spec.style;
    size = size || 512;
    var bg = reverse ? '<rect width="200" height="200" fill="' + P.ink + '"/>' : '';
    return '<svg xmlns="' + NS + '" width="' + size + '" height="' + size + '" viewBox="0 0 200 200" role="img" aria-label="' + esc(spec.name) + ' mark">'
      + bg + markInner(style, ini, P, reverse) + '</svg>';
  }
  /* circle-badge alternate (kept for the "badge" download slot) */
  function badgeSVG(spec, size) {
    var P = spec.palette, ini = spec.initials; size = size || 512;
    return '<svg xmlns="' + NS + '" width="' + size + '" height="' + size + '" viewBox="0 0 200 200" role="img" aria-label="' + esc(spec.name) + ' badge">'
      + '<circle cx="100" cy="100" r="96" fill="' + P.ink + '"/>'
      + '<circle cx="100" cy="100" r="82" fill="none" stroke="' + P.accent + '" stroke-width="1.4"/>'
      + '<text x="100" y="100" dy="0.34em" text-anchor="middle" font-family="' + SERIF + '" font-weight="500" font-size="' + (ini.length > 1 ? 60 : 84) + '" letter-spacing="' + (ini.length > 1 ? 2 : 0) + '" fill="' + P.paper + '">' + esc(ini) + '</text></svg>';
  }

  /* ---- editorial wordmark ---- */
  function wordmarkInner(name, P, reverse, tagline, W) {
    var fg = reverse ? P.paper : P.ink, ac = P.accent;
    var letters = String(name).toUpperCase();
    var fs = Math.max(20, Math.min(52, Math.floor((W - 120) / (letters.length * 0.66))));
    var cx = W / 2, baseY = tagline ? 84 : 92;
    var s = '<text x="' + cx + '" y="' + baseY + '" text-anchor="middle" font-family="' + SERIF + '" font-weight="500" font-size="' + fs + '" letter-spacing="' + (fs * 0.14).toFixed(1) + '" fill="' + fg + '">' + esc(letters) + '<tspan fill="' + ac + '">.</tspan></text>';
    s += '<rect x="' + (cx - 34) + '" y="' + (baseY + 16) + '" width="68" height="1.6" fill="' + ac + '"/>';
    if (tagline) s += '<text x="' + cx + '" y="' + (baseY + 42) + '" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="12" letter-spacing="3.6" fill="' + (reverse ? P.paper : P.ink) + '" opacity="0.7">' + esc(String(tagline).toUpperCase()) + '</text>';
    return s;
  }
  function wordmarkSVG(spec, w, h, reverse) {
    var P = spec.palette; w = w || 1200; h = h || 400;
    var bg = reverse ? '<rect width="' + w + '" height="' + h + '" fill="' + P.ink + '"/>' : '';
    // scale a 600x200 design space up to requested w/h via viewBox
    return '<svg xmlns="' + NS + '" width="' + w + '" height="' + h + '" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(spec.name) + ' wordmark">'
      + bg.replace('width="' + w + '" height="' + h + '"', 'width="600" height="200"')
      + wordmarkInner(spec.name, P, reverse, spec.tagline, 600) + '</svg>';
  }

  /* ---- primary lockup: mark stacked over wordmark ---- */
  function lockupSVG(spec, w, h, reverse) {
    var P = spec.palette; w = w || 1200; h = h || 600;
    var VW = 600, VH = 300;
    var bg = reverse ? '<rect width="' + VW + '" height="' + VH + '" fill="' + P.ink + '"/>' : '';
    var mark = '<g transform="translate(230,20) scale(0.70)">' + markInner(spec.style, spec.initials, P, reverse) + '</g>';
    var name = String(spec.name).toUpperCase();
    var fs = Math.max(18, Math.min(40, Math.floor((VW - 120) / (name.length * 0.66))));
    var wm = '<text x="300" y="232" text-anchor="middle" font-family="' + SERIF + '" font-weight="500" font-size="' + fs + '" letter-spacing="' + (fs * 0.16).toFixed(1) + '" fill="' + (reverse ? P.paper : P.ink) + '">' + esc(name) + '</text>'
      + '<rect x="270" y="248" width="60" height="1.6" fill="' + P.accent + '"/>';
    return '<svg xmlns="' + NS + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + VW + ' ' + VH + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(spec.name) + ' logo">'
      + bg + mark + wm + '</svg>';
  }

  /* ---- build a spec from a kit + name ---- */
  function spec(name, kit, tagline) {
    return {
      name: name || 'Brand',
      initials: initials(name),
      style: pickStyle(name),
      palette: editorialPalette(kit),
      tagline: tagline || ''
    };
  }

  /* embeddable mark as an SVG <g> (for stationery/social compositions) — 200x200 space */
  function markGroup(spec, x, y, scale, reverse) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (scale || 1) + ')">' + markInner(spec.style, spec.initials, spec.palette, reverse) + '</g>';
  }

  window.AGENCY_LOGO = {
    spec: spec,
    editorialPalette: editorialPalette,
    initials: initials,
    pickStyle: pickStyle,
    markSVG: markSVG,
    badgeSVG: badgeSVG,
    wordmarkSVG: wordmarkSVG,
    lockupSVG: lockupSVG,
    markGroup: markGroup,
    SERIF: SERIF
  };
})();
