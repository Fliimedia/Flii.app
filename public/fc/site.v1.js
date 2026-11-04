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
      "#fcc{position:fixed;z-index:2147483001;left:50%;top:50%;transform:translate(-50%,-50%);width:min(320px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:16px 16px 14px;border-radius:14px;background:#FBFAF7;color:#171717;" +
      "font:13px/1.45 Inter,system-ui,-apple-system,sans-serif;box-shadow:0 18px 50px rgba(23,23,23,.18),0 0 0 1px rgba(23,23,23,.06);animation:fcc-pop .35s ease both}" +
      "#fcc p{margin:0 0 12px}" +
      "#fcc .fcc-a{display:flex;align-items:center;gap:4px}" +
      "#fcc button{font:inherit;font-size:12.5px;cursor:pointer;border:0;border-radius:999px;height:32px;padding:0 14px}" +
      "#fcc .fcc-yes{background:#171717;color:#fff;font-weight:600}#fcc .fcc-yes:hover{background:#E7255A}" +
      "#fcc .fcc-no{background:none;color:#5C5A52}#fcc .fcc-no:hover{color:#171717}" +
      "#fcc button:focus-visible{outline:2px solid #E7255A;outline-offset:2px}" +
      "#fcc h2{margin:0 0 4px;font-size:17px;font-weight:700;letter-spacing:-.01em}" +
      "#fcc ul{list-style:none;margin:8px 0 14px;padding:0}" +
      "#fcc li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid #E2DED3}" +
      "#fcc li:last-child{border-bottom:1px solid #E2DED3}" +
      "#fcc li strong{display:block;font-size:13px}#fcc li span{display:block;font-size:12px;color:#5C5A52}" +
      "#fcc .sw{position:relative;flex:none;width:40px;height:24px}" +
      "#fcc .sw input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}" +
      "#fcc .sw i{position:absolute;inset:0;border-radius:999px;background:#E2DED3;transition:background .2s;pointer-events:none}" +
      "#fcc .sw i::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:transform .2s}" +
      "#fcc .sw input:checked+i{background:#E7255A}#fcc .sw input:checked+i::after{transform:translateX(16px)}" +
      "#fcc .sw input:disabled+i{opacity:.55}#fcc .sw input:focus-visible+i{outline:2px solid #E7255A;outline-offset:2px}" +
      "@keyframes fcc-pop{from{opacity:0;transform:translate(-50%,-47%)}}" +
      "@media (prefers-reduced-motion:reduce){#fcc{animation:none}}";
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var back = document.createElement("div"); back.id = "fcc-back";
    var box = document.createElement("aside"); box.id = "fcc";
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Cookies");
    box.innerHTML = "<p>We gebruiken cookies om de site te verbeteren en advertenties relevanter te maken.</p>" +
      '<div class="fcc-a"><button class="fcc-yes" type="button">Akkoord</button><button class="fcc-no" type="button">Meer instellingen</button></div>';
    document.body.appendChild(back); document.body.appendChild(box);
    function done(stat, mkt) { save(stat, mkt); back.remove(); box.remove(); st.remove(); }
    box.querySelector(".fcc-yes").addEventListener("click", function () { done(true, true); });
    box.querySelector(".fcc-no").addEventListener("click", function () {
      box.setAttribute("aria-label", "Voorkeuren");
      box.innerHTML = "<h2>Voorkeuren</h2><p>Kies welke cookies we mogen gebruiken. Je kunt dit altijd weer aanpassen.</p><ul>" +
        '<li><div><strong>Noodzakelijk</strong><span>Nodig om de site te laten werken.</span></div><label class="sw"><input type="checkbox" checked disabled aria-label="Noodzakelijk"><i></i></label></li>' +
        '<li><div><strong>Statistieken</strong><span>Anoniem meten hoe de site gebruikt wordt.</span></div><label class="sw"><input type="checkbox" name="statistieken" checked aria-label="Statistieken"><i></i></label></li>' +
        '<li><div><strong>Marketing</strong><span>Advertenties beter laten aansluiten.</span></div><label class="sw"><input type="checkbox" name="marketing" aria-label="Marketing"><i></i></label></li>' +
        '</ul><div class="fcc-a"><button class="fcc-yes" type="button">Opslaan</button></div>';
      box.querySelector(".fcc-yes").addEventListener("click", function () {
        done(box.querySelector('[name="statistieken"]').checked, box.querySelector('[name="marketing"]').checked);
      });
      box.querySelector('[name="statistieken"]').focus({ preventScroll: true });
    });
    box.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var b = box.querySelectorAll("button, input:not([disabled])"), i = Array.prototype.indexOf.call(b, document.activeElement);
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
