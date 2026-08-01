// netlify/functions/naming-families.js
//
// NAMING FAMILIES — diversity layer for the categories that are category-correct but
// not diverse enough (they run ONE naming strategy ~18 times). Scope is intentionally
// narrow: SaaS, Cybersecurity SaaS, AI Startup, Ecommerce Brand. It does NOT touch
// routing, the Category Identity Guard, or any other category.
//
// Two mechanisms:
//   1) buildFamiliesPromptBlock(seed) — tells the model to generate ACROSS several
//      named families (never stack one root) so the candidate pool is diverse.
//   2) enforceFamilySpread(list, seed, target) — at curation, caps how many names may
//      come from any one family, so the delivered set spans multiple strategies.
//      Relaxes the cap if needed to reach target (never under-delivers).
//
// classifyFamily() is deterministic (vocabulary match), so the spread + the log line
// are runnable evidence even without a live model.

// Priority-ordered: cyber / ai / ecommerce resolve BEFORE generic saas.
const FAMILY_SETS = [
  {
    key: "cyber",
    match: /cyber|cybersec|infosec|security|\bsoc\b|siem|threat|endpoint|zero.?trust|firewall|malware|breach|pentest/i,
    label: "cybersecurity / security software",
    families: {
      protection: { name: "Protection", gist: "the wall that keeps threats out", examples: ["Vault","Shield","Aegis","Bastion","Bulwark"],
        words: ["vault","shield","guard","bastion","bulwark","aegis","fortress","lock","ward","armor","citadel","rampart","barricade","keep"] },
      vigilance:  { name: "Vigilance / Signal", gist: "watching, detecting, responding", examples: ["Signal","Beacon","Sentry","Radar","Trace"],
        words: ["signal","beacon","watchtower","lookout","radar","trace","sentry","scout","falcon","hawk","vigil","scan","detect","pulse","watch"] },
      trust:      { name: "Trust / Identity", gist: "proof, identity, integrity", examples: ["Verity","Cipher","Ledger","Attest","Token"],
        words: ["verity","cipher","token","ledger","proof","attest","seal","oath","veritas","integrity","identity","credential","trust"] },
      invented:   { name: "Invented / Coined", gist: "a distinctive made-up security word", examples: ["Secura","Cryptan","Sentora","Cyphr","Vaultix"], coined: true,
        words: ["secura","cryptan","vaultix","sentora","cyphr","lockr","sentinex","guardia","securo","kryon"] },
      resilience: { name: "Resilience / Calm", gist: "steady, unbreakable, dependable", examples: ["Anchor","Bedrock","Haven","Granite","Steadfast"],
        words: ["anchor","bedrock","haven","harbor","steadfast","granite","ironwood","redwood","keystone","cornerstone","stalwart"] }
    }
  },
  {
    key: "ai",
    match: /\bai\b|a\.i\.|artificial intelligence|machine learning|\bml\b|\bllm\b|gen.?ai|neural|deep learning|\bmodel(s)?\b|inference|agentic/i,
    label: "AI / ML startup",
    families: {
      cognition: { name: "Cognition / Mind", gist: "thinking, understanding, insight", examples: ["Cortex","Synapse","Neuron","Insight","Cognition"],
        words: ["cortex","synapse","mind","neuron","cognition","reason","insight","sense","percept","recall","focus","cognis","intellect"] },
      light:     { name: "Light / Clarity", gist: "illumination, clarity, the spark", examples: ["Lumen","Lucid","Prism","Halo","Aura"],
        words: ["lumen","lucid","beacon","prism","halo","aura","clarity","bright","dawn","spark","glow","ray","illume","gleam"] },
      abstract:  { name: "Abstract / Celestial", gist: "elegant, scientific, cosmic", examples: ["Aether","Sigma","Nova","Lyra","Axiom"],
        words: ["aether","sigma","theta","nova","vega","lyra","axiom","helix","vector","delta","orion","quanta","cosmos"] },
      invented:  { name: "Invented / Coined", gist: "a distinctive made-up AI word", examples: ["Synthia","Neura","Inferra","Modela","Veled"], coined: true,
        words: ["synthi","synthia","cognis","neura","inferra","modela","veled","mindra","intellio","reasona","cerebro"] },
      craft:     { name: "Craft / Human", gist: "warm, made-by-people, creative", examples: ["Loom","Forge","Quill","Muse","Canvas"],
        words: ["loom","forge","quill","weave","muse","maker","canvas","kiln","anvil","mill","studio","atelier"] }
    }
  },
  {
    key: "ecommerce",
    match: /ecommerce|e-commerce|online (store|shop)|\bdtc\b|\bd2c\b|shopify|retail brand|clothing|apparel|skincare|cosmetics|consumer brand|merch|boutique brand|subscription box/i,
    label: "ecommerce / consumer brand",
    families: {
      editorial: { name: "Editorial / Curated", gist: "considered, magazine-like", examples: ["Folio","Index","Issue","Volume","Press"],
        words: ["edit","folio","index","issue","volume","press","paper","page","story","journal","archive","column","feature"] },
      place:     { name: "Lifestyle / Place", gist: "evokes a place or a way of living", examples: ["Nomad","Coast","Meadow","Haven","Vista"],
        words: ["nomad","cove","coast","harbor","meadow","field","lane","haven","vista","ridge","shore","glen","prairie","dune"] },
      ritual:    { name: "Daily / Ritual", gist: "the everyday habit it fits into", examples: ["Daily","Ritual","Staple","Standard","Kit"],
        words: ["daily","ritual","everyday","kit","supply","standard","staple","habit","common","basics","essential","routine"] },
      invented:  { name: "Invented / Coined", gist: "a soft, brandable made-up word", examples: ["Velura","Mossa","Aerin","Kindra","Lumio"], coined: true,
        words: ["velura","mossa","aerin","kindra","lumio","sela","vella","noko","aevia","rumi","aluna","wisp"] },
      botanical: { name: "Warm / Botanical", gist: "natural, friendly, human", examples: ["Maple","Wren","Sage","Fern","Hazel"],
        words: ["honey","maple","wren","sage","birch","fern","clementine","hazel","poppy","willow","juniper","plum","olive","cedar"] }
    }
  },
  {
    key: "saas",
    match: /\bsaas\b|software|platform|\bapp\b|\bb2b\b|workflow|dashboard|\bapi\b|devtool|developer tool|productivity tool|crm|erp|analytics tool/i,
    label: "SaaS / B2B software",
    families: {
      infra:      { name: "Infrastructure", gist: "the technical layer it lives in", examples: ["Node","Grid","Layer","Stack","Mesh"],
        words: ["node","grid","layer","stack","sync","signal","logic","mesh","core","base","rail","byte","data","pipe","socket","kernel","cluster","schema"] },
      outcome:    { name: "Outcome / Motion", gist: "what it does for the user", examples: ["Flow","Relay","Junction","Momentum","Pulse"],
        words: ["flow","relay","conductor","junction","momentum","pulse","loop","bridge","lift","shift","glide","current","throughput","motion","drive","launch"] },
      enterprise: { name: "Enterprise / Trust", gist: "solid, established, dependable", examples: ["Atlas","Meridian","Keystone","Verity","Compass"],
        words: ["atlas","meridian","keystone","verity","beacon","compass","anchor","cornerstone","charter","sentinel","vantage","axis","summit"] },
      invented:   { name: "Invented / Coined", gist: "a distinctive made-up word", examples: ["Synqra","Nexora","Veliqo","Zentry","Lattix"], coined: true,
        words: ["synqra","nexora","veliqo","zentry","qualio","vendr","lattix","novexa","ploom","fyra","quora","zylo"] },
      consumer:   { name: "Consumer / Warm", gist: "approachable, human, friendly", examples: ["Orbit","Loom","Mosaic","Canvas","Slate"],
        words: ["orbit","loom","mosaic","canvas","slate","quill","ember","nimbus","kite","drift","glimmer","harbor","willow"] }
    }
  }
];

function normalize(s = "") { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

function familiesFor(seed = "") {
  const t = normalize(seed);
  for (let i = 0; i < FAMILY_SETS.length; i++) {
    if (FAMILY_SETS[i].match.test(t)) return FAMILY_SETS[i];
  }
  return null;
}

function tokens(name = "") { return normalize(name).split(" ").filter(Boolean); }

// Which family does a name belong to? First family (in declared order) whose vocabulary
// the name contains (whole token or stem). Unmatched -> 'misc' (treated as its own bucket,
// which captures invented/novel names and still counts toward spread).
function classifyFamily(name = "", set) {
  if (!set) return "misc";
  const toks = tokens(name);
  const joined = toks.join("");
  const keys = Object.keys(set.families);
  for (let k = 0; k < keys.length; k++) {
    const fam = set.families[keys[k]];
    for (let w = 0; w < fam.words.length; w++) {
      const word = normalize(fam.words[w]);
      if (!word) continue;
      if (toks.indexOf(word) >= 0) return keys[k];
      if (word.length >= 4 && joined.indexOf(word) >= 0) return keys[k]; // stem inside a compound
    }
  }
  return "misc";
}

function buildFamiliesPromptBlock(seed = "") {
  const set = familiesFor(seed);
  if (!set) return "";
  const fams = set.families;
  const letters = ["A","B","C","D","E","F"];
  const lines = Object.keys(fams).map((k, i) =>
    `Family ${letters[i]} — ${fams[k].name}: ${fams[k].gist} (e.g. ${fams[k].examples.join(", ")})`
  ).join("\n");

  return `

NAMING FAMILIES — GENERATE ACROSS MULTIPLE STRATEGIES (this category needs VARIETY)

A great set for a ${set.label} should feel like SEVERAL different naming strategies — never one
strategy repeated. Generate names spread ACROSS these families, roughly even:

${lines}

HARD RULES:
- Draw from at least FOUR of the families across your set; do not cluster on one.
- NEVER stack one root word (no NodeGrid / SignalGrid / LayerGrid / GridFlow / GridLogic style repetition).
- At most about a third of the names may share a single family.
- Keep every name unmistakably a ${set.label} name — vary the STRATEGY, not the category.
`;
}

// Curation: select up to `target` names, best-first, but cap how many may come from any one
// family so the set spans multiple strategies. Relax the cap to fill to target if needed
// (never under-deliver). Non-target categories: plain best-first slice (no behavior change).
function enforceFamilySpread(list = [], seed = "", target = 18, capOverride) {
  const set = familiesFor(seed);
  if (!set) return list.slice(0, target);

  const envCap = parseInt(process.env.FAMILY_CAP || "", 10);
  const cap = capOverride || (Number.isFinite(envCap) && envCap > 0 ? envCap : Math.max(4, Math.ceil(target / 4)));

  const counts = {};
  const chosen = [];
  const deferred = [];

  for (let i = 0; i < list.length && chosen.length < target; i++) {
    const fam = classifyFamily(list[i].name || "", set);
    if ((counts[fam] || 0) < cap) {
      counts[fam] = (counts[fam] || 0) + 1;
      list[i]._family = fam;
      chosen.push(list[i]);
    } else {
      deferred.push(list[i]);
    }
  }
  // relax to fill to target from the best of the deferred (still best-first order)
  for (let j = 0; j < deferred.length && chosen.length < target; j++) {
    deferred[j]._family = classifyFamily(deferred[j].name || "", set);
    chosen.push(deferred[j]);
  }
  return chosen.slice(0, target);
}

// Compact log of the family spread in a delivered set (for the function logs).
function familySpreadLog(list = [], seed = "") {
  const set = familiesFor(seed);
  if (!set) return "";
  const counts = {};
  list.forEach(n => {
    const fam = n._family || classifyFamily(n.name || "", set);
    counts[fam] = (counts[fam] || 0) + 1;
  });
  const parts = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).map(k => k + ":" + counts[k]);
  const distinct = Object.keys(counts).length;
  return "families " + distinct + " [" + parts.join(", ") + "]";
}

// ---------------------------------------------------------------------------------------------
// BUILD 37.3 — GLOBAL DIVERSITY / ANTI-COMFORT-WORD (shared by curation AND the QA export)
// ---------------------------------------------------------------------------------------------
// Cross-category "comfort words" from the word-frequency audit — words that recur across UNRELATED
// categories and make the engine feel samey. Soft-penalised so they stop DOMINATING (never banned).
// Deliberately EXCLUDES coherent owned clusters: the luxury family (vesper/sable/noir/opaline/marque/
// regalia/monarch/belle/soleil) and the trades trust word ("true"), so passing categories keep their
// real vocabulary.
// Type-A imported-abstract comfort words only (genuinely weak, cross-category). Type-B native-lane words
// (ember, hearth, olive, fig, oak, sage, bloom, grove, cedar, willow, harbor, velvet, field, golden, table, plate, pantry)
// were removed 2026-06-23: they are good native words that were monocultured, not bad — managed by lane diversity, not suppression.
const OVERUSED_WORDS = ['cornerstone','compass','meridian','true','clearview','keystone',
  'sterling','atlas','collective','studio','lane','house','co','goods','supply','anchor','cardinal',
  'haven','forge','halo','beacon','lumen','crest','hub','works','nexus'];

// Demote names that repeat a higher-ranked name's head/tail word, suffix morpheme, or cadence, or
// that lean on an overused comfort word. SOFT + deterministic — a unique, non-overused name keeps its
// full score; this only REORDERS. Works for the paid path (judge 1-5) and the QA path (AI score 0-100).
function diversitySort(list) {
  var seenHead = {}, seenTail = {}, seenSuffix = {}, structCount = {};
  return (list || []).map(function (n) {
    var name = String(n.name || '');
    var w = name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
    var head = w[0] || '', tail = w[w.length - 1] || '';
    var compact = w.join('');
    var suffix = compact.length >= 4 ? compact.slice(-4) : compact;
    var hasAmp = /&/.test(name);
    var struct = w.length + '|' + (hasAmp ? 'amp' : 'plain');
    var pen = 0;
    if (head && seenHead[head]) pen += 0.40;                 // repeated head / prefix word
    if (tail && seenTail[tail]) pen += 0.40;                 // repeated tail / suffix word
    if (suffix && seenSuffix[suffix]) pen += 0.25;           // repeated suffix morpheme
    if (structCount[struct]) pen += Math.min(0.30, structCount[struct] * 0.12); // repeated cadence
    for (var i = 0; i < OVERUSED_WORDS.length; i++) {        // globally overused comfort word
      if (w.indexOf(OVERUSED_WORDS[i]) >= 0) { pen += 0.30; break; }
    }
    if (head) seenHead[head] = 1;
    if (tail) seenTail[tail] = 1;
    if (suffix) seenSuffix[suffix] = 1;
    structCount[struct] = (structCount[struct] || 0) + 1;
    var base = (typeof n.judge === 'number') ? n.judge
             : (typeof n.score === 'number') ? n.score / 20 : 3.5;
    return Object.assign({}, n, { _distinct: base - pen });
  }).sort(function (a, b) { return (b._distinct || 0) - (a._distinct || 0); });
}

module.exports = {
  FAMILY_SETS,
  familiesFor,
  classifyFamily,
  buildFamiliesPromptBlock,
  enforceFamilySpread,
  familySpreadLog,
  OVERUSED_WORDS,
  diversitySort
};
