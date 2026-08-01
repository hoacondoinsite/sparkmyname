# SPARKMYNAME — HANDOVER

## READ THIS FIRST — standing laws in this disc

Any session opening this zip should read these before changing anything. They are decisions
already made and paid for; re-litigating them wastes the Founder's time.

| Document | Governs |
|---|---|
| `docs/SPARK_DESIGN_LAW.md` | Colour, radius, buttons — aurora-navy, no gold, no exceptions |
| `docs/SPARK_LOGO_LAW.md` | Identity marks, the small-mark rules, presentation studies |
| `docs/SPARK_TYPOGRAPHY_LAW.md` | **NEW 25 July.** Inter for voice, JetBrains Mono for data, body 16px and everything a ratio of it. No licensed faces — ever. The customer keeps the files. |


## THE WORKSPACE IS NOW TWO FILES

`workspace.html` (152KB) loads `js/workspace-core.js` (442KB). A plain external script — no
`defer`, no `async` — so it executes at exactly the point the inline block did. The browser
caches the core between visits; the page was 592KB re-downloaded every time.

**Every harness had to be taught about this.** The moment the split happened, eleven suites
started passing while testing almost nothing, because they read inline `<script>` blocks and
found an empty page. `tools/preflight.js` caught all eleven — that is what its coverage
minimums are for. Harnesses now call `workspaceSource()`, which inlines the core IN PLACE so
execution order is identical to the browser's.

There is a gate for this: **the external core is present and loaded**. It fails if the file is
missing, if it shrinks below 300KB, if the page stops loading it, or if the code gets
duplicated back into the page.

## RUN THIS BEFORE SHIPPING ANY CHANGE

```
npm install jsdom              # dev only, never shipped
node tools/preflight.js        # everything, one command, hard exit code
rm -rf node_modules package*.json   # before zipping
```

**`preflight.js` runs all 18 suites plus 10 static gates and exits non-zero on any problem.**

It asserts on **coverage as well as pass/fail**. On 25 July `wire-check` silently collapsed
from 824 handlers to 22 while still printing "CLEAN" — a QA layer that fails quietly is worse
than none. Every suite now declares a minimum; a suite that stops testing is a failure.

Proven to catch a real regression: removing one `:focus-visible` rule makes it exit 1 and name
the exact control.

**Hand-rolled DOM shims are not enough and this was proved the hard way on 25 July.**
Five separate shims reported CLEAN while the live workspace was broken. A shim only reproduces
what the author remembered to write; it does not parse HTML, so it cannot see a mangled
attribute, and it answers every query with a phantom element, so it cannot see a missing one.

The bug that proved it: font stacks written as `"Didot","Bodoni MT"` were interpolated into
`style="font-family:..."` — a double-quoted attribute. The attribute terminated at the first
quote, the fonts never applied, and the browser parsed the rest as stray attributes. Every
shim passed. jsdom found it in one run.

## WHERE THE ENGINE STANDS

**154 download tiles across all 19 categories (A–S).** Every tile routes to a generator,
is classified into a lane, is registered for quality control, and is reachable. Zero
orphans.

**Measured, not estimated — re-verified 25 July:**

| Client input | Tiles usable |
|---|---|
| nothing entered | **96** |
| + phone | **130** (+34) |
| + phone and email | **151** (+55) |
| + phone, email and address | **154** (all) |

**58 tiles sit in the waiting lane** at launch with no details entered.

> **Correction, 25 July.** An earlier version of this handover said 95 usable and 59
> waiting. Both drifted by one when `doc-guardrails` was added to the ready lane. The
> figures above are measured directly from `SMN_READY` and `SMN_NEEDS`.
>
> A circulated version also stated **"15,000 total configuration paths."** That figure is
> not produced by this engine and does not correspond to anything measurable in it. It
> should not be repeated. Under the truth standard, a number that cannot be reproduced
> from the system is not a number.

**Verification:**
- 43 source gates, **574 checks**, run twice before every disc — currently all passing
- 5-pillar output gate on **rendered files**, running automatically at the end of every
  batch, with authority to reject the batch
- Three failure states proven by injecting real faults: clean → exit 0, gate missing →
  exit 1 (named as a toolchain fault), OCR unavailable → exit 1

---

## WHAT IS *NOT* VERIFIED

**Nobody has looked at any of it.**

My image viewing failed early in this session and never recovered. Every claim I have made
about this work is **measurement** — pixel comparisons, dimension checks, contrast
calculations, OCR. Not sight.

That distinction matters more than any number above. 574 passing checks tell you the work
has not broken in the ways we knew how to test for. They cannot tell you whether a client
will open their kit and feel proud of it.

Two tools exist to help you look:
- `tools/render-harness.js` + `tools/render-run.js` — executes the real generators outside
  the browser and writes actual PNG files
- `tools/eyes.py` — reads a rendered file as text: layout map, OCR of the words that
  printed, margins and balance

---

## WHAT IS NOT DEPLOYED

**None of it.** Every disc since roughly 03:30 on 24 July is untested on the live site.
That has accumulated into a very large batch — the exact situation the Shipping Law exists
to prevent, and it happened because we kept building.

**The three things worth checking first when you do deploy:**
1. **Logo pack and favicon** — do they look like your Starlit and Vinello examples again
2. **Yard sign** — readable from the street (measured at ~38 ft)
3. **Brand Details** — type a phone number and watch pieces unlock

---

## OPEN DECISIONS THAT ARE YOURS

- **The misspelled logo.** The Primary concept for Lighthouse Bay Realty reads
  **"Lightouse Bay"** — the second *h* is missing. Confirmed by OCR twice, and by the
  pre-flight gate independently. That is the art department's output, not the engine's, and
  no layout work fixes it. `tools/preflight.py` will now catch it at ingestion.
- **How the waiting lane displays before launch** — **58** individual tiles, one summary
  block, or hidden. (Not 59. A circulated version carried 59 in this section while
  correctly stating 58 elsewhere.)
- **The padding trim.** Placing logos by their artwork bounds rather than the file canvas
  is the one place I read Rule 1 liberally. It made marks 1.6–2.3× larger. Your call.
- **The "$8,000–$15,000 agency equivalent" claim.** It is a claim about competitors'
  pricing. Under your own truth standard it needs a source before it goes on the site.

---

## WHAT I GOT WRONG, KEPT SHORT

Recorded because the next session should not repeat them:

- Built a quality check that **locked you out of your own files**. QC is advisory now.
- Removed the vectorizer correctly, which **exposed a latent canvas-taint bug** that made
  downloads come out empty. Removing a layer can expose what the layer was accidentally
  solving.
- Sampled navy and gold off a logo image instead of reading Beach Bliss off the card.
- Shipped signage nobody could read from the street, and a mailer USPS would have rejected.
- Wrote HARNESS INTEGRITY into the spec, then swallowed an exit code with a pipe **ten
  minutes later**. Writing a rule down does not install it.

---

## THE RULE THAT GOVERNS ALL OF IT

> No count of passing checks means the work is good — only that it has not broken in the
> ways we know how to test for.

The mechanical engine is complete. Whether it is *good* is not a question this pipeline
can answer.
