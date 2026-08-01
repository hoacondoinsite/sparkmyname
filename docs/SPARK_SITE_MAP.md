# SPARK OS — SITE MAP & ORIENTATION (READ BEFORE TOUCHING ANYTHING)
**Founder: Peter Klein · Owned by VORREX IGNITE LLC · Written 2026-07-23 (Founder order)**
**This document rides in every disc, beside docs/SPARK_DESIGN_LAW.md. Read both first.**

---

## 1 · WHAT SPARK OS IS

SparkMyName sells exactly ONE product: **Business in a Box — $99, one time, no subscription.**
A customer types or speaks one idea → Stripe checkout → the OS generates and delivers a
complete brand: **6 judged names** (Six-Names Law, hard-capped) with domains checked at
delivery, **3 logos per name** (Primary / Icon / Wordmark), **1 shared 2K cinematic industry
header** (library model), **6 cinematic 2K variation photos**, and per name: 8 why-it-works,
6 taglines, 3 palettes (4 hexes each), 4 fonts, 6 bios, 3 abouts, 6 posts, 3 LinkedIn,
3 Facebook. Core kit lands in the client's free online workspace within 15 minutes
(currently ~6). A 100+ item curated catalog is INCLUDED — clients order pieces from the
workspace; each is custom-built and delivered within 24 hours.

**Never offered:** trademark or legal services (affiliates only — Founder law).
**Truth standard:** Spark never builds/hosts customer websites, never guarantees domains
beyond checked-at-delivery.

## 2 · THE LIVE SITE — ROOT PAGES ONLY

**The root of this disc IS the live site.** index.html at root; ~40 clean-named pages.
- **workspace.html (root)** = the ONE TRUE Client Command Center. Sign-in via magic link,
  OR direct **capsule access**: `workspace.html?r=REPORTKEY` — the report key is the
  credential, no login. ALL customer emails point here.
- checkout.html → create-checkout (bib plan, $99) → Stripe → **result.html** ("Payment
  received — your brand is being built").
- Deploy = the WHOLE zip via Netlify Drop, index.html at root. Netlify login = Gmail
  button (peterkleinusa@gmail.com). Rollback = 2 clicks on Deploys.
- **netlify.toml is LOAD-BEARING** (functions config, esbuild, CSP/security headers,
  order-watchdog + finance-cron schedules). Sweeping it broke checkout once (July 22).
- _redirects and _headers at root are live config. `SPARK BACKUP/` is noindexed.

## 3 · ⚠ LEGACY FOLDERS — DO NOT BUILD ON, DO NOT REVIVE

- **july19/** (3 old pages) and **sandbox/** (2 images) are RETIRED snapshots. They are
  scheduled to move into `SPARK BACKUP/` in small tested batches. Until then: never add
  to them, never point anything at them, never "fix" them, never copy them forward.
- **STALE REFERENCES: REPAIRED 2026-07-23.** create-checkout's add-on/activation return
  URLs now point at the root workspace (workspace.html?r=KEY). No live code references
  /sandbox or /july19 any longer; only the retired folders themselves remain, awaiting
  their move to SPARK BACKUP in a Founder-ordered batch.
- History lesson: on 2026-07-23 the core delivery email pointed at /july19/workspace.html
  (a page that didn't exist) — customers hit 404 on their main button. Fixed by
  repointing to root. This map exists so that never happens again.

## 4 · PROTECTED CORE — FOUNDER APPROVAL REQUIRED BEFORE TOUCHING

- **GENERATOR: netlify/functions/clean-names.js** — the only live naming engine
  (gpt-4o-mini). Ships in every disc. NEVER edited without explicit Founder order.
- **SPINE / GRAVEYARD:** category-dna.js, name-intel.js, category-identity-guard.js are
  FROZEN. Never edit, never re-enable, never delete. If cove/ember/haven/Granite/Sterling
  appears in output, a pointer re-aimed at the graveyard — fix the pointer, not the files.
- Everything else is open working territory under the standing laws (Design Law,
  Commerce & CX Law, Shipping & Architecture Law, Product & Production Law).

## 5 · THE WIRED STACK (all keys in Netlify env vars, NEVER in code)

NETLIFY (hosting, ~100 functions, env, schedules) · SUPABASE Pro (database, auth,
storage: reports, logos/, library/ headers) · STRIPE (payments; page price must always
equal the Stripe charge) · RESEND (all email) · ZENDESK (support) · OpenAI + Google
production APIs (names, kit text, 2K images, Veo film). Olin/Vorrex passcodes live ONLY
in env vars OLIN_PASSCODE / VORREX_PASSCODE.

## 6 · HOW A $99 ORDER FLOWS (verified 2026-07-23)

1. checkout.html → create-checkout (plan=bib) → Stripe → result.html.
2. stripe-webhook → **deliver-background.js** (15-min background allowance): clean-names
   generates wide → judge-names scores → exactly 6 curated (CURATE_TARGET).
3. **build-kit.js** writes the per-name kit (locked quantities in §1).
4. **logo-concepts(-background).js** paints 3 logo PNGs per name → Supabase logos/.
5. **art-department-background.js + studio-engine.js**: 1 shared 2K header per industry
   (library/, reused forever) + 6 cinematic variation photos.
   **CINEMATIC STANDARD (restored 2026-07-23, Founder):** dramatic, award-winning,
   flagship-campaign prompts. The July-17 "editorial/film-grain/desaturated" language
   produced vintage-looking photos and is RETIRED — never reintroduce it.
6. **send-kit.js** emails the client with the CAPSULE link (workspace.html?r=KEY).
7. Watchdogs: order-watchdog (scheduled */5), Order Board immune system, foreman chain
   (order-foreman-background: one crumb per tick, chains itself — can never time out).

## 7 · THE CLIENT WORKSPACE (workspace.html) — WHAT'S INSIDE

- Sidebar "YOUR BRAND": one card per idea — photo, the client's own words, "● Ready ·
  6 names", and the order's date+time ("Ordered Jul 23, 2026 · 1:48 PM").
- Brand view: the 2K industry header ON TOP (full-width, natural height, NEVER cropped)
  → the 6 brand-name cards (logo on top, name, URL+Available, tagline) → the full kit
  in accordions (why / logos / colors / typography / voice / taglines / avatar / bios /
  handles / about / LinkedIn / Facebook / posts).
- **DOWNLOADS (18 tiles + custom):** every tile mints a REAL file from the client's real
  assets, through ONE shared builder (buildItemFiles) so single-click, Download-selected,
  and DOWNLOAD ALL ASSETS produce identical files. Tiles are tap-to-select (highlight one
  or a group); "Download selected" and "DOWNLOAD ALL ASSETS (ZIP)" sit under the grid.
  Delivered catalog pieces appear in a "Custom-made for [Name]" group per brand name
  (order-deliver stores their asset URLs; my-orders returns them — by session token OR by
  capsule report key, same trust as report-data).
  VECTOR-FIRST (2026-07-23): the painted logo is traced in-browser into a TRUE SVG
  (imagetracerjs from cdn.jsdelivr.net — CSP-approved; agency trace settings: 12 colors,
  pathomit 24 kills speckles). Vector logo (SVG), size pack (256–2048), dark background
  (2048, client's darkest palette color), lockup (3200×960), avatar (1024) all draw from
  curves with bitmap fallback. Banners = IAB trio (300×250/728×90/160×600); cover
  1500×500; favicons 16/32/48/180. Client deliverables use the CLIENT's palette — never
  Spark's colors, never the extinct gold.
- **BRAND FONT ENGINE (2026-07-23, world-class design layer):** composed pieces (lockup,
  banners, starter page) are set in a display face CURATED TO THE INDUSTRY via
  SMN_FONTMAP (military→Black Ops One, food→Fraunces, law/finance→Playfair Display,
  trades→Archivo Black, podcast/media→Bebas Neue, spa→Cormorant Garamond,
  nonprofit→Merriweather, tech→Space Grotesk, kids→Baloo 2; unknown→Inter). If the kit
  named a real Google font, the kit wins. Fonts load from fonts.googleapis.com before
  the canvas draws; Georgia fallback means a file can never break. Contrast guard
  (_inkFor) picks ink by background luminance on composed pieces.
- **COUNT GUARANTEE (2026-07-23, two layers):** the $99 promise is EXACT quantities per
  name. (1) Factory: build-kit tops up short arrays (about 3, posts 6, LinkedIn 3,
  Facebook 3) with copy tailored from the brand's own name+idea — full kits pass through
  untouched. (2) Floor: the workspace tops up display AND files (taglines 6, bios 6,
  abouts 3, posts 6, LinkedIn 3, Facebook 3) via smnFills/topArr, so even historical
  short kits show and download full counts. "Not generated for this name" is unreachable
  for these sections. NEVER remove either layer — a model under-delivery must never
  reach a client again (TitanWing, 2026-07-23, is the cautionary tale).
- **PACKAGE CURATOR (2026-07-23):** reads the client's own idea words and curates the
  included catalog — 8 packages (Podcast, Creator, Nonprofit, Event, Food, Trades,
  Professional, Retail). Lead categories first; irrelevant ones behind "Show everything
  else" — NEVER deleted. A podcaster is never handed a menu. No match = full catalog.
- **Catalog orders:** order-request records + confirms → Founder fulfills →
  **order-deliver** (GROUP delivery): accepts {id}, {ids:[...]}, or {items:[{id,assets}]}
  to attach finished file URLs; marks all delivered; sends ONE email per client naming
  EACH piece, warm Spark voice ("Spark is rooting for you"), capsule button "Open your
  workspace — no sign-in needed".

## 8 · A–S DELIVERABLES DECISION MAP (Founder verdicts — summary)

A Identity/Verification: .com check IN; trademark report OUT/FLAGGED. B Brand Identity:
ALL IN. C Visual Library: IN (no headshots/vehicle wraps). D Web: 5-page template IN;
hosting/domains OUT. E SEO: IN. F Marketing / G Social / H Print: IN, one of each.
**I Legal & J Trademark: OUT → affiliate, ALWAYS.** K Ops, L Sales, M CX (non-live),
N Local, Q Growth, R Industry packs, S And-then-some: IN. O Compliance: OUT. P Copilot:
PASS. Full text: the deliverables roadmap (July 15 archive).

## 9 · RULES FOR EVERY FUTURE SESSION

1. Read this file + SPARK_DESIGN_LAW.md before designing or editing anything.
2. Ship in small batches; a fresh COMPLETE whole-site zip at every checkpoint, named
   `Spark (what changed) Month Day Year, HHMM.zip` (Founder format, 2026-07-23).
3. The Founder deploys himself via Netlify Drop and tests live. Claude never deploys.
4. One small ADA-calibrated step per message; exact window/button names; clickable URLs;
   Control+Click, never right-click. "q" prefix = question only, no action.
5. Never claim capabilities Spark doesn't have. Never touch the protected core (§4).
6. When in doubt: ask the Founder. He built the brain — it is like his child.

## 10 · SPARK STORE & PARTNERS (Founder, 2026-07-23)
- Shopify storefront: **sparkmyname-shop.myshopify.com**, fulfilled by **PRINTFUL**
  (standing Founder ruling: Printful/Gelato/Gooten allowed, **NOT Printify**).
- Wired into workspace.html as SMN_STORE with **live:false** — the AI Designer sends
  clients there ONLY after the Founder says STORE LIVE (products in, password page off).
- SMN_PARTNERS slots (print/shirts/mugs/promo/domains/legal) hold real affiliate URLs
  only; empty slots show NOTHING. Never invent a link or code.
- SPARK STORE PROGRAM: 90 days complimentary shopping with every $99 purchase; after,
  Spark Store — Unlimited, $19/month (price_1TwTOoFx648CsdqbmFb8wglJ, env
  STRIPE_PRICE_STOREPASS), never mentioned at point of sale, one-click cancel via
  Stripe portal. Discovery block rides the delivery emails only.
- SPARK AI DESIGNER: live interactive studio (ai-designer.js + workspace overlay) —
  knows the brand, asks one question at a time, real print spec book, top-3 suggestions
  after every build, approve = SVG + 2x PNG delivered instantly.


---

## DELIVERABLE SYSTEM — state as of 2026-07-24

**101 download tiles.** Every one routed to a generator, classified into a lane,
registered for runtime QC, zero orphans (enforced by the pipeline gate).

**Two lanes, driven by real data.**
- READY: works from the brand card alone. 60 tiles live before a client types anything.
- WAITING: needs a fact only the client can give. Each tile names the fact it needs.
  Adding a phone unlocks 27 more; phone + email reaches 100 of 101.
- Wiring: `SMN_READY` (needs nothing) and `SMN_NEEDS` (declares its facts) →
  `smnUnlocked()` → the download page re-renders the moment details are saved.

**Families:** print- (31 pieces incl. signage, mailers, cards) · biz- (10 documents) ·
soc- (6 packs) · dig- (17 posts, banners, signature) · pod- (7) · deck- (2) ·
merch- (6 transparent artwork files) · plus logo, words and website tiles.

**Governing document:** `docs/SPARK_ART_BRIEF.md` — the eight rules. Also kept outside
the disc so it can be dropped into any session on demand.

**29 gates** live in the disc-cutting session, each run twice before a disc ships.
The load-bearing ones: pipeline (no orphans), unlock (lane maths), brief (the eight
rules), sign (readable distance), eddm (USPS), qc (runtime file inspection), photo
(rotation), contain (no crop or stretch).

**Standing orders for whoever works on this next**
1. Every new deliverable declares `SMN_READY` or `SMN_NEEDS`, adds a `QC_DIMS` entry,
   and joins `SMN_PHOTO_ORDER` if it uses a photo — in the same batch that creates it.
2. Check every canvas against the iOS 16.7M-pixel ceiling. Two pieces have already been
   caught over it; both would have failed silently on an iPhone.
3. Changing a shared helper means checking every layout that calls it. Three bugs this
   session came from exactly that.
4. Nothing is "passed" that has not been looked at.
