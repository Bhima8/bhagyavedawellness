#!/usr/bin/env python3
"""
Bhagyaveda site builder
=======================

Run this from the project root after you change products or gallery images:

    python3 tools/build.py

It does three things (all output files are plain text you can open and read):

1. Reads  data/products.json
   -> writes js/products.js               (used by listing pages, menus, forms)
   -> writes product-detail-<slug>.html   (one static page per product)

2. Scans the gallery/ folder
   -> writes js/gallery-list.js           (used by gallery.html)

No third-party packages are needed; only Python 3.8+.
"""

import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(ROOT, "data", "products.json")
GALLERY_DIR = os.path.join(ROOT, "gallery")

SITE_NAME = "Bhagyaveda Naturals & Wellness"
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif")

# Images whose file name starts with one of these are used elsewhere on the
# site (hero banners, category circles) and are NOT listed on the gallery page.
GALLERY_EXCLUDE_PREFIXES = ("hero-", "category-")

# --------------------------------------------------------------------------
# Shared page pieces
# --------------------------------------------------------------------------
HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="keywords" content="{keywords}">
  <meta name="author" content="{site}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#2e7d32">

  <!-- Social sharing -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="{site}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:image" content="gallery/{slug}.jpg">

  <!-- Favicon -->
  <link rel="icon" href="images/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="images/favicon.png">
  <link rel="apple-touch-icon" href="images/apple-touch-icon.png">

  <!-- Fonts (to change fonts, edit this link AND the --font-* variables in css/style.css) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Nunito+Sans:wght@400;600;700;800&display=swap">
  <link rel="stylesheet" href="css/style.css">

  <!-- Structured data for search engines -->
  <script type="application/ld+json">
{jsonld}
  </script>
</head>
"""

FOOT = """
  <footer id="site-footer"></footer>

  <noscript><p style="padding:1rem;text-align:center">Please enable JavaScript to see the full menu and product lists.</p></noscript>

  <script src="js/config.js"></script>
  <script src="js/products.js"></script>
  <script src="js/gallery-list.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
"""


def e(text):
    """HTML-escape."""
    return html.escape(str(text), quote=True)


def ul(items, cls):
    if not items:
        return ""
    return '<ul class="{}">{}</ul>'.format(
        cls, "".join("<li>{}</li>".format(e(i)) for i in items)
    )


def block(title, inner):
    if not inner:
        return ""
    return '          <section class="info-block">\n            <h2>{}</h2>\n            {}\n          </section>\n'.format(title, inner)


def chips(items):
    if not items:
        return ""
    return '<ul class="chips">{}</ul>'.format(
        "".join('<li class="chip">{}</li>'.format(e(i)) for i in items)
    )


# --------------------------------------------------------------------------
# Product page
# --------------------------------------------------------------------------
def product_page(p, cats):
    cat_name = cats.get(p["category"], {}).get("name", "")
    price = "\u20b9{}".format(p["price"]) if p.get("price") else "Contact for pricing"
    title = "{} | {}".format(p["name"], SITE_NAME)
    desc = p["short"]
    keywords = ", ".join([p["name"], cat_name, "Ayurvedic", "herbal", "Bhagyaveda", "Solapur"])

    jsonld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": p["name"],
            "description": p["short"],
            "image": "gallery/{}.jpg".format(p["slug"]),
            "category": cat_name,
            "brand": {"@type": "Brand", "name": "Bhagyaveda"},
        },
        indent=2,
        ensure_ascii=False,
    )

    out = HEAD.format(
        title=e(title), desc=e(desc), keywords=e(keywords), site=e(SITE_NAME),
        slug=e(p["slug"]), jsonld=jsonld,
    )

    out += """<body data-page="product">
  <a class="skip-link" href="#main">Skip to content</a>
  <div id="site-topbar"></div>
  <header id="site-header"></header>

  <main id="main">
    <section class="page-banner">
      <div class="container">
        <h1>{name}</h1>
        <ol class="breadcrumb" aria-label="Breadcrumb">
          <li><a href="index.html">Home</a></li>
          <li><a href="products.html">Products</a></li>
          <li aria-current="page">{name}</li>
        </ol>
      </div>
    </section>

    <div class="container section">
      <div class="detail">
        <div class="detail__media">
          <!-- Replace gallery/{slug}.jpg with the real product photo (same file name) -->
          <img src="gallery/{slug}.jpg" alt="{name}" width="800" height="800">
        </div>

        <div>
{badge}          <h2 class="detail__title">{name}</h2>
          <p class="detail__short">{short}</p>
          <div class="meta-row">
            <span class="chip">{cat}</span>
{form}          </div>
          <p class="detail__price">{price}</p>
          <div class="detail__actions">
            <a class="btn" href="contact.html?product={slug}#inquiry">Enquire Now</a>
            <a class="btn btn--whatsapp" target="_blank" rel="noopener" href="contact.html?product={slug}#inquiry" data-wa="Hello Bhagyaveda, I would like to enquire about {name}.">WhatsApp Us</a>
          </div>

{about}{benefits}{features}{ingredients}{dosage}{notes}
        </div>
      </div>
    </div>

    <section class="section section--tint">
      <div class="container">
        <div class="section-head"><h2>You may also like</h2></div>
        <div class="product-grid" id="related-grid" data-current="{slug}" data-category="{category}"></div>
      </div>
    </section>
  </main>
""".format(
        name=e(p["name"]),
        slug=e(p["slug"]),
        short=e(p["short"]),
        cat=e(cat_name),
        category=e(p["category"]),
        price=e(price),
        badge=('          <span class="detail__badge">{}</span>\n'.format(e(p["badge"])) if p.get("badge") else ""),
        form=('            <span class="chip">{}</span>\n'.format(e(p["form"])) if p.get("form") else ""),
        about=block("About this product", "".join("<p>{}</p>".format(e(d)) for d in p["description"])),
        benefits=block("Benefits", ul(p.get("benefits"), "checklist")),
        features=block("Features", ul(p.get("features"), "checklist")),
        ingredients=block("Ingredients", chips(p.get("ingredients"))),
        dosage=block("How to use", ul(p.get("dosage"), "steps")),
        notes=(
            '          <div class="info-block callout">\n            {}\n          </div>\n'.format(
                "".join("<p>{}</p>".format(e(n)) for n in p["notes"])
            )
            if p.get("notes")
            else ""
        ),
    )
    out += FOOT
    return out


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------
def main():
    with open(DATA_FILE, encoding="utf-8") as fh:
        data = json.load(fh)

    cats = {c["id"]: c for c in data["categories"]}
    slugs = set()
    for p in data["products"]:
        if p["slug"] in slugs:
            sys.exit("Duplicate slug in products.json: " + p["slug"])
        slugs.add(p["slug"])
        if p["category"] not in cats:
            sys.exit("Unknown category '{}' for product '{}'".format(p["category"], p["slug"]))

    # 1a. js/products.js
    js_path = os.path.join(ROOT, "js", "products.js")
    with open(js_path, "w", encoding="utf-8") as fh:
        fh.write("/* AUTO-GENERATED by tools/build.py from data/products.json. Do not edit by hand. */\n")
        fh.write("window.PRODUCT_DATA = ")
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write(";\n")

    # 1b. product-detail-<slug>.html
    written = 0
    for p in data["products"]:
        path = os.path.join(ROOT, "product-detail-{}.html".format(p["slug"]))
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(product_page(p, cats))
        written += 1

    # Remove pages for products that no longer exist
    for name in os.listdir(ROOT):
        m = re.match(r"product-detail-(.+)\.html$", name)
        if m and m.group(1) not in slugs:
            os.remove(os.path.join(ROOT, name))
            print("Removed stale page:", name)

    # 2. gallery list
    images = []
    if os.path.isdir(GALLERY_DIR):
        for name in sorted(os.listdir(GALLERY_DIR)):
            low = name.lower()
            if low.endswith(IMAGE_EXTS) and not low.startswith(GALLERY_EXCLUDE_PREFIXES):
                images.append(name)
    with open(os.path.join(ROOT, "js", "gallery-list.js"), "w", encoding="utf-8") as fh:
        fh.write("/* AUTO-GENERATED by tools/build.py by scanning the gallery/ folder. */\n")
        fh.write("window.GALLERY_IMAGES = ")
        json.dump(images, fh, indent=2)
        fh.write(";\n")

    print("Products: {} pages written".format(written))
    print("Gallery : {} images listed".format(len(images)))
    print("Done.")


if __name__ == "__main__":
    main()
