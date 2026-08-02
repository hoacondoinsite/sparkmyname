// templateRegistry.js — CURATED EXCELLENCE.
// Deterministic, pre-designed archetypes per core industry. This is the authoritative source
// for scene direction, layout geometry and the 8-second video hook, so every render is
// predictable instead of a fresh guess. Free-form generation is now the FALLBACK, not the
// default: if an industry matches an archetype here, the archetype wins.
//
// Dependency-free CommonJS so both the Netlify pipeline and the reel producer can require it.
//
// HOUSE LAWS BAKED IN:
//  - Every scene is BRIGHT, positive and commercial. No moody/gritty/somber direction.
//  - Every scene is TEXTLESS. The model paints no words; code composites all copy.
//  - Layout geometry is fixed per archetype, so type never lands in a new place by chance.

var ARCHETYPES = [
  {
    key: 'restaurant',
    match: /restaurant|pizza|food|cafe|coffee|bakery|deli|bistro|sushi|steak|brew|bar|tavern|catering|juice|ice cream|creamery|butcher|cheese|winery|cidery|distiller|taproom|truck/,
    scene: 'A bright, appetizing hero of the food itself, beautifully plated and freshly made, in a clean inviting shop or kitchen. Crisp natural daylight, rich saturated color, shallow depth of field, steam or freshness visible, warm and appetizing. Happy, relaxed atmosphere.',
    layout: { composition: 'unified', badgePosition: 'middle', itemStyle: 'list', maxItems: 36, calloutStyle: 'badge' },
    hook8: 'An irresistible 8-second food hero: slow push-in on the signature item, glistening and fresh, bright daylight, vivid color, a hand reaching in, a genuinely delighted first bite. Upbeat, mouth-watering, premium commercial advertising film.'
  },
  {
    key: 'fitness',
    match: /fitness|gym|yoga|pilates|martial|dance|climb|crossfit|training|sport|tennis|golf|surf|ski|run|cycle|bike/,
    scene: 'A high-energy training moment in a clean, well-lit modern facility. Strong daylight or bright gym lighting, vivid color, real people mid-movement, sweat and effort but joyful and empowering, sense of progress and community.',
    layout: { composition: 'unified', badgePosition: 'middle', itemStyle: 'list', maxItems: 12, calloutStyle: 'badge' },
    hook8: 'An electric 8-second fitness hook: powerful movement in bright light, fast confident cuts, real effort and a triumphant finish, energising and aspirational. Premium commercial advertising film.'
  },
  {
    key: 'property',
    match: /real estate|realty|property|apartment|rental|lodging|hotel|inn|resort|cabin|campground|storage|staging|marina|moving/,
    scene: 'A stunning, sunlit property hero: immaculate interior or striking exterior, golden natural light pouring in, generous space, tasteful furnishing, aspirational and welcoming. Clean lines, inviting, the feeling of arriving somewhere wonderful.',
    layout: { composition: 'unified', badgePosition: 'lower', itemStyle: 'list', maxItems: 10, calloutStyle: 'pill' },
    hook8: 'A cinematic 8-second property reveal: smooth gliding move through a sunlit space, light blooming through windows, immaculate and aspirational, ending on a wide hero shot. Premium real-estate advertising film.'
  },
  {
    key: 'retail',
    match: /retail|shop|boutique|store|gift|florist|book|candle|soap|antique|pottery|nursery|garden|market|grocery|jewel|apparel|fashion|bridal|toy|pet boutique/,
    scene: 'A beautifully merchandised shop interior, bright and colorful, products styled and abundant, warm daylight, a browsing customer smiling. Clean, curated, joyful and inviting — a place you want to walk into.',
    layout: { composition: 'unified', badgePosition: 'middle', itemStyle: 'grid', maxItems: 24, calloutStyle: 'badge' },
    hook8: 'A charming 8-second retail hook: bright shelves and beautiful products in crisp daylight, a hand lifting an item, a delighted smile, warm and colorful. Premium lifestyle advertising film.'
  },
  {
    key: 'services',
    match: /roof|plumb|electric|hvac|clean|landscap|lawn|pest|paint|contractor|repair|auto|masonry|carpentry|tree|pool|solar|moving|handyman|window|sign|print/,
    scene: 'A confident professional at work in bright daylight, clean uniform, quality tools, visible craftsmanship and a spotless finished result. Blue sky, crisp color, competent and trustworthy, a genuinely pleased homeowner nearby.',
    layout: { composition: 'unified', badgePosition: 'lower', itemStyle: 'list', maxItems: 10, calloutStyle: 'pill' },
    hook8: 'A confident 8-second trade hook: a skilled professional working in bright sunlight, a satisfying before-to-after reveal of the finished job, clean and impressive, ending on a happy customer. Premium commercial advertising film.'
  }
];

var DEFAULT_ARCHETYPE = {
  key: 'default',
  scene: 'A bright, welcoming hero image of this business at its best: crisp natural daylight, vivid saturated color, clean and professional, real people looking genuinely pleased. Positive, energetic and inviting.',
  layout: { composition: 'unified', badgePosition: 'middle', itemStyle: 'list', maxItems: 12, calloutStyle: 'badge' },
  hook8: 'A bright, energetic 8-second brand hook for this business: confident camera movement, vivid daylight, real people enjoying the experience, ending on an impressive hero shot. Premium commercial advertising film.'
};

// Every archetype inherits these — the non-negotiables.
var LAWS = ' Absolutely no text, letters, numbers, words, logos, signage or watermarks anywhere in frame. Never dark, moody, gloomy, somber, gritty or melancholy — this is advertising built to attract customers.';

function archetypeFor(industry) {
  var i = String(industry || '').toLowerCase();
  for (var n = 0; n < ARCHETYPES.length; n++) {
    if (ARCHETYPES[n].match.test(i)) return ARCHETYPES[n];
  }
  return DEFAULT_ARCHETYPE;
}

// Deterministic scene direction for the still-image pipeline.
function sceneFor(industry, extra) {
  var a = archetypeFor(industry);
  return a.scene + (extra ? ' ' + extra : '') + LAWS;
}

// Deterministic layout geometry — type lands in the same place every time.
function layoutFor(industry) {
  var a = archetypeFor(industry);
  var l = a.layout;
  return { template: a.key, composition: l.composition, badgePosition: l.badgePosition,
           itemStyle: l.itemStyle, maxItems: l.maxItems, calloutStyle: l.calloutStyle };
}

// Deterministic 8-second video hook prompt.
function hookFor(industry, brandName, headline) {
  var a = archetypeFor(industry);
  var who = brandName ? (' for ' + brandName) : '';
  var what = headline ? (' The story: ' + headline + '.') : '';
  return a.hook8 + who + '.' + what + LAWS;
}

module.exports = { archetypeFor: archetypeFor, sceneFor: sceneFor, layoutFor: layoutFor,
                   hookFor: hookFor, ARCHETYPES: ARCHETYPES, DEFAULT_ARCHETYPE: DEFAULT_ARCHETYPE };
