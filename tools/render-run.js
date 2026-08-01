const { sandbox, OUT, CLIENT } = require('./render.js');
const fs = require('fs');
const { loadImage } = require('canvas');
const vm = require('vm');

// real client data
const NM = {
  name: 'Lighthouse Bay Realty',
  tag: 'Guiding You Home',
  dom: 'lighthousebayrealty.com',
  why: ['Evokes emotional connection to home ownership.',
        'Conveys local expertise and community ties.',
        'Memorable imagery of light and guidance.'],
  logos: [CLIENT+'/logos/lighthousebayrealty-logo-1.png',
          CLIENT+'/logos/lighthousebayrealty-logo-2.png',
          CLIENT+'/logos/lighthousebayrealty-logo-3.png'],
  heroUrl: CLIENT+'/photos/lighthousebayrealty-2k.png'
};
const IDEA = {
  id:'lbr', said:'a real estate brokerage',
  palettes:[{cols:['#FFB6C1','#FFD700','#00BFFF','#FFFFFF']}],
  aboutT:['At Lighthouse Bay Realty, we believe in the magic of finding a place to call home.'],
  header: CLIENT+'/photos/sunsetbayrealty-2k.png',
  names:[NM]
};

// shim the async loaders to read from disk
vm.runInContext(`
  _loadImg = function(u){ return __load(u); };
  _sameOriginImg = function(u){ return __load(u); };
  _logoImg = function(u){ return __load(u); };
  _logoArt = function(u){ return __loadArt(u); };
  loadBrandFont = function(f){ return Promise.resolve(f); };
  _canvasBlob = function(cv){ return Promise.resolve(new Blob(cv.toBuffer('image/png'))); };
  _pdfFrom = function(cvs,w,h,fn){ return Promise.resolve({filename:fn, blob:new Blob(Buffer.from('%PDF-stub'))}); };
  _bd = function(){ return {phone:'(561) 555-0142', email:'hello@lighthousebayrealty.com', address:'101 Bay Road, Fort Lauderdale FL'}; };
`, sandbox);
// faithful _logoArt: trim the blank padding exactly as the engine does
const { createCanvas } = require('canvas');
async function trimmed(u){
  const im = await loadImage(u.replace('file://',''));
  const W=im.width,H=im.height;
  const c=createCanvas(W,H), x=c.getContext('2d');
  x.drawImage(im,0,0);
  const p=x.getImageData(0,0,W,H).data;
  let minX=W,minY=H,maxX=-1,maxY=-1;
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){
    const k=(yy*W+xx)*4;
    if(p[k+3]<=20) continue;
    if(p[k]>242&&p[k+1]>242&&p[k+2]>242) continue;
    if(xx<minX)minX=xx; if(xx>maxX)maxX=xx;
    if(yy<minY)minY=yy; if(yy>maxY)maxY=yy;
  }
  if(maxX<0) return im;
  const tw=maxX-minX+1, th=maxY-minY+1;
  if(tw>=W*0.97&&th>=H*0.97) return im;
  const tc=createCanvas(tw,th);
  tc.getContext('2d').drawImage(im,minX,minY,tw,th,0,0,tw,th);
  const out=new (require('canvas').Image)();
  out.src=tc.toBuffer('image/png');
  return out;
}
sandbox.__load = (u) => loadImage(u.replace('file://',''));
sandbox.__loadArt = (u) => trimmed(u);

const PIECES = ['print-card','print-yard','print-flyer','print-poster','print-hangtag',
                'print-invite','print-shiplabel','print-env10','print-enva7','print-label',
                'print-comment','print-lanyard','print-placecard','print-insert',
                'print-reviewcard','print-qrposter','print-notepad','print-stickersheet',
                'print-vinyl','print-flag','print-tablecover','print-hours','print-shelf',
                'print-postcard','print-folder','print-doorhanger','print-magnet',
                'biz-invoice','biz-quote','biz-packing','deck-capabilities',
                'merch-tee','merch-hat','merch-mug','merch-sticker'];

(async () => {
  let ok=0, bad=0;
  for (const key of PIECES) {
    try {
      const files = await sandbox.genPrintPiece(key, NM, IDEA);
      const arr = Array.isArray(files) ? files : [files];
      for (const f of arr) {
        if (!f || !f.blob) continue;
        if (!/\.png$/.test(f.filename)) continue;
        fs.writeFileSync(OUT+'/'+f.filename, f.blob._b);
        console.log(`  RENDERED ${f.filename}  ${f.blob.size.toLocaleString()} bytes`);
        ok++;
      }
    } catch (e) {
      console.log(`  FAILED   ${key}: ${e.message}`);
      bad++;
    }
  }
  console.log(`\n${ok} real files rendered from the live engine, ${bad} failed`);
})();
