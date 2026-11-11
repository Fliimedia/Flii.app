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
    brand.insertAdjacentHTML("beforeend", '<svg class="brand-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.6-9.2C.9 8.5 2.6 5 6 4.3c2.2-.5 4.4.6 6 2.6 1.6-2 3.8-3.1 6-2.6 3.4.7 5.1 4.2 3.6 7.5C19.5 16.3 12 21 12 21z"/></svg>');
    brand.appendChild(el("span", { class: "brand-dot", text: "app" }));
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

  function chart(c, ds, W) {
    var H = 150, L = 4, R = 4, T = 16, B = 18;
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": c.name + ": gebruikers en conversies per dag" });
    var n = ds.length, uMax = Math.max.apply(null, c.users.concat([0])), cMax = Math.max.apply(null, c.conversions.concat([0]));
    var iw = W - L - R, ih = H - T - B, step = iw / Math.max(n, 1);
    [0, .5, 1].forEach(function (f) { var y = T + ih * (1 - f); s.appendChild(svg("line", { class: "grid", x1: L, x2: W - R, y1: y, y2: y })); });
    function label(x, anchor, cls, txt) { var t = svg("text", { class: "axis " + cls, x: x, y: T - 5, "text-anchor": anchor }); t.textContent = txt; s.appendChild(t); }
    if (c.has_users && uMax) label(L, "start", "u", short(uMax));
    if (cMax) label(W - R, "end", "c", num(cMax));
    // conversions as bars on their own scale (up to 60% of the height), users as line on top
    c.conversions.forEach(function (v, i) {
      if (!v || !cMax) return;
      var h = Math.max(1.5, (v / cMax) * ih * .6), bw = Math.max(1.5, Math.min(10, step * .55));
      s.appendChild(svg("rect", { class: "c-bar", x: L + i * step + (step - bw) / 2, y: T + ih - h, width: bw, height: h, rx: Math.min(1.5, bw / 2) }));
    });
    if (c.has_users && uMax) {
      var pts = c.users.map(function (v, i) { return [L + i * step + step / 2, T + ih * (1 - v / uMax)]; });
      var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
      s.appendChild(svg("path", { class: "u-area", d: d + "L" + pts[n - 1][0].toFixed(1) + " " + (T + ih) + "L" + pts[0][0].toFixed(1) + " " + (T + ih) + "Z" }));
      s.appendChild(svg("path", { class: "u-line", d: d }));
    }
    var ticks = W < 260 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1];
    ticks.filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (i, k, arr) {
      var t = svg("text", { class: "axis", x: L + i * step + step / 2, y: H - 4, "text-anchor": k === 0 ? "start" : k === arr.length - 1 ? "end" : "middle" });
      t.textContent = dlabel(ds[i]); s.appendChild(t);
    });
    var hover = svg("line", { class: "hover", y1: T, y2: T + ih, x1: 0, x2: 0, visibility: "hidden" });
    s.appendChild(hover);
    function move(e) {
      var r = s.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W;
      var i = Math.max(0, Math.min(n - 1, Math.floor((x - L) / step)));
      var hx = L + i * step + step / 2; hover.setAttribute("x1", hx); hover.setAttribute("x2", hx); hover.setAttribute("visibility", "visible");
      tip.textContent = dlabel(ds[i]) + " · " + (c.has_users ? num(c.users[i]) + " gebruikers · " : "") + num(c.conversions[i]) + " " + convName(c).toLowerCase();
      tip.style.display = "block"; tip.style.left = Math.max(8, Math.min(e.clientX + 12, innerWidth - tip.offsetWidth - 8)) + "px"; tip.style.top = (e.clientY - 36) + "px";
    }
    s.addEventListener("pointermove", move);
    s.addEventListener("pointerleave", function () { tip.style.display = "none"; hover.setAttribute("visibility", "hidden"); });
    return s;
  }
  function delta(cur, prev) {
    if (!prev.days || !prev.v) return null;
    var p = (cur - prev.v) / prev.v * 100;
    if (!isFinite(p)) return null;
    return el("span", { class: "d " + (p > 0.5 ? "up" : p < -0.5 ? "down" : ""), title: "t.o.v. de vorige periode (" + num(prev.v) + ")", text: (p > 0 ? "+" : "") + nf.format(Math.round(p)) + "%" });
  }
  function convName(c) { return c.conv_label ? c.conv_label.nl || "Conversies" : "Conversies"; }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

  var last = null;
  function render(j) {
    last = j;
    main.innerHTML = "";
    var tu = 0, tc = 0;
    j.clients.forEach(function (c) { tu += sum(c.users); tc += sum(c.conversions); });
    main.appendChild(el("div", { class: "ov-legend" }, [
      el("span", { class: "lu" }, [el("i"), "Gebruikers (website)"]), el("span", { class: "lc" }, [el("i"), "Conversies"]),
      el("span", { class: "ov-sum" }, [dlabel(j.from) + " – " + dlabel(j.to) + " · totaal ", el("b", { text: short(tu) }), " gebruikers · ", el("b", { text: num(tc) }), " conversies"]),
    ]));
    var grid = el("div", { class: "ov-grid" });
    main.appendChild(grid);
    var charts = [];
    j.clients.forEach(function (c) {
      var logo = LOGOS[c.slug], nameEl = el("span", { class: "ov-name", text: c.name });
      var mark = logo ? el("img", { src: logo, alt: c.name, class: c.slug === "theatertijd" ? "keep" : c.slug === "fc-klap" ? "fcklap" : null }) : nameEl;
      if (logo) mark.addEventListener("error", function () { mark.replaceWith(nameEl); });
      var u = sum(c.users), cv = sum(c.conversions), pv = c.previous || {};
      var nums = el("div", { class: "ov-nums" }, [
        c.has_users ? el("div", null, [el("b", { text: short(u) }), " gebruikers ", delta(u, { v: pv.users, days: pv.days })]) : null,
        el("div", { class: "c" }, [el("b", { text: num(cv) }), " " + convName(c).toLowerCase() + (c.conv_source === "ads" ? " (ads)" : "") + " ", delta(cv, { v: pv.conversions, days: pv.days })]),
      ]);
      var box = el("div", { class: "ov-chart" });
      if (u || cv) charts.push([box, c]); else box.appendChild(el("div", { class: "ov-empty", text: "Geen gebruikers of conversies in deze periode" }));
      grid.appendChild(el("a", { class: "ov-card", href: c.slug === "flii" ? "/admin/" : "/client/" + c.slug + "/", title: "Open het dashboard van " + c.name }, [
        el("div", { class: "ov-head" }, [el("div", { class: "ov-logo" }, [mark]), nums]), box,
      ]));
    });
    charts.forEach(function (x) { x[0].appendChild(chart(x[1], j.dates, Math.max(200, Math.round(x[0].clientWidth)))); });
  }
  var rz = 0, lastW = innerWidth;
  addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (last && innerWidth !== lastW) { lastW = innerWidth; render(last); } }, 150); });

  var seq = 0;
  function load() {
    var dd = dates(), me = ++seq;
    if (!main.firstChild) main.appendChild(el("div", { class: "ov-msg", text: "Laden…" }));
    main.classList.add("busy");
    fetch(API + "?from=" + dd[0] + "&to=" + dd[1], { headers: { Authorization: "Bearer " + session.token } })
      .then(function (r) { return r.json().then(function (j) { j.__status = r.status; return j; }); })
      .then(function (j) {
        if (me !== seq) return;
        main.classList.remove("busy");
        if (j.__status === 401) { store(STORE, null); location.replace("/client/?next=" + encodeURIComponent(location.pathname)); return; }
        if (j.__status === 403) { main.innerHTML = ""; main.appendChild(el("div", { class: "ov-msg", text: "Dit overzicht is alleen voor beheerders." })); return; }
        if (j.error) { main.innerHTML = ""; main.appendChild(el("div", { class: "ov-msg", text: "Kon het overzicht niet laden." })); return; }
        render(j);
      })
      .catch(function () { if (me === seq) { main.classList.remove("busy"); main.innerHTML = ""; main.appendChild(el("div", { class: "ov-msg", text: "Kon het overzicht niet laden." })); } });
  }

  shell();
  load();
})();
