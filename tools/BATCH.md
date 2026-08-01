# BATCH — multi-brand deliverable processing (SOP-MBI-500)

    node tools/batch.js        # renders every brand record into its own folder

## What it does

**Phase 1 — intake.** Every brand becomes a structured record: `brand_id`,
`business_category`, `primary_name`, `colour_palette_hex`, domain, tagline, logo suite,
photographs, and copy. That record is the only input the pipeline reads.

**Phase 2 — render.** The record runs through the **live engine generators**, not a
separate batch renderer. One code path, so a fix in the workspace reaches every brand.

**Phase 3 — copy.** Tagline, about text and why-points travel with the record and land in
the pieces that use them.

**Phase 4 — QA.** Per-brand OCR of the brand name, file count, palette presence, and the
mandatory disclaimer. See also `preflight.py` for the spelling gate that should run at
art-department ingestion.

**Phase 5 — package.** One folder per brand containing the rendered files,
`brand.json`, and `DISCLAIMER.txt`.

## Proven on real data

Six real brands — real logo suites, real photographs, per-brand copy:

- **Zero identical pairs** across all 15 brand-to-brand comparisons
- **Six distinct logo fingerprints**
- **Zero QA issues**

## What this file does NOT do

Phase 5 of the SOP describes issuing an invoice and executing a payment transfer. This
script does not touch money, invoicing or payment rails, and it should not. Financial
execution is a human decision made in a system with its own authorisation.
