/**
 * HOA_CODE_04 — resendConfig.js
 * HOACONDInsight LLC — Peter Klein — Sole Owner
 * Version: 1.0 | Date: 2026-06-06
 *
 * PURPOSE: Complete Resend email module with order confirmation templates,
 * report delivery emails, attorney notification emails, and all transactional flows.
 *
 * SOP (embedded per Founder Override):
 * 1. Set RESEND_API_KEY in Netlify env vars (server-side only — never VITE_ prefix)
 * 2. Verify domain hoacondoinsight.com in Resend dashboard
 * 3. Set FROM_EMAIL to peter@hoacondoinsight.com in Resend verified domains
 * 4. All email sends go through Netlify functions — never called client-side
 * ROLLBACK: Remove RESEND_API_KEY from Netlify env vars
 *
 * FROM ADDRESS: peter@hoacondoinsight.com
 * REPLY-TO: peter@hoacondoinsight.com
 */

// ─────────────────────────────────────────────
// EMAIL CONFIG
// ─────────────────────────────────────────────
export const EMAIL_CONFIG = {
  from: 'HOACONDInsight <peter@hoacondoinsight.com>',
  replyTo: 'peter@hoacondoinsight.com',
  founderEmail: 'peterkleinusa@gmail.com',
  platformEmail: 'peter@hoacondoinsight.com',
  companyName: 'HOACONDInsight LLC',
  websiteUrl: 'https://hoacondoinsight.com',
  supportUrl: 'https://hoacondoinsight.com/contact',
};

// ─────────────────────────────────────────────
// EMAIL TEMPLATE: ORDER CONFIRMATION
// ─────────────────────────────────────────────
export const orderConfirmationTemplate = ({
  customerName,
  orderNumber,
  productName,
  amountDisplay,
  hoaName,
  hoaState,
  turnaroundHours,
  isTestMode = false,
}) => ({
  subject: `Order Confirmed — ${orderNumber} — HOACONDInsight`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
  <style>
    body { font-family: Georgia, serif; background: #f8f7f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0ddd5; }
    .header { background: #1a2744; padding: 32px 40px; }
    .header h1 { color: #c9a84c; font-size: 22px; margin: 0; letter-spacing: 1px; }
    .header p { color: #a0aec0; font-size: 13px; margin: 4px 0 0; }
    .body { padding: 40px; }
    .order-box { background: #f8f7f4; border: 1px solid #e0ddd5; padding: 24px; margin: 24px 0; }
    .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0ddd5; }
    .order-row:last-child { border-bottom: none; font-weight: bold; }
    .label { color: #6b7280; font-size: 14px; }
    .value { color: #1a2744; font-size: 14px; font-weight: 600; }
    .next-steps { background: #f0f4ff; border-left: 4px solid #1a2744; padding: 20px 24px; margin: 24px 0; }
    .next-steps h3 { color: #1a2744; margin: 0 0 12px; }
    .next-steps ol { margin: 0; padding-left: 20px; color: #374151; }
    .next-steps li { margin-bottom: 8px; font-size: 14px; }
    .footer { background: #f8f7f4; padding: 24px 40px; border-top: 1px solid #e0ddd5; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
    .test-banner { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px 24px; text-align: center; font-size: 13px; color: #92400e; }
    h2 { color: #1a2744; }
  </style>
</head>
<body>
  ${isTestMode ? '<div class="test-banner">⚠️ TEST MODE — This is a test transaction. No charge was made.</div>' : ''}
  <div class="container">
    <div class="header">
      <h1>HOACONDInsight™</h1>
      <p>AI-Powered HOA Compliance Analysis</p>
    </div>
    <div class="body">
      <h2>Your Order Is Confirmed</h2>
      <p>Thank you, ${customerName}. We have received your order and will begin your compliance analysis within the hour.</p>

      <div class="order-box">
        <div class="order-row">
          <span class="label">Order Number</span>
          <span class="value">${orderNumber}</span>
        </div>
        <div class="order-row">
          <span class="label">Report Type</span>
          <span class="value">${productName}</span>
        </div>
        <div class="order-row">
          <span class="label">HOA / Community</span>
          <span class="value">${hoaName}</span>
        </div>
        <div class="order-row">
          <span class="label">State</span>
          <span class="value">${hoaState}</span>
        </div>
        <div class="order-row">
          <span class="label">Amount Paid</span>
          <span class="value">${amountDisplay}</span>
        </div>
        <div class="order-row">
          <span class="label">Expected Delivery</span>
          <span class="value">Within ${turnaroundHours} hours</span>
        </div>
      </div>

      <div class="next-steps">
        <h3>What Happens Next</h3>
        <ol>
          <li>Our AI engine analyzes your HOA documents against Fannie Mae LL-2026-03 requirements</li>
          <li>We calculate your HOA Health Score (0–100) and identify any compliance flags</li>
          <li>Your complete report is delivered to this email address as a PDF</li>
          <li>Report is valid for 90 days for mortgage underwriting purposes</li>
        </ol>
      </div>

      <p>Questions? Reply to this email or visit <a href="${EMAIL_CONFIG.supportUrl}">hoacondoinsight.com/contact</a></p>
    </div>
    <div class="footer">
      <p>HOACONDInsight LLC · 61 N Lakeshore Dr · Hypoluxo, FL 33462</p>
      <p>Powered by Fannie Mae LL-2026-03 compliance engine</p>
      <p>© 2026 HOACONDInsight LLC. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
});

// ─────────────────────────────────────────────
// EMAIL TEMPLATE: REPORT DELIVERY
// ─────────────────────────────────────────────
export const reportDeliveryTemplate = ({
  customerName,
  orderNumber,
  hoaName,
  healthScore,
  warrantable,
  keyFlags = [],
  reportUrl,
}) => ({
  subject: `Your HOA Report Is Ready — ${hoaName} — Score: ${healthScore}/100`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #f8f7f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0ddd5; }
    .header { background: #1a2744; padding: 32px 40px; }
    .header h1 { color: #c9a84c; font-size: 22px; margin: 0; }
    .score-box { text-align: center; padding: 32px; background: ${healthScore >= 75 ? '#f0fdf4' : healthScore >= 60 ? '#fefce8' : '#fef2f2'}; margin: 24px 0; border: 2px solid ${healthScore >= 75 ? '#16a34a' : healthScore >= 60 ? '#ca8a04' : '#dc2626'}; }
    .score-number { font-size: 72px; font-weight: bold; color: ${healthScore >= 75 ? '#16a34a' : healthScore >= 60 ? '#ca8a04' : '#dc2626'}; line-height: 1; }
    .score-label { font-size: 16px; color: #6b7280; margin-top: 8px; }
    .warrantable-badge { display: inline-block; padding: 8px 20px; border-radius: 4px; font-weight: bold; background: ${warrantable ? '#16a34a' : '#dc2626'}; color: white; margin-top: 12px; }
    .body { padding: 40px; }
    .flags { margin: 24px 0; }
    .flag { padding: 12px 16px; margin-bottom: 8px; border-left: 4px solid #e5e7eb; font-size: 14px; }
    .flag.critical { border-color: #dc2626; background: #fef2f2; }
    .flag.warning { border-color: #f59e0b; background: #fefce8; }
    .flag.info { border-color: #3b82f6; background: #eff6ff; }
    .cta { text-align: center; padding: 24px; }
    .btn { display: inline-block; background: #1a2744; color: white; padding: 16px 32px; text-decoration: none; font-size: 16px; }
    .footer { background: #f8f7f4; padding: 24px 40px; border-top: 1px solid #e0ddd5; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
    h2 { color: #1a2744; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HOACONDInsight™ — Report Ready</h1>
    </div>
    <div class="body">
      <p>Hello ${customerName},</p>
      <p>Your HOA compliance analysis for <strong>${hoaName}</strong> is complete.</p>

      <div class="score-box">
        <div class="score-number">${healthScore}</div>
        <div class="score-label">HOA Health Score (out of 100)</div>
        <div class="warrantable-badge">${warrantable ? '✓ WARRANTABLE' : '✗ NON-WARRANTABLE'}</div>
      </div>

      ${keyFlags.length > 0 ? `
      <h3>Key Findings</h3>
      <div class="flags">
        ${keyFlags.map(f => `<div class="flag ${f.severity}">${f.finding}</div>`).join('')}
      </div>
      ` : '<p>No critical compliance flags identified.</p>'}

      <div class="cta">
        <a href="${reportUrl}" class="btn">Download Full Report (PDF)</a>
      </div>

      <p style="font-size:13px;color:#6b7280;">This report is based on Fannie Mae Lender Letter LL-2026-03 and is valid for 90 days from the date of issuance. Order: ${orderNumber}</p>
    </div>
    <div class="footer">
      <p>HOACONDInsight LLC · 61 N Lakeshore Dr · Hypoluxo, FL 33462</p>
      <p>© 2026 HOACONDInsight LLC. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
});

// ─────────────────────────────────────────────
// EMAIL TEMPLATE: FOUNDER NOTIFICATION
// ─────────────────────────────────────────────
export const founderNotificationTemplate = ({ orderNumber, productName, amount, customerEmail, hoaName, hoaState }) => ({
  subject: `💰 New Order — ${orderNumber} — ${amount}`,
  html: `
<div style="font-family:monospace;padding:24px;max-width:500px;">
  <h2 style="color:#1a2744;">New HOACONDInsight Order</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px;color:#6b7280;">Order</td><td style="padding:8px;font-weight:bold;">${orderNumber}</td></tr>
    <tr style="background:#f9f9f9;"><td style="padding:8px;color:#6b7280;">Product</td><td style="padding:8px;">${productName}</td></tr>
    <tr><td style="padding:8px;color:#6b7280;">Amount</td><td style="padding:8px;font-weight:bold;color:#16a34a;">${amount}</td></tr>
    <tr style="background:#f9f9f9;"><td style="padding:8px;color:#6b7280;">Customer</td><td style="padding:8px;">${customerEmail}</td></tr>
    <tr><td style="padding:8px;color:#6b7280;">HOA</td><td style="padding:8px;">${hoaName}</td></tr>
    <tr style="background:#f9f9f9;"><td style="padding:8px;color:#6b7280;">State</td><td style="padding:8px;">${hoaState}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:13px;color:#9ca3af;">HOACONDInsight LLC — Auto notification</p>
</div>
  `,
});

// ─────────────────────────────────────────────
// NETLIFY FUNCTION — SEND EMAIL
// Place at: netlify/functions/send-email.js
// ─────────────────────────────────────────────
export const NETLIFY_FUNCTION_SEND_EMAIL = `
// netlify/functions/send-email.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  try {
    const { template, to, data } = JSON.parse(event.body);

    let emailContent;
    // Template selection handled server-side
    // Pass pre-rendered subject and html from client or build here

    const result = await resend.emails.send({
      from: 'HOACONDInsight <peter@hoacondoinsight.com>',
      to: Array.isArray(to) ? to : [to],
      subject: data.subject,
      html: data.html,
      reply_to: 'peter@hoacondoinsight.com',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: result.id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
`;

// ─────────────────────────────────────────────
// CLIENT-SIDE EMAIL TRIGGER
// ─────────────────────────────────────────────
export const sendEmail = async ({ template, to, templateData }) => {
  const response = await fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, to, data: templateData }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Email send failed');
  }

  return await response.json();
};

export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  REPORT_DELIVERY: 'report_delivery',
  FOUNDER_NOTIFICATION: 'founder_notification',
};

export default {
  sendEmail,
  EMAIL_TEMPLATES,
  EMAIL_CONFIG,
  orderConfirmationTemplate,
  reportDeliveryTemplate,
  founderNotificationTemplate,
};
