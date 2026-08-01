// SITE CRAWL — given one URL, discovers the site's main pages (same-domain links on the
// homepage), fetches them, and returns their readable text so Page Studio can produce a
// master website upgrade report. Bounded for the serverless time limit.
//
// POST { url, max? } -> { pages:[{url,title,text}], count }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resp(405, { error: 'method' });
  let url = '', max = 12;
  try { const b = JSON.parse(event.body || '{}'); url = String(b.url || '').trim(); max = Math.max(1, Math.min(15, parseInt(b.max, 10) || 12)); } catch (e) {}
  if (!/^https?:\/\//i.test(url)) return resp(400, { error: 'bad_url' });
  let base;
  try { base = new URL(url); } catch (e) { return resp(400, { error: 'bad_url' }); }
  if (blocked(base.hostname)) return resp(400, { error: 'blocked_host' });

  try {
    const homeHtml = await getText(url, 8000);
    // collect same-origin page links from the homepage
    const links = new Set([normalize(base.href)]);
    const re = /href\s*=\s*["']([^"'#]+)["']/gi; let m;
    while ((m = re.exec(homeHtml)) && links.size < max * 3) {
      let href = m[1].trim();
      if (!href || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      let abs;
      try { abs = new URL(href, base); } catch (e) { continue; }
      if (abs.origin !== base.origin) continue;
      if (/\.(png|jpe?g|gif|svg|webp|ico|css|js|pdf|zip|mp4|woff2?|ttf)$/i.test(abs.pathname)) continue;
      links.add(normalize(abs.href));
    }
    const list = Array.from(links).slice(0, max);
    const pages = await Promise.all(list.map(async (u) => {
      try {
        const html = (u === normalize(base.href)) ? homeHtml : await getText(u, 5000);
        const t = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
        return { url: u, title: decode(t).trim().slice(0, 160), text: htmlToText(html).slice(0, 6000) };
      } catch (e) { return null; }
    }));
    const out = pages.filter(p => p && p.text && p.text.length > 40);
    return resp(200, { pages: out, count: out.length });
  } catch (e) {
    return resp(502, { error: 'crawl_failed' });
  }
};

async function getText(u, ms) {
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SparkPageStudio/1.0)' }, redirect: 'follow', signal: ctrl.signal });
    const t = await r.text(); clearTimeout(to); return t;
  } finally { clearTimeout(to); }
}
function normalize(u) { try { const x = new URL(u); x.hash = ''; return x.href.replace(/\/$/, '') || x.href; } catch (e) { return u; } }
function blocked(h) { return /^(localhost$|127\.|10\.|192\.168\.|169\.254\.|0\.)/i.test(h) || h.endsWith('.internal'); }
function htmlToText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<(?:h[1-6]|p|div|section|li|br|tr|header|footer|nav|button|a)\b[^>]*>/gi, '\n')
    .replace(/<\/(?:h[1-6]|p|div|section|li|tr|header|footer|nav)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'").replace(/&quot;|&ldquo;|&rdquo;/gi, '"').replace(/&mdash;/gi, '—')
    .replace(/&[a-z0-9#]+;/gi, ' ').replace(/[ \t]+/g, ' ').replace(/\n[ \t]*\n+/g, '\n\n').replace(/^\s+|\s+$/g, '');
}
function decode(s) { return String(s).replace(/&amp;/gi, '&').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, ' '); }
function resp(code, obj) { return { statusCode: code, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(obj) }; }
