// logo-test.js — ONE-OFF maxed cinematic logo test. Two brands, several styles.
// ?style=  cinematic | sparkmyname | wordmark | monogram | emblem   (default cinematic)
// Confirm -> Generate (?go=yes) -> ONE logo, cached per style. Re-visit = free.
// "Re-roll" (&fresh=1) deliberately re-spends. Standalone test only.
var engine = require('./studio-engine.js');
var storage = require('./sb-storage.js');
var SB_URL = process.env.SUPABASE_URL;

var STYLES = {
  cinematic: {
    brand: 'Cornerstone Smiles', label: 'Cornerstone \u2014 Cinematic', ar: '16:9', size: '2K', cost: '$0.13',
    prompt: 'A drop-dead gorgeous, over-the-top, ultra-premium CINEMATIC brand logo for a luxury dental practice named "Cornerstone Smiles", perfectly centered, 16:9, flagship quality. ' +
            'A single breathtaking emblem: a sculpted cornerstone block in polished deep-teal enamel with brushed-gold metallic bevelled edges and a soft luminous inner glow, ' +
            'a radiant gold smile-arc sweeping above it with a delicate light flare and lens bloom, rendered with rich dimensional depth, faceted reflections, and gentle volumetric studio lighting. ' +
            'Beneath the emblem, the words "Cornerstone Smiles" in an exquisite, perfectly-kerned modern serif with a polished brushed-metal-and-enamel finish, deep navy and warm gold catching soft light. ' +
            'Materials and finishes: polished enamel, brushed gold, liquid metal, glossy ceramic, mother-of-pearl shimmer, faint inner glow and bloom, crisp specular highlights. ' +
            'Background: a soft graduated off-white-to-pale-teal field with cinematic rim light, subtle bokeh sparkle, and elegant negative space. ' +
            'Museum-grade luxury-brand craft, flawless immaculate typography spelled correctly, timeless and jaw-dropping. No clutter, no props, no scene \u2014 one single finished logo.'
  },
  sparkmyname: {
    brand: 'SparkMyName', label: 'SparkMyName \u2014 Cinematic (homepage)', ar: '16:9', size: '2K', cost: '$0.13',
    prompt: 'A drop-dead gorgeous, over-the-top, ultra-premium CINEMATIC brand logo for a modern AI brand-naming company named "SparkMyName", perfectly centered, 16:9, flagship quality, designed to sit at the top of a premium deep-navy website. ' +
            'A single breathtaking emblem: a radiant electric-blue spark igniting \u2014 a luminous burst of light and energy with a glowing white-hot core, brilliant blue-white sparks arcing outward, and a soft cinematic lens flare, rendered with rich dimensional depth, crisp specular highlights, and gentle volumetric lighting. ' +
            'Beneath the emblem, the word "SparkMyName" in an exquisite, perfectly-kerned modern geometric sans-serif with a polished liquid-glass-and-chrome finish, deep navy and vivid electric blue catching soft light. ' +
            'Materials and finishes: liquid glass, brushed chrome, luminous electric-blue energy, glowing filament, subtle inner glow and bloom, sharp reflections. ' +
            'Background: a deep navy #07172F to royal-blue #0B5FFF graduated field with cinematic rim light, floating bokeh light-sparkles, and elegant negative space \u2014 matching a sleek premium navy website hero. ' +
            'Museum-grade luxury-tech craft, flawless immaculate typography spelled correctly, timeless and jaw-dropping. No clutter, no props, no scene \u2014 one single finished logo.'
  },
  wordmark: {
    brand: 'Cornerstone Smiles', label: 'Cornerstone \u2014 Wordmark', ar: '1:1', size: '2K', cost: '$0.13',
    prompt: 'An ultra-minimal, luxury typographic LOGO WORDMARK for "Cornerstone Smiles", a high-end dental practice. ONLY the two words "Cornerstone Smiles" set in a refined, perfectly-kerned modern typeface, spelled correctly, deep navy on flat white. No symbol, no icon, no tagline. Flawless typography, generous white space, flat vector look, timeless. Centered.'
  },
  monogram: {
    brand: 'Cornerstone Smiles', label: 'Cornerstone \u2014 Monogram', ar: '1:1', size: '2K', cost: '$0.13',
    prompt: 'A refined, minimal MONOGRAM LOGO for "Cornerstone Smiles": an elegant interlocking "CS" mark, deep navy with one subtle gold accent on flat white, with the small correctly-spelled wordmark "Cornerstone Smiles" beneath. Luxury, flat vector, abundant negative space, no clutter. Centered.'
  },
  emblem: {
    brand: 'Cornerstone Smiles', label: 'Cornerstone \u2014 Emblem', ar: '1:1', size: '2K', cost: '$0.13',
    prompt: 'A premium, minimal EMBLEM LOGO for "Cornerstone Smiles": one simple symbol fusing a cornerstone block with a gentle smile arc, with the correctly-spelled wordmark "Cornerstone Smiles". Restrained like an Apple or Nike mark, flat vector, deep navy plus one warm accent on flat white. Centered.'
  }
};

function styleKey(q) { var s = String((q && q.style) || 'cinematic').toLowerCase(); return STYLES[s] ? s : 'cinematic'; }
function pathFor(s) { return 'logos/test-' + s + '.png'; }
function pubUrl(p) { return SB_URL + '/storage/v1/object/public/' + storage.BUCKET + '/' + p; }
async function exists(url) { try { var r = await fetch(url, { method: 'HEAD' }); return r.status >= 200 && r.status < 300; } catch (e) { return false; } }

function styleNav(cur) {
  var out = '<div style="margin-top:22px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
  for (var k in STYLES) { var on = (k === cur);
    out += '<a href="?style=' + k + '" style="text-decoration:none;font-weight:700;font-size:12.5px;padding:9px 13px;border-radius:999px;border:1px solid ' + (on ? '#0B5FFF' : 'rgba(255,255,255,.25)') + ';color:' + (on ? '#fff' : 'rgba(255,255,255,.82)') + ';background:' + (on ? '#0B5FFF' : 'transparent') + '">' + STYLES[k].label + '</a>';
  }
  return out + '</div>';
}
function shell(inner) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Logo test</title></head><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;background:#07172F;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center">' +
    '<div style="max-width:640px;padding:34px 26px;text-align:center">' + inner + '</div></body></html>';
}
function html(body) { return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: shell(body) }; }
function logoView(url, label, sk) {
  return '<div style="font:800 12px/1 Arial;letter-spacing:.16em;color:#5AA0FF;text-transform:uppercase">' + label + '</div>' +
    '<h1 style="font-size:26px;margin:12px 0 18px">' + STYLES[sk].brand + '</h1>' +
    '<img src="' + url + '" alt="' + STYLES[sk].brand + ' logo" style="max-width:100%;border-radius:18px;background:#fff;padding:10px;box-shadow:0 22px 64px rgba(0,0,0,.45)">' +
    '<p style="opacity:.8;font-size:13px;margin-top:16px;line-height:1.5">Re-visiting is free. Check the lettering closely.</p>' +
    styleNav(sk) +
    '<div style="margin-top:14px"><a href="?style=' + sk + '&go=yes&fresh=1" style="color:#5AA0FF;font-weight:700;text-decoration:none;font-size:13px">\u21bb Re-roll this one (' + STYLES[sk].cost + ' again)</a></div>';
}

exports.handler = async function (event) {
  if (!SB_URL) return html('<h1>Not configured</h1>');
  var q = (event.queryStringParameters || {});
  var sk = styleKey(q);
  var fresh = (q.fresh === '1' || q.fresh === 'yes');
  await storage.ensureBucket();
  var url = pubUrl(pathFor(sk));

  if (!fresh && await exists(url)) return html(logoView(url + '?v=' + Date.now(), STYLES[sk].label + ' \u2014 cached (free)', sk));

  if (q.go !== 'yes') {
    return html('<h1 style="font-size:25px;margin:0 0 8px">Logo test</h1>' +
      '<p style="opacity:.88;font-size:14px;line-height:1.5">Pick one, then generate <b>one</b> logo. Every option is 2K (~$0.13) \u2014 perfect for web. Charged once, then cached. Two cinematic flagships up top: <b>Cornerstone Smiles</b> and <b>SparkMyName</b> (homepage).</p>' +
      styleNav(sk) +
      '<div style="margin-top:22px"><a href="?style=' + sk + '&go=yes" style="display:inline-block;background:#0B5FFF;color:#fff;text-decoration:none;font-weight:800;padding:15px 28px;border-radius:999px;font-size:16px">Generate this one (~' + STYLES[sk].cost + ') \u2192</a></div>');
  }

  try {
    var img = await engine.generateImage(STYLES[sk].prompt, { allowPreview:true, geminiModels: ['gemini-3-pro-image-preview','gemini-2.5-flash-image'], imageSize: STYLES[sk].size, aspectRatio: STYLES[sk].ar });
    if (!(img && img.ok && img.b64)) return html('<h1 style="font-size:22px">Could not generate</h1><p style="opacity:.85;font-size:13px">' + (img && img.error ? String(img.error).slice(0, 320) : 'Unknown error') + '</p>' + styleNav(sk));
    var up = await storage.uploadPng(pathFor(sk), img.b64, img.mime || 'image/png');
    if (!(up && up.ok)) return html('<h1 style="font-size:22px">Upload failed</h1><p style="opacity:.85;font-size:13px">' + String((up && up.error) || '').slice(0, 200) + '</p>');
    return html(logoView(up.url + '?v=' + Date.now(), 'Fresh \u00b7 ' + STYLES[sk].label + ' \u00b7 ' + STYLES[sk].size, sk));
  } catch (e) {
    return html('<h1 style="font-size:22px">Error</h1><p style="opacity:.85;font-size:13px">' + String(e && e.message || e).slice(0, 320) + '</p>');
  }
};
