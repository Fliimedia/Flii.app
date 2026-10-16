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
      website: "Website", ads: "Advertenties", search: "Zoeken in Google", youtube: "YouTube", facebook: "Facebook", instagram: "Instagram",
      fbViews: "Weergaven", fbEng: "Interacties", pageViews: "Paginabezoeken", newFollowers: "Nieuwe volgers", profileViews: "Profielbezoeken",
      sessions: "Sessies", users: "Gebruikers", keyEvents: "Conversies (key events)", engagement: "Betrokkenheid",
      cost: "Kosten", clicks: "Klikken", conversions: "Conversies", cpa: "Kosten per conversie", impressions: "Vertoningen",
      ctr: "CTR", cpc: "Kosten per klik", position: "Gem. positie", views: "Weergaven", watch: "Kijkminuten", subs: "Abonnees netto", likes: "Likes",
      platform: "Platform", campaign: "Campagne", channel: "Kanaal", query: "Zoekterm", none: "Geen gegevens in deze periode.",
      perDay: "per dag", noData: "Er zijn nog geen bronnen gekoppeld aan dit dashboard.", notFound: "Dit dashboard bestaat niet.",
      platforms: "Per platform", campaigns: "Campagnes", channels: "Verkeer per kanaal", queries: "Belangrijkste zoektermen",
      prelim: "Cijfers van de laatste 2 dagen zijn voorlopig.",
      channelsLbl: "Gekoppelde kanalen", toggleHint: "Tik op een kanaal om erop te filteren", connected: "gekoppeld", hiddenLbl: "gefilterd",
      custom: "Periode kiezen", from: "Van", to: "Tot en met", apply: "Toepassen", badRange: "Kies een geldige periode van maximaal 400 dagen.",
      allHidden: "Alle kanalen zijn verborgen. Tik hierboven op een kanaal om het te tonen.", chartHint: "Tik op een cijfer om de grafiek te wisselen",
    },
    en: {
      title: "Dashboard", sub: "Sign in with your username and PIN.", user: "Username", pin: "PIN", login: "Sign in",
      bad: "Username or PIN is incorrect.", fail: "Sign in is not available right now. Please try again shortly.", logout: "Sign out",
      d7: "7 days", d28: "28 days", d90: "90 days", mtd: "This month", lm: "Last month",
      live: "active now", vs: "vs previous period", updated: "updated", loading: "Loading data",
      website: "Website", ads: "Advertising", search: "Google Search", youtube: "YouTube", facebook: "Facebook", instagram: "Instagram",
      fbViews: "Views", fbEng: "Interactions", pageViews: "Page visits", newFollowers: "New followers", profileViews: "Profile visits",
      sessions: "Sessions", users: "Users", keyEvents: "Conversions (key events)", engagement: "Engagement rate",
      cost: "Spend", clicks: "Clicks", conversions: "Conversions", cpa: "Cost per conversion", impressions: "Impressions",
      ctr: "CTR", cpc: "Cost per click", position: "Avg. position", views: "Views", watch: "Watch minutes", subs: "Net subscribers", likes: "Likes",
      platform: "Platform", campaign: "Campaign", channel: "Channel", query: "Query", none: "No data in this period.",
      perDay: "per day", noData: "No sources are connected to this dashboard yet.", notFound: "This dashboard does not exist.",
      platforms: "By platform", campaigns: "Campaigns", channels: "Traffic by channel", queries: "Top search queries",
      prelim: "Figures for the last 2 days are preliminary.",
      channelsLbl: "Connected channels", toggleHint: "Tap a channel to filter on it", connected: "connected", hiddenLbl: "filtered",
      custom: "Pick dates", from: "From", to: "To", apply: "Apply", badRange: "Pick a valid range of up to 400 days.",
      allHidden: "All channels are hidden. Tap a channel above to show it.", chartHint: "Tap a figure to switch the chart",
    },
  };
  var PLATFORM = { google_ads: "Google Ads", microsoft_ads: "Microsoft Ads", chatgpt_ads: "ChatGPT Ads", meta_ads: "Meta Ads", linkedin_ads: "LinkedIn Ads" };
  var SOURCE_NAME = { ga4: "Google Analytics", gsc: "Search Console", youtube: "YouTube", facebook: "Facebook", instagram: "Instagram", google_ads: "Google Ads", microsoft_ads: "Microsoft Ads", chatgpt_ads: "ChatGPT Ads", meta_ads: "Meta Ads", linkedin_ads: "LinkedIn Ads" };
  var SOURCE_ORDER = ["ga4", "google_ads", "microsoft_ads", "chatgpt_ads", "meta_ads", "linkedin_ads", "gsc", "facebook", "instagram", "youtube"];
  var ADS = ["google_ads", "microsoft_ads", "chatgpt_ads", "meta_ads", "linkedin_ads"];

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  var lang = store(LANGKEY) || ((navigator.language || "nl").toLowerCase().indexOf("nl") === 0 ? "nl" : "en");
  function t(k) { return (T[lang] && T[lang][k]) || T.nl[k] || k; }
  var loc = function () { return lang === "nl" ? "nl-NL" : "en-GB"; };

  var state = { session: null, range: "d28", custom: null, data: null, clients: [], timer: null, liveTimer: null, hidden: [], metric: {} };
  // Channel filter: empty means every channel is shown; otherwise only the picked ones.
  var ONLYKEY = "flii-dash-only-" + slug;
  try { state.only = JSON.parse(store(ONLYKEY) || "[]") || []; } catch (e) { state.only = []; }

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
    else if (r === "custom" && state.custom) return state.custom;
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
      state.live = typeof j.active_users_30m === "number" ? j.active_users_30m : null;
      paintLive();
    }).catch(function () {});
  }

  function paintLive() {
    var p = document.getElementById("live");
    if (!p) return;
    if (state.live == null) { p.hidden = true; return; }
    p.hidden = false; p.querySelector("b").textContent = num(state.live);
  }

  function renderShell() {
    var root = document.getElementById("app");
    root.innerHTML = "";
    var name = (state.data && state.data.client && state.data.client.name) || slug;
    var clientCtl;
    if (state.session.role === "admin" && state.clients.length) {
      clientCtl = clientMenu(name);
    } else clientCtl = el("span", { class: "client", id: "client-name", text: name });

    var seg = el("div", { class: "seg", role: "group" }, ["d7", "d28", "d90", "mtd", "lm"].map(function (k) {
      return el("button", { type: "button", "aria-pressed": String(state.range === k), text: t(k), onclick: function () { state.range = k; renderShell(); renderBody(true); load(); } });
    }));
    var cal = datePicker();
    var live = el("span", { class: "live-pill", id: "live", hidden: "" }, [el("span", { class: "dot live" }), el("b", { text: "0" }), " " + t("live")]);
    var langBtn = el("button", { class: "ghost", type: "button", text: lang === "nl" ? "EN" : "NL", onclick: function () { lang = lang === "nl" ? "en" : "nl"; store(LANGKEY, lang); document.documentElement.lang = lang; renderShell(); renderBody(); loadLive(); } });
    var out = el("button", { class: "ghost", type: "button", text: t("logout"), onclick: logout });

    root.appendChild(el("header", { class: "top" }, [el("div", { class: "top-in" }, [
      brand(), el("span", { class: "sep" }), clientCtl, el("span", { class: "spacer" }), live,
      el("div", { class: "ctrl" }, [seg, cal, langBtn, out]),
    ])]));
    root.appendChild(el("main", { id: "main" }, [el("div", { class: "loading", text: t("loading") })]));
    var f = el("footer", null, [el("div", { text: t("prelim") })]);
    var built = el("div", { class: "built" }, [el("span", { class: "shine", text: "built by" }), brand()]);
    f.appendChild(el("div", null, [built]));
    root.appendChild(f);
    paintLive();
  }

  var CHEVRON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  // Client switcher for admins, styled like the rest of the page.
  function clientMenu(name) {
    var wrap = el("div", { class: "cm" });
    var btn = el("button", { type: "button", class: "cm-btn", "aria-haspopup": "listbox", "aria-expanded": "false" }, [el("span", { class: "client", id: "client-name", text: name })]);
    btn.insertAdjacentHTML("beforeend", CHEVRON);
    var list = el("div", { class: "cm-pop", role: "listbox", "aria-label": "Client", hidden: "" }, state.clients.map(function (c) {
      var cur = c.slug === slug;
      return el("a", { class: "cm-item" + (cur ? " on" : ""), role: "option", "aria-selected": String(cur), href: "/" + c.slug + "/dashboard/" }, [el("span", { class: "cm-dot" }), c.name]);
    }));
    function close(e) { if (!e || !wrap.contains(e.target)) { list.hidden = true; btn.setAttribute("aria-expanded", "false"); document.removeEventListener("click", close); document.removeEventListener("keydown", esc); } }
    function esc(e) { if (e.key === "Escape") { close(); btn.focus(); } }
    btn.addEventListener("click", function () {
      var open = list.hidden;
      list.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      if (open) {
        var on = list.querySelector(".on"); if (on) on.scrollIntoView({ block: "nearest" });
        setTimeout(function () { document.addEventListener("click", close); document.addEventListener("keydown", esc); }, 0);
      } else close();
    });
    wrap.appendChild(btn); wrap.appendChild(list);
    return wrap;
  }

  var CAL_ICON ='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';

  function datePicker() {
    var wrap = el("div", { class: "cal" });
    var active = state.range === "custom" && state.custom;
    var btn = el("button", { type: "button", class: "ghost cal-btn" + (active ? " on" : ""), "aria-haspopup": "dialog", "aria-expanded": "false", "aria-label": t("custom"), title: t("custom") });
    btn.innerHTML = CAL_ICON;
    if (active) btn.appendChild(el("span", { text: fmtDate(state.custom.from) + " / " + fmtDate(state.custom.to) }));
    var r = rangeDates(state.range);
    var today = iso(new Date());
    var sel = { from: r.from, to: r.to };
    var f = el("input", { type: "date", value: r.from, max: today });
    var tt = el("input", { type: "date", value: r.to, max: today });
    var err = el("p", { class: "err" });
    // Month view(s): first tap sets the start, second tap the end.
    var view = new Date(r.to + "T00:00:00"); view.setDate(1);
    var months = el("div", { class: "cal-months" });
    function two() { return window.innerWidth >= 720; }
    function monthGrid(y, m) {
      var first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      var title = first.toLocaleDateString(loc(), { month: "long", year: "numeric" });
      var wd = []; for (var i = 0; i < 7; i++) wd.push(el("span", { class: "cal-wd", text: new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: "narrow" }) }));
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
      return el("div", { class: "cal-month" }, [el("div", { class: "cal-title", text: title }), el("div", { class: "cal-grid" }, wd.concat(cells))]);
    }
    function paintCal() {
      months.innerHTML = "";
      var base = new Date(view);
      if (two()) { var prev = new Date(base); prev.setMonth(prev.getMonth() - 1); months.appendChild(monthGrid(prev.getFullYear(), prev.getMonth())); }
      months.appendChild(monthGrid(base.getFullYear(), base.getMonth()));
      f.value = sel.from || ""; tt.value = sel.to || "";
      nextBtn.disabled = iso(new Date(view.getFullYear(), view.getMonth() + 1, 1)) > today;
    }
    function pickDay(ds) {
      err.textContent = "";
      if (!sel.from || sel.to) { sel = { from: ds, to: null }; }
      else if (ds < sel.from) { sel = { from: ds, to: sel.from }; }
      else sel.to = ds;
      paintCal();
    }
    function shiftMonth(n) { view.setMonth(view.getMonth() + n); paintCal(); }
    var prevBtn = el("button", { type: "button", class: "cal-nav", "aria-label": "<", onclick: function () { shiftMonth(-1); } });
    var nextBtn = el("button", { type: "button", class: "cal-nav", "aria-label": ">", onclick: function () { shiftMonth(1); } });
    prevBtn.innerHTML = CHEVRON; nextBtn.innerHTML = CHEVRON;
    f.addEventListener("change", function () { if (f.value) { sel.from = f.value; if (sel.to && sel.to < sel.from) sel.to = null; view = new Date(f.value + "T00:00:00"); view.setDate(1); paintCal(); } });
    tt.addEventListener("change", function () { if (tt.value) { sel.to = tt.value; if (sel.from && sel.from > sel.to) sel.from = sel.to; view = new Date(tt.value + "T00:00:00"); view.setDate(1); paintCal(); } });
    var pop = el("div", { class: "cal-pop", role: "dialog", "aria-label": t("custom"), hidden: "" }, [
      el("div", { class: "cal-fields" }, [
        el("label", { class: "field" }, [el("span", { text: t("from") }), f]),
        el("label", { class: "field" }, [el("span", { text: t("to") }), tt]),
      ]),
      el("div", { class: "cal-body" }, [prevBtn, months, nextBtn]),
      el("button", { class: "btn block", type: "button", text: t("apply"), onclick: function () {
        var a = sel.from, b = sel.to || sel.from;
        var days = (Date.parse(b) - Date.parse(a)) / 86400000;
        if (!a || !b || !(days >= 0) || days > 399 || b > today) { err.textContent = t("badRange"); return; }
        state.custom = { from: a, to: b }; state.range = "custom"; renderShell(); renderBody(true); load();
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

  function delta(cur, prev, good) {
    if (!prev) return el("div", { class: "delta", text: " " });
    var ch = (cur - prev) / prev;
    var cls = "delta";
    if (good && Math.abs(ch) >= 0.005) cls += (ch > 0) === (good === "up") ? " up" : " down";
    var sign = ch > 0 ? "+" : "";
    return el("div", { class: cls, title: t("vs"), text: sign + pct(ch) + " " + t("vs").split(" ")[0] });
  }
  function kpi(label, value, cur, prev, good, onSelect, selected, color) {
    var attrs = { class: "kpi" + (onSelect ? " pick" : "") + (selected ? " on" : "") };
    if (onSelect) { attrs.type = "button"; attrs["aria-pressed"] = String(!!selected); attrs.onclick = onSelect; }
    var node = el(onSelect ? "button" : "div", attrs, [el("div", { class: "lbl" }, [el("i", { class: "sw" }), label]), el("div", { class: "val", text: value }), delta(cur, prev, good)]);
    if (color) node.style.setProperty("--c", color);
    return node;
  }

  function section(title, updated, kids) {
    var head = el("div", { class: "sec-head" }, [el("h2", null, [el("span", { class: "dot" }), title])]);
    if (updated) head.appendChild(el("span", { class: "meta", text: t("updated") + " " + fmtTime(updated) }));
    return el("section", { class: "section" }, [head].concat(kids));
  }

  // Charts draw at the real container width so text never stretches.
  // One or more series. With several, each line gets its own scale so different units stay readable.
  function chart(dates, series) {
    var box = el("div", { class: "chart-box" });
    var tip = null;
    var multi = series.length > 1;
    function niceTop(vals) { var max = Math.max.apply(null, vals.concat([0])) || 1; var step = Math.pow(10, Math.floor(Math.log10(max))); return Math.ceil(max / step) * step; }
    function draw() {
      var W = Math.max(260, box.clientWidth || 600), H = 180, P = { l: multi ? 8 : 44, r: multi ? 8 : 10, t: 10, b: 22 };
      var x = function (i) { return P.l + (dates.length > 1 ? (i * (W - P.l - P.r)) / (dates.length - 1) : (W - P.l - P.r) / 2); };
      var yAt = function (v, top) { return P.t + (H - P.t - P.b) * (1 - v / top); };
      var tops = series.map(function (s) { return niceTop(s.values); });
      var top = tops[0], format = series[0].fmt;
      var y = function (v) { return yAt(v, top); };
      var svg = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img">';
      [0, 0.5, 1].forEach(function (f) { var yy = y(top * f); svg += '<line class="grid" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '"/>' + (multi ? "" : '<text class="axis" x="' + (P.l - 6) + '" y="' + (yy + 3) + '" text-anchor="end">' + format(top * f, true) + "</text>"); });
      var ticks = Math.min(W < 420 ? 3 : 6, dates.length);
      for (var k = 0; k < ticks; k++) {
        var i = Math.round((k * (dates.length - 1)) / Math.max(1, ticks - 1));
        var anchor = k === 0 ? "start" : k === ticks - 1 ? "end" : "middle";
        svg += '<text class="axis" x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="' + anchor + '">' + fmtDate(dates[i]) + "</text>";
      }
      series.forEach(function (s, n) {
        var pts = s.values.map(function (v, i) { return x(i).toFixed(1) + "," + yAt(v, tops[n]).toFixed(1); }).join(" ");
        if (!multi) svg += '<polygon class="area" points="' + x(0) + "," + y(0) + " " + pts + " " + x(dates.length - 1) + "," + y(0) + '"/>';
        svg += '<polyline class="line' + (s.dash ? " dash" : "") + '" style="stroke:' + s.color + '" points="' + pts + '"/>';
      });
      svg += '<rect class="hit" x="0" y="0" width="' + W + '" height="' + H + '"/></svg>';
      box.innerHTML = svg;
      var node = box.firstChild;
      function move(ev) {
        var p = ev.touches ? ev.touches[0] : ev, b = node.getBoundingClientRect();
        var rel = ((p.clientX - b.left) / b.width) * W;
        var i = Math.max(0, Math.min(dates.length - 1, Math.round(((rel - P.l) / (W - P.l - P.r)) * (dates.length - 1))));
        if (!tip) { tip = el("div", { class: "tip" }); document.body.appendChild(tip); }
        tip.innerHTML = "";
        tip.appendChild(el("div", { class: "tip-d", text: fmtDate(dates[i], { weekday: "short", day: "numeric", month: "short" }) }));
        series.forEach(function (s) { var r = el("div", { class: "tip-r" }, [el("i", { class: "sw" }), (multi ? s.label + "  " : "") + s.fmt(s.values[i])]); r.style.setProperty("--c", s.color); tip.appendChild(r); });
        tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 8, p.clientX + 12) + "px"; tip.style.top = (p.clientY - tip.offsetHeight - 10) + "px";
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

  // ---------- channel filter ----------
  function isShown(src) { return !state.only.length || state.only.indexOf(src) >= 0; }
  function toggleSource(src) {
    var i = state.only.indexOf(src);
    if (i >= 0) state.only.splice(i, 1); else state.only.push(src);
    store(ONLYKEY, JSON.stringify(state.only));
    renderBody();
  }
  function channelBar(d) {
    var list = SOURCE_ORDER.filter(function (s) { return d.sources.indexOf(s) >= 0; });
    var chips = list.map(function (s) {
      var on = state.only.indexOf(s) >= 0;
      var tip = SOURCE_NAME[s] + ": " + t("connected") + (d.updated[s] ? ", " + t("updated") + " " + fmtTime(d.updated[s]) : "") + (on ? " (" + t("hiddenLbl") + ")" : "");
      return el("button", { type: "button", class: "chip" + (on ? " on" : ""), "aria-pressed": String(on), title: tip, onclick: function () { toggleSource(s); } }, [
        el("span", { class: "chip-dot" }), SOURCE_NAME[s],
      ]);
    });
    return el("div", { class: "channels" }, [
      el("div", { class: "channels-head" }, [el("span", { class: "channels-lbl", text: t("channelsLbl") }), el("span", { class: "channels-hint", text: t("toggleHint") })]),
      el("div", { class: "chips" + (list.some(function (s) { return state.only.indexOf(s) >= 0; }) ? " filtering" : "") }, chips),
    ]);
  }

  // ---------- metrics per section ----------
  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function pick(S, src, k, n) { return (S[src] && S[src][k]) || zeros(n); }
  function sumSeries(S, srcs, k, n) {
    var out = zeros(n);
    srcs.forEach(function (s) { var a = pick(S, s, k, n); for (var i = 0; i < n; i++) out[i] += a[i] || 0; });
    return out.map(function (v) { return Math.round(v * 100) / 100; });
  }
  function ratio(a, b) { return a.map(function (v, i) { return b[i] ? v / b[i] : 0; }); }
  function sumTotals(T, srcs, k) { return srcs.reduce(function (a, s) { return a + (((T[s] || {})[k]) || 0); }, 0); }
  function axisPct(v, axis) { return axis ? num(v * 100) + "%" : pct(v); }
  function axisNum1(v) { return num(v, 1); }

  // Scorecards with the metric they chart. "good" says which direction is better.
  function metricsFor(sec, d, adSrc) {
    var T = d.totals || {}, P = d.previous_totals || {}, S = (d.series && d.series.values) || {}, n = (d.series && d.series.dates.length) || 0;
    if (sec === "ga4") {
      var g = T.ga4 || {}, gp = P.ga4 || {};
      return [
        { key: "sessions", label: t("sessions"), cur: g.sessions, prev: gp.sessions, good: "up", val: num(g.sessions), series: pick(S, "ga4", "sessions", n), fmt: shortNum },
        { key: "users", label: t("users"), cur: g.users, prev: gp.users, good: "up", val: num(g.users), series: pick(S, "ga4", "users", n), fmt: shortNum },
        { key: "key_events", label: t("keyEvents"), cur: g.key_events, prev: gp.key_events, good: "up", val: num(g.key_events), series: pick(S, "ga4", "key_events", n), fmt: shortNum },
        { key: "engagement", label: t("engagement"), cur: g.engagement_rate, prev: gp.engagement_rate, good: "up", val: pct(g.engagement_rate), series: ratio(pick(S, "ga4", "engaged_sessions", n), pick(S, "ga4", "sessions", n)), fmt: axisPct },
      ];
    }
    if (sec === "ads") {
      var cost = sumTotals(T, adSrc, "cost"), pcost = sumTotals(P, adSrc, "cost");
      var clicks = sumTotals(T, adSrc, "clicks"), pclicks = sumTotals(P, adSrc, "clicks");
      var conv = sumTotals(T, adSrc, "conversions"), pconv = sumTotals(P, adSrc, "conversions");
      var sCost = sumSeries(S, adSrc, "cost", n), sConv = sumSeries(S, adSrc, "conversions", n);
      return [
        { key: "cost", label: t("cost"), cur: cost, prev: pcost, good: null, val: eur(cost), series: sCost, fmt: shortEur },
        { key: "clicks", label: t("clicks"), cur: clicks, prev: pclicks, good: "up", val: num(clicks), series: sumSeries(S, adSrc, "clicks", n), fmt: shortNum },
        { key: "conversions", label: t("conversions"), cur: conv, prev: pconv, good: "up", val: num(conv, conv % 1 ? 1 : 0), series: sConv, fmt: axisNum1 },
        { key: "cpa", label: t("cpa"), cur: conv ? cost / conv : 0, prev: pconv ? pcost / pconv : 0, good: "down", val: conv ? eur(cost / conv) : "-", series: ratio(sCost, sConv), fmt: shortEur },
      ];
    }
    if (sec === "gsc") {
      var s = T.gsc || {}, sp = P.gsc || {}, cl = pick(S, "gsc", "clicks", n), im = pick(S, "gsc", "impressions", n);
      return [
        { key: "clicks", label: t("clicks"), cur: s.clicks, prev: sp.clicks, good: "up", val: num(s.clicks), series: cl, fmt: shortNum },
        { key: "impressions", label: t("impressions"), cur: s.impressions, prev: sp.impressions, good: "up", val: num(s.impressions), series: im, fmt: shortNum },
        { key: "ctr", label: t("ctr"), cur: s.ctr, prev: sp.ctr, good: "up", val: pct(s.ctr), series: ratio(cl, im), fmt: axisPct },
        { key: "position", label: t("position"), cur: s.position, prev: sp.position, good: "down", val: num(s.position, 1), series: ratio(pick(S, "gsc", "pos_w", n), im), fmt: axisNum1 },
      ];
    }
    if (sec === "facebook") {
      var f = T.facebook || {}, fp = P.facebook || {};
      return [
        { key: "views", label: t("fbViews"), cur: f.views, prev: fp.views, good: "up", val: num(f.views), series: pick(S, "facebook", "views", n), fmt: shortNum },
        { key: "engagements", label: t("fbEng"), cur: f.engagements, prev: fp.engagements, good: "up", val: num(f.engagements), series: pick(S, "facebook", "engagements", n), fmt: shortNum },
        { key: "page_views", label: t("pageViews"), cur: f.page_views, prev: fp.page_views, good: "up", val: num(f.page_views), series: pick(S, "facebook", "page_views", n), fmt: shortNum },
        { key: "new_followers", label: t("newFollowers"), cur: f.new_followers, prev: fp.new_followers, good: "up", val: num(f.new_followers), series: pick(S, "facebook", "new_followers", n), fmt: shortNum },
      ];
    }
    if (sec === "instagram") {
      var g2 = T.instagram || {}, gp2 = P.instagram || {};
      return [
        { key: "views", label: t("fbViews"), cur: g2.views, prev: gp2.views, good: "up", val: num(g2.views), series: pick(S, "instagram", "views", n), fmt: shortNum },
        { key: "total_interactions", label: t("fbEng"), cur: g2.total_interactions, prev: gp2.total_interactions, good: "up", val: num(g2.total_interactions), series: pick(S, "instagram", "total_interactions", n), fmt: shortNum },
        { key: "profile_views", label: t("profileViews"), cur: g2.profile_views, prev: gp2.profile_views, good: "up", val: num(g2.profile_views), series: pick(S, "instagram", "profile_views", n), fmt: shortNum },
        { key: "new_followers", label: t("newFollowers"), cur: g2.new_followers, prev: gp2.new_followers, good: "up", val: num(g2.new_followers), series: pick(S, "instagram", "new_followers", n), fmt: shortNum },
      ];
    }
    if (sec === "youtube") {
      var y = T.youtube || {}, yp = P.youtube || {};
      var net = (y.subscribers_gained || 0) - (y.subscribers_lost || 0), pnet = (yp.subscribers_gained || 0) - (yp.subscribers_lost || 0);
      var gained = pick(S, "youtube", "subscribers_gained", n), lost = pick(S, "youtube", "subscribers_lost", n);
      return [
        { key: "views", label: t("views"), cur: y.views, prev: yp.views, good: "up", val: num(y.views), series: pick(S, "youtube", "views", n), fmt: shortNum },
        { key: "watch", label: t("watch"), cur: y.watch_minutes, prev: yp.watch_minutes, good: "up", val: num(y.watch_minutes), series: pick(S, "youtube", "watch_minutes", n), fmt: shortNum },
        { key: "subs", label: t("subs"), cur: net, prev: pnet, good: "up", val: (net > 0 ? "+" : "") + num(net), series: gained.map(function (v, i) { return v - (lost[i] || 0); }), fmt: shortNum },
        { key: "likes", label: t("likes"), cur: y.likes, prev: yp.likes, good: "up", val: num(y.likes), series: pick(S, "youtube", "likes", n), fmt: shortNum },
      ];
    }
    return [];
  }

  // Scorecards plus one chart; tapping a scorecard switches the chart to that statistic.
  var SERIES_COLORS = ["#E7255A", "#171717", "#8a877f", "#E7255A"];
  function kpiBlock(sec, d, adSrc) {
    var defs = metricsFor(sec, d, adSrc);
    var dates = (d.series && d.series.dates) || [];
    var keys = [].concat(state.metric[sec] || []).filter(function (k) { return defs.some(function (m) { return m.key === k; }); }).slice(0, 1);
    if (!keys.length) keys = [defs[0].key];
    var cards = el("div", { class: "kpis" });
    var legend = el("div", { class: "legend-items" });
    var chartWrap = el("div", { class: "chart-wrap" });
    function color() { return SERIES_COLORS[0]; }
    function toggle(m) {
      keys = [m.key];
      state.metric[sec] = keys.slice();
      paint();
    }
    function paint() {
      var chosen = defs.filter(function (m) { return keys.indexOf(m.key) >= 0; });
      cards.innerHTML = "";
      defs.forEach(function (m) {
        cards.appendChild(kpi(m.label, m.val, m.cur, m.prev, m.good, function () { toggle(m); }, keys.indexOf(m.key) >= 0, color(m)));
      });
      legend.innerHTML = "";
      chosen.forEach(function (m) {
        var it = el("span", { class: "lg" }, [el("i"), m.label + (chosen.length === 1 ? " " + t("perDay") : "")]);
        it.style.setProperty("--c", color(m));
        legend.appendChild(it);
      });
      var h = chartWrap.offsetHeight; if (h) chartWrap.style.minHeight = h + "px";
      chartWrap.innerHTML = "";
      chartWrap.appendChild(chart(dates, chosen.map(function (m) {
        return { label: m.label, color: color(m), dash: false, fmt: m.fmt, values: m.series.map(function (v) { return Math.round(v * 10000) / 10000; }) };
      })));
    }
    paint();
    return [cards, el("div", { class: "card" }, [el("div", { class: "chart-legend" }, [legend, el("span", { class: "hint", text: t("chartHint") })]), chartWrap])];
  }

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
    if (!d.sources.length) { main.appendChild(el("div", { class: "loading", text: t("noData") })); return; }
    main.appendChild(channelBar(d));

    var T0 = d.totals || {};
    var shown = d.sources.filter(isShown);
    if (!shown.length) shown = d.sources.slice();

    // Website
    if (shown.indexOf("ga4") >= 0) {
      var maxCh = Math.max.apply(null, (d.channels || []).map(function (c) { return c.sessions; }).concat([1]));
      main.appendChild(section(t("website"), d.updated.ga4, kpiBlock("ga4", d).concat([
        el("div", { class: "card" }, [el("div", { class: "sec-head" }, [el("h2", { text: t("channels") })]), table([
          { label: t("channel"), name: 1, get: function (r) { return r.name; } },
          { label: t("sessions"), n: 1, get: function (r) { return num(r.sessions); } },
          { label: "", get: function (r) { var b = el("div", { class: "bar" }); b.style.width = Math.max(2, (r.sessions / maxCh) * 120) + "px"; return b; } },
          { label: t("users"), n: 1, get: function (r) { return num(r.users); } },
          { label: t("conversions"), n: 1, get: function (r) { return num(r.key_events); } },
        ], d.channels || [])]),
      ])));
    }

    // Advertising: only the platforms that are switched on
    var adSrc = shown.filter(function (s) { return ADS.indexOf(s) >= 0; });
    if (adSrc.length) {
      var upd = adSrc.map(function (s) { return d.updated[s]; }).filter(Boolean).sort()[0];
      main.appendChild(section(t("ads"), upd, kpiBlock("ads", d, adSrc).concat([
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
        ], (d.campaigns || []).filter(function (c) { return adSrc.indexOf(c.source) >= 0 && (c.cost > 0 || c.clicks > 0); }))]),
      ])));
    }

    // Search Console
    if (shown.indexOf("gsc") >= 0) {
      main.appendChild(section(t("search"), d.updated.gsc, kpiBlock("gsc", d).concat([
        el("div", { class: "card" }, [el("div", { class: "sec-head" }, [el("h2", { text: t("queries") })]), table([
          { label: t("query"), name: 1, get: function (r) { return r.name; } },
          { label: t("clicks"), n: 1, get: function (r) { return num(r.clicks); } },
          { label: t("impressions"), n: 1, get: function (r) { return num(r.impressions); } },
          { label: t("position"), n: 1, get: function (r) { return num(r.position, 1); } },
        ], (d.queries || []).slice(0, 10))]),
      ])));
    }

    // YouTube
    ["facebook", "instagram"].forEach(function (src) {
      if (shown.indexOf(src) >= 0) main.appendChild(section(t(src), d.updated[src], kpiBlock(src, d)));
    });

    if (shown.indexOf("youtube") >= 0) {
      main.appendChild(section(t("youtube"), d.updated.youtube, kpiBlock("youtube", d)));
    }
  }

  // ---------- boot ----------
  document.documentElement.lang = lang;
  state.session = loadSession();
  if (state.session && state.session.role === "client" && slug && state.session.client !== slug) state.session = null;
  if (state.session) start(); else renderGate();
})();
