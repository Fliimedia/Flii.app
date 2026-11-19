/* Belscripts per acquisitielijst. Gedeeld door het cold call script (/acquisitie/script/) en de leadlijsten.
   Elke stap: titel, zeg, tip (optioneel), opties [{ label, naar }]. Eindstappen: eind, status (zie acq-bel.v1.js). */
(function () {
  "use strict";

  function o(label, naar) { return { label: label, naar: naar }; }

  /* Wat elk script deelt: opnemen, opening, poortwachter, toestemming, plannen en alle eindstappen. */
  function basis(c) {
    var s = {
      bellen: {
        titel: "Bellen",
        zeg: "Bel [bedrijf]. Wordt er opgenomen?",
        tip: "Spreek bij de voicemail kort in: naam, Flii Media, dat je terugbelt. Geen pitch.",
        opties: [o("Opgenomen", "opening"), o("Geen gehoor", "eind_geengehoor"), o("Voicemail", "eind_voicemail"), o("In gesprek", "eind_ingesprek"), o("Verkeerd nummer", "eind_verkeerd")]
      },
      opening: {
        titel: "Opening",
        zeg: c.opening || "Goedemiddag, u spreekt met [naam] van Flii Media. Spreek ik met de eigenaar van [bedrijf]?",
        opties: [o("Ja, eigenaar", "toestemming"), o("Nee, iemand anders", "poortwachter"), o("Geen tijd", "geentijd"), o("Bedrijf gestopt", "eind_gestopt")]
      },
      poortwachter: {
        titel: "Poortwachter",
        zeg: "Helder, dank u. Wie gaat er bij [bedrijf] over " + c.onderwerp + "? En wanneer kan ik die persoon het beste even bellen?",
        tip: "Noteer naam en tijdstip. Laat je niet afschepen met een algemeen e-mailadres.",
        opties: [o("Doorverbonden", "toestemming"), o("Terugbelmoment", "eind_terugbellen"), o("Geen informatie", "eind_nee")]
      },
      geentijd: {
        titel: "Geen tijd",
        zeg: "Dat begrijp ik, ik houd het kort. Wanneer kan ik u beter twee minuten bellen: vanmiddag of morgenochtend?",
        opties: [o("Moment afgesproken", "eind_terugbellen"), o("Toch nu even", "toestemming"), o("Geen interesse", "eind_nee")]
      },
      toestemming: {
        titel: "Toestemming",
        zeg: c.toestemming || "Ik zal eerlijk zijn: dit is een onverwacht telefoontje. Mag ik u in dertig seconden vertellen waarom ik bel? Daarna beslist u of we verder praten.",
        opties: [o("Ja, vertel", c.na_toestemming || "aanleiding"), o("Nee", "eind_nee"), o("Niet meer bellen", "eind_nietbellen")]
      },
      later: {
        titel: "Zit vol",
        zeg: "Mooi om te horen dat het zo goed loopt. Mag ik over drie maanden nog eens bellen? Misschien is er dan ruimte.",
        opties: [o("Ja", "eind_later"), o("Nee", "eind_nee")]
      },
      plannen: {
        titel: "Afspraak",
        zeg: c.plannen || "Mooi. Komt morgen of overmorgen beter uit? En liever in de ochtend of in de middag?",
        tip: "Geef steeds twee keuzes, geen open vraag.",
        opties: [o("Afspraak staat", "eind_afspraak"), o(c.plannen_nee || "Wil het eerst zien", c.plannen_nee_naar || "sturen")]
      },
      eind_afspraak: { eind: true, status: "afspraak", titel: "Afspraak", agenda: c.agenda_afspraak, zeg: "Bedankt voor uw tijd, ik stuur u zo de uitnodiging. Tot dan!" },
      eind_sturen: { eind: true, status: "sturen", titel: "Nabellen", zeg: "Ik stuur het u vandaag nog. Tot [dag]!" },
      eind_terugbellen: { eind: true, status: "terugbellen", titel: "Terugbellen", zeg: "Dank u, dan bel ik op het afgesproken moment. Fijne dag!" },
      eind_later: { eind: true, status: "later", titel: "Over 3 maanden", zeg: "Dank u, dan noteer ik dat. Fijne dag nog!" },
      eind_heeftal: { eind: true, status: "heeftal", titel: c.heeftal_titel || "Heeft al iets", zeg: "Dan wens ik u veel succes. Bedankt voor uw tijd!" },
      eind_nee: { eind: true, status: "geeninteresse", titel: "Geen interesse", zeg: "Helemaal goed, bedankt voor uw tijd. Fijne dag nog!" },
      eind_nietbellen: { eind: true, status: "nietbellen", titel: "Niet meer bellen", zeg: "Begrepen, dan haal ik u van de lijst. Fijne dag nog!" },
      eind_gestopt: { eind: true, status: "gestopt", titel: "Bedrijf gestopt", zeg: "Excuus voor het storen, en veel succes. Fijne dag!" },
      eind_geengehoor: { eind: true, status: "geengehoor", titel: "Geen gehoor", zeg: "Leg vast en probeer het later opnieuw." },
      eind_voicemail: { eind: true, status: "voicemail", titel: "Voicemail", zeg: "Leg vast en bel over een paar dagen opnieuw." },
      eind_ingesprek: { eind: true, status: "ingesprek", titel: "In gesprek", zeg: "Leg vast en bel later vandaag opnieuw." },
      eind_verkeerd: { eind: true, status: "verkeerd", titel: "Verkeerd nummer", zeg: "Leg vast. De lead gaat naar Afgevallen." }
    };
    if (c.sturen) s.sturen = { titel: c.sturen_titel || "Voorbeeld sturen", zeg: c.sturen, opties: [o("Ja", "eind_sturen"), o("Nee", "eind_nee")] };
    Object.keys(c.eigen).forEach(function (k) { s[k] = c.eigen[k]; });
    return s;
  }

  /* Het verkoopdeel dat in elk pakket terugkomt: behoefte, pitch, bezwaar, tijd en prijs. */
  function verkoop(c) {
    return {
      behoefte: {
        titel: "Behoefte",
        zeg: c.behoefte,
        tip: "Laat de klant praten. Wat hij hier zegt, gebruik je straks in de pitch.",
        opties: [o("Wil meer klanten", "pitch"), o("Zit vol", "later")]
      },
      pitch: {
        titel: c.pitch_titel || "Voorstel",
        zeg: c.pitch,
        tip: c.pitch_tip,
        opties: [o("Ja, laat zien", "plannen"), o("Wat kost het?", "prijs"), o("Stuur maar op", "sturen"), o("Geen interesse", "bezwaar")]
      },
      bezwaar: {
        titel: "Bezwaar",
        zeg: "Dat snap ik. Mag ik vragen waar het aan ligt: is het tijd, geld, of heeft u er gewoon geen behoefte aan?",
        opties: [o("Geld", "prijs"), o("Tijd", "tijd"), o("Geen behoefte", "eind_nee"), o("Niet meer bellen", "eind_nietbellen")]
      },
      tijd: {
        titel: "Bezwaar: tijd",
        zeg: c.tijd,
        opties: [o("Toch interesse", "plannen"), o("Stuur maar op", "sturen")]
      },
      prijs: {
        titel: "Prijs",
        zeg: c.prijs + " Past dat ongeveer bij wat u in gedachten had?",
        opties: [o("Past", "plannen"), o("Te duur", "sturen")]
      }
    };
  }
  function samen(a, b) { Object.keys(b).forEach(function (k) { a[k] = b[k]; }); return a; }

  var SCRIPTS = {};

  SCRIPTS.website = {
    titel: "Website", start: "bellen",
    stappen: basis({
      onderwerp: "nieuwe klanten en de website",
      sturen: "Prima. Dan stuur ik het voorbeeld per WhatsApp, zodat u het rustig kunt bekijken. Zal ik u [dag] om [tijd] even bellen om te horen wat u ervan vindt?",
      heeftal_titel: "Heeft website",
      eigen: samen({
        aanleiding: {
          titel: "Aanleiding",
          zeg: "Ik zag dat [bedrijf] sterke reviews heeft op Google, [aantal] sterren, maar ik kon geen website vinden. Klopt dat, of heb ik iets gemist?",
          opties: [o("Klopt, geen website", "behoefte"), o("Heeft een website", "heeftal")]
        },
        heeftal: {
          titel: "Heeft een website",
          zeg: "Dan heb ik die gemist, excuus. Hoeveel nieuwe klanten haalt die website ongeveer per maand voor u binnen?",
          opties: [o("Genoeg", "eind_heeftal"), o("Weinig of geen", "behoefte")]
        }
      }, verkoop({
        behoefte: "Hoe vinden nieuwe klanten u nu? En zou u er graag meer bij hebben?",
        pitch_titel: "Voorbeeld",
        pitch: "Wie u via Google vindt, zoekt meestal eerst een website voordat hij belt. Zonder site gaat hij vaak door naar de volgende. Daarom heb ik alvast een voorbeeldwebsite voor [bedrijf] gemaakt, met uw reviews erop. Mag ik die laten zien in een videocall van een kwartier?",
        pitch_tip: "Zeg alleen dat het voorbeeld er is als het echt klaarstaat.",
        tijd: "Daarom doen wij het meeste werk. U kijkt een kwartier mee, daarna regelen wij de rest: teksten, foto's en vindbaarheid in Google.",
        prijs: "De website kost eenmalig € 800, daarna € 25 per maand voor hosting en onderhoud. Met één extra klant per maand verdient u dat meestal al terug."
      }))
    })
  };

  SCRIPTS["social-advertising"] = {
    titel: "Social advertising", start: "bellen",
    stappen: basis({
      onderwerp: "nieuwe klanten en marketing",
      sturen: "Prima. Dan stuur ik per WhatsApp een korte opzet met voorbeeldadvertenties voor [bedrijf]. Zal ik u [dag] om [tijd] even bellen om te horen wat u ervan vindt?",
      sturen_titel: "Opzet sturen",
      heeftal_titel: "Adverteert al",
      eigen: samen({
        aanleiding: {
          titel: "Aanleiding",
          zeg: "Ik zag dat [bedrijf] [aantal] goede reviews heeft op Google, dus klanten zijn duidelijk tevreden. Op uw website zag ik alleen niets waarmee u advertenties op Facebook en Instagram kunt meten. Klopt het dat u daar nu niet adverteert?",
          opties: [o("Klopt, adverteert niet", "behoefte"), o("Adverteert al", "heeftal")]
        },
        heeftal: {
          titel: "Adverteert al",
          zeg: "Dan heb ik dat gemist. Weet u wat één nieuwe klant via die advertenties u nu kost?",
          opties: [o("Ja, en tevreden", "eind_heeftal"), o("Weet het niet of te duur", "behoefte")]
        }
      }, verkoop({
        behoefte: "Op welke dagen of momenten zou u graag meer klanten hebben?",
        pitch: "Precies voor die momenten zetten we advertenties op Instagram en Facebook, alleen voor mensen bij u in de buurt. U ziet elke week wat het oplevert: hoeveel aanvragen en wat één nieuwe klant kost. Mag ik in een videocall van een kwartier laten zien hoe dat er voor [bedrijf] uitziet?",
        pitch_tip: "Noem de rustige momenten die de klant net zelf noemde.",
        tijd: "U hoeft er bijna niets voor te doen. Wij maken de advertenties, zetten ze live en sturen elke maand een kort overzicht van wat het heeft opgeleverd.",
        prijs: "Het opzetten kost eenmalig € 1.250: strategie, doelgroepen, meting en drie advertenties. Daarna € 495 per maand voor beheer, plus het advertentiebudget dat u zelf bepaalt."
      }))
    })
  };

  SCRIPTS["social-content"] = {
    titel: "Social content creation", start: "bellen",
    stappen: basis({
      onderwerp: "social media en marketing",
      sturen: "Prima. Dan stuur ik per WhatsApp een paar voorbeeldposts in de stijl van [bedrijf]. Zal ik u [dag] om [tijd] even bellen om te horen wat u ervan vindt?",
      sturen_titel: "Voorbeelden sturen",
      heeftal_titel: "Actief op social",
      eigen: samen({
        aanleiding: {
          titel: "Aanleiding",
          zeg: "Ik zag dat [bedrijf] [aantal] goede reviews heeft, maar op uw website kon ik geen Instagram of TikTok vinden. Doet u daar op dit moment iets mee?",
          opties: [o("Weinig of niets", "behoefte"), o("Ja, actief", "heeftal")]
        },
        heeftal: {
          titel: "Actief op social",
          zeg: "Mooi. Levert het u ook nieuwe klanten op, of is het vooral veel werk naast de zaak?",
          opties: [o("Gaat goed zo", "eind_heeftal"), o("Kost veel tijd of levert weinig op", "behoefte")]
        }
      }, verkoop({
        behoefte: "Wie u nog niet kent, wil meestal eerst zien wat u maakt voordat hij langskomt. Hoe vinden nieuwe klanten u nu? En zou u er graag meer bij hebben?",
        pitch: "Wij maken elke maand twaalf posts en korte video's in de stijl van [bedrijf], en plannen en plaatsen ze ook voor u. U keurt alleen goed. Mag ik in een videocall van een kwartier laten zien hoe dat er voor u uit zou zien?",
        pitch_tip: "Heb je al voorbeeldposts gemaakt? Zeg het alleen als ze echt klaarstaan.",
        tijd: "Daarom nemen wij het over: wij bedenken, maken en plaatsen. U hoeft alleen goed te keuren.",
        prijs: "Het opzetten kost eenmalig € 1.500: strategie, tone of voice en vaste vormgeving voor twee kanalen. Daarna € 995 per maand voor twaalf posts, inclusief planning en plaatsing."
      }))
    })
  };

  SCRIPTS["search-llm"] = {
    titel: "Search & LLM advertising", start: "bellen",
    stappen: basis({
      onderwerp: "nieuwe klanten en marketing",
      sturen: "Prima. Dan stuur ik per WhatsApp een korte opzet: op welke zoekwoorden we [bedrijf] bovenaan zetten en wat dat ongeveer kost. Zal ik u [dag] om [tijd] even bellen om het door te nemen?",
      sturen_titel: "Opzet sturen",
      heeftal_titel: "Adverteert al",
      eigen: samen({
        aanleiding: {
          titel: "Aanleiding",
          zeg: "Ik zocht in [plaats] op [dienst] en zag [bedrijf] niet bovenaan, terwijl u [aantal] goede reviews heeft. Op uw website zag ik ook geen Google Ads. Klopt het dat u daar nu niet adverteert?",
          tip: "Zoek het vooraf echt op, dan klopt wat je zegt.",
          opties: [o("Klopt, adverteert niet", "behoefte"), o("Adverteert al", "heeftal")]
        },
        heeftal: {
          titel: "Adverteert al",
          zeg: "Dan heb ik dat gemist. Weet u wat één aanvraag of telefoontje via Google u nu kost?",
          opties: [o("Ja, en tevreden", "eind_heeftal"), o("Weet het niet of te duur", "behoefte")]
        }
      }, verkoop({
        behoefte: "Hoe komen nieuwe klanten nu bij u binnen? En voor welke klussen of diensten zou u graag meer aanvragen krijgen?",
        pitch: "Wij zorgen dat u bovenaan staat op het moment dat iemand zoekt: in Google, in Bing en ook in ChatGPT. U betaalt alleen als iemand klikt, en u ziet elke week hoeveel telefoontjes en aanvragen het oplevert. Mag ik in een videocall van een kwartier laten zien wat dat voor [bedrijf] kan doen?",
        tijd: "U hoeft er bijna niets voor te doen. Wij zetten de campagnes op, houden ze bij en sturen elke maand een kort overzicht.",
        prijs: "Het opzetten kost eenmalig € 1.500: zoekwoordenonderzoek, campagnes, advertenties en meting. Daarna € 595 per maand voor beheer, plus het klikbudget dat u zelf bepaalt."
      }))
    })
  };

  SCRIPTS.interviews = {
    titel: "Interviews", start: "bellen",
    stappen: basis({
      opening: "Goedemiddag, u spreekt met [naam] van Flii Media. Spreek ik met [eigenaar], de eigenaar van [bedrijf]?",
      onderwerp: "de salon",
      toestemming: "Ik bel met een wat ongebruikelijke vraag. Ik interview ondernemers in de beautybranche rond Amstelveen over hoe zij hun bedrijf hebben opgebouwd. Mag ik u in een halve minuut vertellen wat ik zoek?",
      na_toestemming: "verzoek",
      plannen: "Leuk! Past het u beter in de salon of in een videocall? En komt volgende week doordeweeks uit, liever 's ochtends of 's middags?",
      plannen_nee: "Liever later",
      plannen_nee_naar: "later",
      agenda_afspraak: "Interview",
      eigen: {
        verzoek: {
          titel: "Verzoek",
          zeg: "Ik ben benieuwd naar uw verhaal: hoe u bent begonnen, wat goed ging, waar u tegenaan liep, en hoe u aan nieuwe klanten komt, ook online. Zou u het leuk vinden om daar een half uurtje over te praten?",
          opties: [o("Ja, leuk", "plannen"), o("Waar is het voor?", "doel"), o("Nu even niet", "later"), o("Nee", "eind_nee")]
        },
        doel: {
          titel: "Waarom",
          zeg: "Ik wil beter begrijpen waar ondernemers in de beauty tegenaan lopen, ook bij online marketing: doet u dat zelf, besteedt u het uit of komt u er niet aan toe? Uw naam gebruik ik alleen als u dat goed vindt.",
          opties: [o("Ja, doe mee", "plannen"), o("Nee", "eind_nee")]
        },
        later: {
          titel: "Nu even niet",
          zeg: "Helemaal begrijpelijk. Mag ik u over een paar maanden nog eens bellen?",
          opties: [o("Ja", "eind_later"), o("Nee", "eind_nee")]
        }
      }
    })
  };
  /* Interviews heeft geen verkoopdeel: eindstappen zonder route erheen laten we weg. */
  ["eind_sturen", "eind_heeftal"].forEach(function (k) { delete SCRIPTS.interviews.stappen[k]; });

  window.FliiScripts = SCRIPTS;
})();
