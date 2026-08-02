// fulfillmentRouter.js — where a finished asset goes to get made.
// Maps any format in formatCatalog to a production partner and returns the REAL production
// spec for that format (pulled from the catalog, never guessed).
//
// Dependency-free CommonJS (ESM `export` breaks the Netlify build, so this uses exports).
//
// TRUTH RAILS:
//  - These are PLAIN REFERRAL links. SparkMyName earns nothing from them and has no affiliate
//    arrangement in place. Nothing here implies a commission or a partnership that isn't real.
//  - The customer's files are theirs; a partner is a convenience, never a requirement. Every
//    route therefore also offers "take the files anywhere".
//  - Specs come from formatCatalog.specFor(), so what we tell a printer matches what we made.
//  - Formats flagged render:'spec' return needsLayoutWork:true — we never route a customer to
//    order something the engine cannot output yet.

var CATALOG = require('./formatCatalog');

var ROUTES = {
  apparel: {
    partner: 'Printify', url: 'https://printify.com',
    action: 'Make it on Printify',
    alternates: ['Printful', 'Custom Ink'],
    notes: 'Transparent high-resolution PNG at the print area size, no bleed (apparel prints edge-free).'
  },
  merch: {
    partner: 'Printify', url: 'https://printify.com',
    action: 'Make merch on Printify',
    alternates: ['Printful', 'Sticker Mule'],
    notes: 'Wrap artwork sized to the item dieline; confirm the wrap template with the maker before ordering.'
  },
  print: {
    partner: 'Vistaprint', url: 'https://www.vistaprint.com',
    action: 'Print it',
    alternates: ['MOO', 'your local print shop'],
    notes: 'Print-ready PDF at true trim size with bleed and crop marks.'
  },
  signage: {
    partner: 'BuildASign', url: 'https://www.buildasign.com',
    action: 'Order signs & banners',
    alternates: ['Vistaprint Signage', 'Displays2Go'],
    notes: 'Large-format file at scaled resolution; large pieces are printed at lower DPI by design because they are viewed from a distance.'
  },
  packaging: {
    partner: 'Packlane', url: 'https://packlane.com',
    action: 'Order packaging',
    alternates: ['Sticker Mule', 'Vistaprint'],
    notes: 'Artwork must be placed on the supplier dieline before production.'
  },
  digital: {
    partner: null, url: null,
    action: 'Download the files',
    alternates: [],
    notes: 'Ready-to-post files at the exact platform pixel size. Nothing to print.'
  }
};

// Catalog suite -> route bucket.
var SUITE_ROUTE = {
  apparel: 'apparel', merch: 'merch', packaging: 'packaging',
  print: 'print', signage: 'signage',
  creator: 'digital', social: 'digital', display: 'digital'
};

function routeFor(formatKey, brandProfile) {
  var spec = CATALOG.specFor(formatKey);
  if (!spec) {
    return { ok: false, error: 'unknown format: ' + formatKey,
             hint: 'valid keys come from formatCatalog.FORMATS' };
  }
  var bucket = SUITE_ROUTE[spec.suite] || 'digital';
  var r = ROUTES[bucket];
  var brand = brandProfile || {};

  return {
    ok: true,
    brandName: brand.brand_name || brand.businessName || '',
    format: { key: spec.key, label: spec.label, suite: spec.suite },
    // real production spec, straight from the catalog — never invented
    production: {
      widthIn: spec.widthIn, heightIn: spec.heightIn,
      pixelW: spec.pixelW, pixelH: spec.pixelH,
      dpi: spec.dpi, bleedIn: spec.bleedIn, orientation: spec.orientation
    },
    fulfillment: {
      kind: bucket,
      partner: r.partner, url: r.url, action: r.action,
      alternates: r.alternates,
      notes: r.notes,
      // Honest framing, always shown alongside any partner:
      disclosure: r.partner
        ? 'A suggestion only — these are direct links, SparkMyName earns nothing from them. Your files are yours; take them to any printer you like.'
        : 'Your files, ready to use.'
    },
    // Never route someone to order something we cannot actually output yet.
    needsLayoutWork: spec.render === 'spec',
    layoutNote: spec.render === 'spec' ? (spec.note || 'this format still needs layout work before ordering') : ''
  };
}

// Group every catalog format by where it would be fulfilled — useful for the workspace UI.
function routeSummary() {
  var out = {};
  CATALOG.FORMATS.forEach(function (f) {
    var bucket = SUITE_ROUTE[f.suite] || 'digital';
    out[bucket] = (out[bucket] || 0) + 1;
  });
  return out;
}

module.exports = { routeFor: routeFor, routeSummary: routeSummary, ROUTES: ROUTES };
