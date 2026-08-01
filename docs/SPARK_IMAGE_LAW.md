# SPARK IMAGE LAW — RETIRED PATHS, DO NOT REVIVE
**Founder order, 27 July 2026. Permanent. Changeable only by the Founder.**

Two things in this codebase produced work the Founder rejected. Both are retired. This file
exists so nobody — human or AI — quietly brings them back while "fixing" something else.

A machine guard enforces every rule below: `tools/image-law-check.js`. If a rule is broken the
check fails and says which one. Run it before shipping any disc that touches images.

---

## 1. THE VINTAGE PHOTO LIBRARY — abandoned, never referenced

**What happened.** The art department banks **one photograph per industry and reuses it
forever** (`art-department-background.js`). Photographs banked during the July‑17 "Agency Pivot"
— editorial / film‑grain / desaturated language — kept being served to every new order in that
industry long after the cinematic prompt was restored on 23 July. A library **hit never calls the
model**, so no prompt fix could ever reach them.

**The rule.** The shelf is versioned. The current generation is:

```
library/v2/{industryKey}.png
```

- **NEVER** construct `library/{key}.png` again. The flat path is the vintage shelf.
- The old files are **not deleted** — deleting risks breaking a live order mid‑read. They are
  orphaned: nothing points at them, nothing looks them up, nothing reuses them.
- If a future prompt change ever warrants another clean slate, bump `LIBRARY_GENERATION` in
  `art-department-background.js`. That is the only line that should change.

**Self‑healing.** An old order still holds the old URL in its own kit. `refresh-art.js` detects
that on open, re‑runs the art department for that order, and tells the customer fresh
photography is on the way. Old orders repair themselves as they are visited.

---

## 2. AGEING LANGUAGE — banned from the brand‑photo path

The words below must not appear in **live code** on `studio-engine.js`,
`art-department-background.js`, or `art-render-background.js`:

> film grain · vintage · retro · sepia · faded · antique · nostalgic · desaturated ·
> washed‑out · editorial

**Deliberately NOT covered by this ban:**
- **Film producers** (`*-produce-background.js`) — cinematic films *want* "film grain, deeply
  human." That is the intended look and must not be stripped.
- **`name-intel.js`** — "antique shop", "thrift / vintage" are *business categories*. A customer
  opening an antique shop needs those words.

Comments explaining this history are fine and encouraged. The ban is on **prompt text**.

---

## 3. PREVIEW MODELS — barred on photographs, required on logos

This one is subtle and was got wrong once already.

| Work | Preview models | Why |
|---|---|---|
| **Photographs** | **BARRED** | A set drawn by different models disagrees with itself — some frames premium, some dull. Photos use `PHOTO_LADDER`: `gemini-3.1-flash-image` → `gemini-2.5-flash-image`. |
| **Logos / identity** | **REQUIRED** | `gemini-3-pro-image-preview` is the better draughtsman. A logo set is generated as one batch, so the consistency risk does not apply. Opt in with `allowPreview:true`. |

**The mistake to avoid:** on 27 July a photo clean‑up purged preview models from *every* image
path. Logos silently dropped from Pro to Flash and lost visible quality. The ban is
**photo‑specific**. Do not generalise it again.

---

## 4. ONE AUTHOR PER PROMPT

- **Logos:** `art-translator.js → logoPrompt` is the **only** logo prompt author.
  A second hardcoded copy once lived in `logo-concepts-background.js` and kept producing the
  shield lockups the Founder rejected, while SPARK LOGO LAW was rewritten one file away and
  never reached a client. Never write a second copy.
- **Photographs:** `studio-engine.js → heroPrompt` is the only brand‑photo prompt author.
- **Tier lists:** photo callers must not pass their own `geminiModels`. The house ladder lives
  in `studio-engine.js` and everything inherits it.

---

## If you are an AI session reading this

You will be tempted to "tidy up" one of the above while fixing something unrelated. Every rule
here exists because that already happened and cost the Founder real quality he had to spot
himself. Before changing anything in this file's scope:

1. Run `node tools/image-law-check.js`.
2. If you are about to make a rule *more* general — banning something everywhere rather than in
   one path — stop. That is the exact shape of the mistake made on 27 July.
3. Ask the Founder. He can tell a Pro logo from a Flash one at a glance.
