#!/usr/bin/env python3
"""
SPARK PRE-FLIGHT — OCR spelling validation gate.

SOP section 5: "Flawless layout is instantly ruined by a single typo."

Runs immediately after art-department ingestion. Reads the wordmark inside every
delivered logo concept and character-matches it against the master brand name. A
concept whose wordmark does not match is FLAGGED, not silently shipped.

This exists because the Primary concept for Lighthouse Bay Realty was delivered reading
"Lightouse Bay" — the second h missing — and every geometry gate in the pipeline passed
it. Nothing was reading the artwork.

    python3 preflight.py <logo-folder> --brand "Brand Name"
"""
import sys, os, re, difflib
from PIL import Image
import numpy as np

try:
    import pytesseract
    OCR = True
except Exception:
    OCR = False


def read_wordmark(path, scale=3):
    """Crop to the artwork, upscale, and read it."""
    im = Image.open(path).convert('L')
    a = np.asarray(im)
    ink = np.argwhere(a < 200)
    if not len(ink):
        return ''
    y0, x0 = ink.min(axis=0)
    y1, x1 = ink.max(axis=0)
    c = im.crop((int(x0), int(y0), int(x1) + 1, int(y1) + 1))
    c = c.resize((c.width * scale, c.height * scale), Image.LANCZOS)
    try:
        return pytesseract.image_to_string(c)
    except Exception as e:
        return f'(ocr failed: {e})'


def norm(s):
    return re.sub(r'[^a-z]', '', s.lower())


def check(folder, brand):
    files = sorted(f for f in os.listdir(folder) if f.lower().endswith(('.png', '.jpg', '.jpeg')))
    target = norm(brand)
    words = [norm(w) for w in brand.split() if len(w) > 3]
    results = []
    for f in files:
        raw = read_wordmark(os.path.join(folder, f))
        got = norm(raw)
        if not got:
            results.append((f, 'NO TEXT', raw.strip(), 0.0))
            continue
        # every significant brand word must appear intact
        missing = [w for w in words if w not in got]
        ratio = difflib.SequenceMatcher(None, target, got[:len(target) * 2]).ratio()
        if not missing:
            results.append((f, 'PASS', raw.strip().replace('\n', ' ')[:50], ratio))
        else:
            # is it a near-miss? that is the dangerous case — a typo, not a missing wordmark
            near = []
            for w in missing:
                for tok in re.findall(r'[a-z]{4,}', got):
                    r = difflib.SequenceMatcher(None, w, tok).ratio()
                    if r >= 0.80:
                        near.append((w, tok, r))
            verdict = 'TYPO' if near else 'no wordmark'
            detail = (f"expected '{near[0][0]}' but read '{near[0][1]}'"
                      if near else f"missing: {', '.join(missing)}")
            results.append((f, verdict, detail, ratio))
    return results


if __name__ == '__main__':
    if not OCR:
        print('pytesseract not available — gate cannot run')
        sys.exit(2)
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    brand = 'Brand'
    if '--brand' in sys.argv:
        brand = sys.argv[sys.argv.index('--brand') + 1]
    folder = args[0] if args else '.'

    print(f"PRE-FLIGHT SPELLING GATE — master brand name: {brand!r}\n")
    rows = check(folder, brand)
    typos = [r for r in rows if r[1] == 'TYPO']
    for f, verdict, detail, ratio in rows:
        mark = {'PASS': 'PASS ', 'TYPO': 'TYPO!', 'no wordmark': '  -  ', 'NO TEXT': '  -  '}[verdict]
        print(f"  [{mark}] {f:44} {detail}")
    print()
    if typos:
        print(f"  {len(typos)} concept(s) carry a MISSPELLED brand name and must be")
        print("  regenerated before this kit ships. A client would print their own name wrong.")
        sys.exit(1)
    print("  no misspellings found in any delivered concept")
    sys.exit(0)
