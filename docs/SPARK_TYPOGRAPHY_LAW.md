# SPARK TYPOGRAPHY LAW

**Founder order, 25 July 2026. Permanent.** Governs the type on the brand card and on anything
presented to a client.

---

## The rule in one line

**Inter for voice. JetBrains Mono for data. Body is 16px and everything else is a ratio of it.**

---

## The scale

Declared as CSS variables in `workspace.html`. Change the variable, not the rule.

| Role | Variable | Value | Ratio to body |
|---|---|---|---|
| Body | `--t-body` | 16px | 1.0 |
| Section headings | `--t-head` | 18px | 1.125 |
| Tagline | `--t-tag` | 20px | 1.25 |
| Brand name | `--t-name` | 48px | 3.0 |
| Data (hex, counts, handles) | `--t-data` | 13px | — |
| Line height | `--lh-body` | 1.5 | 150% |

Under 640px the brand name drops to 34px and the tagline to 18px. Nothing else moves.

**Sizes are expressed as ratios on purpose.** Professional brand guidelines fix the body size
and describe every other level in relation to it, rather than nailing each heading to a pixel
value. Weight carries hierarchy as much as size — headings are 700 at 1.125×, not 400 at 2×.

---

## Why these two faces

The reference face of the identity discipline is **Neue Haas Grotesk** — Helvetica's original
1957 form by Max Miedinger, before Linotype adapted it for hot metal. Designers choose it over
Helvetica for its more generous spacing, nuanced terminal cuts and greater letter-height
variation; it keeps a warmth Helvetica lost. A Pentagram partner lists it first among the
classics worth studying.

The studio pattern to copy is **one grotesque for voice, one mono for data**. Pentagram used
exactly that on Oxide: Neue Haas Grotesk throughout, with a mono reserved for information-led
features — diagrams and product UI.

**Neue Haas Grotesk and GT America are licensed.** Desktop licences start around $50 a weight
and enterprise deployment runs into five figures. SparkMyName ships files the customer keeps
forever; shipping a licensed face would make every download a liability.

So:

- **Inter** (SIL Open Font License) — the closest honest substitute. Same neo-grotesque
  skeleton, tall x-height, open apertures, drawn for screens, with real tabular figures. Free
  to use commercially and free to redistribute inside a customer's kit.
- **JetBrains Mono** (OFL) — the data column. Slightly taller than Roboto Mono with better hex
  legibility.

Inter is loaded with its **variable optical size** (`opsz 14..32`). The brand name sets
`font-variation-settings:'opsz' 32`, which is the Display cut — drawn for large sizes with
tighter spacing and sharper terminals. This is what a separate "Display" family would give you,
in the same font file.

---

## What goes in mono, and what does not

**Mono** — hex codes, section counts, social handles, the domain. These are *specifications*.
Setting them in mono makes them read as facts rather than opinions, and tabular figures keep
four hex codes in a row from dancing.

**Grotesque** — the colour NAME ("Dusty Rose"), every heading, all body copy, the tagline.
These are *language*.

The tagline is **italic**. That marks it as the brand speaking, rather than us describing the
brand.

---

## What this law does NOT govern

The type specimens **inside** the Typography section of the brand card — Snell Roundhand,
Rockwell, Futura, Didot and the rest. Those are system faces demonstrating the customer's own
type directions. They are content, not interface, and they must not be normalised to Inter.

See `TYPEFACE_FOR` / `TYPEFACES_FOR` in `workspace.html`, which resolve those as a set so no two
directions in one suite can land on the same face.

---

## Where it lives

| File | What |
|---|---|
| `workspace.html` `<head>` | The Google Fonts link — Inter variable + italic, JetBrains Mono |
| `workspace.html` `:root` | `--t-*`, `--lh-body`, `--mono` |
| `docs/SPARK_DESIGN_LAW.md` | Colour, radius, buttons — this document is its typographic half |

---

## Before changing any of this

Run **`node tools/render-check.js`**. It loads the workspace in a DOM shim, calls `mainHTML`,
and reports what actually rendered. Two spinners on 25 July were caused by helper functions
placed inside `mainHTML` where a sibling function could not see them — both were invisible to
`node --check` and to every test, because the syntax was valid and the identifier existed
*somewhere* in the file. Only executing it finds that class of fault.

*SparkMyName · Owned by VORREX IGNITE LLC · U.S. Patent Pending (App. 19/704,386)*
