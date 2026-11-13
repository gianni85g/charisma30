// Builds the static Charisma30 website into ./site from ./src/i18n/*.json.
// Run with:  node build.mjs
// No dependencies. Output is plain HTML that GitHub Pages can serve as-is.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "site");

// ---------------------------------------------------------------------------
// CONFIG — edit these when the app goes live
// ---------------------------------------------------------------------------
const CONFIG = {
  // Store links. Leave null until the listing is live: the button then reads
  // "Coming soon" instead of linking anywhere.
  appStoreUrl: null, // e.g. "https://apps.apple.com/app/id0000000000"
  playStoreUrl: null, // e.g. "https://play.google.com/store/apps/details?id=com.charisma30.app"
  // Absolute site URL, used for canonical/hreflang/og tags. No trailing slash.
  siteUrl: "https://gianni85g.github.io/charisma30",
  email: "gianni85g@hotmail.it",
  legalUpdated: "2026-11-13",
};

const LANGS = ["en", "it", "fr"]; // first = default, served at the site root
const PREFIX = { en: "", it: "it/", fr: "fr/" };

const LESSONS = [
  "Build Calm Presence", "Warm Face & Eye Contact", "Calm Posture", "Calm Stillness",
  "Stay Calm Under Pressure", "Calm, Clear Voice", "Position Yourself Well",
  "Listen to Understand", "Natural Mirroring", "Complete Module 1: Presence",
  "Voice Variety", "Pause and Speak Clearly", "Use Clear Body Language",
  "Keep Conversation Moving", "Share Honestly, Stay Balanced", "Get to the Point",
  "Tell Short, Clear Stories", "Speak Clearly and Credibly", "Guide a Group Clearly",
  "Complete Module 2: Expression", "Listen for Feelings", "Notice Social Cues",
  "Match and Guide Gently", "Stay Steady Under Pressure", "Speak With Calm Conviction",
  "Be Warm and Clear", "Handle Interruptions Calmly", "Respectful Disagreement",
  "Guide Without Pushing", "Complete Module 3: Connection",
];

// ---------------------------------------------------------------------------
// Icons (Lucide, ISC licence) — inline SVG, 24×24, stroke = currentColor
// ---------------------------------------------------------------------------
const ICONS = {
  wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  anchor: '<path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  wifiOff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  presence: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  expression: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
  connection: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
};
const icon = (name, cls = "icon") =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

// Brand mark, inlined from assets/images/brand/completo (unmodified geometry).
const LOGO = (white = false) => `<svg class="logo-mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
  <g fill="none" stroke-width="5.5" stroke-linecap="round">
    <path d="M26.67 26.67 A33 33 0 0 1 73.33 26.67" stroke="#7C3AED"/>
    <path d="M81.87 41.46 A33 33 0 0 1 58.54 81.87" stroke="#E05A2B"/>
    <path d="M41.46 81.87 A33 33 0 0 1 18.13 41.46" stroke="#0EA5A0"/>
  </g>
  <circle cx="50" cy="17" r="6.5" fill="#7C3AED"/>
  <circle cx="78.58" cy="66.5" r="6.5" fill="#E05A2B"/>
  <circle cx="21.42" cy="66.5" r="6.5" fill="#0EA5A0"/>
  <circle cx="50" cy="34" r="6.5" fill="${white ? "#ffffff" : "currentColor"}"/>
  <path d="M30 33 Q43 41 50 49 Q57 41 70 33 Q62 45 54 57 Q53 70 50 81 Q47 70 46 57 Q38 45 30 33 Z" fill="${white ? "#ffffff" : "currentColor"}"/>
</svg>`;

// ---------------------------------------------------------------------------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const load = (lang) => JSON.parse(readFileSync(join(HERE, "src/i18n", `${lang}.json`), "utf8"));

function pagePath(lang, page) {
  return PREFIX[lang] + (page === "home" ? "" : `${page}/`);
}

function head(t, { lang, page, root, title, description }) {
  const alternates = LANGS.map((l) => {
    const href = CONFIG.siteUrl ? `${CONFIG.siteUrl}/${pagePath(l, page)}` : `${root}${pagePath(l, page)}`;
    return `<link rel="alternate" hreflang="${l}" href="${href}">`;
  }).join("\n  ");
  const xdefault = CONFIG.siteUrl
    ? `${CONFIG.siteUrl}/${pagePath(LANGS[0], page)}`
    : `${root}${pagePath(LANGS[0], page)}`;
  const canonical = CONFIG.siteUrl ? `<link rel="canonical" href="${CONFIG.siteUrl}/${pagePath(lang, page)}">` : "";
  const ogImage = CONFIG.siteUrl
    ? `<meta property="og:image" content="${CONFIG.siteUrl}/assets/img/brand/play-store-feature-graphic-1024x500.png">`
    : "";
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#13213F">
  ${canonical}
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="${xdefault}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:locale" content="${t.locale}">
  ${ogImage}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" sizes="32x32" href="${root}assets/img/brand/archi-favicon-32.png">
  <link rel="apple-touch-icon" href="${root}assets/img/brand/archi-192-navy.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="${root}assets/styles.css">
  <script src="${root}assets/main.js" defer></script>
</head>`;
}

function langSwitch(t, lang, page, root) {
  const opts = LANGS.map((l) => {
    const name = load(l).langName;
    const cur = l === lang ? ' aria-current="true"' : "";
    return `<li><a href="${root}${pagePath(l, page)}" hreflang="${l}" lang="${l}" data-lang="${l}"${cur}>${name}</a></li>`;
  }).join("");
  return `<details class="lang">
        <summary aria-label="${esc(t.nav.language)}">${icon("globe")}<span>${lang.toUpperCase()}</span>${icon("chevronDown", "icon icon-sm")}</summary>
        <ul class="lang-menu">${opts}</ul>
      </details>`;
}

function header(t, lang, page, root) {
  const home = `${root}${PREFIX[lang]}`;
  const navLinks =
    page === "home"
      ? `<nav class="nav-links" aria-label="Main">
        <a href="#how">${esc(t.nav.how)}</a>
        <a href="#journey">${esc(t.nav.journey)}</a>
        <a href="#faq">${esc(t.nav.faq)}</a>
      </nav>`
      : "";
  return `<a class="skip" href="#main">${esc(t.nav.skip)}</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${home}" aria-label="Charisma30 home">${LOGO()}<span>Charisma<b>30</b></span></a>
      ${navLinks}
      <div class="header-actions">
      ${langSwitch(t, lang, page, root)}
      <a class="btn btn-primary btn-sm header-cta" href="${home}#download">${esc(t.nav.cta)}</a>
      </div>
    </div>
  </header>`;
}

function storeButtons(t) {
  const btn = (url, pre, name, ic) => {
    const inner = `${icon(ic, "icon store-icon")}<span class="store-text"><small>${esc(url ? pre : t.store.soon)}</small><strong>${esc(name)}</strong></span>`;
    return url
      ? `<a class="store-btn" href="${url}" rel="noopener">${inner}</a>`
      : `<span class="store-btn is-soon" aria-disabled="true">${inner}</span>`;
  };
  return `<div class="stores">
          ${btn(CONFIG.appStoreUrl, t.store.iosPre, t.store.ios, "smartphone")}
          ${btn(CONFIG.playStoreUrl, t.store.androidPre, t.store.android, "play")}
        </div>
        <p class="store-note">${esc(t.store.free)}</p>`;
}

// A phone with a light screenshot and, when given, a dark-mode variant.
function phone(root, light, dark, alt, cls = "", eager = false) {
  const src = `${root}assets/img/screens/${light}.jpg`;
  const darkSrc = dark ? `<source srcset="${root}assets/img/screens/${dark}.jpg" media="(prefers-color-scheme: dark)">` : "";
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<figure class="phone ${cls}">
      <picture>${darkSrc}<img src="${src}" width="720" height="1560" alt="${esc(alt)}" ${loading} decoding="async"></picture>
    </figure>`;
}

function footer(t, lang, root) {
  const p = PREFIX[lang];
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <a class="brand" href="${root}${p}">${LOGO()}<span>Charisma<b>30</b></span></a>
        <p>${esc(t.footer.tagline)}</p>
      </div>
      <nav class="footer-links" aria-label="Footer">
        <a href="${root}${p}privacy/">${esc(t.footer.privacy)}</a>
        <a href="${root}${p}terms/">${esc(t.footer.terms)}</a>
        <a href="mailto:${CONFIG.email}">${esc(t.footer.contact)}</a>
      </nav>
      <p class="footer-legal">© ${year} Charisma30. ${esc(t.footer.rights)}</p>
    </div>
  </footer>`;
}

// ---------------------------------------------------------------------------
function home(t, lang) {
  const root = "../".repeat(PREFIX[lang] ? 1 : 0);
  const MOD = ["presence", "expression", "connection"];

  const proof = t.proof
    .map((p) => `<li><strong>${esc(p.n)}</strong><span>${esc(p.l)}</span></li>`)
    .join("");

  const pillars = t.pillars.items
    .map(
      (m, i) => `<article class="pillar pillar-${m.key}">
          <div class="pillar-top">
            <span class="pillar-icon">${icon(m.key)}</span>
            <span class="pillar-days">${esc(t.pillars.daysLabel)} ${esc(m.days)}</span>
          </div>
          <h3>${esc(m.name)}</h3>
          <p>${esc(m.text)}</p>
          <ul class="pillar-examples">${m.examples.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>
          <span class="pillar-index" aria-hidden="true">0${i + 1}</span>
        </article>`,
    )
    .join("\n        ");

  const steps = t.how.steps
    .map(
      (s, i) => `<li class="step">
            <span class="step-n" aria-hidden="true">${i + 1}</span>
            <div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>
          </li>`,
    )
    .join("\n          ");

  const tools = t.toolkit.items
    .map(
      (it) => `<li class="tool">
            <span class="tool-icon">${icon(it.icon)}</span>
            <div><h3>${esc(it.t)}</h3><p>${esc(it.d)}</p></div>
          </li>`,
    )
    .join("\n          ");

  const bullets = t.progress.bullets
    .map((b) => `<li>${icon("check", "icon icon-sm")}<span>${esc(b)}</span></li>`)
    .join("");

  const days = LESSONS.map((title, i) => {
    const milestone = (i + 1) % 10 === 0 ? " is-milestone" : "";
    return `<li class="day${milestone}"><span class="day-n">${esc(t.journey.day)} ${i + 1}</span><span class="day-t">${esc(title)}</span></li>`;
  });
  const journeyCols = MOD.map((m, i) => {
    const item = t.pillars.items[i];
    return `<div class="journey-col col-${m}">
            <h3 class="journey-head">${icon(m, "icon icon-sm")}${esc(item.name)} <span>${esc(t.pillars.daysLabel)} ${esc(item.days)}</span></h3>
            <ol class="days">${days.slice(i * 10, i * 10 + 10).join("")}</ol>
          </div>`;
  }).join("\n          ");

  const privacy = t.privacy.items
    .map(
      (p) => `<li class="priv">
            <span class="priv-icon">${icon(p.icon)}</span>
            <h3>${esc(p.t)}</h3>
            <p>${esc(p.d)}</p>
          </li>`,
    )
    .join("\n          ");

  const faq = t.faq.items
    .map(
      (f) => `<details class="faq-item">
            <summary><span>${esc(f.q)}</span>${icon("chevronDown", "icon faq-chev")}</summary>
            <p>${esc(f.a)}</p>
          </details>`,
    )
    .join("\n          ");

  const html = `${head(t, { lang, page: "home", root, title: t.meta.title, description: t.meta.description })}
<body>
  ${header(t, lang, "home", root)}
  <main id="main">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="container hero-inner">
        <div class="hero-copy">
          <p class="eyebrow eyebrow-light">${esc(t.hero.eyebrow)}</p>
          <h1 id="hero-title">${esc(t.hero.title)} <span class="accent-text">${esc(t.hero.titleAccent)}</span></h1>
          <p class="lead">${esc(t.hero.lead)}</p>
          ${storeButtons(t)}
        </div>
        <div class="hero-visual">
          ${phone(root, "lesson", null, t.hero.shot2Alt, "phone-back", true)}
          ${phone(root, "home", "home-dark", t.hero.shotAlt, "phone-front", true)}
        </div>
      </div>
      <div class="container">
        <ul class="proof">${proof}</ul>
      </div>
    </section>

    <section class="section" id="skills" aria-labelledby="skills-title">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow">${esc(t.pillars.eyebrow)}</p>
          <h2 id="skills-title">${esc(t.pillars.title)}</h2>
          <p class="section-lead">${esc(t.pillars.lead)}</p>
        </header>
        <div class="pillars">
        ${pillars}
        </div>
      </div>
    </section>

    <section class="section section-alt" id="how" aria-labelledby="how-title">
      <div class="container split">
        <div class="split-copy">
          <p class="eyebrow">${esc(t.how.eyebrow)}</p>
          <h2 id="how-title">${esc(t.how.title)}</h2>
          <p class="section-lead">${esc(t.how.lead)}</p>
          <ol class="steps">
          ${steps}
          </ol>
        </div>
        <div class="split-visual">
          ${phone(root, "lesson", null, t.how.shotAlt)}
        </div>
      </div>
    </section>

    <section class="section" id="toolkit" aria-labelledby="toolkit-title">
      <div class="container split split-reverse">
        <div class="split-copy">
          <p class="eyebrow">${esc(t.toolkit.eyebrow)}</p>
          <h2 id="toolkit-title">${esc(t.toolkit.title)}</h2>
          <p class="section-lead">${esc(t.toolkit.lead)}</p>
          <ul class="tools">
          ${tools}
          </ul>
        </div>
        <div class="split-visual">
          ${phone(root, "tool", null, t.toolkit.shotAlt)}
        </div>
      </div>
    </section>

    <section class="section section-alt" id="progress" aria-labelledby="progress-title">
      <div class="container split">
        <div class="split-copy">
          <p class="eyebrow">${esc(t.progress.eyebrow)}</p>
          <h2 id="progress-title">${esc(t.progress.title)}</h2>
          <p class="section-lead">${esc(t.progress.lead)}</p>
          <ul class="checks">${bullets}</ul>
        </div>
        <div class="split-visual">
          ${phone(root, "progress", "progress-dark", t.progress.shotAlt)}
        </div>
      </div>
    </section>

    <section class="section" id="journey" aria-labelledby="journey-title">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow">${esc(t.journey.eyebrow)}</p>
          <h2 id="journey-title">${esc(t.journey.title)}</h2>
          <p class="section-lead">${esc(t.journey.lead)}</p>
        </header>
        <div class="journey">
          ${journeyCols}
        </div>
        ${t.journey.note ? `<p class="journey-note">${esc(t.journey.note)}</p>` : ""}
      </div>
    </section>

    <section class="section section-navy" id="privacy" aria-labelledby="privacy-title">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow eyebrow-light">${esc(t.privacy.eyebrow)}</p>
          <h2 id="privacy-title">${esc(t.privacy.title)}</h2>
        </header>
        <ul class="privs">
          ${privacy}
        </ul>
      </div>
    </section>

    <section class="section" id="faq" aria-labelledby="faq-title">
      <div class="container container-narrow">
        <header class="section-head">
          <p class="eyebrow">${esc(t.faq.eyebrow)}</p>
          <h2 id="faq-title">${esc(t.faq.title)}</h2>
        </header>
        <div class="faq">
          ${faq}
        </div>
      </div>
    </section>

    <section class="final" id="download" aria-labelledby="final-title">
      <div class="container final-inner">
        ${LOGO(true)}
        <h2 id="final-title">${esc(t.final.title)}</h2>
        <p class="lead">${esc(t.final.lead)}</p>
        ${storeButtons(t)}
      </div>
    </section>
  </main>
  ${footer(t, lang, root)}
</body>
</html>
`;
  write(`${PREFIX[lang]}index.html`, html);
}

function legal(t, lang, kind) {
  const root = "../".repeat((PREFIX[lang] ? 1 : 0) + 1);
  const L = t.legal[kind];
  const title = kind === "privacy" ? t.meta.privacyTitle : t.meta.termsTitle;
  const mail = `<a href="mailto:${CONFIG.email}">${CONFIG.email}</a>`;
  const sections = L.sections
    .map((s) => `<h2>${esc(s.h)}</h2>\n        <p>${esc(s.p).replace("{email}", mail)}</p>`)
    .join("\n        ");
  const html = `${head(t, { lang, page: kind, root, title, description: L.intro })}
<body>
  ${header(t, lang, kind, root)}
  <main id="main" class="legal">
    <div class="container container-narrow">
      <a class="back" href="${root}${PREFIX[lang]}">${icon("arrowLeft", "icon icon-sm")}${esc(t.legal.back)}</a>
      <article class="prose">
        <h1>${esc(L.title)}</h1>
        <p class="updated">${esc(t.legal.updated)}: <time datetime="${CONFIG.legalUpdated}">${CONFIG.legalUpdated}</time></p>
        <p class="intro">${esc(L.intro)}</p>
        ${sections}
      </article>
    </div>
  </main>
  ${footer(t, lang, root)}
</body>
</html>
`;
  write(`${pagePath(lang, kind)}index.html`, html);
}

function write(rel, content) {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log("wrote", rel);
}

for (const lang of LANGS) {
  const t = load(lang);
  home(t, lang);
  legal(t, lang, "privacy");
  legal(t, lang, "terms");
}
// GitHub Pages: serve files as-is (no Jekyll processing).
write(".nojekyll", "");
write(
  "404.html",
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>Not found — Charisma30</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#13213F;color:#F1F5F9;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:16px}a{color:#A78BFA}</style></head><body><main><h1>Page not found</h1><p>The page you were looking for doesn't exist.</p></main></body></html>\n`,
);
