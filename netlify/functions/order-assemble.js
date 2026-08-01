// SparkMyName Agency OS — ASSEMBLER DISPATCHER (2026-07-05).
// Contract unchanged for the Foreman: POST { job_id } -> { ok }. Hands the heavy composition
// to order-assemble-background (202 in ms, awaited); the worker owns the atomic job claim,
// so double-dispatch remains impossible by construction.
'use strict';
exports.handler = async (event) => {
  const body = event.body || '{}';
  try {
    await fetch((process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://sparkmyname.netlify.app').replace(/\/$/, '') + '/.netlify/functions/order-assemble-background', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body,
    });
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, err: 'dispatch failed: ' + String(e && e.message || e) }) };
  }
  return { statusCode: 200, body: JSON.stringify({ ok: true, dispatched: true }) };
};
