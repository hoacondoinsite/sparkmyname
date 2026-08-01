/* spark-voice.js — the conversation half of the voice intake.
 *
 * WHAT IT DOES: opens a live two-way voice conversation with Spark, using WebRTC straight
 * to OpenAI. The browser never holds a real API key — it asks /realtime-token for a
 * throwaway credential that dies in about a minute.
 *
 * ONE CONTINUOUS SESSION (corrected 2026-07-30).
 * The first build restarted the session every ~100 seconds to control cost. It broke the
 * conversation: the model re-greeted the customer and re-asked what they had just said,
 * because a new session has no memory. It was also MORE expensive, not less — restarting
 * throws away the prompt cache, and cached audio is 80x cheaper than fresh.
 * OpenAI already handles long conversations server-side: past a token ceiling it drops the
 * oldest messages and the session CARRIES ON. That is configured in realtime-token.js.
 * So this file now opens ONE session and leaves it open until the customer is finished.
 *
 * The only reconnect left is for a genuinely DROPPED connection, and that one is seeded
 * with the brief so nothing is re-asked.
 *
 * PUBLIC API: window.SparkVoice.start(opts) / .stop() / .isLive()
 *   opts.onBrief(brief)      — called whenever the picture updates
 *   opts.onDone(sentence)    — called when the customer confirms their summary
 *   opts.onState(state,msg)  — 'connecting' | 'live' | 'thinking' | 'ended' | 'error'
 *   opts.onCaption(who,text) — live transcript lines, for the on-screen captions
 */
(function () {
  'use strict';

  /* A long stop only so a tab left open overnight cannot bill forever. It ENDS the
     conversation cleanly with a message — it does not silently restart it. */
  var MAX_MINUTES  = 20;
  var MAX_RECONNECT = 2;   // only after a genuine drop, never on a schedule

  var S = null;

  function now() { return Date.now(); }

  function briefText(b) {
    if (!b) return '';
    var out = [];
    if (b.business) out.push('Business: ' + b.business);
    if (b.audience) out.push('Who it is for: ' + b.audience);
    if (b.feeling)  out.push('Feeling they want: ' + b.feeling);
    if (b.notes)    out.push('Notes: ' + b.notes);
    return out.join('\n');
  }

  function emit(kind, a, b) {
    if (!S || !S.opts) return;
    var fn = S.opts['on' + kind];
    if (typeof fn === 'function') { try { fn(a, b); } catch (e) {} }
  }

  /* ---- open the session ---- */
  async function openSession() {
    /* STEP 1 — ask OUR server for a throwaway credential. */
    var res, data;
    try {
      var _tokPath = (S.opts && S.opts.tokenPath) || '/.netlify/functions/realtime-token';
      var _tokBody = { brief: briefText(S.brief) };
      if (S.opts && S.opts.tokenBody) { for (var _k in S.opts.tokenBody) { _tokBody[_k] = S.opts.tokenBody[_k]; } }
      res = await fetch(_tokPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_tokBody)
      });
    } catch (e) {
      throw new Error('Step 1: could not reach the SparkMyName server. ' +
                      'Check your internet connection.');
    }
    data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.ok || !data.token) {
      throw new Error('Step 1: ' + (data.message || 'the server would not start a voice session.'));
    }

    var pc = new RTCPeerConnection();
    S.pc = pc;

    // the model's voice comes back on this element
    var audio = S.audioEl || document.createElement('audio');
    audio.autoplay = true;
    S.audioEl = audio;
    pc.ontrack = function (e) { audio.srcObject = e.streams[0]; };

    // Reuse the microphone stream if we ever reconnect after a drop — asking permission
    // again would show a browser prompt mid-conversation and break the flow.
    if (!S.mic) {
      try {
        S.mic = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true }
        });
      } catch (e) {
        throw new Error('Step 3: your browser did not give access to the microphone. ' +
                        'Allow the microphone for this site, then try again.');
      }
    }
    S.mic.getTracks().forEach(function (t) { pc.addTrack(t, S.mic); });

    var dc = pc.createDataChannel('oai-events');
    S.dc = dc;
    dc.addEventListener('message', function (e) { onEvent(e.data); });

    /* If the network drops mid-conversation, come back seeded with the brief rather than
       leaving the customer talking to nothing. */
    pc.addEventListener('connectionstatechange', function () {
      if (!S || !S.live) return;
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        reconnect();
      }
    });

    var offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    /* STEP 2 — hand the offer to OpenAI. If the site's Content-Security-Policy does not
       list api.openai.com under connect-src, the BROWSER blocks this before it leaves the
       machine, and the only clue is a bare "Load failed". Name it, so nobody hunts again. */
    var sdpRes;
    try {
      sdpRes = await fetch('https://api.openai.com/v1/realtime/calls?model=' +
                           encodeURIComponent(data.model), {
        method: 'POST',
        body: offer.sdp,
        headers: { 'Authorization': 'Bearer ' + data.token, 'Content-Type': 'application/sdp' }
      });
    } catch (e) {
      throw new Error('Step 2: the browser blocked the connection to OpenAI. ' +
                      'This is usually the site security policy (connect-src) missing ' +
                      'api.openai.com.');
    }
    if (!sdpRes.ok) {
      throw new Error('Step 2: OpenAI refused the connection (' + sdpRes.status + ').');
    }
    await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() });

    S.connectedAt = now();
  }

  /* ---- events coming back over the data channel ---- */
  function onEvent(raw) {
    var m;
    try { m = JSON.parse(raw); } catch (e) { return; }

    switch (m.type) {
      case 'session.created':
      case 'session.updated':
        emit('State', 'live', '');
        /* Opt-in: greet the moment the session is ready so the caller isn't sitting in
           silence waiting to speak first. Fires once; survives reconnect (no re-greet). */
        if (S.opts && S.opts.greetOnConnect && !S.greeted) { S.greeted = true; send({ type: 'response.create' }); }
        break;

      // the model finished a spoken turn
      case 'response.done':
        S.speaking = false;
        emit('State', 'heard', '');
        /* Real spend, straight from the API, so cost is observed rather than guessed. */
        try {
          var u = m.response && m.response.usage;
          if (u) {
            S.tokens.in  += (u.input_tokens || 0);
            S.tokens.out += (u.output_tokens || 0);
            var d = u.input_token_details || {};
            S.tokens.cached += (d.cached_tokens || 0);
            emit('Usage', S.tokens);
          }
        } catch (e) {}
        break;

      case 'response.created':
        /* Reasoning happens before any audio arrives. Without this the customer stares at a
           silent screen and assumes it broke — the Founder felt exactly that. */
        S.speaking = true;
        emit('State', 'thinking', '');
        break;

      // live transcript of what the model says
      case 'response.output_audio_transcript.delta':
        if (!S.line) emit('State', 'speaking', '');   // first words = thinking is over
        S.line = (S.line || '') + (m.delta || '');
        emit('Caption', 'spark', S.line);
        break;
      case 'response.output_audio_transcript.done':
        S.line = '';
        break;

      // live transcript of what the customer says
      case 'conversation.item.input_audio_transcription.completed':
        if (m.transcript) { emit('Caption', 'you', m.transcript); emit('State', 'heard', ''); }
        break;

      // tool calls
      case 'response.function_call_arguments.done':
        handleTool(m.name, m.arguments, m.call_id);
        break;

      case 'error':
        var msg = (m.error && m.error.message) || 'Something went wrong with the call.';
        emit('State', 'error', msg);
        break;
    }
  }

  function handleTool(name, argsRaw, callId) {
    var args = {};
    try { args = JSON.parse(argsRaw || '{}'); } catch (e) {}

    if (name === 'save_brief') {
      ['business', 'audience', 'feeling', 'notes'].forEach(function (k) {
        if (args[k] && String(args[k]).trim()) S.brief[k] = String(args[k]).trim();
      });
      emit('Brief', S.brief);
      reply(callId, '{"saved":true}');
      return;
    }

    if (name === 'finish_intake') {
      var sentence = String(args.sentence || '').trim();
      reply(callId, '{"ok":true}');
      emit('State', 'ended', '');
      emit('Done', sentence, S.brief);
      stop();
      return;
    }

    // Generic tools (e.g. the lab's set_spec): forward to an optional host callback.
    if (S.opts && typeof S.opts.onTool === 'function') {
      try { S.opts.onTool(name, args); } catch (e) {}
    }
    reply(callId, '{"ok":true}');
  }

  function reply(callId, output) {
    if (!S || !S.dc || S.dc.readyState !== 'open' || !callId) return;
    send({ type: 'conversation.item.create',
           item: { type: 'function_call_output', call_id: callId, output: output } });
    send({ type: 'response.create' });
  }

  function send(obj) {
    if (S && S.dc && S.dc.readyState === 'open') {
      try { S.dc.send(JSON.stringify(obj)); } catch (e) {}
    }
  }

  /* ---- reconnect, ONLY after a genuine drop ---- */
  async function reconnect() {
    if (!S || S.rolling) return;
    S.rolling = true;
    try {
      S.reconnects += 1;
      if (S.reconnects > MAX_RECONNECT) {
        emit('State', 'error', 'The connection kept dropping. You can type your idea instead.');
        stop(); return;
      }
      try { if (S.dc) S.dc.close(); } catch (e) {}
      try { if (S.pc) S.pc.close(); } catch (e) {}
      await openSession();                 // seeded with the brief, told not to re-ask
      send({ type: 'response.create' });
    } catch (e) {
      emit('State', 'error', (e && e.message) || 'The conversation dropped.');
      stop();
    } finally { S.rolling = false; }
  }

  function tick() {
    if (!S || !S.live) return;
    if (now() - S.started > MAX_MINUTES * 60 * 1000) {
      emit('State', 'ended', 'time');
      emit('Done', '', S.brief);       // keep whatever was understood
      stop();
    }
  }

  /* ---- public ---- */
  async function start(opts) {
    if (S && S.live) return;
    S = { opts: opts || {}, brief: {}, live: true, speaking: false, greeted: false,
          rolling: false, reconnects: 0, line: '',
          tokens: { in: 0, out: 0, cached: 0 },
          pc: null, dc: null, mic: null, audioEl: null,
          started: now(), connectedAt: 0, timer: null };
    emit('State', 'connecting', '');
    try {
      await openSession();
      S.timer = setInterval(tick, 5000);
      emit('State', 'live', '');
    } catch (e) {
      var msg = (e && e.message) || 'Voice could not start.';
      if (e && (e.name === 'NotAllowedError' || /permission/i.test(msg))) {
        msg = 'Your browser blocked the microphone. You can type your idea instead.';
      }
      emit('State', 'error', msg);
      stop();
    }
  }

  function stop() {
    if (!S) return;
    S.live = false;
    if (S.timer) { clearInterval(S.timer); S.timer = null; }
    try { if (S.dc) S.dc.close(); } catch (e) {}
    try { if (S.pc) S.pc.close(); } catch (e) {}
    try { if (S.mic) S.mic.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
    if (S.audioEl) { try { S.audioEl.srcObject = null; } catch (e) {} }
    S.pc = null; S.dc = null; S.mic = null;
  }

  function isLive() { return !!(S && S.live); }

  window.SparkVoice = { start: start, stop: stop, isLive: isLive,
                        _brief: function () { return S ? S.brief : null; } };
})();
