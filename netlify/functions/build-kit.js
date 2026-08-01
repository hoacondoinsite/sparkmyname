// Netlify function: full report for ONE name, shaped by WHAT is being named.
// kind = "brand"  -> creative kit (why, taglines, palettes, fonts, voice, bios, about, posts)
// kind = "person" -> name report (meaning, origin, pronunciation, why it fits, nicknames, similar, namesakes)
// kind = "pet"    -> pet report (meaning/vibe, why it fits, nicknames, similar, personality)
const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const categoryDNA = require('./category-dna.js');
const { kitIdentityHint } = require('./category-identity-guard.js');

const SYS_BRAND = `You build a rich brand/identity kit for a NAME, tailored to WHAT is being named. Return ONLY valid JSON in EXACTLY this shape:
{"whyItWorks":["","","","","","","",""],"taglines":["","","","","",""],"palettes":[{"name":"","colors":["#hex","#hex","#hex","#hex"],"note":""},{"name":"","colors":["#hex","#hex","#hex","#hex"],"note":""},{"name":"","colors":["#hex","#hex","#hex","#hex"],"note":""}],"fonts":[{"label":"","desc":""},{"label":"","desc":""},{"label":"","desc":""},{"label":"","desc":""}],"voice":[{"label":"","desc":""},{"label":"","desc":""},{"label":"","desc":""},{"label":"","desc":""},{"label":"","desc":""},{"label":"","desc":""}],"bios":["","","","","",""],"about":["","",""],"posts":["","","","","",""],"linkedin":["","",""],"facebook":["","",""]}
EXACTLY 8 whyItWorks, 6 taglines, 3 palettes, 4 fonts, 6 voice, 6 bios, 3 about, 6 posts, 3 linkedin, 3 facebook. The 8 whyItWorks must EACH make a DIFFERENT point (sound, meaning, memorability, fit to the business, breadth/travel, differentiation, emotional pull, brandability) — no two repeating the same idea; keep each one short. Palettes: short name + 4 hex that work together + a mood note. fonts/voice: label = 1-2 word style, desc = one short sentence. bios under 140 chars. linkedin = 3 ready-to-paste LinkedIn "About" sections (2-3 sentences each), confident professional first-person, stating the pain solved and the solution. facebook = 3 ready-to-paste Facebook Page intros (1-2 sentences, warm, customer-facing, with a friendly hook). English, specific, no placeholders, no repetition. Keep every item concise. TAILOR EVERYTHING TO THIS BUSINESS'S OWN WORLD AND OUTCOME - never a generic professional default. The palette, fonts, voice, bios, and posts must feel made for THIS exact business. For ABSTRACT professional categories (consulting, finance, insurance, accounting, legal, real estate, agency) do NOT fall back to navy + grey, a stiff corporate voice, or "we are a leading provider of" LinkedIn language. Instead EXPRESS THE CLIENT OUTCOME - the feeling the customer is paying for - in the colors, the voice, and the posts (clarity and momentum for consulting; protection and peace of mind for insurance; confidence, freedom and security for financial planning; belonging, home and ownership for real estate; resolution and advocacy for legal; order and relief for accounting). A reader should feel the kit was made for their exact business, never generated for a generic company.`;

const SYS_PERSON = `You write a warm, keepsake NAME REPORT for a first name a parent or person is considering. Return ONLY valid JSON in EXACTLY this shape:
{"meaning":"","origin":"","pronunciation":"","whyItFits":["","",""],"nicknames":["","","","","",""],"similar":["","","","","","","",""],"namesakes":["","","",""]}
meaning = the name's meaning in a few words. origin = language/culture of origin. pronunciation = simple phonetic (e.g. "MAR-loh"). whyItFits = 3 warm sentences on why it's a lovely choice. nicknames = 6 affectionate short forms. similar = 8 other beautiful names they might also love. namesakes = 4 admired real people (or characters) who share the name. Warm, family, keepsake tone - NEVER marketing language. English.`;

const SYS_PET = `You write a charming NAME REPORT for a pet name someone is considering. Return ONLY valid JSON in EXACTLY this shape:
{"meaning":"","origin":"","whyItFits":["","",""],"nicknames":["","","","","",""],"similar":["","","","","","","",""],"personality":""}
meaning = the vibe/meaning of the name in a few words. origin = where it comes from or what it evokes. whyItFits = 3 playful sentences on why it suits a pet. nicknames = 6 cute short forms. similar = 8 other great pet names. personality = one or two sentences on the kind of pet it suits. Warm, playful tone. English.`;

const SYSMAP = { brand: SYS_BRAND, person: SYS_PERSON, pet: SYS_PET };

// Abstract-category OUTCOME HINT: for professional/B2B categories with no physical world,
// give the kit an explicit outcome to express so palettes/voice/posts stop defaulting to
// navy-grey corporate. Returns '' for concrete categories (they already have a rich world).
function outcomeHint(seed) {
  var s = String(seed || '').toLowerCase();
  var M = [
    [/consult|advisor|advisory|\bstrateg/, { field: 'consulting / advisory', out: 'clarity, focus, alignment, momentum', pal: 'clean and confident with ONE sharp modern accent (a decisive blue-violet, teal, or warm signal color) - NOT default navy + grey', voice: 'plain and sharp, says the result in human words, zero jargon or buzzwords', post: 'lead with the clarity and result the client walks away with, never "we are a leading provider of..."' }],
    [/insurance|\bcoverage|underwrit/, { field: 'insurance', out: 'protection, peace of mind, security, stability, shelter', pal: 'calm and protective - deep teal or forest with a warm neutral and a soft gold; reassuring, NOT generic corporate blue', voice: 'calm, human, steady - someone who has your back, not an actuary', post: 'lead with the feeling of being protected and looked after' }],
    [/wealth|financial planning|\bfinanc|retirement|\binvest|asset manage|\bcapital\b/, { field: 'finance / wealth', out: 'confidence, future, independence, freedom, steadiness', pal: 'warm trust - deep green or slate with gold/bronze and a light stone; grounded and optimistic, NOT cold grey corporate', voice: 'reassuring and grounded, future-focused, plain-spoken about money', post: 'lead with the confidence and freedom the client gains, not product features' }],
    [/account|bookkeep|\bcpa\b|\btax\b|payroll/, { field: 'accounting', out: 'order, clarity, control, relief', pal: 'precise and warm - ink or deep teal with sage and a clean cream; orderly, NOT flat grey', voice: 'clear and reassuring, exact without being dry', post: 'lead with the relief of clean books and no surprises' }],
    [/\blaw\b|law firm|lawyer|attorney|\blegal|counsel/, { field: 'legal', out: 'standing up for you, resolution, advocacy, trust', pal: 'strong and human - oxblood, deep ink, or brass; weighty but warm, NOT cold navy', voice: 'confident and human, on your side, plain English not legalese', post: 'lead with the outcome - resolution, protection, justice - not credentials' }],
    [/mortgage|\\bloan\\b|loan officer|\\blending\\b|\\blender\\b|refinanc|home loan/, { field: 'mortgage / lending (a LENDER, not real estate)', out: 'financing, approval, the path to a yes, guidance, confidence, the close', pal: 'clear and confident - a trustworthy blue-green or deep teal with a warm gold and clean light; guiding and reassuring, NOT property or nature tones', voice: 'a clear, reassuring guide through financing - plain about rates and approvals, never salesy or property-flavored', post: 'lead with the confidence of getting approved and a clear path to owning - NOT homes, keys, or property imagery (that is real estate)' }],
    [/real estate|realty|realtor|homebuyer|home buyer|brokerage|\bproperty/, { field: 'real estate', out: 'belonging, ownership, home, community, the key', pal: 'warm and homey - terracotta, sand, sage, warm wood; inviting, NOT corporate blue/grey', voice: 'warm, local, human - about home and belonging, not transactions', post: 'lead with the feeling of home and belonging, not listings' }]
  ];
  for (var i = 0; i < M.length; i++) {
    if (M[i][0].test(s)) {
      var h = M[i][1];
      return ' ABSTRACT CATEGORY - EXPRESS THE OUTCOME, NOT A GENERIC PROFESSIONAL LOOK. This is ' + h.field + '. The kit MUST express the CLIENT OUTCOME (' + h.out + '). Palette: ' + h.pal + '. Voice: ' + h.voice + '. Posts/LinkedIn: ' + h.post + '. Make the reader feel "this was made for MY business," never "this was generated for a generic professional company."';
    }
  }
  return '';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  if (!KEY) return resp(500, { error: 'missing_key' });
  let name = '', seed = '', kind = 'brand';
  try { const b = JSON.parse(event.body || '{}'); name = (b.name || '').slice(0, 60); seed = (b.seed || '').slice(0, 300); kind = (b.kind === 'person' || b.kind === 'pet') ? b.kind : 'brand'; } catch (e) {}
  if (!name.trim()) return resp(400, { error: 'no_name' });

  // ONE attempt only. Retrying a slow OpenAI call inside the function just stacks toward
  // the platform's hard runtime limit and gets the whole function killed (the 24s deaths).
  // Instead: a single call with a timeout that leaves room to return, and a slimmer/faster
  // request. The CLIENT handles retries between separate function invocations.
  let kit = null, lastErr = '';
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 24000); // 24s: headroom for the current kit, safely under the ~26s platform ceiling
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.8, max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSMAP[kind] }, { role: 'user', content: 'Name: "' + name + '". Context (what is being named): "' + (seed || 'a brand') + '".' + (kind === 'brand' ? ((categoryDNA.kitHint(categoryDNA.match(seed)) || outcomeHint(seed)) + kitIdentityHint(seed)) : '') }]
      })
    });
    clearTimeout(timer);
    const d = await r.json();
    let parsed = {};
    try { parsed = JSON.parse(d.choices?.[0]?.message?.content || '{}'); } catch (e) { parsed = {}; }
    if (parsed && Object.keys(parsed).length) { kit = parsed; }
    else { lastErr = (d && d.error && d.error.message) ? d.error.message : 'empty'; }
  } catch (e) { lastErr = (e && e.name === 'AbortError') ? 'timeout' : 'fetch_error'; }

  if (!kit) { console.log('build-kit FAILED reason=' + lastErr + ' name=' + name); return resp(502, { error: 'ai_failed', reason: lastErr }); }
  kit.kind = kind;
  return resp(200, kind === 'brand' ? normBrand(kit, name, seed) : normNameReport(kit, kind));
};

const S = (v) => (typeof v === 'string' ? v.trim() : '');
const strs = (a, n) => { a = Array.isArray(a) ? a.map(S).filter(Boolean) : []; return a.slice(0, n); };

function normBrand(k, name, seed) {
  // COUNT GUARANTEE (Founder order, 2026-07-23): the $99 promise is EXACT quantities —
  // 8 why / 6 taglines / 3 palettes / 4 fonts / 6 bios / 3 about / 6 posts / 3 LinkedIn /
  // 3 Facebook — for EVERY name. If the model under-delivers an array, we top it up with
  // copy tailored from the brand's own name and idea. Real, usable lines — never blanks.
  const NM = S(name) || 'This brand'; const SD = S(seed) || 'what you do';
  const fillLI = [
    'At ' + NM + ', we\u2019re building something real: ' + SD + ', done with care, delivered with pride. If that\u2019s what you\u2019re looking for, let\u2019s connect.',
    'I started ' + NM + ' because ' + SD + ' deserves to be done right \u2014 dependable work, honest communication, and results people can stand behind.',
    NM + ' exists for one reason: to make ' + SD + ' better for the people who count on it. Follow along \u2014 we\u2019re just getting started.'
  ];
  const fillFB = [
    'Welcome to ' + NM + '! We\u2019re here for ' + SD + ' \u2014 come see what we\u2019re building.',
    NM + ' is open for business \u2014 ' + SD + ', done right. Say hello!',
    'Follow ' + NM + ' for updates, behind-the-scenes, and everything ' + SD + '.'
  ];
  const fillAB = [
    NM + ' was built around a simple idea: ' + SD + ', done with genuine care and real craft.',
    'We believe ' + SD + ' should come with honesty, quality, and pride in the work \u2014 that\u2019s what ' + NM + ' stands for.',
    'Every day at ' + NM + ' is about earning trust: showing up, doing the work well, and standing behind it.'
  ];
  const fillPO = [
    'Big news \u2014 ' + NM + ' is here! ' + SD + ', done the way it should be. Come see us.',
    'We\u2019re officially open. ' + NM + ' \u2014 built for ' + SD + '. Follow along for what\u2019s next!',
    'The wait is over: ' + NM + ' has launched. Thank you to everyone who believed in this from day one.',
    'Behind every great start is a simple promise. Ours: ' + SD + ', with care in every detail. \u2014 ' + NM,
    'Day one at ' + NM + '. The tools are ready, the standards are set, and we can\u2019t wait to show you what\u2019s coming.',
    'Know someone who needs ' + SD + '? Send them our way \u2014 ' + NM + ' is ready.'
  ];
  const topUp = (arr, n, fills) => { arr = (arr || []).slice(0, n); let i = 0; while (arr.length < n && fills && i < fills.length) { if (arr.indexOf(fills[i]) < 0) arr.push(fills[i]); i++; } return arr; };
  const labs = (a, n) => {
    if (!Array.isArray(a)) return [];
    return a.map(o => {
      if (typeof o === 'string') return { label: '', desc: S(o) };
      if (o && typeof o === 'object') return { label: S(o.label || o.name || o.style || o.title), desc: S(o.desc || o.description || o.pairing || o.detail || o.text || o.note) };
      return null;
    }).filter(o => o && (o.label || o.desc)).slice(0, n);
  };
  let pals = Array.isArray(k.palettes) ? k.palettes.filter(p => p && Array.isArray(p.colors)).map(p => ({
    name: S(p.name) || 'Palette',
    colors: p.colors.map(c => S(c)).filter(c => /^#?[0-9a-fA-F]{3,8}$/.test(c)).map(c => c[0] === '#' ? c : '#' + c).slice(0, 4),
    note: S(p.note)
  })).filter(p => p.colors.length >= 3).slice(0, 3) : [];
  return { kind: 'brand', whyItWorks: strs(k.whyItWorks, 8), taglines: strs(k.taglines, 6), palettes: pals, fonts: labs(k.fonts, 6), voice: labs(k.voice, 6), bios: strs(k.bios, 6),
    about: topUp(strs(k.about, 6), 3, fillAB),
    posts: topUp(strs(k.posts, 6), 6, fillPO),
    linkedin: topUp(strs(k.linkedin, 6), 3, fillLI),
    facebook: topUp(strs(k.facebook, 6), 3, fillFB) };
}
function normNameReport(k, kind) {
  const out = { kind: kind, meaning: S(k.meaning), origin: S(k.origin), whyItFits: strs(k.whyItFits, 3), nicknames: strs(k.nicknames, 6), similar: strs(k.similar, 8) };
  if (kind === 'person') { out.pronunciation = S(k.pronunciation); out.namesakes = strs(k.namesakes, 4); }
  else { out.personality = S(k.personality); }
  return out;
}

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
