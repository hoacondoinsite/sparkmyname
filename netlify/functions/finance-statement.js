// FINANCE STATEMENT — manual send from the Finance Center ("Send statement now" / "Send reminder now").
// POST { type:'statement'|'reminder', ym?, ledger } -> emails all recipients via Resend.
const L = require('./finance-lib.js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  let type = 'statement', ym = '', ledger = { clients: [], entries: [] };
  try {
    const b = JSON.parse(event.body || '{}');
    type = b.type === 'reminder' ? 'reminder' : 'statement';
    ym = String(b.ym || '').trim();
    if (b.ledger && typeof b.ledger === 'object') ledger = b.ledger;
  } catch (e) {}
  if (!/^\d{4}-\d{2}$/.test(ym)) { const d = new Date(); ym = L.ymOf(d); }

  const data = L.computeStatement(ledger, ym);
  const subject = type === 'reminder'
    ? 'Reminder: SparkMyName referral due tomorrow — ' + data.monthLabel + ' (' + L.money(data.totalFee) + ')'
    : 'SparkMyName referral statement — Olin Creative · ' + data.monthLabel + ' (' + L.money(data.totalFee) + ' due)';
  const html = type === 'reminder' ? L.reminderHtml(data) : L.statementHtml(data);
  const sent = await L.sendMail(subject, html);
  return resp(200, { ok: sent.ok, type, ym, totalFee: data.totalFee, totalRevenue: data.totalRevenue, recipients: sent.to, error: sent.error });
};

function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) }; }
