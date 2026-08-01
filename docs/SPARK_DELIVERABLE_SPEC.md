# SPARK DELIVERABLE SPEC & QA PROTOCOL
**Founder law, 2026-07-24. Permanent. Every deliverable is built to this spec and
checked against it BEFORE any disc ships. No exceptions, no drift.**

Born from a real client-download inspection (DuskSerenade, 2026-07-24): photo-cropped
banners were illegible, the lockup logo carried a white box, text shipped as bare .txt.
Those failures are named here so they can never return.

## THE FOUR LAWS
1. **NO-CROP LAW.** A photograph is never force-cropped beyond ~1.8× aspect distortion.
   Extreme-ratio surfaces (display banners 300×250 / 728×90 / 160×600) are DESIGNED
   BRAND ADS — brand-color gradient field, contained logo, brand-font typography,
   accent geometry — the way agencies actually build display ads. The social cover
   (1500×500, ≈1.7× from a 16:9 source) is the crop-tolerance boundary and keeps the
   photo with a legibility gradient.
2. **VECTOR-FIRST TRANSPARENCY.** Any logo placed INTO a composition comes from the
   traced vector (`_logoArt`) so it lands transparent — never a white-boxed raster.
   Raster fallback only if the trace fails.
3. **SHRINK-TO-FIT.** All composed text passes through `_fitText` (or a wrap routine).
   Nothing is ever cut off, overflowed, or clipped. If it can't fit at 10px, the layout
   is wrong — fix the layout, never clip.
4. **READY-TO-USE FIRST.** Clients get usable files first: the PNG logo pack
   (transparent 2048/1024, on-white 1024, on-brand-dark 1024) leads the shelf. SVG
   ships too, labeled as the source file for printers & designers. Text deliverables
   ship BOTH as .txt (utility) and inside the **Brand Copy Deck PDF** (presentation).

## PER-ASSET ACCEPTANCE SPEC
| Asset | Size / format | Acceptance |
|---|---|---|
| Logo ready pack | 2048+1024 transparent PNG, 1024 on-white, 1024 on-brand-dark | Logo contained w/ 8% margin, centered, never distorted |
| Vector logo | SVG traced 12-color, pathomit 24 | Opens clean, no speckles at 400% |
| Size pack | 256/512/1024/2048 PNG | From vector curves, transparent |
| Lockup | 3200×960 PNG, white bg | Transparent logo left, name in brand display font, accent rule |
| Banners ×3 | 300×250, 728×90, 160×600 | Designed ads per Law 1; logo contained; name+tagline fit; contrast ≥ white-on-dark |
| Social cover | 1500×500 | Photo, center focal, gradient overlay, name+tagline fit |
| Avatar | 1024×1024 | Logo contained on brand field |
| Favicons | 16/32/48/180 | From vector |
| Brand Copy Deck | US Letter PDF @200dpi canvas pages | Branded cover, Colors & Type page, Taglines(6), Bios(6), About(3), Posts(6), LinkedIn(3), Facebook(3), Handles; brand fonts loaded before paint; page numbers + footer rule |
| Brand Website | 5 HTML pages | Design Direction engine (6 directions), client palette/fonts/photos/copy, og + JSON-LD |
| Text counts | per Count Guarantee | taglines 6, bios 6, abouts 3, posts 6, LI 3, FB 3 — floors enforced two layers |

## CLAUDE QA PROTOCOL (run before EVERY disc that touches deliverables)
1. **Compile gate:** every function `node --check`; every page's inline scripts through
   `new Function`; HTML parses.
2. **Geometry gate:** run the layout math simulation (shrink-to-fit convergence, logo
   contain-box within canvas, wrap routine termination) for all three banner ratios —
   the test lives in the disc-cutting session, results printed as evidence.
3. **Visual gate:** when a real client ZIP is available, EXTRACT AND LOOK at the
   composed assets (banners, lockup, cover) with actual eyes before declaring pass.
   A spec table is not a substitute for looking.
4. **Count gate:** verify a sample kit's text counts against the floors.
5. **Evidence:** print PASS/FAIL per gate in the session before the zip is cut. A disc
   is never sent on memory or assumption — only on printed evidence.

## CHANGE CONTROL
This spec changes only by Founder order. Any Claude proposing a deliverable change
must show it against this table first, then update this file in the same disc.

## RUNTIME DELIVERY QC (Founder law, 2026-07-24 — PERMANENT)
Code gates run before a disc ships, but pixels only exist in the browser — so QC also
runs THERE, on every generated file, after generation and before delivery:
- Images: decoded and checked against the QC_DIMS spec table (exact WxH), plus a pixel
  probe rejecting blank or solid/featureless output.
- HTML/TXT/SVG: non-empty, no template leaks ('undefined', '[object'), pages must parse
  with real content, no escaped newlines in .txt.
- PDF: must begin %PDF-.
- A failing file triggers ONE full regeneration; failing again, it is NEVER delivered —
  single downloads say so honestly, and ZIPs deliver everything that passed while naming
  what was held back. No broken file may reach a client silently.
Wired through buildQC() so single-click, Download-selected, DOWNLOAD ALL ASSETS, and the
5-page website all pass the same inspection. Future Claudes: add every new deliverable's
dimensions to QC_DIMS in the same batch that creates it.

## TWO LANES (Founder order, 2026-07-24 - PERMANENT)
A deliverable is READY only if it works with data already held: logo suite, palette,
name, domain, taglines, about copy, photos. If it carries a blank only the client can
fill - phone, their name, an address, a date, a price - it belongs in CUSTOMIZE.
- READY lane: downloadable now, selectable, included in DOWNLOAD ALL ASSETS.
- CUSTOMIZE lane: shown by name so the client sees what is coming, marked "Add your
  details", NOT downloadable and never included in any zip. No claim it is live.
ZIP structure: 01 READY TO USE/{Logo files,Online,Print,Words} - 02 ADD YOUR DETAILS/
{Online,Print} - 03 CUSTOM MADE FOR YOU - BRAND.
Every new deliverable must be classified in SMN_READY in the same batch that creates it.

## THE SUBTRACTION (Founder order, 2026-07-24 - PERMANENT)
Five processing layers were DELETED from the art engine. They were each added to fix a
symptom and each created the next failure. The art department returns finished work; it
is placed, not processed.
1. Background-removal flood fill in _logoArt - deleted. Chewed anti-aliased edges.
   _logoArt now only trims blank file padding so the mark places at a usable size.
2. Vector re-tracing of every logo in _logoImg - deleted. It posterised finished art to
   12 colours. traceLogoSVG survives ONLY for the SVG deliverable.
3. Six-step halving chain in _stepDraw - deleted. Chained resampling softened line art.
4. Luminance contrast plate (_logoSmart, _markLum, _fieldLum) - deleted. Logos sit on
   clean neutral by layout, which is what a designer does.
5. Focal crop in _coverDraw - deleted. A smarter crop is still a crop. The whole photo
   is shown, proportionate, on a field from the brand palette.
Four gates that enforced this machinery were RETIRED and rewritten as proofs of absence.
Governing document: docs/SPARK_ART_BRIEF.md (also kept outside the disc for drop-in use).

## THE UNLOCK (Founder order, 2026-07-24 - PERMANENT)
A customize piece is not "off" - it is WAITING on a specific fact. SMN_NEEDS declares
what each one needs (phone, email, address). The moment those exist in Brand Details the
piece goes live by itself; the page re-renders on save so the unlock is immediate.
- Nothing is invented. A blank field stays blank; a waiting piece names the fact it needs.
- A piece with no declared needs and no READY flag stays waiting (never auto-unlocks).
- Measured: 39 live with no details, +24 on a phone, +31 with phone and email.
Every new deliverable must declare either SMN_READY or SMN_NEEDS in the batch that
creates it.

## DISC 9 - THE DECKS (2026-07-24)
Capabilities deck and pitch deck. Five 16:9 slides each (1650x928 = 11 x 6.19in @150),
delivered as a multi-page PDF plus a cover PNG. Built to the brief: logo on clean white,
palette supplies the colour, no imagery so no type-over-photo risk, real About copy and
real why-points from the brand card, contact from Brand Details only. Both declared in
SMN_NEEDS (phone + email) and registered in QC_DIMS.

## PHOTO ROTATION (Spark Art Brief R4, wired 2026-07-24)
The client photo pool (every name hero + the header) is shared by all deliverables via
smnPhotoPool / smnPhotoFor. Assignment is round-robin over a fixed registry
(SMN_PHOTO_ORDER) so distribution is even and stable: the same piece always gets the same
photo, and no photo repeats while another is still unused. Verified: 12 pieces spread
across 6 of 6 photos. Any new photo-using deliverable must be added to SMN_PHOTO_ORDER.

## PIPELINE INTEGRITY (2026-07-24 - PERMANENT)
Every download tile must trace end to end: tile -> generator -> QC -> lane -> folder.
The pipeline gate proves it and blocks orphans. It caught main-logo, which had a working
generator but no lane classification - meaning no client could ever reach it.
Current state: 73 tiles, 73 routed, 73 classified, 33 live with no details, 73 reachable
once details are filled, zero orphans.

## CLEAR SPACE (2026-07-24)
Trimming the delivered files' blank padding made every mark render 1.6x-2.3x larger in
the same box - the win we wanted - but it also removed the ACCIDENTAL breathing room that
padding had been providing. Clear space is now built into _logoSmart deliberately: 8% of
the box on the limiting axis, so the mark never touches its neighbours. Measured on the
Lighthouse Primary: a 300x300 box rendered a 157px mark before, 252px now, with 24px of
clear space on every side.

## READABLE DISTANCE (2026-07-24 - PERMANENT)
1 inch of capital letter height = 10 feet of readable distance (United States Sign
Council). Judged against how each piece is actually viewed, not one blanket number:
  Yard sign  (from a car, residential)  headline floor 30 ft, second line 25 ft
  A-frame    (walking past)             headline floor 20 ft, second line 18 ft
  Pull-up    (across a room)            headline floor 25 ft, second line 22 ft
  Poster     (wall, indoors)            headline floor 15 ft, second line 10 ft
AUDIT FOUND ALL FOUR FAILING: the yard sign headline read at 14 ft - unreadable from the
street. Cause: the logo sat BESIDE the headline and squeezed its width. Fix: logo moved
ABOVE, headline given the full safe width; fitted ceilings raised on the other three so
each piece can use the space it has. Now 36 / 45 / 43 / 31 ft. Every line still shrinks
to fit, so nothing can clip. Gated permanently.

## USPS EDDM ADDRESS FACE (2026-07-24 - PERMANENT)
Audit found three violations that would have had the mailing REJECTED at the counter:
no indicia, no barcode clear zone, and an address block under the 4 x 1.625in minimum.
Rebuilt to Domestic Mail Manual 207.24: bottom 2.125in painted clear and marked, address
block at 4 x 1.625in minimum, indicia (PRSRT STD / ECRWSS / U.S. POSTAGE PAID / EDDM
Retail) standing alone in the upper right at 1.25 x 0.75in, and the contact line moved
above the clear zone. Gated permanently.

## QC PASS-THROUGH FILES (2026-07-24)
Files delivered straight from the art department (main-logo, website-hero) carry the art
department's own dimensions, so a fixed spec would be wrong. QC now applies only the
blank/decode checks to them. A piece WITH a declared spec is still held to it exactly.

## THREE PIECES ADDED (2026-07-24)
Proven useful in the mold run but missing from the engine entirely:
  Door hanger    4.25 x 11in, hook cut-out marked, contrast-guarded CTA band
  Vehicle magnet 24 x 12in (the popular SUV/pickup size), every line fitted to the
                 safe width so it reads from 20-30 ft
  Email signature 760 x 380 px, which is the brief's 380px placement at 2x for retina;
                 max two columns; falls back honestly when details are missing
All three carry a tile, a declared need, and a QC_DIMS entry. Tile count now 76.

## PLATFORM SPECS VERIFIED (2026-07-24)
All 19 screen deliverable sizes audited against published 2026 platform specs - 19/19
correct. Typography audit across all 76 pieces: zero clip risk, every variable text draw
passes through shrink-to-fit.

## SEVEN MORE PIECES (2026-07-24)
Print: postcard 6x4 (standard mailing), presentation folder 9x12 (pocket fold marked,
artwork kept above it), hours sign 8.5x11 (uses saved hours when present, ruled lines
when not), counter/shelf card 4x6.
Social, all READY because they need no client facts: hiring post 1080x1350, thank-you
post 1080x1080, profile banner 1500x500 (LinkedIn / X, centre-weighted for mobile crop).
All seven carry a tile, a declared need, a QC_DIMS entry matching the canvas math, and
shrink-to-fit typography.

## CATALOG STATE (2026-07-24)
83 tiles. 45 live with no details entered. 72 after a phone. 82 after phone and email.
Every tile routed, classified, QC-registered, zero orphans.
Bleed audit: every PDF trim size matches a canvas; largest canvas 13.8M px, under the
iOS 16.7M ceiling.

## EIGHTEEN PIECES (2026-07-24)
MERCH (6, all READY, transparent ground so any garment colour works):
  t-shirt 3000x4000, hat 1500x750, tote 3000x3000, mug wrap 2610x1110,
  sticker 1800x1800, apron 2700x3600.
  NOTE: the tee was first drawn at 3600x4800 = 17.3M px, OVER the iOS 16.7M ceiling -
  it would have failed silently on an iPhone. Resized to 3000x4000 (12.0M px), still a
  true 12x16in print area at 250dpi.
BUSINESS DOCS (3): invoice (subtotal/tax/total due), packing slip (packed checkboxes),
  terms sheet (states plainly it is a layout, not legal advice).
SOCIAL (6, all READY, brand-only): tip, milestone, meet-the-team, countdown,
  question/AMA, before & after (two labelled frames).
AD UNITS (3, all READY): 300x600 half page, 320x50 mobile, 970x250 billboard - IAB
  standard sizes, through the existing designed-ad engine.

## CATALOG STATE (2026-07-24, after the triple batch)
101 tiles. 60 live with no details. 87 after a phone. 100 after phone and email.
Every tile routed, classified, QC-registered, zero orphans. 29 gates.

## QC IS ADVISORY (Founder order, 2026-07-24 - SUPERSEDES the blocking rule)
Runtime QC was BLOCKING downloads on the live site. The Founder could not retrieve his
own logo pack, lockup, name badge or merch artwork - the message read "quality control
caught an issue and held this file back." A quality check that stops delivery is worse
than the defect it guards against.
QC now ALWAYS delivers the file and REPORTS what it noticed, by name, in the toast and
the console. The Founder's eyes remain the real gate. The inspection still runs on every
delivery path; it simply has no power to withhold.
Also: build failures now surface their actual error message instead of a generic line,
so the cause can be diagnosed instead of guessed.

## THE TAINT BUG (2026-07-24 - ROOT CAUSE OF THE DOWNLOAD FAILURE)
Symptom: on the live site the Founder could not download his logo pack, lockup, name
badge or merch artwork. Some said "quality control held this file back"; the main logo
did nothing at all.
Cause: drawing a CROSS-ORIGIN image into a canvas taints it, and a tainted canvas returns
NULL from toBlob. The file came out empty. The old engine hid this because every logo was
routed through the vectorizer first, and an SVG data-URL never taints. Removing the
vectorizer (correctly, under R1) exposed the latent taint.
Fix: _sameOriginImg() fetches the bytes and loads them from a blob URL, which is
same-origin by definition, so no canvas is ever tainted. Logos, photos, the social cover,
banner art and the SVG tracer all route through it, with a direct-load fallback.
Also: _canvasBlob now REJECTS on a null blob with a plain-language reason instead of
resolving with nothing - a silent empty file is the worst possible failure.
LESSON: removing a layer can expose a problem the layer was accidentally solving. When
deleting machinery, ask what else it was doing.

## SILENT FAILURES (2026-07-24)
Audit after the taint bug: 42 empty catch blocks, 11 swallowed rejections. The dangerous
ones wrapped drawImage - a piece could ship WITHOUT its logo or photo and nobody would be
told. That is the same class of failure as the taint bug and the hardest kind to notice.
Fix: SMN_DRAWFAIL records every failed logo, photo, banner and image draw. QC merges
those into its delivery note, so a missing logo is reported by name instead of shipping
quietly. The recorder resets at the start of every build.

## WEBSITE GENERATOR AUDIT (2026-07-24)
First audit of genWebsite5 against the brief. One violation: the generated gallery used
object-fit:cover, cropping the client photos. Per R3 the space adapts, not the photo -
gallery images now display at their natural ratio, whole. The two remaining cover rules
are Spark's OWN interface (photo strip, avatar circle), not client deliverables, and are
correctly left alone.
Everything else passed: hero anchored, html lang, alt text, title, description, viewport,
Open Graph tags, LocalBusiness structured data, contrast ink guard, brand font pair.

## FOUR AUDITS, ALL CLEAN (2026-07-24)
Copy Deck PDF, starter site generator, all five email templates, and the 150 server
functions were audited for brief compliance and the silent-failure class.
Result: clean. Notably ZERO empty catch blocks sit on any I/O in the paying-customer
path (checkout, webhook, build, deliver, send, watchdog). The order watchdog properly
finds stale running orders, resets them to pending, retries, and gives up after 5
attempts marking them failed. The delivery pipeline is sound.

## SEVEN MORE PIECES (2026-07-24)
Product label 3x3, hang tag 2x3.5 (punched-hole guide), invitation 5x7, place card
3.5x2 (name rule, no contact block), package insert 4x6, review request card 3.5x2,
scan-me poster 8.5x11. The two QR pieces reserve a real square with a white quiet zone
so a scannable code can be dropped in. Label and place card need no client facts and
ship in the READY lane.

## CATALOG STATE (2026-07-24, large batch)
108 tiles. 63 live with no details. 94 after a phone. 107 after phone and email.
34 gates, 432 checks, zero failures.

## TWENTY-ONE PIECES (2026-07-24, triple batch 2)
PRINT (10): envelope #10 and A7 (recipient address area reserved), notepad sheet,
sticker sheet (12-up grid), vinyl banner 6x2ft, feather flag, table cover panel,
lanyard badge, comment card, shipping label 4x6 (carrier barcode area reserved).
Large-format pieces render at 40dpi so every canvas stays under the iOS ceiling -
the 6ft banner is 2,803,300 px, the flag 4,368,100.
DIGITAL (11, all READY): Google Business post, Pinterest pin, app icon, WhatsApp
profile, podcast episode square, email header, blog featured image, X post, LinkedIn
post, highlight ring, video thumbnail. Icon-style pieces place the logo on clean white;
wide formats set the logo beside the type, never over it.

## CATALOG STATE (2026-07-24, final)
129 tiles. 78 live with no details. 112 after a phone. 128 after phone and email.
35 gates, 461 checks, zero failures.

## THE RENDER HARNESS (2026-07-24 - the missing verification layer)
For this entire build session the generators could only be checked by READING their
source, because canvas work needs a browser. Every gate tested the code; nothing tested
the pixels. That gap let real defects pass every gate.
tools/render-harness.js + tools/render-run.js execute the REAL generator functions in
Node with canvas shims, against REAL client data, and write actual PNG files.
FIRST RUN, FIRST FINDING: the lanyard badge drew a navy logo onto a navy band - the mark
was invisible. The source said "logo placed"; the pixels said nothing was there. Fixed
by moving the logo onto clean white per R2. 35 pieces now render with zero findings.
FAITHFULNESS IS THE WHOLE POINT: the harness shims must reproduce the engine exactly. The
first version skipped _logoArt padding trim and falsely reported logos as too small. If a
helper changes in workspace.html, change it in the harness too.

## SPARK EYES + A MISSPELLED LOGO (2026-07-24)
tools/eyes.py inspects rendered output as TEXT: an ASCII layout map, OCR of the words
that actually rendered, and a region report (margins, balance, colour).
FIRST RUN, FIRST FINDING - and it is a serious one. OCR of the DELIVERED Primary logo for
Lighthouse Bay Realty reads "Lightouse Bay": the second h is missing. The Icon and
Wordmark concepts spell it correctly, so this is a defect in one generated concept, not an
OCR artefact. A client would have printed their own name wrong on business cards, yard
signs and a vehicle magnet.
Nothing in the pipeline was checking this because nothing was READING the artwork.
Every gate verifies geometry; none verified spelling.
ALSO FOUND: several layouts are bottom-heavy - business card content spans 35-85%
vertically, the deck cover leaves 32% empty at the top, the comment card 29% at the foot.
RECOMMENDATION FOR THE FOUNDER: add an OCR spell-check against the brand name at the point
the art department returns a logo suite, and reject or regenerate a concept whose wordmark
does not match. This is a product-level gap, not an engine bug.

## AGENCY REFACTOR (Founder-forwarded spec, 2026-07-24)
TAKEN:
- Colour harmonisation. SMN_INK #1C1F26 charcoal / SMN_INK2 #5A6270 slate replace pure
  black and harsh grey across 80 colour literals in the print engine. Pure #000000 on
  white is the clearest amateur tell.
- Negative space. Safe area 0.25in -> 0.295in, an 18% increase, on every print piece.
- Logo weight hierarchy. SMN_LOGOWEIGHT gives each asset class a share of layout width
  with a pixel floor (card .22, signage .26, vehicle .30, apparel .46, icon .68),
  replacing uniform rigid boxes that shrank marks on compact templates.
- Signage hierarchy. Phone and call-to-action raised 40% on yard sign, A-frame, magnet
  and poster - the contact is now the dominant secondary element.
- Optical centring. The business card block is centred as a UNIT. It had been pinned to
  fixed fractions, leaving 240px dead above and 103 below; now 181/205.
- Deliberate containers. Where a logo carrying its own white ground sits on a dark field
  it is seated in a ROUNDED CARD with 14% padding, not left as a hard-edged rectangle.
SET ASIDE (one line, per Take-the-Gold): drop-shadows and outer glows on logos. That is
processing of delivered art, which R1 forbids, and it is the same contrast machinery the
Founder ordered deleted this morning. Clean space and a deliberate container do the job.

## NYC AGENCY SOP (Founder-forwarded, 2026-07-24)
TAKEN:
- §5 PRE-FLIGHT SPELLING GATE. tools/preflight.py OCRs every delivered logo concept and
  character-matches the wordmark against the master brand name. Run it at art-department
  ingestion. It independently confirmed lighthousebayrealty-logo-1 reads "lightousebay"
  and exits non-zero so a build can be stopped.
- §1A EDITORIAL SPINE. The yard sign moves off centre onto a left-anchored asymmetrical
  grid: logo, headline, tagline and contact all align to one vertical spine.
- §2A EXTREME SCALE CONTRAST. _display() lifts headlines 35%. _micro() sets metadata at a
  refined micro-scale with 0.15em tracking, placing glyphs individually because canvas has
  no letter-spacing.
- §2 FORBIDDEN WEIGHT. Weight 500 removed from 59 print draws; 600 promoted to 700. Only
  300 / 400 / 700 / 800 remain.
- §3A NO FLAT DARK FILLS. _deepField() paints an ultra-deep tonal gradient shifted from
  the brand dark, replacing flat blocks on signage, sticker, magnet and badge.
  Secondary text on dark is slate #A3A8B4.
- §3B STRUCTURAL ACCENTS. The yard sign rule bleeds off the left margin as a grid divider
  rather than floating under the headline.
- §1B CROWDING GUARD. _crowdCheck reports when a secondary block sits closer than 2.5x the
  logo height to a graphic, rather than silently nudging it.
SET ASIDE (one line, per Take-the-Gold): §4A unboxed dark-mode logos. Floating the mark
with alpha transparency needs either background removal from the delivered art (forbidden
by R1, and the exact machinery the Founder ordered deleted) or a reverse logo variant the
art department does not currently supply. Enable it the day the art department returns a
reverse variant.

## INSPECTOR FIX (2026-07-24)
tools/eyes.py now OCRs in horizontal bands. A single downscaled pass lost the yard sign
headline entirely while it was perfectly legible - the tool was wrong, not the engine.
Verify the verifier.

## BATCH PROCESSING (SOP-MBI-500, 2026-07-24)
tools/batch.js implements the multi-brand workflow: structured intake record -> the LIVE
engine generators -> per-brand QA -> one packaged folder per brand with brand.json and
the mandatory AI-generated-starting-point disclaimer.
PROVEN ON REAL DATA: six real brands with real logo suites and real photographs.
Zero identical pairs across all 15 comparisons; six distinct logo fingerprints; zero QA
issues. The engine genuinely customises per brand rather than restyling one template.
ARCHITECTURE NOTE: batch renders through the SAME generator functions the workspace uses.
There is no second renderer to drift out of sync - a fix in workspace.html reaches every
brand in the batch.
NOT IMPLEMENTED, DELIBERATELY: the SOP Phase 5 payment execution. This tooling does not
touch invoicing or payment rails. Financial execution stays a human decision in a system
with its own authorisation.

## MULTI-BRAND ISOLATION & GRID VARIANCE (Founder-forwarded directive, 2026-07-24)
TAKEN:
- STATE ISOLATION. smnBrandContext resolves every layout value from the brand record
  alone. No module-level layout state exists for one brand to inherit from another.
- TEMPLATE BAN / GRID VARIANCE. Three layout families (spine, editorial, split) bound to
  the brand record by a 32-bit avalanche hash of id + name + category. Deterministic, so a
  brand renders identically every time, and evenly spread: 303/326/271 over 900 brands.
  A plain rolling hash clustered four of six on one grid; the avalanche mix fixed it, and
  a missing final unsigned cast was producing negative modulo and undefined grids.
- FINGERPRINT BINDING. Logo suite, typeface class and palette are locked to the record
  before any collateral renders.
SET ASIDE (one line, per Take-the-Gold): semantic palette generation. Deriving colours
from the brand name means INVENTING a palette, which R2 forbids and which the Founder
corrected directly. The apparent sameness in the first batch was a data artefact - all six
brands were one client name options, so they shared one palette. A real portfolio supplies
one palette per brand; the intake record now carries it.
PROVEN: six brands, own supplied palette, own logo suite, own photograph. Zero identical
pairs across 15 comparisons; smallest difference 3.37.

## VISUAL DISRUPTION PROTOCOL (Founder-forwarded directive, 2026-07-24)
TAKEN:
- SIX CONTAINER ARCHETYPES: minimal, saturated, split, framed, typographic, floating.
  Bound to the BRAND RECORD, not the piece type. The old rule painted the same dark
  gradient on every invitation, hang tag and poster regardless of whose brand it was -
  that was the repeating shell. Verified gone: mean luminance across six brands now runs
  110 to 249 on the same piece; zero identical pairs on all 15 comparisons.
- THE SHELL DECIDES STRUCTURE, NEVER COLOUR. Every fill comes from the brand palette.
- NO DEFAULT FALLBACK PALETTES. smnPaletteOrFlag REPORTS a brand arriving without a
  palette instead of quietly giving it a house theme.
- BATCH-AWARE DISTINCTNESS. smnShell() is isolated and works at any scale but cannot
  guarantee six different shells in a batch of six - it has no knowledge of neighbours.
  smnShellAt() is used by the batch runner, which knows the roster, and walks the list so
  every brand in a run gets a different container. Both deterministic. This is the honest
  trade between strict isolation and guaranteed distinctness; both are available.
SET ASIDE AGAIN (one line): semantic palette generation from the brand name. That invents
a palette, which R2 forbids and the Founder corrected directly.

## AGENCY POLISH (Founder-forwarded critique, 2026-07-25)
CORRECTED THE RECORD FIRST: the aspect-ratio complaint was MY CONTACT SHEET, not the
engine. Every file was already correct - card 1125x675 landscape (1.67), hang tag
675x1125 portrait (0.60). The sheet forced every piece into a square tile, which made
correct landscape cards look squeezed. The sheet now sizes each cell to that piece own
ratio. A presentation that misrepresents the output is a defect in the presentation.
REAL FIXES INSIDE THE SAME CRITIQUE:
- LANYARD ORIENTATION. It was landscape 3.375x2.125. An ID badge hangs vertically.
  Rebuilt portrait 2.125x3.375 with a punch slot, top-anchored logo, name in the optical
  centre and bottom-aligned data fields.
- FLYER HIERARCHY. Rebuilt on an asymmetric editorial grid: colour field on the upper
  right, logo on the left spine, three distinct typographic scales (display / body /
  tracked small-caps metadata), 1.5 leading, and the brand real about copy as body text.
- LABEL PLACEHOLDER. The raw "Batch / size / date" line is gone.
- PALETTE PROPAGATION. Primary, secondary AND tertiary now drive real components: the
  flyer fact panel tint, the badge rules, the place-card name rule. No hardcoded strokes.
HONESTY NOTE: while rebuilding the flyer I referenced photoFrame() and im2 - helpers that
do not exist in the print engine. That would have shipped a broken piece. Caught by the
compile check, removed, replaced with a structural rule.

## COMPONENT-LEVEL PALETTE BINDING (Founder directive, 2026-07-25)
Audit found 73 hardcoded colour literals in the print engine that ignored the brand
palette - generic greys on every rule, border, divider and tint panel. Every one is now
derived from the brand record through _rule() and _tint(), which mix the tertiary (falling
back through secondary to primary) toward white at a given strength.
RESULT: zero hardcoded greys remain; 47 components bound. Measured across six brands, the
rule and tint tones are 6 distinct values out of 6 - each brand's dividers now belong to
that brand.
CATEGORY-TAILORED LABELS: product labels carry a retail metadata grid chosen by the
brand's category - food gets NET WT / INGREDIENTS / BEST BY, apparel gets SIZE / FABRIC /
CARE, realty gets LISTING / AGENT / MLS, and so on, with an honest ITEM / DETAIL / DATE
default. Tracked small caps with rules to write on. The raw placeholder line is gone.

## A-S MATRIX MAPPING (SOP-VIX-10000, 2026-07-25)
Mapped the catalogue against the 19-category matrix: 10 of 19 categories had rendered
deliverables. Built nine more documents covering three of the gaps:
  E SEO ARSENAL      keyword worksheet, page title & description sheet, 12-week calendar
  N LOCAL BOOSTERS   directory checklist (15 named), press release, introduction letter
  Q GROWTH           media kit one-pager, partnership outreach, investor introduction
All are WORKING FORMS - tracked small-caps field labels with rules to write on - not
decorative pages. Catalogue now 138 tiles, 82 live before a client types anything.

## RULE VISIBILITY (2026-07-25)
The palette binding had made form rules invisible: measured 225 against 255 paper, about
1.3:1. And a brand whose tertiary is a light sky blue can never make a visible rule by
mixing toward white at all. _rule() now derives the colour from the brand FIRST, then
darkens it in bounded steps until it clears a 1.85:1 floor. Verified across four real
palettes: 2.02 to 2.32:1. A rule you cannot see is not a rule.

## NOT BUILT, AND WHY (SOP-VIX-10000 categories A, I, J, O, P, R)
These are not rendering work and several should not be generated blind:
  A Identity & Verification - needs LIVE queries to USPTO, domain registrars and state
    filing systems. Rendering a certificate without a live query would state facts we
    have not checked.
  I Legal & Formation, J Trademark & IP - operating agreements, NDAs and Green/Yellow/Red
    trademark risk ratings are legal instruments and legal opinions. The standing truth
    rule is that SparkMyName never claims to legally clear a trademark. These need a
    lawyer in the loop, not a generator.
  O, P, R - partly automation and partly live data; the AI Designer already covers part
    of P. Worth scoping separately.

## A-S COMPLETION (2026-07-25)
Twelve more frameworks built, closing categories A, I, J and deepening K, L, M, O:
  A  availability intelligence framework, verification certificate layout
  I  mutual NDA, service agreement, contractor agreement frameworks
  J  trademark search notes
  K  one-page business plan, break-even worksheet
  L  discovery call script, objection handling
  M  review response templates
  O  compliance tracker
Catalogue now 150 tiles; 91 usable before a client enters anything.

## THE LINE ON LEGAL AND VERIFICATION ITEMS (PERMANENT)
The Founder reframed these as FRAMEWORKS AWAITING DATA rather than claims, which is what
makes them honest to build. The line held in the code:
- Legal frameworks carry FIELD LABELS (THE PARTIES, WHAT COUNTS AS CONFIDENTIAL, HOW LONG
  IT LASTS) and a disclaimer. They contain NO drafted clause language. Writing enforceable
  contract text is a lawyer's work.
- Every legal framework prints: "This is a working framework, not legal advice. Have a
  qualified attorney draft and review the actual terms." Verified by OCR on all four.
- The trademark sheet states a search is not a clearance and not a legal opinion.
- The availability framework prints "An unchecked box is not a result."
- The certificate states it records only what was checked and is not a legal clearance.

## CONTRAST FLOOR RAISED (2026-07-25)
Directive floor 2.0:1. _rule() now darkens in bounded steps until it clears 2.02.
Verified across five palettes: 2.03, 2.04, 2.32, 2.42, 2.60.

## ALL 19 CATEGORIES RENDERED (2026-07-25)
Categories R and P closed. The industry checklist is keyed to the brand's own category -
a plumber and a bakery get different forms from the same tile, across eight verticals
(Trades, Food Service, Wellness, Fitness, Real Estate, Childcare, Ecommerce, Consulting)
with an honest general-business default. Plus a content repurposing worksheet and an
assistant briefing sheet whose last question is the boundary line: what should never be
promised on your behalf.
CATALOGUE: 153 tiles. 94 usable before a client enters anything.

## THE FINAL QUALITY GATE (directive section 3, 2026-07-25)
tools/final_gate.py runs against RENDERED OUTPUT from a real multi-brand batch, not
source. Four checks: aspect-ratio bounds, zero template cloning, no cross-brand colour
contamination, and state isolation measured as neighbours differing as much as distant
rows. Current result on six brands: 4 pass / 0 fail, 135 clone comparisons clean.
FIRST RUN FLAGGED 13 CONTAMINATIONS AND EVERY ONE WAS FALSE. Near-whites and dark
neutrals are universal - two brands both holding a pale grey-green does not mean one
leaked. And one flag was a brand's OWN dark, shaded by its container gradient, drifting
past a flat tolerance. The test now only considers colours that actually IDENTIFY a brand:
saturated, mid-luminance, and generously distanced from the brand's own palette.
A gate that cries wolf is worse than no gate - the same lesson as the QC that blocked
downloads. Verify the verifier.

## THE OUTPUT GATE IS NOW AUTOMATIC (2026-07-25)
tools/final_gate.py runs at the END OF EVERY BATCH, invoked by batch.js, and its exit
code becomes the batch exit code. A failing gate prints "BATCH REJECTED — these files are
not fit to hand over" and fails the pipeline. A gate you have to remember to run is a gate
that stops running.
PROVEN BY INJECTING REAL FAULTS: cloned one brand business card onto another and squashed
a hang tag to 60% height. The gate caught both and exited non-zero:
  FAIL aspect ratios (BR-003 hang tag 1.000 vs 0.600)
  FAIL zero template cloning (BR-001 vs BR-002 diff 0.00)
A gate that has never failed has never been tested.

## CATEGORY P COMPLETED — VOICE GUARDRAILS (2026-07-25)
The guardrails sheet is the only deliverable in the catalogue whose value is in what it
FORBIDS. Five limits are PRE-FILLED rather than left blank, because these are the ones
people forget:
  a price, discount or refund that has not been approved
  a delivery date we have not confirmed
  a medical, legal, financial or safety assurance
  a guarantee of any result
  anything about a customer to anyone else
It says plainly it is for any person OR TOOL that answers for the business. Verified by
OCR that all five print.

## CATALOGUE COMPLETE
154 tiles across all 19 categories. 95 usable before a client enters anything.
560 source checks across 43 gates, plus a 4-pillar output gate on rendered files.

## FIFTH PILLAR — STANDING GUARDRAIL VERIFICATION (2026-07-25)
The directive requires the five hard limits to print cleanly on EVERY brand packet, not to
be verified once by hand. Implemented:
- doc-guardrails now ships in every packet the batch produces.
- The output gate OCR-reads the limits block on EVERY brand and checks all five limits by
  keyword. A packet missing the sheet is REPORTED, not silently skipped. If OCR itself is
  unavailable the gate says so rather than passing by default - an unrun check must never
  read as a pass.
PROVEN BY INJECTING FAULTS: erased the limits block on one brand and deleted the sheet
entirely from another. The gate named both and exited 1.
  FAIL BR-002: all five limits did not print
  FAIL BR-004: guardrails sheet absent from the packet
NOTE ON THE TEST ITSELF: an earlier run appeared to exit 0 with faults present. That was a
shell pipe swallowing the exit code, not a gate failure - verified directly afterwards as
exit 1 with faults and exit 0 clean. Check the harness before believing the harness.

## GATE ARCHITECTURE, FINAL
SOURCE GATES  43 gates, 566 checks - run twice before every disc.
OUTPUT GATE   5 pillars on rendered files - runs automatically at the end of every batch,
              its exit code governs the pipeline.
Neither can replace the Founder looking at the work.

## FAIL-SAFE: AN UNRUN CHECK IS NOT A PASS (2026-07-25 - PERMANENT)
The gate previously printed "SKIP - OCR unavailable" and carried on. That is the most
dangerous state a checking system can be in: it LOOKS like it ran. Corrected by directive.
If the OCR subsystem is unavailable the gate now FAILS, states plainly that the compliance
block was not verified on any packet, and halts the pipeline.
PROVEN by shadowing the OCR module to force an ImportError: exit 1, with the reason named.
Three verified states: OCR blocked gives exit 1. Missing guardrails sheet gives exit 1.
Clean batch gives exit 0.

## HARNESS INTEGRITY (PERMANENT)
batch.js reads the gate exit status DIRECTLY from spawnSync .status. It is never piped
through another command, because a pipe returns the exit code of the LAST command and
silently swallows the failure. This was caught for real: a test appeared to exit 0 with
faults present, purely because of a tail pipe. The gate was fine; the harness lied.
Rule: inspect exit codes directly, and check the harness before believing the harness.

## THE FOUNDER RULE (recorded from the directive)
The 43 source gates (570 checks) and the 5-pillar output gate are automated REGRESSION
BLOCKS. They guarantee mechanical execution. They COMPLEMENT rather than replace the
Founder visual and strategic review. No count of passing checks means the work is good -
only that it has not broken in the ways we know how to test for.

## NON-BYPASS AT THE TOOLCHAIN LEVEL (2026-07-25)
The non-bypass rule was applied one level up: what if the GATE ITSELF cannot run?
Verified - a missing gate file returns status 2 and a missing interpreter returns null,
and both already caused a rejection. But the MESSAGE said "the output gate ran and
FAILED", which would send whoever read it hunting through artwork for a problem that is
actually a missing file. batch.js now checks the gate exists BEFORE spawning and
distinguishes the two plainly:
  gate missing or unrunnable -> "the output gate COULD NOT RUN. Nothing was verified.
                                 This is a toolchain fault, not an artwork fault."
  gate ran and found faults  -> "the output gate ran and FAILED."
Both exit 1. Proven: gate hidden gives exit 1 with the toolchain message, clean gives 0.

## I REPEATED MY OWN MISTAKE, ONE COMMAND LATER
While testing the above I ran `node batch.js 2>&1 | tail -4` and read exit 0 - the pipe
swallowing the code, exactly the fault recorded in HARNESS INTEGRITY minutes earlier.
Re-tested by redirecting to a file instead: exit 1, correctly. Writing a rule down does
not install it. Check the harness EVERY time, including right after you have been burned.

## NUMBERS MUST BE REPRODUCIBLE (2026-07-25 - PERMANENT)
A circulated status summary contained "15,000 total configuration paths". No such figure
exists in this engine. It was not measured, it cannot be reproduced, and repeating it
would have put an unverifiable claim into continuity where later sessions would inherit it
as fact.
Two further figures had drifted by one (95 usable / 59 waiting) because doc-guardrails
joined the ready lane after the handover was written.
MEASURED AND RE-VERIFIED: 154 tiles. 96 usable with no input. 130 after a phone. 151 after
phone and email. 154 with address. 58 in the waiting lane.
STANDING RULE: every quantity that leaves this project must be reproducible by running
something. If a number cannot be regenerated from the system on demand, it does not go in
a document. This is the same truth standard that forbids claiming deliverable counts we
have not shipped.

## MEASURE WITH THE RULE THE PAGE ACTUALLY USES (2026-07-25)
Checking a stale figure, I counted SMN_READY alone and got 62 ready / 92 waiting, and was
one keystroke from "correcting" a correct number with a wrong one.
The page does not use SMN_READY alone. It uses smnUnlocked(), which ALSO admits every tile
whose SMN_NEEDS entry is empty - 34 of them. 62 + 34 = 96 usable, 58 waiting.
STANDING RULE: verify a quantity with the SAME function the product uses, never with a
convenient approximation of it. A partial measure is not a smaller truth, it is a
different and wrong answer. This sits directly beneath "numbers must be reproducible":
reproducible BY THE REAL RULE.

## THE MEDIA STACK — WHAT SPARK ACTUALLY HAS (audited 2026-07-25)
An earlier assessment of mine said the graphics layer was "text-to-image" and that Veo was
not in play. Both wrong. Disk audit found a full media stack already wired:
  IMAGE  gemini-3-pro-image-preview, gemini-3.1-flash-image, gemini-2.5-flash-image,
         gpt-image-1  (art-department, art-render, studio-engine, logo-test)
  VIDEO  veo-3.1-generate-preview, veo-3.1-fast, veo-3.0-generate-001, veo-3.0-fast
         across 19 functions - the brand films already use this
  VOICE  gpt-4o-mini-tts, voices ash / ballad / coral / echo / onyx / shimmer, 19 functions
  MUSIC  lyria-3-clip-preview
  SEARCH gpt-4o-search-preview
  Keys present: GEMINI_API_KEY, OPENAI_API_KEY, OPENAI_IMAGE_KEY, ANTHROPIC_API_KEY.
THE REAL GAP is not missing capability. It is that the 154-tile deliverables engine calls
NONE of it - it composites from the 7 photos the art department already made.

## PRESENTATION MOCKUPS (2026-07-25)
tools/mockups.py turns flat deliverables into product renders: perspective tilt, a shadow
cast from the artwork own silhouette, and a studio ground built from the brand palette.
Merch sits on garment and vessel silhouettes.
COMPOSITED FROM EXISTING ARTWORK - no image API call, so it adds NOTHING to the per-brand
cost and cannot fail on a quota. Wired into the batch per brand; a mockup failure is
logged and cannot break the run.
Verified: 54 mockups across six brands, zero blank, zero identical pairs.

## COST DISCIPLINE BEFORE UNCAPPING (PERMANENT)
Three image tiers exist so a tier can be CHOSEN PER DELIVERABLE. Measured against a $99
one-time product: 7 images per brand costs about $1.33 at the high tier; 30 per brand
costs $5.70. At 9,000 concepts that is $11,970 versus $51,300. Uncapping without choosing
a tier per deliverable is where the large number comes from. Claude does not authorise
spending; the Founder does.
