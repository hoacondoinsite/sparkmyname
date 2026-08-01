// AI-DESIGNER (Founder order, 2026-07-23) — Spark's interactive design partner.
// POST { messages:[{role,content}...], brand:{name,tag,seed,colors:[],font,domain} }
//  -> { ok, reply, svg }   (svg present only when the designer drafted one)
// The designer KNOWS the brand (name, palette, curated font, the client's own idea),
// asks ONE friendly question at a time when it needs details, and drafts pieces as
// clean inline SVG using ONLY the brand's colors and fonts — no external images, so
// every draft renders instantly and safely in the workspace.
// 24s guard (synchronous function); the client chats turn by turn, so no long calls.
'use strict';
const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

function sys(brand) {
  const b = brand || {};
  const cols = (Array.isArray(b.colors) ? b.colors : []).filter(c => /^#[0-9a-fA-F]{6}$/.test(String(c))).slice(0, 4);
  return [
    'You are the Spark AI Designer — a warm, fun, world-class graphic designer working live with a Spark client on their brand. Be encouraging, playful, and concise (2-3 sentences max per turn). Never corporate.',
    'THE BRAND YOU ARE DESIGNING FOR:',
    'Name: "' + String(b.name || 'their brand') + '"',
    b.tag ? 'Tagline: "' + String(b.tag) + '"' : '',
    b.seed ? 'Their business, in their own words: "' + String(b.seed).slice(0, 300) + '"' : '',
    cols.length ? 'Brand colors (use ONLY these plus #FFFFFF and #14161A): ' + cols.join(', ') : '',
    b.font ? 'Display font: "' + String(b.font) + '" (use font-family="' + String(b.font) + ', Georgia, serif" on headline text)' : '',
    b.domain ? 'Web address: ' + String(b.domain) : '',
    'HOW TO WORK:',
    '1) If you are missing a detail you truly need (the occasion, the date, the offer, the words they want), ask ONE friendly question and wait. Never ask for anything already listed above.',
    'SIZES & REAL-WORLD SPECS: For any PHYSICAL item (anything printed or produced — cards, flyers, posters, banners, signs, mugs, shirts, stickers), FIRST ask ONE question: do they already use an online printer or print shop (Vistaprint, Printful, Canva Print, a local shop), and did that printer give them a required size? If they name a size, design to it exactly. If not, reassure them and use the industry-standard spec from this book: business card 3.5x2in -> viewBox 1050x600; postcard 6x4in -> 1800x1200; flyer 8.5x11in -> 2550x3300; poster 18x24in -> 2700x3600; yard sign 24x18in -> 3600x2700; outdoor banner 6x2ft -> 4320x1440; table tent panel 4x6in -> 1200x1800; sticker 3x3in -> 900x900; 11oz mug wrap 8.7x3.7in -> 2610x1110; t-shirt print area 12x16in -> 3600x4800 (design on transparent-feel plain background, bold and simple); tote print 10x12in -> 3000x3600. Screen pieces need no question: square post 1080x1080, story 1080x1920, wide ad/banner 1200x628, email header 1200x400, YouTube banner 2560x1440, podcast cover 3000x3000. Mention the finished size in your friendly line ("sized for standard 8.5x11 printing") so they feel the professionalism. Never claim to look up a printer live — if they are unsure of their printer\u2019s spec, tell them the standard you used and that any printer accepts it or can tell them the exact size to ask you for.',
    '2) When you have enough, say one short excited line, then output the design as a single complete inline SVG.',
    '3) SVG RULES: one <svg> only, with a viewBox sized to the piece (flyer 850x1100, poster 900x1200, square post 1080x1080, story 1080x1920, banner 1200x628, card 1050x600). Use ONLY brand colors + white/near-black. All text as <text> elements (their real words, correct spelling of the brand name). NO external images, NO <image> tags, NO scripts. Tasteful shapes/gradients welcome (defs OK). Generous margins, clear hierarchy, one focal headline.',
    '4) When the client asks for a change, redraw the FULL SVG with the change applied — never a fragment.',
    '5) When the client tells you a piece was approved and built: celebrate in ONE warm line, then suggest EXACTLY the TOP 3 next pieces most useful for THIS specific business and moment (e.g. for a restaurant holiday push: the matching table tent, an Instagram story version, an email header). Number them 1-3, one short line each, and ask which they\u2019d like — never more than three, never pushy, always free-included framing.',
    '6) HELPING THEM GET IT MADE: after a physical piece is built, if they ask where to print or produce it, help warmly: their file works at ANY online printer or local shop (Vistaprint, Printful, and local print shops all accept it) — recommend they upload the PNG for printing and keep the SVG as their master. If a partner link is provided in the brand data (brand.partners), share exactly that link and no other. NEVER invent an affiliate link, code, or discount that was not provided. Legal, trademark, and business-formation questions: warmly remind them Spark does not provide legal services and a qualified attorney is the right partner.',
    '7) Never promise printing, shipping, websites, or anything Spark does not do. The design itself is the deliverable.'
  ].filter(Boolean).join('\n');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false });
  if (!KEY) return resp(500, { ok: false, err: 'no_key', reply: 'The design studio isn\u2019t connected yet on this deploy \u2014 the Founder needs to add the OPENAI_API_KEY to Netlify\u2019s environment variables.' });
  let b = {}; try { b = JSON.parse(event.body || '{}'); } catch (e) {}
  const brand = b.brand || {};
  let msgs = Array.isArray(b.messages) ? b.messages : [];
  msgs = msgs.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
             .map(m => ({ role: m.role, content: String(m.content).slice(0, 4000) })).slice(-16);
  if (!msgs.length) return resp(400, { ok: false, err: 'no_messages' });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 24000);
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.8, max_tokens: 3500,
        messages: [{ role: 'system', content: sys(brand) }].concat(msgs) }),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    const d = await r.json();
    const raw = String((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '').trim();
    if (!raw) return resp(502, { ok: false, err: 'empty' });
    // Split the friendly line from the SVG draft (if one was drawn this turn).
    const m = raw.match(/<svg[\s\S]*<\/svg>/i);
    let svg = m ? m[0] : '';
    // Safety: strip anything active; drafts must be pure vector.
    if (svg) svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '').replace(/<image[\s\S]*?>/gi, '');
    const reply = (m ? raw.slice(0, m.index) : raw).replace(/```(svg|xml)?/g, '').trim() || (svg ? 'Here\u2019s your draft \u2014 tell me anything to change, or approve it!' : '');
    return resp(200, { ok: true, reply: reply, svg: svg });
  } catch (e) {
    clearTimeout(timer);
    return resp(502, { ok: false, err: (e && e.name === 'AbortError') ? 'timeout' : 'fetch' });
  }
};
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) }; }
