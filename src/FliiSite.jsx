import React, { useState, useEffect, useRef, createContext, useContext } from "react";

// ============================================================
// Flii.app : AI architectuur & marketing apps
// Dutch by default, EN toggle in the fixed bottom dock bar.
// Hash routing: #/ home · #/cms · #/app|insight|review|cert/:id
// Content via Supabase REST (fetch) with localStorage fallback.
// ============================================================

const MAG = "#E7255A";
const BRANDS = ["Weddy", "Aperture", "Populos", "Waryte", "FC Data"];

/* ---------- i18n ---------- */
const I18N = {
  nl: {
    slogan: "AI architectuur & marketing apps",
    nav: { solutions: "Diensten", work: "Werk", approach: "Aanpak", about: "Over ons", insights: "Inzichten", pricing: "Prijzen", contact: "Contact", consult: "Plan een gesprek", manage: "CMS" },
    mega: {
      groups: [
        { group: "Bouwen", blurb: "Ontwerp en lanceer het product.", items: [
          { label: "App & UX design", desc: "Conversiegericht ontwerp", href: "#/dienst/app-ux" },
          { label: "Platform development", desc: "Schaalbaar, met backend", href: "#/dienst/platform" },
          { label: "AI integratie", desc: "AI in je processen", href: "#/dienst/ai" } ] },
        { group: "Groeien", blurb: "Maak van het product groei.", items: [
          { label: "Marketing campagnes", desc: "Over de juiste kanalen", href: "#/dienst/campaigns" },
          { label: "Media performance", desc: "Sturen op rendement", href: "#/dienst/media" } ] },
      ],
      featureK: "Flii Loop", featureT: "Eén loop die blijft leren →",
    },
    hero: { pre: "AI architectuur als fundament van ", mark: "resultaat", post: "",
      sub: "Wij ontwerpen en ontwikkelen AI architectuur & apps.",
      primary: "Plan een gesprek", secondary: "Bekijk Flii Loop ↘", loopCta: "Test Flii Loop" },
    brandsLabel: "Merken waarvoor we bouwen",
    services: { eyebrow: "Wat we doen", h2: "Klaar om te bouwen?",
      lede: "Eén aanbod als fundament van resultaat. We bedenken en bouwen jouw blauwdruk voor succes.",
      cta: "Bekijk de dienst ↗",
      helpH: "Hoe het helpt", execH: "Hoe wij het uitvoeren", outcomeK: "Resultaat", channelsH: "Kanalen waarmee we werken", loopH: "In de Loop",
      items: [
        { slug: "app-ux", tag: "App & UX", title: "App & UX design",
          body: "Apps en interfaces die doen wat gebruikers willen.",
          lede: "We ontwerpen en bouwen apps en interfaces waar mensen graag mee werken. Van eerste schets tot werkende PWA, met steeds dezelfde vraag: wat heeft de gebruiker echt nodig?",
          help: [{ h: "Minder afhakers", b: "Een heldere flow haalt drempels weg, zodat meer bezoekers doen wat je wilt." }, { h: "Sneller iets echts", b: "We werken in werkende versies in plaats van eindeloze mockups." }, { h: "Klaar voor groei", b: "Een opzet die meegroeit met nieuwe functies en gebruikers." }],
          exec: [{ h: "Onderzoek", b: "We brengen gebruikers, doelen en knelpunten in kaart." }, { h: "Ontwerp", b: "Wireframes en een strak, herkenbaar interfaceontwerp." }, { h: "Bouw", b: "Een responsive app of PWA, meteen hosting-klaar." }, { h: "Meten & verbeteren", b: "We meten gebruik en scherpen de interface aan." }],
          outcome: "Een app die klopt, converteert en klaarstaat om door te ontwikkelen.", loop: ["Je bouwt en lanceert je app bij de eerste gebruikers.", "Je meet hoe mensen de app echt gebruiken.", "Je ziet welke flows werken en wat gemist wordt.", "Je verbetert flows en maakt de app sneller."] },
        { slug: "platform", tag: "Platform", title: "Platform development",
          body: "Schaalbare platformen met backend, data en AI onder de motorkap.",
          lede: "We bouwen volwaardige platformen: portals, webapps en sites met een echte backend, gebruikersrollen en waar nodig AI. Gemaakt om te schalen.",
          help: [{ h: "Alles op één plek", b: "Data, gebruikers en processen in één systeem in plaats van losse tools." }, { h: "Minder handwerk", b: "Automatisering en koppelingen nemen repeterend werk uit handen." }, { h: "Schaalbaar", b: "Een architectuur die meegroeit met verkeer, features en teams." }],
          exec: [{ h: "Architectuur", b: "We bepalen datamodel, rollen en koppelingen." }, { h: "Bouw", b: "Backend, database en interface, module voor module." }, { h: "Integraties", b: "API's, betalingen, AI en bestaande tools aan elkaar." }, { h: "Beheer", b: "Hosting, monitoring en doorontwikkeling." }],
          outcome: "Een platform dat je bedrijf draagt in plaats van vertraagt.", loop: ["Je bouwt je platform met backend en gaat live.", "Je meet gebruik, funnels en waar het proces stokt.", "Je ziet welke stappen werken en welke afhaken.", "Je automatiseert meer en schaalt het platform op."] },
        { slug: "ai", tag: "AI", title: "AI integratie",
          body: "AI die echt werk uit handen neemt, ingebed in je eigen processen.",
          lede: "We integreren AI daar waar het rendeert: assistenten, automatisering en slimme functies die in je bestaande processen passen, niet ernaast.",
          help: [{ h: "Tijd terug", b: "AI neemt repeterend werk over, je team houdt tijd over voor wat telt." }, { h: "Altijd bereikbaar", b: "Assistenten die vragen beantwoorden en leads kwalificeren, dag en nacht." }, { h: "Betere beslissingen", b: "Modellen die patronen zien die mensen missen." }],
          exec: [{ h: "Kansen vinden", b: "We zoeken waar AI het meeste oplevert in jouw proces." }, { h: "Ontwerp", b: "We kiezen model, data en de plek in de flow." }, { h: "Integratie", b: "We bouwen het in je tools en koppelen de data." }, { h: "Bijsturen", b: "We meten de output en verbeteren de kwaliteit." }],
          outcome: "AI die meedraait in je processen en elke maand slimmer wordt.", loop: ["Je bouwt je eerste AI-functie in je eigen proces.", "Je meet waar hij tijd wint en waar hij mist.", "Je ziet waar de output klopt en waar niet.", "Je scherpt prompts, data en logica aan."] },
        { slug: "campaigns", tag: "Campagnes", title: "Marketing campagnes",
          body: "Content en campagnes voor elk kanaal. In de stem van jouw merk, gericht op resultaat.",
          lede: "We zetten campagnes op die renderen: search, social, display, video, outdoor en AI-vindbaarheid. Eén verhaal, over de kanalen waar jouw klant zit.",
          help: [{ h: "De juiste kanalen", b: "We kiezen kanalen op basis van je doelgroep, niet op gewoonte." }, { h: "Meetbaar rendement", b: "Elke euro is te volgen van klik tot klant." }, { h: "Eén verhaal", b: "Consistente boodschap en creatives over alle kanalen." }],
          exec: [{ h: "Strategie", b: "Doelgroep, boodschap en kanaalkeuze." }, { h: "Creatie", b: "Advertenties, teksten en visuals die opvallen." }, { h: "Lanceren", b: "Opzet, tracking en de eerste live campagnes." }, { h: "Optimaliseren", b: "We schalen wat werkt en snoeien de rest." }],
          outcome: "Campagnes die te volgen zijn tot op de klant, en elke maand scherper.", loop: ["Je zet je campagne live over de gekozen kanalen.", "Je meet bereik, kliks en conversies per kanaal.", "Je ziet welke creatives en boodschappen werken.", "Je schaalt de winnaars en scherpt de targeting aan."] },
        { slug: "media", tag: "Performance", title: "Media performance",
          body: "Organische inzet en adverteren op 20+ media kanalen. Gedreven door data, gericht op resultaat.",
          lede: "Beheer en optimalisatie van je media. We sturen doorlopend op de cijfers die tellen, verbeteren wat rendeert en schrappen wat niet werkt.",
          help: [{ h: "Minder verspilling", b: "Budget verschuift naar wat het beste presteert." }, { h: "Grip op de cijfers", b: "Rapportage op omzet en waarde per bezoeker, geen ijdele cijfers." }, { h: "Continu beter", b: "Elke maand een iteratie op basis van echte data." }],
          exec: [{ h: "Meten", b: "We zetten tracking en attributie goed neer." }, { h: "Analyseren", b: "We lezen de data en vinden de knelpunten." }, { h: "Bijsturen", b: "We optimaliseren biedingen, doelgroepen en creatives." }, { h: "Rapporteren", b: "Transparante rapportage op wat echt telt." }],
          outcome: "Media die elke maand meetbaar beter presteert.", loop: ["Je zet je media live op de gekozen kanalen.", "Je meet kliks, kosten en conversies per kanaal.", "Je ziet wat converteert en wat budget verspilt.", "Je schaalt de winnaars en scherpt de targeting aan."] }] },
    loopCta: { k: "Flii Loop", h2: "Get in the Loop", body: "Lanceer, meet en verbeter. Zet feedback om naar duurzame verbetering.", pricing: "Bekijk Flii Loop ↗", talk: "Plan een gesprek" },
    certsLabel: "Gecertificeerd & partner",
    stats: [
      { value: 21, suffix: " dagen", label: "Van brief tot live" },
      { value: 100, suffix: "%", label: "AI-native oplevering" },
      { value: 12, suffix: "+", label: "Producten gelanceerd" } ],
    loop: { eyebrow: "Flii Loop", h2: "Verbeter op basis van marktvraag.", center: "Altijd lerend",
      lede: "Een plan voor het opstarten en blijvend verbeteren van jouw apps, platformen of media. Synchroon aan de wensen van je doelgroep, elke maand beter.",
      items: [
        { k: "Livegang", body: "De nieuwe app, campagne of platform bereikt de markt." },
        { k: "Measure", body: "De reactie van gebruikers wordt in kaart gebracht." },
        { k: "Analyse", body: "Data wordt omgezet naar inzichten, kansen en problemen." },
        { k: "Improve", body: "We verbeteren, fixen of zetten een test op." } ],
      lens: { generic: "Algemeen", platform: "Platform", app: "App", media: "Media" },
      variants: {
        platform: ["Wij bouwen je platform met backend en zetten het live.", "Wij meten gebruik, funnels en waar het proces stokt.", "Wij zien welke stappen werken en welke afhaken.", "Wij automatiseren meer en schalen het platform op."],
        app: ["Wij bouwen en lanceren je app of PWA.", "Wij meten hoe mensen de app echt gebruiken.", "Wij zien welke flows werken en wat gemist wordt.", "Wij verbeteren flows en maken de app sneller."],
        media: ["Wij zetten je campagne live op de gekozen kanalen.", "Wij meten kliks, kosten en conversies per kanaal.", "Wij zien wat converteert en wat budget verspilt.", "Wij schalen de winnaars en scherpen de targeting aan."],
      },
      priceCta: "Stel Loop samen en bekijk de prijzen ↘" },
    model: { tabCampagnes: "Campagnes", tabApp: "App", tabPlatform: "Platform", eyeCampagnes: "De funnel", eyeApp: "De stack", eyePlatform: "Het netwerk" },
    appStack: { h2: "Gebouwd van fundament tot interface.", lede: "Een app is een stack: elke laag draagt de laag erboven. Wij bouwen ze alle vier, zodat het geheel klopt en meegroeit.", tapHint: "Tik voor uitleg",
      layers: [
        { k: "Front end", desc: "De interface die gebruikers zien en bedienen: web, native of PWA, snel en toegankelijk." },
        { k: "Integrations", desc: "Koppelingen met externe systemen en API's, zodat de app meedraait in je bestaande landschap." },
        { k: "Databases", desc: "Waar je data leeft: veilig, gestructureerd en klaar om op te schalen." },
        { k: "Hosting", desc: "De draaiende omgeving: betrouwbare, schaalbare hosting en geautomatiseerde deployment." },
        { k: "Codebase", desc: "Het fundament: schone, onderhoudbare applicatiecode waar alles op rust." } ] },
    platformNet: { h2: "Je platform als spil van je media.", lede: "Het platform staat centraal en verbindt al je kanalen. Data stroomt heen en weer, elk kanaal voedt het geheel.", tapHint: "Tik voor uitleg", center: "Platform",
      nodes: [
        { k: "CRM", desc: "Klantdata en segmenten stromen tussen je platform en je CRM." },
        { k: "Mail", desc: "Geautomatiseerde e-mail en flows, gevoed door platformdata." },
        { k: "Social", desc: "Organische en betaalde social, gekoppeld aan je content en publiek." },
        { k: "PR", desc: "Verdiende aandacht en persrelaties rond je platform." },
        { k: "Search/LLM", desc: "Vindbaarheid in zoekmachines en AI-assistenten." },
        { k: "Paid media", desc: "Betaald bereik dat verkeer en conversie naar het platform stuurt." },
        { k: "Outdoor", desc: "Buitenreclame die offline bereik koppelt aan je online platform." },
        { k: "Print", desc: "Gedrukte uitingen die mensen naar het platform leiden." } ] },
    funnel: { eyebrow: "Campagnes", h2: "Van onbekend tot ambassadeur.",
      lede: "Elke campagne begeleidt je doelgroep stap voor stap door de funnel, van de eerste kennismaking tot herhaalaankopen en aanbevelingen.",
      goalLabel: "Doel", exampleLabel: "Voorbeeld", tapHint: "Tik voor beschrijving",
      stages: [
        { k: "Aware", goal: "Van onbekend met je merk naar aware, bij algemene en in-market doelgroepen.", example: "Een pakkende video-hook op YouTube en TikTok die in drie seconden het probleem raakt." },
        { k: "Engaged", goal: "Van aware naar betrokken.", example: "Retarget kijkers met een gratis checklist of tool die meteen waarde geeft." },
        { k: "Nudged", goal: "Van betrokken naar overtuigd.", example: "Toon reviews en een concrete case op je landingspagina, met een scherpe vergelijking met alternatieven." },
        { k: "Signed", goal: "Van overtuigd naar conversie.", example: "Haal wrijving weg met een korte checkout en een tijdelijke bonus bij direct afrekenen." },
        { k: "Loyal", goal: "Van conversie naar loyaal.", example: "Een geautomatiseerde onboarding-flow via e-mail die het product in de eerste week laat renderen." },
        { k: "Ambassador", goal: "Van loyaal naar ambassadeur.", example: "Een referral-actie waarbij klanten korting krijgen voor elke aangebrachte nieuwe klant." } ] },
    work: { eyebrow: "flii.labs", h2: "Apps in de pipeline", lede: "Live producten en experimenten die we nu bij flii.labs bouwen en itereren.", manage: "Beheer showcase ↗", view: "Bekijk case ↗" },
    reviews: { eyebrow: "Reviews", h2: "Bewijs, geen beloftes.", word: "reviews" },
    byline: { by: "by", name: "Flii Media" },
    who: { eyebrow: "Voor wie we werken", h2: "Gebouwd voor ambitie.",
      lede: "Een partner voor teams die iets willen bouwen dat presteert.",
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
    cta: { h2: "De kracht van feedback.", sub: "Moderne bedrijven passen zich real-time aan op de markt. Gebruik Loop als jouw motor voor verbetering.",
      primary: "Plan een gesprek", secondary: "Vraag een groei-audit ↗" },
    callback: { ph: "Je telefoonnummer", cta: "Bel mij terug", subject: "Bel mij terug", bodyPre: "Bel mij graag terug op:" },
    contact: [
      { k: "Locatie", v: "Amstelveen, NL", href: null },
      { k: "Bericht", v: "WhatsApp ons", href: "https://wa.me/31640881169" },
      { k: "E-mail", v: "hello@flii.nl", href: "mailto:hello@flii.nl" } ],
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
      company_links: [ { label: "Werk", href: "#work" }, { label: "Over ons", href: "#about" }, { label: "Inzichten", href: "#blog" }, { label: "Prijzen", href: "#/prijzen" }, { label: "CMS", href: "#/cms" } ],
      bottom: "Snel gebouwd. Afgesteld op prestatie." },
    cms: { back: "← Terug naar site", eyebrow: "Control panel", h1: "Content", reset: "Herstel standaard",
      status: { supabase: "Gesynct met Supabase", loading: "Verbinden met Supabase…", local: "Lokaal (deze browser)" },
      tabs: { reviews: "Reviews", certs: "Certificeringen", apps: "Showcase", articles: "Inzichten" },
      desc: { reviews: "Klantbeoordelingen op de homepage.", certs: "Partnercertificeringen en niveaus.", apps: "Producten en cases in de showcase.", articles: "Artikelen en inzichten voor de blog." },
      collectionsLabel: "Collecties", entries: "items", search: "Zoek op titel of slug…", noMatch: "Geen resultaten.",
      newEntry: "Nieuw item", editEntry: "Item bewerken", newPrefix: "+ Nieuw: ", view: "Bekijk", edit: "Bewerk", del: "Verwijder",
      empty: "Nog niets. Voeg de eerste toe.", save: "Opslaan", cancel: "Annuleer", slug: "Slug",
      groups: { content: "Inhoud", meta: "Meta", media: "Media", links: "Links" },
      hints: { slug: "URL-naam. Laat leeg om automatisch te genereren.", cover: "Trefwoord (funnel, build of signal) of een afbeelding-URL.", body: "Opmaak: ## kop · > citaat · - opsomming · ![bijschrift](funnel) voor een figuur.", metrics: "Formaat label:waarde, gescheiden door komma's." },
      confirmReset: "Alle content terugzetten naar standaard?", confirmDelete: "Dit item verwijderen?",
      f: { quote: "Quote", name: "Naam", role: "Functie", org: "Organisatie", rating: "Score (1-5)",
        certName: "Naam", tier: "Niveau", blurb: "Omschrijving", link: "Link",
        title: "Titel", client: "Klant", tag: "Tag", summary: "Samenvatting",
        body: "Tekst", metrics: "Metrics", read: "Leestijd", cover: "Cover",
        category: "Categorie", date: "Datum", excerpt: "Samenvatting" } },
    pricing: { eyebrow: "Prijzen", h1: "Stel Loop samen.",
      intro: "Richtprijzen, exclusief btw en op basis van vanaf-tarieven. Mediabudget is niet inbegrepen. De definitieve prijs hangt af van de scope.",
      scopeLabel: "Wat heb je nodig?", scopes: { campagne: "Campagne", app: "App", platform: "Platform", ai: "AI" },
      scopeDesc: { campagne: "Een advertentiecampagne, opgezet en gestuurd op resultaat.", app: "Een werkende app of PWA, van één functie tot meerdere modules.", platform: "Een volwaardig, schaalbaar platform met backend en AI.", ai: "Een AI-oplossing of automatisering, van integratie tot een eigen model." },
      badge: "Meest gekozen", save: "Je bespaart",
      levelLabel: "Niveau", levels: { basis: "Basis", advanced: "Advanced" },
      phaseLabel: "Pakketten", phases: { plan: "Loop Start", build: "Loop Build", run: "Loop Run" },
      phaseDesc: { plan: "Research en plan van aanpak, met de optie om dit zelf uit te voeren.", build: "Creatie: de app, het platform of de campagne wordt gebouwd.", run: "Beheer & verbeter: hosting, optimalisatie en doorontwikkeling." },
      phaseByType: {
        campagne: { plan: "Onderzoek en strategie voor je campagnes, om zelf uit te voeren.", build: "Creatie van de content en campagnes.", run: "Beheer en verbetering van je campagnes." },
        app: { plan: "Onderzoek en plan voor je app, om zelf uit te voeren.", build: "Ontwerp en bouw van de app.", run: "Beheer en doorontwikkeling van de app." },
        platform: { plan: "Onderzoek en plan voor je platform, om zelf uit te voeren.", build: "Ontwerp en bouw van het platform.", run: "Hosting, beheer en doorontwikkeling." },
        ai: { plan: "Onderzoek en plan voor de AI-integratie, om zelf uit te voeren.", build: "Bouw en integratie van de AI-oplossing.", run: "Beheer en optimalisatie van de AI." },
      },
      phaseMulti: { plan: "Onderzoek en plan van aanpak voor je diensten, om zelf uit te voeren.", build: "Creatie en bouw van je gekozen diensten.", run: "Beheer en verbetering van je gekozen diensten." },
      mediaLabel: "Campagnes & media", packagesLabel: "Pakketten",
      addonsLabel: "Losse diensten",
      addons: { search: "Search (Google Ads)", social: "Social (Meta, LinkedIn, TikTok)", display: "Display", llm: "AI-vindbaarheid (GEO)", print: "Print", outdoor: "Outdoor (DOOH)", video: "Video & CTV", lifecycle: "Lifecycle (e-mail & CRM)", content: "Content creatie" },
      addonDesc: { search: "Zoekcampagnes op Google.", social: "Betaalde social campagnes.", display: "Display-advertenties op websites en apps.", llm: "Vindbaar in ChatGPT, Perplexity en Google AI.", print: "Ontwerp voor advertenties en drukwerk.", outdoor: "Digitale buitenreclame, creatie en planning.", video: "Video-advertenties en Connected TV.", lifecycle: "Retentie via e-mail, CRM en automations." },
      contentOpts: { none: "Geen", klein: "Klein", groot: "Groot" },
      once: "Eenmalig", perMonth: "Per maand", monthCol: "Maand", totalWord: "Totaal", from: "vanaf", mo: "/mnd", once1: "eenmalig", setup: "Opzet", mgmt: "Beheer",
      comboNote: "Combinatievoordeel: de losse Loop Start-fee vervalt zodra je Loop Build afneemt.",
      empty: "Kies minimaal één type of dienst.", cta: "Plan een gesprek", summaryPrefix: "Interesse in",
      steps: { type: "Type", details: "Details", pakketten: "Pakketten", content: "Content", result: "Resultaat" },
      stepHelp: { type: "Kies één type of combineer er meerdere.", details: "Verfijn je keuze per dienst.", pakketten: "Welke fases van de loop neem je af?", content: "Hoeveel content per maand?", result: "Je indicatieve investering." },
      stepTitle: { type: "Wat wil je bouwen?", details: "Stel je scope samen.", pakketten: "Kies je Loop-fases.", content: "Kies je content.", result: "Jouw indicatie." },
      typeNote: "Je kunt types combineren. AI-diensten zijn nieuw en als voorstel geprijsd.",
      waived: "vervalt",
      details: { pickType: "Kies eerst een type hierboven.", campagneQ: "Welke mediakanalen wil je inzetten?", advice: "Ik weet dit nog niet zeker en wil advies", platformQ: "Welke functionaliteit heeft het platform nodig?", appQ: "Wat voor app wil je?", appExtraQ: "Extra diensten", appFeatures: "Gewenste functionaliteit", appFeaturesPh: "Beschrijf kort wat de app moet kunnen", aiNote: "AI integratie of automatisering. We bepalen de exacte scope in het gesprek." },
      appKinds: { webapp: "Webapp", software: "Software-app" },
      platformFns: { website: "Website", ecommerce: "E-commerce", ai: "AI-functionaliteit" },
      typeOpts: { webapp: "Webapp", nativeApp: "Native app", pwa: "PWA", uxDesign: "UX-design", backendApi: "Backend & API", appIntegraties: "Integraties", appStorePub: "App store-publicatie", website: "Website", ecommerce: "Webshop / e-commerce", portaal: "Portaal / dashboard", platformAi: "AI-functionaliteit", platformIntegraties: "Integraties", cms: "CMS", chatbot: "Chatbot / assistent", contentgen: "Contentgeneratie", automatisering: "Automatisering / workflows", dataAnalyse: "Data-analyse", aiIntegratie: "Integratie in tools", customModel: "Custom model" },
      cats: { search: "Search", social: "Social", display: "Display", videotv: "Video & TV", audio: "Audio", email: "E-mail & CRM", messaging: "Messaging", ooh: "Out-of-home", print: "Print", pr: "PR & partnerships" },
      subs: { searchEngines: "Zoekmachines (Google, Bing)", aiSearch: "AI-search / LLM's", socialSearch: "Social search", appStore: "App store (ASO)", meta: "Meta (Facebook, Instagram)", tiktok: "TikTok", linkedin: "LinkedIn", pinterest: "Pinterest", otherSocial: "X, Snapchat, Reddit", programmatic: "Programmatic display", gdn: "Google Display Network", native: "Native advertising", retargeting: "Retargeting", onlineVideo: "Online video (YouTube Ads)", ctv: "Connected TV / streaming", linearTv: "Lineaire TV", radio: "Radio", streamingAudio: "Streaming audio (Spotify)", podcasts: "Podcasts", newsletters: "Nieuwsbrieven", automation: "Marketing automation", loyalty: "Loyaliteit / CRM", whatsapp: "WhatsApp", sms: "SMS", push: "Push-notificaties", billboards: "Billboards & abri's", dooh: "Digital OOH (DOOH)", transit: "Transit (trein, bus)", retail: "Retail / in-store", stationery: "Visitekaartjes & briefpapier", flyers: "Flyers, folders, brochures", directMail: "Direct mail (post)", merch: "Branded gear / merchandise", earned: "Persrelaties / earned media", influencer: "Influencer marketing", affiliate: "Affiliate / partnerships", sponsoring: "Sponsoring & events" },
      catDesc: { search: "Gevonden worden bij een zoekintentie, in zoekmachines en AI.", social: "Organisch en betaald op de platformen waar je doelgroep scrolt.", display: "Banners en native over web en apps.", videotv: "Bewegend beeld, van online video tot Connected TV.", audio: "Radio, streaming audio en podcasts.", email: "Je eigen publiek: e-mail, automation en CRM.", messaging: "Directe 1-op-1 kanalen zoals WhatsApp en SMS.", ooh: "Buitenreclame, van billboards tot digitale schermen.", print: "Gedrukt: van visitekaartjes tot brochures.", pr: "Verdiende aandacht via pers, influencers en partners." },
      onRequest: "Op aanvraag",
      svcCol: "Dienst", priceCol: "Prijs vanaf", contentCreatie: "Content creatie", contentCreatieNote: "Posts, visuals en video in je merkstem.",
      dels: { seoContent: "SEO (content)", seoTech: "SEO (technisch)", sea: "SEA / Google Ads", linkbuilding: "Linkbuilding", socialContent: "Contentcreatie", community: "Community management", paidSocial: "Paid social", socialInfluencer: "Influencer", bannerCreatie: "Bannercreatie", programmaticBuy: "Programmatic inkoop", retargetingSetup: "Retargeting-setup", videoProductie: "Videoproductie", videoMontage: "Montage", videoBuy: "Media-inkoop", spotProductie: "Spotproductie", podcastProductie: "Podcastproductie", audioBuy: "Media-inkoop", templateDesign: "Template-design", emailFlows: "Flows / automation", crmSetup: "CRM-inrichting", flowSetup: "Flow-opzet", msgCopy: "Copy", msgIntegratie: "Integratie", oohOntwerp: "Ontwerp", oohBuy: "Inkoop & planning", oohProductie: "Productie", printOntwerp: "Ontwerp", drukwerk: "Drukwerk", printDistributie: "Distributie", persstrategie: "Persstrategie", influencerMgmt: "Influencer-management", affiliateSetup: "Affiliate-setup" },
      chansH: "Kanalen", delsH: "Diensten", catBase: "Basis", inclFree: "inbegrepen", viaChannels: "via kanalen",
      next: "Volgende", back: "Terug", startOver: "Opnieuw", totalFrom: "Totaal vanaf",
      refTitle: "Prijsreferentie", loopRef: "Flii Loop", loopRefDesc: "Drie pakketten, per campagne, app, platform of AI. Neem de hele loop of losse pakketten.",
      appRef: "App ontwikkeling", appRefDesc: "Drie niveaus. De prijs is de Loop Build-fee; Loop Start en Loop Run reken je apart.", looseRef: "Losse diensten",
      searchRef: "Keyword- en concurrentieonderzoek, structuur, advertentieteksten, conversietracking, optimalisatie en rapportage.",
      socialRef: "Doelgroepbepaling, opzet, A/B-tests, conversietracking, optimalisatie en rapportage. Creatives lopen via content.",
      contentLos: "Los: blog vanaf € 300, visual vanaf € 95, reel of korte video vanaf € 350.",
      appBasis: "Eén kernfunctie, responsive PWA, basismeting, hosting-klaar op Vercel.",
      appAdvanced: "Meerdere modules, gebruikersaccounts, API-koppelingen, dashboard en uitgebreide meting.",
      appPlatform: "Gebruikersrollen, backend en database, AI- of LLM-integratie, beheer-CMS en schaalbaar." },
    calc: { eyebrow: "Prijs indicator", h2: "Bereken Loop.", lede: "Klik snel door de stappen en zie meteen wat Loop kost. Een indicatie op basis van vanaf-tarieven, geen offerte." },
    detail: { backShowcase: "← Showcase", backInsights: "← Inzichten", backHome: "← Home",
      notFound: "Niet gevonden", notFoundSub: "Dit item is mogelijk verwijderd in het CMS.",
      visit: "Bezoek", credential: "Bekijk certificaat ↗" },
    login: { eyebrow: "Beheer", title: "Inloggen", placeholder: "Pincode", error: "Onjuiste pincode",
      submit: "Inloggen", cancel: "Annuleer", loginAria: "Inloggen", logoutAria: "Uitloggen",
      lockedH: "Alleen voor beheer", lockedSub: "Log in met je pincode om de CMS te openen." },
  },
  en: {
    slogan: "AI architecture & marketing apps",
    nav: { solutions: "Solutions", work: "Work", approach: "Approach", about: "About", insights: "Insights", pricing: "Pricing", contact: "Contact", consult: "Book a consultation", manage: "CMS" },
    mega: {
      groups: [
        { group: "Build", blurb: "Design and ship the product.", items: [
          { label: "App & UX design", desc: "Conversion-smart design", href: "#/dienst/app-ux" },
          { label: "Platform development", desc: "Scalable, with backend", href: "#/dienst/platform" },
          { label: "AI integration", desc: "AI in your processes", href: "#/dienst/ai" } ] },
        { group: "Grow", blurb: "Turn the product into growth.", items: [
          { label: "Marketing campaigns", desc: "Across the right channels", href: "#/dienst/campaigns" },
          { label: "Media performance", desc: "Steered on return", href: "#/dienst/media" } ] },
      ],
      featureK: "Flii Loop", featureT: "One loop that keeps learning →",
    },
    hero: { pre: "AI architecture as the foundation of ", mark: "results", post: "",
      sub: "We design and build AI architecture & apps.",
      primary: "Book a consultation", secondary: "See Flii Loop ↘", loopCta: "Test Flii Loop" },
    brandsLabel: "Brands we've shipped for",
    services: { eyebrow: "What we do", h2: "Ready to build?",
      lede: "One offering as the foundation of results. We design and build your blueprint for success.",
      cta: "See the service ↗",
      helpH: "How it helps", execH: "How we do it", outcomeK: "Result", channelsH: "Channels we work with", loopH: "In the Loop",
      items: [
        { slug: "app-ux", tag: "App & UX", title: "App & UX design",
          body: "Apps and interfaces that do what users want.",
          lede: "We design and build apps and interfaces people enjoy using. From first sketch to working PWA, always asking: what does the user actually need?",
          help: [{ h: "Fewer drop-offs", b: "A clear flow removes friction so more visitors do what you want." }, { h: "Something real, sooner", b: "We work in working versions instead of endless mockups." }, { h: "Ready to grow", b: "A setup that scales with new features and users." }],
          exec: [{ h: "Research", b: "We map users, goals and pain points." }, { h: "Design", b: "Wireframes and a sharp, recognisable interface." }, { h: "Build", b: "A responsive app or PWA, hosting-ready." }, { h: "Measure & improve", b: "We measure usage and refine the interface." }],
          outcome: "An app that fits, converts and is ready to build on.", loop: ["You build and launch your app with the first users.", "You measure how people really use the app.", "You see which flows work and what is missing.", "You improve flows and make the app faster."] },
        { slug: "platform", tag: "Platform", title: "Platform development",
          body: "Scalable platforms with backend, data and AI under the hood.",
          lede: "We build full platforms: portals, web apps and sites with a real backend, user roles and AI where needed. Made to scale.",
          help: [{ h: "Everything in one place", b: "Data, users and processes in one system instead of scattered tools." }, { h: "Less manual work", b: "Automation and integrations take repetitive work off your hands." }, { h: "Scalable", b: "An architecture that grows with traffic, features and teams." }],
          exec: [{ h: "Architecture", b: "We define the data model, roles and integrations." }, { h: "Build", b: "Backend, database and interface, module by module." }, { h: "Integrations", b: "APIs, payments, AI and existing tools connected." }, { h: "Operate", b: "Hosting, monitoring and further development." }],
          outcome: "A platform that carries your business instead of slowing it.", loop: ["You build your platform with a backend and go live.", "You measure usage, funnels and where the process stalls.", "You see which steps work and which drop off.", "You automate more and scale the platform up."] },
        { slug: "ai", tag: "AI", title: "AI integration",
          body: "AI that truly takes work off your hands, embedded in your processes.",
          lede: "We integrate AI where it pays off: assistants, automation and smart features that fit inside your existing processes, not beside them.",
          help: [{ h: "Time back", b: "AI takes over repetitive work so your team focuses on what matters." }, { h: "Always available", b: "Assistants that answer questions and qualify leads, day and night." }, { h: "Better decisions", b: "Models that spot patterns people miss." }],
          exec: [{ h: "Find the opportunities", b: "We look for where AI pays off most in your process." }, { h: "Design", b: "We pick the model, data and place in the flow." }, { h: "Integration", b: "We build it into your tools and connect the data." }, { h: "Refine", b: "We measure output and improve quality." }],
          outcome: "AI that runs inside your processes and gets smarter every month.", loop: ["You build your first AI feature into your own process.", "You measure where it saves time and where it misses.", "You see where the output is right and where not.", "You sharpen prompts, data and logic."] },
        { slug: "campaigns", tag: "Campaigns", title: "Marketing campaigns",
          body: "Content and campaigns for every channel. In your brand's voice, built for results.",
          lede: "We set up campaigns that pay back: search, social, display, video, outdoor and AI visibility. One story, across the channels where your customer is.",
          help: [{ h: "The right channels", b: "We pick channels based on your audience, not habit." }, { h: "Measurable return", b: "Every euro is traceable from click to customer." }, { h: "One story", b: "Consistent message and creative across all channels." }],
          exec: [{ h: "Strategy", b: "Audience, message and channel choice." }, { h: "Creative", b: "Ads, copy and visuals that stand out." }, { h: "Launch", b: "Setup, tracking and the first live campaigns." }, { h: "Optimise", b: "We scale what works and cut the rest." }],
          outcome: "Campaigns traceable down to the customer, sharper every month.", loop: ["You launch your campaign across the chosen channels.", "You measure reach, clicks and conversions per channel.", "You see which creatives and messages work.", "You scale the winners and sharpen targeting."] },
        { slug: "media", tag: "Performance", title: "Media performance",
          body: "Organic and paid across 20+ media channels. Driven by data, focused on results.",
          lede: "Management and optimisation of your media. We steer continuously on the numbers that matter, improve what pays off and cut what does not.",
          help: [{ h: "Less waste", b: "Budget shifts to what performs best." }, { h: "Grip on the numbers", b: "Reporting on revenue and value per visitor, no vanity metrics." }, { h: "Continuously better", b: "An iteration every month based on real data." }],
          exec: [{ h: "Measure", b: "We set up tracking and attribution properly." }, { h: "Analyse", b: "We read the data and find the bottlenecks." }, { h: "Adjust", b: "We optimise bids, audiences and creative." }, { h: "Report", b: "Transparent reporting on what really counts." }],
          outcome: "Media that performs measurably better every month.", loop: ["You launch your media on the chosen channels.", "You measure clicks, cost and conversions per channel.", "You see what converts and what wastes budget.", "You scale the winners and sharpen targeting."] }] },
    loopCta: { k: "Flii Loop", h2: "Get in the Loop", body: "Launch, measure and improve. Turn feedback into lasting improvement.", pricing: "See Flii Loop ↗", talk: "Book a consultation" },
    certsLabel: "Certified & partnered",
    stats: [
      { value: 21, suffix: " days", label: "Brief to live" },
      { value: 100, suffix: "%", label: "AI-native delivery" },
      { value: 12, suffix: "+", label: "Products shipped" } ],
    loop: { eyebrow: "Flii Loop", h2: "Improve based on market demand.", center: "Always learning",
      lede: "A plan for launching and continuously improving your apps, platforms or media. In sync with your audience, better every month.",
      items: [
        { k: "Go live", body: "The new app, campaign or platform reaches the market." },
        { k: "Measure", body: "The response from users is mapped out." },
        { k: "Analyse", body: "Data is turned into insights, opportunities and problems." },
        { k: "Improve", body: "We improve, fix or set up a test." } ],
      lens: { generic: "General", platform: "Platform", app: "App", media: "Media" },
      variants: {
        platform: ["We take your platform live with its backend and real users.", "We measure usage, funnels and where the process stalls.", "We build on what works and automate more.", "We scale the platform further with every iteration."],
        app: ["We take your app or PWA live with the first users.", "We see in the data how people really use the app.", "We improve flows and add what people miss.", "We make the app faster and smarter with every release."],
        media: ["We take your campaign live on the chosen channels.", "We measure clicks, cost and conversions per channel.", "We scale what converts and cut the rest.", "We sharpen targeting and creatives every month."],
      },
      priceCta: "Configure your Loop and see pricing ↘" },
    model: { tabCampagnes: "Campaigns", tabApp: "App", tabPlatform: "Platform", eyeCampagnes: "The funnel", eyeApp: "The stack", eyePlatform: "The network" },
    appStack: { h2: "Built from foundation to interface.", lede: "An app is a stack: each layer carries the one above it. We build all four, so the whole thing holds up and scales.", tapHint: "Tap for details",
      layers: [
        { k: "Front end", desc: "The interface users see and operate: web, native or PWA, fast and accessible." },
        { k: "Integrations", desc: "Connections to external systems and APIs, so the app fits your existing landscape." },
        { k: "Databases", desc: "Where your data lives: secure, structured and ready to scale." },
        { k: "Hosting", desc: "The running environment: reliable, scalable hosting and automated deployment." },
        { k: "Codebase", desc: "The foundation: clean, maintainable application code everything rests on." } ] },
    platformNet: { h2: "Your platform at the heart of your media.", lede: "The platform sits at the centre and connects all your channels. Data flows both ways, every channel feeds the whole.", tapHint: "Tap for details", center: "Platform",
      nodes: [
        { k: "CRM", desc: "Customer data and segments flow between your platform and your CRM." },
        { k: "Mail", desc: "Automated email and flows, fed by platform data." },
        { k: "Social", desc: "Organic and paid social, tied to your content and audience." },
        { k: "PR", desc: "Earned attention and press relations around your platform." },
        { k: "Search/LLM", desc: "Findability in search engines and AI assistants." },
        { k: "Paid media", desc: "Paid reach that drives traffic and conversion to the platform." },
        { k: "Outdoor", desc: "Out-of-home that links offline reach to your online platform." },
        { k: "Print", desc: "Printed touchpoints that lead people to the platform." } ] },
    funnel: { eyebrow: "Campaigns", h2: "From stranger to advocate.",
      lede: "Every campaign guides your audience step by step through the funnel, from the first introduction to repeat purchases and referrals.",
      goalLabel: "Goal", exampleLabel: "Example", tapHint: "Tap for description",
      stages: [
        { k: "Aware", goal: "From unaware of your brand to aware, among broad and in-market audiences.", example: "A punchy video hook on YouTube and TikTok that nails the problem in three seconds." },
        { k: "Engaged", goal: "From aware to engaged.", example: "Retarget viewers with a free checklist or tool that delivers value right away." },
        { k: "Nudged", goal: "From engaged to convinced.", example: "Show reviews and a concrete case on your landing page, with a sharp comparison to alternatives." },
        { k: "Signed", goal: "From convinced to conversion.", example: "Remove friction with a short checkout and a limited bonus for buying now." },
        { k: "Loyal", goal: "From conversion to loyal.", example: "An automated email onboarding flow that makes the product pay off in the first week." },
        { k: "Ambassador", goal: "From loyal to advocate.", example: "A referral program where customers get a discount for every new customer they bring in." } ] },
    work: { eyebrow: "flii.labs", h2: "Apps in the pipeline", lede: "Live products and experiments we are building and iterating at flii.labs right now.", manage: "Manage showcase ↗", view: "View case ↗" },
    reviews: { eyebrow: "Reviews", h2: "Proof, not promises.", word: "reviews" },
    byline: { by: "by", name: "Flii Media" },
    who: { eyebrow: "Who we're for", h2: "Built for ambition.",
      lede: "A partner for teams ready to build something that performs.",
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
    cta: { h2: "The power of feedback.", sub: "Modern companies adapt to the market in real time. Use Loop as your engine for improvement.",
      primary: "Book a consultation", secondary: "Get a growth audit ↗" },
    callback: { ph: "Your phone number", cta: "Call me back", subject: "Call me back", bodyPre: "Please call me back on:" },
    contact: [
      { k: "Location", v: "Amstelveen, NL", href: null },
      { k: "Message", v: "WhatsApp us", href: "https://wa.me/31640881169" },
      { k: "Email", v: "hello@flii.nl", href: "mailto:hello@flii.nl" } ],
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
      company_links: [ { label: "Work", href: "#work" }, { label: "About", href: "#about" }, { label: "Insights", href: "#blog" }, { label: "Pricing", href: "#/prijzen" }, { label: "CMS", href: "#/cms" } ],
      bottom: "Built fast. Tuned for performance." },
    cms: { back: "← Back to site", eyebrow: "Control panel", h1: "Content", reset: "Reset to defaults",
      status: { supabase: "Synced with Supabase", loading: "Connecting to Supabase…", local: "Local (this browser)" },
      tabs: { reviews: "Reviews", certs: "Certifications", apps: "Showcase", articles: "Insights" },
      desc: { reviews: "Customer reviews shown on the homepage.", certs: "Partner certifications and tiers.", apps: "Products and cases in the showcase.", articles: "Articles and insights for the blog." },
      collectionsLabel: "Collections", entries: "entries", search: "Search title or slug…", noMatch: "No results.",
      newEntry: "New entry", editEntry: "Edit entry", newPrefix: "+ New: ", view: "View", edit: "Edit", del: "Delete",
      empty: "Nothing here yet. Add the first one.", save: "Save", cancel: "Cancel", slug: "Slug",
      groups: { content: "Content", meta: "Meta", media: "Media", links: "Links" },
      hints: { slug: "URL name. Leave empty to auto-generate.", cover: "Keyword (funnel, build or signal) or an image URL.", body: "Formatting: ## heading · > quote · - list · ![caption](funnel) for a figure.", metrics: "Format label:value, comma separated." },
      confirmReset: "Reset all content to defaults?", confirmDelete: "Delete this item?",
      f: { quote: "Quote", name: "Name", role: "Role", org: "Organisation", rating: "Rating (1-5)",
        certName: "Name", tier: "Tier", blurb: "Blurb", link: "Link",
        title: "Title", client: "Client", tag: "Tag", summary: "Summary",
        body: "Body", metrics: "Metrics", read: "Read time", cover: "Cover",
        category: "Category", date: "Date", excerpt: "Excerpt" } },
    pricing: { eyebrow: "Pricing", h1: "Configure your Loop.",
      intro: "Indicative prices, excluding VAT and based on starting rates. Media budget is not included. The final price depends on scope.",
      scopeLabel: "What do you need?", scopes: { campagne: "Campaign", app: "App", platform: "Platform", ai: "AI" },
      scopeDesc: { campagne: "An ad campaign, set up and steered on results.", app: "A working app or PWA, from one feature to several modules.", platform: "A full, scalable platform with backend and AI.", ai: "An AI solution or automation, from integration to a custom model." },
      badge: "Most chosen", save: "You save",
      levelLabel: "Level", levels: { basis: "Basic", advanced: "Advanced" },
      phaseLabel: "Packages", phases: { plan: "Loop Start", build: "Loop Build", run: "Loop Run" },
      phaseDesc: { plan: "Research and plan of action, with the option to execute it yourself.", build: "Creation: the app, platform or campaign gets built.", run: "Manage & improve: hosting, optimisation and further development." },
      phaseByType: {
        campagne: { plan: "Research and strategy for your campaigns, ready to execute yourself.", build: "Creation of the content and campaigns.", run: "Management and improvement of your campaigns." },
        app: { plan: "Research and plan for your app, ready to execute yourself.", build: "Design and build of the app.", run: "Management and further development of the app." },
        platform: { plan: "Research and plan for your platform, ready to execute yourself.", build: "Design and build of the platform.", run: "Hosting, management and further development." },
        ai: { plan: "Research and plan for the AI integration, ready to execute yourself.", build: "Build and integration of the AI solution.", run: "Management and optimisation of the AI." },
      },
      phaseMulti: { plan: "Research and plan of action for your services, ready to execute yourself.", build: "Creation and build of your chosen services.", run: "Management and improvement of your chosen services." },
      mediaLabel: "Campaigns & media", packagesLabel: "Packages",
      addonsLabel: "Add-on services",
      addons: { search: "Search (Google Ads)", social: "Social (Meta, LinkedIn, TikTok)", display: "Display", llm: "AI visibility (GEO)", print: "Print", outdoor: "Outdoor (DOOH)", video: "Video & CTV", lifecycle: "Lifecycle (email & CRM)", content: "Content creation" },
      addonDesc: { search: "Search campaigns on Google.", social: "Paid social campaigns.", display: "Display ads across websites and apps.", llm: "Found in ChatGPT, Perplexity and Google AI.", print: "Design for ads and print.", outdoor: "Digital out-of-home, creative and planning.", video: "Video ads and Connected TV.", lifecycle: "Retention via email, CRM and automations." },
      contentOpts: { none: "None", klein: "Small", groot: "Large" },
      once: "One-time", perMonth: "Per month", monthCol: "Month", totalWord: "Total", from: "from", mo: "/mo", once1: "one-time", setup: "Setup", mgmt: "Management",
      comboNote: "Bundle benefit: the separate Loop Start fee is waived as soon as you take Loop Build.",
      empty: "Pick at least one type or service.", cta: "Book a consultation", summaryPrefix: "Interested in",
      steps: { type: "Type", details: "Details", pakketten: "Packages", content: "Content", result: "Result" },
      stepHelp: { type: "Pick one type or combine several.", details: "Refine your choice per service.", pakketten: "Which phases of the loop do you take?", content: "How much content per month?", result: "Your indicative investment." },
      stepTitle: { type: "What do you want to build?", details: "Build your scope.", pakketten: "Choose your Loop phases.", content: "Choose your content.", result: "Your estimate." },
      typeNote: "You can combine types. AI services are new and priced as a proposal.",
      waived: "waived",
      details: { pickType: "Pick a type above first.", campagneQ: "Which media channels do you want to use?", advice: "I'm not sure yet and want advice", platformQ: "Which functionality does the platform need?", appQ: "What kind of app do you want?", appExtraQ: "Extra services", appFeatures: "Desired functionality", appFeaturesPh: "Briefly describe what the app should do", aiNote: "AI integration or automation. We define the exact scope in the call." },
      appKinds: { webapp: "Web app", software: "Software app" },
      platformFns: { website: "Website", ecommerce: "E-commerce", ai: "AI functionality" },
      typeOpts: { webapp: "Web app", nativeApp: "Native app", pwa: "PWA", uxDesign: "UX design", backendApi: "Backend & API", appIntegraties: "Integrations", appStorePub: "App store release", website: "Website", ecommerce: "Webshop / e-commerce", portaal: "Portal / dashboard", platformAi: "AI functionality", platformIntegraties: "Integrations", cms: "CMS", chatbot: "Chatbot / assistant", contentgen: "Content generation", automatisering: "Automation / workflows", dataAnalyse: "Data analysis", aiIntegratie: "Integration into tools", customModel: "Custom model" },
      cats: { search: "Search", social: "Social", display: "Display", videotv: "Video & TV", audio: "Audio", email: "Email & CRM", messaging: "Messaging", ooh: "Out-of-home", print: "Print", pr: "PR & partnerships" },
      subs: { searchEngines: "Search engines (Google, Bing)", aiSearch: "AI search / LLMs", socialSearch: "Social search", appStore: "App store (ASO)", meta: "Meta (Facebook, Instagram)", tiktok: "TikTok", linkedin: "LinkedIn", pinterest: "Pinterest", otherSocial: "X, Snapchat, Reddit", programmatic: "Programmatic display", gdn: "Google Display Network", native: "Native advertising", retargeting: "Retargeting", onlineVideo: "Online video (YouTube Ads)", ctv: "Connected TV / streaming", linearTv: "Linear TV", radio: "Radio", streamingAudio: "Streaming audio (Spotify)", podcasts: "Podcasts", newsletters: "Newsletters", automation: "Marketing automation", loyalty: "Loyalty / CRM", whatsapp: "WhatsApp", sms: "SMS", push: "Push notifications", billboards: "Billboards & panels", dooh: "Digital OOH (DOOH)", transit: "Transit (train, bus)", retail: "Retail / in-store", stationery: "Business cards & stationery", flyers: "Flyers, leaflets, brochures", directMail: "Direct mail", merch: "Branded gear / merch", earned: "PR / earned media", influencer: "Influencer marketing", affiliate: "Affiliate / partnerships", sponsoring: "Sponsoring & events" },
      catDesc: { search: "Getting found on search intent, in engines and AI.", social: "Organic and paid on the platforms where your audience scrolls.", display: "Banners and native across web and apps.", videotv: "Moving image, from online video to Connected TV.", audio: "Radio, streaming audio and podcasts.", email: "Your own audience: email, automation and CRM.", messaging: "Direct 1-to-1 channels like WhatsApp and SMS.", ooh: "Out-of-home, from billboards to digital screens.", print: "Print, from business cards to brochures.", pr: "Earned attention via press, influencers and partners." },
      onRequest: "On request",
      svcCol: "Service", priceCol: "From", contentCreatie: "Content creation", contentCreatieNote: "Posts, visuals and video in your brand voice.",
      dels: { seoContent: "SEO (content)", seoTech: "SEO (technical)", sea: "SEA / Google Ads", linkbuilding: "Link building", socialContent: "Content creation", community: "Community management", paidSocial: "Paid social", socialInfluencer: "Influencer", bannerCreatie: "Banner creative", programmaticBuy: "Programmatic buying", retargetingSetup: "Retargeting setup", videoProductie: "Video production", videoMontage: "Editing", videoBuy: "Media buying", spotProductie: "Spot production", podcastProductie: "Podcast production", audioBuy: "Media buying", templateDesign: "Template design", emailFlows: "Flows / automation", crmSetup: "CRM setup", flowSetup: "Flow setup", msgCopy: "Copy", msgIntegratie: "Integration", oohOntwerp: "Design", oohBuy: "Buying & planning", oohProductie: "Production", printOntwerp: "Design", drukwerk: "Print", printDistributie: "Distribution", persstrategie: "PR strategy", influencerMgmt: "Influencer management", affiliateSetup: "Affiliate setup" },
      chansH: "Channels", delsH: "Services", catBase: "Base", inclFree: "included", viaChannels: "via channels",
      next: "Next", back: "Back", startOver: "Start over", totalFrom: "Total from",
      refTitle: "Price reference", loopRef: "Flii Loop", loopRefDesc: "Three packages, per campaign, app, platform or AI. Take the full loop or single packages.",
      appRef: "App development", appRefDesc: "Three levels. The price is the Loop Build fee; Loop Start and Loop Run are billed separately.", looseRef: "Add-on services",
      searchRef: "Keyword and competitor research, structure, ad copy, conversion tracking, optimisation and reporting.",
      socialRef: "Audience targeting, setup, A/B tests, conversion tracking, optimisation and reporting. Creatives run via content.",
      contentLos: "Single: blog from € 300, visual from € 95, reel or short video from € 350.",
      appBasis: "One core feature, responsive PWA, basic measurement, hosting-ready on Vercel.",
      appAdvanced: "Multiple modules, user accounts, API integrations, dashboard and extended measurement.",
      appPlatform: "User roles, backend and database, AI or LLM integration, admin CMS and scalable." },
    calc: { eyebrow: "Price indicator", h2: "Calculate your Loop.", lede: "Click through the steps and instantly see what your Loop costs. An estimate based on starting rates, not a quote." },
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
const shotUrl = (url) => `https://image.thum.io/get/width/1440/crop/900/wait/6/${url}`;
const DEFAULT_APPS = [
  { id: "performance-os", title: "Performance OS", client: "Flii Media", tag: "Analytics / Dashboard",
    link: "https://dashboard-zo-git-demo-flii-media.vercel.app/",
    summary: "Marketing-dashboard dat GA4-data omzet naar heldere stuurinformatie.",
    lead: "Een dashboard dat ruwe analytics vertaalt naar beslissingen die een team meteen kan nemen.",
    details: [
      { k: "Wat", v: "Een marketing- en groei-dashboard bovenop Google Analytics 4." },
      { k: "Inhoud", v: "Scorecards, kanalen, een conversiefunnel en demografie, met een AI-samenvatting en business insights die reageren op je eigen context." },
      { k: "Stack", v: "React met de GA4 Data API en interactieve grafieken." },
    ] },
  { id: "faab", title: "Founder as a Brand", client: "Flii Labs", tag: "PWA / AI",
    link: "https://faab-one.vercel.app/",
    summary: "AI-tool die oprichters helpt hun persoonlijke merk op LinkedIn te bouwen.",
    lead: "Van positionering naar concrete content, in de eigen stem van de oprichter.",
    details: [
      { k: "Wat", v: "Een personal-branding-tool voor founders op LinkedIn." },
      { k: "Hoe", v: "Vier stappen, Founder, Strategy, Topics en Post, waarin AI je positionering en berichten uitwerkt." },
      { k: "Extra", v: "Volledig tweetalig, met automatische browsertaal-detectie." },
    ] },
  { id: "fcdata", title: "FC Data", client: "Flii Labs", tag: "Platform / Data",
    link: "https://fcdata.vercel.app/",
    summary: "Voetbaldataplatform waarop je elke speler, club en competitie opzoekt.",
    lead: "Een toegankelijk alternatief voor Transfermarkt, gebouwd rond vindbaarheid en verkeer.",
    details: [
      { k: "Wat", v: "Een platform met data over spelers, clubs en competities." },
      { k: "Hoe", v: "Een levende zoekbalk als startpunt; alles is opzoekbaar en puur om te tonen, zonder eigen API." },
      { k: "Model", v: "Draait op verkeer en advertenties, volledig tweetalig NL en EN." },
    ] },
  { id: "wk2026", title: "World Cup Model", client: "Flii Labs", tag: "Sport / PWA",
    link: "https://wk2026-voorspellingen.vercel.app/",
    summary: "Beheer je WK-voorspellingen en fantasy team op een aanpasbaar datamodel.",
    lead: "Speel het WK 2026 mee met voorspellingen en een fantasy team dat live meebeweegt.",
    details: [
      { k: "Wat", v: "Een voorspellingen- en fantasy-omgeving voor het WK 2026." },
      { k: "Hoe", v: "Zet je voorspellingen, stel een team samen en zie standen en punten meebewegen met de echte wedstrijden." },
      { k: "Tech", v: "Aanpasbaar datamodel, mobile-first en installeerbaar als PWA." },
    ] },
  { id: "wedding-pwa", title: "Weddy", client: "Flii Labs", tag: "PWA",
    link: "https://wedding-app-git-demo-flii-media.vercel.app/",
    summary: "Trouwplanner waarin het bruidspaar samen de hele dag regelt.",
    lead: "Alles voor de trouwdag op een plek, samen bij te houden.",
    details: [
      { k: "Wat", v: "Een wedding planner voor bruid en bruidegom." },
      { k: "Inhoud", v: "Taken, budget, gastenlijst en een dagplanning van minuut tot minuut." },
      { k: "Tech", v: "Installeerbaar als PWA en offline te gebruiken." },
    ] },
];
const DEFAULT_ARTICLES = [
  { id: "stop-kapotte-funnels", title: "Stop met kapotte funnels opschalen", cat: "Performance", date: "jun 2026", read: "6 min", cover: "funnel",
    excerpt: "Meer leads bij gelijke omzet is een valkuil. Repareer conversie voordat je budget toevoegt.",
    body: `Er is een moment in bijna elk groeitraject waarop iemand met overtuiging zegt: we moeten meer budget op de advertenties zetten. De cijfers lijken het te steunen. Het verkeer is goedkoop, de kliks komen binnen, en toch blijft de omzet achter. Het antwoord voelt logisch: meer bovenaan erin, dan komt er onderaan vanzelf meer uit. Maar dat klopt alleen als de funnel onderweg niets weglekt. En dat doet hij bijna altijd.

Budget in een funnel pompen die niet converteert, koopt geen groei. Het koopt duurdere teleurstelling. Voordat je ook maar één euro extra uitgeeft, moet je weten waar het pad van klik naar omzet lekt, en dat lek eerst dichten.

## De rekensom die niemand hardop maakt

Stel je verdubbelt je advertentiebudget. In het gunstigste geval verdubbelt je verkeer mee. Maar je conversieratio verandert niet, want aan de funnel zelf heb je niets gedaan. Je betaalt dus twee keer zoveel om exact hetzelfde percentage bezoekers te converteren. Erger nog: schaal je op binnen hetzelfde kanaal, dan bereik je vaak een minder gekwalificeerd publiek en daalt je conversie juist. Je kosten stijgen lineair, je opbrengst sublineair. Dat is geen groei, dat is verlies met een groeigrafiek eromheen.

De eerlijke vraag is niet hoeveel verkeer je kunt kopen, maar hoeveel omzet je haalt per honderd bezoekers, en waar je de andere drieënnegentig verliest. Pas als dat antwoord scherp is, wordt extra budget een hefboom in plaats van een lek.

## Wat kapot precies betekent

Een kapotte funnel is zelden één groot gat. Het zijn meestal drie kleinere, die elkaar versterken:

- De aanbieding is onduidelijk. De bezoeker snapt binnen vijf seconden niet wat je verkoopt, voor wie het is, en waarom nu.
- De landingservaring vraagt te veel, te vroeg. Traag laden, een formulier met elf velden, of een pagina die op mobiel uit elkaar valt.
- De overdracht naar sales lekt. Een lead vult een formulier in en hoort drie dagen niets, of belandt in een inbox die niemand leest.

![Van klik naar omzet: waar de meeste funnels hun bezoekers verliezen](funnel)

Elk van die drie kost je een deel van de bezoekers die je net duur hebt ingekocht. Vermenigvuldig de verliezen en je begrijpt waarom meer budget het probleem groter maakt in plaats van kleiner. Een funnel die op klein volume tien procent weglekt, lekt op groot volume nog steeds tien procent, alleen tegen een veel hogere prijs.

## Repareer in deze volgorde

Begin niet bij het kanaal, begin bij het einde. Werk terug van omzet naar klik, want een reparatie stroomafwaarts is waardeloos zolang het lek erboven zit.

Eerst de overdracht. Hoe snel en hoe goed wordt een lead opgevolgd? Een lead die binnen vijf minuten een reactie krijgt, converteert veelvoudig beter dan een lead die een dag moet wachten. Dit is vaak de goedkoopste ingreep met de grootste impact, en hij kost geen cent extra advertentiebudget. Soms is het verschil tussen stilstand en groei niet een nieuw kanaal, maar iemand die de telefoon opneemt.

Dan de landingservaring. Meet de werkelijke laadtijd op een gemiddelde telefoon op een gemiddelde verbinding, niet op je glasvezel met een leeg cachegeheugen. Haal velden uit je formulier tot alleen overblijft wat sales echt nodig heeft om het gesprek te beginnen. Eén heldere actie per pagina, niet vier die om aandacht vechten.

Dan de aanbieding. Dit is het moeilijkste, want het raakt aan positionering. Kan een vreemde in één zin navertellen wat je doet en voor wie? Zo niet, dan converteert geen enkele hoeveelheid verkeer goed, hoe strak de pagina er ook uitziet. De aanbieding repareren is werk dat je niet wegoptimaliseert met knoppen en kleuren, het vraagt dat je een keuze maakt over wie je wel en niet bedient.

> Verkeer is een vermenigvuldiger, en een vermenigvuldiger werkt twee kanten op. Hij vergroot wat werkt en vergroot net zo hard wat niet werkt.

## Meet wat telt, niet wat makkelijk is

De meeste dashboards tonen wat eenvoudig te meten is: kliks, impressies, kosten per klik. Dat zijn ijdele cijfers zolang je niet weet wat een bezoeker waard is. De enige metriek die de reparatie stuurt, is de waarde per bezoeker: omzet gedeeld door bezoekers, over een periode die lang genoeg is om je salescyclus te dekken.

Zodra je die kent, wordt elke beslissing simpel. Stijgt de waarde per bezoeker na een ingreep? Houden. Daalt hij zodra je opschaalt? Stoppen, en eerst terug naar de funnel. Je hoeft niet te raden en je hoeft niet te discussiëren over onderbuikgevoel, je laat de waarde per bezoeker de beslissing nemen.

## Een rekenvoorbeeld dat blijft hangen

Neem een webshop met honderd bezoekers per dag en een conversie van twee procent. Dat zijn twee verkopen. De eigenaar verdubbelt het budget, het verkeer gaat naar tweehonderd, maar de conversie zakt naar anderhalf procent omdat het extra publiek minder gericht is. Resultaat: drie verkopen in plaats van vier, tegen dubbele advertentiekosten. Hij betaalt meer en groeit minder hard dan de grafiek beloofde.

Nu hetzelfde bedrijf, maar in omgekeerde volgorde. Eerst wordt de productpagina sneller, het formulier korter en de opvolging strakker. De conversie stijgt van twee naar drie procent. Bij dezelfde honderd bezoekers zijn dat al drie verkopen, zonder een euro extra advertentiegeld. Verdubbelt hij daarna het budget, dan staan er zes verkopen, want nu werkt de hogere conversie mee op elke nieuwe bezoeker.

Hetzelfde budget, hetzelfde verkeer, een totaal andere uitkomst. Het verschil zit niet in hoeveel je erin stopt, maar in de staat van de funnel waar het doorheen gaat. Dat is de hele les: conversie is een vermenigvuldiger die op al je toekomstige verkeer wordt toegepast, en daarmee de enige investering die zichzelf blijft terugbetalen.

## Pas daarna schaal je op

Als de overdracht strak staat, de pagina snel en helder is, en de aanbieding klopt, dan, en pas dan, is opschalen verstandig. Nu werkt de vermenigvuldiger in je voordeel. Elke extra euro raakt een pad dat bewezen omzet oplevert, en je weet binnen een week of het kanaal blijft presteren op schaal.

Dit is geen pleidooi tegen adverteren. Het is een pleidooi voor volgorde. Eerst converteren, dan schalen. De teams die we het hardst zien groeien, hebben zelden de grootste budgetten. Het zijn de teams die hun funnel behandelen als een product: ze meten waar het lekt, repareren in de juiste volgorde, en geven pas gas als het pad van klik naar omzet aantoonbaar dicht is. Saai, methodisch, en veel winstgevender dan nog een budgetverhoging die je teleurstelling alleen maar opschaalt.` },
  { id: "lanceren-21-dagen", title: "Lanceren in 21 dagen met AI in de loop", cat: "AI Build", date: "jun 2026", read: "7 min", cover: "launch",
    excerpt: "Wat verandert er als AI de bouwer is en jij regisseert, en waar wint de mens nog?",
    body: `Drie weken klinkt te kort om iets echts te lanceren. Dat was het ook, tot voor kort. De afstand tussen een idee en werkende software werd altijd bepaald door hoe snel mensen konden typen, testen en herstellen. Die afstand is in elkaar geklapt. Niet omdat mensen sneller typen, maar omdat AI het typen heeft overgenomen. Wat overblijft, is oordeel. En oordeel is precies waar de mens nog wint.

Een lancering in eenentwintig dagen is geen trucje en geen belofte van perfectie. Het is een andere manier van werken, waarin de rem niet langer bij de uitvoering zit maar bij de keuzes. Dit is wat er verandert, en wat hetzelfde blijft.

## De rem verschuift van handen naar hoofd

Vroeger was bouwen de bottleneck. Je had een idee, en dan volgden weken van implementatie voordat je kon zien of het idee deugde. De meeste tijd ging naar uitvoering, niet naar denken.

Met AI als bouwer keert dat om. Een werkend prototype is er in uren, niet in weken. De vraag is niet meer of je het kunt bouwen, maar of je weet wat je wilt bouwen, en of je kunt zien wanneer het resultaat goed genoeg is om live te gaan. De schaarste verschuift van typesnelheid naar smaak en richting.

Dat klinkt bevrijdend, en dat is het ook, maar het legt een nieuwe last bij de mens. Als bouwen bijna gratis wordt, wordt de prijs van vaag denken zichtbaar. Een onduidelijke opdracht levert nu in een uur een onduidelijk product op, in plaats van pas na een maand. Je fouten komen sneller terug.

## AI bouwt, jij regisseert

De teams die hier het meeste uithalen, behandelen AI niet als een collega met een eigen mening, maar als een buitengewoon snelle bouwer die exact doet wat hem gevraagd wordt. De rol van de mens schuift op naar die van regisseur: eigenaar van de scope, bewaker van de smaak, en degene die beslist wat de deur uit gaat.

![De loop: regisseren, bouwen, beoordelen, bijsturen](build)

Regisseren betekent in de praktijk drie dingen. Je bepaalt de scope, dus wat er wel en vooral niet in deze versie hoort. Je bewaakt de kwaliteit, want een AI levert moeiteloos iets op dat werkt maar niet klopt. En je neemt de eindbeslissing over wat live gaat, want die verantwoordelijkheid kun je niet delegeren aan een model dat geen gevolgen draagt.

Wie deze rol niet pakt, krijgt een berg code die werkt maar nergens heen gaat. Snelheid zonder richting is geen voordeel, het is alleen sneller verdwalen.

## Eenentwintig dagen, in drie bewegingen

De eerste week is voor scherpte. Niet bouwen, maar kiezen. Wat is de kern, voor wie, en hoe weet je straks of het werkt? Een goede brief in week één bespaart je tien correcties in week drie. Hier wint de mens, want geen model kan voor jou bepalen welk probleem het waard is om op te lossen.

De tweede week is voor tempo. Nu draait de loop op volle kracht: regisseren, bouwen, beoordelen, bijsturen, en weer opnieuw. Omdat een iteratie uren kost in plaats van dagen, kun je per dag meerdere keren rond. Je leert niet uit vergaderingen maar uit werkende versies die je voor je ziet.

De derde week is voor afmaken. Het laatste deel van een lancering, de scherpe randen, de echte data, de momenten waarop het misgaat, is altijd het werk dat AI het minst goed alleen doet. Hier komt de menselijke smaak terug: het verschil tussen iets dat werkt en iets dat af voelt.

> AI verkleint de afstand tussen idee en uitvoering tot bijna nul. Daardoor wordt de kwaliteit van je idee opeens het enige dat telt.

## Waar de mens wint

Het is verleidelijk om te denken dat snelheid het hele verhaal is. Dat is het niet. De drie dingen die een lancering laten slagen, zijn juist de dingen die AI niet voor je doet.

Het eerste is oordeel: weten wanneer iets goed genoeg is, en wanneer net niet. Het tweede is scope: de discipline om dingen weg te laten, terwijl een model je met plezier alles tegelijk bouwt. Het derde is verantwoordelijkheid: iemand moet beslissen wat live gaat en de gevolgen dragen, en dat is geen taak voor een systeem zonder belang bij de uitkomst.

## De valkuilen die snelheid met zich meebrengt

Snelheid lost het ene probleem op en introduceert een nieuw. Wie in uren kan bouwen, bouwt al snel meer dan nodig is. De verleiding om er nog een functie bij te vragen is groot, juist omdat het zo weinig moeite kost. Voor je het weet heb je een product met tien half afgemaakte ideeën in plaats van één dat af is. Scope-discipline wordt belangrijker naarmate bouwen goedkoper wordt, niet minder belangrijk.

De tweede valkuil is vertrouwen zonder controle. Een AI levert code die werkt, en werkende code voelt als af. Maar werken en kloppen zijn niet hetzelfde. Een model maakt aannames die het niet uitspreekt, kiest randgevallen die je niet hebt bedacht, en presenteert het resultaat met hetzelfde gemak of het nu briljant of subtiel fout is. Wie niet leest wat er gebouwd is, levert vroeg of laat iets op dat onderhuids rammelt.

De derde valkuil is de illusie dat snelheid richting vervangt. Drie weken winnen op de bouw helpt je niet als je de verkeerde drie weken bouwt. Een snel gebouwd verkeerd product is alleen sneller verkeerd. De tijd die je wint, hoort terug te gaan naar nadenken, niet naar nog meer bouwen.

Geen van deze valkuilen is een reden om langzamer te werken. Ze zijn een reden om de menselijke rol serieus te nemen: kiezen, controleren, en de richting bewaken terwijl de uitvoering om je heen versnelt.

## Snelheid is een middel, geen doel

Lanceren in eenentwintig dagen is geen wedstrijd in hard rennen. Het is een manier om sneller te leren of een idee deugt, tegen veel lagere kosten dan vroeger. Je zet niet drie maanden in op een aanname, je test hem in drie weken en je weet het.

De teams die hier winnen, zijn niet de teams die het snelst bouwen. Het zijn de teams die het scherpst kiezen, het strengst weglaten, en het beste zien wanneer iets af is. AI levert het tempo. De mens levert de richting. En richting, niet snelheid, is wat een lancering laat slagen.` },
  { id: "analytics-weet-al", title: "Je analytics weet al wat te doen", cat: "RevOps", date: "mei 2026", read: "6 min", cover: "analytics",
    excerpt: "De data die je product verzamelt is de goedkoopste groeiknop die je niet gebruikt.",
    body: `De meeste teams zoeken hun volgende groeiknop buiten de deur. Een nieuw kanaal, een nieuwe campagne, een nieuw budget. Ondertussen zitten ze op een berg gedragsdata die ze zelf verzamelen en nooit gebruiken. Elk klik, elke sessie, elk moment waarop een gebruiker afhaakt of juist doorgaat, is een signaal. Het signaal is er al. Het wordt alleen zelden omgezet in een beslissing.

Dat is zonde, want het is de goedkoopste groeiknop die er is. Je hebt er niets extra's voor nodig: geen nieuw kanaal, geen groter budget. Je hoeft alleen de data die je product al produceert te koppelen aan de keuzes die je marketing en sales maken.

## Twee werelden die elkaar niet spreken

In de meeste bedrijven leven productdata en marketingdata in gescheiden werelden. Het product weet precies wie actief is, wie vastloopt, en wie op het punt staat te vertrekken. De marketing weet wie er binnenkwam, via welk kanaal, en tegen welke kosten. Maar die twee praten niet met elkaar.

Het gevolg: marketing optimaliseert op het verkeerde doel. Je stuurt op leads, terwijl niet elke lead evenveel waard is. Je viert een goedkope aanmelding, terwijl die gebruiker drie dagen later alweer weg is. Zolang de marketing niet weet wat er ná de aanmelding gebeurt, stuurt ze blind.

## Het signaal zit in het gedrag

Elke gebruiker laat een spoor achter dat verraadt hoe het verder gaat. Een paar voorbeelden van signalen die de meeste teams al hebben, maar niet benutten:

- Het activatiemoment. De handeling die een nieuwe gebruiker doet vlak voordat hij blijft hangen. Wie die handeling haalt, blijft. Wie hem mist, vertrekt.
- Het afhaaksignaal. Het patroon dat voorafgaat aan vertrek: minder sessies, kortere bezoeken, een functie die niet meer gebruikt wordt.
- Het uitbreidingssignaal. Gedrag dat laat zien dat iemand klaar is voor meer, een zwaarder plan, een extra zitplaats, een vervolgaankoop.

![Van productgedrag naar marketingbeslissing](signal)

Deze signalen liggen in je eventdata, vaak al maanden. Het enige wat ontbreekt, is de brug naar de plek waar beslissingen worden genomen.

## Koppel events aan beslissingen

De brug bouwen is minder werk dan het lijkt. Je hebt geen volledig nieuw datateam nodig, je hebt een handvol koppelingen nodig die productgedrag doorgeven aan je marketing en sales.

Drie koppelingen leveren bijna altijd direct rendement op. De eerste: stuur het activatiesignaal terug naar je advertentieplatform, zodat je niet optimaliseert op aanmeldingen maar op gebruikers die daadwerkelijk activeren. Je advertenties leren dan zoeken naar mensen die blijven, niet naar mensen die klikken.

De tweede: laat het afhaaksignaal een actie starten. Een gerichte mail, een seintje naar sales, een aanbod op het juiste moment. Niet voor iedereen, maar precies voor de gebruikers die op het punt staan te vertrekken en nog te redden zijn.

De derde: gebruik het uitbreidingssignaal om sales te laten weten wanneer een klant klaar is voor meer. Geen koud nabellen, maar contact op het moment dat het gedrag erom vraagt.

> Dezelfde dataset waarmee je groei meet, kan groei aansturen. Meten en sturen zijn geen twee projecten, het is dezelfde data met een andere bestemming.

## Begin klein, en met één signaal

De fout die teams hier maken, is te groot beginnen. Ze willen een compleet datamodel, een perfect dashboard, een systeem dat alles voorspelt. Dat duurt maanden en levert intussen niets op.

Begin met één signaal en één beslissing. Kies je activatiemoment, definieer het scherp, en koppel het aan precies één keuze, bijvoorbeeld waar je advertenties op optimaliseren. Dat is in een week te bouwen en je ziet binnen een maand of het werkt. Werkt het, dan voeg je het volgende signaal toe. Werkt het niet, dan heb je een week verloren in plaats van een kwartaal. Klein beginnen is niet voorzichtig, het is de snelste manier om te leren wat je data je probeert te vertellen.

## Een voorbeeld: van aanmelding naar activatie

Stel een product waar nieuwe gebruikers zich gratis aanmelden. De marketing optimaliseert op die aanmeldingen, want dat is wat het advertentieplatform kan meten. De kosten per aanmelding dalen mooi, het dashboard kleurt groen. Toch groeit de omzet niet mee. De reden: een groot deel van die goedkope aanmeldingen logt één keer in en komt nooit terug.

In de productdata is precies te zien waar het kantelt. Gebruikers die binnen hun eerste sessie één specifieke handeling doen, hun eerste project aanmaken, blijven veel vaker hangen dan gebruikers die dat niet doen. Dat is het activatiemoment. Door dat ene event terug te sturen naar het advertentieplatform, verschuift het doel van aanmelding naar activatie. De advertenties stoppen met jagen op goedkope klikkers en gaan zoeken naar mensen die het product echt gaan gebruiken. De kosten per aanmelding stijgen op papier, maar de kosten per blijvende gebruiker dalen, en dat is de metriek die telt.

## Wat het oplevert

Het mooie aan deze aanpak is dat hij geen nieuw verkeer en geen groter budget vraagt. Je verlegt alleen waar je bestaande systeem op stuurt. Dezelfde campagnes, hetzelfde geld, maar gericht op het gedrag dat omzet voorspelt in plaats van op het gedrag dat makkelijk te tellen is.

En het stopt niet bij activatie. Zodra de brug tussen productgedrag en marketing er ligt, kun je hem voor elk signaal gebruiken. Het afhaaksignaal wordt een reddingsactie, het uitbreidingssignaal wordt een verkoopkans, en elk nieuw inzicht uit je data wordt direct een hefboom in plaats van een grafiek waar niemand iets mee doet.

Dat is de echte winst: niet één slimme koppeling, maar een manier van werken waarin je product en je marketing eindelijk dezelfde taal spreken. De data die je toch al verzamelt, gaat werken voor je groei in plaats van stof vangen in een dashboard.

## De goedkoopste knop die je niet gebruikt

Een nieuw kanaal kost geld en tijd voordat het iets oplevert. Een groter budget vergroot zowel je winst als je verlies. Maar de signalen in je eigen productdata heb je al betaald: ze ontstaan vanzelf, elke dag, bij elke gebruiker.

De teams die dit benutten, hebben geen geheim kanaal en geen groter budget. Ze hebben alleen de moeite genomen om hun eigen data te laten praten met hun eigen beslissingen. Het signaal was er al. De enige vraag is of je ernaar luistert.` },
];
const DEFAULT_REVIEWS = [
  { id: "bikefair", logo: "bikefair.org", quote: "Resultaat geleverd: persoonlijke aanpak, kwaliteit van werk, korte lijntjes. Het zijn experts in hun veld.", name: "J. Pecník", role: "CEO", org: "BikeFair", rating: 5 },
  { id: "soest-machinery", logo: "soestmachinery.com", quote: "Erg tevreden over de kwaliteit, resultaten en betrokkenheid. Bedankt!", name: "M. van Soest", role: "CEO", org: "Soest Machinery", rating: 5 },
  { id: "social-innovations", logo: "socialinnovations.nl", quote: "Creatieve denkers die zich goed kunnen verplaatsen in je bedrijf. En waar je van op aan kan.", name: "Tim Muller", role: "Head of Marketing", org: "Social Innovations", rating: 5 },
  { id: "broadcast-magazine", logo: "broadcastmagazine.nl", quote: "Snel, ter zake kundig en met resultaat. Wat wil een mens nog meer?", name: "J. Te Nuijl", role: "Hoofdredacteur", org: "Broadcast Magazine", rating: 5 },
  { id: "zeewind", logo: "zeewind.nl", quote: "Niets minder dan indrukwekkend. Ik kan hun diensten ten zeerste aanbevelen.", name: "H. Hasnaoui", role: "Eigenaar", org: "Zeewind", rating: 5 },
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
const SEED_VERSION = 10;
function loadStore() { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function saveStore(d) { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch (e) {} }

const sbHeaders = () => ({ apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" });
async function sbGet(table) { const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*&order=created_at.asc`, { headers: sbHeaders() }); if (!r.ok) throw new Error(`${table} ${r.status}`); return r.json(); }
async function sbUpsert(table, row) { const r = await fetch(`${SB_URL}/rest/v1/${table}?on_conflict=id`, { method: "POST", headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(row) }); if (!r.ok) throw new Error(await r.text()); }
async function sbDelete(table, id) { const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: { ...sbHeaders(), Prefer: "return=minimal" } }); if (!r.ok) throw new Error(await r.text()); }
async function seedRemote(coll, items) { for (const it of items) { try { await sbUpsert(coll, it); } catch (e) {} } }

function useContent() {
  const [data, setData] = useState(() => {
    const stored = loadStore();
    if (!stored) return { ...DEFAULTS, _seedV: SEED_VERSION };
    if (stored._seedV !== SEED_VERSION) return { ...DEFAULTS, ...stored, apps: DEFAULT_APPS, _seedV: SEED_VERSION };
    return { ...DEFAULTS, ...stored };
  });
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
  if (seg === "prijzen") return { name: "prijzen" };
  if (seg === "dienst" && id) return { name: "service", id };
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
    let W = 0, H = 0, layers = [], edges = [];
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
      edges = [];
      for (let li = 0; li < layers.length - 1; li++) {
        for (const a of layers[li]) for (const b of layers[li + 1]) edges.push([a, b]);
      }
      if (spread) edges = edges.filter((_, k) => ((k * 1103515245 + 12345) >>> 8) % 100 >= 35);
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
      ctx.strokeStyle = `rgba(${BASE[0]},${BASE[1]},${BASE[2]},0.07)`;
      for (const [a, b] of edges) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
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
    { label: t.nav.about, href: "#about" }, { label: t.nav.insights, href: "#blog" },
    { label: t.nav.pricing, href: "#/prijzen" }, { label: t.nav.contact, href: "#contact" },
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
        <div className="footer-col"><div className="footer-h mono">{t.footer.connect}</div><a href="https://wa.me/31640881169" target="_blank" rel="noreferrer">WhatsApp</a><a href="https://linkedin.com/company/flii-media" target="_blank" rel="noreferrer">LinkedIn</a><a href="mailto:hello@flii.nl">hello@flii.nl</a></div>
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
const LENS_ICONS = {
  platform: (<svg viewBox="0 0 24 24" aria-hidden><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="M3 12l9 5 9-5" /><path d="M3 16l9 5 9-5" /></svg>),
  app: (<svg viewBox="0 0 24 24" aria-hidden><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></svg>),
  media: (<svg viewBox="0 0 24 24" aria-hidden><path d="M4 10v4h3l6 4V6L7 10H4Z" /><path d="M17 9.5a4 4 0 0 1 0 5" /></svg>),
};
function LoopRing() {
  const { t } = useLang();
  const items = t.loop.items;
  const [active, setActive] = useState(null);
  const [reduce] = useState(() => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const pos = ["top", "right", "bottom", "left"];
  const [lens, setLens] = useState("generic");
  const [spinning, setSpinning] = useState(false);
  const [spinTick, setSpinTick] = useState(0);
  const spinTimer = useRef(null);
  const select = (i) => {
    const next = active === i ? null : i;
    clearTimeout(spinTimer.current);
    if (reduce || next == null) { setActive(next); setSpinning(false); return; }
    setActive(next);
    setSpinning(true);
    setSpinTick((tk) => tk + 1);
    spinTimer.current = setTimeout(() => setSpinning(false), 520);
  };
  useEffect(() => () => clearTimeout(spinTimer.current), []);
  const cur = active != null ? items[active] : null;
  const curBody = cur ? (lens !== "generic" && t.loop.variants[lens] ? t.loop.variants[lens][active] : cur.body) : "";
  return (
    <>
    <div className="loop-lens loop-lens-top">
      {["platform", "app", "media"].map((k) => (
        <button key={k} className={`loop-lens-btn ${lens === k ? "on" : ""}`} onClick={() => setLens((v) => (v === k ? "generic" : k))} aria-pressed={lens === k}>
          <span className="loop-lens-ic" aria-hidden>{LENS_ICONS[k]}</span>
          <span className="loop-lens-l">{t.loop.lens[k]}</span>
        </button>
      ))}
    </div>
    <div className={`loop-ring-stage ${active != null ? "open" : ""}`}>
      <div className={`loop-ring-tilt ${active != null && !reduce ? "tilted" : ""}`}>
        <div className="loop-ring-spin">
        <svg className="loop-ring-svg" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id="lrGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B14BFF" /><stop offset="28%" stopColor="#E7255A" /><stop offset="50%" stopColor="#FF5E9A" />
              <stop offset="64%" stopColor="#FFD2E4" /><stop offset="80%" stopColor="#FF3D8E" /><stop offset="100%" stopColor="#C04BFF" />
            </linearGradient>
            <filter id="lrFire" x="-60%" y="-60%" width="220%" height="220%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018 0.034" numOctaves="2" seed="4" result="n">
                {!reduce && <animate attributeName="baseFrequency" dur="7s" values="0.018 0.034;0.026 0.046;0.016 0.03;0.018 0.034" repeatCount="indefinite" />}
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G">
                {!reduce && <animate attributeName="scale" dur="5.5s" values="8;11;9;8" repeatCount="indefinite" />}
              </feDisplacementMap>
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
            <filter id="lrGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6" /></filter>
            <radialGradient id="lrStarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="22%" stopColor="#FFE3EE" stopOpacity="0.7" />
              <stop offset="55%" stopColor="#FF6FA6" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#FF6FA6" stopOpacity="0" />
            </radialGradient>
            <filter id="lrSoft" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="0.7" /></filter>
          </defs>
          <defs>
            <radialGradient id="lrBody" cx="50%" cy="48%" r="52%">
              <stop offset="0%" stopColor="#0C0207" /><stop offset="58%" stopColor="#160410" /><stop offset="84%" stopColor="#360A22" /><stop offset="96%" stopColor="#8A1A48" /><stop offset="100%" stopColor="#0C0207" />
            </radialGradient>
            <filter id="lrRimSoft" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3.4" /></filter>
            <filter id="lrBubble" x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.011" numOctaves="2" seed="3" result="n">
                {!reduce && <animate attributeName="baseFrequency" dur="13s" values="0.008 0.011;0.012 0.008;0.007 0.013;0.008 0.011" repeatCount="indefinite" />}
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G">
                {!reduce && <animate attributeName="scale" dur="9s" values="5;10;6;5" repeatCount="indefinite" />}
              </feDisplacementMap>
            </filter>
            <filter id="lrWisp" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85 0.02" numOctaves="2" seed="7" result="n">
                {!reduce && <animate attributeName="baseFrequency" dur="16s" values="0.85 0.02;0.8 0.03;0.85 0.02" repeatCount="indefinite" />}
              </feTurbulence>
              <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.36  0 0 0 0 0.62  0 0 0 0.7 0" />
            </filter>
            <radialGradient id="lrWispFade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="58%" stopColor="#fff" stopOpacity="0" /><stop offset="90%" stopColor="#fff" stopOpacity="0.55" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="lrWispMask"><circle cx="50" cy="50" r="39" fill="url(#lrWispFade)" /></mask>
          </defs>
          <g filter={reduce ? undefined : "url(#lrBubble)"}>
            <circle cx="50" cy="50" r="39" fill="url(#lrBody)" />
            <g className={reduce ? "" : "lr-orb-rot2"}>
              <circle cx="48.7" cy="50" r="38.3" fill="none" stroke="#B14BFF" strokeWidth="1.1" filter="url(#lrRimSoft)" opacity="0.6" />
              <circle cx="51.3" cy="50" r="38.3" fill="none" stroke="#FF5E9A" strokeWidth="1.1" filter="url(#lrRimSoft)" opacity="0.6" />
              <circle cx="50" cy="50" r="38.6" fill="none" stroke="url(#lrGrad)" strokeWidth="2.6" filter="url(#lrRimSoft)" opacity="0.85" />
              <circle cx="50" cy="50" r="38.7" fill="none" stroke="url(#lrGrad)" strokeWidth="0.9" filter="url(#lrGlow)" />
              <circle cx="50" cy="50" r="38.8" fill="none" stroke="#FFEAF3" strokeWidth="0.4" opacity="0.8" />
            </g>
          </g>
          <g className={reduce ? "" : "lr-orb-rot"}>
            <g mask="url(#lrWispMask)"><rect x="8" y="8" width="84" height="84" filter="url(#lrWisp)" opacity="0.55" /></g>
          </g>
          <circle key={spinTick} className={spinning && !reduce ? "lr-flash on" : "lr-flash"} cx="50" cy="50" r="38.6" fill="none" stroke="url(#lrGrad)" strokeWidth="3" filter="url(#lrRimSoft)" />
        </svg>
        </div>
      </div>
      <div className="loop-ring-core" aria-live="polite">
        {spinning ? null : cur ? (
          <div className="loop-core-content" key={active}>
            <div className="loop-core-k mono">{cur.k}</div>
            <p className="loop-core-b">{curBody}</p>
          </div>
        ) : (
          <div className="loop-core-default">
            <div className="loop-core-mark mono">{t.loop.eyebrow}</div>
            <div className="loop-core-hint">{t.loop.center}</div>
          </div>
        )}
      </div>
      {items.map((l, i) => (
        <button key={i} className={`loop-step-label lbl-${pos[i]} ${active === i ? "on" : ""}`} onClick={() => select(i)} aria-pressed={active === i}>
          <span className="loop-step-dot" aria-hidden />
          <span className="loop-step-k">{l.k}</span>
        </button>
      ))}
    </div>
    </>
  );
}

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
const BRAND_SVGS = {
  google: (<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.66-.06-1.3-.17-1.9H12v3.6h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.75 3-4.3 3-7.2z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .95-3.4.95-2.6 0-4.8-1.75-5.6-4.1H3.1v2.6A10 10 0 0012 22z" /><path fill="#FBBC05" d="M6.4 13.95a6 6 0 010-3.9V7.45H3.1a10 10 0 000 9.1z" /><path fill="#EA4335" d="M12 6.05c1.47 0 2.8.5 3.84 1.5l2.85-2.85A10 10 0 003.1 7.45L6.4 10.05C7.2 7.7 9.4 6.05 12 6.05z" /></svg>),
  facebook: (<svg viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>),
  instagram: (<svg viewBox="0 0 24 24"><defs><linearGradient id="fbl-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75" /><stop offset=".3" stopColor="#FA7E1E" /><stop offset=".6" stopColor="#D62976" /><stop offset="1" stopColor="#4F5BD5" /></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#fbl-ig)" /><rect x="6" y="6" width="12" height="12" rx="4" fill="none" stroke="#fff" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.6" /><circle cx="16.4" cy="7.6" r="1" fill="#fff" /></svg>),
  tiktok: (<svg viewBox="0 0 24 24"><path fill="#010101" d="M16.5 3c.3 1.9 1.4 3.3 3.5 3.6v2.5c-1.2.1-2.4-.2-3.5-.8v5.2c0 3.1-2.3 5.3-5.2 5.3A5 5 0 016 13.9c.2-2.5 2.2-4.4 4.9-4.3v2.6c-.4-.1-.8-.1-1.2 0-1 .3-1.7 1.1-1.6 2.2.1 1 1 1.9 2 1.9 1.2 0 2.1-.9 2.1-2.3V3z" /></svg>),
  youtube: (<svg viewBox="0 0 24 24"><rect x="1" y="5" width="22" height="14" rx="4" fill="#FF0000" /><path d="M10 8.5l6 3.5-6 3.5z" fill="#fff" /></svg>),
  linkedin: (<svg viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>),
  spotify: (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#1DB954" /><g fill="none" stroke="#000" strokeWidth="1.6" strokeLinecap="round"><path d="M7 9.5c3-.9 6.6-.6 9.1 1" /><path d="M7.6 12.4c2.6-.7 5.5-.4 7.5 1" /><path d="M8.1 15.2c2-.5 4.1-.3 5.8.8" /></g></svg>),
};
const SERVICE_LOGOS = {
  campaigns: ["google", "instagram", "tiktok", "youtube", "linkedin", "facebook", "spotify"],
  media: ["google", "facebook", "instagram", "tiktok", "youtube", "linkedin"],
};
function BrandLogo({ name }) {
  const svg = BRAND_SVGS[name];
  if (!svg) return null;
  return <span className="brand-logo" aria-label={name}>{svg}</span>;
}
function CredLogo({ slug }) {
  const [err, setErr] = useState(false);
  if (err || !slug) return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={MAG} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>;
  return <img className="cred-logo" src={`https://cdn.simpleicons.org/${slug}`} alt="" loading="lazy" onError={() => setErr(true)} />;
}
function LoopCTA({ openConsult }) {
  const { t } = useLang(); const c = t.loopCta;
  return (
    <section className="band band-dark loop-cta-band">
      <div className="wrap loop-cta-inner">
        <FliiLoopMark />
        <div className="eyebrow on-dark loop-cta-k">{c.k}</div>
        <h2 className="display h2 on-dark loop-cta-h">{c.h2}</h2>
        <p className="lede on-dark-soft loop-cta-body">{c.body}</p>
        <div className="loop-cta-actions">
          <a href="#/prijzen" className="btn btn-primary">{c.pricing}</a>
          <button onClick={openConsult} className="btn btn-ghost on-dark">{c.talk}</button>
        </div>
      </div>
    </section>
  );
}
function ServicePage({ id, openConsult }) {
  const { t } = useLang(); const svc = t.services;
  const s = svc.items.find((x) => x.slug === id);
  if (!s) return <NotFound back="#/" />;
  return (
    <>
      <article className="detail service-page"><div className="wrap">
        <a href="#/" className="back">{t.detail.backHome}</a>
        <div className="detail-meta mono">{s.tag}</div>
        <h1 className="display detail-h">{s.title}</h1>
        <p className="detail-lede">{s.lede}</p>
        <div className="svc-cols">
          <div className="svc-col">
            <div className="svc-col-h mono">{svc.helpH}</div>
            <div className="svc-list">
              {s.help.map((it, i) => <div key={i} className="svc-item"><div className="svc-item-main"><div className="svc-item-h">{it.h}</div><p className="svc-item-b">{it.b}</p></div></div>)}
            </div>
          </div>
          <div className="svc-col">
            <div className="svc-col-h mono">{svc.execH}</div>
            <div className="svc-steps">
              {s.exec.map((it, i) => <div key={i} className="svc-step"><span className="svc-step-n mono">{String(i + 1).padStart(2, "0")}</span><div className="svc-step-main"><div className="svc-step-h">{it.h}</div><p className="svc-step-b">{it.b}</p></div></div>)}
            </div>
          </div>
        </div>
        <div className="svc-outcome"><span className="svc-outcome-k mono">{svc.outcomeK}</span><p className="svc-outcome-b">{s.outcome}</p></div>
        {s.loop && (
          <div className="svc-loop">
            <div className="svc-col-h mono">{svc.loopH}</div>
            <div className="svc-loop-grid">
              {s.loop.map((line, i) => (
                <div key={i} className="svc-loop-step">
                  <span className="svc-loop-k mono">{t.loop.items[i].k}</span>
                  <p className="svc-loop-b">{line}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {SERVICE_LOGOS[s.slug] && (
          <div className="svc-logos">
            <div className="svc-col-h mono">{svc.channelsH}</div>
            <div className="svc-logos-row">{SERVICE_LOGOS[s.slug].map((n) => <BrandLogo key={n} name={n} />)}</div>
          </div>
        )}
      </div></article>
      <LoopCTA openConsult={openConsult} />
    </>
  );
}
const REVIEW_LOGOS = {
  "bikefair": "bikefair.org",
  "soest-machinery": "soestmachinery.com",
  "social-innovations": "socialinnovations.nl",
  "broadcast-magazine": "broadcastmagazine.nl",
  "zeewind": "zeewind.nl",
};
function OrgAvatar({ review, lg }) {
  const [stage, setStage] = useState(0);
  const cls = "quote-avatar" + (lg ? " lg" : "");
  const domain = REVIEW_LOGOS[review.id] || review.logo;
  const srcs = domain ? [
    `https://logo.clearbit.com/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ] : [];
  if (srcs.length && stage < srcs.length) {
    return (
      <span className={cls + " has-logo"} aria-hidden>
        <img src={srcs[stage]} alt="" loading="lazy" onError={() => setStage((s) => s + 1)} />
      </span>
    );
  }
  return <div className={cls} aria-hidden>{review.name.charAt(0)}</div>;
}
function FliiMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 500 500" aria-hidden focusable="false">
      <path fill="#E7255A" d="m 239.8092,332.68537 c -2.28447,-3.49286 -23.46567,-48.57731 -23.46567,-50.01464 0,-0.93415 13.88823,-0.66647 21.30481,-0.87484 7.75505,-0.21787 53.41913,-115.30501 53.06132,-114.03739 -1.54162,5.46154 -1.00892,4.30871 -0.54189,0.14626 L 322.17232,168.5 H 349.5 v 82.5 82.5 h -22 -22 l -0.26195,-38.32102 c -0.30405,-44.48 7.24157,-55.84478 -0.8773,-38.24361 -11.37304,20.61415 -25.02431,56.46612 -37.2072,76.63979 C 266.40468,334.4775 262.28909,334 253.90061,334 c -11.19087,0 -12.7022,0.80941 -14.09141,-1.31463 z m -82.3413,-2.91541 C 157.20134,329.07148 157.09952,292.5 157.24162,248.5 l 0.25838,-80 58.25,-0.25806 c 55.01074,-0.24371 59.35516,-1.52083 59.35032,0.13946 -0.003,0.96693 -4.62864,12.78964 -10.28528,24.20363 L 254.96003,214.35034 227.97492,214 201.5,214.5 v 13.5 13.5 l 19.3529,0.27195 19.3529,0.27196 0.91723,0.0629 c 1.38257,0.0949 -3.92785,10.20835 -7.20338,17.07342 l -6.24989,13.09893 -13.33998,-0.0597 L 201.5,272.5 l -0.5,29 -0.5,29 -21.27373,0.26996 c -16.47548,0.20907 -21.38304,-0.0165 -21.75837,-1 z" />
    </svg>
  );
}
function FunnelViz() {
  const { t } = useLang();
  const f = t.funnel;
  const stages = f.stages;
  const [active, setActive] = useState(null);
  const W = 1000, N = stages.length, segW = W / N, CY = 180;
  // half-heights at N+1 boundaries: taller start, narrowest at conversion (Signed|Loyal), then reopening
  const HALF = [175, 140, 102, 66, 39, 80, 118];
  const topY = (i) => CY - HALF[i];
  const botY = (i) => CY + HALF[i];
  const bnd = HALF.map((_, i) => i);
  const topPath = "M" + bnd.map((i) => `${i * segW},${topY(i)}`).join(" L");
  const botPath = "M" + bnd.map((i) => `${i * segW},${botY(i)}`).join(" L");
  const perim = "M" + bnd.map((i) => `${i * segW},${topY(i)}`).join(" L") + " L" + [...bnd].reverse().map((i) => `${i * segW},${botY(i)}`).join(" L") + " Z";
  return (
    <div className="fnl">
      <svg className="fnl-svg" viewBox="0 0 1000 360" role="img" aria-label={f.h2}>
        <defs>
          <linearGradient id="fnlFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#DA3E68" />
            <stop offset="1" stopColor="#AE2249" />
          </linearGradient>
          <filter id="fnlGlowF" x="-10%" y="-70%" width="120%" height="240%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {stages.map((st, i) => {
          const x0 = i * segW, x1 = (i + 1) * segW, cx = (x0 + x1) / 2;
          const d = `M${x0},${topY(i)} L${x1},${topY(i + 1)} L${x1},${botY(i + 1)} L${x0},${botY(i)} Z`;
          return (
            <g key={i} className={`fnl-seg ${active === i ? "on" : ""}`} onClick={() => setActive(i)} role="button" tabIndex={0}
               aria-label={st.k} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(i); } }}>
              <path className="fnl-slice" d={d} />
              <text className="fnl-letter" x={cx} y={CY} textAnchor="middle" dominantBaseline="central">{st.k.charAt(0)}</text>
            </g>
          );
        })}
        <path className="fnl-outline" d={perim} />
        <path className="fnl-build" pathLength="1" d={topPath} />
        <path className="fnl-build" pathLength="1" d={botPath} />
      </svg>
      <div className="fnl-desc" key={active}>
        {active == null ? (
          <span className="fnl-desc-hint mono">{f.tapHint}</span>
        ) : (
          <>
            <span className="fnl-desc-k">{stages[active].k}</span>
            <span className="fnl-desc-g"><strong>{f.goalLabel}:</strong> {stages[active].goal}</span>
            <span className="fnl-desc-ex"><strong>{f.exampleLabel}:</strong> {stages[active].example}</span>
          </>
        )}
      </div>
    </div>
  );
}
function CallbackForm() {
  const { t } = useLang();
  const [tel, setTel] = useState("");
  const cb = t.callback;
  const submit = () => {
    const n = tel.trim();
    if (!n) return;
    window.location.href = `mailto:hello@flii.nl?subject=${encodeURIComponent(cb.subject)}&body=${encodeURIComponent(cb.bodyPre + " " + n)}`;
  };
  return (
    <div className="callback">
      <input className="callback-input" type="tel" inputMode="tel" value={tel} placeholder={cb.ph} aria-label={cb.ph}
        onChange={(e) => setTel(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} />
      <button className="btn callback-btn" onClick={submit}>{cb.cta}</button>
    </div>
  );
}
const NET_ICONS = [
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M4 20c0-2.8 2.2-5 5-5s5 2.2 5 5" /><path d="M16 6.5a2.6 2.6 0 0 1 0 5" /><path d="M17 15c2 .3 3.5 1.9 3.5 4" /></svg>),
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></svg>),
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8.1 10.9 15.9 7.1M8.1 13.1 15.9 16.9" /></svg>),
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10v4h3l7 4V6L7 10z" /><path d="M17 9a4 4 0 0 1 0 6" /></svg>),
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.5-4.5" /></svg>),
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" /></svg>),
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="10" rx="1.5" /><path d="M8 15v4M16 15v4M6 21h5M13 21h5" /></svg>),
  (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="7" rx="2" /><rect x="7" y="14" width="10" height="6" rx="1" /></svg>),
];
function AppStack() {
  const { t } = useLang();
  const a = t.appStack;
  const layers = a.layers;
  const [active, setActive] = useState(null);
  const N = layers.length, W = 1000, H = 400, padY = 16, gap = 14;
  const slabH = (H - 2 * padY - gap * (N - 1)) / N;
  const minW = 340, maxW = 780;
  return (
    <div className="stk-wrap">
      <svg className="stk-svg" viewBox="0 0 1000 400" role="img" aria-label={a.h2}>
        <defs>
          <linearGradient id="stkFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DA3E68" /><stop offset="1" stopColor="#AE2249" /></linearGradient>
        </defs>
        {layers.map((l, i) => {
          const w = minW + (maxW - minW) * (i / (N - 1));
          const x = (W - w) / 2, y = padY + i * (slabH + gap), cy = y + slabH / 2;
          const vRight = x + w - 24;
          return (
            <g key={i} className={`stk-seg ${active === i ? "on" : ""}`} onClick={() => setActive(i)} role="button" tabIndex={0}
               aria-label={l.k} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(i); } }}>
              <rect className="stk-slab" x={x} y={y} width={w} height={slabH} rx="9" />
              <circle className="stk-led" cx={x + 20} cy={cy} r="3.8" />
              <circle className="stk-led2" cx={x + 33} cy={cy} r="3.8" />
              <text className="stk-label" x={W / 2} y={cy} textAnchor="middle" dominantBaseline="central">{l.k}</text>
              {Array.from({ length: 5 }).map((_, v) => <line key={v} className="stk-vent" x1={vRight - v * 11} x2={vRight - v * 11} y1={cy - 12} y2={cy + 12} />)}
            </g>
          );
        })}
      </svg>
      <div className="fnl-desc" key={active}>
        {active == null ? <span className="fnl-desc-hint mono">{a.tapHint}</span> : (
          <><span className="fnl-desc-k">{layers[active].k}</span><span className="fnl-desc-g">{layers[active].desc}</span></>
        )}
      </div>
    </div>
  );
}
function PlatformNet() {
  const { t } = useLang();
  const pn = t.platformNet;
  const nodes = pn.nodes;
  const [active, setActive] = useState(null);
  const N = nodes.length, R = 40;
  const pts = nodes.map((_, i) => { const ang = (-90 + i * (360 / N)) * Math.PI / 180; return { x: 50 + R * Math.cos(ang), y: 50 + R * Math.sin(ang) }; });
  const pipe = (p) => {
    const dx = p.x - 50, dy = p.y - 50, len = Math.hypot(dx, dy) || 1;
    const ox = -dy / len * 6, oy = dx / len * 6;
    return `M50,50 Q ${(50 + p.x) / 2 + ox},${(50 + p.y) / 2 + oy} ${p.x},${p.y}`;
  };
  return (
    <div className="pnet-wrap">
      <div className="pnet">
        <svg className="pnet-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {pts.map((p, i) => (
            <g key={i} className={`pnet-pipe ${active === i ? "on" : ""}`}>
              <path d={pipe(p)} className="pnet-pipe-o" />
              <path d={pipe(p)} className="pnet-pipe-i" />
            </g>
          ))}
        </svg>
        <div className="pnet-browser" aria-hidden>
          <div className="pnet-bar"><i /><i /><i /><span className="pnet-url" /></div>
          <div className="pnet-screen"><span className="pnet-scr-h" /><span className="pnet-scr-a" /><span className="pnet-scr-b" /><span className="pnet-name">{pn.center}</span></div>
        </div>
        {nodes.map((n, i) => (
          <button key={i} className={`pnet-node ${active === i ? "on" : ""}`} style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }} onClick={() => setActive(i)} aria-label={n.k}>
            <span className="pnet-ic" aria-hidden>{NET_ICONS[i]}</span>
            <span className="pnet-lbl">{n.k}</span>
          </button>
        ))}
      </div>
      <div className="fnl-desc" key={active}>
        {active == null ? <span className="fnl-desc-hint mono">{pn.tapHint}</span> : (
          <><span className="fnl-desc-k">{nodes[active].k}</span><span className="fnl-desc-g">{nodes[active].desc}</span></>
        )}
      </div>
    </div>
  );
}
function ModelSection() {
  const { t } = useLang();
  const m = t.model;
  const [tab, setTab] = useState("campagnes");
  const head = tab === "app" ? t.appStack : tab === "platform" ? t.platformNet : t.funnel;
  const eyebrow = tab === "app" ? m.eyeApp : tab === "platform" ? m.eyePlatform : m.eyeCampagnes;
  const tabs = [["campagnes", m.tabCampagnes], ["app", m.tabApp], ["platform", m.tabPlatform]];
  return (
    <section className="band band-mist" id="campagnes">
      <div className="wrap">
        <Section><div className="eyebrow">{eyebrow}</div><h2 className="display h2">{head.h2}</h2><p className="lede">{head.lede}</p></Section>
        <div className="model-tabs">
          {tabs.map(([k, label]) => (<button key={k} className={`model-tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)} aria-pressed={tab === k}>{label}</button>))}
        </div>
        <div className="model-view" key={tab}>
          {tab === "campagnes" && <FunnelViz />}
          {tab === "app" && <AppStack />}
          {tab === "platform" && <PlatformNet />}
        </div>
      </div>
    </section>
  );
}
function ShowcaseList({ apps }) {
  const { t } = useLang();
  const [open, setOpen] = useState(null);
  return (
    <div className="wacc">
      {apps.slice(0, 6).map((w) => {
        const isOpen = open === w.id;
        const hasLink = w.link && w.link !== "#";
        return (
          <div key={w.id} className={`wacc-item ${isOpen ? "open" : ""}`}>
            <button className="wacc-head" onClick={() => setOpen((o) => (o === w.id ? null : w.id))} aria-expanded={isOpen}>
              <span className="wacc-title">{w.title}</span>
              <span className="wacc-client mono">{w.client}</span>
              <span className="wacc-arrow" aria-hidden>↘</span>
            </button>
            {isOpen && (
              <div className="wacc-body">
                {hasLink && <div className="wacc-shot"><img src={w.shot || shotUrl(w.link)} alt={w.title} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>}
                {w.lead && <p className="wacc-lead">{w.lead}</p>}
                {w.details && (
                  <dl className="wacc-dl">
                    {w.details.map((d, j) => (
                      <div className="wacc-drow" key={j}><dt>{d.k}</dt><dd>{d.v}</dd></div>
                    ))}
                  </dl>
                )}
                {hasLink && <a href={w.link} target="_blank" rel="noreferrer" className="wacc-visit">{t.detail.visit} {w.title} ↗</a>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function Home({ content, openConsult }) {
  const { t } = useLang();
  const { apps, articles, reviews, certs } = content;
  const [priceOpen, setPriceOpen] = useState(false);
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
                <a href={`#/dienst/${s.slug}`} className="service-link-wrap">
                  <div className="service-n mono">{String(i + 1).padStart(2, "0")}</div>
                  <div className="service-tag mono">{s.tag}</div>
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-body">{s.body}</p>
                  <span className="service-link">{t.services.cta}</span>
                </a>
              </Section>
            ))}
          </div>
        </div>
      </section>

      <ModelSection />

      <section className="band band-dark band-loop" id="loop">
        <div className="loop-bg" aria-hidden><NodeNetwork mono spread /></div>
        <div className="wrap">
          <Section><div className="eyebrow on-dark">{t.loop.eyebrow}</div><h2 className="display h2 on-dark">{t.loop.h2}</h2><p className="lede on-dark-soft">{t.loop.lede}</p></Section>
          <Section className="loop-ring-wrap"><LoopRing /></Section>
          <Section className="loop-fold">
            <button className={`price-fold-trigger ${priceOpen ? "open" : ""}`} onClick={() => setPriceOpen((v) => !v)} aria-expanded={priceOpen}>
              <FliiLoopMark />
              <span className="price-fold-t">{t.calc.eyebrow} <span className="price-fold-arrow" aria-hidden>↘</span></span>
            </button>
            {priceOpen && <div className="price-fold-panel"><PriceCalculator openConsult={openConsult} /></div>}
          </Section>
        </div>
      </section>

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

      <section className="band" id="work">
        <div className="wrap">
          <Section className="work-head"><div><div className="eyebrow">{t.work.eyebrow}</div><h2 className="display h2">{t.work.h2}</h2><p className="lede">{t.work.lede}</p></div></Section>
          <Section><ShowcaseList apps={apps} /></Section>
        </div>
      </section>

      <section className="band band-mist">
        <div className="wrap">
          <Section className="quotes-head">
            <div><div className="eyebrow">{t.reviews.eyebrow}</div><h2 className="display h2">{t.reviews.h2}</h2></div>
          </Section>
          <Section>
            <div className="byline">
              <a href="https://flii.nl" target="_blank" rel="noreferrer" className="byline-lock">
                <FliiMark className="byline-mark" />
                <span className="byline-txt"><strong>flii.app</strong> <span className="byline-by-t">{t.byline.by} {t.byline.name}</span><span className="byline-arrow" aria-hidden> ↗</span></span>
              </a>
              <div className="byline-rating">
                <span className="byline-stars" aria-hidden>★★★★★</span>
                <span className="byline-rate"><strong>{avg}</strong> · {reviews.length} {t.reviews.word}</span>
              </div>
            </div>
          </Section>
          <div className="quote-grid">
            {reviews.slice(0, 6).map((q, i) => (
              <Section key={q.id} className="quote-card" style={{ transitionDelay: `${i * 70}ms` }}>
                <a href={`#/review/${q.id}`} className="quote-link">
                  <p className="quote-text">“{q.quote}”</p>
                  <div className="quote-by"><OrgAvatar review={q} /><div><div className="quote-name">{q.name}</div><div className="quote-role mono">{q.role} · {q.org}</div></div></div>
                </a>
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
              <span className="cred-seal cred-seal-logo" aria-hidden>
                <CredLogo slug={c.logo || c.id} />
              </span>
              <span className="marquee-cred-name">{c.name}</span>
              <span className="marquee-cred-tier mono">{c.tier}</span>
            </a>
          )} />
        </div>
      </Section>

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
          <Section className="work-head"><div><div className="eyebrow">{t.insights.eyebrow}</div><h2 className="display h2">{t.insights.h2}</h2></div></Section>
          <div className="post-grid">
            {articles.slice(0, 3).map((p, i) => (
              <Section key={p.id} className="post" style={{ transitionDelay: `${i * 70}ms` }}>
                <a href={`#/insight/${p.id}`} className="post-link">
                  <div className="post-thumb" aria-hidden><ArticleArt variant={p.cover} mode="thumb" /></div>
                  <div className="post-meta mono">{p.cat} · {p.date}{p.read ? ` · ${p.read}` : ""}</div>
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
        <div className="cta-chip">Get in the Loop</div>
        <div className="wrap cta-inner">
          <Section>
            <h2 className="display cta-h">{t.cta.h2}</h2>
            <p className="cta-sub">{t.cta.sub}</p>
            <div className="hero-actions">
              <button onClick={openConsult} className="btn btn-primary">{t.cta.primary}</button>
              <a href="#loop" className="loop-cta" aria-label={t.hero.loopCta}>
                <FliiLoopMark />
                <span className="loop-cta-t">{t.hero.loopCta} <span className="loop-cta-arrow" aria-hidden>↘</span></span>
              </a>
            </div>
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
      <div className="detail-hero" aria-hidden>{a.link && a.link !== "#" && <img className="work-shot" src={shotUrl(a.link)} alt="" loading="lazy" />}</div>
      {a.metrics && a.metrics.length > 0 && <div className="detail-metrics">{a.metrics.map((m, i) => <div key={i} className="dm"><div className="display dm-v">{m.value}</div><div className="dm-l mono">{m.label}</div></div>)}</div>}
      <div className="detail-body">{paras(a.body).map((p, i) => <p key={i}>{p}</p>)}</div>
      {a.link && a.link !== "#" && <a href={a.link} className="btn btn-primary" target="_blank" rel="noreferrer">{t.detail.visit} {a.title} ↗</a>}
    </div></article>
  );
}
function ArticleArt({ variant = "default", mode = "thumb" }) {
  if (variant && /^https?:\/\//.test(variant)) {
    return <div className={`art art-${mode} art-photo`} style={{ backgroundImage: `url(${variant})` }} role="img" aria-hidden />;
  }
  const motifs = {
    funnel: (
      <>
        <path className="art-stroke" d="M92 52 H308 L216 134 V154 H184 V134 Z" fill="none" strokeWidth="2.5" strokeLinejoin="round" />
        <path className="art-acc" d="M188 168 H212" fill="none" strokeWidth="2.5" strokeLinecap="round" />
        <circle className="art-acc-f" cx="200" cy="182" r="4" />
      </>
    ),
    launch: (
      <>
        <path className="art-stroke" d="M200 40 C222 66 222 106 210 132 H190 C178 106 178 66 200 40 Z" fill="none" strokeWidth="2.5" strokeLinejoin="round" />
        <circle className="art-acc-f" cx="200" cy="86" r="8" />
        <path className="art-stroke" d="M190 118 L172 148 L190 138 M210 118 L228 148 L210 138" fill="none" strokeWidth="2.5" strokeLinejoin="round" />
        <path className="art-acc" d="M192 134 L200 168 L208 134" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    analytics: (
      <>
        <path className="art-line" d="M92 152 H308" strokeWidth="1.5" />
        <rect className="art-line-f" x="118" y="122" width="26" height="30" rx="2" />
        <rect className="art-stroke-f" x="160" y="100" width="26" height="52" rx="2" />
        <rect className="art-line-f" x="202" y="112" width="26" height="40" rx="2" />
        <rect className="art-stroke-f" x="244" y="80" width="26" height="72" rx="2" />
        <path className="art-acc" d="M131 118 L173 96 L215 106 L257 74" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="art-acc-f" cx="257" cy="74" r="4.5" />
      </>
    ),
    default: (<><circle className="art-acc-f" cx="200" cy="100" r="8" /><circle className="art-acc-r" cx="200" cy="100" r="22" fill="none" /></>),
  };
  return (
    <div className={`art art-${mode}`}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden>
        <rect className="art-bg" x="0" y="0" width="400" height="200" />
        {motifs[variant] || motifs.default}
      </svg>
    </div>
  );
}
function renderArticleBody(body) {
  const blocks = (body || "").split("\n\n").map((b) => b.trim()).filter(Boolean);
  return blocks.map((b, i) => {
    if (b.startsWith("## ")) return <h2 key={i} className="article-h2">{b.slice(3)}</h2>;
    if (b.startsWith("> ")) return <blockquote key={i} className="article-quote">{b.replace(/^> ?/gm, "")}</blockquote>;
    const fig = b.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (fig) return <figure key={i} className="article-fig"><ArticleArt variant={fig[2]} mode="figure" /><figcaption>{fig[1]}</figcaption></figure>;
    if (b.split("\n").every((l) => l.trim().startsWith("- "))) {
      return <ul key={i} className="article-list">{b.split("\n").map((l, j) => <li key={j}>{l.replace(/^-\s*/, "").trim()}</li>)}</ul>;
    }
    return <p key={i}>{b.split("\n").join(" ")}</p>;
  });
}
function ArticleDetail({ content, id }) {
  const { t } = useLang(); const a = content.articles.find((x) => x.id === id);
  if (!a) return <NotFound back="#blog" />;
  return (
    <article className="detail detail-narrow"><div className="wrap">
      <a href="#blog" className="back">{t.detail.backInsights}</a>
      <div className="detail-meta mono">{a.cat} · {a.date}{a.read ? ` · ${a.read}` : ""}</div>
      <h1 className="display detail-h">{a.title}</h1>
      <p className="detail-lede">{a.excerpt}</p>
      <div className="article-hero"><ArticleArt variant={a.cover} mode="hero" /></div>
      <div className="detail-body article-body">{renderArticleBody(a.body)}</div>
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
      <div className="detail-by"><OrgAvatar review={r} lg /><div><div className="quote-name lg">{r.name}</div><div className="quote-role mono">{r.role} · {r.org}</div></div></div>
    </div></article>
  );
}
function CertDetail({ content, id }) {
  const { t } = useLang(); const c = content.certs.find((x) => x.id === id);
  if (!c) return <NotFound back="#/" />;
  return (
    <article className="detail detail-narrow"><div className="wrap">
      <a href="#/" className="back" onClick={(e) => { e.preventDefault(); window.location.hash = "#/"; }}>{t.detail.backHome}</a>
      <div className="cert-logo-lg"><CredLogo slug={c.logo || c.id} /></div>
      <div className="detail-meta mono">{c.tier}</div>
      <h1 className="display detail-h">{c.name}</h1>
      <p className="detail-lede">{c.blurb}</p>
      {c.href && c.href !== "#" && <a href={c.href} className="btn btn-primary" target="_blank" rel="noreferrer">{t.detail.credential}</a>}
    </div></article>
  );
}

/* ---------- pricing ---------- */
const PRICING = {
  scopes: {
    campagne: { plan: 1500, build: 0, run: 0 },
    app: { plan: 2500, build: 5000, run: 750 },
    platform: { plan: 4500, build: 18000, run: 2500 },
    ai: { plan: 2500, build: 6500, run: 850 },
  },
  content: { none: 0, klein: 650, groot: 1200 },
  contentCreatie: 650,
  app: { basis: 5000, advanced: 8500, platform: 18000 },
};
const SCOPE_KEYS = ["campagne", "app", "platform", "ai"];
const PLATFORM_FNS = ["website", "ecommerce", "ai"];
const APP_KINDS = ["webapp", "pwa", "nativeApp"];
const APP_OPTS = ["uxDesign", "backendApi", "appIntegraties", "appStorePub"];
const PLATFORM_OPTS = ["website", "ecommerce", "portaal", "platformAi", "platformIntegraties", "cms"];
const AI_OPTS = ["chatbot", "contentgen", "automatisering", "dataAnalyse", "aiIntegratie", "customModel"];
const ALL_TYPE_OPTS = [...APP_OPTS, ...PLATFORM_OPTS, ...AI_OPTS];
const APP_KIND_PRICE = { webapp: 0, pwa: 0, nativeApp: 1500 };
const APP_OPT_PRICE = { uxDesign: 900, backendApi: 1200, appIntegraties: 900, appStorePub: 500 };
const APP_CAP = 10000;
const CHANNEL_TREE = [
  { key: "search", once: 850, mo: 0, subs: ["searchEngines", "aiSearch", "socialSearch", "appStore"], dels: ["seoContent", "seoTech", "sea", "linkbuilding"] },
  { key: "social", once: 750, mo: 0, subs: ["meta", "tiktok", "linkedin", "pinterest", "otherSocial"], dels: ["socialContent", "community", "paidSocial", "socialInfluencer"] },
  { key: "display", once: 700, mo: 0, subs: ["programmatic", "gdn", "native", "retargeting"], dels: ["bannerCreatie", "programmaticBuy", "retargetingSetup"] },
  { key: "videotv", once: 950, mo: 0, subs: ["onlineVideo", "ctv", "linearTv"], dels: ["videoProductie", "videoMontage", "videoBuy"] },
  { key: "audio", once: 0, mo: 0, subs: ["radio", "streamingAudio", "podcasts"], dels: ["spotProductie", "podcastProductie", "audioBuy"] },
  { key: "email", once: 850, mo: 0, subs: ["newsletters", "automation", "loyalty"], dels: ["templateDesign", "emailFlows", "crmSetup"] },
  { key: "messaging", once: 0, mo: 0, subs: ["whatsapp", "sms", "push"], dels: ["flowSetup", "msgCopy", "msgIntegratie"] },
  { key: "ooh", once: 850, mo: 0, subs: ["billboards", "dooh", "transit", "retail"], dels: ["oohOntwerp", "oohBuy", "oohProductie"] },
  { key: "print", once: 650, mo: 0, subs: ["stationery", "flyers", "directMail", "merch"], dels: ["printOntwerp", "drukwerk", "printDistributie"] },
  { key: "pr", once: 0, mo: 0, subs: ["earned", "influencer", "affiliate", "sponsoring"], dels: ["persstrategie", "influencerMgmt", "affiliateSetup"] },
];
const CAT_KEYS = CHANNEL_TREE.map((c) => c.key);
const CAT_BY_KEY = Object.fromEntries(CHANNEL_TREE.map((c) => [c.key, c]));
const ALL_SUBS = CHANNEL_TREE.flatMap((c) => c.subs);
const ALL_DELS = CHANNEL_TREE.flatMap((c) => c.dels);
const PRICED_CATS = CHANNEL_TREE.filter((c) => c.once > 0 || c.mo > 0).map((c) => c.key);
function typePhasePrice(sk, pk) {
  const sc = PRICING.scopes[sk];
  return pk === "build" ? sc.build : sc[pk];
}
const DEL_PRICE = {
  seoContent: { mo: 450 }, seoTech: { mo: 400 }, sea: { mo: 500 }, linkbuilding: { mo: 350 },
  socialContent: { mo: 550 }, community: { mo: 450 }, paidSocial: { mo: 500 }, socialInfluencer: { mo: 400 },
  bannerCreatie: { once: 750 }, programmaticBuy: { mo: 500 }, retargetingSetup: { once: 500 },
  videoProductie: { once: 4500 }, videoMontage: { once: 900 }, videoBuy: { mo: 450 },
  spotProductie: { once: 1500 }, podcastProductie: { once: 1500 }, audioBuy: { mo: 400 },
  templateDesign: { once: 650 }, emailFlows: { once: 1200 }, crmSetup: { once: 1500 },
  flowSetup: { once: 850 }, msgCopy: { mo: 250 }, msgIntegratie: { once: 1200 },
  oohOntwerp: { once: 750 }, oohBuy: { once: 500 }, oohProductie: { once: 1500 },
  printOntwerp: { once: 650 }, drukwerk: { once: 750 }, printDistributie: { once: 600 },
  persstrategie: { mo: 500 }, influencerMgmt: { mo: 450 }, affiliateSetup: { once: 1200 },
};
function computeLoop({ types, phases, cats, dels, opts, appKind }) {
  const selected = SCOPE_KEYS.filter((k) => types[k]);
  const allLoop = phases.plan && phases.build && phases.run;
  let once = 0, mo = 0, saving = 0;
  selected.forEach((sk) => {
    const planFee = phases.build ? 0 : (phases.plan ? typePhasePrice(sk, "plan") : 0);
    once += planFee + (phases.build ? typePhasePrice(sk, "build") : 0);
    mo += phases.run ? typePhasePrice(sk, "run") : 0;
    if (phases.plan && phases.build) saving += PRICING.scopes[sk].plan;
  });
  if (types.app && phases.build && opts) {
    const optSum = APP_OPTS.reduce((a, k) => a + (opts[k] ? (APP_OPT_PRICE[k] || 0) : 0), 0) + (APP_KIND_PRICE[appKind] || 0);
    once += Math.min(optSum, APP_CAP - PRICING.scopes.app.build);
  }
  if (types.campagne) CAT_KEYS.forEach((k) => {
    if (cats[k]) {
      const c = CAT_BY_KEY[k];
      if (phases.build) once += c.once;
      if (phases.run) mo += c.mo;
      c.dels.forEach((d) => { if (dels && dels[d]) { const dp = DEL_PRICE[d] || {}; if (phases.build) once += dp.once || 0; if (phases.run) mo += dp.mo || 0; } });
    }
  });
  return { once, mo, saving, allLoop, selected };
}
const eur = (n) => "\u20AC\u00A0" + (n || 0).toLocaleString("nl-NL");
function useCountUp(value, dur = 460) {
  const [disp, setDisp] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current, to = value;
    if (reduce || from === to) { fromRef.current = to; setDisp(to); return; }
    let raf; const start = performance.now();
    const tick = (now) => { const k = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - k, 3); setDisp(Math.round(from + (to - from) * e)); if (k < 1) raf = requestAnimationFrame(tick); else fromRef.current = to; };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, dur]);
  return disp;
}
function PriceCalculator({ openConsult }) {
  const { t } = useLang(); const p = t.pricing;
  const [step, setStep] = useState(0);
  const [openRows, setOpenRows] = useState({});
  const toggleRow = (i) => setOpenRows((s) => ({ ...s, [i]: !s[i] }));
  const [types, setTypes] = useState({ campagne: false, app: true, platform: false, ai: false });
  const [phases, setPhases] = useState({ plan: true, build: true, run: true });
  const [cats, setCats] = useState(() => Object.fromEntries(CAT_KEYS.map((k) => [k, false])));
  const [subs, setSubs] = useState(() => Object.fromEntries(ALL_SUBS.map((k) => [k, false])));
  const [dels, setDels] = useState(() => Object.fromEntries(ALL_DELS.map((k) => [k, false])));
  const [advice, setAdvice] = useState(false);
  const [opts, setOpts] = useState({});
  const [appKind, setAppKind] = useState("webapp");
  const toggleOpt = (k) => setOpts((s) => ({ ...s, [k]: !s[k] }));
  const optLabel = (k) => (p.typeOpts && p.typeOpts[k]) || k;
  const { once, mo, saving, allLoop, selected } = computeLoop({ types, phases, cats, dels, opts, appKind });
  const nothing = once === 0 && mo === 0;
  const steps = ["type", "details", "pakketten", "result"];
  const last = steps.length - 1;
  const cur = steps[step];
  const calcRef = useRef(null);
  const calcMounted = useRef(false);
  useEffect(() => {
    if (!calcMounted.current) { calcMounted.current = true; return; }
    if (calcRef.current) calcRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);
  const go = (d) => setStep((s) => Math.min(last, Math.max(0, s + d)));
  const toggleType = (k) => setTypes((s) => ({ ...s, [k]: !s[k] }));
  const togglePhase = (k) => setPhases((s) => ({ ...s, [k]: !s[k] }));
  const toggleCat = (k) => setCats((s) => ({ ...s, [k]: !s[k] }));
  const toggleSub = (k) => setSubs((s) => ({ ...s, [k]: !s[k] }));
  const toggleDel = (k) => setDels((s) => ({ ...s, [k]: !s[k] }));
  const catLabel = (k) => (p.cats && p.cats[k]) || k;
  const subLabel = (k) => (p.subs && p.subs[k]) || k;
  const delLabel = (k) => (p.dels && p.dels[k]) || k;
  const delPriceLabel = (d) => { const dp = DEL_PRICE[d] || {}; const parts = [dp.once ? eur(dp.once) : null, dp.mo ? `${eur(dp.mo)}${p.mo}` : null].filter(Boolean); return parts.length ? `${p.from} ${parts.join(" + ")}` : ""; };
  const catRefine = (c) => {
    const chans = c.subs.filter((x) => subs[x]).map(subLabel);
    const svcs = c.dels.filter((x) => dels[x]).map(delLabel);
    return [...chans, ...svcs];
  };
  const catBits = () => (types.campagne ? CAT_KEYS.filter((k) => cats[k]) : []).map((k) => {
    const r = catRefine(CAT_BY_KEY[k]);
    return catLabel(k) + (r.length ? ` (${r.join(", ")})` : "");
  });
  const lineItems = () => {
    const items = [];
    selected.forEach((sk) => {
      const planFee = phases.build ? 0 : (phases.plan ? typePhasePrice(sk, "plan") : 0);
      let onceItem = planFee + (phases.build ? typePhasePrice(sk, "build") : 0);
      const moItem = phases.run ? typePhasePrice(sk, "run") : 0;
      const optList = sk === "app" ? APP_OPTS : sk === "platform" ? PLATFORM_OPTS : sk === "ai" ? AI_OPTS : null;
      let sub = [];
      if (optList) {
        const sel = optList.filter((k) => opts[k]);
        if (sk === "app" && phases.build) {
          let room = APP_CAP - PRICING.scopes.app.build;
          sub = [];
          const kp = APP_KIND_PRICE[appKind] || 0;
          if (kp > 0) { const add = Math.min(kp, Math.max(0, room)); room -= add; onceItem += add; sub.push({ label: optLabel(appKind), once: add }); }
          else { sub.push({ label: optLabel(appKind), free: true }); }
          sel.forEach((k) => { const add = Math.min(APP_OPT_PRICE[k] || 0, Math.max(0, room)); room -= add; onceItem += add; sub.push({ label: optLabel(k), once: add }); });
        } else {
          sub = sel.map((k) => ({ label: optLabel(k), free: true }));
        }
      }
      if (onceItem > 0 || moItem > 0 || sub.length > 0) items.push({ label: p.scopes[sk], once: onceItem, mo: moItem, req: false, sub });
    });
    const bf = phases.build ? 1 : 0, rf = phases.run ? 1 : 0;
    (types.campagne ? CAT_KEYS.filter((k) => cats[k]) : []).forEach((k) => {
      const c = CAT_BY_KEY[k];
      const req = c.once === 0 && c.mo === 0;
      const selDels = c.dels.filter((d) => dels[d]);
      const sub = [];
      selDels.forEach((d) => { const dp = DEL_PRICE[d] || {}; sub.push({ label: delLabel(d), once: (dp.once || 0) * bf, mo: (dp.mo || 0) * rf }); });
      c.subs.filter((x) => subs[x]).forEach((x) => sub.push({ label: subLabel(x), free: true }));
      const totMo = (c.mo + selDels.reduce((a, d) => a + ((DEL_PRICE[d] && DEL_PRICE[d].mo) || 0), 0)) * rf;
      const totOnce = (c.once + selDels.reduce((a, d) => a + ((DEL_PRICE[d] && DEL_PRICE[d].once) || 0), 0)) * bf;
      items.push({ label: catLabel(k), once: totOnce, mo: totMo, req, sub });
    });
    return items;
  };
  const mediaOnce = types.campagne ? CAT_KEYS.filter((k) => cats[k]).reduce((a, k) => { const c = CAT_BY_KEY[k]; return a + c.once + c.dels.filter((d) => dels[d]).reduce((b, d) => b + ((DEL_PRICE[d] && DEL_PRICE[d].once) || 0), 0); }, 0) : 0;
  const mediaMo = types.campagne ? CAT_KEYS.filter((k) => cats[k]).reduce((a, k) => { const c = CAT_BY_KEY[k]; return a + c.mo + c.dels.filter((d) => dels[d]).reduce((b, d) => b + ((DEL_PRICE[d] && DEL_PRICE[d].mo) || 0), 0); }, 0) : 0;
  const appOptOnce = types.app ? Math.min(APP_OPTS.reduce((a, k) => a + (opts[k] ? (APP_OPT_PRICE[k] || 0) : 0), 0) + (APP_KIND_PRICE[appKind] || 0), APP_CAP - PRICING.scopes.app.build) : 0;
  const phaseSum = (pk) => selected.reduce((a, sk) => a + typePhasePrice(sk, pk), 0) + (pk === "build" ? mediaOnce + appOptOnce : pk === "run" ? mediaMo : 0);
  const packagePrice = (k) => k === "run" ? eur(phaseSum("run")) + p.mo : eur(phaseSum(k));
  const phaseDescFor = (k) => {
    if (selected.length === 1 && p.phaseByType && p.phaseByType[selected[0]]) return p.phaseByType[selected[0]][k];
    if (selected.length > 1 && p.phaseMulti) return p.phaseMulti[k];
    return p.phaseDesc[k];
  };
  const typeLabel = selected.map((s) => p.scopes[s]).join(" \u00B7 ");
  const summary = () => {
    const parts = [];
    if (selected.length) parts.push(typeLabel);
    const ph = ["plan", "build", "run"].filter((k) => phases[k]).map((k) => p.phases[k]);
    if (ph.length) parts.push(ph.join(", "));
    const activeOpts = [];
    if (types.app) activeOpts.push(...APP_OPTS.filter((k) => opts[k]));
    if (types.platform) activeOpts.push(...PLATFORM_OPTS.filter((k) => opts[k]));
    if (types.ai) activeOpts.push(...AI_OPTS.filter((k) => opts[k]));
    if (activeOpts.length) parts.push(activeOpts.map(optLabel).join(", "));
    const ch = catBits();
    if (advice) ch.push(p.details.advice);
    if (ch.length) parts.push(ch.join(" \u00B7 "));
    return `${p.summaryPrefix}: ${parts.join(" \u00B7 ")}. ${p.once} ${p.from} ${eur(once)}${mo ? `, ${p.perMonth.toLowerCase()} ${p.from} ${eur(mo)}` : ""}.`;
  };
  const selLine = () => {
    const bits = [];
    const ph = ["plan", "build", "run"].filter((k) => phases[k]).map((k) => p.phases[k]);
    if (ph.length) bits.push(ph.join(", "));
    const ch = catBits();
    if (advice) ch.push(p.details.advice);
    if (ch.length) bits.push(ch.join(" \u00B7 "));
    return bits.join(" \u00B7 ");
  };
  return (
    <div className="calc" ref={calcRef}>
      <div className="calc-steps">
        {steps.map((s, i) => (
          <button key={s} className={`calc-dot ${i === step ? "on" : ""} ${i < step ? "done" : ""}`} onClick={() => setStep(i)}>
            <span className="calc-dot-n">{i + 1}</span><span className="calc-dot-l">{p.steps[s]}</span>
          </button>
        ))}
      </div>
      <div className="calc-slide" key={cur}>
        <div className="calc-slide-head"><div className="calc-slide-title">{p.stepTitle[cur]}</div><div className="calc-slide-help">{p.stepHelp[cur]}</div></div>
        {cur === "type" && (
          <div className="calc-panel">
            <div className="scope-cards type-cards">
              {SCOPE_KEYS.map((s) => (
                <button key={s} className={`scope-card ${types[s] ? "on" : ""}`} onClick={() => toggleType(s)} aria-pressed={types[s]}>
                  {s === "app" && <span className="scope-badge mono">{p.badge}</span>}
                  <span className="scope-check" aria-hidden>{types[s] ? "\u2713" : ""}</span>
                  <span className="scope-card-t">{p.scopes[s]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {cur === "details" && (
          <div className="calc-panel calc-details">
            {selected.length === 0 && <div className="calc-note mono">{p.details.pickType}</div>}
            {types.campagne && (
              <div className="detail-block">
                <button className={`toggle advice-toggle ${advice ? "on" : ""}`} onClick={() => setAdvice((v) => !v)} aria-pressed={advice}>
                  <span className="toggle-main"><span className="toggle-t">{p.details.advice}</span></span>
                  <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                </button>
                <div className="detail-block-q">{p.details.campagneQ}</div>
                <div className="svc-list">
                  {CHANNEL_TREE.map((c) => (
                    <div key={c.key} className="svc-item">
                      <button className={`svc-row ${cats[c.key] ? "on" : ""}`} onClick={() => toggleCat(c.key)} aria-pressed={cats[c.key]}>
                        <span className="svc-row-x" aria-hidden>{cats[c.key] ? "\u2212" : "+"}</span>
                        <span className="svc-row-n">{catLabel(c.key)}</span>
                        <span className="svc-row-p mono">{c.once > 0 ? `${p.from} ${eur(c.once)}` : p.onRequest}</span>
                      </button>
                      {cats[c.key] && (
                        <div className="cat-refine">
                          <p className="cat-explain">{p.catDesc[c.key]}</p>
                          <div className="refine-group">
                            <span className="refine-h mono">{p.chansH}</span>
                            {c.subs.map((sub) => (
                              <button key={sub} className={`toggle toggle-sm ${subs[sub] ? "on" : ""}`} onClick={() => toggleSub(sub)} aria-pressed={subs[sub]}>
                                <span className="toggle-main"><span className="toggle-t">{subLabel(sub)}</span></span>
                                <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                              </button>
                            ))}
                          </div>
                          <div className="refine-group">
                            <span className="refine-h mono">{p.delsH}</span>
                            {c.dels.map((d) => (
                              <button key={d} className={`toggle toggle-sm ${dels[d] ? "on" : ""}`} onClick={() => toggleDel(d)} aria-pressed={dels[d]}>
                                <span className="toggle-main"><span className="toggle-t">{delLabel(d)}</span></span>
                                <span className="toggle-p mono">{delPriceLabel(d)}</span>
                                <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {types.app && (
              <>
                <div className="detail-block">
                  <div className="detail-block-q">{p.details.appQ}</div>
                  <div className="refine-group opt-group">
                    {APP_KINDS.map((k) => (
                      <button key={k} className={`toggle toggle-sm ${appKind === k ? "on" : ""}`} onClick={() => setAppKind(k)} aria-pressed={appKind === k}>
                        <span className="toggle-main"><span className="toggle-t">{optLabel(k)}</span></span>
                        <span className="toggle-p mono">{APP_KIND_PRICE[k] ? `${p.from} ${eur(APP_KIND_PRICE[k])}` : p.inclFree}</span>
                        <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="detail-block">
                  <div className="detail-block-q">{p.details.appExtraQ}</div>
                  <div className="refine-group opt-group">
                    {APP_OPTS.map((k) => (
                      <button key={k} className={`toggle toggle-sm ${opts[k] ? "on" : ""}`} onClick={() => toggleOpt(k)} aria-pressed={opts[k]}>
                        <span className="toggle-main"><span className="toggle-t">{optLabel(k)}</span></span>
                        <span className="toggle-p mono">{`${p.from} ${eur(APP_OPT_PRICE[k])}`}</span>
                        <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {types.platform && (
              <div className="detail-block">
                <div className="detail-block-q">{p.details.platformQ}</div>
                <div className="refine-group opt-group">
                  {PLATFORM_OPTS.map((k) => (
                    <button key={k} className={`toggle toggle-sm ${opts[k] ? "on" : ""}`} onClick={() => toggleOpt(k)} aria-pressed={opts[k]}>
                      <span className="toggle-main"><span className="toggle-t">{optLabel(k)}</span></span>
                      <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {types.ai && (
              <div className="detail-block">
                <div className="detail-block-q">{p.scopes.ai}</div>
                <div className="refine-group opt-group">
                  {AI_OPTS.map((k) => (
                    <button key={k} className={`toggle toggle-sm ${opts[k] ? "on" : ""}`} onClick={() => toggleOpt(k)} aria-pressed={opts[k]}>
                      <span className="toggle-main"><span className="toggle-t">{optLabel(k)}</span></span>
                      <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {cur === "pakketten" && (
          <div className="calc-panel">
            <div className="cfg-toggles">
              {["plan", "build", "run"].map((k) => (
                <button key={k} className={`toggle ${phases[k] ? "on" : ""}`} onClick={() => togglePhase(k)} aria-pressed={phases[k]}>
                  <span className="toggle-main"><span className="toggle-t">{p.phases[k]}</span><span className="toggle-d">{phaseDescFor(k)}</span></span>
                  <span className="toggle-p mono">{k === "plan" && phases.build && selected.length > 0 ? <span className="waived">{packagePrice("plan")}</span> : packagePrice(k)}</span>
                  <span className="tgt" aria-hidden><span className="tgt-dot" /></span>
                </button>
              ))}
            </div>
          </div>
        )}
        {cur === "result" && (
          <div className="calc-panel calc-result">
            <div className="cfg-out-card">
              <div className="cfg-out-h mono">{selected.length ? typeLabel : p.empty}</div>
              {nothing ? <div className="cfg-empty">{p.empty}</div> : <>
                <div className="rcp">
                  <div className="rcp-head mono"><span>{p.svcCol}</span><span>{p.once}</span><span>{p.monthCol}</span></div>
                  {lineItems().map((it, i) => {
                    const open = !!openRows[it.label];
                    const has = it.sub && it.sub.length > 0;
                    return (
                      <div key={it.label} className="rcp-line">
                        <div className={`rcp-row ${has ? "rcp-row-btn" : ""}`} onClick={has ? () => toggleRow(it.label) : undefined} role={has ? "button" : undefined} aria-expanded={has ? open : undefined}>
                          <span className="rcp-l">{has && <span className={`rcp-caret ${open ? "on" : ""}`} aria-hidden>{"\u203A"}</span>}{it.label}</span>
                          <span className="rcp-v mono">{it.req ? p.onRequest : (it.once > 0 ? eur(it.once) : "")}</span>
                          <span className="rcp-v mono">{it.req ? "" : (it.mo > 0 ? eur(it.mo) : "")}</span>
                        </div>
                        {has && open && it.sub.map((s, j) => (
                          <div key={j} className="rcp-row rcp-srow">
                            <span className="rcp-l">{s.label}</span>
                            <span className="rcp-v mono">{s.free ? <em className="rcp-free">{p.inclFree}</em> : (s.once > 0 ? eur(s.once) : "")}</span>
                            <span className="rcp-v mono">{s.free ? "" : (s.mo > 0 ? eur(s.mo) : "")}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                  {advice && <div className="rcp-row"><span className="rcp-l">{p.details.advice}</span><span className="rcp-v mono">{p.onRequest}</span><span className="rcp-v" /></div>}
                  <div className="rcp-row rcp-tot"><span className="rcp-l">{p.totalWord}</span><span className="rcp-v mono">{eur(once)}</span><span className="rcp-v mono">{mo > 0 ? eur(mo) : ""}</span></div>
                </div>
              </>}
              <button className="btn btn-primary cfg-cta" onClick={() => openConsult(null, summary())}>{p.cta}</button>
            </div>
          </div>
        )}
      </div>
      <div className="calc-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => go(-1)} disabled={step === 0}>{p.back}</button>
        <div className="calc-running mono">{!nothing && `${p.totalFrom} ${eur(once)}${mo ? ` \u00B7 ${eur(mo)}${p.mo}` : ""}`}</div>
        {step < last ? <button className="btn btn-primary btn-sm" onClick={() => go(1)}>{p.next}</button> : <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}>{p.startOver}</button>}
      </div>
    </div>
  );
}
function Pricing({ openConsult }) {
  const { t } = useLang(); const p = t.pricing;
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const refPrice = (sk, pk) => PRICING.scopes[sk][pk];
  return (
    <section className="pricing">
      <div className="wrap">
        <a href="#/" className="back">{t.cms.back}</a>
        <div className="eyebrow">{p.eyebrow}</div>
        <h1 className="display detail-h">{p.h1}</h1>
        <PriceCalculator openConsult={openConsult} />
        <div className="ref">
          <h2 className="display ref-h">{p.refTitle}</h2>
          <div className="ref-block">
            <div className="ref-block-h"><h3 className="ref-t">{p.loopRef}</h3><p className="ref-d">{p.loopRefDesc}</p></div>
            <div className="ref-grid">
              {["plan", "build", "run"].map((k) => (
                <div key={k} className="ref-card">
                  <div className="ref-card-t">{p.phases[k]}</div>
                  <div className="ref-card-d">{p.phaseDesc[k]}</div>
                  <div className="ref-rows mono">
                    {SCOPE_KEYS.map((s) => { const v = refPrice(s, k); return <div key={s} className="ref-row"><span>{p.scopes[s]}</span><span>{v > 0 ? `${eur(v)}${k === "run" ? p.mo : ""}` : (s === "campagne" ? p.viaChannels : p.onRequest)}</span></div>; })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ref-block">
            <div className="ref-block-h"><h3 className="ref-t">{p.appRef}</h3><p className="ref-d">{p.appRefDesc}</p></div>
            <div className="ref-grid">
              {[["basis", p.appBasis], ["advanced", p.appAdvanced], ["platform", p.appPlatform]].map(([k, desc]) => (
                <div key={k} className="ref-card">
                  <div className="ref-card-t">{k === "platform" ? p.scopes.platform : p.levels[k]}</div>
                  <div className="ref-card-price mono">{p.from} {eur(PRICING.app[k])}</div>
                  <div className="ref-card-d">{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="ref-block">
            <div className="ref-block-h"><h3 className="ref-t">{p.looseRef}</h3></div>
            <div className="ref-grid">
              {CHANNEL_TREE.map((c) => (
                <div key={c.key} className="ref-card">
                  <div className="ref-card-t">{p.cats[c.key]}</div>
                  <div className="ref-card-price mono">{c.once === 0 && c.mo === 0 ? p.onRequest : (c.mo ? `${p.setup} ${eur(c.once)} \u00B7 ${p.mgmt} ${eur(c.mo)}${p.mo}` : `${p.setup} ${eur(c.once)}`)}</div>
                  <div className="ref-card-d">{p.catDesc[c.key]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CMS ---------- */
function Field({ label, value, onChange, type = "text", hint, rows = 6, placeholder, mono }) {
  return (
    <label className="field">
      <span className="field-l">{label}{hint && <span className="field-hint">{hint}</span>}</span>
      {type === "textarea"
        ? <textarea className={`field-i${mono ? " field-mono" : ""}`} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <input className={`field-i${mono ? " field-mono" : ""}`} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}
function SearchIcon() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
}
function Editor({ coll, item, onSave, onCancel }) {
  const { t } = useLang(); const f = t.cms.f; const g = t.cms.groups; const h = t.cms.hints;
  const [d, setD] = useState(item);
  const set = (k, v) => setD((p) => ({ ...p, [k]: v }));
  const isNew = !item.id;
  const save = () => {
    let out = { ...d };
    if (!out.id) out.id = slugify(coll === "reviews" ? (out.name || "review") : (out.title || out.name || "item"));
    if (coll === "reviews") out.rating = Math.max(1, Math.min(5, parseInt(out.rating, 10) || 5));
    onSave(out, item.id || "");
  };
  const slugField = <Field label={t.cms.slug} value={d.id || ""} onChange={(v) => set("id", v)} hint={h.slug} mono placeholder="auto" />;
  return (
    <div className="editor">
      <div className="editor-head">
        <button className="editor-back" onClick={onCancel}>←</button>
        <div><div className="editor-eyebrow mono">{t.cms.tabs[coll]}</div><h2 className="display editor-title">{isNew ? t.cms.newEntry : t.cms.editEntry}</h2></div>
      </div>
      <div className="editor-body">
        {coll === "reviews" && <>
          <div className="field-group"><div className="field-group-h mono">{g.content}</div><div className="field-grid">
            <Field label={f.quote} value={d.quote || ""} onChange={(v) => set("quote", v)} type="textarea" rows={4} />
          </div></div>
          <div className="field-group"><div className="field-group-h mono">{g.meta}</div><div className="field-grid two">
            <Field label={f.name} value={d.name || ""} onChange={(v) => set("name", v)} />
            <Field label={f.rating} value={d.rating ?? 5} onChange={(v) => set("rating", v)} type="number" />
            <Field label={f.role} value={d.role || ""} onChange={(v) => set("role", v)} />
            <Field label={f.org} value={d.org || ""} onChange={(v) => set("org", v)} />
            {slugField}
          </div></div>
        </>}
        {coll === "certs" && <>
          <div className="field-group"><div className="field-group-h mono">{g.content}</div><div className="field-grid two">
            <Field label={f.certName} value={d.name || ""} onChange={(v) => set("name", v)} />
            <Field label={f.tier} value={d.tier || ""} onChange={(v) => set("tier", v)} />
            <Field label={f.blurb} value={d.blurb || ""} onChange={(v) => set("blurb", v)} type="textarea" rows={3} />
          </div></div>
          <div className="field-group"><div className="field-group-h mono">{g.links}</div><div className="field-grid two">
            <Field label={f.link} value={d.href || ""} onChange={(v) => set("href", v)} mono />
            {slugField}
          </div></div>
        </>}
        {coll === "apps" && <>
          <div className="field-group"><div className="field-group-h mono">{g.content}</div><div className="field-grid">
            <Field label={f.summary} value={d.summary || ""} onChange={(v) => set("summary", v)} type="textarea" rows={3} />
            <Field label={f.body} value={d.body || ""} onChange={(v) => set("body", v)} type="textarea" />
            <Field label={f.metrics} value={(d.metrics || []).map((m) => `${m.label}:${m.value}`).join(", ")} hint={h.metrics} mono
              onChange={(v) => set("metrics", v.split(",").map((s) => s.trim()).filter(Boolean).map((s) => { const [label, ...r] = s.split(":"); return { label: (label || "").trim(), value: r.join(":").trim() }; }))} type="textarea" rows={2} />
          </div></div>
          <div className="field-group"><div className="field-group-h mono">{g.meta}</div><div className="field-grid two">
            <Field label={f.title} value={d.title || ""} onChange={(v) => set("title", v)} />
            <Field label={f.client} value={d.client || ""} onChange={(v) => set("client", v)} />
            <Field label={f.tag} value={d.tag || ""} onChange={(v) => set("tag", v)} />
            {slugField}
          </div></div>
          <div className="field-group"><div className="field-group-h mono">{g.links}</div><div className="field-grid">
            <Field label={f.link} value={d.link || ""} onChange={(v) => set("link", v)} mono />
          </div></div>
        </>}
        {coll === "articles" && <>
          <div className="field-group"><div className="field-group-h mono">{g.content}</div><div className="field-grid">
            <Field label={f.title} value={d.title || ""} onChange={(v) => set("title", v)} />
            <Field label={f.excerpt} value={d.excerpt || ""} onChange={(v) => set("excerpt", v)} type="textarea" rows={2} />
            <Field label={f.body} value={d.body || ""} onChange={(v) => set("body", v)} type="textarea" rows={14} hint={h.body} mono />
          </div></div>
          <div className="field-group"><div className="field-group-h mono">{g.media}</div><div className="field-grid">
            <Field label={f.cover} value={d.cover || ""} onChange={(v) => set("cover", v)} hint={h.cover} mono />
            <div className="cover-preview"><ArticleArt variant={d.cover || "default"} mode="figure" /></div>
          </div></div>
          <div className="field-group"><div className="field-group-h mono">{g.meta}</div><div className="field-grid two">
            <Field label={f.category} value={d.cat || ""} onChange={(v) => set("cat", v)} />
            <Field label={f.date} value={d.date || ""} onChange={(v) => set("date", v)} />
            <Field label={f.read} value={d.read || ""} onChange={(v) => set("read", v)} placeholder="6 min" />
            {slugField}
          </div></div>
        </>}
      </div>
      <div className="editor-bar">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>{t.cms.cancel}</button>
        <button className="btn btn-primary btn-sm" onClick={save}>{t.cms.save}</button>
      </div>
    </div>
  );
}
function CMS({ content }) {
  const { t } = useLang();
  const { data, upsert, remove, reset, status } = content;
  const [tab, setTab] = useState("articles");
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const tabs = [
    { key: "reviews", label: t.cms.tabs.reviews, title: (x) => x.name },
    { key: "certs", label: t.cms.tabs.certs, title: (x) => x.name },
    { key: "apps", label: t.cms.tabs.apps, title: (x) => x.title },
    { key: "articles", label: t.cms.tabs.articles, title: (x) => x.title },
  ];
  const meta = tabs.find((x) => x.key === tab);
  const all = data[tab] || [];
  const s = (q || "").trim().toLowerCase();
  const list = s ? all.filter((it) => (meta.title(it) || "").toLowerCase().includes(s) || (it.id || "").toLowerCase().includes(s)) : all;
  const pageFor = (it) => ({ reviews: "review", certs: "cert", apps: "app", articles: "insight" }[tab]) + "/" + it.id;
  return (
    <section className="cms">
      <div className="wrap cms-shell">
        <aside className="cms-side">
          <a href="#/" className="cms-side-back">{t.cms.back}</a>
          <div className="cms-side-brand"><FliiLogo variant="word" /><span className="cms-side-tag mono">{t.cms.eyebrow}</span></div>
          <div className="cms-side-label mono">{t.cms.collectionsLabel}</div>
          <nav className="cms-collections" aria-label="Collections">
            {tabs.map((x) => (
              <button key={x.key} className={`cms-coll ${tab === x.key ? "on" : ""}`} onClick={() => { setTab(x.key); setEditing(null); setQ(""); }}>
                <span className="cms-coll-name">{x.label}</span>
                <span className="cms-coll-count">{(data[x.key] || []).length}</span>
              </button>
            ))}
          </nav>
          <div className="cms-side-foot">
            <div className={`cms-status cms-status-${status}`}><span className="cms-dot" />{t.cms.status[status] || t.cms.status.local}</div>
            <button className="cms-reset" onClick={() => { if (confirm(t.cms.confirmReset)) { reset(); setEditing(null); } }}>{t.cms.reset}</button>
          </div>
        </aside>
        <main className="cms-main">
          {editing ? (
            <Editor coll={tab} item={editing} onSave={(it, orig) => { if (orig && orig !== it.id) remove(tab, orig); upsert(tab, it); setEditing(null); }} onCancel={() => setEditing(null)} />
          ) : (
            <>
              <div className="cms-main-head">
                <div className="cms-main-title">
                  <h1 className="display cms-h1">{meta.label}</h1>
                  <p className="cms-desc">{t.cms.desc[tab]}</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setEditing({})}>+ {t.cms.newEntry}</button>
              </div>
              <div className="cms-toolbar">
                <div className="cms-search"><SearchIcon /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.cms.search} aria-label={t.cms.search} /></div>
                <span className="cms-count-meta mono">{list.length} {t.cms.entries}</span>
              </div>
              <div className="cms-list">
                {list.map((it) => (
                  <div key={it.id} className="cms-row">
                    <div className="cms-row-main">
                      <div className="cms-row-t">{meta.title(it)}</div>
                      <div className="cms-row-s mono">{it.id}{it.cat ? ` · ${it.cat}` : ""}{it.tier ? ` · ${it.tier}` : ""}{it.date ? ` · ${it.date}` : ""}</div>
                    </div>
                    <div className="cms-row-actions">
                      <a className="cms-link" href={`#/${pageFor(it)}`}>{t.cms.view}</a>
                      <button className="cms-link" onClick={() => setEditing(it)}>{t.cms.edit}</button>
                      <button className="cms-link danger" onClick={() => { if (confirm(t.cms.confirmDelete)) remove(tab, it.id); }}>{t.cms.del}</button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && <div className="cms-empty">{s ? t.cms.noMatch : t.cms.empty}</div>}
              </div>
            </>
          )}
        </main>
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
function ConsultModal({ onClose, prefill }) {
  const { t } = useLang();
  const c = t.consult;
  const [step, setStep] = useState(prefill ? 2 : 1);
  const [reason, setReason] = useState(prefill ? (c.opts[0] && c.opts[0].id) : null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [detail, setDetail] = useState(prefill || "");
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
    window.location.href = `mailto:hello@flii.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
  const [consultPrefill, setConsultPrefill] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);
  const [admin, setAdmin] = useState(() => { try { return sessionStorage.getItem("flii_admin") === "1"; } catch (e) { return false; } });
  const [lang, setLangState] = useState(() => { try { return localStorage.getItem("flii_lang") || "nl"; } catch (e) { return "nl"; } });
  const setLang = (l) => { setLangState(l); try { localStorage.setItem("flii_lang", l); } catch (e) {} };
  const t = I18N[lang] || I18N.nl;
  const openConsult = (e, prefill) => { if (e && e.preventDefault) e.preventDefault(); setConsultPrefill(typeof prefill === "string" ? prefill : ""); setConsult(true); };
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
        {route.name === "prijzen" && <Pricing openConsult={openConsult} />}
        {route.name === "service" && <ServicePage id={route.id} openConsult={openConsult} />}
        {route.name === "app" && <AppDetail content={content.data} id={route.id} />}
        {route.name === "insight" && <ArticleDetail content={content.data} id={route.id} />}
        {route.name === "review" && <ReviewDetail content={content.data} id={route.id} />}
        {route.name === "cert" && <CertDetail content={content.data} id={route.id} />}
        <Footer admin={admin} />
        <DockBar openConsult={openConsult} admin={admin} onLogin={() => setLoginOpen(true)} onLogout={logout} />
        {consult && <ConsultModal onClose={() => setConsult(false)} prefill={consultPrefill} />}
        {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSuccess={grantAdmin} />}
      </div>
    </LangCtx.Provider>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
.flii-root{
  --ink:#171717; --dark:#171717; --dark-2:#1E1E1E;
  --mag:#E7255A; --paper:#F3F1EB; --card:#FBFAF7; --mist:#EAE7DF; --line:#E2DED3;
  --gloss:linear-gradient(135deg,#F4739B 0%,#E7255A 46%,#B81846 100%);
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
.loop-bg{position:absolute;left:0;right:0;top:68%;transform:translateY(-50%);height:52%;z-index:0;opacity:0.64;}
.node-net-loop .node-net-canvas{-webkit-mask-image:radial-gradient(84% 84% at 50% 50%,#000 40%,rgba(0,0,0,0.24) 72%,transparent 100%);mask-image:radial-gradient(84% 84% at 50% 50%,#000 40%,rgba(0,0,0,0.24) 72%,transparent 100%);}
.hero-inner{position:relative;z-index:2;max-width:740px;}
.loop-cta{display:inline-flex;align-items:center;gap:11px;text-decoration:none;color:var(--ink);font-weight:600;font-size:15px;}
.loop-cta:hover{color:var(--mag);}
.loop-cta-t{white-space:nowrap;}
.loop-cta-arrow{color:var(--mag);}
.loopmark{position:relative;width:52px;height:52px;flex:none;}
.loopmark-svg{width:100%;height:100%;display:block;overflow:visible;filter:saturate(1.05);}
.lm-rot{transform-box:view-box;transform-origin:50px 50px;animation:loopmark-spin 7s linear infinite;}
.lm-rot2{transform-box:view-box;transform-origin:50px 50px;animation:loopmark-spin 10s linear infinite reverse;}
.lr-orbit{transform-box:view-box;transform-origin:50px 50px;animation:loopmark-spin 16s linear infinite;}
.lr-orb-rot{transform-box:view-box;transform-origin:50px 50px;animation:lrOrbRot 26s linear infinite;}
.lr-orb-rot2{transform-box:view-box;transform-origin:50px 50px;animation:lrOrbRot 34s linear infinite reverse;}
@keyframes lrOrbRot{to{transform:rotate(360deg);}}
.lr-flash{opacity:0;}
.lr-flash.on{animation:lrFlash .6s ease-out;}
@keyframes lrFlash{0%{opacity:0;}25%{opacity:0.85;}100%{opacity:0;}}
.lr-spark{opacity:0.6;}
.lr-trail{opacity:0.32;}
.lr-burst{transform-box:view-box;transform-origin:50px 12px;animation:lr-flash 4s ease-out infinite;}
@keyframes lr-flash{0%{opacity:1;transform:scale(1.15);}10%{opacity:0.25;transform:scale(0.7);}20%{opacity:0;transform:scale(0.4);}82%{opacity:0;transform:scale(0.4);}93%{opacity:0.5;transform:scale(0.78);}100%{opacity:1;transform:scale(1.15);}}
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
.funnel{display:flex;flex-direction:column;align-items:center;gap:9px;margin-top:44px;}
.fnl{max-width:920px;margin:44px auto 0;}
.fnl-svg{width:100%;height:auto;display:block;overflow:visible;}
.fnl-seg{cursor:pointer;outline:none;}
.fnl-slice{fill:url(#fnlFill);stroke:rgba(255,255,255,0.26);stroke-width:1;opacity:0.82;transition:opacity .2s,filter .2s;}
.fnl-seg:hover .fnl-slice{opacity:0.92;}
.fnl-seg.on .fnl-slice{opacity:1;filter:brightness(1.12);}
.fnl-seg:focus-visible .fnl-slice{opacity:0.95;}
.fnl-letter{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:38px;fill:#fff;opacity:0.9;pointer-events:none;transition:opacity .2s;}
.fnl-seg.on .fnl-letter{opacity:1;}
.fnl-outline{fill:none;stroke:rgba(174,34,73,0.42);stroke-width:1.4;stroke-linejoin:round;pointer-events:none;}
.fnl-build{fill:none;stroke:#FF4D8D;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;filter:url(#fnlGlowF);stroke-dasharray:1;stroke-dashoffset:1;opacity:0;pointer-events:none;animation:fnlBuild 5.6s ease-in-out infinite;}
@keyframes fnlBuild{0%{stroke-dashoffset:1;opacity:0;}6%{opacity:1;}46%{stroke-dashoffset:0;opacity:1;}72%{opacity:1;}100%{stroke-dashoffset:0;opacity:0;}}
.fnl-desc{margin:24px auto 0;max-width:680px;text-align:center;display:flex;flex-direction:column;gap:7px;animation:fnlFade .3s ease;}
.fnl-desc-k{font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);font-weight:600;}
.fnl-desc-g{font-size:15px;color:var(--ink);line-height:1.5;}
.fnl-desc-g strong{color:var(--mag);font-weight:600;}
.fnl-desc-ex{font-size:13.5px;color:var(--soft);line-height:1.5;}
.fnl-desc-ex strong{color:var(--mid);font-weight:600;}
.model-tabs{display:flex;justify-content:center;gap:8px;margin:34px auto 4px;flex-wrap:wrap;}
.model-tab{padding:9px 18px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--mid);font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:border-color .15s,color .15s,box-shadow .15s;}
.model-tab:hover{border-color:var(--soft);color:var(--ink);}
.model-tab.on{border-color:transparent;color:var(--ink);background:linear-gradient(var(--card),var(--card)) padding-box, var(--gloss) border-box;box-shadow:0 4px 14px -8px rgba(231,37,90,0.5);}
.model-view{animation:fnlFade .35s ease;}
.stk-wrap{max-width:720px;margin:30px auto 0;}
.stk-svg{width:100%;height:auto;display:block;overflow:visible;}
.stk-seg{cursor:pointer;outline:none;}
.stk-slab{fill:url(#stkFill);stroke:rgba(255,255,255,0.24);stroke-width:1;opacity:0.82;transition:opacity .2s,filter .2s;}
.stk-seg:hover .stk-slab{opacity:0.92;}
.stk-seg.on .stk-slab{opacity:1;filter:brightness(1.13);stroke:rgba(255,255,255,0.55);}
.stk-seg:focus-visible .stk-slab{opacity:0.95;}
.stk-label{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:22px;fill:#fff;opacity:0.92;pointer-events:none;}
.stk-seg.on .stk-label{opacity:1;}
.stk-led{fill:#FFE3EE;opacity:0.9;pointer-events:none;}
.stk-led2{fill:#7A1030;opacity:0.9;pointer-events:none;}
.stk-seg.on .stk-led2{fill:#FFD2E4;}
.stk-vent{stroke:rgba(255,255,255,0.26);stroke-width:2;pointer-events:none;}
.pnet-wrap{max-width:520px;margin:34px auto 0;}
.pnet{position:relative;width:100%;aspect-ratio:1;overflow:visible;}
.pnet-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:1;}
.pnet-pipe-o{fill:none;stroke:rgba(231,37,90,0.28);stroke-width:2.4;stroke-linecap:round;transition:stroke .18s,stroke-width .18s;}
.pnet-pipe-i{fill:none;stroke:rgba(255,143,182,0.5);stroke-width:0.9;stroke-linecap:round;transition:stroke .18s;}
.pnet-pipe.on .pnet-pipe-o{stroke:var(--mag);stroke-width:3.2;}
.pnet-pipe.on .pnet-pipe-i{stroke:#FFD2E4;}
.pnet-browser{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;width:38%;border-radius:12px;overflow:hidden;background:var(--card);border:1px solid transparent;background:linear-gradient(var(--card),var(--card)) padding-box, var(--gloss) border-box;box-shadow:0 14px 34px -14px rgba(231,37,90,0.5);}
.pnet-bar{display:flex;align-items:center;gap:4px;padding:7px 9px;background:var(--mist);}
.pnet-bar i{width:6px;height:6px;border-radius:50%;background:var(--soft);flex:none;}
.pnet-url{flex:1;height:7px;margin-left:6px;border-radius:99px;background:var(--line);}
.pnet-screen{position:relative;padding:14px 12px 16px;display:flex;flex-direction:column;gap:7px;min-height:66px;}
.pnet-scr-h{height:9px;width:60%;border-radius:3px;background:var(--mag);opacity:0.85;}
.pnet-scr-a{height:6px;width:100%;border-radius:3px;background:var(--line);}
.pnet-scr-b{height:6px;width:78%;border-radius:3px;background:var(--line);}
.pnet-name{margin-top:5px;font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:12px;color:var(--ink);}
.pnet-node{position:absolute;transform:translate(-50%,-50%);z-index:3;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font:inherit;padding:0;width:78px;}
.pnet-ic{width:46px;height:46px;flex:none;border-radius:13px;display:grid;place-items:center;color:#fff;border:1px solid transparent;background:linear-gradient(140deg,#DA3E68,#AE2249) padding-box, var(--gloss) border-box;box-shadow:0 8px 20px -12px rgba(231,37,90,0.6);transition:filter .15s,box-shadow .15s,transform .15s;}
.pnet-ic svg{width:24px;height:24px;}
.pnet-node:hover .pnet-ic{transform:translateY(-2px);}
.pnet-node.on .pnet-ic{filter:brightness(1.12);box-shadow:0 8px 22px -8px rgba(231,37,90,0.75),0 0 0 3px rgba(231,37,90,0.18);}
.pnet-lbl{font-size:11.5px;font-weight:600;color:var(--mid);letter-spacing:0.01em;text-align:center;line-height:1.2;}
.pnet-node.on .pnet-lbl{color:var(--mag);}
@media (max-width:600px){.pnet-node{width:62px;}.pnet-ic{width:40px;height:40px;border-radius:11px;}.pnet-ic svg{width:21px;height:21px;}.pnet-lbl{font-size:10px;}.pnet-name{font-size:10px;}.stk-label{font-size:18px;}}
.fnl-desc-hint{font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);}
@keyframes fnlFade{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
@media (prefers-reduced-motion: reduce){.fnl-build{animation:none;opacity:0;}}
.funnel-stage{width:var(--fw,100%);max-width:660px;}
.funnel-bar{display:flex;align-items:center;gap:18px;background:var(--card);border:1px solid var(--line);border-radius:15px;padding:17px 22px;transition:border-color .16s;}
.funnel-stage:last-child .funnel-bar{background:var(--ink);border-color:var(--ink);}
.funnel-n{font-size:12px;color:var(--soft);flex:none;letter-spacing:0.04em;}
.funnel-stage:last-child .funnel-n{color:rgba(243,241,235,0.55);}
.funnel-txt{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1;}
.funnel-top{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;}
.funnel-k{font-size:16px;font-weight:600;color:var(--ink);}
.funnel-stage:last-child .funnel-k{color:var(--paper);}
.funnel-note{font-size:10.5px;letter-spacing:0.05em;text-transform:uppercase;color:var(--soft);}
.funnel-goal{font-size:13.5px;color:var(--mid);line-height:1.4;}
.funnel-stage:last-child .funnel-goal{color:rgba(243,241,235,0.72);}
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
.cred-seal-logo,.marquee-cred .cred-seal-logo{background:#fff;border:1px solid var(--line);}
.cred-logo{width:15px;height:15px;object-fit:contain;display:block;}
.cert-logo-lg{width:56px;height:56px;border-radius:14px;background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;margin-bottom:24px;}
.cert-logo-lg img{width:28px;height:28px;object-fit:contain;}
.cert-logo-lg svg{width:24px;height:24px;}
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
.service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;margin-top:48px;}
.service{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:0;display:flex;flex-direction:column;min-height:230px;transition:transform .2s,box-shadow .2s;}
.service:hover{transform:translateY(-4px);box-shadow:0 30px 50px -28px rgba(23,23,23,0.18);}
.service-link-wrap{display:flex;flex-direction:column;flex:1;padding:26px;text-decoration:none;color:inherit;}
.service-tag{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--mag);margin-top:8px;}
.service-n{font-size:13px;color:var(--mid);margin-bottom:auto;}
.service-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:20px;margin:14px 0 10px;letter-spacing:-0.01em;}
.service-body{font-size:14.5px;color:var(--mid);margin:0 0 16px;}
.service-link{background:none;border:none;padding:0;font:inherit;font-size:13.5px;font-weight:600;color:var(--ink);cursor:pointer;text-align:left;}
.service-link:hover{color:var(--mag);}
.service-link-wrap:hover .service-link{color:var(--mag);}
/* service page */
.service-page .detail-lede{max-width:60ch;}
.svc-cols{display:grid;grid-template-columns:1fr 1fr;gap:44px;margin:46px 0 8px;}
.svc-col-h{font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:var(--soft);margin-bottom:20px;}
.svc-list{display:flex;flex-direction:column;gap:22px;}
.service-page .svc-list{gap:18px;}
.service-page .svc-item{display:flex;gap:14px;align-items:flex-start;}
.service-page .svc-item::before{content:"";width:7px;height:7px;border-radius:2px;background:var(--mag);flex:none;margin-top:6px;}
.service-page .svc-item-main{min-width:0;}
.service-page .svc-step-h{font-size:16px;}
.service-page .svc-loop-b{font-size:14.5px;line-height:1.5;}
.svc-item-h{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;margin-bottom:3px;letter-spacing:-0.01em;}
.svc-item-b{font-size:15px;color:var(--mid);margin:0;line-height:1.55;}
.svc-steps{display:flex;flex-direction:column;gap:18px;}
.svc-step{display:flex;gap:15px;align-items:flex-start;}
.svc-step-n{color:var(--mag);font-size:13px;font-weight:600;padding-top:2px;flex:none;}
.svc-step-h{font-weight:600;font-size:16px;margin-bottom:3px;}
.svc-step-b{font-size:14.5px;color:var(--mid);margin:0;line-height:1.5;}
.svc-outcome{display:flex;gap:16px;align-items:baseline;margin-top:42px;padding:24px 26px;background:var(--card);border:1px solid var(--line);border-radius:16px;}
.svc-outcome-k{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--mag);flex:none;}
.svc-outcome-b{font-family:'Bricolage Grotesque',sans-serif;font-size:19px;font-weight:500;margin:0;letter-spacing:-0.01em;}
.svc-loop{margin-top:42px;}
.svc-loop .svc-col-h{margin-bottom:18px;}
.svc-loop-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--card);}
.svc-loop-step{padding:20px;border-right:1px solid var(--line);}
.svc-loop-step:last-child{border-right:none;}
.svc-loop-k{display:block;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);margin-bottom:9px;}
.svc-loop-b{font-size:14px;line-height:1.45;color:var(--ink);margin:0;}
@media(max-width:720px){.svc-loop-grid{grid-template-columns:1fr;}.svc-loop-step{border-right:none;border-bottom:1px solid var(--line);}.svc-loop-step:last-child{border-bottom:none;}}
.svc-logos{margin-top:40px;}
.svc-logos-row{display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:16px;}
.brand-logo{display:inline-flex;width:34px;height:34px;flex:none;filter:grayscale(1);opacity:0.72;transition:filter .2s,opacity .2s;}
.brand-logo:hover{filter:none;opacity:1;}
.brand-logo svg{width:100%;height:100%;display:block;}
/* loop CTA band */
.loop-cta-band{text-align:center;}
.loop-cta-inner{display:flex;flex-direction:column;align-items:center;}
.loop-cta-inner .loopmark{width:58px;height:58px;margin-bottom:10px;}
.loop-cta-k{margin-bottom:10px;}
.loop-cta-h{max-width:20ch;}
.loop-cta-body{max-width:52ch;margin:0 auto;}
.loop-cta-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:28px;}

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
.work-thumb{height:160px;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#171717,#3A3A3A);}
.work-shot{width:100%;height:100%;object-fit:cover;object-position:center;display:block;}
.work-card:nth-child(2) .work-thumb{background:linear-gradient(135deg,#171717,#E7255A);}
.work-card:nth-child(3) .work-thumb{background:linear-gradient(135deg,#2A2A2A,#171717);}
.work-card:nth-child(4) .work-thumb{background:linear-gradient(135deg,#3A3A3A,#171717);}
.work-cta{display:inline-block;margin-top:16px;font-size:13.5px;font-weight:600;color:var(--ink);}
.work-card:hover .work-cta{color:var(--mag);}

/* quotes */
.quote-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.byline{display:flex;align-items:center;justify-content:space-between;gap:14px 24px;flex-wrap:wrap;padding:16px 22px;border:1px solid var(--line);border-radius:16px;background:var(--card);margin-bottom:40px;}
.byline-lock{display:inline-flex;align-items:center;gap:10px;text-decoration:none;}
.byline-mark{width:26px;height:26px;flex:none;}
.byline-txt{font-size:15px;color:var(--ink);font-weight:600;line-height:1.3;}
.byline-txt strong{font-weight:700;}
.byline-by-t{color:var(--soft);font-weight:500;}
.byline-lock:hover .byline-by-t{color:var(--mag);}
.byline-arrow{color:var(--mag);font-weight:700;}
.byline-rating{display:inline-flex;align-items:center;gap:9px;}
.byline-stars{color:var(--mag);font-size:14px;letter-spacing:1.5px;}
.byline-rate{font-size:13px;color:var(--mid);white-space:nowrap;}
.byline-rate strong{color:var(--ink);font-weight:700;}
.wacc{display:flex;flex-direction:column;gap:12px;}
.wacc-item{border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden;transition:border-color .18s,box-shadow .18s;}
.wacc-item.open{border-color:transparent;background:linear-gradient(var(--card),var(--card)) padding-box, var(--gloss) border-box;box-shadow:0 16px 36px -22px rgba(231,37,90,0.45);}
.wacc-head{display:flex;align-items:center;gap:14px;width:100%;background:none;border:none;padding:19px 22px;cursor:pointer;font:inherit;text-align:left;}
.wacc-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:19px;color:var(--ink);flex:1;min-width:0;}
.wacc-client{font-size:11.5px;color:var(--soft);white-space:nowrap;}
.wacc-arrow{color:var(--mag);font-size:17px;flex:none;transition:transform .2s;}
.wacc-item.open .wacc-arrow{transform:rotate(90deg);}
.wacc-body{padding:2px 22px 22px;animation:fnlFade .3s ease;}
.wacc-shot{border-radius:12px;overflow:hidden;border:1px solid var(--line);aspect-ratio:16 / 10;background:var(--mist);margin-bottom:16px;}
.wacc-shot img{width:100%;height:100%;object-fit:cover;display:block;}
.wacc-desc{color:var(--mid);font-size:14.5px;line-height:1.6;display:flex;flex-direction:column;gap:12px;}
.wacc-lead{color:var(--ink);font-size:15px;line-height:1.55;font-weight:500;margin:0 0 16px;}
.wacc-dl{display:flex;flex-direction:column;gap:12px;margin:0;}
.wacc-drow{display:grid;grid-template-columns:82px minmax(0,1fr);gap:14px;align-items:baseline;}
.wacc-drow dt{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--mag);font-weight:600;padding-top:2px;}
.wacc-drow dd{margin:0;color:var(--mid);font-size:14px;line-height:1.55;}
@media (max-width:560px){.wacc-drow{grid-template-columns:1fr;gap:3px;}}
.wacc-visit{display:inline-block;margin-top:16px;color:var(--mag);font-weight:600;font-size:14px;text-decoration:none;}
.wacc-visit:hover{text-decoration:underline;text-underline-offset:3px;}
.quote-card{background:var(--card);border:1px solid var(--line);border-radius:18px;transition:transform .2s,box-shadow .2s;}
.quote-card:hover{transform:translateY(-4px);box-shadow:0 30px 50px -28px rgba(23,23,23,0.16);}
.quote-link{display:flex;flex-direction:column;height:100%;padding:26px;}
.quote-text{font-size:16px;color:var(--ink);margin:0 0 22px;line-height:1.55;}
.quote-by{display:flex;align-items:center;gap:12px;margin-top:auto;}
.quote-avatar{width:42px;height:42px;flex:none;aspect-ratio:1;border-radius:50%;display:grid;place-items:center;color:var(--paper);font-weight:700;background:var(--ink);font-family:'Bricolage Grotesque',sans-serif;overflow:hidden;}
.quote-avatar.lg{width:54px;height:54px;}
.quote-avatar.has-logo{background:#fff;border:1px solid var(--line);padding:0;}
.quote-avatar.has-logo img{width:100%;height:100%;object-fit:contain;padding:8px;box-sizing:border-box;display:block;}
.byline-logo{width:30px;height:30px;flex:none;margin-right:8px;vertical-align:-8px;}
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
.post-thumb{height:150px;border-radius:14px 14px 0 0;overflow:hidden;background:var(--card);}
.art{width:100%;height:100%;}
.art svg{display:block;width:100%;height:100%;}
.art-photo{background-size:cover;background-position:center;}
.art-bg{fill:var(--card);}
.art-line{stroke:var(--line);stroke-width:1.5;}
.art-line-f{fill:var(--line);}
.art-stroke{stroke:var(--soft);}
.art-stroke-f{fill:var(--soft);}
.art-stroke-o{stroke:var(--soft);}
.art-dot{fill:var(--soft);}
.art-acc{stroke:var(--mag);}
.art-acc-f{fill:var(--mag);}
.art-acc-r{stroke:var(--mag);stroke-width:1.5;opacity:.55;}
.post-meta{font-size:11.5px;color:var(--mag);letter-spacing:0.06em;text-transform:uppercase;margin:18px 24px 10px;}
.post-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:18px;margin:0 24px 10px;letter-spacing:-0.01em;}
.post-body{font-size:14px;color:var(--mid);margin:0 24px 14px;}
.post .service-link{margin:0 24px;}
.cta-band{background:var(--ink);color:var(--paper);padding:104px 0;position:relative;}
.cta-chip{position:absolute;top:0;left:50%;transform:translate(-50%,-50%);z-index:2;font-size:12px;font-weight:600;letter-spacing:0.02em;color:var(--ink);padding:9px 20px;border-radius:999px;border:1px solid transparent;background:linear-gradient(#fff,#fff) padding-box, var(--gloss) border-box;box-shadow:0 6px 22px -8px rgba(231,37,90,0.45);white-space:nowrap;}
.cta-inner{text-align:center;}
.callback{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 10px;}
.callback-input{flex:1;min-width:0;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:11px 14px;color:var(--ink);font:inherit;font-size:14px;transition:border-color .15s;}
.callback-input::placeholder{color:var(--soft);}
.callback-input:focus{outline:none;border-color:var(--mag);}
.callback-btn{white-space:nowrap;color:var(--ink);border:1px solid transparent;background:linear-gradient(var(--card),var(--card)) padding-box, var(--gloss) border-box;}
.callback-btn:hover{box-shadow:0 6px 16px -8px rgba(231,37,90,0.5);}
.cta-h{font-size:clamp(36px,6vw,64px);margin:0 auto 14px;}
.cta-sub{font-size:18px;color:#B5B2A8;max-width:42ch;margin:0 auto 30px;}
.cta-band .hero-actions{justify-content:center;}
.cta-band .loop-cta{color:var(--paper);}
.cta-band .loop-cta:hover{color:var(--mag);}
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
.detail-hero{height:300px;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,#171717,#E7255A);margin:0 0 36px;}
.detail-metrics{display:flex;gap:40px;flex-wrap:wrap;padding:24px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:36px;}
.dm-v{font-size:30px;color:var(--ink);}
.dm-l{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--soft);margin-top:4px;}
.detail-body{max-width:64ch;}
.detail-body p{font-size:16.5px;color:#33312C;margin:0 0 20px;}
.article-hero{margin:26px 0 10px;border:1px solid var(--line);border-radius:18px;overflow:hidden;aspect-ratio:16 / 7;background:var(--card);}
.article-body{max-width:68ch;}
.article-h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:24px;letter-spacing:-0.01em;line-height:1.18;margin:40px 0 12px;}
.article-quote{margin:30px 0;padding:4px 0 4px 22px;border-left:3px solid var(--mag);font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:21px;line-height:1.42;color:var(--ink);}
.article-list{margin:18px 0 22px;padding:0;list-style:none;display:grid;gap:11px;}
.article-list li{position:relative;padding-left:24px;font-size:16.5px;color:#33312C;}
.article-list li::before{content:"";position:absolute;left:3px;top:9px;width:8px;height:8px;border-radius:2px;background:var(--mag);}
.article-fig{margin:32px 0;}
.article-fig .art{border:1px solid var(--line);border-radius:16px;overflow:hidden;aspect-ratio:16 / 8;background:var(--card);}
.article-fig figcaption{margin-top:11px;font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.02em;color:var(--soft);text-align:center;}
.detail-by{display:flex;align-items:center;gap:14px;}
.cms{padding:36px 0 96px;min-height:80vh;}
.cms-shell{display:grid;grid-template-columns:248px 1fr;gap:28px;align-items:start;}
.cms-side{position:sticky;top:24px;display:flex;flex-direction:column;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;}
.cms-side-back{font-size:13px;color:var(--soft);font-weight:600;}
.cms-side-back:hover{color:var(--ink);}
.cms-side-brand{display:flex;align-items:center;gap:9px;padding-bottom:14px;border-bottom:1px solid var(--line);}
.cms-side-brand .brand{font-size:20px;}
.cms-side-tag{font-size:9.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--soft);border:1px solid var(--line);border-radius:6px;padding:3px 6px;}
.cms-side-label{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--soft);padding:0 4px;}
.cms-collections{display:flex;flex-direction:column;gap:3px;}
.cms-coll{display:flex;align-items:center;justify-content:space-between;gap:8px;background:none;border:none;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;font-weight:600;color:var(--mid);cursor:pointer;text-align:left;transition:background .14s,color .14s;}
.cms-coll:hover{background:var(--mist);color:var(--ink);}
.cms-coll.on{background:var(--ink);color:var(--paper);}
.cms-coll-count{font-family:'IBM Plex Mono',monospace;font-size:11px;opacity:.7;}
.cms-coll.on .cms-coll-count{opacity:.85;}
.cms-side-foot{margin-top:6px;padding-top:14px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:10px;align-items:flex-start;}
.cms-status{display:inline-flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:var(--mid);}
.cms-dot{width:8px;height:8px;border-radius:50%;background:var(--soft);}
.cms-status-supabase .cms-dot{background:#1FAE5A;}
.cms-status-loading .cms-dot{background:#E0A93B;animation:pulse 1s ease-in-out infinite;}
.cms-status-local .cms-dot{background:var(--mag);}
@keyframes pulse{0%,100%{opacity:.4;}50%{opacity:1;}}
.cms-reset{background:none;border:none;font:inherit;font-size:12.5px;font-weight:600;color:var(--soft);cursor:pointer;padding:0;}
.cms-reset:hover{color:var(--mag);}
.cms-main{min-width:0;}
.cms-main-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:20px;}
.cms-h1{font-size:34px;margin:0 0 4px;}
.cms-desc{color:var(--mid);font-size:14.5px;margin:0;}
.cms-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:16px;}
.cms-search{display:flex;align-items:center;gap:9px;flex:1;max-width:360px;background:var(--card);border:1px solid var(--line);border-radius:11px;padding:0 13px;color:var(--soft);}
.cms-search:focus-within{border-color:var(--ink);color:var(--ink);}
.cms-search input{flex:1;border:none;background:none;outline:none;font:inherit;font-size:14px;color:var(--ink);padding:11px 0;}
.cms-count-meta{font-size:12px;color:var(--soft);white-space:nowrap;}
.cms-list{display:flex;flex-direction:column;gap:8px;}
.cms-row{display:flex;justify-content:space-between;align-items:center;gap:16px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:15px 18px;transition:border-color .14s;}
.cms-row:hover{border-color:var(--soft);}
.cms-row-t{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;}
.cms-row-s{font-size:11px;color:var(--soft);margin-top:3px;}
.cms-row-actions{display:flex;gap:14px;flex-shrink:0;}
.cms-link{background:none;border:none;font:inherit;font-size:13.5px;font-weight:600;color:var(--mid);cursor:pointer;padding:0;}
.cms-link:hover{color:var(--ink);}
.cms-link.danger:hover{color:var(--mag);}
.cms-empty{padding:48px;text-align:center;color:var(--soft);border:1px dashed var(--line);border-radius:14px;}
.editor{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;}
.editor-head{display:flex;align-items:center;gap:14px;padding:20px 24px;border-bottom:1px solid var(--line);}
.editor-back{width:34px;height:34px;border:1px solid var(--line);border-radius:9px;background:var(--paper);font-size:16px;color:var(--mid);cursor:pointer;flex:none;}
.editor-back:hover{border-color:var(--ink);color:var(--ink);}
.editor-eyebrow{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--mag);}
.editor-title{font-size:22px;margin:2px 0 0;}
.editor-body{padding:8px 24px 20px;display:flex;flex-direction:column;}
.field-group{padding:20px 0;border-bottom:1px solid var(--line);}
.field-group:last-child{border-bottom:none;}
.field-group-h{font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--soft);margin-bottom:14px;}
.field-grid{display:grid;gap:16px;}
.field-grid.two{grid-template-columns:1fr 1fr;}
.field{display:flex;flex-direction:column;gap:6px;}
.field-l{font-size:12px;font-weight:600;letter-spacing:0.03em;text-transform:uppercase;color:var(--mid);display:flex;flex-direction:column;gap:3px;}
.field-hint{font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:400;letter-spacing:0;text-transform:none;color:var(--soft);}
.field-i{font:inherit;font-size:15px;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:11px 13px;resize:vertical;width:100%;}
.field-i:focus{outline:none;border-color:var(--ink);}
.field-mono{font-family:'IBM Plex Mono',monospace;font-size:13.5px;}
.cover-preview{border:1px solid var(--line);border-radius:12px;overflow:hidden;aspect-ratio:16 / 7;background:var(--paper);}
.editor-bar{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;background:var(--card);border-top:1px solid var(--line);}
.pricing{padding:64px 0 96px;}
.loop-foot{margin-top:30px;text-align:center;}
.loop-ring-wrap{display:flex;flex-direction:column;align-items:center;}
.loop-ring-stage{position:relative;width:min(500px,calc(100vw - 60px));margin:48px auto 8px;aspect-ratio:1;perspective:1200px;}
.loop-ring-tilt{position:absolute;inset:70px;transform-origin:center center;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.2,.7,.2,1),opacity .7s;will-change:transform;}
.loop-ring-stage.open .loop-ring-tilt.tilted{transform:rotateX(34deg) scale(.97);opacity:.9;}
.loop-ring-svg{width:100%;height:100%;display:block;overflow:visible;transition:opacity .35s;}
.loop-ring-spin{width:100%;height:100%;transform-origin:50% 50%;transform-style:preserve-3d;}
.loop-ring-spin{position:absolute;inset:0;transform-origin:50% 50%;transform-style:preserve-3d;}
.loop-ring-svg.dim{opacity:0.12;}
.loop-ring-spin{animation:lrBreathe 6.5s ease-in-out infinite;}
@keyframes lrBreathe{0%,100%{transform:scale(1);}50%{transform:scale(1.03);}}
@media (prefers-reduced-motion: reduce){.loop-ring-spin{animation:none;}}
.loop-ring-gyro{position:absolute;inset:0;transform-style:preserve-3d;opacity:0;pointer-events:none;transition:opacity .35s;}
.loop-ring-gyro.on{opacity:1;}
.gyro-ring{position:absolute;inset:0;transform-style:preserve-3d;transform-origin:50% 50%;}
.gyro-ring svg{width:100%;height:100%;display:block;overflow:visible;}
.loop-ring-gyro.on .gyro-a{animation:gyroA 1.6s ease-in-out;}
.loop-ring-gyro.on .gyro-b{animation:gyroB 1.6s ease-in-out;}
@keyframes gyroA{from{transform:rotateY(0deg);}to{transform:rotateY(180deg);}}
@keyframes gyroB{from{transform:rotateX(0deg);}to{transform:rotateX(-180deg);}}
.loop-ring-core{position:absolute;inset:70px;display:flex;align-items:center;justify-content:center;text-align:center;padding:13%;pointer-events:none;z-index:3;}
.loop-core-default,.loop-core-content{display:flex;flex-direction:column;gap:9px;align-items:center;}
.loop-core-content{animation:coreIn .5s ease both;}
@keyframes coreIn{from{opacity:0;transform:translateY(8px) scale(.96);}to{opacity:1;transform:none;}}
.loop-core-k{font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;color:var(--mag);font-weight:700;}
.loop-core-b{font-size:13px;line-height:1.42;color:var(--paper);margin:0;max-width:22ch;font-weight:500;}
.loop-core-mark{font-size:9.5px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(243,241,235,0.5);}
.loop-core-hint{font-family:'Bricolage Grotesque',sans-serif;font-size:15px;font-weight:600;color:rgba(243,241,235,0.9);}
.loop-step-label{position:absolute;display:flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;font:inherit;font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:0.11em;text-transform:uppercase;color:rgba(243,241,235,0.6);white-space:nowrap;padding:6px;transition:color .15s;text-shadow:0 1px 8px rgba(0,0,0,0.45);z-index:4;}
.loop-step-label:hover,.loop-step-label:focus-visible{color:var(--paper);outline:none;}
.loop-step-label.on{color:#fff;}
.loop-step-dot{width:7px;height:7px;border-radius:50%;background:rgba(243,241,235,0.38);transition:background .15s,box-shadow .15s;flex:none;}
.loop-step-label:hover .loop-step-dot{background:var(--paper);}
.loop-step-label.on .loop-step-dot{background:var(--mag);box-shadow:0 0 0 4px rgba(231,37,90,0.25);}
.lbl-top{top:-2px;left:50%;transform:translate(-50%,0);flex-direction:column;}
.lbl-bottom{bottom:-2px;left:50%;transform:translate(-50%,0);flex-direction:column-reverse;}
.lbl-left{left:-2px;top:50%;transform:translate(0,-50%);}
.lbl-right{right:-2px;top:50%;transform:translate(0,-50%);flex-direction:row-reverse;}
.loop-price-link{color:var(--paper);font-weight:600;font-size:15px;border-bottom:1px solid rgba(243,241,235,0.32);padding-bottom:2px;transition:border-color .15s,color .15s;}
.loop-price-link:hover{border-color:var(--mag);color:#fff;}
.loop-fold{margin-top:34px;text-align:center;}
.price-fold-trigger{display:inline-flex;align-items:center;gap:13px;background:none;border:none;cursor:pointer;font:inherit;padding:4px;}
.price-fold-trigger .loopmark{width:46px;height:46px;}
.price-fold-t{display:inline-flex;align-items:center;gap:9px;color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:clamp(19px,2.6vw,26px);letter-spacing:-0.01em;}
.price-fold-arrow{color:var(--mag);display:inline-block;transition:transform .32s cubic-bezier(.2,.7,.2,1);}
.price-fold-trigger:hover .price-fold-arrow{transform:translate(2px,2px);}
.price-fold-trigger.open .price-fold-arrow{transform:rotate(90deg);}
.price-fold-sub{max-width:430px;margin:12px auto 0;font-size:14px;line-height:1.55;}
.price-fold-panel{margin-top:28px;animation:foldIn .4s ease both;}
@keyframes foldIn{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:none;}}
.cfg{display:grid;grid-template-columns:1fr 340px;gap:28px;align-items:start;margin:30px 0 56px;}
.cfg-form{display:flex;flex-direction:column;gap:26px;}
.cfg-block{display:flex;flex-direction:column;gap:12px;}
.cfg-label{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--soft);}
.cfg-sub{font-size:12px;color:var(--soft);margin-top:6px;}
.seg{display:inline-flex;gap:6px;flex-wrap:wrap;background:var(--mist);border:1px solid var(--line);border-radius:12px;padding:5px;align-self:flex-start;}
.seg-btn{background:none;border:none;border-radius:9px;padding:9px 15px;font:inherit;font-size:14px;font-weight:600;color:var(--mid);cursor:pointer;transition:background .14s,color .14s;}
.seg-btn:hover{color:var(--ink);}
.seg-btn.on{background:var(--ink);color:var(--paper);}
.cfg-toggles{display:flex;flex-direction:column;gap:8px;}
.toggle{display:flex;align-items:center;gap:13px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:13px 15px;font:inherit;cursor:pointer;text-align:left;transition:border-color .14s;}
.toggle:hover{border-color:var(--soft);}
.toggle.on{border-color:transparent;background:linear-gradient(var(--card),var(--card)) padding-box, var(--gloss) border-box;box-shadow:0 6px 18px -12px rgba(231,37,90,0.5);}
.switch{width:38px;height:22px;flex:none;border-radius:999px;background:var(--mist);border:1px solid var(--line);position:relative;transition:background .18s,border-color .18s;}
.switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--paper);box-shadow:0 1px 2px rgba(23,23,23,0.25);transition:transform .18s;}
.toggle.on .switch{background:var(--mag);border-color:var(--mag);}
.toggle.on .switch-knob{transform:translateX(16px);background:#fff;}
.toggle-sm{padding:9px 12px;gap:11px;border-radius:11px;}
.toggle-sm .switch{width:32px;height:19px;}
.toggle-sm .switch-knob{width:13px;height:13px;}
.toggle-sm.on .switch-knob{transform:translateX(13px);}
.tgt{width:19px;height:19px;flex:none;border-radius:50%;border:1.5px solid rgba(231,37,90,0.35);position:relative;transition:border-color .15s;}
.toggle.on .tgt{border-color:var(--mag);animation:tgtPulse .45s ease-out;}
.tgt-dot{position:absolute;inset:3.5px;border-radius:50%;background:var(--mag);transform:scale(0);transition:transform .2s cubic-bezier(.34,1.56,.64,1);}
.toggle.on .tgt-dot{transform:scale(1);}
.toggle:active .tgt{transform:scale(0.9);}
@keyframes tgtPulse{0%{box-shadow:0 0 0 0 rgba(231,37,90,0.45);}100%{box-shadow:0 0 0 8px rgba(231,37,90,0);}}
.toggle-sm .tgt{width:16px;height:16px;}
.toggle-sm .tgt-dot{inset:3px;}
.toggle-sm .toggle-t{font-size:13.5px;font-weight:500;}
.scope-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.scope-card{position:relative;display:flex;flex-direction:column;gap:5px;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:15px;font:inherit;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .15s;}
.scope-card:hover{border-color:var(--soft);}
.scope-card.on{border-color:transparent;background:linear-gradient(var(--card),var(--card)) padding-box, var(--gloss) border-box;box-shadow:0 10px 26px -14px rgba(231,37,90,0.45);}
.scope-card-t{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;}
.scope-card-d{font-size:12px;color:var(--soft);line-height:1.45;}
.scope-card-p{font-size:12px;color:var(--mag);margin-top:2px;}
.scope-badge{position:absolute;top:-9px;right:12px;background:var(--mag);color:#fff;font-size:9px;letter-spacing:0.08em;text-transform:uppercase;padding:3px 8px;border-radius:999px;}
.type-cards{grid-template-columns:repeat(2,1fr);}
.scope-check{position:absolute;top:12px;right:12px;width:20px;height:20px;border-radius:6px;border:1.5px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;background:var(--paper);transition:background .14s,border-color .14s;}
.scope-card.on .scope-check{background:var(--mag);border-color:var(--mag);}
.cfg-sub-row{display:flex;align-items:center;gap:12px;margin-top:4px;}
.cfg-save{margin-top:6px;font-size:12px;color:#1FAE5A;}
.cfg-incl{margin-top:10px;padding-top:10px;border-top:1px solid var(--line);font-size:11.5px;color:var(--soft);line-height:1.55;}
.band-calc{background:var(--mist);}
.calc{max-width:720px;margin:34px auto 0;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:0 30px 60px -52px rgba(23,23,23,0.55);}
.calc-steps{display:flex;gap:2px;padding:13px 14px;border-bottom:1px solid var(--line);overflow-x:auto;}
.calc-dot{display:flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;font:inherit;color:var(--soft);padding:6px 9px;border-radius:9px;white-space:nowrap;transition:color .15s;}
.calc-dot:hover{color:var(--ink);}
.calc-dot-n{width:22px;height:22px;flex:none;border-radius:50%;border:1.5px solid var(--line);display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:11px;transition:background .15s,border-color .15s,color .15s;}
.calc-dot-l{font-size:13px;font-weight:600;}
.calc-dot.on{color:var(--ink);}
.calc-dot.on .calc-dot-n{border-color:var(--mag);background:var(--mag);color:#fff;}
.calc-dot.done .calc-dot-n{border-color:var(--ink);background:var(--ink);color:var(--paper);}
.calc{scroll-margin-top:74px;}
.calc-slide{padding:26px;min-height:286px;animation:slideIn .34s ease both;}
@keyframes slideIn{from{opacity:0;transform:translateX(12px);}to{opacity:1;transform:none;}}
.calc-slide-head{margin-bottom:20px;}
.calc-slide-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:19px;color:var(--ink);letter-spacing:-0.01em;margin-bottom:5px;}
.calc-slide-help{font-size:12.5px;letter-spacing:0.02em;color:var(--soft);line-height:1.5;}
.calc-panel{display:flex;flex-direction:column;gap:14px;}
.calc-seg{align-self:flex-start;}
.calc-note{font-size:11.5px;color:var(--soft);margin:2px 0 0;line-height:1.5;}
.calc-result{align-items:center;}
.calc-result .cfg-out-card{width:100%;max-width:430px;}
.calc-nav{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-top:1px solid var(--line);background:var(--paper);}
.calc-running{font-size:12.5px;color:var(--mid);text-align:center;flex:1;}
.calc-nav .btn[disabled]{opacity:0.4;cursor:default;pointer-events:none;}
.calc-details{gap:22px;}
.detail-block{display:flex;flex-direction:column;gap:12px;border-top:1px solid var(--line);padding-top:18px;}
.calc-details .detail-block:first-child{border-top:none;padding-top:0;}
.detail-block-q{font-size:15px;font-weight:600;color:var(--ink);}
.chips{display:flex;flex-wrap:wrap;gap:8px;}
.chip{display:inline-flex;align-items:center;gap:2px;background:var(--paper);border:1px solid var(--line);border-radius:999px;padding:8px 14px;font:inherit;font-size:13px;font-weight:600;color:var(--ink);cursor:pointer;transition:background .14s,border-color .14s,color .14s;}
.chip:hover{border-color:var(--soft);}
.chip.on{background:var(--mag);border-color:var(--mag);color:#fff;}
.chip-p{font-family:'IBM Plex Mono',monospace;font-size:10.5px;font-weight:500;opacity:0.7;}
.calc .svc-list{display:flex;flex-direction:column;}
.svc-list-head{display:flex;justify-content:space-between;font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);padding:0 2px 10px;}
.calc .svc-item{border-top:1px solid var(--line);}
.calc .svc-item:last-child{border-bottom:1px solid var(--line);}
.svc-row{display:flex;align-items:center;gap:12px;width:100%;background:none;border:none;padding:14px 2px;font:inherit;cursor:pointer;text-align:left;color:var(--ink);}
.svc-row-x{display:inline-flex;width:20px;height:20px;flex:none;align-items:center;justify-content:center;font-weight:700;font-size:15px;line-height:1;color:var(--soft);border:1px solid var(--line);border-radius:6px;transition:background .14s,border-color .14s,color .14s;}
.svc-row.on .svc-row-x{background:var(--mag);border-color:var(--mag);color:#fff;}
.svc-row-n{flex:1;font-weight:600;font-size:15px;transition:color .14s;}
.svc-row.on .svc-row-n{color:var(--mag);}
.svc-row-p{font-size:12.5px;color:var(--mid);font-weight:500;white-space:nowrap;}
.svc-row.on .svc-row-p{color:var(--ink);}
.svc-item .sub-chips{display:flex;flex-wrap:wrap;gap:7px;}
.cat-refine{display:flex;flex-direction:column;gap:13px;padding:2px 0 18px 0;}
.cat-explain{font-size:12.5px;color:var(--soft);line-height:1.5;margin:0;text-align:left;padding:0;}
.toggle-sm .toggle-p{font-size:12px;}
.refine-group{display:flex;flex-direction:column;gap:8px;}
.opt-group{margin-top:6px;}
.refine-h{font-size:10px;letter-spacing:0.11em;text-transform:uppercase;color:var(--soft);}
.chip-sub{font-size:12.5px;padding:6px 12px;}
.chip-sub.on{background:var(--ink);border-color:var(--ink);color:#fff;}
.invoice{display:flex;flex-direction:column;margin:4px 0 20px;}
.invoice-row{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:11px 0;border-bottom:1px solid var(--line);}
.invoice-row:first-child{border-top:1px solid var(--line);}
.invoice-l{font-weight:600;font-size:14.5px;color:var(--ink);}
.invoice-p{font-size:13px;color:var(--mid);white-space:nowrap;}
.cfg-total{margin-top:4px;}
.receipt-items{display:flex;flex-direction:column;margin:2px 0 4px;}
.rcp{display:flex;flex-direction:column;margin:2px 0 6px;text-align:left;}
.rcp-head{display:grid;grid-template-columns:minmax(0,1fr) 78px 78px;gap:8px;font-size:10px;letter-spacing:0.07em;text-transform:uppercase;color:var(--soft);padding-bottom:9px;border-bottom:1px solid var(--line);}
.rcp-head span+span{text-align:right;}
.rcp-row{display:grid;grid-template-columns:minmax(0,1fr) 78px 78px;gap:8px;align-items:baseline;padding:11px 0;width:100%;text-align:left;background:none;border:none;font:inherit;}
.rcp-line+.rcp-line{border-top:1px dashed var(--line);}
.rcp-row-btn{cursor:pointer;}
.rcp-l{color:var(--ink);font-weight:500;font-size:14px;line-height:1.35;display:flex;align-items:baseline;gap:7px;text-align:left;overflow-wrap:break-word;word-break:normal;hyphens:none;}
.rcp-v{font-size:13px;color:var(--mid);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;}
.rcp-caret{color:var(--mag);font-size:13px;line-height:1;transition:transform .18s;display:inline-block;}
.rcp-caret.on{transform:rotate(90deg);}
.rcp-srow{padding:6px 0;}
.rcp-srow:first-of-type{padding-top:2px;}
.rcp-srow .rcp-l{font-weight:400;font-size:12.5px;color:var(--mid);padding-left:19px;}
.rcp-srow .rcp-v{font-size:12px;color:var(--soft);}
.rcp-free{font-style:italic;color:var(--soft);}
.rcp-tot{border-top:1px solid var(--line);margin-top:3px;padding-top:13px;}
.rcp-tot .rcp-l{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--soft);font-weight:700;}
.rcp-tot .rcp-v{color:var(--ink);font-weight:700;font-size:14px;}
.receipt-row{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:10px 0;}
.receipt-items .receipt-line+.receipt-line{border-top:1px dashed var(--line);}
.receipt-break{display:flex;flex-direction:column;gap:5px;margin:0 0 8px 12px;padding-left:12px;border-left:1px solid var(--line);}
.receipt-brow{display:flex;justify-content:space-between;gap:12px;align-items:baseline;}
.receipt-bl{font-size:12px;color:var(--mid);}
.receipt-bp{font-size:11.5px;color:var(--soft);white-space:nowrap;font-variant-numeric:tabular-nums;}
.receipt-free{color:var(--soft);font-style:italic;}
.receipt-l{display:flex;flex-direction:column;color:var(--ink);font-weight:500;font-size:14px;line-height:1.35;}
.receipt-d{font-size:11.5px;color:var(--soft);font-weight:400;margin-top:3px;line-height:1.4;}
.receipt-p{color:var(--mid);white-space:nowrap;font-size:13px;font-variant-numeric:tabular-nums;}
.receipt-tot{margin-top:8px;border-top:1.5px solid var(--ink);padding-top:6px;}
.receipt-total{padding:8px 0;}
.receipt-total .receipt-l{font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:var(--soft);}
.receipt-total .receipt-p{font-size:19px;font-weight:800;color:var(--ink);}
.advice-toggle{margin-top:2px;}
.detail-field{display:flex;flex-direction:column;gap:6px;}
.detail-field-l{font-size:11px;letter-spacing:0.04em;color:var(--soft);}
.detail-textarea{width:100%;background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:11px 13px;font:inherit;font-size:14px;color:var(--ink);resize:vertical;min-height:70px;}
.detail-textarea:focus{outline:none;border-color:var(--mag);}
.detail-textarea::placeholder{color:var(--soft);}
.waived{text-decoration:line-through;opacity:0.45;}
.waived-note{color:#1FAE5A;font-size:11px;}
.loop-lens{display:flex;justify-content:center;flex-wrap:wrap;gap:32px;margin:38px auto 36px;}
.loop-lens-btn{display:flex;flex-direction:column;align-items:center;gap:8px;background:none;border:none;padding:6px 4px;color:rgba(255,255,255,0.58);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:color .15s;}
.loop-lens-btn:hover{color:rgba(255,255,255,0.9);}
.loop-lens-btn.on{color:#fff;}
.loop-lens-ic{display:flex;color:inherit;}
.loop-lens-ic svg{width:26px;height:26px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;}
.loop-lens-btn.on .loop-lens-ic{color:var(--mag);}
.loop-lens-l{letter-spacing:0.02em;}
.toggle-main{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0;}
.toggle-t{font-weight:600;font-size:15px;color:var(--ink);}
.toggle-d{font-size:12.5px;color:var(--soft);}
.toggle-p{font-size:13px;color:var(--mid);white-space:nowrap;}
.combo-note{font-size:12px;color:var(--mag);margin-top:2px;}
.cfg-out{position:sticky;top:84px;}
.cfg-out-card{background:linear-gradient(var(--card),var(--card)) padding-box, var(--gloss) border-box;border:1px solid transparent;border-radius:18px;padding:22px;box-shadow:0 14px 34px -18px rgba(231,37,90,0.4);}
.cfg-out-h{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--soft);padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:10px;}
.cfg-amount{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:12px 0;}
.cfg-amount-l{font-size:12px;color:var(--mid);}
.cfg-amount-v{font-size:26px;font-weight:800;letter-spacing:-0.01em;}
.cfg-mo{font-size:14px;font-weight:600;color:var(--soft);margin-left:1px;}
.cfg-empty{padding:16px 0;color:var(--soft);font-size:14px;}
.cfg-cta{width:100%;justify-content:center;margin-top:14px;}
.cfg-excl{font-size:11px;color:var(--soft);line-height:1.55;margin:14px 0 0;}
.ref{margin-top:10px;}
.ref-h{font-size:26px;margin:0;}
.ref-block{margin-top:30px;}
.ref-block-h{margin-bottom:14px;}
.ref-t{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:18px;margin:0;}
.ref-d{font-size:14px;color:var(--mid);margin:4px 0 0;max-width:62ch;}
.ref-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.ref-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;}
.ref-card-t{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;margin-bottom:6px;}
.ref-card-price{font-size:13px;color:var(--mag);margin-bottom:8px;}
.ref-card-d{font-size:13px;color:var(--mid);line-height:1.5;}
.ref-rows{margin-top:10px;display:flex;flex-direction:column;gap:7px;}
.ref-row{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--mid);}
.ref-row span:last-child{color:var(--ink);font-weight:600;}
.ref-excl{font-size:11px;color:var(--soft);margin-top:26px;}
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
  .loop-ring-tilt,.loop-ring-core{inset:54px;}
  .loop-step-label{font-size:9.5px;letter-spacing:0.08em;}
  .loop-core-b{font-size:12px;}
  .loop-core-hint{font-size:13.5px;}
  .loop-svg{max-width:360px;}
  .creds-row{grid-template-columns:repeat(2,1fr);}
  .work-grid,.post-grid{grid-template-columns:1fr;}
  .quote-grid,.contact-grid{grid-template-columns:repeat(2,1fr);}
  .footer-grid{grid-template-columns:1fr 1fr;}
}
@media(max-width:720px){
  .nav-cta{display:none;}
  .band,.cta-band{padding:64px 0;}
  .funnel-stage{width:100%;}
  .funnel-bar{padding:14px 16px;gap:13px;}
  .hero{padding:60px 0 72px;}
  .service-grid,.stats-grid,.aud-grid,.steps-grid,.footer-grid,.quote-grid,.contact-grid,.brandwall,.creds-row{grid-template-columns:1fr;}
  .svc-cols{grid-template-columns:1fr;gap:32px;}
  .svc-outcome{flex-direction:column;gap:8px;}
  .stat{text-align:center;}
  .cms-row{flex-direction:column;align-items:flex-start;}
  .cms-shell{grid-template-columns:1fr;gap:18px;}
  .cms-side{position:static;}
  .cms-collections{flex-direction:row;flex-wrap:wrap;}
  .cms-coll{flex:1 1 auto;}
  .field-grid.two{grid-template-columns:1fr;}
  .cfg{grid-template-columns:1fr;gap:22px;}
  .scope-cards{grid-template-columns:1fr;}
  .calc-dot-l{display:none;}
  .calc-dot-n{width:26px;height:26px;}
  .calc-slide{padding:20px;min-height:250px;}
  .calc-running{display:none;}
  .cfg-out{position:static;}
  .ref-grid{grid-template-columns:1fr;}
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
  .loop-ring-tilt{transition:none;}
  .loop-core-content{animation:none;}
  .calc-slide{animation:none;}
  .price-fold-panel{animation:none;}
}
`;
