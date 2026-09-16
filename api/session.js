import { cors } from "./_lib/cors.js";
import { findAccountById, payloadFor, readBody } from "./_lib/accounts.js";
import { verifyToken } from "./_lib/token.js";

// Exchanges a stored session token for the current account payload, so a page
// refresh does not sign anyone out and the browser never has to keep the data.
export default async function handler(req, res) {
  if (cors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }
  const { token } = readBody(req);
  const claim = verifyToken(token);
  const account = claim ? findAccountById(claim.id, claim.role) : null;
  if (!account) return res.status(401).json({ error: "invalid_session" });

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(payloadFor(account));
}
