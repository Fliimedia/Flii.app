// GA4-data voor het OneLane campagnedashboard op flii.app.
// Vaste rapportage voor een vaste property; geen vrije queries mogelijk.
// Vereist GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET en GOOGLE_REFRESH_TOKEN.

const PROPERTY = "554527914";
const STREAM = "onelane.nl";
const START = "2026-10-05";
const END = "2026-11-15";
const MIN = "2026-09-30";
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const ORIGINS = ["https://flii.app", "https://www.flii.app"];
const METRICS = ["sessions", "totalUsers", "newUsers", "engagementRate", "averageSessionDuration", "screenPageViews"];
const KEYS = ["s", "u", "nu", "e", "d", "v"];

let cached = { token: null, exp: 0 };

async function accessToken() {
  if (cached.token && Date.now() < cached.exp - 60000) return cached.token;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error("oauth: " + (j.error || r.status));
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return cached.token;
}

const exact = (fieldName, value) => ({ filter: { fieldName, stringFilter: { matchType: "EXACT", value } } });

function amsterdamToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

async function report(token, start, end, dims, mets, limit, nlOnly) {
  const exprs = [exact("streamName", STREAM), exact("hostName", STREAM)];
  if (nlOnly) exprs.push(exact("country", "Netherlands"));
  const body = {
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: dims.map((name) => ({ name })),
    metrics: mets.map((name) => ({ name })),
    dimensionFilter: { andGroup: { expressions: exprs } },
  };
  if (dims.length && dims[0] !== "date") body.orderBys = [{ metric: { metricName: mets[0] }, desc: true }];
  if (limit) body.limit = limit;
  const r = await fetch("https://analyticsdata.googleapis.com/v1beta/properties/" + PROPERTY + ":runReport", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("ga4: " + ((j.error && j.error.status) || r.status));
  return (j.rows || []).map((row) => ({
    d: (row.dimensionValues || []).map((x) => (x.value && x.value.trim() ? x.value : "(not set)")),
    m: (row.metricValues || []).map((x) => Number(x.value) || 0),
  }));
}

const num = (v) => (Number.isInteger(v) ? v : Math.round(v * 10000) / 10000);
const rec = (n, m, keys) => keys.reduce((o, k, i) => ((o[k] = num(m[i])), o), { n });

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ORIGINS.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const today = amsterdamToday();
  const qs = req.query || {};
  let start = typeof qs.start === "string" && ISO.test(qs.start) ? qs.start : START;
  let end = typeof qs.end === "string" && ISO.test(qs.end) ? qs.end : today < END ? today : END;
  if (start < MIN) start = MIN;
  if (end > today) end = today;
  if (start > end) return res.status(400).json({ error: "invalid_range" });

  try {
    const token = await accessToken();
    const geo = ["sessions", "totalUsers", "engagementRate"];
    const gk = ["s", "u", "e"];
    const q = (dims, mets, limit, nl) => report(token, start, end, dims, mets, limit, nl);
    const [tot, byDate, ch, src, lp, co, ci, dev, age, gen] = await Promise.all([
      q([], METRICS.concat("screenPageViewsPerSession")),
      q(["date"], METRICS),
      q(["sessionDefaultChannelGrouping"], METRICS, 25),
      q(["sessionSourceMedium"], METRICS, 25),
      q(["landingPage"], METRICS, 25),
      q(["country"], geo, 10),
      q(["city"], geo, 25, true),
      q(["deviceCategory"], geo, 5),
      q(["userAgeBracket"], ["totalUsers"]),
      q(["userGender"], ["totalUsers"]),
    ]);

    const tv = tot[0] ? tot[0].m : new Array(7).fill(0);
    const totals = KEYS.concat("vps").reduce((o, k, i) => ((o[k] = num(tv[i] || 0)), o), {});

    const map = {};
    byDate.forEach((r) => { const s = r.d[0]; map[s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6)] = r.m; });
    const days = [];
    for (let t = Date.parse(start + "T00:00:00Z"); t <= Date.parse(end + "T00:00:00Z"); t += 86400000) {
      const iso = new Date(t).toISOString().slice(0, 10);
      const m = map[iso] || new Array(6).fill(0);
      days.push(KEYS.reduce((o, k, i) => ((o[k] = num(m[i])), o), { date: iso }));
    }

    const skip = (n) => ["unknown", "(not set)", ""].includes(n);
    const a = age.filter((r) => !skip(r.d[0])).sort((x, y) => (x.d[0] < y.d[0] ? -1 : 1));
    const g = gen.filter((r) => !skip(r.d[0]));
    const demografie = a.length || g.length
      ? { age: a.map((r) => ({ n: r.d[0], v: num(r.m[0]) })), gender: g.map((r) => ({ n: r.d[0], v: num(r.m[0]) })) }
      : null;

    res.setHeader("Cache-Control", end === today ? "public, s-maxage=1800, stale-while-revalidate=86400" : "public, s-maxage=21600, stale-while-revalidate=86400");
    return res.status(200).json({
      meta: { source: "GA4", property: "OneLane", stream: STREAM, start, end, updated: new Date().toISOString() },
      totals,
      days,
      dims: {
        kanalen: ch.map((r) => rec(r.d[0], r.m, KEYS)),
        bronnen: src.map((r) => rec(r.d[0], r.m, KEYS)),
        landingspaginas: lp.map((r) => rec(r.d[0], r.m, KEYS)),
      },
      countries: co.map((r) => rec(r.d[0], r.m, gk)),
      cities: ci.map((r) => rec(r.d[0], r.m, gk)),
      devices: dev.map((r) => rec(r.d[0], r.m, gk)),
      demografie,
    });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: String(e.message || e).slice(0, 120) });
  }
}
