import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cors } from "./_lib/cors.js";
import { readBody } from "./_lib/accounts.js";
import { verifyToken } from "./_lib/token.js";

// De CRM draait alleen op Vercel. GET geeft de schil, POST geeft de applicatie
// en alleen aan een ingelogde beheerder. Geen cookies.
const MAP = join(process.cwd(), "crm-app");

export default function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(readFileSync(join(MAP, "index.html"), "utf8"));
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const { token } = readBody(req);
  const claim = verifyToken(token);
  if (!claim || claim.role !== "admin") {
    return res.status(401).json({ error: "invalid_session" });
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  return res.status(200).send(readFileSync(join(MAP, "flii-crm.js"), "utf8"));
}
