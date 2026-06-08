// netlify/functions/create-payment.js
// SparkMyName — Stripe Payment Intent Creator
// Environment Variables required in Netlify dashboard:
//   STRIPE_SECRET_KEY  — your Stripe live secret key (sk_live_...)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const AMOUNTS = {
  consumer:     500,   // $5.00 in cents
  professional: 7900,  // $79.00 in cents
  annual:       995,   // $9.95 in cents
};

// For annual subscription, we use Price IDs
// Set these in Netlify env vars after creating products in Stripe dashboard:
//   STRIPE_PRICE_ANNUAL — price ID for $9.95/yr recurring

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { tier, email, name } = JSON.parse(event.body || '{}');

    if (!tier || !AMOUNTS[tier]) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid tier' }) };
    }

    if (tier === 'annual') {
      // Create a subscription checkout session instead
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: process.env.STRIPE_PRICE_ANNUAL, quantity: 1 }],
        customer_email: email,
        success_url: `https://sparkmyname.com/success.html?tier=annual&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://sparkmyname.com/pricing.html`,
        metadata: { customerName: name },
      });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutUrl: session.url }),
      };
    }

    // One-time payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: AMOUNTS[tier],
      currency: 'usd',
      receipt_email: email,
      description: `SparkMyName ${tier.charAt(0).toUpperCase() + tier.slice(1)} Report`,
      metadata: {
        tier,
        customerName: name,
        customerEmail: email,
        product: 'SparkMyName',
        company: 'Vorrex LLC',
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Payment creation failed' }),
    };
  }
};
