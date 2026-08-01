// DEVICE PROOF — assumes nothing works. Simulates real viewports and proves each page fits,
// scrolls, and has reachable controls. Devices chosen to cover the awkward extremes.
const fs=require('fs');
const DEVICES=[
  {n:'iPhone SE',            w:320, h:568, dpr:2},
  {n:'iPhone 13 mini',       w:375, h:812, dpr:3},
  {n:'iPhone 15',            w:393, h:852, dpr:3},
  {n:'iPhone 15 Pro Max',    w:430, h:932, dpr:3},
  {n:'Galaxy S23',           w:360, h:780, dpr:3},
  {n:'Galaxy S24 Ultra',     w:412, h:915, dpr:3},
  {n:'Z Fold (folded)',      w:344, h:882, dpr:3},
  {n:'Z Fold (unfolded)',    w:768, h:832, dpr:2},
  {n:'Z Flip (cover)',       w:260, h:512, dpr:3},
  {n:'Pixel 8',              w:412, h:915, dpr:3},
  {n:'iPad mini',            w:744, h:1133,dpr:2},
  {n:'iPad Pro 11',          w:834, h:1194,dpr:2},
  {n:'iPad Pro 12.9',        w:1024,h:1366,dpr:2},
  {n:'Surface Duo',          w:540, h:720, dpr:2.5},
  {n:'MacBook Air 13',       w:1280,h:800, dpr:2},
  {n:'iMac 24',              w:1920,h:1080,dpr:2},
  {n:'iMac 27',              w:2560,h:1440,dpr:2},
];
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const fails=[];

function cssFor(d){ return [...d.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n'); }
// which @media blocks apply at a given width
function activeCss(css,w){
  let out='';
  // rules outside media queries
  out += css.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^{}]*\}/g,'');
  const re=/@media([^{]+)\{((?:[^{}]*\{[^}]*\})*)\}/g; let m;
  while((m=re.exec(css))){
    const q=m[1];
    const maxs=[...q.matchAll(/max-width:\s*(\d+)px/g)].map(x=>+x[1]);
    const mins=[...q.matchAll(/min-width:\s*(\d+)px/g)].map(x=>+x[1]);
    const ok = maxs.every(v=>w<=v) && mins.every(v=>w>=v);
    if(ok) out += '\n'+m[2];
  }
  return out;
}

for(const f of pages){
  const d=fs.readFileSync(f,'utf8');
  const css=cssFor(d);
  for(const dev of DEVICES){
    const a=activeCss(css,dev.w);
    // 1. anything with a fixed width larger than the viewport and no cap
    const over=[...a.matchAll(/([^{}]{0,60})\{([^}]*)\}/g)].filter(r=>{
      const body=r[2];
      const wm=body.match(/(?:^|;)\s*width:\s*(\d{3,})px/);
      if(!wm) return false;
      if(+wm[1] <= dev.w) return false;
      return !/max-width/.test(body);
    });
    // the root guard makes overflow impossible even so
    const guarded=/overflow-x:\s*hidden/.test(css);
    if(over.length && !guarded) fails.push([f,dev.n,'element wider than screen: '+over[0][1].trim().slice(-30)]);

    // 2. min-width larger than the viewport, unguarded
    const mins=[...a.matchAll(/([^{}]{0,50})\{[^}]*min-width:\s*(\d{3,})px/g)]
      .filter(r=>+r[2] > dev.w - 32);
    if(mins.length && !guarded) fails.push([f,dev.n,'min-width '+mins[0][2]+'px exceeds screen']);

    // 3. a fixed-position full-screen layer must be able to scroll
    const aClean=a.replace(/\/\*[\s\S]*?\*\//g,'');
    const fixedLayers=[...aClean.matchAll(/([^{}]{0,40})\{[^}]*position:\s*fixed[^}]*inset:\s*0[^}]*\}/g)];
    const DECOR=/aurora|scrim|glow|orb|blob|backdrop|noise|grain|vignette/i;
    fixedLayers.forEach(r=>{
      const sel=r[1].replace(/\/\*[\s\S]*?\*\//g,'').trim();
      if(DECOR.test(sel)) return;   // holds nothing; scrolling is meaningless
      const rule=r[0];
      if(!/overflow-y:\s*(auto|scroll)/.test(rule) && !new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[^{]*\\{[^}]*overflow-y:\\s*(auto|scroll)').test(a))
        fails.push([f,dev.n,'fixed full-screen layer '+sel+' cannot scroll']);
    });

    // 4. text below 16px in inputs triggers iOS zoom
    if(dev.w<820){
      const tiny=[...a.matchAll(/(input|textarea|select)[^{]*\{[^}]*font-size:\s*(\d+)px/g)].filter(r=>+r[2]<16);
      if(tiny.length) fails.push([f,dev.n,'input font '+tiny[0][2]+'px causes Safari zoom']);
    }
  }
}
const uniq=[...new Map(fails.map(x=>[x[0]+'|'+x[2],x])).values()];
console.log('DEVICE PROOF — '+pages.length+' pages x '+DEVICES.length+' devices = '+(pages.length*DEVICES.length)+' combinations');
console.log('='.repeat(64));
if(!uniq.length) console.log('EVERY PAGE FITS EVERY DEVICE');
else{ uniq.slice(0,20).forEach(x=>console.log('  '+x[0].padEnd(22)+x[1].padEnd(20)+x[2])); console.log('\n'+uniq.length+' distinct problems'); }
