// generate-v2.js — NEW GENERATOR (Phase 1, Grandmaster). Sits ALONGSIDE the live
// clean-names.js; does not touch it. Concept/outcome-driven brief. NO surname-mode,
// NO name-from-parts, NO heavy ban machinery. The fresh creative judge curates;
// the safety filter protects. This file only CREATES.
const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const MODEL = process.env.CLEAN_MODEL || 'gpt-4o-mini';

const TLDS_UNIVERSAL = ['com','net','co','io','studio','shop','ai','agency','group','design','app','pro','biz','company'];
const TLDS_RESTRICTED = ['law','legal','cpa','realty','homes','realestate','inc'];
const TLDS = Array.from(new Set([...TLDS_UNIVERSAL, ...TLDS_RESTRICTED]));
const RESTRICTED_SET = new Set(TLDS_RESTRICTED);
const RESTRICTED_NOTE = 'Eligibility required: this professional domain extension requires proof of credentials or licensing to register. Verify you qualify before purchasing.';

async function rdapOpen(base, tld) {
  const url = (tld === 'com' || tld === 'net')
    ? 'https://rdap.verisign.com/' + tld + '/v1/domain/' + base + '.' + tld
    : 'https://rdap.org/domain/' + base + '.' + tld;
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 2000);
    const r = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/rdap+json' } });
    clearTimeout(t);
    if (r.status === 404) return true; if (r.status === 200) return false; return null;
  } catch (e) { return null; }
}
async function openEndings(base) {
  if (!base) return [];
  const res = await Promise.all(TLDS.map(async tld => ({ tld, open: await rdapOpen(base, tld) })));
  const openTlds = res.filter(r => r.open === true).map(r => r.tld);
  const uni = openTlds.filter(t => !RESTRICTED_SET.has(t));
  const rest = openTlds.filter(t => RESTRICTED_SET.has(t));
  return [...uni, ...rest];
}

exports.handler = async (event) => {
  const out = (obj) => ({ statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });
  try {
    if (!KEY) return out({ error: 'No OPENAI_API_KEY in Netlify environment.' });
    const body = JSON.parse(event.body || '{}');
    const seed = (body.seed || '').trim();
    const count = Math.min(10, Math.max(2, body.count || 8));
    const avoid = Array.isArray(body.avoid) ? body.avoid.map(x => String(x || '').trim()).filter(Boolean).slice(0, 200) : [];
    const okLane = { professional: 1, standard: 1, clever: 1, human: 1 };
    const lanes = Array.isArray(body.lanes) ? body.lanes.filter(l => okLane[l]) : [];
    if (!seed) return out({ error: 'Type a business type.' });

    const sys =
`You are an elite brand strategist and namer at a top branding studio. A founder is PAYING for a real
BRAND - not a word - that they will build a business around and be proud of. Deliver ${count} names.

GOVERNING PHILOSOPHY (above everything): Do NOT learn what businesses ARE. Learn what people hope will
become TRUE after choosing one business over another - and how THIS category proves it can fulfill
that hope. A small set of human truths explains every industry, from a local barber to a global
aerospace firm.

RULE ZERO - PERCEPTION, NOT WORDS. Do not learn an industry through its vocabulary. Build the
PERCEPTION the business should create in the customer's mind; the right words then follow. Vocabulary
is an OUTPUT, never the operating system. Generate from principles - never by imitating words that
merely happen to be popular.

THE TWO AXES - every brand needs BOTH:
  - EXPERIENCE (how the customer should FEEL): "I feel beautiful," "someone is on my side," "it is
    finally fixed," "my family is safe," peace of mind. The service is only the mechanism; the
    EXPERIENCE is the product.
  - EVIDENCE (why they should BELIEVE this company can deliver that feeling): competence, craft,
    authority, safety, reliability. Industries differ mainly in how these two are WEIGHTED -
    professional services lean on evidence; luxury leans on aspiration and identity.

SATELLITE VIEW + CATEGORY TRUTH - hold both at once. See the BROAD human purpose this business serves
(so you never shallow keyword-match) AND the SPECIFIC truth of its exact category (never flatten it:
patent law is not generic law, marine engineering is not generic engineering, luxury jewelry is not
retail - each has its own culture, buying psychology, and trust requirements).

THE UNIVERSAL DECISION MODEL - run this silently, in order, BEFORE any name. Never generate until it
is complete:
  1) FUNCTION - what the business literally does. Factual context ONLY; never name from this alone.
  2) CUSTOMER - who is choosing (family, luxury buyer, business owner, parent, bride, patient,
     executive, traveler, fan, student ...).
  3) TRIGGER - why they are looking today (emergency, celebration, improvement, a dream, growth,
     convenience, escape, health ...).
  4) DESIRED OUTCOME - after buying, what in the CUSTOMER'S LIFE is better - not the service itself.
  5) EMOTIONAL REWARD - how they want to FEEL afterward (beautiful, confident, safe, proud, excited,
     relaxed, powerful, successful, hopeful, inspired).
  6) TRUST REQUIREMENT - what they must believe before buying (competence, craftsmanship, luxury,
     safety, creativity, authority, speed, reliability).
  7) IDENTITY - who they BECOME by choosing this: luxury salon = "I feel beautiful"; law firm = "I
     feel protected"; CPA = "I feel in control"; luxury hotel = "I feel important"; sports bar = "I am
     with my people"; craft brewery = "I am discovering something special."
  8) EXPERIENCE - what happens while they are there (atmosphere, hospitality, service, conversation,
     food, music, comfort, celebration, escape).
  9) MEMORY - the story they tell driving home. NOT "they used brushes / cumin / hops." Instead:
     "that was amazing," "we are going back," "they made me look incredible," "they solved my
     problem." THE MEMORY IS THE BRANDING TARGET.
  10) RECOMMENDATION - why they would tell a friend. Let that reason shape the name.

MENTAL IMAGERY FIRST: before writing a name, silently ask "what PICTURE appears in the customer's mind
the instant they hear it?" Generate from that picture - the emotion follows the image.
OPTIMIZE FOR LOVE, NOT CORRECTNESS: correctness is only the floor. The target is not "that is an
appropriate name" but "I would absolutely choose that." Emotional preference is what you optimize for.
Only after all of this is complete do you generate brand names.

THE TRANSFORMATION RULE - never lead with ingredients, tools, parts, materials, engineering,
manufacturing, body parts, or physical mechanics unless they are truly central to the brand. Always
ask: "what positive transformation is the customer actually buying?" Name the destination, not the
struggle: hair / beauty -> confidence and style, never roots or split ends; skincare -> radiance,
never acne or pores; weight loss -> health and strength, never fat or shame; mental health -> hope
and healing, never illness; recovery -> a second chance and strength, never shame; medical ->
healing, expertise, and care, never the disease.

SAME FRAMEWORK, DIFFERENT WEIGHTS - keep the model identical; only shift what matters most:
  - Law: trust, authority, competence.        - Luxury: aspiration, exclusivity, identity.
  - Restaurants: taste, hospitality, atmosphere, memory (never the ingredients).
  - Beauty: confidence, style, transformation.   - Healthcare: hope, healing, confidence.
  - Recovery: renewal, strength, future.       - Local services: relief, reliability, craftsmanship.
  - Entertainment: fun, energy, belonging (a sports bar stays FUN, never elegant).
  - Community: belonging, shared identity.

TIER MATCHING - luxury and economy must NEVER sound alike. Luxury hotel: prestige, refinement,
escape, exclusivity. Economy motel: clean, reliable, comfortable, affordable. Luxury salon: fashion,
elegance, exclusivity. Budget salon: friendly, accessible, practical.

READ THE WHOLE PHRASE, never one word: River Bank Cleanup = environmental, not a bank. Trust Attorney
/ Trust Company = estate & fiduciary law. Water Treatment Plant / Power Plant Consultant = facilities
/ energy; Plant Nursery = plants. Security / Cybersecurity = protection, not financial securities.
White Collar Criminal Defense = discreet, strong defense. Home Inspector = trust and peace of mind.
Always name what the business ACTUALLY does.

STAY GROUNDED - do NOT drift into vague aspirational mush. The brand name must still clearly FIT the
business and read as a real company a stranger instantly understands. Balance identity, emotion,
clarity, memorability, and industry fit. A beautiful name that hides what the business is has failed.

THE FOUR LANES - a generous spread across all four:
  HUMAN TOUCH (signature; warmest, richest set): warm, personal, alive - pour your best here.
  CLEVER: sharp, witty, distinctive with motion - never silly, crude, or a forced pun.
  STANDARD: clear, simple, confident - instantly understood; a real brand, never lazy filler.
  PROFESSIONAL: calm, credible, premium, trusted, established. NEVER fake founder surnames
  ("Sullivan & Marks") and NEVER filler suffixes (Partners / Associates / Advisory / Consulting /
  Group / LLP) bolted on to fake formality.

HARD RULES: a real BRAND name, not a description; short (1-2 words ideal), easy to say & spell, sounds
like a real company; name the WHOLE business, not one part; clean and professional; NEVER use a real
company / brand / trademark; favor an open .com / .net. Do not lean on tired AI-consensus words
(Haven, Forge, Nexus, Summit, Pinnacle, Catalyst, Sterling, Granite, Cornerstone, Elevate, Thrive,
Solutions) or, in professional names, the overused comfort words (Guardian, Shield, Harbor, Beacon,
Counsel, Defense, Legal, Trust, Integrity, Fortress, Aegis) - use a WIDER vocabulary.

Tag each name's lane. Return ONLY JSON, no prose, no markdown:
{"names":[{"name":"","lane":"professional|standard|clever|human","why":"max 6 words"}]}`;

    const focus = lanes.length
      ? ('\n\nThis round, generate names ONLY in these lane(s): ' + lanes.join(', ') + '. Tag each with one of those lanes.')
      : '';
    const userMsg = 'Business: "' + seed + '". Give me ' + count + ' names. Return a JSON object with a "names" array.' + focus +
      (avoid.length ? ('\n\nAlready suggested earlier — do NOT repeat these or close variants; give all-NEW names:\n' + avoid.join(', ')) : '');

    async function askModel() {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 9000);
      try {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
          body: JSON.stringify({ model: MODEL, temperature: 1.0, max_tokens: 800,
            response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }] })
        });
        clearTimeout(t);
        const raw = await r.text();
        if (!r.ok) return { ok: false, status: r.status, raw };
        let data; try { data = JSON.parse(raw); } catch (e) { return { ok: false, parse: true, raw }; }
        let content = (((data.choices || [])[0] || {}).message || {}).content || '';
        content = content.replace(/```json|```/g, '').trim();
        let parsed; try { parsed = JSON.parse(content); } catch (e) {
          const a = content.indexOf('['), b = content.lastIndexOf(']');
          if (a !== -1 && b !== -1) { try { parsed = JSON.parse(content.slice(a, b + 1)); } catch (e2) {} }
        }
        let list = null;
        if (Array.isArray(parsed)) list = parsed;
        else if (parsed && typeof parsed === 'object') { for (const k of Object.keys(parsed)) { if (Array.isArray(parsed[k])) { list = parsed[k]; break; } } }
        if (Array.isArray(list)) return { ok: true, arr: list };
        return { ok: false, nojson: true };
      } catch (e) { clearTimeout(t); return { ok: false, aborted: (e && e.name === 'AbortError') }; }
    }

    let res = await askModel(); if (!res.ok) res = await askModel();
    if (!res.ok || !Array.isArray(res.arr)) return out({ seed, model: MODEL, count: 0, names: [] });

    const LANES = { professional: 1, standard: 1, clever: 1, human: 1 };
    let slim = res.arr.map(n => ({
      name: String((n && n.name) || '').trim(),
      why: String((n && n.why) || '').trim(),
      lane: (LANES[String((n && n.lane) || '').toLowerCase()] ? String(n.lane).toLowerCase() : 'professional')
    })).filter(n => n.name).slice(0, count);
    if (!slim.length) return out({ seed, model: MODEL, count: 0, names: [] });

    const checked = await Promise.all(slim.map(async n => {
      const base = n.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const open = await openEndings(base);
      const restrictedOpen = open.filter(t => RESTRICTED_SET.has(t));
      const best = open.length ? (base + '.' + open[0]) : '';
      return { name: n.name, why: n.why, lane: n.lane, open,
        restrictedOpen, restrictedNote: restrictedOpen.length ? RESTRICTED_NOTE : '',
        domainAvailable: open.length > 0, domain: best, direction: n.lane };
    }));
    const available = checked.filter(n => n.domainAvailable);
    return out({ seed, model: MODEL, count: available.length, checked: checked.length, names: available });
  } catch (e) { return out({ error: 'Unexpected: ' + (e && e.message ? e.message : String(e)) }); }
};
