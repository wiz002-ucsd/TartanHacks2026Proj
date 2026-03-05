# Architecture

**Analysis Date:** 2026-03-04

## Pattern Overview

**Overall:** Full-stack client-server architecture with a Node.js/Express backend, React frontend, and Supabase database. The system implements a pipeline-based design for syllabus ingestion with three distinct stages: extraction, validation, and persistence.

**Key Characteristics:**
- Separation of concerns across frontend/backend with REST API integration
- LLM-powered structured data extraction with strict schema validation
- Transactional multi-table database writes for atomic operations
- Context-based authentication state management on frontend
- Component-driven UI architecture with inline styling

## Layers

**API/Express Backend:**
- Purpose: HTTP request handling, request validation, route orchestration, and response formatting
- Location: `backend/src/server.ts`
- Contains: Express middleware configuration, CORS setup, routing setup, error handling
- Depends on: Route handlers, services layer
- Used by: Frontend via HTTP requests

**Route Handlers:**
- Purpose: Define endpoint contracts, parameter validation, and response schemas
- Location: `backend/src/routes/`
- Contains: Three routers - syllabus.ts (upload), courses.ts (queries), ai-advisor.ts (analysis)
- Depends on: Service layer for business logic
- Used by: Express app middleware

**Service Layer:**
- Purpose: Core business logic encapsulation - PDF extraction, LLM calls, database operations
- Location: `backend/src/services/`
- Contains: Three services - pdf.ts (PDF text extraction), llm.ts (OpenAI integration), database.ts (Supabase operations)
- Depends on: External APIs (OpenAI, Supabase), validators
- Used by: Route handlers

**Validators:**
- Purpose: Zod-based schema validation for runtime data integrity checking
- Location: `backend/src/validators/syllabus.ts`
- Contains: Zod schemas for course, grading, events, policies, lectures
- Depends on: Zod library
- Used by: LLM service for validating AI-extracted output

**Types:**
- Purpose: TypeScript interfaces for type safety across backend
- Location: `backend/src/types/syllabus.ts`
- Contains: Course, Grading, Event, Policies, Lecture interfaces and database record types
- Depends on: None (pure type definitions)
- Used by: Routes, services, validators

**React Frontend:**
- Purpose: User interface for syllabus upload, course viewing, and dashboard navigation
- Location: `frontend/src/`
- Contains: App.tsx (routing), components/, contexts/, types/
- Depends on: React Router, React Context API, external API calls
- Used by: Browser via HTML entry point

**Components:**
- Purpose: Reusable UI elements and page-level containers
- Location: `frontend/src/components/`
- Contains: AppLayout.tsx, Home.tsx, SyllabusUpload.tsx, CourseDetail.tsx, Dashboard.tsx, SyllabusSummary.tsx, ProtectedRoute.tsx
- Depends on: React hooks, React Router, types
- Used by: App.tsx routing

**Context/Auth:**
- Purpose: Global authentication state management using React Context
- Location: `frontend/src/contexts/AuthContext.tsx`
- Contains: AuthProvider component, useAuth hook
- Depends on: React Context API, localStorage
- Used by: App.tsx, ProtectedRoute.tsx

**Frontend Types:**
- Purpose: TypeScript interfaces matching backend API contracts
- Location: `frontend/src/types/syllabus.ts`
- Contains: SyllabusData, UploadResponse, CoursesResponse, CourseWithDeadline
- Depends on: None (pure type definitions)
- Used by: Components, fetch handlers

**Database Layer:**
- Purpose: Persistent storage of course data, events, grading policies, lectures
- Location: Supabase (external service)
- Contains: courses, grading_policies, events, course_policies, lectures tables
- Depends on: Supabase SDK (@supabase/supabase-js)
- Used by: database.ts service

## Data Flow

**Syllabus Upload Pipeline:**

1. **Input**: User selects PDF file or pastes text in `SyllabusUpload.tsx`
2. **Upload Request**: `SyllabusUpload.tsx` makes POST to `/api/upload-syllabus` with FormData or JSON body
3. **File Processing**: `backend/src/routes/syllabus.ts` receives request
   - If PDF: calls `extractTextFromPDF()` from `pdf.ts`
   - If text: uses raw body text
4. **LLM Extraction**: `extractSyllabusData()` in `llm.ts` sends text to OpenAI GPT-4o with structured prompt
5. **Validation**: Zod schema in `validators/syllabus.ts` validates LLM JSON output
6. **Database Persistence**: `storeSyllabusData()` in `database.ts` performs transactional inserts across 5 tables
   - Insert course record
   - Insert grading policy
   - Insert events (multiple rows)
   - Insert lectures (multiple rows)
   - Insert course policies
7. **Response**: Route returns courseId, summary, and full extracted data
8. **Frontend Display**: `SyllabusSummary.tsx` renders extracted data, navigates to Home
9. **Refresh**: `Home.tsx` fetches updated course list via `/api/courses`

**Course Retrieval Flow:**

1. **Home Page Load**: `Home.tsx` calls `GET /api/courses`
2. **Courses Router**: `backend/src/routes/courses.ts` invokes `getAllCoursesWithUpcomingDeadlines()`
3. **Database Query**: For each course, queries events table for next upcoming deadline (due_date >= today)
4. **Response**: Returns array of courses with nextDeadline object
5. **Frontend Rendering**: `Home.tsx` renders course cards with deadline color-coding and formatting

**Course Detail Flow:**

1. **Card Click**: User clicks course card in `Home.tsx`, navigates to `/courses/:id`
2. **Detail Request**: `CourseDetail.tsx` calls `GET /api/courses/:id`
3. **Join Query**: `getCourseData()` joins courses table with grading_policies, events, lectures, course_policies
4. **Response**: Returns complete course object with all related data
5. **Frontend Display**: `CourseDetail.tsx` renders course details, grading breakdown, events, lectures

**State Management:**

- **Authentication**: Stored in React Context (`AuthContext.tsx`), persisted to localStorage under key `sunzi_auth`
- **Course State**: Fetched on demand from backend, cached in component state (Home.tsx, CourseDetail.tsx)
- **UI State**: Managed locally in components (loading flags, error messages, form inputs)
- **Global Styling**: Theme defined in `theme.ts`, inline styles applied throughout components

## Key Abstractions

**SyllabusData Structure:**

- Purpose: Represents normalized, extracted course information
- Examples: `backend/src/types/syllabus.ts`, `frontend/src/types/syllabus.ts`
- Pattern: Matches LLM output schema; decomposed into course (1), grading (1), events (n), policies (1), lectures (n)
- Ensures consistent shape across extraction → validation → persistence → display

**Service Functions as Module Boundaries:**

- Purpose: Clean contracts between concerns (PDF → LLM → DB)
- Examples: `extractTextFromPDF()`, `extractSyllabusData()`, `storeSyllabusData()`
- Pattern: Async functions with error handling, returning typed data
- Allows independent testing and replacement of components

**Route Handlers as Request/Response Contracts:**

- Purpose: Define API boundaries with explicit success/error response shapes
- Examples: Routes in `backend/src/routes/`
- Pattern: Standard HTTP status codes, success boolean flag, data/error fields
- Enables predictable frontend error handling

**React Context for Cross-Component State:**

- Purpose: Avoid prop drilling for authentication status
- Examples: `AuthContext.tsx`
- Pattern: createContext + Provider component + hook for consumption
- Enables ProtectedRoute and layout components to check auth without prop chains

## Entry Points

**Backend Entry Point:**

- Location: `backend/src/server.ts`
- Triggers: `npm run dev` (tsx watch) or `npm start` (node dist/server.js)
- Responsibilities:
  - Initialize Express app
  - Apply middleware (CORS, JSON parser)
  - Register route handlers
  - Start HTTP listener on PORT 3001
  - Provide health check endpoint

**Frontend Entry Point:**

- Location: `frontend/src/main.tsx`
- Triggers: Vite dev server via `npm run dev` or built SPA in `npm run build`
- Responsibilities:
  - Mount React app to DOM root element
  - Wrap app in BrowserRouter for client-side routing
  - Apply AuthProvider context
  - Bootstrap React component tree

**Frontend Routing Entry:**

- Location: `frontend/src/App.tsx`
- Triggers: After React bootstrap in main.tsx
- Responsibilities:
  - Define all routes and components
  - Check authentication status
  - Redirect to landing page if not authenticated
  - Render AppLayout for authenticated routes
  - Render 404 handler

## Error Handling

**Strategy:** Layered error handling with specific error types and fallback responses

**Patterns:**

- **Backend Route Level**: Try-catch wraps entire handler, specific error type detection (Multer filesize, Zod validation), appropriate HTTP status codes (400 bad request, 413 payload too large, 422 validation error, 500 server error)
- **Service Level**: Functions throw Error objects with descriptive messages, callers decide response format
- **Frontend Component Level**: Try-catch in async operations, state-based error display (error flag, message text)
- **LLM/External Failures**: Fallback to mock data (ai-advisor route), return specific error details to frontend for user messaging
- **Database Errors**: Wrapped in try-catch with message propagation, no direct DB error exposure to client

## Cross-Cutting Concerns

**Logging:** Console logging with emoji prefixes for visual scanning
- Extraction: "📄 Extracting text from PDF..."
- API calls: "🤖 Calling OpenAI..."
- Database: "💾 Storing data in Supabase..."
- Errors: "❌ Error processing syllabus:"
- Success: "✓ Successfully extracted and validated"

**Validation:**
- Frontend: Basic client-side validation in forms (file selection, text length)
- Backend: Strict Zod schema validation of LLM output before database persistence
- API Contract: TypeScript types enforce shape matching between frontend/backend

**Authentication:**
- Simple localStorage-based flag (sunzi_auth)
- Protected routes via ProtectedRoute component wrapper
- Auth context check in App.tsx for conditional rendering
- No backend authentication enforcement (frontend-only)

**API Configuration:**
- Frontend uses environment variable `VITE_API_BASE_URL` (defaults to http://localhost:3001)
- Allows flexible deployment without code changes
- Configured in `frontend/src/components/Home.tsx` and `SyllabusUpload.tsx`

---

*Architecture analysis: 2026-03-04*
