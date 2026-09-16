// The front end and the functions can live on different hosts, so every call
// may be cross origin and needs these headers.
// Which origins may call these functions. Set ALLOWED_ORIGINS in the hosting
// environment as a comma separated list, for example:
//   https://portal.flii.app,https://flii-portal.vercel.app
const ALLOWED = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Returns true when the request was a preflight and has been answered.
export const cors = (req, res) => {
  const origin = req.headers.origin;
  // No list configured means same origin only, which needs no header at all.
  if (origin && ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
};
