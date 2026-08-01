'use strict';
// deliverable-enqueue — client request. Creates a smn_orders row and kicks the
// background runner. Founder-gated (this is the private sandbox endpoint). No add-ons.
const { dbSelect, dbInsert } = require('./os-db.js');
const BASE = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'Method Not Allowed' });
  try {
    const b = JSON.parse(event.body || '{}');
    const isFounder = !!b.founderToken && b.founderToken === process.env.SMN_FOUNDER_TOKEN;
    if (!isFounder) {
      var pl = b.founderToken ? String(b.founderToken).length : 0;
      var sl = process.env.SMN_FOUNDER_TOKEN ? String(process.env.SMN_FOUNDER_TOKEN).length : 0;
      return resp(403, { error: 'Token mismatch \u2014 page sent ' + pl + ' chars; server env ' + (sl ? (sl + ' chars') : 'NOT SET (function cannot see SMN_FOUNDER_TOKEN)') + '. (slicetest2026 = 13 chars)' });
    }
    if (!(b.widthIn > 0) || !(b.heightIn > 0)) return resp(400, { error: 'widthIn and heightIn (inches) required.' });

    // report_names has no slug column — fetch the report's brands and match by name.
    const rows = await dbSelect('report_names', 'report_id=eq.' + encodeURIComponent(b.reportId) + '&select=id,name,email,kit,position');
    const row = pickBrand(rows, b.nameSlug);
    if (!row) return resp(404, { error: 'Brand not found for report ' + b.reportId + ' (' + ((rows && rows.length) || 0) + ' brands there).' });

    const orderId = 'dlv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const ins = await dbInsert('smn_orders', {
      id: orderId, email: row.email || 'founder', report: b.reportId, brand: row.name,
      item: b.deliverableType, item_name: b.deliverableType + ' ' + b.widthIn + 'x' + b.heightIn + 'in',
      fields: { brief: b.brief, widthIn: b.widthIn, heightIn: b.heightIn, dpi: b.dpi || null, nameSlug: b.nameSlug },
      status: 'received'
    });
    if (!ins) return resp(500, { error: 'Could not create order: ' + (dbInsert.lastError || 'unknown') });

    // kick the background runner (fire-and-forget; the 24h sweep is the backstop)
    try { await fetch(BASE + '/.netlify/functions/deliverable-run-background', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) }); } catch (_) {}

    return resp(202, { orderId, status: 'received', promise: 'Ready in your Command Center within 24 hours.' });
  } catch (err) { console.error('deliverable-enqueue error:', err); return resp(500, { error: String(err.message || err) }); }
};
function slugify(x){ return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
function pickBrand(rows, nameSlug){ if(!Array.isArray(rows)||!rows.length) return null; if(nameSlug){ const hit=rows.find(r=>slugify(r.name)===nameSlug); if(hit) return hit; } return rows[0]; }
function resp(s, o) { return { statusCode: s, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
