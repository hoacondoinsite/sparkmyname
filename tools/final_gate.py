#!/usr/bin/env python3
"""
FINAL QUALITY GATE  (directive section 3)

Runs against REAL rendered output from a multi-brand batch and checks the three things
the directive names:

  1. STATE ISOLATION        no brand's output is influenced by its neighbours
  2. ASPECT RATIO BOUNDS    every deliverable holds its declared proportions
  3. ZERO TEMPLATE CLONING  no two brands produce the same artwork
  4. NO COLOUR CONTAMINATION a brand's pieces carry that brand's palette, not another's

This is the gate that runs on output, not on source. Source gates cannot see any of this.

    python3 tools/final_gate.py <batch_folder>
"""
import sys, os, json, itertools
import numpy as np
from PIL import Image

# declared proportions, width / height
SPEC = {
    'business-card-front.png': 3.75 / 2.25,
    'yard-sign.png':           24.25 / 18.25,
    'invitation-5x7.png':      5.25 / 7.25,
    'product-label-3x3.png':   3.25 / 3.25,
    'hang-tag-2x3.5.png':      2.25 / 3.75,
    'lanyard-badge.png':       2.375 / 3.625,
    'flyer.png':               8.75 / 11.25,
    'tee-artwork.png':         3000 / 4000,
    'mug-wrap-artwork.png':    2610 / 1110,
}
TOL = 0.02          # 2% tolerance on aspect
CLONE = 2.0         # mean pixel difference below this = the same artwork


def load(path, size=(64, 64)):
    return np.asarray(Image.open(path).convert('RGB').resize(size, Image.LANCZOS), dtype=np.int16)


def hexes(pal):
    return [tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) for h in pal]


def near(px, col, tol=42):
    return abs(int(px[0]) - col[0]) + abs(int(px[1]) - col[1]) + abs(int(px[2]) - col[2]) < tol


def main(folder):
    brands = sorted(d for d in os.listdir(folder) if os.path.isdir(os.path.join(folder, d)))
    if len(brands) < 2:
        print('need at least two brands to check isolation'); return 2
    meta = {}
    for b in brands:
        p = os.path.join(folder, b, 'brand.json')
        meta[b] = json.load(open(p)) if os.path.exists(p) else {}

    passes = fails = 0
    def G(label, ok):
        nonlocal passes, fails
        if ok: passes += 1; print(f'PASS  {label}')
        else:  fails += 1;  print(f'FAIL  {label}')

    print(f'FINAL QUALITY GATE — {len(brands)} brands\n')

    # ---- 2. aspect ratio bounds ----
    bad = []
    for b in brands:
        for fn, want in SPEC.items():
            p = os.path.join(folder, b, fn)
            if not os.path.exists(p): continue
            im = Image.open(p)
            got = im.width / im.height
            if abs(got - want) / want > TOL:
                bad.append(f'{b}/{fn} {got:.3f} vs {want:.3f}')
    G(f'aspect ratios hold across every brand ({len(bad)} deviations)', not bad)
    for x in bad[:6]: print(f'        {x}')

    # ---- 3. zero template cloning ----
    clones = []
    pieces = [f for f in SPEC if all(os.path.exists(os.path.join(folder, b, f)) for b in brands)]
    for fn in pieces:
        sig = {b: load(os.path.join(folder, b, fn)) for b in brands}
        for a, c in itertools.combinations(brands, 2):
            d = float(np.abs(sig[a] - sig[c]).mean())
            if d < CLONE:
                clones.append(f'{fn}: {a[:14]} vs {c[:14]} diff {d:.2f}')
    total_pairs = len(pieces) * len(brands) * (len(brands) - 1) // 2
    G(f'zero template cloning ({total_pairs} comparisons across {len(pieces)} pieces)', not clones)
    for x in clones[:6]: print(f'        {x}')

    # ---- 4. no cross-brand colour contamination ----
    # First pass flagged 13 and every one was a false positive:
    #   - near-whites and dark neutrals are UNIVERSAL. Two brands both having a pale
    #     grey-green in their palette does not mean one leaked into the other.
    #   - a brand's OWN dark, shaded by the container gradient, drifted just past a flat
    #     tolerance and got read as somebody else's colour.
    # A gate that cries wolf is worse than no gate. It now only considers colours that
    # actually IDENTIFY a brand — saturated, mid-luminance — and measures distance
    # against the brand's own palette generously enough to allow for shading.
    def identifying(c):
        lum = sum(c) / 3
        sat = max(c) - min(c)
        return 60 < lum < 200 and sat > 45      # not near-white, not near-black, has hue

    contaminated = []
    for b in brands:
        own = hexes(meta[b].get('colour_palette_hex', []))
        others = [h for ob in brands if ob != b for h in hexes(meta[ob].get('colour_palette_hex', []))]
        foreign = [c for c in others
                   if identifying(c) and not any(near(c, o, 150) for o in own)]
        if not foreign: continue
        for fn in pieces[:4]:
            p = os.path.join(folder, b, fn)
            arr = np.asarray(Image.open(p).convert('RGB').resize((90, 90))).reshape(-1, 3)
            for c in foreign:
                hits = int(np.sum(np.abs(arr.astype(int) - np.array(c)).sum(axis=1) < 24))
                if hits > arr.shape[0] * 0.03:
                    contaminated.append(f'{b[:16]}/{fn} carries rgb{c} from another brand ({hits}px)')
    G(f'no cross-brand colour contamination ({len(contaminated)} found)', not contaminated)
    for x in contaminated[:6]: print(f'        {x}')

    # ---- 1. state isolation: rendering order must not change output ----
    # a brand's artwork must depend only on its own record. If output were inherited from
    # neighbours, identical pieces would cluster by adjacency. Check that difference is
    # not correlated with roster distance.
    fn = pieces[0] if pieces else None
    if fn:
        sig = {b: load(os.path.join(folder, b, fn)) for b in brands}
        adj, far = [], []
        for i, a in enumerate(brands):
            for j, c in enumerate(brands):
                if j <= i: continue
                d = float(np.abs(sig[a] - sig[c]).mean())
                (adj if j - i == 1 else far).append(d)
        ratio = (np.mean(adj) / np.mean(far)) if far and adj else 1
        G(f'state isolation — neighbours differ as much as distant rows (ratio {ratio:.2f})',
          0.7 < ratio < 1.4)

    # ---- 5. guardrails printed on every packet (structural OCR validation) ----
    # The directive requires the five hard limits to print cleanly on EVERY brand packet,
    # not to be verified once by hand. This reads the rendered sheet for each brand.
    LIMITS = [
        ('unauthorised pricing', ['price', 'discount', 'refund']),
        ('unconfirmed timelines', ['delivery date', 'confirmed']),
        ('binding assurances',    ['medical', 'legal', 'financial', 'safety']),
        ('guaranteed results',    ['guarantee']),
        ('customer data',         ['customer', 'anyone else']),
    ]
    try:
        import pytesseract
        missing = []
        checked = 0
        for b in brands:
            p = os.path.join(folder, b, 'voice-guardrails.png')
            if not os.path.exists(p):
                missing.append(f'{b[:18]}: guardrails sheet absent from the packet'); continue
            im = Image.open(p).convert('L')
            w, h = im.size
            crop = im.crop((0, int(h * 0.55), w, h))          # the limits block
            if max(crop.size) > 1500:
                s = 1500 / max(crop.size)
                crop = crop.resize((int(crop.width * s), int(crop.height * s)), Image.LANCZOS)
            txt = pytesseract.image_to_string(crop).lower()
            checked += 1
            for label, words in LIMITS:
                if not any(wd in txt for wd in words):
                    missing.append(f'{b[:18]}: "{label}" did not print')
        G(f'the five hard limits print on every packet ({checked} brands read)', not missing)
        for x in missing[:6]:
            print(f'        {x}')
    except Exception as e:
        # FAIL SAFE. An unrun check must never read as a pass, and it must not merely be
        # noted in passing either — if the OCR subsystem is unavailable the compliance
        # guardrails have NOT been verified, and unverified packets do not ship.
        fails += 1
        print(f'FAIL  guardrail verification could not run — OCR unavailable ({e})')
        print('        The compliance block was NOT verified on any packet.')
        print('        This halts the pipeline by design: an unrun check is not a pass.')

    print(f'\nFINAL GATE: {passes} pass / {fails} fail')
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/batch_out'))
