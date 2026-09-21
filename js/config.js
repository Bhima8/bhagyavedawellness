/* ==========================================================================
   BHAGYAVEDA — SITE CONFIGURATION
   --------------------------------------------------------------------------
   Edit this file to change phone numbers, address, social links, menu items,
   home page banners and testimonials. No other file needs to change.
   Colours and fonts live in css/style.css (see the :root block at the top).
   ========================================================================== */

window.SITE_CONFIG = {

  /* ---------- Brand ---------------------------------------------------- */
  brand: {
    name:      "Bhagyaveda",
    nameLocal: "भाग्यवेद",
    fullName:  "Bhagyaveda Naturals & Wellness",
    tagline:   "Ancient Wisdom | Modern Health",
    logo:      "images/logo.png",        // full logo (footer, About page)
    logoMark:  "images/logo-mark.png"    // emblem only (header)
  },

  /* ---------- Contact -------------------------------------------------- */
  contact: {
    phoneDisplay:   "+91 93226 54624",   // what visitors see
    phoneTel:       "+919322654624",     // used in tel: links
    whatsappNumber: "919322654624",      // country code + number, no + or spaces
    email:          "",                  // add an email to show it in footer & contact page
    addressLines:   ["M/P Boramani, Hyderabad Road", "Solapur 413002"],
    hours:          "",                  // e.g. "Mon – Sat, 10:00 AM – 7:00 PM". Leave "" to hide
    // Google Maps embed (no API key needed). Change the q= value to move the pin.
    mapEmbedUrl:    "https://www.google.com/maps?q=Boramani,+Hyderabad+Road,+Solapur+413002&output=embed"
  },

  /* ---------- WhatsApp enquiry ----------------------------------------- */
  whatsapp: {
    // Greeting placed at the start of every enquiry sent from the contact form
    greeting: "Hello Bhagyaveda, I would like to enquire.",
    // Message used by the floating WhatsApp button
    floatingMessage: "Hello Bhagyaveda, I would like to know more about your products."
  },

  /* ---------- Social links (Samarth Success Life) ---------------------- */
  // Leave a value as "" to hide that icon.
  // Instagram and LinkedIn are placeholders: paste the real profile URLs.
  social: {
    facebook:  "https://www.facebook.com/slm3626",
    instagram: "https://www.instagram.com/",
    linkedin:  "https://www.linkedin.com/",
    youtube:   "https://www.youtube.com/@samarthsuccesslifemarketin4908/"
  },
  socialLabel: "Samarth Success Life",

  /* ---------- Main menu ------------------------------------------------ */
  // "Products" is expanded automatically with every product in data/products.json
  nav: [
    { label: "Home",     href: "index.html" },
    { label: "About Us", href: "about.html" },
    { label: "Products", href: "products.html", dropdown: "products" },
    { label: "Gallery",  href: "gallery.html" },
    { label: "Contact",  href: "contact.html" }
  ],
  joinNow: { label: "Join Now", href: "contact.html#inquiry" },   // opens the inquiry form

  /* ---------- Home page: hero slider ----------------------------------- */
  // image: file inside the gallery/ folder
  hero: {
    autoplayMs: 6000,   // set to 0 to turn autoplay off
    slides: [
      {
        kicker: "Ancient Wisdom | Modern Health",
        title:  "Herbal care rooted in Ayurveda",
        text:   "Simple, honest herbal formulations for everyday wellness, from joint comfort to daily energy.",
        image:  "hero-1.jpg",
        cta:    { label: "Explore Products", href: "products.html" }
      },
      {
        kicker: "Bone & joint care",
        title:  "Move with comfort at every age",
        text:   "Success Ortho and Joints Care support strong bones, flexible joints and easier movement.",
        image:  "hero-2.jpg",
        cta:    { label: "See Joint Care", href: "products.html?cat=bone-joint" }
      },
      {
        kicker: "Juices & tonics",
        title:  "Daily energy from nature's best",
        text:   "Sea Buckthorn, Maha Amrut and 7 Wonders bring herbs, berries and fruits into your routine.",
        image:  "hero-3.jpg",
        cta:    { label: "Shop Juices & Tonics", href: "products.html?cat=tonics" }
      },
      {
        kicker: "For the farm",
        title:  "Healthier soil, stronger crops",
        text:   "Soil Power with humic and fulvic acid helps crops take up nutrients and handle stress.",
        image:  "hero-4.jpg",
        cta:    { label: "View Soil Power", href: "product-detail-soil-power.html" }
      }
    ]
  },

  /* ---------- Home page: feature strip --------------------------------- */
  features: [
    { icon: "🌿", title: "Herbal formulations",  text: "Made with traditional Ayurvedic herbs" },
    { icon: "💬", title: "Ask before you buy",   text: "Chat with us on WhatsApp for guidance" },
    { icon: "🚚", title: "Delivery support",     text: "Contact us for delivery in your area" },
    { icon: "📞", title: "Easy to reach",        text: "Call or WhatsApp " + "+91 93226 54624" }
  ],

  /* ---------- Home page: product sections ------------------------------ */
  // Use product slugs from data/products.json. Order here = order on the page.
  home: {
    popular: [
      "success-ortho", "withamax", "joints-care", "7-wonders",
      "sea-buckthorn-juice", "well-heart", "a1-dibocare", "stem-cells"
    ],
    trending: [
      "maha-amrut-juice", "alko-vit", "fit-2-fit", "lady-care-berry-capsule",
      "ashwarin-plus", "soil-power", "piles-care", "samarth-sakhi-sanitary-pads"
    ]
  },

  /* ---------- Testimonials --------------------------------------------- */
  // NOTE: these five are copied from the reference site and mention
  // "Success Life Marketing". Replace them with your own customers' feedback
  // before publishing. Add or remove entries freely.
  testimonials: [
    {
      name: "Ravi Sharma",
      role: "Customer",
      text: "Success Life Marketing has been a game-changer for our business. Their innovative strategies and dedicated support have significantly boosted our sales and customer engagement. We’ve seen a remarkable increase in our network’s growth, all thanks to their expert guidance."
    },
    {
      name: "Pooja Sahdev",
      role: "Customer",
      text: "Partnering with Success Life Marketing was one of the best decisions we made. Their direct selling approach is both efficient and scalable, helping us to expand our market reach effortlessly. The team’s professionalism and commitment are truly commendable."
    },
    {
      name: "Amit Avhad",
      role: "Customer",
      text: "Success Life Marketing provided us with the tools and training we needed to excel in direct selling. Their personalized approach and continuous support have empowered our team to achieve our targets consistently. We highly recommend them to any business looking to grow through direct selling."
    },
    {
      name: "Anjali Desai",
      role: "Customer",
      text: "The expertise and innovative strategies from Success Life Marketing have transformed our business model. We’ve experienced a significant increase in both revenue and customer retention. Their dedication to our success is evident in every interaction."
    },
    {
      name: "Rajesh Kumar",
      role: "Customer",
      text: "Success Life Marketing’s direct selling solutions have been instrumental in our business’s growth. Their approach is not just about selling but building lasting relationships with clients. We’re grateful for their partnership and highly recommend their services."
    }
  ],

  /* ---------- Footer --------------------------------------------------- */
  footer: {
    about: "Herbal and wellness products inspired by Ayurveda, offered from Solapur, Maharashtra."
  }
};
