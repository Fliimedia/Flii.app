/* flii.app acquisition: funneloverzicht (/acquisitie/) en leadlijsten (/acquisitie/<lijst>/).
   Toegang via dezelfde beheerderslogin als de CRM. De fase per lead staat in deze browser (localStorage). */
(function () {
  "use strict";

  var API = "https://fliiapp.vercel.app";
  var SESSIE = "flii.session", NAAM = "flii.app", FASEKEY = "flii.acquisition.v1";

  var FASES = [
    { id: "cold", naam: "Cold call" },
    { id: "warm", naam: "Warm call" },
    { id: "deal", naam: "Deal call" },
    { id: "closed", naam: "Closed" }
  ];

  var LIJSTEN = [
    { slug: "website", titel: "Website", data: "/acquisitie/website/leads.v3.json" },
    { slug: "social-advertising", titel: "Social advertising", data: "/acquisitie/social-advertising/leads.v1.json" },
    { slug: "social-content", titel: "Social content creation", data: "/acquisitie/social-content/leads.v1.json" },
    { slug: "search-llm", titel: "Search & LLM advertising", data: "/acquisitie/search-llm/leads.v1.json" }
  ];

  var wortel = document.getElementById("app");
  var pagina = wortel.getAttribute("data-pagina");

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
  function fases() { try { return JSON.parse(lees(FASEKEY) || "{}") || {}; } catch (e) { return {}; } }
  function faseVan(lijst, id) { return fases()[lijst + "/" + id] || "cold"; }
  function zetFase(lijst, id, fase) { var f = fases(); f[lijst + "/" + id] = fase; schrijf(FASEKEY, JSON.stringify(f)); }
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
      start();
    }).catch(function () { vraagPin("Geen verbinding. Probeer het later opnieuw."); });
  }

  function laadLijst(lijst) {
    return fetch(lijst.data, { cache: "no-store" }).then(function (r) { return r.json(); });
  }

  /* ---------- overzicht ---------- */
  function overzicht() {
    Promise.all(LIJSTEN.map(laadLijst)).then(function (data) {
      var totaal = { cold: 0, warm: 0, deal: 0, closed: 0 }, alles = 0;
      var rijen = LIJSTEN.map(function (l, i) {
        var tel = { cold: 0, warm: 0, deal: 0, closed: 0 };
        data[i].leads.forEach(function (ld) { tel[faseVan(l.slug, ld.id)]++; });
        FASES.forEach(function (f) { totaal[f.id] += tel[f.id]; });
        alles += data[i].leads.length;
        return el("tr", {}, [
          el("td", {}, [el("a", { href: "/acquisitie/" + l.slug + "/", text: l.titel })])
        ].concat(FASES.map(function (f) {
          return el("td", {}, [el("a", { href: "/acquisitie/" + l.slug + "/#" + f.id, text: String(tel[f.id]), style: "text-decoration:none" })]);
        })).concat([el("td", { class: "t", text: String(data[i].leads.length) })]));
      });

      var funnel = el("div", { class: "funnel" }, FASES.map(function (f) {
        var pct = alles ? Math.round(totaal[f.id] / alles * 100) : 0;
        return el("div", { class: "stap" }, [
          el("div", { class: "l" }, [el("span", { class: dotKlasse(f.id) }), f.naam]),
          el("div", { class: "n", text: String(totaal[f.id]) }),
          el("div", { class: "p", text: pct + "%" }),
          el("div", { class: "bar", style: "width:" + pct + "%" })
        ]);
      }));

      var tabel = el("table", { class: "lijsten" }, [
        el("thead", {}, [el("tr", {}, [el("th", { text: "Lijst" })]
          .concat(FASES.map(function (f) { return el("th", { text: f.naam }); }))
          .concat([el("th", { text: "Totaal" })]))]),
        el("tbody", {}, rijen)
      ]);

      scherm([el("div", { class: "band" }), el("div", { class: "wrap" }, [
        kop(el("span", { class: "u", text: "Acquisitie" })),
        el("div", { class: "titelrij" }, [
          el("h1", { text: "Acquisitie" }),
          el("a", { class: "knop", href: "/acquisitie/script/", text: "Cold call script" })
        ]),
        el("p", { class: "sec", text: "Funnel" }), funnel,
        el("p", { class: "sec", text: "Lijsten" }), tabel
      ])]);
    }).catch(function () { scherm([el("div", { class: "wrap" }, [el("p", { class: "leeg", text: "De lijsten konden niet geladen worden." })])]); });
  }

  /* ---------- lijst ---------- */
  function lijstPagina(slug) {
    var lijst = LIJSTEN.filter(function (l) { return l.slug === slug; })[0];
    if (!lijst) { location.replace("/acquisitie/"); return; }
    laadLijst(lijst).then(function (data) {
      var filter = (location.hash || "").replace("#", "");
      if (!FASES.some(function (f) { return f.id === filter; })) filter = "";
      var open = {};

      var tabs = el("div", { class: "tabs" });
      var ul = el("ul", { class: "leads" });

      function teken() {
        var tel = { cold: 0, warm: 0, deal: 0, closed: 0 };
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
          var li = el("li", { class: "lead" + (open[ld.id] ? " open" : "") });
          var pijl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          pijl.setAttribute("viewBox", "0 0 24 24"); pijl.setAttribute("class", "pijl");
          var pad = document.createElementNS("http://www.w3.org/2000/svg", "path");
          pad.setAttribute("d", "M6 9l6 6 6-6"); pijl.appendChild(pad);

          var rij = el("div", { class: "rij", on: { click: function (e) {
            if (e.target.closest("a")) return;
            open[ld.id] = !open[ld.id]; li.classList.toggle("open");
          } } }, [
            el("span", { class: dotKlasse(fase), title: FASES.filter(function (f) { return f.id === fase; })[0].naam }),
            el("span", { class: "naam", text: ld.naam }),
            el("a", { class: "tel", href: telefoonLink(ld.telefoon), text: ld.telefoon }),
            pijl
          ]);

          var info = el("dl", { class: "info" }, [
            el("dt", { text: "Branche" }), el("dd", { text: ld.branche }),
            el("dt", { text: "Adres" }), el("dd", {}, [el("a", { href: ld.maps || mapsLink(ld.naam + ", " + ld.adres), target: "_blank", rel: "noopener", text: ld.adres })]),
            el("dt", { text: "Google reviews" }), el("dd", { text: ld.rating.toFixed(1).replace(".", ",") + " uit 5, " + ld.reviews + " reviews" })
          ].concat(ld.googleWebsite ? [el("dt", { text: "Website op Google" }), el("dd", { text: ld.googleWebsite })] : [])
           .concat(ld.website ? [el("dt", { text: "Website" }), el("dd", {}, [el("a", { href: ld.website, target: "_blank", rel: "noopener", text: ld.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") })])] : [])
           .concat(ld.signaal ? [el("dt", { text: "Op de website" }), el("dd", { text: ld.signaal })] : []));

          var knoppen = el("div", { class: "fases" }, FASES.map(function (f) {
            return el("button", { class: "fase" + (f.id === fase ? " aan" : ""), on: { click: function () {
              zetFase(slug, ld.id, f.id); open[ld.id] = true; teken();
            } } }, [el("span", { class: dotKlasse(f.id) }), f.naam]);
          }));

          li.appendChild(rij);
          li.appendChild(el("div", { class: "fold" }, [info, el("p", { class: "sec", text: "Fase" }), knoppen]));
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
    }).catch(function () { scherm([el("div", { class: "wrap" }, [el("p", { class: "leeg", text: "De lijst kon niet geladen worden." })])]); });
  }

  function start() {
    if (pagina === "overzicht") overzicht();
    else lijstPagina(pagina);
  }

  controleer();
})();
