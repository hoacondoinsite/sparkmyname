// Verifies a Stripe Checkout session actually paid, then returns the plan + seed + email
// so the results page can safely deliver the goods. Dependency-free (raw fetch).
// Env: STRIPE_SECRET_KEY
const SECRET = process.env.STRIPE_SECRET_KEY;


/* BUILD PROGRESS (2026-07-25, Founder order).
   After paying, the customer was shown a static page saying "arrives within 15 minutes" and
   nothing ever changed on it. That is the highest-anxiety moment in the product and it had no
   feedback at all — people refresh, and wonder whether it worked.
   This adds progress to a response that ALREADY proves payment against Stripe, so the Stripe
   session id is the credential. No new endpoint, no new secret, and no way to look up someone
   else's order: the email comes from the verified session, never from the caller.
   Failure here is silent by design — progress is a courtesy, and it must never stop the page
   from confirming a payment that genuinely succeeded. */
async function buildProgress(email) {
  const SB_URL = process.env.SUPABASE_URL;
  const SB_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SB_URL || !SB_SERVICE || !email) return null;
  const H = { apikey: SB_SERVICE, Authorization: 'Bearer ' + SB_SERVICE };
  try {
    const rr = await fetch(SB_URL + '/rest/v1/reports?email=eq.' + encodeURIComponent(email) +
      '&select=id,created_at&order=created_at.desc&limit=1', { headers: H });
    if (!rr.ok) return null;
    const rows = await rr.json();
    if (!Array.isArray(rows) || !rows.length) return { stage: 'queued', names: 0, photos: 0, logos: 0 };
    const rid = rows[0].id;

    const nr = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(rid) +
      '&select=name,kit', { headers: H });
    if (!nr.ok) return { stage: 'queued', names: 0, photos: 0, logos: 0, r: rid };
    const names = await nr.json();
    if (!Array.isArray(names)) return { stage: 'queued', names: 0, photos: 0, logos: 0, r: rid };

    let photos = 0, logos = 0, words = 0;
    names.forEach(function (n) {
      const k = (n && n.kit) || {};
      if (k.headerUrl) photos++;
      if (Array.isArray(k.logoUrls) && k.logoUrls.length) logos++;
      if (Array.isArray(k.taglines) && k.taglines.length) words++;
    });
    const total = names.length;
    let stage = 'naming';
    if (total && words === total && photos === total && logos === total) stage = 'ready';
    else if (total && logos > 0) stage = 'logos';
    else if (total && photos > 0) stage = 'photos';
    else if (total && words > 0) stage = 'words';
    else if (total) stage = 'named';
    return { stage: stage, names: total, photos: photos, logos: logos, words: words, r: rid };
  } catch (e) { return null; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'method' });
  if (!SECRET) return resp(500, { ok: false, error: 'missing_stripe_key' });

  let id = '';
  try { id = (JSON.parse(event.body || '{}').session_id || '').slice(0, 200); } catch (e) {}
  if (!id || id.indexOf('cs_') !== 0) return resp(400, { ok: false, error: 'bad_session' });

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(id), {
      headers: { 'Authorization': 'Bearer ' + SECRET }
    });
    const s = await r.json();
    if (s.error) return resp(400, { ok: false, error: s.error.message });

    // A session counts as paid if the one-time payment cleared, OR the (subscription) session completed.
    const paid = s.payment_status === 'paid' ||
                 s.payment_status === 'no_payment_required' ||
                 s.status === 'complete';
    if (!paid) return resp(200, { ok: false, error: 'not_paid', status: s.status, payment_status: s.payment_status });

    const md = s.metadata || {};
    const email = (s.customer_details && s.customer_details.email) || md.email || s.customer_email || '';
    // Batch sessions store one business per metadata key (b0..bN); single sessions don't.
    const businesses = [];
    const cnt = parseInt(md.count, 10) || 0;
    if (cnt > 0) { for (let i = 0; i < cnt && i < 50; i++) { if (md['b' + i]) businesses.push(md['b' + i]); } }
    const progress = await buildProgress(email);
    return resp(200, { ok: true, kind: md.kind || '', plan: md.plan || '', seed: md.seed || '', email: email, count: cnt, businesses: businesses, progress: progress });
  } catch (e) {
    return resp(502, { ok: false, error: 'stripe_failed' });
  }
};

function resp(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
