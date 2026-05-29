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

## Notes

All data is currently hardcoded seed values in `src/data.js`. There is no backend,
auth, or persistence yet — those are natural next steps (browser storage, then a
real database like Supabase).
