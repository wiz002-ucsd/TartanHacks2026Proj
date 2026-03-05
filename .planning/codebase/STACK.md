# Technology Stack

**Analysis Date:** 2026-03-04

## Languages

**Primary:**
- TypeScript 5.3.3 - Used in both frontend and backend for type safety
- JavaScript (ES2020+) - Runtime for both client and server

**Secondary:**
- SQL - PostgreSQL via Supabase for database schema (`database/schema.sql`)
- CSS - Inline styles in React components, custom scrollbar.css

## Runtime

**Environment:**
- Node.js 18+ (required per `QUICK_START.md`)
- Browser (Chrome, Firefox, Safari, Edge compatible)

**Package Manager:**
- npm (version unspecified in config)
- Lockfile: `package-lock.json` present in frontend and backend directories

## Frameworks

**Core:**
- React 18.2.0 - Frontend UI framework (`frontend/src/`)
- Express 4.18.2 - Backend HTTP server (`backend/src/server.ts`)
- React Router DOM 7.13.0 - Client-side routing (`frontend/src/App.tsx`)

**Build/Dev:**
- Vite 5.0.8 - Frontend bundler and dev server (`frontend/vite.config.ts`)
  - @vitejs/plugin-react 4.2.1 - React support for Vite
- TypeScript 5.3.3 - Compilation to JavaScript
- tsx 4.7.0 - TypeScript executor for Node.js development

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.39.0 - PostgreSQL database client
  - Used in `backend/src/services/database.ts`
  - Supabase provides managed PostgreSQL and authentication

- openai 4.20.1 - OpenAI API SDK (GPT-4o model)
  - Used in `backend/src/services/llm.ts` for structured syllabus extraction
  - Requires OPENAI_API_KEY environment variable

- pdf-parse 1.1.1 - PDF text extraction
  - Used in `backend/src/services/pdf.ts`
  - Extracts text from PDF syllabi before LLM processing

- zod 3.22.4 - Schema validation
  - Used in `backend/src/validators/syllabus.ts`
  - Validates LLM output against strict schema before database storage

**Infrastructure:**
- cors 2.8.5 - Cross-Origin Resource Sharing middleware
  - Enables frontend (port 5173) to communicate with backend (port 3001)

- multer 1.4.5-lts.1 - File upload handling
  - Used in `backend/src/routes/syllabus.ts`
  - Accepts PDF and text files (10MB max)

- dotenv 16.3.1 - Environment variable loading
  - Loads .env files in both frontend and backend
  - Manages API keys and connection strings

- react-dom 18.2.0 - React rendering for browsers

**Development Only:**
- @types/react 18.2.45 - TypeScript definitions for React
- @types/react-dom 18.2.18 - TypeScript definitions for React DOM
- @types/express 4.17.21 - TypeScript definitions for Express
- @types/multer 1.4.11 - TypeScript definitions for multer
- @types/cors 2.8.17 - TypeScript definitions for cors
- @types/node 20.10.5 - TypeScript definitions for Node.js
- @types/pdf-parse 1.1.4 - TypeScript definitions for pdf-parse

## Configuration

**Environment:**
- Backend environment variables (in `backend/.env`):
  - PORT - Express server port (default: 3001)
  - OPENAI_API_KEY - OpenAI API key (starts with sk-proj-)
  - SUPABASE_URL - Supabase project URL (https://xxxxx.supabase.co)
  - SUPABASE_ANON_KEY - Supabase anonymous public key

- Frontend environment variables (in `frontend/.env`):
  - VITE_API_BASE_URL - Backend API base URL (defaults to http://localhost:3001)
  - Uses Vite's env variable prefix: VITE_*

**Build:**
- Frontend: `frontend/vite.config.ts` - Vite configuration for dev server (port 5173) and production build
- Backend: `backend/tsconfig.json` - TypeScript compilation target ES2020, CommonJS module format
- Frontend: `frontend/tsconfig.json` - TypeScript compilation target ES2020, ESNext modules (bundler mode)

## Platform Requirements

**Development:**
- Node.js 18+
- npm or yarn
- OpenAI API key (paid subscription required)
- Supabase account (free tier available)
- Modern web browser

**Production:**
- Node.js 18+ runtime for backend
- PostgreSQL 14+ database (provided by Supabase)
- HTTPS endpoint for frontend deployment
- Environment variables configured on server
- Max request body size: 10MB (for PDF uploads)

## Deployment Ports

- Frontend dev server: http://localhost:5173
- Backend dev server: http://localhost:3001
- Supabase API: https://xxxxx.supabase.co

---

*Stack analysis: 2026-03-04*
