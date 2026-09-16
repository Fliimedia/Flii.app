import { readBody } from "./_lib/accounts.js";
import { verifyToken } from "./_lib/token.js";
import { cors } from "./_lib/cors.js";
import { search } from "./_lib/retrieve.js";
import knowledge from "../data/knowledge/index.js";

const BASE = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const MODEL = process.env.LLM_MODEL || "gpt-4o-mini";
const KEY = process.env.LLM_API_KEY || "";

const MAX_QUESTION = 500;
const MAX_HISTORY = 4;

// How much documentation travels with each question. Sending everything gave
// the best answers but roughly 4400 tokens a turn, which burns through a free
// tier's per minute allowance in two questions. This is the compromise: the
// best ranked part of the corpus, with no threshold that can refuse outright.
const CONTEXT_WORDS = 1100;

// Which sets this request may read. The separation lives here, in code.
// Asking the model to keep a secret is not access control.
const setsFor = (claim) => {
  const sets = [["public", knowledge.public]];
  if (!claim) return sets;
  if (claim.role === "client" && knowledge[claim.id]) sets.push([claim.id, knowledge[claim.id]]);
  if (claim.role === "admin") {
    for (const [label, set] of Object.entries(knowledge)) {
      if (label !== "public") sets.push([label, set]);
    }
  }
  return sets.filter(([, set]) => set && set.chunks && set.chunks.length);
};

const systemPrompt = (lang, context) => {
  const nl = lang === "nl";
  return [
    nl
      ? "Je bent de online assistent van flii.app, dat AI-architectuur en apps ontwerpt en bouwt. Je praat met bezoekers van de site en met klanten, niet met de makers ervan."
      : "You are the online assistant of flii.app, which designs and builds AI architecture and apps. You are talking to visitors and clients, not to the people who built the site.",
    nl
      ? "Spreek namens flii.app in de wij-vorm en spreek de ander aan met je. Vriendelijk en zakelijk, zonder verkooppraat."
      : "Speak on behalf of flii.app as we, and address the other person directly. Friendly and plain, without sales talk.",
    // The mechanism is nobody's business but ours.
    nl
      ? "Praat nooit over documentatie, informatie, context, bronnen, een systeem of jezelf als model. Praat gewoon over flii.app en wat we doen."
      : "Never talk about documentation, sources, context, a system, or yourself as a model. Just talk about flii.app and what we do.",
    nl
      ? "Gebruik uitsluitend wat hieronder staat. Verzin nooit feiten, cijfers, namen, prijzen of levertijden."
      : "Use only what is below. Never invent facts, figures, names, prices or delivery times.",
    nl
      ? "Weet je iets niet, zeg dat dan kort en verwijs door naar hello@flii.nl. Verontschuldig je niet uitgebreid."
      : "If you do not know something, say so briefly and point to hello@flii.nl. Do not apologise at length.",
    nl
      ? "Houd het kort, hooguit een korte alinea. Antwoord in het Nederlands."
      : "Keep it short, a short paragraph at most. Answer in English.",
    nl
      ? "Je mag lichte opmaak gebruiken: **vet** voor namen en kernbegrippen, en een opsomming met streepjes als je meerdere dingen noemt. Geen koppen, geen tabellen."
      : "Light formatting is allowed: **bold** for names and key terms, and a dash list when you name several things. No headings, no tables.",
    "",
    nl ? "Over flii.app:" : "About flii.app:",
    context,
  ].join("\n");
};

const words = (text) => text.split(/\s+/).length;

// Whole corpus when it is small, otherwise the highest ranked chunks up to the
// budget. Never empty: with no keyword overlap at all it falls back to reading
// from the top, so a general question still gets something to work with.
const pickContext = (sets, question) => {
  const all = sets.flatMap(([label, set]) =>
    (set.chunks || []).map((c) => ({ ...c, set: label }))
  );
  if (!all.length) return [];
  if (all.reduce((n, c) => n + words(c.text), 0) <= CONTEXT_WORDS) return all;

  const pinned = all.filter((c) => c.always);
  const rest = all.filter((c) => !c.always);
  const hits = search(
    rest.length === all.length ? sets : [["rest", { chunks: rest }]],
    question,
    40
  );
  const ordered = [...pinned, ...(hits.length ? hits : rest)];
  const out = [];
  let used = 0;
  for (const chunk of ordered) {
    const w = words(chunk.text);
    if (out.length && used + w > CONTEXT_WORDS) break;
    out.push(chunk);
    used += w;
  }
  return out;
};

const asContext = (chunks) =>
  chunks.map((c) => `## ${c.heading || c.title}\n${c.text}`).join("\n\n");

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const body = readBody(req);
  const question = String(body.question || "").trim().slice(0, MAX_QUESTION);
  const lang = body.lang === "en" ? "en" : "nl";
  const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : [];

  if (!question) return res.status(400).json({ error: "empty_question" });
  if (!KEY) return res.status(503).json({ error: "not_configured" });

  const claim = verifyToken(body.token);
  const sets = setsFor(claim);

  res.setHeader("Cache-Control", "no-store");

  const chunks = pickContext(sets, question);
  if (!chunks.length) {
    return res.status(200).json({ answer: null, error: "no_match", sources: [] });
  }
  const context = asContext(chunks);

  const messages = [
    { role: "system", content: systemPrompt(lang, context) },
    ...history
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) })),
    { role: "user", content: question },
  ];

  const call = (limitField) =>
    fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        [limitField]: 500,
      }),
    });

  try {
    let upstream = await call("max_tokens");

    // Some OpenAI compatible endpoints only accept max_completion_tokens.
    if (upstream.status === 400) {
      upstream = await call("max_completion_tokens");
    }

    // Out of allowance rather than broken. Worth its own message, because
    // "try again in a minute" is actually true here.
    if (upstream.status === 429) {
      console.error(`chat rate limited: base=${BASE} model=${MODEL}`);
      return res.status(429).json({ error: "rate_limited" });
    }

    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 400);
      // Logged, never returned: the response body can echo request details.
      console.error(
        `chat upstream failed: ${upstream.status} base=${BASE} model=${MODEL} body=${detail}`
      );
      return res.status(502).json({ error: "model_error", status: upstream.status });
    }
    const data = await upstream.json();
    const answer = data.choices && data.choices[0] && data.choices[0].message.content;
    if (!answer) return res.status(502).json({ error: "model_error" });

    return res.status(200).json({ answer: answer.trim(), sources: [] });
  } catch (err) {
    console.error(`chat upstream threw: ${err && err.message} base=${BASE} model=${MODEL}`);
    return res.status(502).json({ error: "model_error" });
  }
}
