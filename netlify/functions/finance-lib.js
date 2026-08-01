// FINANCE LIB — shared logic for the Olin Finance Center: compute a monthly Spark referral
// statement from the ledger, build the statement/reminder emails, and send via Resend.
// Used by finance-statement.js (manual send) and finance-cron.js (scheduled send).

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SparkMyName <onboarding@resend.dev>';
// Recipients (override in Netlify env if addresses change):
const RECIPIENTS = (process.env.FINANCE_RECIPIENTS ||
  'peterkleinusa@gmail.com,olincreative@olincreative.com,jamesolin@olincreative.com')
  .split(',').map(s => s.trim()).filter(Boolean);
const FOUNDER = process.env.FOUNDER_EMAIL || 'peterkleinusa@gmail.com';
const REFERRAL_PCT = parseFloat(process.env.REFERRAL_PCT || '10');
const ZELLE = process.env.ZELLE_EMAIL || 'peterkleinusa@gmail.com';

function money(n) { return '$' + (Math.round((+n || 0) * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function ymOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[(m - 1) % 12] + ' ' + y;
}
function nextMonthTenth(ym) {
  let [y, m] = ym.split('-').map(Number);
  m += 1; if (m > 12) { m = 1; y += 1; }
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[(m - 1) % 12] + ' 10, ' + y;
}

// Compute a statement for month `ym` from the ledger.
// ledger = { clients:[{id,name,email,phone,note}], entries:[{clientId,ym,revenue,collected}] }
function computeStatement(ledger, ym) {
  const clients = {};
  (ledger.clients || []).forEach(c => { clients[c.id] = c; });
  const pct = (ledger.settings && +ledger.settings.referralPct) || REFERRAL_PCT;
  const rows = [];
  let totalRevenue = 0, totalFee = 0;
  (ledger.entries || []).forEach(e => {
    if (e.ym !== ym) return;
    if (e.collected === false) return; // only collected money is due
    const rev = +e.revenue || 0;
    if (rev <= 0) return;
    const fee = Math.round(rev * pct) / 100;
    const c = clients[e.clientId] || {};
    rows.push({ name: c.name || 'Client', info: [c.email, c.phone].filter(Boolean).join(' · '), revenue: rev, fee });
    totalRevenue += rev; totalFee += fee;
  });
  totalFee = Math.round(totalFee * 100) / 100;
  return { ym, monthLabel: monthLabel(ym), rows, totalRevenue, totalFee, pct, dueLabel: nextMonthTenth(ym) };
}

function statementHtml(d) {
  const rows = d.rows.map(r =>
    '<tr><td style="padding:9px 10px;border-bottom:1px solid #eee;font:400 13px Arial;color:#111">' + esc(r.name) +
    (r.info ? '<br><span style="color:#888;font-size:11px">' + esc(r.info) + '</span>' : '') +
    '</td><td style="padding:9px 10px;border-bottom:1px solid #eee;text-align:right;font:400 13px Arial;color:#111">' + money(r.revenue) +
    '</td><td style="padding:9px 10px;border-bottom:1px solid #eee;text-align:right;font:700 13px Arial;color:#7C5CFF">' + money(r.fee) + '</td></tr>'
  ).join('') || '<tr><td colspan="3" style="padding:14px;color:#888;font:400 13px Arial">No collected revenue recorded for this month.</td></tr>';
  return '<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">' +
    '<div style="background:linear-gradient(120deg,#7C5CFF,#FF4D8D);padding:22px 24px;border-radius:14px 14px 0 0">' +
    '<div style="color:#fff;font:800 18px Arial">SparkMyName — Referral Statement</div>' +
    '<div style="color:rgba(255,255,255,.85);font:400 13px Arial;margin-top:2px">Olin Creative · ' + esc(d.monthLabel) + '</div></div>' +
    '<div style="border:1px solid #eee;border-top:0;padding:22px 24px;border-radius:0 0 14px 14px">' +
    '<p style="font:400 14px/1.6 Arial;color:#333;margin:0 0 16px">Here is the monthly statement of referral fees due to SparkMyName for collected revenue in <b>' + esc(d.monthLabel) + '</b>. Fees are ' + d.pct + '% of collected revenue and are already built into each client’s quote.</p>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:6px"><thead><tr>' +
    '<th style="text-align:left;padding:8px 10px;border-bottom:2px solid #7C5CFF;font:700 11px Arial;color:#666;text-transform:uppercase">Client</th>' +
    '<th style="text-align:right;padding:8px 10px;border-bottom:2px solid #7C5CFF;font:700 11px Arial;color:#666;text-transform:uppercase">Collected</th>' +
    '<th style="text-align:right;padding:8px 10px;border-bottom:2px solid #7C5CFF;font:700 11px Arial;color:#666;text-transform:uppercase">Referral (' + d.pct + '%)</th>' +
    '</tr></thead><tbody>' + rows + '</tbody></table>' +
    '<table style="width:100%;border-collapse:collapse;margin-top:10px"><tr>' +
    '<td style="padding:10px;font:700 14px Arial;color:#111">Total collected: ' + money(d.totalRevenue) + '</td>' +
    '<td style="padding:10px;text-align:right;font:800 16px Arial;color:#7C5CFF">Referral due: ' + money(d.totalFee) + '</td></tr></table>' +
    '<div style="background:#F3F1FB;border-left:3px solid #7C5CFF;border-radius:8px;padding:14px 16px;margin-top:14px">' +
    '<div style="font:700 13px Arial;color:#111;margin-bottom:4px">Amount due: ' + money(d.totalFee) + ' — payable by ' + esc(d.dueLabel) + '</div>' +
    '<div style="font:400 13px/1.6 Arial;color:#444">Please remit by Zelle to <b>' + esc(ZELLE) + '</b> by the 10th, for revenue collected in ' + esc(d.monthLabel) + '. If a sale is later charged back, that referral is credited back on the following statement.</div></div>' +
    '<p style="font:400 11px Arial;color:#999;margin-top:16px">Generated automatically by the Olin Creative Finance Center · SparkMyName</p>' +
    '</div></div>';
}

function reminderHtml(d) {
  return '<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">' +
    '<div style="background:linear-gradient(120deg,#FFB020,#FF4D8D);padding:22px 24px;border-radius:14px 14px 0 0">' +
    '<div style="color:#fff;font:800 18px Arial">Friendly reminder — payment due tomorrow</div>' +
    '<div style="color:rgba(255,255,255,.9);font:400 13px Arial;margin-top:2px">Olin Creative · ' + esc(d.monthLabel) + ' referral</div></div>' +
    '<div style="border:1px solid #eee;border-top:0;padding:22px 24px;border-radius:0 0 14px 14px">' +
    '<p style="font:400 14px/1.6 Arial;color:#333;margin:0 0 14px">Just a friendly heads-up: the SparkMyName referral for <b>' + esc(d.monthLabel) + '</b> is <b>due tomorrow, the 10th</b>.</p>' +
    '<div style="background:#FFF7EC;border-left:3px solid #FFB020;border-radius:8px;padding:16px 18px;text-align:center">' +
    '<div style="font:800 26px Arial;color:#111">' + money(d.totalFee) + '</div>' +
    '<div style="font:400 13px Arial;color:#666;margin-top:2px">on ' + money(d.totalRevenue) + ' collected · due by the 10th</div></div>' +
    '<p style="font:400 14px/1.6 Arial;color:#333;margin:16px 0 0">Please send by Zelle to <b>' + esc(ZELLE) + '</b>. Thank you — and here’s to a great month ahead!</p>' +
    '<p style="font:400 11px Arial;color:#999;margin-top:16px">Automatic reminder from the Olin Creative Finance Center · SparkMyName</p>' +
    '</div></div>';
}

async function sendMail(subject, html, toList) {
  const to = (toList && toList.length ? toList : RECIPIENTS);
  if (!KEY) return { ok: false, error: 'no_resend_key', would_send_to: to };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html })
  });
  const d = await r.json().catch(() => ({}));
  return { ok: r.ok, id: d && d.id, error: (d && d.message) || null, to };
}

module.exports = {
  computeStatement, statementHtml, reminderHtml, sendMail,
  monthLabel, ymOf, nextMonthTenth, money, RECIPIENTS, REFERRAL_PCT, ZELLE
};
