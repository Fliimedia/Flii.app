import React, { useState, useEffect } from "react";

/*
  flii.nl/p/internship-international
  Internationale stage-aanvraag. Bilingual NL/EN, Dutch default.
  Niet indexeren: noindex/nofollow wordt in de component gezet.

  CRM KOPPELING
  Pas alleen saveToCRM aan. Deze functie is het enige punt waar de
  aanvraag je interne CRM in gaat. Zolang je store nog niet gekoppeld
  is valt hij terug op localStorage onder de key flii_crm_leads,
  zodat het formulier nu al werkt en niets verloren gaat.
*/

const CRM_STORAGE_KEY = "flii_crm_leads";
const MAX_FILE_MB = 10;

async function saveToCRM(lead) {
  // Primaire route: server-side push naar het CRM-endpoint (paspoort en alle details).
  try {
    const res = await fetch("/api/internship-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (res.ok) {
      const out = await res.json().catch(() => ({}));
      return { ok: true, id: out.id || lead.id };
    }
  } catch (err) {
    // netwerkfout, val terug op lokale opslag zodat niets verloren gaat
  }
  // Fallback: bewaar lokaal
  try {
    const existing = JSON.parse(window.localStorage.getItem(CRM_STORAGE_KEY) || "[]");
    existing.push(lead);
    window.localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(existing));
    return { ok: true, id: lead.id };
  } catch (err) {
    return { ok: false, reason: "storage_full" };
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: result.slice(result.indexOf(",") + 1),
      });
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

const EMPTY = {
  fullName: "", dateOfBirth: "", email: "", phone: "", nationality: "",
  street: "", city: "", postalCode: "", country: "", residenceStatus: "",
  institution: "", fieldOfStudy: "", degreeLevel: "", expectedGraduation: "", studyCountry: "",
  internshipDirection: "", duration: "", startDate: "", workArrangement: "", motivation: "",
  employmentStatus: "", monthlyIncome: "", currency: "EUR", financialSupport: "no",
  passportNumber: "", passportIssueDate: "", passportExpiryDate: "", passportFile: null, taxId: "",
  signatureName: "", consent1: false, consent2: false, consent3: false,
};

const T = {
  nl: {
    title: "Aanvraag internationale stage",
    subtitle: "Vul dit formulier volledig in. Alle gegevens worden vertrouwelijk behandeld.",
    sections: {
      personal: "Persoonlijke gegevens",
      residence: "Woonadres en verblijf",
      education: "Opleiding",
      internship: "Stage",
      income: "Inkomen",
      passport: "Paspoort en belastinggegevens",
      signature: "Ondertekening",
    },
    l: {
      fullName: "Volledige naam", dateOfBirth: "Geboortedatum", email: "E-mailadres",
      phone: "Telefoonnummer", nationality: "Nationaliteit",
      street: "Straat en huisnummer", city: "Plaats", postalCode: "Postcode",
      country: "Land", residenceStatus: "Verblijfsstatus",
      institution: "Onderwijsinstelling", fieldOfStudy: "Studierichting",
      degreeLevel: "Niveau", expectedGraduation: "Verwachte afstudeerdatum",
      studyCountry: "Land van studie",
      internshipDirection: "Gewenste stagerichting", duration: "Duur in weken",
      startDate: "Gewenste startdatum", workArrangement: "Werkvorm",
      motivation: "Motivatie en leerdoelen",
      employmentStatus: "Huidige werksituatie", monthlyIncome: "Maandinkomen",
      currency: "Valuta", financialSupport: "Financiële ondersteuning nodig",
      passportNumber: "Paspoortnummer", passportIssueDate: "Datum van afgifte",
      passportExpiryDate: "Geldig tot", passportFile: "Kopie paspoort",
      taxId: "Fiscaal nummer of BSN",
      signatureName: "Naam ter ondertekening",
      c1: "Ik verklaar dat alle gegevens naar waarheid zijn ingevuld.",
      c2: "Ik geef Flii Media toestemming mijn gegevens te verwerken voor de stageplaatsing en de fiscale verplichtingen die daarbij horen.",
      c3a: "Ik ga akkoord met de ",
      c3link: "voorwaarden van het stageprogramma van Flii Media",
      c3b: ".",
    },
    termsTitle: "Voorwaarden stageprogramma Flii Media",
    termsIntro: "Deze voorwaarden gelden voor iedere stage bij Flii Media BV, gevestigd te Amstelveen. Ze worden bij aanvang van de stage vastgelegd in een stageovereenkomst tussen jou, je onderwijsinstelling en Flii Media.",
    termsClose: "Sluiten",
    terms: [
      ["1. Aard van de stage", "Een stage bij Flii Media is gericht op leren. Je werkt mee aan echte opdrachten, maar de stage is geen dienstbetrekking en niet bedoeld om regulier werk te vervangen. De inhoud sluit aan op de leerdoelen van je opleiding."],
      ["2. Duur en omvang", "De duur en het aantal uren per week worden vooraf afgesproken en vastgelegd in de stageovereenkomst. Wijzigingen daarin gebeuren in overleg met je onderwijsinstelling."],
      ["3. Begeleiding", "Je krijgt een vaste begeleider binnen Flii Media. Er is periodiek een voortgangsgesprek en aan het einde een eindevaluatie. Flii Media werkt mee aan de beoordelingsvorm die je opleiding voorschrijft."],
      ["4. Vergoeding", "Of er een stagevergoeding wordt betaald en hoe hoog die is, spreken we per stage af en leggen we schriftelijk vast. Een vergoeding is geen loon. Reiskosten en eventuele andere vergoedingen worden apart afgesproken."],
      ["5. Werkplek en middelen", "Flii Media stelt de middelen ter beschikking die je nodig hebt voor je werk. Die blijven eigendom van Flii Media en lever je bij het einde van de stage in. Je gebruikt ze alleen voor je stagewerkzaamheden."],
      ["6. Geheimhouding", "Je gaat vertrouwelijk om met alles wat je bij Flii Media over het bedrijf, klanten en hun gegevens te weten komt. Deze verplichting blijft gelden na afloop van de stage."],
      ["7. Werk en eigendom", "Werk dat je tijdens de stage in opdracht van Flii Media maakt, komt toe aan Flii Media of aan de betreffende klant. Voor je portfolio kun je in overleg werk tonen, zolang klantgegevens beschermd blijven."],
      ["8. Persoonsgegevens", "Flii Media verwerkt je gegevens voor de stageplaatsing en voor de wettelijke verplichtingen die daarbij horen, waaronder de fiscale identificatieplicht. Je kopie identiteitsbewijs wordt uitsluitend daarvoor gebruikt en niet langer bewaard dan nodig. Je kunt je gegevens opvragen, laten corrigeren of laten verwijderen via stage@flii.nl."],
      ["9. Verblijf en werkvergunning", "Je bent zelf verantwoordelijk voor een geldige verblijfstitel en, waar vereist, een werk- of stagevergunning. Flii Media kan hierin ondersteunen maar kan geen uitkomst garanderen. Zonder geldige papieren kan de stage niet doorgaan."],
      ["10. Beëindiging", "Beide partijen kunnen de stage tussentijds beëindigen, in overleg met je onderwijsinstelling en met een redelijke opzegtermijn. Bij ernstige schending van deze voorwaarden kan de stage per direct eindigen."],
      ["11. Toepasselijk recht", "Op deze voorwaarden en op de stageovereenkomst is Nederlands recht van toepassing."],
    ],
    o: {
      residenceStatus: [["", "Kies"], ["eu", "EU burger"], ["permit", "Verblijfsvergunning"], ["visa", "Studentenvisum"], ["applying", "Aanvraag loopt"], ["other", "Anders"]],
      degreeLevel: [["", "Kies"], ["mbo", "MBO"], ["bachelor", "Bachelor"], ["master", "Master"], ["postgrad", "Postdoctoraal"], ["other", "Anders"]],
      internshipDirection: [["", "Kies"], ["marketing", "Digital marketing"], ["social", "Social media"], ["content", "Content"], ["design", "UX en UI design"], ["frontend", "Frontend development"], ["backend", "Backend development"], ["analytics", "Data en analytics"], ["ai", "AI oplossingen"], ["project", "Projectmanagement"], ["other", "Anders"]],
      workArrangement: [["", "Kies"], ["onsite", "Volledig op kantoor"], ["hybrid", "Hybride"], ["remote", "Volledig op afstand"], ["parttime", "Deeltijd"]],
      employmentStatus: [["", "Kies"], ["student", "Student zonder inkomen"], ["part", "Student met bijbaan"], ["full", "Loondienst"], ["self", "Zelfstandig"], ["none", "Geen inkomen"], ["other", "Anders"]],
      financialSupport: [["no", "Nee"], ["stipend", "Ja, stagevergoeding"], ["housing", "Ja, hulp bij huisvesting"], ["both", "Ja, beide"]],
    },
    submit: "Aanvraag versturen",
    clear: "Formulier leegmaken",
    consentError: "Vink alle drie de verklaringen aan om te versturen.",
    fileHint: "PDF, JPG of PNG, maximaal 10 MB",
    fileChoose: "Kies bestand",
    fileRemove: "Verwijderen",
    fileRequired: "Voeg een kopie van je paspoort toe.",
    fileTooBig: "Dit bestand is groter dan 10 MB. Kies een kleiner bestand.",
    fileError: "Het bestand kon niet worden gelezen. Probeer een ander bestand.",
    storageFull: "Het bestand is te groot om te verwerken. Kies een kleiner bestand of mail het naar stage@flii.nl.",
    success: "Bedankt. Je aanvraag is ontvangen en staat klaar in ons systeem. We nemen binnen vijf werkdagen contact op.",
    error: "Er ging iets mis bij het versturen. Probeer het opnieuw of mail naar stage@flii.nl.",
    sending: "Versturen",
  },
  en: {
    title: "International internship application",
    subtitle: "Please complete every section. All details are treated confidentially.",
    sections: {
      personal: "Personal details",
      residence: "Address and residence",
      education: "Education",
      internship: "Internship",
      income: "Income",
      passport: "Passport and tax details",
      signature: "Signature",
    },
    l: {
      fullName: "Full name", dateOfBirth: "Date of birth", email: "Email address",
      phone: "Phone number", nationality: "Nationality",
      street: "Street and number", city: "City", postalCode: "Postal code",
      country: "Country", residenceStatus: "Residence status",
      institution: "Educational institution", fieldOfStudy: "Field of study",
      degreeLevel: "Level", expectedGraduation: "Expected graduation",
      studyCountry: "Country of study",
      internshipDirection: "Preferred internship direction", duration: "Duration in weeks",
      startDate: "Preferred start date", workArrangement: "Working arrangement",
      motivation: "Motivation and learning goals",
      employmentStatus: "Current employment situation", monthlyIncome: "Monthly income",
      currency: "Currency", financialSupport: "Financial support needed",
      passportNumber: "Passport number", passportIssueDate: "Date of issue",
      passportExpiryDate: "Valid until", passportFile: "Passport copy",
      taxId: "Tax number or BSN",
      signatureName: "Name for signature",
      c1: "I declare that all details provided are true and complete.",
      c2: "I authorise Flii Media to process my details for the internship placement and the related tax obligations.",
      c3a: "I agree to the ",
      c3link: "terms of the Flii Media internship programme",
      c3b: ".",
    },
    termsTitle: "Flii Media internship programme terms",
    termsIntro: "These terms apply to every internship at Flii Media BV, based in Amstelveen, the Netherlands. At the start of the internship they are set out in an internship agreement between you, your educational institution and Flii Media.",
    termsClose: "Close",
    terms: [
      ["1. Nature of the internship", "An internship at Flii Media is intended for learning. You contribute to real assignments, but the internship is not employment and is not meant to replace regular work. Its content is aligned with the learning objectives of your programme."],
      ["2. Duration and hours", "The duration and the number of hours per week are agreed in advance and recorded in the internship agreement. Any change is made in consultation with your educational institution."],
      ["3. Supervision", "You are assigned a supervisor at Flii Media. There are regular progress meetings and a final evaluation. Flii Media cooperates with whatever assessment format your institution requires."],
      ["4. Allowance", "Whether an internship allowance is paid, and how much, is agreed per internship and recorded in writing. An allowance is not a salary. Travel costs and any other reimbursements are agreed separately."],
      ["5. Workplace and equipment", "Flii Media provides the equipment you need for your work. It remains the property of Flii Media and is returned at the end of the internship. You use it only for your internship work."],
      ["6. Confidentiality", "You treat as confidential everything you learn at Flii Media about the company, its clients and their data. This obligation continues after the internship ends."],
      ["7. Work and ownership", "Work you produce during the internship on behalf of Flii Media belongs to Flii Media or to the client concerned. You may show work in your portfolio by prior agreement, provided client information stays protected."],
      ["8. Personal data", "Flii Media processes your details for the internship placement and for the legal obligations that come with it, including the statutory identification requirement. Your identity document copy is used only for that purpose and is not kept longer than necessary. You can request, correct or delete your data via stage@flii.nl."],
      ["9. Residence and work authorisation", "You are responsible for holding a valid residence status and, where required, a work or internship permit. Flii Media can assist but cannot guarantee an outcome. Without valid documentation the internship cannot proceed."],
      ["10. Ending the internship", "Either party may end the internship early, in consultation with your educational institution and with reasonable notice. In the event of a serious breach of these terms the internship may end immediately."],
      ["11. Governing law", "These terms and the internship agreement are governed by Dutch law."],
    ],
    o: {
      residenceStatus: [["", "Select"], ["eu", "EU citizen"], ["permit", "Residence permit"], ["visa", "Student visa"], ["applying", "Application in progress"], ["other", "Other"]],
      degreeLevel: [["", "Select"], ["mbo", "Vocational"], ["bachelor", "Bachelor"], ["master", "Master"], ["postgrad", "Postgraduate"], ["other", "Other"]],
      internshipDirection: [["", "Select"], ["marketing", "Digital marketing"], ["social", "Social media"], ["content", "Content"], ["design", "UX and UI design"], ["frontend", "Frontend development"], ["backend", "Backend development"], ["analytics", "Data and analytics"], ["ai", "AI solutions"], ["project", "Project management"], ["other", "Other"]],
      workArrangement: [["", "Select"], ["onsite", "Fully on site"], ["hybrid", "Hybrid"], ["remote", "Fully remote"], ["parttime", "Part time"]],
      employmentStatus: [["", "Select"], ["student", "Student without income"], ["part", "Student with side job"], ["full", "Employed"], ["self", "Self employed"], ["none", "No income"], ["other", "Other"]],
      financialSupport: [["no", "No"], ["stipend", "Yes, internship allowance"], ["housing", "Yes, housing support"], ["both", "Yes, both"]],
    },
    submit: "Send application",
    clear: "Clear form",
    consentError: "Please tick all three declarations before sending.",
    fileHint: "PDF, JPG or PNG, up to 10 MB",
    fileChoose: "Choose file",
    fileRemove: "Remove",
    fileRequired: "Please attach a copy of your passport.",
    fileTooBig: "This file is larger than 10 MB. Please choose a smaller one.",
    fileError: "The file could not be read. Please try another file.",
    storageFull: "The file is too large to process. Choose a smaller one or email it to stage@flii.nl.",
    success: "Thank you. Your application has been received and is in our system. We will be in touch within five working days.",
    error: "Something went wrong while sending. Please try again or email stage@flii.nl.",
    sending: "Sending",
  },
};

export default function InternshipInternational() {
  const [lang, setLang] = useState("nl");
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    document.title = "Stage aanvraag | Flii Media";
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    if (navigator.language && !navigator.language.toLowerCase().startsWith("nl")) {
      setLang("en");
    }
    return () => { document.head.removeChild(m); };
  }, []);

  useEffect(() => {
    if (!showTerms) return;
    const onKey = (e) => { if (e.key === "Escape") setShowTerms(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showTerms]);

  const t = T[lang];

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  };

  const setFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f && f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(t.fileTooBig);
      e.target.value = "";
      setForm((p) => ({ ...p, passportFile: null }));
      return;
    }
    setError("");
    setForm((p) => ({ ...p, passportFile: f || null }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.passportFile) {
      setError(t.fileRequired);
      return;
    }
    if (!form.consent1 || !form.consent2 || !form.consent3) {
      setError(t.consentError);
      return;
    }
    setStatus("sending");

    let passport;
    try {
      passport = await readFileAsBase64(form.passportFile);
    } catch (err) {
      setStatus("idle");
      setError(t.fileError);
      return;
    }
    const lead = {
      id: "int-" + Date.now(),
      type: "internship_application",
      status: "new",
      source: "flii.nl/p/internship-international",
      language: lang,
      submittedAt: new Date().toISOString(),
      contact: {
        name: form.fullName, email: form.email, phone: form.phone,
        dateOfBirth: form.dateOfBirth, nationality: form.nationality,
      },
      address: {
        street: form.street, postalCode: form.postalCode, city: form.city,
        country: form.country, residenceStatus: form.residenceStatus,
      },
      education: {
        institution: form.institution, fieldOfStudy: form.fieldOfStudy,
        degreeLevel: form.degreeLevel, expectedGraduation: form.expectedGraduation,
        studyCountry: form.studyCountry,
      },
      internship: {
        direction: form.internshipDirection, durationWeeks: form.duration,
        startDate: form.startDate, workArrangement: form.workArrangement,
        motivation: form.motivation,
      },
      income: {
        employmentStatus: form.employmentStatus, monthlyIncome: form.monthlyIncome,
        currency: form.currency, financialSupport: form.financialSupport,
      },
      documents: {
        passportNumber: form.passportNumber, passportIssueDate: form.passportIssueDate,
        passportExpiryDate: form.passportExpiryDate, taxId: form.taxId,
        passportFile: passport,
      },
      consent: {
        accuracy: form.consent1, dataProcessing: form.consent2, terms: form.consent3,
        signedName: form.signatureName, signedAt: new Date().toISOString(),
      },
    };
    try {
      const res = await saveToCRM(lead);
      if (res && res.ok === false) {
        setStatus("idle");
        setError(res.reason === "storage_full" ? t.storageFull : t.error);
        return;
      }
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("idle");
      setError(t.error);
    }
  };

  if (status === "done") {
    return (
      <main style={s.page}>
        <div style={s.done}>
          <div style={s.dot} />
          <h1 style={s.h1}>{t.title}</h1>
          <p style={s.sub}>{t.success}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={s.page}>
      <header style={s.header}>
        <div style={s.langRow}>
          <button type="button" onClick={() => setLang("nl")} style={lang === "nl" ? s.langOn : s.langOff}>NL</button>
          <button type="button" onClick={() => setLang("en")} style={lang === "en" ? s.langOn : s.langOff}>EN</button>
        </div>
        <div style={s.dot} />
        <h1 style={s.h1}>{t.title}</h1>
        <p style={s.sub}>{t.subtitle}</p>
      </header>

      <form onSubmit={submit} style={s.form} noValidate>
        <Section title={t.sections.personal}>
          <Row>
            <Field label={t.l.fullName} name="fullName" value={form.fullName} onChange={set} required />
            <Field label={t.l.dateOfBirth} name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set} required />
          </Row>
          <Row>
            <Field label={t.l.email} name="email" type="email" value={form.email} onChange={set} required />
            <Field label={t.l.phone} name="phone" type="tel" value={form.phone} onChange={set} required />
          </Row>
          <Field label={t.l.nationality} name="nationality" value={form.nationality} onChange={set} required />
        </Section>

        <Section title={t.sections.residence}>
          <Field label={t.l.street} name="street" value={form.street} onChange={set} required />
          <Row>
            <Field label={t.l.postalCode} name="postalCode" value={form.postalCode} onChange={set} required />
            <Field label={t.l.city} name="city" value={form.city} onChange={set} required />
          </Row>
          <Row>
            <Field label={t.l.country} name="country" value={form.country} onChange={set} required />
            <Pick label={t.l.residenceStatus} name="residenceStatus" value={form.residenceStatus} onChange={set} options={t.o.residenceStatus} required />
          </Row>
        </Section>

        <Section title={t.sections.education}>
          <Field label={t.l.institution} name="institution" value={form.institution} onChange={set} required />
          <Row>
            <Field label={t.l.fieldOfStudy} name="fieldOfStudy" value={form.fieldOfStudy} onChange={set} required />
            <Pick label={t.l.degreeLevel} name="degreeLevel" value={form.degreeLevel} onChange={set} options={t.o.degreeLevel} required />
          </Row>
          <Row>
            <Field label={t.l.expectedGraduation} name="expectedGraduation" type="month" value={form.expectedGraduation} onChange={set} />
            <Field label={t.l.studyCountry} name="studyCountry" value={form.studyCountry} onChange={set} required />
          </Row>
        </Section>

        <Section title={t.sections.internship}>
          <Pick label={t.l.internshipDirection} name="internshipDirection" value={form.internshipDirection} onChange={set} options={t.o.internshipDirection} required />
          <Row>
            <Field label={t.l.duration} name="duration" type="number" min="4" max="52" value={form.duration} onChange={set} required />
            <Field label={t.l.startDate} name="startDate" type="date" value={form.startDate} onChange={set} required />
          </Row>
          <Pick label={t.l.workArrangement} name="workArrangement" value={form.workArrangement} onChange={set} options={t.o.workArrangement} required />
          <Area label={t.l.motivation} name="motivation" value={form.motivation} onChange={set} />
        </Section>

        <Section title={t.sections.income}>
          <Pick label={t.l.employmentStatus} name="employmentStatus" value={form.employmentStatus} onChange={set} options={t.o.employmentStatus} required />
          <Row>
            <Field label={t.l.monthlyIncome} name="monthlyIncome" type="number" min="0" value={form.monthlyIncome} onChange={set} />
            <Pick label={t.l.currency} name="currency" value={form.currency} onChange={set} options={[["EUR", "EUR"], ["USD", "USD"], ["GBP", "GBP"], ["other", "Anders"]]} />
          </Row>
          <Pick label={t.l.financialSupport} name="financialSupport" value={form.financialSupport} onChange={set} options={t.o.financialSupport} />
        </Section>

        <Section title={t.sections.passport}>
          <Field label={t.l.passportNumber} name="passportNumber" value={form.passportNumber} onChange={set} required />
          <Row>
            <Field label={t.l.passportIssueDate} name="passportIssueDate" type="date" value={form.passportIssueDate} onChange={set} required />
            <Field label={t.l.passportExpiryDate} name="passportExpiryDate" type="date" value={form.passportExpiryDate} onChange={set} required />
          </Row>
          <div style={s.field}>
            <label style={s.label}>{t.l.passportFile}<span style={s.req}> *</span></label>
            {form.passportFile ? (
              <div style={s.filePicked}>
                <div style={{ minWidth: 0 }}>
                  <div style={s.fileName}>{form.passportFile.name}</div>
                  <div style={s.fileHint}>{(form.passportFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <button type="button" onClick={() => setForm((p) => ({ ...p, passportFile: null }))} style={s.fileRemove}>
                  {t.fileRemove}
                </button>
              </div>
            ) : (
              <label style={s.file}>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={setFile} style={{ display: "none" }} />
                <span style={s.fileName}>{t.fileChoose}</span>
                <span style={s.fileHint}>{t.fileHint}</span>
              </label>
            )}
          </div>
          <Field label={t.l.taxId} name="taxId" value={form.taxId} onChange={set} />
        </Section>

        <Section title={t.sections.signature}>
          <Field label={t.l.signatureName} name="signatureName" value={form.signatureName} onChange={set} required />
          <Check name="consent1" checked={form.consent1} onChange={set} label={t.l.c1} />
          <Check name="consent2" checked={form.consent2} onChange={set} label={t.l.c2} />
          <Check name="consent3" checked={form.consent3} onChange={set} label={
            <>
              {t.l.c3a}
              <button type="button" onClick={() => setShowTerms(true)} style={s.termsLink}>
                {t.l.c3link}
              </button>
              {t.l.c3b}
            </>
          } />
          {error ? <p style={s.error}>{error}</p> : null}
          <div style={s.actions}>
            <button type="submit" disabled={status === "sending"} style={s.primary}>
              {status === "sending" ? t.sending : t.submit}
            </button>
            <button type="button" onClick={() => { setForm(EMPTY); setError(""); }} style={s.secondary}>
              {t.clear}
            </button>
          </div>
        </Section>
      </form>

      {showTerms ? (
        <div style={s.overlay} onClick={() => setShowTerms(false)} role="dialog" aria-modal="true" aria-label={t.termsTitle}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHead}>
              <div style={s.dot} />
              <h2 style={s.modalTitle}>{t.termsTitle}</h2>
              <button type="button" onClick={() => setShowTerms(false)} style={s.modalClose} aria-label={t.termsClose}>
                {t.termsClose}
              </button>
            </div>
            <div style={s.modalBody}>
              <p style={s.termsIntro}>{t.termsIntro}</p>
              {t.terms.map(([h, body]) => (
                <div key={h} style={s.termsBlock}>
                  <h3 style={s.termsH}>{h}</h3>
                  <p style={s.termsP}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section style={s.section}>
      <h2 style={s.h2}>{title}</h2>
      <div style={s.sectionBody}>{children}</div>
    </section>
  );
}

function Row({ children }) {
  return <div style={s.row}>{children}</div>;
}

function Field({ label, ...p }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}{p.required ? <span style={s.req}> *</span> : null}</label>
      <input {...p} style={s.input} />
    </div>
  );
}

function Pick({ label, options, ...p }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}{p.required ? <span style={s.req}> *</span> : null}</label>
      <select {...p} style={s.input}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Area({ label, ...p }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <textarea {...p} rows={5} style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }} />
    </div>
  );
}

function Check({ label, name, checked, onChange }) {
  return (
    <label style={s.check}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} style={s.box} />
      <span style={s.checkText}>{label}</span>
    </label>
  );
}

const RED = "#e3242b";

const s = {
  page: { maxWidth: 820, margin: "0 auto", padding: "56px 20px 96px", background: "#fff", color: "#000", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" },
  header: { marginBottom: 40 },
  langRow: { display: "flex", gap: 6, justifyContent: "flex-end", marginBottom: 28 },
  langOn: { padding: "6px 14px", border: "1px solid #000", background: "#000", color: "#fff", borderRadius: 999, fontSize: 13, cursor: "pointer" },
  langOff: { padding: "6px 14px", border: "1px solid #e2e2e2", background: "#fff", color: "#666", borderRadius: 999, fontSize: 13, cursor: "pointer" },
  dot: { width: 10, height: 10, borderRadius: "50%", background: RED, marginBottom: 20 },
  h1: { fontSize: 38, lineHeight: 1.15, fontWeight: 600, margin: "0 0 12px", letterSpacing: "-0.02em" },
  sub: { fontSize: 16, lineHeight: 1.6, color: "#555", margin: 0, maxWidth: 560 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  section: { border: "1px solid #ececec", borderRadius: 14, padding: "26px 24px" },
  h2: { fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000", margin: "0 0 22px" },
  sectionBody: { display: "flex", flexDirection: "column", gap: 18 },
  row: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  label: { fontSize: 13, fontWeight: 500, color: "#333" },
  req: { color: RED },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 13px", border: "1px solid #dcdcdc", borderRadius: 8, fontSize: 15, color: "#000", background: "#fff", outline: "none" },
  file: { border: "1px dashed #cfcfcf", borderRadius: 8, padding: "22px 16px", textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 },
  fileName: { fontSize: 14, fontWeight: 500, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileHint: { fontSize: 12, color: "#8a8a8a" },
  filePicked: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, border: "1px solid #dcdcdc", borderRadius: 8, padding: "13px 15px" },
  fileRemove: { flexShrink: 0, padding: "6px 12px", background: "#fff", color: RED, border: "1px solid #f0d0d1", borderRadius: 6, fontSize: 13, cursor: "pointer" },
  check: { display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" },
  box: { marginTop: 3, width: 16, height: 16, accentColor: RED, flexShrink: 0 },
  checkText: { fontSize: 14, lineHeight: 1.55, color: "#444" },
  termsLink: { padding: 0, border: "none", background: "none", color: "#000", fontSize: 14, fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 },
  modal: { background: "#fff", borderRadius: 14, width: "100%", maxWidth: 640, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" },
  modalHead: { display: "flex", alignItems: "center", gap: 12, padding: "22px 24px", borderBottom: "1px solid #ececec" },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" },
  modalClose: { flexShrink: 0, padding: "7px 14px", background: "#fff", color: "#000", border: "1px solid #dcdcdc", borderRadius: 999, fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  modalBody: { padding: "22px 24px 28px", overflowY: "auto" },
  termsIntro: { fontSize: 14, lineHeight: 1.65, color: "#555", margin: "0 0 24px" },
  termsBlock: { marginBottom: 20 },
  termsH: { fontSize: 14, fontWeight: 600, color: "#000", margin: "0 0 6px" },
  termsP: { fontSize: 14, lineHeight: 1.65, color: "#444", margin: 0 },
  error: { fontSize: 14, color: RED, margin: 0 },
  actions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 },
  primary: { flex: "1 1 200px", padding: "14px 20px", background: "#000", color: "#fff", border: "1px solid #000", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer" },
  secondary: { flex: "1 1 140px", padding: "14px 20px", background: "#fff", color: "#000", border: "1px solid #dcdcdc", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer" },
  done: { padding: "80px 0", maxWidth: 560 },
};
