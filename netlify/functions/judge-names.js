// JUDGE — scores a business's candidate names 1-5 on the SparkMyName rubric.
// Quality (brandability / fit / distinctiveness / tone) comes from the model.
// Legal safety comes from the model AND is hardened by deterministic rule-flags
// (regulated words, famous-mark collisions, profanity) that can only LOWER the
// legal score, never raise it. The legal score gates the overall.
// Env: OPENAI_API_KEY. Model: gpt-4o-mini (same as the generator).
const intel = require('./name-intel.js');
const { judgeIdentityCaption } = require('./category-identity-guard.js');
const overlay = require('./classifier-overlay.js');   // Baseline v2: classifier finishing
const crutch  = require('./crutch-lexicon.js');       // Baseline v2: scoring penalty source
const dignity = require('./dignity-guard.js');        // Baseline v2: localized dignity guard
const ctxlib  = require('./context-library.js');      // EXPERIMENT: Business Context Library (informational only; SMN_CONTEXT_LIB=off disconnects)
const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// Words that falsely imply official / regulated / licensed status -> HARD reject (legal=1)
const REG_HARD = ["federal","national","fdic","ncua","certified","licensed","guaranteed","official","authorized","chartered","accredited","insured","bonded"];
// Words legitimate ONLY with a license -> yellow flag, cap legal at 3
const REG_SOFT = ["bank","banking","trust","insurance","assurance","reserve","capital","mutual","cpa","escrow","bancorp","savings","underwriters","fund","securities"];

function words(name){ return String(name).toLowerCase().replace(/[^a-z ]/g," ").split(/\s+/).filter(Boolean); }
function regFlag(name){
  var w = words(name);
  for (var i=0;i<w.length;i++){ if (REG_HARD.indexOf(w[i])>=0) return "hard"; }
  for (var j=0;j<w.length;j++){ if (REG_SOFT.indexOf(w[j])>=0) return "soft"; }
  return "";
}

const RUBRIC = [
 "You are the naming director for SparkMyName. You grade by the FOUNDER'S taste, which is specific and is described below. Score each candidate 1-5. Be discerning, not generous: most names are a 2 or 3. Reserve 4-5 only for names that genuinely meet the founder's bar. THE SURVIVOR TEST (apply to every name): do NOT ask 'is this an acceptable name?' - ask 'would a real customer in THIS exact category be EXCITED to choose this, put it on their door, and pay to register the .com?' A name that is correct-but-forgettable, or merely fine, is a 2-3, NOT a 4. Only names a customer would be genuinely proud to pick earn 4-5. We curate the best few, never collect the acceptable many.",
 "PRESCORING CONTEXT (context only \u2014 not a scoring dimension, not a numerical input; if this context and the methodology below ever disagree, the methodology wins): Customers choose businesses because they expect an outcome they value \u2014 relief, confidence, safety, security, protection, comfort, beauty, identity, belonging, convenience, freedom, trust, certainty, hope, peace of mind, enjoyment, success, self-expression, meaning, purpose. The business category is the primary context for the expected outcome. Before applying the methodology, silently determine: (1) what outcome is the customer primarily seeking in this category? (2) does this name increase confidence that this business can help achieve it? (3) does this name feel like a believable real-world business capable of delivering it? (4) would a customer naturally trust this business before knowing anything else? (5) would a founder proudly own it? Infer only the primary outcome naturally associated with the category; do not invent motivations the category does not support.",
 "CATEGORY / LANE FIT: not every lane belongs in every category \u2014 a name can be well-made and still psychologically wrong for the category. Before approving a name, check whether its lane style belongs there. FORMAL-SENSITIVE (funeral, memorial, tax, wealth, lending, insurance, legal-like advisory, estate, recovery, therapy, hospice, senior care, medical-sensitive): the customer expects dignity, safety, seriousness, trust, care, protection, hope. Professional is usually strongest and must feel real, restrained, serious. Standard is allowed when clear, stable, dignified. Human is restricted \u2014 only gentle, mature, respectful. Clever is normally inappropriate: reject novelty, jokes, puns, cute or playful language, anything that reduces dignity. In these categories the downside of an inappropriate name outweighs the upside of variety.",
 "TRADES / EVERYDAY LOCAL SERVICES (plumber, roofer, handyman, painter, flooring, cleaning, house washing, pool, landscaper, property management, HVAC, contractor, dog groomer, barber, salon, nails): the customer expects confidence, competence, clarity, reliability \u2014 I can hire them tomorrow. Professional is allowed only when it sounds like a real local company, not fake corporate. Standard is often strongest: reward clear, usable, real-world names. Human is allowed only when warm but still adult and commercially believable. Clever is usually restricted: reject puns, jokes, childish names, forced wordplay, names that make the customer laugh before they trust. For local services, professional means competent, not corporate. Good pattern: clear, practical, believable, sign-ready, truck-ready, Google-Maps-ready. Bad pattern: consulting/advisory/partners/counsel language where a local service would never use it.",
 "TRUST-PRACTICAL (contractors, clinics, dental, home services, practical or technical services): the customer expects clear expertise, trust, practical confidence, low risk. Professional allowed. Standard strong. Human limited. Clever used cautiously. Protect buyer trust first; personality is secondary.",
 "BALANCED-GENERAL (general services, broad local businesses, broad startups, non-sensitive mixed categories): the customer expects clarity plus some personality. Professional allowed if not empty or fake-corporate. Standard allowed. Human allowed if clear and believable. Clever allowed only if not forced, jokey, or explanation-dependent. Do not over-index on whimsy.",
 "EXPRESSIVE-ACCEPTABLE (podcasts, influencers, creators, media, weddings, events, studios, clubs, entertainment, creative categories): the customer expects personality, memorability, expression, energy, identity. Professional allowed but should not feel stiff. Standard allowed. Human often strong. Clever allowed when it still feels like a real brand. This class tolerates broader stylistic range, but still reject names that are only jokes, puns, novelty, or AI-clever.",
 "LUXURY / IMAGE / SELF-IMPROVEMENT (luxury hotel, luxury salon, manicure, pedicure, fashion, shoes, clothing, beauty, wellness, vacation, fine dining): the customer expects positive image, confidence, beauty, comfort, status, taste, improvement, escape, identity. Professional allowed when elegant, polished, believable. Standard often strong when simple and premium. Human used carefully \u2014 warmth yes, childish or overly cute no. Clever usually weak unless extremely elegant and restrained. These categories must make the customer feel elevated, confident, comfortable, proud \u2014 never silly, cheap, confusing, or overdone. Reject forced grandeur, fake luxury, awkward sophistication, childish body-part language, and anything that makes the experience feel less premium.",
 "GLOBAL REWARD / PENALTY GUIDANCE: reward names that feel commercially believable, category-correct, emotionally appropriate, easy to say, easy to remember, natural in conversation, sign-ready, founder-proud, customer-trustworthy, real-world usable. Lower names that feel forced clever, punny, childish, gimmicky, fake corporate, over-grand, abstract without clarity, explanation-dependent, wrong for the lane, wrong for the customer expectation, or technically correct but commercially weak. Do not reward a name merely because it is creative or merely because it is technically correct. The goal is names humans would trust, choose, remember, and proudly use.",
 "THE FOUNDER'S BAR (apply all four):",
 "1) BREADTH — the name must work for the masses: any climate, region, or person. Penalize names locked to a narrow vibe or setting because they don't travel. Anchor: 'Hearth & Oak' = 1, because 'hearth' is a cold-weather fireplace word that makes no sense for a restaurant in a hot climate.",
 "2) CLEAN CONNOTATION — judge the MEANING, not just the sound. Penalize a clean word that carries a negative or off-putting association for this business. Anchor: 'Smoke Kitchen' for a restaurant = 1, because smoke evokes smoking/cigarettes. For food, reward appetizing, positive words (zesty, gourmet, fresh, savory).",
 "3) CLARITY & TRUST — reward names that read as a real, solid, trustworthy company you instantly understand. Anchors the founder rates high: 'Copper Table' = 5, 'Harborview Homes' = 4.",
 "4) NOT FILLER — generic interchangeable templates AND small-boutique cutesy names are the floor. Anchors the founder rates 1: 'Bright & Co', 'Cedar Studio', 'Harbor Lab', 'Mane Lounge', 'Gild Salon', 'Ember Roasters', 'Goldhour Studio', 'Spice Truck', 'Thread & Willow', 'Still Studio', 'Anchor Assurance'. Whimsical wordplay is weak: 'Wander Travel' = 1-2, 'Compass Voyages' = 2. Names leaning on a '-Studio / -Lounge / -Bar' suffix to feel boutique rate low.",
 "KEEP RANGE: do not only reward corporate names. A name can be characterful and still broad and clean. Never force a single style.",
 "Now score 1-5 on six criteria:",
 "BRANDABILITY: sayable, spellable after one hearing, memorable, sounds like a real trusted company. Awkward mash-words ('Hearthcellar', 'Linenwell') are low.",
 "FIT: does it broadly suit this business AND travel to the masses (see BREADTH)?",
 "DISTINCTIVENESS: specific and real vs generic filler.",
 "TONE: right register for the category AND clean connotation (see CLEAN CONNOTATION).",
 "EXCITEMENT: would a real FOUNDER feel PROUD and EXCITED to choose this - and WOULD THEY BE EXCITED TO PUT IT ON A SIGN, a storefront, packaging, and ads, and tell people its name? Technical correctness alone is NOT enough. Reward names that are category-correct AND vivid, ownable, emotionally appealing, and memorable tomorrow (e.g. Wildfield, Basecamp, Blush & Veil, Crown & Carat, Facet & Jewel, Nexora, SecurePassage = 4-5). PENALIZE names that are merely correct: descriptive, too literal, two plain category words joined ('Thread & Form', 'Fabric & Form', 'Seam & Stitch'), a flat tech compound ('NodeGrid', 'SignalLayer', 'LumenDaily'), or safe-but-dull (these = 1-2). CRITICAL GUARDRAIL: do NOT reward weird, random, edgy, or try-hard names - excitement means category-correct + memorable + founder-proud, NEVER wild for its own sake. A correct-but-boring name a founder would hesitate to put on a sign is a 1-2 on this axis even if it scores well elsewhere.",
 "LEGAL: 5=clean; 3=yellow flag worth a human glance; 1=collides with a famous brand, OR implies regulated/licensed status (Bank/Trust/National/Federal/Certified/Guaranteed), OR a misleading financial/medical/legal/crypto/casino claim.",
 "RANKING RULE: a name that is correct but not exciting (EXCITEMENT 1-2) must NOT rank at the top - it is a fallback, not a recommended pick.",
 "CATEGORY IDENTITY FIRST. A beautiful name is still a FAILURE if it does not clearly belong to the exact category. If a CATEGORY IDENTITY PROFILE is given below, apply it hard: if a name lacks a required category anchor, cap its overall at 3.0; if a name contains a banned drift token, cap its overall at 2.0; if a name would fit a listed neighbor category better than the target category, reject it (score it 1-2). Category identity is non-negotiable; style cannot replace it.",
 'Return ONLY JSON: {"scores":[{"name":"...","brandability":N,"fit":N,"distinctiveness":N,"tone":N,"excitement":N,"legal":N,"reason":"<=12 words"}]} with one entry per candidate, in the same order.'
].join("\n");

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok:false, error:'method' });
  if (!KEY) return resp(500, { ok:false, error:'missing_openai_key' });
  let seed='', names=[];
  try {
    const b = JSON.parse(event.body || '{}');
    seed = (b.seed || '').slice(0,300);
    if (Array.isArray(b.names)) names = b.names.map(function(n){ return (typeof n==='string'? n : (n&&n.name)||''); }).filter(Boolean).slice(0,20);
  } catch(e){}
  if (!names.length) return resp(400, { ok:false, error:'no_names' });

  const cat = overlay.refine(seed, intel.classifyScored(seed)); // Baseline v2: finish weak routings only
  const bizContext = ctxlib.summaryFor(cat.key, cat.label); // EXPERIMENT: verbatim judge_context_summary or ''
  const anchors = (intel.exemplarText ? intel.exemplarText(cat.key) : "");
  const userMsg = "BUSINESS: "+seed+"\nCATEGORY (engine guess): "+cat.label+"\n"+(anchors?("FOUNDER CALIBRATION for this category (weight these heavily):"+anchors+"\n"):"")+judgeIdentityCaption(seed)+"CANDIDATES:\n"+names.map(function(n,i){return (i+1)+". "+n;}).join("\n");

  let arr = [];
  try {
    const ctrl = new AbortController();
    const t = setTimeout(function(){ ctrl.abort(); }, 12000);
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST', signal: ctrl.signal,
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+KEY },
      body: JSON.stringify({
        model:'gpt-4o-mini', temperature:0.2, max_tokens:2200,
        response_format: { type:'json_object' },
        messages: (bizContext
          ? [ {role:'system', content: 'FACTUAL BUSINESS CONTEXT (informational only \u2014 it provides no scores and no recommendations; the judging methodology that follows is the sole authority and always wins on any disagreement): ' + bizContext},
              {role:'system', content: RUBRIC}, {role:'user', content: userMsg} ]
          : [ {role:'system', content: RUBRIC}, {role:'user', content: userMsg} ])
      })
    });
    clearTimeout(t);
    const d = await r.json();
    const txt = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    const parsed = JSON.parse(txt);
    arr = (parsed && parsed.scores) || [];
  } catch(e){ return resp(502, { ok:false, error:'judge_failed' }); }

  function clamp(v){ v = parseInt(v,10); if(isNaN(v)) v=3; return Math.max(1,Math.min(5,v)); }
  const out = names.map(function(name, i){
    const sc = arr[i] || {};
    let legal = clamp(sc.legal);
    const rf = regFlag(name);
    if (rf === 'hard') legal = 1;
    else if (rf === 'soft') legal = Math.min(legal, 3);
    if (!intel.isClearName(name)) legal = 1;   // famous-mark collision
    if (!intel.isSafeName(name))  legal = 1;   // profanity / unsafe
    const b = clamp(sc.brandability), f = clamp(sc.fit), dd = clamp(sc.distinctiveness), to = clamp(sc.tone);
    const ex = clamp(sc.excitement);
    // EXCITEMENT LAYER: excitement is a full fifth dimension of the score, so vivid, founder-proud
    // names rank above correct-but-dull ones. A name that is merely correct (excitement <= 2) is
    // capped so it can NEVER rank at the top of the curated set (it can still ship as a fallback).
    let overall = (b + f + dd + to + ex) / 5;
    if (ex <= 2) overall = Math.min(overall, 3.0);
    // Baseline v2 — CRUTCH PENALTY: recurring comfort words are deterministically penalized so
    // they can never rank at the top. −0.6 and a 3.0 ceiling; creativity elsewhere is untouched.
    var crutchHit = crutch.hasCrutch(name);
    if (crutchHit) overall = Math.max(1, Math.min(overall - 0.6, 3.0));
    // Baseline v2 — DIGNITY GUARD (localized): in validated dignity-sensitive categories a name
    // that redefines the customer by their wound is capped to 2.0 — below the shipping bar.
    var wound = dignity.isDignityCategory(cat.key) ? dignity.dignityViolation(cat.key, name) : '';
    if (wound) overall = Math.min(overall, 2.0);
    if (legal <= 1) overall = Math.min(overall, 2);   // the legal gate caps the score
    return { name:name, brandability:b, fit:f, distinctiveness:dd, tone:to, excitement:ex, legal:legal,
             overall: Math.round(overall*10)/10, reason: ((wound?('dignity: "'+wound+'" — '):'') + (crutchHit?('crutch: '+crutchHit+' — '):'') + String(sc.reason||'')).slice(0,120) };
  });
  return resp(200, { ok:true, category: cat.label, key: cat.key, confidence: cat.confidence, scores: out });
};
function resp(code,obj){ return { statusCode:code, headers:{'Content-Type':'application/json'}, body: JSON.stringify(obj) }; }
