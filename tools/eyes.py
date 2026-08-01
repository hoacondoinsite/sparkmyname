#!/usr/bin/env python3
"""
SPARK EYES — a text-based inspector for rendered deliverables.

Built because canvas output can only be judged by looking, and a looking tool is not
always available. This routes the visual information into TEXT three ways:

  1. ASCII map      — coarse layout: where the ink is, where the empty space is
  2. OCR            — the words that actually rendered, so clipping and wrong copy show up
  3. Region report  — margins, balance, colour use, contrast

Usage:  python3 eyes.py <file.png> [--ascii-cols N]
        python3 eyes.py <folder> --summary
"""
import sys, os
from PIL import Image
import numpy as np

RAMP = "@%#*+=-:. "          # dark -> light

def ascii_map(im, cols=88):
    g = im.convert('L')
    w, h = g.size
    rows = max(1, int(cols * h / w / 2.1))     # characters are ~2.1x taller than wide
    g = g.resize((cols, rows), Image.LANCZOS)
    a = np.asarray(g, dtype=float)
    idx = np.clip((a / 256 * len(RAMP)).astype(int), 0, len(RAMP) - 1)
    return "\n".join("".join(RAMP[v] for v in row) for row in idx)

def ocr(im):
    """Reads in horizontal bands. A single downscaled pass loses very large type on big
    canvases — the yard sign's headline vanished from a whole-image read while being
    perfectly legible. Bands keep the type at a size tesseract can resolve."""
    try:
        import pytesseract
        w, h = im.size
        bands = 4 if max(w, h) > 1800 else 1
        seen, lines = set(), []
        for b in range(bands):
            top = int(h * b / bands)
            bot = int(h * (b + 1) / bands)
            crop = im.convert('L').crop((0, max(0, top - int(h*0.02)), w, min(h, bot + int(h*0.02))))
            if max(crop.size) > 1600:
                s = 1600 / max(crop.size)
                crop = crop.resize((int(crop.width*s), int(crop.height*s)), Image.LANCZOS)
            for l in pytesseract.image_to_string(crop).splitlines():
                l = l.strip()
                if len(l) > 1 and l.lower() not in seen:
                    seen.add(l.lower()); lines.append(l)
        return lines
    except Exception as e:
        return [f"(ocr unavailable: {e})"]

def regions(im):
    a = np.asarray(im.convert('RGB'))
    g = np.asarray(im.convert('L'), dtype=float)
    h, w = g.shape
    bg = np.median([g[0,0], g[0,-1], g[-1,0], g[-1,-1]])
    ink = np.abs(g - bg) > 28
    out = {}
    out['size'] = f"{w}x{h}"
    out['ink coverage'] = f"{ink.mean()*100:.1f}%"
    if ink.any():
        ys, xs = np.where(ink)
        out['content box'] = f"x {xs.min()}..{xs.max()}  y {ys.min()}..{ys.max()}"
        out['margins'] = (f"L{xs.min()} R{w-1-xs.max()} T{ys.min()} B{h-1-ys.max()}")
        # thirds balance
        top = ink[:h//3].mean(); mid = ink[h//3:2*h//3].mean(); bot = ink[2*h//3:].mean()
        out['vertical balance'] = f"top {top*100:.0f}% / middle {mid*100:.0f}% / bottom {bot*100:.0f}%"
    else:
        out['content box'] = 'EMPTY'
    # dominant colours
    small = im.convert('RGB').resize((60,60))
    cols = sorted(small.getcolors(3600) or [], reverse=True)[:4]
    out['dominant colours'] = ', '.join(f"#{r:02X}{g_:02X}{b:02X}({n})" for n,(r,g_,b) in cols)
    return out

def inspect(path, cols=88, show_ascii=True):
    im = Image.open(path)
    print(f"\n{'='*78}\n{os.path.basename(path)}\n{'='*78}")
    for k, v in regions(im).items():
        print(f"  {k:18} {v}")
    words = ocr(im)
    print(f"  {'text read':18} {len(words)} line(s)")
    for l in words[:12]:
        print(f"     | {l}")
    if len(words) > 12:
        print(f"     | ... {len(words)-12} more")
    if show_ascii:
        print(f"\n{ascii_map(im, cols)}")

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    cols = 88
    if '--ascii-cols' in sys.argv:
        cols = int(sys.argv[sys.argv.index('--ascii-cols')+1])
    summary = '--summary' in sys.argv
    target = args[0] if args else '.'
    if os.path.isdir(target):
        files = sorted(f for f in os.listdir(target) if f.lower().endswith(('.png','.jpg','.jpeg')))
        for f in files:
            inspect(os.path.join(target,f), cols, show_ascii=not summary)
    else:
        inspect(target, cols, show_ascii=not summary)
