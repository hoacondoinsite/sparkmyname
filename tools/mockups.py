#!/usr/bin/env python3
"""
SPARK MOCKUPS — presentation renders of flat deliverables.

A brand kit full of flat PNGs reads as files. The same artwork shown on a surface, at an
angle, with a real shadow, reads as a product. That difference is most of what makes a kit
feel like it cost money.

Everything here is composited from artwork the engine already produced. NO image API is
called, so this costs nothing per brand and cannot fail on a quota.

    python3 tools/mockups.py <brand_folder> [--out <folder>]
"""
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# which deliverable gets which presentation, and how hard to tilt it
SCENES = {
    'business-card-front.png': ('card',    0.30),
    'invitation-5x7.png':      ('card',    0.22),
    'product-label-3x3.png':   ('label',   0.18),
    'hang-tag-2x3.5.png':      ('tag',     0.20),
    'lanyard-badge.png':       ('badge',   0.16),
    'yard-sign.png':           ('sign',    0.26),
    'flyer.png':               ('sheet',   0.24),
    'tee-artwork.png':         ('tee',     0.00),
    'mug-wrap-artwork.png':    ('mug',     0.00),
}


def _coeffs(src, dst):
    """Solve the 8 perspective coefficients mapping dst -> src."""
    m = []
    for (sx, sy), (dx, dy) in zip(src, dst):
        m.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        m.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
    A = np.matrix(m, dtype=float)
    B = np.array(src, dtype=float).reshape(8)
    return np.array(np.dot(np.linalg.inv(A.T * A) * A.T, B)).reshape(8)


def tilt(im, strength=0.28):
    """Rotate the artwork into perspective — right edge pushed back."""
    if strength <= 0:
        return im.convert('RGBA')
    im = im.convert('RGBA')
    w, h = im.size
    pad = int(max(w, h) * 0.30)
    canvas = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    canvas.paste(im, (pad, pad))
    W, H = canvas.size
    inset = int(h * strength * 0.5)
    src = [(0, 0), (W, 0), (W, H), (0, H)]
    dst = [(0, 0), (W, inset), (W, H - inset), (0, H)]
    return canvas.transform((W, H), Image.PERSPECTIVE, _coeffs(src, dst),
                            Image.BICUBIC, fillcolor=(0, 0, 0, 0))


def shadow(layer, blur=26, offset=(16, 26), opacity=96):
    """A real soft shadow cast from the artwork's own silhouette."""
    a = layer.split()[3]
    sh = Image.new('RGBA', layer.size, (0, 0, 0, 0))
    sh.putalpha(a.point(lambda v: int(v * opacity / 255)))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    out = Image.new('RGBA', (layer.width + offset[0] * 2, layer.height + offset[1] * 2), (0, 0, 0, 0))
    out.alpha_composite(sh, (offset[0] * 2, offset[1] * 2))
    out.alpha_composite(layer, (0, 0))
    return out


def studio(size, palette):
    """A calm studio ground built from the brand's own palette — never a stock gradient."""
    W, H = size
    base = palette[3] if len(palette) > 3 else '#FFFFFF'
    accent = palette[2] if len(palette) > 2 else base
    bg = Image.new('RGB', (W, H), _rgb(base))
    d = ImageDraw.Draw(bg, 'RGBA')
    ar, ag, ab = _rgb(accent)
    # a single soft pool of brand light, low opacity — presentation, not decoration
    for i in range(28, 0, -1):
        k = i / 28
        r = int(min(W, H) * 0.85 * k)
        d.ellipse([W * 0.5 - r, H * 0.62 - r, W * 0.5 + r, H * 0.62 + r],
                  fill=(ar, ag, ab, int(9 * (1 - k))))
    return bg.filter(ImageFilter.GaussianBlur(2))


def _rgb(h):
    h = str(h).lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def garment(art, palette, kind='tee'):
    """Place transparent merch artwork on a simple garment or vessel silhouette."""
    W, H = 1400, 1400
    bg = studio((W, H), palette)
    d = ImageDraw.Draw(bg, 'RGBA')
    body = (248, 249, 251)
    if kind == 'tee':
        d.polygon([(420, 300), (560, 240), (700, 300), (840, 240), (980, 300),
                   (930, 470), (860, 440), (860, 1120), (540, 1120), (540, 440),
                   (470, 470)], fill=body, outline=(226, 230, 236))
        box = (600, 430, 200, 260)
    elif kind == 'mug':
        d.rounded_rectangle([430, 430, 930, 1000], 40, fill=body, outline=(226, 230, 236))
        d.ellipse([900, 560, 1080, 800], outline=(226, 230, 236), width=26)
        box = (490, 500, 380, 300)
    else:
        d.rounded_rectangle([420, 380, 980, 1020], 30, fill=body, outline=(226, 230, 236))
        box = (500, 470, 400, 300)
    a = art.convert('RGBA')
    a.thumbnail((box[2], box[3]), Image.LANCZOS)
    bg = bg.convert('RGBA')
    bg.alpha_composite(a, (box[0] + (box[2] - a.width) // 2, box[1] + (box[3] - a.height) // 2))
    return bg.convert('RGB')


def present(path, palette, scene, strength):
    art = Image.open(path).convert('RGBA')
    if scene in ('tee', 'mug'):
        return garment(art, palette, scene)
    art.thumbnail((900, 900), Image.LANCZOS)
    layer = shadow(tilt(art, strength))
    pad = int(max(layer.size) * 0.24)
    W, H = layer.width + pad * 2, layer.height + pad * 2
    bg = studio((W, H), palette).convert('RGBA')
    bg.alpha_composite(layer, (pad, pad))
    return bg.convert('RGB')


def main(folder, out=None):
    import json
    out = out or os.path.join(folder, 'mockups')
    os.makedirs(out, exist_ok=True)
    meta_p = os.path.join(folder, 'brand.json')
    palette = json.load(open(meta_p))['colour_palette_hex'] if os.path.exists(meta_p) \
        else ['#1C2029', '#5A6270', '#A3A8B4', '#FFFFFF']
    made = 0
    for fn, (scene, strength) in SCENES.items():
        p = os.path.join(folder, fn)
        if not os.path.exists(p):
            continue
        try:
            img = present(p, palette, scene, strength)
            img.save(os.path.join(out, fn.replace('.png', '-mockup.png')), quality=95)
            made += 1
        except Exception as e:
            print(f'  could not present {fn}: {e}')
    print(f'  {made} mockups -> {out}')
    return made


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    main(args[0] if args else '.')
