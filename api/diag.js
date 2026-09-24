import { findAccountByName } from "./_lib/accounts.js";

// Tijdelijk controlepunt. Toont geen geheimen, alleen of de instellingen
// aankomen en kloppen van vorm. Verwijder dit bestand na het oplossen.
export default function handler(req, res) {
  const ruw = process.env.CLIENT_PINS || "";
  let tabel = null;
  let leesbaar = true;
  try {
    tabel = JSON.parse(ruw);
  } catch {
    leesbaar = false;
  }

  const sleutels = tabel && typeof tabel === "object" ? Object.keys(tabel) : [];
  const account = findAccountByName("flii.app");
  const verwacht = account && tabel ? tabel[account.id] : null;

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    client_pins_aanwezig: Boolean(ruw),
    client_pins_lengte: ruw.length,
    client_pins_leesbaar_als_json: leesbaar,
    sleutels_in_client_pins: sleutels,
    naam_flii_punt_app_herkend: Boolean(account),
    account_id: account ? account.id : null,
    hash_gevonden_voor_dit_account: Boolean(verwacht),
    hash_lengte: typeof verwacht === "string" ? verwacht.length : null,
    hash_vorm_klopt: typeof verwacht === "string" ? /^[0-9a-f]{64}$/i.test(verwacht) : false,
    hash_eerste_zes: typeof verwacht === "string" ? verwacht.slice(0, 6) : null,
    session_secret_gezet: Boolean(process.env.SESSION_SECRET),
    allowed_origins: process.env.ALLOWED_ORIGINS || "(leeg)",
  });
}
