// OLIN STATUS — the honesty kill-switch. The command center calls this on load. If Olin stops
// remitting the referral, Peter sets OLIN_ACTIVE=false in Netlify and the command center locks.
//
// Env: OLIN_ACTIVE ('false' = suspended; anything else = active), OLIN_SUSPEND_MSG (optional).
// GET → { active, message }

exports.handler = async () => {
  const active = String(process.env.OLIN_ACTIVE || 'true').toLowerCase() !== 'false';
  const message = process.env.OLIN_SUSPEND_MSG ||
    'Your Spark Agency Command Center is paused. This usually means a referral payment is outstanding. Please settle with SparkMyName to restore access — email support@sparkmyname.com.';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ active, message })
  };
};
