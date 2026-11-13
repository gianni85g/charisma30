// Charisma30 website — small enhancements only; the page works without JS.
(function () {
  var KEY = "charisma30-site-lang";
  var SUPPORTED = ["en", "it", "fr"];
  var doc = document.documentElement;
  doc.classList.add("js");

  function readPref() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }
  function savePref(lang) {
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      /* storage blocked: language still works via the URL */
    }
  }

  // First visit to the English (root) home: follow the browser language once.
  var pageLang = doc.lang;
  var isRootHome = pageLang === "en" && !/\/(privacy|terms)\/?$/.test(location.pathname);
  if (isRootHome && !readPref()) {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    var want = nav.slice(0, 2).toLowerCase();
    if (want !== "en" && SUPPORTED.indexOf(want) !== -1) {
      savePref(want);
      var link = document.querySelector('.lang-menu a[data-lang="' + want + '"]');
      if (link) {
        location.replace(link.href + location.hash);
        return;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Remember an explicit language choice.
    document.querySelectorAll(".lang-menu a[data-lang]").forEach(function (a) {
      a.addEventListener("click", function () {
        savePref(a.getAttribute("data-lang"));
      });
    });

    // Close the language menu on outside click / Escape.
    var menu = document.querySelector(".lang");
    if (menu) {
      document.addEventListener("click", function (e) {
        if (menu.open && !menu.contains(e.target)) menu.open = false;
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.open) {
          menu.open = false;
          menu.querySelector("summary").focus();
        }
      });
    }

    // Gentle reveal on scroll (skipped when reduced motion is preferred).
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var targets = document.querySelectorAll(".pillar, .step, .tool, .journey-col, .priv, .split-visual");
    if (!reduce && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-in");
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      targets.forEach(function (el) {
        el.classList.add("reveal");
        io.observe(el);
      });
    }
  });
})();
