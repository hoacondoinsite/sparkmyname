/* realtime-token-adagent.js — mints a SHORT-LIVED Realtime credential for ad-agent-test.
 *
 * SAME BRAIN as the homepage (gpt-realtime-2, cedar, gpt-4o-transcribe, semantic_vad,
 * retention_ratio + token ceiling). Differences: PERSONA (SparkMyName intake agent) and the
 * set_spec tool. NEW in v2: BRAND-AWARE INJECTION — the selected brand's real profile is
 * fetched server-side and injected into the agent's context BEFORE the conversation, so the
 * agent never asks for the name, tagline, website, handle, colors, or tone it already has.
 * Campaign-only intake: the agent gathers ONLY this request (headline, price, dates, promo,
 * piece, size) and keeps `details` free of brand meta so nothing leaks into the artwork.
 */
'use strict';

const MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2';
const VOICE = process.env.OPENAI_REALTIME_VOICE || 'cedar';
const TOKEN_CEILING = parseInt(process.env.REALTIME_TOKEN_CEILING || '8000', 10);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TYPES = ['poster','banner','sign','yardsign','flyer','menu','postcard','postcardback',
  'social','story','webbanner','tshirt','tshirtback','hoodieback','hoodiefront','polochest',
  'dressshirt','toteback','hatfront','bumpersticker','shelftalker','countermat'];

async function fetchBrand(brandId) {
  if (!brandId || !SUPABASE_URL || !SERVICE) return null;
  try {
    var url = SUPABASE_URL.replace(/\/$/, '') +
      '/rest/v1/sandbox_brands?brand_id=eq.' + encodeURIComponent(brandId) +
      '&select=brand_name,industry,contact_info,color_palette,tone_manifesto,banned_visual_elements,logos&limit=1';
    var r = await fetch(url, { headers: { apikey: SERVICE, Authorization: 'Bearer ' + SERVICE } });
    if (!r.ok) return null;
    var rows = await r.json();
    return (Array.isArray(rows) && rows[0]) || null;
  } catch (e) { return null; }
}

function brandBlock(b) {
  if (!b) return '';
  var ci = b.contact_info || {};
  var pal = b.color_palette || {};
  var hasLogo = b.logos && Object.keys(b.logos).length > 0;
  var lines = ['THE CLIENT (you ALREADY know all of this — never ask for any of it):'];
  lines.push('- Name: ' + (b.brand_name || ''));
  if (b.industry) lines.push('- Industry: ' + b.industry);
  if (ci.tagline) lines.push('- Tagline: "' + ci.tagline + '"');
  if (ci.website) lines.push('- Website: ' + ci.website);
  if (ci.handle) lines.push('- Social handle: ' + ci.handle);
  var cols = [pal.primary, pal.secondary, pal.accent].filter(Boolean);
  if (cols.length) lines.push('- Brand colors: ' + cols.join(', '));
  if (b.tone_manifesto) lines.push('- Tone: ' + b.tone_manifesto);
  lines.push('- Logo on file: ' + (hasLogo ? 'yes' : 'no — the wordmark is drawn by our system, so do not ask for a logo'));
  return lines.join('\n');
}

function instructions(brandInfo, resumeBrief) {
  var base =
"You are an elite New York advertising account director with a Harvard branding-strategist's eye, working for SparkMyName. Exquisite taste, sharp commercial instinct, and real warmth for founders. You are NOT a robotic form.\n" +
"GREETING (first turn only, short): 'Hi! What are we building today?'\n" +
"MANNER: brief, punchy, and striking. Crisp, natural turns \u2014 two or three sentences, then stop and listen. Know when to talk and when to listen; never ramble or lecture.\n" +
"CREATIVE HOOK: when they share an idea, match their energy and drop ONE sophisticated, specific creative concept they wouldn't have reached for on their own \u2014 a typography pairing, an editorial lighting mood, a color direction, or a thematic hook \u2014 then move to the next essential question. Put that art direction into scenePrompt. Be a creative partner, not a questionnaire.\n" +
"BRAND-AWARE: the client's profile is given below. You ALREADY KNOW the business name, tagline, website, handle, colors, and tone. NEVER ask the user for any of those \u2014 use them. If they are unsure of a detail you already have, tell them what you have.\n" +
"YOUR JOB \u2014 CAMPAIGN ONLY: gather ONLY what is specific to THIS request: what they're promoting (headline), the offer/price, the dates, any promo specifics, the piece (poster, social, flyer, menu, etc.) and how they'll use it (print or online).\n" +
"USE BRANCH: if PRINT, we design it print-ready (bleed + crop marks) for any shop \u2014 Staples, FedEx Office, Vistaprint, Office Depot, or local. If ONLINE, we deliver it ready to use, nothing to print.\n" +
"AS YOU LEARN, call set_spec every time. IMPORTANT: put ONLY campaign display copy in 'details' (the actual offer items, e.g. 'all-day pass, valid 3 days'). NEVER put the logo, tagline, website, or handle in 'details' \u2014 those are brand elements our system adds automatically; listing them would print them as instructions on the artwork. Use 'missing' for anything you are still unsure about.\n" +
"VIDEO: if they ask for video/reel, say that line is coming shortly and steer to what we can make today; set videoRequested true, do NOT set a video type.\n" +
"TRUTH: no revision rounds for now (first proof is the one). Never guarantee a domain/handle. Print-ready file for print, ready-to-use asset for online, plus a proof.\n" +
"WHEN YOU HAVE ENOUGH, read a short summary back \u2014 the piece, size, offer, and what will be in the image \u2014 and ask 'is that right, or want to change anything?'\n" +
"PRINT HANDOFF (print pieces only \u2014 offer ONCE, gently, never push): after they confirm, let them know they'll get print-ready files built to real print specs (bleed, safe margins, 300 DPI) they can take to ANY printer. Then offer lightly, as a convenience: if they'd like, you can point them to a great place for THIS kind of piece \u2014 business cards/flyers/postcards \u2192 Vistaprint or MOO; stickers/labels/magnets/packaging \u2192 Sticker Mule; t-shirts/hoodies/apparel \u2192 Printify or Printful; posters/banners/yard signs/signage \u2192 Vistaprint or BuildASign; promo items \u2192 4imprint \u2014 OR they can simply take the files wherever they like. Make clear it's their choice with zero pressure; 'just the files' is a perfectly good answer. Say it ONCE; never repeat or nudge. If ONLINE, skip this entirely.\n" +
"ONCE THEY AGREE, close honestly for this workbench: one warm line like 'Perfect \u2014 your order is on screen. When it looks right, press Send and I'll build it.' \u2014 then call finish_intake. Do NOT promise a confirmation email or same-day delivery here.";
  if (brandInfo) base += "\n\n" + brandInfo;
  if (resumeBrief && String(resumeBrief).trim()) {
    base += "\n\nYOU HAVE ALREADY BEEN TALKING WITH THIS PERSON. Known so far:\n" +
            String(resumeBrief).slice(0, 1400) +
            "\nDo NOT greet again and do NOT re-ask anything above. Continue naturally.";
  }
  return base;
}

const TOOLS = [
  { type: 'function', name: 'set_spec',
    description: 'Record/refine the CAMPAIGN for this request. Call every time you learn something. Brand identity is already known \u2014 do not repeat it here.',
    parameters: { type: 'object', properties: {
      deliverableType: { type: 'string', enum: TYPES, description: 'The kind of piece. Empty if unclear or a video.' },
      widthIn: { type: 'number' }, heightIn: { type: 'number' },
      headline: { type: 'string', description: 'What is being promoted.' },
      price: { type: 'string', description: 'SHORT price/offer amount only — the actual amount, or one word like Free or Complimentary. Never a full sentence.' }, dates: { type: 'string' },
      details: { type: 'string', description: 'Up to 3 SHORT offer phrases, comma-joined, <=6 words each. No brand story (not "celebrating 30 years" or "trusted by the community"), and NEVER logo/tagline/website/handle.' },
      scenePrompt: { type: 'string', description: 'One-line art direction (photographic, no words in the art).' },
      useMode: { type: 'string', enum: ['print','online','unsure'] },
      videoRequested: { type: 'boolean' },
      missing: { type: 'string' }
    }, required: [] } },
  { type: 'function', name: 'finish_intake',
    description: 'Call ONLY after they confirm and you have given the warm close.',
    parameters: { type: 'object', properties: { summary: { type: 'string' } }, required: [] } }
];

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method not allowed' };

  var body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) {}
  if (!body.founderToken || body.founderToken !== process.env.SMN_FOUNDER_TOKEN) {
    return json(403, { ok: false, error: 'founder_gated', message: 'This page is founder-gated.' });
  }

  var key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!key) return json(503, { ok: false, error: 'voice_unavailable', message: 'Voice is not configured right now.' });

  var brand = await fetchBrand(body.brandId);
  var brandInfo = brandBlock(brand);
  var resumeBrief = typeof body.brief === 'string' ? body.brief : '';

  try {
    var r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json',
                 'OpenAI-Safety-Identifier': 'smn-adagent-intake' },
      body: JSON.stringify({
        session: {
          type: 'realtime', model: MODEL,
          audio: { input: { turn_detection: { type: 'semantic_vad' }, transcription: { model: 'gpt-4o-transcribe' } },
                   output: { voice: VOICE } },
          reasoning: { effort: 'low' },
          truncation: { type: 'retention_ratio', retention_ratio: 0.8, token_limits: { post_instructions: TOKEN_CEILING } },
          instructions: instructions(brandInfo, resumeBrief),
          tools: TOOLS, tool_choice: 'auto'
        }
      })
    });
    var txt = await r.text();
    if (!r.ok) { console.error('ADAGENT TOKEN FAIL', r.status, txt.slice(0, 300)); return json(502, { ok: false, error: 'upstream', message: 'Voice could not start just now.' }); }
    var j = {}; try { j = JSON.parse(txt); } catch (e) {}
    var secret = j.value || (j.client_secret && j.client_secret.value) || '';
    if (!secret) return json(502, { ok: false, error: 'no_token', message: 'Voice could not start just now.' });
    return json(200, { ok: true, token: secret, model: MODEL, expires_at: j.expires_at || null, brandLoaded: !!brand });
  } catch (e) {
    console.error('ADAGENT TOKEN ERROR', String(e && e.message || e));
    return json(502, { ok: false, error: 'exception', message: 'Voice could not start just now.' });
  }
};

function json(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) };
}
