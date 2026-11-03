// Meetcode voor flii.app, zonder Tag Manager. Alles hangt aan de cookiekeuze:
// statistieken → Google Analytics 4, marketing → LinkedIn Insight Tag en Meta-pixel.
const GA_ID = "G-C9Y9E7150B";
const LI_ID = "8645009";
const FB_ID = "1588086128263243";

const loaded = { ga: false, li: false, fb: false };

function script(src) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function consentState(c) {
  return {
    analytics_storage: c.statistieken ? "granted" : "denied",
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
  };
}

function loadGA(c) {
  if (loaded.ga) return;
  loaded.ga = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", consentState(c));
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
  script("https://www.googletagmanager.com/gtag/js?id=" + GA_ID);
}

function loadLI() {
  if (loaded.li) return;
  loaded.li = true;
  window._linkedin_partner_id = LI_ID;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(LI_ID);
  if (!window.lintrk) {
    window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
    window.lintrk.q = [];
  }
  script("https://snap.licdn.com/li.lms-analytics/insight.min.js");
}

function loadFB() {
  if (loaded.fb) return;
  loaded.fb = true;
  if (!window.fbq) {
    const n = (window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
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
  if (c.marketing) { loadLI(); loadFB(); }
  else if (loaded.fb) window.fbq("consent", "revoke");
}

function current() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem("flii-cookies") || "null") || {}; } catch (e) {}
  return Object.assign({ statistieken: true, marketing: false }, saved);
}

apply(current());
addEventListener("flii:consent", (e) => apply(e.detail || current()));

// Events. GA4 krijgt alles; Meta krijgt de standaard events Lead en Contact.
// LinkedIn telt paginaweergaven; conversies volgen zodra er conversie-ID's uit Campaign Manager zijn.
const META = { generate_lead: ["track", "Lead"], whatsapp_click: ["track", "Contact"], contact_form_open: ["trackCustom", "ContactFormOpen"] };

export function track(name, params = {}) {
  const c = current();
  if (loaded.ga && (c.statistieken || c.marketing)) window.gtag("event", name, params);
  if (loaded.fb && c.marketing && META[name]) window.fbq(META[name][0], META[name][1], params.method ? { content_name: params.method } : {});
}
