'use strict';
const { dbSelect, dbInsert, dbUpdate } = require('./os-db.js');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'Method Not Allowed' });
  try {
    const b = JSON.parse(event.body || '{}');
    if (!b.founderToken || b.founderToken !== process.env.SMN_FOUNDER_TOKEN) return resp(403, { error: 'founder only' });
    if (!b.orderId) return resp(400, { error: 'orderId required' });
    const rows = await dbSelect('smn_orders', 'id=eq.' + encodeURIComponent(b.orderId) + '&select=report,brand,item,assets&limit=1');
    const o = (rows && rows[0]) || {}; const asset = (o.assets && o.assets[0]) || {};
    await dbInsert('olin_handoffs', { id: 'oh_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), report_id: o.report || '', name_position: 0, business: o.item || 'artwork', brand_name: o.brand || '', idea: (asset.fileName || ''), client_email: '', status: 'new', note: 'HARNESS REJECT: ' + String(b.why || '').slice(0, 250) + ' | asset:' + (asset.assetUrl || '') + ' | order:' + b.orderId });
    await dbUpdate('smn_orders', 'id=eq.' + b.orderId, { status: 'attention' });
    return resp(200, { ok: true });
  } catch (err) { return resp(500, { error: String(err.message || err) }); }
};
function resp(s, o) { return { statusCode: s, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
