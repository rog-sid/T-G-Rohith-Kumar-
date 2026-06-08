# JobScope Analytics — PRD & Progress

## Original Problem Statement
Build a complete, production-ready, full-stack (client-side) SPA **"JobScope Analytics"** — a portfolio-grade job market analytics dashboard for tracking demand for Data Analyst & related roles in Bengaluru, India. Stack: React 18 + Vite + TypeScript + Tailwind v3 + shadcn/ui + Recharts + PapaParse + Zod + Zustand + date-fns + Lucide. **In-memory store only** (no DB / localStorage / sessionStorage), **no backend**, **no external API calls**. 100 synthetic seed records preloaded. 7 pages: Dashboard, Jobs Explorer, Import Data, Insights, Forecast, Skill Gap, About. Dark/light toggle. Global Zustand filter bar affecting all pages.

## User Choices
- Confirmed: use **Vite + React 18 + TypeScript** (reconfigured the managed dev server so `yarn start` runs Vite on port 3000).
- Build now; user will use platform "Save to GitHub" and "Deploy" buttons afterward.

## Architecture
- **Pure client-side Vite SPA** at `/app/frontend` (served on port 3000 via supervisor `frontend` = `yarn start` → `vite`).
- `/app/backend/server.py` is a **no-op FastAPI health stub** only (keeps supervisor calm; not used by the app).
- State: Zustand stores — `useThemeStore` (theme), `useDataStore` (jobs + learning list, seeded with 100 records), `useFilterStore` (global filters).
- Data engine in `src/lib`: `seedData.ts` (deterministic mulberry32 generator), `analytics.ts`, `insights.ts`, `forecast.ts` (3-week SMA), `csv.ts` (PapaParse + Zod validation), `skillgap.ts`.
- UI: shadcn/ui components in `src/components/ui`, charts in `src/components/charts.tsx` (Recharts, theme-aware palette).

## Core Requirements (static)
- 7 fully-functional pages, all charts render on first load, all filters connected, all buttons functional.
- Dark/light theme (defaults to system pref, in-memory), responsive + mobile hamburger, toasts, breadcrumb, active nav highlight, empty states, count-up KPIs.

## What's Been Implemented (2026-06-08)
- ✅ Full app scaffolded with Vite/React18/TS; `yarn start` runs Vite on :3000.
- ✅ 100 deterministic synthetic jobs (exact role distribution: DA 35 / BA 20 / SQL Dev 10 / PowerBI 10 / Python 10 / MIS 10 / DE 5).
- ✅ Dashboard: 5 animated KPI cards + 6 charts (trend area, top roles, top skills, salary-by-role, work-mode donut, experience pie) + global FilterBar + reset + empty state.
- ✅ Jobs Explorer: searchable/sortable/paginated table (10/page), row drawer, CSV export.
- ✅ Import Data: CSV drag-drop + template + validation preview, JSON paste tab, manual entry form; redirect to dashboard on import; loading + toasts.
- ✅ Insights: 10 auto-generated insight cards with sparklines + "Copy as Text".
- ✅ Forecast: historical (solid) + SMA forecast (dashed) line chart, role selector, summary, confidence badge, week table.
- ✅ Skill Gap: match score, your-skills vs top-demanded comparison, learning list, tailored resume bullets.
- ✅ About: methodology, limitations, import guide, CSV format, tech credits.
- ✅ Theme toggle, responsive, breadcrumb, active nav, toasts, keyboard-accessible nav.
- ✅ Validation: `tsc --noEmit` clean; TS-aware ESLint (local) clean; E2E testing agent ~98% (no critical/UI bugs, 0 console errors).

## Known Tooling Note
- The platform's `lint_javascript` harness is **JS-only (espree)** and cannot parse TypeScript; it reports false "Parsing error" entries on valid TS. Authoritative checks pass: `tsc --noEmit` = 0 errors, local ESLint v9 + `@typescript-eslint` = 0 errors/warnings.

## Backlog / Next Tasks
- **P1:** Optional — persist imported data across refresh is intentionally NOT done (spec forbids storage). Could add an export-all-state / share-link (URL-encoded) feature for portfolio sharing.
- **P2:** Add column-level filters & multi-select skills in Jobs Explorer.
- **P2:** Forecast — add confidence interval band; seasonality-aware model toggle.
- **P2:** Insights — make cards clickable to apply the relevant filter.
- **P2:** Inline field-level error styling on manual import form (currently inline text + toast).

## Deploy / GitHub
- Static SPA. Build: `npm run build` (output `dist`). Deploy via Emergent "Deploy" button; push via "Save to GitHub".
