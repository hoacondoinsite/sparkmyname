'use strict';
const { dbSelect } = require('./os-db.js');
exports.handler = async (event) => {
  try {
    const id = (event.queryStringParameters && event.queryStringParameters.orderId) || (JSON.parse(event.body || '{}').orderId || '');
    if (!id) return resp(400, { error: 'orderId required' });
    const rows = await dbSelect('smn_orders', 'id=eq.' + encodeURIComponent(id) + '&select=status,assets,delivered_at&limit=1');
    const o = rows && rows[0];
    if (!o) return resp(404, { error: 'not found' });
    return resp(200, { status: o.status, assets: o.assets || [], delivered_at: o.delivered_at });
  } catch (err) { return resp(500, { error: String(err.message || err) }); }
};
function resp(s, o) { return { statusCode: s, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
