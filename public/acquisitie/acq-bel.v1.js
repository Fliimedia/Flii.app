/* Gedeeld door de leadlijsten en het cold call script: belstatussen, fases, opslag op de server en de agenda.
   Gesprekken en fases staan in Supabase (functie acq), alleen voor beheerders. Inloggen loopt via /client/. */
(function () {
  "use strict";

  var API = "https://zuhxlabepqkjnyprdeub.supabase.co/functions/v1/acq";
  var DASHKEY = "flii-dash-session";

  var FASES = [
    { id: "cold", naam: "Cold call" },
    { id: "warm", naam: "Warm call" },
    { id: "deal", naam: "Deal call" },
    { id: "closed", naam: "Closed" },
    { id: "af", naam: "Afgevallen" }
  ];

  /* Elke mogelijke uitkomst van een belpoging. fase: null laat de fase van de lead staan.
     opvolging: aantal dagen tot de volgende actie (uren bij "uren"), null = geen vervolg. */
  var STATUSSEN = [
    { id: "geengehoor", naam: "Geen gehoor", bereikt: false, fase: null, opvolging: 1, titel: "Opnieuw bellen", duur: 5 },
    { id: "voicemail", naam: "Voicemail ingesproken", bereikt: false, fase: null, opvolging: 2, titel: "Opnieuw bellen na voicemail", duur: 5 },
    { id: "ingesprek", naam: "In gesprek", bereikt: false, fase: null, opvolging: 0, uren: 2, titel: "Opnieuw bellen", duur: 5 },
    { id: "verkeerd", naam: "Verkeerd nummer", bereikt: false, fase: "af", opvolging: null },
    { id: "gestopt", naam: "Bedrijf gestopt", bereikt: false, fase: "af", opvolging: null },
    { id: "terugbellen", naam: "Terugbellen afgesproken", bereikt: true, fase: "cold", opvolging: 1, titel: "Terugbellen", duur: 10 },
    { id: "later", naam: "Later opnieuw bellen", bereikt: true, fase: "cold", opvolging: 91, titel: "Opnieuw bellen", duur: 10 },
    { id: "sturen", naam: "Voorbeeld sturen en nabellen", bereikt: true, fase: "warm", opvolging: 2, titel: "Nabellen voorbeeld", duur: 10 },
    { id: "afspraak", naam: "Afspraak gepland", bereikt: true, fase: "deal", opvolging: 1, titel: "Videocall", duur: 15 },
    { id: "klant", naam: "Klant geworden", bereikt: true, fase: "closed", opvolging: null },
    { id: "geeninteresse", naam: "Geen interesse", bereikt: true, fase: "af", opvolging: 182, titel: "Opnieuw proberen", duur: 10, optioneel: true },
    { id: "heeftal", naam: "Heeft al een oplossing", bereikt: true, fase: "af", opvolging: 182, titel: "Opnieuw proberen", duur: 10, optioneel: true },
    { id: "nietbellen", naam: "Wil niet meer gebeld worden", bereikt: true, fase: "af", opvolging: null }
  ];

  var LIJSTEN = [
    { slug: "website", titel: "Website", data: "/acquisitie/website/leads.v3.json" },
    { slug: "social-advertising", titel: "Social advertising", data: "/acquisitie/social-advertising/leads.v1.json" },
    { slug: "social-content", titel: "Social content creation", data: "/acquisitie/social-content/leads.v1.json" },
    { slug: "search-llm", titel: "Search & LLM advertising", data: "/acquisitie/search-llm/leads.v1.json" },
    { slug: "interviews", titel: "Interviews", data: "/acquisitie/interviews/leads.v1.json", groep: "overig" }
  ];

  function statusVan(id) { return STATUSSEN.filter(function (s) { return s.id === id || s.naam === id; })[0] || null; }
  function faseNaam(id) { var f = FASES.filter(function (x) { return x.id === id; })[0]; return f ? f.naam : ""; }

  /* ---------- sessie en server ---------- */
  function sessie() {
    try {
      var s = JSON.parse(localStorage.getItem(DASHKEY) || "null");
      return s && s.token && s.exp > Date.now() && s.role === "admin" ? s : null;
    } catch (e) { return null; }
  }
  function naarPortal() { location.replace("/client/?next=" + encodeURIComponent(location.pathname + location.search)); }
  function api(pad, body) {
    var s = sessie();
    if (!s) { naarPortal(); return Promise.reject(new Error("login")); }
    return fetch(API + pad, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json", Authorization: "Bearer " + s.token } : { Authorization: "Bearer " + s.token },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (r.status === 401 || r.status === 403) {
        try { localStorage.removeItem(DASHKEY); } catch (e) {}
        naarPortal();
        throw new Error("login");
      }
      if (!r.ok) throw new Error("server");
      return r.json();
    });
  }
  function staat(lijst) { return api("/state" + (lijst ? "?lijst=" + encodeURIComponent(lijst) : "")); }
  function zetFase(lijst, id, fase) { return api("/fase", { lijst: lijst, lead_id: id, fase: fase }); }
  function logGesprek(g) { return api("/call", g); }
  function verwijder(id) { return api("/delete", { id: id }); }

  /* Fases die alleen nog in deze browser stonden, eenmalig naar de server. */
  function importeer() {
    var oud;
    try { oud = JSON.parse(localStorage.getItem("flii.acquisition.v1") || "null"); } catch (e) { oud = null; }
    try { if (localStorage.getItem("flii.acquisition.geimporteerd")) return Promise.resolve(); } catch (e) {}
    if (!oud || !Object.keys(oud).length) return Promise.resolve();
    return api("/import", { fases: oud }).then(function () {
      try { localStorage.setItem("flii.acquisition.geimporteerd", "1"); } catch (e) {}
    }).catch(function () {});
  }

  function laadLijst(l) { return fetch(l.data, { cache: "no-store" }).then(function (r) { return r.json(); }); }

  /* ---------- tijd ---------- */
  function twee(n) { return (n < 10 ? "0" : "") + n; }
  function werkdag(d) {
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d;
  }
  function standaardOpvolging(st) {
    if (!st || st.opvolging == null) return null;
    var d = new Date();
    if (st.uren) { d.setHours(d.getHours() + st.uren, 0, 0, 0); return d; }
    d.setDate(d.getDate() + st.opvolging);
    werkdag(d);
    d.setHours(10, 0, 0, 0);
    return d;
  }
  function datumVeld(d) { return d.getFullYear() + "-" + twee(d.getMonth() + 1) + "-" + twee(d.getDate()); }
  function tijdVeld(d) { return twee(d.getHours()) + ":" + twee(d.getMinutes()); }
  var MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  function kortDatum(iso, metTijd) {
    var d = new Date(iso);
    var s = d.getDate() + " " + MAANDEN[d.getMonth()];
    if (d.getFullYear() !== new Date().getFullYear()) s += " " + d.getFullYear();
    if (metTijd) s += ", " + twee(d.getHours()) + ":" + twee(d.getMinutes());
    return s;
  }

  /* ---------- agenda ---------- */
  function utc(d) {
    return d.getUTCFullYear() + twee(d.getUTCMonth() + 1) + twee(d.getUTCDate()) + "T" + twee(d.getUTCHours()) + twee(d.getUTCMinutes()) + "00Z";
  }
  function googleAgenda(a) {
    var url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(a.titel) +
      "&dates=" + utc(a.start) + "/" + utc(a.eind) +
      "&details=" + encodeURIComponent(a.tekst || "") +
      "&ctz=Europe/Amsterdam";
    window.open(url, "_blank", "noopener");
  }
  function icsTekst(t) { return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function icsBestand(a) {
    var regels = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Flii Media//Acquisitie//NL", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "-" + Math.random().toString(36).slice(2) + "@flii.app",
      "DTSTAMP:" + utc(new Date()),
      "DTSTART:" + utc(a.start), "DTEND:" + utc(a.eind),
      "SUMMARY:" + icsTekst(a.titel),
      "DESCRIPTION:" + icsTekst(a.tekst || ""),
      "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:" + icsTekst(a.titel), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ];
    var inhoud = regels.map(function (r) {
      var uit = [];
      while (r.length > 73) { uit.push(r.slice(0, 73)); r = " " + r.slice(73); }
      uit.push(r);
      return uit.join("\r\n");
    }).join("\r\n");
    var blob = new Blob([inhoud], { type: "text/calendar;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (a.titel.replace(/[^\w\- ]+/g, "").trim() || "afspraak") + ".ics";
    document.body.appendChild(link); link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
  }

  window.FliiBel = {
    FASES: FASES, STATUSSEN: STATUSSEN, LIJSTEN: LIJSTEN,
    statusVan: statusVan, faseNaam: faseNaam,
    sessie: sessie, naarPortal: naarPortal,
    staat: staat, zetFase: zetFase, logGesprek: logGesprek, verwijder: verwijder, importeer: importeer, laadLijst: laadLijst,
    standaardOpvolging: standaardOpvolging, datumVeld: datumVeld, tijdVeld: tijdVeld, kortDatum: kortDatum, twee: twee,
    googleAgenda: googleAgenda, icsBestand: icsBestand
  };
})();
