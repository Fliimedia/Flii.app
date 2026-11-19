/* flii.app acquisitie: funneloverzicht (/acquisitie/) en leadlijsten (/acquisitie/<lijst>/).
   Toegang via de beheerderslogin (portal). Fases en belpogingen per lead staan op de server (acq-bel.v1.js). */
(function () {
  "use strict";

  var B = window.FliiBel;
  var API = "https://fliiapp.vercel.app";
  var SESSIE = "flii.session", NAAM = "flii.app";
  var FASES = B.FASES, LIJSTEN = B.LIJSTEN, STATUSSEN = B.STATUSSEN;
  var GROEPEN = [{ id: "acquisitie", titel: "Acquisitie" }, { id: "overig", titel: "Overig" }];
  function groepVan(l) { return l.groep || "acquisitie"; }

  var wortel = document.getElementById("app");
  var pagina = wortel.getAttribute("data-pagina");
  var STAAT = { fases: {}, calls: [] };

  /* ---------- hulpjes ---------- */
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
  function lees(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function schrijf(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function faseVan(lijst, id) { return STAAT.fases[lijst + "/" + id] || "cold"; }
  function gesprekken(lijst, id) { return STAAT.calls.filter(function (c) { return c.lijst === lijst && c.lead_id === id; }); }
  function nul() { var t = {}; FASES.forEach(function (f) { t[f.id] = 0; }); return t; }
  function dotKlasse(fase) { return "dot s" + (FASES.map(function (f) { return f.id; }).indexOf(fase) + 1); }
  function telefoonLink(t) { return "tel:" + String(t).replace(/[^0-9+]/g, ""); }
  function mapsLink(adres) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(adres); }

  function kop(rechts) {
    return el("div", { class: "kop" }, [
      (function () {
        var a = el("a", { class: "fliilogo", href: "/", "aria-label": "flii.app" }, ["flii"]);
        a.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.6-9.2C.9 8.5 2.6 5 6 4.3c2.2-.5 4.4.6 6 2.6 1.6-2 3.8-3.1 6-2.6 3.4.7 5.1 4.2 3.6 7.5C19.5 16.3 12 21 12 21z"/></svg><span>app</span>');
        return a;
      })(),
      rechts
    ]);
  }
  function scherm(kinderen) { wortel.innerHTML = ""; kinderen.forEach(function (k) { wortel.appendChild(k); }); }

  /* ---------- toegang ---------- */
  function vraagPin(fout) {
    // Inloggen loopt via de portal (/client/), die na verificatie terugstuurt naar deze pagina.
    if (!fout || /Sessie|incorrect|toegang|mislukt/i.test(fout)) {
      try { localStorage.removeItem(SESSIE); } catch (e) {}
      location.replace("/client/?next=" + encodeURIComponent(location.pathname));
      return;
    }
    scherm([el("div", { class: "poort" }, [el("div", { class: "k" }, [el("p", { text: fout })])])]);
    return;
    var veld = el("input", { type: "password", inputmode: "numeric", maxlength: "8", autocomplete: "off" });
    var knop = el("button", { text: "Inloggen" });
    var melding = el("div", { class: "fout", text: fout || "" });
    scherm([el("div", { class: "poort" }, [el("div", { class: "k" }, [
      el("p", { text: "Voer je pincode in" }), veld, knop, melding
    ])])]);
    veld.focus();
    veld.addEventListener("keydown", function (e) { if (e.key === "Enter") knop.click(); });
    knop.addEventListener("click", function () {
      var pin = veld.value.replace(/[^0-9]/g, "");
      if (pin.length < 4) return;
      veld.disabled = knop.disabled = true;
      fetch(API + "/api/auth", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: NAAM, pin: pin })
      }).then(function (r) {
        if (r.status === 401) { vraagPin("Deze pincode is incorrect"); return null; }
        if (!r.ok) { vraagPin("Er ging iets mis. Probeer het later opnieuw."); return null; }
        return r.json();
      }).then(function (d) {
        if (!d) return;
        if (!d.token || d.role !== "admin") { vraagPin("Geen toegang."); return; }
        schrijf(SESSIE, d.token);
        start();
      }).catch(function () { vraagPin("Geen verbinding. Probeer het later opnieuw."); });
    });
  }

  function controleer() {
    var token = lees(SESSIE);
    if (!token) return vraagPin();
    fetch(API + "/api/session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token })
    }).then(function (r) {
      if (r.status === 401) { schrijf(SESSIE, null); vraagPin("Sessie verlopen"); return null; }
      if (!r.ok) { vraagPin("Er ging iets mis. Probeer het later opnieuw."); return null; }
      return r.json();
    }).then(function (d) {
      if (!d) return;
      if (d.role !== "admin") { vraagPin("Geen toegang."); return; }
      if (!B.sessie()) { B.naarPortal(); return; }
      start();
    }).catch(function () { vraagPin("Geen verbinding. Probeer het later opnieuw."); });
  }

  function laadLijst(lijst) { return B.laadLijst(lijst); }
  function laadStaat(slug) {
    return B.importeer().then(function () { return B.staat(slug); }).then(function (s) { STAAT = s; });
  }

  /* ---------- overzicht ---------- */
  function overzicht() {
    Promise.all([Promise.all(LIJSTEN.map(laadLijst)), laadStaat("")]).then(function (res) {
      var data = res[0];
      var funnelFases = FASES.filter(function (f) { return f.id !== "af"; });
      var totaal = nul(), alles = 0;
      var rijen = LIJSTEN.map(function (l, i) {
        var tel = nul();
        data[i].leads.forEach(function (ld) { tel[faseVan(l.slug, ld.id)]++; });
        var pogingen = STAAT.calls.filter(function (c) { return c.lijst === l.slug; }).length;
        if (groepVan(l) === "acquisitie") {
          FASES.forEach(function (f) { totaal[f.id] += tel[f.id]; });
          alles += data[i].leads.length;
        }
        return el("tr", {}, [
          el("td", {}, [el("a", { href: "/acquisitie/" + l.slug + "/", text: l.titel })])
        ].concat(FASES.map(function (f) {
          return el("td", {}, [el("a", { href: "/acquisitie/" + l.slug + "/#" + f.id, text: String(tel[f.id]), style: "text-decoration:none" })]);
        })).concat([el("td", { text: String(pogingen) }), el("td", { class: "t", text: String(data[i].leads.length) })]));
      });

      var funnel = el("div", { class: "funnel" }, funnelFases.map(function (f) {
        var pct = alles ? Math.round(totaal[f.id] / alles * 100) : 0;
        return el("div", { class: "stap" }, [
          el("div", { class: "l" }, [el("span", { class: dotKlasse(f.id) }), f.naam]),
          el("div", { class: "n", text: String(totaal[f.id]) }),
          el("div", { class: "p", text: pct + "%" }),
          el("div", { class: "bar", style: "width:" + pct + "%" })
        ]);
      }));

      var tabellen = [];
      GROEPEN.forEach(function (g) {
        var eigen = rijen.filter(function (r, i) { return groepVan(LIJSTEN[i]) === g.id; });
        if (!eigen.length) return;
        tabellen.push(el("p", { class: "sec", text: g.titel }));
        tabellen.push(el("table", { class: "lijsten" }, [
          el("thead", {}, [el("tr", {}, [el("th", { text: "Lijst" })]
            .concat(FASES.map(function (f) { return el("th", { text: f.naam }); }))
            .concat([el("th", { text: "Belpogingen" }), el("th", { text: "Totaal" })]))]),
          el("tbody", {}, eigen)
        ]));
      });

      scherm([el("div", { class: "band" }), el("div", { class: "wrap" }, [
        kop(el("span", { class: "u", text: "Acquisitie" })),
        el("div", { class: "titelrij" }, [
          el("h1", { text: "Acquisitie" }),
          el("a", { class: "knop", href: "/acquisitie/script/", text: "Cold call script" })
        ]),
        el("p", { class: "sec", text: "Funnel" }), funnel
      ].concat(tabellen))]);
    }).catch(function (e) { if (e && e.message === "login") return; scherm([el("div", { class: "wrap" }, [el("p", { class: "leeg", text: "De lijsten konden niet geladen worden." })])]); });
  }

  /* ---------- gesprek vastleggen ---------- */
  function vastleggen(slug, ld, klaar) {
    var gekozen = null;
    var melding = el("p", { class: "bl-melding" });
    var beschrijving = el("textarea", { rows: "3", placeholder: "Wat is er besproken? Contactpersoon, afspraken, bijzonderheden." });
    var datum = el("input", { type: "date" }), tijd = el("input", { type: "time", step: "300" });
    var opvolgRij = el("div", { class: "bl-opvolg", hidden: "" }, [
      el("label", {}, [el("span", { text: "Volgende actie" }), datum]),
      el("label", {}, [el("span", { text: "Tijd" }), tijd])
    ]);
    var knoppen = {};
    function kies(st) {
      gekozen = st;
      Object.keys(knoppen).forEach(function (k) { knoppen[k].classList.toggle("aan", k === st.id); });
      var d = B.standaardOpvolging(st);
      if (d) { datum.value = B.datumVeld(d); tijd.value = B.tijdVeld(d); opvolgRij.removeAttribute("hidden"); }
      else { datum.value = ""; tijd.value = ""; opvolgRij.setAttribute("hidden", ""); }
      melding.textContent = "";
    }
    function groep(titel, bereikt) {
      return el("div", { class: "bl-groep" }, [el("span", { class: "bl-kop", text: titel }), el("div", { class: "bl-chips" },
        STATUSSEN.filter(function (s) { return s.bereikt === bereikt; }).map(function (s) {
          var b = el("button", { type: "button", class: "bl-chip", on: { click: function () { kies(s); } } }, [
            s.fase ? el("span", { class: dotKlasse(s.fase) }) : null, s.naam
          ]);
          knoppen[s.id] = b;
          return b;
        }))]);
    }
    function opvolging() {
      if (!gekozen || opvolgRij.hasAttribute("hidden") || !datum.value) return null;
      return new Date(datum.value + "T" + (tijd.value || "10:00"));
    }
    function agendaGegevens() {
      var start = opvolging();
      if (!start) { melding.textContent = "Kies eerst een uitkomst met een volgende actie en een datum."; return null; }
      var tekst = gekozen.naam + (beschrijving.value.trim() ? "\n\n" + beschrijving.value.trim() : "") + (ld.telefoon ? "\n\nTelefoon: " + ld.telefoon : "");
      return { titel: (gekozen.titel || "Bellen") + " " + ld.naam, start: start, eind: new Date(start.getTime() + (gekozen.duur || 10) * 60000), tekst: tekst };
    }
    var opslaan = el("button", { type: "button", class: "bl-opslaan", text: "Opslaan", on: { click: function () {
      if (!gekozen) { melding.textContent = "Kies eerst de uitkomst van het gesprek."; return; }
      opslaan.disabled = true;
      var o = opvolging();
      B.logGesprek({ lijst: slug, lead_id: ld.id, lead_naam: ld.naam, status: gekozen.naam, bereikt: gekozen.bereikt, fase: gekozen.fase,
        beschrijving: beschrijving.value, opvolging: o ? o.toISOString() : null })
        .then(function (r) {
          STAAT.calls.unshift(r.call);
          if (gekozen.fase) STAAT.fases[slug + "/" + ld.id] = gekozen.fase;
          klaar();
        })
        .catch(function (e) { opslaan.disabled = false; if (e.message !== "login") melding.textContent = "Opslaan lukte niet. Probeer het opnieuw."; });
    } } });
    return el("div", { class: "bl" }, [
      el("p", { class: "sec", text: "Gesprek vastleggen" }),
      groep("Niet bereikt", false), groep("Bereikt", true),
      el("label", { class: "bl-besch" }, [el("span", { text: "Beschrijving" }), beschrijving]),
      opvolgRij,
      el("div", { class: "bl-knoppen" }, [
        opslaan,
        el("button", { type: "button", class: "bl-licht", text: "Google Agenda", on: { click: function () { var a = agendaGegevens(); if (a) B.googleAgenda(a); } } }),
        el("button", { type: "button", class: "bl-licht", text: "Outlook / Apple (.ics)", on: { click: function () { var a = agendaGegevens(); if (a) B.icsBestand(a); } } })
      ]),
      melding
    ]);
  }

  function geschiedenis(slug, ld, opnieuw) {
    var lijst = gesprekken(slug, ld.id);
    if (!lijst.length) return el("p", { class: "bl-leeg", text: "Nog niet gebeld." });
    return el("ol", { class: "bl-hist" }, lijst.map(function (c) {
      return el("li", {}, [
        el("div", { class: "bl-hkop" }, [
          el("span", { class: c.fase ? dotKlasse(c.fase) : "dot" }),
          el("b", { text: c.status }),
          el("span", { class: "bl-wanneer", text: B.kortDatum(c.created_at, true) + (c.door ? " · " + c.door : "") }),
          el("button", { type: "button", class: "bl-weg", title: "Verwijderen", "aria-label": "Verwijderen", text: "×", on: { click: function () {
            if (!window.confirm("Deze belpoging verwijderen?")) return;
            B.verwijder(c.id).then(function () { STAAT.calls = STAAT.calls.filter(function (x) { return x.id !== c.id; }); opnieuw(); }).catch(function () {});
          } } })
        ]),
        c.beschrijving ? el("p", { class: "bl-tekst", text: c.beschrijving }) : null,
        c.opvolging ? el("p", { class: "bl-volgende", text: "Volgende actie: " + B.kortDatum(c.opvolging, true) }) : null
      ]);
    }));
  }

  /* ---------- lijst ---------- */
  function lijstPagina(slug) {
    var lijst = LIJSTEN.filter(function (l) { return l.slug === slug; })[0];
    if (!lijst) { location.replace("/acquisitie/"); return; }
    Promise.all([laadLijst(lijst), laadStaat(slug)]).then(function (res) {
      var data = res[0];
      var filter = (location.hash || "").replace("#", "");
      if (!FASES.some(function (f) { return f.id === filter; })) filter = "";
      var open = {};

      var tabs = el("div", { class: "tabs" });
      var ul = el("ul", { class: "leads" });

      function teken() {
        var tel = nul();
        data.leads.forEach(function (ld) { tel[faseVan(slug, ld.id)]++; });

        tabs.innerHTML = "";
        tabs.appendChild(el("button", { class: "tab" + (filter ? "" : " aan"), on: { click: function () { kies(""); } } },
          ["Alle ", el("b", { text: String(data.leads.length) })]));
        FASES.forEach(function (f) {
          tabs.appendChild(el("button", { class: "tab" + (filter === f.id ? " aan" : ""), on: { click: function () { kies(f.id); } } },
            [el("span", { class: dotKlasse(f.id) }), f.naam + " ", el("b", { text: String(tel[f.id]) })]));
        });

        ul.innerHTML = "";
        var zichtbaar = data.leads.filter(function (ld) { return !filter || faseVan(slug, ld.id) === filter; });
        if (!zichtbaar.length) ul.appendChild(el("li", { class: "leeg", text: "Geen bedrijven in deze fase." }));
        zichtbaar.forEach(function (ld) {
          var fase = faseVan(slug, ld.id);
          var calls = gesprekken(slug, ld.id);
          var li = el("li", { class: "lead" + (open[ld.id] ? " open" : "") });
          var pijl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          pijl.setAttribute("viewBox", "0 0 24 24"); pijl.setAttribute("class", "pijl");
          var pad = document.createElementNS("http://www.w3.org/2000/svg", "path");
          pad.setAttribute("d", "M6 9l6 6 6-6"); pijl.appendChild(pad);

          var rij = el("div", { class: "rij", on: { click: function (e) {
            if (e.target.closest("a")) return;
            open[ld.id] = !open[ld.id]; li.classList.toggle("open");
          } } }, [
            el("span", { class: dotKlasse(fase), title: B.faseNaam(fase) }),
            el("span", { class: "naam" }, [
              el("span", { class: "nm", text: ld.naam }),
              calls.length ? el("span", { class: "bel-info", text: calls.length + "× gebeld · " + calls[0].status + ", " + B.kortDatum(calls[0].created_at) }) : null
            ]),
            ld.telefoon ? el("a", { class: "tel", href: telefoonLink(ld.telefoon), text: ld.telefoon }) : el("span"),
            pijl
          ]);

          var info = el("dl", { class: "info" }, [
            el("dt", { text: "Branche" }), el("dd", { text: ld.branche }),
            el("dt", { text: "Adres" }), el("dd", {}, [el("a", { href: ld.maps || mapsLink(ld.naam + ", " + ld.adres), target: "_blank", rel: "noopener", text: ld.adres })]),
          ].concat(ld.eigenaar ? [el("dt", { text: "Eigenaar" }), el("dd", { text: ld.eigenaar })] : [])
           .concat(ld.email ? [el("dt", { text: "E-mail" }), el("dd", {}, [el("a", { href: "mailto:" + ld.email, text: ld.email })])] : [])
           .concat(typeof ld.rating === "number" ? [el("dt", { text: "Google reviews" }), el("dd", { text: ld.rating.toFixed(1).replace(".", ",") + " uit 5, " + ld.reviews + " reviews" })] : [])
           .concat(ld.googleWebsite ? [el("dt", { text: "Website op Google" }), el("dd", { text: ld.googleWebsite })] : [])
           .concat(ld.website ? [el("dt", { text: "Website" }), el("dd", {}, [el("a", { href: ld.website, target: "_blank", rel: "noopener", text: ld.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") })])] : [])
           .concat(ld.signaal ? [el("dt", { text: "Op de website" }), el("dd", { text: ld.signaal })] : [])
           .concat([el("dt", { text: "Gebeld" }), el("dd", { text: calls.length ? calls.length + " keer, waarvan " + calls.filter(function (c) { return c.bereikt; }).length + " keer bereikt" : "Nog niet" })]));

          var knoppen = el("div", { class: "fases" }, FASES.map(function (f) {
            return el("button", { class: "fase" + (f.id === fase ? " aan" : ""), on: { click: function () {
              STAAT.fases[slug + "/" + ld.id] = f.id; open[ld.id] = true; teken();
              B.zetFase(slug, ld.id, f.id).catch(function () {});
            } } }, [el("span", { class: dotKlasse(f.id) }), f.naam]);
          }));

          li.appendChild(rij);
          li.appendChild(el("div", { class: "fold" }, [
            info,
            el("div", { class: "bl-script" }, [el("a", { class: "knop licht", href: "/acquisitie/script/?lijst=" + slug + "&lead=" + encodeURIComponent(ld.id), text: "Bellen met script" })]),
            vastleggen(slug, ld, function () { open[ld.id] = true; teken(); }),
            el("p", { class: "sec", text: "Belgeschiedenis" }), geschiedenis(slug, ld, teken),
            el("p", { class: "sec", text: "Fase" }), knoppen
          ]));
          ul.appendChild(li);
        });
      }

      function kies(f) {
        filter = f;
        history.replaceState(null, "", f ? "#" + f : location.pathname);
        teken();
      }

      scherm([el("div", { class: "band" }), el("div", { class: "wrap" }, [
        kop(el("a", { class: "u", href: "/acquisitie/", text: "Acquisitie" })),
        el("h1", { text: data.titel || lijst.titel }),
        data.selectie ? el("p", { class: "selectie", style: "color:var(--muted);margin:-14px 0 26px;max-width:680px", text: data.selectie }) : null,
        tabs, ul
      ])]);
      teken();
      window.addEventListener("hashchange", function () {
        var h = (location.hash || "").replace("#", "");
        filter = FASES.some(function (f) { return f.id === h; }) ? h : "";
        teken();
      });
    }).catch(function (e) { if (e && e.message === "login") return; scherm([el("div", { class: "wrap" }, [el("p", { class: "leeg", text: "De lijst kon niet geladen worden." })])]); });
  }

  function start() {
    if (pagina === "overzicht") overzicht();
    else lijstPagina(pagina);
  }

  controleer();
})();
