// clean-names.js — CLEAN ROOM. None of the old engine's guards, bans, identity police,
// diversity sort, hard-rejects, or fallback. Just: understand the business -> invent real
// names -> check the .com. The old generate-names.js is untouched (full rollback).
//
// One model call. One strong creative brief. One domain check. That's the whole thing.

const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const MODEL = process.env.CLEAN_MODEL || 'gpt-4o-mini'; // bump to 'gpt-4o' in Netlify env for a bigger brain

// Which endings to check. .com/.net resolve via Verisign; the rest via the general RDAP resolver.
// UNIVERSAL = anyone can register. RESTRICTED = professional/credentialed extensions; we still
// offer them when open, but the branding kit shows a short eligibility disclaimer next to them.
const TLDS_UNIVERSAL = ['com', 'net', 'co', 'io', 'studio', 'shop', 'ai', 'agency', 'group',
                        'design', 'app', 'pro', 'biz', 'company'];
const TLDS_RESTRICTED = ['law', 'legal', 'cpa', 'realty', 'homes', 'realestate', 'inc'];
const TLDS = Array.from(new Set([...TLDS_UNIVERSAL, ...TLDS_RESTRICTED]));
const RESTRICTED_SET = new Set(TLDS_RESTRICTED);
// Shown in the branding kit beside any restricted ending that's available.
const RESTRICTED_NOTE = 'Eligibility required: this professional domain extension requires proof of credentials or licensing to register. Verify you qualify before purchasing.';

async function rdapOpen(base, tld) {
  const url = (tld === 'com' || tld === 'net')
    ? 'https://rdap.verisign.com/' + tld + '/v1/domain/' + base + '.' + tld
    : 'https://rdap.org/domain/' + base + '.' + tld;
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 2000);
    const r = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/rdap+json' } });
    clearTimeout(t);
    if (r.status === 404) return true;   // available
    if (r.status === 200) return false;  // taken
    return null;                         // unknown
  } catch (e) { return null; }
}
// NONPROFIT .ORG SUPPORT (Founder unlock order, 2026-07-05 — surgical, additive only).
// Detection uses the structured flag when the caller provides one (body.nonprofit), with a
// deterministic explicit-vocabulary check on the customer's own idea text as fallback —
// it only fires when they SAY nonprofit/charity/foundation/NGO/501(c)(3). No guessing.
function detectNonprofit(seed, flag) {
  if (flag === true) return true;
  return /\b(non[\s-]?profit|charity|charitable|foundation|ngo|501\s*\(?c\)?\s*\(?3\)?)\b/i.test(String(seed || ''));
}
// Ending order: general customers keep the exact current hierarchy (unchanged, .org never
// checked for them). Nonprofits: .com -> .net -> .org -> .co -> the rest, restricted last.
function endingsFor(nonprofit) {
  if (!nonprofit) return TLDS;
  const uni = TLDS_UNIVERSAL.slice();                       // com, net, co, ...
  uni.splice(2, 0, 'org');                                  // com, net, org, co, ...
  return Array.from(new Set([...uni, ...TLDS_RESTRICTED]));
}
const ORG_NOTE = 'We found a .org option \u2014 commonly used by nonprofits and organizations.';
async function openEndings(base, nonprofit) {
  if (!base) return [];
  const LIST = endingsFor(nonprofit);
  const res = await Promise.all(LIST.map(async tld => ({ tld, open: await rdapOpen(base, tld) })));
  // Universal endings first (so the "best" pick favors a domain anyone can buy), restricted after.
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
    const NONPROFIT = detectNonprofit(seed, body && body.nonprofit === true); // Founder order 2026-07-05
    const count = Math.min(8, Math.max(2, body.count || 3)); // TINY batch -> each call finishes in ~2-3s, never times out
    const avoid = Array.isArray(body.avoid) ? body.avoid.map(x => String(x || '').trim()).filter(Boolean).slice(0, 160) : [];
    const okLane = { professional: 1, standard: 1, clever: 1, human: 1 };
    const lanes = Array.isArray(body.lanes) ? body.lanes.filter(l => okLane[l]) : [];
    if (!seed) return out({ error: 'Type a business type.' });

    const sys =
`You are an elite brand namer. The customer is PAYING for a professional, brandable name they
will put on their real business — crafted and intelligent, something they'd be proud of, not a
gimmick. First understand what this business actually does, who it serves, and the substance of
its work. Then deliver ${count} names.

================  RULE #1 — READ THIS FIRST. IT OUTRANKS EVERYTHING BELOW.  ================
The single fastest way to look like a cheap AI is to keep reaching for the same small bag of
"comfort words" and gluing them onto the industry word. That is FORBIDDEN. These exact words and
suffixes are BANNED — do not use them in ANY name, in ANY position, ever:

  Haven · Heart · Heartfelt · "Heart of ___" · Nest · Wise · Craft · Crafted · Crafters ·
  Forge · Bridge · Nexus · Harmony · Collective · Sphere · Hub · Works · Ember · Grove ·
  Compass · Ledger · Elevate · Visionary · Journey · Thrive · Empower · Trust___ · Secure___ ·
  and anything ending in -Wise, -Nest, -Craft, -Forge, -Sphere, -Hub, -Works, -ify.

ALSO banned — empty corporate wallpaper: Granite, Sterling, Keystone, Cornerstone, Vanguard,
Bastion, Apex, Summit, Meridian, Pillar, Veritas, Clarity, Solutions.

Instead, work in THIS ORDER — it is the whole secret to a fresh name:

  STEP A — Before you write a single name, silently brainstorm 6-10 CONCRETE, physical specifics
  that belong to THIS exact business and almost no other: its raw materials, tools, the motion of
  the work, the place it happens, the time of day, sounds, textures, the feeling a customer has in
  the room. (A bakery: flour, crust, dawn, the warm oven, rising dough, the first bite. A welder:
  the spark, the seam, molten steel, the mask, the joint that holds. A law firm: the gavel, the
  brief, the closing argument, the handshake, the long table.) Be vivid and specific.

  STEP B — Build the names OUT OF those concrete specifics — the real nouns and images you just
  listed — not out of abstract business-y mood words. A name made of a real, specific thing from
  the work will always beat a name made of a vague feeling. Concrete beats abstract every time.

Every one of your ${count} names must be rooted in a DIFFERENT specific from your Step A list; no
two may share the same root, image, or formula. If a name could be dropped onto a totally different
industry without anyone noticing, it is too generic — throw it out and build one only this business
could wear. Surprise me with something true to the work.
==========================================================================================

Now deliver the ${count} names as a generous, deliberate SPREAD (a buffet) across four styles:

- PROFESSIONAL (solid and strong, especially for serious fields like engineering, law, finance,
  medicine): polished, intelligent, crafted, real names a serious founder buys with pride.
  Distinctive, ownable, clearly tied to the business.
- STANDARD (solid set): simple, clear, safe names for buyers who don't want anything clever —
  plain and dependable.
- CLEVER (open this up): sharp, witty twists that make someone think "that's smart, these people
  are good." Intelligent craft. NEVER silly, NEVER crude.
- HUMAN TOUCH (OUR SIGNATURE STRENGTH — open it up the MOST, deepest and richest set): warm,
  likable, full of personality, the kind that makes a customer smile and feel something. Tasteful,
  still professional, but rich with human warmth. Pour your best creativity here — WITHOUT falling
  back on the banned comfort words above (warmth comes from fresh imagery, not from "Haven"/"Heart").

Spread the ${count} names so every lane fills evenly; make HUMAN TOUCH the richest in quality, but
keep a steady supply to the other three. Don't crowd everything into one lane.

PROFESSIONAL-SERVICES MODE — applies ONLY when the business is a LICENSED or FORMAL professional
practice that a client hires for expert advice or representation: attorney / law firm, accountant /
CPA / tax, financial advisor / wealth management, insurance agency, medical / dental practice,
engineering firm, architecture firm, management consultancy. For these fields ONLY, these customers
want CONSERVATIVE, CREDIBLE, ESTABLISHED names — the kind that look right on a firm's door, a
letterhead, or a courthouse directory. For these fields ONLY, relax the "avoid Group/Partners"
guidance below: dignified surnames and surname pairs (e.g. Hadley & Cross, Whitfield Partners,
Calder Reese), and restrained professional suffixes (Partners, Group, Advisory, Associates, Counsel)
are WELCOME and expected. Draw on the serious, dignified vocabulary of the field — counsel, brief,
charter, statute, fiduciary, audit, equity — rather than playful imagery. Keep these understated,
trustworthy and grown-up; NEVER cute, trendy, punny, or gimmicky for a professional field.

  *** CRITICAL GUARD — DO NOT MISFIRE THIS MODE ***
  Do NOT enter Professional-Services Mode just because a business has a formal- or institutional-
  sounding word in it. A science center, discovery center, children's museum, learning center,
  community / recreation center, academy, institute, foundation, observatory, aquarium, zoo, pet
  store / pet supply store, gift shop, market, gym, salon, or studio — and ANY business for families,
  kids, entertainment, recreation, retail, food, or experiences — is NOT a professional service, even
  though it may contain "center," "institute," "store," "academy," or "foundation." A children's
  science center is a place of WONDER and DISCOVERY, not a law firm. For every one of these, stay
  FRESH and CONCRETE per Rule #1 (build from the real, physical specifics of the place and the
  experience), and NEVER give them surname pairs ("___ & ___") or the suffixes Partners / Group /
  Advisory / Associates / Council / Counsel, and never the stiff words Fiducial / Statute / Charter /
  Meridian. When you are unsure whether a business is a TRUE licensed professional practice, DEFAULT
  to fresh and concrete — never to firm-style. (This mode also does not loosen Rule #1 for trades,
  food, retail, creative, or consumer brands.)

HARD RULES:
- Keep it CLEAN and professional. NO crude, suggestive, off-color, or inappropriate names.
- NEVER use a real company, product, or brand name or trademark (e.g. no "Ragu", "Nike",
  "Tesla", real chains). It's a legal landmine.
- Name the WHOLE business, not one single product or menu item. An Italian restaurant serves many
  dishes, not just ravioli — evoke the cuisine, the table, the experience, the region.
- Short (1-2 words). A real hook tied to the actual work of THIS business — substance.
- Make distinctive BRAND names, not literal service descriptions. Avoid plain trade-label tack-ons
  (Inc., LLC, Services, Group, Network) used just to describe the trade instead of branding it.
- Favor names whose .com / .net / .co is plausibly still open.

================  FINAL SELF-CHECK — DO THIS BEFORE YOU ANSWER  ================
Re-read your own ${count} names one by one. For EACH name ask TWO questions:
  (1) Does it contain ANY banned word or suffix from Rule #1 (Haven, Heart, Nest, Wise, Craft,
      Forge, Bridge, Nexus, Harmony, Collective, Ember, Grove, Pinnacle, Catalyst, -Wise, -Nest,
      -Craft, etc.)? If YES — DELETE it and rebuild from a concrete specific in your Step A list.
  (2) Is it built from a CONCRETE, physical specific of this exact business — or from a vague mood
      word that could fit any company? If it's vague/generic — DELETE it and rebuild from a real
      specific. The test: "Could a totally different industry use this name?" If yes, it fails.
  (3) Is this a family, kids, entertainment, recreation, retail, food, experience, or institutional-
      but-NOT-licensed business (a science center, museum, aquarium, pet store, gym, market — NOT an
      actual law / finance / medical / engineering / architecture practice)? If YES, does the name use
      a surname pair ("___ & ___") or any suffix Partners / Group / Advisory / Associates / Council /
      Counsel, or a stiff institutional word (Fiducial, Statute, Charter, Meridian)? If so — DELETE
      it: that is law-firm naming on a business that should feel alive. Rebuild it from a concrete
      specific of the real experience.
Also confirm no two names share the same root or formula; if they do, replace one. Only return the
list AFTER it passes ALL checks clean.
=============================================================================

Tag each name's lane. Return ONLY a JSON object with a "names" array, no prose, no markdown:
{"names":[{"name":"","lane":"professional|standard|clever|human","why":"max 6 words"}]}`;

    const focus = lanes.length
      ? ('\n\nIMPORTANT: this round generate names ONLY in these lane(s): ' + lanes.join(', ') +
         '. Tag each name with one of those lanes. Do NOT produce names in any other lane.')
      : '';
    const userMsg = 'Business: "' + seed + '". Give me ' + count + ' names. Return a JSON object with a "names" array.' + focus +
      (avoid.length ? ('\n\nThese names were ALREADY suggested in earlier batches — do NOT repeat any of them or close variants; give all-NEW, different names:\n' + avoid.join(', ')) : '');

    // ---- Model call with JSON mode + ONE retry. The bigger/slower gpt-4o brain sometimes
    // returns chatty or cut-off text instead of a clean list; JSON mode forces a clean object,
    // the longer timeout gives it room, and a single retry catches the occasional hiccup.
    // WAY OUT: if both tries fail, we DON'T strand the batch with an error — we return [] and the
    // caller simply shows no box for this category (same spirit as the hide-if-zero rule).
    async function askModel() {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000); // gpt-4o is slower; give it room, still under Netlify's limit
      try {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
          body: JSON.stringify({
            model: MODEL,
            temperature: 1.0,
            max_tokens: 700,
            response_format: { type: 'json_object' }, // JSON MODE: forces clean output, no chatter
            messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }]
          })
        });
        clearTimeout(t);
        const raw = await r.text();
        if (!r.ok) return { ok: false, status: r.status, raw };
        let data; try { data = JSON.parse(raw); } catch (e) { return { ok: false, parse: true, raw }; }
        let content = (((data.choices || [])[0] || {}).message || {}).content || '';
        content = content.replace(/```json|```/g, '').trim();
        // JSON mode returns an OBJECT; the names live in an array on some key. Find the first array.
        let parsed; try { parsed = JSON.parse(content); } catch (e) {
          // fallback: pull a bracketed array out of the text if present
          const a = content.indexOf('['), b = content.lastIndexOf(']');
          if (a !== -1 && b !== -1) { try { parsed = JSON.parse(content.slice(a, b + 1)); } catch (e2) {} }
        }
        let list = null;
        if (Array.isArray(parsed)) list = parsed;
        else if (parsed && typeof parsed === 'object') {
          for (const k of Object.keys(parsed)) { if (Array.isArray(parsed[k])) { list = parsed[k]; break; } }
        }
        if (Array.isArray(list)) return { ok: true, arr: list };
        return { ok: false, nojson: true, raw: content.slice(0, 300) };
      } catch (e) {
        clearTimeout(t);
        return { ok: false, aborted: (e && e.name === 'AbortError'), err: e && e.message };
      }
    }

    let res = await askModel();
    if (!res.ok) res = await askModel(); // ONE retry catches the occasional hiccup
    // WAY OUT: still failed -> return an empty (not an error) so the batch never gets stranded.
    if (!res.ok || !Array.isArray(res.arr)) {
      return out({ seed, model: MODEL, count: 0, checked: 0, tlds: TLDS, names: [] });
    }
    const arr = res.arr;

    const LANES = { professional: 1, standard: 1, clever: 1, human: 1 };
    let slim = arr.map(n => ({
      name: String((n && n.name) || '').trim(),
      why: String((n && n.why) || '').trim(),
      lane: (LANES[String((n && n.lane) || '').toLowerCase()] ? String(n.lane).toLowerCase() : 'professional')
    })).filter(n => n.name).slice(0, count);
    // WAY OUT: empty list is not an error — return [] so the category just shows no box.
    if (!slim.length) return out({ seed, model: MODEL, count: 0, checked: 0, tlds: TLDS, names: [] });

    // ---- SCREEN DOOR: hard crutch-word filter. Catches the stragglers the model still leaks
    // (Pinnacle, Nestle, Catalyst, Canvas, etc.) that instructions alone can't guarantee.
    // NOT A TRAP: it is controlled by the CRUTCH_FILTER env switch (default on; set to 'off' in
    // Netlify to disable instantly with no redeploy), AND it BACKS OFF rather than empty a batch —
    // if removing crutches would leave too few names, it keeps them. A slightly repetitive name
    // beats an empty box. There is always a way out.
    const FILTER_ON = (process.env.CRUTCH_FILTER || 'on').toLowerCase() !== 'off';
    const CRUTCHES = ['nestle','pinnacle','catalyst','canvas','haven','ember','grove','nexus',
                      'harmony','forge','bridge','sphere','mosaic','oasis','bloom','whisper',
                      'elevate','thrive','summit','apex','beacon','pulse',
                      // --- added after the 704-category read (Jun 25). Cross-trade filler the model
                      // leaks everywhere (no legit home), plus the two worst within-trade repeats:
                      // gavel (legal) and ledger (finance). Held for a later pass, on purpose, because
                      // they have a real home and a blunt filter can't tell crutch from on-theme:
                      // harbor/anchor (marine), sunrise/sunlit/sunset (solar/hospitality), compass
                      // (would falsely catch "compassion").
                      'precision','junction','handshake','savvy','pathway','pathfinder','gavel','ledger'];
    const hasCrutch = (nm) => {
      const low = ' ' + nm.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
      return CRUTCHES.some(c => low.includes(' ' + c + ' ') || low.includes(c));
    };
    if (FILTER_ON && slim.length) {
      const clean = slim.filter(n => !hasCrutch(n.name));
      // Keep filtered set ONLY if it leaves a healthy amount (>= 60% of what we had, and >= 2).
      // Otherwise back off and keep the originals — never return an empty/threadbare batch.
      if (clean.length >= Math.max(2, Math.ceil(slim.length * 0.6))) slim = clean;
    }

    const checked = await Promise.all(slim.map(async n => {
      const base = n.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const open = await openEndings(base, NONPROFIT);
      // Which of the open endings are restricted/professional (so the kit can show the disclaimer).
      const restrictedOpen = open.filter(t => RESTRICTED_SET.has(t));
      // "best" favors a universal ending (openEndings already sorts universal-first).
      const best = open.length ? (base + '.' + open[0]) : '';
      return {
        name: n.name, why: n.why, lane: n.lane, open: open,
        restrictedOpen: restrictedOpen,                          // e.g. ['law','legal'] — show disclaimer beside these
        restrictedNote: restrictedOpen.length ? RESTRICTED_NOTE : '',
        orgOpen: NONPROFIT && open.indexOf('org') >= 0,
        orgNote: (NONPROFIT && open.indexOf('org') >= 0) ? ORG_NOTE : '',
        domainAvailable: open.length > 0,   // platform filters on this
        domain: best,                        // best available ending, e.g. trueoperator.net
        direction: n.lane                    // platform groups by "direction"; lane stands in
      };
    }));

    // HIDE-IF-ZERO rule: a name nobody can register is not a real recommendation. Only return
    // names that have at least one available ending across the full universal + restricted list.
    const available = checked.filter(n => n.domainAvailable);

    return out({ seed, model: MODEL, count: available.length, checked: checked.length, tlds: TLDS, names: available });
  } catch (e) {
    return out({ error: 'Unexpected: ' + (e && e.message ? e.message : String(e)) });
  }
};

module.exports._smnDomainTest = { detectNonprofit, endingsFor };
