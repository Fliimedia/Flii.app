# Flii.app — connecting the CMS to Supabase

The site runs fine with no backend (content lives in the browser via
localStorage). To make content shared across devices and visitors,
point it at a Supabase project. Takes about 5 minutes.

## 1. Create the project
- supabase.com → New project. Pick a region near your users (EU).
- When it's ready, go to **Project Settings → API** and copy:
  - **Project URL**  (https://xxxx.supabase.co)
  - **anon public** key

## 2. Create the tables
- Supabase → **SQL Editor → New query**.
- Paste the contents of `supabase-setup.sql`, then **Run**.
- This creates 4 tables (reviews, certs, apps, articles) and the
  row-level-security policies.

## 3. Give the app the keys
Two options — pick one.

**A. Hardcode (simplest, fine for the anon key)**
In `FliiSite.jsx`, near the top, fill in:
```js
const SUPABASE_URL  = "https://xxxx.supabase.co";
const SUPABASE_ANON = "eyJhbGci...";   // anon public key
```
The anon key is meant to be public; security comes from the RLS
policies, not from hiding it.

**B. Environment variables (Next.js)**
Leave the two constants blank and set in Vercel → Project → Settings →
Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```
(Vite doesn't expose process.env the same way — for Vite use option A.)

## 4. Deploy
Push to GitHub, deploy on Vercel. No rewrite config needed — the app
uses hash routing (#/cms, #/app/:id, etc).

## How it behaves
- On first load with empty tables, the app **auto-seeds** your default
  content into Supabase.
- The CMS at `#/cms` reads/writes Supabase directly. Edits are
  optimistic (instant in the UI) and saved in the background.
- The header pill shows the active backend: **Synced with Supabase**
  or **Local (this browser)** if the keys are missing/unreachable.

## Hardening writes (optional, for production)
The default policies allow writes with the anon key, so anyone holding
it could edit content. When you want it locked down:
1. In `supabase-setup.sql`, remove the three `anon insert/update/delete`
   policies and re-run.
2. Either turn on Supabase Auth and gate the CMS behind a login, or add
   a Vercel serverless route (`/api/cms`) that performs writes with the
   **service_role** key (kept server-side) behind a shared admin secret.
Reads stay public either way.
