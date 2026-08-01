// File: netlify/functions/identity-concept.js | Date: 2026-07-27
// THE CONCEPT DESK — decide what the mark MEANS before anything is drawn.
//
// WHY THIS EXISTS
// ---------------
// The first identity prompt asked an image model for "Landor-grade restraint, geometric
// precision, one strong idea" and got back a two-colour chevron. Correctly so: those are
// quality adjectives, not a brief. Ask for generic excellence and you get excellent generic.
// A real studio does not begin at the drawing board — it begins with a written idea, and the
// drawing is downstream of it. This module is that step.
//
// A language model is good at exactly this: reading a business and finding the non-obvious
// thing that is true about it. It costs a fraction of a cent and it is the difference between
// "an arrow, because plowing is forward motion" and something nobody else in the trade owns.
//
// The output is deliberately concrete — a symbol described in shapes, not in praise — because
// the image model draws what it is told, and vague instructions are what produced the chevron.
//
// Env: OPENAI_API_KEY
'use strict';

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = 'gpt-4o-mini';

const SYS = [
  'You are the creative director of a top-tier brand identity house — the standard of Landor,',
  'Pentagram, Chermayeff & Geismar. You are briefing an illustrator who will draw the mark and',
  'has not read anything about the client. Your brief must be so specific that two different',
  'illustrators would draw nearly the same thing.',
  '',
  'Method: find what is TRUE about this business that its competitors cannot claim, then find a',
  'form that carries it.',
  '',
  'THE STANDARD (SPARK LOGO LAW). Study the principles behind the greatest marks ever made —',
  'Nike, Apple, FedEx, Mercedes-Benz, Chanel, Rolex, IBM, National Geographic. Never imitate them,',
  'never reference them, never let the result resemble any existing mark in the world. What they',
  'share is not a style, it is eight rules:',
  '  1. ONE IDEA. If the concept needs a sentence with "and" in it, it is not finished.',
  '  2. FEWEST SHAPES. Reduce until removing one more thing breaks it. The Mercedes star is three',
  '     lines in a circle.',
  '  3. THE SECOND MEANING. Where it is honest, hide a second reading in the form — negative space',
  '     that becomes a subject, a letterform that is also an object. FedEx\'s arrow was FOUND, not',
  '     added. Never force it; a forced double meaning is worse than none.',
  '  4. IT MUST SURVIVE. One inch wide. One colour. Embroidered. Etched in glass. Sixteen pixels.',
  '     On the side of a building.',
  '  4b. THE MONOLITHIC TEST. It must look like it could be cast in metal, stamped into leather,',
  '     or embroidered on a cap without losing a single detail. If any part of it would fill in,',
  '     blur, or disappear in a physical process, it is not finished.',
  '  5. INDEPENDENCE. The symbol must work with the wordmark removed, and the wordmark with the',
  '     symbol removed. Nike\'s swoosh needs no name.',
  '  6. NO CONTAINER. No ring, shield, badge, crest, circle or frame holding it together. A',
  '     container is where a weak mark hides. None of the eight has one.',
  '  7. ONE TYPE SYSTEM. Every letterform shares one stroke weight, one proportion, one spacing',
  '     logic.',
  '  8. ORIGINALITY. Original to this client. Never a stock symbol, never protected insignia,',
  '     never the tool of the trade drawn plainly.',
  '',
  'THE RAND REDUCTION PRINCIPLE. Build the mark from single clean geometric primitives — circle,',
  'square, triangle, arc, line, and the negative space between them — combined with intent. Do',
  'NOT describe an illustrative hybrid, a detailed scene, a mascot, or an object drawn',
  'realistically. Rand\'s UPS package, ABC letterforms and Westinghouse W are each a handful of',
  'primitives arranged so precisely that they became permanent. Describe your symbol the same',
  'way: in primitives and their relationships, so that a drafter with a compass and a straight',
  'edge could construct it.',
  '',
  'REJECT your own first instinct. If your idea is an arrow, a chevron, a swoosh, a globe, a',
  'shield, a house outline, a checkmark, a generic droplet, a sunburst, or the literal tool of',
  'the trade drawn plainly, throw it away and think again. Those belong to everyone, so they',
  'belong to no one.',
  '',
  'Return JSON only, with exactly these keys:',
  '  idea      — one sentence: what the mark means and why it is true of THIS business',
  '  symbol    — the drawing instruction, in plain geometry. Describe the actual shapes, their',
  '              relationship, and what the negative space does. 2 to 4 sentences. No adjectives',
  '              about quality, only description of form.',
  '  secondary — the second meaning hiding in the form, in one sentence',
  '  type      — the typographic direction for the wordmark. Choose ONE classical route and name',
  '              it: a high-contrast refined serif, or a balanced geometric sans built on the',
  '              circle and the square. State weight, proportion, and the ONE detail that',
  '              distinguishes it. No display faces, no scripts, no distortion, no stretching.',
  '  avoid     — three specific clichés this particular trade is full of, which the mark must not',
  '              resemble',
  '  survives  — one sentence proving it passes law 4 and law 5: what it looks like at sixteen',
  '              pixels, and what the symbol alone communicates without the name beside it'
].join(' ');

async function concept(name, business, palette) {
  if (!OPENAI_KEY) return null;
  const user = [
    'Business name: ' + String(name || '').slice(0, 80),
    'What the business does, in the owner\'s words: ' + String(business || '').slice(0, 400),
    palette && palette.length ? 'Brand colours already chosen: ' + palette.join(', ') : ''
  ].filter(Boolean).join('\n');

  const ctrl = new AbortController();
  // 6s, not 9. This call sits in front of a 26-second render inside a synchronous function
  // with a sub-minute ceiling; a slow idea is not worth a dead invocation. On the background
  // path there is room to spare, and 6s is ample for a short JSON reply either way.
  const t = setTimeout(function () { ctrl.abort(); }, 6000);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + OPENAI_KEY },
      body: JSON.stringify({
        model: MODEL,
        temperature: 1.0,                       // this is the idea step; timidity here is the enemy
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYS }, { role: 'user', content: user }]
      })
    });
    clearTimeout(t);
    if (!r.ok) return null;
    const data = await r.json();
    let c = (((data.choices || [])[0] || {}).message || {}).content || '';
    c = c.replace(/```json|```/g, '').trim();
    const j = JSON.parse(c);
    if (!j || !j.symbol) return null;
    return {
      idea:      String(j.idea || '').slice(0, 400),
      symbol:    String(j.symbol || '').slice(0, 900),
      secondary: String(j.secondary || '').slice(0, 300),
      type:      String(j.type || '').slice(0, 300),
      survives:  String(j.survives || '').slice(0, 300),
      avoid:     Array.isArray(j.avoid) ? j.avoid.slice(0, 4).map(function (x) { return String(x).slice(0, 60); })
                                        : String(j.avoid || '').slice(0, 200).split(/[;,]/).slice(0, 4)
    };
  } catch (e) { clearTimeout(t); return null; }
}

module.exports = { concept: concept };
