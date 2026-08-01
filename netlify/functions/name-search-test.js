// name-search-test.js — STANDALONE EXPERIMENT. Does NOT touch generate-names.js or the live engine.
// Idea (Peter's): ask a WEB-SEARCH-ENABLED model the right question (understand the profession,
// then invent short edgy brandable names), then run the names through the same .com (RDAP) check.
// This is the "do what I did in Chrome, but inside my product" test.

const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
// Web-search-capable chat model. Override with env SEARCH_MODEL if the name needs swapping.
const SEARCH_MODEL = process.env.SEARCH_MODEL || 'gpt-5.6-terra';

// --- .com availability via Verisign RDAP (same approach as the live engine) ---
async function comAvailable(base) {
  const url = 'https://rdap.verisign.com/com/v1/domain/' + base + '.com';
  async function one() {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 2500);
      const r = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/rdap+json' } });
      clearTimeout(t);
      if (r.status === 404) return true;   // not registered -> available
      if (r.status === 200) return false;  // registered -> taken
      return null;
    } catch (e) { return null; }
  }
  let res = await one();
  if (res === null) res = await one();
  return res; // true=open, false=taken, null=unknown
}

exports.handler = async (event) => {
  const out = (code, obj) => ({ statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) });
  try {
    if (!KEY) return out(200, { error: 'No OPENAI_API_KEY found in Netlify environment.' });
    const body = JSON.parse(event.body || '{}');
    const seed = (body.seed || '').trim();
    if (!seed) return out(200, { error: 'Type a business type first.' });

    const sys = 'You are a world-class brand-naming strategist with live web access. ' +
      'STEP 1: research and genuinely understand what this exact profession or business DOES — its real work, ' +
      'its materials, its world, who it serves, the danger or need it addresses. ' +
      'STEP 2: invent brand names FROM that understanding. ' +
      'The customer is an underdog escaping a forgettable or taken name (like "Joe\u2019s Plumbing") — they are paying for EDGE: ' +
      'a name that gets NOTICED, carries the SUBSTANCE of the work, is short, descriptive of the brand, and likely has an open .com. ' +
      'NEVER use generic trust/strength wallpaper words (Granite, Sterling, Keystone, Cornerstone, Vanguard, Bastion, Pillar, ' +
      'Ironclad, Summit, Apex, Meridian, Anchor, Oakhurst, Caldwell, Marlowe). Those are forbidden. ' +
      'Each name must have a real hook tied to what THIS business actually does.';

    const userMsg = 'Business type: "' + seed + '".\n' +
      'Give me 15 short, edgy, brandable names that tell the brand and fit what this business actually does.\n' +
      'Return ONLY a JSON array, no prose, no markdown. Each item: {"name":"","why":"6 words max"}.';

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
      // NOTE (2026-07-27): repointed from the retired gpt-4o-search-preview to gpt-5.6-terra.
      // web_search_options was search-preview-only and the replacement rejects it, so it is gone.
      body: JSON.stringify({
        model: SEARCH_MODEL,
        max_tokens: 2000,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }]
      })
    });

    const raw = await r.text();
    if (!r.ok) return out(200, { error: 'Model API error (' + r.status + '). Model tried: ' + SEARCH_MODEL + '. Detail: ' + raw.slice(0, 400) });

    let data; try { data = JSON.parse(raw); } catch (e) { return out(200, { error: 'Could not parse API response.', detail: raw.slice(0, 400) }); }
    let content = (((data.choices || [])[0] || {}).message || {}).content || '';
    content = content.replace(/```json|```/g, '').trim();
    // Pull the JSON array out of any surrounding text.
    const a = content.indexOf('['), b = content.lastIndexOf(']');
    if (a !== -1 && b !== -1) content = content.slice(a, b + 1);

    let names;
    try { names = JSON.parse(content); } catch (e) { return out(200, { error: 'Model did not return clean JSON.', detail: content.slice(0, 500) }); }
    if (!Array.isArray(names)) return out(200, { error: 'Unexpected format.', detail: content.slice(0, 300) });

    // .com check for each (parallel, capped)
    const slim = names.slice(0, 15).map(n => ({ name: String(n.name || '').trim(), why: String(n.why || '').trim() })).filter(n => n.name);
    const checks = await Promise.all(slim.map(async n => {
      const base = n.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const avail = base ? await comAvailable(base) : null;
      return { name: n.name, why: n.why, com: avail === true ? 'OPEN' : avail === false ? 'taken' : '—' };
    }));

    return out(200, { seed, model: SEARCH_MODEL, count: checks.length, names: checks });
  } catch (e) {
    return out(200, { error: 'Unexpected error: ' + (e && e.message ? e.message : String(e)) });
  }
};
