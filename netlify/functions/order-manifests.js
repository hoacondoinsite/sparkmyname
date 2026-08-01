// order-manifests.js — DELIVERABLES ARE DATA (Agency OS, validated test T7). NOT an endpoint.
// Adding a new deliverable = adding a manifest here. The Foreman, Watchdog and Assembler
// never change. Task 'dept' values map to the dispatch table in order-foreman-background.js.
// Versioned: never edit a shipped manifest in place — add _v2 and point tiers at it.
var LANES = ['professional', 'standard', 'clever', 'human'];

function num(env, dflt) { var v = parseInt(process.env[env] || '', 10); return isNaN(v) ? dflt : v; }

var MANIFESTS = {
  // T1 — mirrors the live baton stage-for-stage, as crumbs. Payload contracts copied
  // verbatim from deliver-background.js (clean-names/judge-names/build-kit/save-report/send-kit).
  identity_report_v1: function () {
    var tasks = [];
    LANES.forEach(function (L) { tasks.push({ dept: 'naming', type: 'wave', input: { lane: L, count: num('ORDER_GEN_PER_LANE', 6) }, optional: true }); });
    tasks.push({ dept: 'judge', type: 'rank', input: {} });
    var K = num('ORDER_KITS', 8);
    for (var i = 0; i < K; i++) tasks.push({ dept: 'copy', type: 'kit', input: { rank: i }, optional: true }); // a failed kit skips that name, never the order (live-baton parity)
    tasks.push({ dept: 'deliver', type: 'save', input: {} });
    tasks.push({ dept: 'cinema', type: 'header', input: {}, optional: true });   // library-first; late-attach
    tasks.push({ dept: 'deliver', type: 'email', input: {}, optional: true });   // auto-skips in shadow / qa
    return tasks;
  },
  // T2/T3+ slots — present from day one; departments activate later by switch.
  small_applications_v1: function () { return [{ dept: 'apps', type: 'scenes', input: {}, optional: true }]; },
  brand_website_v1:      function () { return [{ dept: 'web', type: 'onepager', input: {}, optional: true }]; },
  campaign_pack_v1:      function () { return [{ dept: 'campaign', type: 'pack', input: {}, optional: true }]; },
  print_pack_v1:         function () { return [{ dept: 'print', type: 'pdfs', input: {}, optional: true }]; }
};

var TIERS = {
  t1: ['identity_report_v1'],
  t2: ['identity_report_v1', 'small_applications_v1'],
  t4: ['identity_report_v1', 'small_applications_v1', 'brand_website_v1']
};

function buildTasks(jobId, tier) {
  var names = TIERS[tier] || TIERS.t1;
  var rows = []; var n = 0;
  names.forEach(function (m) {
    (MANIFESTS[m] ? MANIFESTS[m]() : []).forEach(function (t) {
      n++;
      var id = jobId + '-t' + String(n).padStart(3, '0');
      rows.push({ id: id, job_id: jobId, dept: t.dept, type: t.type, input: t.input || {},
        optional: !!t.optional, status: 'pending', attempts: 0, artifact: null,
        idem_key: jobId + ':' + t.dept + ':' + t.type + ':' + (t.input && t.input.lane || t.input && t.input.rank != null ? (t.input.lane || t.input.rank) : n),
        not_before: new Date(0).toISOString() });
    });
  });
  return rows;
}

module.exports = { MANIFESTS: MANIFESTS, TIERS: TIERS, buildTasks: buildTasks, LANES: LANES };
