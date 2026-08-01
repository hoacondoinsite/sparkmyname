// judge-creative.js — THE CREATIVE JUDGE, v2 (customer-biased). Founder decision 2026-06-26:
// SparkMyName delivers MANY strong directions and lets the CUSTOMER choose. The judge is NOT a
// picky critic. Its job is to KEEP everything a reasonable customer could like, and cut ONLY
// names that are clearly unusable. RULE #1: when in doubt, KEEP IT. Still completely separate
// from the safety-filter (which handles legal/offensive). No old-engine dependencies.
const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

const RUBRIC =
`You are helping a customer who is PAYING for many brand-name directions to choose from.
SparkMyName does not pick one perfect name — it delivers a generous set of good options and lets
the CUSTOMER be the final judge of taste. You are NOT a picky creative critic. Your job is to KEEP
every name a reasonable customer could genuinely like, and to cut ONLY names that are clearly
unusable.

DEFAULT MINDSET: "If a reasonable customer could genuinely like this, KEEP IT."

RULE #1 — WHEN IN DOUBT, KEEP IT. If a name is brandable, appropriate, understandable, on-topic,
and safe, pass it. Do NOT cut it because another name is better, or because it is not your
personal favorite.

KEEP (pass = true) is the DEFAULT. Keep simple names, conservative names, traditional names, plain
names, ordinary names — these are exactly what many customers want. Variety of taste is the point.

CUT (pass = false) ONLY when one of these clear, objective problems is true:
- COMPLETELY OFF-CATEGORY: the name has nothing to do with this business.
- GIBBERISH: a non-word that isn't a deliberate, pronounceable brand.
- BROKEN LANGUAGE: mangled words, wrong-language soup, obvious dictation/typo garble.
- DUPLICATE: a duplicate or near-duplicate of another name in this same list.
- OBVIOUSLY UNUSABLE or EXTREMELY AWKWARD to say or read.
- OFFENSIVE or clearly inappropriate.
- MISLEADING: implies something plainly false about the business.
- (REGULATED PROFESSIONAL FIELDS ONLY) PROFESSIONALLY INAPPROPRIATE: for a licensed / regulated
  professional field — attorney / law, CPA / accounting / tax, physician / medical / dental,
  financial advisor / wealth, engineer, architect, insurance — the name is jokey, gimmicky, punny,
  unserious, sensational, or undignified (e.g. "Briefcase Bravo" or "Plea Bargain Brothers" for a
  law firm). Such a name may be memorable but is wrong for a licensed professional — cut it or
  score it low. THIS DIGNITY RULE APPLIES ONLY TO REGULATED PROFESSIONAL FIELDS. For consumer,
  food, retail, trades, fitness, beauty, pet, and creative businesses, playful / warm / witty names
  are GOOD — keep them. Do not apply the dignity rule outside regulated professional fields.

Do NOT cut a name for being simple, conservative, traditional, ordinary, or "less creative" than
another option. Taste belongs to the customer, not to you.

SCORE is only a soft sort signal (5 = excellent, 3 = solid keep, 1 = clear problem). The KEEP/CUT
decision follows the rules above, NOT the score — a 3 is a KEEP. Only a name that hits a clear
cut-reason gets pass = false.

Return ONLY JSON: {"scores":[{"name":"...","score":N,"pass":BOOL,"reason":"<=10 words"}]}.
pass = true unless a clear cut-reason applies. One entry per candidate, in the same order.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!KEY) return resp(500, { ok: false, error: 'missing_openai_key' });
  let seed = '', names = [];
  try {
    const b = JSON.parse(event.body || '{}');
    seed = (b.seed || '').slice(0, 300);
    if (Array.isArray(b.names)) names = b.names.map(n => (typeof n === 'string' ? n : (n && n.name) || '')).filter(Boolean).slice(0, 20);
  } catch (e) {}
  if (!names.length) return resp(400, { ok: false, error: 'no_names' });

  const userMsg = 'BUSINESS: ' + seed + '\nCANDIDATES:\n' + names.map((n, i) => (i + 1) + '. ' + n).join('\n');
  let arr = [];
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.2, max_tokens: 1600,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: RUBRIC }, { role: 'user', content: userMsg }] })
    });
    clearTimeout(t);
    const d = await r.json();
    const txt = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    const parsed = JSON.parse(txt);
    arr = (parsed && parsed.scores) || [];
  } catch (e) { return resp(502, { ok: false, error: 'judge_failed' }); }

  function clamp(v) { v = parseFloat(v); if (isNaN(v)) v = 3; return Math.max(1, Math.min(5, v)); }
  const out = names.map((name, i) => {
    const sc = arr[i] || {};
    const score = clamp(sc.score);
    // KEEP-BY-DEFAULT: trust the model's pass; if it's missing/ambiguous, KEEP IT (Rule #1).
    const pass = (sc.pass === false) ? false : true;
    return { name, score: Math.round(score * 10) / 10, pass, reason: String(sc.reason || '').slice(0, 100) };
  });
  return resp(200, { ok: true, philosophy: 'customer-biased: keep unless clearly unusable', scores: out });
};
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
