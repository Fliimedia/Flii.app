import { createHash, timingSafeEqual } from "node:crypto";
import { cors } from "./_lib/cors.js";
import { findAccountByName, payloadFor, readBody } from "./_lib/accounts.js";
import { issueToken } from "./_lib/token.js";

const sha256 = (value) => createHash("sha256").update(String(value)).digest();

const pinTable = () => {
  try {
    return JSON.parse(process.env.CLIENT_PINS || "{}");
  } catch {
    return {};
  }
};

// Constant work regardless of outcome, so response time reveals nothing.
const matches = (pin, expectedHex) => {
  const given = sha256(pin);
  const valid = typeof expectedHex === "string" && /^[0-9a-f]{64}$/i.test(expectedHex);
  const expected = valid ? Buffer.from(expectedHex, "hex") : Buffer.alloc(32);
  return timingSafeEqual(given, expected) && valid;
};

export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const { name = "", pin = "" } = readBody(req);

  // Deliberate delay. A six digit pin is a million guesses, so scripted
  // guessing has to be slow enough to be pointless.
  await new Promise((resolve) => setTimeout(resolve, 450 + Math.floor(Math.random() * 250)));

  const account = findAccountByName(name);
  const expected = account ? pinTable()[account.id] : null;

  if (!account || !matches(pin, expected)) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ...payloadFor(account), token: issueToken(account) });
}
