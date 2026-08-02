// formatCatalog.js — MASTER ASSET CATALOG.
// Every supported deliverable format with its REAL production dimensions, bleed, DPI and
// suite. Dependency-free CommonJS so the pipeline, the spec resolver and the workbench can
// all read one source of truth instead of hardcoding sizes in three places.
//
// HONESTY NOTE (read before trusting a format):
//   render: 'canvas'  -> the existing compositor can produce this today (flat/photo artwork
//                        with composited type at the correct trim size).
//   render: 'spec'    -> dimensions and print specs are correct and usable, but this format
//                        needs layout work the current engine does not yet do (animated
//                        captions, multi-page PDFs, die-cut wraps, embroidery files).
// Nothing here claims a rendering capability the code does not have.
//
// units: 'in' = inches (print, bleed in inches, dpi applies) · 'px' = pixels (digital, no bleed)

function P(key, label, suite, w, h, dpi, bleed, render, note) {
  return { key: key, label: label, suite: suite, unit: 'in', w: w, h: h, dpi: dpi || 300,
           bleed: bleed == null ? 0.125 : bleed, render: render || 'canvas', note: note || '' };
}
function D(key, label, suite, w, h, render, note) {
  return { key: key, label: label, suite: suite, unit: 'px', w: w, h: h, dpi: 72, bleed: 0,
           render: render || 'canvas', note: note || '' };
}

var FORMATS = [
  // ---------------- 1. CREATOR & PODCASTER ----------------
  D('podcast_cover', 'Podcast episode cover art', 'creator', 3000, 3000),
  D('podcast_audiogram', 'Audiogram clip (9:16, animated captions)', 'creator', 1080, 1920, 'spec', 'needs waveform + caption animation'),
  D('youtube_thumbnail', 'YouTube thumbnail card', 'creator', 1280, 720),
  D('spotify_banner', 'Spotify show banner', 'creator', 2660, 1140),
  D('quote_card_square', 'Guest quote card (1:1)', 'creator', 1080, 1080),
  D('quote_card_vertical', 'Guest quote card (9:16)', 'creator', 1080, 1920),
  D('reel_cover', 'Reel / TikTok cover', 'creator', 1080, 1920),
  D('carousel_slide', 'Carousel slide (4:5)', 'creator', 1080, 1350),
  D('story_highlight', 'Story highlight cover', 'creator', 1080, 1080),
  D('link_in_bio', 'Link-in-bio brand card', 'creator', 1080, 1920),
  D('media_kit', 'Media kit (multi-page PDF)', 'creator', 1275, 1650, 'spec', 'multi-page PDF layout not yet built'),
  D('twitch_offline', 'Twitch offline banner', 'creator', 1920, 1080),
  D('twitch_panel', 'Twitch panel graphic', 'creator', 320, 100),
  D('twitch_alert', 'Alert box overlay', 'creator', 800, 600, 'spec', 'transparent animated overlay'),
  D('emote_frame', 'Emote framework tile', 'creator', 512, 512, 'spec', 'needs 3-size emote export set'),
  D('stream_schedule', 'Stream schedule grid', 'creator', 1080, 1350),

  // ---------------- 2. SOCIAL & DIGITAL ----------------
  D('meta_feed', 'Facebook / Instagram feed post (1:1)', 'social', 1080, 1080),
  D('meta_story', 'Story (9:16)', 'social', 1080, 1920),
  D('meta_landscape_ad', 'Meta landscape ad', 'social', 1200, 628),
  D('meta_carousel_card', 'Carousel ad card', 'social', 1080, 1080),
  D('event_cover', 'Event cover photo', 'social', 1920, 1005),
  D('linkedin_banner', 'LinkedIn company banner', 'social', 1584, 396),
  D('linkedin_article', 'Thought-leadership article header', 'social', 1200, 644),
  D('job_posting', 'Job posting graphic', 'social', 1200, 1200),
  D('infographic_slide', 'Infographic slide', 'social', 1080, 1350),
  D('iab_leaderboard', 'IAB leaderboard 728x90', 'display', 728, 90),
  D('iab_medium_rect', 'IAB medium rectangle 300x250', 'display', 300, 250),
  D('iab_half_page', 'IAB half page 300x600', 'display', 300, 600),
  D('iab_mobile_banner', 'IAB mobile banner 320x50', 'display', 320, 50),
  D('iab_large_rect', 'IAB large rectangle 336x280', 'display', 336, 280),
  D('iab_billboard', 'IAB billboard 970x250', 'display', 970, 250),
  D('iab_skyscraper', 'Wide skyscraper 160x600', 'display', 160, 600),

  // ---------------- 3. PRINT COLLATERAL & DIRECT MAIL ----------------
  P('business_card', 'Business card', 'print', 3.5, 2),
  P('business_card_square', 'Square business card', 'print', 2.5, 2.5),
  P('letterhead', 'Letterhead', 'print', 8.5, 11),
  P('envelope_10', 'Envelope #10', 'print', 9.5, 4.125),
  P('envelope_catalog', 'Catalog envelope 9x12', 'print', 12, 9),
  P('presentation_folder', 'Presentation folder', 'print', 18, 12, 300, 0.125, 'spec', 'die-cut with pockets'),
  P('notepad', 'Notepad', 'print', 5.5, 8.5),
  P('id_badge', 'ID badge', 'print', 3.375, 2.125),
  P('flyer_letter', 'Flyer 8.5x11', 'print', 8.5, 11),
  P('flyer_a4', 'Flyer A4', 'print', 8.27, 11.69),
  P('flyer_half', 'Half-page flyer', 'print', 5.5, 8.5),
  P('trifold_brochure', 'Tri-fold brochure', 'print', 11, 8.5, 300, 0.125, 'spec', 'needs panel-fold layout'),
  P('rack_card', 'Rack card', 'print', 4, 9),
  P('door_hanger', 'Door hanger', 'print', 4.25, 11, 300, 0.125, 'spec', 'die-cut hook'),
  P('deck_slide', 'Presentation slide (16:9)', 'print', 13.333, 7.5, 150, 0),
  P('postcard_4x6', 'Postcard 4x6', 'print', 6, 4),
  P('postcard_5x7', 'Postcard 5x7', 'print', 7, 5),
  P('postcard_eddm', 'EDDM postcard 6x11', 'print', 11, 6),
  P('gift_card', 'Gift card', 'print', 3.375, 2.125),
  P('loyalty_card', 'Loyalty punch card', 'print', 3.5, 2),
  P('vip_pass', 'VIP access pass', 'print', 3.5, 5.5),
  P('menu_card', 'Menu card', 'print', 8.5, 14),
  P('table_tent', 'Table tent', 'print', 4, 6, 300, 0.125, 'spec', 'folded two-sided'),

  // ---------------- 4. SIGNAGE & LARGE FORMAT ----------------
  P('banner_3x6', 'Vinyl banner 3x6 ft', 'signage', 72, 36, 100, 0.25),
  P('banner_4x8', 'Vinyl banner 4x8 ft', 'signage', 96, 48, 100, 0.25),
  P('yard_sign', 'Yard sign 18x24', 'signage', 24, 18, 150, 0.25),
  P('yard_sign_portrait', 'Yard sign 24x18 portrait', 'signage', 18, 24, 150, 0.25),
  P('a_frame', 'A-frame sandwich board insert', 'signage', 24, 36, 150, 0.25),
  P('realestate_rider', 'Real estate rider sign', 'signage', 24, 6, 150, 0.25),
  P('window_decal', 'Perforated window decal', 'signage', 36, 24, 150, 0.25, 'spec', 'perf-material proof'),
  P('wall_mural', 'Wall mural', 'signage', 96, 72, 100, 0.5, 'spec', 'tiled panel output'),
  P('hours_decal', 'Door hours / policy decal', 'signage', 8, 10, 300, 0.125),
  P('blade_sign', 'Hanging blade sign', 'signage', 24, 36, 150, 0.25),
  P('backdrop_8x8', 'Trade show backdrop 8x8 ft', 'signage', 96, 96, 100, 0.5),
  P('feather_flag', 'Feather flag', 'signage', 30, 138, 100, 0.5, 'spec', 'curved-edge template'),
  P('tablecloth', 'Table cloth drape front', 'signage', 72, 30, 100, 0.5, 'spec', 'wrap dieline'),
  P('rollup_banner', 'Roll-up pull-up banner 33x81', 'signage', 33, 81, 150, 0.25),

  // ---------------- 5. APPAREL, MERCH & PACKAGING ----------------
  P('tshirt_chest', 'T-shirt chest print', 'apparel', 12, 16, 300, 0),
  P('pocket_logo', 'Pocket logo print', 'apparel', 4, 4, 300, 0),
  P('hoodie_back', 'Hoodie back graphic', 'apparel', 14, 16, 300, 0),
  P('cap_embroidery', 'Cap flat embroidery layout', 'apparel', 5, 2.25, 300, 0, 'spec', 'thread-count limited'),
  P('apron_brand', 'Uniform apron branding', 'apparel', 10, 8, 300, 0),
  P('tumbler_wrap', 'Stainless tumbler wrap', 'merch', 9.3, 7.5, 300, 0.125, 'spec', 'conical dieline'),
  P('mug_wrap', 'Ceramic mug wrap', 'merch', 8.5, 3.5, 300, 0.125),
  P('coaster', 'Coaster print', 'merch', 4, 4),
  P('cocktail_napkin', 'Cocktail napkin', 'merch', 5, 5),
  P('tap_handle', 'Beer tap handle insert', 'merch', 2, 6),
  P('cup_sleeve', 'Coffee cup sleeve', 'packaging', 10.5, 2.25, 300, 0.125, 'spec', 'dieline required'),
  P('belly_band', 'Product box belly band', 'packaging', 20, 3),
  P('bag_seal', 'Takeout bag sticker seal', 'packaging', 3, 3),
  P('wine_label', 'Wine bottle label', 'packaging', 4, 3.5),
  P('product_label', 'Product label (round)', 'packaging', 2.5, 2.5, 300, 0.125, 'spec', 'round die'),
  P('hang_tag', 'Hang tag', 'packaging', 2, 3.5),
  P('shelf_talker', 'Shelf talker', 'packaging', 4, 6),
  P('counter_mat', 'Counter mat', 'packaging', 17, 11)
];

var BY_KEY = {};
FORMATS.forEach(function (f) { BY_KEY[f.key] = f; });

function get(key) { return BY_KEY[String(key || '').toLowerCase()] || null; }
function bySuite(suite) { return FORMATS.filter(function (f) { return f.suite === suite; }); }
function renderable() { return FORMATS.filter(function (f) { return f.render === 'canvas'; }); }
function specOnly() { return FORMATS.filter(function (f) { return f.render === 'spec'; }); }
function suites() { var s = {}; FORMATS.forEach(function (f) { s[f.suite] = (s[f.suite] || 0) + 1; }); return s; }

// Production spec for any format: pixel dimensions at the right DPI, plus bleed in both units.
function specFor(key) {
  var f = get(key); if (!f) return null;
  var pxW = f.unit === 'in' ? Math.round(f.w * f.dpi) : f.w;
  var pxH = f.unit === 'in' ? Math.round(f.h * f.dpi) : f.h;
  return { key: f.key, label: f.label, suite: f.suite, render: f.render, note: f.note,
           widthIn: f.unit === 'in' ? f.w : null, heightIn: f.unit === 'in' ? f.h : null,
           pixelW: pxW, pixelH: pxH, dpi: f.dpi, bleedIn: f.bleed,
           aspect: +(pxW / pxH).toFixed(4), orientation: pxW >= pxH ? 'landscape' : 'portrait' };
}

module.exports = { FORMATS: FORMATS, get: get, bySuite: bySuite, renderable: renderable,
                   specOnly: specOnly, suites: suites, specFor: specFor };
