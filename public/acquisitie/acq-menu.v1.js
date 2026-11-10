/* Menu (hamburger rechtsboven) voor de acquisitie-onderdelen. Vervangt het label rechts in .kop. */
(function () {
  "use strict";
  var ITEMS = [
    { href: "/acquisitie/", titel: "Overzicht" },
    { href: "/acquisitie/website/", titel: "Website" },
    { href: "/acquisitie/pakketten/", titel: "Pakketten" }
  ];
  var pad = location.pathname.replace(/\/?$/, "/");

  function bouw(kop) {
    if (!kop || kop.querySelector(".am")) return;
    var oud = kop.querySelector(".u");
    var box = document.createElement("div");
    box.className = "am";
    box.innerHTML =
      '<button class="am-knop" type="button" aria-label="Menu" aria-expanded="false" aria-controls="am-lijst">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14M5 12h14M5 16h14"/></svg></button>' +
      '<nav class="am-lijst" id="am-lijst" hidden>' +
      ITEMS.map(function (i) {
        return '<a href="' + i.href + '"' + (i.href === pad ? ' aria-current="page"' : "") + ">" + i.titel + "</a>";
      }).join("") + "</nav>";
    if (oud) oud.replaceWith(box); else kop.appendChild(box);
    var knop = box.querySelector(".am-knop"), lijst = box.querySelector(".am-lijst");
    function zet(open) { lijst.hidden = !open; knop.setAttribute("aria-expanded", open ? "true" : "false"); }
    knop.addEventListener("click", function (e) { e.stopPropagation(); zet(lijst.hidden); });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) zet(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") zet(false); });
  }

  function scan() { document.querySelectorAll(".kop").forEach(bouw); }
  window.acqMenu = scan;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scan); else scan();
  /* De overzichts- en lijstpagina's worden door acq.v5.js opgebouwd. */
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
