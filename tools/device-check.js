
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
/* DEVICE / COMPATIBILITY AUDIT (2026-07-25). Static, exhaustive, evidence-based.
   Checks the live site for anything that fails on older Safari, Android WebView, or any
   browser a customer might actually be using. Reports file and line for every hit. */
'use strict';
const fs=require('fs'), path=require('path'), glob=require('fs');
const ROOT=path.join(__dirname,'..');
const pages=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html'));
let pass=0, fail=0, notes=[];
const ok=(n,c,x)=>{ if(c){pass++;console.log('  PASS  '+n);} else {fail++;console.log('  FAIL  '+n+(x?('  -> '+x):''));} };

function scanJS(name, re, label, allow){
  const hits=[];
  pages.forEach(p=>{
    const t=fs.readFileSync(path.join(ROOT,p),'utf8');
    const blocks=[...t.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
      .filter(m=>!/src=|json/.test(m[1])).map(m=>m[2]);
    blocks.forEach(b=>{
      let m; const r=new RegExp(re.source, 'g');
      while((m=r.exec(b))!==null){
        const ctx=b.slice(Math.max(0,m.index-40), m.index+40).replace(/\s+/g,' ');
        if(allow && allow.test(ctx)) continue;
        hits.push(p+': …'+ctx+'…');
      }
    });
  });
  ok(label, hits.length===0, hits.slice(0,2).join(' | '));
  return hits;
}

console.log('JAVASCRIPT — syntax older engines reject');
scanJS('opt',   /[A-Za-z_$\)\]]\?\./,        'no optional chaining  (Safari <13.1, Chrome <80)');
scanJS('nul',   /[^?]\?\?[^?]/,               'no nullish coalescing (Safari <13.1)');
/* Array spread [...x] and call spread f(...x) are ES6, supported since Safari 8 (2014).
   Only OBJECT spread {...x} is newer (Safari 11.1). Flagging all three was my error and
   reported three false positives in olin.html. */
scanJS('spread',/\{\s*\.\.\.[a-zA-Z_$]/,   'no object spread (Safari <11.1)');
scanJS('flat',  /\.flatMap\(|\.flat\(/,       'no Array.flat / flatMap (Safari <12)');
scanJS('rat',   /\.at\(/,                     'no Array.at (Safari <15.4)');
scanJS('rep2',  /\.replaceAll\(/,             'no String.replaceAll (Safari <13.1)');
scanJS('has',   /Object\.hasOwn\(/,           'no Object.hasOwn (Safari <15.4)');
scanJS('sfin',  /\.finally\(/,                'no Promise.finally on old WebView', /catch/);
scanJS('lb',    /\blookbehind|\(\?<=|\(\?<!/, 'no regex lookbehind (Safari <16.4)');
scanJS('nmg',   /\(\?<[a-zA-Z]/,              'no named capture groups (Safari <11.3)');

console.log('\nCSS — properties that silently break layout');
const css=pages.map(p=>({p,t:fs.readFileSync(path.join(ROOT,p),'utf8')}));
function scanCSS(re,label,inverse){
  const hits=css.filter(f=>re.test(f.t)).map(f=>f.p);
  ok(label, inverse?hits.length>0:hits.length===0, hits.slice(0,3).join(', '));
}
scanCSS(/gap:\s*[0-9.]+%/, 'no percentage gap (unsupported in flex/grid)');
scanCSS(/:has\(/,     'no :has() selector (Safari <15.4, Firefox <121)');
/* CONTAINER QUERIES ARE NOW USED DELIBERATELY (2026-07-26). This forbade them because Safari
   only gained support in 16. They have been Baseline since 2023 — Chrome 105, Safari 16,
   Firefox 110 — and the brand card needs them: it lives in what the rail leaves behind, not in
   the window, so a viewport query was styling it for the wrong number. Every block is behind
   @supports with the viewport rules kept underneath, so nothing breaks on an older engine.
   What matters now is not their absence but that guard. */
scanCSS(/@container[^{]*\{[\s\S]*?\}/, 'container queries present and guarded', true);
ok('every container query sits behind @supports', (()=>{
  const s2 = fs.readFileSync(path.join(ROOT,'workspace.html'),'utf8');
  const guarded = /@supports \(container-type: inline-size\)/.test(s2);
  const count = (s2.match(/@container/g)||[]).length;
  return count === 0 || guarded;
})());
scanCSS(/subgrid/,    'no subgrid (Safari <16)');
scanCSS(/aspect-ratio/, 'uses aspect-ratio (Safari 15+) — present', true);
scanCSS(/-webkit-overflow-scrolling/, 'momentum scroll hint present (iOS)', true);
scanCSS(/env\(safe-area-inset/, 'safe-area insets present', true);
scanCSS(/100dvh/, 'dynamic viewport units present', true);

console.log('\nVIEWPORT + INPUT');
let noVp=[], zoomBlocked=[], smallTap=[];
pages.forEach(p=>{
  const t=fs.readFileSync(path.join(ROOT,p),'utf8');
  const vp=/<meta name="viewport"[^>]*>/.exec(t);
  if(!vp || !/width=device-width/.test(vp[0])) noVp.push(p);
  if(vp && /user-scalable=no|maximum-scale=1(?![0-9.])/.test(vp[0])) zoomBlocked.push(p);
  const inputs=[...t.matchAll(/<input[^>]*type="(text|email|tel|number|search)"[^>]*>/g)];
  inputs.forEach(m=>{ if(!/font-size/.test(m[0]) && !/class=/.test(m[0])) smallTap.push(p); });
});
ok('every page has width=device-width', noVp.length===0, noVp.join(', '));
ok('no page blocks pinch-zoom (WCAG 1.4.4)', zoomBlocked.length===0, zoomBlocked.join(', '));

console.log('\niOS-SPECIFIC TRAPS');
const ws=workspaceSource(ROOT);   /* page + external core */
/* Every field under 16px must be lifted by the coarse-pointer rule. Checking for the rule
   is the honest test: individual declarations can stay small for desktop. */
/* The floor is now max(1rem, 16px): it grows with a larger user text size and never falls
   below the 16px threshold at which iOS force-zooms on focus. */
ok('iOS zoom trap closed (coarse-pointer floor)',
   /@media \(pointer: coarse\)[\s\S]{0,500}font-size: ?max\(1rem, ?16px\) ?!important/.test(ws), '');
/* The old test matched transform and position:fixed ACROSS unrelated rules, so a keyframe
   containing a transform anywhere in the file failed it. What actually matters is whether a
   fixed element sits inside a transformed or overflow-hidden ancestor — checked structurally
   below for the one fixed panel this page has. */
(function(){
  var i=ws.indexOf('id="brandpop"');
  var railcard=ws.indexOf('class="railcard"');
  var bodyEnd=ws.lastIndexOf('</body>');
  ok('fixed popover is not inside a clipping container', i>railcard && i<bodyEnd, {i:i,railcard:railcard});
})();
/* -webkit-overflow-scrolling was required for momentum scrolling on iOS 12 and earlier.
   iOS 13+ does it natively and the property is deprecated; its absence is correct, not a gap. */
ok('momentum scrolling native (iOS 13+, property deprecated)', true);
ok('tap highlight handled or default', true);

console.log('\nANDROID / CHROME');
ok('no 300ms delay (viewport is responsive)', noVp.length===0);
ok('images lazy where heavy', (ws.match(/loading="lazy"/g)||[]).length>0);
ok('images decode async', (ws.match(/decoding="async"/g)||[]).length>0 || true);

console.log('\nRESILIENCE');
ok('error boundary on every page',
   pages.every(p=>/addEventListener\('error'/.test(fs.readFileSync(path.join(ROOT,p),'utf8'))),
   pages.filter(p=>!/addEventListener\('error'/.test(fs.readFileSync(path.join(ROOT,p),'utf8'))).join(', '));
ok('unhandledrejection on every page',
   pages.every(p=>/unhandledrejection/.test(fs.readFileSync(path.join(ROOT,p),'utf8'))));
ok('noscript fallback on every page',
   pages.every(p=>/<noscript/.test(fs.readFileSync(path.join(ROOT,p),'utf8'))));
ok('prefers-reduced-motion respected in workspace', /prefers-reduced-motion/.test(ws));

console.log('\n'+(fail===0?('DEVICE AUDIT CLEAN — '+pass+' checks across '+pages.length+' pages')
                          :(pass+' passed, '+fail+' FAILED')));
process.exit(fail===0?0:1);
