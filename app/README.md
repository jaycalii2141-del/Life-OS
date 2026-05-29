# Life OS — Web App

Jay Martinez's personal Life OS, built as a Vite + React web app. Five screens —
Mission Control, Training HQ, Content Studio, ONA HQ, and an AI command sheet —
rendered inside an iPhone frame, matching the original design system exactly.

## Run locally

```bash
cd app
npm install
npm run dev      # http://localhost:5173
```

## Build for production

```bash
npm run build    # outputs to app/dist/
npm run preview  # preview the production build locally
```

## Project structure

```
app/
  index.html, vite.config.js, package.json
  netlify.toml, vercel.json        # deploy configs
  src/
    main.jsx        # entry point
    App.jsx         # shell: iPhone frame, tab state, FAB → Quick Capture
    styles.css      # design tokens + all styling
    data.js         # seed data (brands, skills, coaches, timeline, etc.)
    components/      # icons, atoms, IOSDevice, TabBar, QuickCapture
    screens/         # MissionControl, TrainingHQ, ContentStudio, ONAHQ, AIScreen
```

## Deploy

### Netlify Drop (fastest, no account needed to start)

Build with `npm run build`, then drag the `app/dist` folder onto
https://app.netlify.com/drop for an instant live URL.

### Vercel (auto-deploys on every git push)

1. Push this repo to GitHub.
2. Import it at https://vercel.com/new.
3. Set **Root Directory** to `app`.
4. Vercel auto-detects Vite (`vercel.json` is already configured). Deploy.

Every push to the repo will then rebuild and redeploy automatically.

## Cloud backend (Supabase + magic-link auth)

The app works offline on `localStorage` out of the box. When Supabase env vars are
present, it adds magic-link email login and syncs your data across devices (private
per-user via Row Level Security). Without the env vars, it silently stays
localStorage-only — no login screen.

### One-time setup

1. Create a free project at https://supabase.com.
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it.
3. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
4. Locally: copy `.env.example` to `.env` and fill in both values, then restart `npm run dev`.
5. On Vercel: **Project → Settings → Environment Variables**, add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy.
6. In Supabase **Authentication → URL Configuration**, set the **Site URL** to your
   Vercel URL and add `http://localhost:5173` to the allowed redirect URLs.

### How sync works

`src/useSyncedState.js` is local-first: `localStorage` is the instant source of truth,
and when you're signed in it pulls your remote row on login and pushes every change up
to the `app_state` table. Data model is one JSON row per `(user, key)`.

## Notes

Seed/reference data (brands, coaches, radar, momentum) still lives in `src/data.js`.
Your editable, synced state is: daily logs (meters, One Thing, timeline), captures,
training sessions, and skill progress.
