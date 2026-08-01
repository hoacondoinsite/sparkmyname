// File: netlify/functions/olin-clients.js | Date: 2026-07-26
// OLIN'S CLIENT QUEUE — the read side of the handoff. olin-handoff.js writes a row to
// olin_handoffs and emails him; this is what his own command center reads to show the list
// on screen, with the same live kit (logos, header photo, palette, taglines) rather than a
// stale copy — one source of truth, same as the email.
//
// GET  -> { ok, clients:[...] }                      list, newest first
// POST { id, status }  -> marks one handoff's status (new | contacted | in_progress | done)
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// No server-side key: matches finance-sync.js and the rest of olin.html, which gate in the
// browser via gate-login + sessionStorage rather than per-request.
'use strict';

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function resp(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
function esc(s) { return String(s == null ? '' : s); }

async function sb(path, opts) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, Object.assign({
    headers: Object.assign({ apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      (opts && opts.headers) || {})
  }, opts || {}));
  if (!r.ok) throw new Error('supabase ' + r.status);
  return r.json();
}

exports.handler = async (event) => {
  if (!SB_URL || !SB_KEY) return resp(200, { ok: false, error: 'not_configured' });

  /* NO SERVER-SIDE KEY HERE, MATCHING THE REST OF olin.html (2026-07-26).
     finance-sync.js and its siblings have no server-side gate at all — gate-login sets a
     sessionStorage flag in the browser and every call after that goes through untouched. An
     invented OLIN_GATE_KEY here would be a check nothing else on that page uses and nobody
     would ever set, which is worse than no check: it would look protected and silently 401
     forever. Matching the existing pattern rather than inventing a new one. */
  try {
    if (event.httpMethod === 'POST') {
      let body = {};
      try { body = JSON.parse(event.body || '{}'); } catch (e) {}
      const id = String(body.id || '').replace(/[^A-Za-z0-9_-]/g, '');
      const status = String(body.status || '');
      if (!id || ['new', 'contacted', 'in_progress', 'done'].indexOf(status) < 0) {
        return resp(400, { ok: false, error: 'bad_request' });
      }
      const patch = { status: status };
      if (status === 'contacted') patch.contacted_at = new Date().toISOString();
      await sb('olin_handoffs?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch)
      });
      return resp(200, { ok: true });
    }

    const rows = await sb('olin_handoffs?select=*&order=created_at.desc&limit=100');
    /* Pull each chosen name's kit live, same as the email does, so the panel never shows a
       stale snapshot from the day the client was first handed off. */
    const clients = await Promise.all((rows || []).map(async function (r) {
      let kit = null, derived = [];
      if (r.report_id) {
        try {
          const kj = await sb('report_names?report_id=eq.' + encodeURIComponent(r.report_id) +
            '&position=eq.' + (r.name_position || 0) + '&select=kit,name&limit=1');
          kit = (kj[0] && kj[0].kit) || null;
        } catch (e) { /* the row still shows without the kit rather than disappearing */ }
        /* THE SEVEN, DERIVED LIVE (2026-07-27, Founder order: every client gets the cinematic
           set, not just orders placed after the gallery write existed). Each name's kit already
           carries its own photo as headerUrl — that is where the art department put them. Read
           just that one JSON field across all six names (tiny rows, no full kits), dedupe, and
           the set exists for every order past and future with zero backfill. If kit.gallery is
           present it wins (it carries the proper header label); this is the fallback. */
        try {
          const gj = await sb('report_names?report_id=eq.' + encodeURIComponent(r.report_id) +
            '&select=position,name,headerUrl:kit->>headerUrl&order=position.asc&limit=12');
          const seen = {};
          (gj || []).forEach(function (g) {
            if (g && g.headerUrl && !seen[g.headerUrl]) {
              seen[g.headerUrl] = 1;
              derived.push({ url: g.headerUrl, label: g.name || ('Scene ' + ((g.position || 0) + 1)), kind: 'scene' });
            }
          });
        } catch (e) { /* derivation is best-effort; the stored gallery or plain header still shows */ }
      }
      return {
        id: r.id, status: r.status, created_at: r.created_at, contacted_at: r.contacted_at,
        client_name: esc(r.client_name), client_email: esc(r.client_email), client_phone: esc(r.client_phone),
        business: esc(r.business), idea: esc(r.idea), brand_name: esc(r.brand_name), domain: esc(r.domain),
        plan: esc(r.plan), report_id: esc(r.report_id),
        header_url: (kit && kit.headerUrl) || '',
        logo_urls: (kit && Array.isArray(kit.logoUrls)) ? kit.logoUrls : [],
        taglines: (kit && Array.isArray(kit.taglines)) ? kit.taglines : [],
        palette: (kit && kit.palette && Array.isArray(kit.palette.cols)) ? kit.palette.cols : [],
        /* THE WHOLE KIT (2026-07-27, Founder order: Olin needs it ALL to work and build the
           brand). Every field below is exactly what build-kit.js stores — nothing invented:
           strings arrays for taglines/bios/about/posts/why, {label,desc} for fonts/voice,
           {name,colors,note} for palettes, and kit.assets = every deliverable file actually
           generated so far (favicons, vectors, prints), each with its label and URL. */
        palettes: (kit && Array.isArray(kit.palettes)) ? kit.palettes : [],
        fonts: (kit && Array.isArray(kit.fonts)) ? kit.fonts : [],
        voice: (kit && Array.isArray(kit.voice)) ? kit.voice : [],
        bios: (kit && Array.isArray(kit.bios)) ? kit.bios : [],
        about: (kit && Array.isArray(kit.about)) ? kit.about : [],
        posts: (kit && Array.isArray(kit.posts)) ? kit.posts : [],
        why: (kit && Array.isArray(kit.whyItWorks)) ? kit.whyItWorks : [],
        /* THE SEVEN (kit.gallery): the order header plus each name's own cinematic photo,
           written onto every name's kit by the art department — {url,label,kind} each. */
        gallery: (kit && Array.isArray(kit.gallery) && kit.gallery.length)
          ? kit.gallery.filter(function (g) { return g && g.url; })
          : derived,
        assets: (kit && kit.assets && typeof kit.assets === 'object')
          ? Object.keys(kit.assets).map(function (k2) {
              var a = kit.assets[k2] || {};
              return { label: a.label || k2, url: a.url || '' };
            }).filter(function (a) { return a.url; })
          : []
      };
    }));

    return resp(200, { ok: true, clients: clients });
  } catch (e) {
    return resp(200, { ok: false, error: String((e && e.message) || e) });
  }
};
