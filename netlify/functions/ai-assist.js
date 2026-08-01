// AI ASSIST — live LLM proxy for SparkMyName AI tools (Brand Assistant, Content Studio,
// Name Engine, Market Pulse, Voice Tuner, Tool Guide, etc.). Provider-flexible — uses whichever
// key you have set, in this order: Anthropic → OpenAI → Google Gemini. If none is set, returns
// 503 so the tools fall back to instant on-device generation (nothing ever breaks).
//
// Reads any of these env vars (uses the first one found):
//   ANTHROPIC_API_KEY
//   OPENAI_API_KEY  or  VITE_OPENAI_API_KEY
//   GEMINI_API_KEY
// Optional: AI_MODEL to override the model id.
//
// POST body: { system?:string, prompt:string, context?:object, max?:number }
// Returns:   { text, provider, model }

const ANTHROPIC = process.env.ANTHROPIC_API_KEY;
const OPENAI = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const GEMINI = process.env.GEMINI_API_KEY;
const OVERRIDE_MODEL = process.env.AI_MODEL || '';

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    // quick health check so you can confirm which provider is live
    return resp(200, { ok: true, provider: providerName(), configured: !!(ANTHROPIC || OPENAI || GEMINI) });
  }
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  if (!ANTHROPIC && !OPENAI && !GEMINI) return resp(503, { error: 'no_llm_configured' });

  let system = '', prompt = '', context = null, max = 600;
  try {
    const b = JSON.parse(event.body || '{}');
    prompt = String(b.prompt || '').slice(0, 8000);
    system = String(b.system || 'You are a helpful, concise brand & business assistant. Be practical, warm, and specific.').slice(0, 4000);
    context = b.context || null;
    max = Math.max(64, Math.min(2000, parseInt(b.max, 10) || 600));
  } catch (e) {}
  if (!prompt) return resp(400, { error: 'no_prompt' });
  if (context && typeof context === 'object') {
    try { system += '\n\nBrand context (JSON):\n' + JSON.stringify(context).slice(0, 2500); } catch (e) {}
  }

  const errs = [];
  try {
    if (ANTHROPIC) {
      const model = OVERRIDE_MODEL || 'claude-3-5-haiku-latest';
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: max, system, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      /* FALL THROUGH, DO NOT GIVE UP (2026-07-27 bugfix): this returned 502 on the first
         provider's error, so OpenAI and Gemini were never tried and every AI tool reported
         'failed to fetch'. A dead key or a retired model on tier one now steps to tier two. */
      if (d.error) { errs.push('anthropic: ' + (d.error.message || 'error')); }
      else
      return resp(200, { text: ((d.content && d.content[0] && d.content[0].text) || '').trim(), provider: 'anthropic', model });
    }
    if (OPENAI) {
      const model = OVERRIDE_MODEL || 'gpt-4o-mini';
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + OPENAI, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: max, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] })
      });
      const d = await r.json();
      if (d.error) { errs.push('openai: ' + ((d.error && d.error.message) || 'error')); }
      else
      return resp(200, { text: ((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '').trim(), provider: 'openai', model });
    }
    // Google Gemini
    /* gemini-1.5-flash was retired; a request to it fails instantly and took the whole chain
       down with it. Current flash model. */
    const model = OVERRIDE_MODEL || 'gemini-2.5-flash';
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(GEMINI), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: max }
      })
    });
    const d = await r.json();
    if (d.error) return resp(502, { error: (d.error && d.error.message) || 'gemini_error' });
    let text = '';
    try { text = d.candidates[0].content.parts.map(p => p.text || '').join(''); } catch (e) {}
    return resp(200, { text: (text || '').trim(), provider: 'gemini', model });
  } catch (e) {
    return resp(502, { error: 'llm_failed' });
  }
};

function providerName() { return ANTHROPIC ? 'anthropic' : OPENAI ? 'openai' : GEMINI ? 'gemini' : 'none'; }
function resp(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) };
}
