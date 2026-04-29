# BUI Purview Deployment Script Generator

A React + Vite web app for generating customised Microsoft Purview DLP and SIT deployment scripts for South African regulatory compliance (POPIA, SARS, etc).

## Project structure

```
src/
├── components/
│   ├── steps/          ← One component per wizard step
│   ├── modals/         ← Config, SIT form, built-in SIT picker
│   └── ui/             ← Header, Stepper, Modal, Buttons
├── context/
│   └── AppContext.jsx  ← All wizard state (selections, configs, etc)
├── data/
│   ├── sits.js         ← DEFAULT_SITS, MODES
│   ├── policies.js     ← 8 DLP policy definitions
│   ├── sitXml.js       ← XML building blocks for each BUI custom SIT
│   └── builtinCatalogue.js ← OOTB Purview SIT catalogue (~270 SITs)
├── hooks/
│   ├── useConfig.js    ← SIT library persistence (localStorage + config.json)
│   └── useTheme.js     ← Dark/light theme toggle
├── utils/
│   └── scriptBuilder.js ← XML, Script 1, Script 2 generation
└── styles/
    └── global.css      ← CSS variables, resets, global styles

public/
└── bui-purview-config.json  ← SIT library config (source of truth when hosted)
```

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build for GitHub Pages

```bash
npm run build
```

This creates a `dist/` folder. Commit `dist/` to your repo and enable GitHub Pages to serve from it, **or** use the workflow below to deploy automatically.

## Deploy to GitHub Pages

### Option A — Manual (commit dist/)

```bash
npm run build
git add dist -f
git commit -m "Deploy"
git push
```

Set GitHub Pages source to: **Deploy from branch → main → /dist**

### Option B — GitHub Actions (automatic on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Then set GitHub Pages source to: **Deploy from branch → gh-pages → / (root)**

## Config storage

| Situation | Config loaded from |
|---|---|
| Local dev | `public/bui-purview-config.json` (Vite serves `public/`) |
| GitHub Pages | `bui-purview-config.json` from the `dist/` folder |
| First load, no config.json | Built-in defaults in `src/data/sits.js` |

### Adding custom SITs permanently

1. Open the app → ⚙ Config → add/edit SITs
2. Click **Export & commit to repo** → downloads `bui-purview-config.json`
3. Move the file into your `public/` folder (replacing the existing one)
4. `git add public/bui-purview-config.json && git commit -m "Update SIT library" && git push`
5. Run `npm run build` and deploy
