// SparkMyName Sandbox — list real sandbox_brands for the ad-agent-test client picker.
// Founder-gated. Dependency-free. Reads sandbox_* ONLY. Returns enough profile for the
// page to show "the agent already knows this brand" (name, tagline, website, handle, colors).
'use strict';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return resp(405, { error: 'POST only' });
    let b = {};
    try { b = JSON.parse(event.body || '{}'); } catch (_) { return resp(400, { error: 'bad JSON' }); }
    if (!b.founderToken || b.founderToken !== process.env.SMN_FOUNDER_TOKEN) {
      return resp(403, { error: 'sandbox is founder-gated' });
    }
    if (!SUPABASE_URL || !SERVICE) return resp(500, { error: 'supabase env missing' });

    const url = SUPABASE_URL.replace(/\/$/, '') +
      '/rest/v1/sandbox_brands?select=brand_id,brand_name,industry,contact_info,color_palette,tone_manifesto&order=brand_name.asc';
    const r = await fetch(url, { headers: { apikey: SERVICE, Authorization: 'Bearer ' + SERVICE } });
    if (!r.ok) return resp(502, { error: 'supabase ' + r.status });
    const rows = await r.json();
    const brands = Array.isArray(rows) ? rows.map(x => {
      const ci = x.contact_info || {};
      return {
        brand_id: x.brand_id, brand_name: x.brand_name, industry: x.industry || '',
        tagline: ci.tagline || '', website: ci.website || '', handle: ci.handle || '',
        tone: x.tone_manifesto || '', palette: x.color_palette || {}
      };
    }) : [];
    return resp(200, { brands });
  } catch (e) { return resp(500, { error: String(e.message || e) }); }
};

function resp(s, o) {
  return { statusCode: s, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) };
}
