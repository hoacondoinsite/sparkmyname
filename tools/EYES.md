# SPARK EYES — text-based inspection of rendered output

    python3 tools/eyes.py <file.png> [--ascii-cols 88]
    python3 tools/eyes.py <folder> --summary

Routes visual information into text three ways so deliverables can be judged when no
image-viewing tool is available:

1. **ASCII map** — coarse layout. Where the ink sits, where the empty space is.
2. **OCR** (tesseract) — the words that actually rendered. Catches clipped text, wrong
   copy, missing fields, and spelling errors baked into artwork.
3. **Region report** — size, ink coverage, content box, margins, vertical balance,
   dominant colours.

## What it found on its first run

- **A misspelled brand name inside a delivered logo.** The Primary concept for
  Lighthouse Bay Realty reads **"Lightouse Bay"** — the second *h* is missing. The Icon
  and Wordmark concepts spell it correctly. Nothing in the pipeline was checking this,
  because nothing was reading the artwork.
- **Bottom-heavy layouts.** The business card's content sits from 35% to 85% vertically;
  the capabilities deck cover leaves 32% empty at the top and 5% at the bottom; the
  comment card leaves 29% empty at the foot.

## The standing lesson

A brand kit can be technically perfect and still ship a client's name spelled wrong.
Geometry checks cannot see that. **Read the words.**
