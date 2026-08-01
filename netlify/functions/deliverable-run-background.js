'use strict';
// deliverable-run-background — generates the deliverable for one order via YOUR engine,
// stores via YOUR uploader, fills the order + delivered_at. Isolated from the foreman.
const { dbSelect, dbUpdate, dbInsert } = require('./os-db.js');
const engine = require('./studio-engine.js');
const storage = require('./sb-storage.js');

exports.handler = async (event) => {
  let orderId;
  try {
    const b = JSON.parse(event.body || '{}'); orderId = b.orderId;
    if (!orderId) return ok('no orderId');

    const orders = await dbSelect('smn_orders', 'id=eq.' + encodeURIComponent(orderId) + '&select=id,report,brand,item,fields,status&limit=1');
    const order = orders && orders[0];
    if (!order) return ok('order not found');
    if (order.status === 'delivered') return ok('already delivered');   // idempotent re-kick

    const f = order.fields || {};
    const rows = await dbSelect('report_names', 'report_id=eq.' + encodeURIComponent(order.report) + '&select=id,name,kit,position');
    const row = pickBrand(rows, f.nameSlug) || {}; const kit = row.kit || {};

    await storage.ensureBucket();
    const wIn = f.widthIn, hIn = f.heightIn;
    const prompt = buildPrompt(kit, f.brief || {}, order.item, wIn, hIn);
    const longest = Math.max(wIn, hIn);
    const img = await engine.generateImage(prompt, { imageSize: (longest >= 24 ? '4K' : '2K'), aspectRatio: aspectFor(wIn, hIn) });
    dbInsert('smn_receipts', { dept: 'design', model: (img && (img.model || img.engine)) || 'image', units: 1, ms: (img && img.ms) || 0 }).catch(() => {});

    if (!(img && img.ok && img.b64)) { await attention(orderId, order, f, 'image_gen_failed: ' + JSON.stringify(img).slice(0, 180)); return ok('gen failed -> olin'); }

    const slug = kit.slug || (row.name || order.brand || 'brand').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = slug + '_' + order.item + '_' + wIn + 'x' + hIn + 'in.png';
    const path = 'assets/' + order.report + '/' + f.nameSlug + '/' + fileName;
    const up = await storage.uploadPng(path, img.b64, img.mime || 'image/png');
    if (!(up && up.ok)) { await attention(orderId, order, f, 'upload_failed: ' + (up && up.error || '')); return ok('upload failed -> olin'); }

    const asset = { deliverableType: order.item, widthIn: wIn, heightIn: hIn, res: (img.res || ''), engine: img.engine, assetUrl: up.url, fileName,
      brandName: (row.name || order.brand || ''),
      logoUrl: ((kit.logoUrls && kit.logoUrls[0]) || ''),
      palette: ((kit.palettes && kit.palettes[0] && (kit.palettes[0].colors || kit.palettes[0].cols)) || []),
      tagline: ((kit.taglines && kit.taglines[0]) || ''),
      fulfillment: getFulfillment(order.item, up.url, fileName) };
    await dbUpdate('smn_orders', 'id=eq.' + orderId, { assets: [asset], status: 'delivered', delivered_at: new Date().toISOString() });
    // TODO: fire Resend (RESEND_API_KEY / RESEND_FROM) with the Command Center link + fileName.
    return ok('delivered ' + orderId);
  } catch (err) {
    console.error('deliverable-run error:', err);
    if (orderId) { try { await dbUpdate('smn_orders', 'id=eq.' + orderId, { status: 'attention' }); } catch (_) {} }
    return ok('error: ' + String(err.message || err));
  }
};

async function attention(orderId, order, f, reason) {
  try { await dbUpdate('smn_orders', 'id=eq.' + orderId, { status: 'attention' }); } catch (_) {}
  try {
    const brief = f.brief || {};
    await dbInsert('olin_handoffs', { id: 'oh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), report_id: order.report || '', name_position: 0, business: order.item || 'artwork', brand_name: order.brand || '', idea: (order.item + ' ' + f.widthIn + 'x' + f.heightIn + 'in — ' + (brief.offer || '')), client_email: '', status: 'new', note: ('deliverable engine: ' + String(reason).slice(0, 200)) });
  } catch (_) {}
}
function buildPrompt(kit, brief, type, wIn, hIn) {
  const pal = (kit.palettes && kit.palettes[0] && (kit.palettes[0].colors || kit.palettes[0].cols) || []).join(', ');
  const FLAT = ['banner','flyer','sign','signage','menu','businesscard','business-card'].indexOf(type) > -1;
  // TEXTLESS always: the model paints the BACKGROUND only. Brand name, logo, price, dates and
  // offer are composited on top afterward (exact, print-correct). Models mangle text/logos.
  const banText = 'ABSOLUTELY NO text, words, letters, numbers, logos, watermarks, signage, labels, captions or dimension markings anywhere. Pure background art only.';
  if (FLAT) {
    // A flat, print-ready GRAPHIC FIELD — never a photo of a physical object in a room.
    return [
      'FLAT 2D graphic-design background field, edge-to-edge, portrait/landscape as needed, for a professional ' + type + '.',
      'This is a designed flat art file, NOT a photograph of an object. NO brick walls, NO fabric/vinyl banner objects, NO grommets, NO ropes, NO poles, NO hanging hardware, NO room or environment, NO 3D mockups, NO shadows of a physical sign.',
      'Clean rich background: a tasteful solid or soft-gradient brand color field, or a subtle abstract texture/pattern, with generous EMPTY negative space where branding will be placed.',
      pal ? ('Use the brand palette: ' + pal + '.') : 'Warm, premium, appetizing palette.',
      banText
    ].join(' ');
  }
  // Photographic deliverables (poster, social): a clean cinematic hero photo, calm lower area.
  return [
    'Commercial-grade, photorealistic hero background photo for a ' + (kit.name || 'premium') + '-style business, portrait.',
    'Subject/mood: ' + (brief.offer || brief.details || 'the hero product') + '. Cinematic lighting, real textures, one strong focal point in the upper two-thirds; keep the lower third calmer for branding.',
    pal ? ('Palette to harmonize with: ' + pal + '.') : '',
    banText
  ].filter(Boolean).join(' ');
}
function aspectFor(wIn, hIn) { const r = wIn / hIn; if (r <= 0.6) return '9:16'; if (r < 0.9) return '3:4'; if (r > 1.6) return '16:9'; if (r > 1.1) return '4:3'; return '1:1'; }
function getFulfillment(type, assetUrl, fileName) {
  const AFF = process.env.SMN_AFFILIATE_TAG || ''; const tag = (u) => AFF ? (u + (u.indexOf('?') > -1 ? '&' : '?') + AFF) : u;
  if (['poster', 'banner', 'flyer', 'menu', 'signage'].indexOf(type) > -1) return { kind: 'print_partner', file: fileName, note: 'Download, then upload to any of these to print & pick up. (Partner links \u2014 we may earn a commission; we don\u2019t print or ship it.)', options: [{ name: 'Staples', url: tag('https://www.staples.com/services/printing/') }, { name: 'Vistaprint', url: tag('https://www.vistaprint.com/signs-posters/posters') }, { name: 'UPrinting', url: tag('https://www.uprinting.com/poster-printing.html') }, { name: 'FedEx Office', url: tag('https://www.fedex.com/en-us/printing.html') }] };
  if (['tshirt', 'mug', 'merch', 'hat', 'tote'].indexOf(type) > -1) { const store = process.env.PRINTIFY_STORE_URL || 'https://your-printify-store.example'; return { kind: 'printify', file: fileName, note: 'Order on merch through your Printify store.', options: [{ name: 'Order via Printify', url: store + '?image=' + encodeURIComponent(assetUrl) }] }; }
  return { kind: 'digital', file: fileName, note: 'Ready to post or email as-is.', options: [] };
}
function slugify(x){ return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function pickBrand(rows, nameSlug){ if(!Array.isArray(rows)||!rows.length) return null; if(nameSlug){ const hit=rows.find(function(r){return slugify(r.name)===nameSlug;}); if(hit) return hit; } return rows[0]; }
function ok(msg) { return { statusCode: 200, body: JSON.stringify({ ok: true, msg }) }; }
