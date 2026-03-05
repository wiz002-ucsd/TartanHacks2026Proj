# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sunzi** — AI-powered academic assistant (TartanHacks 2026). Students upload syllabi, Sunzi extracts structured data via GPT-4, tracks mastery, generates quizzes, and provides deadline-aware study recommendations.

The repo is a **monorepo** with two independently deployable apps:
- `frontend/` — Vite + React + TypeScript (deployed on Vercel)
- `backend/` — Node.js + Express + TypeScript (deployed on Railway)

---

## Commands

### Frontend (`cd frontend` first)
```bash
npm run dev        # Dev server → http://localhost:5173
npm run build      # Type-check + Vite build → dist/
npm run preview    # Preview production build
npm run type-check # Run tsc without emitting
```

### Backend (`cd backend` first)
```bash
npm run dev        # tsx watch (hot reload) → http://localhost:3001
npm run build      # tsc compile → dist/
npm start          # Run compiled dist/server.js (production)
npm run type-check # Run tsc without emitting
```

### Health check (backend running)
```bash
curl http://localhost:3001/health

curl -X POST http://localhost:3001/api/upload-syllabus \
  -H "Content-Type: application/json" \
  -d '{"syllabusText": "Course: CS101\nGrading: Homework 40%, Tests 60%"}'
```

---

## Environment Variables

**Backend** (`backend/.env`):
```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
FRONTEND_URL=         # Production Vercel URL (restricts CORS). Omit for local dev.
PORT=3001
```

**Frontend** (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:3001
```

---

## Architecture

### Data Flow
```
User uploads syllabus PDF/text
  → POST /api/upload-syllabus
  → backend/src/services/llm.ts   (GPT-4o, temp=0, JSON mode, Zod-validated)
  → backend/src/services/database.ts  (sequential inserts across 4 Supabase tables)
  → courseId returned to frontend
```

### Frontend Routing (react-router-dom v6)
```
/           → LandingPage (public; redirects to /home if authenticated)
/home       → Home (course list with next deadlines) — ProtectedRoute
/upload     → SyllabusUpload                         — ProtectedRoute
/courses/:id → CourseDetail                          — ProtectedRoute
/dashboard  → Dashboard (AI advisor panel)           — ProtectedRoute
*           → redirect to / or /home based on auth
```

Auth is **client-side only** (`localStorage['sunzi_auth']`). `AuthContext` provides `{ isAuthenticated, login, logout }`. `ProtectedRoute` wraps all app routes inside `AppLayout` (which renders the nav + `<Outlet />`).

### Backend API Routes
| Method | Path | Handler |
|--------|------|---------|
| POST | `/api/upload-syllabus` | `routes/syllabus.ts` — PDF/text → LLM → DB |
| GET | `/api/courses` | `routes/courses.ts` — all courses with next deadline |
| GET | `/api/courses/:id` | `routes/courses.ts` — single course full data |
| GET | `/api/ai-advisor` | `routes/ai-advisor.ts` — spawns Python script in `dist/MCP/` |
| GET | `/health` | inline in `server.ts` |

The `/api/ai-advisor` endpoint uses `child_process.spawn` to run a Python script at `backend/dist/MCP/get_ai_advisor.py`. The MCP directory is a separate Python codebase with its own `requirements.txt` and Supabase/Dedalus integrations.

### Database Schema (Supabase/PostgreSQL)
Five tables, all with cascading deletes from `courses.id`:
- **`courses`** — name, code, term, units
- **`events`** — type (`homework|test|project|quiz`), name, release_date, due_date, weight
- **`grading_policies`** — homework, tests, project, quizzes percentages (1-to-1)
- **`course_policies`** — late_days_total, late_days_per_hw, genai_allowed, genai_notes (1-to-1)
- **`lectures`** — lecture_number, title, date, topics[], description

Schema source of truth: `database/schema.sql` (run in Supabase SQL editor to reset).

### LLM Extraction
- `backend/src/services/llm.ts` — GPT-4o with `temperature: 0`, `response_format: { type: 'json_object' }`
- Output validated by Zod schema in `backend/src/validators/syllabus.ts` before any DB writes
- `null` is always used for missing fields — never inferred

---

## Styling Conventions

**LandingPage** uses **Tailwind CSS** (via CDN in `frontend/index.html` with custom config). All other components use **inline styles** with the central theme object.

Import theme values with:
```ts
import { theme } from '../theme';
// theme.colors.primary = '#E67E22'  (Sunzi Orange)
// theme.colors.bg.elevated = '#1a1a1a'
// theme.shadows.glow  (orange glow shadow)
```

Do not mix Tailwind classes into existing non-landing components — they use inline styles. New landing page sections should use Tailwind.

---

## TypeScript Strictness

### Frontend (`frontend/tsconfig.json`)
Has `"noUnusedLocals": true` and `"noUnusedParameters": true` — **build will fail** on unused variables. Prefix intentionally unused parameters with `_`.

The JSX transform is `react-jsx`, so **never add `import React from 'react'`** — it will trigger an unused import error.

### Backend (`backend/tsconfig.json`)
Uses `"strict": true` but **no** `noUnusedLocals`/`noUnusedParameters` — unused vars are hints only and won't break the build.

---

## Deployment

| Service | Platform | Root dir | Build cmd | Start cmd |
|---------|----------|----------|-----------|-----------|
| Frontend | Vercel | `frontend` | `npm run build` | n/a (static) |
| Backend | Railway | `backend` | `npm install && npm run build` | `npm start` |

Config files: `frontend/vercel.json` (SPA rewrites), `backend/railway.toml`.

After deploying backend, set `VITE_API_BASE_URL` in Vercel env vars to the Railway URL, then redeploy frontend.
