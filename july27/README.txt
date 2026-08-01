JULY 27 CONCEPT FOLDER
======================
Everything in this folder is CONCEPT WORK. It is not linked from any live page,
is not in the sitemap, and never ships to a customer.

TO VIEW: deploy the disc as normal, then open by name:
  sparkmyname.netlify.app/july27/<page-name>.html

The live homepage and workspace are untouched by anything in here.

WHEN A CONCEPT IS APPROVED it moves into the main root deliberately, as its own
small tested batch — never by copying this whole folder across.

--------------------------------------------------------------------------
story-home.html — CONCEPT HOMEPAGE (27 July 2026)
--------------------------------------------------------------------------
The Spark story told straight through on one page, taken from the WHAT SPARK
IS document and built entirely on the design system set in the workspace:
seven type steps, five shape tokens, three ink steps. Nothing on the page
invents a size, a radius or a color.

Structure, in order:
  hero -> count bar -> four-step ladder -> the problem -> what arrives ->
  the Six-Names Law -> the workspace -> price -> close -> footer

Every count on the page is one the code enforces. The footer carries the
full truth position: handles suggested not verified, no trademark clearance,
no website building or hosting, trademark pending not registered, and the
patent attributed to Peter Klein rather than to the LLC.

TO VIEW: deploy the disc as normal, then open
  sparkmyname.netlify.app/july27/story-home.html
The live homepage is untouched. Nothing links here.

IF APPROVED: it moves into the root as its own small tested batch, never by
copying the folder across.

--------------------------------------------------------------------------
home-hybrid.html — OPTION 1 CONCEPT (27 July 2026)
--------------------------------------------------------------------------
The ZenBusiness interaction patterns over the Business in a Box value
architecture, on the SparkMyName design system.

Order: hero + voice prompt + pills -> DREAM|PLAN|START|GROW stage switcher ->
stacked VS comparison -> "what $99 looks like" -> how it works -> what's
included + 8 AI studios -> founder + guarantee -> $99 CTA + returning sign-in.

TWO SPECS RECONCILED: the brief asked for fluid clamp() headings; the design
law fixes seven type steps. Every clamp is ANCHORED to the scale, so type
scales fluidly but never lands on a size outside the law.

ONE CLAIM CHANGED, DELIBERATELY: the brief carried "complete automated
business infrastructure". That exact phrase is on the founder's own truth-
correction list (WHAT SPARK IS, section 9), where the approved replacement is
"your complete brand, ready to launch". The approved wording is used.

WHAT IT NEEDS BEFORE IT COULD GO LIVE:
  1. checkout.html does not read ?idea= . The hero passes the sentence in the
     URL; checkout needs ONE line added to prefill its idea field from it.
     Nothing is broken today — the customer simply retypes.
  2. The stage switcher uses the same hero image for all four stages. Four
     distinct stage images would make it sing.
  3. The "$99 looks like" cards use glyphs, not photographs of real
     deliverables. Real ones would be far stronger.

TO VIEW: sparkmyname.netlify.app/july27/home-hybrid.html
The live homepage is untouched. Nothing links here. Page is noindex.

--------------------------------------------------------------------------
home-converted.html — FOUNDER'S PAGE, CONVERTED TO THE DESIGN LAW (27 Jul 2026)
--------------------------------------------------------------------------
The homepage the Founder supplied, converted to SPARK DESIGN LAW v2026-07-27_2221.
EVERY WORD OF THE ORIGINAL COPY WAS KEPT. Only the visual system changed.

WHAT CHANGED
  22 font sizes  -> the seven type tokens (9 were below the 16px reading floor)
  14 radii       -> the five shape tokens
  #0B0920        -> #0A1428  (purple-black to aurora navy)
  no trademark   -> SparkMyName(tm) on every wordmark
  no footer      -> footer added with the full legal position
  broken header  -> see below

WHAT WAS DELIBERATELY NOT TOUCHED
  The sixteen brand palettes (cols:['#C2410C','#F59E0B',...]) are REAL CUSTOMER
  BRAND COLORS held in the page's JS data. A blind colour sweep would have
  destroyed the showcase this page is built around. They are untouched.

THE BUG THAT MADE IT LOOK WRONG
  The page loaded js/shell.js for its header and navigation. That file does not
  exist anywhere in the disc, so NO header rendered at all. A self-contained
  header on the design law is now inlined. If the real shell.js turns up, delete
  that block and restore the script with a path that resolves.

TO VIEW: sparkmyname.netlify.app/july27/home-converted.html
