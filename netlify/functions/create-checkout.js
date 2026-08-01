// Creates a Stripe Checkout Session for the chosen plan. Dependency-free (raw fetch).
// Env: STRIPE_SECRET_KEY, STRIPE_PRICE_SPARK, STRIPE_PRICE_PLUS, STRIPE_PRICE_STUDIO, SITE_URL
const SECRET = process.env.STRIPE_SECRET_KEY;
// Live tiers only. Agency / Agency+ / Enterprise are BANKED until the team backend ships.
const PRICES = {
  spark:  process.env.STRIPE_PRICE_SPARK,
  plus:   process.env.STRIPE_PRICE_PLUS,
  studio: process.env.STRIPE_PRICE_STUDIO,
  // BUSINESS IN A BOX ($99, 2026-07-20, founder-authorized additive edit): flat one-time
  // designs-only product. Env override wins; sandbox price is the shipped fallback so it
  // works out of the box in test mode. Flows through the standard success_url -> result.html.
  bib:    process.env.STRIPE_PRICE_BIB || 'price_1Tv81hFx648CsdqbBhDGoXGa'
};
const SITE = process.env.SITE_URL || 'https://sparkmyname.netlify.app';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  if (!SECRET) return resp(500, { error: 'missing_stripe_key' });
  let plan = '', email = '', seed = '', fn = '', ln = '', consent = 'no', seats = 0, ref = '', actR = '', actBrand = '', base = '';
  try {
    const b = JSON.parse(event.body || '{}');
    plan = b.plan; email = (b.email || '').slice(0, 120); seed = (b.seed || '').slice(0, 600); fn = (b.first_name || '').slice(0, 60); ln = (b.last_name || '').slice(0, 60); consent = b.consent ? 'yes' : 'no';
    // STANDALONE MAIN SITE (repaired 2026-07-23): every flow lives on the root pages.
    base = '';
    seats = Math.max(0, Math.min(100000, parseInt(b.seats, 10) || 0));
    // NATIVE AFFILIATE ENGINE (2026-07-16, founder-authorized additive edit):
    // carry the referral code into Stripe metadata so the webhook can attribute the sale.
    ref = String(b.ref || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
    // PRODUCT ACTIVATION MODEL (2026-07-17, founder-authorized additive edit):
    // an 'activate' plan unlocks one more brand on an existing order. The report id and
    // brand name ride in metadata so the webhook can flip that row to ACTIVATED on payment.
    actR = String(b.r || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    actBrand = String(b.brand || '').slice(0, 120);
  } catch (e) {}

  // ONE PACKAGE ONLY (2026-07-20, founder directive): SparkMyName sells exactly one
  // product — Business in a Box, $99. Every checkout resolves to the $99 'bib' plan and
  // price regardless of what the page requested, so nothing but $99 can ever be charged.
  // SPARK STORE PROGRAM (Founder ruling, 2026-07-23): the ONE authorized exception —
  // 'storepass' = Spark Store — Unlimited, $19/month recurring. Never mentioned at the
  // point of sale; offered only AFTER delivery (discovery email / workspace). Cancel is
  // one click via Stripe's customer portal. Everything else still seals to bib.
  const isStorePass = (plan === 'storepass');
  if (!isStorePass) plan = 'bib';

  const mode = isStorePass ? 'subscription' : 'payment'; // bib stays a single flat $99 purchase
  const p = new URLSearchParams();
  p.append('mode', mode);

  // Only the three live tiers can check out. Banked tiers (agency/agencyplus/enterprise)
  // are rejected until their backend ships.
  // ACTIVATION plan: fixed price, returns to the customer's workspace (root — repaired 2026-07-23).
  const isActivate = (plan === 'activate');
  if (isActivate && (!actR || !actBrand)) return resp(400, { error: 'missing_fields' });
  // ADD-ON TIERS (2026-07-17, Phase 2 Step 1): per-brand expansion bundles. Each tier
  // has an env Price ID with the founder-supplied fallback. Returns to the Command
  // Center (Download Center) with ?unlocked=<tier> for the real-time flip.
  const ADDONS = {
    addon_t1: { tier: 't1', price: process.env.STRIPE_PRICE_ADDON_T1 || 'price_1Thn1ZFx648Csdqb9QES3Yoa' },
    addon_t2: { tier: 't2', price: process.env.STRIPE_PRICE_ADDON_T2 || 'price_1Tu1DOFx648CsdqbHlsbyrZY' },
    addon_t3: { tier: 't3', price: process.env.STRIPE_PRICE_ADDON_T3 || 'price_1TsnwbFx648CsdqbWDI9PUWV' }
  };
  const addon = ADDONS[plan] || null;
  if (addon && (!actR || !actBrand)) return resp(400, { error: 'missing_fields' });
  const price = isStorePass
    ? (process.env.STRIPE_PRICE_STOREPASS || 'price_1TwTOoFx648CsdqbmFb8wglJ') // Spark Store — Unlimited, $19/mo (Founder, 2026-07-23)
    : isActivate
    ? (process.env.STRIPE_PRICE_ACTIVATE || 'price_1Tu1DOFx648CsdqbHlsbyrZY')
    : addon ? addon.price
    : PRICES[plan];
  if (!price) return resp(400, { error: 'bad_plan' });
  p.append('line_items[0][price]', price);
  p.append('line_items[0][quantity]', '1');
  if (isStorePass) {
    p.append('success_url', SITE + '/workspace.html?storepass=welcome');
    p.append('cancel_url', SITE + '/workspace.html');
  } else if (isActivate) {
    const back = SITE + '/workspace.html?r=' + encodeURIComponent(actR);
    p.append('success_url', back + '&activated=' + encodeURIComponent(actBrand));
    p.append('cancel_url', back);
    p.append('metadata[r]', actR);
    p.append('metadata[brand]', actBrand);
  } else if (addon) {
    const back = SITE + '/workspace.html?r=' + encodeURIComponent(actR) + '&n=' + encodeURIComponent(actBrand);
    p.append('success_url', back + '&unlocked=' + encodeURIComponent(addon.tier));
    p.append('cancel_url', back);
    p.append('metadata[r]', actR);
    p.append('metadata[brand]', actBrand);
    p.append('metadata[tier]', addon.tier);
  } else {
    p.append('success_url', SITE + base + '/result.html?session_id={CHECKOUT_SESSION_ID}');
    p.append('cancel_url', SITE + (base ? base + '/index.html' : '/app.html'));
  }
  p.append('automatic_tax[enabled]', 'false');
  p.append('billing_address_collection', 'auto');
  if (email) p.append('customer_email', email);
  p.append('metadata[plan]', plan);
  p.append('metadata[email]', email || '');
  p.append('metadata[seed]', (seed || '').slice(0, 480));
  p.append('metadata[first_name]', fn);
  p.append('metadata[last_name]', ln);
  p.append('metadata[consent]', consent);
  if (ref) p.append('metadata[ref]', ref);
  if (email) p.append('client_reference_id', email);
  if (mode === 'subscription') {
    p.append('subscription_data[metadata][plan]', plan);
    p.append('subscription_data[metadata][email]', email || '');
  }

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SECRET, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: p.toString()
    });
    const d = await r.json();
    if (d.error) return resp(400, { error: d.error.message });
    return resp(200, { url: d.url });
  } catch (e) { return resp(502, { error: 'stripe_failed' }); }
};
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
