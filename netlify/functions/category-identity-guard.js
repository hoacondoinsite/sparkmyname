// netlify/functions/category-identity-guard.js
//
// PROOF PATCH — CATEGORY IDENTITY FIRST, STYLE SECOND.
// Patches 8 hard categories only. Does NOT rebuild the generator or replace
// the 50-category DNA library. It layers a deterministic identity guard on top:
//   1) injects a "category identity first" block into the NAME prompt,
//   2) penalises / drops names that drift out of the category (banned tokens,
//      missing required category anchor) at generation, judge, and curation,
//   3) feeds the judge and the kit a per-category world cue.
//
// SCALE-SAFE NOTE (adaptation, see header in continuity): applyIdentityGuard is
// called against TWO different score scales in this codebase:
//   - generate-names.js : brand "score" is 0-100  -> call with scaleMax = 100
//   - deliver-background.js : judge score is 1-5 on field "judge" -> scaleMax = 5, field "judge"
// The spec's original call shape applyIdentityGuard(list, seed) still works
// unchanged (defaults: scaleMax = 5, scoreField = null, reads/writes .score).

const PROFILES = {
  thai_restaurant: {
    match: [/thai/i],
    anchorRequirement: "strict",
    anchors: [
      "thai","siam","soi","lanna","isan","bangkok","jasmine","lemongrass","lime","basil",
      "chili","coconut","mango","lotus","monsoon","khlong","suan","talat","sabai","aroy",
      "golden","river","garden","market","night","orchid","spice"
    ],
    // raw ingredient words used ONLY by the literal-stack detector (not the same as anchors):
    // a Thai name should evoke place / warmth, not read like a recipe.
    ingredientWords: [
      "jasmine","basil","chili","lemongrass","galangal","coconut","lime","ginger","mint",
      "rice","spice","curry","bamboo","soy","pepper","peanut","mango","papaya","tamarind"
    ],
    banned: [
      "sterling","ivory","fig","olive","crimson","maison","atelier","collective",
      "goods","label","apex","summit","pinnacle"
    ],
    neighbors: ["generic restaurant", "french bistro", "italian restaurant", "mediterranean restaurant"],
    world: "Thai place and warmth — Bangkok streets (soi), Siam, Lanna and Isan regions, the night market, canalside (khlong), the Land of Smiles. Evoke the FEELING of Thai dining, not a list of ingredients.",
    patterns: [
      "Thai place / street: Soi Nine, Siam Supper, Bangkok Mornings, Isan Table",
      "one evocative Thai-rooted word: Sabai, Aroy, Siam, Lotus, Monsoon",
      "[Thai concept] + warm English noun: Jasmine House, The Golden Soi, Night Market",
      "AT MOST one ingredient word, used evocatively (Lotus & Lime) — never a stack"
    ],
    extraRules: [
      "Do NOT build names by stacking raw ingredient words (no 'Basil Lemongrass Chili' recipe lists).",
      "Favor a name a Thai person recognizes as Thai AND a non-Thai can say and remember; evoke place, warmth, or hospitality."
    ],
    goodExamples:["Soi Nine", "Jasmine House", "Lotus & Lime", "Bangkok Mornings", "The Golden Soi", "Sabai", "Monsoon Kitchen", "Siam Supper"],
    badExamples: ["Bamboo Basil Soy Spice", "Ivory Maison", "Fig & Olive", "Apex Dining"],
    kitFeel: "feel unmistakably Thai — Thai dining, warm hospitality, the Land of Smiles; bright and welcoming, NOT a recipe and NOT generic premium."
  },

  florist: {
    match: [/florist|flower|floral/i],
    anchorRequirement: "strict",
    anchors: [
      "bloom","petal","stem","posy","sprig","bouquet","rose","dahlia","peony","garden",
      "meadow","floral","blossom","flora","bud","fern","willow","ivy","botanical","leaf",
      "root","orchid","lilac","magnolia","vine","wild","wildflower","bloomery","wreath",
      "camellia","marigold","verdant","petal"
    ],
    banned: [
      "atelier","maison","label","goods","market","collective","studio","loft",
      "concept","box","curated","sterling","ivory"
    ],
    neighbors: ["boutique retail", "gift shop", "home decor", "clothing brand"],
    world: "the cutting garden and the dawn flower market, the florist's bench, stems and seasons, the gift of flowers for love and grief and celebration. Go deeper than 'bloom/petal' — mine real floristry.",
    patterns: [
      "[flower] + house / lane / room: Dahlia House, Camellia Lane",
      "[botanical] & [botanical]: Stem & Sprig, Fern & Flora, Wild & Bloom",
      "single crafted botanical word: Bloomery, Posy, Verdant, Petalia",
      "wild / garden-led: The Wild Floral, The Cutting Garden, Wildflower & Vine"
    ],
    extraRules: [
      "The name must read as a FLORIST — flowers, stems, garden, arrangements. If it could sell candles, homeware, or apparel, reject it.",
      "Do not collapse into a boutique / gift-shop / home-decor name; the flowers must be unmistakable."
    ],
    goodExamples:["Dahlia House", "Stem & Sprig", "The Wild Floral", "Camellia Lane", "Bloomery", "Fern & Flora", "Wildflower & Vine", "Posy & Petal"],
    badExamples: ["Maison Goods", "Sterling Collective", "The Flower Atelier", "Label Florist"],
    kitFeel: "feel floral / botanical / seasonal / arrangement-based — petals, stems, the cutting garden; NOT generic premium boutique."
  },

  jewelry_store: {
    match: [/jewel|jewelry|jewellery|\brings?\b|diamonds?|goldsmith/i],
    anchorRequirement: "medium",
    anchors: [
      "gem","gold","silver","platinum","stone","jewel","carat","karat","facet","setting",
      "heirloom","pearl","diamond","opal","sapphire","jade","onyx","amber","gild","forge",
      "ore","lustre","alloy","signet","filigree","bezel","aurum","goldsmith","hallmark","vault"
    ],
    banned: [
      "boutique","decor","gift","goods","market","label","maison","collective",
      "curated","apparel","home","living","box","loft"
    ],
    neighbors: ["gift shop", "home decor", "fashion retail"],
    world: "the goldsmith's bench — the setting and the cut, the loupe and the hallmark, heirlooms and makers' marks, light caught on a stone. Mine the CRAFT and the materials, not retail.",
    patterns: [
      "[craft] & [material]: Facet & Stone, Gild & Carat, Bezel & Bloom",
      "goldsmith / maker heritage: Aldridge Goldsmiths, Whitfield & Hale, [Surname] Jewelers",
      "single crafted word: Aurum, Lustre, Filigree, Signet, Karat",
      "heirloom / permanence-led: Heirloom Row, The Vault, Signet & Stone"
    ],
    extraRules: [
      "The name must read as a JEWELER / goldsmith — gems, gold, the craft, heirlooms. If it could sell homeware, gifts, or apparel, reject it.",
      "Do not collapse into a gift-shop / boutique / home-decor name; the precious-craft world must be unmistakable."
    ],
    goodExamples:["Facet & Stone", "Gild & Carat", "Aurum", "Heirloom Jewelers", "Opal Forge", "Filigree", "Aldridge Goldsmiths", "Signet & Stone"],
    badExamples: ["Willow Goods", "Curated Market", "Jewelry Maison", "Boutique Adornments"],
    kitFeel: "feel precious / crafted / heirloom / gemstone — the goldsmith's bench, light on a stone, hallmarks; NOT generic gift-shop retail."
  },

  mortgage_broker: {
    match: [/mortgage|loan officer|lender|lending|refinance|home loan/i],
    anchorRequirement: "strict",
    anchors: [
      "lend","loan","rate","close","closing","fund","funding","approval","underwrite",
      "borrow","equity","escrow","mortgage","capital","path","bridge","guide","finance"
    ],
    banned: [
      "realty","properties","estates","homes","dwellings","neighborhood","brick",
      "hearth","door","grove","woods","roof","acre","land","terrace","ridge"
    ],
    neighbors: ["real estate agency", "property management", "home construction"],
    goodExamples:["Clearpath Lending", "Bridgepoint Funding", "Guidepost Mortgage", "Fairway Capital"],
    badExamples: ["Oakpeak Homes", "Hearth & Door", "Pine Grove Lending", "Summit Realty Capital"],
    kitFeel: "feel lending / approval / financing / guidance — the clear path to a yes; NOT homes, property, or real-estate imagery."
  },

  insurance_agency: {
    match: [/insurance|coverage|insure|policy/i],
    anchorRequirement: "medium",
    anchors: [
      "cover","coverage","shield","guard","protect","policy","assure","assurance","secure",
      "risk","claim","shelter","provident","harbor","mainstay","steadfast","anchor","keystone",
      "cornerstone","bedrock","sentinel","bulwark","evergreen","kindred","restwell","surety",
      "reliance","providence","truenorth","stalwart","eventide","legacy"
    ],
    banned: ["apex","summit","premier","elite","ivory","atelier","maison","goods","collective"],
    neighbors: ["financial planner", "law firm", "generic consulting"],
    world: "the promise to be there when it goes wrong — steadiness, trust, peace of mind, and continuity for the people who depend on you.",
    patterns: [
      "Protection family: Shield, Guard, Shelter, Bulwark, Sentinel",
      "Steadiness / trust family: Steadfast, Bedrock, Mainstay, Stalwart",
      "Peace-of-mind family: Restwell, Surety, Reliance, Providence, Assurance",
      "Continuity / legacy family: Evergreen, Eventide, Kindred, Legacy, Provident",
      "Surname-heritage: Halloway Assurance, Whitfield & Hale"
    ],
    extraRules: [
      "Draw across MULTIPLE families above — do NOT cluster only on Shield / Harbor / Shelter / Protect. Variety across families is the goal this round.",
      "A set of 18 names should span at least three of the families, not eighteen shield-words."
    ],
    goodExamples:["Steadfast", "Evergreen Coverage", "Sentinel", "Kindred Cover", "Restwell", "Halloway Assurance", "Provident Shield"],
    badExamples: ["Ivory Collective", "Summit Insurance", "Premier Coverage"],
    kitFeel: "feel protection / security / peace of mind / continuity — steady and dependable; NOT cold corporate filler."
  },

  business_consultant: {
    match: [/consult|advisor|advisory|strategy|business coach/i],
    anchorRequirement: "medium",
    anchors: [
      "clarity","focus","throughline","align","alignment","growth","scale",
      "operator","systems","process","momentum","decision","plan","traction"
    ],
    banned: ["apex","summit","synergy","catalyst","premier","elite","ivory","maison","atelier"],
    neighbors: ["marketing agency", "accounting firm", "financial planner"],
    goodExamples:["Throughline", "Clearfield", "Operator Path", "Traction Works"],
    badExamples: ["Apex Advisory", "Synergy Group", "Ivory Consulting"],
    kitFeel: "feel clarity / momentum / better decisions — sharp and plain, sounds like an operator not a deck; NOT navy-grey filler."
  },

  family_law: {
    match: [/family law|divorce|custody/i],
    anchorRequirement: "medium",
    anchors: [
      "family","custody","kindred","common","ground","dignity","resolve","care",
      "transition","protect","support","settle","guardian"
    ],
    banned: ["apex","summit","sterling","ivory","aggressive","accident","injury","claim"],
    neighbors: ["personal injury law", "corporate law", "estate planning"],
    goodExamples:["Kindred Law", "Common Ground Legal", "Dignity Counsel", "Guardian Family Law"],
    badExamples: ["Apex Legal", "Trueclaim Family", "Summit Law"],
    kitFeel: "feel dignity / support / transition / protection — calm and humane, never combative; NOT injury-law aggression."
  },

  saas_startup: {
    match: [/saas|software|app|platform|startup|ai startup|cybersecurity/i],
    anchorRequirement: "loose",
    anchors: [
      "data","sync","logic","grid","stack","layer","signal","orbit","lumen",
      "cobalt","beacon","security","identity","workflow","cloud","node"
    ],
    banned: ["apex","summit","premier","elite"],
    neighbors: ["marketing agency", "generic consulting"],
    goodExamples:["LatticePath", "SignalGrid", "CobaltLayer", "BeaconSync"],
    badExamples: ["Apex Software", "Premier Platform"],
    kitFeel: "feel product / system / software / workflow — modern and precise; NOT agency or consultancy tone."
  },

  engineering: {
    match: [/\bengineer/i],
    anchorRequirement: "loose",
    anchors: [
      "cornerstone","keystone","bedrock","anchor","bastion","pillar","foundation","granite",
      "ironwood","northpoint","northcross","meridian","vector","vertex","vanguard","benchmark",
      "sightline","stalwart","stronghold","mainstay","steadfast","caliber","axis","ridge","north",
      "bridge","span","arc","crest","summit","halcyon","provident","ironpoint","stoneridge"
    ],
    banned: [
      "jewel","karat","carat","sapphire","gem","aurum","signet","lustre","luster","bezel","filigree",
      "opal","gilded","goldsmith","platinum","facet","diamond","hallmark","crown","vault",
      "quartz","cobalt","onyx","slate","lattice","vela","orbit","cinder","nimbus","zenith","lumen",
      "flux","forge","sync","loop","stack","layer","grid","logic","hq",
      "torque","datum","truss","gauge","plumb","tolerance","caliper","schematic","blueprint","fulcrum","cantilever",
      "apex","pinnacle","peak","premier","elite","solutions","global","ventures"
    ],
    neighbors: ["architecture firm","construction / general contractor","electrical contractor","software / it / saas","manufacturing","jewelry","auto repair"],
    world: "permanence, trust, stability, confidence, long-term reliability — a firm a client can build their future on. Express the PERCEPTION, never the tools of engineering.",
    patterns: [
      "Permanence-object family: foundation / anchor / pillar / bastion / stronghold meaning",
      "Geographic-precision family: a place or coordinate mark that feels exact and rooted",
      "Founder-gravity family: a serious surname (+ & Associates / Partners)",
      "Confident-abstract family: a single strong, ownable word",
      "Compound-solid family: a weighty two-part mark (Granite Ridge, Iron-point type)"
    ],
    extraRules: [
      "REJECT any name that uses engineering tools/jargon (Torque, Datum, Truss, Span, Gauge, Plumb, Fulcrum, Cantilever), jewelry words, or tech-monoculture words (Quartz, Cobalt, Onyx, + Layer/Sync/Loop/Stack/Forge).",
      "REJECT any name that reads as architecture, construction, an electrical contractor, software/IT, or manufacturing — wrong neighbor.",
      "Draw across MULTIPLE families above — do NOT cluster on one. A strong set spans at least three families.",
      "Portability test: the name must read as a serious firm that could credibly belong in any high-stakes industry."
    ],
    goodExamples:["Bastion", "Northcross", "Halloran & Partners", "Granite Ridge", "Ironpoint"],
    badExamples: ["Goldsmith Associates", "Quartz Hq", "Torque Engineering", "Cobalt Forge", "JewelCraft Solutions"],
    kitFeel: "feel permanence / trust / strength / established credibility — a serious firm a client builds their future on; NOT a tool, a gem, or a tech startup."
  }
};

function normalize(s = "") {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findIdentityProfile(seed = "") {
  const text = normalize(seed);
  return Object.values(PROFILES).find(p => p.match.some(rx => rx.test(text))) || null;
}

function containsAny(text, list = []) {
  const t = normalize(text);
  return list.some(w => {
    const n = normalize(w);
    if (!n) return false;
    return new RegExp(`\\b${escapeRegExp(n)}\\b`, "i").test(t);
  });
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasAnchor(name = "", profile) {
  if (!profile) return true;
  const t = normalize(name);

  if (containsAny(t, profile.anchors)) return true;

  // root/stem matching for words like Lending, Bloomline, Goldsmith
  return profile.anchors.some(a => {
    const root = normalize(a);
    if (root.length < 4) return false;
    return t.includes(root);
  });
}

function identityScoreAdjustment(name = "", profile) {
  if (!profile) return { multiplier: 1, flags: [] };

  const flags = [];
  let multiplier = 1;

  if (containsAny(name, profile.banned)) {
    flags.push("banned_drift_token");
    multiplier *= 0.15;
  }

  const anchored = hasAnchor(name, profile);
  if (!anchored && profile.anchorRequirement === "strict") {
    flags.push("missing_strict_category_anchor");
    multiplier *= 0.35;
  } else if (!anchored && profile.anchorRequirement === "medium") {
    flags.push("missing_medium_category_anchor");
    multiplier *= 0.65;
  }

  if (!anchored && containsAny(name, ["co","studio","collective","goods","group","solutions","market","atelier","maison"])) {
    flags.push("generic_premium_fallback");
    multiplier *= 0.50;
  }

  // LITERAL-STACK GUARD (Thai): a name built by stacking 3+ raw ingredient words reads like a
  // recipe, not a brand. Down-rank it hard so generation moves toward names that FEEL Thai.
  if (Array.isArray(profile.ingredientWords) && profile.ingredientWords.length) {
    const toks = normalize(name).split(" ").filter(Boolean);
    const ing = toks.filter(t => profile.ingredientWords.indexOf(t) >= 0).length;
    if (ing >= 3) {
      flags.push("literal_ingredient_stack");
      multiplier *= 0.40;
    }
  }

  if (flags.length === 0) flags.push("category_true");

  return { multiplier, flags };
}

// SCALE-SAFE applyIdentityGuard.
//   candidates : array of name objects
//   seed       : the business description
//   scaleMax   : 5 (judge) by default; pass 100 for the generation score scale
//   scoreField : null -> read/write .score (with totalScore/finalScore fallback);
//                pass e.g. "judge" to read/write that exact 1-5 field.
// Non-numeric scores pass through UNCHANGED (never dropped) so safety nets like
// the unscored fallback pool survive. The drop floor is 0.5 * scaleMax.
function applyIdentityGuard(candidates = [], seed = "", scaleMax = 5, scoreField = null) {
  const profile = findIdentityProfile(seed);
  if (!profile) return candidates;

  const floor = scaleMax * 0.5;

  const out = candidates.map(c => {
    const name = c.name || c.value || c.title || "";
    const raw = scoreField ? c[scoreField]
      : (c.score != null ? c.score : (c.totalScore != null ? c.totalScore : c.finalScore));

    // Unscored -> pass through untouched (do not drop a safety-net candidate).
    if (typeof raw !== "number" || Number.isNaN(raw)) {
      return Object.assign({}, c, { identityFlags: ["unscored"], identityProfile: true, _identityKeep: true });
    }

    const adj = identityScoreAdjustment(name, profile);
    const newScore = Math.max(0, Math.min(scaleMax, raw * adj.multiplier));
    const next = Object.assign({}, c, {
      identityFlags: adj.flags,
      identityProfile: true,
      _identityKeep: newScore >= floor
    });
    if (scoreField) next[scoreField] = newScore; else next.score = newScore;
    return next;
  });

  const fieldFor = (c) => scoreField ? c[scoreField]
    : (c.score != null ? c.score : (c.totalScore != null ? c.totalScore : (c.finalScore != null ? c.finalScore : 0)));

  return out
    .filter(c => c._identityKeep)
    .map(c => { const x = Object.assign({}, c); delete x._identityKeep; return x; })
    .sort((a, b) => Number(fieldFor(b) || 0) - Number(fieldFor(a) || 0));
}

function buildIdentityPromptBlock(seed = "") {
  const profile = findIdentityProfile(seed);
  if (!profile) return "";

  const worldLine = profile.world ? ("\nCategory world to mine for DEPTH (go past the obvious words):\n" + profile.world + "\n") : "";
  const patternLine = (Array.isArray(profile.patterns) && profile.patterns.length)
    ? ("\nNaming patterns — VARY across all of these, do not collapse into one style:\n- " + profile.patterns.join("\n- ") + "\n")
    : "";
  const baseRules = [
    "1. Category identity is non-negotiable.",
    "2. Style may affect rhythm, polish, brevity, and structure.",
    "3. Style may not replace category identity.",
    "4. If a name could fit many unrelated businesses, it is weak.",
    "5. If a name sounds like a neighbor category, reject it."
  ];
  const extra = (Array.isArray(profile.extraRules) ? profile.extraRules : [])
    .map((r, i) => (6 + i) + ". " + r);
  const rules = baseRules.concat(extra).join("\n");

  return `

CATEGORY IDENTITY FIRST — STYLE SECOND

This request matches a protected proof category.

Every strong name must clearly belong to this exact business category.

Mandatory category anchors:
${profile.anchors.join(", ")}

Avoid / reject drift words:
${profile.banned.join(", ")}

Do not drift into neighboring categories:
${profile.neighbors.join(", ")}
${worldLine}${patternLine}
Good examples:
${profile.goodExamples.join(" · ")}

Bad examples:
${profile.badExamples.join(" · ")}

Rules:
${rules}
`;
}

// Per-category world cue for the JUDGE user message (gives the model the real
// anchor / banned / neighbor lists so its "category anchor" caps are concrete).
function judgeIdentityCaption(seed = "") {
  const profile = findIdentityProfile(seed);
  if (!profile) return "";
  return "\nCATEGORY IDENTITY PROFILE (cap by these):" +
    "\n  required anchors: " + profile.anchors.join(", ") +
    "\n  banned drift tokens: " + profile.banned.join(", ") +
    "\n  must NOT sound like: " + profile.neighbors.join(", ") + "\n";
}

// Per-category world cue for the KIT prompt (keeps abstract kits from drifting
// to generic premium navy/grey).
function kitIdentityHint(seed = "") {
  const profile = findIdentityProfile(seed);
  if (!profile || !profile.kitFeel) return "";
  return " CATEGORY KIT WORLD (do not make the kit generic premium): the brand kit must " + profile.kitFeel;
}

module.exports = {
  PROFILES,
  findIdentityProfile,
  buildIdentityPromptBlock,
  applyIdentityGuard,
  hasAnchor,
  identityScoreAdjustment,
  judgeIdentityCaption,
  kitIdentityHint
};
