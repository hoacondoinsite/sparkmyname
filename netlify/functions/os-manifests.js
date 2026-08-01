// SparkMyName Agency OS — Deliverable Manifests (NEW FILE, Phase B foundation)
// Vault law: deliverables are DATA. Adding a deliverable = adding a manifest entry.
// The Foreman never knows what a "report" is — it runs the next task.
// Tier: NEEDS-ONLY (Founder directive, 2026-07-05). AI budget: 4–6 calls/order.
'use strict';

// Each task: { key, dept, type, required, ai }  — ai=true counts against the call budget.
// Department registry maps dept -> the locked function it calls over HTTP (or code-only work).
const TIERS = {
  needs_only_v1: {
    label: 'Needs-Only Brand Identity ($29)',
    aiBudget: 6, // names, judge, copy kit (lead name), main image, optional support image
    tasks: [
      // THE BRAND GOVERNOR (SOP-BG-001 Phase 1, 2026-07-05): runs FIRST, from the seed
      // alone — the brain at the front door. Optional + switched: absent = today's system.
      { key: 'governor',     dept: 'governor', type: 'brand_brief',    required: false, ai: true,  switch: 'SMN_GOVERNOR' },
      { key: 'names',        dept: 'naming',  type: 'generate_names',   required: true,  ai: true  }, // clean-names.js — up to 2 waves of 8, open domains, why-lines
      { key: 'judge',        dept: 'judge',   type: 'score_names',      required: true,  ai: true  }, // judge-names.js — scores + legal gate, merged onto names
      // THE SELECTION GATE (SOP-BG-001 Phase 2): the Governor reviews the judged pool
      // before ANYTHING is released — kill-reasons ledgered. Optional + switched.
      { key: 'gate',         dept: 'gate',    type: 'gate_review',      required: false, ai: true,  switch: 'SMN_GATE' },
      { key: 'copy_kit',     dept: 'copy',    type: 'kit_lead_name',    required: true,  ai: true  }, // build-kit.js — full kit for the LEAD name (chosen-name path)
      // IMAGERY & LOGOS fire INSIDE the Assembler AFTER save-report, keyed to the report —
      // the baton's proven pattern (art-department-background + logo-concepts, behind their
      // existing switches SMN_ART_DEPT / SMN_LOGO_DEPT). They are never pre-report tasks.
      // Print basics (card, letterhead, summary) are Phase-A board work — slot reserved,
      // shipped behind SMN_PRINT_BASICS (default off; Assembler skips gracefully).
      { key: 'print_basics', dept: 'design',  type: 'print_boards',     required: false, ai: false, switch: 'SMN_PRINT_BASICS' },
      { key: 'assemble',     dept: 'assembler', type: 'compose_report', required: true,  ai: false }, // composes + reveals + triggers art/logos + emails
    ],
    // Card content caps (Founder-locked counts) — the Assembler enforces these so the
    // Brand Identity Strategy card is never overloaded, whatever the departments return.
    caps: { names: parseInt(process.env.SMN_FINAL_NAMES || '6', 10), taglines: 3, bios: 2, posts: 3, voiceBullets: 4, colors: 4 } /* CO-55: Founder dozen experiment — env-tunable, 6 remains law by default */,
    // Studio sections the composed report must cover (promise ledger, machine-readable).
    sections: ['names','logos','brand_look','words','social_profiles','website_domain','brand_images','summary_assets'],
  },
};

function manifestFor(tier) { return TIERS[tier] || TIERS.needs_only_v1; }
function activeTasks(tier, env) {
  const m = manifestFor(tier);
  return m.tasks.filter(t => !t.switch || String((env || process.env)[t.switch] || '').toLowerCase() === 'on');
}
module.exports = { TIERS, manifestFor, activeTasks };
