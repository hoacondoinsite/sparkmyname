/* film-player.js — SparkMyName brand film player.
 *
 * WHY THIS EXISTS AS A PLAYER AND NOT A <video src>:
 * a finished film is not one file. Each film is stored as several scene .mp4 files plus a
 * single continuous narration .mp3 and a single music .mp3. This player stitches them at
 * playback time: it plays the scenes back to back on two alternating <video> elements
 * (so the next scene is already buffered when the current one ends) and runs the narration
 * and music as one unbroken track underneath, correcting drift as it goes.
 *
 * The manifest is the only source of truth for what a film contains. Orphan files sitting
 * in storage from earlier versions are never read, because they are not in the manifest.
 *
 * PUBLIC API:  window.SMNFilm.open(slug, {name, cat, source})
 *   source 'premiere' (default) -> /.netlify/functions/premiere-manifest
 *   source 'overtime2'          -> /.netlify/functions/overtime2-manifest
 */
(function () {
  'use strict';

  var ENDPOINT = {
    premiere: '/.netlify/functions/premiere-manifest',
    overtime2: '/.netlify/functions/overtime2-manifest'
  };

  var cache = {};      // manifest cache, per source
  var ui = null;       // built once, reused
  var S = null;        // live session state
  var ccWanted = false; // remembered across opens within the page

  /* ---------- build the shell once ---------- */
  function build() {
    if (ui) return ui;
    var veil = document.createElement('div');
    veil.className = 'smnfp-veil';
    veil.setAttribute('role', 'dialog');
    veil.setAttribute('aria-modal', 'true');
    veil.setAttribute('aria-label', 'Brand film player');
    veil.innerHTML =
      '<div class="smnfp-shell">' +
        '<div class="smnfp-stage">' +
          '<video playsinline preload="auto"></video>' +
          '<video playsinline preload="auto"></video>' +
          '<div class="smnfp-top">' +
            '<div class="smnfp-title"></div>' +
            '<button class="smnfp-x" type="button" aria-label="Close film">&#10005;</button>' +
          '</div>' +
          '<button class="smnfp-big" type="button" aria-label="Play film">&#9654;</button>' +
          '<div class="smnfp-cc" aria-live="polite"></div>' +
          '<div class="smnfp-note"><div></div></div>' +
          '<div class="smnfp-bar">' +
            '<input class="smnfp-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek through the film">' +
            '<div class="smnfp-row">' +
              '<button class="smnfp-btn b-play" type="button" aria-label="Play">&#9654;</button>' +
              '<button class="smnfp-btn b-back" type="button" aria-label="Rewind ten seconds">&#8630;10</button>' +
              '<button class="smnfp-btn b-restart" type="button" aria-label="Start again from the beginning">&#8635;</button>' +
              '<span class="smnfp-time">0:00 / 0:00</span>' +
              '<span class="smnfp-gap"></span>' +
              '<button class="smnfp-btn b-mute" type="button" aria-label="Mute">&#128266;</button>' +
              '<input class="smnfp-vol" type="range" min="0" max="100" value="100" step="1" aria-label="Volume">' +
              '<button class="smnfp-btn b-cc" type="button" aria-label="Captions" aria-pressed="false">CC</button>' +
              '<button class="smnfp-btn b-full" type="button" aria-label="Full screen">&#9974;</button>' +
              '<button class="smnfp-btn b-close" type="button" aria-label="Close">&#10005;</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(veil);

    var vids = veil.querySelectorAll('.smnfp-stage video');
    ui = {
      veil: veil,
      shell: veil.querySelector('.smnfp-shell'),
      stage: veil.querySelector('.smnfp-stage'),
      v: [vids[0], vids[1]],
      title: veil.querySelector('.smnfp-title'),
      big: veil.querySelector('.smnfp-big'),
      cc: veil.querySelector('.smnfp-cc'),
      note: veil.querySelector('.smnfp-note'),
      noteBody: veil.querySelector('.smnfp-note > div'),
      seek: veil.querySelector('.smnfp-seek'),
      time: veil.querySelector('.smnfp-time'),
      bPlay: veil.querySelector('.b-play'),
      bBack: veil.querySelector('.b-back'),
      bRestart: veil.querySelector('.b-restart'),
      bMute: veil.querySelector('.b-mute'),
      vol: veil.querySelector('.smnfp-vol'),
      bCC: veil.querySelector('.b-cc'),
      bFull: veil.querySelector('.b-full'),
      bClose: veil.querySelector('.b-close'),
      x: veil.querySelector('.smnfp-x'),
      voice: new Audio(),
      music: new Audio()
    };
    ui.voice.preload = 'auto';
    ui.music.preload = 'auto';
    ui.music.loop = true;

    wire();
    return ui;
  }

  /* ---------- helpers ---------- */
  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function showNote(html) { ui.noteBody.innerHTML = html; ui.note.classList.add('show'); }
  function hideNote() { ui.note.classList.remove('show'); }

  /* Build caption cues from the exact narration script.
     Cue wording is verbatim; cue timing is proportional to character count across the
     narration track — approximate boundaries, exact words. */
  function buildCues(script, total) {
    if (!script || !total || !isFinite(total)) return [];
    var raw = String(script).replace(/\s+/g, ' ').trim();
    /* Sentence split WITHOUT lookbehind on purpose: a lookbehind in a regex literal is a
       PARSE error in Safari below 16.4, which would kill this entire file and take the
       player down with it. This walks the string instead. */
    var parts = [], buf = '', ch, j;
    for (j = 0; j < raw.length; j++) {
      ch = raw.charAt(j);
      buf += ch;
      if ('.!?\u2026'.indexOf(ch) > -1 && (j + 1 >= raw.length || raw.charAt(j + 1) === ' ')) {
        parts.push(buf); buf = '';
      }
    }
    if (buf.trim()) parts.push(buf);
    parts = parts.join('\u0001').split(/\u0001|\s+\u2014\s+/)
                 .filter(function (x) { return x && x.trim().length; });
    if (!parts.length) return [];
    var chunks = [], i, p;
    for (i = 0; i < parts.length; i++) {
      p = parts[i].trim();
      while (p.length > 96) {                       // keep a caption to ~two readable lines
        var cut = p.lastIndexOf(' ', 96);
        if (cut < 40) cut = 96;
        chunks.push(p.slice(0, cut).trim());
        p = p.slice(cut).trim();
      }
      if (p) chunks.push(p);
    }
    var totalChars = 0;
    for (i = 0; i < chunks.length; i++) totalChars += chunks[i].length;
    if (!totalChars) return [];
    var cues = [], at = 0;
    for (i = 0; i < chunks.length; i++) {
      var dur = total * (chunks[i].length / totalChars);
      cues.push({ a: at, b: at + dur, t: chunks[i] });
      at += dur;
    }
    return cues;
  }

  /* ---------- timeline maths ---------- */
  function elapsedBefore(i) {
    var t = 0;
    for (var k = 0; k < i && k < S.dur.length; k++) t += (S.dur[k] || 0);
    return t;
  }
  function totalDur() {
    var t = 0;
    for (var k = 0; k < S.dur.length; k++) t += (S.dur[k] || 0);
    return t;
  }
  function globalTime() {
    if (!S) return 0;
    var cur = S.v() && isFinite(S.v().currentTime) ? S.v().currentTime : 0;
    return elapsedBefore(S.i) + cur;
  }

  /* ---------- painting ---------- */
  function paint() {
    if (!S || !ui.veil.classList.contains('open')) return;
    var t = globalTime(), T = totalDur();
    ui.time.textContent = fmt(t) + ' / ' + fmt(T);
    if (!S.scrubbing && T > 0) ui.seek.value = String(Math.round((t / T) * 1000));
    // captions
    if (ccWanted && S.cues.length) {
      var txt = '';
      for (var k = 0; k < S.cues.length; k++) {
        if (t >= S.cues[k].a && t < S.cues[k].b) { txt = S.cues[k].t; break; }
      }
      if (txt) { ui.cc.textContent = txt; ui.cc.classList.add('on'); }
      else { ui.cc.classList.remove('on'); }
    } else {
      ui.cc.classList.remove('on');
    }
    // keep narration and music locked to the film clock
    syncAudio(t);
  }

  function syncAudio(t) {
    ['voice', 'music'].forEach(function (k) {
      var a = ui[k];
      if (!a.src) return;
      if (!isFinite(a.duration)) return;
      var want = (k === 'music' && a.duration > 0) ? (t % a.duration) : t;
      if (want > a.duration) { if (!a.paused) a.pause(); return; }
      if (Math.abs(a.currentTime - want) > 0.35) { try { a.currentTime = want; } catch (e) {} }
      if (!S.paused && a.paused) { a.play().catch(function () {}); }
    });
  }

  /* ---------- scene handling ---------- */
  function vAt(i) { return ui.v[i % 2]; }

  function showScene(i, at, autoplay) {
    if (!S || i < 0 || i >= S.shots.length) return;
    S.i = i;
    var cur = vAt(i), nxt = vAt(i + 1);
    if (cur.getAttribute('data-src') !== S.shots[i]) {
      cur.setAttribute('data-src', S.shots[i]);
      cur.src = S.shots[i];
    }
    ui.v[0].classList.toggle('live', cur === ui.v[0]);
    ui.v[1].classList.toggle('live', cur === ui.v[1]);
    S.v = function () { return cur; };
    try { cur.currentTime = at || 0; } catch (e) {}
    // buffer the following scene now, so the hand-off has nothing to wait for
    if (i + 1 < S.shots.length && nxt.getAttribute('data-src') !== S.shots[i + 1]) {
      nxt.setAttribute('data-src', S.shots[i + 1]);
      nxt.src = S.shots[i + 1];
      try { nxt.load(); } catch (e) {}
    }
    if (autoplay && !S.paused) cur.play().catch(function () {});
    ui.v[0].muted = (cur !== ui.v[0]);
    ui.v[1].muted = (cur !== ui.v[1]);
  }

  function onSceneEnd() {
    if (!S) return;
    if (S.i + 1 < S.shots.length) {
      showScene(S.i + 1, 0, true);
    } else {
      finish();
    }
  }

  function finish() {
    setPaused(true);
    ui.big.classList.add('show');
    ui.big.setAttribute('aria-label', 'Play the film again');
    ui.cc.classList.remove('on');
    // The film is over: hand the page back. Replay stays one click away until then.
    S.autoclose = setTimeout(function () { close(); }, 5000);
  }

  /* ---------- transport ---------- */
  function setPaused(p) {
    if (!S) return;
    S.paused = !!p;
    var v = S.v && S.v();
    if (p) {
      if (v) v.pause();
      ui.voice.pause(); ui.music.pause();
      ui.bPlay.innerHTML = '&#9654;';
      ui.bPlay.setAttribute('aria-label', 'Play');
      ui.big.classList.add('show');
    } else {
      hideNote();
      if (v) v.play().catch(function () {});
      if (ui.voice.src) ui.voice.play().catch(function () {});
      if (ui.music.src) ui.music.play().catch(function () {});
      ui.bPlay.innerHTML = '&#10073;&#10073;';
      ui.bPlay.setAttribute('aria-label', 'Pause');
      ui.big.classList.remove('show');
    }
  }

  function seekTo(t) {
    if (!S) return;
    var T = totalDur();
    if (t < 0) t = 0;
    if (T && t > T) t = T;
    var i = 0, acc = 0;
    for (i = 0; i < S.shots.length; i++) {
      var d = S.dur[i] || 0;
      if (t < acc + d || i === S.shots.length - 1) break;
      acc += d;
    }
    if (S.autoclose) { clearTimeout(S.autoclose); S.autoclose = null; }
    showScene(i, t - acc, !S.paused);
    syncAudio(t);
    paint();
  }

  /* ---------- open / close ---------- */
  function restore() {
    if (!S) return;
    if (S.autoclose) { clearTimeout(S.autoclose); S.autoclose = null; }
    if (S.tick) { clearInterval(S.tick); S.tick = null; }
    if (S.idle) { clearTimeout(S.idle); S.idle = null; }
  }

  function close() {
    if (!ui) return;
    restore();
    ui.veil.classList.remove('open');
    document.documentElement.style.overflow = S && S.prevOverflow !== undefined ? S.prevOverflow : '';
    ['voice', 'music'].forEach(function (k) { try { ui[k].pause(); ui[k].removeAttribute('src'); ui[k].load(); } catch (e) {} });
    ui.v.forEach(function (v) {
      try { v.pause(); v.removeAttribute('src'); v.removeAttribute('data-src'); v.load(); } catch (e) {}
      v.classList.remove('live');
    });
    ui.cc.classList.remove('on');
    hideNote();
    // put the visitor back exactly where they were
    if (S && S.opener && document.contains(S.opener)) {
      try { S.opener.focus({ preventScroll: true }); } catch (e) { try { S.opener.focus(); } catch (e2) {} }
    }
    if (S && typeof S.scrollY === 'number') window.scrollTo(0, S.scrollY);
    S = null;
  }

  function getManifest(source) {
    if (cache[source]) return Promise.resolve(cache[source]);
    var url = ENDPOINT[source] || ENDPOINT.premiere;
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('manifest ' + r.status); return r.json(); })
      .then(function (j) { cache[source] = j; return j; });
  }

  function open(slug, opts) {
    opts = opts || {};
    build();
    var source = opts.source || 'premiere';
    S = {
      slug: slug, i: 0, dur: [], shots: [], cues: [], paused: true,
      scrubbing: false, autoclose: null, tick: null, idle: null,
      opener: opts.opener || document.activeElement,
      scrollY: window.scrollY || window.pageYOffset || 0,
      prevOverflow: document.documentElement.style.overflow,
      v: function () { return ui.v[0]; }
    };
    ui.title.innerHTML = '<b>' + esc(opts.name || slug) + '</b>' +
      (opts.cat ? '<span>' + esc(opts.cat) + '</span>' : '');
    ui.seek.value = '0';
    ui.time.textContent = '0:00 / 0:00';
    ui.big.classList.remove('show');
    ui.veil.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    showNote('Loading the film&hellip;');
    try { ui.bClose.focus(); } catch (e) {}

    getManifest(source).then(function (man) {
      var b = (man && man.brands && man.brands[slug]) || null;
      var shots = (b && Array.isArray(b.shots) ? b.shots : []).filter(Boolean);
      if (!shots.length) {
        showNote('This film isn&rsquo;t available right now.<br>Nothing was lost &mdash; please try again shortly.');
        return;
      }
      S.shots = shots;
      S.dur = new Array(shots.length);
      if (b.voice) ui.voice.src = b.voice;
      if (b.music) { ui.music.src = b.music; ui.music.volume = 0.22; }
      applyVolume();

      // read every scene's real length so one scrubber can span the whole film
      measure(shots).then(function (durs) {
        if (!S) return;
        S.dur = durs;
        var cap = window.SMN_CAPTIONS && window.SMN_CAPTIONS[slug];
        S.cues = cap ? buildCues(cap.script, totalDur()) : [];
        ui.bCC.disabled = !S.cues.length;
        ui.bCC.title = S.cues.length ? 'Captions' : 'Captions are not available for this film';
        hideNote();
        showScene(0, 0, false);
        setPaused(false);
        S.tick = setInterval(paint, 200);
        paint();
      });
    }).catch(function () {
      showNote('The film couldn&rsquo;t be reached.<br>Please check your connection and try again.');
    });
  }

  function measure(shots) {
    return Promise.all(shots.map(function (src) {
      return new Promise(function (res) {
        var probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.muted = true;
        var done = false;
        function ok() { if (done) return; done = true; res(isFinite(probe.duration) ? probe.duration : 0); probe.removeAttribute('src'); }
        probe.addEventListener('loadedmetadata', ok);
        probe.addEventListener('error', function () { if (!done) { done = true; res(0); } });
        setTimeout(function () { if (!done) { done = true; res(0); } }, 8000);
        probe.src = src;
      });
    }));
  }

  function applyVolume() {
    var v = Number(ui.vol.value) / 100;
    ui.voice.volume = v;
    ui.music.volume = v * 0.22;
    ui.v.forEach(function (el) { el.volume = v; });
    ui.bMute.innerHTML = v === 0 ? '&#128263;' : '&#128266;';
    ui.bMute.setAttribute('aria-label', v === 0 ? 'Unmute' : 'Mute');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- wiring ---------- */
  function wire() {
    ui.v.forEach(function (v) {
      v.addEventListener('ended', onSceneEnd);
      v.addEventListener('loadedmetadata', function () {
        if (S && S.dur[S.i] === 0 && isFinite(v.duration)) S.dur[S.i] = v.duration;
      });
    });

    ui.bPlay.addEventListener('click', function () {
      if (!S) return;
      if (S.autoclose) { clearTimeout(S.autoclose); S.autoclose = null; }
      setPaused(!S.paused);
    });
    ui.big.addEventListener('click', function () {
      if (!S) return;
      if (S.autoclose) { clearTimeout(S.autoclose); S.autoclose = null; }
      var T = totalDur();
      if (T && globalTime() >= T - 0.4) { seekTo(0); }   // ended -> replay from the top
      setPaused(false);
    });
    ui.bBack.addEventListener('click', function () { seekTo(globalTime() - 10); });
    ui.bRestart.addEventListener('click', function () { seekTo(0); setPaused(false); });

    ui.seek.addEventListener('input', function () {
      if (!S) return;
      S.scrubbing = true;
      var T = totalDur();
      ui.time.textContent = fmt((Number(ui.seek.value) / 1000) * T) + ' / ' + fmt(T);
    });
    ui.seek.addEventListener('change', function () {
      if (!S) return;
      seekTo((Number(ui.seek.value) / 1000) * totalDur());
      S.scrubbing = false;
    });

    ui.vol.addEventListener('input', applyVolume);
    ui.bMute.addEventListener('click', function () {
      ui.vol.value = Number(ui.vol.value) > 0 ? '0' : '100';
      applyVolume();
    });

    ui.bCC.addEventListener('click', function () {
      ccWanted = !ccWanted;
      ui.bCC.classList.toggle('act', ccWanted);
      ui.bCC.setAttribute('aria-pressed', ccWanted ? 'true' : 'false');
      if (!ccWanted) ui.cc.classList.remove('on');
      paint();
    });

    ui.bFull.addEventListener('click', function () {
      var el = ui.shell;
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else if (el.requestFullscreen) { el.requestFullscreen().catch(function () {}); }
    });

    ui.bClose.addEventListener('click', close);
    ui.x.addEventListener('click', close);
    ui.veil.addEventListener('click', function (e) { if (e.target === ui.veil) close(); });

    document.addEventListener('keydown', function (e) {
      if (!ui || !ui.veil.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); }
      else if (e.key === ' ' || e.key === 'k') {
        if (/^(INPUT|BUTTON|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))) return;
        e.preventDefault(); if (S) setPaused(!S.paused);
      }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo(globalTime() - 5); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); seekTo(globalTime() + 5); }
    });

    // fade the furniture while the film runs, bring it back on any movement
    ['mousemove', 'touchstart', 'keydown'].forEach(function (ev) {
      ui.stage.addEventListener(ev, function () {
        ui.shell.classList.remove('idle');
        if (S && S.idle) clearTimeout(S.idle);
        if (S) S.idle = setTimeout(function () {
          if (S && !S.paused) ui.shell.classList.add('idle');
        }, 2600);
      });
    });
  }

  window.SMNFilm = { open: open, close: close };
})();
