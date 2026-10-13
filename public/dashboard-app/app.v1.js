(function () {
  "use strict";

  var API = "https://zuhxlabepqkjnyprdeub.supabase.co/functions/v1/dash";
  var STORE = "flii-dash-session";
  var LANGKEY = "flii-dash-lang";
  var slug = (location.pathname.split("/").filter(Boolean)[0] || "").toLowerCase();

  var T = {
    nl: {
      title: "Dashboard", sub: "Log in met je gebruikersnaam en pincode.", user: "Gebruikersnaam", pin: "Pincode", login: "Inloggen",
      bad: "Gebruikersnaam of pincode klopt niet.", fail: "Inloggen lukt nu niet. Probeer het zo opnieuw.", logout: "Uitloggen",
      d7: "7 dagen", d28: "28 dagen", d90: "90 dagen", mtd: "Deze maand", lm: "Vorige maand",
      live: "actief nu", vs: "t.o.v. vorige periode", updated: "bijgewerkt", loading: "Gegevens laden",
      website: "Website", ads: "Advertenties", search: "Zoeken in Google", youtube: "YouTube",
      sessions: "Sessies", users: "Gebruikers", keyEvents: "Conversies (key events)", engagement: "Betrokkenheid",
      cost: "Kosten", clicks: "Klikken", conversions: "Conversies", cpa: "Kosten per conversie", impressions: "Vertoningen",
      ctr: "CTR", cpc: "Kosten per klik", position: "Gem. positie", views: "Weergaven", watch: "Kijkminuten", subs: "Abonnees netto", likes: "Likes",
      platform: "Platform", campaign: "Campagne", channel: "Kanaal", query: "Zoekterm", none: "Geen gegevens in deze periode.",
      perDay: "per dag", noData: "Er zijn nog geen bronnen gekoppeld aan dit dashboard.", notFound: "Dit dashboard bestaat niet.",
      platforms: "Per platform", campaigns: "Campagnes", channels: "Verkeer per kanaal", queries: "Belangrijkste zoektermen",
      prelim: "Cijfers van de laatste 2 dagen zijn voorlopig.",
    },
    en: {
      title: "Dashboard", sub: "Sign in with your username and PIN.", user: "Username", pin: "PIN", login: "Sign in",
      bad: "Username or PIN is incorrect.", fail: "Sign in is not available right now. Please try again shortly.", logout: "Sign out",
      d7: "7 days", d28: "28 days", d90: "90 days", mtd: "This month", lm: "Last month",
      live: "active now", vs: "vs previous period", updated: "updated", loading: "Loading data",
      website: "Website", ads: "Advertising", search: "Google Search", youtube: "YouTube",
      sessions: "Sessions", users: "Users", keyEvents: "Conversions (key events)", engagement: "Engagement rate",
      cost: "Spend", clicks: "Clicks", conversions: "Conversions", cpa: "Cost per conversion", impressions: "Impressions",
      ctr: "CTR", cpc: "Cost per click", position: "Avg. position", views: "Views", watch: "Watch minutes", subs: "Net subscribers", likes: "Likes",
      platform: "Platform", campaign: "Campaign", channel: "Channel", query: "Query", none: "No data in this period.",
      perDay: "per day", noData: "No sources are connected to this dashboard yet.", notFound: "This dashboard does not exist.",
      platforms: "By platform", campaigns: "Campaigns", channels: "Traffic by channel", queries: "Top search queries",
      prelim: "Figures for the last 2 days are preliminary.",
    },
  };
  var PLATFORM = { google_ads: "Google Ads", microsoft_ads: "Microsoft Ads", chatgpt_ads: "ChatGPT Ads", meta_ads: "Meta Ads", linkedin_ads: "LinkedIn Ads" };
  var ADS = ["google_ads", "microsoft_ads", "chatgpt_ads", "meta_ads", "linkedin_ads"];

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  var lang = store(LANGKEY) || ((navigator.language || "nl").toLowerCase().indexOf("nl") === 0 ? "nl" : "en");
  function t(k) { return (T[lang] && T[lang][k]) || T.nl[k] || k; }
  var loc = function () { return lang === "nl" ? "nl-NL" : "en-GB"; };

  var state = { session: null, range: "d28", data: null, clients: [], timer: null, liveTimer: null };

  // ---------- helpers ----------
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function num(v, d) { return new Intl.NumberFormat(loc(), { maximumFractionDigits: d == null ? 0 : d, minimumFractionDigits: d || 0 }).format(v || 0); }
  function eur(v) { return new Intl.NumberFormat(loc(), { style: "currency", currency: "EUR", maximumFractionDigits: v >= 1000 ? 0 : 2 }).format(v || 0); }
  function pct(v) { return new Intl.NumberFormat(loc(), { style: "percent", maximumFractionDigits: 1 }).format(v || 0); }
  function iso(d) { return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10); }
  function fmtDate(s, opts) { return new Date(s + "T00:00:00").toLocaleDateString(loc(), opts || { day: "numeric", month: "short" }); }
  function fmtTime(s) { return new Date(s).toLocaleTimeString(loc(), { hour: "2-digit", minute: "2-digit" }); }

  function rangeDates(r) {
    var now = new Date(), to = new Date(now), from = new Date(now);
    if (r === "d7") from.setDate(now.getDate() - 6);
    else if (r === "d28") from.setDate(now.getDate() - 27);
    else if (r === "d90") from.setDate(now.getDate() - 89);
    else if (r === "mtd") from = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (r === "lm") { from = new Date(now.getFullYear(), now.getMonth() - 1, 1); to = new Date(now.getFullYear(), now.getMonth(), 0); }
    return { from: iso(from), to: iso(to) };
  }

  function api(path, opts) {
    opts = opts || {};
    var headers = { "Content-Type": "application/json" };
    if (state.session) headers.Authorization = "Bearer " + state.session.token;
    return fetch(API + path, { method: opts.method || "GET", headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.__status = r.status; return j; }); });
  }

  // ---------- login ----------
  function loadSession() {
    try { var s = JSON.parse(store(STORE) || "null"); if (s && s.exp > Date.now()) return s; } catch (e) {}
    return null;
  }
  function logout() { store(STORE, null); state.session = null; clearInterval(state.timer); clearInterval(state.liveTimer); renderGate(); }

  function renderGate(message) {
    document.title = "flii.app " + t("title");
    var root = document.getElementById("app");
    root.innerHTML = "";
    var user = el("input", { autocomplete: "username", autocapitalize: "none", spellcheck: "false", required: "", value: slug && slug !== "flii" ? slug : "" });
    var pin = el("input", { class: "pin", type: "password", inputmode: "numeric", pattern: "[0-9]*", maxlength: "8", autocomplete: "current-password", required: "" });
    var err = el("p", { class: "err", role: "alert", text: message || "" });
    var btn = el("button", { class: "btn block", type: "submit", text: t("login") });
    var form = el("form", { onsubmit: function (e) {
      e.preventDefault();
      btn.disabled = true; err.textContent = "";
      api("/login", { method: "POST", body: { username: user.value.trim(), pin: pin.value.trim(), client: slug } }).then(function (j) {
        btn.disabled = false;
        if (j.token) {
          state.session = { token: j.token, role: j.role, client: j.client, exp: Date.now() + 11.5 * 3600000 };
          store(STORE, JSON.stringify(state.session));
          if (j.role === "client" && j.client && j.client !== slug) { location.href = "/" + j.client + "/dashboard/"; return; }
          start();
        } else { err.textContent = j.__status === 401 ? t("bad") : t("fail"); pin.value = ""; pin.focus(); }
      }).catch(function () { btn.disabled = false; err.textContent = t("fail"); });
    } }, [
      el("label", { class: "field" }, [el("span", { text: t("user") }), user]),
      el("label", { class: "field" }, [el("span", { text: t("pin") }), pin]),
      btn, err,
    ]);
    root.appendChild(el("div", { class: "gate" }, [el("div", { class: "gate-card" }, [
      brand(), el("h1", { text: t("title") }), el("p", { class: "sub", text: t("sub") }), form,
    ])]));
    (user.value ? pin : user).focus();
  }

  function brand() {
    var w = el("span", { class: "brand-word" }, ["flii"]);
    w.insertAdjacentHTML("beforeend", '<svg class="brand-heart" viewBox="0 0 24 24" aria-hidden="true"><path fill="#E7255A" d="M12 21s-7.5-4.7-9.6-9.2C.9 8.5 2.6 5 6 4.3c2.2-.5 4.4.6 6 2.6 1.6-2 3.8-3.1 6-2.6 3.4.7 5.1 4.2 3.6 7.5C19.5 16.3 12 21 12 21z"/></svg>');
    w.appendChild(el("span", { class: "brand-dot", text: "app" }));
    return w;
  }

  // ---------- dashboard ----------
  function start() {
    if (!slug) { slug = state.session.client || "flii"; history.replaceState(null, "", "/" + slug + "/dashboard/"); }
    renderShell();
    if (state.session.role === "admin") api("/clients").then(function (j) { state.clients = j.clients || []; renderShell(); load(); });
    else load();
    clearInterval(state.timer); clearInterval(state.liveTimer);
    state.timer = setInterval(load, 10 * 60000);
    state.liveTimer = setInterval(loadLive, 60000);
    loadLive();
  }

  function load() {
    var r = rangeDates(state.range);
    api("/data?client=" + encodeURIComponent(slug) + "&from=" + r.from + "&to=" + r.to).then(function (j) {
      if (j.__status === 401) return logout();
      if (j.__status === 403 || j.__status === 404) { state.data = { error: t("notFound") }; return renderBody(); }
      state.data = j; renderBody();
    }).catch(function () {});
  }

  function loadLive() {
    api("/realtime?client=" + encodeURIComponent(slug)).then(function (j) {
      var p = document.getElementById("live");
      if (!p) return;
      if (typeof j.active_users_30m === "number") { p.hidden = false; p.querySelector("b").textContent = num(j.active_users_30m); }
      else p.hidden = true;
    }).catch(function () {});
  }

  function renderShell() {
    var root = document.getElementById("app");
    root.innerHTML = "";
    var name = (state.data && state.data.client && state.data.client.name) || slug;
    var clientCtl;
    if (state.session.role === "admin" && state.clients.length) {
      clientCtl = el("select", { class: "sel", "aria-label": "Client", onchange: function (e) { location.href = "/" + e.target.value + "/dashboard/"; } },
        state.clients.map(function (c) { var o = el("option", { value: c.slug, text: c.name }); if (c.slug === slug) o.selected = true; return o; }));
    } else clientCtl = el("span", { class: "client", id: "client-name", text: name });

    var seg = el("div", { class: "seg", role: "group" }, ["d7", "d28", "d90", "mtd", "lm"].map(function (k) {
      return el("button", { type: "button", "aria-pressed": String(state.range === k), text: t(k), onclick: function () { state.range = k; renderShell(); renderBody(true); load(); } });
    }));
    var live = el("span", { class: "live-pill", id: "live", hidden: "" }, [el("span", { class: "dot live" }), el("b", { text: "0" }), " " + t("live")]);
    var langBtn = el("button", { class: "ghost", type: "button", text: lang === "nl" ? "EN" : "NL", onclick: function () { lang = lang === "nl" ? "en" : "nl"; store(LANGKEY, lang); document.documentElement.lang = lang; renderShell(); renderBody(); loadLive(); } });
    var out = el("button", { class: "ghost", type: "button", text: t("logout"), onclick: logout });

    root.appendChild(el("header", { class: "top" }, [el("div", { class: "top-in" }, [
      brand(), el("span", { class: "sep" }), clientCtl, el("span", { class: "spacer" }), live,
      el("div", { class: "ctrl" }, [seg, langBtn, out]),
    ])]));
    root.appendChild(el("main", { id: "main" }, [el("div", { class: "loading", text: t("loading") })]));
    var f = el("footer", null, [el("div", { text: t("prelim") })]);
    var built = el("div", { class: "built" }, [el("span", { class: "shine", text: "built by" }), brand()]);
    f.appendChild(el("div", null, [built]));
    root.appendChild(f);
  }

  function delta(cur, prev, good) {
    if (!prev) return el("div", { class: "delta", text: " " });
    var ch = (cur - prev) / prev;
    var cls = "delta";
    if (good && Math.abs(ch) >= 0.005) cls += (ch > 0) === (good === "up") ? " up" : " down";
    var sign = ch > 0 ? "+" : "";
    return el("div", { class: cls, title: t("vs"), text: sign + pct(ch) + " " + t("vs").split(" ")[0] });
  }
  function kpi(label, value, cur, prev, good) {
    return el("div", { class: "kpi" }, [el("div", { class: "lbl", text: label }), el("div", { class: "val", text: value }), delta(cur, prev, good)]);
  }

  function section(title, updated, kids) {
    var head = el("div", { class: "sec-head" }, [el("h2", null, [el("span", { class: "dot" }), title])]);
    if (updated) head.appendChild(el("span", { class: "meta", text: t("updated") + " " + fmtTime(updated) }));
    return el("section", { class: "section" }, [head].concat(kids));
  }

  // Charts draw at the real container width so text never stretches.
  function chart(dates, values, format) {
    var box = el("div", { class: "chart-box" });
    var tip = null;
    function draw() {
      var W = Math.max(260, box.clientWidth || 600), H = 180, P = { l: 44, r: 10, t: 10, b: 22 };
      var max = Math.max.apply(null, values.concat([0])) || 1;
      var step = Math.pow(10, Math.floor(Math.log10(max))); var top = Math.ceil(max / step) * step;
      var x = function (i) { return P.l + (dates.length > 1 ? (i * (W - P.l - P.r)) / (dates.length - 1) : (W - P.l - P.r) / 2); };
      var y = function (v) { return P.t + (H - P.t - P.b) * (1 - v / top); };
      var pts = values.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }).join(" ");
      var svg = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img">';
      [0, 0.5, 1].forEach(function (f) { var yy = y(top * f); svg += '<line class="grid" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '"/><text class="axis" x="' + (P.l - 6) + '" y="' + (yy + 3) + '" text-anchor="end">' + format(top * f, true) + "</text>"; });
      var ticks = Math.min(W < 420 ? 3 : 6, dates.length);
      for (var k = 0; k < ticks; k++) {
        var i = Math.round((k * (dates.length - 1)) / Math.max(1, ticks - 1));
        var anchor = k === 0 ? "start" : k === ticks - 1 ? "end" : "middle";
        svg += '<text class="axis" x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="' + anchor + '">' + fmtDate(dates[i]) + "</text>";
      }
      svg += '<polygon class="area" points="' + x(0) + "," + y(0) + " " + pts + " " + x(dates.length - 1) + "," + y(0) + '"/>';
      svg += '<polyline class="line" points="' + pts + '"/>';
      svg += '<rect class="hit" x="0" y="0" width="' + W + '" height="' + H + '"/></svg>';
      box.innerHTML = svg;
      var node = box.firstChild;
      function move(ev) {
        var p = ev.touches ? ev.touches[0] : ev, b = node.getBoundingClientRect();
        var rel = ((p.clientX - b.left) / b.width) * W;
        var i = Math.max(0, Math.min(dates.length - 1, Math.round(((rel - P.l) / (W - P.l - P.r)) * (dates.length - 1))));
        if (!tip) { tip = el("div", { class: "tip" }); document.body.appendChild(tip); }
        tip.textContent = fmtDate(dates[i], { weekday: "short", day: "numeric", month: "short" }) + "  " + format(values[i]);
        tip.style.left = Math.min(window.innerWidth - 170, p.clientX + 12) + "px"; tip.style.top = (p.clientY - 34) + "px";
      }
      function leave() { if (tip) { tip.remove(); tip = null; } }
      node.addEventListener("mousemove", move); node.addEventListener("touchmove", move, { passive: true });
      node.addEventListener("mouseleave", leave); node.addEventListener("touchend", leave);
    }
    requestAnimationFrame(draw);
    if (window.ResizeObserver) { var last = 0; new ResizeObserver(function () { if (box.clientWidth && Math.abs(box.clientWidth - last) > 4) { last = box.clientWidth; draw(); } }).observe(box); }
    return box;
  }

  function table(cols, rows) {
    if (!rows.length) return el("div", { class: "empty", text: t("none") });
    var thead = el("thead", null, [el("tr", null, cols.map(function (c) { return el("th", { class: c.n ? "n" : "", text: c.label }); }))]);
    var tbody = el("tbody", null, rows.map(function (r) { return el("tr", null, cols.map(function (c) { var v = c.get(r); return el("td", { class: c.n ? "n" : c.name ? "name" : "" }, [v instanceof Node ? v : String(v)]); })); }));
    return el("div", { class: "tbl-wrap" }, [el("table", null, [thead, tbody])]);
  }

  function shortNum(v, axis) { return axis && v >= 1000 ? num(v / 1000, v >= 10000 ? 0 : 1) + "k" : num(v); }
  function shortEur(v, axis) { return axis ? "€" + shortNum(v, true) : eur(v); }

  function renderBody(loadingOnly) {
    var main = document.getElementById("main");
    if (!main) return;
    if (loadingOnly || !state.data) { main.innerHTML = ""; main.appendChild(el("div", { class: "loading", text: t("loading") })); return; }
    var d = state.data;
    main.innerHTML = "";
    if (d.error) { main.appendChild(el("div", { class: "loading", text: d.error })); return; }
    document.title = d.client.name + " | flii.app " + t("title");
    var cn = document.getElementById("client-name"); if (cn) cn.textContent = d.client.name;
    main.appendChild(el("p", { class: "period", text: fmtDate(d.from, { day: "numeric", month: "long", year: "numeric" }) + " / " + fmtDate(d.to, { day: "numeric", month: "long", year: "numeric" }) }));
    var T0 = d.totals || {}, P0 = d.previous_totals || {}, S = (d.series && d.series.values) || {}, dates = (d.series && d.series.dates) || [];
    if (!d.sources.length) { main.appendChild(el("div", { class: "loading", text: t("noData") })); return; }

    // Website
    if (d.sources.indexOf("ga4") >= 0) {
      var g = T0.ga4 || {}, gp = P0.ga4 || {};
      var maxCh = Math.max.apply(null, (d.channels || []).map(function (c) { return c.sessions; }).concat([1]));
      main.appendChild(section(t("website"), d.updated.ga4, [
        el("div", { class: "kpis" }, [
          kpi(t("sessions"), num(g.sessions), g.sessions, gp.sessions, "up"),
          kpi(t("users"), num(g.users), g.users, gp.users, "up"),
          kpi(t("keyEvents"), num(g.key_events), g.key_events, gp.key_events, "up"),
          kpi(t("engagement"), pct(g.engagement_rate), g.engagement_rate, gp.engagement_rate, "up"),
        ]),
        el("div", { class: "card" }, [el("div", { class: "chart-legend" }, [el("span", null, [el("i"), t("sessions") + " " + t("perDay")])]), chart(dates, (S.ga4 && S.ga4.sessions) || dates.map(function () { return 0; }), shortNum)]),
        el("div", { class: "card" }, [el("div", { class: "sec-head" }, [el("h2", { text: t("channels") })]), table([
          { label: t("channel"), name: 1, get: function (r) { return r.name; } },
          { label: t("sessions"), n: 1, get: function (r) { return num(r.sessions); } },
          { label: "", get: function (r) { var b = el("div", { class: "bar" }); b.style.width = Math.max(2, (r.sessions / maxCh) * 120) + "px"; return b; } },
          { label: t("users"), n: 1, get: function (r) { return num(r.users); } },
          { label: t("conversions"), n: 1, get: function (r) { return num(r.key_events); } },
        ], d.channels || [])]),
      ]));
    }

    // Advertising (all platforms together)
    var adSrc = d.sources.filter(function (s) { return ADS.indexOf(s) >= 0; });
    if (adSrc.length) {
      var sum = function (src, k) { return adSrc.reduce(function (a, s) { return a + (((src[s] || {})[k]) || 0); }, 0); };
      var cost = sum(T0, "cost"), pcost = sum(P0, "cost"), clicks = sum(T0, "clicks"), pclicks = sum(P0, "clicks"), conv = sum(T0, "conversions"), pconv = sum(P0, "conversions");
      var costSeries = dates.map(function (_, i) { return adSrc.reduce(function (a, s) { return a + (((S[s] || {}).cost || [])[i] || 0); }, 0); });
      var upd = adSrc.map(function (s) { return d.updated[s]; }).filter(Boolean).sort()[0];
      main.appendChild(section(t("ads"), upd, [
        el("div", { class: "kpis" }, [
          kpi(t("cost"), eur(cost), cost, pcost, null),
          kpi(t("clicks"), num(clicks), clicks, pclicks, "up"),
          kpi(t("conversions"), num(conv, conv % 1 ? 1 : 0), conv, pconv, "up"),
          kpi(t("cpa"), conv ? eur(cost / conv) : "-", conv ? cost / conv : 0, pconv ? pcost / pconv : 0, "down"),
        ]),
        el("div", { class: "card" }, [el("div", { class: "chart-legend" }, [el("span", null, [el("i"), t("cost") + " " + t("perDay")])]), chart(dates, costSeries.map(function (v) { return Math.round(v * 100) / 100; }), shortEur)]),
        el("div", { class: "card" }, [el("div", { class: "sec-head" }, [el("h2", { text: t("platforms") })]), table([
          { label: t("platform"), name: 1, get: function (s) { return PLATFORM[s] || s; } },
          { label: t("cost"), n: 1, get: function (s) { return eur((T0[s] || {}).cost); } },
          { label: t("impressions"), n: 1, get: function (s) { return num((T0[s] || {}).impressions); } },
          { label: t("clicks"), n: 1, get: function (s) { return num((T0[s] || {}).clicks); } },
          { label: t("ctr"), n: 1, get: function (s) { return pct((T0[s] || {}).ctr); } },
          { label: t("cpc"), n: 1, get: function (s) { return eur((T0[s] || {}).cpc); } },
          { label: t("conversions"), n: 1, get: function (s) { return num((T0[s] || {}).conversions, 1); } },
          { label: t("cpa"), n: 1, get: function (s) { var x = T0[s] || {}; return x.conversions ? eur(x.cost / x.conversions) : "-"; } },
        ], adSrc.filter(function (s) { return T0[s]; }))]),
        el("div", { class: "card" }, [el("div", { class: "sec-head" }, [el("h2", { text: t("campaigns") })]), table([
          { label: t("campaign"), name: 1, get: function (r) { return el("div", null, [el("div", { text: r.name || r.id }), el("span", { class: "tag", text: PLATFORM[r.source] || r.source })]); } },
          { label: t("cost"), n: 1, get: function (r) { return eur(r.cost); } },
          { label: t("impressions"), n: 1, get: function (r) { return num(r.impressions); } },
          { label: t("clicks"), n: 1, get: function (r) { return num(r.clicks); } },
          { label: t("ctr"), n: 1, get: function (r) { return pct(r.impressions ? r.clicks / r.impressions : 0); } },
          { label: t("conversions"), n: 1, get: function (r) { return num(r.conversions, 1); } },
          { label: t("cpa"), n: 1, get: function (r) { return r.conversions ? eur(r.cost / r.conversions) : "-"; } },
        ], (d.campaigns || []).filter(function (c) { return c.cost > 0 || c.clicks > 0; }))]),
      ]));
    }

    // Search Console
    if (d.sources.indexOf("gsc") >= 0) {
      var s = T0.gsc || {}, sp = P0.gsc || {};
      main.appendChild(section(t("search"), d.updated.gsc, [
        el("div", { class: "kpis" }, [
          kpi(t("clicks"), num(s.clicks), s.clicks, sp.clicks, "up"),
          kpi(t("impressions"), num(s.impressions), s.impressions, sp.impressions, "up"),
          kpi(t("ctr"), pct(s.ctr), s.ctr, sp.ctr, "up"),
          kpi(t("position"), num(s.position, 1), s.position, sp.position, "down"),
        ]),
        el("div", { class: "two" }, [
          el("div", { class: "card" }, [el("div", { class: "chart-legend" }, [el("span", null, [el("i"), t("clicks") + " " + t("perDay")])]), chart(dates, (S.gsc && S.gsc.clicks) || dates.map(function () { return 0; }), shortNum)]),
          el("div", { class: "card" }, [el("div", { class: "sec-head" }, [el("h2", { text: t("queries") })]), table([
            { label: t("query"), name: 1, get: function (r) { return r.name; } },
            { label: t("clicks"), n: 1, get: function (r) { return num(r.clicks); } },
            { label: t("impressions"), n: 1, get: function (r) { return num(r.impressions); } },
            { label: t("position"), n: 1, get: function (r) { return num(r.position, 1); } },
          ], (d.queries || []).slice(0, 10))]),
        ]),
      ]));
    }

    // YouTube
    if (d.sources.indexOf("youtube") >= 0) {
      var y = T0.youtube || {}, yp = P0.youtube || {};
      var net = (y.subscribers_gained || 0) - (y.subscribers_lost || 0), pnet = (yp.subscribers_gained || 0) - (yp.subscribers_lost || 0);
      main.appendChild(section(t("youtube"), d.updated.youtube, [
        el("div", { class: "kpis" }, [
          kpi(t("views"), num(y.views), y.views, yp.views, "up"),
          kpi(t("watch"), num(y.watch_minutes), y.watch_minutes, yp.watch_minutes, "up"),
          kpi(t("subs"), (net > 0 ? "+" : "") + num(net), net, pnet, "up"),
          kpi(t("likes"), num(y.likes), y.likes, yp.likes, "up"),
        ]),
        el("div", { class: "card" }, [el("div", { class: "chart-legend" }, [el("span", null, [el("i"), t("views") + " " + t("perDay")])]), chart(dates, (S.youtube && S.youtube.views) || dates.map(function () { return 0; }), shortNum)]),
      ]));
    }
  }

  // ---------- boot ----------
  document.documentElement.lang = lang;
  state.session = loadSession();
  if (state.session && state.session.role === "client" && slug && state.session.client !== slug) state.session = null;
  if (state.session) start(); else renderGate();
})();
