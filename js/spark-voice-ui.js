/* spark-voice-ui.js — the panel a customer actually sees for the voice intake.
 *
 * Transport lives in spark-voice.js; this file is only the interface. It shows the live
 * conversation as text (so it is usable with the sound down and readable for anyone hard of
 * hearing), shows the picture of their business filling in as Spark understands it, and when
 * the customer confirms, writes the finished sentence into the existing #seed box so the rest
 * of the site works exactly as it always has.
 *
 * IT NEVER CLAIMS TO HAVE HEARD SOMETHING IT DID NOT. If voice cannot start, it says so
 * plainly and points at the textarea, which always works.
 */
(function () {
  'use strict';

  var ui = null, seedEl = null;

  function build() {
    if (ui) return ui;
    var veil = document.createElement('div');
    veil.className = 'sv-veil';
    veil.setAttribute('role', 'dialog');
    veil.setAttribute('aria-modal', 'true');
    veil.setAttribute('aria-label', 'Talk through your idea with Spark');
    veil.innerHTML =
      '<div class="sv-box">' +
        '<div class="sv-head">' +
          '<div class="sv-orb"></div>' +
          '<div class="sv-title"><b>Talking with Spark</b><span class="sv-sub">Connecting</span></div>' +
          '<button class="sv-x" type="button" aria-label="End the conversation">&#10005;</button>' +
        '</div>' +
        '<div class="sv-body" aria-live="polite">' +
          '<div class="sv-think"><i></i><i></i><i></i><em>Thinking</em></div>' +
        '</div>' +
        '<div class="sv-brief" hidden>' +
          '<div class="sv-brief-t">What Spark has so far</div>' +
          '<div class="sv-brief-rows"></div>' +
        '</div>' +
        '<div class="sv-foot">' +
          '<span class="sv-hint">Just talk &mdash; it waits for you, and closes itself when you&rsquo;re done.</span>' +
          '<button class="sv-btn sv-end" type="button" hidden>Close</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(veil);

    ui = { veil: veil,
      sub: veil.querySelector('.sv-sub'),
      body: veil.querySelector('.sv-body'),
      brief: veil.querySelector('.sv-brief'),
      rows: veil.querySelector('.sv-brief-rows'),
      think: veil.querySelector('.sv-think'),
      end: veil.querySelector('.sv-end'),
      x: veil.querySelector('.sv-x'),
      hint: veil.querySelector('.sv-hint'),
      turns: {} };

    ui.x.addEventListener('click', close);
    ui.end.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && ui.veil.classList.contains('open')) close();
    });
    return ui;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function note(html) {
    ui.body.innerHTML = '<p class="sv-note">' + html + '</p>';
    ui.body.appendChild(ui.think);
  }

  /* one live line per speaker, replaced as it streams in */
  function caption(who, text) {
    if (!text) return;
    var first = ui.body.querySelector('.sv-note');
    if (first) ui.body.innerHTML = '';
    var key = who + ':' + (who === 'spark' ? 'live' : String(Date.now()));
    if (who === 'spark') {
      var live = ui.body.querySelector('.sv-turn.spark.live');
      if (!live) {
        live = document.createElement('p');
        live.className = 'sv-turn spark live';
        live.innerHTML = '<b>Spark</b><span></span>';
        ui.body.appendChild(live);
      }
      live.querySelector('span').textContent = text;
    } else {
      var done = ui.body.querySelector('.sv-turn.spark.live');
      if (done) done.classList.remove('live');
      var p = document.createElement('p');
      p.className = 'sv-turn you';
      p.innerHTML = '<b>You</b><span></span>';
      p.querySelector('span').textContent = text;
      ui.body.appendChild(p);
    }
    ui.body.scrollTop = ui.body.scrollHeight;
  }

  var LABELS = { business: 'Business', audience: 'Who it is for',
                 feeling: 'Feeling', notes: 'Notes' };

  function showBrief(b) {
    var keys = ['business', 'audience', 'feeling', 'notes'].filter(function (k) { return b && b[k]; });
    if (!keys.length) { ui.brief.hidden = true; return; }
    ui.brief.hidden = false;
    ui.rows.innerHTML = keys.map(function (k) {
      return '<div class="sv-row"><i>&#9679;</i><u>' + LABELS[k] + '</u><span>' + esc(b[k]) + '</span></div>';
    }).join('');
  }

  function state(s, msg) {
    if (s === 'connecting') {
      ui.sub.textContent = 'Connecting';
      note('One moment &mdash; waking Spark up.');
    }
    else if (s === 'live') {
      ui.veil.classList.add('live');
      ui.sub.textContent = 'Listening';
      if (ui.body.querySelector('.sv-note')) note('Tell me about the business you want to build.');
    }
    else if (s === 'thinking') { ui.veil.classList.add('think'); ui.sub.textContent = 'Thinking'; }
    else if (s === 'speaking') { ui.veil.classList.remove('think'); ui.sub.textContent = 'Speaking'; }
    else if (s === 'heard')    { ui.veil.classList.remove('think'); ui.sub.textContent = 'Listening'; }
    else if (s === 'ended') {
      ui.veil.classList.remove('live', 'think');
      ui.sub.textContent = 'Finished';
    }
    else if (s === 'error') {
      ui.veil.classList.remove('live', 'think');
      ui.sub.textContent = 'Not connected';
      note('<b>Voice could not start.</b><small>' + esc(msg || '') +
           '<br><br>Close this and type your idea in the box instead &mdash; it works exactly the same.</small>');
      ui.hint.textContent = '';
      ui.end.hidden = false;
    }
  }

  /* the customer confirmed — hand the sentence to the existing flow */
  function done(sentence, brief) {
    var text = (sentence || '').trim();
    if (!text && brief) {
      text = [brief.business, brief.audience && 'for ' + brief.audience]
             .filter(Boolean).join(' ');
    }
    if (text && seedEl) {
      seedEl.value = text;
      seedEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
    close();
    if (seedEl) { try { seedEl.focus(); } catch (e) {} }
  }

  /* If they close the window mid-conversation, do not throw away what Spark understood —
     write it into the idea box so nothing they said is lost. */
  function salvage() {
    var b = (window.SparkVoice && window.SparkVoice._brief && window.SparkVoice._brief()) || null;
    if (b && (b.business || b.audience) && seedEl && !seedEl.value.trim()) {
      var text = [b.business, b.audience && 'for ' + b.audience].filter(Boolean).join(' ');
      if (text) { seedEl.value = text; seedEl.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  }

  function close() {
    if (window.SparkVoice && window.SparkVoice.isLive()) { salvage(); window.SparkVoice.stop(); }
    if (!ui) return;
    ui.veil.classList.remove('open', 'live');
    document.documentElement.style.overflow = '';
  }

  function open() {
    build();
    seedEl = document.getElementById('seed');
    ui.body.innerHTML = '';
    ui.body.appendChild(ui.think);
    ui.rows.innerHTML = '';
    ui.brief.hidden = true;
    ui.hint.innerHTML = 'Just talk &mdash; it waits for you, and closes itself when you&rsquo;re done.';
    ui.end.hidden = true;
    ui.veil.classList.remove('think');
    ui.veil.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    note('Getting ready&hellip;');

    if (!window.SparkVoice) {
      state('error', 'The voice feature did not load on this page.');
      return;
    }
    window.SparkVoice.start({
      onState: state,
      onCaption: caption,
      onBrief: showBrief,
      onDone: done
    });
  }

  /* ---- put the button on the page ---- */
  function mount() {
    var mic = document.getElementById('mic');
    if (!mic || !mic.parentNode) return;
    if (document.getElementById('talkBtn')) return;

    var b = document.createElement('button');
    b.id = 'talkBtn';
    b.type = 'button';
    b.className = 'talkbtn';
    b.setAttribute('aria-label', 'Talk your idea through with Spark');
    b.innerHTML = '&#128172; Talk it through';

    // WebRTC and getUserMedia are required. If the browser cannot do it, never show a
    // button that would only disappoint — the textarea and the plain mic still work.
    var able = !!(window.RTCPeerConnection && navigator.mediaDevices &&
                  navigator.mediaDevices.getUserMedia);
    if (!able) { b.hidden = true; }

    mic.parentNode.insertBefore(b, mic.nextSibling);
    // Intent-based prewarm: warm the ephemeral token the instant the user presses, so the fetch
    // overlaps the veil-open + WebRTC handshake. Fires only on real intent — never on page load.
    b.addEventListener('pointerdown', function () {
      try { if (window.SparkVoice && window.SparkVoice.prewarm && !window.SparkVoice.isLive()) window.SparkVoice.prewarm({}); } catch (e) {}
    });
    b.addEventListener('click', open);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }

  window.SparkVoiceUI = { open: open, close: close };
})();
