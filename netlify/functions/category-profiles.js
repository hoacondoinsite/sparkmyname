// category-profiles.js — CATEGORY-SENSITIVE CALIBRATION (installed 2026-07-03, Founder order).
// Replaces any one-size-fits-all threshold / fixed lane mix with a four-profile system.
// This is a pure data + classification module. It does NOT touch the locked engine files:
// clean-names.js, judge-names.js, build-kit.js, create-checkout.js, stripe-webhook.js remain
// byte-identical. The orchestration lives in calibrate-pass.js and the calibration-lab console.
//
// CORE POLICY (verbatim from the order):
//   1. Category-specific profile rules, not one universal rule.
//   2. Profile-specific lane minimums and lane caps.
//   3. If the category cannot produce enough appropriate names above threshold, reduce count
//      rather than padding with bad names.
//   4. Solemn / trust-heavy / compliance-heavy / reputation-sensitive categories reject playful,
//      jokey, theatrical, gimmicky, fake-surname, or tonally cute outputs.
//   5. Expressive / entertainment categories allow broader creative range.
//   OVERRIDE: Appropriateness outranks score.

// ---------------------------------------------------------------------------
// THE FOUR PROFILES
// laneTargets: [min, max] per lane. count = default output count.
// ---------------------------------------------------------------------------
const PROFILES = {
  'formal-sensitive': {
    key: 'formal-sensitive',
    label: 'Formal-Sensitive',
    count: 10,
    laneTargets: { professional: [4, 5], standard: [3, 4], human: [1, 2], clever: [0, 1] },
    preferred: ['professional', 'standard'],
    caution: ['human'],
    restricted: ['clever'],
    tone: 'Trust, seriousness, competence, legitimacy, sobriety, safety, legal defensibility, or emotional sensitivity matter most. Reject anything jokey, gimmicky, cute, theatrical, unserious, pun-heavy, comedy-coded, whimsical, fake-legacy, or fabricated white-shoe surname theater without believable fit. Reject names that sound like fictional law firms or prestige placeholders when they feel invented rather than credible. Reject names that trivialize grief, legal matters, debt, illness, compliance, or fiduciary responsibility.'
  },
  'trust-practical': {
    key: 'trust-practical',
    label: 'Trust-Practical',
    count: 12,
    laneTargets: { professional: [3, 4], standard: [3, 4], human: [2, 3], clever: [1, 2] },
    preferred: ['professional', 'standard'],
    caution: [],
    restricted: [],
    tone: 'The buyer wants trust and clarity first, but the brand can tolerate some warmth or light creativity. Favor competence, clarity, memorability, and practical usability. Clever names must still sound commercially usable, not novelty-first.'
  },
  'balanced-general': {
    key: 'balanced-general',
    label: 'Balanced-General',
    count: 12,
    laneTargets: { professional: [2, 3], standard: [3, 3], human: [3, 3], clever: [3, 4] },
    preferred: [],
    caution: [],
    restricted: [],
    tone: 'Both trust and brand personality matter; a mixed basket is useful. All lanes are valid. Do not force lanes evenly if one lane underperforms. Favor names that feel brandable, credible, and category-appropriate.'
  },
  'expressive-acceptable': {
    key: 'expressive-acceptable',
    label: 'Expressive-Acceptable',
    count: 12,
    laneTargets: { professional: [1, 2], standard: [2, 3], human: [3, 4], clever: [3, 4] },
    preferred: ['human', 'clever'],
    caution: [],
    restricted: [],
    tone: 'Personality, novelty, memorability, entertainment value, style, or emotional sparkle help conversion. Human and clever lanes can lead; professional may be reduced. Strong category fit still matters. Avoid names that become confusing, try-hard, forced, or off-tone.'
  }
};

// Strictness order — "if uncertain between two profiles, choose the stricter profile."
const STRICTNESS = ['formal-sensitive', 'trust-practical', 'balanced-general', 'expressive-acceptable'];
function stricter(a, b) {
  return STRICTNESS.indexOf(a) <= STRICTNESS.indexOf(b) ? a : b;
}

// ---------------------------------------------------------------------------
// CATEGORY → PROFILE MAPPING TABLE
// Keyword phrases matched against the seed (lowercased). Longer phrases first.
// Every generator category maps to exactly one of the four profiles.
// ---------------------------------------------------------------------------
const MAP = [
  // ===== PROFILE 1: FORMAL-SENSITIVE =====
  { p: 'formal-sensitive', k: ['funeral', 'mortuary', 'memorial service', 'memorial services', 'cremation', 'cemetery', 'burial', 'hospice', 'grief counseling', 'bereavement',
    'law firm', 'attorney', 'lawyer', 'legal practice', 'litigation', 'criminal defense', 'employment law', 'elder law', 'estate planning', 'estate attorney', 'probate',
    'closing attorney', 'real estate closing', 'title company', 'court reporting', 'court reporter', 'notary', 'paralegal', 'document prep', 'process serv',
    'tax resolution', 'tax relief', 'irs representation', 'tax attorney', 'tax prep', 'enrolled agent',
    'lending', 'lender', 'private lending', 'mortgage', 'loan', 'debt relief', 'debt settlement', 'credit repair', 'collections agency', 'debt collection',
    'insurance agency', 'insurance broker', 'life insurance', 'health insurance', 'medicare', 'medicaid', 'annuity', 'annuities',
    'financial advisor', 'financial advisory', 'wealth management', 'fiduciary', 'investment advis', 'retirement planning', 'trust services',
    'compliance', 'regulatory', 'audit firm', 'forensic account', 'healthcare staffing', 'medical staffing', 'nurse staffing', 'healthcare compliance',
    'oncology', 'cancer', 'dialysis', 'cardiology', 'surgery center', 'surgical', 'psychiatr', 'addiction recovery', 'rehab center', 'detox', 'substance abuse',
    'guardianship', 'conservatorship', 'immigration law', 'bankruptcy', 'foreclosure', 'securities', 'bail bond', 'veterans benefits', 'disability claims', 'workers comp'] },

  // ===== PROFILE 2: TRUST-PRACTICAL =====
  { p: 'trust-practical', k: ['bookkeep', 'payroll', 'accounting', 'accountant', 'cpa firm', 'tax service',
    'home inspection', 'inspector', 'property management', 'property manager', 'hoa management', 'condo management',
    'hr consulting', 'human resources', 'recruiting', 'recruiter', 'staffing agency', 'headhunt', 'talent acquisition',
    'translation', 'interpret', 'transcription', 'grant writing', 'grant writer', 'fundraising', 'nonprofit consult',
    'consultant', 'consulting', 'contractor', 'general contractor', 'plumb', 'electric', 'hvac', 'roofing', 'roofer',
    'landscap', 'lawn care', 'pest control', 'pressure wash', 'handyman', 'remodel', 'renovation', 'restoration',
    'moving company', 'movers', 'logistics', 'freight', 'trucking', 'courier', 'delivery service', 'warehouse',
    'it services', 'it support', 'managed services', 'msp', 'cybersecurity', 'network', 'cloud services',
    'cleaning service', 'janitorial', 'commercial cleaning', 'security company', 'security guard', 'alarm',
    'clinic', 'physical therapy', 'chiropract', 'urgent care', 'dental', 'dentist', 'optometr', 'veterinar', 'vet clinic',
    'home care', 'senior care', 'childcare center', 'daycare', 'tutoring', 'driving school', 'inspection service', 'appraisal', 'surveying', 'engineering firm', 'architect'] },

  // ===== PROFILE 4: EXPRESSIVE-ACCEPTABLE (checked before balanced so food/creator wins) =====
  { p: 'expressive-acceptable', k: ['podcast', 'youtube', 'creator brand', 'influencer', 'streamer', 'twitch', 'gaming channel', 'gaming brand', 'esports',
    'comedy', 'comedian', 'improv', 'entertainment brand', 'party', 'event planning', 'events company', 'wedding venue', 'venue', 'nightclub', 'nightlife', 'bar ', 'cocktail', 'brewery', 'brewpub', 'winery', 'distillery',
    'bakery', 'bake shop', 'cafe', 'coffee shop', 'coffee roaster', 'restaurant', 'food truck', 'pizzeria', 'pizza', 'taco', 'burger', 'bbq', 'barbecue', 'ice cream', 'gelato', 'dessert', 'donut', 'doughnut', 'candy', 'chocolat', 'juice bar', 'smoothie', 'bubble tea', 'boba', 'ramen', 'sushi', 'deli', 'bistro', 'catering', 'snack', 'sauce brand', 'hot sauce', 'beverage',
    'beauty brand', 'makeup', 'cosmetic', 'lash', 'nail salon', 'nails', 'hair salon', 'barber', 'tattoo', 'piercing',
    'fashion brand', 'streetwear', 'clothing brand', 'apparel', 'boutique', 'jewelry brand', 'sneaker',
    'toy', 'board game', 'arcade', 'escape room', 'amusement', 'festival', 'music label', 'record label', 'band ', 'dj ', 'karaoke', 'pet grooming', 'dog bakery', 'candle brand', 'merch'] },

  // ===== PROFILE 3: BALANCED-GENERAL =====
  { p: 'balanced-general', k: ['coach', 'coaching', 'life coach', 'agency', 'marketing', 'branding agency', 'design studio', 'creative studio',
    'creator education', 'online course', 'course creator', 'membership site', 'community platform',
    'software', 'saas', 'app ', 'application', 'tech startup', 'startup', 'platform', 'marketplace', 'ecommerce', 'e-commerce', 'online store', 'subscription box',
    'wellness', 'yoga', 'pilates', 'fitness', 'gym', 'personal train', 'nutrition', 'meditation', 'spa', 'massage',
    'interior design', 'home staging', 'photography', 'photograph', 'videograph', 'florist', 'flower',
    'real estate agent', 'realtor', 'real estate team', 'travel agency', 'tour company', 'bookstore', 'gift shop', 'plant shop', 'nursery', 'garden center', 'farm', 'ranch', 'craft', 'workshop', 'studio'] }
];

// classifyProfile(seed) → { profile, matched, confident }
// Deterministic keyword pass. Formal-sensitive checked first; on multi-profile collision the
// stricter profile wins (per the order). Returns confident:false when nothing matches so the
// caller can run the model fallback — which must ALSO default stricter when torn.
function classifyProfile(seed) {
  const s = ' ' + String(seed || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
  let hit = null, matched = '';
  for (const row of MAP) {
    for (const k of row.k) {
      if (s.includes(k.trim().length === k.length ? k : k)) {
        if (s.indexOf(k) !== -1) {
          if (!hit) { hit = row.p; matched = k; }
          else { const st = stricter(hit, row.p); if (st !== hit) { hit = st; matched = k; } }
          break;
        }
      }
    }
  }
  if (hit) return { profile: hit, matched, confident: true };
  // No keyword hit → uncertain. Caller may use model fallback; deterministic default is the
  // stricter middle ground, never expressive.
  return { profile: 'trust-practical', matched: '', confident: false };
}

// ---------------------------------------------------------------------------
// APPROPRIATENESS FILTER — the five tests + mandatory rejection conditions,
// rendered as a judge brief for the model pass in calibrate-pass.js.
// ---------------------------------------------------------------------------
const FIVE_TESTS =
`Before a candidate can PASS, it must clear ALL five tests:
1. TONE FIT: emotionally and commercially appropriate for the category.
2. CREDIBILITY FIT: a real buyer would take this seriously enough in this category.
3. CONTEXT FIT: the name aligns with the stakes of the business.
4. LANE FIT: even within its lane, it is one of the better examples of that lane for this category.
5. PRACTICAL FIT: a real owner could plausibly choose this without embarrassment, apology, or explanation.`;

const MANDATORY_REJECTS =
`MANDATORY REJECTION — reject any candidate that:
- Sounds unintentionally funny in a solemn or regulated category.
- Uses puns, irony, or comedy framing where the category requires seriousness.
- Sounds like a fictional surname law firm with no believable fit.
- Feels like a joke premise, parody, sketch, novelty, or satire.
- Uses emotionally insensitive imagery for grief, legal trouble, debt, illness, death, or hardship.
- Is category-correct in vocabulary but wrong in tone.
- Is merely available and structurally clean but still weak or embarrassing.`;

// Decision stack order (applied by calibrate-pass.js):
// 1. Legal safety / domain safety  2. Category profile classification  3. Appropriateness filter
// 4. Lane viability for the category  5. Score threshold  6. Final ranking & output balancing.
const DECISION_STACK = ['legal-domain-safety', 'profile-classification', 'appropriateness-filter', 'lane-viability', 'score-threshold', 'ranking-balancing'];

module.exports = { PROFILES, MAP, STRICTNESS, stricter, classifyProfile, FIVE_TESTS, MANDATORY_REJECTS, DECISION_STACK };
