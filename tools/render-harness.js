
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
#!/usr/bin/env node
/* Renders REAL deliverables from the REAL engine code. */
const fs = require('fs');
const { createCanvas, loadImage, registerFont, Image } = require('canvas');
const vm = require('vm');

const SITE = '/home/claude/site/workspace.html';
const CLIENT = '/home/claude/inspect5/lighthousebayrealty';
const OUT = '/home/claude/render_out';
fs.mkdirSync(OUT, { recursive: true });

const GF = '/usr/share/fonts/truetype/google-fonts/';
[['Lora-Variable.ttf','Lora',{}],['Lora-Italic-Variable.ttf','Lora',{style:'italic'}],
 ['Poppins-Regular.ttf','Poppins',{}],['Poppins-Bold.ttf','Poppins',{weight:'bold'}],
 ['Poppins-Medium.ttf','Poppins',{weight:'500'}],['Poppins-Light.ttf','Poppins',{weight:'300'}],
 ['Merriweather-Regular.ttf','Merriweather',{}],['Inter-Variable.ttf','Inter',{}]
].forEach(([f,fam,o])=>{ try{ registerFont(GF+f,Object.assign({family:fam},o)); }catch(e){} });

class B {
  constructor(buf,type){ this._b=buf; this.type=type||'image/png'; this.size=buf.length; }
  text(){ return Promise.resolve(this._b.toString('utf8')); }
  slice(a,b){ return new B(this._b.slice(a,b), this.type); }
}

const sandbox = {
  console, Buffer,
  Promise, Math, JSON, Date, Array, Object, String, Number, RegExp, Error, isNaN, parseInt, parseFloat,
  setTimeout, encodeURIComponent, decodeURIComponent,
  Blob: B,
  Image,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL(){} },
  document: {
    createElement(tag){
      if (tag === 'canvas') return createCanvas(1,1);
      return { style:{}, setAttribute(){}, appendChild(){}, classList:{add(){},remove(){}} };
    },
    getElementById(){ return null; },
    querySelectorAll(){ return []; },
    querySelector(){ return null; },
    fonts: { load: () => Promise.resolve(), ready: Promise.resolve() }
  },
  localStorage: { getItem: () => null, setItem(){} },
  fetch: () => Promise.reject(new Error('offline harness')),
  navigator: { userAgent: 'harness' }
};
sandbox.window = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

// ---- pull the generator source ----
const page = fs.readFileSync(SITE,'utf8');
const scripts = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);

// Load only the block that holds the generators (the biggest one), stripping its
// top-level bootstrapping so nothing touches the live DOM.
const main = scripts.sort((a,b)=>b.length-a.length)[0];

let loaded = 0, failed = 0;
// run it in pieces: function declarations only
const fnRe = /^(?:\s*)(function\s+[A-Za-z_$][\w$]*\s*\([\s\S]*?\n\})/gm;
let m;
while ((m = fnRe.exec(main))) {
  try { vm.runInContext(m[1], sandbox); loaded++; }
  catch (e) { failed++; }
}
// plus top-level const/var tables the generators read
for (const re of [/var SMN_FONTMAP=[\s\S]*?\n\];/, /var SMN_GFONTS=[\s\S]*?\n\];/,
                  /var QC_DIMS=\[[\s\S]*?\]\];/, /var SMN_READY = \{[\s\S]*?\n\};/,
                  /var SMN_NEEDS = \{[\s\S]*?\n\};/]) {
  const g = main.match(re);
  if (g) { try { vm.runInContext(g[0], sandbox); loaded++; } catch(e){ failed++; } }
}

console.log(`engine loaded: ${loaded} definitions (${failed} skipped)`);
const has = n => typeof sandbox[n] === 'function';
console.log('  genPrintPiece :', has('genPrintPiece'));
console.log('  printCanvas   :', has('printCanvas'));
console.log('  _fitText      :', has('_fitText'));
console.log('  _logoSmart    :', has('_logoSmart'));
console.log('  brandDisplayFont:', has('brandDisplayFont'));

module.exports = { sandbox, OUT, CLIENT, B };
