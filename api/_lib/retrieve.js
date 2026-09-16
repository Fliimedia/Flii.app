// Lexical retrieval (BM25) over the chunk files in data/knowledge.
// No embedding model, so no API key and no cost for the search step, and the
// index is plain text in the repo that anyone can read and correct.

const STOP = new Set(
  ("de het een en of maar want dus als dan die dat deze dit er is zijn was waren wordt worden werd " +
   "ben bent heb hebt heeft hebben had hadden zal zullen zou zouden kan kunnen kon konden mag mogen " +
   "moet moeten wil willen van voor met naar bij aan op in uit over onder tussen door om te ten ter " +
   "niet geen ook nog wel al reeds hoe wat waar wie waarom wanneer welke ik jij je u wij we jullie " +
   "zij ze hij hem haar hun ons onze mijn jouw uw hunne " +
   "the a an and or but so if then that this these those is are was were be been being have has had " +
   "do does did will would can could may might must of for with to from at on in by about as it its"
  ).split(/\s+/)
);

// Light Dutch and English suffix trimming. Not a real stemmer, but enough to
// match "facturen" to "factuur" style variation without a dependency.
const stem = (word) => {
  let w = word;
  for (const suffix of ["ingen", "heden", "tjes", "eren", "ende", "en", "es", "er", "je", "s", "e"]) {
    if (w.length > suffix.length + 3 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length);
      break;
    }
  }
  return w;
};

export const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);

// Built once per cold start, per knowledge set.
const cache = new Map();

const buildIndex = (set) => {
  const docs = (set.chunks || []).map((chunk) => {
    const terms = tokenize(`${chunk.heading} ${chunk.title} ${chunk.text}`);
    const tf = new Map();
    for (const t of terms) tf.set(t, (tf.get(t) || 0) + 1);
    return { chunk, tf, length: terms.length };
  });
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const avg = docs.reduce((n, d) => n + d.length, 0) / (docs.length || 1);
  return { docs, df, avg, n: docs.length };
};

const indexFor = (label, set) => {
  if (!cache.has(label)) cache.set(label, buildIndex(set));
  return cache.get(label);
};

const K1 = 1.4;
const B = 0.75;

// Dutch glues words together, so an exact term match is often just missed:
// "telefoonnummer" against "telefoon", "factuurregel" against "factuur".
// When a query term is not in the index, fall back to prefix overlap.
const expand = (term, idx) => {
  if (idx.df.has(term)) return [[term, 1]];
  if (term.length < 5) return [];
  const out = [];
  for (const known of idx.df.keys()) {
    if (known.length < 5) continue;
    if (known.startsWith(term) || term.startsWith(known)) out.push([known, 0.6]);
    if (out.length === 4) break;
  }
  return out;
};

// Returns the best chunks across every set it is given, highest score first.
export const search = (sets, question, limit = 5) => {
  const terms = [...new Set(tokenize(question))];
  if (!terms.length) return [];

  const scored = [];
  for (const [label, set] of sets) {
    const idx = indexFor(label, set);
    if (!idx.n) continue;

    // Resolve each query term once per set.
    const resolved = terms.map((t) => [t, expand(t, idx)]);

    for (const d of idx.docs) {
      let score = 0;
      let matched = 0;
      for (const [, variants] of resolved) {
        let hit = 0;
        for (const [variant, weight] of variants) {
          const f = d.tf.get(variant);
          if (!f) continue;
          hit = 1;
          const df = idx.df.get(variant);
          // Floor the idf: in a small set every term is common, which would
          // otherwise drive every score to nearly zero.
          const idf = Math.max(0.3, Math.log(1 + (idx.n - df + 0.5) / (df + 0.5)));
          score += weight * idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.length) / idx.avg)));
        }
        matched += hit;
      }
      if (score > 0) scored.push({ score, coverage: matched / terms.length, set: label, ...d.chunk });
    }
  }

  // Ranking only. Deciding whether the documentation answers the question is
  // the model's job, not a threshold's: a gate here refuses before anyone has
  // read anything.
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
};
