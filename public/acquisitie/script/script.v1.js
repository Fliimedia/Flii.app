/* Cold call script: de medewerker klikt Ja of Nee op wat de klant antwoordt en het script gaat verder.
   Eindstappen geven aan in welke fase de lead in de funnel hoort. */
(function () {
  "use strict";

  var SCRIPTS = {
    website: {
      titel: "Website",
      start: "opening",
      stappen: {
        opening: {
          zeg: "Goedemiddag, u spreekt met [naam] van Flii Media. Als ik zeg dat dit een cold call is, hangt u dan meteen op?",
          vraag: "Hangt de klant op, of wil hij liever niet?",
          ja: "kort", nee: "reden"
        },
        kort: {
          zeg: "Dan ben ik snel. Ik zag dat [bedrijf] goede reviews heeft op Google, maar ik kon geen website vinden. Mag ik u daar dertig seconden over vertellen?",
          vraag: "Mag je verder?",
          ja: "werk", nee: "eind_nee"
        },
        reden: {
          zeg: "Fijn, dank u. Ik bel omdat ik zag dat [bedrijf] goede reviews heeft op Google, maar ik kon geen website vinden. Klopt dat?",
          vraag: "Heeft de klant inderdaad geen website?",
          ja: "werk", nee: "heeftsite"
        },
        heeftsite: {
          zeg: "Dan heb ik die gemist, excuus. Haalt die website genoeg nieuwe klanten voor u binnen?",
          vraag: "Is de klant tevreden over zijn website?",
          ja: "eind_heeftsite", nee: "pitch"
        },
        werk: {
          zeg: "Kunt u op dit moment nog nieuwe klanten aan?",
          vraag: "Wil de klant meer werk?",
          ja: "pitch", nee: "later"
        },
        later: {
          zeg: "Dan gaat het goed, mooi om te horen. Mag ik over een paar maanden nog eens bellen?",
          vraag: "Mag je later terugbellen?",
          ja: "eind_later", nee: "eind_nee"
        },
        pitch: {
          zeg: "Met AI kunnen we tegenwoordig snel en betaalbaar een goede website maken. Ik heb alvast een voorbeeld voor [bedrijf] gemaakt. Mag ik u dat laten zien in een videocall van een kwartier?",
          vraag: "Wil de klant het voorbeeld zien?",
          tip: "Zeg alleen dat het voorbeeld er is als het echt klaarstaat.",
          ja: "budget", nee: "bezwaar"
        },
        bezwaar: {
          zeg: "Dat snap ik. Mag ik vragen: is het vooral een kwestie van budget?",
          vraag: "Is budget het bezwaar?",
          ja: "prijs", nee: "sturen"
        },
        budget: {
          zeg: "Top. Stel dat het voorbeeld u bevalt: welk budget had u voor zo'n website in gedachten?",
          vraag: "Laat de klant uitpraten en noteer het bedrag.",
          verder: "prijs"
        },
        prijs: {
          zeg: "Wij maken hem vanaf € 800 eenmalig, en daarna € 25 per maand voor hosting en onderhoud. Past dat bij wat u in gedachten had?",
          vraag: "Past de prijs?",
          ja: "plannen", nee: "sturen"
        },
        plannen: {
          zeg: "Mooi. Wanneer komt het u uit voor die videocall van een kwartier: morgen of overmorgen, en liever in de ochtend of de middag?",
          vraag: "Staat de afspraak?",
          ja: "eind_afspraak", nee: "sturen"
        },
        sturen: {
          zeg: "Geen probleem. Zal ik het voorbeeld per WhatsApp of e-mail sturen, zodat u het rustig kunt bekijken?",
          vraag: "Mag je het voorbeeld sturen?",
          ja: "eind_sturen", nee: "eind_nee"
        },
        eind_afspraak: { eind: true, zeg: "Bedankt voor uw tijd, ik stuur u zo een uitnodiging. Tot dan!", fase: "Deal call", uitkomst: "Afspraak gepland" },
        eind_sturen: { eind: true, zeg: "Ik stuur het u vandaag nog. Dan bel ik over een paar dagen even om te horen wat u ervan vindt. Fijne dag!", fase: "Warm call", uitkomst: "Voorbeeld sturen en nabellen" },
        eind_later: { eind: true, zeg: "Dank u, dan noteer ik dat. Fijne dag nog!", fase: "Cold call", uitkomst: "Over een paar maanden opnieuw bellen" },
        eind_heeftsite: { eind: true, zeg: "Dan wens ik u veel succes. Bedankt voor uw tijd!", fase: "Uit de lijst", uitkomst: "Heeft een website" },
        eind_nee: { eind: true, zeg: "Helemaal goed, bedankt voor uw tijd. Fijne dag nog!", fase: "Cold call", uitkomst: "Geen interesse" }
      }
    }
  };

  var app = document.getElementById("app");
  var sleutel = "website";
  var script = SCRIPTS[sleutel];
  var pad = [];
  var huidig = script.start;

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

  function ga(volgende, antwoord) {
    pad.push({ id: huidig, antwoord: antwoord });
    huidig = volgende;
    teken();
  }
  function terug() { var p = pad.pop(); if (p) { huidig = p.id; teken(); } }
  function opnieuw() { pad = []; huidig = script.start; teken(); }

  function teken() {
    var s = script.stappen[huidig];
    var kaart = el("div", { class: "cs-kaart" }, [
      el("p", { class: "cs-stap", text: s.eind ? "Afsluiten" : "Stap " + (pad.length + 1) }),
      el("p", { class: "cs-zeg", text: s.zeg })
    ]);
    if (s.eind) {
      kaart.appendChild(el("p", { class: "cs-vraag" }, ["Uitkomst: ", el("b", { text: s.uitkomst })]));
      kaart.appendChild(el("div", { class: "cs-eind" }, [el("span", { text: "Fase in de funnel: " }), el("b", { text: s.fase })]));
      kaart.appendChild(el("div", { class: "cs-knoppen" }, [el("button", { class: "cs-ja", type: "button", text: "Nieuw gesprek", on: { click: opnieuw } })]));
    } else {
      kaart.appendChild(el("p", { class: "cs-vraag", text: s.vraag }));
      if (s.tip) kaart.appendChild(el("p", { class: "cs-tip", text: s.tip }));
      kaart.appendChild(el("div", { class: "cs-knoppen" }, s.verder
        ? [el("button", { class: "cs-ja", type: "button", text: "Verder", on: { click: function () { ga(s.verder, "Verder"); } } })]
        : [
            el("button", { class: "cs-ja", type: "button", text: "Ja", on: { click: function () { ga(s.ja, "Ja"); } } }),
            el("button", { class: "cs-nee", type: "button", text: "Nee", on: { click: function () { ga(s.nee, "Nee"); } } })
          ]));
    }
    kaart.appendChild(el("div", { class: "cs-onder" }, [
      el("button", { type: "button", text: "Vorige stap", on: { click: terug } }),
      el("button", { type: "button", text: "Opnieuw beginnen", on: { click: opnieuw } })
    ]));
    if (!pad.length) kaart.querySelector(".cs-onder button").setAttribute("disabled", "");

    var lijst = el("ul", { class: "cs-pad" }, pad.map(function (p) {
      return el("li", {}, [el("span", { text: script.stappen[p.id].vraag }), el("b", { text: p.antwoord })]);
    }));

    app.innerHTML = "";
    app.appendChild(el("div", { class: "band" }));
    app.appendChild(el("div", { class: "wrap" }, [
      el("div", { class: "kop" }, [logo(), el("span", { class: "u", text: "Cold call script" })]),
      el("h1", { text: "Cold call script: " + script.titel }),
      kaart,
      pad.length ? lijst : null
    ]));
    if (window.acqMenu) window.acqMenu();
  }

  function logo() {
    var a = el("a", { class: "fliilogo", href: "/", "aria-label": "flii.app" }, ["flii"]);
    a.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.6-9.2C.9 8.5 2.6 5 6 4.3c2.2-.5 4.4.6 6 2.6 1.6-2 3.8-3.1 6-2.6 3.4.7 5.1 4.2 3.6 7.5C19.5 16.3 12 21 12 21z"/></svg><span>app</span>');
    return a;
  }


  teken();
})();
