(function () {
  "use strict";
  // Admin overview (flii.app/admin/overzicht/): one chart per client with users and conversions per day.
  // Only clients with consistent daily website or social data are listed (decided by the overview function).
  var API = "https://zuhxlabepqkjnyprdeub.supabase.co/functions/v1/overview";
  var STORE = "flii-dash-session", MODEKEY = "flii-dash-mode", RANGEKEY = "flii-ov-range";
  var LOGO_BASE = "https://zuhxlabepqkjnyprdeub.supabase.co/storage/v1/object/public/logos/";
  var LOGOS = {
    bikefair: "/dashboard-app/logos/bikefair.png", "broadcast-magazine": LOGO_BASE + "broadcast-magazine.svg", "de-buurt": "/dashboard-app/logos/de-buurt.png",
    "fc-klap": LOGO_BASE + "fc-klap.svg", flii: "/dashboard-app/logos/flii.png", onelane: "/dashboard-app/logos/onelane.png", ronreizen: LOGO_BASE + "ronreizen.png",
    stenbossong: LOGO_BASE + "stenbossong-sb.png", theatertijd: LOGO_BASE + "theatertijd.jpg", medialane: "/dashboard-app/logos/medialane.png",
    "uitvaart-portret": LOGO_BASE + "uitvaart-portret.png", zo: LOGO_BASE + "zo.png",
  };
  var SRC = { ga4: "Website", facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn" };
  var RANGES = [["d7", "7 dagen"], ["d28", "28 dagen"], ["d90", "90 dagen"], ["mtd", "Deze maand"], ["lm", "Vorige maand"]];
  var CAL_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  var CHEVRON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

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
  function short(x) { return x >= 1e6 ? nf1.format(x / 1e6) + "m" : x >= 1e4 ? nf1.format(x / 1e3) + "k" : nf.format(x); }
  function pct(v) { return new Intl.NumberFormat("nl-NL", { style: "percent", maximumFractionDigits: 1 }).format(v || 0); }
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function fmtDate(s, opts) { return new Date(s + "T00:00:00").toLocaleDateString("nl-NL", opts || { day: "numeric", month: "short" }); }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

  // Theme follows the dashboards (light or dark; the seasonal themes show as light here).
  var mode = store(MODEKEY);
  document.documentElement.setAttribute("data-theme", mode === "dark" ? "dark" : "light");

  var session = null;
  try { session = JSON.parse(store(STORE) || "null"); } catch (e) {}
  if (!session || !session.token || (session.exp && session.exp < Date.now())) { location.replace("/client/?next=" + encodeURIComponent(location.pathname)); return; }

  // Period: same quick ranges and custom range as the dashboards.
  var state = { range: "d28", custom: null };
  (function () {
    var s = store(RANGEKEY);
    var old = { "7": "d7", "28": "d28", "90": "d90", month: "mtd", prev: "lm" };
    if (old[s]) s = old[s];
    if (RANGES.some(function (r) { return r[0] === s; })) state.range = s;
  })();
  function rangeDates(r) {
    var now = new Date(), to = new Date(now), from = new Date(now);
    if (r === "d7") from.setDate(now.getDate() - 6);
    else if (r === "d28") from.setDate(now.getDate() - 27);
    else if (r === "d90") from.setDate(now.getDate() - 89);
    else if (r === "mtd") from = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (r === "lm") { from = new Date(now.getFullYear(), now.getMonth() - 1, 1); to = new Date(now.getFullYear(), now.getMonth(), 0); }
    else if (r === "custom" && state.custom) return state.custom;
    return { from: iso(from), to: iso(to) };
  }
  function rangeName(r) { for (var i = 0; i < RANGES.length; i++) if (RANGES[i][0] === r) return RANGES[i][1]; return ""; }

  function brand() {
    var w = el("span", { class: "brand-word" }, ["flii"]);
    w.insertAdjacentHTML("beforeend", '<svg class="brand-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.6-9.2C.9 8.5 2.6 5 6 4.3c2.2-.5 4.4.6 6 2.6 1.6-2 3.8-3.1 6-2.6 3.4.7 5.1 4.2 3.6 7.5C19.5 16.3 12 21 12 21z"/></svg>');
    w.appendChild(el("span", { class: "brand-dot", text: "app" }));
    return w;
  }

  function datePicker() {
    var wrap = el("div", { class: "cal" });
    var active = state.range === "custom" && state.custom;
    var btn = el("button", { type: "button", class: "ghost cal-btn" + (active ? " on" : ""), "aria-haspopup": "dialog", "aria-expanded": "false", "aria-label": "Periode kiezen", title: "Periode kiezen" });
    btn.innerHTML = CAL_ICON;
    btn.appendChild(el("span", { text: active ? fmtDate(state.custom.from) + " / " + fmtDate(state.custom.to) : rangeName(state.range) }));
    var r = rangeDates(state.range), today = iso(new Date());
    var sel = { from: r.from, to: r.to }, pending = state.range;
    var seg = el("div", { class: "seg cal-seg", role: "group" });
    function paintSeg() {
      seg.innerHTML = "";
      RANGES.forEach(function (p) {
        seg.appendChild(el("button", { type: "button", "aria-pressed": String(pending === p[0]), text: p[1], onclick: function () {
          pending = p[0]; var q = rangeDates(p[0]); sel = { from: q.from, to: q.to };
          view = new Date(q.to + "T00:00:00"); view.setDate(1); err.textContent = ""; paintCal();
        } }));
      });
    }
    var f = el("div", { class: "cal-val" }), tt = el("div", { class: "cal-val" });
    function show(node, ds, on) { node.textContent = ds ? fmtDate(ds, { day: "numeric", month: "short", year: "numeric" }) : "-"; node.classList.toggle("active", !!on); }
    var err = el("p", { class: "err" });
    var view = new Date(r.to + "T00:00:00"); view.setDate(1);
    var months = el("div", { class: "cal-months" });
    function monthGrid(y, m) {
      var first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      var wd = []; for (var i = 0; i < 7; i++) wd.push(el("span", { class: "cal-wd", text: new Date(2024, 0, 1 + i).toLocaleDateString("nl-NL", { weekday: "narrow" }) }));
      var cells = [];
      for (var k = 0; k < lead; k++) cells.push(el("span", { class: "cal-day empty" }));
      for (var dd = 1; dd <= days; dd++) (function (ds) {
        var c = "cal-day";
        if (ds > today) c += " off";
        if (ds === today) c += " today";
        if (sel.from && sel.to && ds > sel.from && ds < sel.to) c += " in";
        if (ds === sel.from) c += " start";
        if (ds === sel.to) c += " end";
        if (sel.from && sel.to && sel.from !== sel.to && (ds === sel.from || ds === sel.to)) c += " edge";
        cells.push(el("button", { type: "button", class: c, text: String(Number(ds.slice(8))), disabled: ds > today ? "" : null, "aria-label": fmtDate(ds, { day: "numeric", month: "long", year: "numeric" }), onclick: function () { pickDay(ds); } }));
      })(iso(new Date(y, m, dd)));
      return el("div", { class: "cal-month" }, [el("div", { class: "cal-title", text: first.toLocaleDateString("nl-NL", { month: "long", year: "numeric" }) }), el("div", { class: "cal-grid" }, wd.concat(cells))]);
    }
    function paintCal() {
      paintSeg();
      months.innerHTML = "";
      var base = new Date(view);
      if (window.innerWidth >= 720) { var p = new Date(base); p.setMonth(p.getMonth() - 1); months.appendChild(monthGrid(p.getFullYear(), p.getMonth())); }
      months.appendChild(monthGrid(base.getFullYear(), base.getMonth()));
      show(f, sel.from, sel.from && !sel.to); show(tt, sel.to, false);
      nextBtn.disabled = iso(new Date(view.getFullYear(), view.getMonth() + 1, 1)) > today;
    }
    function pickDay(ds) {
      err.textContent = ""; pending = "custom";
      if (!sel.from || sel.to) sel = { from: ds, to: null };
      else if (ds < sel.from) sel = { from: ds, to: sel.from };
      else sel.to = ds;
      paintCal();
    }
    function shiftMonth(n) { view.setMonth(view.getMonth() + n); paintCal(); }
    var prevBtn = el("button", { type: "button", class: "cal-nav", "aria-label": "Vorige maand", onclick: function () { shiftMonth(-1); } });
    var nextBtn = el("button", { type: "button", class: "cal-nav", "aria-label": "Volgende maand", onclick: function () { shiftMonth(1); } });
    prevBtn.innerHTML = CHEVRON; nextBtn.innerHTML = CHEVRON;
    var pop = el("div", { class: "cal-pop", role: "dialog", "aria-label": "Periode kiezen", hidden: "" }, [
      seg,
      el("div", { class: "cal-fields" }, [
        el("div", { class: "field" }, [el("span", { text: "Van" }), f]),
        el("div", { class: "field" }, [el("span", { text: "Tot en met" }), tt]),
      ]),
      el("div", { class: "cal-body" }, [prevBtn, months, nextBtn]),
      el("button", { class: "btn block", type: "button", text: "Toepassen", onclick: function () {
        if (pending !== "custom") { state.range = pending; state.custom = null; store(RANGEKEY, pending); apply(); return; }
        var a = sel.from, b = sel.to || sel.from, n = (Date.parse(b) - Date.parse(a)) / 86400000;
        if (!a || !b || !(n >= 0) || n > 399 || b > today) { err.textContent = "Kies een geldige periode van maximaal 400 dagen."; return; }
        state.custom = { from: a, to: b }; state.range = "custom"; apply();
      } }),
      err,
    ]);
    paintCal();
    function close(e) { if ((e.composedPath ? e.composedPath() : [e.target]).indexOf(wrap) < 0 && !wrap.contains(e.target)) { pop.hidden = true; btn.setAttribute("aria-expanded", "false"); document.removeEventListener("click", close); } }
    btn.addEventListener("click", function () {
      var open = pop.hidden;
      pop.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      if (open) { paintCal(); pop.style.top = window.innerWidth < 720 ? (btn.getBoundingClientRect().bottom + 8) + "px" : ""; }
      if (open) setTimeout(function () { document.addEventListener("click", close); }, 0);
    });
    wrap.appendChild(btn); wrap.appendChild(pop);
    return wrap;
  }

  var root = document.getElementById("ov"), ctrl, main;
  function shell() {
    ctrl = el("div", { class: "ctrl" });
    root.appendChild(el("header", { class: "top" }, [el("div", { class: "top-in ov-top-in" }, [
      el("a", { class: "brand-link", href: "/admin/", title: "Terug naar het dashboard" }, [brand()]),
      el("span", { class: "sep" }),
      el("h1", { class: "client ov-title", text: "Overzicht alle klanten" }),
      el("span", { class: "spacer" }),
      ctrl,
    ])]));
    main = el("main", { class: "ov-main" });
    root.appendChild(main);
    paintCtrl();
  }
  function paintCtrl() { ctrl.innerHTML = ""; ctrl.appendChild(datePicker()); }
  function apply() { paintCtrl(); load(); }

  var tip = el("div", { class: "tip", style: "display:none" });
  document.body.appendChild(tip);

  function convName(c) { return c.conv_label ? c.conv_label.nl || "Conversies" : "Conversies"; }

  function chart(c, ds, W) {
    var H = 150, L = 4, R = 4, T = 16, B = 18;
    var s = svg("svg", { class: "chart", viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "img", "aria-label": c.name + ": gebruikers en " + convName(c).toLowerCase() + " per dag" });
    var n = ds.length, uMax = Math.max.apply(null, c.users.concat([0])), cMax = Math.max.apply(null, c.conversions.concat([0]));
    var iw = W - L - R, ih = H - T - B, step = iw / Math.max(n, 1);
    [0, .5, 1].forEach(function (f) { var y = T + ih * (1 - f); s.appendChild(svg("line", { class: "grid", x1: L, x2: W - R, y1: y, y2: y })); });
    function label(x, anchor, cls, txt) { var t = svg("text", { class: "axis " + cls, x: x, y: T - 5, "text-anchor": anchor }); t.textContent = txt; s.appendChild(t); }
    if (c.has_users && uMax) label(L, "start", "u", short(uMax));
    if (cMax) label(W - R, "end", "c", num(cMax));
    // Conversions as bars on their own scale (up to 60% of the height), users as a line on top.
    c.conversions.forEach(function (v, i) {
      if (!v || !cMax) return;
      var h = Math.max(1.5, (v / cMax) * ih * .6), bw = Math.max(1.5, Math.min(10, step * .55));
      s.appendChild(svg("rect", { class: "c-bar", x: L + i * step + (step - bw) / 2, y: T + ih - h, width: bw, height: h, rx: Math.min(1.5, bw / 2) }));
    });
    if (c.has_users && uMax) {
      var pts = c.users.map(function (v, i) { return [L + i * step + step / 2, T + ih * (1 - v / uMax)]; });
      var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
      s.appendChild(svg("path", { class: "area", d: d + "L" + pts[n - 1][0].toFixed(1) + " " + (T + ih) + "L" + pts[0][0].toFixed(1) + " " + (T + ih) + "Z" }));
      s.appendChild(svg("path", { class: "line", d: d }));
    }
    var ticks = W < 260 ? [0, n - 1] : [0, Math.floor((n - 1) / 2), n - 1];
    ticks.filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (i, k, arr) {
      var t = svg("text", { class: "axis", x: L + i * step + step / 2, y: H - 4, "text-anchor": k === 0 ? "start" : k === arr.length - 1 ? "end" : "middle" });
      t.textContent = fmtDate(ds[i]); s.appendChild(t);
    });
    var hover = svg("line", { class: "hover", y1: T, y2: T + ih, x1: 0, x2: 0, visibility: "hidden" });
    s.appendChild(hover);
    s.addEventListener("pointermove", function (e) {
      var r = s.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W;
      var i = Math.max(0, Math.min(n - 1, Math.floor((x - L) / step)));
      var hx = L + i * step + step / 2; hover.setAttribute("x1", hx); hover.setAttribute("x2", hx); hover.setAttribute("visibility", "visible");
      tip.textContent = fmtDate(ds[i], { weekday: "short", day: "numeric", month: "short" }) + " · " + (c.has_users ? num(c.users[i]) + " gebruikers · " : "") + num(c.conversions[i]) + " " + convName(c).toLowerCase();
      tip.style.display = "block"; tip.style.left = Math.max(8, Math.min(e.clientX + 12, innerWidth - tip.offsetWidth - 8)) + "px"; tip.style.top = (e.clientY - 36) + "px";
    });
    s.addEventListener("pointerleave", function () { tip.style.display = "none"; hover.setAttribute("visibility", "hidden"); });
    return s;
  }
  function delta(cur, prev) {
    if (!prev.days || !prev.v) return el("span", { class: "delta" });
    var ch = (cur - prev.v) / prev.v;
    if (!isFinite(ch)) return el("span", { class: "delta" });
    var cls = "delta" + (Math.abs(ch) >= 0.005 ? (ch > 0 ? " up" : " down") : "");
    return el("span", { class: cls, title: "t.o.v. vorige periode: " + num(prev.v), text: (ch > 0 ? "+" : "") + pct(ch) });
  }
  function stat(label, value, cur, prev, cls) {
    return el("div", { class: "ov-stat" + (cls ? " " + cls : "") }, [
      el("div", { class: "lbl" }, [el("i", { class: "ov-sw" }), label]),
      el("div", { class: "ov-val" }, [el("span", { class: "val", text: value }), delta(cur, prev)]),
    ]);
  }

  var last = null;
  function render(j) {
    last = j;
    main.innerHTML = "";
    var tu = 0, tc = 0;
    j.clients.forEach(function (c) { tu += sum(c.users); tc += sum(c.conversions); });
    var meta = fmtDate(j.from) + " / " + fmtDate(j.to) + " · vs " + fmtDate(j.previous.from) + " / " + fmtDate(j.previous.to);
    main.appendChild(el("div", { class: "sec-head ov-head-row" }, [
      el("h2", null, [el("span", { class: "dot" }), el("span", { class: "ttl", text: "Klanten" })]),
      el("span", { class: "meta", text: j.clients.length + (j.clients.length === 1 ? " klant" : " klanten") + " · " + meta }),
    ]));
    main.appendChild(el("div", { class: "chart-legend ov-legend" }, [
      el("span", { class: "lu" }, [el("i"), "Gebruikers (website)"]),
      el("span", { class: "lc" }, [el("i"), "Conversies"]),
      el("span", { class: "ov-sum" }, ["Totaal ", el("b", { text: short(tu) }), " gebruikers · ", el("b", { text: num(tc) }), " conversies"]),
    ]));
    if (!j.clients.length) { main.appendChild(el("div", { class: "empty", text: "Geen klanten met dagelijkse website- of social data." })); return; }
    var grid = el("div", { class: "ov-grid" });
    main.appendChild(grid);
    var charts = [];
    j.clients.forEach(function (c) {
      var logo = LOGOS[c.slug], nameEl = el("span", { class: "ov-name", text: c.name });
      var mark = logo ? el("img", { src: logo, alt: c.name, class: c.slug === "theatertijd" ? "keep" : c.slug === "fc-klap" ? "fcklap" : null }) : nameEl;
      if (logo) mark.addEventListener("error", function () { mark.replaceWith(nameEl); });
      var u = sum(c.users), cv = sum(c.conversions), pv = c.previous || {};
      var stats = el("div", { class: "ov-stats" }, [
        c.has_users ? stat("Gebruikers", short(u), u, { v: pv.users, days: pv.days }, "u") : null,
        stat(convName(c), num(cv), cv, { v: pv.conversions, days: pv.days }, "c"),
      ]);
      var box = el("div", { class: "ov-chart" });
      if (u || cv) charts.push([box, c]); else box.appendChild(el("div", { class: "empty center", text: "Geen gebruikers of conversies in deze periode" }));
      grid.appendChild(el("a", { class: "ov-card", href: c.slug === "flii" ? "/admin/" : "/client/" + c.slug + "/", title: "Open het dashboard van " + c.name }, [
        el("div", { class: "ov-id" }, [
          el("div", { class: "ov-logo" }, [mark]),
          el("div", { class: "ov-src", text: (c.sources || []).map(function (k) { return SRC[k] || k; }).join(" · ") }),
        ]),
        stats, box,
      ]));
    });
    charts.forEach(function (x) { x[0].appendChild(chart(x[1], j.dates, Math.max(200, Math.round(x[0].clientWidth)))); });
  }
  var rz = 0, lastW = innerWidth;
  addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (last && innerWidth !== lastW) { lastW = innerWidth; render(last); } }, 150); });

  function msg(t) { main.innerHTML = ""; main.appendChild(el("div", { class: "loading", text: t })); }
  var seq = 0;
  function load() {
    var dd = rangeDates(state.range), me = ++seq;
    if (!main.firstChild) msg("Gegevens laden");
    main.classList.add("busy");
    fetch(API + "?from=" + dd.from + "&to=" + dd.to, { headers: { Authorization: "Bearer " + session.token } })
      .then(function (r) { return r.json().then(function (j) { j.__status = r.status; return j; }); })
      .then(function (j) {
        if (me !== seq) return;
        main.classList.remove("busy");
        if (j.__status === 401) { store(STORE, null); location.replace("/client/?next=" + encodeURIComponent(location.pathname)); return; }
        if (j.__status === 403) { msg("Dit overzicht is alleen voor beheerders."); return; }
        if (j.error) { msg("Kon het overzicht niet laden."); return; }
        render(j);
      })
      .catch(function () { if (me === seq) { main.classList.remove("busy"); msg("Kon het overzicht niet laden."); } });
  }

  shell();
  load();
})();
