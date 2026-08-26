// Serverless intake voor de internationale stage-aanvraag.
// Ontvangt de volledige lead (paspoort en alle details) en stuurt hem door
// naar je CRM als CRM_WEBHOOK_URL is ingesteld. Zonder webhook accepteert
// het endpoint de aanvraag zodat het formulier nu al werkt.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, reason: "method_not_allowed" });
    return;
  }
  try {
    const lead = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    const id = lead.id || `lead_${Date.now()}`;
    const webhook = process.env.CRM_WEBHOOK_URL;
    if (webhook) {
      const headers = { "Content-Type": "application/json" };
      if (process.env.CRM_WEBHOOK_TOKEN) headers.Authorization = `Bearer ${process.env.CRM_WEBHOOK_TOKEN}`;
      const r = await fetch(webhook, { method: "POST", headers, body: JSON.stringify({ ...lead, id }) });
      if (!r.ok) {
        res.status(502).json({ ok: false, reason: "crm_error" });
        return;
      }
    }
    res.status(200).json({ ok: true, id, delivered: Boolean(webhook) });
  } catch (err) {
    res.status(500).json({ ok: false, reason: "server_error" });
  }
}
