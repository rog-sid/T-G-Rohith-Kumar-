# JobScope Analytics

A portfolio-grade, **100% client-side** job market analytics dashboard for tracking demand for **Data Analyst** and related roles in **Bengaluru, India**. It ships with **100 realistic synthetic job records** preloaded, so every chart works on first load — no backend, no database, no external API calls.

![Stack](https://img.shields.io/badge/React-18-149eca) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

- **Dashboard** — 5 animated KPI cards, jobs trend, top roles, top skills, salary by role, work-mode donut, experience pie.
- **Global filters** — Role, City, Skill, Work Mode, Experience, Date Range update every page instantly (Zustand).
- **Jobs Explorer** — searchable, sortable, paginated table (10/page) with a slide-in detail drawer and CSV export.
- **Import Data** — drag-&-drop CSV (with template + validation preview), raw JSON paste, and a manual entry form.
- **Insights** — 10 auto-generated, data-driven insight cards with sparklines + "Copy as Text" for LinkedIn/resume.
- **Forecast** — historical (solid) vs projected (dashed) line chart using a 3-week moving average, with confidence badge.
- **Skill Gap** — paste your skills, get a market match score, missing-skill highlights, a learning list, and tailored resume bullets.
- **About** — methodology, assumptions/limitations, import guide, and tech-stack credits.
- **Dark / light mode** (defaults to system preference, in-memory only), fully responsive, keyboard-accessible navigation, toast notifications.

## 🧱 Tech Stack

React 18 · Vite · TypeScript · Tailwind CSS v3 · shadcn/ui · Recharts · PapaParse · Zod · Zustand · date-fns · Lucide React.
**In-memory store only** (no database / localStorage / sessionStorage) and **no external API calls**.

## 🚀 Run locally

```bash
cd frontend
npm install      # or: yarn
npm run dev      # starts Vite on http://localhost:3000
```

Build for production:

```bash
npm run build    # type-checks then bundles to /dist
npm run preview  # serve the production build
```

## 📦 Importing your own data

1. Open **Import Data** → **Download CSV Template** to get the exact headers.
2. Required columns: `title, company, city, workMode, experience, salary, skills, postedDate, status`.
   - Skills inside a CSV cell are separated by `;` (e.g. `SQL;Excel;Power BI`).
   - `workMode`: `Remote | Hybrid | Onsite` · `experience`: `Entry | Associate | Mid | Senior` · `status`: `Active | Closed` · `postedDate`: `YYYY-MM-DD`.
3. Drag-drop the CSV (or paste a JSON array) → review the validation preview → **Confirm Import**.

> All imported data is held in memory. Refreshing the page resets to the original 100 seed records.

## 🌐 Deploy & GitHub

This project was built on **Emergent**.

- **Deploy:** use the **Deploy** button in the Emergent chat interface to publish and get a live link.
- **Push to GitHub:** use the **Save to GitHub** button in the Emergent chat input to push this repository.

> Note: It is a static single-page app — any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages) works. Build command `npm run build`, output directory `dist`.
