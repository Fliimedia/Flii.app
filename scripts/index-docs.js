// Turns the markdown in docs/ into the chunk files the chat function reads.
// Pure text processing: no API keys, no network, no cost.
//
//   npm run index-docs
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, relative, basename } from "node:path";

const ROOT = process.cwd();
const DOCS = join(ROOT, "docs");
const OUT = join(ROOT, "data", "knowledge");

const MAX = 1100; // characters per chunk
const OVERLAP = 160;

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) return walk(p);
        return /\.(md|markdown|txt)$/i.test(name) ? [p] : [];
      })
    : [];

const clean = (text) =>
  text
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "") // frontmatter
    .replace(/<!--[\s\S]*?-->/g, ""); // source notes, not content for the bot

// Split on headings first, so a chunk is about one thing, then split anything
// still too long on paragraph boundaries.
const splitSections = (text) => {
  const lines = clean(text).split(/\r?\n/);
  const sections = [];
  let heading = "";
  let buffer = [];
  const flush = () => {
    const body = buffer.join("\n").trim();
    // Text before the first heading has nothing to cite, so it is skipped.
    if (body && heading) sections.push({ heading, body });
    buffer = [];
  };
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      flush();
      heading = m[2].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections;
};

const splitLong = (body) => {
  if (body.length <= MAX) return [body];
  const parts = [];
  const paragraphs = body.split(/\n{2,}/);
  let current = "";
  for (const para of paragraphs) {
    if ((current + "\n\n" + para).trim().length > MAX && current) {
      parts.push(current.trim());
      current = current.slice(Math.max(0, current.length - OVERLAP)) + "\n\n" + para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
};

const buildSet = (dir, label) => {
  const files = walk(dir);
  const chunks = [];
  for (const file of files) {
    const rel = relative(DOCS, file).replace(/\\/g, "/");
    const title = basename(file).replace(/\.(md|markdown|txt)$/i, "");
    const raw = readFileSync(file, "utf8");
    // A file containing <!-- always --> travels with every question.
    const always = /<!--\s*always\s*-->/.test(raw);
    for (const section of splitSections(raw)) {
      for (const piece of splitLong(section.body)) {
        chunks.push({
          id: `${rel}#${chunks.length}`,
          source: rel,
          title,
          heading: section.heading,
          always,
          text: piece,
        });
      }
    }
  }
  return { label, generated: new Date().toISOString().slice(0, 10), chunks };
};

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const sets = [["public", join(DOCS, "public")]];
const clientsDir = join(DOCS, "clients");
if (existsSync(clientsDir)) {
  for (const id of readdirSync(clientsDir)) {
    if (statSync(join(clientsDir, id)).isDirectory()) sets.push([id, join(clientsDir, id)]);
  }
}

for (const [label, dir] of sets) {
  const set = buildSet(dir, label);
  writeFileSync(join(OUT, `${label}.json`), JSON.stringify(set, null, 1) + "\n");
  const words = set.chunks.reduce((n, c) => n + c.text.split(/\s+/).length, 0);
  console.log(`${label.padEnd(28)} ${String(set.chunks.length).padStart(4)} chunks, ${words} words`);
}
console.log("\nRegister any new client set in data/knowledge/index.js, then commit data/knowledge/.");
