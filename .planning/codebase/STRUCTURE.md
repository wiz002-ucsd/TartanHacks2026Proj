# Codebase Structure

**Analysis Date:** 2026-03-04

## Directory Layout

```
TartanHacks2026Proj/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── server.ts          # Express app entry point
│   │   ├── routes/            # Route handlers
│   │   │   ├── syllabus.ts    # POST /api/upload-syllabus
│   │   │   ├── courses.ts     # GET /api/courses, /api/courses/:id
│   │   │   └── ai-advisor.ts  # GET /api/ai-advisor
│   │   ├── services/          # Business logic
│   │   │   ├── pdf.ts         # PDF text extraction
│   │   │   ├── llm.ts         # OpenAI integration
│   │   │   └── database.ts    # Supabase queries
│   │   ├── types/             # TypeScript interfaces
│   │   │   └── syllabus.ts    # Data structures
│   │   └── validators/        # Zod validation schemas
│   │       └── syllabus.ts    # Schema definitions
│   ├── dist/                  # Compiled JavaScript (generated)
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript config
├── frontend/                  # React + Vite SPA
│   ├── src/
│   │   ├── main.tsx           # React app entry point
│   │   ├── App.tsx            # Route definitions
│   │   ├── components/        # React components
│   │   │   ├── AppLayout.tsx  # Navigation layout wrapper
│   │   │   ├── Home.tsx       # Course list page
│   │   │   ├── SyllabusUpload.tsx # Upload form
│   │   │   ├── CourseDetail.tsx   # Course details page
│   │   │   ├── Dashboard.tsx      # AI dashboard
│   │   │   ├── SyllabusSummary.tsx # Upload summary
│   │   │   ├── ProtectedRoute.tsx  # Auth guard
│   │   │   └── ConfirmDialog.tsx   # Reusable dialog
│   │   ├── contexts/          # React Context
│   │   │   └── AuthContext.tsx    # Authentication state
│   │   ├── types/             # TypeScript types
│   │   │   └── syllabus.ts    # API response types
│   │   ├── theme.ts           # Styling constants
│   │   ├── scrollbar.css      # Custom CSS
│   │   └── vite-env.d.ts      # Vite environment types
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite config
│   └── index.html             # HTML entry point
├── database/                  # Database schema (if exists)
├── .planning/                 # GSD planning documents
│   └── codebase/
├── package.json               # Root monorepo file
└── README.md                  # Project documentation
```

## Directory Purposes

**backend/**
- Purpose: Node.js/Express REST API server
- Contains: TypeScript source code, compiled JavaScript, dependencies
- Key files: `server.ts` (entry), `routes/` (endpoints), `services/` (logic)

**backend/src/**
- Purpose: TypeScript source for backend
- Contains: All backend application code before compilation
- Key files: All .ts files mentioned above

**backend/src/routes/**
- Purpose: Express route handlers for HTTP endpoints
- Contains: Three route modules handling syllabus upload, course queries, AI advisor calls
- Key files: `syllabus.ts`, `courses.ts`, `ai-advisor.ts`

**backend/src/services/**
- Purpose: Business logic isolation from HTTP concerns
- Contains: PDF extraction, LLM calls, database operations
- Key files: `pdf.ts`, `llm.ts`, `database.ts`

**backend/src/types/**
- Purpose: Shared TypeScript type definitions
- Contains: Course, Grading, Event, Policies, Lecture interfaces
- Key files: `syllabus.ts`

**backend/src/validators/**
- Purpose: Zod schemas for runtime validation of data
- Contains: Validation rules for all data structures
- Key files: `syllabus.ts`

**backend/dist/**
- Purpose: Compiled JavaScript output (generated at build time)
- Contains: JavaScript versions of all .ts files
- Key files: Same structure as src/

**frontend/**
- Purpose: React SPA frontend
- Contains: Source code, dependencies, configuration
- Key files: `main.tsx` (entry), `App.tsx` (router), `components/` (UI)

**frontend/src/**
- Purpose: React TypeScript source code
- Contains: All frontend application code
- Key files: Main entry, routing, components, contexts

**frontend/src/components/**
- Purpose: React functional components
- Contains: Pages and UI components
- Key files: `Home.tsx`, `SyllabusUpload.tsx`, `CourseDetail.tsx`, `Dashboard.tsx`, `AppLayout.tsx`

**frontend/src/contexts/**
- Purpose: React Context providers for global state
- Contains: Authentication state management
- Key files: `AuthContext.tsx`

**frontend/src/types/**
- Purpose: Frontend TypeScript type definitions
- Contains: API response types and data structures
- Key files: `syllabus.ts`

**database/**
- Purpose: Database schema and initialization
- Contains: Supabase schema definitions or migrations
- Key files: Varies by setup

## Key File Locations

**Entry Points:**

- `backend/src/server.ts`: Backend HTTP server startup
- `frontend/src/main.tsx`: React app bootstrap and provider setup
- `frontend/index.html`: HTML document root for browser

**Configuration:**

- `backend/package.json`: Backend dependencies, build scripts, main entry
- `frontend/package.json`: Frontend dependencies, dev/build scripts
- `backend/tsconfig.json`: TypeScript compilation settings for backend
- `frontend/vite.config.ts`: Vite bundler configuration

**Core Logic:**

- `backend/src/services/pdf.ts`: PDF text extraction from buffers
- `backend/src/services/llm.ts`: OpenAI GPT-4o integration and prompt engineering
- `backend/src/services/database.ts`: Supabase client initialization and query functions
- `backend/src/validators/syllabus.ts`: Zod validation schemas for all data types

**API Routes:**

- `backend/src/routes/syllabus.ts`: POST /api/upload-syllabus (file/text upload)
- `backend/src/routes/courses.ts`: GET /api/courses, GET /api/courses/:id, DELETE /api/courses/:id
- `backend/src/routes/ai-advisor.ts`: GET /api/ai-advisor (Python integration)

**Frontend Pages/Routes:**

- `frontend/src/components/Home.tsx`: Course list view (/)
- `frontend/src/components/SyllabusUpload.tsx`: Upload form (/upload)
- `frontend/src/components/CourseDetail.tsx`: Course details (/courses/:id)
- `frontend/src/components/Dashboard.tsx`: AI dashboard (/dashboard)
- `frontend/src/LandingPage.tsx`: Landing page (/) for unauthenticated users

**Styling:**

- `frontend/src/theme.ts`: Color constants and styling utilities
- `frontend/src/scrollbar.css`: Custom scrollbar styles
- Inline styles in components using React CSSProperties

## Naming Conventions

**Files:**

- PascalCase: React components (`Home.tsx`, `AppLayout.tsx`, `ProtectedRoute.tsx`)
- camelCase: Services, utilities, contexts (`database.ts`, `AuthContext.tsx`, `vite-env.d.ts`)
- UPPERCASE: Configuration files, constants (`tsconfig.json`, `package.json`)
- .ts extension: TypeScript files in backend, services, types, validators
- .tsx extension: React component files with JSX

**Directories:**

- lowercase: All directories use lowercase (`src/`, `routes/`, `components/`, `services/`, `types/`, `validators/`, `contexts/`)
- Plural: Grouping directories (`routes/`, `services/`, `components/`, `types/`, `validators/`, `contexts/`)

**Functions:**

- camelCase: All functions start lowercase (`extractTextFromPDF`, `extractSyllabusData`, `storeSyllabusData`, `getAllCoursesWithUpcomingDeadlines`)
- Verbs: Descriptive action-based names (`get`, `fetch`, `extract`, `store`, `delete`)

**Types/Interfaces:**

- PascalCase: All TypeScript types/interfaces (`SyllabusData`, `Course`, `Grading`, `Event`, `Policies`, `EventType`)
- Plural for collections: Arrays of items (`Events` vs `Event`)

**React Components:**

- PascalCase: Component names match filenames (`Home`, `SyllabusUpload`, `CourseDetail`, `AppLayout`)
- Hooks start with `use`: `useAuth`, `useNavigate`, `useLocation`, `useState`, `useEffect`

**Environment Variables:**

- UPPERCASE_SNAKE_CASE: Backend (`.env` file) - `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT`
- VITE_ prefix: Frontend environment variables - `VITE_API_BASE_URL`

## Where to Add New Code

**New Feature (e.g., new course attribute):**

- Backend type definition: Add field to `backend/src/types/syllabus.ts` interface
- Validation schema: Add field to Zod schema in `backend/src/validators/syllabus.ts`
- LLM prompt: Update system prompt in `backend/src/services/llm.ts`
- Database: Add table column via Supabase dashboard or migration
- Frontend type: Add field to corresponding interface in `frontend/src/types/syllabus.ts`
- Frontend display: Update component render in `frontend/src/components/CourseDetail.tsx` or relevant page

**New API Endpoint:**

- Create route file in `backend/src/routes/` (e.g., `newfeature.ts`)
- Import and register in `backend/src/server.ts`: `app.use('/api', newRouter);`
- Define request/response types in `backend/src/types/`
- Add any validation schemas in `backend/src/validators/`
- Call service functions from `backend/src/services/`
- Add frontend fetch call in appropriate component in `frontend/src/components/`
- Add response type to `frontend/src/types/syllabus.ts`

**New Component/Page:**

- Create new .tsx file in `frontend/src/components/` (e.g., `NewPage.tsx`)
- Import component in `frontend/src/App.tsx`
- Define new route in Routes section of App.tsx
- If route should be protected, wrap in `<ProtectedRoute>` component
- Add navigation button in `frontend/src/components/AppLayout.tsx` if needed

**Utility/Helper Functions:**

- Backend helpers: Create file in `backend/src/services/` or add to existing service module
- Frontend helpers: Create file in `frontend/src/` at root level (e.g., `utils.ts`) or within a subdirectory
- Shared constants: `frontend/src/theme.ts` for frontend styling constants
- Types: Always in respective `types/` directory

**Database Changes:**

- Login to Supabase dashboard and create/modify tables directly, OR
- Create migration file if using migrations (location: `database/` if migrations are tracked)
- Update type definitions in `backend/src/types/syllabus.ts` to match schema
- Update database service functions in `backend/src/services/database.ts` if querying new tables

**Styling:**

- Component-level: Use inline styles with React CSSProperties in component file
- Global styles: Add to `frontend/src/scrollbar.css` for CSS-only rules
- Color constants: Add to `frontend/src/theme.ts` and reference from components

## Special Directories

**backend/dist/:**
- Purpose: Compiled JavaScript output
- Generated: Yes, by TypeScript compiler (`npm run build` in backend)
- Committed: No, generated at build time
- Contents: JavaScript versions of all src/ .ts files with same structure

**frontend/node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes, by `npm install`
- Committed: No, listed in .gitignore
- Contents: All transitive dependencies of packages in package.json

**backend/node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes, by `npm install`
- Committed: No, listed in .gitignore
- Contents: All transitive dependencies of packages in package.json

**.git/:**
- Purpose: Git version control metadata
- Generated: Yes, by `git init`
- Committed: Yes, git database itself
- Contents: Commit history, branches, objects

**frontend/dist/ (after build):**
- Purpose: Built frontend assets (JS, CSS, HTML)
- Generated: Yes, by Vite build (`npm run build`)
- Committed: No, typically excluded in .gitignore
- Contents: Optimized SPA bundle ready for deployment

---

*Structure analysis: 2026-03-04*
