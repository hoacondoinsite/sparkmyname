/**
 * HOA_CODE_02 — stripeConfig.js
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Complete Stripe integration module with payment intent creation,
 * subscription management, and webhook handlers for all HOACONDInsight products.
 *
 * SOP (embedded per Founder Override):
 * 1. Set VITE_STRIPE_PUBLISHABLE_KEY (frontend) in Netlify env vars
 * 2. Set STRIPE_SECRET_KEY (backend/edge functions) in Netlify env vars
 * 3. Configure webhook endpoint in Stripe dashboard → your Netlify URL + /api/stripe-webhook
 * 4. Copy webhook signing secret from Stripe → set as STRIPE_WEBHOOK_SECRET in Netlify
 * ROLLBACK: Set VITE_STRIPE_PUBLISHABLE_KEY to empty string to disable payments
 *
 * PRODUCTS:
 * - Basic Report: $39 one-time
 * - Professional Report: $79 one-time
 * - Enterprise Monthly: $299/month
 * - Enterprise Annual: $2,988/year ($249/month)
 */

import { loadStripe } from '@stripe/stripe-js';

// ─────────────────────────────────────────────
// ENV VAR DETECTION
// ─────────────────────────────────────────────
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
export const stripeAvailable = !!(STRIPE_PUBLISHABLE_KEY);
export const stripeTestMode = STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');

if (!stripeAvailable) {
  console.warn('[HOAInsight] Stripe env vars not detected. Payments disabled.');
}
if (stripeTestMode) {
  console.info('[HOAInsight] Stripe running in TEST MODE.');
}

// ─────────────────────────────────────────────
// STRIPE INSTANCE (lazy-loaded)
// ─────────────────────────────────────────────
let stripePromise = null;
export const getStripe = () => {
  if (!stripeAvailable) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// ─────────────────────────────────────────────
// PRODUCT CATALOG
// ─────────────────────────────────────────────
export const PRODUCTS = {
  BASIC_REPORT: {
    id: 'basic_report',
    name: 'HOA Compliance Report — Basic',
    description: 'Fannie Mae LL-2026-03 compliance analysis. 48-hour turnaround. All 50 states.',
    price_cents: 3900,
    price_display: '$39',
    type: 'one_time',
    turnaround_hours: 48,
    features: [
      'Fannie Mae LL-2026-03 compliance check',
      'HOA Health Score (0–100)',
      'Reserve funding analysis',
      'Master policy deductible review',
      'PDF report delivered by email',
      '48-hour turnaround',
    ],
  },
  PROFESSIONAL_REPORT: {
    id: 'professional_report',
    name: 'HOA Compliance Report — Professional',
    description: 'Full compliance analysis with attorney-grade detail and lender-ready documentation.',
    price_cents: 7900,
    price_display: '$79',
    type: 'one_time',
    turnaround_hours: 24,
    features: [
      'Everything in Basic',
      'Form 1076 auto-fill assistance',
      'Lender-ready documentation package',
      'Risk flags with legal citations',
      '24-hour turnaround',
      'Phone consultation available',
    ],
  },
  ENTERPRISE_MONTHLY: {
    id: 'enterprise_monthly',
    name: 'Enterprise — Monthly',
    description: 'Unlimited reports for mortgage lenders, title companies, and national brokerages.',
    price_cents: 29900,
    price_display: '$299/mo',
    type: 'subscription',
    interval: 'month',
    features: [
      'Unlimited HOA compliance reports',
      'API access',
      'Bulk upload',
      'White-label PDF reports',
      'Dedicated account manager',
      'SLA: 4-hour turnaround',
    ],
  },
  ENTERPRISE_ANNUAL: {
    id: 'enterprise_annual',
    name: 'Enterprise — Annual',
    description: 'Best value for high-volume enterprise users.',
    price_cents: 298800,
    price_display: '$2,988/yr',
    type: 'subscription',
    interval: 'year',
    features: [
      'Everything in Enterprise Monthly',
      '2 months free vs monthly',
      'Priority support',
      'Custom integrations',
      'Dedicated onboarding',
    ],
  },
};

// ─────────────────────────────────────────────
// PAYMENT HELPERS (client-side)
// ─────────────────────────────────────────────

/**
 * Create a payment intent via Netlify serverless function
 * Netlify function at: netlify/functions/create-payment-intent.js
 */
export const createPaymentIntent = async ({ productId, customerEmail, hoaName, hoaState }) => {
  const product = Object.values(PRODUCTS).find(p => p.id === productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);

  const response = await fetch('/.netlify/functions/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      amount_cents: product.price_cents,
      customer_email: customerEmail,
      hoa_name: hoaName,
      hoa_state: hoaState,
      metadata: {
        product_name: product.name,
        turnaround_hours: product.turnaround_hours,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Payment intent creation failed');
  }

  return await response.json(); // { clientSecret, paymentIntentId, orderId }
};

/**
 * Confirm payment using Stripe Elements
 */
export const confirmPayment = async (stripe, elements, clientSecret, returnUrl) => {
  return await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: returnUrl || `${window.location.origin}/order-confirmation`,
    },
  });
};

/**
 * Create subscription via Netlify function
 */
export const createSubscription = async ({ productId, customerEmail, paymentMethodId }) => {
  const response = await fetch('/.netlify/functions/create-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      customer_email: customerEmail,
      payment_method_id: paymentMethodId,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Subscription creation failed');
  }

  return await response.json();
};

// ─────────────────────────────────────────────
// NETLIFY SERVERLESS FUNCTION TEMPLATES
// Place these in netlify/functions/
// ─────────────────────────────────────────────

export const NETLIFY_FUNCTION_CREATE_PAYMENT_INTENT = `
// netlify/functions/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { product_id, amount_cents, customer_email, hoa_name, hoa_state, metadata } = JSON.parse(event.body);

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    let customer = customers.data[0];
    if (!customer) {
      customer = await stripe.customers.create({ email: customer_email });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: 'usd',
      customer: customer.id,
      receipt_email: customer_email,
      metadata: {
        product_id,
        hoa_name,
        hoa_state,
        ...metadata,
      },
    });

    // Create order in Supabase
    let orderId = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const orderNumber = 'HOA-' + Date.now();
      const { data } = await supabase.from('orders').insert({
        order_number: orderNumber,
        status: 'pending',
        product_type: product_id,
        amount_cents,
        stripe_payment_intent_id: paymentIntent.id,
        hoa_community_name: hoa_name,
        hoa_state,
      }).select().single();
      orderId = data?.id;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
`;

export const NETLIFY_FUNCTION_STRIPE_WEBHOOK = `
// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return { statusCode: 400, body: 'Webhook signature verification failed' };
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const pi = stripeEvent.data.object;
      await supabase.from('orders')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', pi.id);
      // Trigger report generation here
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = stripeEvent.data.object;
      await supabase.from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', pi.id);
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = stripeEvent.data.object;
      await supabase.from('subscriptions').upsert({
        stripe_subscription_id: sub.id,
        status: sub.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = stripeEvent.data.object;
      await supabase.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id);
      break;
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
`;

export default { getStripe, PRODUCTS, createPaymentIntent, confirmPayment, stripeAvailable, stripeTestMode };
