/* THE CUSTOMER GUIDE (2026-07-26, Founder order)
   Full screen, plain, large white text — a first-time customer walkthrough, separate from
   Olin's own 20-step founder-tools tour, which is bespoke to his command center and not
   something to port. Six short steps, in the left bar between Brands and Tools. */
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const W = (m) => fs.writeSync(1, m + '\n');
const ROOT = path.join(__dirname, '..');
function source() {
  let s = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8');
  return s.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g, (m, r) => {
    try { return '<scr' + 'ipt>' + fs.readFileSync(path.join(ROOT, r), 'utf8') + '</scr' + 'ipt>'; }
    catch (e) { return m; }
  });
}
const SRC = source();
let pass = 0, fail = 0;
const ok = (n, c, x) => {
  if (c === true) { pass++; W('  PASS  ' + n); }
  else { fail++; W('  FAIL  ' + n + (x !== undefined ? ('  -> ' + String(x).slice(0, 90)) : '')); }
};

function boot() {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    const m = String(e.message || e);
    if (!/Could not load|Not implemented|css/i.test(m)) errs.push(m);
  });
  const dom = new JSDOM(SRC, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/w.html', virtualConsole: vc,
    beforeParse(w) {
      w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.matchMedia = w.matchMedia || (q => ({ matches: false, media: q, addListener() {}, addEventListener() {}, removeEventListener() {} }));
      w.addEventListener('error', e => errs.push(e.message));
    }
  });
  const w = dom.window;
  w.IDEAS = [{ id: 'r1', _stub: true, cat: 'C', said: 'c', ord: 1, fav: false, header: '',
    names: [], palettes: [], type: [], voice: [], aboutT: [], biosT: [], linkedinT: [],
    facebookT: [], postsT: [], why: [], taglines: [], date: 'J', ts: 1, emoji: 'x' }];
  w.current = 'r1'; w.curName = 0; w.removed = {}; w.__smnPicked = null;
  try { w.paint(); } catch (e) { errs.push('paint: ' + e.message); }
  return { dom, win: w, doc: w.document, errs };
}
const wait = ms => new Promise(r => setTimeout(r, ms));

W('IN THE LEFT BAR');
{
  const b = boot();
  const nav = b.doc.querySelector('[data-wsnav="guide"]');
  ok('the Guide item exists', !!nav);
  ok('it sits between Brands and Tools',
     b.doc.querySelectorAll('#wsnav [data-wsnav]')[1] === nav);
  ok('nothing throws on load', b.errs.length === 0, b.errs[0]);
  b.dom.window.close();
}

(async () => {
  W('\nOPENING IT');
  {
    const b = boot();
    const nav = b.doc.querySelector('[data-wsnav="guide"]');
    nav.dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    const ov = b.doc.getElementById('guideOv');
    ok('the panel opens', ov.classList.contains('open'));
    ok('starts on step 1 of 6', b.doc.getElementById('guideCount').textContent === '1 of 6',
       b.doc.getElementById('guideCount').textContent);
    ok('Previous is disabled on step 1', b.doc.getElementById('guidePrev').disabled === true);
    const h1 = b.doc.querySelector('.guide-body h1');
    ok('has a real heading, not empty', !!h1 && h1.textContent.length > 3);
    ok('nothing throws', b.errs.length === 0, b.errs[0]);
    b.dom.window.close();
  }

  W('\nWALKING THROUGH IT');
  {
    const b = boot();
    b.doc.querySelector('[data-wsnav="guide"]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    const next = b.doc.getElementById('guideNext');
    next.dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    ok('Next advances to step 2', b.doc.getElementById('guideCount').textContent === '2 of 6',
       b.doc.getElementById('guideCount').textContent);
    ok('Previous is enabled once past step 1', b.doc.getElementById('guidePrev').disabled === false);
    for (let i = 0; i < 4; i++) next.dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    ok('reaches the final step', b.doc.getElementById('guideCount').textContent === '6 of 6',
       b.doc.getElementById('guideCount').textContent);
    ok('the last step\'s Next becomes a checkmark, not another arrow',
       next.textContent === '\u2713');
    next.dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    ok('finishing the last step closes the guide',
       !b.doc.getElementById('guideOv').classList.contains('open'));
    ok('nothing throws throughout', b.errs.length === 0, b.errs[0]);
    b.dom.window.close();
  }

  W('\nJUMPING BY DOT');
  {
    const b = boot();
    b.doc.querySelector('[data-wsnav="guide"]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    const dot = b.doc.querySelector('[data-guidedot="3"]');
    ok('six dots are drawn', b.doc.querySelectorAll('.guide-dot').length === 6,
       b.doc.querySelectorAll('.guide-dot').length);
    dot.dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    ok('clicking a dot jumps straight there', b.doc.getElementById('guideCount').textContent === '4 of 6',
       b.doc.getElementById('guideCount').textContent);
    b.dom.window.close();
  }

  W('\nCLOSING, AND FOCUS');
  {
    const b = boot();
    const nav = b.doc.querySelector('[data-wsnav="guide"]');
    nav.focus();
    const before = b.doc.activeElement;
    nav.dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    await wait(60);
    ok('focus moves into the guide', b.doc.getElementById('guideOv').contains(b.doc.activeElement));
    b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    ok('Escape closes it', !b.doc.getElementById('guideOv').classList.contains('open'));
    ok('focus returns to the button that opened it', b.doc.activeElement === before);
    b.dom.window.close();
  }

  W('\nTHE X BUTTON WORKS TOO');
  {
    const b = boot();
    b.doc.querySelector('[data-wsnav="guide"]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    b.doc.getElementById('guideClose').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    ok('closes the guide', !b.doc.getElementById('guideOv').classList.contains('open'));
    b.dom.window.close();
  }

  W('\nARROW KEYS');
  {
    const b = boot();
    b.doc.querySelector('[data-wsnav="guide"]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
    b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    ok('ArrowRight advances', b.doc.getElementById('guideCount').textContent === '2 of 6',
       b.doc.getElementById('guideCount').textContent);
    b.doc.dispatchEvent(new b.win.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    ok('ArrowLeft goes back', b.doc.getElementById('guideCount').textContent === '1 of 6',
       b.doc.getElementById('guideCount').textContent);
    b.dom.window.close();
  }

  W('\nTHE STYLING IS WHAT WAS ASKED FOR');
  {
    const flat = SRC.replace(/\s+/g, '');
    ok('the panel is full screen', /\.guideov\{position:fixed;inset:0/.test(flat));
    ok('the background is solid, not a small overlay', /background:#0A1428;overflow-y:auto/.test(flat));
    ok('heading text is white', /\.guide-bodyh1\{[^}]*color:#FFFFFF/.test(flat));
    ok('body text is white', /\.guide-bodyp\{[^}]*color:#FFFFFF/.test(flat));
    ok('body text is large, not the default size', /font-size:1\.125rem/.test(flat));
    ok('every control is a real touch target', /min-height:44px/.test(flat));
    ok('the close button is reachable by keyboard', /\.guide-x:focus-visible/.test(flat));
  }

  W('');
  W(fail === 0 ? ('GUIDE CLEAN - ' + pass + ' checks') : (pass + ' passed, ' + fail + ' FAILED'));
  process.exit(fail === 0 ? 0 : 1);
})();
