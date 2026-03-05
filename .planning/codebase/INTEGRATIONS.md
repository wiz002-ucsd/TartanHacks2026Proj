# External Integrations

**Analysis Date:** 2026-03-04

## APIs & External Services

**AI/LLM:**
- OpenAI GPT-4o - Extracts structured syllabus data from unstructured text
  - SDK/Client: `openai` package 4.20.1
  - Auth: `OPENAI_API_KEY` environment variable (sk-proj-...)
  - Endpoint: Used in `backend/src/services/llm.ts`
  - Model: gpt-4o with JSON response format
  - Input: Raw syllabus text (PDF or plain text)
  - Output: Structured JSON with course info, grading, events, lectures, policies
  - Temperature: 0 (deterministic responses)

## Data Storage

**Databases:**
- Supabase PostgreSQL (managed service)
  - Connection: `SUPABASE_URL` (project URL) + `SUPABASE_ANON_KEY` (public key) environment variables
  - Client: `@supabase/supabase-js` package 2.39.0
  - Location: Cloud-hosted PostgreSQL via Supabase
  - Initialization: `backend/src/services/database.ts`
  - Row Level Security: Enabled but currently allows all operations (development mode)

**Database Schema:**
Tables created via `database/schema.sql`:
- `courses` - Course metadata (name, code, term, units)
- `grading_policies` - Grading breakdown per course (homework, tests, project, quizzes percentages)
- `events` - Course events/assignments (type, name, dates, weights)
- `lectures` - Lecture schedule (number, title, date, topics, description)
- `course_policies` - Course policies (late days, genAI rules)

**File Storage:**
- Local filesystem only - PDFs stored temporarily in memory during processing
- No persistent file storage (files not retained after processing)
- Max file size: 10MB (enforced by multer in `backend/src/routes/syllabus.ts`)

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Custom implementation - localStorage-based mock authentication
  - Implementation: `frontend/src/contexts/AuthContext.tsx`
  - Method: localStorage key "sunzi_auth" set to true/false
  - User management: Not integrated with any external service
  - Current state: Development mode (not production-ready)

**Database Security:**
- Row Level Security (RLS) enabled on all Supabase tables but set to allow all operations
- Production deployment should implement proper authentication policies

## Monitoring & Observability

**Error Tracking:**
- None detected - no external error tracking service (Sentry, Rollbar, etc.)

**Logs:**
- Console.log() throughout application for development
  - Backend: Logs in `backend/src/server.ts`, `backend/src/services/`, and `backend/src/routes/`
  - Frontend: Error logging in components (Home.tsx, Dashboard.tsx, etc.)
  - No centralized logging service or log aggregation

## CI/CD & Deployment

**Hosting:**
- Not configured - Instructions in `QUICK_START.md` are for local development
- Recommended: Any Node.js-compatible platform (Vercel, Railway, Heroku, EC2, etc.)

**CI Pipeline:**
- None detected - No GitHub Actions, GitLab CI, or similar

## Environment Configuration

**Required env vars:**
- `OPENAI_API_KEY` - OpenAI API key (backend only)
- `SUPABASE_URL` - Supabase project URL (backend only)
- `SUPABASE_ANON_KEY` - Supabase public/anon key (backend only)
- `PORT` - Express server port (backend, optional, defaults to 3001)
- `VITE_API_BASE_URL` - Backend URL for frontend (frontend, optional, defaults to http://localhost:3001)

**Secrets location:**
- Backend: `.env` file in `backend/` directory (git-ignored)
- Frontend: `.env` file in `frontend/` directory (git-ignored)
- Supabase credentials stored in backend .env

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- OpenAI API calls (synchronous HTTP POST)
  - Endpoint: https://api.openai.com/v1/chat/completions
  - Authentication: Bearer token via OPENAI_API_KEY header
  - Payload: Syllabus text for extraction

## Data Flow

**Syllabus Upload Pipeline:**
1. Frontend (`frontend/src/components/SyllabusUpload.tsx`) - User uploads PDF or pastes text
2. HTTP POST to `backend/src/routes/syllabus.ts` (/api/upload-syllabus)
   - Multipart form-data (file) or JSON (syllabusText)
3. Backend PDF extraction (`backend/src/services/pdf.ts`) - Extracts text from PDF if needed
4. OpenAI LLM extraction (`backend/src/services/llm.ts`) - Calls GPT-4o API with system prompt
5. Zod validation (`backend/src/validators/syllabus.ts`) - Validates JSON response against schema
6. Supabase storage (`backend/src/services/database.ts`) - Inserts into 5 related tables
7. Frontend display (`frontend/src/components/SyllabusSummary.tsx`) - Shows results in UI

## Integration Points Summary

| Service | Purpose | Auth Method | Required |
|---------|---------|-------------|----------|
| Supabase PostgreSQL | Course data persistence | API key + URL | Yes |
| OpenAI GPT-4o | Structured extraction | API key | Yes |
| pdf-parse | PDF text extraction | Local package | Yes (for PDFs) |

---

*Integration audit: 2026-03-04*
