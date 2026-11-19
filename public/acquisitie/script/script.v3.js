/* Cold call script als vragenboom. De hele boom staat in beeld; de huidige stap is opengeklapt.
   Na een keuze klapt de stap dicht, kleurt de gekozen tak en schuift de volgende stap open.
   Eindstappen geven aan in welke fase van de funnel de lead hoort. */
(function () {
  "use strict";

  var SCRIPT = {
    titel: "Website",
    start: "opening",
    stappen: {
      opening: {
        titel: "Opening",
        zeg: "Goedemiddag, u spreekt met [naam] van Flii Media. Spreek ik met de eigenaar van [bedrijf]?",
        opties: [
          { label: "Ja, eigenaar", naar: "toestemming" },
          { label: "Nee, iemand anders", naar: "poortwachter" },
          { label: "Geen tijd", naar: "geentijd" }
        ]
      },
      poortwachter: {
        titel: "Poortwachter",
        zeg: "Helder, dank u. Wie gaat er bij [bedrijf] over nieuwe klanten en de website? En wanneer kan ik die persoon het beste even bellen?",
        tip: "Noteer naam en tijdstip. Laat je niet afschepen met een algemeen e-mailadres.",
        opties: [
          { label: "Doorverbonden", naar: "toestemming" },
          { label: "Terugbelmoment", naar: "eind_terugbellen" },
          { label: "Geen informatie", naar: "eind_nee" }
        ]
      },
      geentijd: {
        titel: "Geen tijd",
        zeg: "Dat begrijp ik, ik houd het kort. Wanneer kan ik u beter twee minuten bellen: vanmiddag of morgenochtend?",
        opties: [
          { label: "Moment afgesproken", naar: "eind_terugbellen" },
          { label: "Toch nu even", naar: "toestemming" },
          { label: "Geen interesse", naar: "eind_nee" }
        ]
      },
      toestemming: {
        titel: "Toestemming",
        zeg: "Ik zal eerlijk zijn: dit is een onverwacht telefoontje. Mag ik u in dertig seconden vertellen waarom ik bel? Daarna beslist u of we verder praten.",
        opties: [
          { label: "Ja, vertel", naar: "aanleiding" },
          { label: "Nee", naar: "eind_nee" }
        ]
      },
      aanleiding: {
        titel: "Aanleiding",
        zeg: "Ik zag dat [bedrijf] sterke reviews heeft op Google, [aantal] sterren, maar ik kon geen website vinden. Klopt dat, of heb ik iets gemist?",
        opties: [
          { label: "Klopt, geen website", naar: "behoefte" },
          { label: "Heeft een website", naar: "heeftsite" }
        ]
      },
      heeftsite: {
        titel: "Heeft een website",
        zeg: "Dan heb ik die gemist, excuus. Hoeveel nieuwe klanten haalt die website ongeveer per maand voor u binnen?",
        opties: [
          { label: "Genoeg", naar: "eind_heeftsite" },
          { label: "Weinig of geen", naar: "behoefte" }
        ]
      },
      behoefte: {
        titel: "Behoefte",
        zeg: "Hoe vinden nieuwe klanten u nu? En zou u er graag meer bij hebben?",
        tip: "Laat de klant praten. Wat hij hier zegt, gebruik je straks in de pitch.",
        opties: [
          { label: "Wil meer klanten", naar: "pitch" },
          { label: "Zit vol", naar: "later" }
        ]
      },
      later: {
        titel: "Zit vol",
        zeg: "Mooi om te horen dat het zo goed loopt. Mag ik over drie maanden nog eens bellen? Misschien is er dan ruimte.",
        opties: [
          { label: "Ja", naar: "eind_later" },
          { label: "Nee", naar: "eind_nee" }
        ]
      },
      pitch: {
        titel: "Voorbeeld",
        zeg: "Wie u via Google vindt, zoekt meestal eerst een website voordat hij belt. Zonder site gaat hij vaak door naar de volgende. Daarom heb ik alvast een voorbeeldwebsite voor [bedrijf] gemaakt, met uw reviews erop. Mag ik die laten zien in een videocall van een kwartier?",
        tip: "Zeg alleen dat het voorbeeld er is als het echt klaarstaat.",
        opties: [
          { label: "Ja, laat zien", naar: "plannen" },
          { label: "Wat kost het?", naar: "prijs" },
          { label: "Stuur maar op", naar: "sturen" },
          { label: "Geen interesse", naar: "bezwaar" }
        ]
      },
      bezwaar: {
        titel: "Bezwaar",
        zeg: "Dat snap ik. Mag ik vragen waar het aan ligt: is het tijd, geld, of heeft u er gewoon geen behoefte aan?",
        opties: [
          { label: "Geld", naar: "prijs" },
          { label: "Tijd", naar: "tijd" },
          { label: "Geen behoefte", naar: "eind_nee" }
        ]
      },
      tijd: {
        titel: "Bezwaar: tijd",
        zeg: "Daarom doen wij het meeste werk. U kijkt een kwartier mee, daarna regelen wij de rest: teksten, foto's en vindbaarheid in Google.",
        opties: [
          { label: "Toch interesse", naar: "plannen" },
          { label: "Stuur maar op", naar: "sturen" }
        ]
      },
      prijs: {
        titel: "Prijs",
        zeg: "De website kost eenmalig € 800, daarna € 25 per maand voor hosting en onderhoud. Met één extra klant per maand verdient u dat meestal al terug. Past dat ongeveer bij wat u in gedachten had?",
        opties: [
          { label: "Past", naar: "plannen" },
          { label: "Te duur", naar: "sturen" }
        ]
      },
      plannen: {
        titel: "Afspraak",
        zeg: "Mooi. Komt morgen of overmorgen beter uit? En liever in de ochtend of in de middag?",
        tip: "Geef steeds twee keuzes, geen open vraag.",
        opties: [
          { label: "Afspraak staat", naar: "eind_afspraak" },
          { label: "Wil het eerst zien", naar: "sturen" }
        ]
      },
      sturen: {
        titel: "Voorbeeld sturen",
        zeg: "Prima. Dan stuur ik het voorbeeld per WhatsApp, zodat u het rustig kunt bekijken. Zal ik u [dag] om [tijd] even bellen om te horen wat u ervan vindt?",
        opties: [
          { label: "Ja", naar: "eind_sturen" },
          { label: "Nee", naar: "eind_nee" }
        ]
      },
      eind_afspraak: { eind: true, titel: "Afspraak", zeg: "Bedankt voor uw tijd, ik stuur u zo de uitnodiging. Tot dan!", fase: "Deal call", uitkomst: "Videocall gepland", agenda: { titel: "Videocall [bedrijf]: voorbeeldwebsite", over: 1, uur: 10, duur: 15 } },
      eind_sturen: { eind: true, titel: "Nabellen", zeg: "Ik stuur het u vandaag nog. Tot [dag]!", fase: "Warm call", uitkomst: "Voorbeeld sturen en nabellen", agenda: { titel: "Nabellen [bedrijf]: voorbeeldwebsite", over: 2, uur: 10, duur: 10 } },
      eind_terugbellen: { eind: true, titel: "Terugbellen", zeg: "Dank u, dan bel ik op het afgesproken moment. Fijne dag!", fase: "Cold call", uitkomst: "Terugbelmoment genoteerd", agenda: { titel: "Terugbellen [bedrijf]", over: 1, uur: 10, duur: 10 } },
      eind_later: { eind: true, titel: "Over 3 maanden", zeg: "Dank u, dan noteer ik dat. Fijne dag nog!", fase: "Cold call", uitkomst: "Over drie maanden opnieuw bellen", agenda: { titel: "Opnieuw bellen [bedrijf]", over: 91, uur: 10, duur: 10 } },
      eind_heeftsite: { eind: true, titel: "Heeft website", zeg: "Dan wens ik u veel succes. Bedankt voor uw tijd!", fase: "Uit de lijst", uitkomst: "Tevreden over eigen website", agenda: { titel: "Opnieuw bellen [bedrijf]: website", over: 182, uur: 10, duur: 10 } },
      eind_nee: { eind: true, titel: "Geen interesse", zeg: "Helemaal goed, bedankt voor uw tijd. Fijne dag nog!", fase: "Cold call", uitkomst: "Geen interesse", agenda: { titel: "Opnieuw proberen [bedrijf]", over: 182, uur: 10, duur: 10 } }
    }
  };

  var FASEKLEUR = { "Deal call": "f-deal", "Warm call": "f-warm", "Cold call": "f-cold", "Uit de lijst": "f-uit" };
  var stil = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = SCRIPT.stappen;
  var ids = Object.keys(S);

  /* ---------- niveaus: langste pad vanaf de start, alle eindstappen op de onderste rij ---------- */
  var niveau = {};
  (function () {
    niveau[SCRIPT.start] = 0;
    for (var ronde = 0; ronde < ids.length; ronde++) {
      ids.forEach(function (id) {
        if (niveau[id] == null || S[id].eind) return;
        S[id].opties.forEach(function (o) {
          if (niveau[o.naar] == null || niveau[o.naar] < niveau[id] + 1) niveau[o.naar] = niveau[id] + 1;
        });
      });
    }
    var max = 0;
    ids.forEach(function (id) { if (!S[id].eind && niveau[id] > max) max = niveau[id]; });
    ids.forEach(function (id) { if (S[id].eind) niveau[id] = max + 1; });
  })();
  var rijen = [];
  ids.forEach(function (id) { (rijen[niveau[id]] = rijen[niveau[id]] || []).push(id); });

  var randen = [];
  ids.forEach(function (id) { if (!S[id].eind) S[id].opties.forEach(function (o) { randen.push({ van: id, naar: o.naar, label: o.label }); }); });

  /* ---------- staat ---------- */
  var huidig = SCRIPT.start;
  var pad = []; /* { van, naar, label } */

  /* ---------- helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "on") for (var e in attrs.on) n.addEventListener(e, attrs.on[e]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function logo() {
    var a = el("a", { class: "fliilogo", href: "/", "aria-label": "flii.app" }, ["flii"]);
    a.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.6-9.2C.9 8.5 2.6 5 6 4.3c2.2-.5 4.4.6 6 2.6 1.6-2 3.8-3.1 6-2.6 3.4.7 5.1 4.2 3.6 7.5C19.5 16.3 12 21 12 21z"/></svg><span>app</span>');
    return a;
  }

  /* ---------- opbouw ---------- */
  var app = document.getElementById("app");
  var knopTerug = el("button", { type: "button", class: "cb-k", text: "Vorige stap", on: { click: terug } });
  var knopOpnieuw = el("button", { type: "button", class: "cb-k", text: "Opnieuw beginnen", on: { click: opnieuw } });
  var boom = el("div", { class: "cb-boom" });
  var lijnen = svg("svg", { class: "cb-lijnen", "aria-hidden": "true" });
  boom.appendChild(lijnen);
  var knopen = {};

  rijen.forEach(function (rij, i) {
    var r = el("div", { class: "cb-rij" + (S[rij[0]].eind ? " cb-einden" : "") });
    rij.forEach(function (id) {
      var s = S[id];
      var n = el("div", { class: "cb-knoop" + (s.eind ? " cb-eind " + (FASEKLEUR[s.fase] || "") : ""), "data-id": id });
      var pil = el("button", { type: "button", class: "cb-pil", on: { click: function () { spring(id); } } }, [
        el("span", { class: "cb-nr", text: s.eind ? s.fase : String(i + 1) }),
        el("span", { class: "cb-titel", text: s.titel })
      ]);
      n.appendChild(pil);
      n.appendChild(el("div", { class: "cb-inhoud" }));
      knopen[id] = n;
      r.appendChild(n);
    });
    boom.appendChild(r);
  });

  app.appendChild(el("div", { class: "band" }));
  app.appendChild(el("div", { class: "wrap cb-wrap" }, [
    el("div", { class: "kop" }, [logo(), el("span", { class: "u", text: "Cold call script" })]),
    el("div", { class: "cb-top" }, [el("h1", { text: "Cold call script: " + SCRIPT.titel }), el("div", { class: "cb-acties" }, [knopTerug, knopOpnieuw])]),
    boom
  ]));
  if (window.acqMenu) window.acqMenu();

  /* ---------- inhoud van de open stap ---------- */
  function vulInhoud(id) {
    var s = S[id], box = knopen[id].querySelector(".cb-inhoud");
    box.innerHTML = "";
    box.appendChild(el("p", { class: "cb-zeg", text: s.zeg }));
    if (s.tip) box.appendChild(el("p", { class: "cb-tip", text: s.tip }));
    if (s.eind) {
      box.appendChild(el("p", { class: "cb-uitkomst" }, ["Uitkomst: ", el("b", { text: s.uitkomst })]));
      box.appendChild(el("p", { class: "cb-fase" }, [el("span", { text: "Fase in de funnel" }), el("b", { text: s.fase })]));
      box.appendChild(agenda(id));
      box.appendChild(el("div", { class: "cb-opties" }, [el("button", { type: "button", class: "cb-optie", text: "Nieuw gesprek", on: { click: opnieuw } })]));
      return;
    }
    box.appendChild(el("div", { class: "cb-opties" }, s.opties.map(function (o, i) {
      return el("button", {
        type: "button", class: "cb-optie" + (i === 0 ? " cb-hoofd" : ""), "data-naar": o.naar,
        on: {
          click: function () { kies(o); },
          mouseenter: function () { markeer(o.naar, true); }, mouseleave: function () { markeer(o.naar, false); }
        }
      }, [el("kbd", { text: String(i + 1) }), o.label]);
    })));
  }
  /* ---------- inplannen in de agenda ---------- */
  function twee(n) { return (n < 10 ? "0" : "") + n; }
  function standaardDatum(over) {
    var d = new Date();
    d.setDate(d.getDate() + over);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return d.getFullYear() + "-" + twee(d.getMonth() + 1) + "-" + twee(d.getDate());
  }
  function utc(d) {
    return d.getUTCFullYear() + twee(d.getUTCMonth() + 1) + twee(d.getUTCDate()) + "T" + twee(d.getUTCHours()) + twee(d.getUTCMinutes()) + "00Z";
  }
  function icsTekst(t) { return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
  function agenda(id) {
    var s = S[id], a = s.agenda;
    var verloop = pad.filter(function (p) { return p.label; }).map(function (p) { return "- " + S[p.van].titel + ": " + p.label; }).join("\n");
    var veld = function (label, invoer) { return el("label", { class: "ag-veld" }, [el("span", { text: label }), invoer]); };
    var bedrijf = el("input", { type: "text", placeholder: "Naam van het bedrijf" });
    var titel = el("input", { type: "text", value: a.titel });
    var datum = el("input", { type: "date", value: standaardDatum(a.over) });
    var tijd = el("input", { type: "time", value: twee(a.uur) + ":00", step: "300" });
    var duur = el("select", {}, [5, 10, 15, 30, 45, 60].map(function (m) {
      var o = el("option", { value: String(m), text: m + " min" }); if (m === a.duur) o.selected = true; return o;
    }));
    var beschrijving = el("textarea", { rows: "6" });
    beschrijving.value = "Uitkomst: " + s.uitkomst + "\nFase: " + s.fase + "\n\nContactpersoon: \nTelefoon: \n\nGespreksverloop:\n" + (verloop || "-") + "\n\nNotities: ";
    var melding = el("p", { class: "ag-melding" });

    function gegevens() {
      if (!datum.value || !tijd.value) { melding.textContent = "Vul een datum en tijd in."; return null; }
      melding.textContent = "";
      var b = bedrijf.value.trim();
      var start = new Date(datum.value + "T" + tijd.value);
      var eind = new Date(start.getTime() + parseInt(duur.value, 10) * 60000);
      var t = titel.value.replace(/\s*\[bedrijf\]/g, b ? " " + b : "").replace(/\s+:/g, ":").trim();
      return { titel: t, start: start, eind: eind, tekst: beschrijving.value.replace(/\[bedrijf\]/g, b) };
    }
    function google() {
      var g = gegevens(); if (!g) return;
      var url = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(g.titel) +
        "&dates=" + utc(g.start) + "/" + utc(g.eind) +
        "&details=" + encodeURIComponent(g.tekst) +
        "&ctz=Europe/Amsterdam";
      window.open(url, "_blank", "noopener");
    }
    function ics() {
      var g = gegevens(); if (!g) return;
      var regels = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Flii Media//Cold call script//NL", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:" + Date.now() + "-" + Math.random().toString(36).slice(2) + "@flii.app",
        "DTSTAMP:" + utc(new Date()),
        "DTSTART:" + utc(g.start), "DTEND:" + utc(g.eind),
        "SUMMARY:" + icsTekst(g.titel),
        "DESCRIPTION:" + icsTekst(g.tekst),
        "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:" + icsTekst(g.titel), "END:VALARM",
        "END:VEVENT", "END:VCALENDAR"
      ];
      var blob = new Blob([regels.map(function (r) { var uit = []; while (r.length > 73) { uit.push(r.slice(0, 73)); r = " " + r.slice(73); } uit.push(r); return uit.join("\r\n"); }).join("\r\n")], { type: "text/calendar;charset=utf-8" });
      var link = el("a", { href: URL.createObjectURL(blob), download: (g.titel.replace(/[^\w\- ]+/g, "").trim() || "afspraak") + ".ics" });
      document.body.appendChild(link); link.click();
      setTimeout(function () { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
    }

    var formulier = el("div", { class: "ag-form", hidden: "" }, [
      el("div", { class: "ag-rij" }, [veld("Bedrijf", bedrijf), veld("Titel", titel)]),
      el("div", { class: "ag-rij ag-drie" }, [veld("Datum", datum), veld("Tijd", tijd), veld("Duur", duur)]),
      veld("Beschrijving", beschrijving),
      el("div", { class: "ag-knoppen" }, [
        el("button", { type: "button", class: "cb-optie cb-hoofd", text: "Google Agenda", on: { click: google } }),
        el("button", { type: "button", class: "cb-optie", text: "Outlook / Apple (.ics)", on: { click: ics } })
      ]),
      melding
    ]);
    var open = el("button", { type: "button", class: "ag-open", "aria-expanded": "false", on: { click: function () {
      var dicht = formulier.hasAttribute("hidden");
      if (dicht) formulier.removeAttribute("hidden"); else formulier.setAttribute("hidden", "");
      open.setAttribute("aria-expanded", dicht ? "true" : "false");
      if (dicht) bedrijf.focus({ preventScroll: true });
      volg(400);
    } } }, ["Inplannen in agenda"]);
    open.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>');
    return el("div", { class: "ag" }, [open, formulier]);
  }

  function markeer(id, aan) {
    knopen[id].classList.toggle("cb-doel", aan);
    var p = lijnen.querySelector('path[data-van="' + huidig + '"][data-naar="' + id + '"]');
    if (p) p.classList.toggle("cb-doel", aan);
  }

  /* ---------- lijnen ---------- */
  var paden = {};
  randen.forEach(function (r) {
    var p = svg("path", { "data-van": r.van, "data-naar": r.naar, class: "cb-rand" + (S[r.naar].eind ? " cb-naar-eind" : "") });
    paden[r.van + ">" + r.naar] = p;
    lijnen.appendChild(p);
  });
  function teken() {
    var b = boom.getBoundingClientRect();
    lijnen.setAttribute("width", b.width); lijnen.setAttribute("height", b.height);
    lijnen.setAttribute("viewBox", "0 0 " + b.width + " " + b.height);
    var baan = { l: 0, r: 0 };
    randen.forEach(function (r) {
      var a = knopen[r.van].getBoundingClientRect(), z = knopen[r.naar].getBoundingClientRect();
      var ax = a.left + a.width / 2 - b.left, ay = a.bottom - b.top;
      var zx = z.left + z.width / 2 - b.left, zy = z.top - b.top;
      var d, sprong = niveau[r.naar] - niveau[r.van];
      if (sprong <= 1 || S[r.naar].eind) {
        var m = (zy - ay) / 2;
        d = "M" + ax + " " + ay + " C" + ax + " " + (ay + m) + " " + zx + " " + (zy - m) + " " + zx + " " + zy;
      } else {
        /* lange tak: langs de zijkant van de boom, zodat hij niet door andere stappen loopt */
        var rechts = zx >= ax;
        var kant = rechts ? "r" : "l";
        baan[kant]++;
        var maxR = Math.max(a.right, z.right), minL = Math.min(a.left, z.left);
        ids.forEach(function (id) {
          if (niveau[id] <= niveau[r.van] || niveau[id] >= niveau[r.naar]) return;
          var q = knopen[id].getBoundingClientRect();
          if (q.right > maxR) maxR = q.right;
          if (q.left < minL) minL = q.left;
        });
        var x = rechts ? maxR - b.left + 14 + baan[kant] * 8 : minL - b.left - 14 - baan[kant] * 8;
        var sx = rechts ? a.right - b.left : a.left - b.left, sy = a.top + a.height / 2 - b.top;
        var ex = rechts ? z.right - b.left : z.left - b.left, ey = z.top + Math.min(22, z.height / 2) - b.top;
        d = "M" + sx + " " + sy + " C" + x + " " + sy + " " + x + " " + sy + " " + x + " " + (sy + 24) +
            " L" + x + " " + (ey - 24) + " C" + x + " " + ey + " " + x + " " + ey + " " + ex + " " + ey;
      }
      paden[r.van + ">" + r.naar].setAttribute("d", d);
    });
  }
  function kleur() {
    var genomen = {};
    pad.forEach(function (p) { genomen[p.van + ">" + p.naar] = true; });
    randen.forEach(function (r) {
      var p = paden[r.van + ">" + r.naar];
      p.classList.toggle("cb-genomen", !!genomen[r.van + ">" + r.naar]);
      p.classList.toggle("cb-mogelijk", r.van === huidig);
    });
    var bezocht = {};
    pad.forEach(function (p) { bezocht[p.van] = true; });
    ids.forEach(function (id) {
      knopen[id].classList.toggle("cb-bezocht", !!bezocht[id]);
      knopen[id].classList.toggle("cb-volgend", !S[huidig].eind && S[huidig].opties.some(function (o) { return o.naar === id; }));
    });
    knopTerug.disabled = !pad.length;
  }

  /* ---------- overgang (FLIP) ---------- */
  var lus = 0;
  function volg(ms) {
    var eind = performance.now() + ms;
    cancelAnimationFrame(lus);
    (function stap() { teken(); if (performance.now() < eind) lus = requestAnimationFrame(stap); })();
  }
  function wissel(naar, rand) {
    var voor = {};
    ids.forEach(function (id) { voor[id] = knopen[id].getBoundingClientRect(); });
    var oud = huidig;
    knopen[oud].classList.remove("cb-open");
    knopen[oud].querySelector(".cb-inhoud").innerHTML = "";
    huidig = naar;
    vulInhoud(naar);
    knopen[naar].classList.add("cb-open");
    kleur();
    if (!stil) {
      ids.forEach(function (id) {
        var n = knopen[id], na = n.getBoundingClientRect(), v = voor[id];
        var dx = v.left - na.left, dy = v.top - na.top;
        var sx = id === naar || id === oud ? v.width / na.width : 1, sy = id === naar || id === oud ? v.height / na.height : 1;
        if (!dx && !dy && sx === 1 && sy === 1) return;
        n.animate([
          { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")", transformOrigin: "top left" },
          { transform: "none", transformOrigin: "top left" }
        ], { duration: 520, easing: "cubic-bezier(.32,.72,0,1)" });
      });
      var inh = knopen[naar].querySelector(".cb-inhoud");
      inh.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: 200, easing: "ease-out", fill: "backwards" });
      if (rand) {
        var p = paden[rand];
        teken();
        var lengte = p.getTotalLength();
        p.animate([{ strokeDasharray: lengte, strokeDashoffset: lengte }, { strokeDasharray: lengte, strokeDashoffset: 0 }], { duration: 480, easing: "ease-in-out" });
      }
      volg(620);
    } else teken();
    var r = knopen[naar].getBoundingClientRect();
    var doel = window.scrollY + r.top - Math.max(90, (window.innerHeight - Math.min(r.height, window.innerHeight * .7)) / 2.4);
    window.scrollTo({ top: Math.max(0, doel), behavior: stil ? "auto" : "smooth" });
    var eerste = knopen[naar].querySelector(".cb-optie");
    if (eerste) eerste.focus({ preventScroll: true });
  }

  function kies(o) { pad.push({ van: huidig, naar: o.naar, label: o.label }); wissel(o.naar, pad[pad.length - 1].van + ">" + o.naar); }
  function spring(id) {
    if (id === huidig) return;
    var i = -1;
    pad.forEach(function (p, j) { if (p.van === id) i = j; });
    if (i >= 0) pad = pad.slice(0, i); /* terug naar een eerdere stap */
    else {
      var rand = huidig + ">" + id;
      if (paden[rand]) { pad.push({ van: huidig, naar: id, label: "" }); return wissel(id, rand); }
    }
    wissel(id, null);
  }
  function terug() { var p = pad.pop(); if (p) wissel(p.van, null); }
  function opnieuw() { pad = []; wissel(SCRIPT.start, null); }

  document.addEventListener("keydown", function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && !S[huidig].eind && S[huidig].opties[n - 1]) { e.preventDefault(); kies(S[huidig].opties[n - 1]); }
    else if (e.key === "Backspace" && pad.length) { e.preventDefault(); terug(); }
  });
  addEventListener("resize", teken);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(teken);

  /* start: hele boom in beeld, bovenste stap open */
  vulInhoud(huidig);
  knopen[huidig].classList.add("cb-open");
  kleur();
  teken();
})();
