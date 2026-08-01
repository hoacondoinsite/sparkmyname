# SPARK DESIGN LAW — The Measured Specification
**SparkMyName · Issued July 22, 2026 · Founder: Peter Klein · Owned by VORREX IGNITE LLC**
**Status: LAW. Every new page, section, tool, function-generated report, and email must match this spec. Changeable only by the Founder.**

This document was **measured from the live production pages** (homepage, pricing, checkout) with a real browser — it records what IS, not an opinion. Read it before designing anything new. The short version lives in Claude's memory as the SPARK DESIGN LAW; this file is the full engineering truth and rides inside every disc.

---

## 1. COLOR TOKENS (the aurora-navy system)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A1428` | Page background — the deep navy ground of every page |
| `--panel` | `#102143` | Primary card/panel fill |
| `--panel-2` | `#0D1B38` | Secondary/darker panel, footer band |
| `--ink` | `#EAF2FF` | Bright text — headings (non-gradient), key copy |
| `--soft` | `#AFC2E1` | Soft text — body copy default |
| `--muted` | `#7E93B8` | Muted text — footnotes, footer, metadata |
| `--line` | `rgba(148,180,255,.16)` | Hairline borders (panels may use `.18`) |
| `--cyan` | `#21D4FD` | Accent 1 — gradient start, info highlights |
| `--violet` | `#7C5CFF` | Accent 2 — gradient middle, primary accent |
| `--pink` | `#FF4D8D` | Accent 3 — gradient end, button gradient end |
| `--amber` | `#FFB020` | Warm highlight, warnings |
| `--green` | `#3BE88F` | Success states, "available/secured" |
| `--link` | `#A78BFA` | Hyperlinks |

**BANNED FOREVER (the extinct gold/cream era):** `#B68A2F #8A6723 #C49B3F #BF9B3C #F7F3EC #FFFDF9 #EFE3C8 #8A6D1F #9A6B2F #C9A648 #96721F` — these must never appear in any main-site page, stylesheet, script, or generated output. (`james.html` archive exempt by Founder order.)

## 2. TYPOGRAPHY (measured)

**Family: Inter, everywhere.** Weights in use: 400 (body), 500 (nav links), 800 (buttons), 900 (headlines).

| Element | Size | Weight | Line-height | Letter-spacing | Color |
|---|---|---|---|---|---|
| H1 (hero) | 64px desktop | 900 | 1.08 | −1.6px | **Gradient fill** (see below) |
| H2 (section) | 40px | 900 | 1.15 | −1.0px | Gradient fill or `--ink` |
| Body | 16.5px | 400 | 1.6 | normal | `--soft` |
| Nav link | 14px | 500 | 1.6 | normal | `--soft` (hover → `--ink`) |
| Footer text | 13px | 400 | 1.6 | normal | `--muted` |
| Button label | 14.5px | 800 | 1.6 | normal | `#FFFFFF` |

**The gradient headline** (the signature): text fill from
`linear-gradient(92deg, #21D4FD 0%, #7C5CFF 38%, #FF4D8D 72%, #FFB020 100%)`
applied via `background-clip:text; -webkit-background-clip:text; -webkit-text-fill-color:transparent;`.
Use on H1 always; on H2 for marketing sections. Never on body copy.

## 3. BUTTONS (measured — the 12px Radius Law)

Every button on every surface:
- **Background:** `linear-gradient(92deg, #7C5CFF, #FF4D8D)`
- **Text:** `#FFFFFF`, Inter 800, 14.5px
- **Radius:** `12px` — **EVERY button, no exceptions without Founder order**
- **Padding:** `13px 26px`
- **Border:** none
- **Glow shadow:** `0 10px 26px -10px rgba(255,77,141,.5)`
- **Hover:** slight lift (translateY(−1px)) and brighter glow; never a color change away from the gradient.
Secondary/ghost buttons: transparent fill, `1px solid var(--line)`, `--ink` text — radius still 12px.

## 4. PANELS & CARDS (measured)

- **Fill:** `#102143` (`--panel`); darker variant `#0D1B38`
- **Border:** `1px solid rgba(148,180,255,.18)`
- **Radius:** `26px` for feature cards; smaller utility panels may use 14–18px; footer band 12px
- **Padding:** `30px 30px 26px` typical
- **Shadow:** layered soft blue: `0 2px 6px rgba(148,180,255,.05), 0 …px rgba(148,180,255,.14)`
- Near-black feature modules (voice module, dark bands) may cut deeper than `--bg` — that layering is intentional: navy ground → darker panels → near-black feature blocks.

## 5. PAGE ANATOMY

1. **Nav** — top of page, brand wordmark left (plain "SparkMyName", NO ™ ever), links right at 14px/500; "Log in" plus one gradient CTA.
2. **Hero — TOP-ALIGNED**: primary headline + CTA sit directly under the nav on load. No oversized top padding, no full-viewport centering, no empty band.
3. **Sections** — generous vertical rhythm (checkout main pads ~56px top / 72px bottom); consistent gaps, never random.
4. **Footer** — `--panel-2` band, `--muted` 13px text, must carry: `© 2026 SparkMyName. Owned by VORREX IGNITE LLC. All rights reserved.` + `U.S. Patent Pending (App. 19/704,386)` + the not-legal-advice disclaimer. Peter Klein's name appears only in the founder note.

## 6. VOICE & CONTENT RULES (ride with the design)

- One price everywhere: **$99** — page price always equals the Stripe charge.
- **No ™ or ®** anywhere (Mark Policy).
- "**free online workspace**" — never "Studio" in public copy; "social usernames" — never "handles".
- Never claim SparkMyName builds/hosts customer websites; domains are "**checked at delivery**", never guaranteed.
- No fake urgency, fabricated reviews, star-rows, or implied ratings — the facts line uses the single spark glyph ✧.
- No dropdowns on the buy path — the generator needs only the idea.

## 7. ACCESSIBILITY FLOOR (built-in, not bolted on)

Skip-to-main link first in the tab order · every input/textarea aria-labeled or label-wrapped · every img has alt · one logical h1 · visible focus on every interactive element · keyboard reaches the full buy path · dark-adapted contrast: no text within 40 luminance points of its true composited background · works at 200% zoom · gradient-fill text is exempt from solid-color contrast checks (measured by its gradient).

## 8. HOW TO BUILD A NEW PAGE (recipe)

1. Start from an existing aurora page (pricing.html is the cleanest template).
2. Keep the shared nav + footer verbatim; change only the main content.
3. Headline: Inter 900 gradient. Body: `--soft`. Panels: `--panel` + hairline + 26px radius. Buttons: gradient + 12px.
4. Add meta per QC-05 (description 50–165, canonical, OG pointing at `/og-card.png`).
5. Add the page to `sitemap.xml` if public, or `noindex` if private.
6. Run QC-01 (visual), QC-03 (accessibility), QC-04 (brand truth) before the page ships.
7. Ship only inside a complete full-site disc per the Shipping & Architecture Law.

---
*SparkMyName · Owned by VORREX IGNITE LLC · U.S. Patent Pending (App. 19/704,386) · Internal engineering law — not customer-facing.*
