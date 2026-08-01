// netlify/functions/ecommerce-verticals.js
//
// BUILD 34 — ECOMMERCE VERTICALS. "Ecommerce Brand" is too broad: a luxury brand and an
// outdoor brand should NOT draw from the same naming universe. This detects the ecommerce
// SUB-VERTICAL and gives it its own vocabulary / naming structures / examples / avoid list,
// injected into the name prompt. Plain "ecommerce brand" with no vertical signal returns
// nothing, so it falls back to the BUILD 33 generic ecommerce family-spread (unchanged).
//
// Scope: ECOMMERCE ONLY. It never fires for SaaS / cyber / AI, for service businesses
// (a retail signal is required), or for the protected identity categories (jewelry, florist,
// etc.) — those keywords are deliberately not vertical triggers, so their own handlers own them.

// A retail / brand signal must be present for ANY vertical to apply (keeps services out).
const RETAIL_SIGNAL = /ecommerce|e-?commerce|online (store|shop|brand)|\bbrand\b|\bstore\b|\bshop\b|\bdtc\b|\bd2c\b|retail|\bgoods\b|\bmerch\b|products?|boutique|shopify|watchmaker|\btimepiece|\bhorolog|wristwatch|\bsneaker|\bkicks\b|footwear/i;

// Specific-first. The PRODUCT type wins; "luxury" is a fallback tone when no product is named.
const VERTICALS = [
  // ---- BUILD 36: FASHION EXPERIENCE DNA (name the identity, not the stitching) ----
  // Ordered specific-garment-type FIRST so "luxury streetwear" -> streetwear, and these all
  // resolve before the generic fashion / luxury verticals below.
  {
    key: "streetwear",
    match: /streetwear|street wear|urban (wear|clothing|brand|apparel)|skate(wear| brand)|hype(beast)?|graphic tee/i,
    label: "streetwear brand",
    experience: true,
    feeling: "identity, culture, belonging, attitude, community — the feeling of being part of something.",
    vocabulary: ["district","culture","collective","block","union","signal","canvas","street","crew","society","division","league","parallel","uptown","riot","movement"],
    downweight: ["stitch","thread","hem","weave","fabric","seam","tailor"],
    structures: ["culture / place word (District, Block, Uptown)", "[word] + Culture / Collective / Union (District Culture, Block Union)", "single bold word (Signal, Canvas, Parallel)", "division / movement feel (Division, League, Movement)"],
    examples: ["District Culture", "Block Union", "Signal", "Canvas", "Parallel", "Crew Society", "Uptown"],
    avoid: ["Threadline", "Seamwork (construction names)", "literal 'wear' suffixes", "Couture"]
  },
  {
    key: "menswear",
    match: /\bmenswear\b|\bmen s (wear|clothing|apparel|fashion|style)|\bmens (wear|clothing|apparel)/i,
    label: "menswear brand",
    experience: true,
    feeling: "confidence, competence, presence, quiet style — the feeling of being put-together.",
    vocabulary: ["marlowe","ashford","weston","crest","heritage","standard","kingsley","oxford","harrow","bishop","wexford","hale","warden","clayton","bridger"],
    downweight: ["stitch","thread","hem","weave","fabric","seam","tailor","cut"],
    structures: ["heritage surname (Marlowe, Ashford, Weston)", "[surname] & Co (Weston & Co.)", "solid single word (Crest, Standard, Heritage)", "place-name (Oxford, Harrow)"],
    examples: ["Marlowe", "Ashford", "Weston & Co.", "Crest", "Heritage Standard", "Kingsley", "Oxford & Hale"],
    avoid: ["Threadline", "Cut & Stitch (construction names)", "literal 'mens'", "Gentleman (cliché)"]
  },
  {
    key: "womenswear",
    match: /\bwomenswear\b|\bwomen s (wear|clothing|apparel|fashion|style)|\bwomens (wear|clothing|apparel)/i,
    label: "womenswear brand",
    experience: true,
    feeling: "self-expression, beauty, confidence, identity — the feeling of becoming yourself.",
    vocabulary: ["velour","silhouette","luna","belle","vesper","aura","lumiere","muse","soleil","vienne","wren","marigold","rose","ivy","sable"],
    downweight: ["stitch","thread","hem","weave","fabric","seam","tailor","cut","drape"],
    structures: ["single luminous word (Velour, Luna, Aura)", "[word] + Lane / House (Aura Lane)", "French / Italian grace note (Belle, Soleil, Vienne)", "form-as-identity (Silhouette, Muse)"],
    examples: ["Velour", "Silhouette", "Luna", "Belle", "Aura Lane", "Vesper", "Muse", "Soleil"],
    avoid: ["Threadline", "Fabric & Form (construction names)", "literal 'womens'", "Diva (cliché)"]
  },
  {
    key: "childrens_clothing",
    match: /(children|kids?|toddler|baby|infant).{0,14}(cloth|wear|apparel|fashion|outfit|onesie)|(cloth|wear|apparel|outfit).{0,14}(children|kids?|toddler|baby|infant)/i,
    label: "children's clothing brand",
    experience: true,
    feeling: "joy, comfort, playfulness, gentle care — the feeling of a happy, cozy child.",
    vocabulary: ["little","sprout","cub","bramble","meadow","sunny","pip","bean","button","clover","hop","poppy","dandelion","wren","pebble","sprig","nimbus"],
    downweight: ["stitch","thread","hem","weave","fabric","seam","tailor"],
    structures: ["warm little word (Sprout, Clover, Pebble)", "Little + word (Little Sprout)", "playful pair (Pip & Bean, Hop & Poppy)", "nature / cozy (Bramble, Meadow, Sunny Lane)"],
    examples: ["Little Sprout", "Bramble", "Sunny Lane", "Pip & Bean", "Clover", "Hop & Poppy", "Pebble"],
    avoid: ["Threadline (construction)", "literal 'kids / baby / tots'", "saccharine ('Cutie', 'Adorable')"]
  },
  {
    key: "handbag",
    match: /handbag|\bpurse\b|\btote\b|\bclutch\b|leather goods|\bbag brand\b|crossbody/i,
    label: "handbag brand",
    experience: true,
    feeling: "desire, elegance, status, craft — the object you are proud to carry.",
    vocabulary: ["vesper","sable","marque","atelier","noir","belle","vienne","opaline","monarch","clasp","fold","satchel","lumiere","soleil","reign"],
    downweight: ["stitch","thread","seam","leather","fabric"],
    structures: ["single refined word (Vesper, Sable, Vienne)", "French house note — fashion only (Atelier, Marque, Maison)", "object-as-icon (Belle & Fold, Clasp)", "dark / material pair (Noir & Sable)"],
    examples: ["Vesper", "Sable", "Marque", "Belle & Fold", "Vienne", "Noir", "Atelier Soleil"],
    avoid: ["Threadline (construction)", "literal 'bags / totes'", "Luxe", "Premier"]
  },
  {
    key: "luxury_accessories",
    match: /luxury accessor|fine accessor|accessories brand|scarves|sunglasses brand|belts? brand|designer accessor/i,
    label: "luxury accessories brand",
    experience: true,
    feeling: "the finishing touch, refined taste, status, quiet confidence.",
    vocabulary: ["marque","vesper","opaline","sable","crest","lumiere","regalia","noir","vienne","soleil","monarch","reign","belle","atelier"],
    downweight: ["stitch","thread","seam","fabric"],
    structures: ["single refined word (Marque, Opaline, Crest)", "French grace note (Vienne, Soleil, Lumiere)", "heritage (Vesper, Regalia)", "dark / material pair (Noir & Sable)"],
    examples: ["Marque", "Vesper", "Opaline", "Crest", "Vienne", "Soleil", "Regalia"],
    avoid: ["Threadline (construction)", "literal 'accessories'", "Luxe", "Elite"]
  },
  {
    key: "luxury_fashion",
    match: /luxury fashion|haute couture|high fashion|designer (fashion|label|brand)|luxury (apparel|clothing)|couture (house|brand)/i,
    label: "luxury fashion brand",
    experience: true,
    feeling: "status, elegance, aspiration, exclusivity, refined taste — the feeling of arriving.",
    vocabulary: ["regalia","noir","vesper","sovereign","monarch","atelier","marque","sable","velvet","opaline","crest","lumiere","maison","reign"],
    downweight: ["stitch","thread","hem","weave","fabric","seam","tailor","cut","drape"],
    structures: ["single commanding word (Regalia, Noir, Sovereign)", "dark / material pair (Noir & Velvet)", "French house note — fashion only (Atelier, Maison, Marque)", "heritage surname (Marlowe, Vesper)"],
    examples: ["Regalia", "Noir & Velvet", "Vesper", "Sovereign", "Monarch", "Marque", "Maison Noir"],
    avoid: ["Threadline", "Stitchline", "Tailor & Weave (construction names)", "Luxe", "Elite", "Premier", "Sterling", "Ivory"]
  },
  {
    key: "watch",
    match: /watch (brand|company|maker|house)|watchmaker|\btimepiece|wristwatch|\bhorolog|chronograph (brand|company)?/i,
    label: "watch / timepiece brand",
    experience: true,
    feeling: "time, heritage, precision, legacy, craftsmanship — the feeling of owning something timeless. This is a WATCHMAKER, not a premium lifestyle brand.",
    vocabulary: ["chronos","aurel","tempus","meridian","heritage","horizon","atlas","north","solis","vesper","crown","axis","legacy","movement","hour","second"],
    downweight: ["lane","house","dwell","goods","collective","echo","noble"],
    structures: ["heritage name + Time / Chronograph / Timepiece (Aurel Time, North Chronograph)", "single timeless word (Tempus, Meridian, Chronos)", "founder-surname maison (Aurel & Co, Vesper)", "celestial / precision (Atlas, Solis, Axis)"],
    examples: ["Aurel Time", "Chronos & Co", "Heritage Hour", "Atlas Timepiece", "North Chronograph", "Tempus", "Meridian"],
    avoid: ["Noble Lane", "Echo House", "Dwell House (premium-lifestyle, NOT watchmaking)", "forced literal Watch / Clock", "Time-Co generic"]
  },
  {
    key: "sneaker",
    match: /sneaker|trainer brand|athletic (shoe|footwear)|\bkicks\b|running shoe|basketball shoe|footwear brand|performance footwear/i,
    label: "sneaker / athletic footwear brand",
    experience: true,
    feeling: "movement, energy, speed, performance, street culture, self-expression — the feeling of motion and identity. Think the energy of Nike / Adidas / Hoka / On / New Balance, not a quiet retail shop.",
    vocabulary: ["stride","velocity","pace","kinetic","pulse","bolt","dash","tempo","surge","rush","volt","momentum","flux","blaze","rebel","motion"],
    downweight: ["goods","house","supply","collective","canvas","co"],
    structures: ["short punchy power word (Bolt, Surge, Volt)", "motion word (Stride, Pace, Kinetic)", "coined athletic word (Strideon, Velo)", "one-syllable energy (Rush, Dash, Flux)"],
    examples: ["Stride", "Volt", "Kinetic", "Surge", "Pace", "Bolt", "Tempo", "Momentum"],
    avoid: ["District Goods", "Canvas House (generic retail - no energy)", "[Word] Footwear literal", "tired Co / Supply suffixes"]
  },
  {
    key: "beauty",
    match: /beauty|cosmetic|skincare|skin care|makeup|make-up|serum|fragrance|perfume|lipstick|haircare/i,
    label: "beauty / skincare / cosmetics brand",
    vocabulary: ["glow","dew","lustre","bloom","blush","velvet","silk","rouge","balm","tint","sheer","radiance","petal","luminous","satin","veil"],
    structures: ["single luminous word (Lustre, Dewy, Veil)", "botanical pair (Petal & Balm)", "soft French note used sparingly (Rouge, Velour)", "a coined, silky word (Lumelle, Sevra)"],
    examples: ["Lustre", "Dewy", "Petal & Balm", "Velour", "Sheer", "Lumelle", "Rouge & Rose", "Satin Hour"],
    avoid: ["beauty (literal)", "cosmetics (literal)", "glow (overused)", "atelier", "maison", "collective", "luxe"]
  },
  {
    key: "wellness",
    match: /wellness|supplement|vitamin|self.?care|nutrition|mindful|holistic|herbal|adaptogen|nootropic|probiotic|protein/i,
    label: "wellness / supplements / self-care brand",
    vocabulary: ["calm","balance","root","vital","restore","source","pure","bloom","sage","dew","harmony","replenish","still","ease","nourish","kindle","roots","daily"],
    structures: ["single calming word (Restore, Vital, Ease)", "nature pair (Root & Bloom, Sage & Dew)", "outcome-led (Replenish, Nourish)", "a coined gentle word (Vively, Soma)"],
    examples: ["Vital", "Restore", "Root & Bloom", "Sage & Dew", "Replenish", "Stillwater", "Kindle", "Soma"],
    avoid: ["thrive (cliché)", "wellness (literal)", "health (literal)", "pure (overused)", "glow", "vitality (stiff)"]
  },
  {
    key: "pet",
    match: /\bpet\b|\bdog\b|\bcat\b|puppy|kitten|canine|feline|pet food|pet suppl|pet products?/i,
    label: "pet products brand",
    vocabulary: ["paw","tail","fetch","snout","whisker","romp","pounce","den","pack","wag","scout","buddy","kibble","trot","nuzzle","fur"],
    structures: ["playful single word (Romp, Fetch, Wag)", "warm pair (Paw & Tail)", "[pet word] + Club/Co", "a coined friendly word (Snouty, Wagley)"],
    examples: ["Romp", "Fetch Club", "Paw & Tail", "Wagworthy", "Snout", "The Pack", "Pounce", "Trot & Co"],
    avoid: ["pet (literal)", "furry (generic)", "paws (overused)", "luxury words", "atelier", "maison"]
  },
  {
    key: "outdoor",
    match: /outdoor|camping|hiking|adventure|backpack|trail|gear|expedition|wilderness|climbing|fishing|tactical|overland|camp|hike/i,
    label: "outdoor / gear / adventure brand",
    vocabulary: ["trail","ridge","basecamp","alpine","timber","granite","frontier","wildland","north","range","backcountry","expedition","current","drift","field","stone","trailhead"].filter(w=>w.indexOf("-NO")<0),
    structures: ["single rugged word (Timber, Granite, Alpine)", "place / direction (Basecamp, Northbound, Ridgeline)", "[outdoor word] + Supply / Outfitters", "a coined wild word (Wendl, Korr)"],
    examples: ["Timberline", "Basecamp", "Granite Supply", "Backcountry", "Northbound", "Wildland", "Ridgeline", "Trailhead"],
    avoid: ["Summit", "Apex", "Peak", "Pinnacle (all cliché-banned)", "adventure (literal)", "outdoor (literal)", "gear (literal)"]
  },
  {
    key: "home_decor",
    match: /home decor|homeware|furniture|interior|decor|furnishing|bedding|linens?|kitchenware|tableware|\brug\b|ceramic|pottery|candle|home goods/i,
    label: "home decor / homeware / interiors brand",
    vocabulary: ["dwell","abode","nest","room","table","linen","clay","oak","stone","hue","mantel","alcove","loom","weave","threshold","hearthstone","earthen","craft"],
    structures: ["single warm word (Dwell, Abode, Mantel)", "material pair (Clay & Oak, Stone & Linen)", "[home word] + House / Studio", "a coined homey word (Hearthen, Roomly)"],
    examples: ["Dwell", "Abode", "Clay & Oak", "Mantel", "Linen & Loom", "Threshold", "Earthen", "The Dwelling"],
    avoid: ["maison", "atelier", "collective", "goods", "decor (literal)", "living (generic)", "home (literal)"]
  },
  {
    key: "fashion",
    match: /fashion|clothing|apparel|wardrobe|garment|denim|knitwear|footwear|sneaker|outfit|loungewear|activewear|dress brand/i,
    label: "fashion / apparel brand",
    experience: true,
    feeling: "identity, style, confidence, self-expression — the feeling of who you are when you wear it.",
    vocabulary: ["marlowe","vesper","luna","district","aura","muse","belle","weston","crest","silhouette","heritage","soleil","canvas","reign","wren","velour"],
    downweight: ["stitch","thread","hem","weave","fabric","seam","tailor","cut","drape","form"],
    structures: ["heritage surname (Marlowe, Weston, Ashford)", "single evocative word (Vesper, Luna, Aura)", "culture / place (District, Canvas)", "[word] + Lane / Co / House (Aura Lane, Weston & Co.)"],
    examples: ["Marlowe", "Vesper", "Luna", "District", "Aura Lane", "Weston & Co.", "Muse", "Silhouette"],
    avoid: ["Threadline", "Stitchline", "Seamwork", "Tailor & Weave", "Cut & Stitch (these name construction, not identity)", "atelier", "maison", "label", "collective", "couture"]
  },
  {
    key: "luxury",
    match: /luxury|premium|fine|heritage|haute|bespoke|high.?end|prestige|luxe/i,
    label: "luxury / premium goods brand",
    vocabulary: ["noir","velvet","opaline","sable","onyx","crest","marque","vesper","lustre","regalia","ardent","ember","obsidian","gilt","sovereign","jet"],
    structures: ["single rich word (Noir, Sable, Opaline)", "surname-heritage (Ashford, Beaumont, Sinclair)", "dark/material pair (Velvet & Onyx)", "a coined refined word (Velmonte, Noira)"],
    examples: ["Noir", "Sable", "Opaline", "Ashford", "Velvet & Onyx", "Marque", "Beaumont", "Obsidian"],
    avoid: ["Sterling", "Ivory", "Atelier", "Maison", "Collective (all generic-banned)", "Luxe (cliché)", "Elite", "Premier", "Royal (literal)"]
  }
];

function normalize(s = "") { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

// Returns the matched vertical object, or null (not a specific ecommerce vertical).
function detectVertical(seed = "") {
  const t = normalize(seed);
  if (!RETAIL_SIGNAL.test(t)) return null;        // require a retail/brand signal (keeps services out)
  for (let i = 0; i < VERTICALS.length; i++) {
    if (VERTICALS[i].match.test(t)) return VERTICALS[i];
  }
  return null;                                     // generic ecommerce -> BUILD 33 family-spread handles it
}

function buildVerticalPromptBlock(seed = "") {
  const v = detectVertical(seed);
  if (!v) return "";
  const feelingLine = v.feeling
    ? `\nCUSTOMER FEELING — name THIS (the why-they-buy), not the product mechanics:\n${v.feeling}\n`
    : "";
  const expLine = v.experience
    ? `This is an EXPERIENCE category. Name the IDENTITY the customer wears and the feeling it gives them — never how the product is made. A name that describes construction or material is a miss.\n`
    : `It must read unmistakably as ${v.label} — clearly different from any other ecommerce vertical.\n`;
  const downLine = (Array.isArray(v.downweight) && v.downweight.length)
    ? `\nDOWN-WEIGHT (use rarely, NEVER lead with these — they describe how it is MADE, not why people buy):\n${v.downweight.join(", ")}\n`
    : "";
  return `

ECOMMERCE VERTICAL — ${v.label.toUpperCase()}

"Ecommerce" is too broad; name from THIS vertical's specific world, not a generic DTC universe.
${expLine}${feelingLine}
Vocabulary to mine (lead with these — the identity / feeling words):
${v.vocabulary.join(", ")}
${downLine}
Naming structures (vary across these):
- ${v.structures.join("\n- ")}

Good examples (the caliber, not to copy):
${v.examples.join(" · ")}

Avoid (drift / generic / cliché):
${v.avoid.join(", ")}

Rule: a name for this brand should feel unmistakably like THIS vertical, and should NOT be
interchangeable with the generic ecommerce words (Ember, Lumen, Nomad, Daily, Edit, Collective, Cove).
`;
}

module.exports = { VERTICALS, RETAIL_SIGNAL, detectVertical, buildVerticalPromptBlock };
