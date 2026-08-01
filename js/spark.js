/* ============================================================
   SPARKMYNAME — SITE SCRIPT (shared by every page)
   Mic v3 (continuous, whole-transcript, big box), journey tabs,
   film wall, mobile menu, $99 checkout hook. Vanilla JS, no deps.
   ============================================================ */
(function(){
  'use strict';

  /* ---------- MOBILE MENU ---------- */
  var mtoggle = document.getElementById('mobToggle');
  var mpanel  = document.getElementById('mobPanel');
  if(mtoggle && mpanel){
    mtoggle.addEventListener('click', function(){
      mpanel.classList.toggle('open');
      mtoggle.setAttribute('aria-expanded', mpanel.classList.contains('open') ? 'true':'false');
    });
  }

  /* ---------- CHECKOUT HOOK ----------
     On the deployed site the idea + $99 goes to the live Stripe checkout.
     We store the typed idea and send the visitor to checkout.html, which
     starts the sealed $99 (bib) create-checkout. Kept honest: one product, $99. */
  function goCheckout(idea){
    try{ if(idea) sessionStorage.setItem('smn_idea', idea); sessionStorage.setItem('smn_seed', idea); }catch(e){}
    window.location.href = 'checkout.html' + (idea ? ('?idea='+encodeURIComponent(idea.slice(0,180))) : '');
  }
  window.SMN_goCheckout = goCheckout;

  /* wire any element with data-checkout to carry the idea box text */
  function currentIdea(){
    var t = document.getElementById('seed');
    return t ? (t.value||'').trim() : '';
  }
  document.querySelectorAll('[data-checkout]').forEach(function(el){
    el.addEventListener('click', function(e){
      e.preventDefault();
      goCheckout(currentIdea());
    });
  });

  /* ---------- BIG MIC v4 (mobile-safe: no repeats, patient timing) ----------
     Fixes the mobile bug where words repeated and listening cut out early.
     - Finals are appended ONCE using isFinal + resultIndex (never rebuilt from
       the whole results list, which duplicates on iOS/Android).
     - Duplicate-final guard: identical consecutive final chunks are dropped
       (iOS re-fires finals after auto-restarts).
     - Patient timing: 25s to start speaking, 10s of silence to auto-finish. */
  (function(){
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var mic  = document.getElementById('mic');
    var seed = document.getElementById('seed');
    if(!mic || !seed) return;
    if(!SR){ mic.addEventListener('click', function(){ seed.focus(); }); mic.title='Type your idea here'; return; }
    var rec = new SR(); rec.lang='en-US'; rec.interimResults=true;
    try{ rec.continuous = !/iPhone|iPad|iPod/i.test(navigator.userAgent); }catch(e){ rec.continuous=true; }
    var on=false, closing=false, base='', finals='', interim='', lastFinal='', silT=null;
    function render(){ seed.value=[base,finals,interim].filter(function(x){return x&&x.trim();}).join(' ').replace(/\s+/g,' ').trim(); seed.dispatchEvent(new Event('input')); }
    function arm(ms){ clearTimeout(silT); silT=setTimeout(function(){ if(on) finish(); }, ms); }
    function finish(){ if(!on) return; on=false; closing=true; clearTimeout(silT); try{rec.stop();}catch(e){} mic.classList.remove('listening'); interim=''; render(); seed.focus(); }
    mic.addEventListener('click', function(){
      if(on){ finish(); return; }
      base=(seed.value||'').trim(); finals=''; interim=''; lastFinal=''; closing=false;
      try{ rec.start(); }catch(e){}
    });
    rec.onstart = function(){ on=true; mic.classList.add('listening'); arm(25000); };
    rec.onend = function(){
      if(on && !closing){ try{ rec.start(); }catch(e){ finish(); } return; }  /* keep listening (mobile auto-stops) */
      on=false; closing=false; mic.classList.remove('listening');
    };
    rec.onerror = function(ev){ var e=ev&&ev.error; if(e==='no-speech'||e==='aborted') return; finish(); };
    rec.onresult = function(ev){
      interim='';
      for(var i=ev.resultIndex; i<ev.results.length; i++){
        var t=(ev.results[i][0].transcript||'').trim();
        if(!t) continue;
        if(ev.results[i].isFinal){
          if(t!==lastFinal){ finals=(finals?finals+' ':'')+t; lastFinal=t; }  /* repeat guard */
        } else { interim=(interim?interim+' ':'')+t; }
      }
      render(); arm(10000);
    };
  })();

  /* auto-grow the big textarea */
  (function(){
    var t=document.getElementById('seed');
    if(!t) return;
    function grow(){ t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,180)+'px'; }
    t.addEventListener('input', grow); grow();
  })();

  /* ---------- JOURNEY TABS (Dream / Brand / Launch / Grow) ---------- */
  (function(){
    var tabs = document.getElementById('jtabs');
    var panel = document.getElementById('jpanel');
    if(!tabs || !panel || !window.SMN_JOURNEY) return;
    var J = window.SMN_JOURNEY;
    function paint(i){
      var j=J[i];
      var imgHtml = j.img
        ? '<div class="jimg"><img src="'+j.img+'" alt="'+j.alt+'" loading="lazy"></div>'
        : '<div class="jimg"><div class="ph"><b>Image</b>'+j.imgNote+'</div></div>';
      var KICK=['Dream','Brand','Launch','Grow'];
      panel.innerHTML =
        '<div class="jtext"><span class="jkick">'+(KICK[i]||'')+'</span><h3>'+j.t+'</h3><p>'+j.p+'</p><ul>'+
          j.li.map(function(x){return '<li><span class="ck">&#10003;</span>'+x+'</li>';}).join('')+
        '</ul></div>' + imgHtml;
      [].forEach.call(tabs.children, function(b,k){ b.classList.toggle('on', k===i); });
    }
    tabs.addEventListener('click', function(e){
      var b=e.target.closest('.jtab'); if(!b) return;
      paint(parseInt(b.getAttribute('data-j'),10));
    });
    paint(0);
  })();

  /* ---------- FILM WALL (switch the big stage) ---------- */
  (function(){
    var stage = document.getElementById('filmStage');
    var thumbs = document.getElementById('filmThumbs');
    if(!stage || !thumbs || !window.SMN_FILMS) return;
    var F = window.SMN_FILMS;
    var img = stage.querySelector('img');
    var lbl = stage.querySelector('.lbl');
    function set(i){
      var f=F[i];
      if(img){ img.src=f.still; img.alt=f.name+' brand film still'; }
      if(lbl){ lbl.textContent=f.name+' \u2014 '+f.cat; }
      [].forEach.call(thumbs.children, function(t,k){ t.classList.toggle('on', k===i); });
      cur = i;
    }
    thumbs.addEventListener('click', function(e){
      var t=e.target.closest('.filmthumb'); if(!t) return;
      set(parseInt(t.getAttribute('data-f'),10));
    });
    /* Open the real player. The old handler here only raised a toast claiming the film
       played on the deployed site — it never did, on any environment. */
    var cur = 0;
    function playCurrent(opener){
      var f = F[cur];
      if(!f || !window.SMNFilm || !f.slug){
        toast('This film isn\u2019t available right now.');
        return;
      }
      window.SMNFilm.open(f.slug, {
        name: f.name, cat: f.cat, source: f.source || 'premiere', opener: opener
      });
    }
    var play = stage.querySelector('.play');
    if(play) play.addEventListener('click', function(){ playCurrent(play); });
    if(img){
      img.style.cursor='pointer';
      img.addEventListener('click', function(){ playCurrent(play||img); });
    }
    set(0);
  })();

  /* ---------- TOAST ---------- */
  var _t;
  function toast(msg){
    var el=document.getElementById('toast');
    if(!el){ el=document.createElement('div'); el.id='toast'; el.className='toast'; document.body.appendChild(el); }
    el.textContent=msg; el.classList.add('show');
    clearTimeout(_t); _t=setTimeout(function(){ el.classList.remove('show'); }, 2600);
  }
  window.SMN_toast = toast;

})();
