# ENGINE INTENT & AUDIT NOTE — READ BEFORE TESTING OR CERTIFYING
SparkMyName™ OS · per Methodology v2 Handbook (2026-06-23) and Generator QA Benchmark
© 2026 SparkMyName™. Owned by VORREX IGNITE LLC. All rights reserved.
U.S. Patent Pending (App. 19/704,386). CONFIDENTIAL & PROPRIETARY.

---

## Why certain "tell-tale" words appear in this code ON PURPOSE

Words such as **ember, haven, grove, nexus, harmony, forge, apex, summit, granite,
sterling, cedar, anchor, pinnacle, peak, meridian, compass, cardinal** are present in
this codebase **by design**, as part of the avoid-list / suppression-list /
`CRUTCH_FILTER`.

This is a documented quality mechanism — see Methodology v2 Handbook, Section 1
(checks 3 & 5) and Section 3 (field 4, "Banned Vocabulary"), and Generator QA
Benchmark measure #6 ("Vocabulary Drift"). Their job is to be **blocked, never
produced.** They raise quality by screening out generic crutch fallbacks. They do
not hinder quality — they protect it.

## The rule for any test or certification

- **Intentional — do NOT flag:** these words appearing inside a block-list,
  avoid-list, suppression-list, banned-vocabulary array, or the `CRUTCH_FILTER`.
  That is the cure, not the disease.

- **Defect — DO flag:** these words appearing in (a) the live generator's **output**,
  (b) any "love" / approved-exemplar / anchor list that is fed into a prompt and can
  reach output, or (c) any old-engine file wired as a **generator**.

## Current frozen state

- `clean-names.js` is the **sole** name generator. It blocks the words above two
  ways: in its prompt (banned list) and via `CRUTCH_FILTER` (env switch, default on).
- The old-engine exemplar "feeders" were removed from `judge-names.js` and
  `build-kit.js`.
- `name-intel.js` remains imported by `judge-names.js` for **safety only** —
  profanity (`isSafeName`) and famous-trademark collision (`isClearName`). It feeds
  no crutch words and produces no names.
- The four legacy files (`generate-names.js`, `category-dna.js`, `name-intel.js`,
  `category-identity-guard.js`) are frozen and must never be wired as a generator.

## Bottom line for the tester

Finding these words in an avoid / block list is **expected and correct.** Treat it as
a failure only if a banned word reaches **output**, or a graveyard file is wired as a
**generator.**
