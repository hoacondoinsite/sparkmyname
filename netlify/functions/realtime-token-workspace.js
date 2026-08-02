// realtime-token-workspace.js — the art-department assistant, for signed-in CUSTOMERS.
// The sandbox agent (realtime-token-adagent) is founder-gated on purpose. Customers need the
// same intake intelligence inside their own workspace, so this mints an ephemeral OpenAI
// Realtime token for a customer, without ever exposing the founder token or the API key.
//
// Dependency-free CommonJS. The ephemeral token is short-lived and scoped to one session.
const OA = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

function json(s, o) { return { statusCode: s, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') return json(405, { error: 'POST or GET' });
  if (!OA) return json(500, { ok: false, error: 'openai_key_missing', message: 'OPENAI_API_KEY is not set in Netlify.' });

  let b = {};
  try { b = JSON.parse(event.body || '{}'); } catch (e) {}

  const brand = String(b.brandName || '').slice(0, 80);
  const tagline = String(b.tagline || '').slice(0, 160);
  const idea = String(b.idea || '').slice(0, 400);

  // The intake person the founder described: knows the brand already, asks only what it
  // cannot know, proposes real pieces, never demands jargon from a business owner.
  const persona =
    "You are the art-department intake lead for SparkMyName — the person a small business owner talks to when they want something made.\n" +
    (brand ? ("THE BRAND IS ALREADY YOURS TO USE: " + brand + (tagline ? (" — tagline: \"" + tagline + "\"") : "") + (idea ? (". In their own words: " + idea) : "") + ". NEVER ask them for their business name, tagline, colours, fonts or logo — you already have all of it.\n") : "") +
    "HOW YOU TALK: warm, quick, plain English. Short turns. You are speaking to a business owner, NOT a designer.\n" +
    "NEVER use design jargon. Never ask about typefaces, sans vs serif, bleed, DPI, aspect ratio or file formats — those are YOUR job.\n" +
    "YOUR JOB: find out WHAT they want made and the few facts only they can know (what the menu lists, what the offer is, the date, what a pass gets someone). If they don't know what they need, SUGGEST two or three specific pieces that suit their business and let them pick.\n" +
    "PROPOSE, DON'T INTERROGATE: pick a sensible size yourself and tell them what you chose so they can correct it. Ask at most one question per turn.\n" +
    "NEVER INVENT FACTS. Do not make up a price, a date, a phone number or an address. If you don't have it, ask once or leave it out.\n" +
    "TONE OF THE WORK: bright, positive, commercial — this is advertising made to bring customers in. Never dark or moody unless they ask.\n" +
    "CLOSE HONESTLY: when you have enough, summarise what you'll make in one sentence and tell them it will be in their workspace. Never promise anything faster than that, and never claim it is already done.";

  try {
    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + OA, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2',
          instructions: persona,
          audio: {
            input: { turn_detection: { type: 'server_vad', threshold: 0.82, prefix_padding_ms: 300, silence_duration_ms: 1400, create_response: true, interrupt_response: false },
                     transcription: { model: 'gpt-4o-transcribe' } },
            output: { voice: process.env.OPENAI_REALTIME_VOICE || 'cedar' }
          }
        }
      })
    });
    const d = await r.json();
    if (!r.ok) return json(502, { ok: false, error: 'openai_error', message: (d && d.error && d.error.message) || ('HTTP ' + r.status) });
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
             /* The engine reads data.ok, data.token and data.model — match that contract exactly,
                or every connection fails with a useless error. */
             body: JSON.stringify({ ok: true,
               token: d.value || (d.client_secret && d.client_secret.value) || '',
               model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2',
               expires_at: d.expires_at }) };
  } catch (e) {
    return json(500, { ok: false, error: String(e.message || e) });
  }
};
