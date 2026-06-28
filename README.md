# Flii.app

Marketing site for Flii.app — AI architectuur & marketing-apps. React (Vite), single-file component with a built-in CMS (`#/cms`, PIN-gated) backed by Supabase REST with a localStorage fallback.

## Develop
```
npm install
npm run dev
```

## Deploy (Vercel)
Import the repo in Vercel. Framework preset: **Vite** (auto-detected). Build: `npm run build`, output: `dist`. Hash routing is used, so no rewrites are needed.

## Supabase (optional)
The site runs on localStorage with no backend. To share content across devices, fill in `SUPABASE_URL` and `SUPABASE_ANON` near the top of `src/FliiSite.jsx` (or set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`), and run `supabase-setup.sql` in the Supabase SQL editor. See `README-supabase.md`.

## Admin / CMS
Open the lock icon (top right) and enter the PIN to unlock the CMS. Note: a client-side PIN is obfuscation, not real security; move writes behind Supabase Auth or a serverless route for production.
