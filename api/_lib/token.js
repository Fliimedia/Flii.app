import { createHmac, timingSafeEqual } from "node:crypto";

// Session tokens are signed, not stored. No database needed.
// Secret comes from SESSION_SECRET. If that is not set, the CLIENT_PINS
// string doubles as the secret, so one environment variable is enough
// to run the portal.
const secret = () => process.env.SESSION_SECRET || process.env.CLIENT_PINS || "";

const TTL_MS = 12 * 60 * 60 * 1000;

const sign = (payload) => createHmac("sha256", secret()).update(payload).digest("base64url");

export const issueToken = (account) => {
  const payload = Buffer.from(
    JSON.stringify({ c: account.id, r: account.role, e: Date.now() + TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

// Returns { id, role } or null.
export const verifyToken = (token) => {
  if (!secret() || typeof token !== "string") return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.c || !data.r || !data.e || Date.now() > data.e) return null;
    return { id: data.c, role: data.r };
  } catch {
    return null;
  }
};
