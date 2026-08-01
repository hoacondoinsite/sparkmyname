// Live availability via free Verisign RDAP (reliable for .com AND .net).
// Per requested name we check .com first, then .net. Returns per name:
//   { available: bool, best: "name.com"|"name.net"|null, com: bool, net: bool }
// "available" = at least one of .com/.net is open. 404=available, 200=taken.
// Other endings (.ai/.co/.store) are shown client-side as "also claim" (no slow per-name live check).
// Cached 24h.

async function rdapAvailable(base, tld) {
  try {
    const res = await fetch("https://rdap.verisign.com/" + tld + "/v1/domain/" + base + "." + tld,
      { headers: { accept: "application/rdap+json" } });
    if (res.status === 404) return true;
    if (res.status === 200) return false;
    return null;
  } catch (e) { return null; }
}

exports.handler = async (event) => {
  const raw = (event.queryStringParameters && event.queryStringParameters.domains) || "";
  const list = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 12);
  const out = {};
  await Promise.all(list.map(async (d) => {
    const base = d.replace(/\.(com|net)$/, "").replace(/[^a-z0-9-]/g, "");
    if (!base) { out[d] = { available: false, best: null, com: false, net: false }; return; }
    const com = await rdapAvailable(base, "com");
    let net = null;
    if (com !== true) net = await rdapAvailable(base, "net");
    const comOK = com === true;
    const netOK = net === true;
    const best = comOK ? (base + ".com") : (netOK ? (base + ".net") : null);
    out[d] = { available: comOK || netOK, best: best, com: comOK, net: netOK };
  }));
  return {
    statusCode: 200,
    headers: { "content-type": "application/json", "cache-control": "public, max-age=86400", "access-control-allow-origin": "*" },
    body: JSON.stringify(out)
  };
};
