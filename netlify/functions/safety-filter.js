// safety-filter.js — THE SAFETY FILTER (refined 2026-06-26). Separate from the creative judge.
// It catches OBVIOUS, OBJECTIVE problems only. It is NOT legal counsel, NOT trademark clearance,
// NOT the USPTO. Credential words (certified / licensed / accredited / professional) are REVIEW
// flags, not rejections — they are normal in credentialed trades. When uncertain, prefer REVIEW
// over rejection. Customers are responsible for final legal / trademark / licensing review.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  let names = [], seed = '';
  try { const b = JSON.parse(event.body || '{}'); seed = (b.seed || '').slice(0, 300);
    if (Array.isArray(b.names)) names = b.names.map(n => (typeof n === 'string' ? n : (n && n.name) || '')).filter(Boolean).slice(0, 60);
  } catch (e) {}
  if (!names.length) return resp(400, { ok: false, error: 'no_names' });

  // ===== HARD REJECT — obvious, objective landmines only =====
  const FAMOUS = ['nike','adidas','reebok','puma','apple','google','alphabet','microsoft','amazon','meta',
    'facebook','instagram','tiktok','twitter','netflix','spotify','youtube','tesla','spacex','uber','lyft',
    'airbnb','paypal','venmo','visa','mastercard','amex','coca cola','cocacola','pepsi','starbucks','mcdonald',
    'mcdonalds','wendys','chipotle','subway','dunkin','fidelity','vanguard','schwab','geico','allstate',
    'progressive','statefarm','aetna','cigna','disney','pixar','marvel','warner','nintendo','playstation',
    'xbox','pokemon','batman','spiderman','starwars','star wars','harry potter','lego','barbie','samsung',
    'sony','intel','nvidia','oracle','adobe','salesforce','shopify','walmart','costco','fedex','marriott','hilton'];
  const OFFENSIVE = ['xxx','porn','nsfw'];
  // Clear impersonation of government / official authority:
  const IMPERSONATION = ['fdic','ncua','federal reserve','the fed','treasury department','irs','fbi','cia',
    'homeland security','interpol','supreme court','united states government','us government','federal bureau','.gov'];
  // Clearly impossible / plainly misleading claims:
  const IMPOSSIBLE = ['guaranteed returns','risk free','riskfree','fda approved','heal all','miracle cure','100% safe'];

  // ===== REVIEW (flag, DO NOT reject) — normal in credentialed / regulated trades =====
  const CREDENTIAL = ['certified','licensed','accredited','professional','registered','bonded','insured','chartered'];
  const REGULATED  = ['bank','banking','bancorp','trust','trustco','reserve','mutual','escrow','securities',
    'underwriters','assurance','insurance','capital','financial','federal','national','official','authorized',
    'guaranteed','savings'];

  const norm = s => ' ' + String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const flat = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const word = (h, w) => h.includes(' ' + w + ' ');
  const phrase = (h, w) => h.includes(' ' + w + ' ') || h.includes(w);

  const out = names.map(name => {
    const h = norm(name), fl = flat(name), flags = [];
    let reject = null;
    for (const m of FAMOUS) { if (word(h, m) || fl.includes(m.replace(/\s+/g, ''))) { reject = 'famous-mark:' + m; break; } }
    if (!reject) for (const m of OFFENSIVE) { if (word(h, m)) { reject = 'offensive:' + m; break; } }
    if (!reject) for (const m of IMPERSONATION) { if (phrase(h, m)) { reject = 'impersonation:' + m; break; } }
    if (!reject) for (const m of IMPOSSIBLE) { if (phrase(h, m)) { reject = 'impossible-claim:' + m; break; } }
    for (const w of CREDENTIAL) { if (word(h, w)) { flags.push('credential:' + w); break; } }
    for (const w of REGULATED) { if (word(h, w)) { flags.push('regulated:' + w); break; } }
    const safe = !reject;
    const review = safe && flags.length > 0;
    return { name, safe, review, flags: reject ? [reject].concat(flags) : flags,
      reason: reject ? ('rejected — ' + reject) : (review ? ('review — ' + flags[0]) : 'clear') };
  });
  return resp(200, { ok: true, results: out });
};
function resp(c, o) { return { statusCode: c, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
