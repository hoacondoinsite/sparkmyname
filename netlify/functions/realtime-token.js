/* realtime-token.js — mints a SHORT-LIVED credential so the browser can talk to the
 * Realtime API directly, without ever seeing the real OpenAI key.
 *
 * THE WHOLE POINT: a browser cannot be trusted with OPENAI_API_KEY. Anyone can open dev
 * tools and read it. So the browser asks THIS function, this function uses the real key
 * server-side to ask OpenAI for a throwaway token (prefix ek_, expires in about a minute),
 * and only that throwaway goes to the browser. Worst case if one leaks: it is already dead.
 *
 * ONE SESSION, START TO FINISH (corrected 2026-07-30).
 * An earlier build restarted the session every ~100 seconds to control cost. That was
 * wrong on both counts and it broke the conversation — the model re-greeted the customer
 * and re-asked what they had just said. OpenAI already handles long conversations: when the
 * context fills, the OLDEST messages are dropped automatically and THE SESSION CONTINUES.
 * Restarting also destroyed prompt caching, and cached audio input is $0.40/M against $32/M
 * fresh — 80x cheaper — so the "saving" was actually a large overcharge.
 * The documented way, used below: truncation with a retention_ratio plus a token ceiling.
 */

const MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2';
const VOICE = process.env.OPENAI_REALTIME_VOICE || 'cedar';
/* Input tokens per Response, excluding instructions. Lower = cheaper, but the model
   remembers less of the conversation. 8000 holds a long intake comfortably. */
const TOKEN_CEILING = parseInt(process.env.REALTIME_TOKEN_CEILING || '8000', 10);

/* The persona. Kept deliberately short — every token here is re-sent each turn, so a long
   system prompt is the single most expensive thing you can do on this API. */
function instructions(brief) {
  var base =
"You are Spark, the brand guide for SparkMyName. You are helping someone describe the business they want to start so a complete brand can be built for them.\n" +
"MANNER: warm, plain-spoken, unhurried. Short turns — two sentences at most, then stop and let them talk. Never lecture. Never list options at them. You are a good listener, not a salesperson.\n" +
"AUDIENCE: everyday people starting something real. No jargon, no startup language. Many are nervous. Treat the idea with respect.\n" +
"WHAT YOU NEED, in this order, one question at a time: (1) what the business actually does, (2) who it is for, (3) what feeling they want people to have about it, (4) anything they already love or hate in their industry.\n" +
"ON QUESTION 2, DO NOT ACCEPT 'everyone' or 'anyone'. In branding, anyone is nobody. Ask warmly for a real person: who walks in on their best day? Someone getting ready for an event, an executive with ninety minutes, a bride, a new mother? Get ONE recognisable human being before you move on.\n" +
"AS YOU LEARN, call the save_brief tool. Call it every time you learn something new, even partially. Never announce that you are saving anything.\n" +
"WHEN YOU HAVE ALL FOUR, read a short summary back in your own words and ask if it sounds right. If they want changes, take them and read it back again.\n" +
"ONCE THEY AGREE, ask ONE last time whether there is anything else they want included. If they say no, say a short warm goodbye \u2014 one line, something like 'Beautiful. Let me go build this for you.' \u2014 and THEN call finish_intake. Never call it without that goodbye.\n" +
"NEVER promise a website, hosting, or trademark protection. NEVER guarantee a domain or a social handle is available. If asked about price, it is $99 one time.\n" +
"If they go quiet, wait. If they ramble, let them — then gently pick out the useful part.";
  if (brief && String(brief).trim()) {
    /* Only ever set when a connection genuinely DROPPED and we are reconnecting — not on
       any routine schedule. In normal use the session simply continues. */
    base += "\n\nYOU HAVE ALREADY BEEN TALKING WITH THIS PERSON. Here is what you already know:\n" +
            String(brief).slice(0, 1400) +
            "\nDo NOT greet them again and do NOT re-ask anything above. Continue naturally from where you were, as if nothing happened.";
  }
  return base;
}

const TOOLS = [
  { type: 'function', name: 'save_brief',
    description: 'Record what you have learned so far. Call this every time you learn something new.',
    parameters: { type: 'object', properties: {
      business:  { type: 'string', description: 'What the business actually does, in their words.' },
      audience:  { type: 'string', description: 'Who it is for.' },
      feeling:   { type: 'string', description: 'The feeling they want people to have.' },
      notes:     { type: 'string', description: 'Anything else useful — likes, dislikes, names, place.' }
    }, required: [] } },
  { type: 'function', name: 'finish_intake',
    description: 'Call ONLY when they have confirmed your summary is right.',
    parameters: { type: 'object', properties: {
      sentence: { type: 'string', description: 'One clear sentence describing the business, written as the customer would say it.' }
    }, required: ['sentence'] } }
];

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method not allowed' };

  var key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!key) {
    return json(503, { ok: false, error: 'voice_unavailable',
      message: 'Voice is not configured on this site right now.' });
  }

  var body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) {}
  var brief = typeof body.brief === 'string' ? body.brief : '';


  try {
    var r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        // ties every leg of one visitor's chain together for abuse monitoring
        'OpenAI-Safety-Identifier': 'smn-intake'
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: MODEL,
          audio: {
            input: {
              /* semantic_vad decides when the customer has actually FINISHED a thought
                 rather than merely paused, which matters for people who think out loud. */
              turn_detection: { type: 'semantic_vad' },
              /* Without this, the customer's own words never appear on screen. Billed
                 separately from the conversation, on the transcription rate card. */
              transcription: { model: 'gpt-4o-transcribe' }
            },
            output: { voice: VOICE }
          },
          /* THE DOCUMENTED COST CONTROL. When the conversation passes the ceiling the server
             drops the oldest items and CARRIES ON — the session never ends. retention_ratio
             0.8 drops a bigger slice less often, so the prompt cache survives longer, which
             is where the real saving is. This replaces the session-restart hack entirely. */
          /* LATENCY (Founder: "a little delay in between"). gpt-realtime-2 reasons mid-turn,
             which is what creates the pause. OpenAI's guidance for production voice agents is
             to start at LOW effort and only raise it if the task needs it. An intake
             interview does not. */
          reasoning: { effort: 'low' },
          truncation: {
            type: 'retention_ratio',
            retention_ratio: 0.8,
            token_limits: { post_instructions: TOKEN_CEILING }
          },
          instructions: instructions(brief),
          tools: TOOLS,
          tool_choice: 'auto'
        }
      })
    });

    var txt = await r.text();
    if (!r.ok) {
      console.error('REALTIME TOKEN FAIL', r.status, txt.slice(0, 400));
      return json(502, { ok: false, error: 'upstream',
        message: 'Voice could not start just now. Please type your idea instead.' });
    }

    var j = {};
    try { j = JSON.parse(txt); } catch (e) {}
    // GA returns { value, expires_at, session }; older shapes nested it under client_secret.
    var secret = j.value || (j.client_secret && j.client_secret.value) || '';
    if (!secret) {
      console.error('REALTIME TOKEN: no secret in response', txt.slice(0, 300));
      return json(502, { ok: false, error: 'no_token',
        message: 'Voice could not start just now. Please type your idea instead.' });
    }

    return json(200, { ok: true, token: secret, model: MODEL,
                       expires_at: j.expires_at || null });
  } catch (e) {
    console.error('REALTIME TOKEN ERROR', String(e && e.message || e));
    return json(502, { ok: false, error: 'exception',
      message: 'Voice could not start just now. Please type your idea instead.' });
  }
};

function json(code, obj) {
  return { statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(obj) };
}
