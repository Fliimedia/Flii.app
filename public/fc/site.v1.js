/* flii.app — gedeeld script voor alle pagina's behalve de homepage (die heeft eigen code):
   1. cookiekeuze (verplicht bij eerste bezoek, zelfde keuze als op de homepage, opgeslagen in "flii-cookies")
   2. meting: GA4 (statistieken), LinkedIn Insight Tag en Meta-pixel (marketing), zonder Tag Manager
   3. klik-events voor bellen en WhatsApp
   4. het logo linksboven gaat altijd naar de homepage */
(function () {
  "use strict";
  if (window.__fliiSite) return;
  window.__fliiSite = true;

  var GA_ID = "G-C9Y9E7150B", LI_ID = "8645009", FB_ID = "1588086128263243", KEY = "flii-cookies";
  var loaded = { ga: false, li: false, fb: false };

  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || "null") || {}; } catch (e) { return {}; } }
  function current() { var s = saved(); return { statistieken: "statistieken" in s ? !!s.statistieken : true, marketing: !!s.marketing }; }
  function script(src) { var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }
  function consentState(c) {
    var m = c.marketing ? "granted" : "denied";
    return { analytics_storage: c.statistieken ? "granted" : "denied", ad_storage: m, ad_user_data: m, ad_personalization: m };
  }

  function loadGA(c) {
    if (loaded.ga) return; loaded.ga = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", consentState(c));
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    script("https://www.googletagmanager.com/gtag/js?id=" + GA_ID);
  }
  function loadLI() {
    if (loaded.li) return; loaded.li = true;
    window._linkedin_partner_id = LI_ID;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LI_ID);
    if (!window.lintrk) { window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); }; window.lintrk.q = []; }
    script("https://snap.licdn.com/li.lms-analytics/insight.min.js");
  }
  function loadFB() {
    if (loaded.fb) return; loaded.fb = true;
    if (!window.fbq) {
      var n = (window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      script("https://connect.facebook.net/en_US/fbevents.js");
    }
    window.fbq("consent", "grant");
    window.fbq("init", FB_ID);
    window.fbq("track", "PageView");
  }
  function apply(c) {
    if (loaded.ga) window.gtag("consent", "update", consentState(c));
    if (c.statistieken || c.marketing) loadGA(c);
    if (c.marketing) { loadLI(); loadFB(); } else if (loaded.fb) window.fbq("consent", "revoke");
  }
  function track(name, params, metaEvent) {
    var c = current();
    if (loaded.ga) window.gtag("event", name, params || {});
    if (loaded.fb && c.marketing && metaEvent) window.fbq("track", metaEvent);
  }
  window.fliiTrack = track;

  // ---------- cookiekeuze ----------
  function save(stat, mkt) {
    var choice = { noodzakelijk: true, statistieken: stat, marketing: mkt, opgeslagen: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch (e) {}
    window.fliiConsent = choice;
    try { window.dispatchEvent(new CustomEvent("flii:consent", { detail: choice })); } catch (e) {}
    apply(choice);
  }
  function banner() {
    var css =
      "#fcc-back{position:fixed;inset:0;z-index:2147483000;background:rgba(23,23,23,.28);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}" +
      "#fcc{position:fixed;z-index:2147483001;left:50%;top:50%;transform:translate(-50%,-50%);width:min(280px,calc(100vw - 32px));padding:16px 16px 14px;border-radius:14px;background:#FBFAF7;color:#171717;" +
      "font:13px/1.45 Inter,system-ui,-apple-system,sans-serif;box-shadow:0 18px 50px rgba(23,23,23,.18),0 0 0 1px rgba(23,23,23,.06);animation:fcc-pop .35s ease both}" +
      "#fcc p{margin:0 0 12px}" +
      "#fcc .fcc-a{display:flex;align-items:center;gap:4px}" +
      "#fcc button{font:inherit;font-size:12.5px;cursor:pointer;border:0;border-radius:999px;height:32px;padding:0 14px}" +
      "#fcc .fcc-yes{background:#171717;color:#fff;font-weight:600}#fcc .fcc-yes:hover{background:#E7255A}" +
      "#fcc .fcc-no{background:none;color:#5C5A52}#fcc .fcc-no:hover{color:#171717}" +
      "#fcc button:focus-visible{outline:2px solid #E7255A;outline-offset:2px}" +
      "@keyframes fcc-pop{from{opacity:0;transform:translate(-50%,-47%)}}" +
      "@media (prefers-reduced-motion:reduce){#fcc{animation:none}}";
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var back = document.createElement("div"); back.id = "fcc-back";
    var box = document.createElement("aside"); box.id = "fcc";
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Cookies");
    box.innerHTML = "<p>We gebruiken cookies om de site te verbeteren en advertenties relevanter te maken.</p>" +
      '<div class="fcc-a"><button class="fcc-yes" type="button">Akkoord</button><button class="fcc-no" type="button">Nee, bedankt</button></div>';
    document.body.appendChild(back); document.body.appendChild(box);
    function done(stat, mkt) { save(stat, mkt); back.remove(); box.remove(); st.remove(); }
    box.querySelector(".fcc-yes").addEventListener("click", function () { done(true, true); });
    box.querySelector(".fcc-no").addEventListener("click", function () { done(true, false); });
    box.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var b = box.querySelectorAll("button"), i = Array.prototype.indexOf.call(b, document.activeElement);
      e.preventDefault(); b[(i + (e.shiftKey ? b.length - 1 : 1)) % b.length].focus();
    });
    box.querySelector(".fcc-yes").focus({ preventScroll: true });
  }

  // ---------- klik-events en logo naar home ----------
  var LOGO = ".kop > img[src*='fm-logo'], .top .brand-word, header .brand-word, .topbar .brand-word, .side-top .mark, .side-top .brand-word, .gate-card .brand-word, .lg-brand, .pt-brand";
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var logo = t.closest(LOGO);
    if (logo && !e.defaultPrevented) {
      e.preventDefault(); e.stopImmediatePropagation();
      location.href = "/";
      return;
    }
    var a = t.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) track("whatsapp_click", { method: "whatsapp" }, "Contact");
    else if (/^tel:/.test(href)) track("phone_click", { method: "phone" }, "Contact");
    else if (/^mailto:/.test(href)) track("email_click", { method: "email" }, "Contact");
  }, true);
  var lc = document.createElement("style");
  lc.textContent = LOGO.split(",").map(function (s) { return s.trim(); }).join(",") + "{cursor:pointer}";
  document.head.appendChild(lc);

  // ---------- start ----------
  function boot() {
    apply(current());
    if (!Object.keys(saved()).length) banner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
