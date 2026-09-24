import { readFileSync } from "node:fs";
import { join } from "node:path";
import { verifyToken } from "./_lib/token.js";

// Serveert de CRM alleen aan een ingelogde beheerder.
// Eenmalig openen met ?token=<sessietoken> zet een cookie; daarna volstaat /api/crm.
const COOKIE = "flii_crm_sessie";
const MAP = join(process.cwd(), "crm-app");

const leesCookie = (req, naam) => {
  const ruw = req.headers.cookie || "";
  for (const deel of ruw.split(";")) {
    const [k, ...rest] = deel.trim().split("=");
    if (k === naam) return decodeURIComponent(rest.join("="));
  }
  return null;
};

const magBinnen = (token) => {
  const claim = verifyToken(token);
  return Boolean(claim && claim.role === "admin");
};

const weigeren = (res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(401).send(
    '<!doctype html><meta charset="utf-8"><title>Geen toegang</title>' +
      '<body style="font-family:Inter,system-ui,sans-serif;margin:0;display:flex;' +
      'align-items:center;justify-content:center;height:100vh;background:#fff;color:#16181D">' +
      '<div style="text-align:center"><div style="height:9px;width:120px;background:#E8255B;' +
      'margin:0 auto 22px;border-radius:5px"></div>' +
      "<p>Log eerst in op het portaal.</p></div></body>"
  );
};

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const vanUrl = typeof req.query.token === "string" ? req.query.token : null;
  if (vanUrl) {
    if (!magBinnen(vanUrl)) return weigeren(res);
    res.setHeader("Set-Cookie", [
      `${COOKIE}=${encodeURIComponent(vanUrl)}; Path=/api; Max-Age=43200; HttpOnly; Secure; SameSite=Lax`,
    ]);
    res.setHeader("Location", "/api/crm");
    return res.status(302).end();
  }

  if (!magBinnen(leesCookie(req, COOKIE))) return weigeren(res);

  res.setHeader("Cache-Control", "no-store");
  if (req.query.f === "js") {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    return res.status(200).send(readFileSync(join(MAP, "flii-crm.js"), "utf8"));
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(readFileSync(join(MAP, "index.html"), "utf8"));
}
