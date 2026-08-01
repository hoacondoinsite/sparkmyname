'use strict';
// POST /lab intake -> sandbox_orders + first pipeline job. Idempotent. Founder-gated.
const db = require('./sandbox-db.js');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'POST only' });
  try {
    const b = JSON.parse(event.body || '{}');
    if (!b.founderToken || b.founderToken !== process.env.SMN_FOUNDER_TOKEN) return resp(403, { error: 'sandbox is founder-gated' });
    // CUSTOM-INDUSTRY TEST PATH (founder-gated): create a throwaway sandbox brand in ANY category
    if (b.newBrand && b.newBrand.industry) {
      const [seed] = await db.sel('sandbox_brands', 'select=user_id&limit=1');
      const nb = await db.ins('sandbox_brands', {
        user_id: seed && seed.user_id, brand_name: b.newBrand.name || ('Test ' + b.newBrand.industry),
        industry: b.newBrand.industry,
        color_palette: b.newBrand.palette || { primary:'#C9A227', accent:'#21D4FD', secondary:'#EAF2FF' },
        logos: {}, typography: {}, contact_info: {}, banned_visual_elements: [] });
      if (!nb) return resp(500, { error: 'test brand insert failed' });
      b.brandId = nb.brand_id;
    }
    const isCampaign = Array.isArray(b.assets) && b.assets.length;
    if (!b.brandId || !b.prompt || (!b.deliverableType && !isCampaign)) return resp(400, { error: 'brandId, prompt, and deliverableType (or assets[]) required' });

    // CAMPAIGN MODE: assets[] fans out N orders sharing one brief + one campaign_id
    if (isCampaign) {
      const camp = await db.ins('sandbox_campaigns', { brand_id: b.brandId, campaign_name: b.campaignName || 'Campaign' });
      if (!camp) return resp(500, { error: 'campaign insert failed' });
      const members = [];
      for (const a of b.assets.slice(0, 6)) {
        const akey = db.idemKey(b.brandId, (a.type||'poster') + 'x' + a.widthIn + 'x' + a.heightIn, b.prompt);
        const ex = await db.sel('sandbox_orders', `idempotency_key=eq.${akey}&select=order_id,status&limit=1`);
        if (ex[0]) { members.push({ orderId: ex[0].order_id, status: ex[0].status, deduped: true, widthIn: a.widthIn, heightIn: a.heightIn }); continue; }
        const o = await db.ins('sandbox_orders', { brand_id: b.brandId, campaign_id: camp.campaign_id, deliverable_type: a.type || 'poster', raw_client_prompt: b.prompt, entity_type: b.entityType || 'business', idempotency_key: akey, status: 'queued' });
        if (!o) return resp(500, { error: 'campaign order insert failed' });
        await db.ins('sandbox_pipeline_queue', { order_id: o.order_id, stage: '1_intake', payload: { widthIn: a.widthIn, heightIn: a.heightIn, brief: b.brief || {} } });
        members.push({ orderId: o.order_id, status: 'queued', widthIn: a.widthIn, heightIn: a.heightIn });
      }
      await db.audit('founder', 'CAMPAIGN_CREATED', 'sandbox_campaigns', camp.campaign_id, { pieces: members.length });
      return resp(202, { campaignId: camp.campaign_id, members });
    }

    const key = db.idemKey(b.brandId, b.deliverableType, b.prompt);
    const existing = await db.sel('sandbox_orders', `idempotency_key=eq.${key}&select=order_id,status&limit=1`);
    if (existing[0]) return resp(200, { orderId: existing[0].order_id, status: existing[0].status, deduped: true });

    const order = await db.ins('sandbox_orders', { brand_id: b.brandId, deliverable_type: b.deliverableType, raw_client_prompt: b.prompt, entity_type: b.entityType || 'business', target_market: b.targetMarket || null, idempotency_key: key, status: 'queued' });
    if (!order) return resp(500, { error: 'order insert failed: ' + (db.ins.lastError || '') });
    await db.ins('sandbox_pipeline_queue', { order_id: order.order_id, stage: '1_intake', payload: { widthIn: b.widthIn, heightIn: b.heightIn, brief: b.brief || {} } });
    await db.audit('founder', 'ORDER_CREATED', 'sandbox_orders', order.order_id, { type: b.deliverableType });
    return resp(202, { orderId: order.order_id, status: 'queued', brandId: order.brand_id });
  } catch (e) { return resp(500, { error: String(e.message || e) }); }
};
function resp(s, o) { return { statusCode: s, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }; }
