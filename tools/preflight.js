#!/usr/bin/env node
/* PREFLIGHT — ONE COMMAND, RUNS EVERYTHING (2026-07-25).
 *
 *   npm install jsdom && node tools/preflight.js
 *
 * Every suite in tools/ plus the static gates, in one pass, with a hard exit code.
 * Built because the suites were being run by hand and one of them silently collapsed from
 * 824 handlers to 22 while still printing "CLEAN" — a QA layer that fails quietly is worse
 * than none. This asserts on COVERAGE as well as on pass/fail, so a suite that stops testing
 * anything is treated as a failure.
 */
'use strict';
/* workspace source = the page with its external core INLINED IN PLACE (2026-07-25).
   441KB now lives in js/workspace-core.js. Appending it to the end changes execution order,
   and letting jsdom fetch it makes loading asynchronous — the test then runs before the code
   exists. Substituting the tag for its contents reproduces the original page exactly. */
function workspaceSource(root){
  var fsx=require('fs'), px=require('path');
  var out = fsx.readFileSync(px.join(root,'workspace.html'),'utf8');
  return out.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g, function(m, rel){
    try{ return '<scr'+'ipt>' + fsx.readFileSync(px.join(root, rel),'utf8') + '</scr'+'ipt>'; }
    catch(e){ return m; }
  });
}

/* THE CORE MOVED OUT OF THE PAGE (2026-07-25). 441KB of JavaScript now lives in
   js/workspace-core.js so the browser can cache it. Any harness that reads inline <script>
   blocks would otherwise find almost nothing and pass while testing nothing — which is
   exactly what preflight caught the moment the file was split. */
function readWorkspaceScripts(src, root){
  const blocks=[...src.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m=>!/src=|json/.test(m[1])).map(m=>m[2]);
  const ext=[...src.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);
  const out=[];
  blocks.forEach(b=>out.push(b));
  ext.forEach(function(rel){
    try{ out.splice(1,0, require('fs').readFileSync(require('path').join(root, rel),'utf8')); }
    catch(e){}
  });
  return out;
}
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const W = (m) => process.stdout.write(m + '\n');

let failures = [], warnings = [], ran = 0;

/* Suites, with the MINIMUM coverage each must report. A suite returning fewer checks than
   this has stopped exercising something and is a failure, not a pass. */
  /* MINIMUMS LOWERED 2026-07-26, and the reason matters. The rail's three tool shortcuts and
     the header's three tool buttons were REMOVED by Founder order — each tool now has one
     route, the Tools menu on the brand card. Their assertions went with them, so four suites
     legitimately report fewer checks. tools-check.js (34) more than covers the difference.
     Lowering a minimum is otherwise exactly what giving up looks like; it is only honest when
     the thing being tested is genuinely gone. */
const SUITES = [
  ['forensic-check',    'forensic.js',            /(\d+) items/,     79],
  ['pages-forensic',    'pages-forensic.js',      /(\d+) pages/,     42],
  ['header-consistency','header-consistency.js',  /(\d+) checks/,   405],
  ['progress-check',    'progress-check.js',      /(\d+) checks/,    26],
  ['group1-check',      'group1-check.js',        /(\d+) checks/,    33],
  ['exit-check',        'exit-check.js',          /(\d+) checks/,    22],
  ['item-check',        'item-check.js',          /(\d+) ITEMS/,     34],
  /* wire-check prints TWO handler counts — registered, then exercised. Matching the first
     grabbed 'registered' and reported a false collapse. Match the summary line only. */
  ['wire-check',        'wire-check.js',          /(\d+) handlers exercised/, 800],
  ['lazy-check',        'lazy-check.js',          /(\d+) CHECKS/,    18],
  ['device-check',      'device-check.js',        /(\d+) checks/,    32],
  ['capsule-check',     'capsule-check.js',       /(\d+) checks/,    30],
  ['rail-check',        'rail-check.js',          /(\d+) checks/,    36],
  ['flyout-check',      'flyout-check.js',        /(\d+) checks/,    43],
  ['header-check',      'header-check.js',        /(\d+) checks/,    24],
  ['reveal-check',      'reveal-check.js',        /(\d+) checks/,    29],
  ['nav-check',         'nav-check.js',           /(\d+) CHECKS/,    14],
  ['dl-log-check',      'dl-log-check.js',        /(\d+) checks/,    15],
  ['sweep-check',       'sweep-check.js',         /(\d+) checks/,    23],
  ['mobile-check',      'mobile-check.js',        /(\d+) checks/,    47],
  ['fold-check',        'fold-check.js',          /(\d+) checks/,    22],
  ['phone-check',       'phone-check.js',         /(\d+) checks/,    39],
  ['spec-check',        'spec-check.js',          /(\d+) checks/,    13],
  ['tools-check',       'tools-check.js',         /(\d+) checks/,    34],
  ['landscape-check',   'landscape-check.js',     /(\d+) checks/,    18],
  ['container-check',   'container-check.js',     /(\d+) checks/,    16],
  ['prune-check',       'prune-check.js',         /(\d+) checks/,    21],
  ['email-check',       'email-check.js',         /checks passed : (\d+)/,  30],
  ['webhook-check',     'webhook-check.js',       /(\d+) checks/,    26],
  ['weight-check',      'weight-check.js',        /(\d+) checks/,     7],
  ['catalog-check',     'catalog-check.js',       /(\d+) checks/,    26],
  ['print-check',       'print-check.js',         /(\d+) checks/,    23],
  ['focus-check',       'focus-check.js',         /(\d+) checks/,    27],
  ['parked-check',      'parked-check.js',        /(\d+) checks/,    20],
  ['promise-check',     'promise-check.js',       /(\d+) checks/,    25],
  ['export-check',      'export-check.js',        /(\d+) checks/,    13],
  ['olin-handoff-check','olin-handoff-check.js',   /(\d+) checks/,    34],
  ['guide-check',       'guide-check.js',         /(\d+) checks/,    29],
  ['designer-page-check','designer-page-check.js', /(\d+) checks/,    19],
  ['scale-check',       'scale-check.js',         /(\d+) checks/,    29],
  ['rail-ux-check',     'rail-ux-check.js',       /(\d+) checks/,    35],
  ['empty-check',       'empty-check.js',         /(\d+) checks/,    33],
  ['test-judge',        'test-judge.js',          /(\d+) CHECKS/,    79],
  ['test-render-judged','test-render-judged.js',  /(\d+) CHECKS/,    39]
];

W('PREFLIGHT — SparkMyName');
W('');
W('SUITES');
SUITES.forEach(function ([name, file, re, min]) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) { failures.push(name + ': FILE MISSING'); W('  MISSING  ' + name); return; }
  ran++;
  let out = '', code = 0;
  try { out = execSync('node ' + JSON.stringify(p), { cwd: ROOT, timeout: 300000, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }); }
  catch (e) { code = e.status || 1; out = String((e.stdout||'') + (e.stderr||'')); }
  const last = out.trim().split('\n').slice(-1)[0] || '';
  const m = re.exec(out.replace(/\s+/g, ' '));
  const n = m ? parseInt(m[1], 10) : 0;
  if (code !== 0)            { failures.push(name + ': exit ' + code + ' — ' + last.slice(0,80)); W('  FAIL     ' + name + '  ' + last.slice(0,60)); }
  else if (n < min)          { failures.push(name + ': coverage collapsed to ' + n + ' (expected >= ' + min + ')'); W('  SHRANK   ' + name + '  ' + n + ' < ' + min + '  <-- suite stopped testing'); }
  else                       { W('  ok       ' + name.padEnd(20) + n); }
});

W('');
W('STATIC GATES');
function gate(label, fn) {
  ran++;
  try { const r = fn(); if (r === true) W('  ok       ' + label); else { failures.push(label + ': ' + r); W('  FAIL     ' + label + '  ' + r); } }
  catch (e) { failures.push(label + ': threw ' + e.message); W('  FAIL     ' + label + '  threw ' + e.message.slice(0,60)); }
}
const INTERNAL_PAGES = ['artdirector','vorrex','olin','shoot','qa-batch','quality-check',
                        'film-test','video-forge','james','video','command'];
const htmls = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

gate('every inline script parses', () => {
  let bad = [];
  htmls.forEach(f => {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const blocks = [...s.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/src=|json/.test(m[1]));
    blocks.forEach((m, i) => {
      const tmp = path.join(require('os').tmpdir(), 'pf' + i + '.js');
      fs.writeFileSync(tmp, m[2]);
      try { execSync('node --check ' + JSON.stringify(tmp), { stdio: 'ignore' }); }
      catch (e) { bad.push(f); }
    });
  });
  return bad.length ? [...new Set(bad)].join(', ') : true;
});

gate('every netlify function parses', () => {
  const dir = path.join(ROOT, 'netlify', 'functions');
  const bad = fs.readdirSync(dir).filter(f => f.endsWith('.js')).filter(f => {
    try { execSync('node --check ' + JSON.stringify(path.join(dir, f)), { stdio: 'ignore' }); return false; }
    catch (e) { return true; }
  });
  return bad.length ? bad.join(', ') : true;
});

gate('every called endpoint exists', () => {
  const called = new Set();
  htmls.forEach(f => { const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of s.matchAll(/\/\.netlify\/functions\/([a-zA-Z0-9_-]+)/g)) called.add(m[1]); });
  const missing = [...called].filter(c => !fs.existsSync(path.join(ROOT, 'netlify', 'functions', c + '.js')));
  return missing.length ? missing.join(', ') : true;
});

gate('no retired colours anywhere live', () => {
  const RET = ['#4F8EF7','#2563EB','#C4B784','#EBE9B9','#847754','#8E77FF','#FF6B9E','#14120E'];
  const skip = ['SPARK BACKUP','july19','sandbox','vault','tools','node_modules'];
  let hits = [];
  function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const full = path.join(d, e.name);
      if (skip.some(s => full.indexOf(s) >= 0)) return;
      if (e.isDirectory()) return walk(full);
      if (!/\.(html|js|toml)$/.test(e.name)) return;
      const s = fs.readFileSync(full, 'utf8');
      RET.forEach(c => { if (s.indexOf(c) >= 0) hits.push(path.basename(full) + ':' + c); });
    });
  }
  walk(ROOT);
  return hits.length ? hits.slice(0,4).join(', ') : true;
});

gate('no function defined twice at top level', () => {
  const s = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8');
  const blocks = [...s.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  let dup = [];
  blocks.forEach(b => {
    const seen = {};
    for (const m of b.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) {
      seen[m[1]] = (seen[m[1]] || 0) + 1;
      if (seen[m[1]] === 2) dup.push(m[1]);
    }
  });
  return dup.length ? dup.join(', ') : true;
});

gate('every page has one <h1>', () => {
  const INTERNAL = ['artdirector','vorrex','olin','shoot','qa-batch','quality-check','film-test','video-forge','james','video'];
  let bad = [];
  htmls.forEach(f => {
    if (INTERNAL.some(i => f.indexOf(i) === 0)) return;
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const n = (s.match(/<h1[\s>]/g) || []).length;
    if (n === 0) bad.push(f + ' (none)');
  });
  return bad.length ? bad.join(', ') : true;
});

gate('no control removes focus without restoring it', () => {
  const s = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8');
  const flat = s.replace(/\s+/g, '');
  const kills = [...s.matchAll(/([^{};\n]{0,70})\{[^}]*outline:\s*(?:none|0)\b[^}]*\}/g)]
    .map(m => m[1].trim().split('\n').pop());
  const bad = [...new Set(kills)].filter(k => {
    const base = k.replace(/:focus\b/g, '').replace(/,.*$/, '').trim().replace(/\s+/g, '');
    return base && flat.indexOf(base + ':focus-visible') < 0;
  });
  return bad.length ? bad.join(', ') : true;
});

gate('no page shows markup where text should be', () => {
  /* THE SAME BUG CLASS, ACROSS ALL 31 PAGES (2026-07-26).
     The workspace gate above catches this in the rendered brand list. This catches it in the
     static markup of every customer page — a broken quote in a template, an entity that was
     escaped twice, a value that arrived undefined.
     textContent includes the source of every script and style block, so the first version of
     this reported four pages and all four were JavaScript being read as prose. A reader sees
     neither, so both are removed before reading. */
  const { JSDOM, VirtualConsole } = require('jsdom');
  const LEAKS = [[/'">/, 'a broken attribute quote'], [/&quot;/, 'a raw HTML entity'],
                 [/onerror=/, 'an event handler in the text'], [/\bundefined\b/, 'the word undefined'],
                 [/\[object Object\]/, 'an object rendered as text'], [/\bNaN\b/, 'NaN']];
  let bad = [];
  htmls.filter(f => !INTERNAL_PAGES.some(i => f.indexOf(i) === 0)).forEach(f => {
    const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
    let doc;
    try { doc = new JSDOM(fs.readFileSync(path.join(ROOT, f), 'utf8'), { virtualConsole: vc }).window.document; }
    catch (e) { return; }
    if (!doc.body) return;
    const clone = doc.body.cloneNode(true);
    clone.querySelectorAll('script,style,template,noscript').forEach(el => el.remove());
    const text = (clone.textContent || '').replace(/\s+/g, ' ');
    LEAKS.forEach(([re, label]) => { if (re.test(text)) bad.push(f + ': ' + label); });
  });
  return bad.length ? bad.slice(0, 3).join(' | ') : true;
});

gate('no markup leaks into visible text', () => {
  /* THE THIRD QUOTE-ESCAPING BUG TODAY (2026-07-26).
     A brand row carried decoding="async" INSIDE its onerror attribute — real double quotes
     inside an attribute already delimited by double quotes. The browser closed the attribute
     there and rendered the remainder as text, so every row in the workspace showed a stray
     '"> above the brand name. It was live and visible and no test saw it, because every test
     asked whether elements existed rather than what they read.
     Earlier today the same class of fault appeared twice more: font stacks with double quotes
     inside a double-quoted style attribute, and a comment containing a literal script tag.
     This renders the row and reads it the way a person would. */
  const { JSDOM, VirtualConsole } = require('jsdom');
  let src = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8');
  src = src.replace(/<script[^>]*src="(js\/[^"]+)"[^>]*><\/script>/g, (m, r) => {
    try { return '<scr' + 'ipt>' + fs.readFileSync(path.join(ROOT, r), 'utf8') + '</scr' + 'ipt>'; }
    catch (e) { return m; }
  });
  const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
  const dom = new JSDOM(src, { runScripts: 'dangerously', pretendToBeVisual: true,
    url: 'https://x/w.html', virtualConsole: vc,
    beforeParse(w) {
      w.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.matchMedia = w.matchMedia || (q => ({ matches: false, media: q, addListener() {},
        addEventListener() {}, removeEventListener() {} }));
    } });
  const w = dom.window, d = w.document;
  const NM = n => ({ name: 'Name ' + n, mono: 'M' + n, dom: 'n.com', st: 'Available', tag: 't',
    heroUrl: 'https://x/h.png', logos: ['https://x/a.png'], why: ['a'],
    palettes: [{ name: 'P', note: 'n', cols: ['#111', '#222', '#333', '#444'] }],
    /* Field names taken from what the code actually reads, not guessed: voice cards read
       v.n and v.d, and every real brand carries a tier from tierFor(). A fixture that does not
       match the real shape makes this gate report "undefined" and cry wolf — which it did on
       its first run. */
    type: [{ name: 'S', note: 'x' }], voice: [{ n: 'Warm', d: 'Plain and human' }], taglines: ['t'],
    biosT: ['b'], aboutT: ['a'], linkedinT: ['l'], facebookT: ['f'], postsT: ['p'] });
  w.IDEAS = [
    { id: 'b1', cat: 'Cabinetry', said: 'Custom Home Cabinetry for Luxury Homes', ord: 9,
      fav: false, header: 'https://x/h.png', names: [0,1,2,3,4,5].map(NM),
      palettes: NM(0).palettes, type: NM(0).type, voice: NM(0).voice, biosT: ['b'],
      aboutT: ['a'], linkedinT: ['l'], facebookT: ['f'], postsT: ['p'], why: ['a'],
      taglines: ['t'], date: 'Jul 26', ts: 9, emoji: 'H', tier: 'bib' },
    { id: 'b2', _stub: true, cat: 'Glass', said: 'Custom Glass Blowing Company', ord: 8,
      fav: false, header: 'https://x/g.png', names: [], palettes: [], type: [], voice: [],
      aboutT: [], biosT: [], linkedinT: [], facebookT: [], postsT: [], why: [], taglines: [],
      date: 'Jul 25', ts: 8, emoji: 'G', tier: 'bib' }
  ];
  w.current = 'b1'; w.curName = 0; w.removed = {}; w.__smnPicked = 'b1';
  try { w.paint(); } catch (e) { return 'paint threw: ' + e.message; }

  /* Fragments that only appear when an attribute has broken out of its quotes. */
  const LEAKS = [/'">/, /">\s*'/, /&quot;/, /decoding="/, /onerror=/, /class=&/, /\+d\.emoji/,
                 /\+esc\(/, /undefined/, /\[object Object\]/, /NaN/];
  const zones = [['the brand rows', '#ilist'], ['the brand card', '#main'],
                 ['the rail', '.rail'], ['the flyout', '#brandpop']];
  let bad = [];
  zones.forEach(([label, sel]) => {
    const el = d.querySelector(sel);
    if (!el) return;
    const text = (el.textContent || '').replace(/\s+/g, ' ');
    LEAKS.forEach(re => { if (re.test(text)) bad.push(label + ' shows ' + re.source); });
  });
  try { dom.window.close(); } catch (e) {}
  return bad.length ? bad.slice(0, 3).join(' | ') : true;
});

gate('the trademark mark is on every brand surface', () => {
  /* MARK POLICY REVERSED BY FOUNDER ORDER (2026-07-26). The standing rule since 9 July was NO
     mark anywhere, re-add only on explicit order. This is that order.
     Four surfaces carry it: the header wordmark, the page title, the Open Graph tags, and the
     copyright line — plus the same four in the customer emails. NOT every mention: putting it
     inside legal sentences and AI prompts would be 1,123 instances and would read as broken.
     This checks the RENDERED wordmark, not its inner <b> — the workspace splits the name across
     elements, and checking the <b> alone reported a false miss. */
  const { JSDOM, VirtualConsole } = require('jsdom');
  let bad = [];
  htmls.filter(f => !INTERNAL_PAGES.some(i => f.indexOf(i) === 0)).forEach(f => {
    const vc = new VirtualConsole(); vc.on('jsdomError', () => {});
    let d;
    try { d = new JSDOM(fs.readFileSync(path.join(ROOT, f), 'utf8'), { virtualConsole: vc }).window.document; }
    catch (e) { return; }
    const mark = d.querySelector('.wm, .mark');
    if (mark && !/\u2122/.test(mark.textContent)) bad.push(f + ': wordmark');
    if (d.title && /SparkMyName/.test(d.title) && !/\u2122/.test(d.title)) bad.push(f + ': title');
    const body = d.body ? d.body.textContent : '';
    if (/\u00a9 2026 SparkMyName[^\u2122]/.test(body)) bad.push(f + ': copyright line');
    ['og:title', 'og:site_name'].forEach(k => {
      const m = d.querySelector('meta[property="' + k + '"]');
      if (m && /SparkMyName/.test(m.content) && !/\u2122/.test(m.content)) bad.push(f + ': ' + k);
    });
  });
  fs.readdirSync(path.join(ROOT, 'netlify', 'functions')).filter(f => f.endsWith('.js')).forEach(f => {
    const s2 = fs.readFileSync(path.join(ROOT, 'netlify', 'functions', f), 'utf8');
    if (/2026 SparkMyName(?!&trade;|\\u2122|\u2122)/.test(s2)) bad.push(f + ': copyright line');
  });
  return bad.length ? bad.slice(0, 4).join(' | ') : true;
});

gate('nothing claims to have sent what it did not send', () => {
  /* THREE BUTTONS LIED (fixed 2026-07-26, Founder order).
     The concierge, Founder's Pulse and the data-deletion request each told a customer their
     message had been sent, and none of them sent anything. support-request.js had existed
     since 5 July and nothing had ever called it.
     This checks that every "sent" reassurance sits downstream of a real call. A customer
     asking to have their data deleted has a legal right to be heard; a reassurance with
     nothing behind it is the worst kind of bug because it looks like success. */
  /* Comments stripped: the note explaining why "Live chat connects for real" was removed
     quotes the very line being searched for, and the first run of this gate failed on its own
     footnote. Third time today that has happened. */
  const raw = fs.readFileSync(path.join(ROOT, 'js', 'workspace-core.js'), 'utf8');
  const core = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  let bad = [];
  const claims = [...core.matchAll(/toast\('([^']*(?:has been sent|Sent straight|has gone to)[^']*)'\)/g)];
  claims.forEach(m => {
    const before = core.slice(Math.max(0, m.index - 1200), m.index);
    if (!/smnSupportSend|fetch\(/.test(before)) bad.push('unsent claim: ' + m[1].slice(0, 44));
  });
  const chat = [...core.matchAll(/pushChat\('agent','([^']*(?:gone to|follow up)[^']*)'\)/g)];
  chat.forEach(m => {
    const before = core.slice(Math.max(0, m.index - 900), m.index);
    if (!/smnSupportSend|fetch\(/.test(before)) bad.push('unsent chat reply: ' + m[1].slice(0, 40));
  });
  /* and the claims that were removed must stay removed */
  if (/Live chat connects for real/.test(core)) bad.push('the "connects for real" line is back');
  if (/connected to a live Spark agent/.test(core)) bad.push('the live-agent greeting is back');
  const page = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  if (/Live agent online/.test(page)) bad.push('the "Live agent online" claim is back');
  return bad.length ? bad.slice(0, 3).join(' | ') : true;
});

gate('every stylesheet parses', () => {
  /* THIS GATE DID NOT EXIST UNTIL 2026-07-26, and its absence cost 26 pages.
     A media query lost its closing brace during a site-wide edit, which swallowed every rule
     after it into a max-width:520px block — the header's globe and currency glyph went
     unstyled on any screen wider than a small phone. Every JavaScript block was being checked
     with node --check; nothing had ever parsed the CSS. A stylesheet that does not parse is a
     stylesheet the browser is guessing at. */
  const postcss = require('postcss');
  let bad = [];
  htmls.forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const blocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
    if (!blocks.length) return;
    try { postcss.parse(blocks.join('\n')); }
    catch (e) { bad.push(f + ': ' + String(e.message).slice(0, 50)); }
  });
  return bad.length ? bad.slice(0, 3).join(' | ') : true;
});

gate('no rule is orphaned inside a media query', () => {
  /* The same failure, caught from the other side: if a page's LAST media query holds an
     unusual number of rules, something after it has probably fallen in. */
  const postcss = require('postcss');
  let bad = [];
  htmls.forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const blocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
    if (!blocks.length) return;
    let tree; try { tree = postcss.parse(blocks.join('\n')); } catch (e) { return; }
    tree.walkAtRules('media', at => {
      let n = 0; at.walkRules(() => n++);
      if (n > 40) bad.push(f + ': a media query holds ' + n + ' rules');
    });
  });
  return bad.length ? bad.slice(0, 3).join(' | ') : true;
});

gate('the shared shell breathes on every page', () => {
  /* The site's own frame — header, panel, footer links — was declared at a desktop size and
     then corrected at a breakpoint, on 27 pages each. That is 195 selectors jumping at a
     handful of arbitrary widths. clamp does it once and moves continuously.
     This guards the seven shared selectors: if any goes back to a fixed value, or picks up a
     breakpoint override again, the frame starts jumping and this says so. */
  const postcss = require('postcss');
  const SHARED = ['.hd .in|padding','.hd .in|gap','.hd .rt|gap','.panel|padding',
                  '.hdsel select|padding','.split|gap','.ftband .lnks|gap'];
  /* CUSTOMER PAGES ONLY. The founder's own tools reuse some of these class names for
     different components — quality-check.html has a .panel that is an 18px card, nothing to
     do with the site's page frame. Converting it to satisfy this gate would mean changing
     unrelated code to keep a test quiet, which is how tests start dictating design. */
  const INTERNAL = ['artdirector','vorrex','olin','shoot','qa-batch','quality-check',
                    'film-test','video-forge','james','video','command'];
  let bad = [];
  htmls.filter(f => !INTERNAL.some(i => f.indexOf(i) === 0)).forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const blocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
    if (!blocks.length) return;
    let tree; try { tree = postcss.parse(blocks.join('\n')); } catch (e) { return; }
    const seen = {};
    ['padding','gap'].forEach(prop => tree.walkDecls(prop, d => {
      const sel = (d.parent.selector || '').trim();
      const key = sel + '|' + prop;
      if (SHARED.indexOf(key) < 0) return;
      const p = d.parent.parent;
      const inMedia = !!(p && p.type === 'atrule' && p.name === 'media');
      const rec = seen[key] || (seen[key] = { base: [], media: 0 });
      if (inMedia) rec.media++; else rec.base.push(d.value.trim());
    }));
    Object.keys(seen).forEach(k => {
      const r = seen[k];
      if (r.media > 0) bad.push(f + ' ' + k + ' has a breakpoint override again');
      else if (r.base.length && !/clamp\(/.test(r.base[0])) bad.push(f + ' ' + k + ' is fixed');
    });
  });
  return bad.length ? bad.slice(0, 3).join(' | ') : true;
});

gate('the page frame breathes fluidly', () => {
  /* .shell padding was declared five times and its gap six, jumping at every breakpoint.
     clamp does it once and moves continuously. This also guards against the mistake made
     while converting it: an override was removed from .brx before its fluid replacement was
     applied, which left the card at desktop padding on a phone for one commit. If a rule
     goes back to a fixed value, or gets a breakpoint override again, this fails. */
  const postcss = require('postcss');
  const src = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8');
  const css = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  let tree; try { tree = postcss.parse(css); } catch (e) { return 'stylesheet did not parse'; }
  const WANT = ['.shell|padding','.shell|gap','.brx|padding','.brx|gap','.bar-in|padding','.bar-in|gap'];
  const seen = {};
  ['padding','gap'].forEach(prop => tree.walkDecls(prop, d => {
    const sel = (d.parent.selector || '').trim();
    const key = sel + '|' + prop;
    if (WANT.indexOf(key) < 0) return;
    (seen[key] = seen[key] || []).push(d.value.trim());
  }));
  let bad = [];
  WANT.forEach(k => {
    const v = seen[k] || [];
    if (!v.length) { bad.push(k + ' is gone'); return; }
    if (v.length > 1) bad.push(k + ' declared ' + v.length + ' times');
    else if (!/clamp\(/.test(v[0])) bad.push(k + ' is fixed: ' + v[0].slice(0, 24));
  });
  return bad.length ? bad.slice(0, 3).join(', ') : true;
});

gate('content grids stay fluid', () => {
  /* Eight grids used to be declared twice — a fixed column count, then a media query undoing
     it. auto-fit does the same job at every width, including the ones nobody wrote a rule for.
     This stops a fixed count creeping back in and re-introducing the breakpoint it needs. */
  const postcss = require('postcss');
  const FLUID = ['.tools','.resgrid','.prods','.bullets','.logoshow','.logopick','.swrow','.ns-row'];
  let bad = [];
  const src = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8');
  const css = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n');
  let tree; try { tree = postcss.parse(css); } catch (e) { return 'stylesheet did not parse'; }
  const seen = {};
  tree.walkDecls('grid-template-columns', d => {
    const sel = (d.parent.selector || '').trim();
    if (FLUID.indexOf(sel) < 0) return;
    (seen[sel] = seen[sel] || []).push(d.value.trim());
  });
  FLUID.forEach(sel => {
    const v = seen[sel] || [];
    if (!v.length) { bad.push(sel + ' is gone'); return; }
    if (v.length > 1) bad.push(sel + ' declared ' + v.length + ' times again');
    if (!/auto-fit|auto-fill/.test(v[0])) bad.push(sel + ' is fixed: ' + v[0].slice(0, 30));
  });
  return bad.length ? bad.slice(0, 3).join(', ') : true;
});

gate('no customer page is unreachable', () => {
  /* affiliate.html — a revenue channel — and status.html were finished pages that nothing on
     the site linked to. Found 2026-07-25 by listing every page and subtracting every href.
     Exempt: pages entered from outside the site (Stripe success, delivery emails) and the
     founder-only tools. */
  const ENTRY = new Set(['index.html','404.html','result.html','my-brands.html']);
  const INTERNAL = ['artdirector','vorrex','olin','shoot','qa-batch','quality-check',
                    'film-test','video-forge','james','video','command'];
  const linked = new Set();
  htmls.forEach(f => {
    const s2 = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of s2.matchAll(/href="([a-zA-Z0-9_.-]+\.html)/g)) linked.add(m[1]);
    for (const m of s2.matchAll(/location\.href\s*=\s*'([a-zA-Z0-9_.-]+\.html)/g)) linked.add(m[1]);
  });
  const orphans = htmls.filter(f =>
    !linked.has(f) && !ENTRY.has(f) && !INTERNAL.some(i => f.indexOf(i) === 0));
  return orphans.length ? orphans.join(', ') : true;
});

gate('the external core is present and loaded', () => {
  /* 441KB moved to js/workspace-core.js on 2026-07-25. The moment it did, ELEVEN suites
     started passing while testing almost nothing, because they read inline <script> blocks.
     This gate makes that failure impossible to miss again. */
  const core = path.join(ROOT, 'js', 'workspace-core.js');
  if (!fs.existsSync(core)) return 'js/workspace-core.js is missing';
  const kb = fs.statSync(core).size / 1024;
  if (kb < 300) return 'core is only ' + Math.round(kb) + 'KB — expected ~440KB';
  const page = fs.readFileSync(path.join(ROOT, 'workspace.html'), 'utf8');
  if (!/<script[^>]*src="js\/workspace-core\.js"/.test(page)) return 'workspace.html does not load the core';
  if (page.indexOf('function mainHTML') >= 0) return 'core code is duplicated back into the page';
  return true;
});

gate('no fixed px font sizes (text must scale with the user)', () => {
  /* A px font-size ignores a customer's own text-size setting. 1rem is that setting, and it
     is 16px by default — so this costs nothing and gives back a whole class of readers.
     Added 2026-07-25 after converting 2,074 declarations; this stops them creeping back. */
  let bad = [];
  htmls.forEach(f => {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const n = (s.match(/font-size:\s*[0-9.]+px/g) || []).length;
    if (n) bad.push(f + ' (' + n + ')');
  });
  return bad.length ? bad.slice(0, 5).join(', ') : true;
});

gate('the iOS zoom floor is intact', () => {
  /* Safari force-zooms on focus when a field is under 16px. max(1rem,16px) grows with the
     user's setting and never falls below the threshold. */
  const bad = htmls.filter(f => {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!/pointer: coarse/.test(s)) return false;
    return !/font-size:\s*max\(1rem,\s*16px\)\s*!important/.test(s);
  });
  return bad.length ? bad.join(', ') : true;
});

gate('no page blocks pinch zoom', () => {
  const bad = htmls.filter(f => /user-scalable=no|maximum-scale=1(?![0-9.])/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  return bad.length ? bad.join(', ') : true;
});

gate('error boundary on every page', () => {
  const bad = htmls.filter(f => !/addEventListener\('error'/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  return bad.length ? bad.join(', ') : true;
});

/* jsdom is REQUIRED to run the suites above, so its presence cannot be a failure — an earlier
   version of this gate made preflight impossible to pass. It is a reminder instead. */
ran++;
if (fs.existsSync(path.join(ROOT, 'node_modules'))) {
  warnings.push('node_modules is present — run `rm -rf node_modules package*.json` before zipping the disc');
  W('  note     jsdom present (needed to test) — remove before zipping');
} else {
  W('  ok       no dev dependencies in the disc');
}

W('');
if (failures.length) {
  W('PREFLIGHT FAILED — ' + failures.length + ' problem(s) across ' + ran + ' checks');
  failures.forEach(f => W('   - ' + f));
  process.exit(1);
}
W('PREFLIGHT PASSED — ' + ran + ' suites and gates, no problems');
if (warnings.length) warnings.forEach(w => W('   note: ' + w));
process.exit(0);
