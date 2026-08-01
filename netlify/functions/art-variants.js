// File: netlify/functions/art-variants.js | Date: 2026-07-26
// THE SIX CINEMATIC FRAMES.
//
// These are the six variation lines that render one photo per name on every brand card,
// restored to cinematic language by Founder order on 2026-07-23 after the July-17 "Agency
// Pivot" produced faded, editorial-looking work. They are reproduced here VERBATIM from
// art-department-background.js line 117 so the Smart Command Bar asks for exactly the same
// look the brand cards already deliver.
//
// DELIBERATE DUPLICATION, not an oversight. art-department-background.js sits on the paid
// delivery path and is working; editing it to import from here would put that path at risk
// for a refactor that buys nothing. If the six lines are ever changed, change them in BOTH
// files — this comment is the reminder.
'use strict';

const VARIANTS = [
  'a sweeping wide establishing frame with dramatic cinematic lighting and rich depth',
  'a rich hero close-up, ultra-detailed, shallow depth of field, glowing highlights',
  'a dynamic three-quarter angle full of energy, atmosphere and dimension',
  'a warm golden-hour frame, radiant light, aspirational and inviting',
  'a bold vibrant frame with saturated color and a strong single focal point',
  'a premium showcase frame, flagship advertising-campaign quality, expensive-looking'
];

// Short labels for the picker. The label is what the customer reads; the line above is what
// the engine is actually asked for. They must stay in the same order.
const LABELS = [
  'Sweeping wide establishing shot',
  'Rich hero close-up',
  'Dynamic three-quarter angle',
  'Warm golden hour',
  'Bold vibrant colour',
  'Premium showcase'
];

// Accepts either the label or a 1-6 index. Anything unrecognised returns null, and the
// prompt simply falls back to the house cinematic standard with no variation line.
function lineFor(choice) {
  if (choice == null) return null;
  const s = String(choice).trim();
  if (!s) return null;
  const n = parseInt(s, 10);
  if (n >= 1 && n <= VARIANTS.length) return VARIANTS[n - 1];
  const i = LABELS.findIndex(function (l) { return l.toLowerCase() === s.toLowerCase(); });
  return i >= 0 ? VARIANTS[i] : null;
}

module.exports = { VARIANTS: VARIANTS, LABELS: LABELS, lineFor: lineFor };
