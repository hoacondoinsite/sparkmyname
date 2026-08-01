// SANDBOX PRINT LIBRARY — stores the lab's print-proof PDF permanently and records it on the deliverable.
// Dependency-free (fetch only). Founder-gated. Isolated to sandbox_* and the sandbox/ storage folder.
const SB_URL = process.env.SUPABASE_URL, SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SANDBOX_BUCKET || 'brand-headers';
const H = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };
exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: '{"error":"POST only"}' };
    if (!SB_URL || !SB_KEY) return { statusCode: 500, body: '{"error":"ENV GUARD: Supabase env missing"}' };
    const b = JSON.parse(event.body || '{}');
    if (!b.founderToken || b.founderToken !== process.env.SMN_FOUNDER_TOKEN) return { statusCode: 401, body: '{"error":"founder token required"}' };
    if (!b.orderId || !b.pdfBase64) return { statusCode: 400, body: '{"error":"orderId and pdfBase64 required"}' };
    const buf = Buffer.from(String(b.pdfBase64).replace(/^data:application\/pdf;base64,/, ''), 'base64');
    if (buf.length < 800 || buf.slice(0, 5).toString() !== '%PDF-') return { statusCode: 400, body: '{"error":"not a valid PDF"}' };
    if (buf.length > 12 * 1024 * 1024) return { statusCode: 413, body: '{"error":"PDF too large"}' };
    const path = `sandbox/${b.orderId}_print.pdf`;
    const up = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, { method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/pdf', 'x-upsert': 'true' }, body: buf });
    if (up.status >= 300) return { statusCode: 502, body: JSON.stringify({ error: 'storage ' + up.status }) };
    const url = `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`;
    const dvR = await fetch(`${SB_URL}/rest/v1/sandbox_deliverables?order_id=eq.${encodeURIComponent(b.orderId)}&select=deliverable_id,metadata&order=created_at.desc&limit=1`, { headers: H });
    const [dv] = dvR.ok ? await dvR.json() : [];
    if (dv) await fetch(`${SB_URL}/rest/v1/sandbox_deliverables?deliverable_id=eq.${dv.deliverable_id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ metadata: Object.assign({}, dv.metadata || {}, { print_pdf_url: url, print_pdf_bytes: buf.length }) }) });
    await fetch(`${SB_URL}/rest/v1/sandbox_audit_logs`, { method: 'POST', headers: H, body: JSON.stringify({ actor_id: 'founder', action: 'PRINT_PDF_STORED', target_table: 'sandbox_deliverables', record_id: dv ? dv.deliverable_id : null, metadata: { url, bytes: buf.length } }) });
    return { statusCode: 200, body: JSON.stringify({ ok: true, url }) };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: String(e.message || e).slice(0, 200) }) }; }
};
