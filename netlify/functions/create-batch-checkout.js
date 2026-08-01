// Creates a Stripe Checkout Session for a BATCH of businesses — $10 each, ONE payment.
// quantity = number of businesses. The full list is stored in session metadata (one key
// per business, b0..bN) so delivery can verify EXACTLY which businesses were paid for.
// Dependency-free (raw fetch). Env: STRIPE_SECRET_KEY, STRIPE_PRICE_BATCH, SITE_URL
const SECRET = process.env.STRIPE_SECRET_KEY;
// Per-business $10 price. Sandbox/TEST default below.
// At go-live: set STRIPE_PRICE_BATCH in Netlify to the LIVE price — no code change needed.
const BATCH_PRICE = process.env.STRIPE_PRICE_BATCH || 'price_1TkU52Fx648CsdqbXykS6ir6';
const SITE = process.env.SITE_URL || 'https://sparkmyname.netlify.app';
const MAX_BUSINESSES = 25;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  if (!SECRET) return resp(500, { error: 'missing_stripe_key' });

  let email = '', businesses = [];
  try {
    const b = JSON.parse(event.body || '{}');
    email = (b.email || '').slice(0, 120).trim();
    if (Array.isArray(b.businesses)) businesses = b.businesses;
  } catch (e) {}

  // Expand any comma- or newline-separated items into individual businesses, then
  // clean: trim, collapse whitespace, drop blanks, cap per-line length,
  // de-dupe (case-insensitive), cap total count.
  const expanded = [];
  businesses.forEach(function (x) {
    String(x == null ? '' : x).split(/[\n,]+/).forEach(function (part) { expanded.push(part); });
  });
  const seen = {};
  businesses = expanded
    .map(function (x) { return x.replace(/\s+/g, ' ').trim().slice(0, 160); })
    .filter(function (x) { if (!x) return false; var k = x.toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; })
    .slice(0, MAX_BUSINESSES);

  if (!businesses.length) return resp(400, { error: 'no_businesses' });

  const p = new URLSearchParams();
  p.append('mode', 'payment');
  p.append('line_items[0][price]', BATCH_PRICE);
  p.append('line_items[0][quantity]', String(businesses.length)); // $10 x count
  p.append('success_url', SITE + '/account.html?batch_session={CHECKOUT_SESSION_ID}');
  p.append('cancel_url', SITE + '/account.html');
  p.append('automatic_tax[enabled]', 'false');
  p.append('billing_address_collection', 'auto');
  if (email) p.append('customer_email', email);
  if (email) p.append('client_reference_id', email);
  p.append('metadata[kind]', 'batch');
  p.append('metadata[email]', email || '');
  p.append('metadata[count]', String(businesses.length));
  // One business per metadata key (Stripe allows 50 keys, 500 chars each — we cap at 160).
  for (var i = 0; i < businesses.length; i++) {
    p.append('metadata[b' + i + ']', businesses[i].slice(0, 480));
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
