// FINANCE CRON — scheduled daily (see netlify.toml). Sends, hands-free:
//   • the full referral STATEMENT on the last day of each month, and
//   • a friendly REMINDER on the 9th (due tomorrow, the 10th).
// Reads the ledger the Finance Center synced to Netlify Blobs, and records what it has sent
// so it never double-sends. Emails go to all configured recipients via Resend.

const L = require('./finance-lib.js');
const STORE = 'olin-finance';
let _blobs;
async function getStoreSafe() {
  if (_blobs === undefined) {
    try { _blobs = await import(['@netlify', 'blobs'].join('/')); }
    catch (e) { _blobs = null; }
  }
  if (!_blobs) return null;
  try { return _blobs.getStore(STORE); } catch (e) { return null; }
}

function pad(n) { return (n < 10 ? '0' : '') + n; }
function ymOf(y, m) { return y + '-' + pad(m); } // m is 1-12

exports.handler = async () => {
  const now = new Date();
  const y = now.getUTCFullYear(), m = now.getUTCMonth() + 1, day = now.getUTCDate();
  const tomorrow = new Date(now.getTime() + 86400000);
  const isLastDay = tomorrow.getUTCMonth() !== now.getUTCMonth();
  const isNinth = day === 9;

  if (!isLastDay && !isNinth) return done({ skipped: true, reason: 'not a send day', day });
  const store = await getStoreSafe();
  if (!store) return done({ error: 'blobs_unavailable' });

  let ledger, sent;
  try {
    ledger = await store.get('ledger', { type: 'json' });
    sent = (await store.get('sent', { type: 'json' })) || {};
  } catch (e) { return done({ error: 'store_read_failed' }); }
  if (!ledger) return done({ error: 'no_ledger_synced' });

  const results = [];

  if (isLastDay) {
    const ym = ymOf(y, m);
    if (!sent['statement:' + ym]) {
      const data = L.computeStatement(ledger, ym);
      if (data.totalFee > 0 || data.rows.length) {
        const subject = 'SparkMyName referral statement — Olin Creative · ' + data.monthLabel + ' (' + L.money(data.totalFee) + ' due)';
        const r = await L.sendMail(subject, L.statementHtml(data));
        if (r.ok) { sent['statement:' + ym] = true; }
        results.push({ type: 'statement', ym, totalFee: data.totalFee, ok: r.ok, error: r.error });
      } else { results.push({ type: 'statement', ym, skipped: 'no revenue' }); }
    }
  }

  if (isNinth) {
    // reminder for the PREVIOUS month's statement (due tomorrow, the 10th)
    let py = y, pm = m - 1; if (pm < 1) { pm = 12; py -= 1; }
    const ym = ymOf(py, pm);
    if (!sent['reminder:' + ym]) {
      const data = L.computeStatement(ledger, ym);
      if (data.totalFee > 0) {
        const subject = 'Reminder: SparkMyName referral due tomorrow — ' + data.monthLabel + ' (' + L.money(data.totalFee) + ')';
        const r = await L.sendMail(subject, L.reminderHtml(data));
        if (r.ok) { sent['reminder:' + ym] = true; }
        results.push({ type: 'reminder', ym, totalFee: data.totalFee, ok: r.ok, error: r.error });
      } else { results.push({ type: 'reminder', ym, skipped: 'no fee due' }); }
    }
  }

  try { await store.setJSON('sent', sent); } catch (e) {}
  return done({ ran: true, date: now.toISOString(), results });
};

function done(obj) { return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) }; }
