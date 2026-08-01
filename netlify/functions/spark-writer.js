// SparkMyName — SPARK WRITER (NEW FILE, TestWire V3, 2026-07-16)
// The In-Workspace AI writer: the customer types a topic, we draft the social post
// server-side and hand back finished copy — no prompt copying, no leaving the page.
// Uses the same OpenAI key + call pattern as build-kit.js (the proven production path).
// If the key is absent or the call fails, a well-formed local draft ships instead —
// the module never comes back empty.
// POST { topic, brand, seed } -> { ok, post, source }
'use strict';
const KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

function out(code, obj){ return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) }; }

function localDraft(topic, brand, seed){
  var t = topic || 'what we do';
  var b = brand || 'our brand';
  return 'Here at ' + b + ', ' + t + ' is close to our hearts.\n\n'
    + 'We started with one simple idea — ' + (seed || 'doing this right') + ' — and that’s still what drives every day here.\n\n'
    + 'If ' + t + ' matters to you too, come say hello. We’d love to have you along.\n\n'
    + '— ' + b;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return out(405, { ok:false, error:'method' });
  let topic = '', brand = '', seed = '';
  try {
    const b = JSON.parse(event.body || '{}');
    topic = String(b.topic || '').slice(0, 300).trim();
    brand = String(b.brand || '').slice(0, 120).trim();
    seed  = String(b.seed  || '').slice(0, 400).trim();
  } catch (e) {}
  if (!topic) return out(400, { ok:false, error:'missing_topic' });

  if (KEY) {
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini', temperature: 0.8, max_tokens: 500,
          messages: [
            { role: 'system', content: 'You are a warm, plain-spoken social media copywriter. Write ONE social post. Short paragraphs, no hashtag walls (2 tasteful hashtags max), no hype words, sound like a real person, not a brochure. Return only the post text.' },
            { role: 'user', content: 'Brand: ' + (brand || 'a new brand') + '\nWhat the brand is: ' + (seed || 'a small business') + '\nPost topic: ' + topic }
          ]
        })
      });
      const d = await r.json();
      const post = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
      if (post && post.trim()) return out(200, { ok:true, post: post.trim(), source: 'ai' });
      console.error('spark-writer: empty AI response, using local draft');
    } catch (e) { console.error('spark-writer: AI call failed — ' + String(e && e.message || e)); }
  }
  return out(200, { ok:true, post: localDraft(topic, brand, seed), source: 'local' });
};
