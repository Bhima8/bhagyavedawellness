/* ==========================================================================
   BHAGYAVEDA — MAIN SCRIPT (vanilla JavaScript, no dependencies)
   --------------------------------------------------------------------------
   Reads settings from js/config.js and products from js/products.js
   (generated from data/products.json by tools/build.py).

   What it does on every page:
     - builds the header, footer and floating WhatsApp / phone buttons
   Page-specific features (chosen by <body data-page="...">):
     home, products, product (dynamic detail), gallery, contact
   ========================================================================== */
(function () {
  "use strict";

  var C = window.SITE_CONFIG || {};
  var DATA = window.PRODUCT_DATA || { categories: [], products: [] };
  var GALLERY = window.GALLERY_IMAGES || [];
  var PAGE = document.body.getAttribute("data-page") || "";

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function getParam(name) { return new URLSearchParams(window.location.search).get(name); }

  var BY_SLUG = {};
  DATA.products.forEach(function (p) { BY_SLUG[p.slug] = p; });
  var CAT_BY_ID = {};
  DATA.categories.forEach(function (c) { CAT_BY_ID[c.id] = c; });

  function productUrl(slug) { return "product-detail-" + slug + ".html"; }
  function enquiryUrl(slug) { return "contact.html?product=" + encodeURIComponent(slug) + "#inquiry"; }
  function galleryImg(file) { return "gallery/" + file; }
  function catName(id) { return CAT_BY_ID[id] ? CAT_BY_ID[id].name : ""; }
  function whatsappUrl(text) {
    return "https://wa.me/" + C.contact.whatsappNumber + (text ? "?text=" + encodeURIComponent(text) : "");
  }
  function priceLabel(p) { return p.price ? "₹" + p.price : "Contact for pricing"; }

  /* Any image that fails to load is swapped for a simple leaf placeholder,
     so a missing file never leaves a broken-image icon on the page. */
  var FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e8f5e9"/>' +
    '<path d="M200 300c-60-20-90-80-70-150 60 0 110 40 110 100 0 20-10 40-40 50z" fill="#2e7d32" opacity=".55"/>' +
    '<text x="200" y="345" font-family="Arial" font-size="18" text-anchor="middle" fill="#1b5e20">Image coming soon</text></svg>');
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.src !== FALLBACK && !t.dataset.fallbackDone) {
      t.dataset.fallbackDone = "1";
      t.src = FALLBACK;
    }
  }, true);

  /* Social icons (inline SVG so no extra files are needed) */
  var ICONS = {
    facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    instagram: "M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5a4.25 4.25 0 004.25 4.25h8.5a4.25 4.25 0 004.25-4.25v-8.5a4.25 4.25 0 00-4.25-4.25h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm5.25-2.25a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z",
    linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    youtube: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
    phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICONS[name] + '"/></svg>';
  }
  function socialLinks(extraClass) {
    var out = "";
    ["facebook", "instagram", "linkedin", "youtube"].forEach(function (n) {
      var url = C.social && C.social[n];
      if (url) {
        out += '<a href="' + esc(url) + '" target="_blank" rel="noopener" aria-label="' +
          esc((C.socialLabel || C.brand.name) + " on " + n) + '">' + svg(n) + "</a>";
      }
    });
    return out ? '<div class="social ' + (extraClass || "") + '">' + out + "</div>" : "";
  }

  /* ------------------------------------------------------------------ *
   * Product card (used on home, products, related lists)
   * ------------------------------------------------------------------ */
  function productCard(p) {
    return '<article class="pcard">' +
      '<a class="pcard__media" href="' + productUrl(p.slug) + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + galleryImg(p.slug + ".jpg") + '" alt="" loading="lazy" width="400" height="400">' +
        (p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : "") +
      "</a>" +
      '<div class="pcard__body">' +
        '<p class="pcard__cat">' + esc(catName(p.category)) + "</p>" +
        '<h3><a href="' + productUrl(p.slug) + '">' + esc(p.name) + "</a></h3>" +
        '<p class="pcard__short">' + esc(p.short) + "</p>" +
        '<div class="pcard__foot">' +
          '<span class="price">' + esc(priceLabel(p)) + "</span>" +
          '<a class="btn btn--sm" href="' + enquiryUrl(p.slug) + '">Enquire Now</a>' +
        "</div>" +
      "</div></article>";
  }
  function renderGrid(target, list) {
    target.innerHTML = list.length
      ? list.map(productCard).join("")
      : '<p class="empty">No products found. Try a different search or category.</p>';
  }
  function slugsToProducts(slugs) {
    return (slugs || []).map(function (s) { return BY_SLUG[s]; }).filter(Boolean);
  }

  /* ------------------------------------------------------------------ *
   * Header, footer, floating buttons
   * ------------------------------------------------------------------ */
  function buildHeader() {
    var host = $("#site-header");
    if (!host) return;
    var ct = C.contact;
    var topHost = $("#site-topbar");

    var topbar =
      '<div class="topbar"><div class="container topbar__inner">' +
        "<span>" + esc(C.brand.tagline) + "</span>" +
        '<div class="topbar__links">' +
          "<span>" + esc(ct.addressLines.join(", ")) + "</span>" +
          '<a href="tel:' + esc(ct.phoneTel) + '">' + esc(ct.phoneDisplay) + "</a>" +
        "</div></div></div>";

    var navHtml = C.nav.map(function (item) {
      var isCurrent =
        (item.href === "index.html" && PAGE === "home") ||
        (item.href === "about.html" && PAGE === "about") ||
        (item.href === "products.html" && (PAGE === "products" || PAGE === "product")) ||
        (item.href === "gallery.html" && PAGE === "gallery") ||
        (item.href === "contact.html" && PAGE === "contact");
      var cur = isCurrent ? ' aria-current="page"' : "";
      if (item.dropdown === "products") {
        var links = '<a href="products.html">All Products</a>' + DATA.products.map(function (p) {
          return '<a href="' + productUrl(p.slug) + '">' + esc(p.name) + "</a>";
        }).join("");
        return '<li class="nav__item nav__item--has-menu">' +
          '<a class="nav__link" href="' + item.href + '"' + cur + ">" + esc(item.label) + "</a>" +
          '<button class="nav__link nav__caret-btn" type="button" aria-expanded="false" aria-label="Show product list">▾</button>' +
          '<div class="dropdown">' + links + "</div></li>";
      }
      return '<li class="nav__item"><a class="nav__link" href="' + item.href + '"' + cur + ">" + esc(item.label) + "</a></li>";
    }).join("");

    if (topHost) topHost.innerHTML = topbar;
    host.className = "site-header";
    host.innerHTML =
      '<div class="container header__inner">' +
        '<a class="brand" href="index.html" aria-label="' + esc(C.brand.fullName) + ' home">' +
          '<img class="brand__mark" src="' + esc(C.brand.logoMark) + '" alt="" width="56" height="56">' +
          '<span class="brand__text"><span class="brand__name">' + esc(C.brand.name) + "</span>" +
          '<span class="brand__tag">Naturals &amp; Wellness</span></span>' +
        "</a>" +
        '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
        '<nav class="nav" id="site-nav" aria-label="Main"><ul class="nav__list">' + navHtml + "</ul>" +
          '<a class="btn btn--gold" href="' + esc(C.joinNow.href) + '">' + esc(C.joinNow.label) + "</a></nav>" +
      "</div>";

    // Mobile menu toggle
    var toggle = $(".nav-toggle", host), nav = $("#site-nav", host);
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
    });
    // Product dropdown toggle (touch / keyboard)
    $$(".nav__caret-btn", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".nav__item");
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        $$(".nav__item.is-open").forEach(function (i) { i.classList.remove("is-open"); });
      }
    });
  }

  function buildFooter() {
    var host = $("#site-footer");
    if (!host) return;
    var ct = C.contact;
    host.className = "site-footer";
    host.innerHTML =
      '<div class="container footer__grid">' +
        "<div>" +
          '<img class="footer__logo" src="' + esc(C.brand.logo) + '" alt="' + esc(C.brand.fullName) + ' logo" loading="lazy">' +
          "<p>" + esc(C.footer.about) + "</p>" +
          '<p style="margin-bottom:0"><small>Follow ' + esc(C.socialLabel) + "</small></p>" + socialLinks() +
        "</div>" +
        "<div><h3>Quick Links</h3><ul class=\"footer__links\">" +
          C.nav.map(function (n) { return '<li><a href="' + n.href + '">' + esc(n.label) + "</a></li>"; }).join("") +
          '<li><a href="contact.html#inquiry">Inquiry Form</a></li></ul></div>' +
        "<div><h3>Popular Products</h3><ul class=\"footer__links\">" +
          slugsToProducts(C.home.popular).slice(0, 6).map(function (p) {
            return '<li><a href="' + productUrl(p.slug) + '">' + esc(p.name) + "</a></li>";
          }).join("") +
          '<li><a href="products.html">View all products</a></li></ul></div>' +
        "<div><h3>Contact Us</h3><ul class=\"footer__contact\">" +
          "<li><span aria-hidden=\"true\">📍</span><span>" + esc(ct.addressLines.join(", ")) + "</span></li>" +
          '<li><span aria-hidden="true">📞</span><a href="tel:' + esc(ct.phoneTel) + '">' + esc(ct.phoneDisplay) + "</a></li>" +
          '<li><span aria-hidden="true">💬</span><a href="' + whatsappUrl("") + '" target="_blank" rel="noopener">WhatsApp us</a></li>' +
          (ct.email ? '<li><span aria-hidden="true">✉️</span><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></li>" : "") +
        "</ul></div>" +
      "</div>" +
      '<div class="container footer__bottom">' +
        "<p>&copy; " + new Date().getFullYear() + " " + esc(C.brand.fullName) + ". All rights reserved.</p>" +
      "</div>";
  }

  function buildFloatingButtons() {
    var wrap = document.createElement("div");
    wrap.className = "fab-stack";
    wrap.innerHTML =
      '<a class="fab fab--call" href="tel:' + esc(C.contact.phoneTel) + '" aria-label="Call us">' + svg("phone") + "</a>" +
      '<a class="fab fab--whatsapp" href="' + whatsappUrl(C.whatsapp.floatingMessage) +
      '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + svg("whatsapp") + "</a>";
    document.body.appendChild(wrap);
  }

  /* Links marked data-wa="message" open WhatsApp with that text, using the
     number from config.js. (Used by the generated product pages.) */
  function bindWhatsappLinks(root) {
    $$("[data-wa]", root).forEach(function (a) {
      a.setAttribute("href", whatsappUrl(a.getAttribute("data-wa")));
    });
  }

  /* ------------------------------------------------------------------ *
   * HOME PAGE
   * ------------------------------------------------------------------ */
  function initHero() {
    var host = $("#hero");
    if (!host) return;
    var slides = C.hero.slides;
    host.innerHTML = slides.map(function (s, i) {
      return '<div class="hero__slide' + (i === 0 ? " is-active" : "") + '" role="group" aria-label="Slide ' + (i + 1) + " of " + slides.length + '">' +
        '<div class="container hero__grid">' +
          '<div class="hero__text">' +
            '<p class="hero__kicker">' + esc(s.kicker) + "</p>" +
            (i === 0 ? "<h1>" : "<h2>") + esc(s.title) + (i === 0 ? "</h1>" : "</h2>") +
            "<p>" + esc(s.text) + "</p>" +
            '<div class="hero__actions">' +
              '<a class="btn" href="' + esc(s.cta.href) + '">' + esc(s.cta.label) + "</a>" +
              '<a class="btn btn--outline" href="' + esc(C.joinNow.href) + '">' + esc(C.joinNow.label) + "</a>" +
            "</div>" +
          "</div>" +
          '<div class="hero__media"><img src="' + galleryImg(s.image) + '" alt="" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' width="800" height="640"></div>' +
        "</div></div>";
    }).join("") + '<div class="hero__dots" role="tablist" aria-label="Choose slide">' +
      slides.map(function (s, i) {
        return '<button type="button" aria-label="Show slide ' + (i + 1) + '" aria-current="' + (i === 0) + '"></button>';
      }).join("") + "</div>";

    var slideEls = $$(".hero__slide", host), dots = $$(".hero__dots button", host), idx = 0, timer = null;
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slideEls.forEach(function (el, i) { el.classList.toggle("is-active", i === idx); });
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === idx); });
    }
    dots.forEach(function (d, i) { d.addEventListener("click", function () { show(i); restart(); }); });
    function restart() {
      clearInterval(timer);
      if (C.hero.autoplayMs > 0 && slides.length > 1) {
        timer = setInterval(function () { show(idx + 1); }, C.hero.autoplayMs);
      }
    }
    restart();
  }

  function initFeatures() {
    var host = $("#features");
    if (!host) return;
    host.innerHTML = C.features.map(function (f) {
      return '<div class="feature"><span class="feature__icon" aria-hidden="true">' + f.icon + "</span>" +
        "<div><h3>" + esc(f.title) + "</h3><p>" + esc(f.text) + "</p></div></div>";
    }).join("");
  }

  function initCategories() {
    var host = $("#category-grid");
    if (!host) return;
    host.innerHTML = DATA.categories.map(function (c) {
      return '<a class="category-card" href="products.html?cat=' + encodeURIComponent(c.id) + '">' +
        '<div class="category-card__img"><img src="' + galleryImg(c.image) + '" alt="" loading="lazy" width="180" height="180"></div>' +
        "<h3>" + esc(c.name) + "</h3><p>" + esc(c.blurb) + "</p></a>";
    }).join("");
  }

  function initPopular() {
    var grid = $("#popular-grid"), tabsHost = $("#popular-tabs");
    if (!grid) return;
    var list = slugsToProducts(C.home.popular);
    var cats = [];
    list.forEach(function (p) { if (cats.indexOf(p.category) === -1) cats.push(p.category); });
    var active = "all";
    function draw() {
      renderGrid(grid, list.filter(function (p) { return active === "all" || p.category === active; }));
      $$(".tab", tabsHost).forEach(function (t) { t.setAttribute("aria-pressed", t.dataset.cat === active); });
    }
    tabsHost.innerHTML = '<button class="tab" type="button" data-cat="all">All</button>' +
      cats.map(function (id) { return '<button class="tab" type="button" data-cat="' + id + '">' + esc(catName(id)) + "</button>"; }).join("");
    tabsHost.addEventListener("click", function (e) {
      var b = e.target.closest(".tab");
      if (b) { active = b.dataset.cat; draw(); }
    });
    draw();
  }

  function initTrending() {
    var grid = $("#trending-grid");
    if (grid) renderGrid(grid, slugsToProducts(C.home.trending));
  }

  function initTestimonials() {
    var host = $("#testimonials");
    if (!host) return;
    host.innerHTML = C.testimonials.map(function (t) {
      return '<figure class="testimonial" style="margin:0"><blockquote class="testimonial__quote" style="margin:0">' + esc(t.text) + "</blockquote>" +
        '<figcaption class="testimonial__who"><span class="avatar" aria-hidden="true">' + esc(t.name.charAt(0)) + "</span>" +
        "<div><strong>" + esc(t.name) + "</strong><span>" + esc(t.role) + "</span></div></figcaption></figure>";
    }).join("");
  }

  /* ------------------------------------------------------------------ *
   * PRODUCTS LISTING PAGE (?cat=... &q=...)
   * ------------------------------------------------------------------ */
  function initProductsPage() {
    var grid = $("#all-products-grid");
    if (!grid) return;
    var tabsHost = $("#category-tabs"), search = $("#product-search"), count = $("#result-count");
    var state = { cat: getParam("cat") || "all", q: getParam("q") || "" };
    if (state.cat !== "all" && !CAT_BY_ID[state.cat]) state.cat = "all";
    search.value = state.q;

    tabsHost.innerHTML = '<button class="tab" type="button" data-cat="all">All Products</button>' +
      DATA.categories.map(function (c) {
        return '<button class="tab" type="button" data-cat="' + c.id + '">' + esc(c.name) + "</button>";
      }).join("");

    function draw() {
      var q = state.q.trim().toLowerCase();
      var list = DATA.products.filter(function (p) {
        var inCat = state.cat === "all" || p.category === state.cat;
        var inText = !q || (p.name + " " + p.short + " " + catName(p.category)).toLowerCase().indexOf(q) !== -1;
        return inCat && inText;
      });
      renderGrid(grid, list);
      count.textContent = "Showing " + list.length + " of " + DATA.products.length + " products";
      $$(".tab", tabsHost).forEach(function (t) { t.setAttribute("aria-pressed", t.dataset.cat === state.cat); });
      var params = new URLSearchParams();
      if (state.cat !== "all") params.set("cat", state.cat);
      if (state.q) params.set("q", state.q);
      var qs = params.toString();
      try { history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "")); } catch (e) { /* file:// */ }
    }
    tabsHost.addEventListener("click", function (e) {
      var b = e.target.closest(".tab");
      if (b) { state.cat = b.dataset.cat; draw(); }
    });
    search.addEventListener("input", function () { state.q = search.value; draw(); });
    draw();
  }

  /* ------------------------------------------------------------------ *
   * PRODUCT DETAIL — related products, and the dynamic template page
   * ------------------------------------------------------------------ */
  function initRelated() {
    var grid = $("#related-grid");
    if (!grid) return;
    var current = grid.getAttribute("data-current");
    var cat = grid.getAttribute("data-category");
    var same = DATA.products.filter(function (p) { return p.slug !== current && p.category === cat; });
    var others = DATA.products.filter(function (p) { return p.slug !== current && p.category !== cat; });
    renderGrid(grid, same.concat(others).slice(0, 4));
  }

  function list(items, cls) {
    return items && items.length ? '<ul class="' + cls + '">' + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" : "";
  }
  function block(title, inner) {
    return inner ? '<section class="info-block"><h2>' + title + "</h2>" + inner + "</section>" : "";
  }

  /* product-detail.html?product=slug  ->  builds the same layout as the
     generated product-detail-<slug>.html pages. */
  function initDynamicProduct() {
    var root = $("#product-root");
    if (!root) return;
    var p = BY_SLUG[getParam("product")];
    if (!p) {
      root.innerHTML = '<div class="container section"><p class="empty">Product not found. <a href="products.html">Browse all products</a>.</p></div>';
      return;
    }
    document.title = p.name + " | " + C.brand.fullName;
    var crumb = $("#crumb-name"); if (crumb) crumb.textContent = p.name;
    var title = $("#banner-title"); if (title) title.textContent = p.name;

    root.innerHTML =
      '<div class="container section"><div class="detail">' +
        '<div class="detail__media"><img src="' + galleryImg(p.slug + ".jpg") + '" alt="' + esc(p.name) + '" width="800" height="800"></div>' +
        "<div>" +
          (p.badge ? '<span class="detail__badge">' + esc(p.badge) + "</span>" : "") +
          "<h2 class=\"detail__title\">" + esc(p.name) + "</h2>" +
          '<p class="detail__short">' + esc(p.short) + "</p>" +
          '<div class="meta-row"><span class="chip">' + esc(catName(p.category)) + "</span>" +
            (p.form ? '<span class="chip">' + esc(p.form) + "</span>" : "") + "</div>" +
          '<p class="detail__price">' + esc(priceLabel(p)) + "</p>" +
          '<div class="detail__actions"><a class="btn" href="' + enquiryUrl(p.slug) + '">Enquire Now</a>' +
            '<a class="btn btn--whatsapp" target="_blank" rel="noopener" href="' + whatsappUrl("Hello Bhagyaveda, I would like to enquire about " + p.name + ".") + '">WhatsApp Us</a></div>' +
          block("About this product", p.description.map(function (d) { return "<p>" + esc(d) + "</p>"; }).join("")) +
          block("Benefits", list(p.benefits, "checklist")) +
          block("Features", list(p.features, "checklist")) +
          block("Ingredients", p.ingredients && p.ingredients.length ? '<ul class="chips">' + p.ingredients.map(function (i) { return '<li class="chip">' + esc(i) + "</li>"; }).join("") + "</ul>" : "") +
          block("How to use", list(p.dosage, "steps")) +
          (p.notes && p.notes.length ? '<div class="info-block callout">' + p.notes.map(function (n) { return "<p>" + esc(n) + "</p>"; }).join("") + "</div>" : "") +
        "</div></div></div>" +
      '<section class="section section--tint"><div class="container"><div class="section-head"><h2>You may also like</h2></div>' +
        '<div class="product-grid" id="related-grid" data-current="' + esc(p.slug) + '" data-category="' + esc(p.category) + '"></div></div></section>';
    initRelated();
  }

  /* ------------------------------------------------------------------ *
   * GALLERY PAGE + LIGHTBOX
   * ------------------------------------------------------------------ */
  function prettyName(file) {
    var base = file.replace(/\.[a-z0-9]+$/i, "");
    var slug = BY_SLUG[base];
    if (slug) return slug.name;
    return base.replace(/[-_]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function initGallery() {
    var grid = $("#gallery-grid");
    if (!grid) return;
    if (!GALLERY.length) {
      grid.outerHTML = '<p class="empty">No images yet. Add pictures to the gallery folder and run tools/build.py (see README).</p>';
      return;
    }
    grid.innerHTML = GALLERY.map(function (f, i) {
      return '<button class="gallery-item" type="button" data-i="' + i + '" aria-label="View ' + esc(prettyName(f)) + '">' +
        '<img src="' + galleryImg(f) + '" alt="' + esc(prettyName(f)) + '" loading="lazy"></button>';
    }).join("");

    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    box.innerHTML = '<button class="lightbox__close" type="button" aria-label="Close">×</button>' +
      '<button class="lightbox__prev" type="button" aria-label="Previous image">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lightbox__next" type="button" aria-label="Next image">›</button>';
    document.body.appendChild(box);
    var img = $("img", box), cap = $("figcaption", box), cur = 0, lastFocus = null;

    function open(i) {
      cur = (i + GALLERY.length) % GALLERY.length;
      img.src = galleryImg(GALLERY[cur]);
      img.alt = prettyName(GALLERY[cur]);
      cap.textContent = prettyName(GALLERY[cur]) + "  (" + (cur + 1) + " / " + GALLERY.length + ")";
      if (!box.classList.contains("is-open")) { lastFocus = document.activeElement; box.classList.add("is-open"); $(".lightbox__close", box).focus(); }
    }
    function close() { box.classList.remove("is-open"); if (lastFocus) lastFocus.focus(); }
    grid.addEventListener("click", function (e) {
      var b = e.target.closest(".gallery-item");
      if (b) open(parseInt(b.dataset.i, 10));
    });
    $(".lightbox__close", box).addEventListener("click", close);
    $(".lightbox__prev", box).addEventListener("click", function () { open(cur - 1); });
    $(".lightbox__next", box).addEventListener("click", function () { open(cur + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") open(cur - 1);
      if (e.key === "ArrowRight") open(cur + 1);
    });
  }

  /* ------------------------------------------------------------------ *
   * CONTACT PAGE — details, map, and inquiry form -> WhatsApp
   * ------------------------------------------------------------------ */
  function initContactInfo() {
    var list = $("#contact-info");
    if (!list) return;
    var ct = C.contact;
    function row(icon, label, value) {
      return '<li><span class="info-list__icon" aria-hidden="true">' + icon + "</span><div><strong>" + label + "</strong>" + value + "</div></li>";
    }
    list.innerHTML =
      row("📞", "Phone / WhatsApp", '<a href="tel:' + esc(ct.phoneTel) + '">' + esc(ct.phoneDisplay) + "</a>" +
        ' · <a href="' + whatsappUrl("") + '" target="_blank" rel="noopener">Chat on WhatsApp</a>') +
      row("📍", "Address", esc(ct.addressLines.join(", "))) +
      (ct.email ? row("✉️", "Email", '<a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a>") : "") +
      (ct.hours ? row("🕒", "Hours", esc(ct.hours)) : "");

    var soc = $("#contact-social");
    var links = socialLinks("social--dark");
    if (soc && links) soc.innerHTML = "<h3>Follow " + esc(C.socialLabel) + "</h3>" + links;

    var map = $("#map-wrap");
    if (map && ct.mapEmbedUrl) {
      map.innerHTML = '<iframe title="Map showing ' + esc(ct.addressLines.join(", ")) + '" src="' + esc(ct.mapEmbedUrl) +
        '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
    } else if (map) {
      map.remove();
    }
  }

  function initContact() {
    var form = $("#inquiry-form");
    if (!form) return;
    var select = $("#f-product");

    // Product interest dropdown, grouped by category
    var html = '<option value="">General enquiry</option>';
    DATA.categories.forEach(function (c) {
      var items = DATA.products.filter(function (p) { return p.category === c.id; });
      if (!items.length) return;
      html += '<optgroup label="' + esc(c.name) + '">' + items.map(function (p) {
        return '<option value="' + esc(p.slug) + '">' + esc(p.name) + "</option>";
      }).join("") + "</optgroup>";
    });
    select.innerHTML = html;
    var pre = getParam("product");
    if (pre && BY_SLUG[pre]) select.value = pre;

    function setError(id, msg) {
      var input = $("#" + id), err = $("#" + id + "-error");
      err.textContent = msg || "";
      if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
      return !msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#f-name").value.trim();
      var phone = $("#f-phone").value.trim();
      var email = $("#f-email").value.trim();
      var message = $("#f-message").value.trim();
      var product = BY_SLUG[select.value];

      var digits = phone.replace(/\D/g, "");
      var ok = true;
      ok = setError("f-name", name ? "" : "Please enter your name.") && ok;
      ok = setError("f-phone", digits.length >= 10 && digits.length <= 13 ? "" : "Please enter a valid phone number (at least 10 digits).") && ok;
      ok = setError("f-email", !email || /^\S+@\S+\.\S+$/.test(email) ? "" : "Please enter a valid email address.") && ok;
      if (!ok) { var bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); return; }

      var lines = [C.whatsapp.greeting, "",
        "Name: " + name,
        "Phone: " + phone];
      if (email) lines.push("Email: " + email);
      lines.push("Product interest: " + (product ? product.name : "General enquiry"));
      if (message) lines.push("Message: " + message);
      var url = whatsappUrl(lines.join("\n"));

      var status = $("#form-status");
      status.innerHTML = 'Opening WhatsApp… If nothing happens, <a href="' + esc(url) + '" target="_blank" rel="noopener">tap here to send your enquiry</a>.';
      var w = window.open(url, "_blank", "noopener");
      if (!w) window.location.href = url;
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  buildHeader();
  buildFooter();
  buildFloatingButtons();
  bindWhatsappLinks();
  initHero();
  initFeatures();
  initCategories();
  initPopular();
  initTrending();
  initTestimonials();
  initProductsPage();
  initRelated();
  initDynamicProduct();
  initGallery();
  initContactInfo();
  initContact();
})();
