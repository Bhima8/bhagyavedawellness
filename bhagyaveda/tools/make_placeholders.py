#!/usr/bin/env python3
"""
Creates placeholder images in gallery/ so the site looks complete before real
photos are available.

    python3 tools/make_placeholders.py            # creates only MISSING files
    python3 tools/make_placeholders.py --force    # overwrites existing files

Requires Pillow:  pip install pillow
Real photos: simply save them over these files using the SAME file names.
"""

import json
import math
import os
import random
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GALLERY = os.path.join(ROOT, "gallery")
FORCE = "--force" in sys.argv

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

GREENS = [(46, 125, 50), (76, 153, 60), (27, 94, 32), (104, 159, 56), (56, 142, 60)]
GOLD = (201, 162, 39)
CREAM = (254, 251, 243)


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


def leaf(draw, cx, cy, length, width, angle, color):
    """Draw a pointed leaf (lens shape) rotated by `angle` degrees."""
    pts = []
    steps = 24
    for i in range(steps + 1):
        t = i / steps
        x = (t - 0.5) * length
        y = math.sin(math.pi * t) * width / 2
        pts.append((x, y))
    for i in range(steps, -1, -1):
        t = i / steps
        x = (t - 0.5) * length
        y = -math.sin(math.pi * t) * width / 2
        pts.append((x, y))
    a = math.radians(angle)
    out = [(cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a)) for x, y in pts]
    draw.polygon(out, fill=color)


def make(name, w, h, title, subtitle="Placeholder image", seed=0):
    path = os.path.join(GALLERY, name)
    if os.path.exists(path) and not FORCE:
        return False
    rnd = random.Random(seed or name)
    img = Image.new("RGB", (w, h), CREAM)
    d = ImageDraw.Draw(img, "RGBA")

    # soft gradient wash
    base = rnd.choice(GREENS)
    for y in range(h):
        t = y / h
        col = tuple(int(CREAM[i] * (1 - t * 0.55) + base[i] * (t * 0.55)) for i in range(3))
        d.line([(0, y), (w, y)], fill=col)

    # decorative leaves
    m = min(w, h)
    for _ in range(9):
        c = rnd.choice(GREENS + [GOLD])
        leaf(d, rnd.randint(0, w), rnd.randint(int(h * 0.1), h),
             rnd.randint(int(m * 0.25), int(m * 0.6)), rnd.randint(int(m * 0.08), int(m * 0.2)),
             rnd.randint(0, 360), c + (rnd.randint(35, 90),))

    # label card
    card_w, card_h = int(w * 0.8), int(h * 0.3)
    x0, y0 = (w - card_w) // 2, (h - card_h) // 2
    d.rounded_rectangle((x0, y0, x0 + card_w, y0 + card_h), radius=int(m * 0.04), fill=(255, 255, 255, 235))
    fs = max(18, int(m * 0.075))
    f = font(FONT_BOLD, fs)
    lines = textwrap.wrap(title, width=max(10, int(card_w / (fs * 0.62))))[:3]
    lh = int(fs * 1.25)
    total = lh * len(lines)
    ty = y0 + (card_h - total - int(fs * 0.9)) // 2
    for line in lines:
        tw = d.textlength(line, font=f)
        d.text(((w - tw) / 2, ty), line, font=f, fill=(27, 94, 32))
        ty += lh
    sf = font(FONT_REG, max(12, int(m * 0.033)))
    tw = d.textlength(subtitle, font=sf)
    d.text(((w - tw) / 2, ty + int(fs * 0.2)), subtitle, font=sf, fill=(90, 107, 87))

    img.save(path, "JPEG", quality=82, optimize=True)
    return True


def main():
    os.makedirs(GALLERY, exist_ok=True)
    with open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8") as fh:
        data = json.load(fh)

    made = 0
    # Product photos (800 x 800)
    for p in data["products"]:
        made += make(p["slug"] + ".jpg", 800, 800, p["name"], "Product photo placeholder")
    # Category circles (400 x 400)
    for c in data["categories"]:
        made += make(c["image"], 400, 400, c["name"], "Category image")
    # Hero banners (1000 x 800)
    for i in range(1, 5):
        made += make("hero-{}.jpg".format(i), 1000, 800, "Hero banner {}".format(i), "Replace with hero-{}.jpg".format(i))
    # Extra gallery images in mixed shapes
    shapes = [(800, 600), (600, 800), (800, 800), (800, 500), (600, 700), (800, 640)]
    for i in range(1, 13):
        w, h = shapes[(i - 1) % len(shapes)]
        made += make("gallery-{:02d}.jpg".format(i), w, h, "Gallery image {:02d}".format(i), "Placeholder image")

    print("Created {} placeholder images in gallery/".format(made))


if __name__ == "__main__":
    main()
