// netlify/functions/seed-summary.js
// CO-SEEDSUM (Founder, 2026-07-12): DISPLAY-ONLY polish of a customer's spoken idea.
// If the idea is already short and clear, it is returned EXACTLY unchanged.
// This function never writes anywhere and never feeds the generator - the
// original words remain the only input to the naming machinery.
const FILLER = /\b(um+|uh+|erm+|like,|you know|basically|i mean|kind of|kinda|sort of|sorta|anyway|whatever|stuff like that|and everything|and all that)\b/i;

exports.handler = async (event) => {
  const H = { 'Content-Type': 'application/json', 'Cache-Control': 'private, max-age=86400' };
  const echo = (t, ch) => ({ statusCode: 200, headers: H, body: JSON.stringify({ ok: true, display: t, unchanged: !ch }) });
  let raw = '';
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers: H, body: '{"ok":false}' };
    raw = String((JSON.parse(event.body || '{}').seed) || '').replace(/\s+/g, ' ').trim();
    if (!raw) return echo('', false);
    const words = raw.split(' ').length;
    // Already clean: short, no filler - leave the founder's rule intact: say it right, we leave it alone.
    if (words <= 9 && !FILLER.test(raw)) return echo(raw, false);
    const KEY = process.env.OPENAI_API_KEY;
    if (!KEY) return echo(raw, false);
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.2, max_tokens: 40,
        messages: [
          { role: 'system', content: "You tidy spoken business ideas for display on a page. If the idea is already short and clear, return it EXACTLY as given, word for word. Otherwise rewrite it as ONE clean fragment of at most 10 words that faithfully describes the business (e.g. 'Residential and commercial plumbing repair'). Keep the customer's own meaning. Never invent services they did not mention. Return ONLY the text - no quotes, no punctuation at the end, no commentary." },
          { role: 'user', content: raw.slice(0, 600) }
        ]
      })
    });
    const d = await r.json().catch(() => ({}));
    let out = (d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content || '')
      .replace(/^["'“]+|["'”]+$/g, '').replace(/\s+/g, ' ').trim();
    if (!out || out.length > 120 || out.split(' ').length > 14) out = raw;   // never trust a rambling editor
    return echo(out, out !== raw);
  } catch (e) {
    return echo(raw, false);   // any failure = show the original, never break the page
  }
};
