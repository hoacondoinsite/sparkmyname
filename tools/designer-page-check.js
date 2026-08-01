/* THE SPARK CERTIFIED DESIGNER PAGE (2026-07-26, Founder order)
   Of the four "next big project" items — AI Studio, Success Path, Certified Designer,
   Affiliate — checking first found that AI Studio and Success Path were already full-viewport
   and fully populated (my earlier claim that they "open small" was wrong), and Affiliate
   already has a left-nav entry ("Refer"). Only Certified Designer had no way in from the left
   menu; this is that one real gap, closed the same way Guide and Concierge were. */
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

function boot(withBrand) {
  const calls = [];
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    const m = String(e.message || e);
    if (!/Could not load|Not implemented|css/i.test(m)) errs.push(m);
  });
  const dom = new JSDOM(SRC, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/w.html', virtualConsole: vc,
    beforeParse(w) {
      w.fetch = function (u, o) { calls.push(String(u)); return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) }); };
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.matchMedia = w.matchMedia || (q => ({ matches: false, media: q, addListener() {}, addEventListener() {}, removeEventListener() {} }));
      w.addEventListener('error', e => errs.push(e.message));
    }
  });
  const w = dom.window;
  const NM = () => ({
    name: "Heartwood Creations", mono: 'H', dom: 'h.com', st: 'Available', tag: 't', heroUrl: 'https://x/h.png',
    logos: ['https://x/a.png'], why: ['a'], palettes: [{ name: 'P', note: 'n', cols: ['#111', '#222', '#333', '#444'] }],
    type: [{ name: 'S', note: 'x' }], voice: [{ n: 'W', d: 'p' }], taglines: ['t'], biosT: ['b'],
    aboutT: ['a'], linkedinT: ['l'], facebookT: ['f'], postsT: ['p']
  });
  if (withBrand) {
    w.IDEAS = [{ id: 'r1', cat: 'Cabinetry', said: 'cabinetry', ord: 9, fav: false, tier: 'bib', header: 'https://x/h.png',
      names: [0, 1, 2, 3, 4, 5].map(NM), palettes: NM().palettes, type: NM().type, voice: NM().voice,
      biosT: ['b'], aboutT: ['a'], linkedinT: ['l'], facebookT: ['f'], postsT: ['p'], why: ['a'], taglines: ['t'], date: 'Jul', ts: 9, emoji: 'H' }];
    w.current = 'r1';
  } else {
    w.IDEAS = []; w.current = null;
  }
  w.curName = 0; w.removed = {}; w.__smnPicked = withBrand ? 'r1' : null;
  try { w.paint(); } catch (e) { errs.push('paint: ' + e.message); }
  return { dom, win: w, doc: w.document, errs, calls };
}

W('IN THE LEFT BAR');
{
  const b = boot(true);
  const nav = b.doc.querySelector('[data-wsnav="designer"]');
  ok('the Designer item exists', !!nav);
  ok('it comes after Guide', b.doc.querySelectorAll('#wsnav [data-wsnav]')[2] === nav);
  ok('nothing throws on load', b.errs.length === 0, b.errs[0]);
  b.dom.window.close();
}

W('\nOPENING IT WITH A BRAND CHOSEN');
{
  const b = boot(true);
  b.doc.querySelector('[data-wsnav="designer"]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
  const ov = b.doc.getElementById('designerOv');
  ok('the page opens full viewport', ov.classList.contains('open'));
  const btn = b.doc.querySelector('#designerOv [data-olin]');
  ok('the real handoff button appears', !!btn);
  ok('it names the actual chosen brand', btn && /Heartwood Creations/.test(btn.textContent));
  ok('nothing throws', b.errs.length === 0, b.errs[0]);
  b.dom.window.close();
}

W('\nCONFIRMING SENDS THROUGH THE SAME REAL PATH THE CARD USES');
{
  const b = boot(true);
  b.doc.querySelector('[data-wsnav="designer"]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
  b.doc.querySelector('#designerOv [data-olin]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
  const confirm = b.doc.querySelector('[data-hook]');
  ok('the same confirmation dialog opens', !!confirm);
  confirm.dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
  ok('calls the real olin-handoff endpoint', b.calls.some(u => u.indexOf('olin-handoff') >= 0));
  ok('nothing throws', b.errs.length === 0, b.errs[0]);
  b.dom.window.close();
}

W('\nWHEN NO BRAND IS OPEN — HONEST, NOT BROKEN');
{
  const b = boot(false);
  b.win.openDesignerPage();
  const ov = b.doc.getElementById('designerOv');
  ok('the page still opens', ov.classList.contains('open'));
  ok('no fake button appears', !b.doc.querySelector('#designerOv [data-olin]'));
  ok('it says plainly what to do instead', /Open one of your brands first/.test(ov.textContent));
  ok('nothing throws', b.errs.length === 0, b.errs[0]);
  b.dom.window.close();
}

W('\nCLOSING');
{
  const b = boot(true);
  b.doc.querySelector('[data-wsnav="designer"]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
  b.doc.getElementById('designerOv').querySelector('[data-designerclose]').dispatchEvent(new b.win.MouseEvent('click', { bubbles: true }));
  ok('the X closes it', !b.doc.getElementById('designerOv').classList.contains('open'));
  b.dom.window.close();
}

W('\nTHE OTHER THREE "BIG PROJECT" ITEMS — CONFIRMED, NOT REBUILT');
{
  const b = boot(true);
  b.win.openAIStudio();
  ok('AI Studio was already full viewport', b.doc.getElementById('aiOv').classList.contains('open'));
  ok('  with all 8 tiles', b.doc.querySelectorAll('.ac-ai [data-ai]').length === 8,
     b.doc.querySelectorAll('.ac-ai [data-ai]').length);
  b.win.openSuccess();
  ok('Success Path was already full viewport and populated',
     b.doc.getElementById('sxOv').classList.contains('open') &&
     (b.doc.getElementById('sxOv').textContent || '').length > 500);
  ok('Affiliate already has a left-nav entry ("Refer")',
     [...b.doc.querySelectorAll('[data-wsnav]')].some(x => /refer/i.test(x.textContent)));
  b.dom.window.close();
}

W('');
W(fail === 0 ? ('DESIGNER PAGE CLEAN - ' + pass + ' checks') : (pass + ' passed, ' + fail + ' FAILED'));
process.exit(fail === 0 ? 0 : 1);
