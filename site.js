/* ============================================================
   お問い合わせフォーム（仮）
   FORM_URL … Googleフォームなどの埋め込み用 URL。空なら案内を表示します。
   例: "https://docs.google.com/forms/d/e/________/viewform?embedded=true"

   FORM_NOTIFY … 回答の通知先。フォーム側の通知設定で、この2つ両方に届くようにする。
   ページの mailto 控えは ttamaki@mowasol.com だけ（index.html）。
   ============================================================ */
var FORM_URL = "";
var FORM_NOTIFY = [
  "ttamaki@mowasol.com",
  "satokana@mowasol.com"
];

(function () {
  "use strict";

  var details = document.querySelector(".menu");
  if (details) {
    var links = details.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        if (window.matchMedia("(max-width: 979px)").matches) {
          details.removeAttribute("open");
        }
      });
    }
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
  if (!slot) return;

  var url = String(FORM_URL || "").trim();
  if (!url) return;

  if (!/^https:\/\/\S+$/i.test(url)) {
    var warn = document.createElement("p");
    warn.className = "form-warn";
    warn.setAttribute("role", "alert");
    warn.textContent = "フォームの URL は、https から始まるものにしてください。いまの値は表示していません。";
    slot.insertBefore(warn, slot.firstChild);
    return;
  }

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
  link.textContent = "フォームを別のタブで開く（別サイト）";
  open.appendChild(link);
  slot.appendChild(open);
})();
