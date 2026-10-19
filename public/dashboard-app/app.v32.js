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
      mode: "Weergave", mLight: "Licht", mDark: "Donker", themeDark: "Donkere modus", themeLight: "Lichte modus", season: "Seizoensthema", sAuto: "Automatisch", sOff: "Standaard", sHalloween: "Halloween", sChristmas: "Kerst",
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
      mode: "Display", mLight: "Light", mDark: "Dark", themeDark: "Dark mode", themeLight: "Light mode", season: "Seasonal theme", sAuto: "Automatic", sOff: "Standard", sHalloween: "Halloween", sChristmas: "Christmas",
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

  // ---------- theme: light/dark plus seasonal colours ----------
  var THEMEKEY = "flii-dash-theme", SEASONKEY = "flii-dash-season";
  // One display mode: light, dark, christmas (light background) or halloween.
  var MODEKEY = "flii-dash-mode", MODES = ["light", "dark", "christmas", "halloween"];
  var mode = store(MODEKEY);
  if (MODES.indexOf(mode) < 0) mode = store(THEMEKEY) === "dark" || (!store(THEMEKEY) && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  var theme = mode === "dark" ? "dark" : "light";
  var seasonPick = mode === "christmas" || mode === "halloween" ? mode : "off";
  function autoSeason() {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    if ((m === 10 && day >= 10) || (m === 11 && day === 1)) return "halloween";
    if (m === 12 && day <= 26) return "christmas";
    return "off";
  }
  function applyTheme() {
    var root = document.documentElement;
    theme = mode === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    seasonPick = mode === "christmas" || mode === "halloween" ? mode : "off";
    var season = seasonPick;
    if (season === "off") root.removeAttribute("data-season"); else root.setAttribute("data-season", season);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--paper").trim() || "#ffffff");
    startSeasonFx(season);
  }
  // ---------- seasonal touches: snow and a tree at Christmas, pumpkins at Halloween ----------
  var fxTimer = null, fxSeason = "off";
  var TREE = '<svg viewBox="0 0 24 28" width="18" height="21" aria-hidden="true"><path d="M12 1l1 2.2 2.4.3-1.8 1.6.5 2.4L12 6.3 9.9 7.5l.5-2.4L8.6 3.5 11 3.2z" fill="#e8b923"/><path d="M12 6l6 7h-3l5 6h-3.5l5 6H2.5l5-6H4l5-6H6z" fill="#2E5D3A" stroke="#ffffff" stroke-width=".6"/><rect x="10.5" y="25" width="3" height="3" rx=".5" fill="#6b4226"/><circle cx="10" cy="14" r="1" fill="var(--mag)"/><circle cx="14.5" cy="18" r="1" fill="#e8b923"/><circle cx="9" cy="21.5" r="1" fill="var(--mag)"/><circle cx="16" cy="22.5" r="1" fill="#fff"/></svg>';
  var PUMPKIN = '<svg viewBox="0 0 32 30" width="30" height="28" aria-hidden="true"><path d="M16 6c0-2 1-4 3.5-4.5" stroke="#4a6b1f" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="9.5" cy="18" rx="8" ry="10" fill="#d9590b"/><ellipse cx="22.5" cy="18" rx="8" ry="10" fill="#d9590b"/><ellipse cx="16" cy="18" rx="8.5" ry="11" fill="#f07a1a"/><path d="M9 15l3 3H6zM23 15l3 3h-6z" fill="#2a1a0f"/><path d="M9 22c2 2.5 4 2 5 1l2 2 2-2c1 1 3 1.5 5-1-2 4.5-12 4.5-14 0z" fill="#2a1a0f"/></svg>';
  function reduced() { return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function snowBurst() {
    if (document.hidden) return;
    // Snow starts at the header's bottom edge and falls into the page.
    var hdr = document.querySelector(".top");
    var box = el("div", { class: "fx-snow", "aria-hidden": "true" });
    box.style.top = (hdr ? Math.max(0, hdr.getBoundingClientRect().bottom) : 0) + "px";
    for (var i = 0; i < 34; i++) {
      var f = el("i");
      var size = 9 + Math.random() * 9;
      f.style.cssText = "left:" + (Math.random() * 100) + "%;width:" + size + "px;height:" + size + "px;animation-delay:" + (Math.random() * 3).toFixed(2) + "s;animation-duration:" + (4 + Math.random() * 3).toFixed(2) + "s;--drift:" + Math.round(Math.random() * 40 - 20) + "px";
      box.appendChild(f);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 11000);
  }
  function pumpkinPop() {
    if (document.hidden) return;
    var hdr = document.querySelector(".top");
    if (!hdr) return;
    var top = hdr.querySelector(".fx-layer");
    if (!top) { top = el("div", { class: "fx-layer", "aria-hidden": "true" }); hdr.insertBefore(top, hdr.firstChild); }
    // One pumpkin on the header's bottom edge, right next to the client name.
    var name = hdr.querySelector(".cm-btn") || hdr.querySelector("#client-name");
    var hb = hdr.getBoundingClientRect();
    var x = name ? name.getBoundingClientRect().right - hb.left + 14 : hb.width / 2;
    var pk = el("span", { class: "fx-pumpkin", "aria-hidden": "true" });
    pk.innerHTML = PUMPKIN;
    pk.style.left = Math.min(hb.width - 36, x) + "px";
    top.appendChild(pk);
    setTimeout(function () { pk.remove(); }, 5200);
  }
  var WEB = "<svg viewBox='0 0 140 116' width='140' height='116' aria-hidden='true'><g class='web'><path class='sp' style='animation-delay:1.10s' pathLength='1' d='M70 58L70.0 4.0'/><path class='sp' style='animation-delay:1.22s' pathLength='1' d='M70 58L105.4 22.6'/><path class='sp' style='animation-delay:1.34s' pathLength='1' d='M70 58L126.0 58.0'/><path class='sp' style='animation-delay:1.46s' pathLength='1' d='M70 58L103.9 91.9'/><path class='sp' style='animation-delay:1.58s' pathLength='1' d='M70 58L70.0 110.0'/><path class='sp' style='animation-delay:1.70s' pathLength='1' d='M70 58L34.6 93.4'/><path class='sp' style='animation-delay:1.82s' pathLength='1' d='M70 58L16.0 58.0'/><path class='sp' style='animation-delay:1.94s' pathLength='1' d='M70 58L36.1 24.1'/><path class='rg' style='animation-delay:2.20s' pathLength='1' d='M70.0 46.1 77.8 50.2 82.3 58.0 77.5 65.5 70.0 69.4 62.2 65.8 58.1 58.0 62.5 50.5Z'/><path class='rg' style='animation-delay:2.65s' pathLength='1' d='M70.0 35.3 84.8 43.2 93.5 58.0 84.3 72.3 70.0 79.8 55.2 72.8 47.3 58.0 55.7 43.7Z'/><path class='rg' style='animation-delay:3.10s' pathLength='1' d='M70.0 24.5 91.9 36.1 104.7 58.0 91.0 79.0 70.0 90.2 48.1 79.9 36.5 58.0 49.0 37.0Z'/><path class='rg' style='animation-delay:3.55s' pathLength='1' d='M70.0 13.7 99.0 29.0 115.9 58.0 97.8 85.8 70.0 100.6 41.0 87.0 25.7 58.0 42.2 30.2Z'/></g><line class='thread' x1='70' y1='0' x2='70' y2='58' pathLength='1'/><g class='spider'><circle class='hitzone' cx='0' cy='1' r='15'/><g class='legs'><path d='M-3 -2l-7-5-3 3M-3 0l-8-1-3 4M-3 2l-7 4-2 4M-2 3l-5 7M3 -2l7-5 3 3M3 0l8-1 3 4M3 2l7 4 2 4M2 3l5 7'/></g><ellipse cx='0' cy='4' rx='4.2' ry='5'/><circle cx='0' cy='-3.5' r='2.8'/><circle cx='-1' cy='-4' r='.6' class='eye'/><circle cx='1' cy='-4' r='.6' class='eye'/></g></svg>";
  // A spider lowers itself just under the header and spins a web, then climbs away.
  function spiderWeb() {
    if (document.hidden) return;
    var hdr = document.querySelector(".top");
    if (!hdr) return;
    var w = el("div", { class: "fx-spider", "aria-hidden": "true" });
    w.innerHTML = WEB;
    spiderOn = w;
    w.querySelector(".spider").addEventListener("click", function (ev) { ev.stopPropagation(); sweepSpider(w); });
    var hw = hdr.getBoundingClientRect().width;
    w.style.left = Math.round(Math.max(8, Math.min(hw - 148, hw * (0.55 + Math.random() * 0.3)))) + "px";
    hdr.appendChild(w);
    setTimeout(function () { if (!w.classList.contains("swept")) { w.remove(); if (spiderOn === w) spiderOn = null; } }, 12600);
  }
  var spiderOn = null, spiderTimer = null;
  // Tapping the spider: a broom sweeps in from the right and knocks it off the screen.
  var BROOM = '<svg viewBox="0 0 120 60" width="120" height="60" aria-hidden="true"><rect x="38" y="27" width="80" height="5" rx="2.5" fill="#7a4a24"/><path d="M40 22l-4-2h-4v20h4l4-2z" fill="#5b3a1e"/><path d="M32 20C20 18 8 14 2 10l3 9-4 3 4 4-4 4 4 4-3 9c6-4 18-8 30-10z" fill="#d9a441"/><path d="M30 22L6 16M30 26L4 24M30 30L4 32M30 34L6 40M30 38L8 46" stroke="#a87a26" stroke-width="1"/><path d="M33 20v20" stroke="#8a3a12" stroke-width="2.4"/></svg>';
  function sweepSpider(w) {
    if (w.classList.contains("swept")) return;
    var hdr = document.querySelector(".top"), sp = w.querySelector(".spider");
    var sr = sp.getBoundingClientRect(), hr = hdr.getBoundingClientRect();
    var cs = getComputedStyle(sp).transform;
    w.classList.add("swept");
    sp.style.transform = cs === "none" ? "" : cs;
    // Broom comes in from the top right corner, wipes the spider and goes back to that corner.
    var br = el("div", { class: "fx-broom", "aria-hidden": "true" });
    br.innerHTML = BROOM;
    document.body.appendChild(br);
    var W = window.innerWidth, px = sr.left + sr.width / 2, py = sr.top + sr.height / 2;
    var at = function (x, y, r) { return { transform: "translate(" + (x - 15) + "px," + (y - 30) + "px) rotate(" + r + "deg)" }; };
    br.animate([
      at(W + 30, -40, -35),
      Object.assign(at(px + 55, py - 18, -8), { offset: 0.38 }),
      Object.assign(at(px - 45, py + 6, 22), { offset: 0.58 }),
      at(W + 30, -40, -35)
    ], { duration: 1100, easing: "ease-in-out", fill: "forwards" });
    setTimeout(function () { w.classList.add("flying"); }, 520);
    setTimeout(function () { br.remove(); w.remove(); if (spiderOn === w) spiderOn = null; }, 1200);
  }
  // Christmas: tapping an empty spot throws a snowball at the screen.
  var SPLAT = '<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="#fff" d="M60 24c7 0 9 9 15 9s10-6 16-2 1 11 5 16 13 4 13 11-9 8-10 14 6 12 1 17-12-1-17 3-5 13-13 13-8-9-14-10-11 7-16 2 0-11-4-15-14-3-15-10 8-8 9-14-7-10-3-16 11 0 15-4 1-12 7-15 9 5 14 4 4-13 12-13z"/><circle cx="18" cy="38" r="5" fill="#fff"/><circle cx="104" cy="30" r="4" fill="#fff"/><circle cx="108" cy="92" r="6" fill="#fff"/><circle cx="22" cy="96" r="4" fill="#fff"/><circle cx="62" cy="110" r="3.5" fill="#fff"/><circle cx="58" cy="8" r="3" fill="#fff"/><circle cx="48" cy="52" r="7" fill="#eef4f8"/><circle cx="72" cy="66" r="5" fill="#eef4f8"/></svg>';
  // Snowballs and the elf only work after tapping the Christmas tree by the logo; off by default.
  var elfClicks = 0, elfOn = null, snowGame = false, elfKills = 0;
  // Three difficulty levels: every elf you knock out makes the next one faster (max level 3).
  function elfSpeed(out) { var lvl = Math.min(elfKills, 2); return (out ? [320, 420, 540] : [230, 340, 460])[lvl]; }
  function toggleSnowGame() {
    snowGame = !snowGame;
    elfClicks = 0;
    if (!snowGame && elfOn) { elfOn.dead = true; elfOn.el.remove(); elfOn = null; }
    var b = document.querySelector(".top .season-badge");
    if (b) { b.classList.toggle("on", snowGame); b.setAttribute("aria-pressed", String(snowGame)); }
  }
  // Elf: runs in, hangs around for 5 seconds as a target, then runs off.
  var ELF = '<svg viewBox="0 0 44 60" width="44" height="60" aria-hidden="true"><g class="leg l1"><path d="M18 42v10" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M18 42v10" stroke="#B22222" stroke-width="4" stroke-dasharray="2 2" stroke-linecap="butt"/><path d="M15 53h6.5c2 0 3-1.5 4-3" stroke="#2b1a10" stroke-width="3" fill="none" stroke-linecap="round"/></g><g class="leg l2"><path d="M26 42v10" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M26 42v10" stroke="#B22222" stroke-width="4" stroke-dasharray="2 2" stroke-linecap="butt"/><path d="M23 53h6.5c2 0 3-1.5 4-3" stroke="#2b1a10" stroke-width="3" fill="none" stroke-linecap="round"/></g><path d="M13 27h18l3 16H10z" fill="#2E5D3A"/><path d="M10 43l3-3 3 3 3-3 3 3 3-3 3 3 3-3 3 3z" fill="#2E5D3A"/><rect x="12" y="33" width="20" height="3" fill="#2b1a10"/><rect x="20" y="33" width="4" height="3" fill="#e8b923"/><path d="M13 28l-5 9M31 28l5 9" stroke="#2E5D3A" stroke-width="3.4" stroke-linecap="round"/><circle cx="8" cy="37.5" r="2" fill="#f5cfb4"/><circle cx="36" cy="37.5" r="2" fill="#f5cfb4"/><path d="M12.5 17l-5-3 5.6 6zM31.5 17l5-3-5.6 6z" fill="#f5cfb4"/><circle cx="22" cy="19" r="8" fill="#f5cfb4"/><g class="eyes"><circle cx="19" cy="18.5" r="1" fill="#2b1a10"/><circle cx="25" cy="18.5" r="1" fill="#2b1a10"/></g><g class="xeyes" stroke="#2b1a10" stroke-width=".9" stroke-linecap="round"><path d="M17.8 17.3l2.4 2.4M20.2 17.3l-2.4 2.4M23.8 17.3l2.4 2.4M26.2 17.3l-2.4 2.4"/></g><circle cx="17.3" cy="21.5" r="1.3" fill="#ec9c8f" opacity=".7"/><circle cx="26.7" cy="21.5" r="1.3" fill="#ec9c8f" opacity=".7"/><path d="M19.5 22.5q2.5 2 5 0" stroke="#2b1a10" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M13.5 13.5Q16 3 24 2.5q6.5-.3 10 5.5l-3 1.5q-2-3-4.5-2.5L31 13.5z" fill="#2E5D3A"/><rect x="13" y="12" width="18.5" height="3.2" rx="1.6" fill="#fff"/><circle cx="34.5" cy="8.4" r="2.2" fill="#fff"/></svg>';
  // The elf only ever moves through empty space: the page is split into a grid, every cell that
  // would put him over content (scorecards, graphs, tables, chips, headings, header) is blocked,
  // and he follows paths through free cells only.
  var ELF_BLOCK = ".top,.kpi,.card,.chips .chip,.sec-head > *,.channels-head > *,footer > *,.loading,.empty";
  var GC = 16, EHW = 26, EHH = 34;
  function elfGrid() {
    var W = window.innerWidth, H = window.innerHeight;
    var obs = Array.prototype.map.call(document.querySelectorAll(ELF_BLOCK), function (n) { return n.getBoundingClientRect(); })
      .filter(function (r) { return r.width && r.height && r.bottom > -60 && r.top < H + 60; });
    var c0 = -5, c1 = Math.ceil(W / GC) + 5, rows = Math.floor(H / GC);
    var free = {};
    for (var c = c0; c <= c1; c++) for (var r = 0; r < rows; r++) {
      var x = c * GC + GC / 2, y = r * GC + GC / 2, ok = y - EHH > 0 && y + EHH < H;
      for (var i = 0; ok && i < obs.length; i++) { var o = obs[i]; if (x + EHW > o.left && x - EHW < o.right && y + EHH > o.top && y - EHH < o.bottom) ok = false; }
      if (ok) free[c + "," + r] = 1;
    }
    return { free: free, c0: c0, c1: c1, rows: rows, W: W, onCols: [0, Math.floor(W / GC)] };
  }
  function cellOf(x, y) { return [Math.floor(x / GC), Math.floor(y / GC)]; }
  function centerOf(c, r) { return [c * GC + GC / 2, r * GC + GC / 2]; }
  function bfs(g, start) {
    var key = start[0] + "," + start[1], prev = {}, q = [start], seen = {}; seen[key] = 1;
    while (q.length) {
      var cur = q.shift();
      for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        var n = [cur[0] + dc, cur[1] + dr], k = n[0] + "," + n[1];
        if (seen[k] || !g.free[k]) continue;
        if (dc && dr && (!g.free[(cur[0] + dc) + "," + cur[1]] || !g.free[cur[0] + "," + (cur[1] + dr)])) continue;
        seen[k] = 1; prev[k] = cur; q.push(n);
      }
    }
    return { seen: seen, prev: prev, start: key };
  }
  function pathTo(b, cell) {
    var out = [], k = cell[0] + "," + cell[1];
    if (!b.seen[k]) return null;
    while (k !== b.start) { var p = k.split(",").map(Number); out.unshift(centerOf(p[0], p[1])); var pr = b.prev[k]; if (!pr) break; k = pr[0] + "," + pr[1]; }
    return out;
  }
  function onScreenCells(g, b) {
    return Object.keys(b.seen).map(function (k) { return k.split(",").map(Number); })
      .filter(function (p) { return p[0] >= g.onCols[0] && p[0] <= g.onCols[1] && g.free[p[0] + "," + p[1]]; });
  }
  function elf(x, y) {
    if (elfOn) return;
    var g = elfGrid(), side = x > g.W / 2 ? "right" : "left";
    var row = Math.max(0, Math.min(g.rows - 1, cellOf(x, y)[1]));
    // Enter from off screen on the nearest free row on that side.
    var sc = side === "left" ? g.c0 : g.c1, start = null;
    for (var d = 0; d < g.rows && !start; d++) [row - d, row + d].forEach(function (r) { if (!start && g.free[sc + "," + r]) start = [sc, r]; });
    if (!start) return;
    var b = bfs(g, start), cells = onScreenCells(g, b);
    if (!cells.length) return;
    cells.sort(function (a, c) { var pa = centerOf(a[0], a[1]), pc = centerOf(c[0], c[1]); return Math.hypot(pa[0] - x, pa[1] - y) - Math.hypot(pc[0] - x, pc[1] - y); });
    var e = el("div", { class: "fx-elf running", "aria-hidden": "true" });
    e.innerHTML = '<div class="elf-in">' + ELF + "</div>";
    document.body.appendChild(e);
    var p0 = centerOf(start[0], start[1]);
    var st = { x: p0[0], y: p0[1], path: pathTo(b, cells[0]) || [], phase: "in", born: 0, last: 0, checked: 0, dead: false, el: e, side: side };
    elfOn = st;
    function place() { e.style.transform = "translate(" + (st.x - 22).toFixed(1) + "px," + (st.y - 30).toFixed(1) + "px)"; }
    function replan(goOut) {
      var gg = elfGrid(), here = cellOf(st.x, st.y), bb = bfs(gg, here);
      if (goOut) {
        var ec = st.side === "left" ? gg.c0 : gg.c1, best = null;
        Object.keys(bb.seen).forEach(function (k) { var p = k.split(",").map(Number); if (p[0] === ec && (!best || Math.abs(p[1] - here[1]) < Math.abs(best[1] - here[1]))) best = p; });
        if (!best) { var oc = st.side === "left" ? gg.c1 : gg.c0; Object.keys(bb.seen).forEach(function (k) { var p = k.split(",").map(Number); if (p[0] === oc && !best) best = p; }); }
        st.path = best ? pathTo(bb, best) : null;
        if (!st.path) { e.style.transition = "opacity .3s"; e.style.opacity = "0"; st.path = []; st.vanish = true; }
        return;
      }
      var cs = onScreenCells(gg, bb).filter(function (p) { var c = centerOf(p[0], p[1]); return Math.hypot(c[0] - st.x, c[1] - st.y) > 60; });
      if (!cs.length) cs = onScreenCells(gg, bb);
      st.path = cs.length ? pathTo(bb, cs[Math.floor(Math.random() * cs.length)]) || [] : [];
    }
    function blockedHere() { var gg = elfGrid(), h = cellOf(st.x, st.y); return !gg.free[h[0] + "," + h[1]]; }
    place();
    function tick(t) {
      if (st.dead || !e.isConnected) return;
      if (!st.last) { st.last = t; st.born = t; st.checked = t; }
      var dt = Math.min(0.05, (t - st.last) / 1000); st.last = t;
      if (st.phase !== "out" && t - st.born > 6000) { st.phase = "out"; replan(true); }
      if (st.vanish) { setTimeout(function () { e.remove(); if (elfOn === st) elfOn = null; }, 320); return; }
      // The page can scroll under him: if content now sits where he is, find a new free route.
      if (t - st.checked > 350) { st.checked = t; if (blockedHere()) replan(st.phase === "out"); }
      var wp = st.path && st.path[0];
      if (!wp) {
        if (st.phase === "out") { e.remove(); if (elfOn === st) elfOn = null; return; }
        st.phase = "roam"; replan(false); requestAnimationFrame(tick); return;
      }
      var dx = wp[0] - st.x, dy = wp[1] - st.y, dist = Math.hypot(dx, dy), step = elfSpeed(st.phase === "out") * dt;
      if (dist <= step) { st.x = wp[0]; st.y = wp[1]; st.path.shift(); }
      else { st.x += dx / dist * step; st.y += dy / dist * step; }
      if (Math.abs(dx) > 1) e.classList.toggle("flip", dx < 0);
      place();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function hitElf(x, y) {
    var st = elfOn;
    if (!st || st.dead) return false;
    var r = st.el.getBoundingClientRect();
    if (x < r.left - 6 || x > r.right + 6 || y < r.top - 6 || y > r.bottom + 6) return false;
    st.dead = true;
    setTimeout(function () { knockOut(st); }, 230);
    return true;
  }
  function knockOut(st) {
    elfKills++;
    st.el.classList.remove("running");
    st.el.classList.add("dead");
    setTimeout(function () { st.el.remove(); if (elfOn === st) elfOn = null; }, 2200);
  }
  function snowball(e) {
    if (fxSeason !== "christmas" || !snowGame || reduced()) return;
    if (e.target.closest && e.target.closest("button,a,input,select,textarea,label,.kpi,.chip,.chart-box,table,.cal-pop,.cm-pop,.cm,.cal")) return;
    var x = e.clientX, y = e.clientY;
    if (!elfOn && ++elfClicks >= 3) { elfClicks = 0; elf(x, y); }
    hitElf(x, y);
    var ball = el("div", { class: "fx-ball", "aria-hidden": "true" });
    ball.style.left = x + "px"; ball.style.top = y + "px";
    var splat = el("div", { class: "fx-puff", "aria-hidden": "true" });
    splat.appendChild(el("b"));
    for (var q = 0; q < 12; q++) {
      var bit = el("i"), ang = (q / 12) * Math.PI * 2 + Math.random() * .4, dist = 16 + Math.random() * 18, sz = 3 + Math.random() * 3;
      bit.style.cssText = "width:" + sz + "px;height:" + sz + "px;--x:" + Math.round(Math.cos(ang) * dist) + "px;--y:" + Math.round(Math.sin(ang) * dist) + "px";
      splat.appendChild(bit);
    }
    splat.style.left = x + "px"; splat.style.top = y + "px";
    document.body.appendChild(ball);
    setTimeout(function () { ball.remove(); document.body.appendChild(splat); }, 240);
    setTimeout(function () { splat.remove(); }, 1400);
  }
  document.addEventListener("click", snowball);
  function seasonBadge() {
    var b = document.querySelector(".top .season-badge");
    if (fxSeason === "christmas") {
      if (!b) { var host = document.querySelector(".top .brand-word"); if (host) { b = el("button", { type: "button", class: "season-badge" + (snowGame ? " on" : ""), "aria-pressed": String(snowGame), "aria-label": "Sneeuwballen", title: "Sneeuwballen", onclick: toggleSnowGame }); b.innerHTML = TREE; host.parentNode.insertBefore(b, host.nextSibling); } }
    } else if (b) b.remove();
    var hdr = document.querySelector(".top"), ice = hdr && hdr.querySelector(".fx-ice");
    if (ice) ice.remove();
  }
  function startSeasonFx(season) {
    fxSeason = season;
    clearInterval(fxTimer); fxTimer = null;
    clearTimeout(spiderTimer); spiderTimer = null;
    seasonBadge();
    if (reduced() || season === "off") return;
    if (season === "christmas") { setTimeout(snowBurst, 2500); fxTimer = setInterval(snowBurst, 300000); return; }
    // Halloween: the spider every 5 to 10 minutes.
    var nextSpider = function (ms) { spiderTimer = setTimeout(function () { if (fxSeason !== "halloween") return; spiderWeb(); nextSpider((5 + Math.random() * 5) * 60000); }, ms); };
    nextSpider(45000);
  }
  applyTheme();
  var SUN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  var SEASON_ICON = {
    off: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16v4M17 18h4"/></svg>',
    halloween: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7c-4.5 0-8 2.7-8 6.5S7.5 20 12 20s8-2.7 8-6.5S16.5 7 12 7z"/><path d="M12 7V4.5c0-.8.6-1.5 1.5-1.5"/><path d="M9 7.6c-1.3 2-1.3 9 0 12M15 7.6c1.3 2 1.3 9 0 12"/></svg>',
    christmas: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l5 6h-3l4 5h-3l4 5H5l4-5H6l4-5H7z"/><path d="M12 19v2.5"/></svg>',
  };

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
          if (j.role === "client" && j.client && j.client !== slug) { location.href = "/" + j.client + "/"; return; }
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
    w.insertAdjacentHTML("beforeend", '<svg class="brand-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.6-9.2C.9 8.5 2.6 5 6 4.3c2.2-.5 4.4.6 6 2.6 1.6-2 3.8-3.1 6-2.6 3.4.7 5.1 4.2 3.6 7.5C19.5 16.3 12 21 12 21z"/></svg>');
    w.appendChild(el("span", { class: "brand-dot", text: "app" }));
    return w;
  }

  // ---------- dashboard ----------
  function start() {
    if (!slug) { slug = state.session.client || "flii"; history.replaceState(null, "", "/" + slug + "/"); }
    renderShell();
    if (state.session.role === "admin") api("/clients").then(function (j) { state.clients = j.clients || []; renderShell(); load(); });
    else load();
    clearInterval(state.timer); clearInterval(state.liveTimer);
    state.timer = setInterval(load, 10 * 60000);
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
      seasonBadge();
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

    var cal = datePicker();
    var langBtn = el("button", { class: "ghost", type: "button", text: lang === "nl" ? "EN" : "NL", onclick: function () { lang = lang === "nl" ? "en" : "nl"; store(LANGKEY, lang); document.documentElement.lang = lang; renderShell(); renderBody(); } });
    var out = el("button", { class: "ghost", type: "button", text: t("logout"), onclick: logout });

    root.appendChild(el("header", { class: "top" }, [el("div", { class: "top-in" }, [
      brand(), el("span", { class: "sep" }), clientCtl, el("span", { class: "spacer" }),
      el("div", { class: "ctrl" }, [cal, modeMenu(), langBtn, out]),
    ])]));
    root.appendChild(el("main", { id: "main" }, [el("div", { class: "loading", text: t("loading") })]));
    var f = el("footer", null, [el("div", { text: t("prelim") })]);
    var built = el("div", { class: "built" }, [el("span", { class: "shine", text: "built by" }), brand()]);
    f.appendChild(el("div", null, [built]));
    root.appendChild(f);
    seasonBadge();
  }

  var CHEVRON = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  // Client switcher for admins, styled like the rest of the page.
  function clientMenu(name) {
    var wrap = el("div", { class: "cm" });
    var btn = el("button", { type: "button", class: "cm-btn", "aria-haspopup": "listbox", "aria-expanded": "false" }, [el("span", { class: "client", id: "client-name", text: name })]);
    btn.insertAdjacentHTML("beforeend", CHEVRON);
    var list = el("div", { class: "cm-pop", role: "listbox", "aria-label": "Client", hidden: "" }, state.clients.map(function (c) {
      var cur = c.slug === slug;
      return el("a", { class: "cm-item" + (cur ? " on" : ""), role: "option", "aria-selected": String(cur), href: "/" + c.slug + "/" }, [el("span", { class: "cm-dot" }), c.name]);
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

  var SANTA = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><ellipse cx="12" cy="13.3" rx="5.7" ry="4.6" fill="#f5cfb4"/><circle cx="8.7" cy="14.4" r="1.1" fill="#ec9c8f" opacity=".6"/><circle cx="15.3" cy="14.4" r="1.1" fill="#ec9c8f" opacity=".6"/><circle cx="10" cy="12.7" r=".75" fill="#3a2a22"/><circle cx="14" cy="12.7" r=".75" fill="#3a2a22"/><path d="M6.1 14Q6.2 22.7 12 23.1q5.8-.4 5.9-9.1-1.9 3-5.9 3t-5.9-3z" fill="#fff"/><path d="M9 16.7q3-2.1 6 0-3 1.4-6 0z" fill="#e9eef2"/><circle cx="12" cy="15.3" r="1" fill="#e58f80"/><path d="M5.6 9Q6.6 2 12.4 2q4.6 0 6.6 3.6l2.4 3.4-2.6.4L17.9 9z" fill="#d42a2a" stroke="#fff" stroke-width=".9" stroke-linejoin="round"/><rect x="4.4" y="8.2" width="15.2" height="3.2" rx="1.6" fill="#fff"/><circle cx="21.2" cy="9.6" r="1.9" fill="#fff"/></svg>';
  var MODE_ICON = { light: SUN, dark: MOON, christmas: '<span class="emoji-ic">\uD83C\uDF85</span>', halloween: '<span class="emoji-ic">\uD83C\uDF83</span>' };
  // One button: each tap moves to the next mode (light, dark, christmas).
  function modeMenu() {
    var next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    var names = { light: t("mLight"), dark: t("mDark"), christmas: t("sChristmas"), halloween: t("sHalloween") };
    var btn = el("button", { type: "button", class: "ghost icon-btn", "aria-label": t("mode") + ": " + names[mode], title: t("mode") + ": " + names[mode], onclick: function () {
      mode = next; store(MODEKEY, mode); applyTheme(); renderShell(); renderBody();
    } });
    btn.innerHTML = MODE_ICON[mode];
    return btn;
  }


  var CAL_ICON ='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';

  function datePicker() {
    var wrap = el("div", { class: "cal" });
    var active = state.range === "custom" && state.custom;
    var btn = el("button", { type: "button", class: "ghost cal-btn" + (active ? " on" : ""), "aria-haspopup": "dialog", "aria-expanded": "false", "aria-label": t("custom"), title: t("custom") });
    btn.innerHTML = CAL_ICON;
    btn.appendChild(el("span", { text: active ? fmtDate(state.custom.from) + " / " + fmtDate(state.custom.to) : t(state.range) }));
    var r = rangeDates(state.range);
    var today = iso(new Date());
    var sel = { from: r.from, to: r.to };
    var pending = state.range;
    // Quick ranges at the top of the picker; they fill the calendar, Apply confirms.
    var seg = el("div", { class: "seg cal-seg", role: "group" });
    function paintSeg() {
      seg.innerHTML = "";
      ["d7", "d28", "d90", "mtd", "lm"].forEach(function (k) {
        seg.appendChild(el("button", { type: "button", "aria-pressed": String(pending === k), text: t(k), onclick: function () {
          pending = k; var q = rangeDates(k); sel = { from: q.from, to: q.to };
          view = new Date(q.to + "T00:00:00"); view.setDate(1); err.textContent = ""; paintCal();
        } }));
      });
    }
    var f = el("div", { class: "cal-val" });
    var tt = el("div", { class: "cal-val" });
    function show(node, ds, other) { node.textContent = ds ? fmtDate(ds, { day: "numeric", month: "short", year: "numeric" }) : "-"; node.classList.toggle("active", !!other); }
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
      paintSeg();
      months.innerHTML = "";
      var base = new Date(view);
      if (two()) { var prev = new Date(base); prev.setMonth(prev.getMonth() - 1); months.appendChild(monthGrid(prev.getFullYear(), prev.getMonth())); }
      months.appendChild(monthGrid(base.getFullYear(), base.getMonth()));
      show(f, sel.from, sel.from && !sel.to); show(tt, sel.to, false);
      nextBtn.disabled = iso(new Date(view.getFullYear(), view.getMonth() + 1, 1)) > today;
    }
    function pickDay(ds) {
      err.textContent = "";
      pending = "custom";
      if (!sel.from || sel.to) { sel = { from: ds, to: null }; }
      else if (ds < sel.from) { sel = { from: ds, to: sel.from }; }
      else sel.to = ds;
      paintCal();
    }
    function shiftMonth(n) { view.setMonth(view.getMonth() + n); paintCal(); }
    var prevBtn = el("button", { type: "button", class: "cal-nav", "aria-label": "<", onclick: function () { shiftMonth(-1); } });
    var nextBtn = el("button", { type: "button", class: "cal-nav", "aria-label": ">", onclick: function () { shiftMonth(1); } });
    prevBtn.innerHTML = CHEVRON; nextBtn.innerHTML = CHEVRON;
    var pop = el("div", { class: "cal-pop", role: "dialog", "aria-label": t("custom"), hidden: "" }, [
      seg,
      el("div", { class: "cal-fields" }, [
        el("div", { class: "field" }, [el("span", { text: t("from") }), f]),
        el("div", { class: "field" }, [el("span", { text: t("to") }), tt]),
      ]),
      el("div", { class: "cal-body" }, [prevBtn, months, nextBtn]),
      el("button", { class: "btn block", type: "button", text: t("apply"), onclick: function () {
        if (pending !== "custom") { state.range = pending; state.custom = null; renderShell(); renderBody(true); load(); return; }
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
    return el("div", { class: cls, title: t("vs"), text: sign + pct(ch) });
  }
  // Previous period line under each scorecard: its value and dates.
  function prevLine(prevVal) {
    var pv = state.data && state.data.previous;
    if (prevVal == null || !pv) return null;
    return el("div", { class: "cmp" }, ["vs " + prevVal, el("span", { text: fmtDate(pv.from) + " / " + fmtDate(pv.to) })]);
  }
  function kpi(label, value, cur, prev, good, onSelect, selected, color, prevVal) {
    var attrs = { class: "kpi" + (onSelect ? " pick" : "") + (selected ? " on" : "") };
    if (onSelect) { attrs.type = "button"; attrs["aria-pressed"] = String(!!selected); attrs.onclick = onSelect; }
    var node = el(onSelect ? "button" : "div", attrs, [el("div", { class: "lbl" }, [el("i", { class: "sw" }), label]), el("div", { class: "val", text: value }), delta(cur, prev, good), prev ? prevLine(prevVal) : null]);
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
  var SERIES_COLORS = ["var(--mag)", "var(--ink)", "var(--ink-3)", "var(--mag)"];
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
        cards.appendChild(kpi(m.label, m.val, m.cur, m.prev, m.good, function () { toggle(m); }, keys.indexOf(m.key) >= 0, color(m), m.prev ? m.fmt(m.prev) : null));
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
