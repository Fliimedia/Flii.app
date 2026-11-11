(function () {
  "use strict";
  // Admin overview (flii.app/admin/overzicht/): one chart per client with users and conversions per day.
  var API = "https://zuhxlabepqkjnyprdeub.supabase.co/functions/v1/overview";
  var STORE = "flii-dash-session", MODEKEY = "flii-dash-mode", RANGEKEY = "flii-ov-range";
  var LOGO_BASE = "https://zuhxlabepqkjnyprdeub.supabase.co/storage/v1/object/public/logos/";
  var LOGOS = {
    bikefair: "/dashboard-app/logos/bikefair.png", "broadcast-magazine": LOGO_BASE + "broadcast-magazine.svg", "de-buurt": "/dashboard-app/logos/de-buurt.png",
    "fc-klap": LOGO_BASE + "fc-klap.svg", flii: "/dashboard-app/logos/flii.png", onelane: "/dashboard-app/logos/onelane.png", ronreizen: LOGO_BASE + "ronreizen.png",
    stenbossong: LOGO_BASE + "stenbossong-sb.png", theatertijd: LOGO_BASE + "theatertijd.jpg", medialane: "/dashboard-app/logos/medialane.png",
    "uitvaart-portret": LOGO_BASE + "uitvaart-portret.png", zo: LOGO_BASE + "zo.png",
  };
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null) return;
      if (k === "text") n.textContent = v; else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v); else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  var SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) { var n = document.createElementNS(SVGNS, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }
  var nf = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });
  function num(x) { return x >= 100 || Math.round(x) === x ? nf.format(x) : nf1.format(x); }
  function short(x) { return x >= 1e6 ? nf1.format(x / 1e6) + "m" : x >= 1e3 ? nf1.format(x / 1e3) + "k" : nf.format(x); }
  var MON = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  function dlabel(d) { return Number(d.slice(8, 10)) + " " + MON[Number(d.slice(5, 7)) - 1]; }
  function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  // Theme follows the dashboards (light or dark; the seasonal themes show as light here).
  var mode = store(MODEKEY);
  document.documentElement.setAttribute("data-theme", mode === "dark" ? "dark" : "light");

  var session = null;
  try { session = JSON.parse(store(STORE) || "null"); } catch (e) {}
  if (!session || !session.token || (session.exp && session.exp < Date.now())) { location.replace("/client/?next=" + encodeURIComponent(location.pathname)); return; }

  var PRESETS = [["7", "7 dagen"], ["28", "28 dagen"], ["90", "90 dagen"], ["month", "Deze maand"], ["prev", "Vorige maand"]];
  var range = store(RANGEKEY) || "28", custom = null;
  function dates() {
    var t = new Date();
    if (custom) return custom;
    if (range === "month") return [ymd(new Date(t.getFullYear(), t.getMonth(), 1)), ymd(t)];
    if (range === "prev") return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1)), ymd(new Date(t.getFullYear(), t.getMonth(), 0))];
    var n = Number(range) || 28;
    return [ymd(new Date(t.getFullYear(), t.getMonth(), t.getDate() - (n - 1))), ymd(t)];
  }

  var root = document.getElementById("ov"), main, seg, fromIn, toIn;
  function shell() {
    seg = el("div", { class: "ov-seg", role: "group", "aria-label": "Periode" }, PRESETS.map(function (p) {
      return el("button", { type: "button", "data-r": p[0], "aria-pressed": String(!custom && range === p[0]), text: p[1], onclick: function () { custom = null; range = p[0]; store(RANGEKEY, range); sync(); load(); } });
    }));
    var dd = dates();
    fromIn = el("input", { type: "date", value: dd[0], "aria-label": "Van", onchange: pick });
    toIn = el("input", { type: "date", value: dd[1], "aria-label": "Tot en met", onchange: pick });
    var brand = el("span", { class: "brand-word" }, ["flii"]);
    brand.appendChild(el("span", { class: "brand-dot", text: ".app" }));
    root.appendChild(el("header", { class: "ov-top" }, [el("div", { class: "ov-top-in" }, [
      el("a", { class: "brand-link", href: "/admin/", title: "Terug naar het Flii-dashboard" }, [brand]),
      el("h1", { text: "Overzicht klanten" }),
      el("span", { class: "spacer" }),
      el("div", { class: "ov-range" }, [seg, fromIn, el("span", { text: "–" }), toIn]),
    ])]));
    main = el("main", { class: "ov-main" });
    root.appendChild(main);
  }
  function pick() {
    if (!fromIn.value || !toIn.value || fromIn.value > toIn.value) return;
    custom = [fromIn.value, toIn.value]; sync(); load();
  }
  function sync() {
    Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute("aria-pressed", String(!custom && b.getAttribute("data-r") === range)); });
    var dd = dates(); fromIn.value = dd[0]; toIn.value = dd[1];
  }

  var tip = el("div", { class: "tip", style: "display:none" });
  document.body.appendChild(tip);

  function chart(c, ds) {
    var W = 320, H = 150, L = 4, R = 4, T = 8, B = 18;
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": c.name + ": gebruikers en conversies per dag" });
    var n = ds.length, uMax = Math.max.apply(null, c.users.concat([1])), cMax = Math.max.apply(null, c.conversions.concat([1]));
    var iw = W - L - R, ih = H - T - B, step = iw / Math.max(n, 1);
    [0, .5, 1].forEach(function (f) { var y = T + ih * (1 - f); s.appendChild(svg("line", { class: "grid", x1: L, x2: W - R, y1: y, y2: y })); });
    // conversions as bars (own scale), users as line on top
    c.conversions.forEach(function (v, i) {
      if (!v) return;
      var h = Math.max(1.5, (v / cMax) * ih * .55), bw = Math.max(1.2, step * .55);
      s.appendChild(svg("rect", { class: "c-bar", x: L + i * step + (step - bw) / 2, y: T + ih - h, width: bw, height: h, rx: Math.min(1.5, bw / 2) }));
    });
    if (c.has_users) {
      var pts = c.users.map(function (v, i) { return [L + i * step + step / 2, T + ih * (1 - v / uMax)]; });
      var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
      s.appendChild(svg("path", { class: "u-area", d: d + "L" + pts[n - 1][0].toFixed(1) + " " + (T + ih) + "L" + pts[0][0].toFixed(1) + " " + (T + ih) + "Z" }));
      s.appendChild(svg("path", { class: "u-line", d: d, "vector-effect": "non-scaling-stroke" }));
    }
    [0, Math.floor((n - 1) / 2), n - 1].filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (i, k, arr) {
      var t = svg("text", { class: "axis", x: L + i * step + step / 2, y: H - 4, "text-anchor": k === 0 ? "start" : k === arr.length - 1 ? "end" : "middle" });
      t.textContent = dlabel(ds[i]); s.appendChild(t);
    });
    var hover = svg("line", { class: "hover", y1: T, y2: T + ih, x1: -10, x2: -10 });
    s.appendChild(hover);
    function move(e) {
      var r = s.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W;
      var i = Math.max(0, Math.min(n - 1, Math.floor((x - L) / step)));
      var hx = L + i * step + step / 2; hover.setAttribute("x1", hx); hover.setAttribute("x2", hx);
      tip.textContent = dlabel(ds[i]) + " · " + (c.has_users ? num(c.users[i]) + " gebruikers · " : "") + num(c.conversions[i]) + " " + convName(c).toLowerCase();
      tip.style.display = "block"; tip.style.left = Math.min(e.clientX + 12, innerWidth - tip.offsetWidth - 8) + "px"; tip.style.top = (e.clientY - 34) + "px";
    }
    s.addEventListener("pointermove", move);
    s.addEventListener("pointerleave", function () { tip.style.display = "none"; hover.setAttribute("x1", -10); hover.setAttribute("x2", -10); });
    return s;
  }
  function convName(c) { return c.conv_label ? c.conv_label.nl || "Conversies" : "Conversies"; }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

  function render(j) {
    main.innerHTML = "";
    main.appendChild(el("div", { class: "ov-legend" }, [el("span", { class: "lu" }, [el("i"), "Gebruikers (website)"]), el("span", { class: "lc" }, [el("i"), "Conversies"])]));
    var grid = el("div", { class: "ov-grid" });
    j.clients.forEach(function (c) {
      var logo = LOGOS[c.slug];
      var mark = logo ? el("img", { src: logo, alt: c.name, class: c.slug === "theatertijd" ? "keep" : c.slug === "fc-klap" ? "fcklap" : null }) : el("span", { class: "ov-name", text: c.name });
      var u = sum(c.users), cv = sum(c.conversions);
      var nums = el("div", { class: "ov-nums" }, [
        c.has_users ? el("div", null, [el("b", { text: short(u) }), " gebruikers"]) : null,
        el("div", { class: "c" }, [el("b", { text: num(cv) }), " " + convName(c).toLowerCase() + (c.conv_source === "ads" ? " (ads)" : "")]),
      ]);
      var body = u || cv ? el("div", { class: "ov-chart" }, [chart(c, j.dates)]) : el("div", { class: "ov-empty", text: "Geen gebruikers of conversies in deze periode" });
      grid.appendChild(el("a", { class: "ov-card", href: c.slug === "flii" ? "/admin/" : "/client/" + c.slug + "/", title: "Open het dashboard van " + c.name }, [
        el("div", { class: "ov-head" }, [el("div", { class: "ov-logo" }, [mark]), nums]), body,
      ]));
    });
    main.appendChild(grid);
  }

  var seq = 0;
  function load() {
    var dd = dates(), me = ++seq;
    if (!main.firstChild) main.appendChild(el("div", { class: "ov-msg", text: "Laden…" }));
    fetch(API + "?from=" + dd[0] + "&to=" + dd[1], { headers: { Authorization: "Bearer " + session.token } })
      .then(function (r) { return r.json().then(function (j) { j.__status = r.status; return j; }); })
      .then(function (j) {
        if (me !== seq) return;
        if (j.__status === 401) { store(STORE, null); location.replace("/client/?next=" + encodeURIComponent(location.pathname)); return; }
        if (j.__status === 403) { main.innerHTML = ""; main.appendChild(el("div", { class: "ov-msg", text: "Dit overzicht is alleen voor beheerders." })); return; }
        if (j.error) { main.innerHTML = ""; main.appendChild(el("div", { class: "ov-msg", text: "Kon het overzicht niet laden." })); return; }
        render(j);
      })
      .catch(function () { if (me === seq) { main.innerHTML = ""; main.appendChild(el("div", { class: "ov-msg", text: "Kon het overzicht niet laden." })); } });
  }

  shell();
  load();
})();
