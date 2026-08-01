// PAGE FETCH — reads a public web page and returns its readable text so the Page Studio AI tool
// can rewrite it into a redesign brief. Server-side (avoids browser CORS). Basic SSRF guard.
//
// POST { url } -> { title, text }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  let url = '';
  try { url = String(JSON.parse(event.body || '{}').url || '').trim(); } catch (e) {}
  if (!/^https?:\/\//i.test(url)) return resp(400, { error: 'bad_url' });
  let host = '';
  try { host = new URL(url).hostname; } catch (e) { return resp(400, { error: 'bad_url' }); }
  if (/^(localhost$|127\.|10\.|192\.168\.|169\.254\.|0\.|\[?::1\]?$)/i.test(host) || host.endsWith('.internal')) {
    return resp(400, { error: 'blocked_host' });
  }
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SparkPageStudio/1.0; +https://sparkmyname.com)' },
      redirect: 'follow', signal: ctrl.signal
    });
    clearTimeout(to);
    const html = await r.text();
    const t = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    return resp(200, { title: decode(t).trim().slice(0, 200), text: htmlToText(html).slice(0, 12000) });
  } catch (e) {
    return resp(502, { error: 'fetch_failed' });
  }
};

function htmlToText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<(?:h[1-6]|p|div|section|li|br|tr|header|footer|nav|button|a)\b[^>]*>/gi, '\n')
    .replace(/<\/(?:h[1-6]|p|div|section|li|tr|header|footer|nav)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'").replace(/&quot;|&ldquo;|&rdquo;/gi, '"').replace(/&mdash;/gi, '—')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]*\n+/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');
}
function decode(s) { return String(s).replace(/&amp;/gi, '&').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, ' '); }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(obj) }; }
