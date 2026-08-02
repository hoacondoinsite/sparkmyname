/* ============================================================================
   SPARK UI — the component layer.   window.SparkUI
   ----------------------------------------------------------------------------
   WHY
   The workspace was assembled by concatenating raw HTML strings inline. That is
   why sections drifted, why the Downloads tab stacked seven unrelated blocks,
   and why every new panel was a fresh guess. This module turns a panel into a
   DECLARED COMPOSITION of sections instead of a pile of strings.

   DESIGN CONSTRAINTS (deliberate, not accidental)
   · Plain script, no ESM. workspace-core.js is a classic script; a single
     `import` here would stop the entire 6,600-line dashboard from parsing.
   · Pure functions returning HTML strings, so it drops into the existing render
     path with zero rewiring. Adoption is per-section and reversible.
   · Everything escapes by default. A brand name is user input and is treated
     as hostile until escaped.
   · No inline colour or spacing values — components emit token-driven classes
     only (see css/spark-ui.css). That is what makes the system composable.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- safety ----------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // Attribute values get the same treatment; URLs additionally refuse javascript:
  function escUrl(u) {
    var s = String(u == null ? '' : u).trim();
    if (/^javascript:/i.test(s) || /^data:text\/html/i.test(s)) return '#';
    return esc(s);
  }
  function cls() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      if (!a) continue;
      if (typeof a === 'string') out.push(a);
      else if (typeof a === 'object') for (var k in a) if (a[k]) out.push(k);
    }
    return out.join(' ');
  }
  function attrs(o) {
    if (!o) return '';
    var s = '';
    for (var k in o) {
      if (o[k] === false || o[k] == null) continue;
      s += ' ' + k + (o[k] === true ? '' : '="' + esc(o[k]) + '"');
    }
    return s;
  }
  function join(parts) {
    return (parts || []).filter(Boolean).join('');
  }

  /* ---- layout primitives ------------------------------------------------- */
  function Stack(children, opts) {
    opts = opts || {};
    return '<div class="' + cls('sp-stack', opts.size === 'sm' && 'sp-stack-sm', opts.size === 'lg' && 'sp-stack-lg', opts.className) + '"' + attrs(opts.attrs) + '>' + join(children) + '</div>';
  }
  function Row(children, opts) {
    opts = opts || {};
    return '<div class="' + cls('sp-row', opts.tight && 'sp-row-tight', opts.stackOnMobile && 'sp-row--stack-mobile', opts.className) + '">' + join(children) + '</div>';
  }
  function Spread(left, right, opts) {
    opts = opts || {};
    return '<div class="' + cls('sp-spread', opts.className) + '">' + (left || '') + (right || '') + '</div>';
  }
  function Grid(children, opts) {
    opts = opts || {};
    var mode = opts.columns === 2 ? 'sp-grid-2' : opts.columns === 3 ? 'sp-grid-3' : 'sp-grid-auto';
    return '<div class="' + cls('sp-grid', mode, opts.className) + '">' + join(children) + '</div>';
  }

  /* ---- SECTION — the unit every panel is built from ---------------------- */
  function Section(o) {
    o = o || {};
    var action = o.action
      ? '<a class="sp-section__action" href="' + escUrl(o.action.href || '#') + '"' + attrs(o.action.attrs) + '>' + esc(o.action.label) + '</a>'
      : '';
    var head = (o.title || action)
      ? '<div class="sp-section__head"><div><h3 class="sp-section__title">' + esc(o.title || '') + '</h3>' +
        (o.note ? '<p class="sp-section__note">' + esc(o.note) + '</p>' : '') + '</div>' + action + '</div>'
      : '';
    return '<section class="' + cls('sp-section', o.className) + '"' + attrs(o.attrs) + '>' + head + (o.body || '') + '</section>';
  }

  /* ---- surfaces ---------------------------------------------------------- */
  function Card(body, o) {
    o = o || {};
    var tag = o.href ? 'a' : 'div';
    var extra = o.href ? ' href="' + escUrl(o.href) + '"' + (o.newTab ? ' target="_blank" rel="noopener"' : '') : '';
    return '<' + tag + ' class="' + cls('sp-card', o.quiet && 'sp-card--quiet', o.raised && 'sp-card--raised',
      (o.href || o.interactive) && 'sp-card--interactive', o.className) + '"' + extra + attrs(o.attrs) + '>' + (body || '') + '</' + tag + '>';
  }
  function Pod(body, o) {
    o = o || {};
    return '<div class="' + cls('sp-pod', o.className) + '"' + attrs(o.attrs) + '>' + (body || '') + '</div>';
  }

  /* ---- type -------------------------------------------------------------- */
  function Display(t, o) { return '<h1 class="' + cls('sp-display', (o || {}).className) + '">' + esc(t) + '</h1>'; }
  function Title(t, o)   { return '<h2 class="' + cls('sp-title', (o || {}).className) + '">' + esc(t) + '</h2>'; }
  function Body(t, o)    { return '<p class="' + cls('sp-body', (o || {}).className) + '">' + esc(t) + '</p>'; }
  function Small(t, o)   { return '<p class="' + cls('sp-small', (o || {}).className) + '">' + esc(t) + '</p>'; }
  function Micro(t, o)   { return '<p class="' + cls('sp-micro', (o || {}).className) + '">' + esc(t) + '</p>'; }

  /* ---- controls ---------------------------------------------------------- */
  function Button(label, o) {
    o = o || {};
    var variant = o.variant === 'secondary' ? 'sp-btn--secondary' : o.variant === 'quiet' ? 'sp-btn--quiet' : '';
    var tag = o.href ? 'a' : 'button';
    var extra = o.href
      ? ' href="' + escUrl(o.href) + '"' + (o.newTab ? ' target="_blank" rel="noopener"' : '')
      : ' type="button"' + (o.disabled ? ' disabled' : '');
    return '<' + tag + ' class="' + cls('sp-btn', variant, o.className) + '"' + extra + attrs(o.attrs) + '>' +
      (o.icon ? '<span aria-hidden="true">' + o.icon + '</span>' : '') + esc(label) + '</' + tag + '>';
  }
  function Field(o) {
    o = o || {};
    var id = o.id || ('sp-f-' + Math.random().toString(36).slice(2, 8));
    var label = o.label ? '<label class="sp-visually-hidden" for="' + esc(id) + '">' + esc(o.label) + '</label>' : '';
    if (o.multiline) {
      return label + '<textarea id="' + esc(id) + '" class="' + cls('sp-field', o.className) + '" rows="' + (o.rows || 2) +
        '" placeholder="' + esc(o.placeholder || '') + '"' + attrs(o.attrs) + '></textarea>';
    }
    return label + '<input id="' + esc(id) + '" class="' + cls('sp-field', o.className) + '" type="' + esc(o.type || 'text') +
      '" placeholder="' + esc(o.placeholder || '') + '" value="' + esc(o.value || '') + '"' + attrs(o.attrs) + '>';
  }
  function Badge(label, kind) {
    var k = kind === 'wait' ? 'sp-badge--wait' : kind === 'off' ? 'sp-badge--off' : 'sp-badge--ok';
    return '<span class="' + cls('sp-badge', k) + '">' + esc(label) + '</span>';
  }

  /* ---- TABS — accessible by construction, not by afterthought ------------ */
  function Tabs(items, activeId, o) {
    o = o || {};
    var name = o.name || 'tabs';
    var buttons = (items || []).map(function (t) {
      var on = t.id === activeId;
      return '<button class="sp-tab" role="tab" aria-selected="' + (on ? 'true' : 'false') + '" tabindex="' + (on ? '0' : '-1') +
        '" id="' + esc(name + '-t-' + t.id) + '" aria-controls="' + esc(name + '-p-' + t.id) + '" data-sptab="' + esc(t.id) + '">' +
        esc(t.label) + (t.count != null ? ' <span aria-hidden="true">· ' + esc(t.count) + '</span>' : '') + '</button>';
    }).join('');
    var panels = (items || []).map(function (t) {
      var on = t.id === activeId;
      return '<div role="tabpanel" id="' + esc(name + '-p-' + t.id) + '" aria-labelledby="' + esc(name + '-t-' + t.id) + '"' +
        (on ? '' : ' hidden') + ' data-sppanel="' + esc(t.id) + '">' + (t.body || '') + '</div>';
    }).join('');
    return '<div class="sp-tabgroup" data-sptabgroup="' + esc(name) + '">' +
      '<div class="sp-tabs" role="tablist" aria-label="' + esc(o.label || 'Sections') + '">' + buttons + '</div>' + panels + '</div>';
  }

  /* One delegated listener drives every tab group on the page, including
     arrow-key navigation. Bound once; safe to call the renderer repeatedly. */
  function mountTabs(root) {
    root = root || document;
    if (window.__spTabsBound) return;
    window.__spTabsBound = 1;
    function select(group, id) {
      group.querySelectorAll('[data-sptab]').forEach(function (b) {
        var on = b.getAttribute('data-sptab') === id;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
      group.querySelectorAll('[data-sppanel]').forEach(function (p) {
        if (p.getAttribute('data-sppanel') === id) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
      });
    }
    document.addEventListener('click', function (ev) {
      var b = ev.target && ev.target.closest && ev.target.closest('[data-sptab]');
      if (!b) return;
      var g = b.closest('[data-sptabgroup]'); if (!g) return;
      ev.preventDefault(); select(g, b.getAttribute('data-sptab'));
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
      var b = document.activeElement;
      if (!b || !b.getAttribute || !b.getAttribute('data-sptab')) return;
      var g = b.closest('[data-sptabgroup]'); if (!g) return;
      var all = [].slice.call(g.querySelectorAll('[data-sptab]'));
      var i = all.indexOf(b), n = ev.key === 'ArrowRight' ? i + 1 : i - 1;
      if (n < 0) n = all.length - 1; if (n >= all.length) n = 0;
      all[n].focus(); select(g, all[n].getAttribute('data-sptab'));
    });
  }

  /* ---- PANEL — a panel is a declared list of sections, never a string pile */
  function Panel(sections) {
    return '<div class="sp-panel">' + (sections || []).filter(Boolean).map(function (s) {
      return typeof s === 'string' ? s : Section(s);
    }).join('') + '</div>';
  }

  window.SparkUI = {
    esc: esc, escUrl: escUrl, cls: cls,
    Stack: Stack, Row: Row, Spread: Spread, Grid: Grid,
    Section: Section, Panel: Panel, Card: Card, Pod: Pod,
    Display: Display, Title: Title, Body: Body, Small: Small, Micro: Micro,
    Button: Button, Field: Field, Badge: Badge,
    Tabs: Tabs, mountTabs: mountTabs,
    version: '1.0.0'
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountTabs(); });
  else mountTabs();
})();
