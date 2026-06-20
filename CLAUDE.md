# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

RtxData is a privacy-first browser app for analyzing personal banking/order data from Raiffeisen Bank (Serbia), Wolt, and Glovo. All data stays in the user's browser `localStorage`; the site is static (hosted on GitHub Pages) and uses Content Security Policy to forbid anything not explicitly allowed.

The same analysis logic is implemented twice — once in JavaScript for the browser app, once in Python for `RtxData.ipynb`. When changing data parsing or schema in one, mirror the change in the other.

> **As of 2026-06 the deployed UI is a new Vite + TypeScript app under `app/`** (see `## app/` below). The legacy Create-React-App at the repo root stays in the tree but is no longer the deploy target. Parsing/classification logic now lives in **three** places — `app/src/lib/*` (TS, the live app), `src/db.js` (legacy JS), and `utils.py` (Python notebook). Keep the static FX rates (`{ RSD:1, EUR:117, USD:110 }`) and the Raiffeisen positional field indices in sync across all three.

## Commands

- `npm start` — dev server (react-scripts, Node 18.17.1 via `.nvmrc`)
- `npm run build` — production build (deployed automatically by `.github/workflows/deploy.yml` on push to `main`)
- `npm test` — react-scripts test runner (no tests committed currently)
- `python3 format.py` — rewrites `public/patterns.json` to lowercase keys; `python3 format.py --dry-run` is the same check run by CI (`.github/workflows/check-patterns.yml`). Caveat: that workflow's `paths:` filter is `patterns.json`, but the file actually lives at `public/patterns.json`, so the gate does not currently trigger — run `format.py --dry-run` manually after editing patterns.
- Python notebook flow: `python3.9 -m venv .venv && . ./.venv/bin/activate && pip install -r requirements.txt`, drop `Raiff*.json` in the repo root, run `RtxData.ipynb`

### app/ commands (current deploy target)

- `cd app && npm run dev` — Vite dev server
- `cd app && npm run build` — `tsc -b && vite build` (deployed by `deploy.yml`, which now builds `app/` with Node 20 and publishes `app/dist/`)
- `cd app && npm run test:run` — Vitest (the suite that actually exists). Note: Vitest uses esbuild and does **not** type-check — always run `npm run build` to catch `tsc` errors (e.g. `noUnusedLocals`).
- `app/.npmrc` sets `legacy-peer-deps=true` (a benign `@base-ui/react` ↔ `react-day-picker` `date-fns` peer clash); `npm ci` relies on it.

## app/ (new Vite + TS UI — current deploy target)

A privacy-first SPA: **Vite 5 + React 18 + TypeScript (strict)**, **Tailwind v4** (CSS-first `@theme` in `src/index.css`; there is no `tailwind.config.js`/`postcss.config.js`), **shadcn/ui** (on `@base-ui/react`), **TanStack Table/Virtual** for the ledger, and **Recharts** via the shadcn chart wrapper (`src/components/ui/chart.tsx`). No sql.js — all analysis is pure TS over a typed `Transaction[]`.

- **Data pipeline** (`src/lib/`): `parse.ts` (`parseRaiff` reads the positional Raiffeisen arrays at `transactions[acc][0][1]`) → `categorize.ts` (substring classifier: shipped `public/patterns.json` merged with user rules in `localStorage` key `rtx_rules`) → `classify.ts` (`classify` tags each row `consumption | income | cash | fx | crypto | transfer`; `'PR'` rows are bill/utility/tax payments = consumption, NOT income) → `aggregate.ts` (`cashFlow`, `byCategory`, `monthlySeries`, `coverage`, `biggestMovers`) and `subscriptions.ts` (recurring detection). `storage.ts` `loadAll()` runs the whole pipeline over every `*.json` blob in `localStorage`. The spending views default to **consumption only** (the "real spending ⟷ all movements" toggle); money-movement classes (FX/cash/crypto/transfer) are excluded so totals reflect real consumption.
- **State**: `src/state/DataProvider.tsx` (`useData()` → `{ txns, patterns, reload }`, refreshes on the `localStorageUpdate` window event) and `src/state/useFilters.ts` (`applyFilters` + a `Filters` model URL-synced to `location.hash`; defaults to real-spending when there is no hash).
- **UI**: `AppShell` (Overview / Transactions / Optimize tabs). Overview = cash-flow KPIs + monthly bars + biggest movers; Transactions = virtualized TanStack ledger + faceted `FilterRail` + in-UI categorization (inline edit, bulk, "always categorize {merchant}" rules written to `rtx_rules`) + coverage bar; Optimize = subscription detector with a monthly-commitment headline.
- **Testing note (jsdom)**: TanStack Virtual and Recharts measure the DOM (0×0 in jsdom). Tests stub `getBoundingClientRect`/`offsetHeight` (virtual rows) or give charts a fixed size and assert on text, never chart SVG.

## Architecture (legacy root app)

### Data ingestion → SQLite

`localStorage` holds files named `*.json` (downloaded from Raiffeisen/Wolt/Glovo). On every `localStorageUpdate` event, `src/Context.js` calls `getDB()` in `src/db.js`, which:

1. Boots an in-memory SQLite database via sql.js (loaded from cdnjs in `public/index.html`)
2. Creates fixed tables: `RaiffTxns`, `WoltItems`, `GlovoOrders`
3. Iterates every JSON blob in `localStorage`, parses Raiffeisen/Wolt/Glovo shapes, runs `parseRef` against `window.patterns` for two-level categorization, inserts rows
4. Executes the `-- init` query (top of `public/dashboard.sql`) to build derived tables like `Pos`
5. Returns `{ run, queries }` — `queries` is `dashboard.sql` split on `\n-- ` (everything after `-- name` becomes the named query)

`utils.py` mirrors all of this for the notebook against a Python `sqlite3` connection.

Two parsing details that are easy to break and must stay identical in `db.js` and `utils.py`:
- **Raiffeisen rows are positional arrays, not named objects.** Transactions live at `transactions[account][0][1]` and each field is read by index (`tx[8]`/`tx[9]` = debit/credit, `tx[6]`+`tx[14]` = reference, `tx[2]` = currency, etc.). The hardcoded indices *are* the schema — if the bank changes its response order, fix both files by index. Wolt keeps only `delivered` orders; Glovo keeps only RSD totals (those containing `" дин."`).
- **FX rates are hardcoded and duplicated:** `ratesRsd` in `src/db.js` and `rates_rsd` in `utils.py` (`{ RSD: 1, EUR: 117, USD: 110 }`). The `rsum` column is `sum` normalized to dinars via these static rates; most dashboard queries aggregate `rsum`, so stale rates skew cross-currency totals. (One query in `dashboard.sql` also hardcodes `117.3` for EUR.)

### Dashboard rendering

`Dashboard` iterates queries from `dashboard.sql` (or a custom override from the "Выполнить SQL" button). For each, `DashboardItem` runs the query twice:

1. First with the `UI(name, value)` SQL function used as a row collector to enumerate filter options (e.g., `UI("month", date)`, `UI("kat", kat1)` — see the `config` map in `src/DashboardItem.js`)
2. Then with `UI` rewired to a predicate that filters by the user's current selection

`DataElement` picks the render component by the **shape** of the result:
- 2 columns, first named `date` → `Plot` (line over time, plotly)
- 2 columns, second named `total` → `Pie`
- Anything else → `Table`

The Python `dashboard()` in `utils.py` applies the exact same rules. Adding a new chart type means changing both files.

### Browser extension (`extension/`)

A Chrome MV3 extension matches three origins (`rol.raiffeisenbank.rs`, `wolt.com`, `rtxdata.github.io`). `inject.js` loads `<hostname>.js` into each page. The flow:

1. `rtxdata.github.io.js` calls `extensionActive()` (defined inline in `public/index.html`) so `ExtensionButtons` can show "Загрузить с …" buttons
2. Clicking opens a tab to the bank/Wolt and posts a `heartbeat` every second
3. The bank/Wolt content script, on heartbeat, fetches transactions and `postMessage`s the JSON back; only `rtxdata.github.io` is listed as a trusted origin in `rtxdata.github.io.js`
4. `window.save(name, value)` (also defined in `public/index.html`) writes to `localStorage` and dispatches `localStorageUpdate`

The README documents copy-paste console scripts that produce the same JSON shape — keep extension scripts and README scripts in sync.

### Pattern classifier (`public/patterns.json`)

Two-level: `{ kat1: { lowercase_substring: kat2 } }`. `parseRef` does a substring scan against the lowercased transaction reference. CI enforces lowercase keys via `format.py --dry-run`; run `format.py` (no flag) to auto-fix.

### CSP and external scripts

`public/index.html` allows scripts only from self and `cdnjs.cloudflare.com`. sql.js, Prism, and their integrity hashes are pinned there. Adding any new CDN script requires updating the CSP and an integrity hash; prefer bundling via npm instead.
