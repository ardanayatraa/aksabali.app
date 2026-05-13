# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Aksara Bali Learning Platform — Next.js 16 (App Router) + React 19 + MySQL. Two main product surfaces: **solo stroke-writing practice** (canvas + stroke-order feedback) and **multiplayer quiz kelas** (mode `acak` etc.). Serves both web (host/landing/practice) and an Android client via a versioned mobile API. See [PRD.md](PRD.md) for product context; loose top-level `*.html` files (Dashboard, Lesson, Lobby, Podium, Question) are design prototypes, not part of the Next build.

## Common commands

- `npm run dev` — Next dev server.
- `npm run build` / `npm start` — production build & serve.
- `npm run lint` — ESLint (config: `eslint.config.mjs`, extends `next`).
- `npm run db:migrate` — applies `database/schema.sql` against the configured MySQL DB. The migrate script auto-loads `.env.local` then `.env`; existing process env wins.
- `npm run db:import-sample-glyphs` — seeds the `aksara` table from `sample/`.
- `npm run prod:check` — lint + build + `npm audit --omit=dev`. Use before claiming a change is production-ready.

No test runner is configured. Don't invent test commands; verify changes by running the dev server and exercising the flow, or by hitting the relevant API route.

## Required environment

`lib/server/env.js` is the source of truth. Routes that touch the DB or auth will throw `ProductionConfigError` → HTTP 503 if these are missing:

- DB: either `DATABASE_URL`, or all of `DB_HOST`, `DB_USER`, `DB_NAME` (+ optional `DB_PASSWORD`, `DB_PORT`, `DB_POOL_LIMIT`).
- `JWT_SECRET` — must be set and not the literal `change-this-in-production`.
- Optional: `MIDTRANS_SERVER_KEY` + `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` for payments, `ADMIN_REGISTRATION_KEY` to allow admin registration after the first user, `NEXT_PUBLIC_APP_URL` / `APP_URL`.

`/api/health` reports config status via `productionStatus()`.

## Architecture

### Server layer (`lib/server/`)
All API routes funnel through this layer — do not import `mysql2` or hand-roll auth in route handlers.

- `db.js` — singleton `mysql2/promise` pool exposed via `query(sql, params)`. Plus `toJsonValue` for MySQL JSON columns.
- `env.js` — config readers and `ProductionConfigError` (mapped to 503 by `jsonError`).
- `auth.js` — JWT (HS256, 7-day) issued at login/register, stored in the `aksara_session` httpOnly cookie **and** accepted as `Authorization: Bearer <token>` (this is how the Android client authenticates). Role hierarchy in the `profiles.role` enum: `siswa` (student, default), `pengajar` (teacher), `admin`. Use the role guards — `requireCurrentUser`, `requireAdmin`, `requireTeacher`, `requireStudent`, `requireLearner` — rather than checking roles ad hoc. They throw errors with a `.status` field that `jsonError` translates to the right HTTP code.
- `http.js` — every API route should return `jsonOk(data)` / `jsonError(err)`. The envelope is `{ success, data | error }` and the mobile client depends on this shape (see [docs/android-api.md](docs/android-api.md)).
- `data.js`, `quiz.js`, `game.js`, `svg.js`, `access.js` — domain logic; reach for these before duplicating queries in route handlers.

### API surface (`app/api/`)
Two parallel surfaces share the same server-layer helpers:

- **Web/cookie-auth routes**: `auth/`, `dashboard/`, `content/`, `strokes/`, `admin/`, `payments/`.
- **Mobile/bearer-auth routes**: everything under `app/api/mobile/v1/` (`auth/`, `catalog/`, `dashboard/`, `game/`, `manifest/`, `payments/`, `quiz/`, `strokes/`). Treat this path as a versioned public contract — breaking changes need a `v2`.

`admin/aksara` and `admin/categories` are the CMS endpoints for the glyph catalog; payments integrate Midtrans (`payments/create`, `payments/midtrans-webhook`).

### Stroke recognition (`lib/`)
Client-side scoring lives in `strokeRecognition.js` + `svgPathSampler.js` + `geometry.js`. The pipeline: user draws on a canvas → sampled to a fixed `TARGET_POINT_COUNT` polyline → compared against the target glyph's SVG path (also sampled the same way) → produces a score that the client posts to `/api/strokes/attempts`. The SVG-path sampling uses the DOM (`document.createElementNS`), so this code is browser-only — don't try to run it server-side.

### Data model (`database/schema.sql`)
- `profiles` (+ separate `user_credentials` for bcrypt hashes — never put password fields on `profiles`).
- `categories` → `aksara` (the glyph catalog with `svg_url`, `target_stroke_count`, `is_premium`).
- `progress` (generic activity log) and `stroke_attempts` (practice/test/nyurat mode results).
- Quiz/game session tables for the multiplayer flow.

When changing the schema: edit `database/schema.sql` (it's idempotent — uses `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE` for enum tweaks) and re-run `npm run db:migrate`.

### Frontend routes (`app/`)
App-Router pages by audience:
- Public/learner: `page.jsx` (landing), `login/`, `register/`, `dashboard/`, `practice/[aksaraId]/`, `latihan/`, `quiz/`, `profile/`.
- Game flow: `game/lobby`, `game/host`, `game/live`, `game/podium`.
- Teacher: `guru/`. Admin CMS: `admin/`.

Tailwind v3 + shadcn-style components in `components/` (`components.json` configured). Path alias `@/*` → repo root (see `tsconfig.json`). Mixed JS/TS — `.jsx` pages are normal here; don't reflexively convert them to TS.
