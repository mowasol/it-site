/* ============================================================
   名前
   屋号を変えるときは、SITE.name だけ変えてください。
   うたい文句は SITE.tagline です。表示、タイトル、検索用の JSON-LD はここから上書きします。
   HTML に書いてある同じ文字は、JavaScript が動かないときの控えです。

   お問い合わせフォーム（仮）
   FORM_URL … Googleフォームなどの埋め込み用 URL。空なら案内を表示します。
   例: "https://docs.google.com/forms/d/e/________/viewform?embedded=true"

   FORM_NOTIFY … 使っていません。回答の通知はGoogleフォーム側で設定します。
   ページの mailto 控えは support@mowasol.com だけ（index.html）。
   ============================================================ */
var SITE = {
  name: "AIとデジタルのmowa",
  tagline: "パソコン・スマホの困りごとから、アプリ開発まで"
};

var FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScvb5plKPqGAXg9a4uRq0Ynq1v0lUVfdyGFyqacMeiaS5kluw/viewform?embedded=true";
var FORM_NOTIFY = []; // 通知先はGoogleフォーム側で設定（公開ファイルにアドレスを書かない）

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function phraseHtml(parts) {
    var html = "";
    for (var i = 0; i < parts.length; i++) {
      if (i) html += "<wbr>";
      html += '<span class="phr">' + escapeHtml(parts[i]) + "</span>";
    }
    return html;
  }

  function nameParts(name) {
    var tail = "mowa";
    if (name.slice(-tail.length) === tail && name.length > tail.length) {
      return [name.slice(0, name.length - tail.length), tail];
    }
    return [name];
  }

  function taglineParts(tagline) {
    var parts = ["パソコン・スマホの", "困りごとから、", "アプリ開発まで"];
    if (parts.join("") !== tagline) return [tagline];
    return parts;
  }

  function fillText(selector, value) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = value;
  }

  function fillPhrase(selector, parts) {
    var html = phraseHtml(parts);
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].innerHTML = html;
  }

  function applyBrand() {
    var name = SITE.name;
    var tagline = SITE.tagline;
    fillText("[data-site='name']", name);
    fillPhrase("[data-site='name-phrase']", nameParts(name));
    fillPhrase("[data-site='tagline']", taglineParts(tagline));
    var alts = document.querySelectorAll("[data-site-alt='name']");
    for (var k = 0; k < alts.length; k++) alts[k].alt = name;

    if (document.body.getAttribute("data-page") === "missing") return;

    var title = name + "｜" + tagline;
    document.title = title;
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);
    var ogSite = document.querySelector('meta[property="og:site_name"]');
    if (ogSite) ogSite.setAttribute("content", name);
    var ogAlt = document.querySelector('meta[property="og:image:alt"]');
    if (ogAlt) ogAlt.setAttribute("content", name + "のマーク。" + tagline);

    var desc = "熊本県菊池郡大津町の" + name + "です。" + tagline + "。どんな小さなことでも、お気軽にどうぞ。診断・ご相談は無料です。";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", desc);

    var ld = document.getElementById("business-ld");
    if (!ld) return;
    try {
      var data = JSON.parse(ld.textContent);
      data.name = name;
      data.description = name + "。" + tagline + "。どんな小さなことでも、お気軽にどうぞ。診断・ご相談は無料。メールとSNSは24時間365日。事務所は年中無休 9:00〜17:00。";
      ld.textContent = JSON.stringify(data);
    } catch (err) {}
  }

  applyBrand();

  var details = document.querySelector(".menu");
  if (details) {
    var links = details.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        if (window.matchMedia("(max-width: 1079px)").matches) {
          details.removeAttribute("open");
        }
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && details.open && !document.querySelector("dialog[open]")) {
        details.removeAttribute("open");
      }
    });
  }

  var notify = document.getElementById("form-notify");
  if (notify && FORM_NOTIFY && FORM_NOTIFY.length) {
    notify.replaceChildren();
    for (var n = 0; n < FORM_NOTIFY.length; n++) {
      var item = document.createElement("li");
      item.textContent = FORM_NOTIFY[n];
      notify.appendChild(item);
    }
  }

  var slot = document.getElementById("form-slot");
  if (slot) {
    var url = String(FORM_URL || "").trim();
    if (url) {
      if (!/^https:\/\/\S+$/i.test(url)) {
        var warn = document.createElement("p");
        warn.className = "form-warn";
        warn.setAttribute("role", "alert");
        warn.textContent = "フォームの\u200b URL は、\u200bhttps から\u200b始まる\u200bものに\u200bしてください。\u200bいまの\u200b値は\u200b表示していません。";
        slot.insertBefore(warn, slot.firstChild);
      } else {
        var frame = document.createElement("iframe");
        frame.className = "form-frame";
        frame.src = url;
        frame.title = "お問い合わせフォーム";
        frame.loading = "lazy";
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        slot.replaceChildren(frame);

        var open = document.createElement("p");
        open.className = "form-open";
        var link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "フォームを\u200b別の\u200bタブで\u200b開く\u200b（別サイト）";
        open.appendChild(link);
        slot.appendChild(open);
      }
    }
  }

  setupDebug();
  setupGallery();
  setupDock();
  setupNav();

  function setupDebug() {
    var img = document.getElementById("debug-shot");
    var cap = document.getElementById("debug-cap");
    if (!img || !cap) return;
    var buttons = document.querySelectorAll("[data-debug]");
    var busy = false;

    function select(name) {
      var btn = null;
      for (var i = 0; i < buttons.length; i++) {
        var on = buttons[i].getAttribute("data-debug") === name;
        if (buttons[i].getAttribute("role") === "tab") {
          buttons[i].setAttribute("aria-selected", on ? "true" : "false");
          buttons[i].tabIndex = on ? 0 : -1;
        } else {
          buttons[i].setAttribute("aria-pressed", on ? "true" : "false");
        }
          if (on && buttons[i].hasAttribute("data-src")) btn = buttons[i];
      }
      if (!btn) return;

      function apply() {
        img.src = btn.getAttribute("data-src");
        img.alt = btn.getAttribute("data-alt");
        img.width = btn.getAttribute("data-w");
        img.height = btn.getAttribute("data-h");
        cap.textContent = btn.getAttribute("data-cap");
      }

      if (busy || reduce || !window.SiteFX || img.getAttribute("src") === btn.getAttribute("data-src")) {
        apply();
        return;
      }
      busy = true;
      window.SiteFX.fadeOut(img).then(function () {
        apply();
        return window.SiteFX.fadeIn(img);
      }).then(function () {
        busy = false;
      }).catch(function () {
        apply();
        img.style.opacity = "1";
        busy = false;
      });
    }

    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener("click", function () {
        select(this.getAttribute("data-debug"));
      });
    }

    var tabs = document.querySelectorAll(".debug-tabs [role='tab']");
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener("keydown", function (e) {
        var list = Array.prototype.slice.call(document.querySelectorAll(".debug-tabs [role='tab']"));
        var idx = list.indexOf(this);
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = list[(idx + 1) % list.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = list[(idx - 1 + list.length) % list.length];
        if (e.key === "Home") next = list[0];
        if (e.key === "End") next = list[list.length - 1];
        if (!next) return;
        e.preventDefault();
        next.focus();
        select(next.getAttribute("data-debug"));
      });
    }
  }

  function setupGallery() {
    var grid = document.getElementById("gallery");
    var dialog = document.getElementById("lightbox");
    var lightImg = document.getElementById("light-img");
    var lightCap = document.getElementById("light-cap");
    var lightCount = document.getElementById("light-count");
    if (!grid || !dialog || !lightImg) return;

    var filters = document.querySelectorAll("[data-filter]");
    var current = 0;
    var lastFocus = null;
    var busy = false;

    function cards() {
      return Array.prototype.filter.call(grid.querySelectorAll(".g-card"), function (el) {
        return !el.hidden;
      });
    }

    function showCard(index, fade) {
      var list = cards();
      if (!list.length) return;
      current = (index + list.length) % list.length;
      var card = list[current];
      var pic = card.querySelector("img");
      var caption = card.querySelector(".g-card__cap");

      function apply() {
        lightImg.src = pic.getAttribute("src");
        lightImg.alt = pic.alt;
        if (caption) {
          var capTitle = caption.querySelector(".ttl");
          var capTag = caption.querySelector(".g-card__tag");
          if (capTitle) {
            lightCap.innerHTML = (capTag ? capTag.textContent + " " : "") + capTitle.innerHTML;
          } else {
            lightCap.textContent = caption.innerText.replace(/\s+/g, " ").trim();
          }
        } else {
          lightCap.textContent = pic.alt;
        }
        if (lightCount) lightCount.textContent = (current + 1) + " / " + list.length;
      }

      if (!fade || reduce || !window.SiteFX) {
        apply();
        lightImg.style.opacity = "1";
        return;
      }
      busy = true;
      window.SiteFX.fadeOut(lightImg).then(function () {
        apply();
        return window.SiteFX.fadeIn(lightImg);
      }).then(function () {
        busy = false;
      }).catch(function () {
        apply();
        lightImg.style.opacity = "1";
        busy = false;
      });
    }

    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".g-card");
      if (!card || card.hidden) return;
      var list = cards();
      current = list.indexOf(card);
      lastFocus = card;
      showCard(current, false);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.dispatchEvent(new CustomEvent("site:lightbox-open"));
    });

    document.getElementById("light-prev").addEventListener("click", function () {
      if (!busy) showCard(current - 1, true);
    });
    document.getElementById("light-next").addEventListener("click", function () {
      if (!busy) showCard(current + 1, true);
    });
    document.getElementById("light-close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!busy) showCard(current - 1, true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!busy) showCard(current + 1, true);
      }
    });

    function applyFilter(name) {
      var items = grid.querySelectorAll(".g-card");
      for (var i = 0; i < items.length; i++) {
        var on = name === "all" || items[i].getAttribute("data-cat") === name;
        items[i].hidden = !on;
        if (on) {
          items[i].style.opacity = "1";
          items[i].style.transform = "none";
        }
      }
      grid.dataset.played = "1";
      for (var f = 0; f < filters.length; f++) {
        var pressed = filters[f].getAttribute("data-filter") === name;
        filters[f].setAttribute("aria-pressed", pressed ? "true" : "false");
      }
    }

    for (var f = 0; f < filters.length; f++) {
      filters[f].addEventListener("click", function () {
        applyFilter(this.getAttribute("data-filter"));
        markExtra();
      });
    }

    // スマホでは最初の数枚だけ見せて、「もっと見る」で残りを出す
    var SHOW_FIRST = 6;
    var more = document.createElement("button");
    more.type = "button";
    more.className = "btn btn--ghost gallery-more";
    grid.classList.add("is-collapsed");
    grid.parentNode.insertBefore(more, grid.nextSibling);

    function markExtra() {
      var list = cards();
      var all = grid.querySelectorAll(".g-card");
      for (var i = 0; i < all.length; i++) all[i].classList.remove("is-extra");
      for (var j = SHOW_FIRST; j < list.length; j++) list[j].classList.add("is-extra");
      var rest = Math.max(0, list.length - SHOW_FIRST);
      more.hidden = rest === 0 || !grid.classList.contains("is-collapsed");
      more.textContent = "ほかの写真も見る（あと" + rest + "枚）";
    }

    more.addEventListener("click", function () {
      grid.classList.remove("is-collapsed");
      more.hidden = true;
    });

    markExtra();
  }

  function setupNav() {
    var links = document.querySelectorAll(".nav-wide a[href^='#']:not(.menu__cta), .menu nav a[href^='#']:not(.menu__cta)");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute("href").slice(1);
      if (!map[id]) map[id] = [];
      map[id].push(links[i]);
    }
    var observer = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        var group = map[entries[e].target.id];
        if (!group) continue;
        for (var n = 0; n < group.length; n++) {
          group[n].classList.toggle("is-current", entries[e].isIntersecting);
        }
      }
    }, { rootMargin: "-42% 0px -48% 0px", threshold: 0 });
    var ids = Object.keys(map);
    for (var k = 0; k < ids.length; k++) {
      var section = document.getElementById(ids[k]);
      if (section) observer.observe(section);
    }
  }

  function setupDock() {
    var dock = document.getElementById("dock");
    var contact = document.getElementById("contact");
    if (!dock || !contact) return;
    var contactOn = false;
    function placeDock() {
      var scrolled = window.scrollY > 120;
      dock.classList.toggle("is-hidden", !scrolled || contactOn);
    }
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        contactOn = entries[0].isIntersecting;
        placeDock();
      }, { threshold: 0.12 });
      observer.observe(contact);
    }
    window.addEventListener("scroll", placeDock, { passive: true });
    placeDock();
  }
})();
