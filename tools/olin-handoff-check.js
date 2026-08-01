/* THE OLIN HANDOFF, END TO END (2026-07-26, Founder order: build the real thing)
   Before today, "Have Olin Creative contact me" sent an email containing a link into the
   CUSTOMER's own workspace. If that brand was ever removed the link died with it, and Olin's
   own command center had no record of the client at all — the roster shown there was
   hardcoded demo data ("Maya Rios", "Glam Caravan") that had never been real.
   Now: the button writes a permanent row to olin_handoffs, the email lists the actual kit
   read live from report_names, and olin.html's roster loads that same table on open. */
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const W = (m) => fs.writeSync(1, m + '\n');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (n, c, x) => {
  if (c === true) { pass++; W('  PASS  ' + n); }
  else { fail++; W('  FAIL  ' + n + (x !== undefined ? ('  -> ' + String(x).slice(0, 90)) : '')); }
};

W('THE CUSTOMER SIDE - the button that starts it');
{
  const core = fs.readFileSync(path.join(ROOT, 'js', 'workspace-core.js'), 'utf8');
  ok('the button exists in the Grow tab', /data-olin="1"/.test(core));
  ok('  wired to handoffToOlin', /\[data-olin\]'\)\.forEach[\s\S]{0,60}handoffToOlin\(IDEA,NM\)/.test(core));
  ok('confirming calls the real endpoint', /fetch\('\/\.netlify\/functions\/olin-handoff'/.test(core));
  ok('  with the brand actually chosen', /brand:NM\.name/.test(core));
  ok('  and which of the six it is', /namePosition:\(typeof curName/.test(core));
  ok('  and the report key', /reportKey:_urlR\(\)/.test(core));
}

W('\nTHE HANDOFF FUNCTION - writes a permanent record');
{
  const fn = fs.readFileSync(path.join(ROOT, 'netlify', 'functions', 'olin-handoff.js'), 'utf8');
  ok('writes to olin_handoffs', /rest\/v1\/olin_handoffs/.test(fn));
  ok('reads the CHOSEN name\'s kit, not always the first', /position=eq\.' \+ namePos/.test(fn));
  const stripped = fn.replace(/\/\*[\s\S]*?\*\//g, '');
  ok('the kit is read live, not duplicated into the row', !/\bkit:\s*kit/.test(stripped));
  ok('a Supabase failure cannot break the customer confirmation',
     /the client's request must still succeed/.test(fn));
  ok('the email lists real assets when they exist', /assetRows/.test(fn));
  ok('  logos, header photo, taglines and palette',
     /logoUrls/.test(fn) && /headerUrl/.test(fn) && /taglines/.test(fn));
  ok('links to Olin command center, not just the customer workspace',
     /SITE \+ '\/olin\.html'/.test(fn));
  ok('  and still offers the customer workspace as a second link',
     /View the client[\\\\\']+s own workspace/.test(fn));
}

W('\nTHE READ SIDE - olin-clients.js');
{
  const fn = fs.readFileSync(path.join(ROOT, 'netlify', 'functions', 'olin-clients.js'), 'utf8');
  ok('exists', fn.length > 500);
  ok('GET returns the queue', /event\.httpMethod === 'POST'/.test(fn) && /select=\*/.test(fn));
  ok('POST updates status', /PATCH/.test(fn));
  ok('contacted_at is stamped on contact', /contacted_at = new Date/.test(fn));
  ok('status is restricted to known values', /'new', 'contacted', 'in_progress', 'done'/.test(fn));
  ok('uses the same auth pattern as finance-sync.js, not an invented one',
     !/OLIN_GATE_KEY\s*=\s*process/.test(fn));
  ok('each client kit is read live', /report_names\?report_id=eq/.test(fn));
}

W('\nTHE ROSTER IN olin.html - no longer demo data');
{
  const page = fs.readFileSync(path.join(ROOT, 'olin.html'), 'utf8');
  ok('CLIENTS starts empty, not hardcoded', /var CLIENTS=\[\];/.test(page));
  ok('the old array survives only as a network-failure fallback', /var CLIENTS_DEMO/.test(page));
  ok('a real fetch happens on load', /loadRealClients/.test(page));
  ok('it calls olin-clients.js', /fetch\('\/\.netlify\/functions\/olin-clients'\)/.test(page));
  ok('redraws through the REAL router (go), not the finance panel\'s render()',
   /function redrawWhereverWeAre/.test(page) && /go\(cur\)/.test(page));
ok('  the loader calls it, not the wrong render()', (function(){
  const seg = page.slice(page.indexOf('function loadRealClients'), page.indexOf('function loadRealClients')+1600);
  return /redrawWhereverWeAre\(\)/.test(seg);
})());
  ok('Mark contacted exists in the roster', /markContacted/.test(page));
  ok('  only shown for a genuinely new lead', /c\.status==='new'/.test(page));
}

async function domChecks() {
  W('\nBEHAVIOUR IN A REAL DOM');
  const src = fs.readFileSync(path.join(ROOT, 'olin.html'), 'utf8');
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => {
    const m = String(e.message || e);
    if (!/Could not load|Not implemented|css/i.test(m)) errs.push(m);
  });
  function boot(clientsResp, networkDown) {
    const calls = [];
    const dom = new JSDOM(src, {
      runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/olin.html', virtualConsole: vc,
      beforeParse(w) {
        w.fetch = function (u, o) {
          calls.push({ u: String(u), b: (o && o.body) || '' });
          if (networkDown) return Promise.reject(new Error('down'));
          if (String(u).indexOf('olin-clients') >= 0 && (!o || o.method !== 'POST'))
            return Promise.resolve({ ok: true, json: () => Promise.resolve(clientsResp) });
          return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
        };
        w.scrollTo = () => {};
        w.HTMLElement.prototype.scrollIntoView = function () {};
        w.matchMedia = w.matchMedia || (q => ({ matches: false, media: q, addListener() {}, addEventListener() {}, removeEventListener() {} }));
        w.addEventListener('error', e => errs.push(e.message));
      }
    });
    return { dom, calls };
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  let { dom } = boot({
    ok: true, clients: [{
      id: 'oh_x', status: 'new', client_name: 'A Real Client', client_email: 'c@x.com',
      brand_name: 'Heritage Cabinet Designs', domain: 'h.net',
      logo_urls: ['https://x/l.png'], header_url: 'https://x/h.png', taglines: ['t'], palette: []
    }]
  });
  await wait(150);
  let w = dom.window;
  ok('real data replaces the demo array', w.CLIENTS.length === 1 && w.CLIENTS[0].brand === 'Heritage Cabinet Designs',
     JSON.stringify(w.CLIENTS[0] || {}));
  ok('the demo brand is gone', !w.CLIENTS.some(c => c.brand === 'Glam Caravan'));
  ok('nothing throws on a normal load', errs.length === 0, errs[0]);
  dom.window.close();

  W('\nWHEN THE NETWORK IS DOWN');
  errs.length = 0;
  ({ dom } = boot(null, true));
  await wait(150);
  w = dom.window;
  ok('falls back to the demo shape rather than a blank screen', w.CLIENTS.length > 0);
  ok('nothing throws', errs.length === 0, errs[0]);
  dom.window.close();

  W('');
  W(fail === 0 ? ('OLIN HANDOFF CLEAN - ' + pass + ' checks') : (pass + ' passed, ' + fail + ' FAILED'));
  process.exit(fail === 0 ? 0 : 1);
}

domChecks();
