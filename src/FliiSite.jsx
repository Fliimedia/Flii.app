import React, { useState, useEffect, useRef, createContext, useContext } from "react";

// ============================================================
// Flii.app : AI-architectuur & marketing-apps
// Dutch by default, EN toggle in the fixed bottom dock bar.
// Hash routing: #/ home · #/cms · #/app|insight|review|cert/:id
// Content via Supabase REST (fetch) with localStorage fallback.
// ============================================================

const MAG = "#E7255A";
const BRANDS = ["Weddy", "Aperture", "Populos", "Waryte", "FC Data"];

/* ---------- i18n ---------- */
const I18N = {
  nl: {
    slogan: "AI-architectuur & marketing-apps",
    nav: { solutions: "Diensten", work: "Werk", approach: "Aanpak", about: "Over ons", insights: "Inzichten", contact: "Contact", consult: "Plan een gesprek", manage: "CMS" },
    mega: {
      groups: [
        { group: "Bouwen", blurb: "Ontwerp en lanceer het product.", items: [
          { label: "App-design & UX", desc: "Conversiegericht ontwerp", href: "#solutions" },
          { label: "App-ontwikkeling", desc: "Snel naar productie", href: "#solutions" } ] },
        { group: "Groeien", blurb: "Maak van het product groei.", items: [
          { label: "AI-performance-marketing", desc: "Gebouwd op rendement", href: "#solutions" },
          { label: "Optimalisatie & automatisering", desc: "CRO, analytics, AI-ops", href: "#solutions" } ] },
      ],
      featureK: "Flii Loop", featureT: "Eén AI-fundament dat blijft leren →",
    },
    hero: { pre: "AI architectuur als fundament van ", mark: "resultaat", post: "",
      sub: "Wij ontwerpen en ontwikkelen AI architectuur & apps. Gebouwd voor groei, gericht op rendement.",
      primary: "Plan een gesprek", secondary: "Bekijk Flii Loop ↘", loopCta: "Test Flii Loop" },
    brandsLabel: "Merken waarvoor we bouwden",
    services: { eyebrow: "Wat we doen", h2: "Wat we bouwen",
      lede: "Design, development, marketing en automatisering. Eén team, één systeem, één doel om te halen.",
      cta: "Start een project ↗",
      items: [
        { title: "AI-chatbots & assistenten", body: "Slimme assistenten die altijd opnemen, vragen beantwoorden en leads kwalificeren." },
        { title: "Websites & web-apps", body: "Snelle, strakke sites en apps die bezoekers omzetten in klanten." },
        { title: "AI-automatisering", body: "Laat saai, repeterend werk door AI doen en houd tijd over voor groei." },
        { title: "Performance-marketing", body: "Advertenties die meetbaar renderen, geen budget dat verdampt." } ] },
    certsLabel: "Gecertificeerd & partner",
    stats: [
      { value: 21, suffix: " dagen", label: "Van brief tot live" },
      { value: 100, suffix: "%", label: "AI-native oplevering" },
      { value: 12, suffix: "+", label: "Producten gelanceerd" } ],
    loop: { eyebrow: "Flii Loop", h2: "Eén AI-fundament. Elke maand slimmer.", center: "elke maand beter",
      lede: "Flii Loop legt een AI-fundament onder je bedrijf. Daarop verbeteren we wat je al doet en sluiten we slimme marketing-apps aan. Elk resultaat komt terug als data, en het hele systeem wordt scherper.",
      items: [
        { k: "Fundament", body: "We koppelen je data en tools tot één AI-fundament: de basis waar alles op draait." },
        { k: "Verbeteren", body: "Daarop maken we je bestaande diensten slimmer: sneller werk, betere keuzes, minder handwerk." },
        { k: "Aansluiten", body: "We pluggen kant-en-klare marketing-apps in die meteen meedraaien en resultaat opleveren." },
        { k: "Loop", body: "Elk resultaat voedt het fundament terug. Het systeem leert en wordt elke maand beter." } ] },
    work: { eyebrow: "Showcase", h2: "Wat we lanceerden", manage: "Beheer showcase ↗", view: "Bekijk case ↗" },
    reviews: { eyebrow: "Reviews", h2: "Bewijs, geen beloftes.", word: "reviews" },
    byline: { by: "by", name: "Flii Media" },
    who: { eyebrow: "Voor wie we werken", h2: "Gebouwd voor ambitie.",
      lede: "Geen goedkope leverancier. Een partner voor teams die iets willen bouwen dat presteert.",
      items: [
        { h: "Gefinancierde startups", b: "die een product in de markt willen, met een groeimotor erachter." },
        { h: "Scale-ups", b: "klaar om uitgaven om te zetten in een systeem dat optelt." },
        { h: "Founder-led merken", b: "die één partner willen die bouwt en marketing doet." },
        { h: "Productteams", b: "die snelheid, data en een scherpe brief waarderen." } ] },
    steps: { eyebrow: "Hoe het werkt", h2: "Begin simpel.",
      items: [
        { n: "Stap 1", h: "Kennismaking", b: "Een kort, direct gesprek over waar je staat en waar je heen wilt." },
        { n: "Stap 2", h: "De kans in kaart", b: "Een helder plan: scope, indicatie, planning." },
        { n: "Stap 3", h: "Afstemmen", b: "Slimme vervolgvragen, daarna leggen we de opdracht vast." },
        { n: "Stap 4", h: "Bouwen", b: "Heldere scope, gedeelde verwachtingen, een build die live gaat." } ] },
    insights: { eyebrow: "Inzichten", h2: "Scherpe inzichten.", manage: "Beheer inzichten ↗", read: "Lees ↗" },
    cta: { h2: "Laten we bouwen.", sub: "Vertel ons jouw doel - en ontvang een gericht plan, met planning en heldere deliverables.",
      primary: "Plan een gesprek", secondary: "Vraag een groei-audit ↗" },
    contact: [
      { k: "Locatie", v: "Amstelveen, NL", href: null },
      { k: "Bericht", v: "WhatsApp ons", href: "https://wa.me/" },
      { k: "E-mail", v: "hello@flii.app", href: "mailto:hello@flii.app" },
      { k: "Aanmelden", v: "The Flii Signal", href: "mailto:hello@flii.app?subject=Aanmelden%20Flii%20Signal" } ],
    consult: { eyebrow: "Plan een gesprek", h: "Waar kunnen we je mee helpen?",
      formH: "Vertel ons iets meer", name: "Naam", email: "E-mail", back: "← Terug", send: "Versturen",
      opts: [
        { id: "vraag", t: "Ik heb een vraag", d: "Stel je vraag, we reageren snel." },
        { id: "advies", t: "Ik wil een adviesgesprek", d: "Vrijblijvend sparren over je doel." },
        { id: "product", t: "Ik heb interesse in een product", d: "Ontdek samen wat past." } ],
      detail: { vraag: "Je vraag", advies: "Waarover wil je advies?", product: "Welk product of interesse?" },
      detailPh: { vraag: "Waar loop je tegenaan?", advies: "Wat wil je bereiken?", product: "Welk product spreekt je aan?" },
      subject: { vraag: "Vraag via flii.app", advies: "Adviesgesprek via flii.app", product: "Productinteresse via flii.app" } },
    footer: { solutions: "Diensten", company: "Bedrijf", connect: "Connect",
      company_links: [ { label: "Werk", href: "#work" }, { label: "Over ons", href: "#about" }, { label: "Inzichten", href: "#blog" }, { label: "CMS", href: "#/cms" } ],
      bottom: "Snel gebouwd. Afgesteld op prestatie." },
    cms: { back: "← Terug naar site", eyebrow: "Content", h1: "Beheer content", reset: "Herstel standaard",
      status: { supabase: "Gesynct met Supabase", loading: "Verbinden met Supabase…", local: "Lokaal (deze browser)" },
      tabs: { reviews: "Reviews", certs: "Certificeringen", apps: "Showcase", articles: "Inzichten" },
      newPrefix: "+ Nieuw: ", view: "Bekijk", edit: "Bewerk", del: "Verwijder",
      empty: "Nog niets. Voeg de eerste toe.", save: "Opslaan", cancel: "Annuleer",
      confirmReset: "Alle content terugzetten naar standaard?", confirmDelete: "Dit item verwijderen?",
      f: { quote: "Quote", name: "Naam", role: "Functie", org: "Organisatie", rating: "Score (1-5)",
        certName: "Naam", tier: "Niveau", blurb: "Omschrijving", link: "Link",
        title: "Titel", client: "Klant", tag: "Tag", summary: "Samenvatting",
        body: "Tekst (lege regel = nieuwe alinea)", metrics: "Metrics (label:waarde, komma-gescheiden)",
        category: "Categorie", date: "Datum", excerpt: "Samenvatting" } },
    detail: { backShowcase: "← Showcase", backInsights: "← Inzichten", backHome: "← Home",
      notFound: "Niet gevonden", notFoundSub: "Dit item is mogelijk verwijderd in het CMS.",
      visit: "Bezoek", credential: "Bekijk certificaat ↗" },
    login: { eyebrow: "Beheer", title: "Inloggen", placeholder: "Pincode", error: "Onjuiste pincode",
      submit: "Inloggen", cancel: "Annuleer", loginAria: "Inloggen", logoutAria: "Uitloggen",
      lockedH: "Alleen voor beheer", lockedSub: "Log in met je pincode om de CMS te openen." },
  },
  en: {
    slogan: "AI architecture & marketing apps",
    nav: { solutions: "Solutions", work: "Work", approach: "Approach", about: "About", insights: "Insights", contact: "Contact", consult: "Book a consultation", manage: "CMS" },
    mega: {
      groups: [
        { group: "Build", blurb: "Design and ship the product.", items: [
          { label: "App Design & UX", desc: "Conversion-smart design", href: "#solutions" },
          { label: "App Development", desc: "Production builds, fast", href: "#solutions" } ] },
        { group: "Grow", blurb: "Turn the product into growth.", items: [
          { label: "AI Performance Marketing", desc: "Engineered for ROAS", href: "#solutions" },
          { label: "Optimisation & Automation", desc: "CRO, analytics, AI ops", href: "#solutions" } ] },
      ],
      featureK: "Flii Loop", featureT: "One AI foundation that keeps learning →",
    },
    hero: { pre: "AI architecture as the foundation of ", mark: "results", post: "",
      sub: "We design and build AI architecture & apps. Built for growth, focused on return.",
      primary: "Book a consultation", secondary: "See Flii Loop ↘", loopCta: "Test Flii Loop" },
    brandsLabel: "Brands we've shipped for",
    services: { eyebrow: "What we do", h2: "What we build",
      lede: "Design, development, marketing and automation. One team, one system, one number to hit.",
      cta: "Start a project ↗",
      items: [
        { title: "AI chatbots & assistants", body: "Smart assistants that always pick up, answer questions and qualify leads." },
        { title: "Websites & web apps", body: "Fast, sharp sites and apps that turn visitors into customers." },
        { title: "AI automation", body: "Let AI handle the boring, repetitive work so you can focus on growth." },
        { title: "Performance marketing", body: "Ads that measurably pay back, not budget that evaporates." } ] },
    certsLabel: "Certified & partnered",
    stats: [
      { value: 21, suffix: " days", label: "Brief to live" },
      { value: 100, suffix: "%", label: "AI-native delivery" },
      { value: 12, suffix: "+", label: "Products shipped" } ],
    loop: { eyebrow: "Flii Loop", h2: "One AI foundation. Smarter every month.", center: "smarter monthly",
      lede: "Flii Loop lays an AI foundation under your business. On top of it we sharpen what you already do and plug in smart marketing apps. Every result comes back as data, and the whole system gets sharper.",
      items: [
        { k: "Foundation", body: "We connect your data and tools into one AI foundation: the base everything runs on." },
        { k: "Improve", body: "On top of it we make your existing services smarter: faster work, better calls, less manual effort." },
        { k: "Connect", body: "We plug in ready-made marketing apps that start working and paying back right away." },
        { k: "Loop", body: "Every result feeds the foundation back. The system learns and gets better every month." } ] },
    work: { eyebrow: "Showcase", h2: "What we've shipped", manage: "Manage showcase ↗", view: "View case ↗" },
    reviews: { eyebrow: "Reviews", h2: "Proof, not promises.", word: "reviews" },
    byline: { by: "by", name: "Flii Media" },
    who: { eyebrow: "Who we're for", h2: "Built for ambition.",
      lede: "Not a low-cost vendor. A partner for teams ready to build something that performs.",
      items: [
        { h: "Funded startups", b: "who need a product in market and a growth engine behind it." },
        { h: "Scale-ups", b: "ready to turn spend into a compounding system." },
        { h: "Founder-led brands", b: "who want one partner that builds and markets." },
        { h: "Product teams", b: "who value velocity, data and a sharp brief." } ] },
    steps: { eyebrow: "How it works", h2: "Start simple.",
      items: [
        { n: "Step 1", h: "Discovery call", b: "A short, direct chat on where you are and where you want to be." },
        { n: "Step 2", h: "Map the opportunity", b: "A clear plan: scope, ballpark, timelines." },
        { n: "Step 3", h: "Align", b: "Smart follow-ups, then we lock the engagement." },
        { n: "Step 4", h: "Build", b: "Clear scope, shared expectations, a build that ships." } ] },
    insights: { eyebrow: "Insights", h2: "Sharp takes.", manage: "Manage insights ↗", read: "Read ↗" },
    cta: { h2: "Let's build.", sub: "Tell us your goal, and get a focused plan with timeline and clear deliverables.",
      primary: "Book a consultation", secondary: "Get a growth audit ↗" },
    contact: [
      { k: "Location", v: "Amstelveen, NL", href: null },
      { k: "Message", v: "WhatsApp us", href: "https://wa.me/" },
      { k: "Email", v: "hello@flii.app", href: "mailto:hello@flii.app" },
      { k: "Join", v: "The Flii Signal", href: "mailto:hello@flii.app?subject=Join%20Flii%20Signal" } ],
    consult: { eyebrow: "Book a consultation", h: "How can we help?",
      formH: "Tell us a bit more", name: "Name", email: "Email", back: "← Back", send: "Send",
      opts: [
        { id: "vraag", t: "I have a question", d: "Ask away, we reply fast." },
        { id: "advies", t: "I want a consultation", d: "Spar about your goal, no strings." },
        { id: "product", t: "I'm interested in a product", d: "Let's find the right fit." } ],
      detail: { vraag: "Your question", advies: "What do you want advice on?", product: "Which product or interest?" },
      detailPh: { vraag: "What are you running into?", advies: "What do you want to achieve?", product: "Which product appeals to you?" },
      subject: { vraag: "Question via flii.app", advies: "Consultation via flii.app", product: "Product interest via flii.app" } },
    footer: { solutions: "Solutions", company: "Company", connect: "Connect",
      company_links: [ { label: "Work", href: "#work" }, { label: "About", href: "#about" }, { label: "Insights", href: "#blog" }, { label: "CMS", href: "#/cms" } ],
      bottom: "Built fast. Tuned for performance." },
    cms: { back: "← Back to site", eyebrow: "Content", h1: "Manage content", reset: "Reset to defaults",
      status: { supabase: "Synced with Supabase", loading: "Connecting to Supabase…", local: "Local (this browser)" },
      tabs: { reviews: "Reviews", certs: "Certifications", apps: "Showcase", articles: "Insights" },
      newPrefix: "+ New: ", view: "View", edit: "Edit", del: "Delete",
      empty: "Nothing here yet. Add the first one.", save: "Save", cancel: "Cancel",
      confirmReset: "Reset all content to defaults?", confirmDelete: "Delete this item?",
      f: { quote: "Quote", name: "Name", role: "Role", org: "Organisation", rating: "Rating (1-5)",
        certName: "Name", tier: "Tier", blurb: "Blurb", link: "Link",
        title: "Title", client: "Client", tag: "Tag", summary: "Summary",
        body: "Body (blank line = new paragraph)", metrics: "Metrics (label:value, comma separated)",
        category: "Category", date: "Date", excerpt: "Excerpt" } },
    detail: { backShowcase: "← Showcase", backInsights: "← Insights", backHome: "← Home",
      notFound: "Not found", notFoundSub: "This item may have been removed in the CMS.",
      visit: "Visit", credential: "View credential ↗" },
    login: { eyebrow: "Admin", title: "Log in", placeholder: "PIN code", error: "Incorrect PIN",
      submit: "Log in", cancel: "Cancel", loginAria: "Log in", logoutAria: "Log out",
      lockedH: "Admins only", lockedSub: "Log in with your PIN to open the CMS." },
  },
};

const LangCtx = createContext({ lang: "nl", setLang: () => {}, t: I18N.nl });
const useLang = () => useContext(LangCtx);

/* ---------- CMS default content (Dutch) ---------- */
const DEFAULT_APPS = [
  { id: "waryte", title: "Waryte", client: "Flii Media", tag: "Product / SaaS",
    summary: "Social-content-automatisering met een AI-composer en een live publicatiepijplijn.",
    link: "https://waryte.vercel.app",
    metrics: [{ label: "Composer-stappen", value: "3" }, { label: "Bronnen", value: "Reddit + Web" }, { label: "Publiceren", value: "Webflow" }],
    body: "Waryte zet ruwe signalen om in publicatieklare social content. Een AI-composer in drie stappen schrijft, verfijnt en maakt posts op, met context uit een Reddit-datapijplijn, en publiceert direct naar Webflow.\n\nDe build verving een fragiele scraping-opzet door een robuuste Apify-pijplijn, met daarbovenop een goedkeuringsflow zodat er niets live gaat zonder mens in de lus." },
  { id: "wk2026", title: "WK2026 Voorspellingen", client: "Flii Labs", tag: "Sport / Realtime",
    summary: "Een WK-voorspellingsapp met live wedstrijden, animatie en een resultatenengine.",
    link: "#",
    metrics: [{ label: "Wedstrijden", value: "Live" }, { label: "Stack", value: "React" }, { label: "Deploy", value: "Vercel" }],
    body: "Een voorspellingsspel rond echte WK 2026-wedstrijddata, met een sterk geanimeerde UI en een resultatenengine die voorspellingen afrekent zodra wedstrijden klaar zijn.\n\nMobile-first ontworpen, continu naar Vercel gelanceerd." },
  { id: "social-os", title: "Flii Social OS", client: "Flii Media", tag: "Marketingsite",
    summary: "Een op zichzelf staande productervaring voor de Flii Social, Performance en Web OS.",
    link: "#",
    metrics: [{ label: "Type", value: "SPA" }, { label: "Pagina's", value: "1" }, { label: "Focus", value: "Conversie" }],
    body: "Een one-page productmarketingervaring die de Flii-besturingssystemen als één verhaal presenteert, gebouwd om bezoekers om te zetten in gesprekken." },
  { id: "wedding-pwa", title: "Planning-dashboard", client: "Privé", tag: "PWA",
    summary: "Een React-PWA voor taken, budget, gasten en de dagplanning.",
    link: "#",
    metrics: [{ label: "Modules", value: "4" }, { label: "Offline", value: "Ja" }, { label: "Installeren", value: "PWA" }],
    body: "Een installeerbaar planning-dashboard voor taken, budget, gastenlijst en een dagplanning, module voor module uitgebouwd en via Vercel gelanceerd." },
];
const DEFAULT_ARTICLES = [
  { id: "stop-kapotte-funnels", title: "Stop met kapotte funnels opschalen", cat: "Performance", date: "jun 2026",
    excerpt: "Meer leads bij gelijke omzet is een valkuil. Repareer conversie voordat je budget toevoegt.",
    body: "Budget in een funnel pompen die niet converteert, koopt alleen duurdere teleurstelling.\n\nVoordat je advertentiebudget opschaalt: repareer het pad van klik naar omzet. De aanbieding, de landingservaring en de overdracht naar sales. Schaal daarna op wat bewezen werkt." },
  { id: "lanceren-21-dagen", title: "Lanceren in 21 dagen met AI in de lus", cat: "AI Build", date: "jun 2026",
    excerpt: "Wat verandert er als AI de bouwer is en jij regisseert, en waar wint de mens nog?",
    body: "AI verkleint de afstand tussen idee en werkende software. De rem verschuift van typesnelheid naar oordeel.\n\nTeams die winnen behandelen AI als snelle bouwer en zichzelf als scherpe regisseurs: eigenaar van scope, smaak en de keuze wat live gaat." },
  { id: "analytics-weet-al", title: "Je analytics weet al wat te doen", cat: "RevOps", date: "mei 2026",
    excerpt: "De data die je product verzamelt is de goedkoopste groeiknop die je niet gebruikt.",
    body: "De meeste teams zitten op gedragsdata waar ze nooit iets mee doen. Het signaal is er al.\n\nKoppel productevents aan marketingbeslissingen en dezelfde dataset die groei meet, gaat groei aansturen." },
];
const DEFAULT_REVIEWS = [
  { id: "bikefair", quote: "Resultaat geleverd: persoonlijke aanpak, kwaliteit van werk, korte lijntjes. Het zijn experts in hun veld.", name: "J. Pecník", role: "CEO", org: "BikeFair", rating: 5 },
  { id: "soest-machinery", quote: "Erg tevreden over de kwaliteit, resultaten en betrokkenheid. Bedankt!", name: "M. van Soest", role: "CEO", org: "Soest Machinery", rating: 5 },
  { id: "social-innovations", quote: "Creatieve denkers die zich goed kunnen verplaatsen in je bedrijf. En waar je van op aan kan.", name: "Tim Muller", role: "Head of Marketing", org: "Social Innovations", rating: 5 },
  { id: "broadcast-magazine", quote: "Snel, ter zake kundig en met resultaat. Wat wil een mens nog meer?", name: "J. Te Nuijl", role: "Hoofdredacteur", org: "Broadcast Magazine", rating: 5 },
  { id: "zeewind", quote: "Niets minder dan indrukwekkend. Ik kan hun diensten ten zeerste aanbevelen.", name: "H. Hasnaoui", role: "Eigenaar", org: "Zeewind", rating: 5 },
];
const DEFAULT_CERTS = [
  { id: "webflow", name: "Webflow", tier: "Partner", blurb: "Gecertificeerd Webflow-buildpartner voor productiesites en CMS.", href: "#" },
  { id: "hubspot", name: "HubSpot", tier: "Solutions Partner", blurb: "Partner voor CRM, automatisering en RevOps-implementatie.", href: "#" },
  { id: "google", name: "Google", tier: "Ads Certified", blurb: "Gecertificeerd in Search, Performance Max en analytics.", href: "#" },
  { id: "meta", name: "Meta", tier: "Business Partner", blurb: "Paid social-strategie en creatieve performance.", href: "#" },
  { id: "vercel", name: "Vercel", tier: "Pro", blurb: "Edge-deployment en performance voor React-apps.", href: "#" },
];

/* ---------- backend config ----------
 * Paste your Supabase project URL + anon (public) key below, OR set
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.
 * Blank = browser localStorage. Anon key is publishable; security is
 * enforced by RLS policies (see supabase-setup.sql).
 */
const SUPABASE_URL = "";
const SUPABASE_ANON = "";
function envFallback() {
  try { if (typeof process !== "undefined" && process.env) return [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY]; } catch (e) {}
  return [undefined, undefined];
}
const [_EU, _EK] = envFallback();
const SB_URL = (SUPABASE_URL || _EU || "").replace(/\/$/, "");
const SB_KEY = SUPABASE_ANON || _EK || "";
const REMOTE = !!(SB_URL && SB_KEY);
const TABLES = ["reviews", "certs", "apps", "articles"];
const DEFAULTS = { apps: DEFAULT_APPS, articles: DEFAULT_ARTICLES, reviews: DEFAULT_REVIEWS, certs: DEFAULT_CERTS };

const LS_KEY = "flii_cms_v2";
function loadStore() { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function saveStore(d) { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (e) {} }

const sbHeaders = () => ({ apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" });
async function sbGet(table) { const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*&order=created_at.asc`, { headers: sbHeaders() }); if (!r.ok) throw new Error(`${table} ${r.status}`); return r.json(); }
async function sbUpsert(table, row) { const r = await fetch(`${SB_URL}/rest/v1/${table}?on_conflict=id`, { method: "POST", headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(row) }); if (!r.ok) throw new Error(await r.text()); }
async function sbDelete(table, id) { const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { ...sbHeaders(), Prefer: "return=minimal" } }); if (!r.ok) throw new Error(await r.text()); }
async function seedRemote(coll, items) { for (const it of items) { try { await sbUpsert(coll, it); } catch (e) {} } }

function useContent() {
  const [data, setData] = useState(() => ({ ...DEFAULTS, ...(loadStore() || {}) }));
  const [status, setStatus] = useState(REMOTE ? "loading" : "local");
  useEffect(() => {
    if (!REMOTE) return; let alive = true;
    (async () => {
      try {
        const rows = await Promise.all(TABLES.map(sbGet));
        const next = { reviews: rows[0], certs: rows[1], apps: rows[2], articles: rows[3] };
        const allEmpty = Object.values(next).every((a) => !a || a.length === 0);
        if (allEmpty) { await Promise.all(TABLES.map((t) => seedRemote(t, DEFAULTS[t]))); if (alive) { setData({ ...DEFAULTS }); saveStore({ ...DEFAULTS }); } }
        else if (alive) { setData(next); saveStore(next); }
        if (alive) setStatus("supabase");
      } catch (e) { if (alive) setStatus("local"); }
    })();
    return () => { alive = false; };
  }, []);
  useEffect(() => { saveStore(data); }, [data]);
  const upsert = (coll, item) => { setData((d) => { const list = d[coll] || []; const i = list.findIndex((x) => x.id === item.id); const next = i >= 0 ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]; return { ...d, [coll]: next }; }); if (REMOTE) sbUpsert(coll, item).catch(() => {}); };
  const remove = (coll, id) => { setData((d) => ({ ...d, [coll]: d[coll].filter((x) => x.id !== id) })); if (REMOTE) sbDelete(coll, id).catch(() => {}); };
  const reset = () => { setData({ ...DEFAULTS }); if (REMOTE) Promise.all(TABLES.map((t) => seedRemote(t, DEFAULTS[t]))).catch(() => {}); };
  return { data, upsert, remove, reset, status };
}

/* ---------- router ---------- */
function parseHash() {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  if (!h) return { name: "home" };
  const [seg, id] = h.split("/");
  if (seg === "cms") return { name: "cms" };
  if (["app", "insight", "review", "cert"].includes(seg) && id) return { name: seg, id };
  return { name: "home" };
}
function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => { const on = () => setRoute(parseHash()); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);
  return route;
}
const slugify = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || ("item-" + Date.now());

/* ---------- shared ---------- */
function useReveal() {
  const ref = useRef(null); const [shown, setShown] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; } const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.18 }); io.observe(el); return () => io.disconnect(); }, []);
  return [ref, shown];
}
function Section({ children, className = "", ...rest }) { const [ref, shown] = useReveal(); return <div ref={ref} className={`reveal ${shown ? "in" : ""} ${className}`} {...rest}>{children}</div>; }
function Counter({ value, suffix }) {
  const ref = useRef(null); const [n, setN] = useState(0);
  useEffect(() => { const el = ref.current; if (!el) return; if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(value); return; } const io = new IntersectionObserver((en) => { if (!en[0].isIntersecting) return; io.disconnect(); const dur = 1300, t0 = performance.now(); const tick = (t) => { const p = Math.min(1, (t - t0) / dur); setN(value * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, { threshold: 0.5 }); io.observe(el); return () => io.disconnect(); }, [value]);
  return <span ref={ref}>{Number.isInteger(value) ? Math.round(n) : n.toFixed(1)}{suffix}</span>;
}
function FliiLogo({ dark = false, variant = "word" }) {
  if (variant === "mark") {
    return (
      <span className={`brand brand-mark ${dark ? "brand-on-dark" : ""}`}>
        <svg className="logo-mark" viewBox="0 0 500 500" fill="none" aria-hidden>
          <path fill={MAG} d="m 239.8092,332.68537 c -2.28447,-3.49286 -23.46567,-48.57731 -23.46567,-50.01464 0,-0.93415 13.88823,-0.66647 21.30481,-0.87484 7.75505,-0.21787 53.41913,-115.30501 53.06132,-114.03739 -1.54162,5.46154 -1.00892,4.30871 -0.54189,0.14626 L 322.17232,168.5 H 349.5 v 82.5 82.5 h -22 -22 l -0.26195,-38.32102 c -0.30405,-44.48 7.24157,-55.84478 -0.8773,-38.24361 -11.37304,20.61415 -25.02431,56.46612 -37.2072,76.63979 C 266.40468,334.4775 262.28909,334 253.90061,334 c -11.19087,0 -12.7022,0.80941 -14.09141,-1.31463 z m -82.3413,-2.91541 C 157.20134,329.07148 157.09952,292.5 157.24162,248.5 l 0.25838,-80 58.25,-0.25806 c 55.01074,-0.24371 59.35516,-1.52083 59.35032,0.13946 -0.003,0.96693 -4.62864,12.78964 -10.28528,24.20363 L 254.96003,214.35034 227.97492,214 201.5,214.5 v 13.5 13.5 l 19.3529,0.27195 19.3529,0.27196 0.91723,0.0629 c 1.38257,0.0949 -3.92785,10.20835 -7.20338,17.07342 l -6.24989,13.09893 -13.33998,-0.0597 L 201.5,272.5 l -0.5,29 -0.5,29 -21.27373,0.26996 c -16.47548,0.20907 -21.38304,-0.0165 -21.75837,-1 z" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`brand brand-word-only ${dark ? "brand-on-dark" : ""}`}>
      <span className="brand-word">flii<span className="brand-dot">.app</span></span>
    </span>
  );
}
// Feedforward neural-net motif. Canvas, no libraries.
// Nodes are organised into layers on the centre/right; edges fan between
// adjacent layers; faint magenta signals propagate left-to-right through
// the net. Nodes breathe softly around their anchors. Tuned to read as
// AI architecture without competing with the headline.
function NodeNetwork({ mono = false, spread = false }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const BASE = mono ? [233, 230, 222] : [156, 150, 136], ACC = mono ? [233, 230, 222] : [231, 37, 90];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, layers = [];
    const ptr = { x: -9999, y: -9999, on: false };

    function build() {
      const mobile = W < 760;
      const counts = mobile ? [3, 4, 2] : [3, 5, 4, 2];
      const L = counts.length;
      const xStart = spread ? (mobile ? W * 0.08 : W * 0.07) : (mobile ? W * 0.16 : W * 0.44);
      const xEnd = W * 0.93;
      const yPad = H * 0.18, yspan = H - 2 * yPad;
      layers = counts.map((c, li) => {
        const x = xStart + (xEnd - xStart) * (li / (L - 1));
        return Array.from({ length: c }, (_, ni) => {
          const ty = c === 1 ? 0.5 : ni / (c - 1);
          const jitter = yspan / (c * 2.4);
          const ax = x + (Math.random() - 0.5) * 12;
          const ay = yPad + yspan * ty + (Math.random() - 0.5) * jitter;
          return { ax, ay, x: ax, y: ay, r: 1.5 + Math.random() * 1.2,
            ph: Math.random() * Math.PI * 2, amp: 1 + Math.random() * 1.3,
            dph: Math.random() * Math.PI * 2, damp: 5 + Math.random() * 7,
            gph: Math.random() * Math.PI * 2, gsp: 0.00035 + Math.random() * 0.0004,
            accent: li === L - 1 };
        });
      });
    }
    function size() {
      const r = wrap.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      // tiny fast breathing + very slow positional drift
      for (const layer of layers) for (const n of layer) {
        n.x = n.ax + Math.sin(t * 0.00022 + n.ph) * n.amp + Math.sin(t * 0.00007 + n.dph) * n.damp;
        n.y = n.ay + Math.cos(t * 0.00018 + n.ph * 1.3) * n.amp * 0.8 + Math.cos(t * 0.00006 + n.dph * 1.1) * n.damp * 0.8;
      }
      // faint static edges
      ctx.lineWidth = 1;
      for (let li = 0; li < layers.length - 1; li++) {
        for (const a of layers[li]) for (const b of layers[li + 1]) {
          ctx.strokeStyle = `rgba(${BASE[0]},${BASE[1]},${BASE[2]},0.07)`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // sparse, slow glow: each node peaks briefly and rarely, out of phase
      for (const layer of layers) for (const n of layer) {
        const c = n.accent ? ACC : BASE;
        const s = Math.sin(t * n.gsp + n.gph);
        let glow = s > 0 ? Math.pow(s, 6) : 0;
        if (ptr.on) { const d = Math.hypot(ptr.x - n.x, ptr.y - n.y); if (d < 130) glow = Math.max(glow, (1 - d / 130) * 0.7); }
        const hr = n.r * 4 * (0.6 + glow * 2);
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, hr);
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${0.025 + glow * (n.accent ? 0.20 : 0.15)})`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, hr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(0.85, 0.14 + glow * 0.6)})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    let raf = 0, running = false;
    const loop = (t) => { if (!running) return; frame(t); raf = requestAnimationFrame(loop); };
    const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const ro = new ResizeObserver(size); ro.observe(wrap); size();
    const io = new IntersectionObserver((e) => { e[0].isIntersecting ? start() : stop(); }, { threshold: 0 });
    const onVis = () => { document.hidden ? stop() : start(); };
    const onMove = (e) => { const r = wrap.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; };
    const onLeave = () => { ptr.on = false; ptr.x = ptr.y = -9999; };

    if (reduce) { frame(0); }
    else {
      io.observe(wrap);
      document.addEventListener("visibilitychange", onVis);
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerleave", onLeave);
      start();
    }
    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); wrap.removeEventListener("pointermove", onMove); wrap.removeEventListener("pointerleave", onLeave); };
  }, []);
  return <div className={"node-net" + (spread ? " node-net-loop" : "")} ref={wrapRef} aria-hidden><canvas ref={canvasRef} className="node-net-canvas" /></div>;
}
const CalIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4.5" width="18" height="16" rx="3" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /><path d="M12 13v4M10 15h4" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="10.5" width="16" height="10" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /><circle cx="12" cy="15.5" r="1.4" />
  </svg>
);
const UnlockIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="10.5" width="16" height="10" rx="2.5" /><path d="M8 10.5V7a4 4 0 0 1 7.5-1.8" /><circle cx="12" cy="15.5" r="1.4" />
  </svg>
);
/* ---------- nav + footer ---------- */
function Nav({ openConsult, admin, onLogin, onLogout }) {
  const { t, lang, setLang } = useLang();
  const [menu, setMenu] = useState(false);
  const [solOpen, setSolOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setMenu(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const top = [
    { label: t.nav.work, href: "#work" }, { label: t.nav.approach, href: "#loop" },
    { label: t.nav.about, href: "#about" }, { label: t.nav.insights, href: "#blog" }, { label: t.nav.contact, href: "#contact" },
  ];
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a href="#/" className="nav-brand" aria-label="Flii.app home" onClick={close}><FliiLogo variant={scrolled ? "mark" : "word"} /></a>
        <nav className="nav-links" aria-label="Primary">
          <div className="nav-item" onMouseEnter={() => setSolOpen(true)} onMouseLeave={() => setSolOpen(false)}>
            <button className="nav-link">{t.nav.solutions} <span className="caret">›</span></button>
            <div className={`mega ${solOpen ? "open" : ""}`}>
              <div className="mega-cols">
                {t.mega.groups.map((g) => (
                  <div key={g.group} className="mega-col">
                    <div className="mega-group mono">{g.group}</div>
                    <div className="mega-blurb">{g.blurb}</div>
                    {g.items.map((it) => <a key={it.label} href={it.href} className="mega-link"><span className="mega-link-t">{it.label}</span><span className="mega-link-d">{it.desc}</span></a>)}
                  </div>
                ))}
              </div>
              <a href="#loop" className="mega-feature"><span className="mono mega-feature-k">{t.mega.featureK}</span><span className="mega-feature-t">{t.mega.featureT}</span></a>
            </div>
          </div>
          {top.map((n) => <a key={n.label} href={n.href} className="nav-link">{n.label}</a>)}
        </nav>
        <div className="nav-cta"><button onClick={openConsult} className="btn btn-primary btn-sm">{t.nav.consult}</button></div>
        <button className={`burger ${menu ? "on" : ""}`} aria-label="Menu" onClick={() => setMenu((m) => !m)}><span/><span/><span/></button>
      </div>
      {menu && (
        <div className="mobile-menu">
          {t.mega.groups.map((g) => (
            <div key={g.group} className="mobile-group">
              <div className="mobile-group-k mono">{g.group}</div>
              {g.items.map((it) => <a key={it.label} href={it.href} onClick={close}>{it.label}</a>)}
            </div>
          ))}
          {top.map((n) => <a key={n.label} href={n.href} onClick={close} className="mobile-top">{n.label}</a>)}
          {admin && <a href="#/cms" onClick={close} className="btn btn-ghost mobile-cms">{t.nav.manage}</a>}
          <button className="btn btn-primary" onClick={(e) => { close(); openConsult(e); }}>{t.nav.consult}</button>
          <div className="mobile-foot">
            <div className="lang-toggle" role="group" aria-label="Language">
              <button className={`lang-btn ${lang === "nl" ? "on" : ""}`} onClick={() => setLang("nl")}>NL</button>
              <button className={`lang-btn ${lang === "en" ? "on" : ""}`} onClick={() => setLang("en")}>EN</button>
            </div>
            {admin
              ? <button className="mobile-login" onClick={() => { close(); onLogout(); }}><UnlockIcon /><span>{t.login.logoutAria}</span></button>
              : <button className="mobile-login" onClick={() => { close(); onLogin(); }}><LockIcon /><span>{t.login.loginAria}</span></button>}
          </div>
        </div>
      )}
    </header>
  );
}
function Footer({ admin }) {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div><a href="#/" aria-label="Flii.app home"><FliiLogo dark variant="word" /></a><p className="footer-note">{t.slogan}.</p></div>
        <div className="footer-col"><div className="footer-h mono">{t.footer.solutions}</div>{t.mega.groups.flatMap((g) => g.items).map((c) => <a key={c.label} href={c.href}>{c.label}</a>)}</div>
        <div className="footer-col"><div className="footer-h mono">{t.footer.company}</div>{t.footer.company_links.filter((c) => c.href !== "#/cms" || admin).map((c) => <a key={c.label} href={c.href}>{c.label}</a>)}</div>
        <div className="footer-col"><div className="footer-h mono">{t.footer.connect}</div><a href="#">LinkedIn</a><a href="#">Instagram</a><a href="mailto:hello@flii.app">hello@flii.app</a></div>
      </div>
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Flii.app</span><span className="mono">{t.footer.bottom}</span></div>
    </footer>
  );
}

/* ---------- dock bar (fixed bottom) ---------- */
function DockBar({ openConsult, admin, onLogin, onLogout }) {
  const { t, lang, setLang } = useLang();
  return (
    <div className="dockbar">
      <div className="lang-toggle" role="group" aria-label="Language">
        <button className={`lang-btn ${lang === "nl" ? "on" : ""}`} onClick={() => setLang("nl")}>NL</button>
        <button className={`lang-btn ${lang === "en" ? "on" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>
      <div className="dock-right">
        <button className="dock-consult" onClick={openConsult} aria-label={t.nav.consult}>
          <CalIcon /><span className="dock-consult-label">{t.nav.consult}</span>
        </button>
        {admin
          ? <button className="icon-btn admin-btn on dock-login" onClick={onLogout} aria-label={t.login.logoutAria} title={t.login.logoutAria}><UnlockIcon /></button>
          : <button className="icon-btn admin-btn dock-login" onClick={onLogin} aria-label={t.login.loginAria} title={t.login.loginAria}><LockIcon /></button>}
      </div>
    </div>
  );
}

/* ---------- home ---------- */
/* ---------- Flii Loop cyclic diagram ---------- */
function LoopDiagram() {
  const { t } = useLang();
  const items = t.loop.items;
  const [hover, setHover] = useState(null);
  const C = 200, R = 140;
  const pts = [[C, C - R], [C + R, C], [C, C + R], [C - R, C]];
  const labels = [[C, C - R - 22], [C + R + 16, C], [C, C + R + 30], [C - R - 16, C]];
  const anchors = ["middle", "start", "middle", "end"];
  return (
    <div className="loop-diagram-inner">
      <svg className="loop-svg" viewBox="-100 -10 600 420" role="img" aria-label="Flii Loop">
        <circle cx={C} cy={C} r={R} className="loop-ring" />
        {[-45, 45, 135, 225].map((deg, i) => {
          const a = deg * Math.PI / 180, x = C + R * Math.cos(a), y = C + R * Math.sin(a);
          return <path key={i} className="loop-arrow" d="M-5,-4 L4,0 L-5,4" transform={`translate(${x},${y}) rotate(${deg + 90})`} />;
        })}
        <g className="loop-spin"><circle cx={C} cy={C - R} r="5.5" className="loop-dot" /></g>
        {pts.map((p, i) => (
          <g key={i} className={`loop-node-g ${hover === i ? "on" : ""}`} tabIndex={0}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
            <circle cx={p[0]} cy={p[1]} r="26" className="loop-hit" />
            <circle cx={p[0]} cy={p[1]} r="11" className={`loop-node ${i === items.length - 1 ? "loop-node-acc" : ""}`} />
            <text x={p[0]} y={p[1]} className="loop-node-n" textAnchor="middle" dominantBaseline="central">{i + 1}</text>
            <text x={labels[i][0]} y={labels[i][1]} className="loop-label" textAnchor={anchors[i]} dominantBaseline="central">{items[i].k}</text>
          </g>
        ))}
      </svg>
      <div className="loop-tip" aria-hidden>
        {hover !== null ? (
          <><span className="loop-tip-h">{items[hover].k}</span><span className="loop-tip-d">{items[hover].body}</span></>
        ) : (
          <><span className="loop-tip-h">Flii Loop</span><span className="loop-tip-s mono">{t.loop.center}</span></>
        )}
      </div>
    </div>
  );
}

/* ---------- Flii Loop glowing ring mark ---------- */
function FliiLoopMark() {
  const [reduce] = useState(() => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  return (
    <span className="loopmark" aria-hidden>
      <svg className="loopmark-svg" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="lmGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B14BFF" />
            <stop offset="28%" stopColor="#E7255A" />
            <stop offset="50%" stopColor="#FF5E9A" />
            <stop offset="64%" stopColor="#FFD2E4" />
            <stop offset="80%" stopColor="#FF3D8E" />
            <stop offset="100%" stopColor="#C04BFF" />
          </linearGradient>
          <filter id="lmFire" x="-60%" y="-60%" width="220%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022 0.04" numOctaves="2" seed="4" result="n">
              {!reduce && <animate attributeName="baseFrequency" dur="6s" values="0.022 0.04;0.03 0.052;0.02 0.034;0.022 0.04" repeatCount="indefinite" />}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G">
              {!reduce && <animate attributeName="scale" dur="5s" values="8;12.5;9;8" repeatCount="indefinite" />}
            </feDisplacementMap>
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <filter id="lmGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4" /></filter>
        </defs>
        <g className={reduce ? "" : "lm-rot"}>
          <circle cx="50" cy="50" r="35" fill="none" stroke="url(#lmGrad)" strokeWidth="7" filter="url(#lmGlow)" opacity="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="url(#lmGrad)" strokeWidth="5" filter="url(#lmFire)" />
        </g>
        <g className={reduce ? "" : "lm-rot2"}>
          <circle cx="50" cy="50" r="32" fill="none" stroke="url(#lmGrad)" strokeWidth="3" filter="url(#lmFire)" opacity="0.85" />
        </g>
      </svg>
    </span>
  );
}

function Marquee({ items, render, className = "", duration = 32 }) {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
        {[0, 1].map((copy) => items.map((it, i) => (
          <div className="marquee-item" key={`${copy}-${i}`} aria-hidden={copy === 1 ? true : undefined}>{render(it, copy === 1)}</div>
        )))}
      </div>
    </div>
  );
}
function Home({ content, openConsult }) {
  const { t } = useLang();
  const { apps, articles, reviews, certs } = content;
  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1) : "5.0";
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-bg" aria-hidden><NodeNetwork /></div>
        <div className="wrap hero-inner">
          <div className="hero-kicker mono"><span className="hero-dot" aria-hidden />{t.slogan}</div>
          <h1 className="display hero-h1">{t.hero.pre}<span className="hl">{t.hero.mark}</span>{t.hero.post}</h1>
          <p className="hero-sub">{t.hero.sub}</p>
          <div className="hero-actions">
            <button onClick={openConsult} className="btn btn-primary">{t.hero.primary}</button>
            <a href="#loop" className="loop-cta" aria-label={t.hero.loopCta}>
              <FliiLoopMark />
              <span className="loop-cta-t">{t.hero.loopCta} <span className="loop-cta-arrow" aria-hidden>↘</span></span>
            </a>
          </div>
        </div>
        <a href="#solutions" className="hero-scroll mono" aria-label="Scroll"><span>scroll</span><span className="hero-scroll-line" aria-hidden /></a>
      </section>

      <Section className="brandwall-wrap">
        <div className="wrap">
          <div className="brandwall-label mono">{t.brandsLabel}</div>
          <Marquee className="brand-marquee" items={BRANDS} duration={34} render={(b) => <span className="marquee-brand">{b}</span>} />
        </div>
      </Section>

      <section className="band" id="solutions">
        <div className="wrap">
          <Section><div className="eyebrow">{t.services.eyebrow}</div><h2 className="display h2">{t.services.h2}</h2><p className="lede">{t.services.lede}</p></Section>
          <div className="service-grid">
            {t.services.items.map((s, i) => (
              <Section key={i} className="service" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="service-n mono">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="service-title">{s.title}</h3>
                <p className="service-body">{s.body}</p>
                <button onClick={openConsult} className="service-link">{t.services.cta}</button>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* CREDENTIAL BADGES */}
      <Section className="creds">
        <div className="wrap">
          <div className="creds-label mono">{t.certsLabel}</div>
          <Marquee className="cred-marquee" items={certs} duration={28} render={(c, dup) => (
            <a href={`#/cert/${c.id}`} className="marquee-cred" tabIndex={dup ? -1 : undefined}>
              <span className="cred-seal" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={MAG} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <span className="marquee-cred-name">{c.name}</span>
              <span className="marquee-cred-tier mono">{c.tier}</span>
            </a>
          )} />
        </div>
      </Section>

      <section className="stats">
        <div className="wrap stats-grid">
          {t.stats.map((s, i) => (
            <Section key={i} className="stat" style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="display stat-value"><Counter value={s.value} suffix={s.suffix} /></div>
              <div className="stat-label mono">{s.label}</div>
            </Section>
          ))}
        </div>
      </section>

      <section className="band band-dark band-loop" id="loop">
        <div className="loop-bg" aria-hidden><NodeNetwork mono spread /></div>
        <div className="wrap">
          <Section><div className="eyebrow on-dark">{t.loop.eyebrow}</div><h2 className="display h2 on-dark">{t.loop.h2}</h2><p className="lede on-dark-soft">{t.loop.lede}</p></Section>
          <div className="loop-cycle">
            <Section className="loop-diagram"><LoopDiagram /></Section>
            <Section className="loop-steps">
              {t.loop.items.map((l, i) => (
                <div key={i} className="loop-step">
                  <div className="loop-step-n mono">{String(i + 1).padStart(2, "0")}</div>
                  <div><h3 className="loop-step-h">{l.k}</h3><p className="loop-step-b">{l.body}</p></div>
                </div>
              ))}
            </Section>
          </div>
        </div>
      </section>

      <section className="band" id="work">
        <div className="wrap">
          <Section className="work-head"><div><div className="eyebrow">{t.work.eyebrow}</div><h2 className="display h2">{t.work.h2}</h2></div><a href="#/cms" className="btn btn-ghost">{t.work.manage}</a></Section>
          <div className="work-grid">
            {apps.slice(0, 4).map((w, i) => (
              <Section key={w.id} className="work-card" style={{ transitionDelay: `${i * 70}ms` }}>
                <a href={`#/app/${w.id}`} className="work-link">
                  <div className="work-meta mono">{w.client} · {w.tag}</div>
                  <h3 className="work-title">{w.title}</h3>
                  <p className="work-note">{w.summary}</p>
                  <div className="work-thumb" aria-hidden />
                  <span className="work-cta">{t.work.view}</span>
                </a>
              </Section>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-mist">
        <div className="wrap">
          <Section className="quotes-head">
            <div><div className="eyebrow">{t.reviews.eyebrow}</div><h2 className="display h2">{t.reviews.h2}</h2></div>
          </Section>
          <Section>
            <div className="byline">
              <div className="byline-brand"><FliiLogo variant="word" /></div>
              <a href="https://flii.nl" target="_blank" rel="noreferrer" className="byline-right">
                <span className="byline-by">{t.byline.by} <span className="byline-name">{t.byline.name}</span> <span className="byline-arrow" aria-hidden>↗</span></span>
                <span className="rating-badge"><span className="rating-stars" aria-hidden>★★★★★</span><span className="rating-meta"><strong>{avg}</strong><span className="mono">{reviews.length} {t.reviews.word}</span></span></span>
              </a>
            </div>
          </Section>
          <div className="quote-grid">
            {reviews.slice(0, 6).map((q, i) => (
              <Section key={q.id} className="quote-card" style={{ transitionDelay: `${i * 70}ms` }}>
                <a href={`#/review/${q.id}`} className="quote-link">
                  <p className="quote-text">“{q.quote}”</p>
                  <div className="quote-by"><div className="quote-avatar" aria-hidden>{q.name.charAt(0)}</div><div><div className="quote-name">{q.name}</div><div className="quote-role mono">{q.role} · {q.org}</div></div></div>
                </a>
              </Section>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="about">
        <div className="wrap">
          <Section><div className="eyebrow">{t.who.eyebrow}</div><h2 className="display h2">{t.who.h2}</h2><p className="lede">{t.who.lede}</p></Section>
          <div className="aud-grid">{t.who.items.map((a, i) => <Section key={i} className="aud" style={{ transitionDelay: `${i * 70}ms` }}><h3 className="aud-h">{a.h}</h3><p className="aud-b">{a.b}</p></Section>)}</div>
        </div>
      </section>

      <section className="band band-dark">
        <div className="wrap">
          <Section><div className="eyebrow on-dark">{t.steps.eyebrow}</div><h2 className="display h2 on-dark">{t.steps.h2}</h2></Section>
          <div className="steps-grid">{t.steps.items.map((s, i) => <Section key={i} className="step" style={{ transitionDelay: `${i * 70}ms` }}><div className="step-n mono">{s.n}</div><h3 className="step-h on-dark">{s.h}</h3><p className="step-b on-dark-soft">{s.b}</p></Section>)}</div>
        </div>
      </section>

      <section className="band" id="blog">
        <div className="wrap">
          <Section className="work-head"><div><div className="eyebrow">{t.insights.eyebrow}</div><h2 className="display h2">{t.insights.h2}</h2></div><a href="#/cms" className="btn btn-ghost">{t.insights.manage}</a></Section>
          <div className="post-grid">
            {articles.slice(0, 3).map((p, i) => (
              <Section key={p.id} className="post" style={{ transitionDelay: `${i * 70}ms` }}>
                <a href={`#/insight/${p.id}`} className="post-link">
                  <div className="post-thumb" aria-hidden />
                  <div className="post-meta mono">{p.cat} · {p.date}</div>
                  <h3 className="post-title">{p.title}</h3>
                  <p className="post-body">{p.excerpt}</p>
                  <span className="service-link">{t.insights.read}</span>
                </a>
              </Section>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band" id="contact">
        <div className="wrap cta-inner">
          <Section>
            <h2 className="display cta-h">{t.cta.h2}</h2>
            <p className="cta-sub">{t.cta.sub}</p>
            <div className="hero-actions"><button onClick={openConsult} className="btn btn-primary">{t.cta.primary}</button><button onClick={openConsult} className="btn btn-ghost">{t.cta.secondary}</button></div>
          </Section>
          <Section className="contact-grid">
            {t.contact.map((c) => <div key={c.k} className="contact-item"><div className="contact-k mono">{c.k}</div>{c.href ? <a href={c.href} className="contact-v contact-link">{c.v}</a> : <div className="contact-v">{c.v}</div>}</div>)}
          </Section>
        </div>
      </section>
    </>
  );
}

/* ---------- detail pages ---------- */
const paras = (s) => (s || "").split("\n\n").filter(Boolean);
function NotFound({ back }) { const { t } = useLang(); return <section className="detail"><div className="wrap"><a href={back} className="back">{t.detail.backHome}</a><h1 className="display detail-h">{t.detail.notFound}</h1><p className="lede">{t.detail.notFoundSub}</p></div></section>; }
function AppDetail({ content, id }) {
  const { t } = useLang(); const a = content.apps.find((x) => x.id === id);
  if (!a) return <NotFound back="#work" />;
  return (
    <article className="detail"><div className="wrap">
      <a href="#work" className="back">{t.detail.backShowcase}</a>
      <div className="detail-meta mono">{a.client} · {a.tag}</div>
      <h1 className="display detail-h">{a.title}</h1>
      <p className="detail-lede">{a.summary}</p>
      <div className="detail-hero" aria-hidden />
      {a.metrics && a.metrics.length > 0 && <div className="detail-metrics">{a.metrics.map((m, i) => <div key={i} className="dm"><div className="display dm-v">{m.value}</div><div className="dm-l mono">{m.label}</div></div>)}</div>}
      <div className="detail-body">{paras(a.body).map((p, i) => <p key={i}>{p}</p>)}</div>
      {a.link && a.link !== "#" && <a href={a.link} className="btn btn-primary" target="_blank" rel="noreferrer">{t.detail.visit} {a.title} ↗</a>}
    </div></article>
  );
}
function ArticleDetail({ content, id }) {
  const { t } = useLang(); const a = content.articles.find((x) => x.id === id);
  if (!a) return <NotFound back="#blog" />;
  return (
    <article className="detail detail-narrow"><div className="wrap">
      <a href="#blog" className="back">{t.detail.backInsights}</a>
      <div className="detail-meta mono">{a.cat} · {a.date}</div>
      <h1 className="display detail-h">{a.title}</h1>
      <p className="detail-lede">{a.excerpt}</p>
      <div className="detail-body">{paras(a.body).map((p, i) => <p key={i}>{p}</p>)}</div>
    </div></article>
  );
}
function ReviewDetail({ content, id }) {
  const { t } = useLang(); const r = content.reviews.find((x) => x.id === id);
  if (!r) return <NotFound back="#/" />;
  return (
    <article className="detail detail-narrow"><div className="wrap">
      <a href="#/" className="back" onClick={(e) => { e.preventDefault(); window.location.hash = "#/"; }}>{t.detail.backHome}</a>
      <div className="rating-stars big" aria-hidden>{"★".repeat(r.rating || 5)}{"☆".repeat(5 - (r.rating || 5))}</div>
      <h1 className="display detail-quote">“{r.quote}”</h1>
      <div className="detail-by"><div className="quote-avatar lg" aria-hidden>{r.name.charAt(0)}</div><div><div className="quote-name lg">{r.name}</div><div className="quote-role mono">{r.role} · {r.org}</div></div></div>
    </div></article>
  );
}
function CertDetail({ content, id }) {
  const { t } = useLang(); const c = content.certs.find((x) => x.id === id);
  if (!c) return <NotFound back="#/" />;
  return (
    <article className="detail detail-narrow"><div className="wrap">
      <a href="#/" className="back" onClick={(e) => { e.preventDefault(); window.location.hash = "#/"; }}>{t.detail.backHome}</a>
      <div className="detail-meta mono">{c.tier}</div>
      <h1 className="display detail-h">{c.name}</h1>
      <p className="detail-lede">{c.blurb}</p>
      {c.href && c.href !== "#" && <a href={c.href} className="btn btn-primary" target="_blank" rel="noreferrer">{t.detail.credential}</a>}
    </div></article>
  );
}

/* ---------- CMS ---------- */
function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="field"><span className="field-l">{label}</span>
      {type === "textarea" ? <textarea className="field-i" rows={6} value={value} onChange={(e) => onChange(e.target.value)} /> : <input className="field-i" type={type} value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}
function Editor({ coll, item, onSave, onCancel }) {
  const { t } = useLang(); const f = t.cms.f;
  const [d, setD] = useState(item);
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const save = () => {
    let out = { ...d };
    if (!out.id) out.id = slugify(coll === "reviews" ? (out.name || "review") : (out.title || out.name || "item"));
    if (coll === "reviews") out.rating = Math.max(1, Math.min(5, parseInt(out.rating, 10) || 5));
    onSave(out);
  };
  return (
    <div className="editor">
      {coll === "reviews" && <>
        <Field label={f.quote} value={d.quote || ""} onChange={(v) => set("quote", v)} type="textarea" />
        <Field label={f.name} value={d.name || ""} onChange={(v) => set("name", v)} />
        <Field label={f.role} value={d.role || ""} onChange={(v) => set("role", v)} />
        <Field label={f.org} value={d.org || ""} onChange={(v) => set("org", v)} />
        <Field label={f.rating} value={d.rating ?? 5} onChange={(v) => set("rating", v)} type="number" />
      </>}
      {coll === "certs" && <>
        <Field label={f.certName} value={d.name || ""} onChange={(v) => set("name", v)} />
        <Field label={f.tier} value={d.tier || ""} onChange={(v) => set("tier", v)} />
        <Field label={f.blurb} value={d.blurb || ""} onChange={(v) => set("blurb", v)} type="textarea" />
        <Field label={f.link} value={d.href || ""} onChange={(v) => set("href", v)} />
      </>}
      {coll === "apps" && <>
        <Field label={f.title} value={d.title || ""} onChange={(v) => set("title", v)} />
        <Field label={f.client} value={d.client || ""} onChange={(v) => set("client", v)} />
        <Field label={f.tag} value={d.tag || ""} onChange={(v) => set("tag", v)} />
        <Field label={f.summary} value={d.summary || ""} onChange={(v) => set("summary", v)} type="textarea" />
        <Field label={f.body} value={d.body || ""} onChange={(v) => set("body", v)} type="textarea" />
        <Field label={f.link} value={d.link || ""} onChange={(v) => set("link", v)} />
        <Field label={f.metrics} value={(d.metrics || []).map((m) => `${m.label}:${m.value}`).join(", ")}
          onChange={(v) => set("metrics", v.split(",").map((s) => s.trim()).filter(Boolean).map((s) => { const [label, ...r] = s.split(":"); return { label: (label || "").trim(), value: r.join(":").trim() }; }))} type="textarea" />
      </>}
      {coll === "articles" && <>
        <Field label={f.title} value={d.title || ""} onChange={(v) => set("title", v)} />
        <Field label={f.category} value={d.cat || ""} onChange={(v) => set("cat", v)} />
        <Field label={f.date} value={d.date || ""} onChange={(v) => set("date", v)} />
        <Field label={f.excerpt} value={d.excerpt || ""} onChange={(v) => set("excerpt", v)} type="textarea" />
        <Field label={f.body} value={d.body || ""} onChange={(v) => set("body", v)} type="textarea" />
      </>}
      <div className="editor-actions"><button className="btn btn-primary btn-sm" onClick={save}>{t.cms.save}</button><button className="btn btn-ghost btn-sm" onClick={onCancel}>{t.cms.cancel}</button></div>
    </div>
  );
}
function CMS({ content }) {
  const { t } = useLang();
  const { data, upsert, remove, reset, status } = content;
  const [tab, setTab] = useState("apps");
  const [editing, setEditing] = useState(null);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const tabs = [
    { key: "reviews", label: t.cms.tabs.reviews, title: (x) => x.name },
    { key: "certs", label: t.cms.tabs.certs, title: (x) => x.name },
    { key: "apps", label: t.cms.tabs.apps, title: (x) => x.title },
    { key: "articles", label: t.cms.tabs.articles, title: (x) => x.title },
  ];
  const meta = tabs.find((x) => x.key === tab);
  const list = data[tab] || [];
  const pageFor = (it) => ({ reviews: "review", certs: "cert", apps: "app", articles: "insight" }[tab]) + "/" + it.id;
  return (
    <section className="cms">
      <div className="wrap">
        <a href="#/" className="back">{t.cms.back}</a>
        <div className="cms-head">
          <div>
            <div className="eyebrow">{t.cms.eyebrow}</div>
            <h1 className="display detail-h">{t.cms.h1}</h1>
            <div className={`cms-status cms-status-${status}`}><span className="cms-dot" />{t.cms.status[status] || t.cms.status.local}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { if (confirm(t.cms.confirmReset)) { reset(); setEditing(null); } }}>{t.cms.reset}</button>
        </div>
        <div className="cms-tabs">
          {tabs.map((x) => <button key={x.key} className={`cms-tab ${tab === x.key ? "on" : ""}`} onClick={() => { setTab(x.key); setEditing(null); }}>{x.label} <span className="cms-count">{(data[x.key] || []).length}</span></button>)}
        </div>
        {editing ? (
          <Editor coll={tab} item={editing} onSave={(it) => { upsert(tab, it); setEditing(null); }} onCancel={() => setEditing(null)} />
        ) : (
          <>
            <button className="btn btn-primary btn-sm cms-add" onClick={() => setEditing({})}>{t.cms.newPrefix}{meta.label}</button>
            <div className="cms-list">
              {list.map((it) => (
                <div key={it.id} className="cms-row">
                  <div className="cms-row-main"><div className="cms-row-t">{meta.title(it)}</div><div className="cms-row-s mono">{it.id}</div></div>
                  <div className="cms-row-actions">
                    <a className="cms-link" href={`#/${pageFor(it)}`}>{t.cms.view}</a>
                    <button className="cms-link" onClick={() => setEditing(it)}>{t.cms.edit}</button>
                    <button className="cms-link danger" onClick={() => { if (confirm(t.cms.confirmDelete)) remove(tab, it.id); }}>{t.cms.del}</button>
                  </div>
                </div>
              ))}
              {list.length === 0 && <div className="cms-empty">{t.cms.empty}</div>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------- admin login ---------- */
function LoginModal({ onClose, onSuccess }) {
  const { t } = useLang(); const L = t.login;
  const [pin, setPin] = useState(""); const [err, setErr] = useState(false);
  const submit = () => { if (pin === "8008") { onSuccess(); onClose(); } else { setErr(true); setPin(""); } };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-label={L.title} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="eyebrow">{L.eyebrow}</div>
        <h3 className="display modal-h">{L.title}</h3>
        <div className="modal-form">
          <input className="field-i pin-input" type="password" inputMode="numeric" autoFocus maxLength={8}
            value={pin} placeholder={L.placeholder}
            onChange={(e) => { setPin(e.target.value); setErr(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
          {err && <div className="pin-err mono">{L.error}</div>}
        </div>
        <div className="modal-form-actions">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{L.cancel}</button>
          <button className="btn btn-primary btn-sm" onClick={submit}>{L.submit}</button>
        </div>
      </div>
    </div>
  );
}
function LockedNotice({ onLogin }) {
  const { t } = useLang();
  return (
    <section className="detail"><div className="wrap">
      <a href="#/" className="back">{t.detail.backHome}</a>
      <div className="eyebrow">{t.login.eyebrow}</div>
      <h1 className="display detail-h">{t.login.lockedH}</h1>
      <p className="lede" style={{ marginBottom: 28 }}>{t.login.lockedSub}</p>
      <button className="btn btn-primary" onClick={onLogin}>{t.login.submit}</button>
    </div></section>
  );
}

/* ---------- consultation modal (2 steps) ---------- */
function ConsultModal({ onClose }) {
  const { t } = useLang();
  const c = t.consult;
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState("");
  const opt = c.opts.find((o) => o.id === reason);
  const choose = (id) => { setReason(id); setStep(2); };
  const canSend = email.trim().length > 0 && detail.trim().length > 0;
  const send = () => {
    const subject = c.subject[reason] || c.eyebrow;
    const body = [
      opt ? opt.t : "",
      "",
      `${c.name}: ${name}`,
      `${c.email}: ${email}`,
      "",
      `${c.detail[reason]}:`,
      detail,
    ].join("\n");
    window.location.href = `mailto:hello@flii.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={c.eyebrow} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="eyebrow">{c.eyebrow}</div>
        {step === 1 ? (
          <>
            <h3 className="display modal-h">{c.h}</h3>
            <div className="modal-opts">
              {c.opts.map((o) => (
                <button key={o.id} className="modal-opt" onClick={() => choose(o.id)}>
                  <span className="modal-opt-t">{o.t}</span>
                  <span className="modal-opt-d mono">{o.d}</span>
                  <span className="modal-opt-arrow" aria-hidden>→</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="display modal-h">{c.formH}</h3>
            <div className="modal-form">
              <label className="field"><span className="field-l">{c.name}</span><input className="field-i" value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label className="field"><span className="field-l">{c.email}</span><input className="field-i" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <label className="field"><span className="field-l">{c.detail[reason]}</span><textarea className="field-i" rows={4} placeholder={c.detailPh[reason]} value={detail} onChange={(e) => setDetail(e.target.value)} /></label>
            </div>
            <div className="modal-form-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>{c.back}</button>
              <button className="btn btn-primary btn-sm" onClick={send} disabled={!canSend}>{c.send}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- root ---------- */
export default function FliiSite() {
  const content = useContent();
  const route = useRoute();
  const [consult, setConsult] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [admin, setAdmin] = useState(() => { try { return sessionStorage.getItem("flii_admin") === "1"; } catch (e) { return false; } });
  const [lang, setLangState] = useState(() => { try { return localStorage.getItem("flii_lang") || "nl"; } catch (e) { return "nl"; } });
  const setLang = (l) => { setLangState(l); try { localStorage.setItem("flii_lang", l); } catch (e) {} };
  const t = I18N[lang] || I18N.nl;
  const openConsult = (e) => { if (e) e.preventDefault(); setConsult(true); };
  const grantAdmin = () => { setAdmin(true); try { sessionStorage.setItem("flii_admin", "1"); } catch (e) {} };
  const logout = () => { setAdmin(false); try { sessionStorage.removeItem("flii_admin"); } catch (e) {} if (route.name === "cms") window.location.hash = "#/"; };
  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") { setConsult(false); setLoginOpen(false); } }; window.addEventListener("keydown", onKey); document.body.style.overflow = (consult || loginOpen) ? "hidden" : ""; return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; }; }, [consult, loginOpen]);
  useEffect(() => { if (route.name !== "home") window.scrollTo(0, 0); }, [route.name, route.id]);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <div className="flii-root">
        <style>{CSS}</style>
        <Nav openConsult={openConsult} admin={admin} onLogin={() => setLoginOpen(true)} onLogout={logout} />
        {route.name === "home" && <Home content={content.data} openConsult={openConsult} />}
        {route.name === "cms" && (admin ? <CMS content={content} /> : <LockedNotice onLogin={() => setLoginOpen(true)} />)}
        {route.name === "app" && <AppDetail content={content.data} id={route.id} />}
        {route.name === "insight" && <ArticleDetail content={content.data} id={route.id} />}
        {route.name === "review" && <ReviewDetail content={content.data} id={route.id} />}
        {route.name === "cert" && <CertDetail content={content.data} id={route.id} />}
        <Footer admin={admin} />
        <DockBar openConsult={openConsult} admin={admin} onLogin={() => setLoginOpen(true)} onLogout={logout} />
        {consult && <ConsultModal onClose={() => setConsult(false)} />}
        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSuccess={grantAdmin} />}
      </div>
    </LangCtx.Provider>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
.flii-root{
  --ink:#171717; --dark:#171717; --dark-2:#1E1E1E;
  --mag:#E7255A; --paper:#F3F1EB; --card:#FBFAF7; --mist:#EAE7DF; --line:#E2DED3;
  --mid:#5C5A52; --soft:#8B887E; --max:1180px; --dock:54px;
  color:var(--ink); background:var(--paper); font-family:'Inter',system-ui,sans-serif; line-height:1.6;
  -webkit-font-smoothing:antialiased; overflow-x:hidden; padding-bottom:var(--dock);
}
.flii-root *{box-sizing:border-box;}
.wrap{max-width:var(--max);margin:0 auto;padding:0 24px;}
.display{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;letter-spacing:-0.02em;line-height:1.02;}
.mono{font-family:'IBM Plex Mono',monospace;}
a{color:inherit;text-decoration:none;}
button{font-family:inherit;}
.eyebrow{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:var(--mid);margin-bottom:16px;}
.eyebrow::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--mag);margin-right:9px;vertical-align:middle;}
.eyebrow.on-dark{color:#C9C6BD;}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:14px 22px;border-radius:999px;transition:transform .18s,background .18s,color .18s;border:1px solid transparent;cursor:pointer;}
.btn-sm{padding:10px 18px;font-size:14px;}
.btn-primary{background:var(--ink);color:var(--paper);}
.btn-primary:hover{transform:translateY(-2px);background:var(--mag);color:#fff;}
.btn-ghost{background:transparent;border-color:var(--line);color:var(--ink);}
.btn-ghost:hover{border-color:var(--ink);transform:translateY(-2px);}

/* nav */
.nav{position:sticky;top:0;z-index:50;background:rgba(243,241,235,0.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:70px;gap:16px;}
.brand{display:inline-flex;align-items:center;gap:9px;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:23px;letter-spacing:-0.03em;color:var(--ink);}
.logo-mark{width:30px;height:30px;display:block;flex:none;}
.brand-word{line-height:1;}.brand-dot{color:var(--mag);}.brand-on-dark{color:var(--paper);}
.nav-links{display:flex;align-items:center;gap:4px;margin-left:auto;}
.nav-item{position:relative;}
.nav-link{background:none;border:none;font:inherit;font-size:15px;font-weight:500;color:var(--mid);padding:8px 14px;border-radius:8px;cursor:pointer;transition:color .15s;}
.nav-link:hover{color:var(--mag);}
.caret{display:inline-block;transform:rotate(90deg);font-size:11px;opacity:.6;}
.mega{position:absolute;top:calc(100% + 8px);left:-12px;width:520px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;box-shadow:0 30px 60px -24px rgba(23,23,23,0.28);opacity:0;visibility:hidden;transform:translateY(8px);transition:all .2s;display:grid;gap:14px;}
.mega.open{opacity:1;visibility:visible;transform:translateY(0);}
.mega-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.mega-col{padding:6px;}
.mega-group{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--mag);margin-bottom:4px;}
.mega-blurb{font-size:12.5px;color:var(--soft);margin-bottom:12px;}
.mega-link{display:flex;flex-direction:column;gap:2px;padding:9px 11px;border-radius:11px;transition:background .15s;}
.mega-link:hover{background:var(--paper);}
.mega-link-t{font-size:14.5px;font-weight:600;color:var(--ink);}.mega-link-d{font-size:12px;color:var(--mid);}
.mega-feature{display:flex;flex-direction:column;gap:3px;padding:14px 16px;border-radius:13px;background:var(--ink);color:var(--paper);}
.mega-feature-k{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--mag);}.mega-feature-t{font-size:14px;font-weight:600;}
.nav-cta{display:flex;}
.icon-btn{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:10px;border:none;background:transparent;color:var(--mid);cursor:pointer;transition:all .15s;flex:none;}
.icon-btn:hover{color:var(--ink);background:rgba(23,23,23,0.05);}
.admin-btn.on{color:var(--mag);}
.admin-btn.on:hover{color:var(--mag);background:rgba(231,37,90,0.08);}
.pin-input{letter-spacing:0.35em;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:18px;}
.pin-err{color:var(--mag);font-size:12px;}
.modal-sm{max-width:380px;}
.burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:9px;border-radius:10px;transition:background .15s;}
.burger:hover{background:rgba(23,23,23,0.05);}
.burger span{width:22px;height:2px;background:var(--ink);border-radius:2px;transition:transform .2s,opacity .2s;}
.burger.on span:nth-child(1){transform:translateY(7px) rotate(45deg);}
.burger.on span:nth-child(2){opacity:0;}
.burger.on span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
.mobile-menu{display:flex;flex-direction:column;gap:2px;padding:18px 24px 26px;border-bottom:1px solid var(--line);background:var(--card);}
.mobile-group{display:flex;flex-direction:column;}
.mobile-group-k{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--mag);margin:12px 0 4px;}
.mobile-group a{padding:9px 14px;font-size:15px;color:var(--mid);}
.mobile-top{padding:11px 6px;font-size:16px;font-weight:500;color:var(--ink);border-top:1px solid var(--mist);}
.mobile-cms{margin-top:14px;}
.mobile-menu .btn{margin-top:12px;justify-content:center;}

/* hero */
.hero{position:relative;padding:96px 0 104px;overflow:hidden;}
.hero-bg{position:absolute;inset:0;z-index:0;background:radial-gradient(58% 58% at 84% 12%,rgba(231,37,90,0.10),rgba(231,37,90,0) 70%);}
.node-net{position:absolute;inset:0;}
.node-net-canvas{display:block;width:100%;height:100%;-webkit-mask-image:linear-gradient(102deg,transparent 0%,rgba(0,0,0,0.08) 34%,#000 68%);mask-image:linear-gradient(102deg,transparent 0%,rgba(0,0,0,0.08) 34%,#000 68%);}
.band-loop{position:relative;overflow:hidden;}
.band-loop>.wrap{position:relative;z-index:2;}
.loop-bg{position:absolute;inset:0;z-index:0;opacity:0.5;}
.node-net-loop .node-net-canvas{-webkit-mask-image:radial-gradient(78% 78% at 50% 46%,#000 30%,rgba(0,0,0,0.18) 66%,transparent 100%);mask-image:radial-gradient(78% 78% at 50% 46%,#000 30%,rgba(0,0,0,0.18) 66%,transparent 100%);}
.hero-inner{position:relative;z-index:2;max-width:740px;}
.loop-cta{display:inline-flex;align-items:center;gap:11px;text-decoration:none;color:var(--ink);font-weight:600;font-size:15px;}
.loop-cta:hover{color:var(--mag);}
.loop-cta-t{white-space:nowrap;}
.loop-cta-arrow{color:var(--mag);}
.loopmark{position:relative;width:52px;height:52px;flex:none;}
.loopmark-svg{width:100%;height:100%;display:block;overflow:visible;filter:saturate(1.05);}
.lm-rot{transform-box:view-box;transform-origin:50px 50px;animation:loopmark-spin 7s linear infinite;}
.lm-rot2{transform-box:view-box;transform-origin:50px 50px;animation:loopmark-spin 10s linear infinite reverse;}
@keyframes loopmark-spin{to{transform:rotate(360deg);}}
.loop-cta:hover .loopmark-svg{filter:saturate(1.2) brightness(1.06);}
.hero-h1{font-size:clamp(44px,8vw,84px);margin:0 0 20px;}
.grad{color:var(--mag);}
.hero-kicker{display:inline-flex;align-items:center;gap:9px;padding:7px 14px 7px 12px;margin-bottom:24px;border:1px solid var(--line);border-radius:999px;background:rgba(251,250,247,0.55);backdrop-filter:blur(6px);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--mid);}
.hero-dot{width:7px;height:7px;border-radius:50%;background:var(--mag);animation:dot-pulse 2.4s ease-in-out infinite;flex:none;}
@keyframes dot-pulse{0%,100%{box-shadow:0 0 0 0 rgba(231,37,90,0.45);}50%{box-shadow:0 0 0 5px rgba(231,37,90,0);}}
.hl{white-space:nowrap;background:linear-gradient(90deg,#E7255A 0%,#FF5E9A 18%,#E7255A 34%,#C04BFF 50%,#E7255A 66%,#FF7A3D 82%,#E7255A 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:hl-wave 5s linear infinite;}
@keyframes hl-wave{0%{background-position:0% 0;}100%{background-position:200% 0;}}
.hero-scroll{position:absolute;left:50%;transform:translateX(-50%);bottom:16px;display:flex;flex-direction:column;align-items:center;gap:7px;font-size:9.5px;letter-spacing:0.2em;text-transform:uppercase;color:var(--soft);z-index:2;}
.hero-scroll-line{width:1px;height:30px;background:linear-gradient(var(--soft),transparent);animation:scroll-fade 2s ease-in-out infinite;}
@keyframes scroll-fade{0%,100%{opacity:.3;transform:scaleY(.7);transform-origin:top;}50%{opacity:1;transform:scaleY(1);transform-origin:top;}}
.hero-sub{font-size:clamp(17px,2.2vw,20px);color:var(--mid);max-width:520px;margin:0 0 32px;}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap;}

/* brand wall */
.brandwall-wrap{padding:8px 0 0;}
.brandwall-label{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--soft);text-align:center;margin-bottom:20px;}
.marquee{overflow:hidden;position:relative;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%);}
.marquee-track{display:flex;width:max-content;animation:marquee-scroll linear infinite;will-change:transform;}
@keyframes marquee-scroll{to{transform:translateX(-50%);}}
.marquee:hover .marquee-track{animation-play-state:paused;}
.marquee-item{flex:none;display:flex;align-items:center;}
.marquee-brand{display:flex;align-items:center;height:62px;padding:0 38px;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:21px;color:#B7B3A7;letter-spacing:-0.01em;white-space:nowrap;transition:color .2s;}
.marquee-brand:hover{color:var(--ink);}
.cred-marquee{margin-top:2px;}
.marquee-cred{display:inline-flex;align-items:center;gap:10px;height:58px;padding:0 24px;text-decoration:none;white-space:nowrap;}
.marquee-cred .cred-seal{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:rgba(231,37,90,0.10);flex:none;}
.marquee-cred-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px;color:var(--ink);letter-spacing:-0.01em;transition:color .2s;}
.marquee-cred-tier{font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);}
.marquee-cred:hover .marquee-cred-name{color:var(--mag);}
.brandwall{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:18px;overflow:hidden;}
.brand-cell{background:var(--paper);display:grid;place-items:center;padding:30px 16px;transition:background .2s;}
.brand-cell span{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:21px;color:#B7B3A7;letter-spacing:-0.01em;transition:color .2s,transform .2s;}
.brand-cell:hover{background:var(--card);}
.brand-cell:hover span{color:var(--ink);transform:translateY(-2px);}

/* bands */
.band{padding:96px 0;}
.band-dark{background:var(--dark);color:var(--paper);}
.band-mist{background:var(--mist);}
.h2{font-size:clamp(30px,4.4vw,46px);margin:0 0 14px;max-width:16ch;}
.on-dark{color:var(--paper);}.on-dark-soft{color:#BDBAB0;}
.lede{font-size:18px;color:var(--mid);max-width:52ch;margin:0;}
.band-dark .lede{color:#BDBAB0;}

/* services */
.service-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:48px;}
.service{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;display:flex;flex-direction:column;min-height:230px;transition:transform .2s,box-shadow .2s;}
.service:hover{transform:translateY(-4px);box-shadow:0 30px 50px -28px rgba(23,23,23,0.18);}
.service-n{font-size:13px;color:var(--mid);margin-bottom:auto;}
.service-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:20px;margin:26px 0 10px;letter-spacing:-0.01em;}
.service-body{font-size:14.5px;color:var(--mid);margin:0 0 16px;}
.service-link{background:none;border:none;padding:0;font:inherit;font-size:13.5px;font-weight:600;color:var(--ink);cursor:pointer;text-align:left;}
.service-link:hover{color:var(--mag);}

/* credential badges */
.creds{padding:40px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
.creds-label{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--soft);text-align:center;margin-bottom:22px;}
.creds-row{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
.cred{display:flex;align-items:center;gap:12px;padding:16px 18px;border:1px solid var(--line);border-radius:16px;background:var(--card);transition:transform .18s,box-shadow .18s,border-color .18s;}
.cred:hover{transform:translateY(-3px);border-color:var(--ink);box-shadow:0 20px 40px -24px rgba(23,23,23,0.22);}
.cred-seal{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:rgba(231,37,90,0.10);border:1px solid rgba(231,37,90,0.25);}
.cred-info{display:flex;flex-direction:column;gap:2px;min-width:0;}
.cred-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:15px;color:var(--ink);}
.cred-tier{font-size:10px;letter-spacing:0.05em;text-transform:uppercase;color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* stats (3) */
.stats{padding:64px 0;border-bottom:1px solid var(--line);}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.stat-value{font-size:clamp(40px,6vw,60px);line-height:1;color:var(--ink);}
.stat:nth-child(1) .stat-value{color:var(--mag);}
.stat-label{font-size:12px;color:var(--mid);margin-top:12px;letter-spacing:0.04em;}

/* loop */
.loop-cycle{display:grid;grid-template-columns:1fr 1fr;gap:54px;align-items:center;margin-top:52px;}
.loop-diagram{display:flex;justify-content:center;}
.loop-svg{width:100%;max-width:480px;height:auto;display:block;overflow:visible;}
.loop-ring{fill:none;stroke:rgba(255,255,255,0.14);stroke-width:1.5;}
.loop-arrow{fill:none;stroke:rgba(255,255,255,0.32);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
.loop-node{fill:#1E1E1E;stroke:rgba(255,255,255,0.38);stroke-width:1.5;}
.loop-node-acc{stroke:var(--mag);fill:#241016;}
.loop-node-n{fill:#C9C6BD;font-family:'IBM Plex Mono',monospace;font-size:11px;}
.loop-label{fill:var(--paper);font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:14px;}
.loop-dot{fill:var(--mag);filter:drop-shadow(0 0 6px rgba(231,37,90,0.85));}
.loop-diagram-inner{position:relative;display:flex;justify-content:center;width:100%;}
.loop-node-g{cursor:pointer;outline:none;}
.loop-hit{fill:transparent;}
.loop-node-g .loop-node{transition:fill .15s,stroke .15s,r .15s;}
.loop-node-g:hover .loop-node,.loop-node-g.on .loop-node,.loop-node-g:focus-visible .loop-node{stroke:var(--mag);fill:#2A1019;}
.loop-node-g:hover .loop-label,.loop-node-g.on .loop-label,.loop-node-g:focus-visible .loop-label{fill:#fff;}
.loop-tip{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:42%;max-width:200px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;pointer-events:none;}
.loop-tip-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:17px;letter-spacing:-0.01em;color:var(--paper);line-height:1.15;}
.loop-tip-d{font-size:12.5px;line-height:1.4;color:#C9C6BD;}
.loop-tip-s{font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:#9A978E;}
.loop-spin{transform-box:view-box;transform-origin:200px 200px;animation:loop-rotate 16s linear infinite;}
@keyframes loop-rotate{to{transform:rotate(360deg);}}
.loop-steps{display:flex;flex-direction:column;gap:20px;}
.loop-step{display:flex;gap:16px;align-items:flex-start;}
.loop-step-n{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--mag);padding-top:3px;min-width:22px;}
.loop-step-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:18px;margin:0 0 4px;color:var(--paper);}
.loop-step-b{font-size:14.5px;color:#C9C6BD;margin:0;}

/* work */
.work-head,.quotes-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:40px;}
.work-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}
.work-card{background:var(--card);border:1px solid var(--line);border-radius:20px;transition:transform .2s,box-shadow .2s;}
.work-card:hover{transform:translateY(-4px);box-shadow:0 36px 60px -30px rgba(23,23,23,0.2);}
.work-link{display:block;padding:28px;}
.work-meta{font-size:12px;color:var(--soft);letter-spacing:0.06em;text-transform:uppercase;}
.work-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:24px;margin:12px 0 8px;letter-spacing:-0.01em;}
.work-note{font-size:15px;color:var(--mid);margin:0 0 22px;}
.work-thumb{height:160px;border-radius:14px;background:linear-gradient(135deg,#171717,#3A3A3A);}
.work-card:nth-child(2) .work-thumb{background:linear-gradient(135deg,#171717,#E7255A);}
.work-card:nth-child(3) .work-thumb{background:linear-gradient(135deg,#2A2A2A,#171717);}
.work-card:nth-child(4) .work-thumb{background:linear-gradient(135deg,#3A3A3A,#171717);}
.work-cta{display:inline-block;margin-top:16px;font-size:13.5px;font-weight:600;color:var(--ink);}
.work-card:hover .work-cta{color:var(--mag);}

/* quotes */
.quote-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.byline{display:flex;align-items:center;justify-content:space-between;gap:16px 28px;flex-wrap:wrap;padding:18px 24px;border:1px solid var(--line);border-radius:16px;background:var(--card);margin-bottom:40px;}
.byline-brand{display:inline-flex;align-items:center;}
.byline-brand .brand{font-size:24px;}
.byline-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;text-decoration:none;}
.byline-by{display:inline-flex;align-items:center;gap:7px;font-size:15px;color:var(--mid);font-weight:600;}
.byline-name{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:18px;color:var(--mag);letter-spacing:-0.01em;}
.byline-arrow{color:var(--mag);font-weight:700;}
.byline-right:hover .byline-name{text-decoration:underline;text-underline-offset:3px;}
.byline .rating-badge{border:none;background:transparent;padding:0;}
.quote-card{background:var(--card);border:1px solid var(--line);border-radius:18px;transition:transform .2s,box-shadow .2s;}
.quote-card:hover{transform:translateY(-4px);box-shadow:0 30px 50px -28px rgba(23,23,23,0.16);}
.quote-link{display:flex;flex-direction:column;height:100%;padding:26px;}
.quote-text{font-size:16px;color:var(--ink);margin:0 0 22px;line-height:1.55;}
.quote-by{display:flex;align-items:center;gap:12px;margin-top:auto;}
.quote-avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;color:var(--paper);font-weight:700;background:var(--ink);font-family:'Bricolage Grotesque',sans-serif;}
.quote-avatar.lg{width:54px;height:54px;font-size:22px;}
.quote-name{font-weight:600;font-size:14.5px;}.quote-name.lg{font-size:18px;}
.quote-role{font-size:11.5px;color:var(--soft);margin-top:2px;}
.rating-badge{display:inline-flex;align-items:center;gap:12px;padding:12px 18px;border-radius:14px;background:var(--card);border:1px solid var(--line);}
.rating-stars{color:var(--mag);font-size:15px;letter-spacing:2px;}
.rating-stars.big{font-size:24px;letter-spacing:4px;display:block;margin-bottom:18px;}
.rating-meta{display:flex;flex-direction:column;line-height:1.2;}
.rating-meta strong{font-size:16px;}.rating-meta .mono{font-size:11px;color:var(--soft);}
.aud-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:48px;}
.aud{padding:24px;border-left:2px solid var(--mag);}
.aud-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:18px;margin:0 0 8px;}
.aud-b{font-size:14.5px;color:var(--mid);margin:0;}
.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:48px;}
.step-n{font-size:12px;color:var(--mag);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;}
.step-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:18px;margin:0 0 8px;}
.step-b{font-size:14.5px;margin:0;}
.post-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.post{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;transition:transform .2s,box-shadow .2s;}
.post:hover{transform:translateY(-4px);box-shadow:0 30px 50px -28px rgba(23,23,23,0.16);}
.post-link{display:block;padding-bottom:24px;}
.post-thumb{height:140px;background:linear-gradient(135deg,#ECE8DF,#DDD7C9);}
.post:nth-child(2) .post-thumb{background:linear-gradient(135deg,#EEE7DC,#F1D9E0);}
.post:nth-child(3) .post-thumb{background:linear-gradient(135deg,#E7E2D6,#ECE8DF);}
.post-meta{font-size:11.5px;color:var(--mag);letter-spacing:0.06em;text-transform:uppercase;margin:18px 24px 10px;}
.post-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:18px;margin:0 24px 10px;letter-spacing:-0.01em;}
.post-body{font-size:14px;color:var(--mid);margin:0 24px 14px;}
.post .service-link{margin:0 24px;}
.cta-band{background:var(--ink);color:var(--paper);padding:104px 0;}
.cta-inner{text-align:center;}
.cta-h{font-size:clamp(36px,6vw,64px);margin:0 auto 14px;}
.cta-sub{font-size:18px;color:#B5B2A8;max-width:42ch;margin:0 auto 30px;}
.cta-band .hero-actions{justify-content:center;}
.cta-band .btn-primary{background:var(--paper);color:var(--ink);}
.cta-band .btn-primary:hover{background:var(--mag);color:#fff;}
.cta-band .btn-ghost{border-color:#3A3A3A;color:var(--paper);}
.cta-band .btn-ghost:hover{border-color:var(--paper);}
.contact-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;max-width:840px;margin:56px auto 0;padding-top:36px;border-top:1px solid rgba(255,255,255,0.12);text-align:left;}
.contact-k{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--mag);margin-bottom:8px;}
.contact-v{font-size:15px;color:var(--paper);}
.contact-link:hover{color:var(--mag);}
.footer{background:var(--dark-2);color:var(--paper);padding:64px 0 36px;}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px;}
.footer-note{font-size:14px;color:#A8A59B;max-width:30ch;margin:14px 0 0;}
.footer-col{display:flex;flex-direction:column;gap:10px;}
.footer-h{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#807D73;margin-bottom:4px;}
.footer-col a{font-size:14px;color:#C7C4BA;}
.footer-col a:hover{color:var(--mag);}
.footer-bottom{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);font-size:12.5px;color:#8C8980;}
.dockbar{position:fixed;left:0;right:0;bottom:0;z-index:60;height:var(--dock);display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(243,241,235,0.9);backdrop-filter:blur(12px);border-top:1px solid var(--line);}
.dock-consult{display:inline-flex;align-items:center;gap:9px;height:38px;padding:0 16px 0 13px;border-radius:999px;border:none;cursor:pointer;background:var(--mag);color:#fff;font-weight:600;font-size:14px;transition:background .18s,transform .18s;}
.dock-consult:hover{background:#cf1f50;transform:translateY(-1px);}
.dock-consult svg{display:block;}
.lang-toggle{display:inline-flex;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:3px;}
.lang-btn{border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;color:var(--soft);padding:6px 13px;border-radius:999px;transition:all .15s;}
.lang-btn.on{background:var(--ink);color:var(--paper);}
.lang-btn:not(.on):hover{color:var(--ink);}
.dock-right{display:inline-flex;align-items:center;gap:10px;}
.dock-login{width:38px;height:38px;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--mid);}
.dock-login:hover{color:var(--ink);border-color:var(--ink);}
.dock-login.on{color:var(--mag);border-color:rgba(231,37,90,0.4);}
.mobile-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:18px;padding-top:16px;border-top:1px solid var(--line);}
.mobile-login{display:inline-flex;align-items:center;gap:8px;background:none;border:1px solid var(--line);border-radius:999px;padding:9px 15px;cursor:pointer;font-size:14px;font-weight:600;color:var(--ink);transition:border-color .15s;}
.mobile-login svg{width:18px;height:18px;}
.mobile-login:hover{border-color:var(--ink);}
.detail{padding:64px 0 96px;min-height:60vh;}
.detail-narrow .wrap{max-width:760px;}
.back{display:inline-block;font-size:13.5px;font-weight:600;color:var(--mid);margin-bottom:28px;}
.back:hover{color:var(--mag);}
.detail-meta{font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:var(--mag);margin-bottom:12px;}
.detail-h{font-size:clamp(34px,6vw,60px);margin:0 0 18px;}
.detail-quote{font-size:clamp(26px,4.4vw,40px);margin:0 0 28px;max-width:18ch;}
.detail-lede{font-size:19px;color:var(--mid);max-width:60ch;margin:0 0 32px;}
.detail-hero{height:300px;border-radius:20px;background:linear-gradient(135deg,#171717,#E7255A);margin:0 0 36px;}
.detail-metrics{display:flex;gap:40px;flex-wrap:wrap;padding:24px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:36px;}
.dm-v{font-size:30px;color:var(--ink);}
.dm-l{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--soft);margin-top:4px;}
.detail-body{max-width:64ch;}
.detail-body p{font-size:16.5px;color:#33312C;margin:0 0 20px;}
.detail-by{display:flex;align-items:center;gap:14px;}
.cms{padding:48px 0 96px;min-height:70vh;}
.cms-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:28px;}
.cms-status{display:inline-flex;align-items:center;gap:8px;margin-top:12px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mid);}
.cms-dot{width:8px;height:8px;border-radius:50%;background:var(--soft);}
.cms-status-supabase .cms-dot{background:#1FAE5A;}
.cms-status-loading .cms-dot{background:#E0A93B;animation:pulse 1s ease-in-out infinite;}
.cms-status-local .cms-dot{background:var(--mag);}
@keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
.cms-tabs{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:24px;}
.cms-tab{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:9px 16px;font:inherit;font-size:14px;font-weight:600;color:var(--mid);cursor:pointer;display:inline-flex;gap:8px;align-items:center;transition:all .15s;}
.cms-tab:hover{border-color:var(--ink);color:var(--ink);}
.cms-tab.on{background:var(--ink);color:var(--paper);border-color:var(--ink);}
.cms-count{font-family:'IBM Plex Mono',monospace;font-size:11px;opacity:.7;}
.cms-add{margin-bottom:18px;}
.cms-list{display:flex;flex-direction:column;gap:8px;}
.cms-row{display:flex;justify-content:space-between;align-items:center;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 20px;}
.cms-row-t{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;}
.cms-row-s{font-size:11px;color:var(--soft);margin-top:2px;}
.cms-row-actions{display:flex;gap:14px;flex-shrink:0;}
.cms-link{background:none;border:none;font:inherit;font-size:13.5px;font-weight:600;color:var(--mid);cursor:pointer;padding:0;}
.cms-link:hover{color:var(--ink);}
.cms-link.danger:hover{color:var(--mag);}
.cms-empty{padding:40px;text-align:center;color:var(--soft);border:1px dashed var(--line);border-radius:14px;}
.editor{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;display:flex;flex-direction:column;gap:16px;max-width:680px;}
.field{display:flex;flex-direction:column;gap:6px;}
.field-l{font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:var(--mid);}
.field-i{font:inherit;font-size:15px;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:11px 13px;resize:vertical;}
.field-i:focus{outline:none;border-color:var(--ink);}
.editor-actions{display:flex;gap:10px;margin-top:4px;}
.modal-overlay{position:fixed;inset:0;z-index:100;background:rgba(23,23,23,0.55);backdrop-filter:blur(6px);display:grid;place-items:center;padding:24px;animation:fade .2s ease;}
.modal{position:relative;width:100%;max-width:560px;background:var(--paper);border-radius:22px;padding:40px;box-shadow:0 40px 90px -30px rgba(23,23,23,0.5);animation:rise .26s cubic-bezier(.22,.61,.36,1);}
.modal-close{position:absolute;top:18px;right:18px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--card);font-size:20px;line-height:1;color:var(--mid);cursor:pointer;transition:all .15s;}
.modal-close:hover{background:var(--ink);color:var(--paper);border-color:var(--ink);}
.modal-h{font-size:clamp(24px,4vw,32px);margin:0 0 24px;}
.modal-opts{display:flex;flex-direction:column;gap:10px;}
.modal-opt{display:flex;align-items:center;gap:4px;width:100%;padding:18px 20px;border-radius:14px;border:1px solid var(--line);background:var(--card);font:inherit;text-align:left;color:inherit;cursor:pointer;transition:all .16s;}
.modal-opt:hover{border-color:var(--ink);transform:translateX(3px);}
.modal-form{display:flex;flex-direction:column;gap:14px;}
.modal-form-actions{display:flex;justify-content:space-between;gap:10px;margin-top:20px;}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}
.modal-opt-t{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:17px;color:var(--ink);}
.modal-opt-d{font-size:12px;color:var(--soft);margin-left:12px;}
.modal-opt-arrow{margin-left:auto;font-size:18px;color:var(--mag);}
@keyframes fade{from{opacity:0;}to{opacity:1;}}
@keyframes rise{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
.reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s cubic-bezier(.22,.61,.36,1);}
.reveal.in{opacity:1;transform:none;}
@media(max-width:980px){
  .nav-links{display:none;}
  .burger{display:flex;}
  .service-grid,.stats-grid,.aud-grid,.steps-grid,.brandwall{grid-template-columns:repeat(2,1fr);}
  .loop-cycle{grid-template-columns:1fr;gap:36px;}
  .loop-svg{max-width:360px;}
  .creds-row{grid-template-columns:repeat(2,1fr);}
  .work-grid,.post-grid{grid-template-columns:1fr;}
  .quote-grid,.contact-grid{grid-template-columns:repeat(2,1fr);}
  .footer-grid{grid-template-columns:1fr 1fr;}
}
@media(max-width:720px){
  .nav-cta{display:none;}
  .band,.cta-band{padding:64px 0;}
  .hero{padding:60px 0 72px;}
  .service-grid,.stats-grid,.aud-grid,.steps-grid,.footer-grid,.quote-grid,.contact-grid,.brandwall,.creds-row{grid-template-columns:1fr;}
  .stat{text-align:center;}
  .cms-row{flex-direction:column;align-items:flex-start;}
  .modal{padding:28px 22px;}
  .modal-opt-d{display:none;}
  .detail-metrics{gap:28px;}
  .dock-consult-label{display:none;}
  .dock-consult{padding:0 12px;width:38px;justify-content:center;}
  .hero-scroll{display:none;}
  .node-net-canvas{-webkit-mask-image:none;mask-image:none;}
  .node-net{opacity:0.6;}
  .byline{gap:14px;padding:16px 18px;}
  .byline-brand{flex-wrap:wrap;gap:12px;}
}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none;}
  .hl{animation:none;}
  .hero-dot,.hero-scroll-line,.loop-spin,.lm-rot,.lm-rot2,.marquee-track{animation:none;}
}
`;
