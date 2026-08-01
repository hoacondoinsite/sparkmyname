// Stripe webhook: verifies signature, records each purchase as an entitlement in Supabase.
// Dependency-free (raw fetch + node crypto).
// Env: STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const crypto = require('crypto');
const WHSEC = process.env.STRIPE_WEBHOOK_SECRET;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE = process.env.STRIPE_SECRET_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'method' };
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const payload = event.body || '';
  if (!verify(payload, sig, WHSEC)) return { statusCode: 400, body: 'bad signature' };

  let evt;
  try { evt = JSON.parse(payload); } catch (e) { return { statusCode: 400, body: 'bad json' }; }
  const obj = (evt.data && evt.data.object) || {};
  const type = evt.type;

  /* PROCESS EACH EVENT ONCE (2026-07-26).
     Stripe retries on any non-2xx and occasionally delivers the same event twice on its own.
     The expensive path was already safe — deliver-background claims the build, and emailed_at
     guarantees one delivery email. What was NOT protected: the entitlement insert is a plain
     POST with no conflict handling, so every retry added a row (1,010 rows for 14 real grants),
     and the confirmation email fired again, so the customer was told twice that their order had
     been received.
     claimOnce is the same mechanism the build already trusts, so this adds no new machinery.
     If the claim cannot be reached the event is processed anyway: losing a paid order is a far
     worse failure than granting an entitlement twice. */
  if (evt && evt.id) {
    try {
      const _seen = await require('./sb-storage.js')
        .claimOnce('idem/stripe-' + String(evt.id).replace(/[^A-Za-z0-9_-]/g, '') + '.txt',
                   type + ' @ ' + new Date().toISOString());
      if (_seen && _seen.claimed === false) {
        console.log('webhook: event ' + evt.id + ' already handled — nothing repeated');
        return { statusCode: 200, body: 'duplicate' };
      }
    } catch (e) {
      console.warn('webhook: idempotency claim unavailable, processing anyway', e && e.message);
    }
  }
  if (!SB_URL || !SB_KEY) { console.error('missing_supabase_env'); return { statusCode: 200, body: 'ok' }; }

  try {
    if (type === 'checkout.session.completed') {
      const plan = (obj.metadata && obj.metadata.plan) || '';
      const email = (obj.customer_details && obj.customer_details.email) ||
                    (obj.metadata && obj.metadata.email) || obj.customer_email || '';
      // BUSINESS IN A BOX ($99, 2026-07-20, founder-authorized additive edit): 'bib' is a
      // first-class paid plan — full designs-only kit, delivered like spark but top-tier.
      if (email && (plan === 'spark' || plan === 'plus' || plan === 'studio' || plan === 'bib')) {
        let expires = null; // bib is "yours forever" -> no expiry, same as spark
        if (plan === 'plus')        expires = new Date(Date.now() + 90  * 24 * 3600 * 1000).toISOString();
        else if (plan === 'studio') expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
        const res = await sbInsert({
          email: email, plan: plan, status: 'active',
          spark_credits: (plan === 'spark' || plan === 'bib') ? 1 : 0, expires_at: expires,
          stripe_customer_id: obj.customer || null
        });
        if (res.status >= 300) console.error('entitlement insert failed', res.status, (res.text || '').slice(0, 200));
        // best-effort marketing list (separate table; never blocks the purchase)
        try {
          await sbTable('subscribers', {
            email: email,
            first_name: (obj.metadata && obj.metadata.first_name) || '',
            last_name:  (obj.metadata && obj.metadata.last_name)  || '',
            marketing_consent: ((obj.metadata && obj.metadata.consent) === 'yes'),
            named_thing: (obj.metadata && obj.metadata.seed) || '',
            plan: plan
          });
        } catch (e) { console.warn('subscriber capture skipped', e && e.message ? e.message : String(e)); }

        // NATIVE AFFILIATE ENGINE (2026-07-16, founder-authorized additive edit):
        // attribute the sale to its referral code. Separate table, best-effort,
        // wrapped so it can NEVER block entitlement or delivery. The unique
        // stripe_session_id column makes webhook retries attribution-safe.
        try {
          var refCode = String((obj.metadata && obj.metadata.ref) || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
          // PRODUCTION SCHEMA ALIGNMENT (2026-07-16, founder-confirmed): the live
          // smn_referrals table uses affiliate_code / session_id / sale_amount.
          // session_id is NOT NULL there, so no session id → no insert attempt.
          // Stripe reports cents; sale_amount is numeric dollars (2900 → 29.00).
          // When Stripe omits the amount we OMIT the key so the column's own
          // default (29.00) applies instead of writing null.
          if (refCode && obj.id) {
            const refRow = {
              affiliate_code: refCode, email: email, plan: plan,
              session_id: obj.id,
              currency: obj.currency || null
            };
            if (typeof obj.amount_total === 'number') refRow.sale_amount = Math.round(obj.amount_total) / 100;
            const ar = await sbTable('smn_referrals', refRow);
            if (ar.status === 409) console.log('referral already recorded (retry-safe) — session ' + obj.id);
            else if (ar.status >= 300) console.warn('referral attribution skipped', ar.status, (ar.text || '').slice(0, 120));
            else console.log('referral attributed: ' + refCode + ' — session ' + obj.id);
          }
        } catch (e) { console.warn('referral capture skipped', e && e.message ? e.message : String(e)); }

        // RELIABLE DELIVERY (2026-07-14): the webhook is the ONE signal guaranteed to fire on every
        // paid order — independent of the buyer's browser. Trigger the build+email here so a buyer who
        // closes the tab (or whose success page never loaded) still gets their brand. deliver-background
        // claims the (session+seed) once, so this NEVER double-builds when the success page also fired.
        // Single orders only; batch orders keep their own delivery path.
        try {
          const seed  = (obj.metadata && obj.metadata.seed)  || '';
          const count = parseInt((obj.metadata && obj.metadata.count) || '0', 10) || 0;
          if (seed && count === 0 && (plan === 'spark' || plan === 'bib')) {
            const base = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');
            await fetch(base + '/.netlify/functions/deliver-background', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: obj.id, seed: seed, email: email })
            });
            console.log('webhook: delivery triggered for ' + email + ' — session ' + obj.id);
          }
        } catch (e) { console.warn('webhook: delivery trigger skipped', e && e.message ? e.message : String(e)); }

        // PURCHASE CONFIRMATION (customer-first, 2026-07-19): a warm receipt the instant payment
        // lands — "we got your order, we're preparing it, arrives today." Best-effort and fully
        // wrapped: can NEVER block the entitlement or delivery paths above.
        try {
          const cSeed  = (obj.metadata && obj.metadata.seed)  || '';
          const cCount = parseInt((obj.metadata && obj.metadata.count) || '0', 10) || 0;
          if (email && (plan === 'spark' || plan === 'bib') && cCount === 0) {
            const cbase = (process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '');
            await fetch(cbase + '/.netlify/functions/send-kit', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: email, kind: 'confirm', seed: cSeed, plan: plan })
            });
            console.log('webhook: confirmation email sent for ' + email);
          }
        } catch (e) { console.warn('webhook: confirmation email skipped', e && e.message ? e.message : String(e)); }
      } else {
        console.warn('skip checkout: plan/email missing', plan, !!email);
      }

      // PRODUCT ACTIVATION MODEL (2026-07-17, founder-authorized additive edit):
      // a paid 'activate' session flips one brand row LOCKED → ACTIVATED. Best-effort and
      // fully wrapped — this can NEVER block the entitlement/delivery paths above.
      try {
        if (plan === 'activate') {
          const aR = String((obj.metadata && obj.metadata.r) || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
          const aBrand = String((obj.metadata && obj.metadata.brand) || '').slice(0, 120);
          if (aR && aBrand) {
            const q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(aR) + '&select=position,name,kit&order=position.asc&limit=24', {
              headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }
            });
            const rows = await q.json().catch(function(){ return []; });
            const row = (Array.isArray(rows) ? rows : []).find(function (x) { return x && x.name === aBrand; });
            if (row) {
              const kit = (row.kit && typeof row.kit === 'object' && !Array.isArray(row.kit)) ? row.kit : {};
              if (kit._activated !== true) {
                kit._activated = true;
                kit._activated_at = new Date().toISOString();
                kit._activation = 'paid';
                kit._activation_session = obj.id || null;
                const w = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(aR) + '&position=eq.' + encodeURIComponent(String(row.position)), {
                  method: 'PATCH',
                  headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                  body: JSON.stringify({ kit: kit })
                });
                if (w.status >= 300) console.error('activation flip failed', w.status);
                else console.log('activation: ' + aBrand + ' on ' + aR + ' — session ' + obj.id);
              } else {
                console.log('activation: already active (retry-safe) — ' + aBrand);
              }
            } else {
              console.warn('activation: brand row not found', aR, aBrand);
            }
          }
        }
      } catch (e) { console.warn('activation flip skipped', e && e.message ? e.message : String(e)); }

      // ADD-ON TIERS (2026-07-17, Phase 2 Step 1): a paid add-on session unlocks a tier
      // (and cascades — Full Launch Kit T3 includes T1+T2). Best-effort, retry-safe,
      // fully wrapped so it can NEVER block entitlement/delivery above.
      try {
        if (typeof plan === 'string' && plan.indexOf('addon_') === 0) {
          const aTier = (obj.metadata && obj.metadata.tier) || plan.slice(6);
          const aR = String((obj.metadata && obj.metadata.r) || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
          const aBrand = String((obj.metadata && obj.metadata.brand) || '').slice(0, 120);
          const cascade = aTier === 't3' ? ['t1', 't2', 't3'] : aTier === 't2' ? ['t2'] : aTier === 't1' ? ['t1'] : [];
          if (aR && aBrand && cascade.length) {
            const q = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(aR) + '&select=position,name,kit&order=position.asc&limit=24', {
              headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }
            });
            const rows = await q.json().catch(function () { return []; });
            const row = (Array.isArray(rows) ? rows : []).find(function (x) { return x && x.name === aBrand; });
            if (row) {
              const kit = (row.kit && typeof row.kit === 'object' && !Array.isArray(row.kit)) ? row.kit : {};
              const addons = (kit._addons && typeof kit._addons === 'object') ? kit._addons : {};
              const stamp = new Date().toISOString();
              let changed = false;
              cascade.forEach(function (t) {
                if (!addons[t] || addons[t].on !== true) { addons[t] = { on: true, at: stamp, session: obj.id || null, via: aTier }; changed = true; }
              });
              if (changed) {
                kit._addons = addons;
                const w = await fetch(SB_URL + '/rest/v1/report_names?report_id=eq.' + encodeURIComponent(aR) + '&position=eq.' + encodeURIComponent(String(row.position)), {
                  method: 'PATCH',
                  headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                  body: JSON.stringify({ kit: kit })
                });
                if (w.status >= 300) console.error('addon flip failed', w.status);
                else console.log('addon unlocked: ' + cascade.join('+') + ' on ' + aBrand + ' (' + aR + ') — session ' + obj.id);
              } else {
                console.log('addon: already unlocked (retry-safe) — ' + aTier + ' ' + aBrand);
              }
            } else {
              console.warn('addon: brand row not found', aR, aBrand);
            }
          }
        }
      } catch (e) { console.warn('addon flip skipped', e && e.message ? e.message : String(e)); }
      // Studio is now a one-time, one-year purchase (handled above). Legacy subscription events below are harmless no-ops.
    } else if (type === 'customer.subscription.created' || type === 'customer.subscription.updated') {
      let email = (obj.metadata && obj.metadata.email) || '';
      if (!email && obj.customer) email = await customerEmail(obj.customer);
      const expires = obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : null;
      const status = (obj.status === 'active' || obj.status === 'trialing') ? 'active' : obj.status;
      if (email) await sbInsert({
        email: email, plan: 'studio', status: status, spark_credits: 0,
        expires_at: expires, stripe_customer_id: obj.customer || null, stripe_subscription_id: obj.id || null
      });
    } else if (type === 'customer.subscription.deleted') {
      let email = (obj.metadata && obj.metadata.email) || '';
      if (!email && obj.customer) email = await customerEmail(obj.customer);
      if (email) await sbInsert({
        email: email, plan: 'studio', status: 'canceled', spark_credits: 0,
        expires_at: null, stripe_customer_id: obj.customer || null, stripe_subscription_id: obj.id || null
      });
    }
  } catch (e) {
    console.error('webhook exception', e && e.message ? e.message : String(e));
    return { statusCode: 200, body: 'ok' };
  }
  return { statusCode: 200, body: 'ok' };
};

function verify(payload, sigHeader, secret) {
  if (!sigHeader || !secret) return false;
  const parts = {};
  sigHeader.split(',').forEach(function (kv) { const i = kv.indexOf('='); if (i > 0) parts[kv.slice(0, i)] = kv.slice(i + 1); });
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  /* REPLAY WINDOW (2026-07-26). The timestamp was parsed and then never used, so a signature
     stayed valid forever — anyone holding one captured paid webhook could replay it, and each
     replay granted another entitlement. Stripe's own guidance is a five-minute tolerance, and
     their retries all arrive well inside it. */
  const age = Math.abs(Math.floor(Date.now() / 1000) - parseInt(t, 10));
  if (!isFinite(age) || age > 300) return false;
  const signed = crypto.createHmac('sha256', secret).update(t + '.' + payload).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(signed), Buffer.from(v1)); } catch (e) { return false; }
}
async function sbInsert(row) { return sbTable('entitlements', row); }
async function sbTable(table, row) {
  const r = await fetch(SB_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY,
      'Content-Type': 'application/json', 'Prefer': 'return=minimal'
    },
    body: JSON.stringify(row)
  });
  let t = ''; try { t = await r.text(); } catch (e) {}
  return { status: r.status, text: t };
}
async function customerEmail(cust) {
  try {
    const r = await fetch('https://api.stripe.com/v1/customers/' + cust, { headers: { 'Authorization': 'Bearer ' + STRIPE } });
    const d = await r.json(); return d.email || '';
  } catch (e) { return ''; }
}
