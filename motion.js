/* Motion（framer-motion と同じライブラリ）のスクロール演出。
   本体は assets/vendor/motion.js（MIT）。読み込めないときは、隠した要素を戻す。 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var failTimer = window.setTimeout(function () {
    root.classList.add("motion-failed");
  }, 2500);

  function fail() {
    window.clearTimeout(failTimer);
    root.classList.add("motion-failed");
  }

  if (reduce) {
    fail();
    return;
  }

  import("./assets/vendor/motion.js").then(function (m) {
    try {
      start(m);
      window.clearTimeout(failTimer);
      root.classList.remove("motion-failed");
      root.classList.add("motion-ready");
    } catch (err) {
      fail();
    }
  }).catch(fail);

  function seen(el, margin) {
    var r = el.getBoundingClientRect();
    var limit = window.innerHeight * (1 - (margin || 0.08));
    return r.top < limit && r.bottom > 0;
  }

  function start(m) {
    var animate = m.animate;
    var inView = m.inView;
    var stagger = m.stagger;
    var hover = m.hover;
    var press = m.press;
    var scroll = m.scroll;
    var ease = [0.22, 1, 0.36, 1];

    window.SiteFX = {
      fadeOut: function (el) {
        return animate(el, { opacity: 0, y: 10 }, { duration: 0.16, ease: "easeOut" }).finished;
      },
      fadeIn: function (el) {
        return animate(el, { opacity: 1, y: 0 }, { duration: 0.34, ease: ease }).finished;
      }
    };

    animate(".hero-rise", { opacity: [0, 1], y: [40, 0] }, {
      duration: 0.9,
      delay: stagger(0.09),
      ease: ease
    });
    animate(".hero-side", { opacity: [0, 1], y: [36, 0], scale: [0.92, 1] }, {
      duration: 0.9,
      delay: stagger(0.14, { startDelay: 0.2 }),
      ease: ease
    });
    var mainImg = document.querySelector(".shot--main img");
    if (mainImg) {
      animate(mainImg, { scale: [1.12, 1] }, { duration: 1.45, ease: ease });
    }

    function playItems(el) {
      if (!el || el.dataset.played === "1") return;
      el.dataset.played = "1";
      var items = el.querySelectorAll(".reveal-item");
      if (!items.length) return;
      animate(items, { opacity: [0, 1], y: [36, 0] }, {
        delay: stagger(0.07, { startDelay: 0.04 }),
        duration: 0.72,
        ease: ease
      });
    }

    function playBlock(el) {
      if (!el || el.dataset.played === "1") return;
      el.dataset.played = "1";
      animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 0.7, ease: ease });
    }

    document.querySelectorAll("[data-stagger]").forEach(function (el) {
      if (seen(el)) playItems(el);
    });
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (seen(el)) playBlock(el);
    });

    inView("[data-stagger]", function (el) { playItems(el); }, { margin: "0px 0px -8% 0px" });
    inView(".reveal", function (el) { playBlock(el); }, { margin: "0px 0px -8% 0px" });

    document.querySelectorAll(".faq").forEach(function (item) {
      item.addEventListener("toggle", function () {
        var body = item.querySelector("p");
        if (item.open && body) {
          animate(body, { opacity: [0, 1], y: [8, 0] }, { duration: 0.32, ease: ease });
        }
      });
    });

    hover(".trouble, .service, .price-card, .work, .strength, .g-card, .debug-point", function (el) {
      animate(el, { y: -12 }, { duration: 0.28, ease: ease });
      return function () {
        animate(el, { y: 0 }, { duration: 0.35, ease: ease });
      };
    });

    press(".btn, .chip", function (el) {
      animate(el, { scale: 0.97 }, { duration: 0.1 });
      return function () {
        animate(el, { scale: 1 }, { duration: 0.16 });
      };
    });

    var bar = document.querySelector(".scroll-progress");
    var header = document.querySelector(".site-header");
    scroll(function (progress) {
      if (bar) bar.style.transform = "scaleX(" + progress + ")";
      if (header) header.classList.toggle("is-scrolled", progress > 0.008);
    });

    var menu = document.querySelector(".menu");
    if (menu) {
      menu.addEventListener("toggle", function () {
        if (!menu.open) return;
        animate(menu.querySelectorAll("nav a"), { opacity: [0, 1], x: [-8, 0] }, {
          delay: stagger(0.03),
          duration: 0.32,
          ease: ease
        });
      });
    }

    document.addEventListener("site:lightbox-open", function () {
      var panel = document.querySelector(".lightbox__panel");
      if (panel) animate(panel, { opacity: [0, 1], y: [28, 0], scale: [0.96, 1] }, { duration: 0.45, ease: ease });
    });
  }
})();
