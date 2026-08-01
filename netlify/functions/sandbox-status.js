'use strict';
const db = require('./sandbox-db.js');
exports.handler = async (event) => {
  try {
    const qp=event.queryStringParameters||{};
    const cid=qp.campaignId||JSON.parse(event.body||'{}').campaignId;
    if(cid){  // CAMPAIGN VIEW: every member order + its latest proof
      const orders=await db.sel('sandbox_orders',`campaign_id=eq.${cid}&select=order_id,status,deliverable_type&order=created_at.asc`);
      if(!orders.length) return resp(404,{error:'campaign not found'});
      const out=[];
      for(const o of orders){
        const dv=await db.sel('sandbox_deliverables',`order_id=eq.${o.order_id}&select=storage_path,metadata&order=created_at.desc&limit=1`);
        out.push({ orderId:o.order_id, status:o.status, type:o.deliverable_type, proofUrl:dv[0]&&dv[0].storage_path, meta:dv[0]&&dv[0].metadata });
      }
      const done=out.filter(x=>x.status==='ready_for_client').length;
      return resp(200,{ campaignId:cid, total:out.length, ready:done, complete:done===out.length, members:out });
    }
    const id=qp.orderId||JSON.parse(event.body||'{}').orderId;
    if(!id) return resp(400,{error:'orderId required'});
    const [o]=await db.sel('sandbox_orders',`order_id=eq.${id}&select=status,deliverable_type`);
    if(!o) return resp(404,{error:'not found'});
    const dv=await db.sel('sandbox_deliverables',`order_id=eq.${id}&select=storage_path,metadata&order=created_at.desc&limit=1`);
    return resp(200,{ status:o.status, type:o.deliverable_type, proofUrl:dv[0]&&dv[0].storage_path, master:dv[0]&&dv[0].metadata&&dv[0].metadata.masterUrl, meta:dv[0]&&dv[0].metadata });
  } catch(e){ return resp(500,{error:String(e.message||e)}); }
};
function resp(s,o){ return {statusCode:s,headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}; }
