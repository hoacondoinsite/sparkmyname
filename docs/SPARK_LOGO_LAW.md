# SPARK LOGO LAW
**Founder order, 27 July 2026. Permanent. Governs every identity mark SparkMyName makes for a client.**

---

## The bench

Eight marks set the standard. They are studied for their **principles**, never imitated, never
referenced in output, never resembled. Any resemblance to an existing mark is an automatic reject
under the Originality rule below.

| Mark | What it proves |
|---|---|
| **Nike** | One shape. Symbol and wordmark each stand completely alone. |
| **Apple** | Proportion is the craft. Minimal, emotional, works on every surface. |
| **FedEx** | A second meaning hidden in the negative space, found not decorated. |
| **Mercedes-Benz** | Perfect geometry. One symbol, no container, timeless. |
| **Chanel** | Balance is what reads as expensive. |
| **Rolex** | A single symbol can carry prestige and heritage on its own. |
| **IBM** | Line alone, used brilliantly, is enough. |
| **National Geographic** | A yellow rectangle. Memorability beats decoration. |

---

## The eight laws

**1. ONE IDEA.** A mark carries a single idea. Two ideas is no idea. If the concept needs a
sentence with "and" in it, it is not finished.

**2. FEWEST SHAPES.** Reduce until removing one more thing breaks it. The Mercedes star is three
lines in a circle. Restraint is not a style — it is the work.

**3. THE SECOND MEANING.** Where it is honest, hide a second reading in the form — negative space
that becomes a subject, a letterform that is also an object. FedEx's arrow was found, not added.
Never force it; a forced double meaning is worse than none.

**4. IT MUST SURVIVE.** Reproduced one inch wide. In a single colour. Embroidered on a shirt.
Etched into glass. Rendered at sixteen pixels as a favicon. On the side of a building. A mark that
only works large is not a mark.

**4b. THE MONOLITHIC TEST.** It must look like it could be cast in metal, stamped into leather, or
embroidered on a cap without losing a single detail. If any part would fill in, blur, or disappear
in a physical process, it is not finished.

**5. INDEPENDENCE.** The symbol must work with the wordmark removed. The wordmark must work with
the symbol removed. Nike's swoosh needs no name; the name needs no swoosh. A mark that collapses
without its partner is a decoration.

**6. NO CONTAINER.** No ring, shield, badge, crest, circle, or frame holding the mark together. A
container is what a weak mark hides inside. None of the eight has one.

**7. ONE TYPE SYSTEM.** Every letterform in the wordmark shares one stroke weight, one proportion,
one spacing logic. Letters drawn to different systems is the single clearest signal of amateur
work, and it is the most common failure in generated identity.

**8. ORIGINALITY.** Original to this client. Never resembling an existing mark, never using
protected insignia, never a stock symbol, never the plainly-drawn tool of the trade.

---

## Permanently forbidden

Gradients · gloss · metallic finishes · bevels · drop shadows · glows · 3D extrusion · faux depth ·
outlines around shapes · swooshes · arrows · chevrons · globes · shields · crests · badges · laurel
wreaths · clip-art icons · stock silhouettes · busy detail · more than two colours plus black or
white · any default or off-the-shelf typeface.

Every one of these appears in the identity work this law replaced.

---

## The rejection test

A mark ships only if all of these are true. Any single failure is a reject, not a revision.

- [ ] It carries one idea, statable in one sentence with no "and"
- [ ] Nothing further can be removed without breaking it
- [ ] It reads at sixteen pixels
- [ ] It reads in a single colour
- [ ] The symbol stands alone without the wordmark
- [ ] The wordmark stands alone without the symbol
- [ ] There is no container holding it together
- [ ] Every letterform shares one system
- [ ] The name is spelled correctly, letter for letter
- [ ] It resembles no existing mark in the world
- [ ] It is not the tool of the trade drawn plainly
- [ ] It is not on the forbidden list


---

## THE SMALL MARK LAW
**Founder order, 27 July 2026.** Governs favicons, app icons, social profile icons, avatars,
browser tabs, app tiles, and every tiny digital mark.

A small mark is **not a smaller logo.** It is the symbol alone, surviving compression. The
wordmark comes off entirely — a favicon with a name in it is a smudge.

### The bench

| Mark | Standard it sets |
|---|---|
| **Apple** | Simplicity first. Perfect silhouette, recognisable at 16×16, strong in black, white, embossed or monochrome. |
| **Nike** | One unforgettable shape. Recognisable without text, from favicon to billboard. |
| **Airbnb** | One continuous memorable form. Clean geometry, friendly curves. |
| **Slack** | Built for digital platforms first. Works in circles and squares, strong negative space. |
| **Dropbox** | Clear geometry over decoration. Works at every size. |
| **GitHub** | Silhouette is everything. Memorable as a solid shape alone. |
| **Notion** | Maximum recognition with minimum detail. |
| **Figma** | Distinctive colour and shape together. |

Studied for principle only. Never imitated, never resembled.

### The six small-mark rules

**1. SYMBOL ALONE.** No wordmark, no letters, no name anywhere in the image.

**2. DESIGNED SMALL FIRST.** Then scaled up — never a logo shrunk down. No fine lines, no small
gaps, no interior detail, no thin strokes.

**3. SILHOUETTE TEST.** Fill it solid black and delete everything else. If it is still
recognisable, it passes. If it becomes a blob, it fails. This is the GitHub test and it is the
hardest one.

**4. CIRCLE AND SQUARE.** It must crop correctly to a circle *and* to a rounded square. Centered,
generous breathing room, nothing important near the corners.

**5. ONE COLOUR, BOTH WAYS.** Flat black on light. Flat white knocked out of dark. Then the brand
colours. All three must hold.

**6. FILL THE FRAME.** The symbol occupies most of the canvas. A small shape floating in a large
square reads as an error at every size.

### The rejection test

- [ ] No letters anywhere in the image
- [ ] Recognisable at sixteen pixels
- [ ] Recognisable as a solid black silhouette with all detail removed
- [ ] Crops cleanly to a circle
- [ ] Crops cleanly to a rounded square
- [ ] Holds in flat black, in flat white on dark, and in brand colour
- [ ] Fills the frame confidently
- [ ] No fine lines, small gaps, or interior detail
- [ ] Original to this client, resembling no existing mark

### Where it lives

`generate-asset.js` — `wantsSmallMark()` detects the request; `identityWorkOrder(..., smallMark)`
switches the brief. `asset-spec.js` — the `small_mark` known size, 1024×1024 square.

---

## THE PRESENTATION STUDY

Separate artifact, separate call. The mark photographed as a physical object — engraved in brushed
titanium, embossed into heavy stock, cast in brass, etched in glass, debossed into leather.

**Why it is separate.** A single prompt asking for "pure vector, stark black and white" *and*
"macro photography of engraved titanium" returns a photograph of a logo: beautiful on a homepage,
unusable as a logo file. The flat mark is the deliverable. The study is the presentation.

**What it honestly is.** The engine paints the mark again inside the photograph rather than
compositing the delivered file. So the form shown is the same *idea*, not the same *artwork*.
Pixel-identical mockups require compositing the real mark onto a material plate — a different
build, not yet made. Never describe a study as a photograph of the delivered file.

Trigger words: mockup, engraved, embossed, etched, debossed, presentation study, material study,
agency presentation page, case study board, app tile, on metal / titanium / brass / wood / leather /
paper / glass / charcoal.

**Seven materials.** Brushed dark titanium · deep-embossed cotton stock · cast antiqued brass ·
etched low-iron glass · blind-debossed leather · **agency presentation page** (heavy warm-white
cotton rag, editorial macro, raking shadow across the paper grain) · **app tile** (physical
minimalist tile, matte charcoal field, studio rim lighting).

### THE LINE THAT MUST NOT MOVE

A presentation render is never the deliverable. A client's logo file cannot be a photograph of
paper, metal, or a tile — they cannot put it on an invoice, a truck door, or a shirt. The flat
mark on white is what ships; the study is what sells. Any proposal to replace the mark with its
photograph is rejected on the Truth Standard, however beautiful the photograph.

A second reason, practical: the vector trace path takes flat artwork as input. Tracing a
photograph — paper grain, raking shadow, depth of field — gives an artist a materially worse
starting point than the flat mark does.

---

## ON VECTOR SOURCE FILES

The engine outputs raster PNG. It does not produce true vector source.

`workspace.html` carries a tracer (`traceLogoSVG`, ImageTracer) that converts a delivered bitmap
into SVG paths. That is a **trace of finished artwork**, not a designed vector file — the curves
are derived, not drawn. It is genuinely useful for scaling, and it must never be described to a
customer as an original vector source file or as EPS-grade production art.

---

## Where this lives in the code

| File | Role |
|---|---|
| `netlify/functions/identity-concept.js` | The concept desk. Decides the idea before anything is drawn. Carries these laws in its system prompt. |
| `netlify/functions/generate-asset.js` | `identityWorkOrder()` — turns the concept into the drawing instruction. |
| `netlify/functions/art-translator.js` | `logoPrompt()` and `DIRECTIONS` — the batch delivery path for client orders. |
| `netlify/functions/art-registry.js` | `logo_lockups` row. 2K. |

**Change one, check the others.** The standard is duplicated across the on-demand path and the
batch delivery path, and they must not drift.

---

## The line that governs everything else

> Do not ask what shape the logo should be. Ask what is true about this business that its
> competitors cannot claim — then find the fewest shapes that carry it.

*SparkMyName · Owned by VORREX IGNITE LLC · U.S. Patent Pending (App. 19/704,386)*
