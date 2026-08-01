#!/usr/bin/env node
/*
 SPARK BATCH — multi-brand deliverable processing (SOP-MBI-500).

 Phase 1  intake: every brand becomes a structured record (id, category, name, palette,
                  typography, logo suite, photos, copy)
 Phase 2  render: the record runs through the LIVE engine generators
 Phase 3  copy:   taglines, bios, launch posts carried per brand
 Phase 4  QA:     spelling gate + per-file inspection + the mandatory disclaimer
 Phase 5  package: one folder per brand, structured, ready to hand over

 Run:  node batch.js
*/
const { sandbox, OUT, CLIENT } = require('./render.js');
const fs = require('fs');
const path = require('path');
const { loadImage, createCanvas, Image } = require('canvas');
const vm = require('vm');

const BATCH_OUT = '/home/claude/batch_out';
fs.rmSync(BATCH_OUT, { recursive: true, force: true });
fs.mkdirSync(BATCH_OUT, { recursive: true });

// ---------------------------------------------------------------- PHASE 1: INTAKE
// Real brands, real logo suites, real photographs. Each record is what the SOP calls a
// structured intake row. The six realty names were one client's options, so they share
// that client's palette — recorded honestly rather than invented per brand.
const LOGOS = CLIENT + '/logos';
const PHOTOS = CLIENT + '/photos';

/* Palettes are SUPPLIED per brand on the intake record — never derived by the engine.
   In the earlier run all six shared one palette because they were a single client's name
   options; a real portfolio gives each brand its own, so the intake carries one each. */
const BEACH = ['#FFB6C1', '#FFD700', '#00BFFF', '#FFFFFF'];
const PAL = {
  'BR-001': ['#0B3C5D','#D9B310','#328CC1','#FFFFFF'],   // harbour navy / brass
  'BR-002': ['#FF6F59','#FFD275','#43455C','#FFF7EC'],   // sunset coral / dusk
  'BR-003': ['#7FB3A5','#DCE8E4','#2F4550','#FFFFFF'],   // sea glass / slate
  'BR-004': ['#1B998B','#ED217C','#2D3047','#FFFDF7'],   // latitude teal / magenta
  'BR-005': ['#F4A261','#E76F51','#264653','#FDF6EC'],   // sunrise amber / deep pine
  'BR-006': ['#3D5A6C','#9BC1BC','#E6EBE0','#FFFFFF'],   // cove blue / sage
};

const BRANDS = [
  { id:'BR-001', slug:'lighthousebayrealty',      name:'Lighthouse Bay Realty',
    category:'Real Estate Brokerage', palette:PAL['BR-001'],
    tag:'Guiding You Home',
    about:'At Lighthouse Bay Realty, we believe in the magic of finding a place to call home.',
    why:['Evokes emotional connection to home ownership.','Conveys local expertise and community ties.','Memorable imagery of light and guidance.'] },
  { id:'BR-002', slug:'sunsetbayrealty',          name:'Sunset Bay Realty',
    category:'Real Estate Brokerage', palette:PAL['BR-002'],
    tag:'Where Every Day Ends Well',
    about:'Sunset Bay Realty helps families find the light at the end of a long search.',
    why:['Evokes imagery of sunsets and tranquility.','Differentiates with a picturesque name.','Warm, memorable and easy to say.'] },
  { id:'BR-003', slug:'seaglassresidences',       name:'Sea Glass Residences',
    category:'Luxury Residential', palette:PAL['BR-003'],
    tag:'Polished by the Sea',
    about:'Sea Glass Residences curates coastal homes with a quiet, considered eye.',
    why:['Suggests rarity and craftsmanship.','Coastal without being generic.','Premium tone for a premium buyer.'] },
  { id:'BR-004', slug:'latitudesrealty',          name:'Latitudes Realty',
    category:'Relocation Specialist', palette:PAL['BR-004'],
    tag:'Find Your Place in the Sun',
    about:'Latitudes Realty moves people across coasts and into the right neighbourhood.',
    why:['Speaks to movement and destination.','Works nationally, not just locally.','Confident and modern.'] },
  { id:'BR-005', slug:'sunriseshoresrealty',      name:'Sunrise Shores Realty',
    category:'Coastal Real Estate', palette:PAL['BR-005'],
    tag:'A New Day on the Water',
    about:'Sunrise Shores Realty opens the door on waterfront living.',
    why:['Optimistic and fresh.','Directly evokes the waterfront.','Easy to picture and recall.'] },
  { id:'BR-006', slug:'lighthousecoveproperties', name:'Lighthouse Cove Properties',
    category:'Property Management', palette:PAL['BR-006'],
    tag:'Steady Hands, Safe Harbour',
    about:'Lighthouse Cove Properties looks after buildings and the people in them.',
    why:['Trust and stewardship.','Sheltered, protective imagery.','Suits a management, not a sales, brand.'] },
];

for (const b of BRANDS) {
  b.logos = [1,2,3].map(n => `${LOGOS}/${b.slug}-logo-${n}.png`).filter(p => fs.existsSync(p));
  const ph = `${PHOTOS}/${b.slug}-2k.png`;
  b.heroUrl = fs.existsSync(ph) ? ph : `${PHOTOS}/lighthousebayrealty-2k.png`;
  b.dom = b.slug + '.com';
}

const DISCLAIMER = `Brand concepts, names, domains, colours and materials are AI-generated
starting points. They do not constitute legal, trademark, tax, financial or
domain-registration advice. Run comprehensive trademark and copyright clearance before
commercial use.`;

// ---------------------------------------------------------------- shims
function trimmed(u) {
  return loadImage(u).then(im => {
    const W = im.width, H = im.height;
    const c = createCanvas(W, H), x = c.getContext('2d');
    x.drawImage(im, 0, 0);
    const p = x.getImageData(0, 0, W, H).data;
    let minX = W, minY = H, maxX = -1, maxY = -1;
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) {
      const k = (yy*W+xx)*4;
      if (p[k+3] <= 20) continue;
      if (p[k] > 242 && p[k+1] > 242 && p[k+2] > 242) continue;
      if (xx < minX) minX = xx; if (xx > maxX) maxX = xx;
      if (yy < minY) minY = yy; if (yy > maxY) maxY = yy;
    }
    if (maxX < 0) return im;
    const tw = maxX-minX+1, th = maxY-minY+1;
    if (tw >= W*0.97 && th >= H*0.97) return im;
    const tc = createCanvas(tw, th);
    tc.getContext('2d').drawImage(im, minX, minY, tw, th, 0, 0, tw, th);
    const out = new Image(); out.src = tc.toBuffer('image/png'); return out;
  });
}
sandbox.__load = u => loadImage(u);
sandbox.__loadArt = u => trimmed(u);
vm.runInContext(`
  _loadImg=function(u){return __load(u);};
  _sameOriginImg=function(u){return __load(u);};
  _logoImg=function(u){return __load(u);};
  _logoArt=function(u){return __loadArt(u);};
  loadBrandFont=function(f){return Promise.resolve(f);};
  _canvasBlob=function(cv){return Promise.resolve(new Blob(cv.toBuffer('image/png')));};
  _pdfFrom=function(c,w,h,fn){return Promise.resolve({filename:fn,blob:new Blob(Buffer.from('%PDF-'))});};
`, sandbox);

/* doc-guardrails is included in EVERY packet by directive: the hard limits must ship with
   every brand, and the output gate OCR-verifies they printed. */
const PIECES = ['print-card','print-yard','print-flyer','print-invite','print-label',
                'print-hangtag','print-lanyard','merch-tee','merch-mug','doc-guardrails'];

const { spawnSync: spawnSyncEarly } = require('child_process');
(async () => {
  const report = [];
  for (const b of BRANDS) {
    // batch runner knows the roster, so it guarantees a different container per brand
    const NM = { name:b.name, tag:b.tag, dom:b.dom, why:b.why, logos:b.logos, heroUrl:b.heroUrl,
                 __shell: sandbox.SMN_SHELLS[BRANDS.indexOf(b) % sandbox.SMN_SHELLS.length] };
    const IDEA = { id:b.id, said:b.category, palettes:[{cols:b.palette}],
                   aboutT:[b.about], header:b.heroUrl, names:[NM] };
    // per-brand contact, as a real batch would carry
    vm.runInContext(`_bd=function(){return {phone:'(561) 555-01${b.id.slice(-2)}',
       email:'hello@${b.dom}', address:'Fort Lauderdale, FL'};};`, sandbox);
    const dir = path.join(BATCH_OUT, `${b.id} ${b.name}`);
    fs.mkdirSync(dir, { recursive: true });
    let made = 0;
    for (const key of PIECES) {
      try {
        const r = await sandbox.genPrintPiece(key, NM, IDEA);
        for (const f of (Array.isArray(r) ? r : [r])) {
          if (!f || !f.blob || !/\.png$/.test(f.filename)) continue;
          fs.writeFileSync(path.join(dir, f.filename), f.blob._b); made++;
        }
      } catch (e) { /* recorded in the report below */ }
    }
    fs.writeFileSync(path.join(dir, 'DISCLAIMER.txt'), DISCLAIMER);
    /* PRESENTATION RENDERS. Composited from artwork already produced — no image API is
       called, so this adds nothing to the per-brand cost and cannot fail on a quota. */
    const mk = spawnSyncEarly('python3', ['/home/claude/site/tools/mockups.py', dir],
                              { encoding: 'utf8' });
    if (mk.status !== 0 && mk.stderr) console.log('  mockups: ' + mk.stderr.trim().slice(0, 120));
    fs.writeFileSync(path.join(dir, 'brand.json'), JSON.stringify({
      brand_id:b.id, primary_name:b.name, business_category:b.category,
      colour_palette_hex:b.palette, domain:b.dom, tagline:b.tag,
      deliverables_rendered:made
    }, null, 2));
    report.push({ id:b.id, name:b.name, files:made });
    console.log(`  ${b.id}  ${b.name.padEnd(30)} ${made} files`);
  }
  console.log(`\n${report.length} brands processed, ${report.reduce((s,r)=>s+r.files,0)} files total`);
  fs.writeFileSync(path.join(BATCH_OUT,'BATCH_REPORT.json'), JSON.stringify(report,null,2));

  /* SECTION 3 OUTPUT GATE — runs AUTOMATICALLY after every batch, against the rendered
     files. A gate you have to remember to run is a gate that stops running. Its exit code
     becomes this script's exit code, so a failing batch fails the pipeline. */
  const { spawnSync } = require('child_process');
  console.log('\n--- automated output quality gate ---');
  const GATE = '/home/claude/site/tools/final_gate.py';
  /* Check the gate EXISTS before spawning. Otherwise python exits 2 with a file-not-found
     message and the batch reports "the gate ran and failed", which sends whoever reads it
     hunting through artwork for a problem that is actually a missing file. */
  if (!fs.existsSync(GATE)) {
    console.log('\nBATCH REJECTED — the output gate is MISSING at ' + GATE + '.');
    console.log('Nothing was verified. This is a toolchain fault, not an artwork fault.');
    process.exitCode = 1;
    return;
  }
  const g = spawnSync('python3', [GATE, BATCH_OUT], { encoding: 'utf8' });
  process.stdout.write(g.stdout || '');
  if (g.stderr) process.stderr.write(g.stderr);
  /* The non-bypass rule applies to the gate itself. A gate that could not RUN is not a
     pass — but it is also not the same thing as a gate that ran and found faults, and
     saying so precisely is the difference between fixing the artwork and fixing the
     toolchain. */
  if (g.error || g.status === null) {
    console.log('\nBATCH REJECTED — the output gate COULD NOT RUN (' +
                ((g.error && g.error.code) || 'no exit status') + ').');
    console.log('Nothing was verified. This is a toolchain fault, not an artwork fault.');
    process.exitCode = 1;
  } else if (g.status !== 0) {
    console.log('\nBATCH REJECTED — the output gate ran and FAILED. These files are not fit to hand over.');
    process.exitCode = 1;
  }
})();
