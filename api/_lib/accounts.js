import company from "../../data/company.json" with { type: "json" };
import clients from "../../data/clients/index.js";

export const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const keysOf = (record) => [record.id, record.name, ...(record.aliases || [])].map(slug);

// Two kinds of account share one login screen:
// the company itself (admin, sees every client) and each client (sees only itself).
export const findAccountByName = (name) => {
  const wanted = slug(name);
  if (!wanted) return null;
  if (keysOf(company).includes(wanted)) return { role: "admin", id: company.id };
  for (const client of Object.values(clients)) {
    if (keysOf(client).includes(wanted)) return { role: "client", id: client.id };
  }
  return null;
};

export const findAccountById = (id, role) => {
  if (role === "admin") return id === company.id ? { role: "admin", id } : null;
  return clients[id] ? { role: "client", id } : null;
};

// What the browser receives after a successful sign in.
export const payloadFor = (account) => {
  if (account.role === "admin") {
    return { role: "admin", company, clients: Object.values(clients) };
  }
  return { role: "client", client: clients[account.id] };
};

export const readBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
};
